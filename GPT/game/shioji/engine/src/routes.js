// 隊商路線 — 定期便・実移動・実費・月次収支（正本: v004/WORLD_DESIGN_DECISIONS_20260810.md Q10-Q29）
// 一つの隊商宿に一路線。経路は荷車道の最速路、売買は両端の実市場だけで行う。
import {
  GOODS,
  P,
  caravanCrewCount as caravanInnCrewCount,
  householdMarketId,
  marketBuildingForId,
  marketPriceBook,
  postCompanyLedger,
  purchaseCompanyWoodCart,
  recordEconomyEvent,
  useHouseholdWorkTool,
} from "./econ.js?v=v004.49.0-economy-recovery";
import {
  buildingById,
  createCartCarrier,
  depositInventory,
  findTravelPath,
  goodsUnitWeight,
  routeTravelCarrier,
  sectionAmount,
  stepTravelCarrier,
  withdrawInventory,
} from "./physical.js?v=v004.49.0-economy-recovery";

export const CARAVAN_CART_CAPACITY = P.CART_WOOD_CAPACITY;
export const CARAVAN_INTERVAL_LIMITS = Object.freeze({ min: 1, max: 30 });
export const CARAVAN_DEFAULT_INTERVAL_DAYS = 20;

function calendarMonthIndex(day) {
  return Math.floor(Math.max(0, day - 1) / 30);
}

function monthlyRow(route, day) {
  const month = calendarMonthIndex(day);
  route.monthly[month] ??= {
    sales: 0,
    procurement: 0,
    wages: 0,
    cartCosts: 0,
  };
  return route.monthly[month];
}

function normalizeGoodsList(goodsList, label) {
  if (!Array.isArray(goodsList)) throw new TypeError(`${label} must be an array`);
  const normalized = [...new Set(goodsList)];
  if (normalized.some((goods) => !GOODS.includes(goods))) {
    throw new RangeError(`${label} includes unknown goods`);
  }
  return normalized;
}

function normalizeInterval(intervalDays) {
  if (!Number.isSafeInteger(intervalDays)) {
    throw new TypeError("caravan interval must be a safe integer");
  }
  if (
    intervalDays < CARAVAN_INTERVAL_LIMITS.min
    || intervalDays > CARAVAN_INTERVAL_LIMITS.max
  ) throw new RangeError("caravan interval is out of range");
  return intervalDays;
}

function marketEntrance(physical, marketId) {
  return marketBuildingForId(physical, marketId)?.entrance ?? null;
}

function routeForBase(economy, baseBuildingId) {
  return (economy.caravans ?? []).find((route) => (
    route.baseBuildingId === baseBuildingId && route.state !== "disbanded"
  )) ?? null;
}

function routeHousehold(economy, physical, route) {
  const inn = buildingById(physical, route?.baseBuildingId);
  return economy.households.find((candidate) => candidate.id === inn?.ownerHouseholdId) ?? null;
}

function workRouteDay(economy, physical, route, day) {
  if (route.workToolDay === day) return route.workSpeedMultiplier ?? 1;
  const household = routeHousehold(economy, physical, route);
  if (!household) return 1;
  const result = useHouseholdWorkTool(economy, physical, household, { day, effort: 1 });
  route.workToolDay = day;
  route.workSpeedMultiplier = result.multiplier;
  return result.multiplier;
}

export function createCaravanRoute(economy, physical, {
  id = null,
  name = null,
  baseBuildingId,
  destMarketId,
  goodsOut = [],
  goodsBack = [],
  intervalDays = CARAVAN_DEFAULT_INTERVAL_DAYS,
  day = economy.currentDay ?? 0,
} = {}) {
  const inn = buildingById(physical, baseBuildingId);
  if (!inn || inn.type !== "carter") {
    return { ok: false, reason: "caravan_inn_not_found", route: null };
  }
  if (routeForBase(economy, inn.id)) {
    return { ok: false, reason: "base_has_route", route: null };
  }
  const household = economy.households.find((candidate) => candidate.id === inn.ownerHouseholdId);
  if (!household) return { ok: false, reason: "caravan_inn_vacant", route: null };
  const baseMarketId = householdMarketId(household);
  if (!destMarketId || baseMarketId === destMarketId) {
    return { ok: false, reason: "same_market", route: null };
  }
  const baseEntrance = marketEntrance(physical, baseMarketId);
  const destEntrance = marketEntrance(physical, destMarketId);
  if (!baseEntrance || !destEntrance) {
    return { ok: false, reason: "market_not_found", route: null };
  }
  const path = findTravelPath(physical, baseEntrance, destEntrance, "cart");
  if (!path) return { ok: false, reason: "no_cart_road", route: null };
  const outbound = normalizeGoodsList(goodsOut, "outbound caravan goods");
  const returning = normalizeGoodsList(goodsBack, "return caravan goods");
  if (outbound.length === 0 && returning.length === 0) {
    return { ok: false, reason: "no_goods", route: null };
  }
  economy.caravans ??= [];
  economy.nextCaravanId ??= 1;
  const sequence = economy.nextCaravanId;
  const route = {
    id: id ?? `caravan${sequence}`,
    name: name ?? `隊商${sequence}`,
    baseBuildingId: inn.id,
    baseMarketId,
    destMarketId,
    goodsOut: outbound,
    goodsBack: returning,
    intervalDays: normalizeInterval(intervalDays),
    cartAssetIds: [],
    state: "idle",
    locationMarketId: baseMarketId,
    pathTicks: path.cost,
    progressTicks: 0,
    cargo: {},
    cargoCostByGoods: {},
    nextDepartDay: Math.max(1, day + 1),
    currentTrip: null,
    carriers: [],
    recentTrips: [],
    monthly: {},
    waitingNotice: null,
  };
  economy.nextCaravanId += 1;
  economy.caravans.push(route);
  recordEconomyEvent(economy, Math.max(0, day), `${route.name}の路線を定めた`);
  return { ok: true, route };
}

export function configureCaravanRoute(economy, physical, options = {}) {
  const existing = routeForBase(economy, options.baseBuildingId);
  if (!existing) return createCaravanRoute(economy, physical, options);
  if (existing.currentTrip || ["outbound", "returning"].includes(existing.state)) {
    return { ok: false, reason: "route_in_transit", route: existing };
  }
  const nextDestination = options.destMarketId ?? existing.destMarketId;
  const destinationEntrance = marketEntrance(physical, nextDestination);
  const baseEntrance = marketEntrance(physical, existing.baseMarketId);
  if (!destinationEntrance || !baseEntrance) {
    return { ok: false, reason: "market_not_found", route: existing };
  }
  if (nextDestination === existing.baseMarketId) {
    return { ok: false, reason: "same_market", route: existing };
  }
  const path = findTravelPath(physical, baseEntrance, destinationEntrance, "cart");
  if (!path) return { ok: false, reason: "no_cart_road", route: existing };
  const outbound = options.goodsOut === undefined
    ? existing.goodsOut
    : normalizeGoodsList(options.goodsOut, "outbound caravan goods");
  const returning = options.goodsBack === undefined
    ? existing.goodsBack
    : normalizeGoodsList(options.goodsBack, "return caravan goods");
  if (outbound.length === 0 && returning.length === 0) {
    return { ok: false, reason: "no_goods", route: existing };
  }
  existing.destMarketId = nextDestination;
  existing.goodsOut = [...outbound];
  existing.goodsBack = [...returning];
  existing.intervalDays = options.intervalDays === undefined
    ? existing.intervalDays
    : normalizeInterval(options.intervalDays);
  existing.pathTicks = path.cost;
  existing.waitingNotice = null;
  return { ok: true, route: existing };
}

function assignedCartAssets(economy, route) {
  const assigned = route.cartAssetIds
    .map((assetId) => economy.companyCarts.find((asset) => asset.id === assetId))
    .filter((asset) => asset && asset.durability > 1e-9);
  route.cartAssetIds = assigned.map((asset) => asset.id);
  return assigned;
}

function assignCart(route, asset) {
  asset.busyJobId = route.id;
  asset.caravanRouteId = route.id;
  if (!route.cartAssetIds.includes(asset.id)) route.cartAssetIds.push(asset.id);
  return asset;
}

function provisionRouteCarts(economy, route, crew, { day }) {
  let assigned = assignedCartAssets(economy, route);
  for (const asset of economy.companyCarts) {
    if (assigned.length >= crew) break;
    if (asset.durability <= 1e-9 || asset.busyJobId || asset.caravanRouteId) continue;
    assignCart(route, asset);
    assigned.push(asset);
  }
  const purchases = [];
  while (assigned.length < crew) {
    const asset = purchaseCompanyWoodCart(economy, { day, marketId: route.baseMarketId });
    if (!asset) break;
    assignCart(route, asset);
    assigned.push(asset);
    monthlyRow(route, day).cartCosts += asset.price;
    purchases.push({ assetId: asset.id, price: asset.price });
  }
  return { assigned, purchases };
}

export function caravanCrewCount(economy, physical, route) {
  const inn = buildingById(physical, route?.baseBuildingId);
  return caravanInnCrewCount(economy, inn);
}

export function caravanCapacity(economy, physical, route) {
  const crew = caravanCrewCount(economy, physical, route);
  return Math.min(crew, assignedCartAssets(economy, route).length) * CARAVAN_CART_CAPACITY;
}

function recordMarketPrice(economy, marketId, goods, price, qty, day) {
  const book = marketPriceBook(economy, marketId);
  const previous = book[goods] ?? P.BELIEF0[goods] ?? price;
  book[goods] = previous + 0.1 * (price - previous);
  const previousCount = economy.priceCounts[goods] ?? economy.prices[goods].length;
  economy.prices[goods].push([day, price, qty]);
  economy.priceCounts[goods] = previousCount + 1;
  if (economy.prices[goods].length > 320) {
    economy.prices[goods].splice(0, economy.prices[goods].length - 256);
  }
}

// 市場棟の実在庫と屋台を同量だけ減らし、売り手世帯へ会社から実払いする。
function caravanBuyAtMarket(economy, physical, route, marketId, goodsList, capacity, { day }) {
  let remainingWeight = capacity;
  let spent = 0;
  const bought = {};
  const costByGoods = {};
  let fundingShortfall = false;
  const market = marketBuildingForId(physical, marketId);
  const buyGoods = (goods, weightLimit) => {
    let goodsWeight = Math.min(remainingWeight, weightLimit);
    const unitWeight = goodsUnitWeight(goods);
    const stalls = economy.stalls[goods]
      .filter((stall) => (stall.marketId ?? "main") === marketId && stall.qty > 1e-9)
      .sort((left, right) => left.price - right.price
        || left.householdId - right.householdId);
    for (const stall of stalls) {
      if (remainingWeight <= 1e-9 || goodsWeight <= 1e-9) break;
      const seller = economy.households.find((candidate) => candidate.id === stall.householdId);
      if (!seller) continue;
      const physicalQty = market ? sectionAmount(market, "outbound", goods) : stall.qty;
      const affordableQty = economy.company.money / Math.max(1e-9, stall.price);
      const availableQty = Math.min(
        stall.qty,
        physicalQty,
        remainingWeight / unitWeight,
        goodsWeight / unitWeight,
      );
      const qty = Math.min(availableQty, affordableQty);
      if (qty + 1e-9 < availableQty) fundingShortfall = true;
      if (qty <= 1e-9) {
        if (stall.qty > 1e-9 && physicalQty > 1e-9 && affordableQty <= 1e-9) {
          fundingShortfall = true;
        }
        continue;
      }
      const payment = qty * stall.price;
      stall.qty -= qty;
      if (market) withdrawInventory(market, "outbound", goods, qty);
      seller.purse += payment;
      seller.income30 += payment;
      postCompanyLedger(economy.company, {
        day,
        amount: -payment,
        reason: `${route.name}が${goods}を仕入れ`,
      });
      recordMarketPrice(economy, marketId, goods, stall.price, qty, day);
      spent += payment;
      bought[goods] = (bought[goods] ?? 0) + qty;
      costByGoods[goods] = (costByGoods[goods] ?? 0) + payment;
      remainingWeight -= qty * unitWeight;
      goodsWeight -= qty * unitWeight;
    }
  };
  // 複数品目を指定したのに先頭の一品だけで満載になると、チェックした後続品が
  // 一度も運ばれない。第一巡は積載重量を等分し、余った空きだけ第二巡で埋める。
  const share = goodsList.length > 0 ? capacity / goodsList.length : 0;
  for (const goods of goodsList) buyGoods(goods, share);
  for (const goods of goodsList) {
    if (remainingWeight <= 1e-9) break;
    buyGoods(goods, remainingWeight);
  }
  return { bought, costByGoods, spent, fundingShortfall };
}

function cargoSummary(cargo) {
  return Object.entries(cargo)
    .filter(([, qty]) => qty > 1e-9)
    .map(([goods, qty]) => `${goods}${Number(qty.toFixed(2))}荷`)
    .join("・");
}

function unloadToMarket(economy, physical, route, marketId, { day }) {
  const table = (economy.marketStockM ??= {})[marketId] ??= {};
  const costTable = (economy.marketStockCostM ??= {})[marketId] ??= {};
  const lotTable = (economy.marketStockLotsM ??= {})[marketId] ??= {};
  const market = marketBuildingForId(physical, marketId);
  for (const [goods, qty] of Object.entries(route.cargo)) {
    if (qty <= 1e-9) continue;
    const cost = route.cargoCostByGoods[goods] ?? 0;
    table[goods] = (table[goods] ?? 0) + qty;
    costTable[goods] = (costTable[goods] ?? 0) + cost;
    (lotTable[goods] ??= []).push({
      routeId: route.id,
      tripNumber: route.currentTrip?.tripNumber ?? null,
      qty,
      cost,
    });
    if (market) depositInventory(market, "inbound", goods, qty);
  }
  const summary = cargoSummary(route.cargo);
  recordEconomyEvent(
    economy,
    day,
    summary
      ? `${route.name}が着いた——${summary}を降ろした`
      : `${route.name}が空荷で着いた`,
  );
  route.cargo = {};
  route.cargoCostByGoods = {};
  route.locationMarketId = marketId;
}

function assignCarrierManifests(route) {
  for (const carrier of route.carriers) carrier.manifest = {};
  let carrierIndex = 0;
  for (const [goods, totalQty] of Object.entries(route.cargo)) {
    let qty = totalQty;
    const unitWeight = goodsUnitWeight(goods);
    while (qty > 1e-9 && carrierIndex < route.carriers.length) {
      const carrier = route.carriers[carrierIndex];
      const used = Object.entries(carrier.manifest).reduce(
        (total, [item, amount]) => total + amount * goodsUnitWeight(item),
        0,
      );
      const roomQty = Math.max(0, carrier.capacity - used) / unitWeight;
      const loaded = Math.min(qty, roomQty);
      if (loaded > 1e-9) carrier.manifest[goods] = loaded;
      qty -= loaded;
      if (roomQty - loaded <= 1e-9) carrierIndex += 1;
    }
  }
}

function routeCrewMembers(economy, physical, route, count) {
  const household = routeHousehold(economy, physical, route);
  if (!household) return [];
  const byId = new Map((household.members ?? []).map((member) => [member.id, member]));
  const assigned = (route.currentTrip?.crewMemberIds ?? [])
    .map((memberId) => byId.get(memberId))
    .filter(Boolean);
  for (const member of household.members ?? []) {
    if (assigned.length >= count) break;
    if (!assigned.some((candidate) => candidate.id === member.id)) assigned.push(member);
  }
  return assigned.slice(0, count);
}

function startLeg(economy, physical, route, assets, from, to) {
  const path = findTravelPath(physical, from, to, "cart");
  if (!path) return false;
  const household = routeHousehold(economy, physical, route);
  const crewMembers = routeCrewMembers(economy, physical, route, assets.length);
  route.carriers = assets.map((asset, index) => {
    const member = crewMembers[index] ?? null;
    const carrier = createCartCarrier(physical, {
      id: `${route.id}:${route.currentTrip.tripNumber}:${route.state}:${index}`,
      capacity: asset.kind === "iron" ? P.CART_IRON_CAPACITY : P.CART_WOOD_CAPACITY,
      cartKind: asset.kind,
      assetId: asset.id,
    });
    carrier.people = 1;
    carrier.routeId = route.id;
    carrier.householdId = household?.id ?? null;
    carrier.memberId = member?.id ?? null;
    carrier.memberName = member?.name ?? null;
    carrier.departureDelay = index * 0.35;
    return routeTravelCarrier(physical, carrier, from, to);
  });
  assignCarrierManifests(route);
  route.pathTicks = path.cost;
  route.progressTicks = 0;
  return true;
}

function startOutboundTrip(economy, physical, route, assets, { day, purchases = [] }) {
  const baseEntrance = marketEntrance(physical, route.baseMarketId);
  const destEntrance = marketEntrance(physical, route.destMarketId);
  if (!baseEntrance || !destEntrance) return false;
  if (!findTravelPath(physical, baseEntrance, destEntrance, "cart")) return false;
  const capacity = assets.reduce((total, asset) => (
    total + (asset.kind === "iron" ? P.CART_IRON_CAPACITY : P.CART_WOOD_CAPACITY)
  ), 0);
  const purchase = caravanBuyAtMarket(
    economy,
    physical,
    route,
    route.baseMarketId,
    route.goodsOut,
    capacity,
    { day },
  );
  route.cargo = purchase.bought;
  route.cargoCostByGoods = purchase.costByGoods;
  route.fundingShortfall = purchase.fundingShortfall;
  route.state = "outbound";
  route.currentTrip = {
    tripNumber: (route.completedTrips ?? 0) + 1,
    departedDay: day,
    crew: assets.length,
    crewMemberIds: routeCrewMembers(economy, physical, route, assets.length)
      .map((member) => member.id),
    cartAssetIds: assets.map((asset) => asset.id),
    procurement: purchase.spent,
    retailSales: 0,
    wages: 0,
    cartCosts: purchases.reduce((total, purchase) => total + purchase.price, 0),
    outbound: { ...purchase.bought },
    returning: {},
    fundingShortfall: purchase.fundingShortfall,
    outboundTicks: null,
    returnTicks: null,
    distance: 0,
  };
  if (!startLeg(economy, physical, route, assets, baseEntrance, destEntrance)) {
    route.state = "waiting_road";
    return false;
  }
  route.currentTrip.distance += route.pathTicks;
  monthlyRow(route, day).procurement += purchase.spent;
  route.nextDepartDay = day + route.intervalDays;
  route.waitingNotice = null;
  return true;
}

function resumeReturnTrip(economy, physical, route, { day }) {
  if (!route.currentTrip) return false;
  const assets = route.currentTrip.cartAssetIds
    .map((assetId) => economy.companyCarts.find((asset) => asset.id === assetId))
    .filter(Boolean);
  if (assets.length <= 0) {
    waiting(economy, route, day, "waiting_cart_return", `${route.name}は帰りの荷車を失った`);
    return false;
  }
  const destEntrance = marketEntrance(physical, route.destMarketId);
  const baseEntrance = marketEntrance(physical, route.baseMarketId);
  route.state = "returning";
  if (!startLeg(economy, physical, route, assets, destEntrance, baseEntrance)) {
    waiting(economy, route, day, "waiting_road_return", `${route.name}は帰りの荷車道を待っている`);
    return false;
  }
  route.currentTrip.distance += route.pathTicks;
  route.waitingNotice = null;
  return true;
}

function collectRouteAccruals(economy, route, day) {
  const wages = (economy.caravanWagesPending ??= {})[route.baseBuildingId] ?? 0;
  if (wages > 1e-9) {
    monthlyRow(route, day).wages += wages;
    if (route.currentTrip) route.currentTrip.wages += wages;
    economy.caravanWagesPending[route.baseBuildingId] = 0;
  }
  const sales = (economy.caravanSalesPending ??= {})[route.id] ?? 0;
  if (sales > 1e-9) {
    monthlyRow(route, day).sales += sales;
    economy.caravanSalesPending[route.id] = 0;
  }
}

function waiting(economy, route, day, state, message) {
  route.state = state;
  if (route.waitingNotice !== state) {
    route.waitingNotice = state;
    recordEconomyEvent(economy, day, message);
  }
}

function updateLossBoundary(economy, route, day) {
  if (day <= 1 || (day - 1) % 30 !== 0) return;
  const completedMonth = Math.floor((day - 2) / 30);
  const recent = [completedMonth - 2, completedMonth - 1, completedMonth]
    .map((month) => route.monthly?.[month] ?? null);
  const threeMonthLoss = recent.every((row) => row && (
    (row.sales ?? 0) - (row.procurement ?? 0) - (row.wages ?? 0)
      - (row.cartCosts ?? row.wear ?? 0) < -1e-9
  ));
  if (threeMonthLoss && !route.lossBoundaryActive) {
    route.lossBoundaryActive = true;
    recordEconomyEvent(economy, day, `${route.name}は3か月続けて赤字になった`);
  } else if (!threeMonthLoss) route.lossBoundaryActive = false;
}

// 一日一回、固定給と実売上を路線へ帰属させ、予定日にだけ出発する。
export function stepCaravanDay(economy, physical, { day }) {
  const results = [];
  for (const route of economy.caravans ?? []) {
    if (route.state === "disbanded") continue;
    collectRouteAccruals(economy, route, day);
    updateLossBoundary(economy, route, day);
    if (["waiting_road_return", "waiting_cart_return"].includes(route.state)) {
      const resumed = resumeReturnTrip(economy, physical, route, { day });
      results.push({ routeId: route.id, departed: false, returning: resumed });
      continue;
    }
    if (["outbound", "returning"].includes(route.state)) {
      workRouteDay(economy, physical, route, day);
      continue;
    }
    if (route.locationMarketId !== route.baseMarketId) continue;
    if (day < (route.nextDepartDay ?? day)) continue;
    const crew = caravanCrewCount(economy, physical, route);
    if (crew <= 0) {
      waiting(economy, route, day, "waiting_crew", `${route.name}は御者を待っている`);
      results.push({ routeId: route.id, departed: false, reason: "crew" });
      continue;
    }
    const provision = provisionRouteCarts(economy, route, crew, { day });
    if (provision.assigned.length < crew) {
      waiting(economy, route, day, "waiting_cart", `${route.name}は荷車を待っている`);
      results.push({ routeId: route.id, departed: false, reason: "cart" });
      continue;
    }
    const started = startOutboundTrip(
      economy,
      physical,
      route,
      provision.assigned.slice(0, crew),
      { day, purchases: provision.purchases },
    );
    if (!started) {
      waiting(economy, route, day, "waiting_road", `${route.name}は通れる荷車道を待っている`);
      results.push({ routeId: route.id, departed: false, reason: "road" });
      continue;
    }
    workRouteDay(economy, physical, route, day);
    results.push({
      routeId: route.id,
      departed: true,
      crew: route.currentTrip.crew,
      cargo: { ...route.cargo },
      cartPurchases: provision.purchases,
    });
  }
  return results;
}

function wearTripCarts(economy, route, { day }) {
  const broken = [];
  for (const assetId of route.currentTrip.cartAssetIds) {
    const index = economy.companyCarts.findIndex((asset) => asset.id === assetId);
    if (index < 0) continue;
    const asset = economy.companyCarts[index];
    asset.durability = Math.max(0, asset.durability - route.currentTrip.distance);
    economy.cartStats.companyUses += 1;
    if (asset.durability > 1e-9) continue;
    economy.companyCarts.splice(index, 1);
    route.cartAssetIds = route.cartAssetIds.filter((id) => id !== assetId);
    economy.cartStats.companyBroken += 1;
    broken.push(assetId);
    recordEconomyEvent(economy, day, `${route.name}の荷車${assetId}が壊れた——新しい荷車が要る`);
  }
  return broken;
}

// tickごとに物理carrierを道路コストぶん進め、両端到着時だけ荷を移す。
export function stepCaravanTick(economy, physical, { day }) {
  const arrivals = [];
  for (const route of economy.caravans ?? []) {
    if (!["outbound", "returning"].includes(route.state)) continue;
    // Array.everyの短絡評価を使うと、先頭が到着するまで後続車が一歩も進まず、
    // 2台編成の所要時間が2倍になる。全車を同じtickで必ず一度ずつ進める。
    let arrived = true;
    for (const carrier of route.carriers) {
      if (!stepTravelCarrier(physical, carrier, route.workSpeedMultiplier ?? 1)) arrived = false;
    }
    route.progressTicks += 1;
    if (!arrived) continue;
    if (route.state === "outbound") {
      route.currentTrip.outboundTicks = route.progressTicks;
      unloadToMarket(economy, physical, route, route.destMarketId, { day });
      const assets = route.currentTrip.cartAssetIds
        .map((assetId) => economy.companyCarts.find((asset) => asset.id === assetId))
        .filter(Boolean);
      const capacity = assets.reduce((total, asset) => (
        total + (asset.kind === "iron" ? P.CART_IRON_CAPACITY : P.CART_WOOD_CAPACITY)
      ), 0);
      const purchase = caravanBuyAtMarket(
        economy,
        physical,
        route,
        route.destMarketId,
        route.goodsBack,
        capacity,
        { day },
      );
      route.cargo = purchase.bought;
      route.cargoCostByGoods = purchase.costByGoods;
      route.fundingShortfall = route.fundingShortfall || purchase.fundingShortfall;
      route.currentTrip.returning = { ...purchase.bought };
      route.currentTrip.fundingShortfall = (
        route.currentTrip.fundingShortfall || purchase.fundingShortfall
      );
      route.currentTrip.procurement += purchase.spent;
      monthlyRow(route, day).procurement += purchase.spent;
      if (!resumeReturnTrip(economy, physical, route, { day })) continue;
      arrivals.push({ routeId: route.id, marketId: route.destMarketId, returning: true });
    } else {
      route.currentTrip.returnTicks = route.progressTicks;
      unloadToMarket(economy, physical, route, route.baseMarketId, { day });
      const brokenCartIds = wearTripCarts(economy, route, { day });
      const trip = {
        ...route.currentTrip,
        returnedDay: day,
        brokenCartIds,
      };
      route.lastFundingShortfall = Boolean(trip.fundingShortfall);
      route.recentTrips.push(trip);
      if (route.recentTrips.length > 12) route.recentTrips.shift();
      route.completedTrips = (route.completedTrips ?? 0) + 1;
      route.currentTrip = null;
      route.carriers = [];
      route.state = "idle";
      route.progressTicks = 0;
      route.waitingNotice = null;
      arrivals.push({ routeId: route.id, marketId: route.baseMarketId, returned: true });
    }
  }
  return arrivals;
}

export function caravanMonthlyLedger(route, { months = 12 } = {}) {
  return Object.entries(route.monthly)
    .map(([month, row]) => ({
      month: Number(month),
      ...row,
      profit: row.sales - row.procurement - row.wages - row.cartCosts,
    }))
    .sort((left, right) => left.month - right.month)
    .slice(-months);
}
