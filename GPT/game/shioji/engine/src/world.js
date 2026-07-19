import {
  FOODS,
  P,
  ageMarketStalls,
  assignNeedyWork,
  completeAssignedWork,
  createEconomicState,
  householdHaul,
  initializeNaturalResources,
  producePrimaryTick,
  runCompanyDayStart,
  runDayEnd,
  sellOffers,
  transactAtMarket,
} from "./econ.js";
import {
  createPhysicalState,
  hasRoad,
  keyOf,
  stepHaulCarriers,
} from "./physical.js";
import { nextMulberry32, normalizeSeed } from "./prng.js";

const FLOW_DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, -1], [1, -1], [-1, 1],
];

function terrainKind(physical, x, y) {
  if (x < 0 || y < 0 || x >= physical.width || y >= physical.height) return "water";
  const tile = physical.terrain[y][x];
  return typeof tile === "string" ? tile : tile.kind;
}

function abstractTileCost(economy, physical, x, y) {
  if (terrainKind(physical, x, y) === "water") return Infinity;
  if (hasRoad(physical, x, y)) return economy.paved ? P.PAVE_ROAD_F : 0.6;
  if ((economy.traffic[keyOf(x, y)] ?? 0) > 400) return 0.85;
  return terrainKind(physical, x, y) === "forest" ? 1.4 : 1;
}

function buildMarketFlow(economy, physical) {
  const distances = new Float32Array(physical.width * physical.height);
  distances.fill(1e9);
  const marketX = Math.round(economy.market.x);
  const marketY = Math.round(economy.market.y);
  if (
    marketX < 0 || marketY < 0
    || marketX >= physical.width || marketY >= physical.height
  ) return distances;
  distances[marketY * physical.width + marketX] = 0;
  const queue = [[marketX, marketY]];
  while (queue.length > 0) {
    queue.sort((a, b) => (
      distances[a[1] * physical.width + a[0]]
      - distances[b[1] * physical.width + b[0]]
    ));
    const [x, y] = queue.shift();
    const current = distances[y * physical.width + x];
    for (const [offsetX, offsetY] of FLOW_DIRS) {
      const nextX = x + offsetX;
      const nextY = y + offsetY;
      const cost = abstractTileCost(economy, physical, nextX, nextY);
      if (!Number.isFinite(cost)) continue;
      const next = current + cost * (offsetX !== 0 && offsetY !== 0 ? 1.4 : 1);
      const index = nextY * physical.width + nextX;
      if (next < distances[index] - 1e-6) {
        distances[index] = next;
        queue.push([nextX, nextY]);
      }
    }
  }
  return distances;
}

function tread(economy, x, y) {
  const key = keyOf(Math.round(x), Math.round(y));
  economy.traffic[key] = Math.min(2000, (economy.traffic[key] ?? 0) + 1);
}

function stepToMarket(economy, physical, household, marketFlow) {
  let movement = Math.min(
    2.2,
    0.9 / Math.max(
      P.PAVE_ROAD_F,
      abstractTileCost(economy, physical, Math.round(household.px), Math.round(household.py)),
    ),
  );
  for (let hop = 0; hop < 4 && movement > 1e-6; hop += 1) {
    const x = Math.round(household.px);
    const y = Math.round(household.py);
    let bestX = x;
    let bestY = y;
    let bestDistance = marketFlow[y * physical.width + x];
    for (const [offsetX, offsetY] of FLOW_DIRS) {
      const nextX = x + offsetX;
      const nextY = y + offsetY;
      if (nextX < 0 || nextY < 0 || nextX >= physical.width || nextY >= physical.height) continue;
      const distance = marketFlow[nextY * physical.width + nextX];
      if (distance < bestDistance) {
        bestDistance = distance;
        bestX = nextX;
        bestY = nextY;
      }
    }
    if (bestX === x && bestY === y) break;
    const amount = Math.min(1, movement);
    household.px += (bestX - household.px) * amount;
    household.py += (bestY - household.py) * amount;
    movement -= amount;
  }
  tread(economy, household.px, household.py);
  return Math.hypot(
    household.px - economy.market.x,
    household.py - economy.market.y,
  ) < 1.2;
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

function decideHouseholdTrips(economy, physical) {
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
    const distance = Math.hypot(
      household.x - economy.market.x,
      household.y - economy.market.y,
    );
    const tripCost = Math.min(Math.max(10, distance * 2.2), householdHaul(household) * 0.8);
    if (
      (offers.fish ?? 0) > 0
      || sellQuantity >= tripCost
      || (foodDays < foodThreshold && household.purse > 2)
      || (lowCulture && household.purse > 15)
      || (inputLow && household.purse > -20)
    ) household.state = "toMarket";
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
  let marketFlow = null;
  let marketFlowRevision = -1;
  let marketFlowKey = null;

  function random() {
    const result = nextMulberry32(state.rngState);
    state.rngState = result.state;
    return result.value;
  }

  function currentMarketFlow() {
    const nextKey = keyOf(Math.round(economy.market.x), Math.round(economy.market.y));
    if (
      marketFlow === null
      || marketFlowRevision !== physical.roadRevision
      || marketFlowKey !== nextKey
    ) {
      marketFlow = buildMarketFlow(economy, physical);
      marketFlowRevision = physical.roadRevision;
      marketFlowKey = nextKey;
    }
    return marketFlow;
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
      } else if (household.state === "toMarket") {
        if (stepToMarket(economy, physical, household, currentMarketFlow())) {
          household.state = "atMarket";
          transactAtMarket(economy, physical, household, { day: state.day, random });
          household.state = "toHome";
        }
      } else if (household.state === "toWork") {
        if (stepTo(economy, physical, household, household.wx, household.wy)) {
          completeAssignedWork(economy, physical, household, { day: state.day });
        }
      } else if (household.state === "toHome") {
        if (stepTo(economy, physical, household, household.x, household.y)) household.state = "home";
      } else if (household.state === "home") {
        producePrimaryTick(economy, physical, household, {
          day: state.day,
          fraction: 1 / 30,
          endOfDay: timeOfDay === 29,
        });
      }
    }

    if (timeOfDay === 16) decideHouseholdTrips(economy, physical);
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
