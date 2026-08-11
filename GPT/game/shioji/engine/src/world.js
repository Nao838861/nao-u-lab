import {
  FOODS,
  GOODS,
  P,
  ageMarketStalls,
  assignNeedyWork,
  buyTargets,
  companyStockReleasePrice,
  completeAssignedWork,
  createEconomicState,
  finalizeHouseholdProductionDay,
  fundCompanyBuilding,
  finishHouseholdCartTrip,
  initializeNaturalResources,
  isProductionInput,
  householdEat,
  householdMult,
  householdBuildingNeeds,
  householdFoodDays,
  householdTransportPlan,
  householdMaterialAmount,
  householdMarketEntrance,
  householdMarketId,
  householdWorkToolNeed,
  loadMarketSellCargo,
  marketTripDuration,
  marketPathLength,
  marketPriceBook,
  producePrimaryTick,
  productionInputAmount,
  productionCost,
  productionMultiplierForTrip,
  pruneEconomyHistory,
  recordEconomyEvent,
  runCompanyDayStart,
  runDayEnd,
  sellOffers,
  settleCompanyLogistics,
  settlePortTransfers,
  transactMarketCargo,
  unloadMarketBuyCargo,
} from "./econ.js";
import {
  ECONOMIC_BUILDINGS,
  addBuilding,
  buildingById,
  canPlaceBuilding,
  createCartCarrier,
  createWalkCarrier,
  createPhysicalState,
  depositInventory,
  findBuildingSiteForEntrance,
  goodsUnitWeight,
  hasRoad,
  isPavedRoad,
  keyOf,
  pathLen,
  routeTravelCarrier,
  prunePhysicalHistory,
  stepTravelCarrier,
  stepHaulCarriers,
  stepPortHandling,
} from "./physical.js";
import { nextMulberry32, normalizeSeed } from "./prng.js";
import { createMarketNetwork, marketNetworkSummary } from "./market_network.js";
import { stepCaravanDay, stepCaravanTick } from "./routes.js";

function tread(economy, x, y) {
  const key = keyOf(Math.round(x), Math.round(y));
  economy.traffic[key] = Math.min(2000, (economy.traffic[key] ?? 0) + 1);
}

function stepTo(economy, physical, household, targetX, targetY) {
  const distance = Math.hypot(targetX - household.px, targetY - household.py);
  if (distance < 0.8) return true;
  const roadMultiplier = hasRoad(
    physical,
    Math.round(household.px),
    Math.round(household.py),
  ) ? (isPavedRoad(
    physical,
    Math.round(household.px),
    Math.round(household.py),
  ) ? 1.55 : 1.35) : 1;
  const movement = Math.min(distance, 0.8 * roadMultiplier);
  household.px += (targetX - household.px) / distance * movement;
  household.py += (targetY - household.py) / distance * movement;
  tread(economy, household.px, household.py);
  return false;
}

function tilePosition(position) {
  return { x: Math.round(position.x), y: Math.round(position.y) };
}

function activeHouseholdPorter(household) {
  const porters = household.marketCarrier?.porters ?? [];
  return porters.find((porter) => porter.active && porter.departureDelay <= 1e-9)
    ?? porters.find((porter) => porter.departureDelay <= 1e-9)
    ?? porters[0]
    ?? null;
}

function syncHouseholdToCarrier(economy, household) {
  const porter = activeHouseholdPorter(household);
  if (!porter?.position) return;
  household.px = porter.position.x;
  household.py = porter.position.y;
  tread(economy, household.px, household.py);
}

function distributeManifestAcrossPorters(manifest, porters, direction) {
  const remainingCapacity = new Map(porters.map((porter) => [porter.memberId, porter.capacity]));
  for (const porter of porters) {
    porter.cargo = { direction, manifest: {} };
  }
  for (const [goods, originalQty] of Object.entries(manifest ?? {})) {
    let qty = originalQty;
    const unitWeight = goodsUnitWeight(goods);
    for (const porter of porters) {
      if (qty <= 1e-9) break;
      const room = remainingCapacity.get(porter.memberId) ?? 0;
      const loaded = Math.min(qty, room / unitWeight);
      if (loaded <= 1e-9) continue;
      porter.cargo.manifest[goods] = loaded;
      remainingCapacity.set(porter.memberId, room - loaded * unitWeight);
      qty -= loaded;
    }
    if (qty > 1e-7) {
      throw new Error(`世帯の個人運搬容量を超えました: ${goods} ${qty}`);
    }
  }
  for (const porter of porters) {
    const load = Object.entries(porter.cargo.manifest).reduce(
      (total, [goods, qty]) => total + qty * goodsUnitWeight(goods),
      0,
    );
    porter.peakLoad = Math.max(porter.peakLoad ?? 0, load);
  }
  return porters;
}

function routeHouseholdPorters(physical, porters, start, goal, { returning = false } = {}) {
  for (let index = 0; index < porters.length; index += 1) {
    const porter = porters[index];
    routeTravelCarrier(physical, porter, start, goal);
    // 同期した家族の塊にせず、同じ用事の人も短い間隔で続けざまに出す。
    porter.departureDelay = index * 0.22;
    porter.returning = returning;
  }
  return porters;
}

function stepHouseholdPorters(physical, porters) {
  let allArrived = true;
  for (const porter of porters) {
    if (!porter.active) continue;
    if (porter.departureDelay >= 1) {
      porter.departureDelay -= 1;
      allArrived = false;
      continue;
    }
    const budget = Math.max(0, 1 - porter.departureDelay);
    porter.departureDelay = 0;
    if (!stepTravelCarrier(physical, porter, budget)) allArrived = false;
  }
  return allArrived;
}

function beginAssignedWorkTrip(physical, household) {
  if (!household.members?.length || !Number.isFinite(household.wx) || !Number.isFinite(household.wy)) {
    return null;
  }
  const index = (household.workRotation ?? 0) % household.members.length;
  const member = household.members[index];
  household.workRotation = (index + 1) % household.members.length;
  const porter = createWalkCarrier(physical, { people: 1 });
  porter.memberId = member.id ?? `${household.id}:${index}`;
  porter.memberName = member.name ?? `住民${index + 1}`;
  porter.tier = "worker";
  porter.visualMode = "worker";
  routeTravelCarrier(
    physical,
    porter,
    householdEntrance(physical, household),
    tilePosition({ x: household.wx, y: household.wy }),
  );
  household.workCarrier = porter;
  return porter;
}

function stepAssignedWorkTrip(economy, physical, household) {
  const porter = household.workCarrier ?? beginAssignedWorkTrip(physical, household);
  if (!porter) return true;
  const arrived = stepTravelCarrier(physical, porter);
  household.px = porter.position.x;
  household.py = porter.position.y;
  tread(economy, household.px, household.py);
  return arrived;
}

function recordHouseholdTransport(economy, household) {
  economy.transportStats ??= {};
  for (const porter of household.marketCarrier?.porters ?? []) {
    const row = economy.transportStats[porter.tier] ??= {
      trips: 0,
      load: 0,
      capacity: 0,
      travelTicks: 0,
    };
    row.trips += 1;
    row.load += porter.peakLoad ?? 0;
    row.capacity += porter.capacity;
    row.travelTicks += household.marketTripTicks;
  }
}

function householdTripNeeds(economy, physical, household) {
  const foodDays = householdFoodDays(household);
  const lowCultureGoods = ["tools", "salt", "char"].filter((goods, index) => (
    householdMaterialAmount(physical, household, goods)
      < [P.D_TOOL, P.D_SALT, P.D_CHAR][index] * 4
  ));
  const inputLow = (household.job === "saltworks"
    && productionInputAmount(physical, household, "char") < 2)
    || (household.job === "fisher2"
      && productionInputAmount(physical, household, "fish") < P.Y_FISH * householdMult(household))
    || (household.job === "shepherd"
      && productionInputAmount(physical, household, "wheat")
        + productionInputAmount(physical, household, "veg")
        < P.Y_MEAT * P.FEED_MEAT * householdMult(household))
    || (household.job === "fisher"
      && productionInputAmount(physical, household, "salt") < 1)
    || (
      (household.job === "woodshop" || household.job === "charburner")
      && productionInputAmount(physical, household, "log") < 2
    )
    || (household.job === "smelter" && (
      productionInputAmount(physical, household, "ore") < P.SMELT_ORE
      || productionInputAmount(physical, household, "char")
        + productionInputAmount(physical, household, "coal") < P.SMELT_FUEL
    ))
    || (household.job === "smith" && (
      productionInputAmount(physical, household, "bar") < P.SMITH_BAR
      || productionInputAmount(physical, household, "char")
        + productionInputAmount(physical, household, "coal") < P.SMITH_FUEL
    ))
    || (
      (household.job === "wheat" || household.job === "rapeseed")
      && productionInputAmount(physical, household, "meal") < 1
      && economy.currentDay % 7 === 0
    );
  const inputStopped = (household.job === "saltworks"
    && productionInputAmount(physical, household, "char") < P.SALT_CHAR)
    || (household.job === "fisher2"
      && productionInputAmount(physical, household, "fish") < P.Y_FISH / 30)
    || (household.job === "shepherd"
      && productionInputAmount(physical, household, "wheat")
        + productionInputAmount(physical, household, "veg")
        < P.Y_MEAT * P.FEED_MEAT / 30)
    || (household.job === "woodshop"
      && productionInputAmount(physical, household, "log") < P.LOG_TOOL)
    || (household.job === "charburner"
      && productionInputAmount(physical, household, "log") < P.LOG_CHAR)
    || (household.job === "smelter" && (
      productionInputAmount(physical, household, "ore") < P.SMELT_ORE
      || productionInputAmount(physical, household, "char")
        + productionInputAmount(physical, household, "coal") < P.SMELT_FUEL
    ))
    || (household.job === "smith" && (
      productionInputAmount(physical, household, "bar") < P.SMITH_BAR
      || productionInputAmount(physical, household, "char")
        + productionInputAmount(physical, household, "coal") < P.SMITH_FUEL
    ));
  const buildingNeeds = householdBuildingNeeds(physical, household);
  const capitalGoods = new Set([
    ...Object.keys(buildingNeeds.construction),
    ...Object.keys(buildingNeeds.repair),
  ]);
  const toolNeed = householdWorkToolNeed(household);
  if (
    toolNeed
    && householdMaterialAmount(physical, household, toolNeed.goods) < toolNeed.qty - 1e-9
  ) capitalGoods.add(toolNeed.goods);
  const foodThreshold = ["fisher", "shepherd", "veg"].includes(household.job) ? 1.2 : 3;
  return {
    foodDays,
    foodUrgent: foodDays < foodThreshold,
    lowCultureGoods,
    inputLow,
    inputStopped,
    capitalGoods,
    capitalLow: capitalGoods.size > 0,
  };
}

function routineMarketStatus(economy, household, sellWeight) {
  const day = Math.max(1, economy.currentDay ?? 1);
  const id = Number.isSafeInteger(household.id) ? household.id : 0;
  const scheduledToday = ((day + id) & 1) === 0;
  if (sellWeight <= 1e-9) {
    household.marketBatchWaitSinceDay = null;
    return {
      hasSale: false,
      productionDays: 0,
      scheduledToday,
      sellReady: false,
    };
  }
  if (!Number.isSafeInteger(household.marketBatchWaitSinceDay)) {
    household.marketBatchWaitSinceDay = day;
  }
  const productionDays = Math.max(1, day - household.marketBatchWaitSinceDay + 1);
  const sellReady = productionDays >= P.MARKET_BATCH_DAYS
    && (
      scheduledToday
      || productionDays >= P.MARKET_BATCH_MAX_DAYS
    );
  return { hasSale: true, productionDays, scheduledToday, sellReady };
}

function urgentMarketDemandWeight(economy, physical, household) {
  const needs = householdTripNeeds(economy, physical, household);
  const targets = buyTargets(economy, household, {
    day: Math.max(1, Math.ceil((economy.currentTick ?? 1) / 30)),
    physical,
  });
  const marketId = householdMarketId(household);
  const purchasableWeight = Object.entries(targets).reduce((total, [goods, [wanted, ceiling]]) => {
    const urgent = (needs.foodUrgent && FOODS.includes(goods))
      || needs.lowCultureGoods.includes(goods)
      || (needs.inputLow && isProductionInput(household, goods))
      || needs.capitalGoods.has(goods);
    if (!urgent) return total;
    const stallQty = (economy.stalls[goods] ?? [])
      .filter((stall) => (stall.marketId ?? "main") === marketId && stall.price <= ceiling)
      .reduce((sum, stall) => sum + stall.qty, 0);
    const importQty = marketId === "main"
      ? ((P.IMP[goods] ?? Infinity) <= ceiling
        ? (economy.importStock[goods] ?? 0) + (economy.aidStock?.[goods] ?? 0)
        : economy.aidStock?.[goods] ?? 0)
      : 0;
    const stockPrice = companyStockReleasePrice(economy, goods, { market: true });
    const stockQty = marketId === "main" && stockPrice !== null && stockPrice <= ceiling
      ? economy.marketStock[goods] ?? 0
      : 0;
    const localStockPrice = Math.max(
      0.1,
      (marketPriceBook(economy, marketId)[goods] ?? P.BELIEF0[goods] ?? 2) * 0.95,
    );
    const localStockQty = localStockPrice <= ceiling
      ? economy.marketStockM?.[marketId]?.[goods] ?? 0
      : 0;
    const purchasable = Math.min(
      wanted,
      stallQty + importQty + stockQty + localStockQty,
    );
    return total + purchasable * goodsUnitWeight(goods);
  }, 0);
  // 食料が尽きかけた往復では、一人ぶんの背負い籠だけで帰らない。
  // 市場に買える食料がある限り、最低2日ぶんを運ぶ人数を割り当てる。
  return needs.foodUrgent && purchasableWeight > 1e-9
    ? Math.max(purchasableWeight, householdEat(household) * 2)
    : purchasableWeight;
}

function finishMarketTrip(economy, physical, household, { day }) {
  const returnState = household.marketCarrier.returnState ?? "home";
  unloadMarketBuyCargo(household, physical);
  recordHouseholdTransport(economy, household);
  finishHouseholdCartTrip(economy, household, {
    day,
    assetId: household.marketCarrier.assetId,
    distance: (household.marketCarrier.tripDistance ?? 0)
      + (household.marketCarrier.routeCost ?? 0),
  });
  household.marketCarrier.cargo = null;
  for (const porter of household.marketCarrier.porters ?? []) porter.cargo = null;
  household.marketCarrier = null;
  household.marketTransactionTicks = 0;
  const home = householdEntrance(physical, household);
  household.px = home.x;
  household.py = home.y;
  household.state = returnState;
}

export function findDirectSupplier(economy, physical, buyer, {
  goods,
  wanted,
  ceiling,
  day = economy.currentDay,
} = {}) {
  if (
    !isProductionInput(buyer, goods)
    || !(wanted > 1e-9)
    || !(ceiling > 0)
  ) return null;
  const start = householdEntrance(physical, buyer);
  const marketTicks = marketTripDuration(economy, physical, buyer);
  const useCart = Boolean(buyer.cart);
  const buyerMarket = householdMarketId(buyer);
  const candidates = [];
  for (const seller of economy.households) {
    if (
      seller === buyer
      || seller.state !== "home"
      || householdMarketId(seller) !== buyerMarket
    ) continue;
    const available = sellOffers(economy, seller, { capacityLimit: Infinity })[goods] ?? 0;
    if (available <= 1e-9) continue;
    const goal = householdEntrance(physical, seller);
    const cartDistance = useCart ? pathLen(physical, start, goal, "cart") : Infinity;
    const mode = Number.isFinite(cartDistance) ? "cart" : "walk";
    const oneWayTicks = mode === "cart" ? cartDistance : pathLen(physical, start, goal, "walk");
    if (!Number.isFinite(oneWayTicks)) continue;
    const directTicks = oneWayTicks * 2 + 1;
    if (
      Number.isFinite(marketTicks)
      && directTicks > marketTicks * P.DIRECT_TRADE_MAX_MARKET_RATIO + 1e-9
    ) continue;
    const price = Math.max(
      productionCost(economy, physical, seller, goods, { day }) * 1.05,
      (marketPriceBook(economy, buyerMarket)[goods] ?? ceiling) * 0.95,
    );
    if (!Number.isFinite(price) || price > ceiling + 1e-9) continue;
    const affordable = Math.max(0, (buyer.purse + 30) / price);
    const qty = Math.min(wanted, available, affordable);
    if (qty <= 1e-9) continue;
    candidates.push({
      sellerId: seller.id,
      goods,
      qty,
      price,
      mode,
      oneWayTicks,
      directTicks,
      marketTicks,
      savedTicks: Number.isFinite(marketTicks) ? Math.max(0, marketTicks - directTicks) : 0,
    });
  }
  candidates.sort((left, right) => (
    left.directTicks - right.directTicks
    || left.price - right.price
    || left.sellerId - right.sellerId
  ));
  return candidates[0] ?? null;
}

function directSupplierForTrip(economy, physical, household, day) {
  const targets = buyTargets(economy, household, { day, physical });
  const candidates = Object.entries(targets)
    .filter(([goods]) => isProductionInput(household, goods))
    .map(([goods, [wanted, ceiling]]) => findDirectSupplier(
      economy,
      physical,
      household,
      { goods, wanted, ceiling, day },
    ))
    .filter(Boolean);
  candidates.sort((left, right) => (
    left.directTicks - right.directTicks
    || left.price - right.price
    || left.sellerId - right.sellerId
    || left.goods.localeCompare(right.goods)
  ));
  return candidates[0] ?? null;
}

export function beginDirectSupplyTrip(economy, physical, household, offer) {
  if (household.cargo || household.marketCarrier) {
    throw new Error(`世帯${household.id}は既に物流往復中です`);
  }
  const seller = economy.households.find(({ id }) => id === offer?.sellerId);
  if (!seller) return { started: false, reason: "supplier_missing" };
  const useCart = offer.mode === "cart";
  const availablePlan = householdTransportPlan(household, { useCart });
  const requiredCapacity = Math.max(1, offer.qty * goodsUnitWeight(offer.goods));
  const plan = [];
  let assignedCapacity = 0;
  for (const assignment of availablePlan) {
    if (plan.length > 0 && assignedCapacity + 1e-9 >= requiredCapacity) break;
    plan.push(assignment);
    assignedCapacity += assignment.capacity;
  }
  if (plan.length === 0) return { started: false, reason: "no_porter" };
  const porters = plan.map((assignment) => {
    const porter = assignment.mode === "cart"
      ? createCartCarrier(physical, {
        capacity: assignment.capacity,
        cartKind: assignment.cartKind,
        assetId: assignment.assetId,
      })
      : createWalkCarrier(physical, { people: 1 });
    porter.capacity = assignment.capacity;
    porter.people = 1;
    porter.memberId = assignment.memberId;
    porter.memberName = assignment.memberName;
    porter.tier = assignment.tier;
    porter.visualMode = assignment.tier;
    return porter;
  });
  distributeManifestAcrossPorters({}, porters, "outbound");
  const start = householdEntrance(physical, household);
  routeHouseholdPorters(
    physical,
    porters,
    start,
    householdEntrance(physical, seller),
  );
  const cartPorter = porters.find((porter) => porter.mode === "cart") ?? null;
  household.cargo = { direction: "outbound", manifest: {} };
  household.marketCarrier = {
    mode: cartPorter ? "cart" : "walk",
    capacity: porters.reduce((total, porter) => total + porter.capacity, 0),
    assetId: cartPorter?.assetId ?? null,
    cartKind: cartPorter?.cartKind ?? null,
    porters,
    cargo: household.cargo,
    tripDistance: cartPorter?.routeCost ?? 0,
    routeCost: 0,
    reason: "direct_input",
    destinationKind: "supplier",
    directOffer: { ...offer },
  };
  household.px = start.x;
  household.py = start.y;
  household.lastMarketTripReason = "direct_input";
  household.marketTripTicks = offer.directTicks;
  household.productionMultiplier = (1 - plan.length / Math.max(1, household.members.length))
    + plan.length / Math.max(1, household.members.length)
      * productionMultiplierForTrip(offer.directTicks);
  household.tookMarketTripToday = true;
  household.marketTransactionTicks = 1;
  household.state = porters.every((porter) => porter.routeCost === 0)
    ? "atSupplier"
    : "toSupplier";
  return { started: true, offer, carrier: household.marketCarrier };
}

function transactDirectSupply(economy, physical, household, { day }) {
  const offer = household.marketCarrier.directOffer;
  const seller = economy.households.find(({ id }) => id === offer.sellerId);
  const available = seller
    ? sellOffers(economy, seller, { capacityLimit: Infinity })[offer.goods] ?? 0
    : 0;
  const capacity = household.marketCarrier.capacity / goodsUnitWeight(offer.goods);
  const affordable = Math.max(0, (household.purse + 30) / offer.price);
  const qty = Math.min(offer.qty, available, capacity, affordable);
  const payment = qty * offer.price;
  if (qty > 1e-9) {
    seller.pantry[offer.goods] -= qty;
    seller.purse += payment;
    seller.income30 += payment;
    household.purse -= payment;
  }
  household.cargo = {
    direction: "inbound",
    manifest: qty > 1e-9 ? { [offer.goods]: qty } : {},
  };
  const row = {
    day,
    buyerHouseholdId: household.id,
    sellerHouseholdId: offer.sellerId,
    goods: offer.goods,
    qty,
    price: offer.price,
    directTicks: offer.directTicks,
    marketTicks: offer.marketTicks,
    savedTicks: offer.savedTicks,
  };
  if (qty > 1e-9) {
    household.lastDirectTrade = row;
    economy.directTrades ??= [];
    economy.directTrades.push(row);
    if (economy.directTrades.length > 128) economy.directTrades.shift();
  }
  return row;
}

const ECONOMIC_BUILDING_CAPACITY = Number.MAX_SAFE_INTEGER;

function buildingCaps(...sections) {
  return Object.fromEntries(sections.map((section) => [
    section,
    Object.fromEntries(GOODS.map((goods) => [goods, ECONOMIC_BUILDING_CAPACITY])),
  ]));
}

function householdEntrance(physical, household) {
  return buildingById(physical, household.buildingId)?.entrance
    ?? tilePosition(household);
}

function logisticsEntrance(physical, role, fallback) {
  return buildingById(physical, physical.roleBuildingIds?.[role])?.entrance
    ?? tilePosition(fallback);
}

export function ensureCompanyLogisticsSites(economy, physical) {
  const ensure = (role, type, position, sections, roles = [role]) => {
    let building = buildingById(physical, physical.roleBuildingIds?.[role]);
    const planned = economy.logisticsSites?.[role] ?? {};
    if (building || !economy.logisticsSites?.[role] || !position) return building;
    const entrance = planned.entrance ?? position;
    const origin = Number.isSafeInteger(planned.x) && Number.isSafeInteger(planned.y)
      ? { x: planned.x, y: planned.y }
      : findBuildingSiteForEntrance(physical, type, entrance, {
        definitions: ECONOMIC_BUILDINGS,
        toward: economy.market,
        fixed: type === "market" || type === "port",
      });
    if (!origin) throw new Error(`${role}の実寸フットプリントを配置できません`);
    const placed = addBuilding(physical, type, origin.x, origin.y, {
      definitions: ECONOMIC_BUILDINGS,
      fixed: type === "market" || type === "port",
      requireRoad: false,
      entrance,
      role,
      roles,
      caps: buildingCaps(...sections),
    });
    if (!placed.ok) throw new Error(`${role}の配置不可: ${placed.reason}`);
    building = placed.building;
    if (role === "market") {
      for (const goods of GOODS) {
        const stalls = economy.stalls[goods]
          .reduce((total, stall) => total + stall.qty, 0);
        if (stalls > 0) depositInventory(building, "outbound", goods, stalls);
        const stock = economy.marketStock[goods] ?? 0;
        if (stock > 0) depositInventory(building, "inbound", goods, stock);
      }
    } else if (role === "warehouse") {
      for (const [goods, qty] of Object.entries(economy.stock)) {
        if (qty > 0) depositInventory(building, "storage", goods, qty);
      }
    }
    return building;
  };
  const market = ensure("market", "market", economy.market, ["inbound", "outbound", "pickup"]);
  const warehouse = ensure(
    "warehouse",
    "warehouse",
    economy.warehouse ?? economy.market,
    ["storage"],
  );
  const port = ensure(
    "port",
    "port",
    economy.port,
    ["inbound", "outbound"],
    ["port", "trade_port"],
  );
  return { market, warehouse, port };
}

const PLAYER_LOGISTICS_BUILDINGS = Object.freeze({
  market: Object.freeze({ role: "market", sections: Object.freeze(["inbound", "outbound", "pickup"]) }),
  warehouse: Object.freeze({ role: "warehouse", sections: Object.freeze(["storage"]) }),
});

export function placeCompanyLogisticsBuilding(
  economy,
  physical,
  type,
  entrance,
  { day, buildingX = null, buildingY = null } = {},
) {
  const spec = PLAYER_LOGISTICS_BUILDINGS[type];
  if (!spec) return { ok: false, reason: "unsupported-logistics-building" };
  if (buildingById(physical, physical.roleBuildingIds?.[spec.role])) {
    return { ok: false, reason: "logistics-role-exists" };
  }
  if (!Number.isSafeInteger(entrance?.x) || !Number.isSafeInteger(entrance?.y)) {
    return { ok: false, reason: "invalid-entrance" };
  }
  const preferred = Number.isSafeInteger(buildingX) && Number.isSafeInteger(buildingY)
    ? { x: buildingX, y: buildingY }
    : null;
  const toward = buildingById(physical, physical.roleBuildingIds?.market)?.entrance
    ?? buildingById(physical, physical.roleBuildingIds?.port)?.entrance
    ?? economy.market;
  const options = {
    definitions: ECONOMIC_BUILDINGS,
    entrance: { ...entrance },
    requireRoad: false,
  };
  const origin = preferred ?? findBuildingSiteForEntrance(physical, type, entrance, {
    definitions: ECONOMIC_BUILDINGS,
    toward,
  });
  if (!origin) return { ok: false, reason: "no-building-site" };
  const placement = canPlaceBuilding(physical, type, origin.x, origin.y, options);
  if (!placement.ok) return placement;
  if (!fundCompanyBuilding(economy, { type, day })) {
    return { ok: false, reason: "insufficient-funds" };
  }
  const placed = addBuilding(physical, type, origin.x, origin.y, {
    ...options,
    role: spec.role,
    roles: [spec.role],
    caps: buildingCaps(...spec.sections),
  });
  if (!placed.ok) throw new Error(`${type}の検証済み配置に失敗しました: ${placed.reason}`);
  const site = { x: origin.x, y: origin.y, entrance: { ...entrance } };
  (economy.logisticsSites ??= {})[spec.role] = structuredClone(site);
  if (spec.role === "market") economy.market = { ...entrance };
  if (spec.role === "warehouse") economy.warehouse = { ...entrance };
  return placed;
}

export function forgetCompanyLogisticsBuilding(economy, building) {
  const roles = new Set(building?.roles ?? []);
  if (roles.has("market")) {
    delete economy.logisticsSites?.market;
    economy.market = economy.port ? { ...economy.port } : { x: 0, y: 0 };
  }
  if (roles.has("warehouse")) {
    delete economy.logisticsSites?.warehouse;
    economy.warehouse = null;
  }
}

export function ensureHouseholdInputSites(economy, physical) {
  for (const household of economy.households) {
    let building = buildingById(physical, household.buildingId);
    if (!building) {
      const entrance = tilePosition(household);
      const origin = findBuildingSiteForEntrance(physical, household.job, entrance, {
        definitions: ECONOMIC_BUILDINGS,
        toward: economy.market,
      });
      if (!origin) throw new Error(`世帯${household.id}の実寸フットプリントを配置できません`);
      const placed = addBuilding(physical, household.job, origin.x, origin.y, {
        definitions: ECONOMIC_BUILDINGS,
        requireRoad: false,
        entrance,
        ownerHouseholdId: household.id,
        caps: buildingCaps("input", "construction", "repair"),
      });
      if (!placed.ok) throw new Error(`世帯${household.id}の配置不可: ${placed.reason}`);
      building = placed.building;
      household.buildingId = building.id;
      for (const goods of GOODS) {
        if (!isProductionInput(household, goods)) continue;
        const qty = household.pantry[goods];
        if (qty <= 1e-9) continue;
        household.pantry[goods] = 0;
        depositInventory(building, "input", goods, qty);
      }
    }
    building.inventory.construction ??= {};
    building.inventory.repair ??= {};
    building.caps.construction ??= buildingCaps("construction").construction;
    building.caps.repair ??= buildingCaps("repair").repair;
    building.condition = Number.isFinite(building.condition) ? building.condition : 100;
    building.conditionStatus ??= "good";
    building.constructionRequired ??= {};
    building.ownerHouseholdId = household.id;
  }
}

export function beginMarketTrip(
  economy,
  physical,
  household,
  { reason = "unscheduled" } = {},
) {
  if (household.cargo || household.marketCarrier) {
    throw new Error(`世帯${household.id}は既に市場往復中です`);
  }
  const tripTicks = marketTripDuration(economy, physical, household);
  if (!Number.isFinite(tripTicks)) return { started: false, tripTicks };

  const useCart = Boolean(household.cart)
    && Number.isFinite(marketPathLength(economy, physical, household, "cart"));
  loadMarketSellCargo(economy, household, { useCart });
  const outboundWeight = Object.entries(household.cargo.manifest).reduce(
    (total, [goods, qty]) => total + qty * goodsUnitWeight(goods),
    0,
  );
  if (outboundWeight > 1e-9) household.marketBatchWaitSinceDay = null;
  const availablePlan = householdTransportPlan(household, { useCart });
  const intendedBuyWeight = urgentMarketDemandWeight(economy, physical, household);
  const requiredCapacity = Math.max(outboundWeight, intendedBuyWeight, 1);
  const plan = [];
  let assignedCapacity = 0;
  for (const assignment of availablePlan) {
    if (plan.length > 0 && assignedCapacity + 1e-9 >= requiredCapacity) break;
    plan.push(assignment);
    assignedCapacity += assignment.capacity;
  }
  const porters = plan.map((assignment) => {
    const porter = assignment.mode === "cart"
      ? createCartCarrier(physical, {
        capacity: assignment.capacity,
        cartKind: assignment.cartKind,
        assetId: assignment.assetId,
      })
      : createWalkCarrier(physical, { people: 1 });
    porter.capacity = assignment.capacity;
    porter.people = 1;
    porter.memberId = assignment.memberId;
    porter.memberName = assignment.memberName;
    porter.tier = assignment.tier;
    porter.visualMode = assignment.tier;
    return porter;
  });
  distributeManifestAcrossPorters(household.cargo.manifest, porters, "outbound");
  const start = household.state === "home" || household.state === "building"
    ? householdEntrance(physical, household)
    : Number.isFinite(household.wx) && Number.isFinite(household.wy)
      ? tilePosition({ x: household.wx, y: household.wy })
      : tilePosition({ x: household.px, y: household.py });
  const marketEntrance = householdMarketEntrance(economy, physical, household);
  routeHouseholdPorters(
    physical,
    porters,
    start,
    marketEntrance,
  );
  const cartPorter = porters.find((porter) => porter.mode === "cart") ?? null;
  const carrier = {
    mode: cartPorter ? "cart" : "walk",
    capacity: porters.reduce((total, porter) => total + porter.capacity, 0),
    assetId: cartPorter?.assetId ?? null,
    cartKind: cartPorter?.cartKind ?? null,
    porters,
    cargo: household.cargo,
    tripDistance: cartPorter?.routeCost ?? 0,
    routeCost: 0,
    marketId: householdMarketId(household),
    marketEntrance: { ...marketEntrance },
    reason,
    returnState: household.state,
  };
  household.px = start.x;
  household.py = start.y;
  household.marketCarrier = carrier;
  household.lastMarketDepartureDay = Math.max(1, economy.currentDay ?? 1);
  household.lastMarketTripReason = reason;
  household.marketTripTicks = tripTicks;
  const memberCount = Math.max(1, household.members.length);
  const travellerShare = plan.length / memberCount;
  household.productionMultiplier = (1 - travellerShare)
    + travellerShare * productionMultiplierForTrip(tripTicks);
  household.tookMarketTripToday = true;
  household.marketTransactionTicks = 2;
  household.state = porters.every((porter) => porter.routeCost === 0) ? "atMarket" : "toMarket";
  return { started: true, tripTicks, carrier };
}

export function stepMarketTrip(economy, physical, household, { day, random }) {
  if (household.state === "toSupplier") {
    if (stepHouseholdPorters(physical, household.marketCarrier.porters)) {
      const seller = economy.households.find(
        ({ id }) => id === household.marketCarrier.directOffer.sellerId,
      );
      const destination = seller
        ? householdEntrance(physical, seller)
        : householdEntrance(physical, household);
      household.px = destination.x;
      household.py = destination.y;
      household.state = "atSupplier";
    } else syncHouseholdToCarrier(economy, household);
    return false;
  }
  if (household.state === "atSupplier") {
    household.marketTransactionTicks -= 1;
    if (household.marketTransactionTicks > 0) return false;
    const seller = economy.households.find(
      ({ id }) => id === household.marketCarrier.directOffer.sellerId,
    );
    const supplierEntrance = seller
      ? householdEntrance(physical, seller)
      : tilePosition({ x: household.px, y: household.py });
    transactDirectSupply(economy, physical, household, { day });
    household.marketCarrier.cargo = household.cargo;
    distributeManifestAcrossPorters(
      household.cargo.manifest,
      household.marketCarrier.porters,
      "inbound",
    );
    routeHouseholdPorters(
      physical,
      household.marketCarrier.porters,
      supplierEntrance,
      householdEntrance(physical, household),
      { returning: true },
    );
    const cartPorter = household.marketCarrier.porters.find((porter) => porter.mode === "cart");
    household.marketCarrier.routeCost = cartPorter?.routeCost ?? 0;
    if (household.marketCarrier.porters.every((porter) => porter.routeCost === 0)) {
      finishMarketTrip(economy, physical, household, { day });
      return true;
    }
    household.state = "toHome";
    return false;
  }
  if (household.state === "toMarket") {
    if (stepHouseholdPorters(physical, household.marketCarrier.porters)) {
      const market = household.marketCarrier.marketEntrance
        ?? householdMarketEntrance(economy, physical, household);
      household.px = market.x;
      household.py = market.y;
      household.state = "atMarket";
    } else syncHouseholdToCarrier(economy, household);
    return false;
  }
  if (household.state === "atMarket") {
    household.marketTransactionTicks -= 1;
    if (household.marketTransactionTicks > 0) return false;
    transactMarketCargo(economy, physical, household, { day, random });
    household.marketCarrier.cargo = household.cargo;
    const inboundManifest = { ...household.cargo.manifest };
    for (const [goods, qty] of Object.entries(household.cargo.returnManifest ?? {})) {
      inboundManifest[goods] = (inboundManifest[goods] ?? 0) + qty;
    }
    distributeManifestAcrossPorters(
      inboundManifest,
      household.marketCarrier.porters,
      "inbound",
    );
    routeHouseholdPorters(
      physical,
      household.marketCarrier.porters,
      household.marketCarrier.marketEntrance
        ?? householdMarketEntrance(economy, physical, household),
      householdEntrance(physical, household),
      { returning: true },
    );
    const cartPorter = household.marketCarrier.porters.find((porter) => porter.mode === "cart");
    household.marketCarrier.routeCost = cartPorter?.routeCost ?? 0;
    if (household.marketCarrier.porters.every((porter) => porter.routeCost === 0)) {
      finishMarketTrip(economy, physical, household, { day });
      return true;
    }
    household.state = "toHome";
    return false;
  }
  if (household.state === "toHome") {
    if (stepHouseholdPorters(physical, household.marketCarrier.porters)) {
      finishMarketTrip(economy, physical, household, { day });
      return true;
    }
    syncHouseholdToCarrier(economy, household);
    return false;
  }
  throw new Error(`市場往復でない状態です: ${household.state}`);
}

export const HOUSEHOLD_DEPARTURE_WINDOW = Object.freeze({ start: 1, end: 7 });

export function householdDepartureTime(household) {
  const id = household?.id;
  if (Number.isSafeInteger(id)) {
    const width = HOUSEHOLD_DEPARTURE_WINDOW.end - HOUSEHOLD_DEPARTURE_WINDOW.start + 1;
    return HOUSEHOLD_DEPARTURE_WINDOW.start + ((id % width) + width) % width;
  }
  const source = String(id ?? "");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const width = HOUSEHOLD_DEPARTURE_WINDOW.end - HOUSEHOLD_DEPARTURE_WINDOW.start + 1;
  return HOUSEHOLD_DEPARTURE_WINDOW.start + (hash >>> 0) % width;
}

export function decideHouseholdTrips(economy, physical, { timeOfDay = null } = {}) {
  if (!buildingById(physical, physical.roleBuildingIds?.market)) return;
  for (const household of economy.households) {
    if (timeOfDay !== null && householdDepartureTime(household) !== timeOfDay) continue;
    if (timeOfDay !== null && household.tookMarketTripToday) continue;
    if (household.state !== "home" && household.state !== "building") continue;
    const needs = householdTripNeeds(economy, physical, household);
    const offers = sellOffers(economy, household);
    const sellWeight = Object.entries(offers).reduce(
      (total, [goods, qty]) => total + qty * goodsUnitWeight(goods),
      0,
    );
    const routine = routineMarketStatus(economy, household, sellWeight);
    const day = Math.max(1, economy.currentDay ?? 1);
    const daysSinceMarket = Number.isSafeInteger(household.lastMarketDepartureDay)
      ? Math.max(0, day - household.lastMarketDepartureDay)
      : Infinity;
    const cultureReady = needs.lowCultureGoods.length > 0
      && household.purse > 15
      && daysSinceMarket >= P.MARKET_CULTURE_INTERVAL_DAYS
      && routine.scheduledToday;
    const inputRestockReady = needs.inputLow
      && household.purse > -20
      && daysSinceMarket >= P.MARKET_BATCH_DAYS
      && routine.scheduledToday;
    const capitalRestockReady = needs.capitalLow
      && household.purse > -20
      && daysSinceMarket >= 1;
    const work = household.state === "home"
      ? assignNeedyWork(economy, physical, household)
      : null;
    if (work) {
      beginAssignedWorkTrip(physical, household);
      household.productionMultiplier = Math.max(
        0,
        (household.members.length - 1) / Math.max(1, household.members.length),
      );
      continue;
    }
    const reason = capitalRestockReady
      ? "building_materials"
      : needs.foodUrgent && household.purse > 2
      ? "food_urgent"
      : needs.inputStopped && household.purse > -20
        ? "input_urgent"
        : routine.sellReady
          ? "routine_batch"
          : inputRestockReady
            ? "input_restocks"
            : cultureReady
              ? "culture_restocks"
              : null;
    if (!reason) continue;
    if (reason === "input_urgent" || reason === "input_restocks") {
      const directSupplier = directSupplierForTrip(economy, physical, household, day);
      if (directSupplier) {
        const trip = beginDirectSupplyTrip(economy, physical, household, directSupplier);
        if (trip.started) continue;
      }
    }
    const trip = beginMarketTrip(economy, physical, household, { reason });
    if (trip.started && routine.hasSale) household.marketBatchWaitSinceDay = null;
  }
}

export function createWorld({
  seed = 1,
  initialCompanyMoney = P.TREASURY0,
  physicalState = null,
  market = null,
  warehouse = null,
  port = null,
  logisticsSites = null,
  stateSnapshot = null,
  marketNetwork = null,
} = {}) {
  const restored = stateSnapshot ? structuredClone(stateSnapshot) : null;
  if (restored && (
    !Number.isSafeInteger(restored.day)
    || !Number.isSafeInteger(restored.tick)
    || !restored.physical
    || !restored.economy
  )) throw new TypeError("保存された島の状態が不正です");
  const normalizedSeed = normalizeSeed(restored?.seed ?? seed);
  const physical = restored?.physical ?? physicalState ?? createPhysicalState();
  const economy = restored?.economy ?? createEconomicState({ initialCompanyMoney });
  const legacyGlobalPaving = economy.paved === true && physical.pavedRoads === undefined;
  physical.pavedRoads ??= {};
  // 旧セーブの全島一括舗装を、同じ見た目と移動性能を保ったままセル台帳へ移す。
  if (economy.paved === true && Object.keys(physical.pavedRoads).length === 0) {
    for (const roadKey of Object.keys(physical.roads ?? {})) physical.pavedRoads[roadKey] = true;
  }
  // 旧paveBoughtは工事場在庫でなく、完成までの累積消費量だった。
  if (legacyGlobalPaving) economy.paveBought = 0;
  if (!restored) {
    const marketPosition = market ? { ...market } : { x: 8, y: 15 };
    const warehousePosition = warehouse ? { ...warehouse } : { x: 10, y: 15 };
    economy.market = marketPosition;
    economy.warehouse = logisticsSites && !logisticsSites.warehouse && !warehouse
      ? null
      : warehousePosition;
    if (port) economy.port = { ...port };
    economy.logisticsSites = logisticsSites
      ? structuredClone(logisticsSites)
      : {
        market: { entrance: { ...marketPosition } },
        warehouse: { entrance: { ...warehousePosition } },
        ...(port ? { port: { entrance: { ...port } } } : {}),
      };
  }
  const state = restored ?? {
    day: 0,
    tick: 0,
    seed: normalizedSeed,
    rngState: normalizedSeed,
    physical,
    economy,
    marketNetwork: createMarketNetwork({
      markets: marketNetwork?.markets ?? [{ id: "main", name: "本市場", entrance: economy.market }],
      hysteresis: marketNetwork?.hysteresis,
    }),
  };
  state.marketNetwork ??= createMarketNetwork({
    markets: [{ id: "main", name: "本市場", entrance: economy.market }],
  });
  state.seed = normalizedSeed;
  state.rngState = normalizeSeed(state.rngState ?? normalizedSeed);
  if (!restored) initializeNaturalResources(economy, physical);

  function random() {
    const result = nextMulberry32(state.rngState);
    state.rngState = result.state;
    return result.value;
  }

  function tickOnce() {
    state.tick += 1;
    economy.currentTick = state.tick;
    const timeOfDay = state.tick % 30;
    if (timeOfDay === 1) {
      state.day += 1;
      economy.grove = Object.values(economy.natural.wood).reduce(
        (total, stock) => total + stock,
        0,
      );
      ensureCompanyLogisticsSites(economy, physical);
      ensureHouseholdInputSites(economy, physical);
      if ((state.marketNetwork.markets?.length ?? 0) > 1) {
        state.marketNetwork = marketNetworkSummary(physical, economy, state.marketNetwork);
      }
      ageMarketStalls(economy, { day: state.day, physical });
      runCompanyDayStart(economy, { day: state.day, random, physical });
      stepCaravanDay(economy, physical, { day: state.day });
      for (const household of economy.households) {
        household.productionToday = {};
        household.marketOneWayTicks = marketPathLength(economy, physical, household);
        const activePorters = (household.marketCarrier?.porters?.length ?? 0)
          + Number(Boolean(household.workCarrier));
        household.productionMultiplier = household.state === "home"
          ? 1
          : activePorters > 0
            ? Math.max(0, (household.members.length - activePorters)
              / Math.max(1, household.members.length))
            : 0;
        household.tookMarketTripToday = household.marketCarrier !== null;
      }
    }

    // 隊商は同じ道路上を実際に進む。到着在庫はこのtickの住民取引から買える。
    stepCaravanTick(economy, physical, { day: state.day });

    if (
      timeOfDay >= HOUSEHOLD_DEPARTURE_WINDOW.start
      && timeOfDay <= HOUSEHOLD_DEPARTURE_WINDOW.end
    ) {
      decideHouseholdTrips(economy, physical, { timeOfDay });
    }

    for (const household of economy.households) {
      if (household.state === "arriving") {
        if (stepTo(economy, physical, household, household.x, household.y)) {
          household.state = "building";
          household.buildDays = 10;
          recordEconomyEvent(
            economy,
            state.day,
            `${household.job}#${household.id} 入居——普請開始`,
          );
        }
      } else if (household.state === "building") {
        // 建築日数はdayStartで減算する。
      } else if (
        household.state === "toMarket"
        || household.state === "atMarket"
        || household.state === "toSupplier"
        || household.state === "atSupplier"
        || (household.state === "toHome" && household.marketCarrier)
      ) {
        if (!household.marketCarrier) {
          const trip = beginMarketTrip(economy, physical, household, {
            reason: "work_return",
          });
          if (!trip.started && household.state !== "home") household.state = "toHome";
        }
        if (household.marketCarrier) {
          stepMarketTrip(economy, physical, household, { day: state.day, random });
        }
      } else if (household.state === "toWork") {
        if (stepAssignedWorkTrip(economy, physical, household)) {
          household.workCarrier = null;
          completeAssignedWork(economy, physical, household, { day: state.day });
        }
      } else if (household.state === "toHome") {
        if (stepTo(economy, physical, household, household.x, household.y)) household.state = "home";
      }

      if (
        household.state === "home"
        || household.tookMarketTripToday
        || Boolean(household.workCarrier)
      ) {
        producePrimaryTick(economy, physical, household, {
          day: state.day,
          fraction: (household.productionMultiplier ?? 1) / 30,
          endOfDay: timeOfDay === 29,
        });
      }
    }

    if (timeOfDay === 29) {
      runDayEnd(economy, physical, { day: state.day, random });
      finalizeHouseholdProductionDay(economy, { day: state.day });
    }
    stepHaulCarriers(state.physical, 1);
    settleCompanyLogistics(state.economy, state.physical, { day: state.day });
    const transfers = stepPortHandling(state.physical, 1);
    settlePortTransfers(state.economy, state.physical, { day: state.day, transfers });
    pruneEconomyHistory(state.economy);
    prunePhysicalHistory(state.physical);
    return state;
  }

  return {
    state,
    random,
    tickOnce,
    step() {
      for (let tick = 0; tick < 30; tick += 1) {
        tickOnce();
      }
      return state;
    },
  };
}
