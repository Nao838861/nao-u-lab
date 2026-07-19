import assert from "node:assert/strict";

import {
  FOODS,
  GOODS,
  JOBCLS,
  P,
  PERISH,
  assertCompanyLedger,
  assertMoneyConservation,
  createEconomicState,
  createHousehold,
  createCompanyState,
  economicMaterialSnapshot,
  householdClass,
  householdEat,
  householdHaul,
  householdMult,
  postCompanyLedger,
  recordExternalMoneyFlow,
} from "../src/econ.js";
import {
  FOODS as FLOW_ISLAND_FOODS,
  GOODS as FLOW_ISLAND_GOODS,
  P as FLOW_ISLAND_P,
  PERISH as FLOW_ISLAND_PERISH,
  HH as FlowIslandHousehold,
} from "../../../../../Claude/game/flow_island/engine.js";
import { mulberry32 } from "../src/prng.js";
import {
  V003_FIXED,
  addBuilding,
  addRoadLine,
  assertCarrierInvariants,
  assertMaterialBalance,
  assertOccupancyInvariant,
  completeHaulJob,
  createCartCarrier,
  createHaulJob,
  createMaterialFlowLedger,
  createPhysicalState,
  createV003PhysicalState,
  createWalkCarrier,
  depositInventory,
  hasRoad,
  isConnected,
  keyOf,
  loseHaulCarrier,
  materialSnapshot,
  moveInventoryBetweenSections,
  pathLen,
  recordMaterialFlow,
  removeRoadTile,
  roadPath,
  sectionAmount,
  sectionCapacity,
  stepHaulCarriers,
  withdrawInventory,
} from "../src/physical.js";
import { createWorld } from "../src/world.js";

const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

test("mulberry32は同じシードから同じ列を返す", () => {
  const a = mulberry32(12345);
  const b = mulberry32(12345);
  const sequenceA = Array.from({ length: 16 }, () => a());
  const sequenceB = Array.from({ length: 16 }, () => b());
  assert.deepEqual(sequenceA, sequenceB);
});

test("worldは同じシードと操作から同じJSON状態になる", () => {
  const run = () => {
    const world = createWorld({ seed: 17 });
    const randomValues = [world.random(), world.random(), world.random()];
    world.step();
    world.step();
    return { randomValues, state: world.state };
  };

  assert.deepEqual(run(), run());
  assert.doesNotThrow(() => JSON.stringify(run().state));
});

test("会社資金の増減は台帳に残り残高と一致する", () => {
  const company = createCompanyState(5_500);
  postCompanyLedger(company, { day: 1, amount: -250, reason: "支度金" });
  postCompanyLedger(company, { day: 1, amount: 40, reason: "市場口銭" });

  assert.equal(company.money, 5_290);
  assert.deepEqual(company.ledger, [
    { day: 1, amount: -250, reason: "支度金", balance: 5_250 },
    { day: 1, amount: 40, reason: "市場口銭", balance: 5_290 },
  ]);
  assert.equal(assertCompanyLedger(company), true);
});

test("会社資金を直接変更すると台帳検査が赤くなる", () => {
  const company = createCompanyState(5_500);
  company.money -= 1;
  assert.throws(() => assertCompanyLedger(company), /台帳外の変更/);
});

test("testConservation: 3シード×360日の貨幣保存則違反がゼロ", () => {
  for (const seed of [11, 13, 14]) {
    const world = createWorld({ seed, initialCompanyMoney: 5_500 });
    for (let day = 0; day < 360; day += 1) {
      assert.doesNotThrow(() => world.step());
    }
    assert.equal(world.state.day, 360);
    assert.equal(assertMoneyConservation(world.state.economy), true);
  }
});

test("本土との境界記帳だけを増やすと貨幣保存則が赤くなる", () => {
  const world = createWorld({ seed: 11, initialCompanyMoney: 5_500 });
  recordExternalMoneyFlow(world.state.economy, {
    amount: 100,
    reason: "検査用の未反映流入",
  });
  assert.throws(() => world.step(), /貨幣保存則違反/);
});

test("物資出納は生産・消費と輸送中cargoを含めて一致する", () => {
  const flows = createMaterialFlowLedger();
  recordMaterialFlow(flows, "wheat", "prod", 10);
  recordMaterialFlow(flows, "wheat", "cons", 2);

  const reports = assertMaterialBalance({
    before: { inventory: { wheat: 100 }, cargo: { wheat: 0 } },
    after: { inventory: { wheat: 98 }, cargo: { wheat: 10 } },
    flows,
  });
  assert.equal(reports[0].actualDelta, 8);
  assert.equal(reports[0].expectedDelta, 8);
  assert.equal(reports[0].residual, 0);
});

test("物資フローを1件わざと記帳し忘れると嘘発見器が赤くなる", () => {
  const flows = createMaterialFlowLedger();
  assert.throws(
    () => assertMaterialBalance({
      before: { inventory: { wheat: 100 }, cargo: {} },
      after: { inventory: { wheat: 90 }, cargo: {} },
      flows,
    }),
    /物資出納違反.*wheat/,
  );
});

test("段5: v003と同じ地形・道路グラフをNode単体で生成する", () => {
  const physical = createV003PhysicalState();
  const terrainCounts = {};
  for (const row of physical.terrain) {
    for (const tile of row) terrainCounts[tile.kind] = (terrainCounts[tile.kind] ?? 0) + 1;
  }
  assert.deepEqual(terrainCounts, { water: 87, grass: 303, forest: 56, rock: 10 });
  assert.equal(Object.keys(physical.roads).length, 8);

  const extension = addRoadLine(physical, V003_FIXED.roadHead, V003_FIXED.forestGate);
  assert.equal(extension.ok, true);
  assert.deepEqual(extension.cells, [
    { x: 13, y: 11 }, { x: 13, y: 10 }, { x: 13, y: 9 }, { x: 13, y: 8 },
  ]);
  assert.equal(extension.newCells.length, 3);
  const path = roadPath(physical, V003_FIXED.port.entrance, V003_FIXED.forestGate);
  assert.ok(path);
  assert.equal(path.every(({ x, y }) => hasRoad(physical, x, y)), true);
});

test("段5: 3x3占有を記録し重複・道路横断を拒否する", () => {
  const physical = createV003PhysicalState();
  addRoadLine(physical, V003_FIXED.roadHead, V003_FIXED.forestGate);
  const result = addBuilding(physical, "logger", 14, 6);
  assert.equal(result.ok, true, result.reason);
  const occupiedByLogger = Object.values(physical.occupied)
    .filter((buildingId) => buildingId === result.building.id);
  assert.equal(occupiedByLogger.length, 9);
  assert.equal(assertOccupancyInvariant(physical), true);

  const overlap = addBuilding(physical, "woodshop", 15, 7, { requireRoad: false });
  assert.equal(overlap.ok, false);
  assert.equal(overlap.reason, "building-overlap");
  const blockedRoad = addRoadLine(physical, { x: 13, y: 8 }, { x: 16, y: 8 });
  assert.equal(blockedRoad.ok, false);
  assert.equal(physical.occupied[keyOf(14, 8)], result.building.id);
  assert.equal(assertOccupancyInvariant(physical), true);
  assert.doesNotThrow(() => JSON.stringify(physical));
});

test("段6: input/output/storage/construction棚へ容量内で入出庫する", () => {
  const physical = createV003PhysicalState();
  addRoadLine(physical, V003_FIXED.roadHead, V003_FIXED.forestGate);
  const woodshop = addBuilding(physical, "woodshop", 14, 9).building;
  const warehouse = addBuilding(physical, "warehouse", 10, 8, { requireRoad: false }).building;

  assert.deepEqual(Object.keys(woodshop.inventory), [
    "input", "output", "storage", "construction", "inbound", "outbound",
  ]);
  depositInventory(woodshop, "input", "log", 12);
  depositInventory(woodshop, "output", "boards", 5);
  depositInventory(woodshop, "construction", "tools", 2);
  depositInventory(warehouse, "storage", "log", 8);
  assert.equal(withdrawInventory(woodshop, "input", "log", 5), 7);
  assert.equal(sectionAmount(woodshop, "input", "log"), 7);
  assert.equal(sectionAmount(woodshop, "output", "boards"), 5);
  assert.equal(sectionAmount(woodshop, "construction", "tools"), 2);
  assert.equal(sectionAmount(warehouse, "storage", "log"), 8);
  assert.equal(sectionCapacity(woodshop, "input", "log"), 26);
});

test("段6: 容量超過・在庫不足・運搬ジョブなしの棚跨ぎを拒否する", () => {
  const physical = createV003PhysicalState();
  addRoadLine(physical, V003_FIXED.roadHead, V003_FIXED.forestGate);
  const woodshop = addBuilding(physical, "woodshop", 14, 9).building;
  depositInventory(woodshop, "input", "log", 10);

  assert.throws(() => depositInventory(woodshop, "input", "log", 17), /棚容量超過/);
  assert.throws(() => withdrawInventory(woodshop, "input", "log", 11), /棚在庫不足/);
  assert.throws(
    () => moveInventoryBetweenSections(woodshop, "input", "output", "log", 1),
    /運搬ジョブが必要/,
  );
  assert.equal(sectionAmount(woodshop, "input", "log"), 10);
  assert.equal(sectionAmount(woodshop, "output", "log"), 0);
});

test("段7: pathLenは道・獣道・草・森・対角のコスト表に従う", () => {
  const terrain = [
    ["grass", "grass", "grass", "grass", "grass"],
    ["grass", "grass", "forest", "grass", "grass"],
    ["grass", "grass", "grass", "grass", "grass"],
  ].map((row) => row.map((kind) => ({ kind, variant: 0 })));
  const physical = createPhysicalState({ width: 5, height: 3, terrain });

  assert.equal(pathLen(physical, { x: 0, y: 1 }, { x: 1, y: 1 }, "walk"), 1);
  assert.equal(pathLen(physical, { x: 1, y: 1 }, { x: 2, y: 1 }, "walk"), 1.4);
  assert.equal(pathLen(physical, { x: 0, y: 0 }, { x: 1, y: 1 }, "walk"), 1.4);

  physical.trails[keyOf(1, 1)] = true;
  assert.equal(pathLen(physical, { x: 0, y: 1 }, { x: 1, y: 1 }, "walk"), 0.85);
  assert.equal(addRoadLine(physical, { x: 0, y: 1 }, { x: 1, y: 1 }).ok, true);
  assert.equal(pathLen(physical, { x: 0, y: 1 }, { x: 1, y: 1 }, "walk"), 0.6);
});

test("段7: cartは道路だけを通り非接続ならInfinityを返す", () => {
  const terrain = Array.from({ length: 3 }, () =>
    Array.from({ length: 5 }, () => ({ kind: "grass", variant: 0 })));
  const physical = createPhysicalState({ width: 5, height: 3, terrain });
  addRoadLine(physical, { x: 0, y: 1 }, { x: 2, y: 1 });

  assert.equal(pathLen(physical, { x: 0, y: 1 }, { x: 1, y: 1 }, "cart"), 0.6);
  assert.equal(pathLen(physical, { x: 0, y: 1 }, { x: 2, y: 1 }, "cart"), 1.2);
  assert.equal(pathLen(physical, { x: 0, y: 1 }, { x: 4, y: 1 }, "cart"), Infinity);
  assert.equal(pathLen(physical, { x: 0, y: 1 }, { x: 4, y: 1 }, "walk"), 3.2);
});

test("段8: 道路の追加・撤去直後にisConnectedの成分判定が変わる", () => {
  const terrain = Array.from({ length: 3 }, () =>
    Array.from({ length: 7 }, () => ({ kind: "grass", variant: 0 })));
  const physical = createPhysicalState({ width: 7, height: 3, terrain });
  const definitions = {
    home: { category: "production", w: 1, h: 1, caps: {} },
  };
  const homeA = addBuilding(physical, "home", 0, 0, {
    definitions, entrance: { x: 0, y: 1 }, requireRoad: false,
  }).building;
  const homeB = addBuilding(physical, "home", 2, 0, {
    definitions, entrance: { x: 2, y: 1 }, requireRoad: false,
  }).building;
  const homeC = addBuilding(physical, "home", 6, 0, {
    definitions, entrance: { x: 6, y: 1 }, requireRoad: false,
  }).building;
  addRoadLine(physical, { x: 0, y: 1 }, { x: 2, y: 1 });
  addRoadLine(physical, { x: 6, y: 1 }, { x: 6, y: 1 });

  assert.equal(isConnected(physical, homeA, homeB), true);
  assert.equal(isConnected(physical, homeA, homeC), false);
  const disconnectedRevision = physical.connectionCache.revision;

  addRoadLine(physical, { x: 2, y: 1 }, { x: 6, y: 1 });
  assert.ok(physical.roadRevision > disconnectedRevision);
  assert.equal(isConnected(physical, homeA, homeC), true);
  assert.equal(physical.connectionCache.revision, physical.roadRevision);

  assert.equal(removeRoadTile(physical, 4, 1), true);
  assert.equal(isConnected(physical, homeA, homeC), false);
  assert.equal(physical.connectionCache.revision, physical.roadRevision);
});

test("段9: 出発時に棚から引き輸送中cargoを経て到着時に確定する", () => {
  const physical = createV003PhysicalState();
  addRoadLine(physical, V003_FIXED.roadHead, V003_FIXED.forestGate);
  const logger = addBuilding(physical, "logger", 14, 6).building;
  const woodshop = addBuilding(physical, "woodshop", 14, 9).building;
  depositInventory(logger, "output", "log", 10);
  const before = materialSnapshot(physical);

  const job = createHaulJob(physical, {
    from: { building: logger, section: "output" },
    to: { building: woodshop, section: "input" },
    goods: "log",
    qty: 6,
    carrier: { id: "manual-1", mode: "manual", capacity: 8 },
  });
  assert.deepEqual(job.from, { buildingId: logger.id, section: "output" });
  assert.deepEqual(job.to, { buildingId: woodshop.id, section: "input" });
  assert.equal(sectionAmount(logger, "output", "log"), 4);
  assert.equal(sectionAmount(woodshop, "input", "log"), 0);
  assert.deepEqual(job.carrier.cargo, { goods: "log", qty: 6 });
  assertMaterialBalance({ before, after: materialSnapshot(physical), flows: {} });

  completeHaulJob(physical, job.id);
  assert.equal(sectionAmount(woodshop, "input", "log"), 6);
  assert.equal(job.carrier.cargo, null);
  assertMaterialBalance({ before, after: materialSnapshot(physical), flows: {} });
});

test("段9: キャリア消失時は最近傍建物所有の外置きへ荷を残す", () => {
  const physical = createV003PhysicalState();
  addRoadLine(physical, V003_FIXED.roadHead, V003_FIXED.forestGate);
  const logger = addBuilding(physical, "logger", 14, 6).building;
  const woodshop = addBuilding(physical, "woodshop", 14, 9).building;
  depositInventory(logger, "output", "log", 4);
  const before = materialSnapshot(physical);
  const job = createHaulJob(physical, {
    from: { building: logger, section: "output" },
    to: { building: woodshop, section: "input" },
    goods: "log",
    qty: 4,
    carrier: { id: "manual-2", mode: "manual", capacity: 8 },
  });

  const pile = loseHaulCarrier(physical, job.id, { x: 15, y: 7 });
  assert.equal(pile.ownerBuildingId, logger.id);
  assert.equal(pile.qty, 4);
  assert.equal(job.status, "carrier_lost");
  assert.equal(job.carrier.cargo, null);
  assertMaterialBalance({ before, after: materialSnapshot(physical), flows: {} });
});

function makeCarrierTestPhysical({ withRoad = false } = {}) {
  const terrain = Array.from({ length: 3 }, () =>
    Array.from({ length: 7 }, () => ({ kind: "grass", variant: 0 })));
  const physical = createPhysicalState({ width: 7, height: 3, terrain });
  const definitions = {
    depot: {
      category: "logistics", w: 1, h: 1,
      caps: { input: { log: 64 }, output: { log: 64 } },
    },
  };
  const source = addBuilding(physical, "depot", 0, 0, {
    definitions, entrance: { x: 0, y: 1 }, requireRoad: false,
  }).building;
  const target = addBuilding(physical, "depot", 6, 0, {
    definitions, entrance: { x: 6, y: 1 }, requireRoad: false,
  }).building;
  if (withRoad) addRoadLine(physical, source.entrance, target.entrance);
  return { physical, source, target };
}

test("段10: 徒歩は野歩きでき道路上では経路コストどおり速い", () => {
  const plain = makeCarrierTestPhysical();
  depositInventory(plain.source, "output", "log", 8);
  const plainBefore = materialSnapshot(plain.physical);
  const plainJob = createHaulJob(plain.physical, {
    from: { building: plain.source, section: "output" },
    to: { building: plain.target, section: "input" },
    goods: "log",
    qty: 8,
    carrier: createWalkCarrier(plain.physical, { people: 2 }),
  });
  assert.equal(plainJob.carrier.capacity, 8);
  for (let tick = 0; tick < 5; tick += 1) {
    stepHaulCarriers(plain.physical);
    assertMaterialBalance({ before: plainBefore, after: materialSnapshot(plain.physical), flows: {} });
  }
  assert.equal(plainJob.status, "in_transit");
  stepHaulCarriers(plain.physical);
  assert.equal(plainJob.status, "completed");

  const road = makeCarrierTestPhysical({ withRoad: true });
  depositInventory(road.source, "output", "log", 8);
  const roadJob = createHaulJob(road.physical, {
    from: { building: road.source, section: "output" },
    to: { building: road.target, section: "input" },
    goods: "log",
    qty: 8,
    carrier: createWalkCarrier(road.physical, { people: 2 }),
  });
  stepHaulCarriers(road.physical, 3);
  assert.equal(roadJob.status, "in_transit");
  stepHaulCarriers(road.physical);
  assert.equal(roadJob.status, "completed");
  assert.ok(road.physical.tick < plain.physical.tick);
});

test("段10: 荷車は容量16・道路限定で輸送中込み量保存を守る", () => {
  const { physical, source, target } = makeCarrierTestPhysical({ withRoad: true });
  depositInventory(source, "output", "log", 16);
  const before = materialSnapshot(physical);
  const job = createHaulJob(physical, {
    from: { building: source, section: "output" },
    to: { building: target, section: "input" },
    goods: "log",
    qty: 16,
    carrier: createCartCarrier(physical),
  });
  assert.equal(job.carrier.capacity, 16);
  assert.equal(job.carrier.path.every(({ x, y }) => hasRoad(physical, x, y)), true);

  while (job.status === "in_transit") {
    assert.equal(assertCarrierInvariants(physical), true);
    assertMaterialBalance({ before, after: materialSnapshot(physical), flows: {} });
    stepHaulCarriers(physical);
  }
  assert.equal(job.status, "completed");
  assert.equal(sectionAmount(target, "input", "log"), 16);
  assertMaterialBalance({ before, after: materialSnapshot(physical), flows: {} });

  const overCapacity = makeCarrierTestPhysical({ withRoad: true });
  depositInventory(overCapacity.source, "output", "log", 17);
  assert.throws(() => createHaulJob(overCapacity.physical, {
    from: { building: overCapacity.source, section: "output" },
    to: { building: overCapacity.target, section: "input" },
    goods: "log",
    qty: 17,
    carrier: createCartCarrier(overCapacity.physical),
  }), /キャリア容量超過/);
});

test("段10: 非接続の荷車を出発させず道路撤去も不変条件が検出する", () => {
  const disconnected = makeCarrierTestPhysical();
  addRoadLine(disconnected.physical, disconnected.source.entrance, disconnected.source.entrance);
  addRoadLine(disconnected.physical, disconnected.target.entrance, disconnected.target.entrance);
  depositInventory(disconnected.source, "output", "log", 4);
  assert.throws(() => createHaulJob(disconnected.physical, {
    from: { building: disconnected.source, section: "output" },
    to: { building: disconnected.target, section: "input" },
    goods: "log",
    qty: 4,
    carrier: createCartCarrier(disconnected.physical),
  }), /到達できる経路がありません/);
  assert.equal(sectionAmount(disconnected.source, "output", "log"), 4);

  const active = makeCarrierTestPhysical({ withRoad: true });
  depositInventory(active.source, "output", "log", 4);
  createHaulJob(active.physical, {
    from: { building: active.source, section: "output" },
    to: { building: active.target, section: "input" },
    goods: "log",
    qty: 4,
    carrier: createCartCarrier(active.physical),
  });
  removeRoadTile(active.physical, 3, 1);
  assert.throws(() => assertCarrierInvariants(active.physical), /道路外荷車/);
});

test("段10: world.stepは1日につき物理キャリアを30tick進める", () => {
  const world = createWorld({ seed: 11 });
  assert.equal(world.state.physical.tick, 0);
  world.step();
  assert.equal(world.state.day, 1);
  assert.equal(world.state.physical.tick, 30);
});

test("段11: P・GOODS・FOODS・PERISHがflow_island正本と同値", () => {
  assert.deepEqual(P, FLOW_ISLAND_P);
  assert.deepEqual(GOODS, FLOW_ISLAND_GOODS);
  assert.deepEqual(FOODS, FLOW_ISLAND_FOODS);
  assert.deepEqual(PERISH, FLOW_ISLAND_PERISH);
  assert.equal(createWorld({ seed: 11 }).state.economy.company.money, P.TREASURY0);
});

test("段11: 定数は入れ子を含め実行時に変更できない", () => {
  assert.equal(Object.isFrozen(P), true);
  assert.equal(Object.isFrozen(P.IMP), true);
  assert.throws(() => {
    P.IMP.wheat = 999;
  }, TypeError);
  assert.equal(P.IMP.wheat, FLOW_ISLAND_P.IMP.wheat);
});

test("段12: HH構造・家族生成・eat/haulがflow_islandと同値", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "fisher", x: 12, y: 7 });
  const source = new FlowIslandHousehold("fisher", 12, 7);

  assert.equal(household.id, source.id);
  assert.equal(household.sur, source.sur);
  assert.deepEqual(household.members, source.members);
  assert.equal(household.job, source.job);
  assert.equal(household.purse, source.purse);
  assert.deepEqual(household.pantry, source.pantry);
  assert.deepEqual(household.belief, source.belief);
  assert.equal(householdEat(household), source.eat());
  assert.equal(householdHaul(household), source.haul());
  assert.equal(householdMult(household), source.mult());
  assert.equal(householdClass(household), JOBCLS.fisher);
  assert.equal(economy.households[0], household);
  assert.doesNotThrow(() => JSON.stringify(economy));
  assert.equal(assertMoneyConservation(economy), true);
});

test("段12: 職業別開拓キットを移民持参として物資出納へ記帳する", () => {
  const cases = {
    saltworks: { tools: 5, wheat: 240, char: 15 },
    woodshop: { tools: 5, wheat: 240, log: 20 },
    fisher: { tools: 5, wheat: 240, salt: 4, char: 2 },
    veg: { tools: 5, wheat: 240, salt: 3 },
    fisher2: { tools: 5, wheat: 240, salt: 2 },
  };

  for (const [job, expectedKit] of Object.entries(cases)) {
    const economy = createEconomicState();
    const household = createHousehold(economy, { job, x: 1, y: 1 });
    for (const goods of GOODS) {
      assert.equal(household.pantry[goods], expectedKit[goods] ?? 0, `${job}/${goods}`);
    }
    assertMaterialBalance({
      before: { inventory: {}, cargo: {} },
      after: economicMaterialSnapshot(economy),
      flows: economy.materialFlows,
    });
    assert.equal(
      economy.materialLedger.every((entry) => entry.kind === "imp" && /開拓キット/.test(entry.reason)),
      true,
    );
  }
});

let failures = 0;
for (const { name, run } of tests) {
  try {
    await run();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`\n${tests.length} tests passed`);
}
