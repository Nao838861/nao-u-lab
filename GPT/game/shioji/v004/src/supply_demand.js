import {
  FOOD_GOODS, WINTER_RESERVE_PER_PERSON,
} from './food_readability.js?v=v004.32.0-seasonal-plots';
import { toDenari } from './config.js?v=v004.32.0-seasonal-plots';

export const SUPPLY_STATUS = Object.freeze({
  sufficient: Object.freeze({ severity: 0, label: '足りてる' }),
  tight: Object.freeze({ severity: 1, label: 'ギリギリ' }),
  shortage: Object.freeze({ severity: 2, label: '不足' }),
});

export const GOODS_GLYPHS = Object.freeze({
  log: '木', ore: '鉱', coal: '石', bar: '銑', iron: '鉄', tools: '槌',
  stone: '岩', wheat: '麦', fish: '魚', veg: '菜', meat: '肉', pres: '燻',
  pick: '漬', meal: '粉', salt: '塩', char: '炭', cloth: '布', oil: '油',
});

const FOOD_WINDOW_DAYS = 90;
const GENERAL_TARGET_DAYS = 14;
const SHORTAGE_DAYS = 7;

function finite(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function manifestAmount(model, goods) {
  return finite(model?.goodsManifest?.find(row => row.goods === goods)?.totalAmount);
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

function classify({ dailyNeed, daysRemaining, netPerDay }) {
  if (dailyNeed <= 0.005) return 'sufficient';
  if (daysRemaining < SHORTAGE_DAYS || netPerDay < -dailyNeed * 0.5) return 'shortage';
  if (daysRemaining < GENERAL_TARGET_DAYS || netPerDay < -dailyNeed * 0.1) return 'tight';
  return 'sufficient';
}

export function supplyDemandRow(model, goods, history = []) {
  const flow = model?.flowEma?.[goods] ?? {};
  const produced = finite(flow.prod);
  const imported = finite(flow.imp);
  const consumed = finite(flow.cons);
  const exported = finite(flow.exp);
  const netPerDay = produced + imported - consumed - exported;
  const food = FOOD_GOODS.includes(goods);
  const observedDemand = consumed + exported;
  // 食料だけは直近の穏やかな消費に寄せず、3シード冬90日実測の安全側
  // 46荷/人を同じ90日窓へ割り戻す。HUDの冬越し予報と同じ根拠である。
  const dailyNeed = food
    ? Math.max(observedDemand, finite(model?.population) * WINTER_RESERVE_PER_PERSON / FOOD_WINDOW_DAYS)
    : observedDemand;
  const stock = manifestAmount(model, goods);
  const daysRemaining = dailyNeed > 0.005 ? stock / dailyNeed : Infinity;
  const status = classify({ dailyNeed, daysRemaining, netPerDay });
  const requiredStock = food
    ? finite(model?.population) * WINTER_RESERVE_PER_PERSON
    : dailyNeed * GENERAL_TARGET_DAYS;
  const rawPrice = model?.marketPrices?.[goods];
  const price = Number.isFinite(rawPrice) ? toDenari(rawPrice) : null;
  return Object.freeze({
    goods,
    food,
    stock,
    produced,
    imported,
    consumed,
    exported,
    netPerDay,
    dailyNeed,
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
      || left.daysRemaining - right.daysRemaining
      || left.goods.localeCompare(right.goods)
    )));
}

export function shortageRows(rows) {
  return Object.freeze((rows ?? []).filter(row => row.status === 'shortage'));
}
