export const VERSION = 'v004.0.1-phase-va';

export const TILE = Object.freeze({ width: 68, height: 34 });

export const SPEEDS = Object.freeze([
  Object.freeze({ label: '一時停止', ticksPerSecond: 0 }),
  Object.freeze({ label: '通常速度', ticksPerSecond: 2 }),
  Object.freeze({ label: '四倍速', ticksPerSecond: 8 }),
  Object.freeze({ label: '一日毎秒', ticksPerSecond: 30 }),
]);

export const TERRAIN_COLORS = Object.freeze({
  water: ['#164e57', '#195861', '#1b6068', '#15535d'],
  grass: ['#6e8b50', '#739254', '#698449', '#78975a'],
  sand: ['#aa986c', '#b3a174', '#a18f65', '#b9a777'],
  forest: ['#557343', '#5c7b47', '#4f6d3d', '#62804b'],
  rock: ['#777b6c', '#737969', '#7e8071', '#6d7467'],
  ore: ['#806f63', '#8c786a', '#76655d', '#927e6d'],
  coal: ['#525652', '#494d4a', '#5c605a', '#424744'],
});

export const JOB_LABELS = Object.freeze({
  market: '市場', warehouse: '蔵', port: '港',
  fisher: '漁家', fisher2: '漁家', logger: '木こり', woodshop: '木工房',
  charburner: '炭焼', saltworks: '製塩所', quarryman: '採石場',
  miner: '鉱山', collier: '炭鉱', smelter: '製鉄所', smith: '鍛冶屋',
  wheat: '麦農家', veg: '菜園', shepherd: '牧場', rapeseed: '菜種農家',
});

export const BUILDING_COLORS = Object.freeze({
  market: ['#b59d72', '#7c684a', '#d2b77f'],
  warehouse: ['#7a6650', '#554536', '#a08662'],
  port: ['#887b68', '#5b5145', '#b2a18b'],
  default: ['#8a7451', '#5d4b37', '#ad9162'],
});
