import {
  FOOD_GOODS, WINTER_RESERVE_PER_PERSON,
} from './food_readability.js?v=v004.54.0-cause-readable';
import { toDenari } from './config.js?v=v004.54.0-cause-readable';
import { GOODS_RECIPES } from './goods_detail.js?v=v004.54.0-cause-readable';

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
  pick: '漬', meal: '粉', salt: '塩', char: '炭', cloth: '布',
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
  ) + finite(model?.companyMarketStock?.[goods]);
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

// ── 原因可読パック（決定ログ20260813_supply_panel_diagnosis） ──
// 断定の一語は出さない（外れた瞬間に計器の信用が死ぬ）。返すのは
// (1)検証可能な作り手の人数調べ (2)原料待ちの上流連結 (3)厳格な3条件
// (自品目が律速・空き家なし・季節の谷でない)が全て成立する根にだけ出る
// 建築余地の合図。迷ったら合図を出さない。

export const PRODUCER_STATE_LABELS = Object.freeze({
  healthy: '順調', starving: '原料待ち', repair: '修繕待ち', far: '通いが遠い',
});

function requiredInputsFor(goods) {
  const recipeRow = GOODS_RECIPES[goods];
  if (!recipeRow) return { required: [], anyOf: [] };
  const makers = new Set(recipeRow.makers);
  // 自産の原料（漁師にとっての魚など）は買い付け対象でないため飢え判定から除く
  const selfMade = new Set();
  for (const [otherGoods, other] of Object.entries(GOODS_RECIPES)) {
    if (other.makers.some(maker => makers.has(maker))) selfMade.add(otherGoods);
  }
  return {
    required: (recipeRow.inputs ?? []).filter(input => !selfMade.has(input)),
    anyOf: (recipeRow.alternatives ?? [])
      .map(group => group.filter(input => !selfMade.has(input)))
      .filter(group => group.length > 0),
  };
}

export function jobInputNeeds(job) {
  const required = new Set();
  const anyOf = [];
  for (const [goods, recipeRow] of Object.entries(GOODS_RECIPES)) {
    if (!recipeRow.makers.includes(job)) continue;
    const inputs = requiredInputsFor(goods);
    for (const input of inputs.required) required.add(input);
    for (const group of inputs.anyOf) anyOf.push(group);
  }
  return { required: [...required], anyOf };
}

function inputShelfAmount(model, household, goods) {
  const building = model?.buildings?.find(row => row.id === household.buildingId);
  return (building?.shelves ?? [])
    .filter(row => row.section === 'input' && row.goods === goods)
    .reduce((total, row) => total + finite(row.amount), 0);
}

function producerState(model, household, inputs) {
  const starvingInputs = [];
  for (const goods of inputs.required) {
    if (inputShelfAmount(model, household, goods) < 0.5) starvingInputs.push(goods);
  }
  for (const group of inputs.anyOf) {
    const total = group.reduce((sum, goods) => sum + inputShelfAmount(model, household, goods), 0);
    if (total < 0.5 && group.length > 0) starvingInputs.push(group[0]);
  }
  if (starvingInputs.length > 0) return { state: 'starving', starvingInputs };
  const building = model?.buildings?.find(row => row.id === household.buildingId);
  if (building?.conditionStatus && building.conditionStatus !== 'good') {
    return { state: 'repair', starvingInputs: [] };
  }
  const efficiency = household.productivity?.resourceWork?.efficiency;
  if (Number.isFinite(efficiency) && efficiency < 0.5) return { state: 'far', starvingInputs: [] };
  return { state: 'healthy', starvingInputs: [] };
}

export function supplyDiagnosis(model, row) {
  const recipeRow = GOODS_RECIPES[row.goods];
  const makers = recipeRow?.makers ?? [];
  if (makers.length === 0 || row.status === 'no_demand') return null;
  const inputs = requiredInputsFor(row.goods);
  const producers = (model?.households ?? []).filter(household => makers.includes(household.job));
  const purchaseAttempts = (model?.households ?? []).filter(household => (
    finite(household.lastMarketVisit?.unmet?.[row.goods]) > 0.005
  ));
  const purchasing = {
    attempted: purchaseAttempts.length,
    cashBlocked: purchaseAttempts.filter(household => (
      household.lastMarketVisit?.blockers?.[row.goods] === 'no_money'
    )).length,
    priceBlocked: purchaseAttempts.filter(household => (
      household.lastMarketVisit?.blockers?.[row.goods] === 'too_expensive'
    )).length,
    stockBlocked: purchaseAttempts.filter(household => (
      household.lastMarketVisit?.blockers?.[row.goods] === 'no_stock'
    )).length,
    minimumAsk: Number.isFinite(model?.marketLowest?.[row.goods])
      ? toDenari(model.marketLowest[row.goods]) : null,
    maximumCeiling: null,
  };
  const priceCeilings = purchaseAttempts
    .filter(household => household.lastMarketVisit?.blockers?.[row.goods] === 'too_expensive')
    .map(household => household.lastMarketVisit?.ceilings?.[row.goods])
    .filter(Number.isFinite);
  if (priceCeilings.length > 0) purchasing.maximumCeiling = toDenari(Math.max(...priceCeilings));
  purchasing.priceMismatch = row.marketStock > 0.005
    && purchasing.priceBlocked > 0
    && purchasing.minimumAsk !== null
    && purchasing.maximumCeiling !== null;
  purchasing.solvent = Math.max(
    0,
    purchasing.attempted - purchasing.cashBlocked - purchasing.priceBlocked,
  );
  const states = { healthy: 0, starving: 0, repair: 0, far: 0 };
  const starvingCounts = {};
  let idealTotal = 0;
  let idealCount = 0;
  for (const household of producers) {
    const verdict = producerState(model, household, inputs);
    states[verdict.state] += 1;
    for (const goods of verdict.starvingInputs) {
      starvingCounts[goods] = (starvingCounts[goods] ?? 0) + 1;
    }
    const ideal = household.productivity?.idealByGoods?.[row.goods];
    if (Number.isFinite(ideal) && ideal > 1e-9) {
      idealTotal += ideal;
      idealCount += 1;
    }
  }
  const waitingInput = Object.entries(starvingCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ?? null;
  const vacancy = (model?.zones ?? [])
    .filter(zone => makers.includes(zone.job) && !zone.filled).length
    + (model?.buildings ?? []).filter(building => (
      makers.includes(building.type) && building.vacant
    )).length;
  let cue = null;
  if (row.shortage > 0.005) {
    if (vacancy > 0) {
      cue = { kind: 'vacancy', count: vacancy };
    } else if (producers.length === 0) {
      cue = { kind: 'build', job: makers[0], count: null };
    } else if (
      !row.food
      && states.starving === 0 && states.repair === 0 && states.far === 0
    ) {
      // 食料は季節の谷（冬の漁など）を現在能力から誤診しやすいため、作り手ゼロ以外は
      // 合図を出さず既存の冬予報に委ねる（保守則: 迷ったら出さない）
      const perProducer = idealCount > 0 ? idealTotal / idealCount : 0;
      if (perProducer > 1e-9 && perProducer * producers.length < row.demand - 0.005) {
        cue = {
          kind: 'build',
          job: makers[0],
          count: Math.max(1, Math.min(9, Math.ceil(row.shortage / perProducer))),
        };
      }
    }
  }
  return Object.freeze({
    goods: row.goods,
    makers: Object.freeze([...makers]),
    producers: producers.length,
    states: Object.freeze(states),
    waitingInput,
    vacancy,
    purchasing: Object.freeze(purchasing),
    cue: cue ? Object.freeze(cue) : null,
  });
}
