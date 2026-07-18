import assert from 'node:assert/strict';
import { World, stdTerrain, VERSION } from '../src/engine.js';

const BASE = [
  ['fisher', 23, 32], ['fisher', 27, 32], ['veg', 22, 30], ['wheat', 21, 28],
  ['logger', 27, 26], ['woodshop', 24, 30], ['charburner', 26, 29], ['saltworks', 26, 31],
  ['shepherd', 24, 28], ['veg', 22, 28], ['fisher', 21, 33],
];

const ROADS = [
  ...Array.from({ length: 10 }, (_, i) => [25, 26 + i]),
  [24, 32], [26, 32], [24, 31], [23, 30], [22, 29],
  [26, 27], [24, 29], [23, 29], [22, 32], [23, 31],
];

const results = [];
for (const seed of [1, 2, 3, 5, 8, 13, 21, 34]) {
  const world = new World(seed);
  world.market = { x: 25, y: 32 };
  world.port = { x: 25, y: 35 };
  world.setTerrain(stdTerrain(48, 40));
  world.seedRoads(ROADS);
  for (const [job, x, y] of BASE) assert.equal(world.addZone(job, x, y), true, `seed ${seed}: ${job}を配置`);
  for (let day = 1; day <= 720; day++) {
    if (day % 5 === 0) {
      world.stockTgt.wheat = Math.max(world.stockTgt.wheat || 0, Math.round(world.pop() * 2));
      if (world.order) world.stockTgt[world.order.g] = Math.max(world.stockTgt[world.order.g] || 0, Math.ceil((world.stock[world.order.g] || 0) + world.order.left));
    }
    world.step();
  }
  assert.equal(world.goDay, null, `seed ${seed}: 2年以内に破産しない`);
  assert.ok(world.pop() >= 60, `seed ${seed}: 集落人口を維持する`);
  assert.ok(world.roadStats.cartTrips > 0 && world.roadStats.delivered > 0, `seed ${seed}: 手荷車流通が成立する`);
  assert.ok(world.hhs.every(h => h.roadConnected), `seed ${seed}: 基準村の全世帯が接道する`);
  results.push({ seed, population: world.pop(), treasury: Math.round(world.treasury * 10), cartTrips: world.roadStats.cartTrips, delivered: Math.round(world.roadStats.delivered) });
}

console.log(JSON.stringify({ ok: true, version: VERSION, results }, null, 2));
