import assert from "node:assert/strict";

import {
  BUY_ORDER,
  DAY_END_ORDER,
  FOODS,
  GOODS,
  JOBCLS,
  JOBS,
  LADDER,
  P,
  PERISH,
  ageMarketStalls,
  assignNeedyWork,
  assertCompanyLedger,
  assertMoneyConservation,
  buyAtMarket,
  buyTargets,
  companyCreditLimit,
  companyLogisticsSite,
  companyStockReleasePrice,
  completeAssignedWork,
  createEconomicState,
  createHousehold,
  createCompanyState,
  economicMaterialSnapshot,
  fillSettlementZones,
  fundSettlementZone,
  householdClass,
  householdEat,
  householdFoodDays,
  householdHaul,
  householdMult,
  initializeNaturalResources,
  isNeedyHousehold,
  jobSelectionWeights,
  laborWage,
  localWood,
  marketPathLength,
  marketTripCost,
  marketTripDuration,
  postCompanyLedger,
  productionCost,
  productionMultiplierForTrip,
  productionInputAmount,
  producePrimaryTick,
  quoteAskPrice,
  requestCompanyStockRelease,
  recordExternalMoneyFlow,
  regenerateForest,
  runCompanyDayStart,
  runCompanyFinance,
  runCompanyProcurement,
  runBirthPhase,
  runDayEnd,
  runHouseholdSurvival,
  runPrimaryProductionDay,
  runPopulationDynamicsPhase,
  runWheatHarvest,
  sellAtMarket,
  sellOffers,
  setCompanyStockTarget,
  settleCompanyLogistics,
  shouldPauseProduction,
  staplePrice,
  unloadMarketBuyCargo,
} from "../src/econ.js";
import {
  FOODS as FLOW_ISLAND_FOODS,
  GOODS as FLOW_ISLAND_GOODS,
  P as FLOW_ISLAND_P,
  PERISH as FLOW_ISLAND_PERISH,
  LADDER as FLOW_ISLAND_LADDER,
  HH as FlowIslandHousehold,
  World as FlowIslandWorld,
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
  planRoadWorksite,
  recordMaterialFlow,
  removeRoadTile,
  roadPath,
  sectionAmount,
  sectionCapacity,
  stepHaulCarriers,
  withdrawInventory,
  workRoadWorksite,
} from "../src/physical.js";
import {
  beginMarketTrip,
  createWorld,
  ensureCompanyLogisticsSites,
  ensureHouseholdInputSites,
  stepMarketTrip,
} from "../src/world.js";
import { runFlowIslandAudit } from "../src/audit.js";

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

test("段11: P・GOODS・FOODS・PERISHが意図した移動係数以外flow_island正本と同値", () => {
  const sourceConstants = structuredClone(FLOW_ISLAND_P);
  delete sourceConstants.TRAVEL_RATE;
  delete sourceConstants.ROAD_F;
  delete sourceConstants.TRAVEL_MAX;
  assert.deepEqual(P, sourceConstants);
  assert.equal("TRAVEL_RATE" in P, false);
  assert.equal("ROAD_F" in P, false);
  assert.equal("TRAVEL_MAX" in P, false);
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

test("段17: buyTargets天井表・LADDER・固定買い順を正本どおり保持する", () => {
  assert.deepEqual(LADDER, FLOW_ISLAND_LADDER);
  assert.deepEqual(BUY_ORDER, [
    "log", "salt", "char", "tools", "cloth", "iron", "meal",
    "stone", "oil", "fish", "veg", "wheat", "pres", "meat",
  ]);
  assert.equal(BUY_ORDER.includes("pick"), false);

  const economy = createEconomicState();
  const starving = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  for (const goods of FOODS) starving.pantry[goods] = 0;
  const starvingTargets = buyTargets(economy, starving, { day: 1 });
  for (const goods of ["veg", "wheat", "pres", "pick"]) {
    assert.deepEqual(starvingTargets[goods], [P.PANTRY_FOOD_D * P.EAT / 4, 99]);
  }
  assert.ok(starvingTargets.fish[1] < 99);

  const woodshop = createHousehold(economy, { job: "woodshop", x: 0, y: 0 });
  woodshop.pantry.log = 0;
  assert.deepEqual(
    buyTargets(economy, woodshop, { day: 1 }).log,
    [P.LOG_TOOL * 16, Math.max(0.9, economy.px.tools / P.LOG_TOOL * 0.6)],
  );

  const farmer = createHousehold(economy, { job: "wheat", x: 0, y: 0 });
  farmer.lv = 4;
  assert.equal(buyTargets(economy, farmer, { day: 1 }).iron[1], 5);

  const compareWithSource = (household, day) => {
    const sourceWorld = new FlowIslandWorld(11);
    sourceWorld.day = day;
    sourceWorld.market = { ...economy.market };
    sourceWorld.px = { ...economy.px };
    const sourceHousehold = new FlowIslandHousehold(household.job, household.x, household.y);
    sourceHousehold.pantry = structuredClone(household.pantry);
    sourceHousehold.lv = household.lv;
    assert.deepEqual(
      buyTargets(economy, household, { day }),
      sourceWorld.buyTargets(sourceHousehold),
    );
  };
  compareWithSource(starving, 1);
  compareWithSource(woodshop, 1);
  compareWithSource(farmer, 1);
});

test("段17: 固定買い順は生産入力logを食料wheatより先に約定する", () => {
  const economy = createEconomicState();
  const logSeller = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  const wheatSeller = createHousehold(economy, { job: "wheat", x: 0, y: 0 });
  const buyer = createHousehold(economy, { job: "woodshop", x: 0, y: 0 });
  for (const goods of FOODS) buyer.pantry[goods] = 0;
  buyer.pantry.log = 0;
  logSeller.pantry.log = 30;
  wheatSeller.pantry.wheat = 30;
  logSeller.pantry.log -= 30;
  wheatSeller.pantry.wheat -= 30;
  economy.stalls.log.push({ householdId: logSeller.id, qty: 30, price: 0.5, age: 0 });
  economy.stalls.wheat.push({ householdId: wheatSeller.id, qty: 30, price: 2, age: 0 });

  const result = buyAtMarket(economy, buyer, { day: 1 });
  assert.equal(result.transactions[0].goods, "log");
  assert.equal(result.transactions.some((transaction) => transaction.goods === "wheat"), true);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段17: 屋台約定はpxをEMA更新し売り手から4%口銭を会社へ移す", () => {
  const economy = createEconomicState();
  const seller = createHousehold(economy, { job: "wheat", x: 0, y: 0 });
  const buyer = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  for (const goods of FOODS) buyer.pantry[goods] = 0;
  seller.pantry.wheat -= 20;
  economy.stalls.wheat.push({ householdId: seller.id, qty: 20, price: 2, age: 0 });
  const before = economicMaterialSnapshot(economy);
  const sellerPurse = seller.purse;
  const buyerPurse = buyer.purse;

  const result = buyAtMarket(economy, buyer, { day: 1 });
  const transaction = result.transactions.find((entry) => entry.goods === "wheat");
  const payment = transaction.qty * transaction.price;
  const fee = payment * P.FEE;
  assert.equal(transaction.qty, P.PANTRY_FOOD_D * P.EAT / 4);
  assert.equal(buyer.purse, buyerPurse - payment);
  assert.equal(seller.purse, sellerPurse + payment - fee);
  assert.equal(economy.co.fee, fee);
  assert.ok(Math.abs(economy.px.wheat - (P.BELIEF0.wheat * 0.9 + 2 * 0.1)) < 1e-12);
  assert.deepEqual(economy.prices.wheat, [[1, 2, transaction.qty]]);
  assert.deepEqual(economicMaterialSnapshot(economy), before);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段17: CO輸入棚は生産入力だけ財布-30まで信用買いできる", () => {
  const economy = createEconomicState();
  const fisher = createHousehold(economy, { job: "fisher", x: 0, y: 0 });
  for (const goods of FOODS) fisher.pantry[goods] = 100;
  fisher.pantry.salt = 0;
  economy.px.pres = 5;
  postCompanyLedger(economy.company, { day: 1, amount: fisher.purse, reason: "信用テストの財布預入" });
  fisher.purse = 0;

  const result = buyAtMarket(economy, fisher, { day: 61 });
  const salt = result.transactions.find((transaction) => transaction.goods === "salt");
  assert.deepEqual(salt, { goods: "salt", qty: 6, price: P.IMP.salt, source: "CO" });
  assert.equal(fisher.purse, -30);
  assert.equal(economy.imported.salt, 6);
  assert.equal(economy.co.impMargin, 6 * (P.IMP.salt - P.IMP_COST.salt));
  assert.equal(economy.moneyBoundary.out, 6 * P.IMP_COST.salt);
  assert.equal(economy.materialFlows.salt.imp, 10);
  assert.equal(economy.px.salt, P.BELIEF0.salt * 0.9 + P.IMP.salt * 0.1);
  assert.equal(assertMoneyConservation(economy), true);

  const noCreditEconomy = createEconomicState();
  const logger = createHousehold(noCreditEconomy, { job: "logger", x: 0, y: 0 });
  for (const goods of FOODS) logger.pantry[goods] = 0;
  postCompanyLedger(noCreditEconomy.company, {
    day: 1,
    amount: logger.purse,
    reason: "非入力信用テストの財布預入",
  });
  logger.purse = 0;
  const noCredit = buyAtMarket(noCreditEconomy, logger, { day: 1 });
  assert.equal(noCredit.transactions.some((transaction) => transaction.goods === "wheat"), false);
  assert.equal(logger.purse, 0);
});

test("段18: 飢えた世帯だけが高値の主食を買い食料pxを上げる", () => {
  const run = (foodQty) => {
    const economy = createEconomicState();
    const seller = createHousehold(economy, { job: "wheat", x: 0, y: 0 });
    const buyer = createHousehold(economy, { job: "logger", x: 0, y: 0 });
    for (const goods of FOODS) buyer.pantry[goods] = 0;
    buyer.pantry.veg = foodQty;
    seller.pantry.wheat -= 30;
    economy.stalls.wheat.push({ householdId: seller.id, qty: 30, price: 2, age: 0 });
    const before = economy.px.wheat;
    const result = buyAtMarket(economy, buyer, { day: 1 });
    return { before, economy, result };
  };

  const starving = run(0);
  const merelyLow = run(P.EAT * 2);
  assert.ok(starving.economy.px.wheat > starving.before);
  assert.equal(merelyLow.economy.px.wheat, merelyLow.before);
  assert.equal(starving.result.transactions.some((transaction) => transaction.goods === "wheat"), true);
  assert.equal(merelyLow.result.transactions.some((transaction) => transaction.goods === "wheat"), false);
});

test("段18: 豊漁の安い魚が約定するとfish pxが下がる", () => {
  const economy = createEconomicState();
  const fisher = createHousehold(economy, { job: "fisher", x: 0, y: 0 });
  const buyer = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  for (let day = 61; day <= 65; day += 1) {
    producePrimaryTick(economy, null, fisher, { day, fraction: 1 });
  }
  sellAtMarket(economy, null, fisher, { day: 65, random: () => 0 });
  for (const goods of FOODS) buyer.pantry[goods] = 100;
  const before = economy.px.fish;

  const result = buyAtMarket(economy, buyer, { day: 65 });
  assert.equal(result.transactions.some((transaction) => transaction.goods === "fish"), true);
  assert.ok(economy.px.fish < before);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段18: 丸太市況の上昇が道具原価・ask・tools pxへ順に伝播する", () => {
  const run = (logPrice) => {
    const economy = createEconomicState();
    economy.px.log = logPrice;
    const seller = createHousehold(economy, { job: "woodshop", x: 0, y: 0 });
    const buyer = createHousehold(economy, { job: "logger", x: 0, y: 0 });
    seller.pantry.tools = 100;
    buyer.lv = 1;
    for (const goods of FOODS) buyer.pantry[goods] = 100;
    buyer.pantry.tools = 0;
    const cost = productionCost(economy, null, seller, "tools", { day: 1 });
    const sale = sellAtMarket(economy, null, seller, { day: 1, random: () => 0 });
    const ask = sale.listed.find((stall) => stall.goods === "tools").price;
    const bought = buyAtMarket(economy, buyer, { day: 1 });
    assert.equal(bought.transactions.some((transaction) => transaction.goods === "tools"), true);
    return { ask, cost, px: economy.px.tools };
  };

  const low = run(0.1);
  const high = run(0.6);
  assert.ok(high.cost > low.cost);
  assert.ok(high.ask > low.ask);
  assert.ok(high.px > low.px);
});

test("段19: 木工・炭焼・製塩・菜種・採石・魚粉を正本量で変換する", () => {
  const make = (job) => {
    const economy = createEconomicState();
    const household = createHousehold(economy, { job, x: 0, y: 0 });
    return { economy, household };
  };

  const woodshop = make("woodshop");
  woodshop.household.pantry.log = 100;
  woodshop.household.pantry.tools = 0;
  producePrimaryTick(woodshop.economy, null, woodshop.household, { day: 1, fraction: 1 });
  assert.equal(woodshop.household.pantry.tools, P.Y_TOOLS);
  assert.equal(woodshop.household.pantry.log, 100 - P.Y_TOOLS * P.LOG_TOOL);

  const charburner = make("charburner");
  charburner.household.pantry.log = 100;
  charburner.household.pantry.char = 0;
  producePrimaryTick(charburner.economy, null, charburner.household, { day: 1, fraction: 1 });
  assert.equal(charburner.household.pantry.char, P.Y_CHAR);
  assert.equal(charburner.household.pantry.log, 100 - P.Y_CHAR * P.LOG_CHAR);

  const saltworks = make("saltworks");
  saltworks.household.pantry.char = 10;
  saltworks.household.pantry.salt = 0;
  producePrimaryTick(saltworks.economy, null, saltworks.household, { day: 1, fraction: 1 });
  assert.equal(saltworks.household.pantry.salt, P.Y_SALT);
  assert.equal(saltworks.household.pantry.char, 10 - P.SALT_CHAR);

  const rapeseed = make("rapeseed");
  rapeseed.household.pantry.meal = 10;
  rapeseed.household.pantry.oil = 0;
  const rapeseedResult = producePrimaryTick(rapeseed.economy, null, rapeseed.household, {
    day: 61,
    fraction: 1,
  });
  const fill = P.FERT_NEED / (P.FERT_NEED * 30);
  assert.equal(rapeseed.household.pantry.meal, 10 - P.FERT_NEED);
  assert.ok(Math.abs(rapeseedResult.oil - P.Y_OIL * (1 + P.FERT_BOOST * fill)) < 1e-12);

  const quarryman = make("quarryman");
  quarryman.household.pantry.stone = 0;
  producePrimaryTick(quarryman.economy, null, quarryman.household, { day: 1, fraction: 1 });
  assert.equal(quarryman.household.pantry.stone, P.Y_STONE);

  const fishmeal = make("fisher2");
  fishmeal.household.pantry.meal = 0;
  producePrimaryTick(fishmeal.economy, null, fishmeal.household, { day: 61, fraction: 1 });
  assert.equal(fishmeal.household.pantry.meal, P.Y_FISH / P.MEAL_FISH);
  const winterMeal = make("fisher2");
  winterMeal.household.pantry.meal = 0;
  producePrimaryTick(winterMeal.economy, null, winterMeal.household, { day: 271, fraction: 1 });
  assert.equal(winterMeal.household.pantry.meal, 0);
});

test("段19: 各変換職のcostは生計費と正本の原料pxを連鎖する", () => {
  const cases = [
    { job: "woodshop", goods: "tools", day: 1, yield: P.Y_TOOLS, input: (px) => P.LOG_TOOL * px.log },
    { job: "charburner", goods: "char", day: 1, yield: P.Y_CHAR, input: (px) => P.LOG_CHAR * px.log },
    { job: "saltworks", goods: "salt", day: 1, yield: P.Y_SALT, input: (px) => P.SALT_CHAR / P.Y_SALT * px.char },
    { job: "rapeseed", goods: "oil", day: 61, yield: P.Y_OIL, input: () => 0 },
    { job: "quarryman", goods: "stone", day: 1, yield: P.Y_STONE, input: () => 0 },
    { job: "fisher2", goods: "meal", day: 61, yield: P.Y_FISH / P.MEAL_FISH, input: () => 0 },
  ];

  for (const entry of cases) {
    const economy = createEconomicState();
    economy.px.log = 2;
    economy.px.char = 3;
    const household = createHousehold(economy, { job: entry.job, x: 0, y: 0 });
    const labor = householdEat(household) * staplePrice(economy)
      / (entry.yield * householdMult(household));
    const expected = labor + entry.input(economy.px);
    const actual = productionCost(economy, null, household, entry.goods, { day: entry.day });
    assert.ok(Math.abs(actual - expected) < 1e-12, `${entry.job}/${entry.goods}`);

    const sourceWorld = new FlowIslandWorld(11);
    sourceWorld.day = entry.day;
    sourceWorld.px = { ...economy.px };
    const sourceHousehold = new FlowIslandHousehold(entry.job, 0, 0);
    assert.ok(Math.abs(actual - sourceWorld.cost(sourceHousehold, entry.goods)) < 1e-12);
  }
});

test("段20: needyは財布が人数×0.8未満かつ食料4日未満で賃金は食い扶持", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  for (const goods of FOODS) household.pantry[goods] = 0;
  household.purse = householdEat(household) * 0.8 - 1e-9;
  assert.equal(householdFoodDays(household), 0);
  assert.equal(isNeedyHousehold(household), true);
  household.purse = householdEat(household) * 0.8;
  assert.equal(isNeedyHousehold(household), false);
  household.purse = 0;
  household.pantry.wheat = P.EAT * 4;
  assert.equal(isNeedyHousehold(household), false);

  economy.px.wheat = 2;
  economy.px.veg = 3;
  economy.px.pres = 4;
  assert.equal(laborWage(economy, household), householdEat(household) * 2);
});

test("段20: needyは民間雇用より公共の道普請を優先し会社から全賃金を得る", () => {
  const terrain = Array.from({ length: 5 }, () => (
    Array.from({ length: 5 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 5, height: 5, terrain });
  const worksite = planRoadWorksite(physical, 2, 2, { workRequired: P.ROAD_WORK });
  const economy = createEconomicState();
  const worker = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  createHousehold(economy, { job: "shepherd", x: 1, y: 0 });
  for (const goods of FOODS) worker.pantry[goods] = 0;
  postCompanyLedger(economy.company, { day: 1, amount: worker.purse, reason: "普請前の財布預入" });
  worker.purse = 0;
  const wage = laborWage(economy, worker);
  const companyBefore = economy.company.money;

  assert.deepEqual(assignNeedyWork(economy, physical, worker), {
    kind: "public",
    worksiteId: worksite.id,
    x: 2,
    y: 2,
  });
  const result = completeAssignedWork(economy, physical, worker, { day: 1 });
  assert.deepEqual(result, { worked: true, kind: "public", paid: wage, completed: false });
  assert.equal(worker.purse, wage);
  assert.equal(economy.company.money, companyBefore - wage);
  assert.equal(economy.co.pub, wage);
  assert.equal(physical.roadWorksites[0].left, P.ROAD_WORK - 1);
  assert.equal(worker.state, "toMarket");
  assert.equal(assertMoneyConservation(economy), true);

  const revision = physical.roadRevision;
  assert.equal(workRoadWorksite(physical, worksite.id).completed, false);
  assert.equal(workRoadWorksite(physical, worksite.id).completed, true);
  assert.equal(hasRoad(physical, 2, 2), true);
  assert.equal(physical.roadRevision, revision + 1);
});

test("段20: 民間日傭は雇主から全賃金を受け翌日生産を1.4倍にする", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 3 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 3, height: 3, terrain });
  const economy = createEconomicState();
  const worker = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  const employer = createHousehold(economy, { job: "shepherd", x: 1, y: 0 });
  for (const goods of FOODS) worker.pantry[goods] = 0;
  postCompanyLedger(economy.company, { day: 1, amount: worker.purse, reason: "日傭前の財布預入" });
  worker.purse = 0;
  const wage = laborWage(economy, worker);
  const employerPurse = employer.purse;

  assert.deepEqual(assignNeedyWork(economy, physical, worker), {
    kind: "private",
    employerId: employer.id,
    x: employer.x,
    y: employer.y,
  });
  assert.equal(employer.workerId, worker.id);
  const result = completeAssignedWork(economy, physical, worker, { day: 1 });
  assert.deepEqual(result, { worked: true, kind: "private", paid: wage, completed: false });
  assert.equal(worker.purse, wage);
  assert.equal(employer.purse, employerPurse - wage);
  assert.equal(employer.workerId, null);
  assert.equal(employer.boost, 1.4);
  assert.equal(assertMoneyConservation(economy), true);

  employer.pantry.meat = 0;
  employer.pantry.cloth = 0;
  producePrimaryTick(economy, physical, employer, {
    day: 2,
    fraction: 1,
    endOfDay: true,
  });
  assert.ok(Math.abs(employer.pantry.meat - P.Y_MEAT * 1.4) < 1e-12);
  assert.ok(Math.abs(employer.pantry.cloth - P.Y_CLOTH * 1.4) < 1e-12);
  assert.equal(employer.boost, null);
});

test("段21: dayEndの全フェーズ順を固定し実行traceで検査する", () => {
  const expected = [
    "company_procurement",
    "wheat_harvest",
    "food",
    "death",
    "culture",
    "ladder",
    "paving",
    "birth",
    "population_dynamics",
    "company_finance",
    "forest_regeneration",
    "flow_ema",
    "money_conservation",
  ];
  assert.deepEqual(DAY_END_ORDER, expected);
  assert.equal(Object.isFrozen(DAY_END_ORDER), true);

  const economy = createEconomicState();
  const result = runDayEnd(economy, null, { day: 1, random: () => 1 });
  assert.deepEqual(result.trace, expected);
});

test("段21: d255は会社買上げ後に麦を収穫し、その麦で食事してから文化・ラダーへ進む", () => {
  const economy = createEconomicState();
  const farmer = createHousehold(economy, { job: "wheat", x: 0, y: 0 });
  for (const goods of FOODS) farmer.pantry[goods] = 0;
  farmer.wheatWork = 300;
  farmer.up = P.UP_DAYS - 1;

  const result = runDayEnd(economy, null, { day: 255, random: () => 1 });
  assert.equal(result.harvests.length, 1);
  assert.equal(result.harvests[0].qty, P.Y_WHEAT);
  assert.equal(economy.hungryN, 0);
  assert.ok(farmer.pantry.wheat < P.Y_WHEAT);
  assert.equal(farmer.lv, 1);
  assert.equal(farmer.satLast.food1, true);
  assert.ok(economy.f30.wheat.prod > 0);
  assert.ok(economy.f30.wheat.cons > 0);
});

test("段21: 食後の文化消費・漬け込み・腐敗を経て軟ストリークを更新する", () => {
  const economy = createEconomicState();
  const vegetable = createHousehold(economy, { job: "veg", x: 0, y: 0 });
  vegetable.pantry.wheat = 100;
  vegetable.pantry.veg = 100;
  vegetable.pantry.salt = 10;
  vegetable.pantry.pick = 0;
  vegetable.up = P.UP_DAYS - 1;
  const toolsBefore = vegetable.pantry.tools;

  const sourceWorld = new FlowIslandWorld(11);
  sourceWorld.day = 61;
  sourceWorld.fday = {};
  const sourceHousehold = sourceWorld.addHH("veg", 0, 0);
  sourceHousehold.members = structuredClone(vegetable.members);
  sourceHousehold.pantry = structuredClone(vegetable.pantry);
  sourceHousehold.up = vegetable.up;
  sourceWorld.dayEnd();

  runDayEnd(economy, null, { day: 61, random: () => 1 });
  assert.equal(vegetable.lv, 1);
  assert.equal(vegetable.satLast.food1, true);
  assert.equal(vegetable.pantry.tools, toolsBefore - P.D_TOOL);
  assert.ok(vegetable.pantry.pick > 0);
  assert.ok(economy.led.spoil.veg > 0);
  assert.ok(economy.materialFlows.pick.prod > 0);
  assert.deepEqual(vegetable.pantry, sourceHousehold.pantry);
  assert.deepEqual(vegetable.satLast, sourceHousehold.satLast);
  assert.deepEqual(
    { lv: vegetable.lv, up: vegetable.up, down: vegetable.down },
    { lv: sourceHousehold.lv, up: sourceHousehold.up, down: sourceHousehold.down },
  );
});

test("段22: 会社買上げは目標まで安い屋台から先に蔵へ移す", () => {
  const economy = createEconomicState();
  const expensive = createHousehold(economy, { job: "woodshop", x: 0, y: 0 });
  const cheap = createHousehold(economy, { job: "woodshop", x: 1, y: 0 });
  expensive.pantry.tools -= 5;
  cheap.pantry.tools -= 5;
  economy.stalls.tools.push(
    { householdId: expensive.id, qty: 5, price: 5, age: 0 },
    { householdId: cheap.id, qty: 5, price: 1, age: 0 },
  );
  setCompanyStockTarget(economy, "tools", 6);
  const before = economicMaterialSnapshot(economy);

  const purchases = runCompanyProcurement(economy, { day: 1 });
  assert.deepEqual(purchases.map(({ price, qty }) => [price, qty]), [[1, 5], [5, 1]]);
  assert.equal(economy.stock.tools, 6);
  assert.equal(economy.stockCost.tools, 10);
  assert.equal(economy.co.procBuy, 10);
  assert.equal(cheap.purse, P.PURSE0 + 5);
  assert.equal(expensive.purse, P.PURSE0 + 5);
  assert.deepEqual(economicMaterialSnapshot(economy), before);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段22: 蔵出しは予約在庫を除き平均原価×1.2の固定価格で売る", () => {
  const economy = createEconomicState();
  const buyer = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  for (const goods of FOODS) buyer.pantry[goods] = 0;
  postCompanyLedger(economy.company, {
    day: 1,
    amount: buyer.purse - 14.4,
    reason: "蔵出し試験の財布預入",
  });
  buyer.purse = 14.4;
  economy.stock.wheat = 10;
  economy.stockCost.wheat = 20;
  economy.order = { g: "wheat", qty: 4, left: 4, price: 2, due: 90 };
  const before = economicMaterialSnapshot(economy);

  assert.equal(companyStockReleasePrice(economy, "wheat"), 2.4);
  const bought = buyAtMarket(economy, buyer, { day: 1 });
  const sale = bought.transactions.find((transaction) => transaction.source === "STOCK");
  assert.deepEqual(sale, { goods: "wheat", qty: 6, price: 2.4, source: "STOCK" });
  assert.equal(economy.stock.wheat, 4);
  assert.equal(economy.stockCost.wheat, 8);
  assert.ok(Math.abs(economy.co.stockSell - 14.4) < 1e-12);
  assert.deepEqual(economicMaterialSnapshot(economy), before);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段22: 本国注文は蔵の原価簿を比例減算して一括出荷・外貨化する", () => {
  const economy = createEconomicState();
  economy.stock.tools = 40;
  economy.stockCost.tools = 80;
  economy.order = { g: "tools", qty: 30, left: 30, price: 2.5, due: 160 };
  ageMarketStalls(economy, { day: 70 });
  const result = runCompanyDayStart(economy, { day: 70, random: () => 1 });

  assert.deepEqual(result.shipped, { goods: "tools", qty: 30, revenue: 93.75 });
  assert.equal(result.completed, true);
  assert.equal(economy.order, null);
  assert.equal(economy.orderDone, 1);
  assert.equal(economy.stock.tools, 10);
  assert.equal(economy.stockCost.tools, 20);
  assert.equal(economy.exported.tools, 30);
  assert.equal(economy.materialFlows.tools.exp, 30);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段22: 支度金・信用限度・月利・破産を会社台帳と本土境界へ記帳する", () => {
  const economy = createEconomicState();
  assert.equal(companyCreditLimit(economy, { day: 1 }), 6000);
  assert.equal(fundSettlementZone(economy, {
    job: "logger", x: 3, y: 4, day: 1,
  }), true);
  assert.deepEqual(economy.zones, [{ job: "logger", x: 3, y: 4, filled: false }]);
  assert.equal(economy.company.money, P.TREASURY0 - P.BUILD_COST);
  assert.equal(economy.moneyBoundary.out, P.BUILD_COST);

  const withdrawal = economy.company.money + 6001;
  postCompanyLedger(economy.company, { day: 29, amount: -withdrawal, reason: "破産試験の本土支出" });
  recordExternalMoneyFlow(economy, { amount: -withdrawal, reason: "破産試験の本土支出" });
  const bankruptcy = runCompanyFinance(economy, { day: 30 });
  assert.deepEqual(bankruptcy, { interest: 0, bankrupt: true });
  assert.equal(economy.goDay, 30);
  assert.equal(assertMoneyConservation(economy), true);

  const interestEconomy = createEconomicState();
  postCompanyLedger(interestEconomy.company, {
    day: 1289,
    amount: -(P.TREASURY0 + 1000),
    reason: "利払い試験の本土支出",
  });
  recordExternalMoneyFlow(interestEconomy, {
    amount: -(P.TREASURY0 + 1000),
    reason: "利払い試験の本土支出",
  });
  const finance = runCompanyFinance(interestEconomy, { day: 1290 });
  assert.equal(finance.interest, 1000 * P.IRATE);
  assert.equal(finance.bankrupt, false);
  assert.equal(interestEconomy.company.money, -1000 * (1 + P.IRATE));
  assert.equal(assertMoneyConservation(interestEconomy), true);
});

test("段22: 信用限度は月次成長枠と世帯数枠の小さい方で決まる", () => {
  const nineHouseholds = createEconomicState();
  for (let index = 0; index < 9; index += 1) {
    createHousehold(nineHouseholds, { job: "logger", x: index, y: 0 });
  }
  assert.equal(companyCreditLimit(nineHouseholds, { day: 1 }), 9 * 9 * P.LIMIT_PC);

  const twentyHouseholds = createEconomicState();
  for (let index = 0; index < 20; index += 1) {
    createHousehold(twentyHouseholds, { job: "logger", x: index, y: 0 });
  }
  assert.equal(companyCreditLimit(twentyHouseholds, { day: 1 }), P.LIMIT0 + P.LIMIT_G);
  assert.equal(companyCreditLimit(twentyHouseholds, { day: 720 }), 20 * 9 * P.LIMIT_PC);
});

test("段23: 月次出生は非飢餓・食料2日超・11人未満の世帯だけに起きる", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "veg", x: 0, y: 0 });
  household.members = household.members.slice(0, 10);
  while (household.members.length < 10) {
    household.members.push({ name: `家族${household.members.length}`, sex: "♀", age: 10 });
  }
  household.hungerRun = 0;
  household.pantry.wheat = P.EAT * 3;
  const births = runBirthPhase(economy, { day: 30, random: () => 0 });

  assert.equal(births.length, 1);
  assert.equal(household.members.length, 11);
  assert.deepEqual(household.members.at(-1), { name: "ハンス", sex: "♂", age: 0 });
  assert.equal(runBirthPhase(economy, { day: 60, random: () => 0 }).length, 0);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段23: 家督分家は人数・財布・全pantryを頭数比で移し何も印刷しない", () => {
  const economy = createEconomicState();
  const donor = createHousehold(economy, { job: "veg", x: 2, y: 3 });
  donor.members = Array.from({ length: 10 }, (_, index) => ({
    name: `家族${index}`, sex: index % 2 ? "♀" : "♂", age: 20 + index,
  }));
  for (const [index, goods] of GOODS.entries()) donor.pantry[goods] = (index + 1) * 10;
  postCompanyLedger(economy.company, { day: 14, amount: -60, reason: "分家試験の家産移転" });
  donor.purse += 60;
  economy.port = { x: 0, y: 0 };
  economy.zones.push({ job: "woodshop", x: 8, y: 9, filled: false });
  const beforeMaterials = economicMaterialSnapshot(economy);
  const beforeMembers = donor.members.length;
  const beforeMoney = donor.purse + economy.company.money;

  const [settlement] = fillSettlementZones(economy, { day: 15 });
  const successor = settlement.household;
  assert.equal(settlement.kind, "successor");
  assert.equal(successor.job, "woodshop");
  assert.equal(successor.sur, donor.sur);
  assert.equal(successor.members.length, 5);
  assert.equal(donor.members.length, 5);
  assert.equal(successor.state, "arriving");
  assert.deepEqual({ x: successor.px, y: successor.py }, { x: donor.x, y: donor.y });
  assert.equal(successor.purse, 60);
  assert.equal(donor.purse, 60);
  assert.equal(successor.members.length + donor.members.length, beforeMembers);
  assert.equal(successor.purse + donor.purse + economy.company.money, beforeMoney);
  assert.deepEqual(economicMaterialSnapshot(economy), beforeMaterials);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段23: 余剰家族がなく島が飢えていない時だけ移民船が区画を埋める", () => {
  const economy = createEconomicState();
  const resident = createHousehold(economy, { job: "logger", x: 2, y: 2 });
  resident.members = resident.members.slice(0, 7);
  economy.port = { x: 4, y: 5 };
  economy.zones.push({ job: "fisher", x: 7, y: 8, filled: false });
  economy.hungryN = 1;
  assert.deepEqual(fillSettlementZones(economy, { day: 15 }), []);
  assert.equal(economy.zones[0].filled, false);

  economy.hungryN = 0;
  const companyBefore = economy.company.money;
  const [settlement] = fillSettlementZones(economy, { day: 15 });
  assert.equal(settlement.kind, "immigrant");
  assert.equal(settlement.household.state, "arriving");
  assert.deepEqual(
    { x: settlement.household.px, y: settlement.household.py },
    economy.port,
  );
  assert.equal(settlement.household.pantry.wheat, 240);
  assert.equal(settlement.household.pantry.tools, 5);
  assert.equal(economy.company.money, companyBefore - P.PASSAGE);
  assert.equal(economy.outBy.pass, P.PASSAGE);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段23: 転職候補は絶滅職を含む全職で地形職だけ自宅近傍に絞る", () => {
  const terrain = Array.from({ length: 9 }, () => Array(9).fill("grass"));
  terrain[5][4] = "water";
  terrain[4][5] = "forest";
  terrain[4][3] = "rock";
  const physical = createPhysicalState({ width: 9, height: 9, terrain });
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "saltworks", x: 4, y: 4 });
  const allCandidates = jobSelectionWeights(economy, physical, {
    exclude: household.job,
    household,
  }).map(([job]) => job);
  assert.deepEqual(allCandidates, JOBS.filter((job) => job !== household.job));

  const inland = createPhysicalState({
    width: 9,
    height: 9,
    terrain: Array.from({ length: 9 }, () => Array(9).fill("grass")),
  });
  const inlandCandidates = jobSelectionWeights(economy, inland, {
    exclude: household.job,
    household,
  }).map(([job]) => job);
  for (const job of ["fisher", "fisher2", "logger", "quarryman"]) {
    assert.equal(inlandCandidates.includes(job), false, job);
  }
  for (const job of ["wheat", "veg", "shepherd", "rapeseed", "woodshop", "charburner"]) {
    assert.equal(inlandCandidates.includes(job), true, job);
  }
});

test("段23: 破綻転職は初収穫前の麦を守り、困窮職を全職候補から再配置する", () => {
  const physical = createPhysicalState({
    width: 9,
    height: 9,
    terrain: Array.from({ length: 9 }, () => Array(9).fill("grass")),
  });
  const guardedEconomy = createEconomicState();
  const guardedWheat = createHousehold(guardedEconomy, { job: "wheat", x: 4, y: 4 });
  guardedWheat.hungerHist = Array(P.DISTRESS).fill(1);
  guardedWheat.jobCycleDone = false;
  let guardedRandomCalls = 0;
  runPopulationDynamicsPhase(guardedEconomy, physical, {
    day: 360,
    random: () => { guardedRandomCalls += 1; return 0; },
  });
  assert.equal(guardedWheat.job, "wheat");
  assert.equal(guardedRandomCalls, 0);

  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 4, y: 4 });
  household.hungerHist = Array(P.DISTRESS).fill(1);
  household.jobCycleDone = true;
  const changes = runPopulationDynamicsPhase(economy, physical, {
    day: 360,
    random: () => 0,
  });
  assert.equal(household.job, "wheat");
  assert.equal(household.jobCycleDone, false);
  assert.equal(household.lastSwitch, 360);
  assert.deepEqual(changes.at(-1), {
    kind: "job_switch", householdId: household.id, from: "logger", to: "wheat",
  });
});

test("段23: 6ヶ月の負債は徳政で会社貸し倒れへ移して貨幣を保存する", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  postCompanyLedger(economy.company, { day: 149, amount: 70, reason: "徳政試験の住民債務" });
  household.purse = -10;
  household.insolvM = 5;
  household.jobCycleDone = true;
  const changes = runPopulationDynamicsPhase(economy, null, {
    day: 150,
    random: () => 1,
  });

  assert.equal(household.purse, 0);
  assert.equal(household.insolvM, 0);
  assert.deepEqual(changes, [{ kind: "debt_relief", householdId: household.id, debt: 10 }]);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段24: Phase C監査の28項目を維持しPhase D途中もE20残差が帯内", () => {
  const audit = runFlowIslandAudit();
  assert.equal(audit.total, 28);
  assert.equal(audit.results.every((result) => typeof result.passed === "boolean"), true);
  assert.ok(audit.passed >= 20, `Phase D途中の監査が大幅後退: ${audit.passed}/28`);
  for (const [goods, report] of Object.entries(audit.material)) {
    assert.ok(report.ratio < 5, `${goods}: ${report.ratio}%`);
    assert.equal(report.warning, false, goods);
  }
});

test("段25: 市場徒歩便は売り荷と買い荷をcargo経由でだけ確定する", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 8 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 8, height: 3, terrain });
  const economy = createEconomicState();
  economy.market = { x: 5, y: 1 };
  const household = createHousehold(economy, { job: "logger", x: 1, y: 1 });
  for (const goods of GOODS) household.pantry[goods] = 0;
  for (const goods of ["tools", "salt", "char", "cloth", "iron"]) {
    household.pantry[goods] = 100;
  }
  household.pantry.log = 100;

  const total = ({ inventory, cargo }) => {
    const result = { ...inventory };
    for (const [goods, qty] of Object.entries(cargo)) {
      result[goods] = (result[goods] ?? 0) + qty;
    }
    return result;
  };
  const before = economicMaterialSnapshot(economy);
  const trip = beginMarketTrip(economy, physical, household);
  assert.equal(trip.started, true);
  assert.equal(trip.carrier.mode, "walk");
  assert.equal(trip.carrier.capacity, household.members.length * 4);
  assert.equal(household.cargo.direction, "outbound");
  assert.ok(household.cargo.manifest.log > 0);
  assert.deepEqual(total(economicMaterialSnapshot(economy)), total(before));

  let ticks = 0;
  while (household.cargo?.direction !== "inbound" && ticks < 100) {
    stepMarketTrip(economy, physical, household, { day: 1, random: () => 0 });
    ticks += 1;
  }
  assert.ok(ticks < 100);
  assert.ok(household.cargo.manifest.wheat > 0);
  assert.equal(household.pantry.wheat, 0);
  assert.ok(economy.stalls.log.some((stall) => stall.householdId === household.id));
  const atMarket = economicMaterialSnapshot(economy);
  assertMaterialBalance({ before, after: atMarket, flows: economy.dailyMaterialFlows });

  while (household.state !== "home" && ticks < 200) {
    stepMarketTrip(economy, physical, household, { day: 1, random: () => 0 });
    ticks += 1;
  }
  assert.ok(ticks < 200);
  assert.equal(household.cargo, null);
  assert.equal(household.marketCarrier, null);
  assert.ok(household.pantry.wheat > 0);
  assertMaterialBalance({
    before,
    after: economicMaterialSnapshot(economy),
    flows: economy.dailyMaterialFlows,
  });
});

test("段26: 市場往復tickが生産倍率を一意に決め30tick超は出発できない", () => {
  const terrain = [Array.from({ length: 20 }, () => ({ kind: "grass", variant: 0 }))];
  const physical = createPhysicalState({ width: 20, height: 1, terrain });
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 0, y: 0 });

  economy.market = { x: 6, y: 0 };
  assert.equal(marketPathLength(economy, physical, household), 6);
  assert.equal(marketTripDuration(economy, physical, household), 14);
  assert.equal(productionMultiplierForTrip(14), 16 / 30);
  const trip = beginMarketTrip(economy, physical, household);
  assert.equal(trip.started, true);
  assert.equal(household.productionMultiplier, 16 / 30);

  const farEconomy = createEconomicState();
  farEconomy.market = { x: 15, y: 0 };
  const far = createHousehold(farEconomy, { job: "logger", x: 0, y: 0 });
  const pantryBefore = structuredClone(far.pantry);
  assert.equal(marketTripDuration(farEconomy, physical, far), 32);
  assert.deepEqual(beginMarketTrip(farEconomy, physical, far), { started: false, tripTicks: 32 });
  assert.equal(far.state, "home");
  assert.equal(far.cargo, null);
  assert.deepEqual(far.pantry, pantryBefore);
  assert.equal(productionMultiplierForTrip(30), 0);
  assert.equal(productionMultiplierForTrip(Infinity), 0);
  assert.equal("TRAVEL_RATE" in P || "ROAD_F" in P || "TRAVEL_MAX" in P, false);
});

test("段27: tripCostと貯蔵目標は直線でなく徒歩pathLenを使う", () => {
  const terrain = Array.from({ length: 5 }, () => (
    Array.from({ length: 7 }, () => ({ kind: "grass", variant: 0 }))
  ));
  for (let y = 0; y < 4; y += 1) terrain[y][2].kind = "water";
  const physical = createPhysicalState({ width: 7, height: 5, terrain });
  const economy = createEconomicState();
  economy.market = { x: 3, y: 1 };
  const household = createHousehold(economy, { job: "logger", x: 1, y: 1 });
  for (const goods of FOODS) household.pantry[goods] = 0;

  const distance = marketPathLength(economy, physical, household);
  assert.ok(distance > Math.hypot(2, 0));
  assert.equal(
    marketTripCost(economy, physical, household),
    Math.min(Math.max(10, distance * 2.2), householdHaul(household) * 0.8),
  );
  const targetDays = Math.max(P.PANTRY_FOOD_D, Math.min(12, distance * 0.9));
  assert.equal(
    buyTargets(economy, household, { day: 1, physical }).wheat[0],
    targetDays * P.EAT / 4,
  );
});

test("段27: 普請と民間雇用はpathLen最寄りを選び14超を候補外にする", () => {
  const terrain = Array.from({ length: 7 }, () => (
    Array.from({ length: 8 }, () => ({ kind: "grass", variant: 0 }))
  ));
  for (let y = 1; y <= 5; y += 1) terrain[y][1].kind = "water";
  const physical = createPhysicalState({ width: 8, height: 7, terrain });
  const fartherByPath = planRoadWorksite(physical, 2, 3);
  const nearerByPath = planRoadWorksite(physical, 0, 6);
  const economy = createEconomicState();
  const worker = createHousehold(economy, { job: "logger", x: 0, y: 3 });
  for (const goods of FOODS) worker.pantry[goods] = 0;
  worker.purse = 0;
  assert.ok(Math.hypot(fartherByPath.x - worker.x, fartherByPath.y - worker.y)
    < Math.hypot(nearerByPath.x - worker.x, nearerByPath.y - worker.y));
  assert.equal(assignNeedyWork(economy, physical, worker).worksiteId, nearerByPath.id);

  const privatePhysical = createPhysicalState({ width: 8, height: 7, terrain });
  const privateEconomy = createEconomicState();
  const privateWorker = createHousehold(privateEconomy, { job: "logger", x: 0, y: 3 });
  const detourEmployer = createHousehold(privateEconomy, { job: "veg", x: 2, y: 3 });
  const pathEmployer = createHousehold(privateEconomy, { job: "fisher", x: 0, y: 6 });
  for (const goods of FOODS) privateWorker.pantry[goods] = 0;
  privateWorker.purse = 0;
  assert.equal(assignNeedyWork(privateEconomy, privatePhysical, privateWorker).employerId, pathEmployer.id);
  assert.equal(detourEmployer.workerId, null);

  const longTerrain = [Array.from({ length: 18 }, () => ({ kind: "grass", variant: 0 }))];
  const longPhysical = createPhysicalState({ width: 18, height: 1, terrain: longTerrain });
  const longEconomy = createEconomicState();
  const longWorker = createHousehold(longEconomy, { job: "logger", x: 0, y: 0 });
  createHousehold(longEconomy, { job: "veg", x: 15, y: 0 });
  for (const goods of FOODS) longWorker.pantry[goods] = 0;
  longWorker.purse = 0;
  assert.equal(assignNeedyWork(longEconomy, longPhysical, longWorker), null);
});

test("段27: localWood半径と相続3世帯は直線近傍のまま変えない", () => {
  const terrain = Array.from({ length: 7 }, () => (
    Array.from({ length: 5 }, () => ({ kind: "grass", variant: 0 }))
  ));
  for (let y = 1; y <= 5; y += 1) terrain[y][1].kind = "water";
  terrain[3][2].kind = "forest";
  const physical = createPhysicalState({ width: 5, height: 7, terrain });
  const economy = createEconomicState();
  initializeNaturalResources(economy, physical);
  const logger = createHousehold(economy, { job: "logger", x: 0, y: 3 });
  assert.ok(marketPathLength({ ...economy, market: { x: 2, y: 3 } }, physical, logger) > 2);
  assert.equal(localWood(economy, physical, logger), 1 / 8);

  const doomed = createHousehold(economy, { job: "fisher", x: 10, y: 10 });
  const heirs = [11, 12, 13, 14].map((x) => createHousehold(economy, { job: "veg", x, y: 10 }));
  doomed.members = doomed.members.slice(0, 3);
  doomed.purse = 60;
  for (const goods of FOODS) doomed.pantry[goods] = 0;
  for (const heir of heirs) heir.pantry.wheat = 10_000;
  const purses = heirs.map((heir) => heir.purse);
  for (let day = 1; day <= 60; day += 1) runHouseholdSurvival(economy, { day });
  assert.deepEqual(
    heirs.map((heir, index) => heir.purse - purses[index]),
    [20, 20, 20, 0],
  );
});

test("段28: 工房はpantryでなく自建物のinput棚だけから原料を消費する", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 5 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 5, height: 3, terrain });
  const economy = createEconomicState();
  const woodshop = createHousehold(economy, { job: "woodshop", x: 2, y: 1 });
  ensureHouseholdInputSites(economy, physical);
  const building = physical.buildings.find((candidate) => candidate.id === woodshop.buildingId);
  assert.ok(building?.point);
  assert.equal(sectionAmount(building, "input", "log"), 20);
  assert.equal(woodshop.pantry.log, 0);

  withdrawInventory(building, "input", "log", 20);
  woodshop.pantry.log = 100;
  woodshop.pantry.tools = 0;
  producePrimaryTick(economy, physical, woodshop, { day: 1, fraction: 1 });
  assert.equal(woodshop.pantry.tools, 0);
  assert.equal(woodshop.pantry.log, 100);

  depositInventory(building, "input", "log", 15);
  producePrimaryTick(economy, physical, woodshop, { day: 1, fraction: 1 });
  assert.equal(woodshop.pantry.tools, P.Y_TOOLS);
  assert.equal(sectionAmount(building, "input", "log"), 15 - P.Y_TOOLS * P.LOG_TOOL);
  assert.equal(productionInputAmount(physical, woodshop, "log"), 3);
});

test("段28: 市場で買った生産原料は帰宅時にinput棚へ確定する", () => {
  const physical = createPhysicalState({
    width: 3,
    height: 3,
    terrain: Array.from({ length: 3 }, () => (
      Array.from({ length: 3 }, () => ({ kind: "grass", variant: 0 }))
    )),
  });
  const economy = createEconomicState();
  const saltworks = createHousehold(economy, { job: "saltworks", x: 1, y: 1 });
  ensureHouseholdInputSites(economy, physical);
  const building = physical.buildings.find((candidate) => candidate.id === saltworks.buildingId);
  const before = sectionAmount(building, "input", "char");
  saltworks.cargo = { direction: "inbound", manifest: { char: 4, wheat: 6 } };

  unloadMarketBuyCargo(saltworks, physical);
  assert.equal(sectionAmount(building, "input", "char"), before + 4);
  assert.equal(saltworks.pantry.char, 0);
  assert.equal(saltworks.pantry.wheat, 240 + 6);
});

test("段29: 非接続の会社物流は荷車を生成せず接続後だけ市場から蔵へ運ぶ", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 8 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 8, height: 3, terrain });
  const economy = createEconomicState();
  economy.market = { x: 1, y: 1 };
  economy.port = { x: 6, y: 1 };
  ensureCompanyLogisticsSites(economy, physical);
  const seller = createHousehold(economy, { job: "woodshop", x: 2, y: 2 });
  seller.pantry.tools = 100;
  sellAtMarket(economy, physical, seller, { day: 1, random: () => 0 });
  const offered = economy.stalls.tools[0].qty;
  setCompanyStockTarget(economy, "tools", offered);
  const before = economicMaterialSnapshot(economy, physical);

  assert.deepEqual(runCompanyProcurement(economy, { day: 1, physical }), []);
  assert.equal(physical.haulJobs.length, 0);
  assert.equal(economy.stalls.tools[0].qty, offered);
  assert.match(economy.events.at(-1)[1], /道が繋がっていません/);
  assert.deepEqual(economicMaterialSnapshot(economy, physical), before);

  assert.equal(addRoadLine(physical, { x: 1, y: 1 }, { x: 6, y: 1 }).ok, true);
  const purchases = runCompanyProcurement(economy, { day: 2, physical });
  assert.ok(purchases.length > 0);
  assert.equal(purchases.every((purchase) => purchase.jobId), true);
  assert.equal(economy.stock.tools ?? 0, 0);
  assert.equal(physical.haulJobs.every((job) => job.carrier.mode === "cart"), true);
  assertMaterialBalance({
    before,
    after: economicMaterialSnapshot(economy, physical),
    flows: {},
  });

  stepHaulCarriers(physical, 1);
  settleCompanyLogistics(economy, physical, { day: 3 });
  assert.equal(economy.stock.tools, offered);
  assert.equal(
    sectionAmount(companyLogisticsSite(physical, "warehouse"), "storage", "tools"),
    offered,
  );
  assertMaterialBalance({
    before,
    after: economicMaterialSnapshot(economy, physical),
    flows: {},
  });

  const release = requestCompanyStockRelease(economy, physical, "tools", { day: 3 });
  assert.ok(release);
  assert.equal(release.carrier.mode, "cart");
  stepHaulCarriers(physical, 1);
  settleCompanyLogistics(economy, physical, { day: 4 });
  assert.equal(economy.marketStock.tools, release.qty);
  assert.equal(economy.stock.tools, offered - release.qty);
  assert.equal(
    sectionAmount(companyLogisticsSite(physical, "market"), "inbound", "tools"),
    release.qty,
  );
});

test("段29: 本国注文は蔵から港への荷車到着後だけ船積みと売上を確定する", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 8 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 8, height: 3, terrain });
  const economy = createEconomicState();
  economy.market = { x: 1, y: 1 };
  economy.port = { x: 6, y: 1 };
  ensureCompanyLogisticsSites(economy, physical);
  addRoadLine(physical, economy.market, economy.port);
  const warehouse = companyLogisticsSite(physical, "warehouse");
  economy.stock.tools = 8;
  economy.stockCost.tools = 8;
  depositInventory(warehouse, "storage", "tools", 8);
  economy.order = { g: "tools", qty: 8, left: 8, price: 2.5, due: 90 };
  const before = economicMaterialSnapshot(economy, physical);
  const moneyBefore = economy.company.money;

  const start = runCompanyDayStart(economy, { day: 2, random: () => 1, physical });
  assert.equal(start.dispatched.length, 1);
  assert.equal(economy.order.left, 8);
  assert.equal(economy.company.money, moneyBefore);
  assert.equal(economy.stock.tools, 0);
  assertMaterialBalance({
    before,
    after: economicMaterialSnapshot(economy, physical),
    flows: {},
  });

  stepHaulCarriers(physical, 3);
  assert.equal(economy.order.left, 8);
  stepHaulCarriers(physical, 1);
  settleCompanyLogistics(economy, physical, { day: 3 });
  assert.equal(economy.order, null);
  assert.equal(economy.orderDone, 1);
  assert.equal(economy.company.money, moneyBefore + 8 * 2.5 * 1.25);
  assert.equal(sectionAmount(companyLogisticsSite(physical, "port"), "outbound", "tools"), 0);
  assertMaterialBalance({
    before,
    after: economicMaterialSnapshot(economy, physical),
    flows: economy.dailyMaterialFlows,
  });
});

test("段30: testRoadShortensTrips――道路短縮分だけ労働時間と日産が増える", () => {
  const make = () => {
    const terrain = Array.from({ length: 3 }, () => (
      Array.from({ length: 12 }, () => ({ kind: "grass", variant: 0 }))
    ));
    const physical = createPhysicalState({ width: 12, height: 3, terrain });
    const economy = createEconomicState();
    economy.market = { x: 10, y: 1 };
    const household = createHousehold(economy, { job: "shepherd", x: 1, y: 1 });
    household.pantry.meat = 0;
    household.pantry.cloth = 0;
    return { economy, household, physical };
  };
  const plain = make();
  const plainDistance = marketPathLength(plain.economy, plain.physical, plain.household);
  const plainTicks = marketTripDuration(plain.economy, plain.physical, plain.household);
  const plainMultiplier = productionMultiplierForTrip(plainTicks);
  for (let tick = 0; tick < 30; tick += 1) {
    producePrimaryTick(plain.economy, plain.physical, plain.household, {
      day: 1,
      fraction: plainMultiplier / 30,
    });
  }

  const road = make();
  addRoadLine(road.physical, road.household, road.economy.market);
  const roadDistance = marketPathLength(road.economy, road.physical, road.household);
  const roadTicks = marketTripDuration(road.economy, road.physical, road.household);
  const roadMultiplier = productionMultiplierForTrip(roadTicks);
  for (let tick = 0; tick < 30; tick += 1) {
    producePrimaryTick(road.economy, road.physical, road.household, {
      day: 1,
      fraction: roadMultiplier / 30,
    });
  }

  assert.equal(plainDistance, 9);
  assert.ok(Math.abs(roadDistance - 9 * 0.6) < 1e-12);
  assert.equal(plainTicks, plainDistance * 2 + 2);
  assert.equal(roadTicks, roadDistance * 2 + 2);
  assert.ok(roadTicks < plainTicks);
  assert.ok(roadMultiplier > plainMultiplier);
  assert.ok(Math.abs(plain.household.pantry.meat - P.Y_MEAT * plainMultiplier) < 1e-10);
  assert.ok(Math.abs(road.household.pantry.meat - P.Y_MEAT * roadMultiplier) < 1e-10);
  assert.ok(road.household.pantry.meat > plain.household.pantry.meat);
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
