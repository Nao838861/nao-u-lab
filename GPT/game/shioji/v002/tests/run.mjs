import assert from 'node:assert/strict';
import { World, P, stdTerrain, VERSION } from '../src/engine.js';
import { ShipSystem } from '../src/ship.js';

const BASE = [
  ['fisher', 23, 32], ['fisher', 27, 32], ['veg', 22, 30], ['wheat', 21, 28],
  ['logger', 27, 26], ['woodshop', 24, 30], ['charburner', 26, 29], ['saltworks', 26, 31],
  ['shepherd', 24, 28], ['veg', 22, 28], ['fisher', 21, 33],
];

const BASE_ROADS = [
  ...Array.from({ length: 10 }, (_, i) => [25, 26 + i]),
  [24, 32], [26, 32], [24, 31], [23, 30], [22, 29],
  [26, 27], [24, 29], [23, 29], [22, 32], [23, 31],
];

function makeWorld(seed = 11) {
  const world = new World(seed);
  world.market = { x: 25, y: 32 };
  world.port = { x: 25, y: 35 };
  world.setTerrain(stdTerrain(48, 40));
  world.seedRoads(BASE_ROADS);
  for (const [job, x, y] of BASE) assert.equal(world.addZone(job, x, y), true, `${job}を配置できる`);
  return world;
}

function testRoadNetwork() {
  const world = new World(3);
  world.market = { x: 25, y: 32 };
  world.port = { x: 25, y: 35 };
  world.setTerrain(stdTerrain(48, 40));
  world.seedRoads([[25, 32], [24, 32], [25, 33], [25, 34], [25, 35]]);

  assert.equal(world.canPlace('veg', 5, 5)[0], false, '市場から孤立した土地には建てられない');
  assert.equal(world.planRoad(23, 31, { player: true }), true, '接続道路を計画できる');
  assert.equal(world.planRoad(22, 30, { player: true }), true, '計画道路を連続して延ばせる');
  assert.equal(world.canPlace('veg', 21, 29)[0], true, '連続した計画道路の沿道は区画指定できる');
  assert.equal(world.addZone('veg', 21, 29), true, '計画道路沿いに区画を予約できる');
  assert.equal(world.zones[0].roadConnected, false, '道路完成前の区画には入植できない');

  world.removeRoadBatch([[23, 31], [22, 30]]);
  world.seedRoads([[23, 31], [22, 30]]);
  assert.equal(world.zones[0].roadConnected, true, '道路完成で沿道区画が市場網につながる');
  const h = world.addHH('veg', 21, 29);
  const footCapacity = h.members.length * 4;
  assert.equal(h.transport, 'cart', '接続した家は手荷車を使う');
  assert.equal(h.haul(), footCapacity * P.CART_MULT, '手荷車の運搬量は徒歩の4倍');
  world.startMarketTrip(h, { veg: 20 });
  assert.equal(h.tripVehicle, 'cart');
  assert.ok(h.tripRoute.slice(2, -1).every(([x, y]) => world.roadConnected.has(`${x},${y}`)), '荷車の本線経路は完成道路だけを通る');
  let cartTicks = 0;
  while (!world.stepToMarket(h) && cartTicks++ < 100) {}
  h.px = h.x; h.py = h.y; h.tripVehicle = 'foot'; h.tripRoute = world.traceFootRoute(h.x, h.y); h.routeIndex = 0;
  let footTicks = 0;
  while (!world.stepToMarket(h) && footTicks++ < 100) {}
  assert.ok(cartTicks < footTicks, `同じ市場行きで手荷車(${cartTicks})は徒歩(${footTicks})より速い`);

  h.px = h.x; h.py = h.y; h.state = 'home';
  world.startMarketTrip(h, { veg: 20 });
  const goodsBeforeCut = Object.values(h.pantry).reduce((a, b) => a + b, 0);

  const impact = world.roadRemovalImpact([[23, 31]]);
  assert.ok(impact.isolatedRoads >= 1, '橋となる道路の撤去前に孤立区画を検出する');
  assert.ok(impact.disconnectedZones >= 1 && impact.disconnectedHomes >= 1, '沿道の家と区画への影響を予告する');
  world.removeRoadBatch([[23, 31]]);
  assert.equal(h.roadConnected, false, '道路切断後は手荷車接続を失う');
  assert.equal(h.tripVehicle, 'foot', '走行中に道が切れた時は荷車を消し、徒歩へ安全に切り替える');
  assert.equal(Object.values(h.pantry).reduce((a, b) => a + b, 0), goodsBeforeCut, '道路撤去で積荷は消えない');
  assert.equal(h.haul(), footCapacity, '未接続時は徒歩運搬量に戻る');
}

function testPublicRoadWorks() {
  const world = new World(17);
  world.market = { x: 25, y: 32 };
  world.port = { x: 25, y: 35 };
  world.setTerrain(stdTerrain(48, 40));
  world.seedRoads([[25, 32], [24, 32], [26, 32], [25, 33], [25, 34], [25, 35]]);
  assert.equal(world.addZone('fisher', 23, 32), true);
  assert.equal(world.addZone('fisher', 27, 32), true);
  const batch = world.beginRoadBatch();
  for (const [x, y] of [[24, 31], [23, 30], [22, 29]]) assert.equal(world.planRoad(x, y, { batch, player: true }), true);
  for (let day = 0; day < 120; day++) world.step();
  assert.ok(world.hhs.length >= 2, '序盤の二世帯が入植する');
  assert.equal(world.sites.length, 0, '好況でも公費人夫が計画道路を完成させる');
  assert.equal(world.connectedPlayerRoadCount(), 3, '道路は市場側から連続して完成する');
  assert.ok(world.co.pub > 0, '道路普請の賃金が住民へ支払われる');
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
testRoadNetwork();
testPublicRoadWorks();
testShip();
console.log(JSON.stringify({
  ok: true,
  version: VERSION,
  day: world.day,
  population: world.pop(),
  treasury: Math.round(world.treasury * 10),
  fishProduction: Number((world.f30.fish.prod || 0).toFixed(2)),
}));
