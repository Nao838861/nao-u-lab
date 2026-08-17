import {
  COMPANY_ORDER_GOODS,
  FOODS,
  GOODS,
  P,
  acceptCompanyOrder,
  companyCreditLimit,
  constructionMaterialsFor,
  createHousehold,
  economicMaterialSnapshot,
  fundSettlementZone,
  localWood,
  postCompanyLedger,
  priceAnchorBounds,
  productionCost,
  purchaseCompanyWoodCart,
  recordEconomicMaterialFlow,
  recordEconomyEvent,
  recordExternalMoneyFlow,
  requestCompanyImport,
  requestCompanySurplusExport,
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
  // 湾内の3漁家は二年維持・三年で痩せるP2較正負荷そのもの。二軒では回復と
  // 拮抗して外へ出る圧力が消える。256世界の三長距離線は初年に30台超を
  // 必要とするため、車大工は三軒で路線28台と住民の原料運搬車を実生産し、
  // 会社・世帯それぞれの実購入で配備する。二軒では会社分だけで一年を使い切る。
  "wheat", "fisher", "fisher", "fisher", "logger", "logger", "logger",
  "woodshop", "woodshop", "charburner", "saltworks",
  "cartwright", "cartwright", "cartwright",
]);

const B2_TRIAL_PROVISION_DAYS = 60;
// Lv0→1には45日必要。30日では最初の効率改善より先に開拓食が尽きるため、
// 一回限りの明示された開拓保存食を60日とし、その後は地域間交易だけで養う。
const B2_EXPANSION_PROVISION_DAYS = 60;

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

export function buildB2TrialWorld(
  seed = 11,
  definition,
  {
    householdSize = 4,
    provisionDays = B2_TRIAL_PROVISION_DAYS,
  } = {},
) {
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
  // 256本編では、旧来の不可視な輸出台が生産者の売荷を先取りしない。島内市場と
  // 路線を満たした会社在庫から、プレイヤーが港湾余剰輸出を明示した時だけ出す。
  economy.manualSurplusExportsOnly = true;
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

  const requestedHouseholdSize = Number.isSafeInteger(householdSize) && householdSize > 0
    ? householdSize
    : null;
  const households = zones.map(zone => occupyScenarioZone(world, zone, "main", {
    foodKit: requestedHouseholdSize === null
      ? undefined
      : requestedHouseholdSize * provisionDays,
  }));
  for (const household of households) {
    if (requestedHouseholdSize !== null) {
      setScenarioHouseholdSize(economy, household, requestedHouseholdSize, "母港先遣隊");
    }
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
    // 凍結済み漁場較正の基準負荷を守る。三軒なら低Lvでも16人の漁港圏を養い、
    // Lv上昇分が魚・保存食の帰り荷になる。七軒案は豊かな漁場さえ一年未満で
    // 潰し、産業効率でなく乱獲人数だけを増やしていたため採用しない。
    jobs: Object.freeze([
      "fisher", "fisher", "fisher", "saltworks",
    ]),
    goodsOut: Object.freeze([
      "wheat", "veg", "pick", "char", "tools", "log", "stone", "cloth", "iron",
    ]),
    goodsBack: Object.freeze(["fish", "pres", "salt"]),
    // 漁港圏16人は魚で自給できるため、二編成は麦・資材の補完と魚・塩の帰り荷を
    // 同じ実便で運ぶ。固定給は開発期の赤字路線費として会社台帳へ全額残す。
    recruitment: 2, wage: 0.75, intervalDays: 5,
  }),
  mining: Object.freeze({
    marketKey: "4", marketId: "mining", name: "山間鉱山市場",
    // 最初は石・鉱石・鉄の連鎖だけを先遣する。木材圏まで同時に11世帯を
    // 移住させる旧fixtureは、Lvが上がる前に食料便の能力を越えていた。
    // 山林の本格開発はプレイヤーが需要を見て増設でき、母港林だけに依存しない。
    jobs: Object.freeze(["miner", "collier", "quarryman"]),
    // 採掘・採炭の在庫がない日に製錬所と鍛冶屋まで一括入植させると、加工職は
    // 売物を作れないまま原料費だけを負い、保存食が尽きた日に市場前で破綻する。
    // まず上流を60日、次に製錬を60日動かしてから下流を足す。これは補助金で
    // 赤字を隠すのではなく、実在する中間財と買手を順に接続する開発手順である。
    industryStages: Object.freeze([
      Object.freeze({ afterDays: 60, jobs: Object.freeze(["smelter"]) }),
      Object.freeze({ afterDays: 120, jobs: Object.freeze(["smith"]) }),
      // 母港の有限林が薄くなる前に山間林へ生産基盤を移す。原木だけを運ぶと
      // 母港工房の往復が再び詰まるため、現地加工した木製品・木炭も帰り荷にする。
      Object.freeze({
        afterDays: 180,
        jobs: Object.freeze([
          "logger", "logger", "logger", "woodshop", "charburner",
          "quarryman", "quarryman",
        ]),
      }),
    ]),
    // 低Lv期だけは母港で有償輸入した木製品も運び、現地木工がLv2へ届いたら
    // 鉱山自身の木製品を帰り荷へ切り替える。同じ品目の往復は価格差ではなく
    // 実在庫gapで片方向だけが積まれる。
    goodsOut: Object.freeze([
      "wheat", "veg", "fish", "pres", "pick", "tools", "salt", "cloth",
    ]),
    goodsBack: Object.freeze([
      "ore", "bar", "iron", "stone", "coal", "log", "tools", "char",
    ]),
    // 鉱区は食料を産まない。四台編成を二本通し、片便が集荷中でも生活物資を
    // 届ける。会社の28台と住民用荷車は母港の車大工三軒が実生産する。低Lv期の
    // 固定給はLvを上げるために必要な赤字路線として会社台帳へ残す。
    // 木材圏まで育つと十世帯になるため、食料と中間財を一本へ詰め込まない。
    routeCount: 2, recruitment: 4, wage: 0.75, intervalDays: 5,
  }),
  basin: Object.freeze({
    marketKey: "2", marketId: "basin", name: "中央盆地市場",
    jobs: Object.freeze([
      // 初期入植は最初の冬を越す先遣規模。二年目の播種前に成長分を足し、
      // 低Lvの初日から過剰人口と私蔵麦を作らず年間需要へ追いつく。
      // day120入植は初年度に五か月しか作付できない。六圃場では母港・鉱区の
      // 冬越し需要へ届かず、九圃場でも冬末24日分に留まった。冬越し予報46日を
      // 実備蓄で満たす十五圃場で入り、二年目は六圃場を人口成長分にする。
      // 19圃場では低Lv日産が人口需要を24荷下回ったため、成熟時は21圃場にする。
      "wheat", "wheat", "wheat", "wheat", "wheat", "wheat",
      "wheat", "wheat", "wheat", "wheat", "wheat", "wheat",
      "wheat", "wheat", "wheat",
      "veg", "veg", "veg", "rapeseed",
    ]),
    industryStages: Object.freeze([
      Object.freeze({
        // 盆地開設day120から300日後=二年目の春直前に入植する。旧day300入植は
        // 60日開拓食をday360で使い切り、作付開始day421まで冬60日を飢えていた。
        afterDays: 300,
        jobs: Object.freeze([
          "wheat", "wheat", "wheat", "wheat", "wheat", "wheat",
          "veg", "veg", "veg",
          // 母港から届く丸太を農家の作業道具へ現地加工し、同じ丸太を工具として
          // 往復輸送しない。盆地棚に丸太100荷超・工具0が残る実測への接続。
          "woodshop",
        ]),
      }),
    ]),
    goodsOut: Object.freeze(["fish", "char", "tools", "salt", "log", "stone", "iron"]),
    // 野菜農家が市場便の間に漬けた在庫も食料として運ぶ。生野菜だけを指定すると
    // 塩が届いた盆地で漬物だけが滞留し、他市場が食料難になる。
    goodsBack: Object.freeze(["wheat", "veg", "pick", "cloth"]),
    // 三宿十八台編成で穀倉余剰を母港へ運び、そこから鉱区線へ中継する。
    // 麦は0.5重量なので一便48荷を積め、島の荷車を隊商だけで独占しない。
    // 高Lvで運び切れないほど余れば、四便目を欲で足す余地として残る。
    routeCount: 3, recruitment: 6, wage: 0.75, intervalDays: 5,
  }),
});

export const B2_EXPANSION_ORDERS = Object.freeze({
  // 基準筋は地形の物語どおり魚→鉱→穀。別戦略も120日刻みで不足圏へ接続し、
  // 開始順の差を残しながら最初の冬までに麦の背骨へ到達する。
  fishery: Object.freeze(["fishery", "mining", "basin"]),
  mining: Object.freeze(["mining", "basin", "fishery"]),
  basin: Object.freeze(["basin", "fishery", "mining"]),
});

// 開拓食60日を使い切る節目ごとに次圏を一つずつ開く。盆地を240日まで待つと
// 最初の冬まで30日しかなく備蓄不能になる。無料同時建設には戻さず、魚→鉱→穀の
// 地形物語を二か月刻みで進める。
const B2_EXPANSION_INTERVAL_DAYS = 60;
const B2_EXPANSION_MILESTONES = Object.freeze([0, 60, 120]);

function addB2StrategyHouseholds(world, strategy, entrance, marketBuildingId, jobs) {
  const { economy, physical } = world.state;
  const zones = jobs.map(job => placeB2StarterZone(world, job, entrance));
  for (const zone of zones) connectB2Road(physical, entrance, zone, `${strategy.marketId}:${zone.job}`);
  const households = zones.map(zone => occupyScenarioZone(
    world,
    zone,
    strategy.marketId,
    { foodKit: 0 },
  ));
  for (const household of households) {
    // 遠隔地は最初から大家族を丸ごと移住させず、四人の先遣世帯で産業を開く。
    // 開拓食は外部から来た実物として台帳へ記録し、本人が食べた分だけ減らす。
    setScenarioHouseholdSize(economy, household, 4, `${strategy.name}先遣隊`);
    const provision = household.members.length * B2_EXPANSION_PROVISION_DAYS;
    household.pantry.pres += provision;
    household.settlerFoodReserves ??= {};
    household.settlerFoodReserves.pres = (
      household.settlerFoodReserves.pres ?? 0
    ) + provision;
    recordEconomicMaterialFlow(
      economy,
      "pres",
      "imp",
      provision,
      `${strategy.name}世帯${household.id}の開拓時保存食`,
      { includeInDaily: false },
    );
    household.marketEntrance = entrance;
    household.marketBuildingId = marketBuildingId;
  }
  return households;
}

function addB2StrategyMarket(world, definition, strategy, { day = world.state.day } = {}) {
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
      if (!site) continue;
      candidates.push({
        entrance,
        site,
        distance: Math.hypot(x - marker.x, y - marker.y),
      });
    }
  }
  candidates.sort((left, right) => left.distance - right.distance
    || left.entrance.y - right.entrance.y || left.entrance.x - right.entrance.x);
  // 625候補すべてで全域Dijkstraを回すと、3市場fixtureの生成だけで2分を超える。
  // 敷地距離順に並べてから、実際に採用し得る候補だけの到達性を調べる。
  const selected = candidates.find(candidate => (
    findTravelPath(physical, economy.market, candidate.entrance, "walk")
  )) ?? null;
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

  const households = addB2StrategyHouseholds(
    world,
    strategy,
    entrance,
    placed.building.id,
    strategy.jobs,
  );

  // 開拓路線は母港の会社隊商が担う。新しい圏内集荷は遠隔生産者へ仕入代金を
  // 直接払うため、御者給を遠隔地へ置く必要はない。母港発にすることで会社は
  // 母港の荷車工房から実物を購入でき、荷車を無料生成せず路線を育てられる。
  const routeResults = [];
  for (let routeIndex = 0; routeIndex < (strategy.routeCount ?? 1); routeIndex += 1) {
    const innZone = placeB2StarterZone(world, "carter", economy.market);
    connectB2Road(
      physical,
      economy.market,
      innZone,
      `main:${strategy.marketId}隊商宿${routeIndex + 1}`,
    );
    const innHousehold = occupyScenarioZone(world, innZone, "main", { foodKit: 0 });
    setScenarioHouseholdSize(
      economy,
      innHousehold,
      Math.max(4, strategy.recruitment),
      `${strategy.name}隊商隊`,
    );
    setCaravanEmployment(physical, {
      buildingId: innHousehold.buildingId,
      recruitment: strategy.recruitment,
      wage: strategy.wage,
    });
    const innProvision = innHousehold.members.length * B2_EXPANSION_PROVISION_DAYS;
    innHousehold.pantry.pres += innProvision;
    innHousehold.settlerFoodReserves ??= {};
    innHousehold.settlerFoodReserves.pres = (
      innHousehold.settlerFoodReserves.pres ?? 0
    ) + innProvision;
    recordEconomicMaterialFlow(
      economy,
      "pres",
      "imp",
      innProvision,
      `${strategy.name}隊商宿世帯${innHousehold.id}の開拓時保存食`,
      { includeInDaily: false },
    );
    const suffix = (strategy.routeCount ?? 1) > 1 ? `${routeIndex + 1}` : "";
    const routeResult = createCaravanRoute(economy, physical, {
      name: `${strategy.name}線${suffix}`,
      baseBuildingId: innHousehold.buildingId,
      destMarketId: strategy.marketId,
      goodsOut: [...strategy.goodsOut],
      goodsBack: [...strategy.goodsBack],
      intervalDays: strategy.intervalDays,
      // 5日分では往復だけで棚が空になり、秋収穫から次の春までを持ち越せない。
      // 生鮮は品目ごとに腐敗するため過剰在庫が自然に抑えられ、麦・加工食は
      // 長距離線の冬越し用としてUI上限と同じ30日を初期値にする。
      stockTargetDays: 30,
      day: 0,
    });
    if (!routeResult.ok) throw new Error(`${strategy.name}線の設定不可: ${routeResult.reason}`);
    // 無料の較正用荷車は置かない。募集人数は最大編成として維持し、母港の
    // 荷車工房から会社が購入できた台数だけ路線が順次運行を始める。
    routeResults.push(routeResult);
  }
  return {
    marketId: strategy.marketId,
    openedDay: day,
    entrance: { ...entrance },
    marketBuildingId: placed.building.id,
    completedIndustryStageCount: 0,
    householdIds: households.map(household => household.id),
    routeId: routeResults[0].route.id,
    routeIds: routeResults.map(result => result.route.id),
    roadDays: routeResults[0].route.pathTicks / 30,
  };
}

function ensureB2FoodBackboneRoute(world, { day = world.state.day } = {}) {
  const controller = world.state.b2Strategy;
  if (!controller || controller.foodBackboneRouteId) return null;
  const basin = controller.expansions.find(expansion => expansion.marketId === "basin");
  const mining = controller.expansions.find(expansion => expansion.marketId === "mining");
  if (!basin || !mining) return null;
  const { economy, physical } = world.state;
  // 路線名だけを「直結」にしても、道路グラフが母港経由のままでは片道9.8日、
  // 往復中に鉱区48人が一便220荷を食べ切る。両市場間の実道路を先に敷き、
  // 穀倉余剰が在庫日数どおり届く物理的な背骨にする。
  connectB2Road(physical, basin.entrance, mining.entrance, "盆地―鉱山食料背骨道");
  const innZone = placeB2StarterZone(world, "carter", basin.entrance);
  connectB2Road(physical, basin.entrance, innZone, "盆地鉱山背骨線の隊商宿");
  const household = occupyScenarioZone(world, innZone, "basin", { foodKit: 0 });
  setScenarioHouseholdSize(economy, household, 8, "盆地鉱山背骨線隊商隊");
  const provision = household.members.length * B2_EXPANSION_PROVISION_DAYS;
  household.pantry.pres += provision;
  household.settlerFoodReserves ??= {};
  household.settlerFoodReserves.pres = provision;
  recordEconomicMaterialFlow(
    economy,
    "pres",
    "imp",
    provision,
    `盆地鉱山背骨線世帯${household.id}の開拓時保存食`,
    { includeInDaily: false },
  );
  setCaravanEmployment(physical, {
    buildingId: household.buildingId,
    recruitment: 8,
    wage: 0.75,
  });
  const routeResult = createCaravanRoute(economy, physical, {
    name: "盆地―鉱山食料背骨線",
    baseBuildingId: household.buildingId,
    destMarketId: "mining",
    goodsOut: ["wheat", "veg"],
    goodsBack: ["ore", "coal", "bar", "iron", "stone", "char", "tools"],
    intervalDays: 5,
    stockTargetDays: 30,
    day,
  });
  if (!routeResult.ok) throw new Error(`盆地―鉱山食料背骨線の設定不可: ${routeResult.reason}`);
  controller.foodBackboneRouteId = routeResult.route.id;
  controller.foodBackboneHouseholdId = household.id;
  recordEconomyEvent(
    economy,
    day,
    "盆地と鉱山を直接結ぶ食料背骨線を開いた——麦と鉱産物を母港で積み替えない",
  );
  return routeResult.route;
}

export function buildB2StrategyWorld(seed = 11, definition, strategyId = "fishery") {
  const order = B2_EXPANSION_ORDERS[strategyId];
  if (!order) throw new RangeError(`unknown B2 expansion strategy: ${strategyId}`);
  // 母港の「人口約150」は到達上限であり開始人口ではない。P5の戦略比較は
  // 4人×11世帯の先遣都市から始め、出生とLv効率で上限へ育つ過程を測る。
  const world = buildB2TrialWorld(seed, definition, {
    householdSize: 4,
    // 一年分の無料麦は母港需要を隠し、day365に突然需要崖を作る。拡張監査は
    // 全地域を同じ60日スターターに揃え、早期から市場間流通で暮らす。
    provisionDays: B2_EXPANSION_PROVISION_DAYS,
  });
  // Lvはfixtureから与えない。低Lvの生産から始め、地域間交易で必要財が届いた
  // 世帯だけが高効率へ上がり、その余剰を輸出できるかをP5の因果として測る。
  // 「先行」は配列順だけでなく時間差でなければ戦略にならない。最初の地域だけ
  // 開き、残りはcontrollerが会社資金と一年ごとの節目を見て段階開発する。
  // 隠れた拡張補助金は入れず、母港の開始資金と港湾輸出で次地域を賄う。
  const firstId = order[0];
  const expansions = [addB2StrategyMarket(
    world,
    definition,
    B2_EXPANSION_STRATEGIES[firstId],
    { day: 0 },
  )];
  if (firstId === "mining") world.state.economy.paving = true;
  world.state.b2Strategy = {
    id: strategyId,
    order: [...order],
    expansions,
    nextExpansionIndex: 1,
  };
  world.state.economy.jobSelectionPool = [...new Set([
    ...world.state.economy.jobSelectionPool,
    ...order.flatMap(id => [
      ...B2_EXPANSION_STRATEGIES[id].jobs,
      ...(B2_EXPANSION_STRATEGIES[id].industryStages ?? [])
        .flatMap(stage => stage.jobs),
    ]),
    "carter",
  ])];
  return world;
}

export function advanceB2StrategyExpansion(world, definition, { day = world.state.day } = {}) {
  const strategy = world.state.b2Strategy;
  if (!strategy) return null;
  const index = strategy.nextExpansionIndex ?? strategy.expansions.length;
  if (index >= strategy.order.length) return null;
  // 先行地域を四か月運営してから次へ出る。一度に全域を無料建設しない一方、
  // Lvを上げるために必要な赤字路線は既存の会社信用枠で先行投資できる。
  // 一年分賃金の現金保有を要求すると、交易網完成前の低Lv期から抜けられない。
  if (day < (B2_EXPANSION_MILESTONES[index] ?? Infinity)) return null;
  const id = strategy.order[index];
  const spec = B2_EXPANSION_STRATEGIES[id];
  // 鉱区の石材はLv2建物の修繕に必要で、Lv3到達を待ってから鉱区を開くと
  // 「石がないのでLv3になれない／Lv3がないので石を掘れない」の循環になる。
  // そのため基準筋では鉱区線を低Lv期の赤字投資として先に開き、盆地線を
  // 最初の冬までに接続する。これはプレイヤー裁定の「Lvを上げるための赤字路線」。
  const setupCost = (spec.jobs.length + 1) * P.BUILD_COST;
  if (
    world.state.economy.company.money - setupCost
    < -companyCreditLimit(world.state.economy, { day })
  ) return null;
  const expansion = addB2StrategyMarket(world, definition, spec, { day });
  if (id === "mining" && !world.state.economy.paving) {
    world.state.economy.paving = true;
    recordEconomyEvent(
      world.state.economy,
      day,
      "鉱区の石材を使う街道改良を開始した——会社買付の実在石材を交通路へ投入",
    );
  }
  strategy.expansions.push(expansion);
  strategy.nextExpansionIndex = index + 1;
  ensureB2FoodBackboneRoute(world, { day });
  recordEconomyEvent(
    world.state.economy,
    day,
    `${spec.name}へ段階拡張した——会社信用枠内でLv維持に必要な交易網へ先行投資`,
  );
  return expansion;
}

function advanceB2StrategyIndustryStages(world, { day = world.state.day } = {}) {
  const controller = world.state.b2Strategy;
  if (!controller) return [];
  const added = [];
  for (const expansion of controller.expansions) {
    const spec = B2_EXPANSION_STRATEGIES[expansion.marketId];
    const stages = spec?.industryStages ?? [];
    let stageIndex = expansion.completedIndustryStageCount ?? 0;
    while (stageIndex < stages.length) {
      const stage = stages[stageIndex];
      if (day < (expansion.openedDay ?? 0) + stage.afterDays) break;
      const setupCost = stage.jobs.length * P.BUILD_COST;
      if (
        world.state.economy.company.money - setupCost
        < -companyCreditLimit(world.state.economy, { day })
      ) break;
      const households = addB2StrategyHouseholds(
        world,
        spec,
        expansion.entrance,
        expansion.marketBuildingId,
        stage.jobs,
      );
      expansion.householdIds.push(...households.map(household => household.id));
      stageIndex += 1;
      expansion.completedIndustryStageCount = stageIndex;
      const jobs = stage.jobs.join("・");
      recordEconomyEvent(
        world.state.economy,
        day,
        `${spec.name}の中間財が貯まり、${jobs}を段階入植した`,
      );
      added.push({ marketId: spec.marketId, jobs: [...stage.jobs], day });
    }
  }
  return added;
}

function prepareB2StrategyFleet(world, { day = world.state.day } = {}) {
  const strategy = world.state.b2Strategy;
  if (!strategy) return null;
  // 次圏の開通60日前から実物を先行購入する。開通後に発注すると、車大工が
  // 在庫上限3台で休んでいた期間を取り戻せず、麦路線が一台編成のまま冬へ入る。
  // 無料配備ではなく会社支払・車大工収入・遊休資産をすべて台帳に残す。
  let fundedRegionCount = Math.min(
    strategy.order.length,
    strategy.expansions.length,
  );
  const nextIndex = strategy.nextExpansionIndex ?? strategy.expansions.length;
  const nextMilestone = B2_EXPANSION_MILESTONES[nextIndex] ?? Infinity;
  if (nextIndex < strategy.order.length && day >= nextMilestone - 60) {
    fundedRegionCount = Math.max(fundedRegionCount, nextIndex + 1);
  }
  const spokeTarget = strategy.order.slice(0, fundedRegionCount).reduce((total, id) => {
    const spec = B2_EXPANSION_STRATEGIES[id];
    return total + (spec.routeCount ?? 1) * spec.recruitment;
  }, 0);
  const target = spokeTarget + (strategy.foodBackboneRouteId ? 8 : 0);
  const usableCarts = (world.state.economy.companyCarts ?? []).filter(
    cart => (cart.durability ?? 0) > 1e-9,
  ).length;
  if (usableCarts >= target) return null;
  return purchaseCompanyWoodCart(world.state.economy, { day, marketId: "main" });
}

function b2RouteTotals(route) {
  return Object.values(route.monthly ?? {}).reduce((totals, row) => ({
    sales: totals.sales + (row.sales ?? 0),
    procurement: totals.procurement + (row.procurement ?? 0),
    wages: totals.wages + (row.wages ?? 0),
    cartCosts: totals.cartCosts + (row.cartCosts ?? row.wear ?? 0),
  }), { sales: 0, procurement: 0, wages: 0, cartCosts: 0 });
}

function b2ToolDemand(economy, days = 90) {
  return economy.households.reduce((total, household) => total + (
    P.D_TOOL * Math.pow(P.CMULT, household.lv)
      + P.WORK_TOOL_WOOD_COST / P.WORK_TOOL_WOOD_DAYS
  ) * days, 0);
}

function b2ToolSupply(economy) {
  const privateStock = economy.households.reduce((total, household) => (
    total + (household.pantry.tools ?? 0)
      + (household.workTool?.kind === "wood"
        ? household.workTool.durability / household.workTool.maxDurability
          * P.WORK_TOOL_WOOD_COST
        : 0)
  ), 0);
  const stalls = (economy.stalls.tools ?? []).reduce((total, stall) => total + stall.qty, 0);
  const routed = Object.values(economy.marketStockM ?? {}).reduce(
    (total, stock) => total + (stock.tools ?? 0),
    0,
  );
  const pending = (economy.importRequests ?? []).reduce((total, request) => (
    request.goods === "tools" && request.status !== "sold"
      ? total + Math.max(0, request.qty - (request.soldQty ?? 0))
      : total
  ), 0);
  return privateStock + stalls + routed + (economy.importStock.tools ?? 0) + pending;
}

function provisionB2DevelopmentTools(
  world,
  {
    day,
    intervalDays = B2_EXPANSION_INTERVAL_DAYS,
    lastDay = B2_EXPANSION_INTERVAL_DAYS * 2,
  },
) {
  const { economy, physical } = world.state;
  // 本土工具は自動救済ではなく、プレイヤー代理が会社勘定で発注する有限の
  // 開発投資。現地木工の日産が文化・作業道具需要を賄ったら発注を止める。
  // 既定は最初と二地域の入植日だけ90日分を発注し、それ以後は島内木工へ
  // 切り替える。P5監査では間隔と終了日を変え、育成投資の回収可能性を比較する。
  if (day > lastDay || (day !== 1 && day % intervalDays !== 0)) return null;
  const dailyDemand = b2ToolDemand(economy, 1);
  if ((economy.f30.tools?.prod ?? 0) >= dailyDemand * 1.1) return null;
  const missing = Math.ceil(Math.max(0, b2ToolDemand(economy) - b2ToolSupply(economy)));
  if (missing <= 0) return null;
  return requestCompanyImport(economy, physical, "tools", { day, qty: missing });
}

function exportB2IslandSurplus(world, { day }) {
  if (day % 15 !== 0) return [];
  const { economy, physical } = world.state;
  // 低Lv期の在庫を会社が吸い上げて延命するのではなく、地域交易でLv3へ達した
  // 生産者の高効率余剰だけを港へ回す。食料は島内に三日分以上残り、その日に
  // 空腹世帯がいない時だけ候補になる。
  if (!economy.households.some(household => household.lv >= 3)) return [];
  const population = auditPopulation(economy);
  const exports = [];
  for (const goods of ["tools", "char", "salt", "cloth", "stone", "ore", "coal", "bar", "iron", "pres", "pick"]) {
    const available = economy.marketStockM?.main?.[goods] ?? 0;
    const islandReserve = FOODS.includes(goods) ? population * 3 : 4;
    if (FOODS.includes(goods) && (economy.hungryN ?? 0) > 0) continue;
    const qty = Math.min(24, Math.max(0, available - islandReserve));
    if (qty <= 1e-9) continue;
    const exported = requestCompanySurplusExport(economy, physical, goods, {
      day,
      qty,
      minProducerLevel: 3,
      profitableOnly: true,
    });
    if (exported) exports.push(exported);
  }
  return exports;
}

export function runB2ExpansionScenario(
  definition,
  {
    seed = 11,
    strategyId = "fishery",
    days = 1800,
    developmentToolIntervalDays = B2_EXPANSION_INTERVAL_DAYS,
    // 移民の実物開拓キットと島内木工を既定とする。本土工具は比較実験で
    // 明示的に終了日を渡した時だけ会社発注し、木工需要を自動輸入で消さない。
    developmentToolLastDay = 0,
  } = {},
) {
  const world = buildB2StrategyWorld(seed, definition, strategyId);
  const economy = world.state.economy;
  const companyStart = economy.company.money;
  // P5は教程の初回木製品注文を終えた後の拡張期。未完の初回注文を再注入すると、
  // 枯渇済み母港林の木製品契約が全地域の塩・布・石の通常注文を永久に塞ぐ。
  economy.orderDone = Math.max(1, economy.orderDone ?? 0);
  // 完成品・地域特産の順で注文を選ぶ。同じ候補集合から選ぶだけで、注文量・
  // 単価・発生頻度は通常ゲームの規則を使う。
  economy.orderPreferredGoods = ["cloth", "tools", "salt", "stone", "char", "pres", "pick", "log"];
  const yearly = [];
  const developmentImports = [];
  const surplusExports = [];
  const fleetPurchases = [];
  let previousFamine = economy.famine;
  for (let day = 1; day <= days; day += 1) {
    const fleetPurchase = prepareB2StrategyFleet(world, { day });
    if (fleetPurchase) fleetPurchases.push({
      day,
      cartId: fleetPurchase.id ?? fleetPurchase.cart?.id ?? null,
      price: fleetPurchase.price ?? fleetPurchase.cart?.price ?? 0,
    });
    advanceB2StrategyExpansion(world, definition, { day });
    advanceB2StrategyIndustryStages(world, { day });
    const importedTools = provisionB2DevelopmentTools(world, {
      day,
      intervalDays: developmentToolIntervalDays,
      lastDay: developmentToolLastDay,
    });
    if (importedTools) developmentImports.push({
      day,
      goods: importedTools.goods,
      qty: importedTools.qty,
      cost: importedTools.qty * importedTools.unitCost,
    });
    surplusExports.push(...exportB2IslandSurplus(world, { day }));
    mimicPlayer(world, day);
    world.step();
    if (day % 360 === 0 || day === days) {
      const levels = economy.households.map(household => household.lv).sort((a, b) => a - b);
      yearly.push({
        day,
        population: auditPopulation(economy),
        famine: economy.famine - previousFamine,
        medianLevel: levels[Math.floor(levels.length / 2)] ?? 0,
        highLevelHouseholds: levels.filter(level => level >= 3).length,
        markets: world.state.marketNetwork?.markets?.length ?? 1,
        companyMoney: economy.company.money,
        portRevenue: (economy.co.expSell ?? 0) + (economy.co.ordSell ?? 0),
      });
      previousFamine = economy.famine;
    }
  }
  const routes = (economy.caravans ?? []).map(route => {
    const totals = b2RouteTotals(route);
    return {
      id: route.id,
      name: route.name,
      ...totals,
      margin: totals.sales - totals.procurement - totals.wages - totals.cartCosts,
      completedTrips: route.completedTrips ?? 0,
    };
  });
  const levels = economy.households.map(household => household.lv).sort((a, b) => a - b);
  return {
    seed,
    strategyId,
    days,
    world,
    companyStart,
    companyEnd: economy.company.money,
    companyDelta: economy.company.money - companyStart,
    bankruptcyDay: economy.goDay,
    orderRevenue: economy.co.ordSell ?? 0,
    regularExportRevenue: economy.co.expSell ?? 0,
    exported: { ...economy.exported },
    population: auditPopulation(economy),
    famine: economy.famine,
    medianLevel: levels[Math.floor(levels.length / 2)] ?? 0,
    highLevelHouseholds: levels.filter(level => level >= 3).length,
    markets: world.state.marketNetwork?.markets?.length ?? 1,
    expansions: [...(world.state.b2Strategy?.expansions ?? [])],
    developmentImports,
    fleetPurchases,
    surplusExports,
    routes,
    yearly,
  };
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

function occupyScenarioZone(world, zone, marketId, { foodKit } = {}) {
  const { economy, physical } = world.state;
  const household = createHousehold(economy, {
    job: zone.job,
    x: zone.x,
    y: zone.y,
    ...(foodKit === undefined ? {} : { foodKit }),
  });
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

function setScenarioHouseholdSize(economy, household, size, label) {
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new TypeError("scenario household size must be a positive safe integer");
  }
  household.members = household.members.slice(0, size);
  while (household.members.length < size) {
    const personId = economy.nextPersonId;
    economy.nextPersonId += 1;
    household.members.push({
      id: `person${personId}`,
      name: `${label}${household.members.length + 1}`,
      sex: household.members.length % 2 === 0 ? "♀" : "♂",
      age: 24 + household.members.length,
    });
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

function cheapestOrderGoods(economy, physical, goods, day) {
  const stall = economy.stalls[goods]
    .filter((stall) => stall.qty > 1e-9)
    .reduce((cheapest, stall) => Math.min(cheapest, stall.price), Infinity);
  const routedQty = economy.marketStockM?.main?.[goods] ?? 0;
  const routed = routedQty > 1e-9
    ? (economy.marketStockCostM?.main?.[goods] ?? 0) / routedQty
    : Infinity;
  const producing = economy.households
    .filter(household => (household.productionToday?.[goods] ?? 0) > 1e-9)
    .reduce((cheapest, household) => Math.min(
      cheapest,
      productionCost(economy, physical, household, goods, { day }),
    ), Infinity);
  return Math.min(stall, routed, producing);
}

function acceptProfitableOrder(world, day) {
  const { economy, physical } = world.state;
  const offer = economy.orderOffer;
  if (!offer) return null;
  // 森復活ゼロの世界で、目先の粗利だけを理由に有限丸太を本土へ捨てない。
  // 注文状は残して「見送る」判断を模写し、加工品の後続注文を待つ。
  if (offer.g === "log" && P.WOOD_R === 0) return null;
  const cheapest = cheapestOrderGoods(economy, physical, offer.g, day);
  if (cheapest > offer.price * 1.25) return null;
  return acceptCompanyOrder(economy, { day });
}

function countJobAndZones(economy, job) {
  return economy.households.filter((household) => household.job === job).length
    + economy.zones.filter((zone) => !zone.filled && zone.job === job).length;
}

export function mimicPlayer(world, day = world.state.day + 1) {
  const { economy } = world.state;
  const acceptedOrder = acceptProfitableOrder(world, day);
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
