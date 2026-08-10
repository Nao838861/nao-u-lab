import {
  FOOD_GOODS, WINTER_RESERVE_PER_PERSON,
} from './food_readability.js?v=v004.45.4-caravan-audit';
import { toDenari } from './config.js?v=v004.45.4-caravan-audit';

export const SUPPLY_STATUS = Object.freeze({
  no_demand: Object.freeze({ severity: 0, label: '需要なし' }),
  sufficient: Object.freeze({ severity: 1, label: '足りている' }),
  inventory: Object.freeze({ severity: 2, label: '在庫で補給中' }),
  undelivered: Object.freeze({ severity: 3, label: '届いていない' }),
  shortage: Object.freeze({ severity: 4, label: '不足' }),
});

export const GOODS_GLYPHS = Object.freeze({
  log: '木', ore: '鉱', coal: '石', bar: '銑', iron: '鉄', tools: '槌',
  stone: '岩', wheat: '麦', fish: '魚', veg: '菜', meat: '肉', pres: '燻',
  pick: '漬', meal: '粉', salt: '塩', char: '炭', cloth: '布', oil: '油',
});

const FOOD_WINDOW_DAYS = 90;
const GENERAL_TARGET_DAYS = 14;

function finite(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function manifestAmount(model, goods) {
  return finite(model?.goodsManifest?.find(row => row.goods === goods)?.totalAmount);
}

function marketAmount(model, goods) {
  const locations = model?.goodsManifest?.find(row => row.goods === goods)?.locations ?? [];
  return locations.reduce(
    (total, location) => total + (location.section === 'stall' ? finite(location.amount) : 0),
    0,
  );
}

export function stockWhereabouts(model, goods, limit = 3) {
  const locations = model?.goodsManifest?.find(row => row.goods === goods)?.locations ?? [];
  return [...locations]
    .sort((left, right) => finite(right.amount) - finite(left.amount))
    .slice(0, limit)
    .map(location => ({ label: location.sourceLabel, amount: finite(location.amount) }));
}

function priceTrend(goods, currentPrice, history) {
  const baseline = [...(history ?? [])].reverse().find(row => (
    row.day <= (history.at(-1)?.day ?? 0) - 7
    && Number.isFinite(row.prices?.[goods])
  )) ?? history?.[0] ?? null;
  const previous = baseline?.prices?.[goods];
  if (!Number.isFinite(previous) || !Number.isFinite(currentPrice) || previous <= 0) {
    return Object.freeze({ direction: 'steady', arrow: '→', delta: 0 });
  }
  const delta = (currentPrice - previous) / previous;
  const direction = delta >= 0.05 ? 'up' : delta <= -0.05 ? 'down' : 'steady';
  return Object.freeze({
    direction,
    arrow: direction === 'up' ? '↗' : direction === 'down' ? '↘' : '→',
    delta,
  });
}

function classify({ demand, shortage, supply, consumed, stock, marketStock }) {
  if (demand <= 0.005) return 'no_demand';
  if (shortage > 0.005) {
    if (stock - marketStock >= shortage && marketStock < shortage) return 'undelivered';
    return 'shortage';
  }
  if (supply + 0.005 < consumed) return 'inventory';
  return 'sufficient';
}

export function supplyDemandRow(model, goods, history = []) {
  const flow = model?.flowEma?.[goods] ?? {};
  const demandFlow = model?.demandEma?.[goods] ?? {};
  const produced = finite(flow.prod);
  const imported = finite(flow.imp);
  const consumed = finite(flow.cons);
  const exported = finite(flow.exp);
  const netPerDay = produced + imported - consumed - exported;
  const food = FOOD_GOODS.includes(goods);
  const stock = manifestAmount(model, goods);
  const marketStock = marketAmount(model, goods);
  const totalFoodConsumption = food ? FOOD_GOODS.reduce(
    (total, foodGoods) => total + finite(model?.flowEma?.[foodGoods]?.cons), 0,
  ) : 0;
  const foodShare = food
    ? (totalFoodConsumption > 0.005 ? consumed / totalFoodConsumption : 1 / FOOD_GOODS.length)
    : 0;
  // 冬備蓄は全食料の合計目標である。各品目へ全量を重複計上せず、
  // 直近の食事構成比（未観測時は均等）で配分する。
  const requiredStock = food
    ? finite(model?.population) * WINTER_RESERVE_PER_PERSON * foodShare
    : 0;
  const trackedDemand = finite(demandFlow.demand);
  const trackedConsumed = Math.min(trackedDemand, finite(demandFlow.consumed));
  const untrackedConsumed = Math.max(0, consumed - trackedConsumed);
  const order = model?.activeOrder?.g === goods ? model.activeOrder : null;
  const orderDays = order ? Math.max(1, finite(order.due) - finite(model?.day)) : 1;
  const orderDemand = order ? Math.max(exported, finite(order.left) / orderDays) : exported;
  const reserveShortage = food
    ? Math.max(0, requiredStock - stock) / FOOD_WINDOW_DAYS
    : 0;
  const demand = trackedDemand + untrackedConsumed + orderDemand + reserveShortage;
  const actualConsumed = consumed + exported;
  const shortage = Math.max(0, demand - actualConsumed);
  const supply = produced + imported;
  const daysRemaining = demand > 0.005 ? stock / demand : Infinity;
  const status = classify({
    demand, shortage, supply, consumed: actualConsumed, stock, marketStock,
  });
  const sources = Object.entries(demandFlow.sources ?? {}).map(([source, values]) => ({
    source,
    demand: finite(values.demand),
    consumed: Math.min(finite(values.demand), finite(values.consumed)),
    shortage: Math.max(0, finite(values.demand) - finite(values.consumed)),
  }));
  if (untrackedConsumed > 0.005) {
    sources.push({ source: 'other', demand: untrackedConsumed, consumed: untrackedConsumed, shortage: 0 });
  }
  if (orderDemand > 0.005) {
    sources.push({
      source: 'order', demand: orderDemand, consumed: Math.min(orderDemand, exported),
      shortage: Math.max(0, orderDemand - exported),
    });
  }
  if (reserveShortage > 0.005) {
    sources.push({ source: 'winter', demand: reserveShortage, consumed: 0, shortage: reserveShortage });
  }
  const rawPrice = model?.marketPrices?.[goods];
  const price = Number.isFinite(rawPrice) ? toDenari(rawPrice) : null;
  return Object.freeze({
    goods,
    food,
    stock,
    marketStock,
    undelivered: status === 'undelivered',
    produced,
    imported,
    consumed,
    exported,
    netPerDay,
    supply,
    demand,
    dailyNeed: demand,
    shortage,
    demandSources: Object.freeze(sources.sort((left, right) => right.demand - left.demand)),
    requiredStock,
    daysRemaining,
    status,
    severity: SUPPLY_STATUS[status].severity,
    statusLabel: SUPPLY_STATUS[status].label,
    price,
    priceTrend: priceTrend(goods, price, history),
  });
}

export function supplyDemandRows(model, history = [], goodsIds = []) {
  return Object.freeze(goodsIds.map(goods => supplyDemandRow(model, goods, history))
    .sort((left, right) => (
      right.severity - left.severity
      || right.shortage - left.shortage
      || left.daysRemaining - right.daysRemaining
      || left.goods.localeCompare(right.goods)
    )));
}

export function shortageRows(rows) {
  return Object.freeze((rows ?? []).filter(row => row.shortage > 0.005));
}
