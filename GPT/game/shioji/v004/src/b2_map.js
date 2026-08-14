const B2_MAP_VERSION = 'v1.2';
const B2_MAP_SIZE = 256;

const SYMBOLS = Object.freeze({
  '~': tile => ({ kind: 'water', terrainClass: 'sea', ...tile }),
  '-': tile => ({ kind: 'water', terrainClass: 'shallow', ...tile }),
  R: tile => ({
    kind: 'water', terrainClass: 'richFishery', fishery: 'b2-rich', fishStage: 3, ...tile,
  }),
  m: tile => ({
    kind: 'water', terrainClass: 'mediumFishery', fishery: 'b2-medium', fishStage: 2, ...tile,
  }),
  '.': tile => ({ kind: 'sand', ...tile }),
  g: tile => ({ kind: 'grass', ...tile }),
  f: tile => ({ kind: 'grass', terrainClass: 'fertile', fertility: 1, ...tile }),
  F: tile => ({ kind: 'grass', terrainClass: 'fertileCore', fertility: 2, ...tile }),
  t: tile => ({ kind: 'forest', ...tile }),
  M: tile => ({ kind: 'mountain', ...tile }),
  r: tile => ({ kind: 'rock', ...tile }),
  o: tile => ({ kind: 'ore', ...tile }),
  c: tile => ({ kind: 'coal', ...tile }),
});

function integerPoint(point, label) {
  if (!Number.isSafeInteger(point?.x) || !Number.isSafeInteger(point?.y)) {
    throw new TypeError(`${label} must use safe integer coordinates`);
  }
  return Object.freeze({ x: point.x, y: point.y, ...(point.name ? { name: point.name } : {}) });
}

export function parseB2MapData(data) {
  if (!data?.version?.includes(B2_MAP_VERSION)) {
    throw new Error(`B2 map ${B2_MAP_VERSION} is required: ${data?.version ?? 'unknown'}`);
  }
  if (data.size?.[0] !== B2_MAP_SIZE || data.size?.[1] !== B2_MAP_SIZE) {
    throw new Error(`B2 map must be ${B2_MAP_SIZE}×${B2_MAP_SIZE}`);
  }
  if (!Array.isArray(data.terrain) || data.terrain.length !== B2_MAP_SIZE) {
    throw new Error(`B2 map must have ${B2_MAP_SIZE} terrain rows`);
  }
  const counts = Object.fromEntries(Object.keys(SYMBOLS).map(symbol => [symbol, 0]));
  const terrain = data.terrain.map((row, y) => {
    if (typeof row !== 'string' || row.length !== B2_MAP_SIZE) {
      throw new Error(`B2 map row ${y} must have ${B2_MAP_SIZE} tiles`);
    }
    return [...row].map((symbol, x) => {
      const factory = SYMBOLS[symbol];
      if (!factory) throw new Error(`unknown B2 terrain symbol: ${symbol}@${x},${y}`);
      counts[symbol] += 1;
      return factory({ variant: (x * 17 + y * 31) % 4, b2Symbol: symbol });
    });
  });
  const markets = Object.fromEntries(Object.entries(data.markets ?? {}).map(([id, point]) => [
    id, integerPoint(point, `B2 market ${id}`),
  ]));
  if (!markets['1']) throw new Error('B2 mother port market is required');
  const passes = Object.fromEntries(Object.entries(data.passes ?? {}).map(([id, point]) => [
    id, integerPoint(point, `B2 pass ${id}`),
  ]));
  return Object.freeze({
    version: data.version,
    width: B2_MAP_SIZE,
    height: B2_MAP_SIZE,
    terrain,
    markets: Object.freeze(markets),
    passes: Object.freeze(passes),
    counts: Object.freeze(counts),
  });
}

export async function loadB2MapData(url = new URL('../../design/map_b2/b2_map_data.json', import.meta.url)) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`B2 map load failed: HTTP ${response.status}`);
  return parseB2MapData(await response.json());
}

export const B2_TERRAIN_SYMBOLS = Object.freeze(Object.keys(SYMBOLS));
