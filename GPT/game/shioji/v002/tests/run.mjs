import assert from 'node:assert/strict';
import { World, stdTerrain, VERSION } from '../src/engine.js';
import { ShipSystem } from '../src/ship.js';

const BASE = [
  ['fisher', 23, 32], ['fisher', 27, 32], ['veg', 22, 30], ['wheat', 21, 28],
  ['logger', 27, 26], ['woodshop', 24, 30], ['charburner', 26, 29], ['saltworks', 26, 31],
  ['shepherd', 24, 28], ['veg', 22, 28], ['fisher', 21, 33],
];

function makeWorld(seed = 11) {
  const world = new World(seed);
  world.market = { x: 25, y: 32 };
  world.port = { x: 25, y: 35 };
  world.setTerrain(stdTerrain(48, 40));
  for (const [job, x, y] of BASE) assert.equal(world.addZone(job, x, y), true, `${job}を配置できる`);
  return world;
}

function testEconomy() {
  const world = makeWorld();
  for (let day = 1; day <= 720; day++) {
    if (day % 5 === 0) {
      world.stockTgt.wheat = Math.max(world.stockTgt.wheat || 0, Math.round(world.pop() * 2));
      if (world.order) world.stockTgt[world.order.g] = Math.max(world.stockTgt[world.order.g] || 0, Math.ceil((world.stock[world.order.g] || 0) + world.order.left));
    }
    world.step();
  }
  assert.equal(Number.isFinite(world.treasury), true, '会社資金が有限値');
  assert.ok(world.pop() > 0, '住民が入植している');
  assert.ok(world.hhs.some(h => h.job === 'fisher'), '漁師が存在する');
  assert.ok((world.f30?.fish?.prod || 0) > 0, '魚の生産フローがある');
  assert.ok(world.mainlandIn >= 0 && world.mainlandOut >= 0, '本国境界の帳簿が存在する');
  assert.equal(world.goDay, null, '基準村は2年以内に破産しない');
  return world;
}

function testShip() {
  let arrivals = 0;
  const ship = new ShipSystem({ x: 25, y: 35 }, () => arrivals++);
  assert.equal(ship.state, 'docked', '第一便は停泊から始まる');
  ship.begin();
  for (let i = 0; i < 60; i++) ship.update(.1, 0);
  assert.equal(ship.state, 'away', '第一便は出港して画面外へ帰る');
  ship.update(.1, 15);
  assert.equal(ship.state, 'arriving', '15日目に次便が入港する');
  assert.equal(arrivals, 1, '到着通知は一度だけ');
  for (let i = 0; i < 45; i++) ship.update(.1, 15);
  assert.equal(ship.state, 'docked', '入港後は荷役のため停泊する');
  for (let i = 0; i < 120; i++) ship.update(.1, 15);
  assert.equal(ship.state, 'away', '荷役後は再び出港する');
}

const world = testEconomy();
testShip();
console.log(JSON.stringify({
  ok: true,
  version: VERSION,
  day: world.day,
  population: world.pop(),
  treasury: Math.round(world.treasury * 10),
  fishProduction: Number((world.f30.fish.prod || 0).toFixed(2)),
}));
