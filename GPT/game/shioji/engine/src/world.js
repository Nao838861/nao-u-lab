import {
  FOODS,
  P,
  ageMarketStalls,
  assignNeedyWork,
  completeAssignedWork,
  createEconomicState,
  initializeNaturalResources,
  loadMarketSellCargo,
  marketTripCost,
  marketTripDuration,
  producePrimaryTick,
  productionMultiplierForTrip,
  runCompanyDayStart,
  runDayEnd,
  sellOffers,
  transactMarketCargo,
  unloadMarketBuyCargo,
} from "./econ.js";
import {
  createWalkCarrier,
  createPhysicalState,
  hasRoad,
  keyOf,
  routeTravelCarrier,
  stepTravelCarrier,
  stepHaulCarriers,
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

function finishMarketTrip(household) {
  unloadMarketBuyCargo(household);
  household.marketCarrier.cargo = null;
  household.marketCarrier = null;
  household.marketTransactionTicks = 0;
  household.px = household.x;
  household.py = household.y;
  household.state = "home";
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
    ? tilePosition(household)
    : Number.isFinite(household.wx) && Number.isFinite(household.wy)
      ? tilePosition({ x: household.wx, y: household.wy })
      : tilePosition({ x: household.px, y: household.py });
  routeTravelCarrier(
    physical,
    carrier,
    start,
    tilePosition(economy.market),
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
      household.px = economy.market.x;
      household.py = economy.market.y;
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
      tilePosition(economy.market),
      tilePosition(household),
    );
    if (household.marketCarrier.routeCost === 0) {
      finishMarketTrip(household);
      return true;
    }
    household.state = "toHome";
    return false;
  }
  if (household.state === "toHome") {
    if (stepTravelCarrier(physical, household.marketCarrier)) {
      finishMarketTrip(household);
      return true;
    }
    syncHouseholdToCarrier(economy, household);
    return false;
  }
  throw new Error(`市場往復でない状態です: ${household.state}`);
}

export function decideHouseholdTrips(economy, physical) {
  for (const household of economy.households) {
    if (household.state !== "home") continue;
    const foodDays = FOODS.reduce(
      (total, goods) => total + household.pantry[goods],
      0,
    ) / P.EAT;
    const offers = sellOffers(economy, household);
    const sellQuantity = Object.values(offers).reduce((total, qty) => total + qty, 0);
    const lowCulture = ["tools", "salt", "char"].some((goods, index) => (
      household.pantry[goods] < [P.D_TOOL, P.D_SALT, P.D_CHAR][index] * 4
    ));
    const inputLow = (household.job === "saltworks" && household.pantry.char < 2)
      || (household.job === "fisher" && household.pantry.salt < 1)
      || (
        (household.job === "woodshop" || household.job === "charburner")
        && household.pantry.log < 2
      )
      || (
        (household.job === "wheat" || household.job === "rapeseed")
        && household.pantry.meal < 1
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
  port = null,
} = {}) {
  const normalizedSeed = normalizeSeed(seed);
  const physical = physicalState ?? createPhysicalState();
  const economy = createEconomicState({ initialCompanyMoney });
  if (market) economy.market = { ...market };
  if (port) economy.port = { ...port };
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
    const timeOfDay = state.tick % 30;
    if (timeOfDay === 1) {
      state.day += 1;
      economy.grove = Object.values(economy.natural.wood).reduce(
        (total, stock) => total + stock,
        0,
      );
      ageMarketStalls(economy, { day: state.day });
      runCompanyDayStart(economy, { day: state.day, random });
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
  }

  return {
    state,
    random,
    tickOnce,
    step() {
      stepHaulCarriers(state.physical, 30);
      for (let tick = 0; tick < 30; tick += 1) tickOnce();
      return state;
    },
  };
}
