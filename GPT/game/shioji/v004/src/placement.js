import { BUILDING_SIZES } from './config.js?v=v004.45.0-caravan-slice';
import { islandCalendar } from './ui_summary.js?v=v004.45.0-caravan-slice';

export const tileKey = (x, y) => `${x},${y}`;

function terrainAt(model, x, y) {
  return x >= 0 && y >= 0 && x < model.width && y < model.height
    ? model.terrain[y][x]?.kind ?? null
    : null;
}

const WALK_DIRS = Object.freeze([
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
]);
const RESOURCE_FIELD_CACHE = new WeakMap();

function walkTileCost(
  model,
  x,
  y,
  { allowOccupiedGoal = false, goal = null, roads, pavedRoads, occupied, trails } = {},
) {
  const kind = terrainAt(model, x, y);
  if (!kind || kind === 'water') return Infinity;
  if (
    (occupied ?? new Set(model.occupiedKeys)).has(tileKey(x, y))
    && !(allowOccupiedGoal && goal?.x === x && goal?.y === y)
  ) return Infinity;
  if ((roads ?? new Set(model.roadKeys)).has(tileKey(x, y))) {
    return (pavedRoads ?? new Set(model.pavedRoadKeys ?? [])).has(tileKey(x, y)) ? 0.45 : 0.6;
  }
  if ((trails ?? new Set((model.trailRows ?? []).map(row => row.key))).has(tileKey(x, y))) return 0.85;
  return kind === 'forest' ? 1.4 : 1;
}

function nearestWalkTarget(model, start, predicate, goal = null) {
  const roads = new Set(model.roadKeys);
  const pavedRoads = new Set(model.pavedRoadKeys ?? []);
  const occupied = new Set(model.occupiedKeys);
  const trails = new Set((model.trailRows ?? []).map(row => row.key));
  const costOptions = { roads, pavedRoads, occupied, trails };
  const indexOf = (x, y) => y * model.width + x;
  const distances = new Float64Array(model.width * model.height);
  distances.fill(Infinity);
  if (!Number.isFinite(walkTileCost(model, start.x, start.y, costOptions))) return null;
  distances[indexOf(start.x, start.y)] = 0;
  const open = [{ ...start, cost: 0 }];
  while (open.length) {
    open.sort((left, right) => left.cost - right.cost || left.y - right.y || left.x - right.x);
    const current = open.shift();
    if (current.cost > distances[indexOf(current.x, current.y)] + 1e-9) continue;
    if (predicate(current.x, current.y)) return current;
    for (const [dx, dy] of WALK_DIRS) {
      const x = current.x + dx;
      const y = current.y + dy;
      const cost = walkTileCost(model, x, y, {
        ...costOptions, allowOccupiedGoal: true, goal,
      });
      if (!Number.isFinite(cost)) continue;
      const next = current.cost + cost * (dx && dy ? 1.4 : 1);
      const index = indexOf(x, y);
      if (next >= distances[index] - 1e-9) continue;
      distances[index] = next;
      open.push({ x, y, cost: next });
    }
  }
  return null;
}

export function estimateWalkCost(model, start, goal) {
  return nearestWalkTarget(
    model,
    start,
    (x, y) => x === goal.x && y === goal.y,
    goal,
  )?.cost ?? Infinity;
}

function resourceDistanceField(model, job) {
  let cached = RESOURCE_FIELD_CACHE.get(model);
  if (!cached) {
    cached = {};
    RESOURCE_FIELD_CACHE.set(model, cached);
  }
  if (cached[job]) return cached[job];
  const roads = new Set(model.roadKeys);
  const pavedRoads = new Set(model.pavedRoadKeys ?? []);
  const occupied = new Set(model.occupiedKeys);
  const trails = new Set((model.trailRows ?? []).map(row => row.key));
  const costOptions = { roads, pavedRoads, occupied, trails };
  const indexOf = (x, y) => y * model.width + x;
  const distances = new Float64Array(model.width * model.height);
  distances.fill(Infinity);
  const targets = Array(model.width * model.height).fill(null);
  const open = [];
  const predicate = job === 'logger'
    ? (x, y) => terrainAt(model, x, y) === 'forest'
    : (x, y) => WALK_DIRS.slice(0, 4).some(
      ([dx, dy]) => terrainAt(model, x + dx, y + dy) === 'water',
    );
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      if (!predicate(x, y) || !Number.isFinite(walkTileCost(model, x, y, costOptions))) continue;
      const index = indexOf(x, y);
      distances[index] = 0;
      targets[index] = { x, y };
      open.push({ x, y, cost: 0 });
    }
  }
  while (open.length) {
    open.sort((left, right) => left.cost - right.cost || left.y - right.y || left.x - right.x);
    const current = open.shift();
    const currentIndex = indexOf(current.x, current.y);
    if (current.cost > distances[currentIndex] + 1e-9) continue;
    const currentTileCost = walkTileCost(
      model,
      current.x,
      current.y,
      costOptions,
    );
    for (const [dx, dy] of WALK_DIRS) {
      const x = current.x + dx;
      const y = current.y + dy;
      if (!Number.isFinite(walkTileCost(model, x, y, costOptions))) continue;
      const nextCost = current.cost + currentTileCost * (dx && dy ? 1.4 : 1);
      const nextIndex = indexOf(x, y);
      const currentTarget = targets[currentIndex];
      const nextTarget = targets[nextIndex];
      const betterTie = Math.abs(nextCost - distances[nextIndex]) <= 1e-9
        && currentTarget
        && (
          !nextTarget
          || currentTarget.y < nextTarget.y
          || (currentTarget.y === nextTarget.y && currentTarget.x < nextTarget.x)
        );
      if (nextCost > distances[nextIndex] + 1e-9 || (
        nextCost >= distances[nextIndex] - 1e-9 && !betterTie
      )) continue;
      distances[nextIndex] = nextCost;
      targets[nextIndex] = currentTarget;
      open.push({ x, y, cost: nextCost });
    }
  }
  cached[job] = { distances, targets };
  return cached[job];
}

export function resourcePlacementEstimate(model, job, entrance) {
  if (!['logger', 'fisher'].includes(job)) return null;
  const field = resourceDistanceField(model, job);
  const index = entrance.y * model.width + entrance.x;
  const target = field.targets[index] ?? null;
  const oneWayTicks = field.distances[index] ?? Infinity;
  if (!target || !Number.isFinite(oneWayTicks)) {
    return {
      kind: job === 'logger' ? 'forest' : 'shore',
      target: null,
      oneWayTicks: Infinity,
      workTicks: 0,
      efficiency: 0,
      dailyOutput: 0,
    };
  }
  const lostTicks = Number.isFinite(oneWayTicks)
    ? Math.max(0, (oneWayTicks - 2) * 2)
    : 30;
  const efficiency = Math.max(0.1, 1 - lostTicks / 24);
  const month = islandCalendar(model.day, model.calendarOffsetDays).month;
  const baseOutput = job === 'logger' ? 12 : month >= 10 ? 15 / 4 : 15;
  return {
    kind: job === 'logger' ? 'forest' : 'shore',
    target: target ? { ...target } : null,
    oneWayTicks,
    workTicks: Math.max(3, 30 - lostTicks),
    efficiency,
    dailyOutput: baseOutput * efficiency,
  };
}

const INPUT_PRODUCERS = Object.freeze({
  fisher2: Object.freeze(['fisher']),
  shepherd: Object.freeze(['wheat', 'veg']),
  woodshop: Object.freeze(['logger']),
  charburner: Object.freeze(['logger']),
  saltworks: Object.freeze(['charburner']),
  smelter: Object.freeze(['miner', 'charburner', 'collier']),
  smith: Object.freeze(['smelter', 'charburner', 'collier']),
  cartwright: Object.freeze(['logger', 'woodshop']),
  wheat: Object.freeze(['fisher2']),
  rapeseed: Object.freeze(['fisher2']),
});

export function supplierPlacementEstimate(model, job, entrance) {
  const supplierJobs = INPUT_PRODUCERS[job];
  if (!supplierJobs) return null;
  const suppliers = model.households
    .filter(household => supplierJobs.includes(household.job))
    .map(household => {
      const building = model.buildings.find(row => row.id === household.buildingId);
      const distance = building?.entrance
        ? estimateWalkCost(model, entrance, building.entrance)
        : Infinity;
      return { householdId: household.id, job: household.job, distance };
    })
    .filter(row => Number.isFinite(row.distance))
    .sort((left, right) => left.distance - right.distance || left.householdId - right.householdId);
  const market = model.buildings.find(building => building.roles?.includes('market'));
  const marketDistance = market?.entrance
    ? estimateWalkCost(model, entrance, market.entrance)
    : Infinity;
  const supplier = suppliers[0] ?? null;
  return {
    supplier,
    marketDistance,
    savedTicks: supplier && Number.isFinite(marketDistance)
      ? Math.max(0, (marketDistance - supplier.distance) * 2 + 1)
      : 0,
    directEligible: Boolean(
      supplier
      && Number.isFinite(marketDistance)
      && supplier.distance * 2 + 1 <= (marketDistance * 2 + 2) * 0.8,
    ),
  };
}

function nearTerrain(model, x, y, kind, radius = 2) {
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (terrainAt(model, x + offsetX, y + offsetY) === kind) return true;
    }
  }
  return false;
}

function footprintCells(x, y, width, height) {
  const cells = [];
  for (let tileY = y; tileY < y + height; tileY += 1) {
    for (let tileX = x; tileX < x + width; tileX += 1) cells.push({ x: tileX, y: tileY });
  }
  return cells;
}

function perimeterOrigins(entrance, width, height) {
  const origins = new Map();
  for (let x = entrance.x - width + 1; x <= entrance.x; x += 1) {
    for (const y of [entrance.y + 1, entrance.y - height]) origins.set(tileKey(x, y), { x, y });
  }
  for (let y = entrance.y - height + 1; y <= entrance.y; y += 1) {
    for (const x of [entrance.x + 1, entrance.x - width]) origins.set(tileKey(x, y), { x, y });
  }
  return [...origins.values()];
}

function overlapsReservation(model, job, entrance, site) {
  const definition = BUILDING_SIZES[job];
  return (model.reservedBuildingSites ?? []).some(reserved => {
    if (reserved.job === job && reserved.x === entrance.x && reserved.y === entrance.y
      && reserved.buildingX === site.x && reserved.buildingY === site.y) return false;
    const reservedDefinition = BUILDING_SIZES[reserved.job];
    if (!reservedDefinition) return false;
    return site.x < reserved.buildingX + reservedDefinition.width
      && site.x + definition.width > reserved.buildingX
      && site.y < reserved.buildingY + reservedDefinition.height
      && site.y + definition.height > reserved.buildingY;
  });
}

function validFootprint(model, job, entrance, site) {
  const definition = BUILDING_SIZES[job];
  const roads = new Set(model.roadKeys);
  const occupied = new Set(model.occupiedKeys);
  const cells = footprintCells(site.x, site.y, definition.width, definition.height);
  if (cells.some(cell => terrainAt(model, cell.x, cell.y) === null)) return false;
  if (definition.shore) {
    const landCount = cells.filter(cell => terrainAt(model, cell.x, cell.y) !== 'water').length;
    if (landCount === 0 || landCount === cells.length) return false;
  } else if (cells.some(cell => !['grass', 'sand'].includes(terrainAt(model, cell.x, cell.y)))) return false;
  if (cells.some(cell => roads.has(tileKey(cell.x, cell.y)))) return false;
  if (cells.some(cell => occupied.has(tileKey(cell.x, cell.y)))) return false;
  const perimeter = entrance.x >= site.x && entrance.x < site.x + definition.width
    ? entrance.y === site.y - 1 || entrance.y === site.y + definition.height
    : entrance.y >= site.y && entrance.y < site.y + definition.height
      && (entrance.x === site.x - 1 || entrance.x === site.x + definition.width);
  if (!perimeter || terrainAt(model, entrance.x, entrance.y) === 'water'
    || occupied.has(tileKey(entrance.x, entrance.y))) return false;
  return !overlapsReservation(model, job, entrance, site);
}

function rejection(model, job, entrance) {
  const definition = BUILDING_SIZES[job];
  if (!definition) return '未対応の建物です';
  if (definition.fixed) return '港は固定施設です';
  if (
    (job === 'market' || job === 'warehouse')
    && model.buildings.some(building => building.roles?.includes(job))
  ) return job === 'market' ? '市場はすでにあります' : '倉庫はすでにあります';
  const terrain = terrainAt(model, entrance.x, entrance.y);
  if (!terrain || terrain === 'water') return '水の上には建てられません';
  if ((model.zones ?? []).some(zone => Math.round(zone.x) === entrance.x && Math.round(zone.y) === entrance.y)
    || model.households.some(household => Math.round(household.homeX) === entrance.x
      && Math.round(household.homeY) === entrance.y)) return 'この土地には既に建物があります';
  if ((model.roadWorksites ?? []).some(site => site.x === entrance.x && site.y === entrance.y)) {
    return '普請中の入口には建てられません';
  }
  const market = model.buildings.find(building => building.roles?.includes('market'));
  if (market?.entrance?.x === entrance.x && market.entrance.y === entrance.y) {
    return 'ここは市場です';
  }
  if (terrain === 'forest') return '森そのものではなく森の際へ配置してください';
  if (terrain === 'rock') return '岩場そのものではなく岩場の際へ配置してください';
  const required = job === 'quarryman' ? ['rock', '採石場は岩場の際に置いてください']
        : job === 'miner' ? ['ore', '鉱山は鉄鉱床の2区画以内に置いてください']
          : job === 'collier' ? ['coal', '炭鉱は炭層の2区画以内に置いてください']
            : null;
  if (required && !nearTerrain(model, entrance.x, entrance.y, required[0])) return required[1];
  return null;
}

export function previewBuildingPlacement(model, job, point) {
  const entrance = { x: Math.round(point.x), y: Math.round(point.y) };
  const reason = rejection(model, job, entrance);
  const definition = BUILDING_SIZES[job];
  if (reason || !definition) return {
    kind: 'building', job, entrance, ok: false, reason: reason ?? '未対応の建物です', cells: [],
  };
  const toward = model.buildings.find(building => building.roles?.includes('market'))?.entrance
    ?? model.buildings.find(building => building.roles?.includes('port'))?.entrance
    ?? model.economyMarket;
  const candidates = perimeterOrigins(entrance, definition.width, definition.height)
    .filter(site => validFootprint(model, job, entrance, site))
    .sort((left, right) => {
      const centerLeft = {
        x: left.x + (definition.width - 1) / 2,
        y: left.y + (definition.height - 1) / 2,
      };
      const centerRight = {
        x: right.x + (definition.width - 1) / 2,
        y: right.y + (definition.height - 1) / 2,
      };
      const direction = { x: toward.x - entrance.x, y: toward.y - entrance.y };
      const facingLeft = (centerLeft.x - entrance.x) * direction.x
        + (centerLeft.y - entrance.y) * direction.y;
      const facingRight = (centerRight.x - entrance.x) * direction.x
        + (centerRight.y - entrance.y) * direction.y;
      return facingLeft - facingRight || left.y - right.y || left.x - right.x;
    });
  const site = candidates[0];
  if (!site) return {
    kind: 'building', job, entrance, ok: false,
    reason: '実寸フットプリント・地形・道路・予約地の条件を満たしません', cells: [],
  };
  return {
    kind: 'building', job, entrance, x: site.x, y: site.y,
    width: definition.width, height: definition.height,
    cells: footprintCells(site.x, site.y, definition.width, definition.height),
    ok: true, reason: '',
    productivity: resourcePlacementEstimate(model, job, entrance)
      ?? supplierPlacementEstimate(model, job, entrance),
  };
}

export function line8(start, end) {
  let x0 = start.x;
  let y0 = start.y;
  const points = [];
  const dx = Math.abs(end.x - x0);
  const dy = Math.abs(end.y - y0);
  const sx = x0 < end.x ? 1 : -1;
  const sy = y0 < end.y ? 1 : -1;
  let error = dx - dy;
  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === end.x && y0 === end.y) break;
    const doubled = error * 2;
    if (doubled > -dy) { error -= dy; x0 += sx; }
    if (doubled < dx) { error += dx; y0 += sy; }
  }
  return points;
}

export function previewRoadPlacement(model, start, end) {
  const from = { x: Math.round(start.x), y: Math.round(start.y) };
  const to = { x: Math.round(end.x), y: Math.round(end.y) };
  const cells = line8(from, to);
  const occupied = new Set(model.occupiedKeys);
  const roads = new Set(model.roadKeys);
  const blocked = cells.some(cell => terrainAt(model, cell.x, cell.y) === 'water'
    || terrainAt(model, cell.x, cell.y) === null || occupied.has(tileKey(cell.x, cell.y)));
  const newCells = cells.filter(cell => !roads.has(tileKey(cell.x, cell.y)));
  return {
    kind: 'road', start: from, end: to, cells, newCells,
    ok: !blocked && newCells.length > 0,
    reason: blocked ? '水面・盤外・建物の上へ道は敷けません'
      : newCells.length === 0 ? 'すでに完成した道路です' : '',
  };
}

export function analyzeRoadConnections(model) {
  const roads = new Set(model.roadKeys);
  const market = model.buildings.find(building => building.roles?.includes('market'));
  const origin = market?.entrance ?? null;
  const connected = new Set();
  const queue = origin && roads.has(tileKey(origin.x, origin.y)) ? [{ x: origin.x, y: origin.y }] : [];
  while (queue.length) {
    const point = queue.shift();
    const key = tileKey(point.x, point.y);
    if (connected.has(key)) continue;
    connected.add(key);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if ((!dx && !dy) || !roads.has(tileKey(point.x + dx, point.y + dy))) continue;
        if (!connected.has(tileKey(point.x + dx, point.y + dy))) {
          queue.push({ x: point.x + dx, y: point.y + dy });
        }
      }
    }
  }
  const buildings = model.buildings.map(building => ({
    id: building.id,
    connected: Boolean(building.entrance && connected.has(tileKey(building.entrance.x, building.entrance.y))),
    x: building.entrance?.x,
    y: building.entrance?.y,
  }));
  return { connectedRoadKeys: [...connected], buildings };
}
