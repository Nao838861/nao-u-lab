import assert from 'node:assert/strict';
import { createEngineApi, mimicPlayerThroughApi } from '../../engine/src/api.js';
import { buildBaseCity } from '../../engine/src/audit.js';
import { FOOD_GOODS, WINTER_RESERVE_PER_PERSON } from '../src/food_readability.js';

const objectFoodTotal = rows => FOOD_GOODS.reduce(
  (total, goods) => total + (rows?.[goods] ?? 0), 0,
);

function physicalFoodTotal(economy) {
  const stalls = FOOD_GOODS.reduce((total, goods) => total
    + (economy.stalls[goods] ?? []).reduce((sum, row) => sum + row.qty, 0), 0);
  const pantry = economy.households.reduce(
    (total, household) => total + objectFoodTotal(household.pantry), 0,
  );
  return objectFoodTotal(economy.stock)
    + objectFoodTotal(economy.marketStock)
    + stalls
    + pantry;
}

const rows = [];
for (const seed of [11, 13, 14]) {
  const api = createEngineApi(buildBaseCity(seed), { captureEventStream: false });
  for (let day = 1; day <= 330; day += 1) {
    api.advanceDays(1);
    mimicPlayerThroughApi(api, day);
  }
  const before = api.snapshot().economy;
  const population = before.households.reduce(
    (total, household) => total + household.members.length, 0,
  );
  const startingFood = physicalFoodTotal(before);
  for (let day = 331; day <= 420; day += 1) {
    api.advanceDays(1);
    mimicPlayerThroughApi(api, day);
  }
  const after = api.snapshot().economy;
  const drawdown = startingFood - physicalFoodTotal(after);
  const drawdownPerPerson = drawdown / population;
  assert.ok(drawdownPerPerson > 20 && drawdownPerPerson < 50);
  assert.ok(16 / population < 1, '16荷だけでは基準都市の冬1日分にも満たない');
  rows.push({ seed, population, drawdown, drawdownPerPerson });
}

assert.ok(
  Math.ceil(Math.max(...rows.map(row => row.drawdownPerPerson))) <= WINTER_RESERVE_PER_PERSON,
  '予報の46荷/人は3シード実測の上端を覆う',
);

console.log(`冬90日実測: ${rows.map(row => (
  `seed${row.seed} 人口${row.population}・取崩${row.drawdown.toFixed(1)}荷`
    + `（${row.drawdownPerPerson.toFixed(1)}荷/人）`
)).join(' / ')}`);
console.log(`予報式: 人口×${WINTER_RESERVE_PER_PERSON}荷、教材16荷は操作を学ぶ最小ロット`);
