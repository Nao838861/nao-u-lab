import {
  FOODS,
  GOODS,
  P,
  ageMarketStalls,
  assignNeedyWork,
  completeAssignedWork,
  createEconomicState,
  fundCompanyBuilding,
  initializeNaturalResources,
  isProductionInput,
  householdMaterialAmount,
  loadMarketSellCargo,
  marketTripCost,
  marketTripDuration,
  producePrimaryTick,
  productionInputAmount,
  productionMultiplierForTrip,
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
  createWalkCarrier,
  createPhysicalState,
  depositInventory,
  findBuildingSiteForEntrance,
  hasRoad,
  keyOf,
  routeTravelCarrier,
  stepTravelCarrier,
  stepHaulCarriers,
  stepPortHandling,
} from "./physical.js";
import { nextMulberry32, normalizeSeed } from "./prng.js";

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
  ) ? (economy.paved ? 1.55 : 1.35) : 1;
  const movement = Math.min(distance, 0.8 * roadMultiplier);
  household.px += (targetX - household.px) / distance * movement;
  household.py += (targetY - household.py) / distance * movement;
  tread(economy, household.px, household.py);
  return false;
}

function tilePosition(position) {
  return { x: Math.round(position.x), y: Math.round(position.y) };
}

function syncHouseholdToCarrier(economy, household) {
  household.px = household.marketCarrier.position.x;
  household.py = household.marketCarrier.position.y;
  tread(economy, household.px, household.py);
}

function finishMarketTrip(physical, household) {
  unloadMarketBuyCargo(household, physical);
  household.marketCarrier.cargo = null;
  household.marketCarrier = null;
  household.marketTransactionTicks = 0;
  const home = householdEntrance(physical, household);
  household.px = home.x;
  household.py = home.y;
  household.state = "home";
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
        caps: buildingCaps("input"),
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
    building.ownerHouseholdId = household.id;
  }
}

export function beginMarketTrip(economy, physical, household) {
  if (household.cargo || household.marketCarrier) {
    throw new Error(`世帯${household.id}は既に市場往復中です`);
  }
  const tripTicks = marketTripDuration(economy, physical, household);
  if (tripTicks > 30) return { started: false, tripTicks };

  loadMarketSellCargo(economy, household);
  const carrier = createWalkCarrier(physical, { people: household.members.length });
  carrier.cargo = household.cargo;
  const start = household.state === "home"
    ? householdEntrance(physical, household)
    : Number.isFinite(household.wx) && Number.isFinite(household.wy)
      ? tilePosition({ x: household.wx, y: household.wy })
      : tilePosition({ x: household.px, y: household.py });
  routeTravelCarrier(
    physical,
    carrier,
    start,
    logisticsEntrance(physical, "market", economy.market),
  );
  household.px = start.x;
  household.py = start.y;
  household.marketCarrier = carrier;
  household.marketTripTicks = tripTicks;
  household.productionMultiplier = productionMultiplierForTrip(tripTicks);
  household.tookMarketTripToday = true;
  household.marketTransactionTicks = 2;
  household.state = carrier.routeCost === 0 ? "atMarket" : "toMarket";
  return { started: true, tripTicks, carrier };
}

export function stepMarketTrip(economy, physical, household, { day, random }) {
  if (household.state === "toMarket") {
    if (stepTravelCarrier(physical, household.marketCarrier)) {
      const market = logisticsEntrance(physical, "market", economy.market);
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
    routeTravelCarrier(
      physical,
      household.marketCarrier,
      logisticsEntrance(physical, "market", economy.market),
      householdEntrance(physical, household),
    );
    if (household.marketCarrier.routeCost === 0) {
      finishMarketTrip(physical, household);
      return true;
    }
    household.state = "toHome";
    return false;
  }
  if (household.state === "toHome") {
    if (stepTravelCarrier(physical, household.marketCarrier)) {
      finishMarketTrip(physical, household);
      return true;
    }
    syncHouseholdToCarrier(economy, household);
    return false;
  }
  throw new Error(`市場往復でない状態です: ${household.state}`);
}

export function decideHouseholdTrips(economy, physical) {
  if (!buildingById(physical, physical.roleBuildingIds?.market)) return;
  for (const household of economy.households) {
    if (household.state !== "home") continue;
    const foodDays = FOODS.reduce(
      (total, goods) => total + household.pantry[goods],
      0,
    ) / P.EAT;
    const offers = sellOffers(economy, household);
    const sellQuantity = Object.values(offers).reduce((total, qty) => total + qty, 0);
    const lowCulture = ["tools", "salt", "char"].some((goods, index) => (
      householdMaterialAmount(physical, household, goods)
        < [P.D_TOOL, P.D_SALT, P.D_CHAR][index] * 4
    ));
    const inputLow = (household.job === "saltworks"
      && productionInputAmount(physical, household, "char") < 2)
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
    const foodThreshold = ["fisher", "shepherd", "veg"].includes(household.job) ? 1.2 : 3;
    const work = assignNeedyWork(economy, physical, household);
    if (work) continue;
    const tripCost = marketTripCost(economy, physical, household);
    if (
      (offers.fish ?? 0) > 0
      || sellQuantity >= tripCost
      || (foodDays < foodThreshold && household.purse > 2)
      || (lowCulture && household.purse > 15)
      || (inputLow && household.purse > -20)
    ) beginMarketTrip(economy, physical, household);
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
} = {}) {
  const normalizedSeed = normalizeSeed(seed);
  const physical = physicalState ?? createPhysicalState();
  const economy = createEconomicState({ initialCompanyMoney });
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
  const state = {
    day: 0,
    tick: 0,
    seed: normalizedSeed,
    rngState: normalizedSeed,
    physical,
    economy,
  };
  initializeNaturalResources(economy, physical);

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
      ageMarketStalls(economy, { day: state.day, physical });
      runCompanyDayStart(economy, { day: state.day, random, physical });
      for (const household of economy.households) {
        household.productionMultiplier = household.state === "home" ? 1 : 0;
        household.tookMarketTripToday = household.marketCarrier !== null;
      }
      decideHouseholdTrips(economy, physical);
    }

    for (const household of economy.households) {
      if (household.state === "arriving") {
        if (stepTo(economy, physical, household, household.x, household.y)) {
          household.state = "building";
          household.buildDays = 10;
          economy.events.push([state.day, `${household.job}#${household.id} 入居——普請開始`]);
          if (economy.events.length > 400) economy.events.shift();
        }
      } else if (household.state === "building") {
        // 建築日数はdayStartで減算する。
      } else if (
        household.state === "toMarket"
        || household.state === "atMarket"
        || (household.state === "toHome" && household.marketCarrier)
      ) {
        if (!household.marketCarrier) {
          const trip = beginMarketTrip(economy, physical, household);
          if (!trip.started && household.state !== "home") household.state = "toHome";
        }
        if (household.marketCarrier) {
          stepMarketTrip(economy, physical, household, { day: state.day, random });
        }
      } else if (household.state === "toWork") {
        if (stepTo(economy, physical, household, household.wx, household.wy)) {
          completeAssignedWork(economy, physical, household, { day: state.day });
        }
      } else if (household.state === "toHome") {
        if (stepTo(economy, physical, household, household.x, household.y)) household.state = "home";
      }

      if (household.state === "home" || household.tookMarketTripToday) {
        producePrimaryTick(economy, physical, household, {
          day: state.day,
          fraction: (household.productionMultiplier ?? 1) / 30,
          endOfDay: timeOfDay === 29,
        });
      }
    }

    if (timeOfDay === 29) {
      runDayEnd(economy, physical, { day: state.day, random });
    }
    stepHaulCarriers(state.physical, 1);
    settleCompanyLogistics(state.economy, state.physical, { day: state.day });
    const transfers = stepPortHandling(state.physical, 1);
    settlePortTransfers(state.economy, state.physical, { day: state.day, transfers });
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
