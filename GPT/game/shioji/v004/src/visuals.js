import { BUILDING_ART, GOODS_ART } from './config.js?v=v004.24.0-individual-logistics';

export const MAX_PILE_SPRITES = 24;
export const MAX_YARD_GOODS = 6;
export const MAX_DISPLAY_CULTURE_LEVEL = 4;

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
  let spriteCount = 0;
  if (safeAmount > 1e-9) {
    if (safeAmount <= 12) {
      spriteCount = Math.ceil(safeAmount);
    } else if (safeAmount <= 48) {
      spriteCount = 12 + Math.ceil((safeAmount - 12) / 6);
    } else if (safeAmount <= 240) {
      spriteCount = 18 + Math.ceil((safeAmount - 48) / 48);
    } else {
      spriteCount = Math.min(
        MAX_PILE_SPRITES,
        22 + Math.ceil(Math.log2(safeAmount / 240)),
      );
    }
  }
  return Object.freeze({
    amount: safeAmount,
    label: amountLabel(safeAmount),
    spriteCount,
    clipped: spriteCount === MAX_PILE_SPRITES && safeAmount > 480,
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
      || right.visual.amount - left.visual.amount
      || String(left.goods).localeCompare(String(right.goods))
    ))
    .slice(0, MAX_YARD_GOODS);
}

export function yardSlots(building, rows) {
  const candidates = [
    [0.78, 0.30],
    [0.80, 0.55],
    [0.78, 0.80],
    [0.53, 0.80],
    [0.28, 0.80],
    [0.58, 0.62],
  ];
  return rows.slice(0, MAX_YARD_GOODS).map((row, index) => Object.freeze({
    row,
    x: building.x + building.width * candidates[index][0],
    y: building.y + building.height * candidates[index][1],
  }));
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
    structureVisible: !leveled || building.vacant || tier >= 2,
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
