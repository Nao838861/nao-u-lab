export const VERSION = 'v004.40.0-season-events';

// 経済エンジンの貨幣値は表示単位の1/10。UIへ出す時だけデナリへ直す。
export const DENARI_PER_MONEY_UNIT = 10;

export function toDenari(value) {
  return value * DENARI_PER_MONEY_UNIT;
}

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
  market: '市場', warehouse: '倉庫', port: '港',
  fisher: '漁師', fisher2: '魚粉屋', logger: '木こり', woodshop: '木工房',
  cartwright: '荷車工房', charburner: '炭焼き小屋', saltworks: '塩田', quarryman: '採石場',
  miner: '鉱山', collier: '炭鉱', smelter: '製鉄所', smith: '鍛冶屋',
  wheat: '麦畑', veg: '野菜畑', shepherd: '牧場', rapeseed: '綿花畑',
});

export const JOB_ICONS = Object.freeze({
  market: '市', warehouse: '倉', port: '港',
  fisher: '魚', fisher2: '粉', logger: '木', woodshop: '工',
  cartwright: '車', charburner: '炭', saltworks: '塩', quarryman: '石',
  miner: '鉱', collier: '煤', smelter: '炉', smith: '鍛',
  wheat: '麦', veg: '菜', shepherd: '羊', rapeseed: '綿',
});

export const BUILDING_COLORS = Object.freeze({
  market: ['#b59d72', '#7c684a', '#d2b77f'],
  warehouse: ['#7a6650', '#554536', '#a08662'],
  port: ['#887b68', '#5b5145', '#b2a18b'],
  default: ['#8a7451', '#5d4b37', '#ad9162'],
});

const art = (archetype, roof, wall, accent) => Object.freeze({ archetype, roof, wall, accent });

export const BUILDING_ART = Object.freeze({
  market: art('market', '#d9bd79', '#8c744f', '#b84f43'),
  warehouse: art('warehouse', '#75624c', '#8a7355', '#d2a85d'),
  port: art('port', '#9b876a', '#74624d', '#d0b36f'),
  fisher: art('coastal', '#52747a', '#80684e', '#d6c38d'),
  fisher2: art('coastal', '#466b72', '#766047', '#bdcfcb'),
  logger: art('workshop', '#6f563d', '#8b724f', '#b87539'),
  woodshop: art('workshop', '#754e31', '#a17b4f', '#e0a653'),
  cartwright: art('workshop', '#65462f', '#97734e', '#d8a34f'),
  charburner: art('kiln', '#454b45', '#705a43', '#373d39'),
  saltworks: art('works', '#d1c6a3', '#8b7b5f', '#dfe9df'),
  quarryman: art('pit', '#75766d', '#746653', '#aaa79b'),
  miner: art('pit', '#65584c', '#685742', '#a17355'),
  collier: art('pit', '#454845', '#5d5144', '#272d2c'),
  smelter: art('industrial', '#4b4740', '#765542', '#dd7c45'),
  smith: art('industrial', '#504944', '#775740', '#c9c0ad'),
  wheat: art('farm', '#b99142', '#8a6c43', '#d6c45d'),
  veg: art('farm', '#6b8a50', '#826c48', '#8dbb65'),
  shepherd: art('pasture', '#8b7657', '#8c704f', '#ddd0aa'),
  rapeseed: art('farm', '#b7933e', '#816b49', '#e4cf48'),
});

export const BUILDING_SIZES = Object.freeze({
  fisher: Object.freeze({ width: 3, height: 3 }),
  fisher2: Object.freeze({ width: 3, height: 3 }),
  logger: Object.freeze({ width: 3, height: 3 }),
  woodshop: Object.freeze({ width: 3, height: 3 }),
  cartwright: Object.freeze({ width: 3, height: 3 }),
  charburner: Object.freeze({ width: 3, height: 3 }),
  saltworks: Object.freeze({ width: 3, height: 3 }),
  quarryman: Object.freeze({ width: 3, height: 3 }),
  miner: Object.freeze({ width: 3, height: 3 }),
  collier: Object.freeze({ width: 3, height: 3 }),
  smelter: Object.freeze({ width: 3, height: 3 }),
  smith: Object.freeze({ width: 3, height: 3 }),
  wheat: Object.freeze({ width: 4, height: 4 }),
  veg: Object.freeze({ width: 4, height: 4 }),
  shepherd: Object.freeze({ width: 4, height: 4 }),
  rapeseed: Object.freeze({ width: 4, height: 4 }),
  market: Object.freeze({ width: 5, height: 5 }),
  warehouse: Object.freeze({ width: 4, height: 4 }),
  port: Object.freeze({ width: 4, height: 3, fixed: true, shore: true }),
});

export const PLACEMENT_JOBS = Object.freeze([
  'market', 'warehouse',
  'fisher', 'fisher2', 'logger', 'woodshop', 'cartwright', 'charburner', 'saltworks', 'quarryman',
  'miner', 'collier', 'smelter', 'smith', 'wheat', 'veg', 'shepherd', 'rapeseed',
]);

export const BUILD_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'infrastructure', label: '整備', jobs: Object.freeze([]) }),
  Object.freeze({ id: 'logistics', label: '流通', jobs: Object.freeze(['market', 'warehouse']) }),
  Object.freeze({ id: 'food', label: '食料', jobs: Object.freeze(['fisher', 'wheat', 'veg', 'shepherd']) }),
  Object.freeze({ id: 'gathering', label: '採取', jobs: Object.freeze(['logger', 'quarryman', 'miner', 'collier']) }),
  Object.freeze({
    id: 'processing', label: '加工',
    jobs: Object.freeze([
      'fisher2', 'woodshop', 'cartwright', 'charburner', 'saltworks', 'smelter', 'smith', 'rapeseed',
    ]),
  }),
]);

const goodsArt = (sprite, color, dark, light, accent) => Object.freeze({
  sprite, color, dark, light, accent,
});

export const GOODS_ART = Object.freeze({
  log: goodsArt('log', '#9b5f32', '#4b2d1d', '#d7a266', '#6f4327'),
  ore: goodsArt('ore', '#9b715e', '#4f3c36', '#d2a083', '#e0c4a5'),
  coal: goodsArt('coal', '#454b49', '#1e2322', '#777d78', '#b08355'),
  bar: goodsArt('bar', '#8d8177', '#423d39', '#c9c0b7', '#68615b'),
  iron: goodsArt('iron', '#aab2b0', '#4f5b5a', '#e3e7e4', '#738d8b'),
  tools: goodsArt('tools', '#bd7d43', '#51311f', '#edbc72', '#86512e'),
  stone: goodsArt('stone', '#a9aaa3', '#555955', '#d7d6ce', '#858980'),
  wheat: goodsArt('wheat', '#c9a447', '#725923', '#ead074', '#9a7530'),
  fish: goodsArt('fish', '#5798a2', '#294f58', '#b8d8d5', '#376f7a'),
  veg: goodsArt('veg', '#6f984f', '#36562f', '#9dc56d', '#4c7e3e'),
  meat: goodsArt('meat', '#b75f52', '#66362f', '#efd7c2', '#d68a68'),
  pres: goodsArt('pres', '#8b6247', '#4f372b', '#c39b72', '#5c9193'),
  pick: goodsArt('pick', '#788b53', '#485238', '#adad78', '#4f773e'),
  meal: goodsArt('meal', '#c7a261', '#6b5534', '#ead9a4', '#9e7b43'),
  salt: goodsArt('salt', '#eee9d8', '#777a74', '#fffdf1', '#91aab0'),
  char: goodsArt('char', '#505653', '#222726', '#7c817a', '#b37648'),
  cloth: goodsArt('cloth', '#ae748a', '#5d4050', '#dcb1bf', '#7d5065'),
  oil: goodsArt('oil', '#a77a35', '#5c431f', '#d8ad54', '#7c5928'),
});

export const GOODS_LABELS = Object.freeze({
  log: '丸太', ore: '鉄鉱石', coal: '石炭', bar: '銑鉄', iron: '鉄材', tools: '木製品',
  stone: '石材', wheat: '麦', fish: '魚', veg: '野菜', meat: '肉', pres: '保存食',
  pick: '漬物', meal: '粉', salt: '塩', char: '木炭', cloth: '布', oil: '油',
});

export const SECTION_LABELS = Object.freeze({
  input: '入', output: '出', storage: '倉庫', construction: '工',
  inbound: '輸入', outbound: '輸出', pickup: '返', pantry: '家', stall: '市',
  companyStock: '会社倉庫',
});
