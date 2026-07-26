const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

const travelPathCaches = new WeakMap();

export const GOODS_UNIT_WEIGHT = Object.freeze({ ore: 2, bar: 2 });

export function goodsUnitWeight(goods) {
  return GOODS_UNIT_WEIGHT[goods] ?? 1;
}

export function carrierGoodsCapacity(carrier, goods) {
  if (!Number.isFinite(carrier?.capacity) || carrier.capacity < 0) {
    throw new TypeError("carrier capacity must be a finite non-negative number");
  }
  return carrier.capacity / goodsUnitWeight(goods);
}

export const V003_GRID = Object.freeze({ width: 24, height: 19 });
export const V003_FIXED = Object.freeze({
  port: { x: 2, y: 14, entrance: { x: 6, y: 15 }, grade: 3 },
  market: { x: 7, y: 12, entrance: { x: 8, y: 15 }, grade: 2 },
  roadHead: { x: 13, y: 11 },
  forestGate: { x: 13, y: 8 },
});
export const V003_BUILDINGS = Object.freeze({
  port: {
    category: "fixed", w: 4, h: 3,
    caps: { inbound: { food: 80, tools: 40, stone: 70 }, outbound: { boards: 80 } },
  },
  market: { category: "fixed", w: 3, h: 3, caps: { input: { food: 42 } } },
  logger: {
    category: "production", w: 3, h: 3, forestMin: 5,
    caps: { input: {}, output: { log: 32 }, construction: { boards: 40, tools: 20, stone: 30 } },
  },
  woodshop: {
    category: "production", w: 3, h: 3,
    caps: { input: { log: 26 }, output: { boards: 30 }, construction: { boards: 40, tools: 20, stone: 30 } },
  },
  warehouse: {
    category: "logistics", w: 3, h: 3,
    caps: { storage: { log: 40, boards: 40, food: 30, tools: 20, stone: 30 } },
  },
});

const ECONOMIC_LAND = Object.freeze(["grass", "sand"]);
const ECONOMIC_JOB_BUILDINGS = Object.freeze({
  fisher: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  fisher2: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  logger: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  woodshop: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  cartwright: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  charburner: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  saltworks: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  quarryman: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  miner: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  collier: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  smelter: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  smith: { category: "production", w: 3, h: 3, allowedTerrain: ECONOMIC_LAND },
  wheat: { category: "production", w: 4, h: 4, allowedTerrain: ECONOMIC_LAND },
  veg: { category: "production", w: 4, h: 4, allowedTerrain: ECONOMIC_LAND },
  shepherd: { category: "production", w: 4, h: 4, allowedTerrain: ECONOMIC_LAND },
  rapeseed: { category: "production", w: 4, h: 4, allowedTerrain: ECONOMIC_LAND },
});

export const ECONOMIC_BUILDINGS = Object.freeze({
  ...ECONOMIC_JOB_BUILDINGS,
  market: { category: "logistics", w: 5, h: 5, allowedTerrain: ECONOMIC_LAND },
  warehouse: { category: "logistics", w: 4, h: 4, allowedTerrain: ECONOMIC_LAND },
  port: { category: "fixed", w: 4, h: 3, shore: true },
});
export const V003_INITIAL_ROADS = Object.freeze([
  [6, 15], [7, 15], [8, 15], [9, 15],
  [10, 14], [11, 13], [12, 12], [13, 11],
]);

export const INVENTORY_SECTIONS = Object.freeze([
  "input", "output", "storage", "construction", "inbound", "outbound", "pickup",
]);

export const keyOf = (x, y) => `${x},${y}`;

export function parseKey(key) {
  return key.split(",").map(Number);
}

function seededNoise(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function makeV003Terrain(width = V003_GRID.width, height = V003_GRID.height) {
  const terrain = [];
  for (let y = 0; y < height; y += 1) {
    const row = [];
    for (let x = 0; x < width; x += 1) {
      const edge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const clippedCorner = x + y < 4 || x + y > 38 || x - y > 20 || y - x > 17;
      let kind = edge || clippedCorner ? "water" : "grass";
      if (kind === "grass" && x >= 15 && x <= 22 && y >= 3 && y <= 10 && seededNoise(x, y) > 0.12) kind = "forest";
      if (kind === "grass" && x >= 17 && y >= 12 && seededNoise(x, y) > 0.7) kind = "rock";
      if (x >= 16 && x <= 18 && y >= 7 && y <= 9) kind = "forest";
      row.push({ kind, variant: Math.floor(seededNoise(x + 41, y + 19) * 4) });
    }
    terrain.push(row);
  }
  return terrain;
}

export function makeFlowIslandTerrain(width = 48, height = 40) {
  const terrain = [];
  for (let y = 0; y < height; y += 1) {
    const row = [];
    for (let x = 0; x < width; x += 1) {
      let kind = "grass";
      if (y > height - 4 || (y > height - 7 && x > 18 && x < 32)) kind = "water";
      else if (y > height - 8 && y <= height - 4) kind = "sand";
      if (x < 16 && y < 16 && ((x * 7 + y * 13) % 5 < 3)) kind = "forest";
      if (x >= 10 && x <= 18 && y >= 15 && y <= 25 && ((x * 7 + y * 13) % 5 < 3)) kind = "forest";
      if (x >= 28 && x <= 33 && y >= 23 && y <= 27 && ((x * 5 + y * 11) % 4 < 3)) kind = "forest";
      if (x > 38 && y < 10) kind = "rock";
      if (x >= 8 && x <= 13 && y >= 20 && y <= 24 && ((x * 5 + y * 3) % 4 < 2)) kind = "ore";
      if (x >= 3 && x <= 7 && y >= 26 && y <= 30 && ((x * 7 + y * 5) % 4 < 2)) kind = "coal";
      row.push({ kind, variant: 0 });
    }
    terrain.push(row);
  }
  return terrain;
}

export function createPhysicalState({
  width = V003_GRID.width,
  height = V003_GRID.height,
  terrain = makeV003Terrain(width, height),
  roadOrigin = null,
} = {}) {
  return {
    width,
    height,
    terrain,
    roads: {},
    trails: {},
    roadWorksites: [],
    nextRoadWorksiteId: 1,
    roadOrigin,
    buildings: [],
    buildingIndex: {},
    roleBuildingIds: {},
    occupied: {},
    nextBuildingId: 1,
    roadRevision: 0,
    travelRevision: 0,
    carrierRoadRevision: -1,
    connectionCache: { revision: -1, components: {} },
    haulJobs: [],
    haulJobIndex: {},
    activeHaulJobIds: [],
    economicHaulJobIds: [],
    nextHaulJobId: 1,
    nextCarrierId: 1,
    tick: 0,
    portCalls: [],
    portCallIndex: {},
    activePortCallIds: [],
    portCallQueueIds: [],
    nextPortCallId: 1,
    groundPiles: [],
    nextGroundPileId: 1,
  };
}

export const COMPLETED_LOGISTICS_HISTORY_LIMIT = 96;

function retainRecentCompleted(records, activeIds, limit = COMPLETED_LOGISTICS_HISTORY_LIMIT) {
  if (records.length <= (activeIds?.length ?? 0) + limit) return records;
  const active = new Set(activeIds ?? []);
  const completed = records.filter((record) => !active.has(record.id));
  if (completed.length <= limit + 32) return records;
  const keepCompleted = new Set(completed.slice(-limit).map((record) => record.id));
  return records.filter((record) => active.has(record.id) || keepCompleted.has(record.id));
}

function rebuildRecordIndex(records) {
  return Object.fromEntries(records.map((record, index) => [record.id, index]));
}

export function prunePhysicalHistory(physical) {
  const haulJobs = retainRecentCompleted(
    physical.haulJobs ?? [],
    physical.activeHaulJobIds,
  );
  if (haulJobs !== physical.haulJobs) {
    physical.haulJobs = haulJobs;
    physical.haulJobIndex = rebuildRecordIndex(haulJobs);
  }
  const currentPortCalls = physical.portCalls ?? [];
  const retainedPortCount = (physical.activePortCallIds?.length ?? 0)
    + (physical.portCallQueueIds?.length ?? 0);
  const portCalls = currentPortCalls.length <= retainedPortCount + COMPLETED_LOGISTICS_HISTORY_LIMIT
    ? currentPortCalls
    : retainRecentCompleted(
      currentPortCalls,
      [...(physical.activePortCallIds ?? []), ...(physical.portCallQueueIds ?? [])],
    );
  if (portCalls !== physical.portCalls) {
    physical.portCalls = portCalls;
    physical.portCallIndex = rebuildRecordIndex(portCalls);
  }
  return physical;
}

export function inside(physical, x, y) {
  return x >= 0 && y >= 0 && x < physical.width && y < physical.height;
}

export function terrainAt(physical, x, y) {
  return inside(physical, x, y)
    ? physical.terrain[y][x]
    : { kind: "water", variant: 0 };
}

export function isLand(physical, x, y) {
  return inside(physical, x, y) && terrainAt(physical, x, y).kind !== "water";
}

function roadsOf(roadsOrPhysical) {
  return roadsOrPhysical?.roads ?? roadsOrPhysical;
}

export function hasRoad(roadsOrPhysical, x, y) {
  return roadsOf(roadsOrPhysical)?.[keyOf(x, y)] === true;
}

export function line8(a, b) {
  let [x0, y0] = a;
  const [x1, y1] = b;
  const points = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx - dy;
  while (true) {
    points.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const doubled = error * 2;
    if (doubled > -dy) {
      error -= dy;
      x0 += sx;
    }
    if (doubled < dx) {
      error += dx;
      y0 += sy;
    }
  }
  return points;
}

export function findLandRoadEntrance(physical, position, toward) {
  if (
    !Number.isFinite(position?.x)
    || !Number.isFinite(position?.y)
    || !Number.isFinite(toward?.x)
    || !Number.isFinite(toward?.y)
  ) return null;
  const cells = line8(
    [Math.round(position.x), Math.round(position.y)],
    [Math.round(toward.x), Math.round(toward.y)],
  );
  const land = cells.find(([x, y]) => isLand(physical, x, y));
  return land ? { x: land[0], y: land[1] } : null;
}

export function roadPath(roadsOrPhysical, start, goal) {
  const roads = roadsOf(roadsOrPhysical);
  const startKey = keyOf(start.x, start.y);
  const goalKey = keyOf(goal.x, goal.y);
  if (roads?.[startKey] !== true || roads?.[goalKey] !== true) return null;
  if (startKey === goalKey) return [{ x: start.x, y: start.y }];

  const open = [{ key: startKey, x: start.x, y: start.y, score: 0 }];
  const came = new Map();
  const costs = new Map([[startKey, 0]]);
  const seen = new Set();

  while (open.length > 0) {
    open.sort((a, b) => a.score - b.score);
    const current = open.shift();
    if (seen.has(current.key)) continue;
    seen.add(current.key);
    if (current.key === goalKey) {
      const path = [];
      let cursor = goalKey;
      while (cursor) {
        const [x, y] = parseKey(cursor);
        path.push({ x, y });
        cursor = came.get(cursor);
      }
      return path.reverse();
    }

    for (const [dirX, dirY] of DIRS) {
      const x = current.x + dirX;
      const y = current.y + dirY;
      const nextKey = keyOf(x, y);
      if (roads[nextKey] !== true || seen.has(nextKey)) continue;
      const diagonal = dirX !== 0 && dirY !== 0;
      const tentative = (costs.get(current.key) ?? Infinity) + (diagonal ? 1.414 : 1);
      if (tentative >= (costs.get(nextKey) ?? Infinity)) continue;
      came.set(nextKey, current.key);
      costs.set(nextKey, tentative);
      const heuristic = Math.hypot(goal.x - x, goal.y - y);
      open.push({ key: nextKey, x, y, score: tentative + heuristic });
    }
  }
  return null;
}

export function tileTravelCost(physical, x, y, mode = "walk") {
  if (mode !== "walk" && mode !== "cart") throw new Error(`unknown travel mode: ${mode}`);
  if (!inside(physical, x, y) || terrainAt(physical, x, y).kind === "water") return Infinity;
  if (physical.occupied[keyOf(x, y)]) return Infinity;
  const road = hasRoad(physical, x, y);
  if (mode === "cart") return road ? 0.6 : Infinity;
  if (road) return 0.6;
  if (physical.trails?.[keyOf(x, y)] === true) return 0.85;
  if (terrainAt(physical, x, y).kind === "forest") return 1.4;
  return 1;
}

export function findTravelPath(physical, start, goal, mode = "walk") {
  const trailSignature = Object.entries(physical.trails ?? {})
    .filter(([, active]) => active === true)
    .map(([key]) => key)
    .sort()
    .join(";");
  const revision = `${physical.roadRevision}:${physical.travelRevision ?? 0}:${trailSignature}`;
  let cache = travelPathCaches.get(physical);
  if (!cache || cache.revision !== revision) {
    cache = { revision, routes: new Map() };
    travelPathCaches.set(physical, cache);
  }
  const cacheKey = `${mode}:${start.x},${start.y}>${goal.x},${goal.y}`;
  if (cache.routes.has(cacheKey)) return cache.routes.get(cacheKey);
  const startCost = tileTravelCost(physical, start.x, start.y, mode);
  const goalCost = tileTravelCost(physical, goal.x, goal.y, mode);
  if (!Number.isFinite(startCost) || !Number.isFinite(goalCost)) {
    cache.routes.set(cacheKey, null);
    return null;
  }
  if (start.x === goal.x && start.y === goal.y) {
    const route = { path: [{ x: start.x, y: start.y }], cost: 0 };
    cache.routes.set(cacheKey, route);
    return route;
  }

  const distances = new Float64Array(physical.width * physical.height);
  distances.fill(Infinity);
  const indexOf = (x, y) => y * physical.width + x;
  distances[indexOf(start.x, start.y)] = 0;
  const open = [{ x: start.x, y: start.y, cost: 0 }];
  const came = {};

  while (open.length > 0) {
    open.sort((a, b) => a.cost - b.cost);
    const current = open.shift();
    const currentIndex = indexOf(current.x, current.y);
    if (current.cost > distances[currentIndex] + 1e-9) continue;
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let cursor = keyOf(goal.x, goal.y);
      while (cursor) {
        const [x, y] = parseKey(cursor);
        path.push({ x, y });
        cursor = came[cursor];
      }
      const route = { path: path.reverse(), cost: current.cost };
      cache.routes.set(cacheKey, route);
      return route;
    }

    for (const [dirX, dirY] of DIRS) {
      const x = current.x + dirX;
      const y = current.y + dirY;
      const tileCost = tileTravelCost(physical, x, y, mode);
      if (!Number.isFinite(tileCost)) continue;
      const diagonal = dirX !== 0 && dirY !== 0;
      const nextCost = current.cost + tileCost * (diagonal ? 1.4 : 1);
      const nextIndex = indexOf(x, y);
      if (nextCost >= distances[nextIndex] - 1e-9) continue;
      distances[nextIndex] = nextCost;
      came[keyOf(x, y)] = keyOf(current.x, current.y);
      open.push({ x, y, cost: nextCost });
    }
  }
  cache.routes.set(cacheKey, null);
  return null;
}

export function pathLen(physical, start, goal, mode = "walk") {
  return findTravelPath(physical, start, goal, mode)?.cost ?? Infinity;
}

export function findNearestTravelTarget(physical, start, predicate, mode = "walk") {
  if (typeof predicate !== "function") throw new TypeError("travel target predicate must be a function");
  if (!inside(physical, start?.x, start?.y)) return null;
  const startCost = tileTravelCost(physical, start.x, start.y, mode);
  if (!Number.isFinite(startCost)) return null;
  const distances = new Float64Array(physical.width * physical.height);
  distances.fill(Infinity);
  const indexOf = (x, y) => y * physical.width + x;
  distances[indexOf(start.x, start.y)] = 0;
  const open = [{ x: start.x, y: start.y, cost: 0 }];
  const came = {};

  while (open.length > 0) {
    open.sort((left, right) => left.cost - right.cost || left.y - right.y || left.x - right.x);
    const current = open.shift();
    if (current.cost > distances[indexOf(current.x, current.y)] + 1e-9) continue;
    if (predicate(current.x, current.y)) {
      const path = [];
      let cursor = keyOf(current.x, current.y);
      while (cursor) {
        const [x, y] = parseKey(cursor);
        path.push({ x, y });
        cursor = came[cursor];
      }
      return {
        x: current.x,
        y: current.y,
        cost: current.cost,
        path: path.reverse(),
      };
    }
    for (const [dirX, dirY] of DIRS) {
      const x = current.x + dirX;
      const y = current.y + dirY;
      const tileCost = tileTravelCost(physical, x, y, mode);
      if (!Number.isFinite(tileCost)) continue;
      const diagonal = dirX !== 0 && dirY !== 0;
      const nextCost = current.cost + tileCost * (diagonal ? 1.4 : 1);
      const nextIndex = indexOf(x, y);
      if (nextCost >= distances[nextIndex] - 1e-9) continue;
      distances[nextIndex] = nextCost;
      came[keyOf(x, y)] = keyOf(current.x, current.y);
      open.push({ x, y, cost: nextCost });
    }
  }
  return null;
}

export function connectedRoads(roadsOrPhysical, origin) {
  const roads = roadsOf(roadsOrPhysical);
  const originKey = keyOf(origin.x, origin.y);
  const connected = new Set();
  if (roads?.[originKey] !== true) return connected;
  const queue = [[origin.x, origin.y]];
  connected.add(originKey);
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    for (const [dirX, dirY] of DIRS) {
      const next = keyOf(x + dirX, y + dirY);
      if (roads[next] !== true || connected.has(next)) continue;
      connected.add(next);
      queue.push([x + dirX, y + dirY]);
    }
  }
  return connected;
}

function rebuildConnectionCache(physical) {
  const components = {};
  let componentId = 0;
  for (const roadKey of Object.keys(physical.roads).sort()) {
    if (components[roadKey] !== undefined) continue;
    componentId += 1;
    const [originX, originY] = parseKey(roadKey);
    const queue = [[originX, originY]];
    components[roadKey] = componentId;
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      for (const [dirX, dirY] of DIRS) {
        const nextKey = keyOf(x + dirX, y + dirY);
        if (physical.roads[nextKey] !== true || components[nextKey] !== undefined) continue;
        components[nextKey] = componentId;
        queue.push([x + dirX, y + dirY]);
      }
    }
  }
  physical.connectionCache = { revision: physical.roadRevision, components };
  return physical.connectionCache;
}

export function roadConnectionComponents(physical) {
  if (physical.connectionCache?.revision !== physical.roadRevision) {
    return rebuildConnectionCache(physical).components;
  }
  return physical.connectionCache.components;
}

export function isConnected(physical, buildingA, buildingB) {
  if (!buildingA?.entrance || !buildingB?.entrance) return false;
  const components = roadConnectionComponents(physical);
  const componentA = components[keyOf(buildingA.entrance.x, buildingA.entrance.y)];
  const componentB = components[keyOf(buildingB.entrance.x, buildingB.entrance.y)];
  return componentA !== undefined && componentA === componentB;
}

export function perimeterTiles(x, y, width, height) {
  const tiles = [];
  for (let tileX = x; tileX < x + width; tileX += 1) {
    tiles.push({ x: tileX, y: y - 1, side: "north" });
    tiles.push({ x: tileX, y: y + height, side: "south" });
  }
  for (let tileY = y; tileY < y + height; tileY += 1) {
    tiles.push({ x: x - 1, y: tileY, side: "west" });
    tiles.push({ x: x + width, y: tileY, side: "east" });
  }
  return tiles;
}

export function footprintTiles(type, x, y, definitions = V003_BUILDINGS) {
  const definition = definitions[type];
  if (!definition) throw new Error(`unknown building: ${type}`);
  const tiles = [];
  for (let tileY = y; tileY < y + definition.h; tileY += 1) {
    for (let tileX = x; tileX < x + definition.w; tileX += 1) {
      tiles.push({ x: tileX, y: tileY });
    }
  }
  return tiles;
}

export function addRoadTile(physical, x, y) {
  const key = keyOf(x, y);
  if (!isLand(physical, x, y) || physical.occupied[key]) return false;
  if (physical.roads[key] === true) return true;
  physical.roads[key] = true;
  physical.roadRevision += 1;
  return true;
}

export function planRoadWorksite(physical, x, y, { workRequired = 3 } = {}) {
  if (!Number.isSafeInteger(workRequired) || workRequired <= 0) {
    throw new TypeError("workRequired must be a positive safe integer");
  }
  const key = keyOf(x, y);
  if (
    !isLand(physical, x, y)
    || physical.occupied[key]
    || physical.roads[key] === true
    || physical.roadWorksites.some((worksite) => worksite.x === x && worksite.y === y)
  ) return null;
  const worksite = {
    id: physical.nextRoadWorksiteId,
    kind: "road",
    x,
    y,
    left: workRequired,
  };
  physical.nextRoadWorksiteId += 1;
  physical.roadWorksites.push(worksite);
  return worksite;
}

export function workRoadWorksite(physical, worksiteId) {
  const index = physical.roadWorksites.findIndex((worksite) => worksite.id === worksiteId);
  if (index < 0) return { worked: false, completed: false, worksite: null };
  const worksite = physical.roadWorksites[index];
  worksite.left -= 1;
  if (worksite.left > 0) return { worked: true, completed: false, worksite };
  const completed = addRoadTile(physical, worksite.x, worksite.y);
  physical.roadWorksites.splice(index, 1);
  return { worked: true, completed, worksite };
}

export function removeRoadTile(physical, x, y) {
  const key = keyOf(x, y);
  if (physical.roads[key] !== true) return false;
  delete physical.roads[key];
  physical.roadRevision += 1;
  return true;
}

export function addRoadLine(physical, start, end) {
  const cells = line8([start.x, start.y], [end.x, end.y]).map(([x, y]) => ({ x, y }));
  if (cells.some(({ x, y }) => !isLand(physical, x, y) || physical.occupied[keyOf(x, y)])) {
    return { ok: false, cells, newCells: [] };
  }
  const newCells = cells.filter(({ x, y }) => !hasRoad(physical, x, y));
  for (const { x, y } of newCells) addRoadTile(physical, x, y);
  return { ok: newCells.length > 0, cells, newCells };
}

export function findEntrance(physical, type, x, y, definitions = V003_BUILDINGS) {
  const definition = definitions[type];
  if (!definition || !physical.roadOrigin) return null;
  const connected = connectedRoads(physical, physical.roadOrigin);
  const candidates = perimeterTiles(x, y, definition.w, definition.h)
    .filter((tile) => connected.has(keyOf(tile.x, tile.y)))
    .sort((a, b) => {
      const distanceA = Math.hypot(a.x - physical.roadOrigin.x, a.y - physical.roadOrigin.y);
      const distanceB = Math.hypot(b.x - physical.roadOrigin.x, b.y - physical.roadOrigin.y);
      return distanceA - distanceB;
    });
  return candidates[0] ?? null;
}

export function isPerimeterEntrance(x, y, width, height, entrance) {
  if (!Number.isSafeInteger(entrance?.x) || !Number.isSafeInteger(entrance?.y)) return false;
  return perimeterTiles(x, y, width, height)
    .some((tile) => tile.x === entrance.x && tile.y === entrance.y);
}

export function findBuildingSiteForEntrance(
  physical,
  type,
  entrance,
  {
    definitions = ECONOMIC_BUILDINGS,
    toward = null,
    preferredOrigin = null,
    fixed = false,
  } = {},
) {
  const definition = definitions[type];
  if (!definition) return null;
  const origins = new Map();
  for (let x = entrance.x - definition.w + 1; x <= entrance.x; x += 1) {
    for (const y of [entrance.y + 1, entrance.y - definition.h]) {
      origins.set(keyOf(x, y), { x, y });
    }
  }
  for (let y = entrance.y - definition.h + 1; y <= entrance.y; y += 1) {
    for (const x of [entrance.x + 1, entrance.x - definition.w]) {
      origins.set(keyOf(x, y), { x, y });
    }
  }
  const candidates = [...origins.values()].filter(({ x, y }) => canPlaceBuilding(
    physical,
    type,
    x,
    y,
    { definitions, entrance, requireRoad: false, fixed },
  ).ok);
  candidates.sort((a, b) => {
    const preferredA = preferredOrigin && a.x === preferredOrigin.x && a.y === preferredOrigin.y ? 0 : 1;
    const preferredB = preferredOrigin && b.x === preferredOrigin.x && b.y === preferredOrigin.y ? 0 : 1;
    if (preferredA !== preferredB) return preferredA - preferredB;
    if (toward) {
      const centerA = { x: a.x + (definition.w - 1) / 2, y: a.y + (definition.h - 1) / 2 };
      const centerB = { x: b.x + (definition.w - 1) / 2, y: b.y + (definition.h - 1) / 2 };
      const direction = { x: toward.x - entrance.x, y: toward.y - entrance.y };
      const facingA = (centerA.x - entrance.x) * direction.x
        + (centerA.y - entrance.y) * direction.y;
      const facingB = (centerB.x - entrance.x) * direction.x
        + (centerB.y - entrance.y) * direction.y;
      if (facingA !== facingB) return facingA - facingB;
    }
    return a.y - b.y || a.x - b.x;
  });
  return candidates[0] ?? null;
}

export function canPlaceBuilding(physical, type, x, y, options = {}) {
  const definitions = options.definitions ?? V003_BUILDINGS;
  const definition = definitions[type];
  if (!definition) return { ok: false, reason: "unknown-building" };
  if (definition.category === "fixed" && !options.fixed) return { ok: false, reason: "fixed-building" };
  if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) {
    return { ok: false, reason: "invalid-position" };
  }
  const tiles = footprintTiles(type, x, y, definitions);
  if (tiles.some((tile) => !inside(physical, tile.x, tile.y))) {
    return { ok: false, reason: "out-of-bounds" };
  }
  if (definition.shore) {
    const landCount = tiles.filter((tile) => isLand(physical, tile.x, tile.y)).length;
    if (landCount === 0 || landCount === tiles.length) {
      return { ok: false, reason: "shore-required" };
    }
  } else if (definition.allowedTerrain && tiles.some((tile) => (
    !definition.allowedTerrain.includes(terrainAt(physical, tile.x, tile.y).kind)
  ))) {
    return { ok: false, reason: "terrain-blocked" };
  } else if (tiles.some((tile) => !isLand(physical, tile.x, tile.y))) {
    return { ok: false, reason: "not-land" };
  }
  if (tiles.some((tile) => hasRoad(physical, tile.x, tile.y))) return { ok: false, reason: "road-overlap" };
  if (tiles.some((tile) => physical.occupied[keyOf(tile.x, tile.y)])) return { ok: false, reason: "building-overlap" };
  if (definition.forestMin) {
    const forest = tiles.filter((tile) => terrainAt(physical, tile.x, tile.y).kind === "forest").length;
    if (forest < definition.forestMin) return { ok: false, reason: "forest-required" };
  }
  const entrance = options.entrance ?? findEntrance(physical, type, x, y, definitions);
  if (
    entrance
    && !isPerimeterEntrance(x, y, definition.w, definition.h, entrance)
  ) return { ok: false, reason: "invalid-entrance" };
  if (entrance && !isLand(physical, entrance.x, entrance.y)) {
    return { ok: false, reason: "entrance-not-land" };
  }
  if (entrance && physical.occupied[keyOf(entrance.x, entrance.y)]) {
    return { ok: false, reason: "entrance-blocked" };
  }
  if (options.requireRoad !== false && !entrance) return { ok: false, reason: "road-required" };
  return { ok: true, entrance };
}

export function addBuilding(physical, type, x, y, options = {}) {
  const definitions = options.definitions ?? V003_BUILDINGS;
  const check = canPlaceBuilding(physical, type, x, y, options);
  if (!check.ok) return check;
  const definition = definitions[type];
  const building = {
    id: `b${physical.nextBuildingId}`,
    type,
    x,
    y,
    w: definition.w,
    h: definition.h,
    entrance: options.entrance ?? check.entrance ?? null,
    role: options.role ?? null,
    roles: [...new Set(options.roles ?? (options.role ? [options.role] : []))],
    ownerHouseholdId: options.ownerHouseholdId ?? null,
    fixed: Boolean(options.fixed),
    grade: options.grade ?? 0,
    inventory: createSectionInventory(),
    caps: structuredClone(options.caps ?? definition.caps ?? {}),
  };
  physical.nextBuildingId += 1;
  physical.buildings.push(building);
  physical.buildingIndex[building.id] = physical.buildings.length - 1;
  for (const tile of footprintTiles(type, x, y, definitions)) {
    physical.occupied[keyOf(tile.x, tile.y)] = building.id;
  }
  for (const role of building.roles) physical.roleBuildingIds[role] = building.id;
  physical.travelRevision = (physical.travelRevision ?? 0) + 1;
  return { ok: true, building };
}

export function removeBuilding(physical, buildingOrId) {
  const building = typeof buildingOrId === "string"
    ? buildingById(physical, buildingOrId)
    : buildingOrId;
  if (!building) return false;
  const active = activeHaulJobs(physical).some((job) => (
    job.from.buildingId === building.id || job.to.buildingId === building.id
  ));
  if (active) throw new Error(`運搬中の建物は撤去できません: ${building.id}`);
  const stored = INVENTORY_SECTIONS.some((section) => (
    Object.values(building.inventory[section]).some((qty) => qty > 1e-9)
  ));
  if (stored) throw new Error(`在庫のある建物は撤去できません: ${building.id}`);
  for (let tileY = building.y; tileY < building.y + building.h; tileY += 1) {
    for (let tileX = building.x; tileX < building.x + building.w; tileX += 1) {
      delete physical.occupied[keyOf(tileX, tileY)];
    }
  }
  const index = physical.buildings.findIndex((candidate) => candidate.id === building.id);
  physical.buildings.splice(index, 1);
  delete physical.buildingIndex[building.id];
  for (let nextIndex = index; nextIndex < physical.buildings.length; nextIndex += 1) {
    physical.buildingIndex[physical.buildings[nextIndex].id] = nextIndex;
  }
  for (const [role, buildingId] of Object.entries(physical.roleBuildingIds)) {
    if (buildingId === building.id) delete physical.roleBuildingIds[role];
  }
  physical.travelRevision = (physical.travelRevision ?? 0) + 1;
  return true;
}

export function dockVessel(
  physical,
  { portBuildingId = physical.roleBuildingIds?.port, direction, goods, qty, metadata = {} },
) {
  const port = buildingById(physical, portBuildingId);
  if (!port || port.type !== "port") throw new Error("接岸先の港がありません");
  if (direction !== "export" && direction !== "import") {
    throw new Error(`unknown port transfer direction: ${direction}`);
  }
  if (typeof goods !== "string" || !Number.isFinite(qty) || qty <= 0) {
    throw new TypeError("port transfer goods/qty must be positive");
  }
  const dockImmediately = (physical.activePortCallIds?.length ?? 0) === 0;
  const call = {
    id: `pc${physical.nextPortCallId}`,
    portBuildingId: port.id,
    direction,
    goods,
    qty,
    remaining: qty,
    transferred: 0,
    vesselCargo: direction === "import" ? qty : 0,
    status: dockImmediately ? "docked" : "waiting",
    metadata: structuredClone(metadata),
  };
  physical.nextPortCallId += 1;
  physical.portCalls.push(call);
  (physical.portCallIndex ??= {})[call.id] = physical.portCalls.length - 1;
  if (dockImmediately) (physical.activePortCallIds ??= []).push(call.id);
  else (physical.portCallQueueIds ??= []).push(call.id);
  return call;
}

export function portCallById(physical, callId) {
  const index = physical.portCallIndex?.[callId];
  if (Number.isSafeInteger(index) && physical.portCalls[index]?.id === callId) {
    return physical.portCalls[index];
  }
  const fallbackIndex = physical.portCalls.findIndex((call) => call.id === callId);
  if (fallbackIndex < 0) return null;
  (physical.portCallIndex ??= {})[callId] = fallbackIndex;
  return physical.portCalls[fallbackIndex];
}

export function activePortCalls(physical) {
  if (!Array.isArray(physical.activePortCallIds)) {
    physical.activePortCallIds = physical.portCalls
      .filter((call) => call.status === "docked")
      .map((call) => call.id);
  }
  const active = [];
  const activeIds = [];
  for (const callId of physical.activePortCallIds) {
    const call = portCallById(physical, callId);
    if (!call || call.status !== "docked") continue;
    active.push(call);
    activeIds.push(callId);
  }
  if (activeIds.length !== physical.activePortCallIds.length) {
    physical.activePortCallIds = activeIds;
  }
  return active;
}

function activateNextPortCall(physical) {
  const queue = physical.portCallQueueIds ??= [];
  while (queue.length > 0) {
    const call = portCallById(physical, queue.shift());
    if (!call || call.status !== "waiting") continue;
    call.status = "docked";
    (physical.activePortCallIds ??= []).push(call.id);
    return call;
  }
  return null;
}

export function cancelPortCall(physical, callId) {
  const call = portCallById(physical, callId);
  if (!call || !["docked", "waiting"].includes(call.status)) return null;
  const wasDocked = call.status === "docked";
  call.status = "cancelled";
  const activeIndex = physical.activePortCallIds?.indexOf(call.id) ?? -1;
  if (activeIndex >= 0) physical.activePortCallIds.splice(activeIndex, 1);
  const queueIndex = physical.portCallQueueIds?.indexOf(call.id) ?? -1;
  if (queueIndex >= 0) physical.portCallQueueIds.splice(queueIndex, 1);
  if (wasDocked) activateNextPortCall(physical);
  return call;
}

export function stepPortHandling(physical, ticks = 1) {
  if (!Number.isSafeInteger(ticks) || ticks < 0) {
    throw new TypeError("port handling ticks must be a non-negative safe integer");
  }
  const transfers = [];
  for (let tick = 0; tick < ticks; tick += 1) {
    let call = null;
    while ((physical.activePortCallIds?.length ?? 0) > 0) {
      const candidate = portCallById(physical, physical.activePortCallIds[0]);
      if (candidate?.status === "docked" && candidate.remaining > 1e-9) {
        call = candidate;
        break;
      }
      physical.activePortCallIds.shift();
    }
    if (call && call.direction !== "import" && call.metadata?.yardReady !== true) call = null;
    if (!call) break;
    const port = buildingById(physical, call.portBuildingId);
    const section = call.direction === "export" ? "outbound" : "inbound";
    let qty = Math.min(1, call.remaining);
    if (call.direction === "export") {
      qty = Math.min(qty, sectionAmount(port, section, call.goods));
      if (qty <= 1e-9) continue;
      withdrawInventory(port, section, call.goods, qty);
      call.vesselCargo += qty;
    } else {
      qty = Math.min(qty, call.vesselCargo);
      if (qty <= 1e-9) continue;
      depositInventory(port, section, call.goods, qty);
      call.vesselCargo -= qty;
    }
    call.remaining -= qty;
    call.transferred += qty;
    if (call.remaining <= 1e-9) {
      call.remaining = 0;
      call.status = "completed";
      if (physical.activePortCallIds[0] === call.id) physical.activePortCallIds.shift();
      else {
        const activeIndex = physical.activePortCallIds.indexOf(call.id);
        if (activeIndex >= 0) physical.activePortCallIds.splice(activeIndex, 1);
      }
      activateNextPortCall(physical);
    }
    transfers.push({
      callId: call.id,
      portBuildingId: port.id,
      direction: call.direction,
      goods: call.goods,
      qty,
      completed: call.status === "completed",
      metadata: call.metadata,
    });
  }
  return transfers;
}

export function createSectionInventory() {
  return Object.fromEntries(INVENTORY_SECTIONS.map((section) => [section, {}]));
}

function requireSection(building, section) {
  if (!INVENTORY_SECTIONS.includes(section) || !building?.inventory?.[section]) {
    throw new Error(`unknown inventory section: ${section}`);
  }
}

function requireInventoryAmount(amount) {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new TypeError("inventory amount must be a finite non-negative number");
  }
}

export function sectionAmount(building, section, goods) {
  requireSection(building, section);
  return Number(building.inventory[section][goods] ?? 0);
}

export function sectionCapacity(building, section, goods) {
  requireSection(building, section);
  const base = Number(building.caps?.[section]?.[goods] ?? 0);
  if (base <= 0) return 0;
  if (["input", "output", "storage"].includes(section)) {
    return Math.round(base * (1 + building.grade * 0.2));
  }
  return base;
}

export function depositInventory(building, section, goods, amount) {
  requireSection(building, section);
  requireInventoryAmount(amount);
  const current = sectionAmount(building, section, goods);
  const capacity = sectionCapacity(building, section, goods);
  if (current + amount > capacity + 1e-9) {
    throw new Error(`棚容量超過 ${building.id}/${section}/${goods}`);
  }
  building.inventory[section][goods] = current + amount;
  return building.inventory[section][goods];
}

export function withdrawInventory(building, section, goods, amount) {
  requireSection(building, section);
  requireInventoryAmount(amount);
  const current = sectionAmount(building, section, goods);
  if (amount > current + 1e-9) {
    throw new Error(`棚在庫不足 ${building.id}/${section}/${goods}`);
  }
  building.inventory[section][goods] = current - amount;
  return building.inventory[section][goods];
}

export function moveInventoryBetweenSections() {
  throw new Error("棚を跨ぐ移動には運搬ジョブが必要です");
}

export function buildingById(physical, buildingId) {
  const indexed = physical.buildingIndex?.[buildingId];
  if (indexed !== undefined && physical.buildings[indexed]?.id === buildingId) {
    return physical.buildings[indexed];
  }
  const index = physical.buildings.findIndex((building) => building.id === buildingId);
  if (index < 0) return null;
  (physical.buildingIndex ??= {})[buildingId] = index;
  return physical.buildings[index];
}

function normalizeHaulEndpoint(endpoint) {
  const buildingId = endpoint?.buildingId ?? endpoint?.building?.id ?? endpoint?.building;
  if (typeof buildingId !== "string" || typeof endpoint?.section !== "string") {
    throw new TypeError("haul endpoint must identify a building and section");
  }
  return { buildingId, section: endpoint.section };
}

function requirePositiveQuantity(qty, label = "haul quantity") {
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new TypeError(`${label} must be a finite positive number`);
  }
}

export function createWalkCarrier(physical, { people = 1, id = null } = {}) {
  if (!Number.isSafeInteger(people) || people <= 0) {
    throw new TypeError("walk carrier people must be a positive safe integer");
  }
  const carrier = {
    id: id ?? `walker${physical.nextCarrierId}`,
    mode: "walk",
    people,
    capacity: people,
  };
  physical.nextCarrierId += 1;
  return carrier;
}

export function createCartCarrier(
  physical,
  { id = null, capacity = 8, cartKind = "wood", assetId = null } = {},
) {
  requirePositiveQuantity(capacity, "cart carrier capacity");
  const carrier = {
    id: id ?? `cart${physical.nextCarrierId}`,
    mode: "cart",
    capacity,
    cartKind,
    assetId,
  };
  physical.nextCarrierId += 1;
  return carrier;
}

export function routeTravelCarrier(physical, carrier, start, goal) {
  if (!carrier || (carrier.mode !== "walk" && carrier.mode !== "cart")) {
    throw new TypeError("travel carrier mode must be walk or cart");
  }
  const routeMode = carrier.routeMode ?? carrier.mode;
  const route = findTravelPath(physical, start, goal, routeMode);
  if (!route) throw new Error(`${routeMode}で到達できる経路がありません`);
  carrier.active = true;
  carrier.path = route.path;
  carrier.routeCost = route.cost;
  carrier.pathIndex = 0;
  carrier.segmentRemaining = null;
  carrier.position = structuredClone(route.path[0]);
  return carrier;
}

export function incomingHaulAmount(physical, buildingId, section, goods) {
  return activeHaulJobs(physical)
    .filter((job) => job.to.buildingId === buildingId && job.to.section === section && job.goods === goods)
    .reduce((total, job) => total + job.qty, 0);
}

export function createHaulJob(physical, { from, to, goods, qty, carrier }) {
  const sourceRef = normalizeHaulEndpoint(from);
  const targetRef = normalizeHaulEndpoint(to);
  const source = buildingById(physical, sourceRef.buildingId);
  const target = buildingById(physical, targetRef.buildingId);
  if (!source || !target) throw new Error("運搬元または運搬先の建物が存在しません");
  requireSection(source, sourceRef.section);
  requireSection(target, targetRef.section);
  requirePositiveQuantity(qty);
  if (typeof goods !== "string" || goods.length === 0) throw new TypeError("goods must be a non-empty string");
  if (!carrier || typeof carrier !== "object") throw new TypeError("haul job requires a carrier");
  requirePositiveQuantity(carrier.capacity, "carrier capacity");
  if (qty > carrierGoodsCapacity(carrier, goods) + 1e-9) throw new Error("キャリア容量超過");
  if (sectionAmount(source, sourceRef.section, goods) + 1e-9 < qty) throw new Error("運搬元の在庫不足");

  const targetFree = sectionCapacity(target, targetRef.section, goods)
    - sectionAmount(target, targetRef.section, goods)
    - incomingHaulAmount(physical, target.id, targetRef.section, goods);
  if (targetFree + 1e-9 < qty) throw new Error("運搬先の空き容量不足");

  const sourcePosition = source.entrance ?? { x: source.x + source.w / 2, y: source.y + source.h / 2 };
  const targetPosition = target.entrance ?? { x: target.x + target.w / 2, y: target.y + target.h / 2 };
  const jobCarrier = structuredClone(carrier);
  jobCarrier.cargo = { goods, qty };
  if (jobCarrier.mode === "walk" || jobCarrier.mode === "cart") {
    if (!source.entrance || !target.entrance) throw new Error("移動キャリアには両建物の入口が必要です");
    routeTravelCarrier(physical, jobCarrier, sourcePosition, targetPosition);
  }

  withdrawInventory(source, sourceRef.section, goods, qty);
  const job = {
    id: `h${physical.nextHaulJobId}`,
    from: sourceRef,
    to: targetRef,
    goods,
    qty,
    carrier: jobCarrier,
    status: "in_transit",
  };
  physical.nextHaulJobId += 1;
  physical.haulJobs.push(job);
  (physical.haulJobIndex ??= {})[job.id] = physical.haulJobs.length - 1;
  (physical.activeHaulJobIds ??= []).push(job.id);
  return job;
}

export function haulJobById(physical, jobId) {
  const index = physical.haulJobIndex?.[jobId];
  if (Number.isSafeInteger(index) && physical.haulJobs[index]?.id === jobId) {
    return physical.haulJobs[index];
  }
  const fallbackIndex = physical.haulJobs.findIndex((job) => job.id === jobId);
  if (fallbackIndex < 0) return null;
  (physical.haulJobIndex ??= {})[jobId] = fallbackIndex;
  return physical.haulJobs[fallbackIndex];
}

function activeHaulJobs(physical) {
  if (!Array.isArray(physical.activeHaulJobIds)) {
    physical.activeHaulJobIds = physical.haulJobs
      .filter((job) => job.status === "in_transit")
      .map((job) => job.id);
  }
  return physical.activeHaulJobIds
    .map((jobId) => haulJobById(physical, jobId))
    .filter((job) => job?.status === "in_transit");
}

function deactivateHaulJob(physical, jobId) {
  const index = physical.activeHaulJobIds?.indexOf(jobId) ?? -1;
  if (index >= 0) physical.activeHaulJobIds.splice(index, 1);
}

export function completeHaulJob(physical, jobId) {
  const job = haulJobById(physical, jobId);
  if (!job || job.status !== "in_transit") throw new Error(`完了できない運搬ジョブ: ${jobId}`);
  const target = buildingById(physical, job.to.buildingId);
  if (!target) throw new Error("運搬先の建物が存在しません");
  depositInventory(target, job.to.section, job.goods, job.qty);
  job.carrier.cargo = null;
  job.carrier.active = false;
  // 完了履歴は経済照合に親キャリアだけあればよい。個人列を残すと、
  // 過去96件ぶんの表示snapshotへ不要な人物状態を複製し続けてしまう。
  delete job.carrier.porters;
  delete job.carrier.batchElapsed;
  delete job.carrier.batchTravelCost;
  job.status = "completed";
  deactivateHaulJob(physical, job.id);
  return job;
}

function carrierSegmentCost(physical, from, to, mode) {
  const diagonal = from.x !== to.x && from.y !== to.y;
  return tileTravelCost(physical, to.x, to.y, mode) * (diagonal ? 1.4 : 1);
}

export function stepTravelCarrier(
  physical,
  carrier,
  travelBudget = 1,
  sharedPath = carrier?.path,
) {
  if (!Array.isArray(sharedPath)) throw new TypeError("travel carrier has no route");
  if (!Number.isFinite(travelBudget) || travelBudget < 0) {
    throw new TypeError("travel budget must be a finite non-negative number");
  }
  if (!carrier.active) return true;
  let budget = travelBudget;
  if ((carrier.departureDelay ?? 0) > 0) {
    const waiting = Math.min(budget, carrier.departureDelay);
    carrier.departureDelay -= waiting;
    budget -= waiting;
    if (budget <= 1e-9) return false;
  }
  while (budget > 1e-9 && carrier.pathIndex < sharedPath.length - 1) {
    const from = sharedPath[carrier.pathIndex];
    const to = sharedPath[carrier.pathIndex + 1];
    const fullCost = carrierSegmentCost(physical, from, to, carrier.mode);
    const remaining = carrier.segmentRemaining ?? fullCost;
    if (budget + 1e-9 >= remaining) {
      budget -= remaining;
      carrier.pathIndex += 1;
      carrier.segmentRemaining = null;
      carrier.position = { x: to.x, y: to.y };
      continue;
    }

    const alreadyTravelled = fullCost - remaining;
    const progress = (alreadyTravelled + budget) / fullCost;
    carrier.position = {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
    carrier.segmentRemaining = remaining - budget;
    budget = 0;
  }
  if (carrier.pathIndex >= sharedPath.length - 1) {
    carrier.active = false;
    return true;
  }
  return false;
}

function moveCarrierOneTick(physical, job) {
  if (job.carrier.porters?.length) {
    const carrier = job.carrier;
    carrier.batchTravelCost ??= carrier.path.slice(1).reduce((total, point, index) => (
      total + carrierSegmentCost(physical, carrier.path[index], point, carrier.mode)
    ), 0);
    carrier.batchElapsed = (carrier.batchElapsed ?? 0) + 1;
    let remaining = Math.min(carrier.batchElapsed, carrier.batchTravelCost);
    for (let index = 1; index < carrier.path.length; index += 1) {
      const from = carrier.path[index - 1];
      const to = carrier.path[index];
      const segment = carrierSegmentCost(physical, from, to, carrier.mode);
      if (remaining + 1e-9 >= segment) {
        remaining -= segment;
        carrier.position = { x: to.x, y: to.y };
        continue;
      }
      const progress = segment <= 1e-9 ? 1 : remaining / segment;
      carrier.position = {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
      };
      break;
    }
    const lastDelay = carrier.porters.at(-1)?.departureDelay ?? 0;
    if (carrier.batchElapsed + 1e-9 >= carrier.batchTravelCost + lastDelay) {
      completeHaulJob(physical, job.id);
    }
    return;
  }
  if (stepTravelCarrier(physical, job.carrier)) completeHaulJob(physical, job.id);
}

function assertActiveCarrierJobs(physical, jobs, { checkRoadPaths = true } = {}) {
  for (const job of jobs) {
    const carrier = job.carrier;
    if (job.qty > carrierGoodsCapacity(carrier, job.goods) + 1e-9) {
      throw new Error(`キャリア容量超過 ${job.id}`);
    }
    if (!carrier.cargo || carrier.cargo.goods !== job.goods || carrier.cargo.qty !== job.qty) {
      throw new Error(`輸送中cargo不一致 ${job.id}`);
    }
    if (carrier.porters?.length) {
      const porterQty = carrier.porters.reduce(
        (total, porter) => total + (porter.cargo?.qty ?? 0),
        0,
      );
      if (Math.abs(porterQty - job.qty) > 1e-7) {
        throw new Error(`個人運搬cargo不一致 ${job.id}`);
      }
      if (carrier.porters.some((porter) => (
        porter.people !== 1
        || porter.cargo.qty > carrierGoodsCapacity(porter, job.goods) + 1e-9
      ))) {
        throw new Error(`個人運搬容量超過 ${job.id}`);
      }
    }
    if (!Number.isFinite(carrier.position?.x) || !Number.isFinite(carrier.position?.y)) {
      throw new Error(`キャリア位置不正 ${job.id}`);
    }
    if (checkRoadPaths && (carrier.routeMode ?? carrier.mode) === "cart") {
      if (!carrier.path?.every(({ x, y }) => hasRoad(physical, x, y))) {
        throw new Error(`道路外荷車 ${job.id}`);
      }
    }
  }
  return true;
}

export function assertCarrierInvariants(physical) {
  return assertActiveCarrierJobs(physical, activeHaulJobs(physical));
}

export function stepHaulCarriers(physical, ticks = 1) {
  if (!Number.isSafeInteger(ticks) || ticks < 0) {
    throw new TypeError("carrier ticks must be a non-negative safe integer");
  }
  for (let tick = 0; tick < ticks; tick += 1) {
    physical.tick += 1;
    const jobs = activeHaulJobs(physical);
    const roadsChanged = physical.carrierRoadRevision !== physical.roadRevision;
    assertActiveCarrierJobs(physical, jobs, { checkRoadPaths: roadsChanged });
    if (roadsChanged) physical.carrierRoadRevision = physical.roadRevision;
    for (const job of jobs) {
      if (job.carrier.mode !== "walk" && job.carrier.mode !== "cart") continue;
      moveCarrierOneTick(physical, job);
    }
  }
  return physical.tick;
}

export function nearestBuilding(physical, position) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const building of physical.buildings) {
    const anchor = building.entrance ?? {
      x: building.x + building.w / 2,
      y: building.y + building.h / 2,
    };
    const distance = Math.hypot(anchor.x - position.x, anchor.y - position.y);
    if (distance < nearestDistance) {
      nearest = building;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function loseHaulCarrier(physical, jobId, position = null) {
  const job = haulJobById(physical, jobId);
  if (!job || job.status !== "in_transit") throw new Error(`消失処理できない運搬ジョブ: ${jobId}`);
  const dropPosition = structuredClone(position ?? job.carrier.position);
  const owner = nearestBuilding(physical, dropPosition);
  if (!owner) throw new Error("外置きの所有建物が見つかりません");
  const pile = {
    id: `p${physical.nextGroundPileId}`,
    ownerBuildingId: owner.id,
    x: dropPosition.x,
    y: dropPosition.y,
    goods: job.goods,
    qty: job.qty,
  };
  physical.nextGroundPileId += 1;
  physical.groundPiles.push(pile);
  job.carrier.position = dropPosition;
  job.carrier.cargo = null;
  job.carrier.active = false;
  job.status = "carrier_lost";
  job.groundPileId = pile.id;
  deactivateHaulJob(physical, job.id);
  return pile;
}

export function materialSnapshot(physical) {
  const inventory = {};
  const cargo = {};
  for (const building of physical.buildings) {
    for (const section of INVENTORY_SECTIONS) {
      for (const [goods, qty] of Object.entries(building.inventory[section])) {
        inventory[goods] = (inventory[goods] ?? 0) + qty;
      }
    }
  }
  for (const pile of physical.groundPiles) {
    inventory[pile.goods] = (inventory[pile.goods] ?? 0) + pile.qty;
  }
  for (const job of activeHaulJobs(physical)) {
    if (!job.carrier.cargo) continue;
    const { goods, qty } = job.carrier.cargo;
    cargo[goods] = (cargo[goods] ?? 0) + qty;
  }
  return { inventory, cargo };
}

export function assertOccupancyInvariant(physical) {
  const expected = {};
  for (const building of physical.buildings) {
    if (!(building.w > 0) || !(building.h > 0) || building.point) {
      throw new Error(`点建物または無寸法建物が残っています: ${building.id}`);
    }
    if (!isPerimeterEntrance(building.x, building.y, building.w, building.h, building.entrance)) {
      throw new Error(`建物入口が外周にありません: ${building.id}`);
    }
    for (let y = building.y; y < building.y + building.h; y += 1) {
      for (let x = building.x; x < building.x + building.w; x += 1) {
        const key = keyOf(x, y);
        if (expected[key]) throw new Error(`占有重複 ${key}`);
        if (hasRoad(physical, x, y)) throw new Error(`建物と道路の重複 ${key}`);
        expected[key] = building.id;
      }
    }
  }
  const expectedKeys = Object.keys(expected).sort();
  const actualKeys = Object.keys(physical.occupied).sort();
  if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) {
    throw new Error("占有表の区画集合が建物フットプリントと一致しません");
  }
  for (const key of expectedKeys) {
    if (physical.occupied[key] !== expected[key]) throw new Error(`占有表の建物ID不一致 ${key}`);
  }
  return true;
}

export function createV003PhysicalState() {
  const physical = createPhysicalState({ roadOrigin: { ...V003_FIXED.port.entrance } });
  for (const [x, y] of V003_INITIAL_ROADS) addRoadTile(physical, x, y);
  addBuilding(physical, "port", V003_FIXED.port.x, V003_FIXED.port.y, {
    fixed: true,
    entrance: { ...V003_FIXED.port.entrance },
    grade: V003_FIXED.port.grade,
    requireRoad: false,
  });
  addBuilding(physical, "market", V003_FIXED.market.x, V003_FIXED.market.y, {
    fixed: true,
    entrance: { ...V003_FIXED.market.entrance },
    grade: V003_FIXED.market.grade,
    requireRoad: false,
  });
  return physical;
}

const FLOW_KINDS = new Set(["prod", "cons", "imp", "exp"]);

function requireQuantity(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a finite non-negative number`);
  }
}

function goodsKeys(...records) {
  return new Set(records.flatMap((record) => Object.keys(record ?? {})));
}

function quantity(record, goods) {
  const value = record?.[goods] ?? 0;
  requireQuantity(value, goods);
  return value;
}

export function createMaterialFlowLedger() {
  return {};
}

export function recordMaterialFlow(ledger, goods, kind, qty) {
  if (typeof goods !== "string" || goods.length === 0) {
    throw new TypeError("goods must be a non-empty string");
  }
  if (!FLOW_KINDS.has(kind)) {
    throw new TypeError(`unknown material flow kind: ${kind}`);
  }
  requireQuantity(qty, "material flow quantity");

  const entry = ledger[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
  entry[kind] += qty;
  ledger[goods] = entry;
}

export function inspectMaterialBalance({ before, after, flows, maxResidualRatio = 0.05 }) {
  if (!Number.isFinite(maxResidualRatio) || maxResidualRatio < 0) {
    throw new TypeError("maxResidualRatio must be a finite non-negative number");
  }

  const reports = [];
  const allGoods = goodsKeys(
    before?.inventory,
    before?.cargo,
    after?.inventory,
    after?.cargo,
    flows,
  );

  for (const goods of allGoods) {
    const opening = quantity(before?.inventory, goods) + quantity(before?.cargo, goods);
    const closing = quantity(after?.inventory, goods) + quantity(after?.cargo, goods);
    const flow = flows?.[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    for (const kind of FLOW_KINDS) quantity(flow, kind);

    const expectedDelta = flow.prod - flow.cons + flow.imp - flow.exp;
    const actualDelta = closing - opening;
    const residual = actualDelta - expectedDelta;
    // flow_island/audit.mjs E20と同じく、残差率の分母は生産+消費とする。
    const grossFlow = flow.prod + flow.cons;
    const residualRatio = Math.abs(residual) <= 1e-9
      ? 0
      : grossFlow > 1e-9
        ? Math.abs(residual) / grossFlow
        : Number.POSITIVE_INFINITY;
    reports.push({
      goods,
      opening,
      closing,
      actualDelta,
      expectedDelta,
      residual,
      grossFlow,
      residualRatio,
      ok: residualRatio < maxResidualRatio,
    });
  }

  return reports;
}

export function assertMaterialBalance(options) {
  const reports = inspectMaterialBalance(options);
  const failures = reports.filter((report) => !report.ok);
  if (failures.length > 0) {
    const detail = failures
      .map(({ goods, residual, residualRatio }) =>
        `${goods}: residual=${residual} ratio=${residualRatio}`)
      .join("; ");
    throw new Error(`物資出納違反 ${detail}`);
  }
  return reports;
}
