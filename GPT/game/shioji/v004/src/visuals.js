import { BUILDING_ART, GOODS_ART } from './config.js?v=v004.38.0-winter-visuals';

export const EXACT_PILE_LIMIT = 20;
export const PILE_STAGE_LIMITS = Object.freeze({
  small: 60,
  medium: 180,
  large: 480,
});
export const MAX_PILE_SPRITES = EXACT_PILE_LIMIT;
export const MAX_YARD_GOODS = 10;
export const MAX_DISPLAY_CULTURE_LEVEL = 4;

const WINTER_TERRAIN_ART = Object.freeze({
  grass: Object.freeze({
    fills: Object.freeze(['#e5eee9', '#dce8e3', '#e9f1ed', '#d8e4df']),
    stroke: '#b7c8c1',
    state: 'snow',
  }),
  sand: Object.freeze({
    fills: Object.freeze(['#e8ece5', '#dfe6df', '#edf0e9', '#dbe3dc']),
    stroke: '#bdc9c0',
    state: 'snow',
  }),
  forest: Object.freeze({
    fills: Object.freeze(['#dce9e3', '#e5eee9', '#d5e4dd', '#e8f0ec']),
    stroke: '#afc2ba',
    state: 'snow',
  }),
  rock: Object.freeze({
    fills: Object.freeze(['#d8e1de', '#e1e8e5', '#d3ddda', '#e6ece9']),
    stroke: '#abbab5',
    state: 'snow',
  }),
  ore: Object.freeze({
    fills: Object.freeze(['#d9e0dd', '#e2e7e4', '#d2dbd8', '#e6ebe8']),
    stroke: '#adb9b5',
    state: 'snow',
  }),
  coal: Object.freeze({
    fills: Object.freeze(['#d1dbd8', '#dbe3e0', '#cad5d2', '#e0e7e4']),
    stroke: '#a8b6b2',
    state: 'snow',
  }),
});

const WINTER_NATURAL_ART = Object.freeze({
  tree: Object.freeze({
    fills: Object.freeze(['#f2f6f3', '#d5e1dc', '#466957']),
    snow: '#f2f6f3',
    snowShadow: '#d5e1dc',
    outline: '#9eb4ac',
    state: 'snow-capped',
  }),
  rock: Object.freeze({
    snow: '#f0f4f1',
    snowShadow: '#cddad5',
    outline: '#a8b7b2',
    state: 'snow-capped',
  }),
});

export function seasonalTerrainVisual(kind, season) {
  if (season !== '冬' || kind === 'water') return null;
  return WINTER_TERRAIN_ART[kind] ?? WINTER_TERRAIN_ART.grass;
}

export function seasonalNaturalVisual(kind, season) {
  if (season !== '冬') return null;
  return WINTER_NATURAL_ART[kind] ?? null;
}

const SEASONAL_PLOT_ART = Object.freeze({
  '秋': Object.freeze({
    farm: Object.freeze({
      fills: Object.freeze(['#a38149', '#92713f']),
      stroke: '#755b38',
      furrow: '#6f5433',
      state: 'dry',
    }),
    pasture: Object.freeze({
      fills: Object.freeze(['#9b8654', '#897344']),
      stroke: '#70613d',
      furrow: '#75633d',
      state: 'dry',
    }),
  }),
  '冬': Object.freeze({
    farm: Object.freeze({
      fills: Object.freeze(['#e5ebe3', '#d3ddd7']),
      stroke: '#a9b9b1',
      furrow: '#aab9b0',
      furrowState: 'buried',
      snowRidge: '#f6f9f7',
      snowShadow: '#c0cec8',
      state: 'snow',
    }),
    pasture: Object.freeze({
      fills: Object.freeze(['#e9eee8', '#d8e1dc']),
      stroke: '#aebcb5',
      furrow: '#b4c1ba',
      furrowState: 'buried',
      snowRidge: '#f7faf8',
      snowShadow: '#c4d1cc',
      state: 'snow',
    }),
  }),
});

export function seasonalPlotVisual(building, season) {
  const archetype = building?.appearance?.archetype;
  if (!['farm', 'pasture'].includes(archetype)) return null;
  const art = SEASONAL_PLOT_ART[season]?.[archetype];
  return art ? Object.freeze({ ...art, archetype, season }) : null;
}

const PRODUCTION_GOODS = Object.freeze({
  fisher: Object.freeze(['fish', 'pres']),
  fisher2: Object.freeze(['meal']),
  logger: Object.freeze(['log']),
  woodshop: Object.freeze(['tools']),
  charburner: Object.freeze(['char']),
  saltworks: Object.freeze(['salt']),
  quarryman: Object.freeze(['stone']),
  miner: Object.freeze(['ore']),
  collier: Object.freeze(['coal']),
  smelter: Object.freeze(['bar']),
  smith: Object.freeze(['iron']),
  wheat: Object.freeze(['wheat']),
  veg: Object.freeze(['veg', 'pick']),
  shepherd: Object.freeze(['meat', 'cloth']),
  rapeseed: Object.freeze(['cloth']),
});

const SECTION_ORDER = Object.freeze([
  'input', 'inbound', 'pickup', 'output', 'outbound',
  'storage', 'companyStock', 'construction', 'pantry',
]);

function finiteAmount(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function amountLabel(value) {
  const amount = finiteAmount(value);
  if (amount < 10 && Math.abs(amount - Math.round(amount)) > 0.04) return amount.toFixed(1);
  return Math.round(amount).toLocaleString('ja-JP');
}

export function pileVisual(amount, goods) {
  const safeAmount = finiteAmount(amount);
  const pileStage = safeAmount <= 1e-9 ? 'empty'
    : safeAmount <= EXACT_PILE_LIMIT ? 'exact'
      : safeAmount <= PILE_STAGE_LIMITS.small ? 'small'
        : safeAmount <= PILE_STAGE_LIMITS.medium ? 'medium' : 'large';
  const spriteCount = pileStage === 'empty' ? 0
    : pileStage === 'exact' ? Math.ceil(safeAmount) : MAX_PILE_SPRITES;
  const stageLevel = { empty: 0, exact: 0, small: 1, medium: 2, large: 3 }[pileStage];
  return Object.freeze({
    amount: safeAmount,
    label: amountLabel(safeAmount),
    spriteCount,
    pileStage,
    stageLevel,
    footprintScale: [1, 1.04, 1.2, 1.38][stageLevel],
    heightScale: [1, 1.08, 1.35, 1.68][stageLevel],
    clipped: safeAmount > PILE_STAGE_LIMITS.large,
    amountPerSprite: spriteCount ? safeAmount / spriteCount : 0,
    art: GOODS_ART[goods] ?? Object.freeze({ color: '#bd9a63', dark: '#6f593c', shape: 'crate' }),
  });
}

export function displayCultureLevel(internalLevel) {
  const level = Math.max(0, Math.floor(internalLevel ?? 0));
  return Math.min(MAX_DISPLAY_CULTURE_LEVEL, level + 1);
}

export function buildingStructureLayout(building) {
  const archetype = building.appearance?.archetype ?? 'workshop';
  if (archetype === 'market') {
    const inset = 1.55;
    return Object.freeze({
      x: building.x + inset,
      y: building.y + inset,
      width: Math.max(1.2, building.width - inset * 2),
      height: Math.max(1.2, building.height - inset * 2),
      openYard: true,
    });
  }
  if (['farm', 'pasture'].includes(archetype)) {
    const scale = building.appearance?.structureScale ?? 0.42;
    return Object.freeze({
      x: building.x + 0.45,
      y: building.y + 0.45,
      width: Math.max(0.9, Math.min(building.width * scale, building.width - 0.8)),
      height: Math.max(0.85, Math.min(building.height * scale, building.height - 0.8)),
      openYard: false,
    });
  }
  const scale = building.appearance?.structureScale ?? 0.58;
  return Object.freeze({
    x: building.x + 0.28,
    y: building.y + 0.28,
    width: Math.max(0.86, Math.min(building.width - 0.9, building.width * scale)),
    height: Math.max(0.82, Math.min(building.height - 0.9, building.height * scale)),
    openYard: true,
  });
}

export function yardStockRows(building, pantryRows = []) {
  const sectionRank = new Map(SECTION_ORDER.map((section, index) => [section, index]));
  return [
    ...(building.shelfGroups ?? []).flatMap(group => group.items ?? []),
    ...pantryRows,
  ]
    .filter(row => row?.visual?.amount > 1e-9)
    .sort((left, right) => (
      (sectionRank.get(left.section) ?? SECTION_ORDER.length)
      - (sectionRank.get(right.section) ?? SECTION_ORDER.length)
      || String(left.goods).localeCompare(String(right.goods))
    ));
}

function yardZoneFor(building, row) {
  if ((PRODUCTION_GOODS[building.type] ?? []).includes(row.goods)) return 'output';
  if (['input', 'inbound', 'pickup', 'construction'].includes(row.section)) return 'input';
  if (['output', 'outbound'].includes(row.section)) return 'output';
  return 'storage';
}

function yardZoneCounts(building) {
  if (building.type === 'warehouse') return Object.freeze({ input: 0, output: 0, storage: 8 });
  if (building.type === 'market') return Object.freeze({ input: 3, output: 3, storage: 4 });
  if (building.type === 'port') return Object.freeze({ input: 2, output: 2, storage: 2 });
  if (Math.min(building.width, building.height) >= 4) {
    return Object.freeze({ input: 2, output: 2, storage: 4 });
  }
  return Object.freeze({ input: 2, output: 2, storage: 2 });
}

function spread(count, width) {
  if (count <= 1) return [0];
  return Array.from({ length: count }, (_, index) => (
    ((index / (count - 1)) - 0.5) * width
  ));
}

function yardBasis(building) {
  const center = {
    x: building.x + building.width / 2,
    y: building.y + building.height / 2,
  };
  const toward = {
    x: (building.entrance?.x ?? center.x + 1) - center.x,
    y: (building.entrance?.y ?? center.y + 1) - center.y,
  };
  const magnitude = Math.hypot(toward.x, toward.y) || 1;
  const front = { x: toward.x / magnitude, y: toward.y / magnitude };
  return { center, front, side: { x: -front.y, y: front.x } };
}

function yardPoint(building, basis, frontOffset, sideOffset) {
  const margin = 0.34;
  const x = basis.center.x + basis.front.x * frontOffset + basis.side.x * sideOffset;
  const y = basis.center.y + basis.front.y * frontOffset + basis.side.y * sideOffset;
  return {
    x: Math.max(building.x + margin, Math.min(building.x + building.width - margin, x)),
    y: Math.max(building.y + margin, Math.min(building.y + building.height - margin, y)),
  };
}

function zonePlaces(building, zone, count) {
  if (count === 0) return [];
  const basis = yardBasis(building);
  const size = Math.min(building.width, building.height);
  if (zone === 'input') {
    return spread(count, size * 0.44).map(sideOffset => (
      yardPoint(building, basis, size * 0.31, sideOffset)
    ));
  }
  if (zone === 'output') {
    return spread(count, size * 0.36).map(frontOffset => (
      yardPoint(building, basis, frontOffset, size * 0.31)
    ));
  }
  const columns = Math.min(4, Math.ceil(count / 2));
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const sideOffset = columns === 1 ? 0
      : ((column / (columns - 1)) - 0.5) * size * 0.54;
    const frontOffset = -size * (row === 0 ? 0.29 : 0.08);
    return yardPoint(building, basis, frontOffset, sideOffset);
  });
}

function stableSlotIndex(row, count) {
  const identity = `${row.section}:${row.goods}`;
  let hash = 2166136261;
  for (const character of identity) {
    hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
  }
  return (hash >>> 0) % count;
}

export function yardLayout(building, rows) {
  const counts = yardZoneCounts(building);
  const places = Object.entries(counts).flatMap(([zone, count]) => (
    zonePlaces(building, zone, count).map((point, zoneIndex) => ({
      ...point,
      zone,
      zoneIndex,
      row: null,
    }))
  ));
  const byZone = new Map(['input', 'output', 'storage'].map(zone => [
    zone, places.filter(place => place.zone === zone),
  ]));
  const productionGoods = PRODUCTION_GOODS[building.type] ?? [];
  const candidates = [...rows].sort((left, right) => {
    const leftProduct = productionGoods.indexOf(left.goods);
    const rightProduct = productionGoods.indexOf(right.goods);
    return (leftProduct < 0 ? 99 : leftProduct) - (rightProduct < 0 ? 99 : rightProduct)
      || `${left.section}:${left.goods}`.localeCompare(`${right.section}:${right.goods}`);
  });
  for (const row of candidates) {
    const zone = yardZoneFor(building, row);
    const zonePlacesList = byZone.get(zone) ?? [];
    if (!zonePlacesList.length) continue;
    const productIndex = zone === 'output' ? productionGoods.indexOf(row.goods) : -1;
    const slotIndex = productIndex >= 0 && productIndex < zonePlacesList.length
      ? productIndex : stableSlotIndex(row, zonePlacesList.length);
    if (!zonePlacesList[slotIndex].row) zonePlacesList[slotIndex].row = row;
  }
  return Object.freeze(places.map(place => Object.freeze(place)));
}

export function yardSlots(building, rows) {
  return Object.freeze(yardLayout(building, rows).filter(place => place.row));
}

export function trailVisual(tread) {
  const value = finiteAmount(tread);
  const stage = value <= 0 ? 0
    : value < 10 ? 1
      : value < 50 ? 2
        : value < 200 ? 3
          : value < 800 ? 4 : 5;
  return Object.freeze({
    tread: value,
    stage,
    alpha: stage === 0 ? 0 : 0.18 + stage * 0.1,
    width: stage === 0 ? 0 : 2 + stage * 1.5,
  });
}

export function buildingAppearance(building) {
  const internalLevel = Math.max(0, Math.floor(building.cultureLevel ?? 0));
  const leveled = building.cultureLeveled ?? (
    building.vacant || !['market', 'warehouse', 'port'].includes(building.type)
  );
  const level = leveled ? displayCultureLevel(internalLevel) : null;
  const tier = building.vacant ? 0 : level ?? 0;
  const art = BUILDING_ART[building.type] ?? Object.freeze({
    archetype: 'workshop', roof: '#80684d', wall: '#8a7451', accent: '#d2a85d',
  });
  const structureScale = !leveled ? 0.58
    : building.vacant ? 0.38
      : [0, 0.3, 0.36, 0.48, 0.6][tier];
  const elevation = !leveled ? 16
    : building.vacant ? 12
      : [0, 0, 11, 18, 27][tier];
  return Object.freeze({
    key: `${building.type}:${leveled ? `lv${level}` : 'fixed'}:${building.vacant ? 'vacant' : 'active'}`,
    internalLevel,
    level,
    tier,
    leveled,
    // 無人の職場は建屋を描かない。空き地＋雑草＋道具1つ＋「無」札だけで示す。
    structureVisible: !leveled || (!building.vacant && tier >= 2),
    structureScale,
    archetype: art.archetype,
    roof: art.roof,
    wall: art.wall,
    accent: art.accent,
    elevation,
    windows: building.vacant || !leveled ? 0
      : tier === 2 ? 1 : tier === 3 ? 2 : tier >= 4 ? 3 : 0,
    stoneBase: leveled && !building.vacant && tier >= 4,
    toolCount: !leveled ? 2 : building.vacant ? 1 : [0, 1, 2, 4, 6][tier],
    // 外観だけではLv1（空き地＋道具）を見落としやすいため、1始まりの旗も必ず併記する。
    bannerCount: leveled && !building.vacant ? tier : 0,
    gardenCount: leveled && !building.vacant ? Math.max(0, tier - 2) : 0,
    abandoned: Boolean(building.vacant),
    fallback: !BUILDING_ART[building.type],
  });
}
