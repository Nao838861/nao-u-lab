function parseTileKey(key) {
  const separator = key.indexOf(',');
  return {
    x: Number(key.slice(0, separator)),
    y: Number(key.slice(separator + 1)),
  };
}

const SCENE_TOPOLOGIES = new WeakMap();

function compileTerrainLayer(model, occupied) {
  let primary = 2166136261;
  let secondary = 0x9e3779b9;
  const naturalDrawables = [];
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const tile = model.terrain[y][x];
      const value = `${tile.kind}:${tile.variant ?? 0}:${tile.wood ?? 3};`;
      for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        primary = Math.imul(primary ^ code, 16777619);
        secondary = Math.imul(secondary ^ code, 2246822519) + 3266489917;
      }
      if (occupied.has(`${x},${y}`)) continue;
      if (tile.kind === 'forest') {
        naturalDrawables.push({
          kind: 'tree',
          data: { x, y, variant: tile.variant, stage: tile.wood ?? 3 },
          depth: x + y + 1,
          bounds: { x, y, width: 1, height: 1 },
        });
      } else if (['rock', 'ore', 'coal'].includes(tile.kind) && (x + y) % 2 === 0) {
        naturalDrawables.push({
          kind: 'rock',
          data: { x, y, type: tile.kind },
          depth: x + y + 1,
          bounds: { x, y, width: 1, height: 1 },
        });
      }
    }
  }
  return Object.freeze({
    key: `${model.width}x${model.height}:${primary >>> 0}:${secondary >>> 0}`,
    naturalDrawables: Object.freeze(naturalDrawables),
  });
}

function staticDrawables(model, naturalDrawables) {
  const rows = [...naturalDrawables];
  for (const building of model.buildings) {
    const buildingDepth = building.x + building.width + building.y + building.height;
    rows.push({
      kind: 'building',
      data: building,
      depth: buildingDepth,
      bounds: {
        x: building.x, y: building.y,
        width: building.width, height: building.height,
      },
    });
    (building.yardSlots ?? []).forEach(({ row, x, y }, index) => {
      rows.push({
        kind: 'inventory',
        data: { row, ownerId: building.id, x, y },
        depth: buildingDepth + 0.1 + index * 0.001,
        bounds: { x: x - 0.5, y: y - 0.5, width: 1, height: 1 },
      });
    });
  }

  const market = model.buildings.find(building => building.type === 'market');
  const marketDepth = market
    ? market.x + market.width + market.y + market.height
    : 0;
  model.marketStalls.forEach((stall, index) => rows.push({
    kind: 'stall',
    data: stall,
    depth: marketDepth + 0.4 + index * 0.001,
    bounds: { x: stall.x - 0.5, y: stall.y - 0.5, width: 1, height: 1 },
  }));

  return rows.sort((left, right) => left.depth - right.depth);
}

function roadScene(model) {
  const roadSet = new Set(model.roadKeys);
  const connected = new Set(model.roadConnection?.connectedRoadKeys ?? []);
  const rows = model.roadKeys.map(key => {
    const point = parseTileKey(key);
    return { key, ...point, connected: connected.has(key) };
  });
  const segments = [];
  for (const row of rows) {
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const otherKey = `${row.x + dx},${row.y + dy}`;
      if (!roadSet.has(otherKey)) continue;
      segments.push({
        x: row.x, y: row.y,
        toX: row.x + dx, toY: row.y + dy,
        connected: row.connected && connected.has(otherKey),
      });
    }
  }
  return { rows, segments, roadSet };
}

export function mergeDrawables(staticRows, dynamicRows) {
  const rows = [];
  let staticIndex = 0;
  let dynamicIndex = 0;
  while (staticIndex < staticRows.length || dynamicIndex < dynamicRows.length) {
    if (dynamicIndex >= dynamicRows.length
      || (staticIndex < staticRows.length
        && staticRows[staticIndex].depth <= dynamicRows[dynamicIndex].depth)) {
      rows.push(staticRows[staticIndex]);
      staticIndex += 1;
    } else {
      rows.push(dynamicRows[dynamicIndex]);
      dynamicIndex += 1;
    }
  }
  return rows;
}

export function renderSceneTopology(scene) {
  return SCENE_TOPOLOGIES.get(scene) ?? null;
}

export function compileRenderScene(
  model,
  {
    previousScene = null,
    terrainRevision = null,
    roadRevision = null,
  } = {},
) {
  const occupied = new Set(model.occupiedKeys);
  const previousTopology = previousScene ? SCENE_TOPOLOGIES.get(previousScene) : null;
  const sameTerrain = previousTopology
    && previousTopology.terrainRevision === terrainRevision
    && previousTopology.width === model.width
    && previousTopology.height === model.height;
  const terrainLayer = sameTerrain
    ? previousTopology.terrainLayer
    : compileTerrainLayer(model, occupied);
  const sameRoadTopology = sameTerrain
    && previousTopology.roadRevision === roadRevision;
  const roads = sameRoadTopology
    ? previousTopology.roadLayer
    : roadScene(model);
  const trails = model.trailRows
    .filter(row => !roads.roadSet.has(row.key))
    .map(row => ({ ...row, ...parseTileKey(row.key) }));
  const disconnected = new Set((model.roadConnection?.buildings ?? [])
    .filter(row => !row.connected)
    .map(row => row.id));
  const warningBuildings = model.buildings.filter(building => (
    disconnected.has(building.id) && building.entrance
  ));
  const crisisBuildings = model.buildings.filter(building => (
    building.stateSignals?.crisis
  ));
  const port = model.buildings.find(building => building.type === 'port');
  const staticRows = staticDrawables(model, terrainLayer.naturalDrawables);
  const scene = {
    terrainKey: terrainLayer.key,
    staticDrawables: staticRows,
    roadRows: roads.rows,
    roadSegments: roads.segments,
    trailRows: trails,
    warningBuildings,
    crisisBuildings,
    portYard: port
      ? { x: port.x + port.width * 0.55, y: port.y + port.height * 0.58 }
      : null,
    counts: {
      staticDrawables: staticRows.length,
      roadTiles: roads.rows.length,
      roadSegments: roads.segments.length,
      trails: trails.length,
      warnings: warningBuildings.length,
      crises: crisisBuildings.length,
    },
  };
  SCENE_TOPOLOGIES.set(scene, Object.freeze({
    terrainRevision,
    roadRevision,
    width: model.width,
    height: model.height,
    terrainLayer,
    roadLayer: roads,
  }));
  return scene;
}
