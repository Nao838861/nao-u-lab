import assert from "node:assert/strict";

import {
  FOODS,
  GOODS,
  JOBCLS,
  P,
  PERISH,
  ageMarketStalls,
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
  initializeNaturalResources,
  localWood,
  postCompanyLedger,
  productionCost,
  producePrimaryTick,
  quoteAskPrice,
  recordExternalMoneyFlow,
  regenerateForest,
  runHouseholdSurvival,
  runPrimaryProductionDay,
  runWheatHarvest,
  sellAtMarket,
  sellOffers,
  shouldPauseProduction,
  staplePrice,
} from "../src/econ.js";
import {
  FOODS as FLOW_ISLAND_FOODS,
  GOODS as FLOW_ISLAND_GOODS,
  P as FLOW_ISLAND_P,
  PERISH as FLOW_ISLAND_PERISH,
  HH as FlowIslandHousehold,
  stdTerrain as flowIslandStdTerrain,
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
  makeFlowIslandTerrain,
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

test("段13: 食事は保存食控えめ→生鮮2巡→保存食の3段で満たす", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "fisher", x: 1, y: 1 });
  household.members = household.members.slice(0, 4);
  for (const goods of GOODS) household.pantry[goods] = 0;
  household.pantry.pres = 2;
  household.pantry.fish = 1;
  household.pantry.veg = 1;
  household.pantry.meat = 1;

  runHouseholdSurvival(economy, { day: 1 });
  assert.ok(Math.abs(household.pantry.pres - 1) < 1e-9);
  assert.equal(household.pantry.fish, 0);
  assert.equal(household.pantry.veg, 0);
  assert.equal(household.pantry.meat, 0);
  assert.ok(Math.abs(economy.led.eat.pres - 1) < 1e-9);
  assert.equal(economy.led.eat.fish, 1);
  assert.equal(economy.led.eat.veg, 1);
  assert.equal(economy.led.eat.meat, 1);
  assert.equal(household.hungerRun, 0);
});

test("段13: 採集床0.75の後も不足すれば飢えが連続する", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 1, y: 1 });
  household.members = household.members.slice(0, 4);
  for (const goods of FOODS) household.pantry[goods] = 0;

  runHouseholdSurvival(economy, { day: 1 });
  assert.equal(household.hungerRun, 1);
  assert.equal(household.hunger, 1);
  assert.equal(economy.hungryN, 1);
  assert.equal(economy.famine, 1);
  assert.ok(Math.abs(economy.materialFlows.veg.prod - 0.9) < 1e-9);
});

test("段13: 飢え60日で死亡し人数2以下なら同日に離散・近所相続する", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 10, y: 10 });
  const heirs = [
    createHousehold(economy, { job: "veg", x: 11, y: 10 }),
    createHousehold(economy, { job: "fisher", x: 12, y: 10 }),
    createHousehold(economy, { job: "wheat", x: 13, y: 10 }),
    createHousehold(economy, { job: "woodshop", x: 30, y: 30 }),
  ];
  household.members = household.members.slice(0, 3);
  for (const goods of FOODS) household.pantry[goods] = 0;
  for (const heir of heirs) heir.pantry.wheat = 10_000;
  const pursesBefore = heirs.map((heir) => heir.purse);

  for (let day = 1; day <= 59; day += 1) runHouseholdSurvival(economy, { day });
  assert.equal(household.members.length, 3);
  assert.equal(economy.households.includes(household), true);
  runHouseholdSurvival(economy, { day: 60 });

  assert.equal(household.members.length, 2);
  assert.equal(economy.households.includes(household), false);
  assert.equal(economy.ruins.at(-1).formerHouseholdId, household.id);
  assert.equal(heirs[0].purse, pursesBefore[0] + 20);
  assert.equal(heirs[1].purse, pursesBefore[1] + 20);
  assert.equal(heirs[2].purse, pursesBefore[2] + 20);
  assert.equal(heirs[3].purse, pursesBefore[3]);
  assert.equal(assertMoneyConservation(economy), true);
  assert.match(economy.events.at(-1)[1], /離散/);
});

test("段14: flow_island標準地形を同値生成し森をタイル資源化する", () => {
  const physical = createPhysicalState({
    width: 48,
    height: 40,
    terrain: makeFlowIslandTerrain(),
  });
  assert.deepEqual(
    physical.terrain.map((row) => row.map((tile) => tile.kind)),
    flowIslandStdTerrain(),
  );

  const economy = createEconomicState();
  initializeNaturalResources(economy, physical);
  const forestTiles = physical.terrain.flat().filter((tile) => tile.kind === "forest").length;
  assert.equal(Object.keys(economy.natural.wood).length, forestTiles);
  assert.equal(Object.values(economy.natural.wood).every((stock) => stock === P.WOOD0), true);
});

test("段14: 漁は冬1/4・菜園は月3〜10のみ・牧畜は肉と布を生産する", () => {
  const makeProducer = (job) => {
    const physical = createPhysicalState({
      width: 48,
      height: 40,
      terrain: makeFlowIslandTerrain(),
    });
    const economy = createEconomicState();
    initializeNaturalResources(economy, physical);
    const household = createHousehold(economy, { job, x: 25, y: 32 });
    return { economy, household, physical };
  };

  const summerFisher = makeProducer("fisher");
  producePrimaryTick(summerFisher.economy, summerFisher.physical, summerFisher.household, {
    day: 61,
    fraction: 1,
  });
  assert.equal(summerFisher.household.pantry.fish, P.Y_FISH);

  const winterFisher = makeProducer("fisher");
  producePrimaryTick(winterFisher.economy, winterFisher.physical, winterFisher.household, {
    day: 271,
    fraction: 1,
  });
  assert.equal(winterFisher.household.pantry.fish, P.Y_FISH_W);
  assert.equal(winterFisher.household.pantry.fish / summerFisher.household.pantry.fish, 0.25);

  const gardener = makeProducer("veg");
  producePrimaryTick(gardener.economy, gardener.physical, gardener.household, { day: 31, fraction: 1 });
  assert.equal(gardener.household.pantry.veg, 0);
  producePrimaryTick(gardener.economy, gardener.physical, gardener.household, { day: 61, fraction: 1 });
  assert.equal(gardener.household.pantry.veg, P.Y_VEG);
  producePrimaryTick(gardener.economy, gardener.physical, gardener.household, { day: 301, fraction: 1 });
  assert.equal(gardener.household.pantry.veg, P.Y_VEG);

  const shepherd = makeProducer("shepherd");
  producePrimaryTick(shepherd.economy, shepherd.physical, shepherd.household, { day: 1, fraction: 1 });
  assert.equal(shepherd.household.pantry.meat, P.Y_MEAT);
  assert.equal(shepherd.household.pantry.cloth, P.Y_CLOTH);
});

test("段14: 木こりは択伐し不足時だけ皆伐して禿山を作る", () => {
  const terrain = Array.from({ length: 5 }, () => (
    Array.from({ length: 5 }, () => ({ kind: "grass", variant: 0 }))
  ));
  terrain[2][2].kind = "forest";
  const physical = createPhysicalState({ width: 5, height: 5, terrain });
  const economy = createEconomicState();
  initializeNaturalResources(economy, physical);
  const logger = createHousehold(economy, { job: "logger", x: 2, y: 2 });

  producePrimaryTick(economy, physical, logger, { day: 1, fraction: 1 });
  assert.equal(logger.pantry.log, P.Y_LOG);
  assert.equal(economy.natural.wood["2,2"], P.WOOD0 - P.Y_LOG);
  assert.equal(physical.terrain[2][2].kind, "forest");
  assert.ok(localWood(economy, physical, logger) > 0);

  logger.pantry.log = 0;
  economy.natural.wood["2,2"] = 10;
  producePrimaryTick(economy, physical, logger, { day: 2, fraction: 1 });
  assert.equal(logger.pantry.log, 10);
  assert.equal(economy.natural.wood["2,2"], 0);
  assert.equal(physical.terrain[2][2].kind, "bald");
  assert.match(economy.events.at(-1)[1], /森が禿げた/);
});

test("段14: 森は5日ごとに成長し隣接する森から禿山へ再生する", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 3 }, () => ({ kind: "grass", variant: 0 }))
  ));
  terrain[1][0].kind = "forest";
  terrain[1][1].kind = "bald";
  terrain[1][2].kind = "forest";
  const physical = createPhysicalState({ width: 3, height: 3, terrain });
  const economy = createEconomicState();
  initializeNaturalResources(economy, physical);
  economy.natural.wood["0,1"] = 100;

  regenerateForest(economy, physical, { day: 5, random: () => 1 });
  assert.equal(economy.natural.wood["0,1"], 100 + P.WOOD_R * 5);
  regenerateForest(economy, physical, { day: 30, random: () => 0 });
  assert.equal(physical.terrain[1][1].kind, "forest");
  assert.equal(economy.natural.wood["1,1"], P.WOOD0 * 0.25);
});

test("段15: 麦はd255に年1回だけwheatWorkと施肥率から収穫する", () => {
  const physical = createPhysicalState();
  const economy = createEconomicState();
  const farmer = createHousehold(economy, { job: "wheat", x: 4, y: 4 });
  farmer.pantry.meal = P.FERT_NEED * 180;
  const wheatBefore = farmer.pantry.wheat;

  for (let day = 1; day <= 254; day += 1) {
    runPrimaryProductionDay(economy, physical, { day });
    assert.deepEqual(runWheatHarvest(economy, { day }), []);
  }
  assert.equal(farmer.pantry.wheat, wheatBefore);
  assert.equal(farmer.jobCycleDone, false);

  runPrimaryProductionDay(economy, physical, { day: 255 });
  const harvest = runWheatHarvest(economy, { day: 255 });
  const expected = P.Y_WHEAT * (255 / 300) * (1 + P.FERT_BOOST);
  assert.equal(harvest.length, 1);
  assert.ok(Math.abs(harvest[0].qty - expected) < 1e-8);
  assert.ok(Math.abs(farmer.pantry.wheat - wheatBefore - expected) < 1e-8);
  assert.equal(farmer.wheatWork, 0);
  assert.equal(farmer.fert, 0);
  assert.equal(farmer.jobCycleDone, true);

  producePrimaryTick(economy, physical, farmer, { day: 256, fraction: 1 });
  assert.equal(farmer.wheatWork, 0);
});

test("段15: pantryと自分の屋台が日産10日分を超えると生産を休む", () => {
  const physical = createPhysicalState();
  const economy = createEconomicState();
  const shepherd = createHousehold(economy, { job: "shepherd", x: 4, y: 4 });
  const tenDays = P.Y_MEAT * householdMult(shepherd) * 10;

  shepherd.pantry.meat = tenDays;
  assert.equal(shouldPauseProduction(economy, shepherd), false);
  shepherd.pantry.meat += 1e-6;
  assert.equal(shouldPauseProduction(economy, shepherd), true);
  const clothBefore = shepherd.pantry.cloth;
  producePrimaryTick(economy, physical, shepherd, { day: 1, fraction: 1 });
  assert.equal(shepherd.pantry.cloth, clothBefore);

  shepherd.pantry.meat = 0;
  economy.stalls.meat.push({
    householdId: shepherd.id,
    qty: tenDays + 1e-6,
    price: 1,
    age: 0,
  });
  assert.equal(shouldPauseProduction(economy, shepherd), true);
});

test("段16: staple床1.0を保ちaskは必ず原価以上になる", () => {
  const economy = createEconomicState();
  economy.px.wheat = 0.2;
  economy.px.veg = 0.4;
  economy.px.pres = 0.8;
  assert.equal(staplePrice(economy), 1);

  const logger = createHousehold(economy, { job: "logger", x: 2, y: 2 });
  const cost = productionCost(economy, null, logger, "log", { day: 1 });
  for (const goods of ["log", "wheat"]) {
    for (const randomValue of [0, 0.25, 0.999999]) {
      const ask = quoteAskPrice(cost, goods, () => randomValue);
      assert.ok(ask >= cost * 1.05);
    }
  }
});

test("段16: sellOffersは職業別keepと重量上限を守る", () => {
  const economy = createEconomicState();
  const logger = createHousehold(economy, { job: "logger", x: 2, y: 2 });
  logger.pantry.log = 100;
  const loggerOffers = sellOffers(economy, logger);
  assert.equal(loggerOffers.log, householdHaul(logger) / 2);

  const farmer = createHousehold(economy, { job: "wheat", x: 3, y: 2 });
  farmer.pantry.wheat = 1_000;
  const keep = householdEat(farmer) * P.RATION * 10;
  const surplus = farmer.pantry.wheat - keep;
  assert.equal(
    sellOffers(economy, farmer).wheat,
    Math.min(surplus * 0.1 + 2, surplus, householdHaul(farmer)),
  );
});

test("段16: 石畳買付台は原価を割らない石だけを直接買い上げる", () => {
  const economy = createEconomicState();
  economy.paving = true;
  const quarryman = createHousehold(economy, { job: "quarryman", x: 2, y: 2 });
  quarryman.pantry.stone = 100;
  const offered = sellOffers(economy, quarryman).stone;
  const purseBefore = quarryman.purse;

  const result = sellAtMarket(economy, null, quarryman, { day: 1, random: () => 0 });
  assert.equal(result.listed.length, 0);
  assert.equal(economy.paveBought, offered);
  assert.equal(quarryman.pantry.stone, 100 - offered);
  assert.equal(quarryman.purse, purseBefore + offered * 1.4);
  assert.equal(economy.materialFlows.stone.cons, offered);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段16: 屋台在庫はJSON化でき6日売れなければ持ち主へ戻る", () => {
  const economy = createEconomicState();
  const artisan = createHousehold(economy, { job: "woodshop", x: 2, y: 2 });
  artisan.pantry.tools = 100;
  const before = economicMaterialSnapshot(economy);
  const cost = productionCost(economy, null, artisan, "tools", { day: 1 });
  const result = sellAtMarket(economy, null, artisan, { day: 1, random: () => 0 });

  assert.equal(result.listed.length, 1);
  assert.equal(result.listed[0].goods, "tools");
  assert.ok(result.listed[0].price >= cost * 1.05);
  assert.deepEqual(economicMaterialSnapshot(economy), before);
  assert.doesNotThrow(() => JSON.stringify(economy));

  for (let day = 2; day <= 7; day += 1) ageMarketStalls(economy, { day });
  assert.equal(economy.stalls.tools.length, 0);
  assert.equal(artisan.pantry.tools, 100);
  assert.deepEqual(economicMaterialSnapshot(economy), before);
});

test("段16: 輸出財は屋台3日目にEXP上限まで本土へ流す", () => {
  const economy = createEconomicState();
  const fisher = createHousehold(economy, { job: "fisher", x: 2, y: 2 });
  fisher.pantry.pres = 100;
  const sale = sellAtMarket(economy, null, fisher, { day: 61, random: () => 0 });
  assert.equal(sale.listed[0].goods, "pres");
  const listedQty = sale.listed[0].qty;
  const purseBefore = fisher.purse;

  ageMarketStalls(economy, { day: 62 });
  ageMarketStalls(economy, { day: 63 });
  assert.equal(economy.exported.pres, undefined);
  ageMarketStalls(economy, { day: 64 });

  const exported = Math.min(listedQty, P.EXP_CAP.pres);
  assert.equal(economy.exported.pres, exported);
  assert.equal(fisher.purse, purseBefore + exported * P.EXP.pres);
  assert.equal(economy.materialFlows.pres.exp, exported);
  assert.equal(assertMoneyConservation(economy), true);
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
