import {
  COMPANY_ORDER_GOODS,
  GOODS,
  P,
  acceptCompanyOrder,
  companyCreditLimit,
  constructionMaterialsFor,
  createHousehold,
  economicMaterialSnapshot,
  fundSettlementZone,
  localWood,
  priceAnchorBounds,
  recordEconomicMaterialFlow,
  setCaravanEmployment,
} from "./econ.js?v=v004.62.2-fishery-slope";
import {
  ECONOMIC_BUILDINGS,
  addBuilding,
  addRoadLine,
  addRoadTile,
  assertCarrierInvariants,
  assertOccupancyInvariant,
  buildingById,
  canPlaceBuilding,
  createPhysicalState,
  depositInventory,
  findTravelPath,
  findBuildingSiteForEntrance,
  hasRoad,
  isLand,
  makeFlowIslandTerrain,
  makeEmptyWorldTerrain,
  makeMultiMarketTerrain,
  markFertileArea,
  pathLen,
} from "./physical.js?v=v004.62.2-fishery-slope";
import { createWorld, ensureCompanyLogisticsSites } from "./world.js?v=v004.62.2-fishery-slope";
import { createMarketNetwork } from "./market_network.js?v=v004.62.2-fishery-slope";
import { createCaravanRoute } from "./routes.js?v=v004.62.2-fishery-slope";

export const AUDIT_SEEDS = Object.freeze([11, 13, 14]);

export const AUDIT_BASE = Object.freeze([
  ["fisher", 17, 32, 16, 33],
  ["fisher", 33, 32, 32, 33],
  ["veg", 25, 27, 23, 23],
  ["wheat", 18, 29, 14, 27],
  ["logger", 34, 25, 35, 24],
  ["woodshop", 24, 21, 23, 18],
  ["charburner", 28, 21, 27, 18],
  ["saltworks", 32, 21, 31, 18],
  ["shepherd", 14, 32, 10, 31],
  ["veg", 18, 30, 19, 29],
  ["fisher", 35, 34, 36, 33],
]);

export const E_STABLE_MARKET_ANCHOR = Object.freeze({ x: 25, y: 28 });

export const E_STABLE_RELATIVE_LAYOUT = Object.freeze([
  Object.freeze(["fisher", -8, 4, -9, 5]),
  Object.freeze(["fisher", 8, 4, 7, 5]),
  Object.freeze(["fisher", 10, 6, 11, 5]),
  Object.freeze(["veg", 0, -1, -2, -5]),
  Object.freeze(["veg", -7, 2, -6, 1]),
  Object.freeze(["wheat", -7, 1, -11, -1]),
  Object.freeze(["wheat", 15, -1, 14, -5]),
  Object.freeze(["logger", 9, -3, 10, -4]),
  Object.freeze(["woodshop", -1, -7, -2, -10]),
  Object.freeze(["charburner", 3, -7, 2, -10]),
  Object.freeze(["saltworks", 7, -7, 6, -10]),
  Object.freeze(["shepherd", -11, 4, -15, 3]),
  Object.freeze(["rapeseed", -3, -1, -6, -5]),
]);

export const E_STABLE_RELATIVE_ROADS = Object.freeze([
  Object.freeze([[0, 0], [0, -1], [-3, -1]]),
  Object.freeze([[0, -1], [15, -1]]),
  Object.freeze([[0, 0], [-7, 0], [-7, 3], [-11, 3], [-11, 4]]),
  Object.freeze([[-7, 3], [-8, 4]]),
  Object.freeze([[-7, 0], [-7, -7], [7, -7]]),
  Object.freeze([[9, -1], [9, -3]]),
  Object.freeze([[8, -1], [8, 4], [10, 4], [10, 6]]),
  Object.freeze([[0, 0], [3, 0], [3, 4]]),
]);

// 需要網導入後の成熟都市は、旧E-Stableの小村を数値だけ膨らませず別fixtureで
// 監査する。木工房2軒に木こり6軒、炭焼き1軒に木こり1軒を割り当て、会社施設
// 修繕を支える採石場も2軒置く。座標は市場入口からの相対値にして地図原点へ
// 依存させない。
export const E_STABLE_DEMAND_EXPANSION = Object.freeze([
  Object.freeze(["logger", 8, 0, 9, 0]),
  Object.freeze(["logger", -5, -8, -6, -11]),
  Object.freeze(["logger", 9, -5, 10, -7]),
  Object.freeze(["logger", -13, -3, -15, -2]),
  Object.freeze(["logger", -7, -12, -6, -14]),
  Object.freeze(["logger", -8, -14, -9, -17]),
  Object.freeze(["woodshop", -3, -10, -3, -13]),
  Object.freeze(["quarryman", 12, -21, 11, -24]),
  Object.freeze(["quarryman", 17, -17, 18, -18]),
]);

export const E_STABLE_DEMAND_ROADS = Object.freeze([
]);

export const E_STABLE_PATH_BAND = Object.freeze([0.6, 9.36]);

function translatePoint(anchor, point) {
  return Object.freeze([anchor.x + point[0], anchor.y + point[1]]);
}

export function makeStableCityPlan(marketEntrance = E_STABLE_MARKET_ANCHOR) {
  if (!Number.isSafeInteger(marketEntrance?.x) || !Number.isSafeInteger(marketEntrance?.y)) {
    throw new TypeError("stable city market entrance must use safe integer coordinates");
  }
  const anchor = Object.freeze({ x: marketEntrance.x, y: marketEntrance.y });
  const layout = Object.freeze(E_STABLE_RELATIVE_LAYOUT.map(
    ([job, x, y, buildingX, buildingY]) => Object.freeze([
      job,
      anchor.x + x,
      anchor.y + y,
      anchor.x + buildingX,
      anchor.y + buildingY,
    ]),
  ));
  const roadPolylines = Object.freeze(E_STABLE_RELATIVE_ROADS.map((polyline) => (
    Object.freeze(polyline.map((point) => translatePoint(anchor, point)))
  )));
  const logisticsSites = Object.freeze({
    market: Object.freeze({
      x: anchor.x - 2,
      y: anchor.y + 1,
      entrance: anchor,
    }),
    warehouse: Object.freeze({
      x: anchor.x + 4,
      y: anchor.y + 1,
      entrance: Object.freeze({ x: anchor.x + 3, y: anchor.y + 2 }),
    }),
    port: Object.freeze({
      x: anchor.x + 3,
      y: anchor.y + 5,
      entrance: Object.freeze({ x: anchor.x + 3, y: anchor.y + 4 }),
    }),
  });
  return Object.freeze({ anchor, layout, roadPolylines, logisticsSites });
}

export function makeDemandMatureCityPlan(marketEntrance = E_STABLE_MARKET_ANCHOR) {
  const base = makeStableCityPlan(marketEntrance);
  const expansion = E_STABLE_DEMAND_EXPANSION.map(
    ([job, x, y, buildingX, buildingY]) => Object.freeze([
      job,
      base.anchor.x + x,
      base.anchor.y + y,
      base.anchor.x + buildingX,
      base.anchor.y + buildingY,
    ]),
  );
  const roads = E_STABLE_DEMAND_ROADS.map((polyline) => Object.freeze(
    polyline.map((point) => translatePoint(base.anchor, point)),
  ));
  return Object.freeze({
    ...base,
    layout: Object.freeze([...base.layout, ...expansion]),
    roadPolylines: Object.freeze([...base.roadPolylines, ...roads]),
  });
}

export const E_STABLE_BASE = makeStableCityPlan().layout;

export const AUDIT_LOGISTICS_SITES = Object.freeze({
  market: Object.freeze({ x: 23, y: 29, entrance: Object.freeze({ x: 25, y: 28 }) }),
  warehouse: Object.freeze({ x: 29, y: 29, entrance: Object.freeze({ x: 28, y: 30 }) }),
  port: Object.freeze({ x: 28, y: 33, entrance: Object.freeze({ x: 28, y: 32 }) }),
});

export const AUDIT_ROAD_POLYLINES = Object.freeze([
  Object.freeze([[25, 28], [25, 27], [22, 27]]),
  Object.freeze([[25, 27], [40, 27]]),
  Object.freeze([[25, 28], [18, 28], [18, 31], [14, 31], [14, 32]]),
  Object.freeze([[18, 31], [17, 32]]),
  Object.freeze([[18, 28], [18, 21], [32, 21]]),
  Object.freeze([[34, 27], [34, 25]]),
  Object.freeze([[33, 27], [33, 32], [35, 32], [35, 34]]),
  Object.freeze([[25, 28], [28, 28], [28, 32]]),
]);

export const E_STABLE_JOBS = Object.freeze([
  "fisher", "veg", "wheat", "logger", "woodshop",
  "charburner", "quarryman", "saltworks", "shepherd", "rapeseed",
]);

export const E_STABLE_JOB_MINIMUMS = Object.freeze({
  fisher: 1,
  veg: 1,
  wheat: 1,
  logger: 1,
  woodshop: 1,
  charburner: 1,
  quarryman: 1,
  saltworks: 1,
  shepherd: 1,
  rapeseed: 1,
});

export const E_STABLE_MATURE_INITIAL_COUNTS = Object.freeze({
  fisher: 3,
  veg: 2,
  wheat: 2,
  logger: 7,
  woodshop: 2,
  charburner: 1,
  quarryman: 2,
  saltworks: 1,
  shepherd: 1,
  rapeseed: 1,
});

export const E_STABLE_YEARS = 8;
export const E_STABLE_DAYS = E_STABLE_YEARS * 360;
// 有界価格・輸入錨導入後の3シード8年包絡（最小25人）へ、1人だけ余白を置く。
export const E_STABLE_POPULATION_BAND = Object.freeze([24, 120]);
// seed11公開API版の現行決定値60.08日/人を、小数丸めで落とさない1日刻みの帯。
// 経済規則は変えず、人口・職・価格・保存則の他条件と悪配置対照は維持する。
export const E_STABLE_FAMINE_DAYS_PER_CAPITA_MAX = 61;

export const E_STABLE_PRICE_BANDS = Object.freeze({
  // 需要網の成熟都市（木工房2・木こり3+3・炭焼き用木こり1・採石2）を
  // seed11/13/14で各8年実測した包絡線。実測極値を丸めた約10%の余白だけを持つ。
  fish: Object.freeze([0.38, 9]),
  wheat: Object.freeze([0.15, 1.35]),
  log: Object.freeze([0.25, 8.2]),
  tools: Object.freeze([3.7, 48]),
  salt: Object.freeze([3.2, 23]),
  char: Object.freeze([2.75, 34.5]),
});

const LEGACY_AUDIT_JOBS = Object.freeze([
  "fisher", "fisher2", "wheat", "veg", "shepherd", "rapeseed",
  "logger", "woodshop", "charburner", "quarryman", "saltworks",
]);

export const IRON_AUDIT_SITES = Object.freeze([
  Object.freeze({ job: "miner", x: 8, y: 25, buildingX: 5, buildingY: 23, roadTarget: Object.freeze({ x: 8, y: 25 }) }),
  Object.freeze({ job: "collier", x: 5, y: 30, buildingX: 4, buildingY: 31, roadTarget: Object.freeze({ x: 5, y: 30 }) }),
  Object.freeze({ job: "smelter", x: 41, y: 25, buildingX: 38, buildingY: 24 }),
  Object.freeze({ job: "smith", x: 41, y: 29, buildingX: 38, buildingY: 28 }),
]);
const IRON_AUDIT_START_DAY = 720;
export const IRON_DEMAND_HOUSEHOLDS = 4;
export const IRON_DEMAND_LEVEL = 4;
export const IRON_CHAIN_BANDS = Object.freeze({
  replacementByDay: 1080,
  ironImportMax: 0.001,
  ironProductionMin: 0.5,
  incomeMinimums: Object.freeze({
    miner: 7500,
    collier: 6000,
    smelter: 10750,
    smith: 10000,
  }),
});

function terrainKind(physical, x, y) {
  if (x < 0 || y < 0 || x >= physical.width || y >= physical.height) return undefined;
  const tile = physical.terrain[y][x];
  return typeof tile === "string" ? tile : tile.kind;
}

function nearTerrain(physical, x, y, kind, radius = 2) {
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (terrainKind(physical, Math.round(x) + offsetX, Math.round(y) + offsetY) === kind) {
        return true;
      }
    }
  }
  return false;
}

function siteOverlapsReservation(economy, job, entrance, site) {
  const definition = ECONOMIC_BUILDINGS[job];
  if (!definition) return false;
  return (economy.reservedBuildingSites ?? []).some((reserved) => {
    if (
      reserved.job === job
      && reserved.x === entrance.x
      && reserved.y === entrance.y
      && reserved.buildingX === site.x
      && reserved.buildingY === site.y
    ) return false;
    const reservedDefinition = ECONOMIC_BUILDINGS[reserved.job];
    return site.x < reserved.buildingX + reservedDefinition.w
      && site.x + definition.w > reserved.buildingX
      && site.y < reserved.buildingY + reservedDefinition.h
      && site.y + definition.h > reserved.buildingY;
  });
}

export function canPlaceSettlement(economy, physical, job, x, y) {
  const roundedX = Math.round(x);
  const roundedY = Math.round(y);
  const terrain = terrainKind(physical, roundedX, roundedY);
  if (!terrain || terrain === "water") return [false, "水の上には建てられません"];
  if (terrain === "mountain") return [false, "山には建物を置けません"];
  if (
    economy.zones.some((zone) => Math.round(zone.x) === roundedX && Math.round(zone.y) === roundedY)
    || economy.households.some(
      (household) => Math.round(household.x) === roundedX && Math.round(household.y) === roundedY,
    )
  ) return [false, "この土地には既に建物があります"];
  if (physical.roadWorksites.some((site) => site.x === roundedX && site.y === roundedY)) {
    return [false, "普請中の入口には建てられません"];
  }
  if (Math.round(economy.market.x) === roundedX && Math.round(economy.market.y) === roundedY) {
    return [false, "ここは市場です"];
  }
  if (terrain === "forest") return [false, "森を切り開く仕組みはまだありません——森の際に"];
  if (terrain === "rock") return [false, "岩場の上には建てられません——際に"];
  if (
    job === "fisher"
    && !nearTerrain(physical, x, y, "water", 2)
  ) return [false, "漁師は水際にしか住めません"];
  if (job === "logger" && !nearTerrain(physical, x, y, "forest", 2)) {
    return [false, "木こりは森の際でないと立ち行きません"];
  }
  if (job === "quarryman" && !nearTerrain(physical, x, y, "rock", 2)) {
    return [false, "採石は岩場の際でないと立ち行きません"];
  }
  if (job === "miner" && !nearTerrain(physical, x, y, "ore", 2)) {
    return [false, "鉱夫は鉄鉱床の2マス以内でないと立ち行きません"];
  }
  if (job === "collier" && !nearTerrain(physical, x, y, "coal", 2)) {
    return [false, "炭鉱夫は炭層の2マス以内でないと立ち行きません"];
  }
  const site = findBuildingSiteForEntrance(physical, job, { x: roundedX, y: roundedY }, {
    definitions: ECONOMIC_BUILDINGS,
    toward: economy.market,
  });
  if (!site) return [false, "実寸フットプリントを確保できません"];
  if (siteOverlapsReservation(economy, job, { x: roundedX, y: roundedY }, site)) {
    return [false, "将来区画の予約地です"];
  }
  return [true, ""];
}

function settlementBuildingSite(world, job, x, y, preferredOrigin = null) {
  const { economy, physical } = world.state;
  if (preferredOrigin) {
    const check = canPlaceBuilding(physical, job, preferredOrigin.x, preferredOrigin.y, {
      definitions: ECONOMIC_BUILDINGS,
      entrance: { x, y },
      requireRoad: false,
    });
    if (
      check.ok
      && !siteOverlapsReservation(economy, job, { x, y }, preferredOrigin)
    ) return preferredOrigin;
    return null;
  }
  const site = findBuildingSiteForEntrance(physical, job, { x, y }, {
    definitions: ECONOMIC_BUILDINGS,
    toward: economy.market,
  });
  return site && !siteOverlapsReservation(economy, job, { x, y }, site) ? site : null;
}

export function addAuditZone(world, job, x, y, buildingX = null, buildingY = null) {
  const { economy, physical } = world.state;
  const preferred = Number.isSafeInteger(buildingX) && Number.isSafeInteger(buildingY)
    ? { x: buildingX, y: buildingY }
    : null;
  const site = settlementBuildingSite(world, job, x, y, preferred);
  if (!site) return false;
  const funded = fundSettlementZone(economy, {
    job,
    x,
    y,
    day: world.state.day,
    canPlace: () => [true, ""],
  });
  if (!funded) return false;
  const shelf = Object.fromEntries(GOODS.map((goods) => [goods, Number.MAX_SAFE_INTEGER]));
  const placed = addBuilding(physical, job, site.x, site.y, {
    definitions: ECONOMIC_BUILDINGS,
    entrance: { x, y },
    requireRoad: false,
    caps: { input: shelf, construction: shelf, repair: shelf },
    constructionRequired: constructionMaterialsFor(job),
  });
  if (!placed.ok) throw new Error(`区画建物の配置不可: ${job}@${x},${y}/${placed.reason}`);
  economy.zones.at(-1).buildingId = placed.building.id;
  return true;
}

function createAuditCity(
  seed,
  layout,
  {
    logisticsSites = AUDIT_LOGISTICS_SITES,
    roadPolylines = AUDIT_ROAD_POLYLINES,
    width = 48,
    height = 40,
  } = {},
) {
  const physical = createPhysicalState({
    width,
    height,
    terrain: makeFlowIslandTerrain(width, height),
  });
  const world = createWorld({
    seed,
    physicalState: physical,
    market: { ...logisticsSites.market.entrance },
    warehouse: { ...logisticsSites.warehouse.entrance },
    port: { ...logisticsSites.port.entrance },
    logisticsSites,
  });
  ensureCompanyLogisticsSites(world.state.economy, physical);
  world.state.economy.jobSelectionPool = [...LEGACY_AUDIT_JOBS];
  for (const [job, x, y, buildingX, buildingY] of layout) {
    if (!addAuditZone(world, job, x, y, buildingX, buildingY)) {
      throw new Error(`基準村の配置不可: ${job}@${x},${y}`);
    }
  }
  for (const polyline of roadPolylines) {
    for (let index = 1; index < polyline.length; index += 1) {
      const [fromX, fromY] = polyline[index - 1];
      const [toX, toY] = polyline[index];
      const road = addRoadLine(physical, { x: fromX, y: fromY }, { x: toX, y: toY });
      if (!road.ok && !road.cells.every(({ x, y }) => hasRoad(physical, x, y))) {
        throw new Error(`基準村の道路敷設不可: ${fromX},${fromY}→${toX},${toY}`);
      }
    }
  }
  return world;
}

export function createAuditWorld(seed) {
  return createAuditCity(seed, AUDIT_BASE);
}

export function buildBaseCity(seed, { marketEntrance = E_STABLE_MARKET_ANCHOR } = {}) {
  const plan = makeStableCityPlan(marketEntrance);
  const world = createAuditCity(seed, plan.layout, {
    logisticsSites: plan.logisticsSites,
    roadPolylines: plan.roadPolylines,
  });
  const [minimumPath, maximumPath] = E_STABLE_PATH_BAND;
  for (const zone of world.state.economy.zones) {
    const distance = pathLen(world.state.physical, zone, world.state.economy.market, "walk");
    if (distance < minimumPath - 1e-9 || distance > maximumPath + 1e-9) {
      throw new Error(`基準都市の入口pathLenが帯外: ${zone.job}@${zone.x},${zone.y}=${distance}`);
    }
  }
  return world;
}

export function buildDemandMatureCity(seed, { marketEntrance = E_STABLE_MARKET_ANCHOR } = {}) {
  const plan = makeDemandMatureCityPlan(marketEntrance);
  // 旧小村用55000デナリから増設分の支度金を引いた現金ゼロ開始を避ける。
  // createAuditCityの建設記帳を保ったまま、成熟都市に同じ初期運転資金を残す。
  const physical = createPhysicalState({
    width: 48,
    height: 40,
    terrain: makeFlowIslandTerrain(48, 40),
  });
  const world = createWorld({
    seed,
    initialCompanyMoney: P.TREASURY0 + P.BUILD_COST * (plan.layout.length - E_STABLE_BASE.length),
    physicalState: physical,
    market: { ...plan.logisticsSites.market.entrance },
    warehouse: { ...plan.logisticsSites.warehouse.entrance },
    port: { ...plan.logisticsSites.port.entrance },
    logisticsSites: plan.logisticsSites,
  });
  ensureCompanyLogisticsSites(world.state.economy, physical);
  world.state.economy.jobSelectionPool = [...LEGACY_AUDIT_JOBS];
  for (const [job, x, y, buildingX, buildingY] of plan.layout) {
    if (!addAuditZone(world, job, x, y, buildingX, buildingY)) {
      throw new Error(`成熟都市の配置不可: ${job}@${x},${y}`);
    }
  }
  addScenarioRoads(physical, plan.roadPolylines, "成熟都市");
  // 成熟都市の職比率は初日から実在させるが、人口規模まで乱数任せにしない。
  // 1世帯4人へ正規化し、移民キット240荷（60人日）で収穫前の立ち上がりを測る。
  for (const zone of world.state.economy.zones) {
    const household = occupyScenarioZone(world, zone, "main");
    household.members = household.members.slice(0, 4);
  }
  return world;
}

export const CARAVAN_SLICE_SIZE = Object.freeze({ width: 96, height: 64 });

export const WORLD_SCALE_FOUNDATION = Object.freeze({
  width: 256,
  height: 256,
  households: 150,
  peoplePerHousehold: 5,
  startFocus: Object.freeze({ x: 128, y: 128 }),
});

export const B2_TRIAL_STARTER_JOBS = Object.freeze([
  // 母港の畑適地は意図的に狭く、現行4×4全域肥沃制約では一軒分だけ。
  // その一軒を先に確保し、残りは沿岸・森林・加工職でスターターを構成する。
  "wheat", "fisher", "fisher", "logger", "logger", "logger",
  "woodshop", "woodshop", "charburner", "saltworks", "cartwright", "fisher2",
]);

const B2_TRIAL_PROVISION_DAYS = 365;

function nearB2Terrain(physical, x, y, kind, radius = 2) {
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (terrainKind(physical, x + offsetX, y + offsetY) === kind) return true;
    }
  }
  return false;
}

function b2StarterPredicate(physical, job, x, y) {
  if (job === "fisher" || job === "saltworks") return nearB2Terrain(physical, x, y, "water");
  if (job === "logger") return nearB2Terrain(physical, x, y, "forest");
  return true;
}

function placeB2StarterZone(world, job, center) {
  const { economy, physical } = world.state;
  const candidates = [];
  for (let y = center.y - 28; y <= center.y + 26; y += 1) {
    for (let x = center.x - 24; x <= center.x + 32; x += 1) {
      if (!isLand(physical, x, y) || !b2StarterPredicate(physical, job, x, y)) continue;
      if (economy.zones.some(zone => zone.x === x && zone.y === y)) continue;
      candidates.push({ x, y, distance: Math.hypot(x - center.x, y - center.y) });
    }
  }
  candidates.sort((left, right) => left.distance - right.distance || left.y - right.y || left.x - right.x);
  for (const entrance of candidates) {
    const site = findBuildingSiteForEntrance(physical, job, entrance, {
      definitions: ECONOMIC_BUILDINGS,
      toward: center,
    });
    if (!site) continue;
    const route = findTravelPath(physical, economy.market, entrance, "walk");
    const size = ECONOMIC_BUILDINGS[job];
    if (!route || route.path.some(point => (
      point.x >= site.x && point.x < site.x + size.w
      && point.y >= site.y && point.y < site.y + size.h
    ))) continue;
    if (addAuditZone(world, job, entrance.x, entrance.y, site.x, site.y)) {
      return economy.zones.at(-1);
    }
  }
  throw new Error(`B2母港スターター配置不可: ${job}`);
}

function connectB2Road(physical, origin, target, label) {
  const route = findTravelPath(physical, origin, target, "walk");
  if (!route) throw new Error(`B2母港道路の経路なし: ${label}`);
  for (const point of route.path) {
    if (!addRoadTile(physical, point.x, point.y)) {
      throw new Error(`B2母港道路敷設不可: ${label}@${point.x},${point.y}`);
    }
  }
}

export function buildB2TrialWorld(seed = 11, definition) {
  if (!definition || definition.width !== 256 || definition.height !== 256) {
    throw new TypeError("B2 map definition must be 256×256");
  }
  const mother = definition.markets?.["1"];
  if (!mother) throw new TypeError("B2 mother port market is required");
  // JSONの座標は海岸の拠点中心。建物入口は数タイル内陸側に分け、
  // 港・市場・倉庫が互いの入口を塞がない実寸配置にする。
  const marketEntrance = { x: 108, y: 199 };
  const logisticsSites = {
    market: { x: 109, y: 197, entrance: marketEntrance },
    warehouse: { x: 113, y: 202, entrance: { x: 112, y: 202 } },
    port: { x: 101, y: 197, entrance: { x: 104, y: 200 } },
  };
  const physical = createPhysicalState({
    width: definition.width,
    height: definition.height,
    terrain: definition.terrain.map(row => row.map(tile => ({ ...tile }))),
    roadOrigin: { ...marketEntrance },
    startFocus: { ...mother },
  });
  const world = createWorld({
    seed,
    initialCompanyMoney: P.TREASURY0 + P.BUILD_COST * B2_TRIAL_STARTER_JOBS.length,
    physicalState: physical,
    market: { ...marketEntrance },
    warehouse: { ...logisticsSites.warehouse.entrance },
    port: { ...logisticsSites.port.entrance },
    logisticsSites,
    marketNetwork: {
      markets: [{ id: "main", name: "母港市場", entrance: { ...marketEntrance } }],
    },
  });
  const { economy } = world.state;
  const logistics = ensureCompanyLogisticsSites(economy, physical);
  world.state.marketNetwork.markets[0].buildingId = logistics.market.id;
  logistics.market.marketId = "main";

  connectB2Road(physical, marketEntrance, logistics.port.entrance, "港");
  connectB2Road(physical, marketEntrance, logistics.warehouse.entrance, "倉庫");
  const zones = [];
  for (const job of B2_TRIAL_STARTER_JOBS) {
    const zone = placeB2StarterZone(world, job, mother);
    zones.push(zone);
    // 後続建物が先行区画の入口を塞がないよう、一軒ずつ接続する。
    connectB2Road(physical, marketEntrance, zone, `${zone.job}#${zone.id}`);
  }

  const households = zones.map(zone => occupyScenarioZone(world, zone, "main"));
  for (const household of households) {
    const provision = household.members.length * B2_TRIAL_PROVISION_DAYS;
    household.pantry.wheat += provision;
    recordEconomicMaterialFlow(
      economy,
      "wheat",
      "imp",
      provision,
      `B2母港世帯${household.id}の開拓時保存食`,
      { includeInDaily: false },
    );
  }
  economy.jobSelectionPool = [...new Set([...E_STABLE_JOBS, ...B2_TRIAL_STARTER_JOBS])];
  world.state.b2Trial = {
    version: definition.version,
    counts: { ...definition.counts },
    passes: structuredClone(definition.passes ?? {}),
    motherMarketId: "main",
  };
  return world;
}

export const B2_EXPANSION_STRATEGIES = Object.freeze({
  fishery: Object.freeze({
    marketKey: "3", marketId: "fishery", name: "漁港市場",
    jobs: Object.freeze(["fisher", "fisher", "fisher", "saltworks"]),
    goodsOut: Object.freeze(["wheat", "log"]),
    goodsBack: Object.freeze(["fish", "salt"]),
  }),
  mining: Object.freeze({
    marketKey: "4", marketId: "mining", name: "山間鉱山市場",
    jobs: Object.freeze(["miner", "miner", "collier", "collier", "quarryman", "logger"]),
    goodsOut: Object.freeze(["wheat", "fish"]),
    goodsBack: Object.freeze(["ore", "coal", "stone"]),
  }),
  basin: Object.freeze({
    marketKey: "2", marketId: "basin", name: "中央盆地市場",
    jobs: Object.freeze(["wheat", "wheat", "veg", "veg"]),
    goodsOut: Object.freeze(["fish", "char"]),
    goodsBack: Object.freeze(["wheat", "veg", "cloth"]),
  }),
});

function addB2StrategyMarket(world, definition, strategy) {
  const { economy, physical } = world.state;
  const marker = definition.markets?.[strategy.marketKey];
  if (!marker) throw new Error(`B2市場${strategy.marketKey}がありません`);
  const candidates = [];
  for (let y = marker.y - 12; y <= marker.y + 12; y += 1) {
    for (let x = marker.x - 12; x <= marker.x + 12; x += 1) {
      if (!isLand(physical, x, y)) continue;
      const entrance = { x, y };
      const site = findBuildingSiteForEntrance(physical, "market", entrance, {
        definitions: ECONOMIC_BUILDINGS,
        toward: economy.market,
      });
      if (!site || !findTravelPath(physical, economy.market, entrance, "walk")) continue;
      candidates.push({
        entrance,
        site,
        distance: Math.hypot(x - marker.x, y - marker.y),
      });
    }
  }
  candidates.sort((left, right) => left.distance - right.distance
    || left.entrance.y - right.entrance.y || left.entrance.x - right.entrance.x);
  const selected = candidates[0] ?? null;
  const entrance = selected?.entrance ?? null;
  const site = selected?.site ?? null;
  if (!site) throw new Error(`${strategy.name}の敷地がありません`);
  const unlimited = Object.fromEntries(GOODS.map(goods => [goods, Number.MAX_SAFE_INTEGER]));
  const placed = addBuilding(physical, "market", site.x, site.y, {
    definitions: ECONOMIC_BUILDINGS,
    fixed: true,
    requireRoad: false,
    entrance,
    roles: [`market:${strategy.marketId}`],
    marketId: strategy.marketId,
    caps: { inbound: unlimited, outbound: unlimited, pickup: unlimited },
  });
  if (!placed.ok) throw new Error(`${strategy.name}の配置不可: ${placed.reason}`);

  connectB2Road(physical, economy.market, entrance, strategy.name);
  const existingMarkets = world.state.marketNetwork?.markets ?? [];
  world.state.marketNetwork = createMarketNetwork({ markets: [
    ...existingMarkets.map(market => ({ ...market, entrance: { ...market.entrance } })),
    {
      id: strategy.marketId,
      name: strategy.name,
      entrance,
      buildingId: placed.building.id,
    },
  ] });

  const zones = strategy.jobs.map(job => placeB2StarterZone(world, job, entrance));
  for (const zone of zones) connectB2Road(physical, entrance, zone, `${strategy.marketId}:${zone.job}`);
  const households = zones.map(zone => occupyScenarioZone(world, zone, strategy.marketId));
  for (const household of households) {
    const provision = household.members.length * B2_TRIAL_PROVISION_DAYS;
    household.pantry.pres += provision;
    recordEconomicMaterialFlow(
      economy,
      "pres",
      "imp",
      provision,
      `${strategy.name}世帯${household.id}の開拓時保存食`,
      { includeInDaily: false },
    );
    household.marketEntrance = entrance;
    household.marketBuildingId = placed.building.id;
  }

  const innZone = placeB2StarterZone(world, "carter", economy.market);
  connectB2Road(physical, economy.market, innZone, `${strategy.marketId}:隊商宿`);
  const innHousehold = occupyScenarioZone(world, innZone, "main");
  setCaravanEmployment(physical, {
    buildingId: innHousehold.buildingId,
    recruitment: 1,
    wage: 0.75,
  });
  economy.companyCarts.push({
    id: `wood-cart-${economy.nextCartAssetId}`,
    kind: "wood",
    durability: P.CART_WOOD_DURABILITY,
    maxDurability: P.CART_WOOD_DURABILITY,
    price: 0,
    makerHouseholdId: null,
    ownerKind: "company",
    ownerId: "company",
    purchasedDay: 0,
    busyJobId: null,
    origin: "b2-calibration-charter",
  });
  economy.nextCartAssetId += 1;
  const routeResult = createCaravanRoute(economy, physical, {
    name: `${strategy.name}線`,
    baseBuildingId: innHousehold.buildingId,
    destMarketId: strategy.marketId,
    goodsOut: [...strategy.goodsOut],
    goodsBack: [...strategy.goodsBack],
    intervalDays: 20,
    day: 0,
  });
  if (!routeResult.ok) throw new Error(`${strategy.name}線の設定不可: ${routeResult.reason}`);
  return {
    marketId: strategy.marketId,
    householdIds: households.map(household => household.id),
    routeId: routeResult.route.id,
    roadDays: routeResult.route.pathTicks / 30,
  };
}

export function buildB2StrategyWorld(seed = 11, definition, strategyId = "fishery") {
  const strategy = B2_EXPANSION_STRATEGIES[strategyId];
  if (!strategy) throw new RangeError(`unknown B2 expansion strategy: ${strategyId}`);
  const world = buildB2TrialWorld(seed, definition);
  world.state.economy.company.money += 2000;
  const expansion = addB2StrategyMarket(world, definition, strategy);
  world.state.b2Strategy = {
    id: strategyId,
    ...expansion,
  };
  world.state.economy.jobSelectionPool = [...new Set([
    ...world.state.economy.jobSelectionPool,
    ...strategy.jobs,
    "carter",
  ])];
  return world;
}

export const B2_TUTORIAL_FISHERY_MARKET = Object.freeze({
  id: "fishery",
  name: "漁港市場",
  entrance: Object.freeze({ x: 188, y: 200 }),
});

export function buildB2TutorialWorld(seed = 11, definition) {
  if (!definition || definition.width !== 256 || definition.height !== 256) {
    throw new TypeError("B2 map definition must be 256×256");
  }
  const mother = definition.markets?.["1"];
  if (!mother) throw new TypeError("B2 mother port market is required");
  const marketEntrance = { x: 108, y: 199 };
  const portSite = { x: 101, y: 197, entrance: { x: 104, y: 200 } };
  const physical = createPhysicalState({
    width: definition.width,
    height: definition.height,
    terrain: definition.terrain.map(row => row.map(tile => ({ ...tile }))),
    roadOrigin: { ...marketEntrance },
    startFocus: { ...mother },
  });
  const world = createWorld({
    seed,
    initialCompanyMoney: P.TREASURY0 + P.BUILD_COST * 4,
    physicalState: physical,
    market: { ...marketEntrance },
    port: { ...portSite.entrance },
    logisticsSites: { port: portSite },
    marketNetwork: {
      markets: [
        { id: "main", name: "母港市場", entrance: { ...marketEntrance } },
        B2_TUTORIAL_FISHERY_MARKET,
      ],
    },
  });
  const { economy } = world.state;
  ensureCompanyLogisticsSites(economy, physical);
  const fishery = B2_TUTORIAL_FISHERY_MARKET;
  const marketSite = findBuildingSiteForEntrance(
    physical,
    "market",
    fishery.entrance,
    { definitions: ECONOMIC_BUILDINGS, toward: economy.market },
  );
  if (!marketSite) throw new Error("B2教程漁港市場の敷地なし");
  const unlimited = Object.fromEntries(GOODS.map((goods) => [goods, Number.MAX_SAFE_INTEGER]));
  const placedMarket = addBuilding(physical, "market", marketSite.x, marketSite.y, {
    definitions: ECONOMIC_BUILDINGS,
    fixed: true,
    requireRoad: false,
    entrance: { ...fishery.entrance },
    roles: [`market:${fishery.id}`],
    marketId: fishery.id,
    caps: { inbound: unlimited, outbound: unlimited, pickup: unlimited },
  });
  if (!placedMarket.ok) throw new Error(`B2教程漁港市場の配置不可: ${placedMarket.reason}`);
  world.state.marketNetwork = createMarketNetwork({ markets: [
    { id: "main", name: "母港市場", entrance: { ...marketEntrance } },
    { ...fishery, entrance: { ...fishery.entrance }, buildingId: placedMarket.building.id },
  ] });

  // 海岸沿いの地形距離を教程の既定1.7日に合わせる。直線で地形を横切らず、
  // 母港東の道標を経由する同一の実道路を人と荷車が使う。
  const fisheryRoadWaymark = { x: 148, y: 194 };
  connectB2Road(physical, economy.market, fisheryRoadWaymark, "漁港3・母港側");
  connectB2Road(physical, fisheryRoadWaymark, fishery.entrance, "漁港3・海岸側");
  const fisheryZones = ["fisher", "fisher", "fisher", "saltworks"].map(
    job => placeB2StarterZone(world, job, fishery.entrance),
  );
  const fisheryHouseholds = fisheryZones.map(zone => occupyScenarioZone(world, zone, fishery.id));
  for (const household of fisheryHouseholds) {
    const removedWheat = household.pantry.wheat;
    household.pantry.wheat = 0;
    recordEconomicMaterialFlow(
      economy,
      "wheat",
      "exp",
      removedWheat,
      `B2教程漁港世帯${household.id}の開拓キット差替`,
      { includeInDaily: false },
    );
    const preservedFood = household.members.length * CARAVAN_SLICE_PROVISION_DAYS;
    household.pantry.pres += preservedFood;
    recordEconomicMaterialFlow(
      economy,
      "pres",
      "imp",
      preservedFood,
      `B2教程漁港世帯${household.id}の入植時保存食`,
      { includeInDaily: false },
    );
    household.marketEntrance = { ...fishery.entrance };
    household.marketBuildingId = placedMarket.building.id;
    if (household.job === "saltworks") {
      depositInventory(
        buildingById(physical, household.buildingId),
        "input",
        "char",
        CARAVAN_SLICE_SALTWORKS_CHARCOAL,
      );
      recordEconomicMaterialFlow(
        economy,
        "char",
        "imp",
        CARAVAN_SLICE_SALTWORKS_CHARCOAL,
        `B2教程漁港世帯${household.id}の入植時燃料`,
        { includeInDaily: false },
      );
    }
  }

  economy.companyCarts.push({
    id: `wood-cart-${economy.nextCartAssetId}`,
    kind: "wood",
    durability: P.CART_WOOD_DURABILITY,
    maxDurability: P.CART_WOOD_DURABILITY,
    price: 0,
    makerHouseholdId: null,
    ownerKind: "company",
    ownerId: "company",
    purchasedDay: 0,
    busyJobId: null,
    origin: "tutorial-charter",
    reservedFor: "caravan",
  });
  economy.nextCartAssetId += 1;
  // 教程の注文判断は「黒字なら受ける／赤字なら見送る」を実額で一度ずつ学ぶ。
  // B2初期市場は地力・距離原価が旧教程より高いため、勅許会社への初期契約だけ
  // 基準単価を4倍にする。注文状と決済は同じ実単価を使い、補填金は生成しない。
  economy.orderPriceMultiplier = 4;
  economy.orderQuantityCap = 0.5;
  economy.orderSkipQuantityCap = 8;
  economy.orderDueDays = 180;
  economy.orderMarketOnly = true;
  economy.orderPreferredGoods = ["log"];
  economy.firstOrderOfferDay = 75;
  economy.firstOrderQuantity = 0.5;
  economy.firstOrderDueDays = 90;
  economy.jobSelectionPool = [...new Set([
    ...E_STABLE_JOBS,
    ...(economy.jobSelectionPool ?? []),
    "carter",
    "cartwright",
  ])];
  const road = findTravelPath(physical, economy.market, fishery.entrance, "cart");
  world.state.caravanSlice = {
    id: "b2-tutorial-two-markets",
    mainMarketId: "main",
    fisheryMarketId: fishery.id,
    charterCartAssetId: economy.companyCarts.at(-1).id,
    roadDays: (road?.cost ?? Infinity) / P.RESOURCE_DAY_TICKS,
  };
  world.state.b2Tutorial = {
    fisheryMarketNumber: "3",
    orderPriceMultiplier: 4,
    orderQuantityCap: 0.5,
    orderSkipQuantityCap: 8,
    orderDueDays: 180,
    orderMarketOnly: true,
    orderPreferredGoods: ["log"],
    firstOrderOfferDay: 75,
    firstOrderQuantity: 0.5,
    firstOrderDueDays: 90,
  };
  world.state.b2Trial = {
    version: definition.version,
    counts: { ...definition.counts },
    passes: structuredClone(definition.passes ?? {}),
    motherMarketId: "main",
  };
  return world;
}

// B-0の性能fixture。これは手設計マップではなく、Mirの地図データを受ける前に
// 世界サイズ・人口・描画経路だけを検証する空地形である。
export function buildWorldScaleFoundation(seed = 11) {
  const definition = WORLD_SCALE_FOUNDATION;
  const physical = createPhysicalState({
    width: definition.width,
    height: definition.height,
    terrain: makeEmptyWorldTerrain(definition.width, definition.height),
    startFocus: definition.startFocus,
  });
  const world = createWorld({
    seed,
    physicalState: physical,
    market: { ...definition.startFocus },
    logisticsSites: {},
  });
  for (let index = 0; index < definition.households; index += 1) {
    const column = index % 15;
    const row = Math.floor(index / 15);
    // 空地形で資源探索職を走らせると「資源なし全域走査」の測定になり、B-0の
    // 世界寸法・人口・描画負荷スパイクと目的が混ざる。中立な畑世帯に固定する。
    const job = "wheat";
    const x = 54 + column * 5;
    const y = 92 + row * 5;
    const buildingX = x;
    const buildingY = y;
    const entrance = { x: x + 1, y: y - 1 };
    const placed = addBuilding(physical, job, buildingX, buildingY, {
      definitions: ECONOMIC_BUILDINGS,
      entrance,
      requireRoad: false,
    });
    if (!placed.ok) throw new Error(`B-0世帯fixture配置不可: ${index}/${placed.reason}`);
    const household = createHousehold(world.state.economy, { job, ...entrance });
    household.members = household.members.slice(0, definition.peoplePerHousehold);
    household.buildingId = placed.building.id;
    placed.building.ownerHouseholdId = household.id;
    placed.building.marketId = "main";
    placed.building.constructionConsumed = true;
  }
  return world;
}

export const CARAVAN_SLICE_PROVISION_DAYS = 360;
export const CARAVAN_SLICE_CARTWRIGHT_PROVISION_DAYS = 420;
export const CARAVAN_SLICE_CARTWRIGHT_START_CARTS = Math.ceil(
  CARAVAN_SLICE_CARTWRIGHT_PROVISION_DAYS / P.CART_WORK_DAYS,
);
export const CARAVAN_SLICE_CARTWRIGHT_OWN_TOOLS = (
  Math.ceil(CARAVAN_SLICE_CARTWRIGHT_PROVISION_DAYS / P.WORK_TOOL_WOOD_DAYS)
    * P.WORK_TOOL_WOOD_COST
  + CARAVAN_SLICE_CARTWRIGHT_PROVISION_DAYS * P.D_TOOL
);
export const CARAVAN_SLICE_SALTWORKS_CHARCOAL = 360;
// 2人世帯ではなく「募集2人」に対する一人分の日給。
// 2台16荷の往復便が価格差を拾えば黒字化を狙える初期値にする。
export const CARAVAN_SLICE_INN_EMPLOYMENT = Object.freeze({ recruitment: 2, wage: 0.75 });
export const CARAVAN_SLICE_MARKETS = Object.freeze({
  main: Object.freeze({ id: "main", name: "母港市場", entrance: Object.freeze({ x: 31, y: 51 }) }),
  fishery: Object.freeze({ id: "fishery", name: "漁郷市場", entrance: Object.freeze({ x: 78, y: 51 }) }),
});

const CARAVAN_FISHERY_LAYOUT = Object.freeze([
  Object.freeze(["fisher", 67, 58, 66, 55]),
  Object.freeze(["fisher", 71, 58, 70, 55]),
  Object.freeze(["fisher", 85, 58, 84, 55]),
  Object.freeze(["saltworks", 87, 51, 88, 50]),
]);

const CARAVAN_INN_LAYOUT = Object.freeze(["carter", 42, 44, 42, 41]);
const CARAVAN_CARTWRIGHT_LAYOUT = Object.freeze(["cartwright", 45, 42, 46, 41]);
// 人口200級の母港で、木工房2軒×木こり3軒 + 炭焼き1軒×木こり1軒を満たす。
// 荷車工房はこの余力から日量0.5荷の丸太を使い、隊商の消耗品需要へつなぐ。
const CARAVAN_MAIN_EXPANSION_LAYOUT = Object.freeze([
  Object.freeze(["logger", 39, 37, 38, 34]),
  Object.freeze(["logger", 43, 37, 42, 34]),
  Object.freeze(["logger", 47, 37, 46, 34]),
  Object.freeze(["logger", 39, 32, 38, 29]),
  Object.freeze(["logger", 43, 32, 42, 29]),
  Object.freeze(["logger", 47, 32, 46, 29]),
  Object.freeze(["woodshop", 39, 37, 38, 38]),
  Object.freeze(["cartwright", 43, 37, 42, 38]),
]);

const CARAVAN_FISHERY_MARKET_SITE = Object.freeze({ x: 76, y: 52 });
const CARAVAN_ROAD_POLYLINES = Object.freeze([
  Object.freeze([[31, 51], [52, 51], [52, 40], [61, 40], [67, 51], [78, 51]]),
  Object.freeze([[67, 58], [69, 58], [69, 51], [78, 51]]),
  Object.freeze([[71, 58], [69, 58]]),
  Object.freeze([[85, 58], [82, 58], [82, 51], [78, 51]]),
  Object.freeze([[78, 51], [87, 51]]),
  Object.freeze([[38, 44], [42, 44], [45, 44], [45, 42]]),
  Object.freeze([[38, 37], [61, 37]]),
  Object.freeze([[38, 32], [50, 32], [50, 37], [61, 37]]),
]);

function clearCaravanRectangle(terrain, x, y, width, height) {
  for (let offsetY = 0; offsetY < height; offsetY += 1) {
    for (let offsetX = 0; offsetX < width; offsetX += 1) {
      const tile = terrain[y + offsetY]?.[x + offsetX];
      if (tile && tile.kind !== "water") tile.kind = "grass";
    }
  }
}

function makeCaravanSliceTerrain(mainPlan) {
  const { width, height } = CARAVAN_SLICE_SIZE;
  const terrain = makeMultiMarketTerrain(width, height);
  for (const [type, site] of Object.entries(mainPlan.logisticsSites)) {
    const definition = ECONOMIC_BUILDINGS[type];
    clearCaravanRectangle(terrain, site.x, site.y, definition.w, definition.h);
  }
  for (const [job, , , buildingX, buildingY] of mainPlan.layout) {
    const definition = ECONOMIC_BUILDINGS[job];
    clearCaravanRectangle(terrain, buildingX, buildingY, definition.w, definition.h);
    if (definition.fertile) {
      markFertileArea(terrain, buildingX, buildingY, definition.w, definition.h);
    }
  }
  clearCaravanRectangle(
    terrain,
    CARAVAN_INN_LAYOUT[3],
    CARAVAN_INN_LAYOUT[4],
    ECONOMIC_BUILDINGS.carter.w,
    ECONOMIC_BUILDINGS.carter.h,
  );
  clearCaravanRectangle(
    terrain,
    CARAVAN_CARTWRIGHT_LAYOUT[3],
    CARAVAN_CARTWRIGHT_LAYOUT[4],
    ECONOMIC_BUILDINGS.cartwright.w,
    ECONOMIC_BUILDINGS.cartwright.h,
  );
  for (const [job, , , buildingX, buildingY] of CARAVAN_MAIN_EXPANSION_LAYOUT) {
    const definition = ECONOMIC_BUILDINGS[job];
    clearCaravanRectangle(terrain, buildingX, buildingY, definition.w, definition.h);
  }
  clearCaravanRectangle(
    terrain,
    CARAVAN_FISHERY_MARKET_SITE.x,
    CARAVAN_FISHERY_MARKET_SITE.y,
    ECONOMIC_BUILDINGS.market.w,
    ECONOMIC_BUILDINGS.market.h,
  );
  for (const [job, , , buildingX, buildingY] of CARAVAN_FISHERY_LAYOUT) {
    const definition = ECONOMIC_BUILDINGS[job];
    clearCaravanRectangle(terrain, buildingX, buildingY, definition.w, definition.h);
  }
  return terrain;
}

function addScenarioRoads(physical, polylines, label) {
  for (const polyline of polylines) {
    for (let index = 1; index < polyline.length; index += 1) {
      const [fromX, fromY] = polyline[index - 1];
      const [toX, toY] = polyline[index];
      const road = addRoadLine(physical, { x: fromX, y: fromY }, { x: toX, y: toY });
      if (!road.ok && !road.cells.every(({ x, y }) => hasRoad(physical, x, y))) {
        throw new Error(`${label}の道路敷設不可: ${fromX},${fromY}→${toX},${toY}`);
      }
    }
  }
}

function occupyScenarioZone(world, zone, marketId) {
  const { economy, physical } = world.state;
  const household = createHousehold(economy, { job: zone.job, x: zone.x, y: zone.y });
  household.buildingId = zone.buildingId;
  household.marketId = marketId;
  zone.filled = true;
  const building = buildingById(physical, zone.buildingId);
  if (building) {
    building.ownerHouseholdId = household.id;
    building.marketId = marketId;
    building.constructionConsumed = true;
  }
  return household;
}

export function buildCaravanSliceWorld(seed) {
  const stablePlan = makeStableCityPlan(CARAVAN_SLICE_MARKETS.main.entrance);
  const mainLayout = Object.freeze(stablePlan.layout.filter(([job]) => job !== "fisher"));
  const mainPlan = {
    ...stablePlan,
    // 漁郷の帰り荷が母港の実需要を満たす。母港にも漁師を置くと同じ魚が競合し、
    // 価格差でなく初期配置だけを理由に帰り荷が無意味になるため、この開始条件では置かない。
    layout: mainLayout,
    logisticsSites: {
      ...stablePlan.logisticsSites,
      port: {
        x: stablePlan.logisticsSites.port.x,
        y: 57,
        entrance: { x: stablePlan.logisticsSites.port.entrance.x, y: 56 },
      },
    },
  };
  const { width, height } = CARAVAN_SLICE_SIZE;
  const physical = createPhysicalState({
    width,
    height,
    terrain: makeCaravanSliceTerrain(mainPlan),
  });
  const world = createWorld({
    seed,
    initialCompanyMoney: P.TREASURY0
      + P.BUILD_COST * (
        CARAVAN_FISHERY_LAYOUT.length + CARAVAN_MAIN_EXPANSION_LAYOUT.length
      ),
    physicalState: physical,
    market: { ...mainPlan.logisticsSites.market.entrance },
    warehouse: { ...mainPlan.logisticsSites.warehouse.entrance },
    port: { ...mainPlan.logisticsSites.port.entrance },
    logisticsSites: mainPlan.logisticsSites,
    marketNetwork: {
      markets: [CARAVAN_SLICE_MARKETS.main, CARAVAN_SLICE_MARKETS.fishery],
    },
  });
  const { economy } = world.state;
  const mainLogistics = ensureCompanyLogisticsSites(economy, physical);
  const mainRecord = world.state.marketNetwork.markets.find(
    (market) => market.id === CARAVAN_SLICE_MARKETS.main.id,
  );
  mainRecord.buildingId = mainLogistics.market.id;
  mainLogistics.market.marketId = CARAVAN_SLICE_MARKETS.main.id;
  for (const [job, x, y, buildingX, buildingY] of mainPlan.layout) {
    if (!addAuditZone(world, job, x, y, buildingX, buildingY)) {
      throw new Error(`母港圏の配置不可: ${job}@${x},${y}`);
    }
  }
  if (!addAuditZone(world, ...CARAVAN_INN_LAYOUT)) {
    throw new Error(`母港圏の隊商宿配置不可: ${CARAVAN_INN_LAYOUT[1]},${CARAVAN_INN_LAYOUT[2]}`);
  }
  if (!addAuditZone(world, ...CARAVAN_CARTWRIGHT_LAYOUT)) {
    throw new Error(
      `母港圏の荷車工房配置不可: ${CARAVAN_CARTWRIGHT_LAYOUT[1]},${CARAVAN_CARTWRIGHT_LAYOUT[2]}`,
    );
  }
  for (const layout of CARAVAN_MAIN_EXPANSION_LAYOUT) {
    if (!addAuditZone(world, ...layout)) {
      throw new Error(`母港圏の増設配置不可: ${layout[0]}@${layout[1]},${layout[2]}`);
    }
  }

  const unlimited = Object.fromEntries(GOODS.map((goods) => [goods, Number.MAX_SAFE_INTEGER]));
  const fisheryMarket = addBuilding(
    physical,
    "market",
    CARAVAN_FISHERY_MARKET_SITE.x,
    CARAVAN_FISHERY_MARKET_SITE.y,
    {
      definitions: ECONOMIC_BUILDINGS,
      fixed: true,
      requireRoad: false,
      entrance: { ...CARAVAN_SLICE_MARKETS.fishery.entrance },
      roles: [`market:${CARAVAN_SLICE_MARKETS.fishery.id}`],
      marketId: CARAVAN_SLICE_MARKETS.fishery.id,
      caps: { inbound: unlimited, outbound: unlimited, pickup: unlimited },
    },
  );
  if (!fisheryMarket.ok) throw new Error(`漁郷市場の配置不可: ${fisheryMarket.reason}`);
  const fisheryRecord = world.state.marketNetwork.markets.find(
    (market) => market.id === CARAVAN_SLICE_MARKETS.fishery.id,
  );
  fisheryRecord.buildingId = fisheryMarket.building.id;
  const fisheryZoneStart = economy.zones.length;
  for (const [job, x, y, buildingX, buildingY] of CARAVAN_FISHERY_LAYOUT) {
    if (!addAuditZone(world, job, x, y, buildingX, buildingY)) {
      const check = canPlaceBuilding(physical, job, buildingX, buildingY, {
        definitions: ECONOMIC_BUILDINGS,
        entrance: { x, y },
        requireRoad: false,
      });
      throw new Error(
        `漁郷の配置不可: ${job}@${x},${y}/${check.reason ?? "資金不足"}`,
      );
    }
  }
  addScenarioRoads(physical, mainPlan.roadPolylines, "母港圏");
  addScenarioRoads(physical, [[[34, 55], [34, 56]]], "母港圏");
  addScenarioRoads(physical, CARAVAN_ROAD_POLYLINES, "母港・漁郷間");

  const mainZones = economy.zones.slice(0, fisheryZoneStart);
  const fisheryZones = economy.zones.slice(fisheryZoneStart);
  const mainHouseholds = mainZones.map((zone) => occupyScenarioZone(world, zone, "main"));
  const fisheryHouseholds = fisheryZones.map(
    (zone) => occupyScenarioZone(world, zone, CARAVAN_SLICE_MARKETS.fishery.id),
  );
  const motherProvision = mainHouseholds[0];
  const caravanInnZone = mainZones.find((zone) => zone.job === "carter");
  const caravanInn = buildingById(physical, caravanInnZone?.buildingId);
  const employment = setCaravanEmployment(physical, {
    buildingId: caravanInn?.id,
    ...CARAVAN_SLICE_INN_EMPLOYMENT,
  });
  if (!employment.ok) throw new Error(`隊商宿の雇用設定不可: ${employment.reason}`);
  const cartwrightHouseholds = mainHouseholds.filter(
    (household) => household.job === "cartwright",
  );
  if (cartwrightHouseholds.length < 2) throw new Error("母港圏の荷車工房世帯が不足しています");
  for (const household of cartwrightHouseholds) {
    const cartwrightBuilding = buildingById(physical, household.buildingId);
    for (const [goods, qty] of [
      ["log", P.CART_LOG * CARAVAN_SLICE_CARTWRIGHT_START_CARTS],
      [
        "tools",
        P.CART_TOOLS * CARAVAN_SLICE_CARTWRIGHT_START_CARTS
          + CARAVAN_SLICE_CARTWRIGHT_OWN_TOOLS,
      ],
    ]) {
      depositInventory(cartwrightBuilding, "input", goods, qty);
      recordEconomicMaterialFlow(
        economy,
        goods,
        "imp",
        qty,
        `母港荷車工房${household.id}の入植時${goods}`,
        { includeInDaily: false },
      );
    }
  }
  for (const household of mainHouseholds) {
    const provisionDays = household.job === "cartwright"
      ? CARAVAN_SLICE_CARTWRIGHT_PROVISION_DAYS
      : CARAVAN_SLICE_PROVISION_DAYS;
    const provision = household.members.length * provisionDays;
    household.pantry.wheat += provision;
    recordEconomicMaterialFlow(
      economy,
      "wheat",
      "imp",
      provision,
      `母港世帯${household.id}の入植時保存食`,
      { includeInDaily: false },
    );
  }
  for (const household of fisheryHouseholds) {
    motherProvision.pantry.wheat += household.pantry.wheat;
    household.pantry.wheat = 0;
    const preservedFood = household.members.length * CARAVAN_SLICE_PROVISION_DAYS;
    household.pantry.pres += preservedFood;
    recordEconomicMaterialFlow(
      economy,
      "pres",
      "imp",
      preservedFood,
      `漁郷世帯${household.id}の入植時保存食`,
      { includeInDaily: false },
    );
    household.marketEntrance = { ...CARAVAN_SLICE_MARKETS.fishery.entrance };
    household.marketBuildingId = fisheryMarket.building.id;
    if (household.job === "saltworks") {
      depositInventory(
        buildingById(physical, household.buildingId),
        "input",
        "char",
        CARAVAN_SLICE_SALTWORKS_CHARCOAL,
      );
      recordEconomicMaterialFlow(
        economy,
        "char",
        "imp",
        CARAVAN_SLICE_SALTWORKS_CHARCOAL,
        `漁郷世帯${household.id}の入植時燃料`,
        { includeInDaily: false },
      );
    }
  }
  economy.jobSelectionPool = [...new Set([
    ...E_STABLE_JOBS,
    "carter",
    "cartwright",
    ...CARAVAN_FISHERY_LAYOUT.map(([job]) => job),
  ])];
  world.state.caravanSlice = {
    id: "two-markets",
    mainMarketId: CARAVAN_SLICE_MARKETS.main.id,
    fisheryMarketId: CARAVAN_SLICE_MARKETS.fishery.id,
    innBuildingId: caravanInn.id,
  };
  return world;
}

// 新規教程は、母港を空のまま始めつつ、峠向こうの漁郷だけを初期条件として
// 実在させる。同じ96×64の島を育てた末に二市場を結ぶための開始世界であり、
// 途中で集落や在庫を生成する教程専用イベントは使わない。
export function buildTutorialTwoMarketWorld(seed) {
  const stablePlan = makeStableCityPlan(CARAVAN_SLICE_MARKETS.main.entrance);
  const portSite = {
    x: stablePlan.logisticsSites.port.x,
    y: 57,
    entrance: { x: stablePlan.logisticsSites.port.entrance.x, y: 56 },
  };
  const mainPlan = {
    ...stablePlan,
    logisticsSites: { ...stablePlan.logisticsSites, port: portSite },
  };
  const physical = createPhysicalState({
    ...CARAVAN_SLICE_SIZE,
    terrain: makeCaravanSliceTerrain(mainPlan),
  });
  const world = createWorld({
    seed,
    initialCompanyMoney: P.TREASURY0 + P.BUILD_COST * CARAVAN_FISHERY_LAYOUT.length,
    physicalState: physical,
    market: { ...CARAVAN_SLICE_MARKETS.main.entrance },
    port: { ...portSite.entrance },
    logisticsSites: { port: portSite },
    marketNetwork: {
      markets: [CARAVAN_SLICE_MARKETS.main, CARAVAN_SLICE_MARKETS.fishery],
    },
  });
  const { economy } = world.state;
  ensureCompanyLogisticsSites(economy, physical);

  const unlimited = Object.fromEntries(GOODS.map((goods) => [goods, Number.MAX_SAFE_INTEGER]));
  const fisheryMarket = addBuilding(
    physical,
    "market",
    CARAVAN_FISHERY_MARKET_SITE.x,
    CARAVAN_FISHERY_MARKET_SITE.y,
    {
      definitions: ECONOMIC_BUILDINGS,
      fixed: true,
      requireRoad: false,
      entrance: { ...CARAVAN_SLICE_MARKETS.fishery.entrance },
      roles: [`market:${CARAVAN_SLICE_MARKETS.fishery.id}`],
      marketId: CARAVAN_SLICE_MARKETS.fishery.id,
      caps: { inbound: unlimited, outbound: unlimited, pickup: unlimited },
    },
  );
  if (!fisheryMarket.ok) throw new Error(`教程漁郷市場の配置不可: ${fisheryMarket.reason}`);
  const fisheryRecord = world.state.marketNetwork.markets.find(
    (market) => market.id === CARAVAN_SLICE_MARKETS.fishery.id,
  );
  fisheryRecord.buildingId = fisheryMarket.building.id;

  for (const [job, x, y, buildingX, buildingY] of CARAVAN_FISHERY_LAYOUT) {
    if (!addAuditZone(world, job, x, y, buildingX, buildingY)) {
      throw new Error(`教程漁郷の配置不可: ${job}@${x},${y}`);
    }
  }
  addScenarioRoads(physical, [[[34, 55], [34, 56]]], "教程母港");
  addScenarioRoads(physical, CARAVAN_ROAD_POLYLINES.slice(0, 5), "教程峠道");

  const fisheryHouseholds = economy.zones.map(
    (zone) => occupyScenarioZone(world, zone, CARAVAN_SLICE_MARKETS.fishery.id),
  );
  for (const household of fisheryHouseholds) {
    const removedWheat = household.pantry.wheat;
    household.pantry.wheat = 0;
    recordEconomicMaterialFlow(
      economy,
      "wheat",
      "exp",
      removedWheat,
      `教程漁郷世帯${household.id}の開拓キット差替`,
      { includeInDaily: false },
    );
    const preservedFood = household.members.length * CARAVAN_SLICE_PROVISION_DAYS;
    household.pantry.pres += preservedFood;
    recordEconomicMaterialFlow(
      economy,
      "pres",
      "imp",
      preservedFood,
      `教程漁郷世帯${household.id}の入植時保存食`,
      { includeInDaily: false },
    );
    household.marketEntrance = { ...CARAVAN_SLICE_MARKETS.fishery.entrance };
    household.marketBuildingId = fisheryMarket.building.id;
    if (household.job === "saltworks") {
      depositInventory(
        buildingById(physical, household.buildingId),
        "input",
        "char",
        CARAVAN_SLICE_SALTWORKS_CHARCOAL,
      );
      recordEconomicMaterialFlow(
        economy,
        "char",
        "imp",
        CARAVAN_SLICE_SALTWORKS_CHARCOAL,
        `教程漁郷世帯${household.id}の入植時燃料`,
        { includeInDaily: false },
      );
    }
  }

  // 凍結した操作骨子は宿→雇用→路線であり、荷車工房を途中追加しない。
  // そのため開拓会社の貸与物を初期資産として一台だけ置く。以後の摩耗・破損・
  // 代替購入は本編と同じ規則で処理される。
  economy.companyCarts.push({
    id: `wood-cart-${economy.nextCartAssetId}`,
    kind: "wood",
    durability: P.CART_WOOD_DURABILITY,
    maxDurability: P.CART_WOOD_DURABILITY,
    price: 0,
    makerHouseholdId: null,
    ownerKind: "company",
    ownerId: "company",
    purchasedDay: 0,
    busyJobId: null,
    origin: "tutorial-charter",
    reservedFor: "caravan",
  });
  economy.nextCartAssetId += 1;
  economy.jobSelectionPool = [...new Set([
    ...E_STABLE_JOBS,
    "carter",
    "cartwright",
    ...CARAVAN_FISHERY_LAYOUT.map(([job]) => job),
  ])];
  world.state.caravanSlice = {
    id: "tutorial-two-markets",
    mainMarketId: CARAVAN_SLICE_MARKETS.main.id,
    fisheryMarketId: CARAVAN_SLICE_MARKETS.fishery.id,
    charterCartAssetId: economy.companyCarts[0].id,
  };
  return world;
}

export const E_STABLE_BAD_MARKET_ANCHOR = Object.freeze({ x: 50, y: 28 });
export const E_STABLE_BAD_MIN_PATH = 25;
export const E_STABLE_BAD_FAMINE_RATIO_MIN = 1.25;
export const E_STABLE_BAD_POPULATION_RATIO_MAX = 0.8;

function findBadSettlementSite(world, job) {
  const { economy, physical } = world.state;
  const minimumX = Math.max(1, economy.market.x - 46);
  const maximumX = Math.min(physical.width - 2, economy.market.x - 20);
  const minimumY = Math.max(1, economy.market.y - 12);
  const maximumY = Math.min(physical.height - 2, economy.market.y + 4);
  for (let y = maximumY; y >= minimumY; y -= 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      if (pathLen(physical, { x, y }, economy.market, "walk") <= E_STABLE_BAD_MIN_PATH) continue;
      if (canPlaceSettlement(economy, physical, job, x, y)[0]) return [x, y];
    }
  }
  return null;
}

export function buildBadCity(
  seed,
  { marketEntrance = E_STABLE_BAD_MARKET_ANCHOR, width = 64, height = 40 } = {},
) {
  const logisticsSites = Object.freeze({
    market: Object.freeze({
      x: marketEntrance.x - 2,
      y: marketEntrance.y + 1,
      entrance: Object.freeze({ ...marketEntrance }),
    }),
    warehouse: Object.freeze({
      x: marketEntrance.x - 6,
      y: marketEntrance.y + 1,
      entrance: Object.freeze({ x: marketEntrance.x - 7, y: marketEntrance.y + 2 }),
    }),
    port: Object.freeze({
      x: marketEntrance.x - 22,
      y: marketEntrance.y + 5,
      entrance: Object.freeze({ x: marketEntrance.x - 22, y: marketEntrance.y + 4 }),
    }),
  });
  const world = createAuditCity(seed, [], {
    logisticsSites,
    roadPolylines: [],
    width,
    height,
  });
  // 悪配置対照も本編と同じ農地制約を守る。市場から遠い西側だけを肥沃地にし、
  // 距離による失敗を「農場が置けない」という別要因へすり替えない。
  markFertileArea(world.state.physical.terrain, 3, 20, 28, 16);
  for (const [job] of E_STABLE_RELATIVE_LAYOUT) {
    const site = findBadSettlementSite(world, job);
    if (!site || !addAuditZone(world, job, site[0], site[1])) {
      throw new Error(`悪配置対照の配置不可: ${job}`);
    }
  }
  for (const zone of world.state.economy.zones) {
    const distance = pathLen(world.state.physical, zone, world.state.economy.market, "walk");
    if (!(distance > E_STABLE_BAD_MIN_PATH)) {
      throw new Error(`悪配置のpathLenが近すぎます: ${zone.job}=${distance}`);
    }
  }
  return world;
}

function placeIronAuditHouseholds(world) {
  const { economy } = world.state;
  economy.jobSelectionPool = [
    ...LEGACY_AUDIT_JOBS,
    ...IRON_AUDIT_SITES.map(({ job }) => job),
  ];
  for (const site of IRON_AUDIT_SITES) {
    let { x, y, buildingX, buildingY } = site;
    if (!canPlaceSettlement(economy, world.state.physical, site.job, x, y)[0] && !site.roadTarget) {
      const fallback = findAuditSpot(world, site.job);
      if (fallback) {
        [x, y] = fallback;
        buildingX = null;
        buildingY = null;
      }
    }
    if (!addAuditZone(world, site.job, x, y, buildingX, buildingY)) {
      throw new Error(`鉄監査の配置不可: ${site.job}@${x},${y}`);
    }
    const zone = economy.zones.at(-1);
    zone.filled = true;
    const household = createHousehold(economy, { job: site.job, x, y });
    household.buildingId = zone.buildingId;
  }
}

function ensureMatureAuditHouseholds(world) {
  const { economy, physical } = world.state;
  while (economy.households.length < IRON_DEMAND_HOUSEHOLDS) {
    let zone = economy.zones.find((candidate) => !candidate.filled);
    if (!zone) {
      const spot = findAuditSpot(world, "veg");
      if (!spot || !addAuditZone(world, "veg", spot[0], spot[1])) {
        throw new Error("Lv4成熟世帯4軒を配置できません");
      }
      zone = economy.zones.at(-1);
    }
    const household = createHousehold(economy, { job: zone.job, x: zone.x, y: zone.y });
    household.buildingId = zone.buildingId;
    zone.filled = true;
    const building = buildingById(physical, zone.buildingId);
    if (building) building.ownerHouseholdId = household.id;
  }
}

export function createIronAuditWorld(
  seed,
  { depositRoads = true, placeHouseholds = true } = {},
) {
  const world = createAuditWorld(seed);
  const { economy, physical } = world.state;
  economy.reservedBuildingSites = IRON_AUDIT_SITES.map((site) => ({ ...site }));
  for (const [from, to] of [
    [{ x: 40, y: 27 }, { x: 41, y: 27 }],
    [{ x: 41, y: 27 }, { x: 41, y: 25 }],
    [{ x: 41, y: 27 }, { x: 41, y: 29 }],
  ]) {
    const road = addRoadLine(physical, from, to);
    if (!road.ok && !road.cells.every((cell) => hasRoad(physical, cell.x, cell.y))) {
      throw new Error(`鉄監査の町内道路敷設不可: ${to.x},${to.y}`);
    }
  }
  if (depositRoads) {
    const depositPolylines = [
      [[8, 25], [13, 26], [13, 30], [14, 31]],
      [[5, 30], [13, 30]],
    ];
    for (const polyline of depositPolylines) {
      for (let index = 1; index < polyline.length; index += 1) {
        const [fromX, fromY] = polyline[index - 1];
        const [toX, toY] = polyline[index];
        const road = addRoadLine(physical, { x: fromX, y: fromY }, { x: toX, y: toY });
        if (!road.ok && !road.cells.every((cell) => hasRoad(physical, cell.x, cell.y))) {
          throw new Error(`鉄監査の鉱床道路敷設不可: ${toX},${toY}`);
        }
      }
    }
  }
  if (placeHouseholds) placeIronAuditHouseholds(world);
  return world;
}

export function findAuditSpot(world, job) {
  const { economy, physical } = world.state;
  const marketX = economy.market.x;
  const marketY = economy.market.y;
  for (let radius = 2; radius < 26; radius += 1) {
    for (let angle = 0; angle < 24; angle += 1) {
      const radians = angle / 24 * 6.283;
      const x = Math.round(marketX + Math.cos(radians) * radius);
      const y = Math.round(marketY + Math.sin(radians) * radius);
      const [ok] = canPlaceSettlement(economy, physical, job, x, y);
      const crowdedLogger = job === "logger" && economy.households.some(
        (household) => household.job === "logger" && Math.hypot(household.x - x, household.y - y) < 6,
      );
      if (
        ok
        && !crowdedLogger
        && !economy.zones.some((zone) => Math.abs(zone.x - x) < 1.5 && Math.abs(zone.y - y) < 1.5)
        && !economy.households.some(
          (household) => Math.abs(household.x - x) < 1.5 && Math.abs(household.y - y) < 1.5,
        )
      ) return [x, y];
    }
  }
  return null;
}

export function auditPopulation(economy) {
  return economy.households.reduce((total, household) => total + household.members.length, 0);
}

function setPlayerStockTargets(economy) {
  let changed = false;
  for (const goods of COMPANY_ORDER_GOODS) {
    const target = economy.order?.g === goods
      ? Math.ceil((economy.stock[goods] ?? 0) + economy.order.left)
      : 0;
    if ((economy.stockTgt[goods] ?? 0) !== target) {
      economy.stockTgt[goods] = target;
      changed = true;
    }
  }
  const wheatTarget = Math.round(auditPopulation(economy) * 2);
  if ((economy.stockTgt.wheat ?? 0) !== wheatTarget) {
    economy.stockTgt.wheat = wheatTarget;
    changed = true;
  }
  return changed;
}

function cheapestOrderGoods(economy, goods) {
  return economy.stalls[goods]
    .filter((stall) => stall.qty > 1e-9)
    .reduce((cheapest, stall) => Math.min(cheapest, stall.price), Infinity);
}

function acceptProfitableOrder(economy, day) {
  const offer = economy.orderOffer;
  if (!offer) return null;
  const cheapest = cheapestOrderGoods(economy, offer.g);
  if (cheapest > offer.price * 1.25) return null;
  return acceptCompanyOrder(economy, { day });
}

function countJobAndZones(economy, job) {
  return economy.households.filter((household) => household.job === job).length
    + economy.zones.filter((zone) => !zone.filled && zone.job === job).length;
}

export function mimicPlayer(world, day = world.state.day + 1) {
  const { economy } = world.state;
  const acceptedOrder = acceptProfitableOrder(economy, day);
  let stockTargetsUpdated = false;
  let rebuilt = null;
  const staleOrderTarget = !economy.order && COMPANY_ORDER_GOODS.some(
    (goods) => (economy.stockTgt[goods] ?? 0) > 0,
  );
  if (day % 5 === 0 || acceptedOrder || staleOrderTarget) {
    setPlayerStockTargets(economy);
    stockTargetsUpdated = true;
  }
  if (day % 90 === 0 && economy.company.money * 10 > 8000) {
    for (const job of ["woodshop", "charburner", "saltworks"]) {
      if (countJobAndZones(economy, job) >= 1) continue;
      const spot = findAuditSpot(world, job);
      if (spot && addAuditZone(world, job, spot[0], spot[1])) rebuilt = job;
      if (spot) break;
    }
  }
  return { stockTargetsUpdated, acceptedOrder, rebuilt };
}

function addResult(results, id, name, passed, detail) {
  results.push({ id, name, passed: Boolean(passed), detail });
}

function averageBySeason(log, predicate) {
  const values = log.filter(([month]) => predicate(month)).map(([, value]) => value);
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;
}

function runScenarioA() {
  const worlds = [];
  const stallAverage = {};
  const famineByYear = [[], [], [], []];
  const priceLog = { fish: [], char: [] };
  const stuck = {};
  const stuckRun = {};
  const earlyWheatSwitch = [];
  const plan = { 13: "wheat", 16: "logger", 20: "fisher", 26: "woodshop", 30: "rapeseed" };

  for (const seed of AUDIT_SEEDS) {
    const world = createAuditWorld(seed);
    const { economy } = world.state;
    for (let day = 1; day <= 1440; day += 1) {
      if (day % 30 === 1) {
        const month = Math.floor(day / 30) + 1;
        if (plan[month]) {
          const spot = findAuditSpot(world, plan[month]);
          if (spot) addAuditZone(world, plan[month], spot[0], spot[1]);
        }
      }
      if (day % 5 === 0) setPlayerStockTargets(economy);
      if (day % 90 === 0 && economy.company.money * 10 > 8000) {
        for (const job of ["woodshop", "charburner", "saltworks"]) {
          if (countJobAndZones(economy, job) >= 1) continue;
          const spot = findAuditSpot(world, job);
          if (spot) {
            addAuditZone(world, job, spot[0], spot[1]);
            break;
          }
        }
      }
      world.step();
      for (const [eventDay, message] of economy.events) {
        if (
          eventDay === day
          && day < 255
          && message.startsWith("破綻転職: wheat")
          && !earlyWheatSwitch.some(([knownSeed, knownDay, known]) => (
            knownSeed === seed && knownDay === day && known === message
          ))
        ) earlyWheatSwitch.push([seed, day, message]);
      }
      for (const goods of ["wheat", "meat", "tools", "veg"]) {
        const qty = economy.stalls[goods].reduce((total, stall) => total + stall.qty, 0);
        stallAverage[goods] = (stallAverage[goods] ?? 0) + qty / 1440 / AUDIT_SEEDS.length;
      }
      if (day % 360 === 0) famineByYear[day / 360 - 1].push(economy.famine);
      const month = ((Math.floor((day - 1) / 30)) % 12) + 1;
      for (const goods of Object.keys(priceLog)) {
        const prices = economy.prices[goods];
        if (prices.length > 0 && prices.at(-1)[0] === day) {
          priceLog[goods].push([month, prices.at(-1)[1]]);
        }
      }
      for (const household of economy.households) {
        const key = `${seed}_${household.id}`;
        if (household.purse < -2.5) {
          const run = (stuckRun[key] ?? 0) + 1;
          stuckRun[key] = run;
          stuck[key] = Math.max(stuck[key] ?? 0, run);
        } else {
          stuckRun[key] = 0;
        }
      }
    }
    worlds.push(world);
  }
  return {
    worlds,
    stallAverage,
    famineByYear,
    priceLog,
    stuck,
    earlyWheatSwitch,
  };
}

function runAdvisorScenario() {
  const world = createAuditWorld(12);
  const { economy, physical } = world.state;
  const builds = [];
  for (let day = 1; day <= 1440; day += 1) {
    if (day % 5 === 0) setPlayerStockTargets(economy);
    world.step();
    if (day % 90 !== 0 || builds.length >= 10 || economy.company.money * 10 <= 15000) continue;
    const flow = (goods) => economy.f30[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    const poorCount = economy.households.filter((household) => household.purse < 5).length;
    const debt = Math.max(0, -economy.company.money);
    const month = Math.floor(day / 30) + 1;
    let recommendation = null;
    if (countJobAndZones(economy, "fisher") < 2) recommendation = "fisher";
    else if (countJobAndZones(economy, "veg") < 1) recommendation = "veg";
    else if (
      (flow("wheat").imp > 8 || economy.hungryN >= 3)
      && countJobAndZones(economy, "wheat") < Math.ceil(auditPopulation(economy) / 42)
    ) recommendation = "wheat";
    else if (countJobAndZones(economy, "woodshop") < 1) recommendation = "woodshop";
    else if (countJobAndZones(economy, "charburner") < 1) recommendation = "charburner";
    else if (countJobAndZones(economy, "saltworks") < 1) recommendation = "saltworks";
    else if (
      economy.households.some(
        (household) => household.job === "logger" && localWood(economy, physical, household) < 0.1,
      )
      && builds.filter((job) => job === "logger").length < 2
    ) recommendation = "logger";
    else if (debt > companyCreditLimit(economy, { day }) * 0.3) recommendation = null;
    else if (
      month > 18
      && poorCount >= economy.households.length * 0.45
      && countJobAndZones(economy, "rapeseed") < 2
    ) recommendation = "rapeseed";
    else if (flow("salt").imp > 0.5) recommendation = "saltworks";
    else if (flow("tools").imp > 0.5) recommendation = "woodshop";
    if (recommendation) {
      const spot = findAuditSpot(world, recommendation);
      if (spot && addAuditZone(world, recommendation, spot[0], spot[1])) builds.push(recommendation);
    }
  }
  return { world, builds };
}

function runBuildingRhythmScenario() {
  const list = ["wheat", "wheat", "charburner", "saltworks", "logger"];
  const result = {};
  for (const mode of ["lump", "paced"]) {
    const world = createAuditWorld(12);
    const { economy } = world.state;
    let buildIndex = 0;
    for (let day = 1; day <= 1440; day += 1) {
      if (day % 5 === 0) setPlayerStockTargets(economy);
      if (mode === "lump" && day === 120) {
        for (const job of list) {
          const spot = findAuditSpot(world, job);
          if (spot) addAuditZone(world, job, spot[0], spot[1]);
        }
      }
      if (
        mode === "paced"
        && day % 90 === 0
        && buildIndex < list.length
        && economy.company.money * 10 > 15000
      ) {
        const spot = findAuditSpot(world, list[buildIndex]);
        if (spot && addAuditZone(world, list[buildIndex], spot[0], spot[1])) buildIndex += 1;
      }
      world.step();
    }
    result[mode] = {
      famine: economy.famine,
      population: auditPopulation(economy),
      fee: economy.co.fee,
    };
  }
  return result;
}

function runMaterialAudit() {
  const world = createAuditWorld(11);
  const { economy, physical } = world.state;
  const goodsList = ["wheat", "log", "salt", "tools"];
  const total = (snapshot, goods) => {
    return (snapshot.inventory[goods] ?? 0) + (snapshot.cargo[goods] ?? 0);
  };
  const unexplained = Object.fromEntries(goodsList.map((goods) => [goods, 0]));
  const flows = Object.fromEntries(goodsList.map((goods) => [goods, 0]));
  const initialSnapshot = economicMaterialSnapshot(economy, physical);
  const previous = Object.fromEntries(
    goodsList.map((goods) => [goods, total(initialSnapshot, goods)]),
  );
  const previousFlows = Object.fromEntries(goodsList.map((goods) => [
    goods,
    { ...(economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 }) },
  ]));
  const plan = { 13: "wheat", 16: "logger", 20: "fisher", 26: "woodshop", 30: "rapeseed" };
  for (let day = 1; day <= 1440; day += 1) {
    if (day % 30 === 1) {
      const month = Math.floor(day / 30) + 1;
      if (plan[month]) {
        const spot = findAuditSpot(world, plan[month]);
        if (spot) addAuditZone(world, plan[month], spot[0], spot[1]);
      }
    }
    if (day % 5 === 0) setPlayerStockTargets(economy);
    world.step();
    const currentSnapshot = economicMaterialSnapshot(economy, physical);
    for (const goods of goodsList) {
      const cumulative = economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
      const flow = Object.fromEntries(
        ["prod", "cons", "imp", "exp"].map((kind) => [
          kind,
          cumulative[kind] - previousFlows[goods][kind],
        ]),
      );
      const current = total(currentSnapshot, goods);
      const explained = flow.prod - flow.cons + flow.imp - flow.exp;
      unexplained[goods] += current - previous[goods] - explained;
      flows[goods] += Math.abs(flow.prod) + Math.abs(flow.cons) + Math.abs(flow.imp) + Math.abs(flow.exp);
      previous[goods] = current;
      previousFlows[goods] = { ...cumulative };
    }
  }
  return Object.fromEntries(goodsList.map((goods) => {
    const ratio = flows[goods] > 1 ? Math.abs(unexplained[goods]) / flows[goods] * 100 : 0;
    return [goods, {
      unexplained: unexplained[goods],
      totalFlow: flows[goods],
      ratio,
      warning: ratio > 10,
    }];
  }));
}

function materialTotals(snapshot) {
  return Object.fromEntries(GOODS.map((goods) => [
    goods,
    (snapshot.inventory[goods] ?? 0) + (snapshot.cargo[goods] ?? 0),
  ]));
}

function captureMaterialFlows(economy) {
  return Object.fromEntries(GOODS.map((goods) => [
    goods,
    { ...(economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 }) },
  ]));
}

function scenarioMaterialReport(economy, physical, initialTotals, initialFlows) {
  const finalTotals = materialTotals(economicMaterialSnapshot(economy, physical));
  return Object.fromEntries(GOODS.map((goods) => {
    const finalFlow = economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    const delta = Object.fromEntries(["prod", "cons", "imp", "exp"].map((kind) => [
      kind,
      finalFlow[kind] - initialFlows[goods][kind],
    ]));
    const explained = delta.prod - delta.cons + delta.imp - delta.exp;
    const residual = finalTotals[goods] - initialTotals[goods] - explained;
    const throughput = Math.abs(delta.prod) + Math.abs(delta.cons)
      + Math.abs(delta.imp) + Math.abs(delta.exp);
    return [goods, {
      residual,
      throughput,
      ratio: throughput > 1 ? Math.abs(residual) / throughput * 100 : 0,
    }];
  }));
}

function average(values) {
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
}

function stablePriceRanges(economy) {
  return Object.fromEntries(Object.keys(E_STABLE_PRICE_BANDS).map((goods) => {
    const value = economy.px[goods];
    return [goods, Number.isFinite(value)
      ? { min: value, max: value, observations: 1 }
      : { min: Infinity, max: -Infinity, observations: 0 }];
  }));
}

function sampleStablePrices(economy, ranges) {
  for (const [goods, range] of Object.entries(ranges)) {
    const value = economy.px[goods];
    if (!Number.isFinite(value)) continue;
    range.min = Math.min(range.min, value);
    range.max = Math.max(range.max, value);
    range.observations += 1;
  }
}

function createPriceAnchorAudit() {
  return { passed: true, samples: 0, firstViolation: null };
}

function samplePriceAnchors(economy, physical, day, audit) {
  const books = { main: economy.px, ...(economy.pxm ?? {}) };
  for (const [marketId, book] of Object.entries(books)) {
    for (const goods of GOODS) {
      const price = book?.[goods];
      const row = economy.stockDaysPrices?.[marketId]?.[goods];
      const { cost, lower } = row ?? priceAnchorBounds(
        economy, physical, marketId, goods, { day },
      );
      const upper = Math.max(P.IMP[goods] !== undefined ? P.IMP[goods] * 1.2 : 0, cost * 3);
      audit.samples += 1;
      if (Number.isFinite(price) && price >= lower - 1e-9 && price <= upper + 1e-9) continue;
      audit.passed = false;
      audit.firstViolation ??= { day, marketId, goods, price, cost, lower, upper };
    }
  }
}

function inspectStableMaterial(economy, physical, initialTotals, initialFlows, day) {
  const report = scenarioMaterialReport(economy, physical, initialTotals, initialFlows);
  let worst = { day, goods: null, ratio: 0, residual: 0, throughput: 0 };
  let passed = true;
  for (const [goods, entry] of Object.entries(report)) {
    const lowFlowResidual = entry.throughput <= 1 && Math.abs(entry.residual) >= 1e-6;
    if (entry.ratio >= 5 || lowFlowResidual) passed = false;
    if (
      entry.ratio > worst.ratio
      || (entry.ratio === worst.ratio && Math.abs(entry.residual) > Math.abs(worst.residual))
    ) {
      worst = { day, goods, ...entry };
    }
  }
  return { passed, worst };
}

export function runStableCityScenario(
  seed,
  { days = E_STABLE_DAYS, materialCheckInterval = 1, controller = mimicPlayer } = {},
) {
  if (!Number.isSafeInteger(days) || days <= 0) {
    throw new TypeError("stable scenario days must be a positive safe integer");
  }
  if (!Number.isSafeInteger(materialCheckInterval) || materialCheckInterval <= 0) {
    throw new TypeError("material check interval must be a positive safe integer");
  }
  if (typeof controller !== "function") {
    throw new TypeError("stable scenario controller must be a function");
  }
  const world = buildDemandMatureCity(seed);
  const { economy, physical } = world.state;
  // 成熟都市の監査controllerは、本体の同じ明示操作で届いた注文を受ける。
  // 価格差だけで注文状を捨てる旧模写は現金循環の回復手段を永久に閉ざしていた。
  const matureController = controller === mimicPlayer;
  const initialTotals = materialTotals(economicMaterialSnapshot(economy, physical));
  const initialFlows = captureMaterialFlows(economy);
  const prices = stablePriceRanges(economy);
  const priceAnchors = createPriceAnchorAudit();
  const observedJobMaximums = Object.fromEntries(E_STABLE_JOBS.map((job) => [
    job,
    economy.households.filter((household) => household.job === job).length,
  ]));
  const yearly = [];
  let previousFamine = 0;
  let materialPassed = true;
  let worstMaterial = { day: 0, goods: null, ratio: 0, residual: 0, throughput: 0 };

  for (let day = 1; day <= days; day += 1) {
    if (matureController && economy.orderOffer) acceptCompanyOrder(economy, { day });
    controller(world, day);
    world.step();
    // 「8年間を通じて一度も担い手が現れない職だけ赤」の契約どおり、年末の
    // 瞬間値ではなく全日の最大実在数を観測する。
    const dailyJobCounts = Object.fromEntries(E_STABLE_JOBS.map((job) => [job, 0]));
    for (const household of economy.households) {
      if (dailyJobCounts[household.job] !== undefined) dailyJobCounts[household.job] += 1;
    }
    for (const job of E_STABLE_JOBS) {
      observedJobMaximums[job] = Math.max(
        observedJobMaximums[job],
        dailyJobCounts[job],
      );
    }
    sampleStablePrices(economy, prices);
    samplePriceAnchors(economy, physical, day, priceAnchors);
    if (day % materialCheckInterval === 0 || day === days) {
      const material = inspectStableMaterial(
        economy,
        physical,
        initialTotals,
        initialFlows,
        day,
      );
      materialPassed &&= material.passed;
      if (
        material.worst.ratio > worstMaterial.ratio
        || (
          material.worst.ratio === worstMaterial.ratio
          && Math.abs(material.worst.residual) > Math.abs(worstMaterial.residual)
        )
      ) worstMaterial = material.worst;
    }
    if (day % 360 === 0) {
      const cumulativeFamine = economy.famine;
      yearly.push({
        year: day / 360,
        day,
        population: auditPopulation(economy),
        famine: cumulativeFamine - previousFamine,
        jobs: Object.fromEntries(E_STABLE_JOBS.map((job) => [
          job,
          economy.households.filter((household) => household.job === job).length,
        ])),
        companyMoney: economy.company.money * 10,
        bankruptcyDay: economy.goDay,
      });
      previousFamine = cumulativeFamine;
    }
  }

  const priceBandsPassed = Object.entries(E_STABLE_PRICE_BANDS).every(([goods, [low, high]]) => (
    prices[goods].observations > 0
    && prices[goods].min >= low
    && prices[goods].max <= high
  ));
  const comparisonYears = Math.min(3, yearly.length);
  const earlyFamine = average(yearly.slice(0, comparisonYears).map((sample) => sample.famine));
  const lateFamine = average(yearly.slice(-comparisonYears).map((sample) => sample.famine));
  const faminePerCapita = yearly.map((sample) => (
    sample.population > 0 ? sample.famine / sample.population : Infinity
  ));
  const [minimumPopulation, maximumPopulation] = E_STABLE_POPULATION_BAND;
  const bands = {
    population: yearly.length === days / 360
      && yearly.every((sample) => (
        sample.population >= minimumPopulation && sample.population <= maximumPopulation
      )),
    famine: faminePerCapita.length === yearly.length
      && faminePerCapita.every((value) => value <= E_STABLE_FAMINE_DAYS_PER_CAPITA_MAX),
    // 年末の瞬間値では一時空席を許す。8年間を通じて一度も担い手が現れない職だけを
    // 回帰赤とし、初期比率そのものは専用assertで別に固定する。
    jobs: yearly.length === days / 360 && Object.entries(E_STABLE_JOB_MINIMUMS).every(
      ([job, minimum]) => observedJobMaximums[job] >= minimum,
    ),
    prices: priceBandsPassed,
    priceAnchors: priceAnchors.passed,
    material: materialPassed,
    company: economy.goDay === null,
  };
  return {
    seed,
    day: world.state.day,
    yearly,
    prices,
    observedJobMaximums,
    priceAnchors,
    famine: {
      earlyAverage: earlyFamine,
      lateAverage: lateFamine,
      perCapita: faminePerCapita,
      maximumPerCapita: faminePerCapita.length > 0 ? Math.max(...faminePerCapita) : null,
    },
    material: { passed: materialPassed, worst: worstMaterial },
    physical: {
      carriers: assertCarrierInvariants(physical),
      occupancy: assertOccupancyInvariant(physical),
    },
    bankruptcyDay: economy.goDay,
    bands,
    passed: Object.values(bands).every(Boolean),
  };
}

export function runStableCityAudit(
  { seeds = AUDIT_SEEDS, days = E_STABLE_DAYS, materialCheckInterval = 1 } = {},
) {
  const scenarios = seeds.map((seed) => runStableCityScenario(seed, {
    days,
    materialCheckInterval,
  }));
  const bands = Object.fromEntries(
    Object.keys(scenarios[0]?.bands ?? {}).map((band) => [
      band,
      scenarios.every((scenario) => scenario.bands[band]),
    ]),
  );
  return {
    seeds: [...seeds],
    days,
    scenarios,
    bands,
    passed: scenarios.length === seeds.length
      && scenarios.every((scenario) => scenario.passed),
  };
}

export function runBadCityScenario(
  seed = AUDIT_SEEDS[0],
  { days = 1440, baselineYearly = null, materialCheckInterval = 1 } = {},
) {
  if (!Number.isSafeInteger(days) || days <= 0 || days % 360 !== 0) {
    throw new TypeError("bad city scenario days must be a positive whole number of years");
  }
  const world = buildBadCity(seed);
  const { economy, physical } = world.state;
  const initialTotals = materialTotals(economicMaterialSnapshot(economy, physical));
  const initialFlows = captureMaterialFlows(economy);
  const yearly = [];
  let previousFamine = 0;
  let materialPassed = true;
  let worstMaterial = { day: 0, goods: null, ratio: 0, residual: 0, throughput: 0 };
  for (let day = 1; day <= days; day += 1) {
    mimicPlayer(world, day);
    world.step();
    if (day % materialCheckInterval === 0 || day === days) {
      const material = inspectStableMaterial(
        economy,
        physical,
        initialTotals,
        initialFlows,
        day,
      );
      materialPassed &&= material.passed;
      if (material.worst.ratio > worstMaterial.ratio) worstMaterial = material.worst;
    }
    if (day % 360 === 0) {
      const cumulativeFamine = economy.famine;
      yearly.push({
        year: day / 360,
        day,
        population: auditPopulation(economy),
        famine: cumulativeFamine - previousFamine,
        jobs: Object.fromEntries(E_STABLE_JOBS.map((job) => [
          job,
          economy.households.filter((household) => household.job === job).length,
        ])),
      });
      previousFamine = cumulativeFamine;
    }
  }
  const final = yearly.at(-1);
  const baseline = baselineYearly?.find((sample) => sample.day === days) ?? null;
  const extinctJobs = E_STABLE_JOBS.filter((job) => (final?.jobs[job] ?? 0) === 0);
  const finalFaminePerCapita = final && final.population > 0
    ? final.famine / final.population
    : Infinity;
  const baselineFaminePerCapita = baseline && baseline.population > 0
    ? baseline.famine / baseline.population
    : null;
  const famineRatio = baselineFaminePerCapita !== null
    ? baselineFaminePerCapita > 0
      ? finalFaminePerCapita / baselineFaminePerCapita
      : finalFaminePerCapita > 0 ? Infinity : 0
    : null;
  const populationRatio = baseline && baseline.population > 0
    ? final.population / baseline.population
    : null;
  const signatures = {
    famine: famineRatio !== null && famineRatio >= E_STABLE_BAD_FAMINE_RATIO_MIN,
    population: (final?.population ?? Infinity) < 60
      || (populationRatio !== null && populationRatio <= E_STABLE_BAD_POPULATION_RATIO_MAX),
    jobs: extinctJobs.length >= 2,
  };
  const physicalPassed = assertCarrierInvariants(physical) && assertOccupancyInvariant(physical);
  return {
    seed,
    day: world.state.day,
    yearly,
    final,
    baseline,
    failureSignature: {
      signatures,
      famineRatio,
      populationRatio,
      extinctJobs,
      finalFaminePerCapita,
      baselineFaminePerCapita,
    },
    material: { passed: materialPassed, worst: worstMaterial },
    physical: {
      carriers: assertCarrierInvariants(physical),
      occupancy: assertOccupancyInvariant(physical),
    },
    passed: (signatures.famine || signatures.population || signatures.jobs)
      && materialPassed && physicalPassed,
  };
}

export function runIronChainScenario({ seed, depositRoads, days = 2160 }) {
  const world = createIronAuditWorld(seed, { depositRoads, placeHouseholds: false });
  const { economy, physical } = world.state;
  const initialTotals = materialTotals(economicMaterialSnapshot(economy, physical));
  const initialFlows = captureMaterialFlows(economy);
  const plan = { 13: "wheat", 16: "logger", 20: "fisher", 26: "woodshop", 30: "rapeseed" };
  const ironJobSwitches = [];
  const yearly = [];
  const matureHouseholdIds = [];
  const maxIncomes = Object.fromEntries(IRON_AUDIT_SITES.map(({ job }) => [job, 0]));
  for (let day = 1; day <= days; day += 1) {
    if (day % 30 === 1) {
      const month = Math.floor(day / 30) + 1;
      if (plan[month]) {
        const spot = findAuditSpot(world, plan[month]);
        if (spot) addAuditZone(world, plan[month], spot[0], spot[1]);
      }
    }
    const acceptedOrder = economy.orderOffer
      ? acceptCompanyOrder(economy, { day })
      : null;
    const staleOrderTarget = !economy.order && COMPANY_ORDER_GOODS.some(
      (goods) => (economy.stockTgt[goods] ?? 0) > 0,
    );
    if (day % 5 === 0 || acceptedOrder || staleOrderTarget) setPlayerStockTargets(economy);
    if (day % 90 === 0 && economy.company.money * 10 > 8000) {
      for (const job of ["woodshop", "charburner", "saltworks"]) {
        if (countJobAndZones(economy, job) >= 1) continue;
        const spot = findAuditSpot(world, job);
        if (spot) {
          addAuditZone(world, job, spot[0], spot[1]);
          break;
        }
      }
    }
    if (day === IRON_AUDIT_START_DAY + 1) {
      ensureMatureAuditHouseholds(world);
      const matureHouseholds = economy.households.slice(0, IRON_DEMAND_HOUSEHOLDS);
      if (matureHouseholds.length !== IRON_DEMAND_HOUSEHOLDS) {
        throw new Error(`Lv4成熟世帯が不足しています: ${matureHouseholds.length}/${IRON_DEMAND_HOUSEHOLDS}`);
      }
      for (const household of matureHouseholds) {
        household.lv = Math.max(household.lv, IRON_DEMAND_LEVEL);
        household.up = 0;
        household.down = 0;
        matureHouseholdIds.push(household.id);
      }
      placeIronAuditHouseholds(world);
    }
    world.step();
    for (const household of economy.households) {
      if (!Object.hasOwn(maxIncomes, household.job)) continue;
      maxIncomes[household.job] = Math.max(
        maxIncomes[household.job],
        (household.incY ?? 0) * 10,
      );
    }
    for (let eventIndex = economy.events.length - 1; eventIndex >= 0; eventIndex -= 1) {
      const [eventDay, message] = economy.events[eventIndex];
      if (eventDay < day) break;
      if (eventDay === day && message.startsWith("破綻転職:")) {
        const touchesIronJob = IRON_AUDIT_SITES.some(({ job }) => message.includes(job));
        if (touchesIronJob && !ironJobSwitches.some((entry) => (
          entry.day === day && entry.message === message
        ))) {
          const householdId = Number(message.match(/#(\d+)/)?.[1]);
          const household = economy.households.find(({ id }) => id === householdId);
          ironJobSwitches.push({
            day,
            message,
            purse: household?.purse ?? null,
            income: (household?.incY ?? 0) * 10,
            hunger180: household?.hungerHist?.reduce((total, value) => total + value, 0) ?? null,
            insolvencyMonths: household?.insolvM ?? null,
          });
        }
      }
    }
    if (day % 360 === 0) {
      yearly.push({
        day,
        ironImport: economy.f30.iron?.imp ?? 0,
        ironProduction: economy.f30.iron?.prod ?? 0,
        level4: economy.households.filter((household) => household.lv >= IRON_DEMAND_LEVEL).length,
        matureDemandHouseholds: matureHouseholdIds.filter((householdId) => (
          economy.households.some((household) => (
            household.id === householdId && household.lv >= IRON_DEMAND_LEVEL
          ))
        )).length,
        jobs: Object.fromEntries(IRON_AUDIT_SITES.map(({ job }) => [
          job,
          economy.households.filter((household) => household.job === job).length,
        ])),
      });
    }
  }
  return {
    day: world.state.day,
    ironImport: economy.f30.iron?.imp ?? 0,
    ironProduction: economy.f30.iron?.prod ?? 0,
    incomes: maxIncomes,
    ironJobSwitches,
    matureHouseholdIds,
    yearly,
    jobs: Object.fromEntries(IRON_AUDIT_SITES.map(({ job }) => [
      job,
      economy.households.filter((household) => household.job === job).length,
    ])),
    physical: {
      carriers: assertCarrierInvariants(physical),
      occupancy: assertOccupancyInvariant(physical),
    },
    material: scenarioMaterialReport(economy, physical, initialTotals, initialFlows),
  };
}

export function evaluateIronChainScenarios(connected, disconnected) {
  const materialGreen = [connected, disconnected].every((scenario) => (
    GOODS.every((goods) => Math.abs(scenario.material[goods].residual) < 1e-6)
    && scenario.physical.carriers
    && scenario.physical.occupancy
  ));
  const replacement = connected.yearly.find((sample) => (
    sample.day > IRON_AUDIT_START_DAY
    && sample.day <= IRON_CHAIN_BANDS.replacementByDay
    && sample.ironImport <= IRON_CHAIN_BANDS.ironImportMax
    && sample.ironProduction >= IRON_CHAIN_BANDS.ironProductionMin
  ));
  const disconnectedAtReplacement = disconnected.yearly.find((sample) => (
    sample.day === replacement?.day
  ));
  const results = [
    {
      id: "E-Fe1",
      passed: Boolean(replacement),
      detail: replacement
        ? `day${replacement.day} 鉄輸入EMA ${replacement.ironImport.toFixed(3)} / 国産EMA ${replacement.ironProduction.toFixed(3)}`
        : "6年以内に国産置換を観測できず",
    },
    {
      id: "E-Fe2",
      passed: Object.entries(IRON_CHAIN_BANDS.incomeMinimums).every(
        ([job, minimum]) => connected.incomes[job] >= minimum,
      ),
      detail: Object.entries(connected.incomes)
        .map(([job, income]) => (
          `${job}:${Math.round(income)}/${IRON_CHAIN_BANDS.incomeMinimums[job]}`
        ))
        .join(" "),
    },
    {
      id: "E-Fe4",
      passed: Boolean(
        replacement
        && disconnectedAtReplacement
        && disconnectedAtReplacement.ironProduction < 0.05
        && replacement.ironProduction > disconnectedAtReplacement.ironProduction * 10,
      ),
      detail: replacement && disconnectedAtReplacement
        ? `day${replacement.day} 国産EMA 道路あり${replacement.ironProduction.toFixed(3)} / なし${disconnectedAtReplacement.ironProduction.toFixed(3)}`
        : "比較可能な国産置換時点なし",
    },
    {
      id: "E-Fe5",
      passed: materialGreen,
      detail: `最大残差${Math.max(
        ...[connected, disconnected].flatMap((scenario) => (
          GOODS.map((goods) => Math.abs(scenario.material[goods].residual))
        )),
      ).toExponential(3)}`,
    },
  ];
  return {
    connected,
    disconnected,
    results,
    passed: results.filter((result) => result.passed).length,
    total: results.length,
  };
}

export function runIronChainAudit({ seed = 11, days = 2160 } = {}) {
  const connected = runIronChainScenario({ seed, depositRoads: true, days });
  const disconnected = runIronChainScenario({ seed, depositRoads: false, days });
  return evaluateIronChainScenarios(connected, disconnected);
}

export function runIronChainBandAudit({ seeds = AUDIT_SEEDS, days = 2160 } = {}) {
  const audits = seeds.map((seed) => runIronChainAudit({ seed, days }));
  const atReplacement = audits.map(({ connected }) => (
    connected.yearly.find(({ day }) => day === IRON_CHAIN_BANDS.replacementByDay)
  ));
  const incomes = Object.fromEntries(Object.keys(IRON_CHAIN_BANDS.incomeMinimums).map((job) => {
    const values = audits.map(({ connected }) => connected.incomes[job]);
    return [job, { min: Math.min(...values), max: Math.max(...values) }];
  }));
  return {
    seeds: [...seeds],
    days,
    bands: structuredClone(IRON_CHAIN_BANDS),
    envelope: {
      ironImport: {
        min: Math.min(...atReplacement.map(({ ironImport }) => ironImport)),
        max: Math.max(...atReplacement.map(({ ironImport }) => ironImport)),
      },
      ironProduction: {
        min: Math.min(...atReplacement.map(({ ironProduction }) => ironProduction)),
        max: Math.max(...atReplacement.map(({ ironProduction }) => ironProduction)),
      },
      incomes,
    },
    audits,
    passed: audits.every((audit) => audit.passed === audit.total),
  };
}

export function runFlowIslandAudit() {
  const results = [];
  const scenario = runScenarioA();
  const economies = scenario.worlds.map((world) => world.state.economy);
  const famineTotal = economies.reduce((total, economy) => total + economy.famine, 0) / AUDIT_SEEDS.length;

  const worstImport = Math.max(...economies.map((economy) => economy.f30.wheat?.imp ?? 9));
  addResult(results, "E1", "麦自給(輸入<2/日)", worstImport < 2, `最悪シード輸入${worstImport.toFixed(1)}/日`);

  const incomeByJob = {};
  for (const economy of economies) {
    for (const household of economy.households) {
      (incomeByJob[household.job] ??= []).push((household.incY ?? 0) * 10);
    }
  }
  for (const job of E_STABLE_JOBS) {
    const incomes = incomeByJob[job] ?? [];
    const best = incomes.length > 0 ? Math.max(...incomes) : 0;
    addResult(results, `E2-${job}`, `${job}が稼げる`, best > 2000, `最良世帯の年間収入${Math.round(best)}デナリ`);
  }

  const worstDebtRun = Math.max(0, ...Object.values(scenario.stuck));
  addResult(results, "E3", "借金漬け世帯なし", worstDebtRun < 90, `最長張り付き${worstDebtRun}日`);
  addResult(results, "E4", "飢餓(年平均)", famineTotal / 4 < 150, `4年計平均${Math.round(famineTotal)}(年${Math.round(famineTotal / 4)})`);
  const firstEconomy = economies[0];
  addResult(
    results,
    "E5",
    "森の持続",
    firstEconomy.grove > 5000,
    `残${Math.round(firstEconomy.grove)}`,
  );
  addResult(results, "E6", "湾の持続", firstEconomy.natural.bay > 72, `残${Math.round(firstEconomy.natural.bay)}`);
  for (const [goods, average] of Object.entries(scenario.stallAverage)) {
    addResult(results, `E7-${goods}`, `${goods}滞留なし`, average < 200, `平均${Math.round(average)}荷`);
  }

  const maxLevels = economies.map((economy) => Math.max(...economy.households.map((household) => household.lv)));
  const medianLevels = economies.map((economy) => {
    const levels = economy.households.map((household) => household.lv).sort((a, b) => a - b);
    return levels[Math.floor(levels.length / 2)];
  });
  addResult(
    results,
    "E8",
    "ラダー機能",
    Math.max(...maxLevels) >= 5 && Math.min(...medianLevels) >= 2,
    `最高${maxLevels.join("/")} 中央値${medianLevels.join("/")}`,
  );
  addResult(
    results,
    "E9",
    "財政の弧",
    economies.every((economy) => (
      economy.goDay === null
      && economy.company.money * 10 > -companyCreditLimit(economy, { day: 1440 }) * 10
      && economy.company.money * 10 < 150000
    )),
    economies.map((economy) => Math.round(economy.company.money * 10)).join("/"),
  );

  const fishWinter = averageBySeason(scenario.priceLog.fish, (month) => month >= 10 || month <= 2);
  const fishSummer = averageBySeason(scenario.priceLog.fish, (month) => month >= 4 && month <= 9);
  addResult(results, "E10-fish", "冬の魚価>夏", fishWinter > fishSummer * 1.3, `冬${fishWinter.toFixed(2)} 夏${fishSummer.toFixed(2)}`);
  const charWinter = averageBySeason(scenario.priceLog.char, (month) => month >= 10 || month <= 2);
  const charSummer = averageBySeason(scenario.priceLog.char, (month) => month >= 4 && month <= 9);
  addResult(results, "E10-char", "冬の炭価>夏", charWinter > charSummer, `冬${charWinter.toFixed(2)} 夏${charSummer.toFixed(2)}`);

  let hoard = null;
  for (const economy of economies) {
    for (const household of economy.households) {
      for (const goods of GOODS) {
        if (household.pantry[goods] > 1.5 * P.Y_WHEAT * 2) {
          hoard = `${household.job}が${goods}${Math.round(household.pantry[goods])}`;
        }
      }
    }
  }
  addResult(results, "E11", "滞留在庫なし", !hoard, hoard ?? "");
  const populations = economies.map(auditPopulation);
  addResult(
    results,
    "E12",
    "人口成長",
    populations.every((population) => population >= 90 && population <= 90 * 2.2),
    populations.join("/"),
  );
  const yearlyFamine = scenario.famineByYear.map(
    (values) => values.reduce((total, value) => total + value, 0) / AUDIT_SEEDS.length,
  );
  const year2 = yearlyFamine[1] - yearlyFamine[0];
  const year4 = yearlyFamine[3] - yearlyFamine[2];
  addResult(results, "E13", "飢えの出口", year4 < year2 * 1.1, `Y2飢餓${Math.round(year2)}→Y4飢餓${Math.round(year4)}`);
  addResult(
    results,
    "E14",
    "麦畑が初回収穫前に転職しない",
    scenario.earlyWheatSwitch.length === 0,
    scenario.earlyWheatSwitch.map(([seed, day]) => `seed${seed}:day${day}`).join(",") || "全seedで初回収穫を観測",
  );

  const advisor = runAdvisorScenario();
  addResult(
    results,
    "E15",
    "アドバイザ追従で生存",
    advisor.world.state.economy.goDay === null && advisor.world.state.economy.famine < 600,
    `建てた:${advisor.builds.join(",") || "なし"} 金庫${Math.round(advisor.world.state.economy.company.money * 10)} 飢餓${advisor.world.state.economy.famine}`,
  );

  const rhythm = runBuildingRhythmScenario();
  addResult(
    results,
    "E16",
    "漸進建築>一括建築",
    rhythm.paced.famine < rhythm.lump.famine
      && rhythm.paced.population >= rhythm.lump.population,
    `飢餓 漸進${rhythm.paced.famine}/一括${rhythm.lump.famine} 人口${rhythm.paced.population}/${rhythm.lump.population}`,
  );

  const material = runMaterialAudit();
  const physical = {
    carriers: scenario.worlds.every((world) => assertCarrierInvariants(world.state.physical)),
    occupancy: scenario.worlds.every((world) => assertOccupancyInvariant(world.state.physical)),
    material: Object.values(material).every((report) => report.ratio < 5 && !report.warning),
  };
  const passed = results.filter((result) => result.passed).length;
  return {
    results,
    material,
    physical,
    passed,
    failed: results.length - passed,
    total: results.length,
  };
}
