import {
  E_STABLE_JOBS,
  E_STABLE_POPULATION_BAND,
  E_STABLE_YEARS,
} from './engine_bridge.js';

function tileKind(model, x, y) {
  return model.terrain[y]?.[x]?.kind ?? null;
}

function roadTouchesForest(model, key) {
  const [x, y] = key.split(',').map(Number);
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if ((dx !== 0 || dy !== 0) && tileKind(model, x + dx, y + dy) === 'forest') return true;
    }
  }
  return false;
}

function portRoadComponent(model) {
  const roads = new Set(model.roadKeys);
  const ports = model.buildings.filter(building => building.roles?.includes('port'));
  const queue = ports
    .map(building => building.entrance)
    .filter(Boolean)
    .filter(point => roads.has(`${point.x},${point.y}`));
  const connected = new Set();
  while (queue.length) {
    const point = queue.shift();
    const key = `${point.x},${point.y}`;
    if (connected.has(key)) continue;
    connected.add(key);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if ((!dx && !dy) || !roads.has(`${point.x + dx},${point.y + dy}`)) continue;
        queue.push({ x: point.x + dx, y: point.y + dy });
      }
    }
  }
  return connected;
}

function newHouseholdEvent(events) {
  return events.find(event => event.type === 'arrival' && event.reason === 'new_household');
}

function pantryAmount(household, goods) {
  return household.pantry?.find(row => row.goods === goods)?.amount ?? 0;
}

function loggerLogStock(model) {
  return model.households
    .filter(household => household.job === 'logger')
    .reduce((total, household) => total + pantryAmount(household, 'log'), 0);
}

function marketBuilding(model) {
  return model.buildings.find(building => building.roles?.includes('market')) ?? null;
}

function woodshopHouseholds(model) {
  return model.households.filter(household => household.job === 'woodshop');
}

function stallAmount(model, goods) {
  return model.stalls
    .filter(stall => stall.goods === goods)
    .reduce((total, stall) => total + (stall.qty ?? 0), 0);
}

function logTransaction(events) {
  return events.find(event => event.type === 'transaction' && event.goods === 'log') ?? null;
}

function firstOrderFacts(state) {
  return state?.letters?.find(letter => letter.id === 'first-order-offer')?.facts ?? null;
}

function orderHandlingEvent(events, state) {
  const facts = firstOrderFacts(state);
  return events.find(event => event.type === 'handling' && event.direction === 'export'
    && (!facts || event.goods === facts.goods)) ?? null;
}

function orderCompletedEvent(events) {
  return events.find(event => event.type === 'notice'
    && event.message?.includes('★注文を納めた')) ?? null;
}

function orderLedgerRevenue(model, goods) {
  return model.companyLedger
    .filter(row => row.reason === `本国注文へ${goods}を出荷`)
    .reduce((total, row) => total + row.amount, 0);
}

function foodImportOutflow(model) {
  const prefixes = new Set(FOOD_GOODS);
  return model.companyLedger.reduce((total, row) => {
    const goods = row.reason?.match(/^([^の]+)の本土仕入$/)?.[1];
    return goods && prefixes.has(goods) && row.amount < 0 ? total - row.amount : total;
  }, 0);
}

function portConnectedToMarket(model) {
  const port = model.buildings.find(building => building.roles?.includes('port'));
  if (!port) return false;
  const row = model.roadConnection?.buildings?.find(entry => entry.id === port.id);
  return Boolean(row?.connected);
}

const FOOD_GOODS = ['fish', 'veg', 'wheat', 'pres', 'pick', 'meat'];

const GOODS_LABELS = Object.freeze({
  tools: '道具', char: '木炭', salt: '塩', pres: '保存食', pick: '漬物',
  oil: '菜種油', cloth: '布', stone: '石材', log: '丸太', fish: '魚',
  veg: '野菜', wheat: '麦', meat: '肉', iron: '鉄',
});

function goodsLabel(goods) {
  return GOODS_LABELS[goods] ?? goods;
}

function warehouseBuilding(model) {
  return model.buildings.find(building => building.type === 'warehouse') ?? null;
}

function warehouseConnected(model) {
  const warehouse = warehouseBuilding(model);
  if (!warehouse) return false;
  const row = model.roadConnection?.buildings?.find(entry => entry.id === warehouse.id);
  return Boolean(row?.connected);
}

function marketFoodShelfAmount(model) {
  const market = marketBuilding(model);
  if (!market) return 0;
  return (market.shelves ?? [])
    .filter(row => FOOD_GOODS.includes(row.goods))
    .reduce((total, row) => total + (row.amount ?? 0), 0);
}

// 徒歩距離の見積り(§2.5.1近似: 道0.6/森1.4/他1.0/水∞・8方向・対角×1.4)。
// 獣道(0.85)はsnapshotに乗らないため考慮しない=距離をやや多めに見積る控えめな警告になる。
export function estimateWalkLen(model, from, to) {
  if (!from || !to) return Infinity;
  const blocked = new Set();
  for (const building of model.buildings) {
    for (let dy = 0; dy < (building.height ?? building.h ?? 0); dy += 1) {
      for (let dx = 0; dx < (building.width ?? building.w ?? 0); dx += 1) {
        blocked.add(`${building.x + dx},${building.y + dy}`);
      }
    }
  }
  const roads = new Set(model.roadKeys);
  const enterCost = (x, y) => {
    if (x < 0 || y < 0 || x >= model.width || y >= model.height) return Infinity;
    const kind = tileKind(model, x, y);
    if (kind === 'water') return Infinity;
    const key = `${x},${y}`;
    if (blocked.has(key) && !(x === to.x && y === to.y)) return Infinity;
    if (roads.has(key)) return 0.6;
    return kind === 'forest' ? 1.4 : 1.0;
  };
  const dist = new Map([[`${from.x},${from.y}`, 0]]);
  const queue = [{ x: from.x, y: from.y, cost: 0 }];
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift();
    if (current.x === to.x && current.y === to.y) return current.cost;
    if (current.cost > (dist.get(`${current.x},${current.y}`) ?? Infinity)) continue;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = current.x + dx;
        const ny = current.y + dy;
        const base = enterCost(nx, ny);
        if (!Number.isFinite(base)) continue;
        const step = dx && dy ? base * 1.4 : base;
        const next = current.cost + step;
        const key = `${nx},${ny}`;
        if (next >= (dist.get(key) ?? Infinity)) continue;
        dist.set(key, next);
        queue.push({ x: nx, y: ny, cost: next });
      }
    }
  }
  return Infinity;
}

export function islandFoodRunwayDays(model) {
  const pantryFood = model.households.reduce((total, household) => total
    + (household.pantry ?? []).filter(row => FOOD_GOODS.includes(row.goods))
      .reduce((sum, row) => sum + row.amount, 0), 0);
  const stallFood = model.stalls
    .filter(stall => FOOD_GOODS.includes(stall.goods))
    .reduce((total, stall) => total + (stall.qty ?? 0), 0);
  const total = pantryFood + stallFood + marketFoodShelfAmount(model);
  return total / Math.max(1, model.population);
}

function farHouseholdFromMarket(model) {
  const market = marketBuilding(model);
  if (!market?.entrance) return null;
  for (const household of model.households) {
    const home = model.buildings.find(building => building.id === household.buildingId);
    if (!home?.entrance) continue;
    const walk = estimateWalkLen(model, home.entrance, market.entrance);
    if (walk > 14) return { household, home, walk };
  }
  return null;
}

export const LOGGER_TRIP_WARNING_TICKS = 24;
export const LOGGER_TRIP_RECOVERY_TICKS = 4;
export const FOOD_IMPORT_EMA_TARGET = 0.6;
export const SEASONAL_SURPLUS_MIN = 8;
export const SEASONAL_VALLEY_RATIO = 0.2;
export const SEASONAL_RESERVE_TARGET = 16;
export const ORDER_JUDGMENT_FALLBACK_OFFERS = 3;
export const TOOLS_PRICE_RISE_RATIO = 0.05;
export const TOOLS_PRICE_RISE_DELTA = 0.05;
export const CONVERSION_SURVIVAL_DAYS = 90;
const LOGGER_MULTIPLIER_RECOVERY = 0.1;
const FOOD_PRODUCTION_EMA_MIN = 0.25;
const FOOD_PRICE_CHANGE_MIN = 0.01;
const FOOD_IMPORT_EMA_CHANGE_MIN = 0.05;
const SEASONAL_FOOD_GOODS = ['fish', 'veg', 'wheat'];
const CONVERSION_JOB_DEFINITIONS = Object.freeze([
  Object.freeze({ job: 'woodshop', label: '木工房', goods: 'tools', inputGoods: 'log' }),
  Object.freeze({ job: 'charburner', label: '炭焼', goods: 'char', inputGoods: 'log' }),
  Object.freeze({ job: 'saltworks', label: '製塩所', goods: 'salt', inputGoods: 'char' }),
]);

function marketGoodsAvailability(model, goods) {
  const stalls = model.stalls
    .filter(stall => stall.goods === goods)
    .reduce((total, stall) => total + (stall.qty ?? 0), 0);
  const market = marketBuilding(model);
  const inbound = (market?.shelves ?? [])
    .filter(shelf => shelf.section === 'inbound' && shelf.goods === goods)
    .reduce((total, shelf) => total + (shelf.amount ?? 0), 0);
  return stalls + inbound;
}

function seasonalFoodValley(model, state, goalId = 'observe-seasonal-food-valley', goodsRows = SEASONAL_FOOD_GOODS) {
  const previous = state?.goalResults?.[goalId]?.evidence?.observations ?? {};
  const observations = {};
  const valleys = [];
  for (const goods of goodsRows) {
    const available = marketGoodsAvailability(model, goods);
    const price = model.marketPrices?.[goods] ?? 0;
    const prior = previous[goods] ?? {
      peakAvailability: 0,
      peakDay: null,
      peakPrice: price,
      lowestPrice: price,
    };
    const newPeak = available > prior.peakAvailability;
    const row = {
      goods,
      day: model.day,
      available,
      price,
      peakAvailability: newPeak ? available : prior.peakAvailability,
      peakDay: newPeak ? model.day : prior.peakDay,
      peakPrice: newPeak ? price : prior.peakPrice,
      lowestPrice: Math.min(prior.lowestPrice, price),
    };
    observations[goods] = row;
    if (row.peakAvailability >= SEASONAL_SURPLUS_MIN
      && model.day > row.peakDay
      && row.available <= row.peakAvailability * SEASONAL_VALLEY_RATIO) {
      valleys.push({
        ...row,
        valleyRatio: row.available / row.peakAvailability,
        priceChangeFromPeak: row.price - row.peakPrice,
      });
    }
  }
  valleys.sort((left, right) => left.valleyRatio - right.valleyRatio
    || SEASONAL_FOOD_GOODS.indexOf(left.goods) - SEASONAL_FOOD_GOODS.indexOf(right.goods));
  return { observations, valley: valleys[0] ?? null };
}

function seasonalValleyFacts(state) {
  return state?.goalResults?.['observe-seasonal-food-valley']?.evidence?.valley ?? null;
}

function stockReleaseReport(events, expectedGoods = null) {
  const operation = events.find(event => event.type === 'operation'
    && event.ok && event.op?.type === 'release_stock'
    && (!expectedGoods || event.op.goods === expectedGoods));
  if (!operation) return null;
  const departure = events.find(event => event.type === 'departure'
    && event.carrier === 'cart' && event.goods === operation.op.goods);
  if (!departure) return null;
  return {
    goods: operation.op.goods,
    requestedQty: operation.op.qty,
    qty: departure.qty,
    haulJobId: departure.haulJobId,
  };
}

function orderKey(order) {
  return order ? `${order.g}:${order.qty}:${order.due}` : null;
}

function orderQuote(model) {
  const offer = model.orderOffer;
  if (!offer) return null;
  const observedLowest = model.marketLowest?.[offer.g];
  const marketLowest = Number.isFinite(observedLowest) ? observedLowest : null;
  const settlementPrice = offer.price * 1.25;
  const marginPerUnit = marketLowest === null ? null : settlementPrice - marketLowest;
  return {
    key: orderKey(offer),
    day: model.day,
    goods: offer.g,
    qty: offer.qty,
    due: offer.due,
    basePrice: offer.price,
    settlementPrice,
    marketLowest,
    marginPerUnit,
    quotedMargin: marginPerUnit === null ? null : marginPerUnit * offer.qty,
    profitable: marginPerUnit !== null && marginPerUnit > 1e-9,
  };
}

function profitableOrderFacts(state) {
  return state?.goalResults?.['assess-profitable-order']?.evidence?.quote ?? null;
}

function orderMatches(order, facts) {
  return Boolean(order && facts && order.g === facts.goods
    && order.qty === facts.qty && order.due === facts.due);
}

function profitableOrderEconomics(model, state, events) {
  const facts = profitableOrderFacts(state);
  const prior = state?.goalResults?.['complete-profitable-order']?.evidence ?? {};
  const completion = orderCompletedEvent(events);
  if (!facts || (!completion && !prior.completed)) return null;
  const ledger = model.companyLedger.slice(facts.ledgerLength ?? 0);
  const revenue = ledger
    .filter(row => row.reason === `本国注文へ${facts.goods}を出荷`)
    .reduce((total, row) => total + row.amount, 0);
  const purchases = ledger
    .filter(row => row.reason?.endsWith(`から蔵へ${facts.goods}を買上げ`) && row.amount < 0)
    .reduce((total, row) => total - row.amount, 0);
  const startingStockCost = facts.startingStockCost ?? 0;
  const endingStock = model.companyStock?.[facts.goods] ?? 0;
  const endingAverageCost = model.companyStockAverageCosts?.[facts.goods] ?? 0;
  const endingStockCost = endingStock * endingAverageCost;
  const orderCost = Math.max(0, startingStockCost + purchases - endingStockCost);
  return {
    completed: Boolean(completion) || Boolean(prior.completed),
    completionDay: completion?.eventDay ?? completion?.day ?? prior.completionDay ?? model.day,
    goods: facts.goods,
    qty: facts.qty,
    revenue,
    purchases,
    startingStockCost,
    endingStockCost,
    orderCost,
    realizedMargin: revenue - orderCost,
  };
}

function skippableOrderObservation(model, state) {
  const previous = state?.goalResults?.['observe-skippable-order']?.evidence ?? {};
  const seenOffers = [...(previous.seenOffers ?? [])];
  let selected = previous.selected ?? null;
  const quote = orderQuote(model);
  if (quote && !seenOffers.some(row => row.key === quote.key)) {
    seenOffers.push(quote);
    if (!selected) {
      if (quote.marketLowest === null) selected = { ...quote, reason: 'no_market' };
      else if (quote.marginPerUnit < -1e-9) selected = { ...quote, reason: 'loss' };
      else if (seenOffers.length >= ORDER_JUDGMENT_FALLBACK_OFFERS) {
        selected = { ...quote, reason: 'comparison_fallback' };
      }
    }
  }
  return { seenOffers, selected };
}

function offerExpiredEvent(events, expected = null) {
  return events.find(event => event.type === 'notice'
    && event.message?.includes('未受諾の注文状が失効')
    && (!expected || event.message.includes(
      `${goodsLabel(expected.goods)}${Math.round(expected.qty)}荷`,
    ))) ?? null;
}

function toolsPriceRiseObservation(model, state) {
  const previous = state?.goalResults?.['observe-tools-price-rise']?.evidence ?? {};
  const currentPrice = model.marketPrices?.tools ?? 0;
  const newMinimum = !Number.isFinite(previous.minimumPrice)
    || currentPrice < previous.minimumPrice;
  const minimumPrice = newMinimum ? currentPrice : previous.minimumPrice;
  const minimumDay = newMinimum ? model.day : previous.minimumDay;
  const delta = currentPrice - minimumPrice;
  const ratio = minimumPrice > 1e-9 ? currentPrice / minimumPrice - 1 : 0;
  return {
    startDay: previous.startDay ?? model.day,
    startPrice: previous.startPrice ?? currentPrice,
    minimumDay,
    minimumPrice,
    currentDay: model.day,
    currentPrice,
    delta,
    ratio,
    thresholdRatio: TOOLS_PRICE_RISE_RATIO,
    thresholdDelta: TOOLS_PRICE_RISE_DELTA,
    risen: ratio >= TOOLS_PRICE_RISE_RATIO && delta >= TOOLS_PRICE_RISE_DELTA,
  };
}

function conversionWorkshopStatus(model) {
  return CONVERSION_JOB_DEFINITIONS.map(definition => {
    const buildings = model.buildings.filter(building => building.type === definition.job);
    const occupied = buildings.find(building => building.occupied);
    const household = occupied
      ? model.households.find(row => row.buildingId === occupied.id && row.job === definition.job)
      : null;
    const economics = household
      ? model.conversionEconomics?.find(row => row.householdId === household.id)
      : null;
    return {
      ...definition,
      buildingCount: buildings.length,
      buildingId: occupied?.id ?? buildings[0]?.id ?? null,
      householdId: household?.id ?? null,
      occupied: Boolean(household),
      economics: economics ? { ...economics } : null,
    };
  });
}

function conversionCostChain(model) {
  const rows = conversionWorkshopStatus(model);
  const active = rows.every(row => row.occupied
    && Number.isFinite(row.economics?.cost)
    && row.economics.cost > 0
    && row.economics.productionEma > 0);
  return {
    active,
    rows,
    logPrice: model.marketPrices?.log ?? 0,
    charPrice: model.marketPrices?.char ?? 0,
  };
}

function conversionSurvival(model, state) {
  const previous = state?.goalResults?.['sustain-conversion-workshops']?.evidence ?? {};
  const rows = conversionWorkshopStatus(model);
  const active = rows.every(row => row.occupied);
  const signature = active
    ? rows.map(row => `${row.job}:${row.buildingId}`).join('|')
    : null;
  const continuous = active && previous.signature === signature;
  const startDay = active ? (continuous ? previous.startDay : model.day) : null;
  const elapsedDays = startDay === null ? 0 : model.day - startDay;
  return {
    active,
    signature,
    startDay,
    currentDay: model.day,
    elapsedDays,
    requiredDays: CONVERSION_SURVIVAL_DAYS,
    rows: rows.map(row => ({
      job: row.job,
      label: row.label,
      buildingId: row.buildingId,
      householdId: row.householdId,
      occupied: row.occupied,
    })),
  };
}

function householdLevelUpReport(model, events) {
  const event = events.find(candidate => candidate.type === 'notice'
    && /#\d+ ▲Lv\d+/.test(candidate.message ?? ''));
  if (!event) return null;
  const match = event.message.match(/^([^#]+)#(\d+) ▲Lv(\d+)$/);
  if (!match) return null;
  const householdId = Number(match[2]);
  const level = Number(match[3]);
  const household = model.households.find(row => row.id === householdId);
  const building = model.buildings.find(row => row.id === household?.buildingId);
  return {
    day: event.eventDay ?? event.day ?? model.day,
    message: event.message,
    job: match[1],
    householdId,
    previousLevel: Math.max(0, level - 1),
    level,
    buildingId: building?.id ?? household?.buildingId ?? null,
    buildingType: building?.type ?? household?.job ?? match[1],
    appearance: building?.appearance ? { ...building.appearance } : null,
  };
}

function noVacancyReport(model, events) {
  const event = events.find(candidate => candidate.type === 'notice'
    && candidate.message?.startsWith('転職不可:')
    && /空.*建物がありません/.test(candidate.message));
  if (!event) return null;
  const match = event.message.match(/^転職不可: ([^#]+)#(\d+)——(.+)$/);
  const targetJob = match?.[3]?.match(/^([^の]+)の空き建物がありません$/)?.[1] ?? null;
  const vacant = model.buildings.filter(building => building.vacant);
  return {
    day: event.eventDay ?? event.day ?? model.day,
    message: event.message,
    previousJob: match?.[1] ?? null,
    householdId: match ? Number(match[2]) : null,
    targetJob,
    vacantBuildingCount: vacant.length,
    targetVacancyCount: targetJob
      ? vacant.filter(building => building.type === targetJob).length
      : vacant.length,
  };
}

function tutorialGraduationFacts(model) {
  const jobCounts = Object.fromEntries([...new Set(model.households.map(row => row.job))]
    .sort()
    .map(job => [job, model.households.filter(row => row.job === job).length]));
  const stableJobCounts = Object.fromEntries(E_STABLE_JOBS.map(job => [
    job,
    model.households.filter(row => row.job === job).length,
  ]));
  const stableJobsPresent = Object.values(stableJobCounts).filter(count => count > 0).length;
  const food = foodFlowMetrics(model);
  const companyIncome = model.companyLedger
    .filter(row => row.amount > 0)
    .reduce((total, row) => total + row.amount, 0);
  const companyExpense = model.companyLedger
    .filter(row => row.amount < 0)
    .reduce((total, row) => total - row.amount, 0);
  const companyNet = companyIncome - companyExpense;
  const populationBand = [...E_STABLE_POPULATION_BAND];
  return {
    day: model.day,
    population: model.population,
    survivingJobCount: Object.keys(jobCounts).length,
    jobCounts,
    stableJobCounts,
    stableJobsPresent,
    stableJobsRequired: E_STABLE_JOBS.length,
    foodImportEma: food.importEma,
    foodProductionEma: food.productionEma,
    companyIncome,
    companyExpense,
    companyNet,
    companyMoney: model.companyMoney,
    companyBankruptcyDay: model.companyBankruptcyDay,
    reference: {
      years: E_STABLE_YEARS,
      populationBand,
      stableJobs: [...E_STABLE_JOBS],
      foodImportEmaMax: FOOD_IMPORT_EMA_TARGET,
      companyRequiresNoBankruptcy: true,
    },
    comparison: {
      populationInBand: model.population >= populationBand[0]
        && model.population <= populationBand[1],
      allStableJobsPresent: stableJobsPresent === E_STABLE_JOBS.length,
      foodImportWithinTarget: food.importEma < FOOD_IMPORT_EMA_TARGET,
      companySolvent: model.companyBankruptcyDay === null,
    },
  };
}

function loggerTripObservation(model) {
  const household = model.households.find(row => row.job === 'logger'
    && row.tookMarketTripToday && row.marketTripTicks > 0);
  if (!household) return null;
  return {
    householdId: household.id,
    tripTicks: household.marketTripTicks,
    multiplier: household.productionMultiplier,
  };
}

function loggerWarningFacts(state) {
  return state?.letters?.find(letter => letter.id === 'logger-trip-warning')?.facts ?? null;
}

function goalCompleted(state, id) {
  return Boolean(state?.completedGoals?.includes(id));
}

function starvationReport(events) {
  const deaths = events.filter(event => event.type === 'death');
  if (!deaths.length) return null;
  const narrated = deaths.find(event => event.message?.includes('餓えで亡くなった'))
    ?? deaths.find(event => event.message?.startsWith('☠'))
    ?? deaths[0];
  const peopleLost = deaths.reduce((total, event) => total + (event.count ?? 0), 0);
  return {
    events: deaths.length,
    peopleLost,
    message: narrated.message ?? null,
    householdId: narrated.householdId ?? null,
  };
}

function bankruptcyReport(events) {
  const event = events.find(candidate => candidate.type === 'notice'
    && (candidate.message?.includes('★破産') || candidate.message?.includes('最終通告')));
  if (!event) return null;
  const values = event.message?.match(/債務([\d.]+)>限度([\d.]+)/);
  return {
    message: event.message,
    debt: values ? Number(values[1]) : null,
    limit: values ? Number(values[2]) : null,
  };
}

function foodFlowMetrics(model) {
  return {
    importEma: FOOD_GOODS.reduce((total, goods) => (
      total + (model.flowEma?.[goods]?.imp ?? 0)
    ), 0),
    productionEma: FOOD_GOODS.reduce((total, goods) => (
      total + (model.flowEma?.[goods]?.prod ?? 0)
    ), 0),
    fishPrice: model.marketPrices?.fish ?? 0,
    vegPrice: model.marketPrices?.veg ?? 0,
    outflow: foodImportOutflow(model),
  };
}

function foodDependenceFacts(state) {
  return state?.letters?.find(letter => letter.id === 'food-dependence-report')?.facts ?? null;
}

function foodBuildingStatus(model) {
  const market = marketBuilding(model);
  const fisher = model.buildings.find(building => ['fisher', 'fisher2'].includes(building.type));
  const veg = model.buildings.find(building => building.type === 'veg');
  const fisherWalk = market && fisher ? estimateWalkLen(model, fisher.entrance, market.entrance) : Infinity;
  const vegWalk = market && veg ? estimateWalkLen(model, veg.entrance, market.entrance) : Infinity;
  return {
    fisher: Boolean(fisher),
    veg: Boolean(veg),
    fisherWalk,
    vegWalk,
    near: fisherWalk <= 14 && vegWalk <= 14,
  };
}

function islandFoodChange(model, state) {
  const before = foodDependenceFacts(state);
  if (!before) return null;
  const current = foodFlowMetrics(model);
  const priceChanged = Math.abs(current.fishPrice - before.fishPrice) >= FOOD_PRICE_CHANGE_MIN
    || Math.abs(current.vegPrice - before.vegPrice) >= FOOD_PRICE_CHANGE_MIN;
  const importChanged = Math.abs(current.importEma - before.importEma) >= FOOD_IMPORT_EMA_CHANGE_MIN;
  return current.productionEma >= FOOD_PRODUCTION_EMA_MIN && priceChanged && importChanged
    ? { before, current, priceChanged, importChanged }
    : null;
}

function loggerTripRecovered(model, state) {
  const current = loggerTripObservation(model);
  const before = loggerWarningFacts(state);
  if (!current || !before) return null;
  const ticksRecovered = before.tripTicks - current.tripTicks;
  const multiplierRecovered = current.multiplier - before.multiplier;
  return ticksRecovered >= LOGGER_TRIP_RECOVERY_TICKS
    && multiplierRecovered >= LOGGER_MULTIPLIER_RECOVERY
    ? { before, current, ticksRecovered, multiplierRecovered }
    : null;
}

export const TUTORIAL_GOALS = Object.freeze([
  Object.freeze({
    id: 'first-road-and-logger',
    chapter: '第一章・最初の一荷',
    title: '森の際へ道を敷き、木こりを置く',
    evaluate({ model }) {
      const portRoads = portRoadComponent(model);
      const forestRoads = [...portRoads].filter(key => roadTouchesForest(model, key)).length;
      const loggers = model.buildings.filter(building => building.type === 'logger').length;
      const done = Number(forestRoads > 0) + Number(loggers > 0);
      return {
        complete: done === 2,
        progress: { done, total: 2 },
        detail: `港から森の際へ届いた道 ${forestRoads}区画 / 木こり ${loggers}棟`,
        evidence: { connectedRoads: portRoads.size, forestRoads, loggers },
      };
    },
  }),
  Object.freeze({
    id: 'first-settlers-arrive',
    chapter: '第一章・最初の一荷',
    title: '最初の入植世帯を迎える',
    evaluate({ model }) {
      const households = model.households.filter(household => household.job === 'logger').length;
      return {
        complete: households > 0,
        progress: { done: Number(households > 0), total: 1 },
        detail: `木こりの入植世帯 ${households}世帯 / 島の人口 ${model.population}人`,
        evidence: { households, population: model.population },
      };
    },
  }),
  Object.freeze({
    id: 'market-for-logs',
    chapter: '第一章・最初の一荷',
    title: '市場を置き、丸太の売り場を開く',
    evaluate({ model }) {
      const market = marketBuilding(model);
      const logs = loggerLogStock(model);
      return {
        complete: Boolean(market),
        progress: { done: Number(Boolean(market)), total: 1 },
        detail: `市場 ${market ? 1 : 0}棟 / 木こりの手元の丸太 ${logs.toFixed(1)}荷`,
        evidence: { market: Boolean(market), logs },
      };
    },
  }),
  Object.freeze({
    id: 'connect-market-to-port',
    chapter: '第一章・最初の一荷',
    title: '港と市場を道で結ぶ',
    evaluate({ model }) {
      const connected = portConnectedToMarket(model);
      return {
        complete: connected,
        progress: { done: Number(connected), total: 1 },
        detail: connected ? '港と市場が道で結ばれました' : '港の入口は市場の道路成分の外です',
        evidence: { connected },
      };
    },
  }),
  Object.freeze({
    id: 'first-woodshop',
    chapter: '第一章・最初の一荷',
    title: '木工房を置き、道具づくりを始める',
    evaluate({ model }) {
      const woodshops = model.buildings.filter(building => building.type === 'woodshop').length;
      const settled = woodshopHouseholds(model).length;
      return {
        complete: woodshops > 0,
        progress: { done: Number(woodshops > 0), total: 1 },
        detail: `木工房 ${woodshops}棟 / 入居 ${settled}世帯`,
        evidence: { woodshops, settled },
      };
    },
  }),
  Object.freeze({
    id: 'accept-first-order',
    chapter: '第一章・最初の一荷',
    title: '本国の注文を受ける',
    evaluate({ model }) {
      const accepted = Boolean(model.activeOrder);
      const offer = model.orderOffer;
      const detail = accepted
        ? `受諾済み: ${goodsLabel(model.activeOrder.g)} ${model.activeOrder.qty}荷`
        : offer
          ? `注文状が届いています: ${goodsLabel(offer.g)} ${offer.qty}荷(${offer.due}日目まで)`
          : '道具づくりを続ければ、本国が島の品に目を留めます';
      return {
        complete: accepted,
        progress: { done: Number(accepted), total: 1 },
        detail,
        evidence: { accepted, offer: Boolean(offer) },
      };
    },
  }),
  Object.freeze({
    id: 'warehouse-for-order',
    chapter: '第一章・最初の一荷',
    title: '蔵を置き、道で結ぶ',
    evaluate({ model }) {
      const warehouse = warehouseBuilding(model);
      const connected = warehouseConnected(model);
      const done = Number(Boolean(warehouse)) + Number(connected);
      return {
        complete: Boolean(warehouse) && connected,
        progress: { done, total: 2 },
        detail: warehouse
          ? (connected ? '蔵が道で結ばれました' : '蔵はありますが道の外です')
          : '納品には会社の蔵が要ります',
        evidence: { warehouse: Boolean(warehouse), connected },
      };
    },
  }),
  Object.freeze({
    id: 'order-procurement-target',
    chapter: '第一章・最初の一荷',
    title: '買上げ目標を定め、調達を命じる',
    evaluate({ model }) {
      const order = model.activeOrder;
      const target = order ? (model.stockTargets?.[order.g] ?? 0) : 0;
      const done = Boolean(order) && target > 0;
      return {
        complete: done,
        progress: { done: Number(done), total: 1 },
        detail: order
          ? (done
            ? `${goodsLabel(order.g)}の買上げ目標 ${target}荷`
            : '受諾だけでは会社の銀は動きません。買上げ目標のご下命を')
          : '注文の受諾が先です',
        evidence: { target },
      };
    },
  }),
  Object.freeze({
    id: 'first-order-procurement',
    chapter: '第一章・最初の一荷',
    title: '最初の買付品が蔵へ届くのを見届ける',
    evaluate({ model }) {
      const order = model.activeOrder;
      const stocked = order ? (model.companyStock?.[order.g] ?? 0) : 0;
      return {
        complete: stocked > 0,
        progress: { done: Number(stocked > 0), total: 1 },
        detail: order
          ? `蔵の${goodsLabel(order.g)} ${stocked.toFixed(1)}荷 / 注文 ${order.qty}荷`
          : '注文の受諾が先です',
        evidence: { stocked, goods: order?.g ?? null },
      };
    },
  }),
  Object.freeze({
    id: 'complete-first-order',
    chapter: '第一章・最初の一荷',
    title: '注文の船積みと船出を見届ける',
    evaluate({ model, events }) {
      const completed = Boolean(orderCompletedEvent(events));
      const exportHandling = events.filter(event => (
        event.type === 'handling' && event.direction === 'export'
      ));
      return {
        complete: completed,
        progress: { done: Number(completed), total: 1 },
        detail: completed
          ? '最後の一荷を積み、本国注文を納めました'
          : `このtickの船積み ${exportHandling.reduce((sum, event) => sum + event.qty, 0).toFixed(1)}荷`,
        evidence: { completed, exportHandling: exportHandling.length, ledgerRows: model.companyLedger.length },
      };
    },
  }),
  Object.freeze({
    id: 'close-first-chapter',
    chapter: '第一章・最初の一荷',
    title: '第一章の報告書を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-one-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '輸出収入と食料仕入を並べた報告書が届きました' : '注文の完遂報告を待っています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'improve-logger-route',
    chapter: '橋・木こりの二日',
    title: '木こりの市場往復を道で短くする',
    evaluate({ model, state }) {
      const current = loggerTripObservation(model);
      const warning = loggerWarningFacts(state);
      const recovered = loggerTripRecovered(model, state);
      const alreadyGood = Boolean(current && !warning
        && current.tripTicks <= LOGGER_TRIP_WARNING_TICKS);
      const complete = Boolean(recovered) || alreadyGood;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: current
          ? `実往復 ${current.tripTicks.toFixed(1)}tick / 生産 ${(current.multiplier * 100).toFixed(1)}%`
          : '木こりが次に市場を往復する日を観測中です',
        evidence: {
          tripTicks: current?.tripTicks ?? null,
          multiplier: current?.multiplier ?? null,
          warned: Boolean(warning),
          recovered: Boolean(recovered),
          alreadyGood,
        },
      };
    },
  }),
  Object.freeze({
    id: 'place-island-food',
    chapter: '第二章・島の食卓',
    title: '漁家と菜園を市場近くの適地へ置く',
    evaluate({ model }) {
      const status = foodBuildingStatus(model);
      const done = Number(status.fisher) + Number(status.veg) + Number(status.near);
      return {
        complete: status.fisher && status.veg && status.near,
        progress: { done, total: 3 },
        detail: status.fisher && status.veg
          ? `市場まで 漁家${Number.isFinite(status.fisherWalk) ? status.fisherWalk.toFixed(1) : '—'} / 菜園${Number.isFinite(status.vegWalk) ? status.vegWalk.toFixed(1) : '—'}`
          : `漁家 ${Number(status.fisher)}棟 / 菜園 ${Number(status.veg)}棟（漁家は水際へ）`,
        evidence: status,
      };
    },
  }),
  Object.freeze({
    id: 'observe-island-food-change',
    chapter: '第二章・島の食卓',
    title: '島の食料が市場を変えるのを見届ける',
    evaluate({ model, state }) {
      const change = islandFoodChange(model, state);
      const metrics = foodFlowMetrics(model);
      return {
        complete: Boolean(change),
        progress: { done: Number(Boolean(change)), total: 1 },
        detail: `食料生産EMA ${metrics.productionEma.toFixed(2)} / 輸入EMA ${metrics.importEma.toFixed(2)}`,
        evidence: { ...metrics, changed: Boolean(change) },
      };
    },
  }),
  Object.freeze({
    id: 'reduce-food-imports',
    chapter: '第二章・島の食卓',
    title: '食料輸入EMAを0.60未満へ下げる',
    evaluate({ model }) {
      const metrics = foodFlowMetrics(model);
      const complete = metrics.productionEma >= FOOD_PRODUCTION_EMA_MIN
        && metrics.importEma < FOOD_IMPORT_EMA_TARGET;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: `食料輸入EMA ${metrics.importEma.toFixed(3)}（目標 < ${FOOD_IMPORT_EMA_TARGET.toFixed(2)}） / 島内生産 ${metrics.productionEma.toFixed(2)}`,
        evidence: metrics,
      };
    },
  }),
  Object.freeze({
    id: 'close-second-chapter',
    chapter: '第二章・島の食卓',
    title: '第二章の報告書を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-two-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '食料自給と本土流出の報告書が届きました' : '輸入EMAの低下を確認しています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'observe-seasonal-food-valley',
    chapter: '第三章・蔵の備え',
    title: '市場の余剰が薄くなる季節を見届ける',
    evaluate({ model, state }) {
      const observation = seasonalFoodValley(model, state);
      const valley = observation.valley;
      return {
        complete: Boolean(valley),
        progress: { done: Number(Boolean(valley)), total: 1 },
        detail: valley
          ? `${goodsLabel(valley.goods)} ${valley.peakAvailability.toFixed(1)}→${valley.available.toFixed(1)}荷 / 相場 ${(valley.price * 10).toFixed(1)}デナリ`
          : '魚・野菜・麦の余剰と相場を観測中です',
        evidence: observation,
      };
    },
  }),
  Object.freeze({
    id: 'set-seasonal-stock-target',
    chapter: '第三章・蔵の備え',
    title: '注文の買付を閉じ、食料の備えを定める',
    evaluate({ model, state }) {
      const valley = seasonalValleyFacts(state);
      const firstGoods = firstOrderFacts(state)?.goods ?? null;
      const target = valley ? (model.stockTargets?.[valley.goods] ?? 0) : 0;
      const staleTarget = firstGoods && firstGoods !== valley?.goods
        ? (model.stockTargets?.[firstGoods] ?? 0) : 0;
      const targetReady = target >= SEASONAL_RESERVE_TARGET;
      const oldTargetClosed = staleTarget <= 0;
      return {
        complete: Boolean(valley) && targetReady && oldTargetClosed,
        progress: { done: Number(oldTargetClosed) + Number(targetReady), total: 2 },
        detail: valley
          ? `${goodsLabel(firstGoods)}の旧目標 ${staleTarget} / ${goodsLabel(valley.goods)}の備え ${target}/${SEASONAL_RESERVE_TARGET}荷`
          : '市場の在庫谷を観測しています',
        evidence: {
          goods: valley?.goods ?? null,
          target,
          requiredTarget: SEASONAL_RESERVE_TARGET,
          firstOrderGoods: firstGoods,
          staleTarget,
        },
      };
    },
  }),
  Object.freeze({
    id: 'fill-seasonal-reserve',
    chapter: '第三章・蔵の備え',
    title: '余剰が会社の蔵へ届くのを見届ける',
    evaluate({ model, state }) {
      const valley = seasonalValleyFacts(state);
      const stock = valley ? (model.companyStock?.[valley.goods] ?? 0) : 0;
      return {
        complete: stock > 0,
        progress: { done: Number(stock > 0), total: 1 },
        detail: valley
          ? `蔵の${goodsLabel(valley.goods)} ${stock.toFixed(1)}荷 / 目標 ${model.stockTargets?.[valley.goods] ?? 0}荷`
          : '市場の在庫谷を観測しています',
        evidence: {
          goods: valley?.goods ?? null,
          stock,
          averageCost: valley ? (model.companyStockAverageCosts?.[valley.goods] ?? null) : null,
        },
      };
    },
  }),
  Object.freeze({
    id: 'release-seasonal-reserve',
    chapter: '第三章・蔵の備え',
    title: '次の在庫谷で蔵の備えを市場へ出す',
    evaluate({ model, events, state }) {
      const valley = seasonalValleyFacts(state);
      const observation = valley
        ? seasonalFoodValley(model, state, 'release-seasonal-reserve', [valley.goods])
        : { observations: {}, valley: null };
      const prior = state?.goalResults?.['release-seasonal-reserve']?.evidence ?? {};
      const release = stockReleaseReport(events, valley?.goods ?? null);
      const averageCost = model.companyStockAverageCosts?.[valley?.goods] ?? prior.averageCost ?? null;
      const stock = model.companyStock?.[valley?.goods] ?? 0;
      const ready = Boolean(observation.valley) && (stock > 0 || prior.stock > 0);
      const complete = Boolean(release) && (ready || prior.ready);
      const reportedReady = release ? (ready || prior.ready) : ready;
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: valley
          ? (ready
            ? `${goodsLabel(valley.goods)}が再び薄くなりました。蔵出しできます`
            : `${goodsLabel(valley.goods)} ${marketGoodsAvailability(model, valley.goods).toFixed(1)}荷 / 蔵 ${stock.toFixed(1)}荷`)
          : '市場の在庫谷を観測しています',
        evidence: {
          ...observation,
          goods: valley?.goods ?? null,
          stock,
          averageCost,
          ready: reportedReady,
          release,
        },
      };
    },
  }),
  Object.freeze({
    id: 'close-third-chapter',
    chapter: '第三章・蔵の備え',
    title: '第三章の蔵出し報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-three-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '仕入原価と蔵出し値の報告書が届きました' : '荷車が市場へ着くのを待っています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'assess-profitable-order',
    chapter: '第四章・本国の注文',
    title: '決済単価と市場最安値を比べる',
    evaluate({ model }) {
      const quote = orderQuote(model);
      const complete = Boolean(quote?.profitable);
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: quote
          ? `${goodsLabel(quote.goods)}: 決済 ${(quote.settlementPrice * 10).toFixed(1)} / 市場最安 ${quote.marketLowest === null ? '売り物なし' : (quote.marketLowest * 10).toFixed(1)}デナリ`
          : '次の注文状と、その時の市場最安値を待っています',
        evidence: {
          quote: quote ? {
            ...quote,
            ledgerLength: model.companyLedger.length,
            startingStock: model.companyStock?.[quote.goods] ?? 0,
            startingStockCost: (model.companyStock?.[quote.goods] ?? 0)
              * (model.companyStockAverageCosts?.[quote.goods] ?? 0),
          } : null,
        },
      };
    },
  }),
  Object.freeze({
    id: 'accept-profitable-order',
    chapter: '第四章・本国の注文',
    title: '黒字を見込める注文を受諾する',
    evaluate({ model, state }) {
      const facts = profitableOrderFacts(state);
      const accepted = orderMatches(model.activeOrder, facts);
      return {
        complete: accepted,
        progress: { done: Number(accepted), total: 1 },
        detail: accepted
          ? `${goodsLabel(facts.goods)} ${facts.qty}荷を受諾しました`
          : '会社の注文欄で、比較した注文を受諾してください',
        evidence: { accepted, orderKey: orderKey(model.activeOrder) },
      };
    },
  }),
  Object.freeze({
    id: 'target-profitable-order',
    chapter: '第四章・本国の注文',
    title: '買上げ目標を注文数まで定める',
    evaluate({ model, state }) {
      const facts = profitableOrderFacts(state);
      const target = facts ? (model.stockTargets?.[facts.goods] ?? 0) : 0;
      const complete = Boolean(facts && orderMatches(model.activeOrder, facts)
        && target >= facts.qty);
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: facts
          ? `${goodsLabel(facts.goods)}の買上げ目標 ${target}/${facts.qty}荷`
          : '注文の比較を待っています',
        evidence: { goods: facts?.goods ?? null, target, required: facts?.qty ?? 0 },
      };
    },
  }),
  Object.freeze({
    id: 'complete-profitable-order',
    chapter: '第四章・本国の注文',
    title: '注文を完遂し、実現した粗利を確かめる',
    evaluate({ model, events, state }) {
      const economics = profitableOrderEconomics(model, state, events);
      const complete = Boolean(economics?.completed && economics.revenue > 0
        && economics.realizedMargin > 1e-9);
      return {
        complete,
        progress: { done: Number(complete), total: 1 },
        detail: economics?.completed
          ? `実売上 ${economics.revenue.toFixed(1)} / 出荷原価 ${economics.orderCost.toFixed(1)} / 粗利 ${economics.realizedMargin.toFixed(1)}`
          : '市場→蔵→港→船の実物流で注文を納めています',
        evidence: economics ?? { completed: false },
      };
    },
  }),
  Object.freeze({
    id: 'observe-skippable-order',
    chapter: '第四章・本国の注文',
    title: '受けない注文を、数字から選ぶ',
    evaluate({ model, state }) {
      const observation = skippableOrderObservation(model, state);
      const { selected } = observation;
      return {
        complete: Boolean(selected),
        progress: {
          done: Math.min(observation.seenOffers.length, ORDER_JUDGMENT_FALLBACK_OFFERS),
          total: ORDER_JUDGMENT_FALLBACK_OFFERS,
        },
        detail: selected
          ? `${goodsLabel(selected.goods)}: ${selected.reason === 'loss' ? '採算割れ' : selected.reason === 'no_market' ? '市場在庫なし' : '比較確認の代替課題'}`
          : `注文を${observation.seenOffers.length}件比較しました。採算割れがなければ${ORDER_JUDGMENT_FALLBACK_OFFERS}件目を確認課題にします`,
        evidence: observation,
      };
    },
  }),
  Object.freeze({
    id: 'let-skippable-order-expire',
    chapter: '第四章・本国の注文',
    title: '注文を受諾せず、期限切れを見届ける',
    evaluate({ model, events, state }) {
      const selected = state?.goalResults?.['observe-skippable-order']?.evidence?.selected ?? null;
      const prior = state?.goalResults?.['let-skippable-order-expire']?.evidence ?? {};
      const candidateAccepted = Boolean(prior.candidateAccepted
        || orderMatches(model.activeOrder, selected));
      const exactExpiry = offerExpiredEvent(events, selected);
      const recoveryExpiry = candidateAccepted ? offerExpiredEvent(events) : null;
      const expired = exactExpiry ?? recoveryExpiry;
      return {
        complete: Boolean(expired),
        progress: { done: Number(Boolean(expired)), total: 1 },
        detail: expired
          ? `${expired.eventDay ?? expired.day}日目に未受諾の注文状が失効しました`
          : candidateAccepted
            ? '比較した注文は受諾済みです。決着後、次の注文を受けずに見送れます'
            : selected
              ? `${goodsLabel(selected.goods)} ${selected.qty}荷・期限${selected.due}日目まで受諾せずに待ちます`
              : '見送る注文を比較しています',
        evidence: {
          selected,
          candidateAccepted,
          expired: expired ? {
            day: expired.eventDay ?? expired.day,
            message: expired.message,
            exact: Boolean(exactExpiry),
          } : null,
        },
      };
    },
  }),
  Object.freeze({
    id: 'close-fourth-chapter',
    chapter: '第四章・本国の注文',
    title: '第四章の商い判断報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-four-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '利益を得た注文と、見送った注文の報告書が届きました' : '未受諾注文の失効報告を待っています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'observe-tools-price-rise',
    chapter: '第五章・島の手仕事',
    title: '道具相場の立ち上がりを見届ける',
    evaluate({ model, state }) {
      const observation = toolsPriceRiseObservation(model, state);
      return {
        complete: observation.risen,
        progress: {
          done: Math.min(observation.ratio, TOOLS_PRICE_RISE_RATIO),
          total: TOOLS_PRICE_RISE_RATIO,
        },
        detail: `道具 ${(observation.minimumPrice * 10).toFixed(1)}→${(observation.currentPrice * 10).toFixed(1)}デナリ/荷（底から${(observation.ratio * 100).toFixed(1)}%）`,
        evidence: observation,
      };
    },
  }),
  Object.freeze({
    id: 'place-conversion-workshops',
    chapter: '第五章・島の手仕事',
    title: '木工房・炭焼・製塩所を揃える',
    evaluate({ model }) {
      const rows = conversionWorkshopStatus(model);
      const done = rows.filter(row => row.buildingCount > 0).length;
      return {
        complete: done === rows.length,
        progress: { done, total: rows.length },
        detail: rows.map(row => `${row.label} ${row.buildingCount}棟`).join(' / '),
        evidence: { rows },
      };
    },
  }),
  Object.freeze({
    id: 'observe-conversion-cost-chain',
    chapter: '第五章・島の手仕事',
    title: '三つの手仕事へ原料が流れるのを待つ',
    evaluate({ model }) {
      const chain = conversionCostChain(model);
      const done = chain.rows.filter(row => row.occupied
        && Number.isFinite(row.economics?.cost)
        && row.economics.cost > 0
        && row.economics.productionEma > 0).length;
      return {
        complete: chain.active,
        progress: { done, total: chain.rows.length },
        detail: chain.rows.map(row => (
          `${row.label} ${row.occupied ? `生産EMA ${(row.economics?.productionEma ?? 0).toFixed(2)}` : '入植待ち'}`
        )).join(' / '),
        evidence: chain,
      };
    },
  }),
  Object.freeze({
    id: 'sustain-conversion-workshops',
    chapter: '第五章・島の手仕事',
    title: '三つの手仕事を90日存続させる',
    evaluate({ model, state }) {
      const survival = conversionSurvival(model, state);
      const complete = survival.active && survival.elapsedDays >= CONVERSION_SURVIVAL_DAYS;
      return {
        complete,
        progress: {
          done: Math.min(survival.elapsedDays, CONVERSION_SURVIVAL_DAYS),
          total: CONVERSION_SURVIVAL_DAYS,
        },
        detail: survival.active
          ? `連続 ${survival.elapsedDays}/${CONVERSION_SURVIVAL_DAYS}日`
          : '木工房・炭焼・製塩所の入植がすべて続くのを待っています',
        evidence: survival,
      };
    },
  }),
  Object.freeze({
    id: 'observe-household-level-up',
    chapter: '第五章・島の手仕事',
    title: '暮らしの等級が上がった建物を確かめる',
    evaluate({ state }) {
      const letter = state?.letters?.find(candidate => candidate.id === 'household-level-up');
      return {
        complete: Boolean(letter),
        progress: { done: Number(Boolean(letter)), total: 1 },
        detail: letter
          ? `${letter.facts.job}#${letter.facts.householdId}がLv${letter.facts.level}へ上がりました`
          : '文化財が暮らしへ届き、実際のLv上昇が起きるのを待っています',
        evidence: { levelUp: letter?.facts ?? null },
      };
    },
  }),
  Object.freeze({
    id: 'close-fifth-chapter',
    chapter: '第五章・島の手仕事',
    title: '第五章の手仕事と暮らしの報告を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'chapter-five-close'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued ? '90日の存続と暮らしの成長報告が届きました' : '第五章の報告をまとめています',
        evidence: { issued },
      };
    },
  }),
  Object.freeze({
    id: 'graduate-governor',
    chapter: '終章・総督の島',
    title: '卒業書状を受け取る',
    evaluate({ state }) {
      const issued = Boolean(state?.letters?.some(letter => letter.id === 'tutorial-graduation'));
      return {
        complete: issued,
        progress: { done: Number(issued), total: 1 },
        detail: issued
          ? '教程の目標を閉じ、同じ島で自由プレイが始まりました'
          : '第五章までの実測を卒業書状へまとめています',
        evidence: { issued },
      };
    },
  }),
]);

function pendingTutorialGoal(state) {
  const goal = TUTORIAL_GOALS.find(candidate => !goalCompleted(state, candidate.id));
  return goal ? { id: goal.id, chapter: goal.chapter, title: goal.title } : null;
}

export const TUTORIAL_LETTERS = Object.freeze([
  Object.freeze({
    id: 'tutorial-starvation-consequence',
    source: 'event',
    when({ events }) {
      return Boolean(starvationReport(events));
    },
    render({ model, events, state }) {
      const report = starvationReport(events);
      const currentGoal = pendingTutorialGoal(state);
      const runwayDays = islandFoodRunwayDays(model);
      return {
        kicker: '島況・飢餓報告',
        title: '食料を待つあいだにも、人は失われます',
        summary: `死亡・離散事象 ${report.events}件・人口 ${model.population}人・食料 ${runwayDays.toFixed(1)}日分`,
        facts: { ...report, population: model.population, runwayDays, currentGoal },
        body: [
          `${model.day}日目。観測された死亡・離散事象はこの報告で${report.events}件、人数が確定できる事象では${report.peopleLost}人です。現在人口は${model.population}人、島内で見える食料は人口1人あたり${runwayDays.toFixed(1)}日分です。${report.message ? `実記録は「${report.message}」。` : ''}`,
          `教程は食料を足さず、亡くなった人も戻しません。${currentGoal ? `未完了の目標「${currentGoal.title}」はそのままです。` : ''}市場と食料の流れを作るか、この帰結を抱えたまま別の道をお選びください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'tutorial-bankruptcy-consequence',
    source: 'event',
    when({ events }) {
      return Boolean(bankruptcyReport(events));
    },
    render({ model, events, state }) {
      const report = bankruptcyReport(events);
      const currentGoal = pendingTutorialGoal(state);
      const debtText = report.debt === null ? '—' : report.debt.toFixed(0);
      const limitText = report.limit === null ? '—' : report.limit.toFixed(0);
      return {
        kicker: '会社・最終通告',
        title: '帳簿は、教程の外でも閉じません',
        summary: `債務 ${debtText}・信用限度 ${limitText}・会社残高 ${model.companyMoney.toFixed(1)}`,
        facts: { ...report, companyMoney: model.companyMoney, currentGoal },
        body: [
          `${model.day}日目。会社の実記録は「${report.message}」。会社残高は${model.companyMoney.toFixed(1)}、記録された債務は${debtText}、信用限度は${limitText}です。`,
          `教程は支出を取り消さず、帳簿を巻き戻しません。${currentGoal ? `未完了の目標「${currentGoal.title}」も消えていません。` : ''}この島は同じ規則のまま続きます。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'arrival-report',
    source: 'snapshot',
    when({ model }) {
      return model.buildings.some(building => building.roles?.includes('port'));
    },
    render({ model }) {
      const ports = model.buildings.filter(building => building.roles?.includes('port')).length;
      return {
        kicker: '着任時の島況',
        title: '島の現況を報告します',
        summary: `港 ${ports}棟・人口 ${model.population}人・道路 ${model.roadKeys.length}区画`,
        body: [
          `${model.day}日目。盤上では港が${ports}棟稼働し、人口は${model.population}人、完成道路は${model.roadKeys.length}区画です。`,
          'まず森の際まで道を敷き、木こりの区画を指定してください。島の変化は、実際の建物と出来事に沿ってお知らせします。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-settlers-report',
    source: 'event',
    when({ model, events }) {
      const event = newHouseholdEvent(events);
      return Boolean(event && model.households.some(household => (
        household.id === event.householdId && household.job === 'logger'
      )));
    },
    render({ model, events }) {
      const event = newHouseholdEvent(events);
      const household = model.households.find(candidate => candidate.id === event.householdId);
      return {
        kicker: '入植船の着岸報告',
        title: '最初の世帯が島へ入りました',
        summary: `${event.day}日目・${household.members}人の世帯・島の人口 ${model.population}人`,
        body: [
          `${event.day}日目。入植船から${household.members}人の世帯が降り、木こりの区画へ入りました。島の人口は${model.population}人です。`,
          '人が来れば、仕事と暮らしが動き始めます。まずは丸太が積み上がる様子を見届けましょう。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'logs-pile-no-market',
    source: 'snapshot',
    when({ model }) {
      return !marketBuilding(model) && loggerLogStock(model) >= 10;
    },
    render({ model }) {
      const logs = loggerLogStock(model);
      return {
        kicker: '丸太の山からの催促',
        title: '売る場所がありません',
        summary: `木こりの手元に丸太 ${logs.toFixed(1)}荷・市場 0棟`,
        body: [
          `${model.day}日目。木こりの手元には丸太が${logs.toFixed(1)}荷積み上がりましたが、島にはまだ売り買いの場がありません。`,
          '市場の区画をお決めください。港の近くの平地が良いでしょう——のちに会社の荷車が市場と港を行き来します。入植者が持参した食料が尽きる前に、買い物のできる場を。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'market-distance-warning',
    source: 'snapshot',
    when({ model }) {
      return Boolean(farHouseholdFromMarket(model));
    },
    render({ model }) {
      const far = farHouseholdFromMarket(model);
      return {
        kicker: '道のりの懸念',
        title: '市場まで遠すぎる家があります',
        summary: `${far.household.job}の家から市場まで、道なりの見積りでおよそ${far.walk.toFixed(1)}`,
        body: [
          `市場まで、${far.household.job}の家から道なりの見積りでおよそ${far.walk.toFixed(1)}。14を超えると、一日のうちに市場まで歩いて戻ることができません。`,
          'この家の者は買い物に出られず、いずれ食べる物に困ります。道を敷いて近づけるか、建て直しをご検討ください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'market-needs-port-road',
    source: 'snapshot',
    when({ model }) {
      return Boolean(marketBuilding(model)) && !portConnectedToMarket(model);
    },
    render({ model }) {
      return {
        kicker: '空の輸入棚',
        title: '本土の食料が市場に届きません',
        summary: `${model.day}日目・市場は開きましたが港と道が結ばれていません`,
        body: [
          `${model.day}日目。市場は開きましたが、本土から届く食料は港のヤードに降りたまま——会社の荷車は道のない所を通れません。`,
          '港と市場を道でお結びください。結ばれるまで市場の輸入棚は空のままで、入植者たちは持参の食料を食べ尽くせば飢えます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-import-food',
    source: 'snapshot',
    when({ model }) {
      return marketFoodShelfAmount(model) > 0;
    },
    render({ model }) {
      const amount = marketFoodShelfAmount(model);
      return {
        kicker: '本土からの荷',
        title: '本土の食料が市場に並びました',
        summary: `${model.day}日目・市場の食料棚 ${amount.toFixed(1)}荷`,
        body: [
          `${model.day}日目。港に降りた本土の食料が荷車で運ばれ、市場の棚に${amount.toFixed(1)}荷並びました。これで入植者たちは銀さえあれば食べていけます。`,
          'ただし本土の食料は買うたびに島の銀が海を渡って出ていきます。いずれ、島の食卓は島で賄う日が要りましょう。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-log-stall',
    source: 'snapshot',
    when({ model }) {
      return stallAmount(model, 'log') > 0;
    },
    render({ model }) {
      const amount = stallAmount(model, 'log');
      return {
        kicker: '市の立った日',
        title: '市場に丸太が並びました',
        summary: `${model.day}日目・屋台の丸太 ${amount.toFixed(1)}荷`,
        body: [
          `${model.day}日目。木こりが市場まで歩き、屋台に丸太を${amount.toFixed(1)}荷並べました。`,
          '値付けは彼ら自身が行い、買い手がつけば商いになります。次は丸太の買い手——木工房の区画をお決めください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-tools',
    source: 'snapshot',
    when({ model }) {
      return woodshopHouseholds(model)
        .some(household => pantryAmount(household, 'tools') > 0);
    },
    render({ model, state }) {
      const household = woodshopHouseholds(model)
        .find(candidate => pantryAmount(candidate, 'tools') > 0);
      const tools = pantryAmount(household, 'tools');
      const tradedBefore = Boolean(state?.letters?.some(letter => letter.id === 'first-log-trade'));
      const provenance = tradedBefore
        ? '工房の棚の丸太——持参分と市場で買い足した分——から'
        : '入植のとき船で持参した丸太から';
      return {
        kicker: '工房の初仕事',
        title: '最初の道具が挽かれました',
        summary: `${model.day}日目・道具 ${tools.toFixed(1)}荷`,
        body: [
          `${model.day}日目。木工房が${provenance}、最初の道具を${tools.toFixed(1)}荷仕上げました。`,
          '棚の丸太が減れば、工房は市場で買い足します。物が育ち、銀が回り始めています。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'aid-suggestion',
    source: 'snapshot',
    when({ model }) {
      return model.population > 0 && model.day > 10
        && islandFoodRunwayDays(model) < 14
        && (model.mainlandAid?.requests ?? 0) === 0;
    },
    render({ model }) {
      const runway = islandFoodRunwayDays(model);
      const aid = model.mainlandAid ?? { nextQty: 240 };
      return {
        kicker: '秘書の進言',
        title: '食料の残りが心もとなくなっています',
        summary: `島の食料はおよそ${runway.toFixed(0)}日分`,
        body: [
          `${model.day}日目。島の食料を数えると、およそ${runway.toFixed(0)}日分です。まだ切れてはいませんが、船の往来には日数がかかります——少し早めにお知らせしています。`,
          `会社の帳場から本国へ食料支援を要請できます(次の支援は麦${aid.nextQty}荷)。ただし、要請を重ねるほど本国の心象を損ね、支援の量は減っていきます。実際に要請するかどうかは、総督のご判断です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-order-offer',
    source: 'snapshot',
    when({ model }) {
      return Boolean(model.orderOffer);
    },
    render({ model }) {
      const offer = model.orderOffer;
      const unit = (offer.price * 1.25 * 10).toFixed(1);
      return {
        kicker: '本国からの書状',
        title: `${goodsLabel(offer.g)}の注文が届きました`,
        summary: `${goodsLabel(offer.g)} ${offer.qty}荷・決済${unit}デナリ/荷・${offer.due}日目まで`,
        facts: { goods: offer.g, qty: offer.qty, price: offer.price, due: offer.due },
        body: [
          `${model.day}日目。本国が島の${goodsLabel(offer.g)}に目を留め、${offer.qty}荷の注文状が届きました。決済は1荷あたり${unit}デナリ、納期は${offer.due}日目です。`,
          '受けるかどうかは総督のご判断です。お受けになるなら、会社が市場で買い付け、船で本国へ納めます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'order-needs-warehouse',
    source: 'snapshot',
    when({ model }) {
      return Boolean(model.activeOrder) && !warehouseBuilding(model);
    },
    render({ model }) {
      const order = model.activeOrder;
      return {
        kicker: '受諾の続き',
        title: '納めるには蔵が要ります',
        summary: `${goodsLabel(order.g)} ${order.qty}荷の調達には会社の蔵が必要です`,
        body: [
          `${model.day}日目。${goodsLabel(order.g)}${order.qty}荷の注文をお受けになりました。会社の荷車は市場で買い付けた品を一度蔵へ納め、そこから港へ運びます。`,
          'いまの島には蔵がありません。市場と港を結ぶ道の沿いに、蔵の区画をお決めください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'warehouse-unconnected',
    source: 'snapshot',
    when({ model }) {
      return Boolean(warehouseBuilding(model)) && !warehouseConnected(model);
    },
    render({ model }) {
      return {
        kicker: '道の切れ目',
        title: '蔵まで道が繋がっていません',
        summary: `${model.day}日目・蔵の入口は道路の外です`,
        body: [
          `${model.day}日目。蔵は建ちましたが、入口が市場からの道と繋がっていません。会社の荷車は道のない所を通れず、買い付けた品を運び込めません。`,
          '蔵の入口まで道をお延ばしください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'order-needs-target',
    source: 'snapshot',
    when({ model }) {
      const order = model.activeOrder;
      return Boolean(order) && Boolean(warehouseBuilding(model)) && warehouseConnected(model)
        && (model.stockTargets?.[order.g] ?? 0) <= 0;
    },
    render({ model }) {
      const order = model.activeOrder;
      return {
        kicker: '会社の銀は総督のもの',
        title: '買付のご下命を',
        summary: `${goodsLabel(order.g)}の買上げ目標が0のままです`,
        body: [
          `${model.day}日目。蔵と道は整いましたが、会社の買付はまだ動いていません。注文の受諾だけでは会社の銀は動かず、いくらまで買い集めるかは総督のご下命によります。`,
          `会社の帳場で${goodsLabel(order.g)}の買上げ目標をお定めください。注文は${order.qty}荷、目標をその数に合わせるのが定石です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-company-procurement',
    source: 'snapshot',
    when({ model }) {
      const order = model.activeOrder;
      return Boolean(order) && (model.companyStock?.[order.g] ?? 0) > 0;
    },
    render({ model }) {
      const order = model.activeOrder;
      const stocked = model.companyStock[order.g];
      return {
        kicker: '調達はじまる',
        title: '会社の荷車が蔵へ運び始めました',
        summary: `${model.day}日目・蔵の${goodsLabel(order.g)} ${stocked.toFixed(1)}荷/${order.qty}荷`,
        body: [
          `${model.day}日目。会社が市場の屋台から${goodsLabel(order.g)}を買い付け、荷車が蔵へ${stocked.toFixed(1)}荷を納めました。注文の${order.qty}荷まで、買い付けは続きます。`,
          '作った者に銀が入り、島の品が本国へ向かう仕度が進んでいます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-order-handling',
    source: 'event',
    when({ events, state }) {
      return Boolean(orderHandlingEvent(events, state));
    },
    render({ model, events, state }) {
      const handling = orderHandlingEvent(events, state);
      const facts = firstOrderFacts(state);
      return {
        kicker: '港の荷役報告',
        title: '注文の品を一荷ずつ船へ',
        summary: `${handling.day}日目・${goodsLabel(handling.goods)} ${handling.qty.toFixed(1)}荷を船積み`,
        body: [
          `${handling.day}日目。蔵から港へ届いた${goodsLabel(handling.goods)}を、このtickは${handling.qty.toFixed(1)}荷だけ船へ移しました。荷役は一度に消えず、実際に一荷ずつ進みます。`,
          `注文は${facts?.qty ?? '—'}荷。最後の荷を積み終えるまで、港のヤードと船をご覧ください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-order-complete',
    source: 'event',
    when({ events }) {
      return Boolean(orderCompletedEvent(events));
    },
    render({ model, events, state }) {
      const completed = orderCompletedEvent(events);
      const facts = firstOrderFacts(state);
      const revenue = orderLedgerRevenue(model, facts.goods);
      const base = facts.qty * facts.price;
      const premium = revenue - base;
      return {
        kicker: '第一便の完遂報告',
        title: '注文の船が本国へ発ちました',
        summary: `${completed.eventDay ?? completed.day}日目・売上 ${revenue.toFixed(1)}・達成上乗せ ${premium.toFixed(1)}`,
        facts: { goods: facts.goods, qty: facts.qty, revenue, premium },
        body: [
          `${completed.eventDay ?? completed.day}日目。最後の一荷が船へ移り、${goodsLabel(facts.goods)}${facts.qty}荷の注文を納めました。会社の実台帳に、本国注文売上として${revenue.toFixed(1)}が記帳されています。`,
          `このうち通常単価分は${base.toFixed(1)}、完遂による上乗せは${premium.toFixed(1)}です。市場で作り手へ銀を払い、道と蔵と港を経て、島の品が初めて本国の売上になりました。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-one-close',
    source: 'event',
    when({ events }) {
      return Boolean(orderCompletedEvent(events));
    },
    render({ model, state }) {
      const completion = state?.letters?.find(letter => letter.id === 'first-order-complete');
      const revenue = completion?.facts?.revenue ?? 0;
      const foodOutflow = foodImportOutflow(model);
      const aidRequests = model.mainlandAid?.requests ?? 0;
      return {
        kicker: '第一章・収支報告',
        title: '最初の一荷、その向こう側',
        summary: `注文売上 ${revenue.toFixed(1)} / 食料の本土仕入 ${foodOutflow.toFixed(1)}`,
        facts: { revenue, foodOutflow, aidRequests },
        body: [
          `最初の注文で、会社の実台帳には売上${revenue.toFixed(1)}が入りました。同じ時点までに、本土から買った食料の仕入は累計${foodOutflow.toFixed(1)}です。`,
          `食料支援は${aidRequests}回要請しましたが、贈与なのでこの仕入額には含まれません。輸出で銀を得る道は通りました。次は、島の食卓を本土任せにせず、島の中で作る番です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'logger-trip-warning',
    source: 'snapshot',
    when({ model, state }) {
      const trip = loggerTripObservation(model);
      return goalCompleted(state, 'close-first-chapter')
        && Boolean(trip && trip.tripTicks > LOGGER_TRIP_WARNING_TICKS);
    },
    render({ model }) {
      const trip = loggerTripObservation(model);
      const lost = (1 - trip.multiplier) * 100;
      return {
        kicker: '橋・木こりの二日',
        title: '買い出しが伐採の一日を削っています',
        summary: `実往復 ${trip.tripTicks.toFixed(1)}tick・生産減 ${(lost).toFixed(1)}%`,
        facts: { ...trip, lost },
        body: [
          `${model.day}日目。木こりの市場往復は実測で${trip.tripTicks.toFixed(1)}tick。買い出しに一日を取られ、伐採の生産倍率は${(trip.multiplier * 100).toFixed(1)}%、つまり${lost.toFixed(1)}%減っています。`,
          '家の入口から市場まで、なるべく続けて道をお敷きください。次の買い出しの日に、同じ値をもう一度測ります。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'logger-road-recovered',
    source: 'snapshot',
    when({ model, state }) {
      return goalCompleted(state, 'close-first-chapter')
        && Boolean(loggerTripRecovered(model, state));
    },
    render({ model, state }) {
      const recovery = loggerTripRecovered(model, state);
      return {
        kicker: '道の効き目',
        title: '木こりの仕事時間が戻りました',
        summary: `${recovery.before.tripTicks.toFixed(1)}→${recovery.current.tripTicks.toFixed(1)}tick・生産${(recovery.current.multiplier * 100).toFixed(1)}%`,
        facts: recovery,
        body: [
          `${model.day}日目。新しい道の後、市場往復は${recovery.before.tripTicks.toFixed(1)}tickから${recovery.current.tripTicks.toFixed(1)}tickへ短くなりました。`,
          `伐採の生産倍率は${(recovery.before.multiplier * 100).toFixed(1)}%から${(recovery.current.multiplier * 100).toFixed(1)}%へ回復しています。距離は時間であり、道は働く時間を取り戻します。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'logger-road-already-good',
    source: 'snapshot',
    when({ model, state }) {
      const trip = loggerTripObservation(model);
      return goalCompleted(state, 'close-first-chapter')
        && Boolean(trip && !loggerWarningFacts(state)
        && trip.tripTicks <= LOGGER_TRIP_WARNING_TICKS);
    },
    render({ model }) {
      const trip = loggerTripObservation(model);
      return {
        kicker: '道の効き目',
        title: '森への道は、すでに働いています',
        summary: `実往復 ${trip.tripTicks.toFixed(1)}tick・生産 ${(trip.multiplier * 100).toFixed(1)}%`,
        facts: trip,
        body: [
          `${model.day}日目。木こりの市場往復は${trip.tripTicks.toFixed(1)}tick、生産倍率は${(trip.multiplier * 100).toFixed(1)}%でした。`,
          '最初に敷いた道が十分に短い経路を作っています。余計な敷き直しは要りません——道の効き目だけ、覚えておいてください。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'food-dependence-report',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'improve-logger-route');
    },
    render({ model }) {
      const facts = foodFlowMetrics(model);
      return {
        kicker: '第二章・島の食卓',
        title: '島の銀を、島の食卓へ',
        summary: `食料輸入EMA ${facts.importEma.toFixed(3)}・本土仕入累計 ${facts.outflow.toFixed(1)}`,
        facts,
        body: [
          `${model.day}日目。食料の輸入量EMAは${facts.importEma.toFixed(3)}、会社の実台帳に残る本土仕入は累計${facts.outflow.toFixed(1)}です。輸入の代金は、島の銀が本土へ出てゆく流れでもあります。`,
          '水際には漁家を、市場の近くの平地には菜園をお置きください。島の食料が市場に届けば、値と輸入の流れがどう変わるかを同じ帳面で追います。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'island-food-change',
    source: 'snapshot',
    when({ model, state }) {
      return goalCompleted(state, 'place-island-food')
        && Boolean(islandFoodChange(model, state));
    },
    render({ model, state }) {
      const change = islandFoodChange(model, state);
      return {
        kicker: '島内生産の報告',
        title: '魚と野菜が、市場の数字を動かしました',
        summary: `食料生産EMA ${change.current.productionEma.toFixed(2)}・輸入EMA ${change.before.importEma.toFixed(3)}→${change.current.importEma.toFixed(3)}`,
        facts: change,
        body: [
          `${model.day}日目。島内の食料生産EMAは${change.current.productionEma.toFixed(2)}へ立ち上がりました。魚の値は1荷あたり${(change.before.fishPrice * 10).toFixed(1)}から${(change.current.fishPrice * 10).toFixed(1)}デナリへ、野菜は${(change.before.vegPrice * 10).toFixed(1)}から${(change.current.vegPrice * 10).toFixed(1)}デナリへ動いています。`,
          `食料輸入EMAも${change.before.importEma.toFixed(3)}から${change.current.importEma.toFixed(3)}へ変わりました。まだ上下はしますが、島の食卓を島の手で満たす流れは、実際の価格と荷の動きに現れています。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'food-import-target-reached',
    source: 'snapshot',
    when({ model, state }) {
      const metrics = foodFlowMetrics(model);
      return goalCompleted(state, 'observe-island-food-change')
        && metrics.productionEma >= FOOD_PRODUCTION_EMA_MIN
        && metrics.importEma < FOOD_IMPORT_EMA_TARGET;
    },
    render({ model, state }) {
      const before = foodDependenceFacts(state);
      const current = foodFlowMetrics(model);
      return {
        kicker: '自給の節目',
        title: '本土から買う食料の流れが細りました',
        summary: `輸入EMA ${before.importEma.toFixed(3)}→${current.importEma.toFixed(3)}（目標 < ${FOOD_IMPORT_EMA_TARGET.toFixed(2)}）`,
        facts: { before, current, target: FOOD_IMPORT_EMA_TARGET },
        body: [
          `${model.day}日目。食料輸入EMAは${current.importEma.toFixed(3)}となり、実測から定めた節目${FOOD_IMPORT_EMA_TARGET.toFixed(2)}を下回りました。第二章の開始時は${before.importEma.toFixed(3)}でした。`,
          `島内の食料生産EMAは${current.productionEma.toFixed(2)}。本土仕入の累計は${current.outflow.toFixed(1)}ですが、いま流れ込む速さそのものは細っています。累計と現在の速さは、分けてご覧ください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-two-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'reduce-food-imports');
    },
    render({ model, state }) {
      const reached = state?.letters?.find(letter => letter.id === 'food-import-target-reached');
      const before = foodDependenceFacts(state);
      const current = foodFlowMetrics(model);
      return {
        kicker: '第二章・収支報告',
        title: '島の食卓は、島の営みになりました',
        summary: `食料生産EMA ${current.productionEma.toFixed(2)}・輸入EMA ${current.importEma.toFixed(3)}`,
        facts: { before, current, reached: Boolean(reached) },
        body: [
          `${model.day}日目。魚と野菜を作る営みが根付き、食料生産EMAは${current.productionEma.toFixed(2)}。食料輸入EMAは第二章開始時の${before.importEma.toFixed(3)}から${current.importEma.toFixed(3)}へ下がりました。`,
          `本土仕入の累計${current.outflow.toFixed(1)}は消えません——過去に出た銀の記録です。けれど、これから出てゆく速さは変えられました。ここから先も同じ島、同じ帳簿のまま、総督のお考えでお続けください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-food-valley-report',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-seasonal-food-valley');
    },
    render({ model, state }) {
      const facts = seasonalValleyFacts(state);
      const firstGoods = firstOrderFacts(state)?.goods ?? null;
      const staleTarget = firstGoods ? (model.stockTargets?.[firstGoods] ?? 0) : 0;
      return {
        kicker: '第三章・蔵の備え',
        title: '市場が空になる日があります',
        summary: `${goodsLabel(facts.goods)} ${facts.peakAvailability.toFixed(1)}→${facts.available.toFixed(1)}荷・相場 ${(facts.price * 10).toFixed(1)}デナリ`,
        facts: { ...facts, firstOrderGoods: firstGoods, staleTarget },
        body: [
          `${facts.peakDay}日目に市場で見えた${goodsLabel(facts.goods)}の余剰は${facts.peakAvailability.toFixed(1)}荷でしたが、${facts.day}日目には${facts.available.toFixed(1)}荷、ピークの${(facts.valleyRatio * 100).toFixed(1)}%まで薄くなりました。その日の相場EMAは1荷あたり${(facts.price * 10).toFixed(1)}デナリです。`,
          `${firstGoods ? `最初の注文で定めた${goodsLabel(firstGoods)}の買上げ目標は、いまも${staleTarget}荷のままです。役目を終えた命令は0へ戻し、` : ''}${goodsLabel(facts.goods)}の買上げ目標を${SEASONAL_RESERVE_TARGET}荷にしてください。目標は注文ではなく、余る季節の品を会社の蔵へ備えるためにも使えます。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-stock-target-set',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'set-seasonal-stock-target');
    },
    render({ model, state }) {
      const facts = seasonalValleyFacts(state);
      const target = model.stockTargets?.[facts.goods] ?? 0;
      return {
        kicker: '会社の買付命令',
        title: '余る季節の品を、蔵へ',
        summary: `${goodsLabel(facts.goods)}の買上げ目標 ${target}荷`,
        facts: { goods: facts.goods, target },
        body: [
          `${model.day}日目。${goodsLabel(facts.goods)}の買上げ目標を${target}荷と定めました。会社の荷車は価格と在庫のある時だけ市場で買い、実物を蔵へ運びます。`,
          '目標を書いただけでは品は増えません。作り手の余剰が市場に出て、会社が代金を払い、荷車が到着するまでを見届けましょう。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-reserve-filled',
    source: 'snapshot',
    when({ model, state }) {
      const facts = seasonalValleyFacts(state);
      return goalCompleted(state, 'set-seasonal-stock-target')
        && Boolean(facts && (model.companyStock?.[facts.goods] ?? 0) > 0);
    },
    render({ model, state }) {
      const facts = seasonalValleyFacts(state);
      const stock = model.companyStock[facts.goods];
      const averageCost = model.companyStockAverageCosts?.[facts.goods] ?? 0;
      return {
        kicker: '蔵の入庫報告',
        title: '備えが実物になりました',
        summary: `${goodsLabel(facts.goods)} ${stock.toFixed(1)}荷・平均仕入 ${(averageCost * 10).toFixed(1)}デナリ`,
        facts: { goods: facts.goods, stock, averageCost },
        body: [
          `${model.day}日目。会社の蔵に${goodsLabel(facts.goods)}が${stock.toFixed(1)}荷入りました。実際の平均仕入原価は1荷あたり${(averageCost * 10).toFixed(1)}デナリです。`,
          '次に市場の余剰がふたたび薄くなった時、帳場の「蔵出し」でこの備えを市場へ戻せます。値付けも、その時の実帳面からご報告します。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'seasonal-release-dispatched',
    source: 'event',
    when({ events, state }) {
      const facts = seasonalValleyFacts(state);
      const prior = state?.goalResults?.['release-seasonal-reserve']?.evidence;
      return Boolean(prior?.ready && stockReleaseReport(events, facts?.goods));
    },
    render({ model, events, state }) {
      const valley = seasonalValleyFacts(state);
      const prior = state.goalResults['release-seasonal-reserve'].evidence;
      const release = stockReleaseReport(events, valley.goods);
      return {
        kicker: '蔵出しの荷車',
        title: '備えを市場へ戻します',
        summary: `${goodsLabel(release.goods)} ${release.qty.toFixed(1)}荷・実荷車が出発`,
        facts: {
          ...release,
          averageCost: prior.averageCost,
          marketAvailability: marketGoodsAvailability(model, release.goods),
          marketPrice: model.marketPrices[release.goods],
        },
        body: [
          `${model.day}日目。市場で見える${goodsLabel(release.goods)}が${marketGoodsAvailability(model, release.goods).toFixed(1)}荷まで薄くなったため、蔵から${release.qty.toFixed(1)}荷を積んだ実荷車が出発しました。`,
          '品は瞬時に市場へ移りません。蔵から市場まで道を走り、棚へ到着した時に蔵出し値が立ちます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-three-close',
    source: 'event',
    when({ model, events, state }) {
      const dispatch = state?.letters?.find(letter => letter.id === 'seasonal-release-dispatched');
      return Boolean(dispatch
        && events.some(event => event.type === 'arrival'
          && event.haulJobId === dispatch.facts.haulJobId
          && event.goods === dispatch.facts.goods)
        && (model.companyMarketStock?.[dispatch.facts.goods] ?? 0) > 0
        && Number.isFinite(model.companyReleasePrices?.[dispatch.facts.goods]));
    },
    render({ model, events, state }) {
      const dispatch = state.letters.find(letter => letter.id === 'seasonal-release-dispatched');
      const { goods, averageCost: warehouseAverageCost } = dispatch.facts;
      const arrival = events.find(event => event.type === 'arrival'
        && event.haulJobId === dispatch.facts.haulJobId);
      const arrived = arrival.qty;
      const releasePrice = model.companyReleasePrices[goods];
      const averageCost = model.companyMarketStockAverageCosts?.[goods] ?? null;
      const multiplier = averageCost > 0 ? releasePrice / averageCost : null;
      return {
        kicker: '第三章・蔵出し報告',
        title: '備えは、季節をつなぐ荷になりました',
        summary: `${goodsLabel(goods)} ${arrived.toFixed(1)}荷・蔵出し ${(releasePrice * 10).toFixed(1)}デナリ/荷`,
        facts: {
          goods,
          arrived,
          warehouseAverageCost,
          averageCost,
          releasePrice,
          multiplier,
          marketPrice: model.marketPrices[goods],
        },
        body: [
          `${model.day}日目。${goodsLabel(goods)}が市場へ${arrived.toFixed(1)}荷到着し、蔵出し値は1荷あたり${(releasePrice * 10).toFixed(1)}デナリになりました。今回の出庫ロット原価は${(warehouseAverageCost * 10).toFixed(1)}デナリ、先着在庫も合わせた売場の平均仕入原価は${averageCost === null ? '—' : (averageCost * 10).toFixed(1)}デナリ、蔵出し値はその${multiplier === null ? '—' : multiplier.toFixed(2)}倍です。`,
          `同じ日の市場相場EMAは${(model.marketPrices[goods] * 10).toFixed(1)}デナリ。余る時に会社が買い、薄い時に道を通して戻す——蔵は在庫を消す箱ではなく、季節のあいだをつなぐ場所です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'profitable-order-assessment',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'assess-profitable-order');
    },
    render({ state }) {
      const quote = profitableOrderFacts(state);
      return {
        kicker: '第四章・本国の注文',
        title: '決済の値と、仕入の値を並べます',
        summary: `${goodsLabel(quote.goods)}・決済 ${(quote.settlementPrice * 10).toFixed(1)} / 市場最安 ${(quote.marketLowest * 10).toFixed(1)}デナリ`,
        facts: quote,
        body: [
          `${quote.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷の注文状です。本国の表示単価は${(quote.basePrice * 10).toFixed(1)}デナリですが、完遂時の実決済は1荷あたり${(quote.settlementPrice * 10).toFixed(1)}デナリ。いま市場で買える最安値は${(quote.marketLowest * 10).toFixed(1)}デナリです。`,
          `現時点の差は1荷あたり${(quote.marginPerUnit * 10).toFixed(1)}デナリ、全${quote.qty}荷なら${(quote.quotedMargin * 10).toFixed(1)}デナリの黒字見込みです。相場は動きますが、まず決済と仕入を同じ単位で並べる——その上で受けるかをお決めください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'profitable-order-accepted',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'accept-profitable-order');
    },
    render({ model, state }) {
      const quote = profitableOrderFacts(state);
      return {
        kicker: '受諾後の仕度',
        title: '受諾と買付は、別のご下命です',
        summary: `${goodsLabel(quote.goods)} ${quote.qty}荷・買上げ目標 ${model.stockTargets?.[quote.goods] ?? 0}荷`,
        facts: { ...quote, target: model.stockTargets?.[quote.goods] ?? 0 },
        body: [
          `${model.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷の注文を受諾しました。第一章と同じく、受諾しただけでは会社の買付は始まりません。`,
          `帳場で${goodsLabel(quote.goods)}の買上げ目標を${quote.qty}荷以上に定めてください。会社の銀を使う命令は、いつも総督の選択です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'profitable-order-complete',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'complete-profitable-order');
    },
    render({ state }) {
      const quote = profitableOrderFacts(state);
      const facts = state.goalResults['complete-profitable-order'].evidence;
      return {
        kicker: '利益を得た注文',
        title: '見立てを、実帳簿で確かめました',
        summary: `売上 ${facts.revenue.toFixed(1)} / 出荷原価 ${facts.orderCost.toFixed(1)} / 粗利 ${facts.realizedMargin.toFixed(1)}`,
        facts: { ...facts, quote },
        body: [
          `${facts.completionDay}日目。${goodsLabel(facts.goods)}${facts.qty}荷を納め、実売上は${facts.revenue.toFixed(1)}、今回の出荷に対応する実在庫原価は${facts.orderCost.toFixed(1)}、差し引き粗利は${facts.realizedMargin.toFixed(1)}でした。`,
          `注文状を見た時の市場最安は1荷あたり${(quote.marketLowest * 10).toFixed(1)}デナリ、完遂決済は${(quote.settlementPrice * 10).toFixed(1)}デナリでした。最初の見立てと、最後の実帳簿を分けて確かめるのが商いです。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'skippable-order-assessment',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-skippable-order');
    },
    render({ state }) {
      const evidence = state.goalResults['observe-skippable-order'].evidence;
      const quote = evidence.selected;
      const market = quote.marketLowest === null
        ? '市場に売り物がなく、仕入値を確定できません'
        : `市場最安は1荷あたり${(quote.marketLowest * 10).toFixed(1)}デナリです`;
      const judgment = quote.reason === 'loss'
        ? `決済との差は1荷あたり${(quote.marginPerUnit * 10).toFixed(1)}デナリで、現在値では赤字です`
        : quote.reason === 'no_market'
          ? '調達できる数量も原価も見えず、完遂の見立てを立てられません'
          : `期間内に採算割れが来なかったため、${evidence.seenOffers.length}件目を比較根拠の確認課題にします。現在値では黒字見込みです`;
      return {
        kicker: '受けない注文の見立て',
        title: 'この注文は、受諾せずに見送ります',
        summary: `${goodsLabel(quote.goods)} ${quote.qty}荷・決済 ${(quote.settlementPrice * 10).toFixed(1)}デナリ / ${quote.marketLowest === null ? '市場在庫なし' : `市場最安 ${(quote.marketLowest * 10).toFixed(1)}デナリ`}`,
        facts: evidence,
        body: [
          `${quote.day}日目。${goodsLabel(quote.goods)}${quote.qty}荷、完遂決済は1荷あたり${(quote.settlementPrice * 10).toFixed(1)}デナリ。${market}。${judgment}。`,
          `会社欄の「拒否する」は世界や帳簿を書き換えず、この注文状を画面上で伏せるだけです。受諾せず期限まで置き、実際の失効を見届けてください。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-four-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'let-skippable-order-expire');
    },
    render({ state }) {
      const profit = state.goalResults['complete-profitable-order'].evidence;
      const skipped = state.goalResults['let-skippable-order-expire'].evidence;
      const selected = skipped.selected;
      return {
        kicker: '第四章・商い判断報告',
        title: '引き受けない自由も総督のものです',
        summary: `利益注文の粗利 ${profit.realizedMargin.toFixed(1)} / 見送り ${goodsLabel(selected.goods)} ${selected.qty}荷`,
        facts: { profit, skipped },
        body: [
          `ひとつの注文は、実売上${profit.revenue.toFixed(1)}から出荷原価${profit.orderCost.toFixed(1)}を引き、粗利${profit.realizedMargin.toFixed(1)}で完遂しました。もうひとつの${goodsLabel(selected.goods)}${selected.qty}荷は受諾せず、${skipped.expired.day}日目に実際に失効しました。`,
          '注文状は命令ではありません。決済と市場を比べ、会社の銀を使うか決めること。引き受けない自由も総督のものです。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'tools-price-rise',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-tools-price-rise');
    },
    render({ state }) {
      const facts = state.goalResults['observe-tools-price-rise'].evidence;
      return {
        kicker: '第五章・島の手仕事',
        title: '道具の値が上がっています',
        summary: `底値 ${(facts.minimumPrice * 10).toFixed(1)}→${(facts.currentPrice * 10).toFixed(1)}デナリ/荷（+${(facts.ratio * 100).toFixed(1)}%）`,
        facts,
        body: [
          `${facts.minimumDay}日目に1荷あたり${(facts.minimumPrice * 10).toFixed(1)}デナリだった道具相場EMAが、${facts.currentDay}日目には${(facts.currentPrice * 10).toFixed(1)}デナリ、底から${(facts.ratio * 100).toFixed(1)}%上がりました。台詞のための固定相場ではなく、この島で動いた実値です。`,
          '既設の木工房に加え、炭焼と製塩所をお置きください。木工と炭焼は丸太を、製塩所は木炭をinput棚へ買い、道具・木炭・塩へ作り替えます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'conversion-workshops-placed',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'place-conversion-workshops');
    },
    render({ model, state }) {
      const rows = state.goalResults['place-conversion-workshops'].evidence.rows;
      return {
        kicker: '手仕事の受け皿',
        title: '三つの仕事場が揃いました',
        summary: rows.map(row => `${row.label}${row.buildingCount}棟`).join('・'),
        facts: { rows },
        body: [
          `${model.day}日目。${rows.map(row => `${row.label}${row.buildingCount}棟`).join('、')}が島に揃いました。建物を置いただけでは品は生まれません。移民が入り、原料を市場で買ってinput棚へ運ぶまでを待ちます。`,
          'input棚の中身、原料相場、作る品の原価と生産EMAを、同じ瞬間の実帳面で並べてご報告します。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'conversion-cost-chain',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'observe-conversion-cost-chain');
    },
    render({ model, state }) {
      const facts = state.goalResults['observe-conversion-cost-chain'].evidence;
      const woodshop = facts.rows.find(row => row.job === 'woodshop').economics;
      const charburner = facts.rows.find(row => row.job === 'charburner').economics;
      const saltworks = facts.rows.find(row => row.job === 'saltworks').economics;
      return {
        kicker: '原価連鎖の実測',
        title: '丸太から道具と木炭へ、木炭から塩へ',
        summary: `生産EMA 道具${woodshop.productionEma.toFixed(2)}・木炭${charburner.productionEma.toFixed(2)}・塩${saltworks.productionEma.toFixed(2)}`,
        facts,
        body: [
          `${model.day}日目。丸太相場は1荷あたり${(facts.logPrice * 10).toFixed(1)}デナリ。木工房のinput棚には${woodshop.inputAmount.toFixed(1)}荷あり、道具の実生産原価は${(woodshop.cost * 10).toFixed(1)}デナリ/荷、生産EMAは${woodshop.productionEma.toFixed(2)}です。炭焼のinput棚は丸太${charburner.inputAmount.toFixed(1)}荷、木炭原価${(charburner.cost * 10).toFixed(1)}デナリ/荷、生産EMA${charburner.productionEma.toFixed(2)}です。`,
          `その木炭相場は1荷あたり${(facts.charPrice * 10).toFixed(1)}デナリ。製塩所のinput棚には${saltworks.inputAmount.toFixed(1)}荷あり、塩の実生産原価は${(saltworks.cost * 10).toFixed(1)}デナリ/荷、生産EMAは${saltworks.productionEma.toFixed(2)}です。原料の値が次の作り手の原価へ渡る——これが島内の連鎖です。`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'household-level-up',
    source: 'event',
    when({ model, events, state }) {
      return goalCompleted(state, 'place-conversion-workshops')
        && Boolean(householdLevelUpReport(model, events));
    },
    render({ model, events }) {
      const facts = householdLevelUpReport(model, events);
      const appearance = facts.appearance;
      return {
        kicker: '暮らしの等級',
        title: '暮らしが、建物の姿を育てました',
        summary: `${facts.job}#${facts.householdId} Lv${facts.previousLevel}→Lv${facts.level}${appearance ? `・外観段階${appearance.tier}` : ''}`,
        facts,
        body: [
          `${facts.day}日目、実イベント「${facts.message}」。文化財を満たした世帯の暮らしがLv${facts.previousLevel}からLv${facts.level}へ上がりました。`,
          appearance
            ? `住まい兼仕事場${facts.buildingId}の描画も世帯Lvを受け、外観キーは${appearance.key}、外観段階${appearance.tier}、高さ${appearance.elevation}になりました。品の流れは、財布だけでなく町の姿にも残ります。`
            : '品の流れは、財布だけでなく暮らしの等級にも残ります。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'no-vacancy-job-change',
    source: 'event',
    when({ model, events, state }) {
      return goalCompleted(state, 'place-conversion-workshops')
        && Boolean(noVacancyReport(model, events));
    },
    render({ model, events }) {
      const facts = noVacancyReport(model, events);
      const target = facts.targetJob ? `${facts.targetJob}の` : '';
      return {
        kicker: '産業政策・転職',
        title: '仕事を替えるにも、空いた建物が要ります',
        summary: `${facts.message}・空き職建物 ${facts.vacantBuildingCount}棟`,
        facts,
        body: [
          `${facts.day}日目、実イベント「${facts.message}」。この時、島の空き職建物は${facts.vacantBuildingCount}棟、${target}空きは${facts.targetVacancyCount}棟でした。`,
          '困窮した世帯は、仕事だけを名前で替えるのではなく、空いている別職の建物へ実際に移り住みます。将来ほしい産業の建物を一棟空けておくことが、人の移れる道を用意する産業政策になります。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'chapter-five-close',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'sustain-conversion-workshops')
        && goalCompleted(state, 'observe-household-level-up');
    },
    render({ state }) {
      const survival = state.goalResults['sustain-conversion-workshops'].evidence;
      const levelUp = state.letters.find(letter => letter.id === 'household-level-up').facts;
      const vacancy = state.letters.find(letter => letter.id === 'no-vacancy-job-change')?.facts ?? null;
      const vacancyBody = vacancy
        ? `また、${vacancy.day}日目の「${vacancy.message}」から、転職には空き建物という受け皿が要ることも分かりました。`
        : '転職失敗はこの90日には観測されませんでした。起きた時だけ、その実記録と空き建物数をご報告します。';
      return {
        kicker: '第五章・手仕事と暮らしの報告',
        title: '品の連鎖が、島の暮らしを育てました',
        summary: `三つの手仕事 ${survival.elapsedDays}日存続・${levelUp.job}#${levelUp.householdId} Lv${levelUp.level}`,
        facts: { survival, levelUp, vacancy },
        body: [
          `木工房・炭焼・製塩所は${survival.startDay}日目から${survival.currentDay}日目まで、連続${survival.elapsedDays}日存続しました。丸太は道具と木炭へ、木炭は塩へ渡り、三つの品の生産が続いています。`,
          `${levelUp.day}日目には${levelUp.job}#${levelUp.householdId}がLv${levelUp.level}へ上がり、建物${levelUp.buildingId}の外観にも反映されました。${vacancyBody}`,
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'tutorial-graduation',
    source: 'snapshot',
    when({ state }) {
      return goalCompleted(state, 'close-fifth-chapter');
    },
    render({ model }) {
      const facts = tutorialGraduationFacts(model);
      const netSign = facts.companyNet >= 0 ? '+' : '';
      const bankruptcy = facts.companyBankruptcyDay === null
        ? '破産なし'
        : `${facts.companyBankruptcyDay}日目に破産記録あり`;
      return {
        kicker: '終章・総督の島',
        title: 'あとは総督の思うままに',
        summary: `人口${facts.population}人・存続${facts.survivingJobCount}職・食料輸入EMA ${facts.foodImportEma.toFixed(3)}・会社収支 ${netSign}${facts.companyNet.toFixed(1)}`,
        facts,
        body: [
          `${facts.day}日目。総督が育てた町は人口${facts.population}人、現に世帯が働く職は${facts.survivingJobCount}種です。安定監査の中核${facts.stableJobsRequired}職のうち${facts.stableJobsPresent}職が存続しています。食料輸入EMAは${facts.foodImportEma.toFixed(3)}、島内食料生産EMAは${facts.foodProductionEma.toFixed(2)}です。`,
          `会社の実台帳は収入${facts.companyIncome.toFixed(1)}、支出${facts.companyExpense.toFixed(1)}、差引${netSign}${facts.companyNet.toFixed(1)}、残高${facts.companyMoney.toFixed(1)}、${bankruptcy}。見本となるE-Stableは${facts.reference.years}年の各年に人口${facts.reference.populationBand[0]}〜${facts.reference.populationBand[1]}人、中核${facts.stableJobsRequired}職を各1以上、破産なしを確かめる参照帯です。食料自給の節目は、この島で較正した輸入EMA ${facts.reference.foodImportEmaMax.toFixed(2)}未満です。町の年齢も総督の選択も違うため、これは合否ではなく行く先を測る物差しとしてお読みください。`,
          '開始メニューの「テスト配置で観察」は、同じエンジンでこの安定帯を通った「見本の町」です。見比べることも、ここから別の産業を伸ばすこともできます。教程の目標はここで閉じますが、島も帳簿も作り直しません。エレナは重要な出来事だけをお届けします——あとは総督の思うままに。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
  Object.freeze({
    id: 'first-log-trade',
    source: 'event',
    when({ events }) {
      return Boolean(logTransaction(events));
    },
    render({ model, events }) {
      const trade = logTransaction(events);
      const price = (trade.price * 10).toFixed(1);
      return {
        kicker: '市場の初商い',
        title: '丸太に買い手がつきました',
        summary: `${trade.transactionDay ?? model.day}日目・${trade.qty}荷・${price}デナリ/荷`,
        body: [
          `${trade.transactionDay ?? model.day}日目。市場で丸太${trade.qty}荷が1荷あたり${price}デナリで商われました。木工房の棚が満ち、木こりの財布に銀が入りました。`,
          '値は私どもが決めたものではありません。売り手の言い値に買い手がついた、それだけのことです。市場とはそういう場所でございます。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
]);
