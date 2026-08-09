import { GOODS_DISCOVERY_SCRIPTS } from './goods_discovery.js?v=v004.44.0-stable-yards';

export const GOODS_SHELF_LIFE_DAYS = Object.freeze({
  fish: 3,
  veg: 30,
});

const GOODS_DETAIL_FALLBACK_FACTS = Object.freeze({
  ore: '鉄鉱石は、石炭か木炭と製鉄所で銑鉄になります。',
  coal: '石炭は、製鉄と鍛冶の燃料になります。',
  bar: '銑鉄は、石炭か木炭と鍛冶屋で鉄材になります。',
  iron: '鉄材は、家の発展に使います。',
  stone: '石材は、道を舗装する材料です。',
  veg: '野菜は30日ほど持ち、塩があれば畑の家で漬物になります。',
  meat: '肉は牧場で作る食料です。',
  meal: '粉は魚粉屋で作り、麦畑と綿花畑の肥料になります。',
  cloth: '布は牧場と綿花畑で作り、家の発展に使います。',
  oil: '油は本土から仕入れ、家の発展に使います。',
});

export const GOODS_DETAIL_FACTS = Object.freeze({
  log: GOODS_DISCOVERY_SCRIPTS.log,
  ore: GOODS_DETAIL_FALLBACK_FACTS.ore,
  coal: GOODS_DETAIL_FALLBACK_FACTS.coal,
  bar: GOODS_DETAIL_FALLBACK_FACTS.bar,
  iron: GOODS_DETAIL_FALLBACK_FACTS.iron,
  tools: GOODS_DISCOVERY_SCRIPTS.tools,
  stone: GOODS_DETAIL_FALLBACK_FACTS.stone,
  wheat: GOODS_DISCOVERY_SCRIPTS.wheat,
  fish: GOODS_DISCOVERY_SCRIPTS.fish,
  veg: GOODS_DETAIL_FALLBACK_FACTS.veg,
  meat: GOODS_DETAIL_FALLBACK_FACTS.meat,
  pres: GOODS_DISCOVERY_SCRIPTS.pres,
  pick: GOODS_DISCOVERY_SCRIPTS.pick,
  meal: GOODS_DETAIL_FALLBACK_FACTS.meal,
  salt: GOODS_DISCOVERY_SCRIPTS.salt,
  char: GOODS_DISCOVERY_SCRIPTS.char,
  cloth: GOODS_DETAIL_FALLBACK_FACTS.cloth,
  oil: GOODS_DETAIL_FALLBACK_FACTS.oil,
});

const recipe = ({
  makers, inputs = [], alternatives = [], optional = [], output,
}) => Object.freeze({
  makers: Object.freeze(makers),
  inputs: Object.freeze(inputs),
  alternatives: Object.freeze(alternatives.map(group => Object.freeze(group))),
  optional: Object.freeze(optional),
  output,
});

export const GOODS_RECIPES = Object.freeze({
  log: recipe({ makers: ['logger'], output: 'log' }),
  ore: recipe({ makers: ['miner'], output: 'ore' }),
  coal: recipe({ makers: ['collier'], output: 'coal' }),
  bar: recipe({
    makers: ['smelter'], inputs: ['ore'], alternatives: [['coal', 'char']], output: 'bar',
  }),
  iron: recipe({
    makers: ['smith'], inputs: ['bar'], alternatives: [['coal', 'char']], output: 'iron',
  }),
  tools: recipe({ makers: ['woodshop'], inputs: ['log'], output: 'tools' }),
  stone: recipe({ makers: ['quarryman'], output: 'stone' }),
  wheat: recipe({ makers: ['wheat'], output: 'wheat' }),
  fish: recipe({ makers: ['fisher'], output: 'fish' }),
  veg: recipe({ makers: ['veg'], output: 'veg' }),
  meat: recipe({ makers: ['shepherd'], output: 'meat' }),
  pres: recipe({
    makers: ['fisher'], inputs: ['fish', 'salt'], optional: ['char'], output: 'pres',
  }),
  pick: recipe({ makers: ['veg'], inputs: ['veg', 'salt'], output: 'pick' }),
  meal: recipe({ makers: ['fisher2'], output: 'meal' }),
  salt: recipe({ makers: ['saltworks'], inputs: ['char'], output: 'salt' }),
  char: recipe({ makers: ['charburner'], inputs: ['log'], output: 'char' }),
  cloth: recipe({ makers: ['shepherd', 'rapeseed'], output: 'cloth' }),
  oil: recipe({ makers: ['port'], output: 'oil' }),
});

export function goodsDetail(goods) {
  const fact = GOODS_DETAIL_FACTS[goods];
  const recipeRow = GOODS_RECIPES[goods];
  if (!fact || !recipeRow) throw new RangeError(`不明な品目です: ${goods}`);
  return Object.freeze({
    goods,
    fact,
    shelfLifeDays: GOODS_SHELF_LIFE_DAYS[goods] ?? null,
    recipe: recipeRow,
  });
}
