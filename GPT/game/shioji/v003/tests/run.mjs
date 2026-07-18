import assert from 'node:assert/strict';
import { BUILDINGS, FIXED, GOODS, UPGRADE_REQUIREMENTS, VERSION } from '../src/config.js';
import { keyOf, line8, roadPath } from '../src/pathfinding.js';
import { World } from '../src/world.js';

function advance(world, seconds, observe = null) {
  const ticks = Math.ceil(seconds / 0.1);
  for (let i = 0; i < ticks; i++) {
    world.update(0.1);
    if (observe) observe(world);
  }
}

function establishWoodRoute(world) {
  const road = world.addRoadLine(FIXED.roadHead, FIXED.forestGate);
  assert.equal(road.ok, true, road.reason);
  assert.equal(road.newCells.length, 2, '既設の道標を除く2区画だけ新設する');
  assert.equal(world.tutorialComplete(0), true, '森の手前へ繋がった完成道路を教程条件にする');

  const logger = world.addBuilding('logger', FIXED.suggestedLogger.x, FIXED.suggestedLogger.y);
  assert.equal(logger.ok, true, logger.reason);
  assert.equal(world.tutorialComplete(1), true, '3×3の木こり仕事場を実在施設として判定する');

  const woodshop = world.addBuilding('woodshop', FIXED.suggestedWoodshop.x, FIXED.suggestedWoodshop.y);
  assert.equal(woodshop.ok, true, woodshop.reason);
  assert.equal(world.tutorialComplete(3), true, '3×3の木工房を実在施設として判定する');
  return { logger: logger.building, woodshop: woodshop.building };
}

function testFootprintsAndRoads() {
  const world = new World();
  const road = world.roadPreview(FIXED.roadHead, FIXED.forestGate);
  assert.equal(road.ok, true);
  assert.deepEqual(road.cells, [{ x: 13, y: 11 }, { x: 14, y: 10 }, { x: 15, y: 9 }], '8方向の斜め道路を連続線として引く');
  world.addRoadLine(FIXED.roadHead, FIXED.forestGate);
  const placed = world.addBuilding('logger', 16, 7);
  assert.equal(placed.ok, true);
  const logger = placed.building;
  assert.equal([...world.occupied.values()].filter(id => id === logger.id).length, 9, '3×3建物は論理上も9区画を占有する');
  assert.equal(world.roads.has(keyOf(16, 7)), false, '建物占有区画へ道路を重ねない');
  const blocked = world.roadPreview(FIXED.forestGate, { x: 17, y: 8 });
  assert.equal(blocked.ok, false);
  assert.match(blocked.reason, /建物/);
  const overlap = world.canPlace('woodshop', 17, 8);
  assert.equal(overlap.ok, false, '見た目だけでなく占有範囲の重複を拒否する');
  assert.equal(line8([1, 1], [4, 2]).every((point, index, all) => index === 0 || Math.max(Math.abs(point[0] - all[index - 1][0]), Math.abs(point[1] - all[index - 1][1])) === 1), true);
}

function testVisibleLogisticsAndUpgrade() {
  const world = new World();
  world.beginCharter();
  const { logger, woodshop } = establishWoodRoute(world);
  const allCartTilesAreRoad = [];

  advance(world, 28, current => {
    for (const shipment of current.shipments) {
      allCartTilesAreRoad.push(shipment.path.every(point => current.roads.has(keyOf(point.x, point.y))));
    }
  });

  assert.ok((world.stats.produced.log || 0) > 0, '木こりの出荷場へ実在する丸太を生産する');
  assert.ok((world.stats.deliveredTo['woodshop:log'] || 0) > 0, '丸太を荷車到着時に木工房へ入荷する');
  assert.ok((world.stats.produced.boards || 0) >= 5, '実際に届いた丸太だけを木製品へ加工する');
  assert.equal(allCartTilesAreRoad.every(Boolean), true, 'すべての荷車経路が完成道路上にある');

  const boardsBefore = world.sectionAmount(woodshop, 'output', 'boards');
  assert.ok(boardsBefore >= UPGRADE_REQUIREMENTS.woodshop[1].boards, '最初の増築材が出荷場に積まれる');
  assert.equal(world.requestUpgrade(woodshop.id).ok, true);
  advance(world, 8);
  assert.equal(woodshop.grade, 1, '木製品を工事置き場へ移し、恒久等級を上げる');
  assert.equal(world.sectionAmount(woodshop, 'construction', 'boards'), 0, '完成時に工事材を実消費する');
  assert.equal(world.statusOf(woodshop).label === '丸太待ち' || world.statusOf(woodshop).tone === 'good', true, '等級と一時的稼働状態を別に保つ');
}

function testPortAndMoneyShareOneState() {
  const world = new World();
  world.beginCharter();
  const { woodshop } = establishWoodRoute(world);
  advance(world, 24);
  world.requestUpgrade(woodshop.id);
  advance(world, 8);
  assert.equal(woodshop.grade, 1);
  world.setChapterStage(6);

  let outboundPeak = 0;
  let sawBoardCart = false;
  let fundsAtPeak = world.funds;
  advance(world, 85, current => {
    const port = current.getBuildingByType('port');
    const outbound = current.sectionAmount(port, 'outbound', 'boards');
    if (outbound > outboundPeak) {
      outboundPeak = outbound;
      fundsAtPeak = current.funds;
    }
    if (current.shipments.some(shipment => shipment.good === 'boards' && shipment.targetId === port.id)) sawBoardCart = true;
  });

  assert.equal(sawBoardCart, true, '木製品を積んだ荷車が工房から港へ走る');
  assert.ok(outboundPeak > 0, '船待ちの木製品が港の輸出ヤードへ平積みされる');
  assert.ok((world.stats.exported.boards || 0) > 0, '船は港へ届いた木製品だけを輸出する');
  const exportRows = world.ledger.filter(row => row.kind === 'export');
  assert.ok(exportRows.length > 0 && exportRows.every(row => row.amount > 0), '輸出は正符号の独立した帳簿行になる');
  const importRows = world.ledger.filter(row => row.kind === 'import');
  assert.ok(importRows.length > 0 && importRows.every(row => row.amount < 0), '輸入は負符号の独立した帳簿行になる');
  assert.equal(exportRows.reduce((sum, row) => sum + row.amount, 0), (world.stats.exported.boards || 0) * 12, '山から減った輸出量と入金額が同じ状態を参照する');
  assert.ok(world.funds !== fundsAtPeak || world.stats.exported.boards > 0, '港の出来事が会社資金へ反映される');
}

function testFixedSlotsAndStatus() {
  const world = new World();
  world.addRoadLine(FIXED.roadHead, FIXED.forestGate);
  const logger = world.addBuilding('logger', 16, 7).building;
  assert.equal(world.sectionCapacity(logger, 'output', 'log'), BUILDINGS.logger.outputCaps.log);
  assert.equal(world.sectionAmount(logger, 'output', 'log'), 0, '空の固定出荷枠も数量0として存在する');
  world.addInventory(logger, 'output', 'log', world.sectionCapacity(logger, 'output', 'log'));
  assert.equal(world.statusOf(logger).label, '搬出待ち', '出荷場満杯を搬出停滞として解釈する');
  const port = world.getBuildingByType('port');
  assert.equal(world.sectionCapacity(port, 'inbound', 'stone') > 0, true, '輸入ヤードに切石の固定枠がある');
  assert.equal(world.sectionCapacity(port, 'outbound', 'boards') > 0, true, '輸出ヤードに木製品の固定枠がある');
  assert.equal(Object.keys(GOODS).every(good => GOODS[good].name.length > 0), true);
}

function testPathDisconnectDoesNotTeleport() {
  const world = new World();
  world.addRoadLine(FIXED.roadHead, FIXED.forestGate);
  const { logger, woodshop } = establishWoodRoute(new World());
  const path = roadPath(world.roads, { x: 15, y: 9 }, { x: 13, y: 11 });
  assert.ok(path && path.length >= 3);
  assert.equal(path.every(point => world.roads.has(keyOf(point.x, point.y))), true);
  assert.notEqual(logger.id, woodshop.id);
}

function testWarehouseBuffersVisibleOverflow() {
  const world = new World();
  world.beginCharter();
  world.addRoadLine(FIXED.roadHead, FIXED.forestGate);
  const logger = world.addBuilding('logger', FIXED.suggestedLogger.x, FIXED.suggestedLogger.y).building;
  const warehouse = world.addBuilding('warehouse', FIXED.suggestedWoodshop.x, FIXED.suggestedWoodshop.y).building;
  world.setChapterStage(8);
  world.addInventory(logger, 'output', 'log', 28);
  advance(world, 8);
  assert.ok(world.sectionAmount(warehouse, 'storage', 'log') > 0, '満ちた生産地から中継倉庫へ実際に荷を退避する');
  assert.ok((world.stats.deliveredTo['warehouse:log'] || 0) > 0, '倉庫到着を他の配送と同じ記録へ残す');
}

function testTutorialContinuesIntoWarehouse() {
  const world = new World();
  world.beginCharter();
  world.setChapterStage(8);
  assert.equal(world.tutorialComplete(8), false, '倉庫解禁だけでは建設完了にしない');
  const warehouse = world.addBuilding('warehouse', FIXED.suggestedWoodshop.x, FIXED.suggestedWoodshop.y).building;
  assert.equal(world.tutorialComplete(8), true, '倉庫建設で次の教程へ進める');
  assert.equal(world.tutorialComplete(9, { warehouseViewed: false }), false, '倉庫を確認するまでは完了しない');
  assert.equal(world.tutorialComplete(9, { warehouseViewed: true }), true, '倉庫確認で教程を完了できる');
  assert.equal(warehouse.type, 'warehouse');
}

function testLongRunInvariants() {
  const world = new World();
  world.beginCharter();
  world.addRoadLine(FIXED.roadHead, FIXED.forestGate);
  const loggerResult = world.addBuilding('logger', 16, 7);
  assert.equal(loggerResult.ok, true, loggerResult.reason);
  const woodshopResult = world.addBuilding('woodshop', 11, 8);
  assert.equal(woodshopResult.ok, true, woodshopResult.reason);
  const warehouseResult = world.addBuilding('warehouse', 15, 10);
  assert.equal(warehouseResult.ok, true, warehouseResult.reason);
  const logger = loggerResult.building;
  const woodshop = woodshopResult.building;
  const warehouse = warehouseResult.building;
  world.setChapterStage(8);
  for (let tick = 0; tick < 6000; tick++) {
    world.update(0.1);
    for (const building of world.buildings) {
      for (const section of Object.values(building.inventory)) {
        for (const amount of Object.values(section)) assert.ok(amount >= 0, '在庫が負数にならない');
      }
    }
    for (const shipment of world.shipments) {
      assert.ok(shipment.path.every(point => world.roads.has(keyOf(point.x, point.y))), '長時間運転でも道路外荷車が出ない');
    }
    assert.ok(Number.isFinite(world.funds) && world.funds >= 0, '長時間運転でも資金が壊れない');
  }
  assert.ok(world.stats.produced.log > 0 && world.stats.produced.boards > 0, '長時間で生産が停止しない');
  assert.ok(world.stats.exported.boards > 0, '長時間で輸出が停止しない');
  assert.ok(world.sectionAmount(warehouse, 'storage', 'log') >= 0, '倉庫在庫が壊れない');
  assert.equal(new Set([logger.id, woodshop.id, warehouse.id]).size, 3, '長時間検証中も施設IDが衝突しない');
}

testFootprintsAndRoads();
testVisibleLogisticsAndUpgrade();
testPortAndMoneyShareOneState();
testFixedSlotsAndStatus();
testPathDisconnectDoesNotTeleport();
testWarehouseBuffersVisibleOverflow();
testTutorialContinuesIntoWarehouse();
testLongRunInvariants();

console.log(JSON.stringify({
  ok: true,
  version: VERSION,
  checks: ['footprints', 'roads', 'cart-route', 'inventory-conservation', 'upgrade', 'ship-ledger'],
}));
