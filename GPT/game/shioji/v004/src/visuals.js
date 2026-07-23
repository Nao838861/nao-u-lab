import { BUILDING_ART, GOODS_ART } from './config.js?v=v004.10.0-final-polish';

export const MAX_PILE_SPRITES = 5;

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
  const spriteCount = safeAmount <= 1e-9
    ? 0
    : Math.min(MAX_PILE_SPRITES, Math.max(1, Math.ceil(Math.log2(safeAmount + 1))));
  return Object.freeze({
    amount: safeAmount,
    label: amountLabel(safeAmount),
    spriteCount,
    clipped: spriteCount === MAX_PILE_SPRITES && safeAmount > (2 ** (MAX_PILE_SPRITES - 1)),
    art: GOODS_ART[goods] ?? Object.freeze({ color: '#bd9a63', dark: '#6f593c', shape: 'crate' }),
  });
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
  const level = Math.max(0, Math.floor(building.cultureLevel ?? 0));
  const tier = Math.min(4, level);
  const art = BUILDING_ART[building.type] ?? Object.freeze({
    archetype: 'workshop', roof: '#80684d', wall: '#8a7451', accent: '#d2a85d',
  });
  return Object.freeze({
    key: `${building.type}:lv${tier}:${building.vacant ? 'vacant' : 'active'}`,
    level,
    tier,
    archetype: art.archetype,
    roof: art.roof,
    wall: art.wall,
    accent: art.accent,
    elevation: 16 + tier * 4,
    windows: tier >= 2 ? Math.min(3, tier - 1) : 0,
    stoneBase: tier >= 3,
    fallback: !BUILDING_ART[building.type],
  });
}
