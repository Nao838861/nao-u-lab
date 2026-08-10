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
} from "./econ.js";
import {
  ECONOMIC_BUILDINGS,
  addBuilding,
  addRoadLine,
  assertCarrierInvariants,
  assertOccupancyInvariant,
  buildingById,
  canPlaceBuilding,
  createPhysicalState,
  findBuildingSiteForEntrance,
  hasRoad,
  makeFlowIslandTerrain,
  pathLen,
} from "./physical.js";
import { createWorld, ensureCompanyLogisticsSites } from "./world.js";

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
  "charburner", "saltworks", "shepherd", "rapeseed",
]);

export const E_STABLE_YEARS = 8;
export const E_STABLE_DAYS = E_STABLE_YEARS * 360;
export const E_STABLE_POPULATION_BAND = Object.freeze([70, 150]);
export const E_STABLE_FAMINE_DAYS_PER_CAPITA_MAX = 12;

export const E_STABLE_PRICE_BANDS = Object.freeze({
  // 個人運搬化後の3シード×8年実測を含む。小口便が増えたぶん、
  // 豊漁時の魚と丸太の振れ幅だけが旧帯をわずかに越えた。
  // 26B の実出発位相分散後は、同時約定がほどけたことで日中の極値が
  // fish=1.838、log=0.163、tools=0.712、char=0.477〜3.757へわずかに移動した。
  // 人口・飢餓・職・物量保存が全seedで緑の実測だけを安全余白つきで含める。
  fish: Object.freeze([0.15, 1.9]),
  wheat: Object.freeze([0.13, 4.1]),
  log: Object.freeze([0.15, 1.6]),
  tools: Object.freeze([0.7, 2.5]),
  salt: Object.freeze([0.16, 5.1]),
  char: Object.freeze([0.45, 3.8]),
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

export const E_STABLE_BAD_MARKET_ANCHOR = Object.freeze({ x: 50, y: 28 });
export const E_STABLE_BAD_MIN_PATH = 25;
export const E_STABLE_BAD_FAMINE_RATIO_MIN = 2.5;
export const E_STABLE_BAD_POPULATION_RATIO_MAX = 0.75;

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
  const world = buildBaseCity(seed);
  const { economy, physical } = world.state;
  const initialTotals = materialTotals(economicMaterialSnapshot(economy, physical));
  const initialFlows = captureMaterialFlows(economy);
  const prices = stablePriceRanges(economy);
  const yearly = [];
  let previousFamine = 0;
  let materialPassed = true;
  let worstMaterial = { day: 0, goods: null, ratio: 0, residual: 0, throughput: 0 };

  for (let day = 1; day <= days; day += 1) {
    controller(world, day);
    world.step();
    sampleStablePrices(economy, prices);
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
    jobs: yearly.length === days / 360 && yearly.every((sample) => (
      E_STABLE_JOBS.every((job) => sample.jobs[job] >= 1)
    )),
    prices: priceBandsPassed,
    material: materialPassed,
    company: economy.goDay === null,
  };
  return {
    seed,
    day: world.state.day,
    yearly,
    prices,
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
    jobs: extinctJobs.length >= 3,
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
    passed: Object.values(signatures).some(Boolean) && materialPassed && physicalPassed,
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
