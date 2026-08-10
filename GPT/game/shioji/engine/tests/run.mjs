import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";

import {
  BUY_ORDER,
  COMPANY_LEDGER_LIMIT,
  DAY_END_ORDER,
  FOODS,
  GOODS,
  JOBCLS,
  JOBS,
  LADDER,
  P,
  PERISH,
  acceptCompanyOrder,
  ageMarketStalls,
  assignNeedyWork,
  assertCompanyLedger,
  assertMoneyConservation,
  buyAtMarket,
  buyTargets,
  chopWood,
  calendarMonth,
  companyCreditLimit,
  companyLogisticsSite,
  companyStockReleasePrice,
  completeAssignedWork,
  consumeConstructionMaterials,
  constructionReady,
  createEconomicState,
  createHousehold,
  createCompanyState,
  economicMaterialSnapshot,
  fillSettlementZones,
  finalizeHouseholdProductionDay,
  fundSettlementZone,
  householdClass,
  householdEat,
  householdFoodDays,
  householdFishingRigMultiplier,
  householdFishingRigNeed,
  householdHaul,
  householdTransportPlan,
  householdWorkToolMultiplier,
  householdWorkToolNeed,
  householdMult,
  householdProductionSummary,
  initializeNaturalResources,
  isNeedyHousehold,
  jobSelectionWeights,
  laborWage,
  localWood,
  marketPathLength,
  marketTripCost,
  marketTripDuration,
  postCompanyLedger,
  recordEconomicDemand,
  recordEconomyEvent,
  productionCost,
  productionMultiplierForTrip,
  productionInputAmount,
  producePrimaryTick,
  quoteAskPrice,
  requestCompanyImport,
  requestCompanyStockRelease,
  recordExternalMoneyFlow,
  repairMaterialsFor,
  regenerateForest,
  roadPavingStoneCost,
  runBuildingMaintenance,
  runCompanyDayStart,
  runCompanyFinance,
  runCompanyProcurement,
  runBirthPhase,
  runDayEnd,
  runHouseholdSurvival,
  runPrimaryProductionDay,
  runPopulationDynamicsPhase,
  runRoadPaving,
  runWheatHarvest,
  resourceWorkEfficiency,
  sellAtMarket,
  sellOffers,
  setCompanyStockTarget,
  settleCompanyLogistics,
  settlePortTransfers,
  shouldPauseProduction,
  staplePrice,
  transactMarketCargo,
  unloadMarketBuyCargo,
  updateFlowEma,
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
  ECONOMIC_BUILDINGS,
  V003_FIXED,
  addBuilding,
  addRoadLine,
  assertCarrierInvariants,
  assertMaterialBalance,
  assertOccupancyInvariant,
  completeHaulJob,
  carrierGoodsCapacity,
  createCartCarrier,
  createHaulJob,
  createMaterialFlowLedger,
  createPhysicalState,
  createV003PhysicalState,
  createWalkCarrier,
  depositInventory,
  dockVessel,
  hasRoad,
  isPavedRoad,
  isConnected,
  keyOf,
  loseHaulCarrier,
  makeFlowIslandTerrain,
  materialSnapshot,
  moveInventoryBetweenSections,
  pathLen,
  paveRoadTile,
  planRoadWorksite,
  recordMaterialFlow,
  removeRoadTile,
  roadPath,
  sectionAmount,
  sectionCapacity,
  stepHaulCarriers,
  stepPortHandling,
  tileTravelCost,
  withdrawInventory,
  workRoadWorksite,
} from "../src/physical.js";
import {
  HOUSEHOLD_DEPARTURE_WINDOW,
  beginDirectSupplyTrip,
  beginMarketTrip,
  createWorld,
  decideHouseholdTrips,
  ensureCompanyLogisticsSites,
  ensureHouseholdInputSites,
  findDirectSupplier,
  householdDepartureTime,
  stepMarketTrip,
} from "../src/world.js";
import {
  E_STABLE_BASE,
  E_STABLE_BAD_MIN_PATH,
  E_STABLE_BAD_FAMINE_RATIO_MIN,
  E_STABLE_BAD_POPULATION_RATIO_MAX,
  E_STABLE_JOBS,
  E_STABLE_MARKET_ANCHOR,
  E_STABLE_PATH_BAND,
  E_STABLE_RELATIVE_LAYOUT,
  IRON_AUDIT_SITES,
  IRON_CHAIN_BANDS,
  IRON_DEMAND_HOUSEHOLDS,
  IRON_DEMAND_LEVEL,
  buildBaseCity,
  buildBadCity,
  canPlaceSettlement,
  createAuditWorld,
  createIronAuditWorld,
  evaluateIronChainScenarios,
  findAuditSpot,
  mimicPlayer,
  makeStableCityPlan,
  runFlowIslandAudit,
  runStableCityScenario,
} from "../src/audit.js";
import {
  createEngineApi,
  mimicPlayerThroughApi,
  replayInputJournal,
} from "../src/api.js";

const tests = [];
const matchIndex = process.argv.indexOf('--match');
const testMatch = matchIndex >= 0 ? new RegExp(process.argv[matchIndex + 1]) : null;
const includeFullAcceptance = !process.argv.includes("--unit-only") && !testMatch;
const badBaselineYearly = Object.freeze([{ day: 1440, population: 96, famine: 367 }]);

function runStableWorker(seed, mode = "direct", runBad = false) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../scripts/stable_worker.mjs", import.meta.url), {
      workerData: { seed, mode, days: 2880, materialCheckInterval: 360, runBad },
    });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`stable worker exited with code ${code}`));
    });
  });
}

function runIronWorker(depositRoads) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../scripts/iron_worker.mjs", import.meta.url), {
      workerData: {
        seed: 11,
        depositRoads,
        days: depositRoads ? 1440 : 1080,
        badBaselineYearly: depositRoads ? null : badBaselineYearly,
      },
    });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`iron worker exited with code ${code}`));
    });
  });
}

const fullStableAuditPromise = includeFullAcceptance
  ? Promise.all([
    runStableWorker(11, "api"),
    runStableWorker(13),
    runStableWorker(14),
  ])
  : null;
let fullIronAuditPromise = null;

function fullIronAudit() {
  if (!includeFullAcceptance) return null;
  fullIronAuditPromise ??= Promise.all([runIronWorker(true), runIronWorker(false)]);
  return fullIronAuditPromise;
}

function createEconomicTestPhysical(width = 24, height = 16) {
  return createPhysicalState({
    width,
    height,
    terrain: Array.from({ length: height }, () => (
      Array.from({ length: width }, () => ({ kind: "grass", variant: 0 }))
    )),
  });
}

function addEconomicTestBuilding(
  physical,
  type,
  x,
  y,
  entranceX,
  entranceY,
  ownerHouseholdId = null,
) {
  const input = Object.fromEntries(GOODS.map((goods) => [goods, Number.MAX_SAFE_INTEGER]));
  const placed = addBuilding(physical, type, x, y, {
    definitions: ECONOMIC_BUILDINGS,
    entrance: { x: entranceX, y: entranceY },
    requireRoad: false,
    ownerHouseholdId,
    caps: { input },
  });
  assert.equal(placed.ok, true, `${type}: ${placed.reason ?? "配置不可"}`);
  return placed.building;
}

function test(name, run) {
  tests.push({ name, run });
}

function createLogisticsTestFixture({ connectMarketWarehouse = false, connectPort = false } = {}) {
  const width = 24;
  const height = 12;
  const terrain = Array.from({ length: height }, (_, y) => (
    Array.from({ length: width }, () => ({ kind: y >= 9 ? "water" : "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width, height, terrain });
  const economy = createEconomicState();
  economy.market = { x: 7, y: 4 };
  economy.warehouse = { x: 9, y: 4 };
  economy.port = { x: 17, y: 7 };
  economy.logisticsSites = {
    market: { x: 2, y: 2, entrance: { ...economy.market } },
    warehouse: { x: 10, y: 2, entrance: { ...economy.warehouse } },
    port: { x: 16, y: 8, entrance: { ...economy.port } },
  };
  ensureCompanyLogisticsSites(economy, physical);
  if (connectMarketWarehouse || connectPort) addRoadLine(physical, economy.market, economy.warehouse);
  if (connectPort) {
    addRoadLine(physical, economy.warehouse, { x: 9, y: 7 });
    addRoadLine(physical, { x: 9, y: 7 }, economy.port);
  }
  return { economy, physical };
}

function createPortOnlyTestWorld(seed = 11) {
  const plan = makeStableCityPlan();
  const port = plan.logisticsSites.port;
  const physical = createPhysicalState({
    width: 48,
    height: 40,
    terrain: makeFlowIslandTerrain(48, 40),
  });
  const world = createWorld({
    seed,
    physicalState: physical,
    market: { ...port.entrance },
    port: { ...port.entrance },
    logisticsSites: { port },
  });
  ensureCompanyLogisticsSites(world.state.economy, physical);
  return world;
}

test("mulberry32は同じシードから同じ列を返す", () => {
  const a = mulberry32(12345);
  const b = mulberry32(12345);
  const sequenceA = Array.from({ length: 16 }, () => a());
  const sequenceB = Array.from({ length: 16 }, () => b());
  assert.deepEqual(sequenceA, sequenceB);
});

test("需給観測: 原料がなく止まった木工房も丸太の需要と不足を残す", () => {
  const economy = createEconomicState();
  const physical = createPhysicalState();
  const woodshop = createHousehold(economy, { job: "woodshop", x: 4, y: 4 });
  woodshop.pantry.log = 0;
  producePrimaryTick(economy, physical, woodshop, { day: 1, fraction: 1 });
  const row = economy.dailyDemandFlows.log;
  assert.equal(row.demand, P.Y_TOOLS * P.LOG_TOOL);
  assert.equal(row.consumed, 0);
  assert.deepEqual(row.sources.woodshop, { demand: row.demand, consumed: 0 });
  updateFlowEma(economy);
  assert.equal(economy.demand30.log.demand, row.demand * 0.05);
  assert.equal(economy.demand30.log.consumed, 0);
});

test("需給観測: 需要台帳は消費超過と不正値を拒否する", () => {
  const economy = createEconomicState();
  assert.throws(() => recordEconomicDemand(economy, "log", 1, 2, "woodshop"), /exceed/);
  assert.throws(() => recordEconomicDemand(economy, "log", -1, 0, "woodshop"), /non-negative/);
  assert.throws(() => recordEconomicDemand(economy, "log", 1, 0, ""), /source/);
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
  postCompanyLedger(company, { day: 1, amount: 40, reason: "市場手数料" });

  assert.equal(company.money, 5_290);
  assert.deepEqual(company.ledger, [
    { day: 1, amount: -250, reason: "支度金", balance: 5_250 },
    { day: 1, amount: 40, reason: "市場手数料", balance: 5_290 },
  ]);
  assert.equal(assertCompanyLedger(company), true);
});

test("会社資金を直接変更すると台帳検査が赤くなる", () => {
  const company = createCompanyState(5_500);
  company.money -= 1;
  assert.throws(() => assertCompanyLedger(company), /台帳外の変更/);
});

test("会社台帳は累積集計を保ったまま有限の表示窓だけを保持する", () => {
  const company = createCompanyState(100);
  for (let day = 1; day <= 700; day += 1) {
    postCompanyLedger(company, { day, amount: 1, reason: "反復取引" });
  }
  assert.ok(company.ledger.length <= COMPANY_LEDGER_LIMIT + 128);
  assert.equal(company.ledgerCount, 700);
  assert.equal(company.ledgerIncome, 700);
  assert.equal(company.ledgerExpense, 0);
  assert.equal(company.ledgerByReason["反復取引"], 700);
  assert.ok(company.ledgerDaily.length <= 60);
  assert.equal(assertCompanyLedger(company), true);
});

test("旧セーブの会社台帳と出来事は初回更新時に既存履歴から累計を復元する", () => {
  const company = createCompanyState(100);
  postCompanyLedger(company, { day: 1, amount: 7, reason: "旧入金" });
  postCompanyLedger(company, { day: 2, amount: -3, reason: "旧支出" });
  for (const key of [
    "ledgerCount", "ledgerOffsetBalance", "ledgerIncome", "ledgerExpense",
    "ledgerByReason", "ledgerDaily",
  ]) {
    delete company[key];
  }
  postCompanyLedger(company, { day: 3, amount: 2, reason: "新入金" });
  assert.equal(company.ledgerCount, 3);
  assert.equal(company.ledgerIncome, 9);
  assert.equal(company.ledgerExpense, 3);
  assert.deepEqual(company.ledgerByReason, { 旧入金: 7, 旧支出: -3, 新入金: 2 });
  assert.equal(company.ledgerDaily.length, 3);
  assert.equal(assertCompanyLedger(company), true);

  const economy = createEconomicState();
  economy.events.push([1, "旧出来事"]);
  delete economy.eventCount;
  recordEconomyEvent(economy, 2, "新出来事");
  assert.equal(economy.eventCount, 2);
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
    "input", "output", "storage", "construction", "repair", "inbound", "outbound", "pickup",
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

test("需要網1: 建設材は帰宅時にconstruction棚へ届き、完成時だけ実消費される", () => {
  const terrain = Array.from({ length: 20 }, () => (
    Array.from({ length: 20 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 20, height: 20, terrain });
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "woodshop", x: 7, y: 6 });
  const shelf = Object.fromEntries(GOODS.map((goods) => [goods, 100]));
  const placed = addBuilding(physical, "woodshop", 4, 4, {
    definitions: ECONOMIC_BUILDINGS,
    requireRoad: false,
    entrance: { x: 7, y: 6 },
    ownerHouseholdId: household.id,
    caps: { input: shelf, construction: shelf, repair: shelf },
    constructionRequired: { log: 6, tools: 4 },
  });
  assert.equal(placed.ok, true, placed.reason);
  household.buildingId = placed.building.id;
  household.cargo = { direction: "inbound", manifest: { log: 6, tools: 4 } };

  unloadMarketBuyCargo(household, physical);
  assert.equal(sectionAmount(placed.building, "construction", "log"), 6);
  assert.equal(sectionAmount(placed.building, "construction", "tools"), 4);
  assert.equal(constructionReady(physical, household), true);
  assert.equal(economy.materialFlows.log.cons, 0, "棚へ届いただけでは消費にしない");

  assert.equal(consumeConstructionMaterials(economy, physical, household), true);
  assert.equal(sectionAmount(placed.building, "construction", "log"), 0);
  assert.equal(sectionAmount(placed.building, "construction", "tools"), 0);
  assert.equal(economy.materialFlows.log.cons, 6);
  assert.equal(economy.materialFlows.tools.cons, 4);
});

test("需要網1: 高Lv施設は木製品・石材・鉄材を30日周期で修繕要求し、不足は段階表示になる", () => {
  const terrain = Array.from({ length: 20 }, () => (
    Array.from({ length: 20 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 20, height: 20, terrain });
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "woodshop", x: 7, y: 6 });
  household.lv = 3;
  household.state = "home";
  const shelf = Object.fromEntries(GOODS.map((goods) => [goods, 1000]));
  const placed = addBuilding(physical, "woodshop", 4, 4, {
    definitions: ECONOMIC_BUILDINGS,
    requireRoad: false,
    entrance: { x: 7, y: 6 },
    ownerHouseholdId: household.id,
    caps: { input: shelf, construction: shelf, repair: shelf },
    condition: 45,
  });
  household.buildingId = placed.building.id;
  const expected = repairMaterialsFor(placed.building, household);
  assert.ok(expected.tools > 0);
  assert.ok(expected.stone > 0);
  assert.ok(expected.iron > 0);

  runBuildingMaintenance(economy, physical, { day: 1 });
  runBuildingMaintenance(economy, physical, { day: 31 });
  assert.deepEqual(placed.building.repairPlan.required, expected);
  assert.ok(economy.dailyDemandFlows.stone.sources.building_repair.demand > 0);
  runBuildingMaintenance(economy, physical, { day: 61 });
  assert.equal(placed.building.condition, 30);
  assert.equal(placed.building.conditionStatus, "needs_repair");
  assert.ok(economy.events.some(([, message]) => message.includes("建物に要修繕")));
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

test("需要網2: 石畳は道路セル単位で移動コストを下げ、撤去時に舗装台帳も消える", () => {
  const terrain = Array.from({ length: 3 }, () =>
    Array.from({ length: 7 }, () => ({ kind: "grass", variant: 0 })));
  const physical = createPhysicalState({ width: 7, height: 3, terrain });
  addRoadLine(physical, { x: 0, y: 1 }, { x: 4, y: 1 });

  assert.equal(tileTravelCost(physical, 2, 1, "cart"), 0.6);
  assert.equal(paveRoadTile(physical, 2, 1), true);
  assert.equal(isPavedRoad(physical, 2, 1), true);
  assert.equal(tileTravelCost(physical, 2, 1, "cart"), 0.45);
  assert.equal(pathLen(physical, { x: 1, y: 1 }, { x: 2, y: 1 }, "cart"), 0.45);
  assert.equal(removeRoadTile(physical, 2, 1), true);
  assert.equal(physical.pavedRoads["2,1"], undefined);
});

test("需要網2: 石畳工事は交通量順に一部だけ進み、未投入の石を工事場在庫に残す", () => {
  const terrain = Array.from({ length: 3 }, () =>
    Array.from({ length: 7 }, () => ({ kind: "grass", variant: 0 })));
  const physical = createPhysicalState({ width: 7, height: 3, terrain });
  addRoadLine(physical, { x: 0, y: 1 }, { x: 4, y: 1 });
  const economy = createEconomicState();
  economy.paving = true;
  economy.paveBought = 6;
  economy.traffic["3,1"] = 200;
  economy.traffic["1,1"] = 100;

  const before = economicMaterialSnapshot(economy, physical).inventory.stone;
  const result = runRoadPaving(economy, physical, { day: 1 });
  assert.deepEqual(result.pavedTiles, ["3,1"]);
  assert.equal(result.stoneUsed, P.PAVE_TILE_STONE);
  assert.equal(economy.paveBought, 2);
  assert.equal(economicMaterialSnapshot(economy, physical).inventory.stone, before - 4);
  assert.equal(economy.materialFlows.stone.cons, 4);
  assert.equal(economy.dailyDemandFlows.stone.sources.road_paving.demand, P.PAVE_DAILY_STONE);
  assert.equal(economy.dailyDemandFlows.stone.sources.road_paving.consumed, 4);
  assert.equal(isPavedRoad(physical, 3, 1), true);
  assert.equal(isPavedRoad(physical, 1, 1), false);
  assert.equal(economy.paved, false);
});

test("需要網2: 港周辺の道路セルは通常道路より多く石材を使う", () => {
  const physical = createPhysicalState({
    width: 12,
    height: 8,
    terrain: Array.from({ length: 8 }, () =>
      Array.from({ length: 12 }, () => ({ kind: "grass", variant: 0 }))),
  });
  addBuilding(physical, "port_test", 1, 1, {
    definitions: {
      port_test: { category: "company", roles: ["port"], w: 2, h: 2, caps: {} },
    },
    entrance: { x: 1, y: 3 },
    roles: ["port"],
    requireRoad: false,
  });
  assert.equal(roadPavingStoneCost(physical, "1,3"), P.PAVE_PORT_TILE_STONE);
  assert.equal(roadPavingStoneCost(physical, "10,6"), P.PAVE_TILE_STONE);
});

test("需要網2: 旧セーブの全島舗装フラグを道路セル台帳へ移行する", () => {
  const original = createWorld({ seed: 17 });
  addRoadLine(original.state.physical, { x: 1, y: 1 }, { x: 3, y: 1 });
  original.state.economy.paved = true;
  original.state.economy.paveBought = P.PAVE_STONE;
  delete original.state.physical.pavedRoads;

  const restored = createWorld({ stateSnapshot: original.state });
  assert.deepEqual(
    Object.keys(restored.state.physical.pavedRoads).sort(),
    Object.keys(restored.state.physical.roads).sort(),
  );
  assert.equal(restored.state.economy.paveBought, 0);
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
  depositInventory(plain.source, "output", "log", 2);
  const plainBefore = materialSnapshot(plain.physical);
  const plainJob = createHaulJob(plain.physical, {
    from: { building: plain.source, section: "output" },
    to: { building: plain.target, section: "input" },
    goods: "log",
    qty: 2,
    carrier: createWalkCarrier(plain.physical, { people: 2 }),
  });
  assert.equal(plainJob.carrier.capacity, 2);
  for (let tick = 0; tick < 5; tick += 1) {
    stepHaulCarriers(plain.physical);
    assertMaterialBalance({ before: plainBefore, after: materialSnapshot(plain.physical), flows: {} });
  }
  assert.equal(plainJob.status, "in_transit");
  stepHaulCarriers(plain.physical);
  assert.equal(plainJob.status, "completed");

  const road = makeCarrierTestPhysical({ withRoad: true });
  depositInventory(road.source, "output", "log", 2);
  const roadJob = createHaulJob(road.physical, {
    from: { building: road.source, section: "output" },
    to: { building: road.target, section: "input" },
    goods: "log",
    qty: 2,
    carrier: createWalkCarrier(road.physical, { people: 2 }),
  });
  stepHaulCarriers(road.physical, 3);
  assert.equal(roadJob.status, "in_transit");
  stepHaulCarriers(road.physical);
  assert.equal(roadJob.status, "completed");
  assert.ok(road.physical.tick < plain.physical.tick);
});

test("段10/25C: 木の荷車は容量8・道路限定で輸送中込み量保存を守る", () => {
  const { physical, source, target } = makeCarrierTestPhysical({ withRoad: true });
  depositInventory(source, "output", "log", 8);
  const before = materialSnapshot(physical);
  const job = createHaulJob(physical, {
    from: { building: source, section: "output" },
    to: { building: target, section: "input" },
    goods: "log",
    qty: 8,
    carrier: createCartCarrier(physical),
  });
  assert.equal(job.carrier.capacity, 8);
  assert.equal(job.carrier.path.every(({ x, y }) => hasRoad(physical, x, y)), true);

  while (job.status === "in_transit") {
    assert.equal(assertCarrierInvariants(physical), true);
    assertMaterialBalance({ before, after: materialSnapshot(physical), flows: {} });
    stepHaulCarriers(physical);
  }
  assert.equal(job.status, "completed");
  assert.equal(sectionAmount(target, "input", "log"), 8);
  assertMaterialBalance({ before, after: materialSnapshot(physical), flows: {} });

  const overCapacity = makeCarrierTestPhysical({ withRoad: true });
  depositInventory(overCapacity.source, "output", "log", 9);
  assert.throws(() => createHaulJob(overCapacity.physical, {
    from: { building: overCapacity.source, section: "output" },
    to: { building: overCapacity.target, section: "input" },
    goods: "log",
    qty: 9,
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

test("段11: P・GOODS・FOODS・PERISHが意図した需給網・移動係数以外flow_island正本と同値", () => {
  const sourceConstants = structuredClone(FLOW_ISLAND_P);
  delete sourceConstants.TRAVEL_RATE;
  delete sourceConstants.ROAD_F;
  delete sourceConstants.TRAVEL_MAX;
  // WOOD_R: 空間パズル較正(2026-08-09)。回復が伐採と釣り合い前線が止まるのを防ぐ意図的な差分
  for (const changed of [
    "IMP", "IMP_COST", "EXP", "EXP_CAP", "EXP_ML", "Y_OIL", "WOOD_R", "WOOD0",
    "Y_LOG", "Y_ORE", "Y_COAL", "Y_SMELT", "Y_SMITH", "LOG_TOOL", "LOG_CHAR",
    "Y_CHAR", "Y_SALT", "Y_COTTON_CLOTH", "Y_STONE",
  ]) {
    delete sourceConstants[changed];
  }
  for (const changed of ["tools", "salt", "char", "stone", "iron", "cloth", "ore", "coal", "bar"]) {
    delete sourceConstants.BELIEF0[changed];
  }
  const actualConstants = Object.fromEntries(
    Object.keys(sourceConstants).map((key) => [key, P[key]]),
  );
  actualConstants.BELIEF0 = Object.fromEntries(
    Object.keys(sourceConstants.BELIEF0).map((goods) => [goods, P.BELIEF0[goods]]),
  );
  assert.deepEqual(
    actualConstants,
    sourceConstants,
  );
  assert.equal("TRAVEL_RATE" in P, false);
  assert.equal("ROAD_F" in P, false);
  assert.equal("TRAVEL_MAX" in P, false);
  assert.deepEqual(P.IMP, { wheat: 4, tools: 6, salt: 5, iron: 12, oil: 3 });
  assert.deepEqual(P.EXP, { pres: 0.6, pick: 0.55, cloth: 2 });
  assert.deepEqual(GOODS.slice(0, FLOW_ISLAND_GOODS.length), FLOW_ISLAND_GOODS);
  assert.deepEqual(FOODS, FLOW_ISLAND_FOODS);
  assert.deepEqual(PERISH, FLOW_ISLAND_PERISH);
  assert.equal(createWorld({ seed: 11 }).state.economy.company.money, P.TREASURY0);
});

test("需要網7: 布は大家族まで輸出黒字を保証せず島内需要で二軒目が成立する産出量にする", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "rapeseed", x: 0, y: 0 });
  household.members = Array.from({ length: 11 }, (_, index) => ({
    id: `cloth-cost-${index}`,
    name: `家族${index}`,
    sex: index % 2 ? "♀" : "♂",
    age: 20,
  }));
  household.lv = 0;
  economy.px.wheat = 1;
  economy.px.veg = 1;
  economy.px.pres = 1.2;
  assert.equal(P.Y_COTTON_CLOTH, 3);
  assert.equal(P.Y_CLOTH, 0.05);
  assert.ok(productionCost(economy, null, household, "cloth", { day: 61 }) > P.EXP.cloth);
  assert.equal(P.EXP.cloth, 2);
  assert.equal(P.EXP_ML.cloth, 2.2);
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
  assert.deepEqual(
    household.members.map(({ id: _id, ...member }) => member),
    source.members,
  );
  assert.equal(new Set(household.members.map((member) => member.id)).size, household.members.length);
  assert.equal(household.job, source.job);
  assert.equal(household.purse, source.purse);
  assert.deepEqual(
    Object.fromEntries(FLOW_ISLAND_GOODS.map((goods) => [goods, household.pantry[goods]])),
    source.pantry,
  );
  assert.deepEqual(
    Object.fromEntries(["ore", "coal", "bar"].map((goods) => [goods, household.pantry[goods]])),
    { ore: 0, coal: 0, bar: 0 },
  );
  for (const goods of ["fish", "veg", "wheat", "pres", "pick", "meat", "meal", "oil"]) {
    assert.equal(household.belief[goods], source.belief[goods], goods);
  }
  assert.deepEqual(
    Object.fromEntries(["ore", "coal", "bar"].map((goods) => [goods, household.belief[goods]])),
    { ore: P.BELIEF0.ore, coal: P.BELIEF0.coal, bar: P.BELIEF0.bar },
  );
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
    fisher2: { tools: 5, wheat: 240 },
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
  assert.ok(Math.abs(economy.materialFlows.veg.cons - 0.9) < 1e-9);
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
  const sourceTerrain = flowIslandStdTerrain();
  for (let y = 0; y < physical.height; y += 1) {
    for (let x = 0; x < physical.width; x += 1) {
      if (physical.terrain[y][x].kind === "ore" || physical.terrain[y][x].kind === "coal") continue;
      assert.equal(physical.terrain[y][x].kind, sourceTerrain[y][x], `${x},${y}`);
    }
  }

  const economy = createEconomicState();
  initializeNaturalResources(economy, physical);
  const forestTiles = physical.terrain.flat().filter((tile) => tile.kind === "forest").length;
  assert.equal(Object.keys(economy.natural.wood).length, forestTiles);
  assert.equal(Object.values(economy.natural.wood).every((stock) => stock === P.WOOD0), true);
});

test("段14: 漁は冬1/4・野菜畑は月3〜10のみ・牧場は飼料から肉と布を生産する", () => {
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
  const feedBefore = shepherd.household.pantry.wheat;
  producePrimaryTick(shepherd.economy, shepherd.physical, shepherd.household, { day: 1, fraction: 1 });
  assert.equal(shepherd.household.pantry.meat, P.Y_MEAT);
  assert.equal(shepherd.household.pantry.cloth, P.Y_CLOTH);
  assert.equal(shepherd.household.pantry.wheat, feedBefore - P.Y_MEAT * P.FEED_MEAT);
});

test("需要網5: 牧場は野菜を先に麦で補う実飼料だけを肉と布へ変換する", () => {
  const physical = createEconomicTestPhysical(12, 12);
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "shepherd", x: 6, y: 6 });
  household.workTool = {
    kind: "wood", durability: 100, maxDurability: 100, acquiredDay: 1,
  };
  ensureHouseholdInputSites(economy, physical);
  const building = physical.buildings.find(({ id }) => id === household.buildingId);
  withdrawInventory(
    building,
    "input",
    "wheat",
    sectionAmount(building, "input", "wheat"),
  );
  depositInventory(building, "input", "wheat", 5);
  depositInventory(building, "input", "veg", 3);
  household.pantry.meat = 0;
  household.pantry.cloth = 0;

  const result = producePrimaryTick(economy, physical, household, { day: 1, fraction: 1 });
  assert.equal(result.meat, 8);
  assert.equal(result.cloth, P.Y_CLOTH * 0.5);
  assert.equal(sectionAmount(building, "input", "wheat"), 0);
  assert.equal(sectionAmount(building, "input", "veg"), 0);
  assert.deepEqual(economy.dailyDemandFlows.veg.sources.shepherd, {
    demand: 3,
    consumed: 3,
  });
  assert.deepEqual(economy.dailyDemandFlows.wheat.sources.shepherd, {
    demand: P.Y_MEAT * P.FEED_MEAT - 3,
    consumed: 5,
  });
});

test("需要網5: 牧場は麦・野菜を二日分だけ仕入れ対象にし飼料原価を肉へ載せる", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "shepherd", x: 0, y: 0 });
  household.pantry.wheat = 0;
  household.pantry.veg = 0;
  const targets = buyTargets(economy, household, { day: 1 });
  assert.equal(targets.wheat[0], P.Y_MEAT * P.FEED_MEAT);
  assert.equal(targets.veg[0], P.Y_MEAT * P.FEED_MEAT);
  const labor = householdEat(household) * staplePrice(economy)
    / (P.Y_MEAT * householdMult(household));
  assert.equal(
    productionCost(economy, null, household, "meat", { day: 1 }),
    labor + P.FEED_MEAT * Math.min(economy.px.wheat, economy.px.veg),
  );
});

test("需要網3: 全職は素手でも働け、木の作業道具を1荷から組んで実働日だけ摩耗する", () => {
  const economy = createEconomicState();
  const quarryman = createHousehold(economy, { job: "quarryman", x: 0, y: 0 });
  quarryman.pantry.tools = 1;
  const result = producePrimaryTick(economy, null, quarryman, {
    day: 1,
    fraction: 1,
    endOfDay: true,
  });

  assert.equal(result.stone, P.Y_STONE);
  assert.equal(quarryman.pantry.tools, 0);
  assert.deepEqual(quarryman.workTool, {
    kind: "wood",
    durability: P.WORK_TOOL_WOOD_DAYS - 1,
    maxDurability: P.WORK_TOOL_WOOD_DAYS,
    acquiredDay: 1,
  });
  assert.deepEqual(quarryman.workToolsAcquired, { wood: 1, iron: 0 });
  assert.equal(economy.materialFlows.tools.cons, P.WORK_TOOL_WOOD_COST);
  assert.deepEqual(economy.dailyDemandFlows.tools.sources.work_tools, {
    demand: P.WORK_TOOL_WOOD_COST,
    consumed: P.WORK_TOOL_WOOD_COST,
  });

  quarryman.pantry.stone = P.Y_STONE * 20;
  const durability = quarryman.workTool.durability;
  assert.deepEqual(producePrimaryTick(economy, null, quarryman, {
    day: 2,
    fraction: 1,
    endOfDay: true,
  }), {});
  assert.equal(quarryman.workTool.durability, durability, "在庫過多で休んだ日は道具を摩耗しない");
});

test("需要網3: 道具が尽きても停止せず素手75%へ戻り、不足需要を残す", () => {
  const economy = createEconomicState();
  const quarryman = createHousehold(economy, { job: "quarryman", x: 0, y: 0 });
  quarryman.pantry.tools = 0;
  quarryman.workTool = null;
  assert.equal(buyTargets(economy, quarryman, { day: 1 }).tools[0], 1);

  const result = producePrimaryTick(economy, null, quarryman, {
    day: 1,
    fraction: 1,
    endOfDay: true,
  });
  assert.equal(result.stone, P.Y_STONE * P.WORK_TOOL_BARE_MULT);
  assert.equal(householdWorkToolMultiplier(quarryman), P.WORK_TOOL_BARE_MULT);
  assert.deepEqual(householdWorkToolNeed(quarryman), { kind: "wood", goods: "tools", qty: 1 });
  assert.deepEqual(economy.dailyDemandFlows.tools.sources.work_tools, {
    demand: 1,
    consumed: 0,
  });
});

test("需要網3: Lv2世帯は鉄の作業道具を選び、木より長寿命で生産120%になる", () => {
  const economy = createEconomicState();
  const quarryman = createHousehold(economy, { job: "quarryman", x: 0, y: 0 });
  quarryman.lv = 2;
  quarryman.pantry.tools = 0;
  quarryman.pantry.iron = 0;
  assert.equal(buyTargets(economy, quarryman, { day: 1 }).iron[0], 1);
  quarryman.pantry.iron = 1;

  const result = producePrimaryTick(economy, null, quarryman, {
    day: 1,
    fraction: 1,
    endOfDay: true,
  });
  assert.equal(
    result.stone,
    P.Y_STONE * householdMult(quarryman) * P.WORK_TOOL_IRON_MULT,
  );
  assert.equal(quarryman.workTool.kind, "iron");
  assert.equal(quarryman.workTool.durability, P.WORK_TOOL_IRON_DAYS - 1);
  assert.equal(quarryman.pantry.iron, 0);
  assert.equal(economy.materialFlows.iron.cons, 1);
});

test("需要網3: 摩耗時は手元の木製品で交換し、在庫がなければ素手へ戻る", () => {
  const stockedEconomy = createEconomicState();
  const stocked = createHousehold(stockedEconomy, { job: "quarryman", x: 0, y: 0 });
  stocked.pantry.tools = 1;
  stocked.workTool = { kind: "wood", durability: 0.5, maxDurability: 30, acquiredDay: 1 };
  producePrimaryTick(stockedEconomy, null, stocked, { day: 2, fraction: 1, endOfDay: true });
  assert.equal(stocked.workToolsBroken, 1);
  assert.equal(stocked.workTool.kind, "wood");
  assert.equal(stocked.workTool.durability, P.WORK_TOOL_WOOD_DAYS);
  assert.equal(stocked.pantry.tools, 0);
  assert.equal(stockedEconomy.events.some(([, message]) => message.includes("素手で作業")), false);

  const emptyEconomy = createEconomicState();
  const empty = createHousehold(emptyEconomy, { job: "quarryman", x: 0, y: 0 });
  empty.pantry.tools = 0;
  empty.workTool = { kind: "wood", durability: 0.5, maxDurability: 30, acquiredDay: 1 };
  producePrimaryTick(emptyEconomy, null, empty, { day: 2, fraction: 1, endOfDay: true });
  assert.equal(empty.workTool, null);
  assert.equal(emptyEconomy.events.some(([, message]) => message.includes("素手で作業")), true);
});

test("需要網6: 漁師は丸太・木製品・布から木舟と漁網を組み、実働で均等に摩耗する", () => {
  const economy = createEconomicState();
  const fisher = createHousehold(economy, { job: "fisher", x: 0, y: 0 });
  fisher.workTool = { kind: "wood", durability: 100, maxDurability: 100, acquiredDay: 1 };
  fisher.fishingRig = null;
  fisher.pantry.log = P.FISHING_RIG_LOG;
  fisher.pantry.tools = P.FISHING_RIG_TOOLS;
  fisher.pantry.cloth = P.FISHING_RIG_CLOTH;

  const result = producePrimaryTick(economy, null, fisher, {
    day: 1,
    fraction: 1,
    endOfDay: true,
  });

  assert.equal(result.fish, P.Y_FISH);
  assert.equal(fisher.fishingRig.kind, "coastal");
  assert.equal(fisher.fishingRig.durability, P.FISHING_RIG_COASTAL_DAYS - 1);
  assert.equal(fisher.pantry.log, 0);
  assert.equal(fisher.pantry.tools, 0);
  assert.equal(fisher.pantry.cloth, 0);
  assert.equal(economy.materialFlows.log.cons, P.FISHING_RIG_LOG / P.FISHING_RIG_COASTAL_DAYS);
  assert.deepEqual(economy.dailyDemandFlows.cloth.sources.fishing_gear, {
    demand: P.FISHING_RIG_CLOTH / P.FISHING_RIG_COASTAL_DAYS,
    consumed: P.FISHING_RIG_CLOTH / P.FISHING_RIG_COASTAL_DAYS,
  });
});

test("需要網6: 漁具を買えなくても岸漁90%を残し、資材ごとの不足需要を示す", () => {
  const economy = createEconomicState();
  const fisher = createHousehold(economy, { job: "fisher", x: 0, y: 0 });
  fisher.workTool = { kind: "wood", durability: 100, maxDurability: 100, acquiredDay: 1 };
  fisher.fishingRig = null;
  fisher.pantry.log = 0;
  fisher.pantry.tools = 0;
  fisher.pantry.cloth = 0;

  const targets = buyTargets(economy, fisher, { day: 1 });
  assert.equal(targets.log[0], P.FISHING_RIG_LOG);
  assert.equal(targets.tools[0], P.FISHING_RIG_TOOLS);
  assert.equal(targets.cloth[0], P.FISHING_RIG_CLOTH);
  const result = producePrimaryTick(economy, null, fisher, {
    day: 1,
    fraction: 1,
    endOfDay: true,
  });
  assert.equal(result.fish, P.Y_FISH * P.FISHING_RIG_SHORE_MULT);
  assert.equal(householdFishingRigMultiplier(fisher), P.FISHING_RIG_SHORE_MULT);
  assert.deepEqual(householdFishingRigNeed(fisher), {
    kind: "coastal",
    days: P.FISHING_RIG_COASTAL_DAYS,
    materials: {
      log: P.FISHING_RIG_LOG,
      tools: P.FISHING_RIG_TOOLS,
      cloth: P.FISHING_RIG_CLOTH,
    },
  });
  assert.deepEqual(economy.dailyDemandFlows.log.sources.fishing_gear, {
    demand: P.FISHING_RIG_LOG / P.FISHING_RIG_COASTAL_DAYS,
    consumed: 0,
  });
});

test("需要網7: 岸漁できる漁師は漁具更新だけを理由に借金しない", () => {
  const economy = createEconomicState();
  const fisher = createHousehold(economy, { job: "fisher", x: 0, y: 0 });
  const logger = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  fisher.workTool = { kind: "wood", durability: 20, maxDurability: 30, acquiredDay: 1 };
  fisher.fishingRig = null;
  fisher.purse = 0;
  logger.pantry.log = 10;
  economy.stalls.log.push({ householdId: logger.id, qty: 10, price: 1, age: 0 });

  const bought = buyAtMarket(economy, fisher, { day: 1 });
  assert.equal(bought.transactions.some(({ goods }) => goods === "log"), false);
  assert.equal(fisher.purse, 0);
  assert.equal(fisher.pantry.log, 0);
});

test("需要網6: Lv2漁師は鉄材を使う帆走漁具へ更新し漁獲115%になる", () => {
  const economy = createEconomicState();
  const fisher = createHousehold(economy, { job: "fisher", x: 0, y: 0 });
  fisher.lv = 2;
  fisher.workTool = { kind: "iron", durability: 100, maxDurability: 100, acquiredDay: 1 };
  fisher.fishingRig = null;
  fisher.pantry.log = P.FISHING_RIG_SAIL_LOG;
  fisher.pantry.tools = P.FISHING_RIG_SAIL_TOOLS;
  fisher.pantry.cloth = P.FISHING_RIG_SAIL_CLOTH;
  fisher.pantry.iron = P.FISHING_RIG_IRON;

  const result = producePrimaryTick(economy, null, fisher, {
    day: 1,
    fraction: 1,
    endOfDay: true,
  });
  assert.equal(
    result.fish,
    P.Y_FISH * householdMult(fisher) * P.WORK_TOOL_IRON_MULT * P.FISHING_RIG_SAIL_MULT,
  );
  assert.equal(fisher.fishingRig.kind, "sail");
  assert.equal(fisher.fishingRig.durability, P.FISHING_RIG_SAIL_DAYS - 1);
  assert.equal(fisher.pantry.iron, 0);
  assert.deepEqual(economy.dailyDemandFlows.iron.sources.fishing_gear, {
    demand: P.FISHING_RIG_IRON / P.FISHING_RIG_SAIL_DAYS,
    consumed: P.FISHING_RIG_IRON / P.FISHING_RIG_SAIL_DAYS,
  });
});

test("需要網7: 木工房に木こり三軒・炭焼き小屋に一軒を要しLv上昇でも比率が崩れない", () => {
  assert.equal(P.Y_TOOLS * P.LOG_TOOL / P.Y_LOG, 3);
  assert.equal(P.Y_CHAR * P.LOG_CHAR / P.Y_LOG, 1);
  const economy = createEconomicState();
  const logger = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  const woodshop = createHousehold(economy, { job: "woodshop", x: 1, y: 0 });
  const charburner = createHousehold(economy, { job: "charburner", x: 2, y: 0 });
  for (const household of [logger, woodshop, charburner]) household.lv = 4;
  assert.deepEqual(
    [householdMult(logger), householdMult(woodshop), householdMult(charburner)],
    [2, 2, 2],
  );
  assert.equal(
    P.Y_TOOLS * householdMult(woodshop) * P.LOG_TOOL
      / (P.Y_LOG * householdMult(logger)),
    3,
  );
});

test("需要網7: Lv2以上なら農漁業を含む全施設が石材を毎月維持消費する", () => {
  for (const job of JOBS) {
    const economy = createEconomicState();
    const household = createHousehold(economy, { job, x: 0, y: 0 });
    household.lv = 2;
    const required = repairMaterialsFor({ w: 3, h: 3, operationWear: 0 }, household);
    assert.ok(required.stone > 0, job);
  }
});

test("暦オフセット: 経過1日目を春3月として季節生産へ反映する", () => {
  const physical = createPhysicalState({
    width: 48,
    height: 40,
    terrain: makeFlowIslandTerrain(),
  });
  const economy = createEconomicState();
  economy.calendarOffsetDays = 60;
  initializeNaturalResources(economy, physical);
  const gardener = createHousehold(economy, { job: "veg", x: 25, y: 32 });
  assert.equal(calendarMonth(economy, 1), 3);
  producePrimaryTick(economy, physical, gardener, { day: 1, fraction: 1 });
  assert.equal(gardener.pantry.veg, P.Y_VEG);
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
  economy.natural.wood["2,2"] = P.Y_LOG / 2;
  producePrimaryTick(economy, physical, logger, { day: 2, fraction: 1 });
  assert.equal(logger.pantry.log, P.Y_LOG / 2);
  assert.equal(economy.natural.wood["2,2"], 0);
  assert.equal(physical.terrain[2][2].kind, "bald");
  assert.match(economy.events.at(-1)[1], /森が禿げた/);
});

test("空間生産性: 木こりは遠い森ほど実働と日産が落ち、道で回復する", () => {
  const makeLogger = ({ forestX, road = false }) => {
    const terrain = Array.from({ length: 3 }, () => (
      Array.from({ length: 15 }, () => ({ kind: "grass", variant: 0 }))
    ));
    terrain[1][forestX].kind = "forest";
    const physical = createPhysicalState({ width: 15, height: 3, terrain });
    if (road) addRoadLine(physical, { x: 1, y: 1 }, { x: forestX, y: 1 });
    const economy = createEconomicState();
    initializeNaturalResources(economy, physical);
    const household = createHousehold(economy, { job: "logger", x: 1, y: 1 });
    producePrimaryTick(economy, physical, household, { day: 61, fraction: 1 });
    return { household, economy };
  };
  const close = makeLogger({ forestX: 2 });
  const far = makeLogger({ forestX: 12 });
  const pavedRoute = makeLogger({ forestX: 12, road: true });
  assert.equal(close.household.resourceWork.efficiency, 1);
  assert.ok(far.household.resourceWork.efficiency < close.household.resourceWork.efficiency);
  assert.ok(pavedRoute.household.resourceWork.efficiency > far.household.resourceWork.efficiency);
  assert.ok(close.household.pantry.log > pavedRoute.household.pantry.log);
  assert.ok(pavedRoute.household.pantry.log > far.household.pantry.log);
  assert.equal(
    far.household.resourceWork.efficiency,
    resourceWorkEfficiency(far.household.resourceWork.oneWayTicks),
  );

  const noWaterPhysical = createPhysicalState({
    width: 5,
    height: 5,
    terrain: Array.from({ length: 5 }, () => (
      Array.from({ length: 5 }, () => ({ kind: "grass", variant: 0 }))
    )),
  });
  const noWaterEconomy = createEconomicState();
  initializeNaturalResources(noWaterEconomy, noWaterPhysical);
  const strandedFisher = createHousehold(
    noWaterEconomy,
    { job: "fisher", x: 2, y: 2 },
  );
  producePrimaryTick(
    noWaterEconomy,
    noWaterPhysical,
    strandedFisher,
    { day: 61, fraction: 1 },
  );
  assert.equal(strandedFisher.pantry.fish, 0, "漁場そのものが無い時は10%床で漁獲しない");
  assert.equal(strandedFisher.resourceWork.efficiency, 0);
});

test("空間生産性: 30日実測は建物の日産・理想日産・距離効率を同じ根拠から返す", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 8 }, () => ({ kind: "grass", variant: 0 }))
  ));
  terrain[1][5].kind = "forest";
  const physical = createPhysicalState({ width: 8, height: 3, terrain });
  const economy = createEconomicState();
  initializeNaturalResources(economy, physical);
  const logger = createHousehold(economy, { job: "logger", x: 1, y: 1 });
  producePrimaryTick(economy, physical, logger, { day: 61, fraction: 1 });
  finalizeHouseholdProductionDay(economy, { day: 61 });
  const summary = householdProductionSummary(economy, logger, { day: 61 });
  assert.equal(summary.days, 1);
  assert.ok(summary.actual > 0 && summary.actual < summary.ideal);
  assert.deepEqual(
    logger.productionHistory[0].ideal,
    summary.idealByGoods,
    "実績と同じ日の理想値を履歴へ固定する",
  );
  assert.equal(summary.resourceWork.efficiency, logger.resourceWork.efficiency);
});

test("空間生産性: 工房は十分近い木こりへ直接買付し市場往復時間と貨幣を保存する", () => {
  const physical = createEconomicTestPhysical(32, 12);
  const economy = createEconomicState();
  const buyer = createHousehold(economy, { job: "woodshop", x: 5, y: 3 });
  const seller = createHousehold(economy, { job: "logger", x: 7, y: 3 });
  const buyerBuilding = addEconomicTestBuilding(physical, "woodshop", 2, 2, 5, 3, buyer.id);
  const sellerBuilding = addEconomicTestBuilding(physical, "logger", 8, 2, 7, 3, seller.id);
  buyer.buildingId = buyerBuilding.id;
  seller.buildingId = sellerBuilding.id;
  const market = addBuilding(physical, "market", 24, 2, {
    definitions: ECONOMIC_BUILDINGS,
    entrance: { x: 23, y: 4 },
    requireRoad: false,
    fixed: true,
    role: "market",
    roles: ["market"],
  }).building;
  economy.market = { ...market.entrance };
  seller.pantry.log = 30;
  seller.lv = 1;
  buyer.purse = 100;
  economy.px.tools = 10;
  const beforeMoney = buyer.purse + seller.purse;
  const [wanted, ceiling] = buyTargets(economy, buyer, { day: 61, physical }).log;
  const offer = findDirectSupplier(
    economy,
    physical,
    buyer,
    { goods: "log", wanted, ceiling, day: 61 },
  );
  assert.ok(offer, JSON.stringify({
    wanted,
    ceiling,
    sellerOffers: sellOffers(economy, seller, { capacityLimit: Infinity }),
    sellerCost: productionCost(economy, physical, seller, "log", { day: 61 }),
    directPath: pathLen(physical, buyerBuilding.entrance, sellerBuilding.entrance),
    marketPath: pathLen(physical, buyerBuilding.entrance, market.entrance),
  }));
  assert.equal(offer.sellerId, seller.id);
  assert.ok(offer.directTicks <= offer.marketTicks * P.DIRECT_TRADE_MAX_MARKET_RATIO);
  assert.equal(beginDirectSupplyTrip(economy, physical, buyer, offer).started, true);
  let ticks = 0;
  while (buyer.state !== "home" && ticks < 100) {
    stepMarketTrip(economy, physical, buyer, { day: 61, random: () => 0 });
    ticks += 1;
  }
  assert.ok(ticks < 100);
  assert.ok(productionInputAmount(physical, buyer, "log") > 0);
  assert.ok(seller.purse > 30);
  assert.ok(buyer.lastDirectTrade.savedTicks > 0);
  assert.equal(economy.directTrades.length, 1);
  assert.ok(Math.abs(buyer.purse + seller.purse - beforeMoney) < 1e-9);
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
  // 再播種の条件(隣接森の蓄積>30%)を較正値と独立に満たす
  economy.natural.wood["0,1"] = P.WOOD0;
  regenerateForest(economy, physical, { day: 30, random: () => 0 });
  assert.equal(physical.terrain[1][1].kind, "forest");
  assert.equal(economy.natural.wood["1,1"], P.WOOD0 * 0.25);
});

test("段14b: 伐採は木段階を地形へ同期し、木こりへ薄化を一度だけ予告する", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 3 }, () => ({ kind: "forest", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 3, height: 3, terrain });
  const economy = createEconomicState();
  initializeNaturalResources(economy, physical);
  assert.equal(physical.terrain[1][1].wood, 3);

  const logger = createHousehold(economy, { job: "logger", x: 1, y: 1 });
  const revisionBefore = physical.travelRevision ?? 0;
  chopWood(economy, physical, logger, P.WOOD0 * 0.5);
  assert.equal(physical.terrain[1][1].wood, 2, "半分伐ると薄い森");
  assert.ok((physical.travelRevision ?? 0) > revisionBefore, "段階変化はrevisionを進める");
  chopWood(economy, physical, logger, P.WOOD0 * 0.25);
  assert.equal(physical.terrain[1][1].wood, 1, "さらに伐ると疎らな森");

  for (const key of Object.keys(economy.natural.wood)) economy.natural.wood[key] = 60;
  const eventsBefore = economy.events.length;
  regenerateForest(economy, physical, { day: 5, random: () => 1 });
  const warnings = economy.events.slice(eventsBefore).filter(([, text]) => text.includes("薄くなってきた"));
  assert.equal(warnings.length, 1, "薄化の予告は一度だけ");
  regenerateForest(economy, physical, { day: 10, random: () => 1 });
  assert.equal(
    economy.events.filter(([, text]) => text.includes("薄くなってきた")).length,
    1,
    "同じ伐り場に予告を重ねない",
  );
  for (const key of Object.keys(economy.natural.wood)) economy.natural.wood[key] = P.WOOD0 - 2;
  regenerateForest(economy, physical, { day: 15, random: () => 1 });
  assert.equal(logger.woodThinWarned, false, "森が戻れば予告は再武装される");
});

test("段15: 麦はd255に年1回だけwheatWorkと施肥率から収穫する", () => {
  const physical = createPhysicalState();
  const economy = createEconomicState();
  const farmer = createHousehold(economy, { job: "wheat", x: 4, y: 4 });
  farmer.workTool = {
    kind: "wood", durability: 1_000, maxDurability: 1_000, acquiredDay: 1,
  };
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
  const physical = createPhysicalState({
    width: 5,
    height: 3,
    terrain: Array.from({ length: 3 }, () =>
      Array.from({ length: 5 }, () => ({ kind: "grass", variant: 0 }))),
  });
  addRoadLine(physical, { x: 0, y: 1 }, { x: 4, y: 1 });
  const quarryman = createHousehold(economy, { job: "quarryman", x: 2, y: 2 });
  quarryman.lv = 1;
  quarryman.members = quarryman.members.slice(0, 4);
  quarryman.pantry.stone = 100;
  const offered = sellOffers(economy, quarryman).stone;
  const pavingNeed = 5 * P.PAVE_TILE_STONE;
  const bought = Math.min(offered, pavingNeed);
  const purseBefore = quarryman.purse;

  const result = sellAtMarket(economy, physical, quarryman, { day: 1, random: () => 0 });
  assert.equal(result.listed.length, offered > bought ? 1 : 0);
  assert.equal(economy.paveBought, bought);
  assert.equal(quarryman.pantry.stone, 100 - offered);
  assert.equal(quarryman.purse, purseBefore + bought * 1.4);
  assert.equal(economy.materialFlows.stone?.cons ?? 0, 0);
  assert.equal(
    quarryman.pantry.stone + economy.paveBought
      + result.listed.reduce((sum, row) => sum + row.qty, 0),
    100,
  );
  assert.equal(assertMoneyConservation(economy), true);
});

test("段16/43: 屋台在庫はJSON化でき6日後に引き取り棚へ移る", () => {
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
  assert.equal(artisan.pantry.tools, 100 - result.listed[0].qty);
  assert.deepEqual(economy.marketReturns, [{
    id: "ret1",
    householdId: artisan.id,
    goods: "tools",
    qty: result.listed[0].qty,
    queuedDay: 7,
  }]);
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
    "ore", "bar", "log", "salt", "char", "coal", "tools", "cloth", "iron", "meal",
    "stone", "oil", "fish", "veg", "wheat", "pres", "pick", "meat",
  ]);
  assert.equal(BUY_ORDER.includes("pick"), true);

  const economy = createEconomicState();
  const starving = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  for (const goods of FOODS) starving.pantry[goods] = 0;
  const starvingTargets = buyTargets(economy, starving, { day: 1 });
  for (const goods of ["veg", "wheat", "pres", "pick"]) {
    assert.deepEqual(
      starvingTargets[goods],
      [P.PANTRY_FOOD_D * householdEat(starving) / 4, 99],
    );
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
  assert.equal(buyTargets(economy, farmer, { day: 1 }).iron[1], P.IMP.iron * 1.05);
  farmer.workTool = {
    kind: "iron", durability: 90, maxDurability: 90, acquiredDay: 1,
  };

  assert.equal(starvingTargets.char[1], 5);
  assert.equal(buyTargets(economy, farmer, { day: 1 }).iron[1], P.IMP.iron * 1.05);
});

test("段17: 食料日数と購入量は固定9人でなく実際の家族人数を使う", () => {
  const economy = createEconomicState();
  for (const familySize of [4, 9, 11]) {
    const household = createHousehold(economy, { job: "logger", x: 0, y: 0 });
    household.members = Array.from({ length: familySize }, (_, index) => ({
      id: `test-${familySize}-${index}`,
      name: `家族${index}`,
      sex: index % 2 ? "♀" : "♂",
      age: 20,
    }));
    for (const goods of FOODS) household.pantry[goods] = 0;
    household.pantry.wheat = familySize * 3;
    assert.equal(householdFoodDays(household), 3, `${familySize}人家族の3日分`);

    household.pantry.wheat = 0;
    const targets = buyTargets(economy, household, { day: 1 });
    assert.equal(
      targets.wheat[0],
      P.PANTRY_FOOD_D * familySize / 4,
      `${familySize}人家族の買い置き量`,
    );
  }
});

test("段17: 食料6日未満は生産入力logより食料wheatを先に約定する", () => {
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
  assert.equal(result.transactions[0].goods, "wheat");
  assert.equal(result.transactions.some((transaction) => transaction.goods === "wheat"), true);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段17: 屋台約定はpxをEMA更新し売り手から4%手数料を会社へ移す", () => {
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
  assert.equal(transaction.qty, P.PANTRY_FOOD_D * householdEat(buyer) / 4);
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
  const shepherd = createHousehold(economy, { job: "shepherd", x: 0, y: 0 });
  for (const goods of FOODS) shepherd.pantry[goods] = 100;
  shepherd.pantry.wheat = 0;
  shepherd.pantry.veg = 0;
  economy.px.meat = 7;
  postCompanyLedger(economy.company, { day: 1, amount: shepherd.purse, reason: "信用テストの財布預入" });
  shepherd.purse = 0;

  const result = buyAtMarket(economy, shepherd, { day: 61 });
  const wheat = result.transactions.find((transaction) => transaction.goods === "wheat");
  assert.deepEqual(wheat, { goods: "wheat", qty: 7.5, price: P.IMP.wheat, source: "CO" });
  assert.equal(shepherd.purse, -30);
  assert.equal(economy.imported.wheat, 7.5);
  assert.equal(economy.co.impMargin, 7.5 * (P.IMP.wheat - P.IMP_COST.wheat));
  assert.equal(economy.moneyBoundary.out, 7.5 * P.IMP_COST.wheat);
  assert.equal(economy.materialFlows.wheat.imp, 240 + 7.5);
  assert.equal(economy.px.wheat, P.BELIEF0.wheat * 0.9 + P.IMP.wheat * 0.1);
  assert.equal(assertMoneyConservation(economy), true);

  const noCreditEconomy = createEconomicState();
  const fisher = createHousehold(noCreditEconomy, { job: "fisher", x: 0, y: 0 });
  for (const goods of FOODS) fisher.pantry[goods] = 100;
  fisher.pantry.salt = 0;
  noCreditEconomy.px.pres = 5;
  postCompanyLedger(noCreditEconomy.company, {
    day: 1,
    amount: fisher.purse,
    reason: "非入力信用テストの財布預入",
  });
  fisher.purse = 0;
  const noCredit = buyAtMarket(noCreditEconomy, fisher, { day: 61 });
  assert.equal(noCredit.transactions.some((transaction) => transaction.goods === "salt"), false);
  assert.equal(fisher.purse, 0);
});

test("段18: 飢えた世帯だけが高値の主食を買い食料pxを上げる", () => {
  const run = (foodDays) => {
    const economy = createEconomicState();
    const seller = createHousehold(economy, { job: "wheat", x: 0, y: 0 });
    const buyer = createHousehold(economy, { job: "logger", x: 0, y: 0 });
    for (const goods of FOODS) buyer.pantry[goods] = 0;
    buyer.pantry.veg = householdEat(buyer) * foodDays;
    seller.pantry.wheat -= 30;
    economy.stalls.wheat.push({ householdId: seller.id, qty: 30, price: 2, age: 0 });
    const before = economy.px.wheat;
    const result = buyAtMarket(economy, buyer, { day: 1 });
    return { before, economy, result };
  };

  const starving = run(0);
  const merelyLow = run(2);
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

test("段18: 丸太市況の上昇が木製品原価・ask・tools pxへ順に伝播する", () => {
  const run = (logPrice) => {
    const economy = createEconomicState();
    economy.px.log = logPrice;
    economy.px.tools = 4;
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

test("段19: 木工・炭焼き小屋・製塩・綿花・採石・魚粉を正本量で変換する", () => {
  const make = (job) => {
    const economy = createEconomicState();
    const household = createHousehold(economy, { job, x: 0, y: 0 });
    household.workTool = {
      kind: "wood", durability: 100, maxDurability: 100, acquiredDay: 1,
    };
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
  rapeseed.household.pantry.cloth = 0;
  const rapeseedResult = producePrimaryTick(rapeseed.economy, null, rapeseed.household, {
    day: 61,
    fraction: 1,
  });
  const fill = P.FERT_NEED / (P.FERT_NEED * 30);
  assert.equal(rapeseed.household.pantry.meal, 10 - P.FERT_NEED);
  assert.ok(
    Math.abs(rapeseedResult.cloth - P.Y_COTTON_CLOTH * (1 + P.FERT_BOOST * fill)) < 1e-12,
  );

  const quarryman = make("quarryman");
  quarryman.household.pantry.stone = 0;
  producePrimaryTick(quarryman.economy, null, quarryman.household, { day: 1, fraction: 1 });
  assert.equal(quarryman.household.pantry.stone, P.Y_STONE);

  const fishmeal = make("fisher2");
  fishmeal.household.pantry.fish = P.Y_FISH;
  fishmeal.household.pantry.meal = 0;
  producePrimaryTick(fishmeal.economy, null, fishmeal.household, { day: 61, fraction: 1 });
  assert.equal(fishmeal.household.pantry.meal, P.Y_FISH / P.MEAL_FISH);
  assert.equal(fishmeal.household.pantry.fish, 0);
  assert.equal(fishmeal.economy.dailyDemandFlows.fish.sources.fisher2.demand, P.Y_FISH);
  assert.equal(fishmeal.economy.dailyDemandFlows.fish.sources.fisher2.consumed, P.Y_FISH);
  const emptyFishmeal = make("fisher2");
  emptyFishmeal.household.pantry.fish = 0;
  emptyFishmeal.household.pantry.meal = 0;
  producePrimaryTick(emptyFishmeal.economy, null, emptyFishmeal.household, { day: 61, fraction: 1 });
  assert.equal(emptyFishmeal.household.pantry.meal, 0);
  assert.equal(emptyFishmeal.economy.dailyDemandFlows.fish.sources.fisher2.consumed, 0);
  const winterMeal = make("fisher2");
  winterMeal.household.pantry.fish = P.Y_FISH;
  winterMeal.household.pantry.meal = 0;
  producePrimaryTick(winterMeal.economy, null, winterMeal.household, { day: 271, fraction: 1 });
  assert.equal(winterMeal.household.pantry.meal, P.Y_FISH / P.MEAL_FISH);
});

test("需要網4: 魚粉屋は実在する魚を原料棚から加工し、不足需要と冬季稼働を記録する", () => {
  const physical = createEconomicTestPhysical(12, 12);
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "fisher2", x: 6, y: 6 });
  household.workTool = {
    kind: "wood", durability: 100, maxDurability: 100, acquiredDay: 1,
  };
  ensureHouseholdInputSites(economy, physical);
  const building = physical.buildings.find(({ id }) => id === household.buildingId);
  depositInventory(building, "input", "fish", P.Y_FISH);

  const result = producePrimaryTick(economy, physical, household, {
    day: 271,
    fraction: 1,
  });
  assert.equal(result.meal, P.Y_FISH / P.MEAL_FISH);
  assert.equal(sectionAmount(building, "input", "fish"), 0);
  assert.equal(economy.dailyMaterialFlows.fish.cons, P.Y_FISH);
  assert.deepEqual(economy.dailyDemandFlows.fish.sources.fisher2, {
    demand: P.Y_FISH,
    consumed: P.Y_FISH,
  });

  producePrimaryTick(economy, physical, household, { day: 272, fraction: 1 });
  assert.deepEqual(economy.dailyDemandFlows.fish.sources.fisher2, {
    demand: P.Y_FISH * 2,
    consumed: P.Y_FISH,
  });
  const [wanted, ceiling] = buyTargets(economy, household, { day: 272, physical }).fish;
  assert.equal(wanted, P.Y_FISH * 2);
  assert.equal(ceiling, economy.px.fish * 1.25);
});

test("需要網4: 魚粉屋の原料棚でも生鮮魚は家庭・屋台と同じ寿命で腐敗する", () => {
  const physical = createEconomicTestPhysical(12, 12);
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "fisher2", x: 6, y: 6 });
  household.pantry.wheat = 10_000;
  ensureHouseholdInputSites(economy, physical);
  const building = physical.buildings.find(({ id }) => id === household.buildingId);
  depositInventory(building, "input", "fish", 30);

  runDayEnd(economy, physical, { day: 1 });
  assert.equal(sectionAmount(building, "input", "fish"), 20);
  assert.equal(economy.led.spoil.fish, 10);
});

test("段19: 各変換職のcostは生計費と正本の原料pxを連鎖する", () => {
  const cases = [
    {
      job: "woodshop", goods: "tools", day: 1, yield: P.Y_TOOLS,
      input: (px) => P.LOG_TOOL * px.log, sourceEquivalent: false,
    },
    {
      job: "charburner", goods: "char", day: 1, yield: P.Y_CHAR,
      input: (px) => P.LOG_CHAR * px.log, sourceEquivalent: false,
    },
    {
      job: "saltworks", goods: "salt", day: 1, yield: P.Y_SALT,
      input: (px) => P.SALT_CHAR / P.Y_SALT * px.char, sourceEquivalent: false,
    },
    {
      job: "rapeseed", goods: "cloth", day: 61, yield: P.Y_COTTON_CLOTH,
      input: () => 0, sourceEquivalent: false,
    },
    {
      job: "quarryman", goods: "stone", day: 1, yield: P.Y_STONE,
      input: () => 0, sourceEquivalent: false,
    },
    {
      job: "fisher2", goods: "meal", day: 61, yield: P.Y_FISH / P.MEAL_FISH,
      input: (px) => P.MEAL_FISH * px.fish, sourceEquivalent: false,
    },
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

    if (entry.sourceEquivalent !== false) {
      const sourceWorld = new FlowIslandWorld(11);
      sourceWorld.day = entry.day;
      sourceWorld.px = { ...economy.px };
      const sourceHousehold = new FlowIslandHousehold(entry.job, 0, 0);
      assert.ok(Math.abs(actual - sourceWorld.cost(sourceHousehold, entry.goods)) < 1e-12);
    }
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
  household.pantry.wheat = householdEat(household) * 4;
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
    "building_maintenance",
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

test("段22: 会社買上げは目標まで安い屋台から先に倉庫へ移す", () => {
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

test("段22: 市場へ出すは予約在庫を除き平均原価×1.2の固定価格で売る", () => {
  const economy = createEconomicState();
  const buyer = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  for (const goods of FOODS) buyer.pantry[goods] = 0;
  postCompanyLedger(economy.company, {
    day: 1,
    amount: buyer.purse - 14.4,
    reason: "市場へ出す試験の財布預入",
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

test("段22: 本国注文は倉庫の原価簿を比例減算して一括出荷・外貨化する", () => {
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

test("段46: 注文状は受諾まで調達・予約・出荷を発生させない", () => {
  const economy = createEconomicState();
  economy.f30.tools = { prod: 1, cons: 0, imp: 0, exp: 0 };
  economy.stock.tools = 40;
  economy.stockCost.tools = 80;

  const offered = runCompanyDayStart(economy, { day: 75, random: () => 0 });
  assert.equal(offered.created.g, "tools");
  assert.equal(offered.created.qty, P.FIRST_ORDER_QTY);
  assert.equal(economy.order, null);
  assert.deepEqual(economy.orderOffer, offered.created);
  const stockBefore = economy.stock.tools;
  const idle = runCompanyDayStart(economy, { day: 76, random: () => 1 });
  assert.equal(idle.shipped, null);
  assert.equal(economy.stock.tools, stockBefore);

  assert.deepEqual(acceptCompanyOrder(economy, { day: 76 }), offered.created);
  assert.equal(economy.orderOffer, null);
  const accepted = runCompanyDayStart(economy, { day: 76, random: () => 1 });
  assert.equal(accepted.completed, true);
  assert.equal(economy.orderDone, 1);
});

test("段46: 最初の生産適格注文だけは抽選待ちせず、二件目から50%抽選へ戻る", () => {
  const first = createEconomicState();
  first.f30.tools = { prod: 1, cons: 0, imp: 0, exp: 0 };
  first.f30.pick = { prod: 1, cons: 0, imp: 0, exp: 0 };
  const rolls = [0.9, 0, 0.4];
  const offered = runCompanyDayStart(first, { day: 75, random: () => rolls.shift() });
  assert.equal(offered.created.g, "tools", "初回はchance rollが0.9でも最初の適格日に届く");
  assert.equal(offered.created.qty, 12, "初回は開拓直後でも納められる小口の試し荷にする");
  assert.equal(first.orderDone, 0);

  const repeat = createEconomicState();
  repeat.orderDone = 1;
  repeat.f30.tools = { prod: 1, cons: 0, imp: 0, exp: 0 };
  const skipped = runCompanyDayStart(repeat, { day: 75, random: () => 0.9 });
  assert.equal(skipped.created, null, "二件目以降は従来どおり50%抽選を使う");
  assert.equal(repeat.orderOffer, null);

  const sized = createEconomicState();
  sized.orderDone = 1;
  sized.f30.tools = { prod: 6, cons: 0, imp: 0, exp: 0 };
  const sizedRolls = [0, 0];
  const created = runCompanyDayStart(sized, { day: 75, random: () => sizedRolls.shift() });
  assert.equal(created.created.qty, 30, "通常注文は直近日次余剰5日分の規模にする");

  const locallyUsed = createEconomicState();
  locallyUsed.orderDone = 1;
  locallyUsed.f30.tools = { prod: 6, cons: 4, imp: 0, exp: 0 };
  const surplusRolls = [0, 0];
  const surplusOrder = runCompanyDayStart(locallyUsed, {
    day: 75, random: () => surplusRolls.shift(),
  });
  assert.equal(surplusOrder.created.qty, 10,
    "島内消費分を本国注文へ回さず、余剰だけを数える");
});

test("段22: 支度金・信用限度・月利・破産を会社台帳と本土境界へ記帳する", () => {
  const economy = createEconomicState();
  assert.equal(companyCreditLimit(economy, { day: 1 }), 6000);
  assert.equal(fundSettlementZone(economy, {
    job: "logger", x: 3, y: 4, day: 1,
  }), true);
  assert.deepEqual(economy.zones, [{
    job: "logger", x: 3, y: 4, buildingId: null, filled: false,
  }]);
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
  household.pantry.wheat = householdEat(household) * 3;
  const births = runBirthPhase(economy, { day: 30, random: () => 0 });

  assert.equal(births.length, 1);
  assert.equal(household.members.length, 11);
  assert.deepEqual(
    { ...household.members.at(-1), id: undefined },
    { name: "ハンス", sex: "♂", age: 0, id: undefined },
  );
  assert.match(household.members.at(-1).id, /^person\d+$/);
  assert.equal(runBirthPhase(economy, { day: 60, random: () => 0 }).length, 0);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段23: 家督分家の持ち出しは財布の頭数比と開拓キット水準の食料だけで何も印刷しない", () => {
  const economy = createEconomicState();
  const donor = createHousehold(economy, { job: "veg", x: 2, y: 3 });
  donor.members = Array.from({ length: 10 }, (_, index) => ({
    name: `家族${index}`, sex: index % 2 ? "♀" : "♂", age: 20 + index,
  }));
  for (const [index, goods] of GOODS.entries()) donor.pantry[goods] = (index + 1) * 10;
  donor.pantry.wheat = 3000;
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
  const foodCarry = 240;
  assert.equal(successor.pantry.wheat, foodCarry, "食料は移民の開拓キット同水準を上限に持ち出す");
  assert.equal(donor.pantry.wheat, 3000 - foodCarry);
  for (const goods of GOODS) {
    if (FOODS.includes(goods)) continue;
    assert.equal(successor.pantry[goods], 0, `非食料${goods}は親元に残る`);
  }
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

test("段23履歴/段44改定: 転職候補は自宅地形でなく実在する空き職建物に絞る", () => {
  const physical = createEconomicTestPhysical();
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 5, y: 3 });
  const home = addEconomicTestBuilding(physical, "logger", 2, 2, 5, 3, household.id);
  household.buildingId = home.id;
  assert.deepEqual(jobSelectionWeights(economy, physical, {
    exclude: household.job,
    household,
  }), []);

  addEconomicTestBuilding(physical, "woodshop", 10, 2, 9, 3);
  assert.deepEqual(jobSelectionWeights(economy, physical, {
    exclude: household.job,
    household,
  }).map(([job]) => job), ["woodshop"]);
});

test("段23履歴/段44改定: 初収穫前の麦を守り、困窮職は空き建物へだけ移住する", () => {
  const physical = createEconomicTestPhysical();
  const guardedEconomy = createEconomicState();
  const guardedWheat = createHousehold(guardedEconomy, { job: "wheat", x: 6, y: 3 });
  const guardedHome = addEconomicTestBuilding(physical, "wheat", 2, 2, 6, 3, guardedWheat.id);
  guardedWheat.buildingId = guardedHome.id;
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
  const switchPhysical = createEconomicTestPhysical();
  const household = createHousehold(economy, { job: "logger", x: 5, y: 3 });
  const oldHome = addEconomicTestBuilding(
    switchPhysical,
    "logger",
    2,
    2,
    5,
    3,
    household.id,
  );
  const wheatHome = addEconomicTestBuilding(switchPhysical, "wheat", 10, 2, 9, 3);
  household.buildingId = oldHome.id;
  economy.jobSelectionPool = ["wheat"];
  household.hungerHist = Array(P.DISTRESS).fill(1);
  household.jobCycleDone = true;
  const changes = runPopulationDynamicsPhase(economy, switchPhysical, {
    day: 360,
    random: () => 0,
  });
  assert.equal(household.job, "wheat");
  assert.equal(household.jobCycleDone, false);
  assert.equal(household.lastSwitch, 360);
  assert.equal(household.buildingId, wheatHome.id);
  assert.equal(oldHome.ownerHouseholdId, null);
  assert.equal(wheatHome.ownerHouseholdId, household.id);
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

test("段24履歴/§0.2: 旧監査28項目を診断として維持しE20残差を守る", () => {
  assert.equal(typeof runFlowIslandAudit, "function");
  assert.equal(typeof economicMaterialSnapshot, "function");
});

test("段25: 市場徒歩便は売り荷と買い荷をcargo経由でだけ確定する", () => {
  const { economy, physical } = createLogisticsTestFixture();
  const household = createHousehold(economy, { job: "logger", x: 1, y: 1 });
  for (const goods of GOODS) household.pantry[goods] = 0;
  for (const goods of ["tools", "salt", "char", "cloth", "iron"]) {
    household.pantry[goods] = 100;
  }
  household.pantry.log = 100;
  economy.importStock.wheat = 100;
  economy.importStockCost.wheat = 100 * P.IMP_COST.wheat;
  depositInventory(companyLogisticsSite(physical, "market"), "inbound", "wheat", 100);

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
  assert.equal(trip.carrier.capacity, 20);
  assert.equal(trip.carrier.porters.length, 5);
  assert.ok(trip.carrier.porters.every((porter) => porter.people === 1));
  assert.equal(
    new Set(trip.carrier.porters.map((porter) => porter.memberId)).size,
    5,
  );
  assert.deepEqual(
    trip.carrier.porters.map((porter) => porter.departureDelay),
    [0, 0.22, 0.44, 0.66, 0.88],
  );
  for (const porter of trip.carrier.porters) {
    const load = Object.entries(porter.cargo.manifest).reduce(
      (totalWeight, [goods, qty]) => totalWeight + qty * (["ore", "bar"].includes(goods) ? 2 : 1),
      0,
    );
    assert.ok(load <= porter.capacity + 1e-9);
  }
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

test("25C: 個人運搬は素手2・背負い4・木荷車8・鉄荷車16を安定IDへ割り当てる", () => {
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 0, y: 0 });
  household.pantry.tools = 0;
  const hand = householdTransportPlan(household);
  assert.ok(hand.every((porter) => porter.capacity === 2 && porter.tier === "hand"));
  assert.equal(new Set(hand.map((porter) => porter.memberId)).size, household.members.length);

  household.pantry.tools = 0.5;
  const backpack = householdTransportPlan(household);
  assert.ok(backpack.every((porter) => porter.capacity === 4 && porter.tier === "backpack"));

  household.cart = { id: "cart-test", kind: "wood" };
  const wood = householdTransportPlan(household);
  assert.deepEqual([wood[0].tier, wood[0].capacity], ["wood_cart", 8]);
  assert.ok(wood.slice(1).every((porter) => porter.capacity === 4));

  household.cart.kind = "iron";
  const iron = householdTransportPlan(household);
  assert.deepEqual([iron[0].tier, iron[0].capacity], ["iron_cart", 16]);

  delete economy.nextPersonId;
  delete household.members[0].id;
  household.members[1].id = household.members[2].id;
  const successor = createHousehold(economy, { job: "veg", x: 1, y: 0 });
  const ids = economy.households.flatMap((row) => row.members.map((member) => member.id));
  assert.equal(new Set(ids).size, ids.length, "旧状態の欠落・重複IDも次の生成時に補修する");
  assert.ok(successor.members.every((member) => /^person\d+$/.test(member.id)));
});

test("25C: 売り便は2日分をまとめて分散出発し、空腹時は待たない", () => {
  const createReadyHousehold = () => {
    const fixture = createLogisticsTestFixture();
    const household = createHousehold(fixture.economy, { job: "logger", x: 1, y: 1 });
    for (const goods of GOODS) household.pantry[goods] = 0;
    for (const goods of [...FOODS, "tools", "salt", "char"]) household.pantry[goods] = 100;
    household.purse = 100;
    return { ...fixture, household };
  };

  const ready = createReadyHousehold();
  ready.economy.currentDay = 1;
  ready.household.pantry.log = 6;
  decideHouseholdTrips(ready.economy, ready.physical);
  assert.equal(ready.household.state, "home", "1日分では売りだけの便を出さない");
  assert.equal(ready.household.marketBatchWaitSinceDay, 1);

  ready.economy.currentDay = 2;
  decideHouseholdTrips(ready.economy, ready.physical);
  assert.equal(ready.household.state, "toMarket");
  assert.equal(ready.household.marketCarrier.reason, "routine_batch");
  assert.equal(ready.household.marketCarrier.porters.length, 1);
  assert.equal(ready.household.marketCarrier.porters[0].capacity, 4);
  assert.equal(ready.household.marketBatchWaitSinceDay, null);

  const emergency = createReadyHousehold();
  emergency.economy.currentDay = 1;
  for (const goods of FOODS) emergency.household.pantry[goods] = 0;
  emergency.household.pantry.log = 2;
  decideHouseholdTrips(emergency.economy, emergency.physical);
  assert.equal(emergency.household.state, "toMarket", "空腹なら満載を待たず買い出しへ出る");
  assert.equal(emergency.household.marketCarrier.reason, "food_urgent");
});

test("25C: 道普請へは家族の一人だけを決定的に割り当て、残る人の生産分を保つ", () => {
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceDays(30);
  const { economy, physical } = world.state;
  const household = economy.households.find((row) => row.state === "home");
  assert.ok(household);
  for (const goods of FOODS) household.pantry[goods] = 0;
  household.purse = 0;
  let worksite = null;
  for (let radius = 2; radius <= 8 && !worksite; radius += 1) {
    for (let offset = -radius; offset <= radius && !worksite; offset += 1) {
      worksite = planRoadWorksite(
        physical,
        Math.round(household.x) + radius,
        Math.round(household.y) + offset,
        { workRequired: P.ROAD_WORK },
      );
    }
  }
  assert.ok(worksite);

  const phase = householdDepartureTime(household);
  api.advanceTicks(phase);
  assert.equal(household.state, "toWork");
  assert.ok(household.workCarrier);
  assert.equal(household.workCarrier.people, 1);
  assert.equal(household.workCarrier.memberId, household.members[0].id);
  assert.equal(
    household.productionMultiplier,
    (household.members.length - 1) / household.members.length,
  );
  assert.equal(
    household.members.filter((member) => member.id === household.workCarrier.memberId).length,
    1,
  );
});

test("26B: 世帯ID由来の実出発を日の初めの7tickへ決定的に分散する", () => {
  const createDepartureWorld = () => {
    const fixture = createLogisticsTestFixture();
    const home = addEconomicTestBuilding(fixture.physical, "logger", 7, 6, 7, 5);
    const world = createWorld({
      seed: 23,
      physicalState: fixture.physical,
      market: { ...fixture.economy.market },
      warehouse: { ...fixture.economy.warehouse },
      port: { ...fixture.economy.port },
      logisticsSites: structuredClone(fixture.economy.logisticsSites),
    });
    for (let index = 0; index < 7; index += 1) {
      const household = createHousehold(world.state.economy, {
        job: "logger",
        x: 7,
        y: 5,
      });
      household.buildingId = home.id;
      for (const goods of GOODS) household.pantry[goods] = 0;
      for (const goods of [...FOODS, "tools", "salt", "char"]) household.pantry[goods] = 100;
      for (const goods of FOODS) household.pantry[goods] = 0;
      household.purse = 100;
    }
    return world;
  };

  const expectedPhases = Array.from({ length: 7 }, (_, id) => (
    householdDepartureTime({ id })
  ));
  assert.deepEqual(expectedPhases, [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(
    expectedPhases,
    Array.from({ length: 7 }, (_, id) => householdDepartureTime({ id })),
    "同じIDは再実行しても同じ位相になる",
  );
  assert.deepEqual(HOUSEHOLD_DEPARTURE_WINDOW, { start: 1, end: 7 });

  const observeDepartures = () => {
    const world = createDepartureWorld();
    const firstDeparture = new Map();
    for (let tick = 1; tick <= HOUSEHOLD_DEPARTURE_WINDOW.end; tick += 1) {
      world.tickOnce();
      for (const household of world.state.economy.households) {
        if (household.tookMarketTripToday && !firstDeparture.has(household.id)) {
          firstDeparture.set(household.id, world.state.tick % 30);
        }
      }
      if (tick < HOUSEHOLD_DEPARTURE_WINDOW.start) {
        assert.equal(firstDeparture.size, 0, `${tick}時にはまだ出発しない`);
      }
    }
    return {
      phases: [...firstDeparture.entries()],
      states: world.state.economy.households.map((household) => ({
        id: household.id,
        state: household.state,
        tookMarketTripToday: household.tookMarketTripToday,
      })),
    };
  };

  const first = observeDepartures();
  assert.deepEqual(
    first.phases,
    expectedPhases.map((phase, id) => [id, phase]),
    "判定表示だけでなく各世帯の実marketCarrierが固有時刻に出る",
  );
  assert.equal(new Set(first.phases.map(([, phase]) => phase)).size, 7);
  assert.deepEqual(observeDepartures(), first, "同一seedの実状態遷移も決定的");
});

test("段26: 市場往復tickが生産倍率を一意に決め30tick超も複数日で往復する", () => {
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
  const travellerShare = trip.carrier.porters.length / household.members.length;
  assert.equal(
    household.productionMultiplier,
    (1 - travellerShare) + travellerShare * (16 / 30),
  );

  const farEconomy = createEconomicState();
  farEconomy.market = { x: 15, y: 0 };
  const far = createHousehold(farEconomy, { job: "logger", x: 0, y: 0 });
  assert.equal(marketTripDuration(farEconomy, physical, far), 32);
  const farTrip = beginMarketTrip(farEconomy, physical, far);
  assert.equal(farTrip.started, true);
  assert.equal(farTrip.tripTicks, 32);
  assert.equal(far.state, "toMarket");
  assert.equal(far.cargo.direction, "outbound");
  assert.ok(far.marketCarrier.porters.length > 0);
  assert.equal(productionMultiplierForTrip(30), 0);
  assert.equal(productionMultiplierForTrip(Infinity), 0);
  assert.equal("TRAVEL_RATE" in P || "ROAD_F" in P || "TRAVEL_MAX" in P, false);
});

test("段27: tripCostと貯倉庫目標は直線でなく徒歩pathLenを使う", () => {
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
    targetDays * householdEat(household) / 4,
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
  const terrain = Array.from({ length: 7 }, () => (
    Array.from({ length: 7 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 7, height: 7, terrain });
  const economy = createEconomicState();
  const woodshop = createHousehold(economy, { job: "woodshop", x: 3, y: 3 });
  woodshop.workTool = {
    kind: "wood", durability: 100, maxDurability: 100, acquiredDay: 1,
  };
  ensureHouseholdInputSites(economy, physical);
  const building = physical.buildings.find((candidate) => candidate.id === woodshop.buildingId);
  assert.deepEqual({ w: building.w, h: building.h, point: building.point }, {
    w: 3, h: 3, point: undefined,
  });
  assert.equal(sectionAmount(building, "input", "log"), 20);
  assert.equal(woodshop.pantry.log, 0);

  withdrawInventory(building, "input", "log", 20);
  woodshop.pantry.log = 100;
  woodshop.pantry.tools = 0;
  producePrimaryTick(economy, physical, woodshop, { day: 1, fraction: 1 });
  assert.equal(woodshop.pantry.tools, 0);
  assert.equal(woodshop.pantry.log, 100);

  depositInventory(building, "input", "log", 30);
  producePrimaryTick(economy, physical, woodshop, { day: 1, fraction: 1 });
  assert.equal(woodshop.pantry.tools, P.Y_TOOLS);
  assert.equal(sectionAmount(building, "input", "log"), 30 - P.Y_TOOLS * P.LOG_TOOL);
  assert.equal(productionInputAmount(physical, woodshop, "log"), 6);
});

test("段28: 市場で買った生産原料は帰宅時にinput棚へ確定する", () => {
  const physical = createPhysicalState({
    width: 7,
    height: 7,
    terrain: Array.from({ length: 7 }, () => (
      Array.from({ length: 7 }, () => ({ kind: "grass", variant: 0 }))
    )),
  });
  const economy = createEconomicState();
  const saltworks = createHousehold(economy, { job: "saltworks", x: 3, y: 3 });
  ensureHouseholdInputSites(economy, physical);
  const building = physical.buildings.find((candidate) => candidate.id === saltworks.buildingId);
  const before = sectionAmount(building, "input", "char");
  saltworks.cargo = { direction: "inbound", manifest: { char: 4, wheat: 6 } };

  unloadMarketBuyCargo(saltworks, physical);
  assert.equal(sectionAmount(building, "input", "char"), before + 4);
  assert.equal(saltworks.pantry.char, 0);
  assert.equal(saltworks.pantry.wheat, 240 + 6);
});

test("段29: 非接続の会社物流は輸送人員を生成せず接続後だけ有限の手運びで運ぶ", () => {
  const { economy, physical } = createLogisticsTestFixture();
  const seller = createHousehold(economy, { job: "woodshop", x: 8, y: 8 });
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

  assert.equal(addRoadLine(physical, economy.market, economy.warehouse).ok, true);
  const purchases = runCompanyProcurement(economy, { day: 2, physical });
  assert.ok(purchases.length > 0);
  assert.equal(purchases.every((purchase) => purchase.jobId), true);
  assert.equal(economy.stock.tools ?? 0, 0);
  assert.equal(physical.haulJobs.every((job) => job.carrier.mode === "walk"), true);
  assert.equal(
    physical.haulJobs.reduce((total, job) => total + job.carrier.people, 0)
      <= P.COMPANY_HAND_PORTERS,
    true,
  );
  assertMaterialBalance({
    before,
    after: economicMaterialSnapshot(economy, physical),
    flows: {},
  });

  for (let tick = 0; tick < 30 && (economy.stock.tools ?? 0) < offered; tick += 1) {
    stepHaulCarriers(physical, 1);
    settleCompanyLogistics(economy, physical, { day: 3 });
    runCompanyProcurement(economy, { day: 3, physical });
  }
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
  assert.equal(release.carrier.mode, "walk");
  const requestedRelease = Math.min(16, offered);
  for (let tick = 0; tick < 80 && (economy.marketStock.tools ?? 0) < requestedRelease; tick += 1) {
    stepHaulCarriers(physical, 1);
    settleCompanyLogistics(economy, physical, { day: 4 });
  }
  assert.equal(economy.marketStock.tools, requestedRelease);
  assert.equal(economy.stock.tools, offered - requestedRelease);
  assert.equal(
    sectionAmount(companyLogisticsSite(physical, "market"), "inbound", "tools"),
    requestedRelease,
  );
});

test("需要網7: 受諾注文の在庫目標は市場の小売棚を倉庫在庫として数えない", () => {
  const { economy, physical } = createLogisticsTestFixture();
  assert.equal(addRoadLine(physical, economy.market, economy.warehouse).ok, true);
  const seller = createHousehold(economy, { job: "woodshop", x: 8, y: 8 });
  seller.pantry.tools = 20;
  sellAtMarket(economy, physical, seller, { day: 1, random: () => 0 });
  economy.marketStock.tools = 5;
  setCompanyStockTarget(economy, "tools", 5);

  assert.deepEqual(runCompanyProcurement(economy, { day: 1, physical }), [],
    "通常の在庫目標では会社所有の市場棚も数える");
  economy.order = { g: "tools", qty: 5, left: 5, price: 2.5, due: 90 };
  const purchases = runCompanyProcurement(economy, { day: 2, physical });
  assert.ok(purchases.length > 0, "注文中は契約分を倉庫へ別に確保する");
  assert.ok(purchases.reduce((total, purchase) => total + purchase.qty, 0) > 0);
});

test("段42: 本国注文は港到着後も未決済で船への逐次荷役分だけ売上になる", () => {
  const { economy, physical } = createLogisticsTestFixture({ connectPort: true });
  const warehouse = companyLogisticsSite(physical, "warehouse");
  economy.stock.tools = 8;
  economy.stockCost.tools = 8;
  depositInventory(warehouse, "storage", "tools", 8);
  economy.order = { g: "tools", qty: 8, left: 8, price: 2.5, due: 90 };
  const before = economicMaterialSnapshot(economy, physical);
  const moneyBefore = economy.company.money;

  const start = runCompanyDayStart(economy, { day: 2, random: () => 1, physical });
  assert.equal(start.dispatched.length, 1);
  const orderJob = physical.haulJobs.find((job) => job.id === start.dispatched[0].jobId);
  assert.equal(orderJob.carrier.porters.length, 4);
  assert.ok(orderJob.carrier.porters.every((porter) => porter.people === 1));
  assert.equal(economy.order.left, 8);
  assert.equal(economy.company.money, moneyBefore);
  assert.equal(economy.stock.tools, 0);
  assertMaterialBalance({
    before,
    after: economicMaterialSnapshot(economy, physical),
    flows: {},
  });

  for (let tick = 0; tick < 20 && physical.activeHaulJobIds.length > 0; tick += 1) {
    stepHaulCarriers(physical, 1);
    settleCompanyLogistics(economy, physical, { day: 2 });
  }
  assert.equal(economy.order.left, 8);
  assert.equal(economy.company.money, moneyBefore);
  assert.equal(economy.stock.tools, 0);
  assert.equal(sectionAmount(companyLogisticsSite(physical, "port"), "outbound", "tools"), 8);
  assert.equal(
    physical.portCalls.reduce((total, call) => total + call.remaining, 0),
    8,
  );

  const firstTransfers = stepPortHandling(physical, 3);
  settlePortTransfers(economy, physical, { day: 3, transfers: firstTransfers });
  assert.equal(firstTransfers.length, 3);
  assert.equal(economy.order.left, 5);
  assert.equal(economy.company.money, moneyBefore + 3 * 2.5 * 1.25);
  assert.equal(sectionAmount(companyLogisticsSite(physical, "port"), "outbound", "tools"), 5);

  const lastTransfers = stepPortHandling(physical, 5);
  settlePortTransfers(economy, physical, { day: 3, transfers: lastTransfers });
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

test("需要網7: 期限付き注文船は通常輸出入の待ち列より先に接岸する", () => {
  const { physical } = createLogisticsTestFixture({ connectPort: true });
  const port = companyLogisticsSite(physical, "port");
  const active = dockVessel(physical, {
    portBuildingId: port.id, direction: "import", goods: "wheat", qty: 1,
    metadata: { kind: "import" },
  });
  const normal = dockVessel(physical, {
    portBuildingId: port.id, direction: "import", goods: "salt", qty: 1,
    metadata: { kind: "import" },
  });
  const order = dockVessel(physical, {
    portBuildingId: port.id, direction: "export", goods: "tools", qty: 1,
    metadata: { kind: "order", yardReady: true },
  });
  assert.deepEqual(physical.activePortCallIds, [order.id]);
  assert.deepEqual(physical.portCallQueueIds, [active.id, normal.id]);
  assert.equal(active.status, "waiting", "通常船の残荷は待機に戻して保持する");
});

test("需要網7: 終了済みの接岸索引が残っても待機船は次tickに荷役を再開する", () => {
  const { physical } = createLogisticsTestFixture({ connectPort: true });
  const port = companyLogisticsSite(physical, "port");
  const stale = dockVessel(physical, {
    portBuildingId: port.id, direction: "import", goods: "wheat", qty: 1,
    metadata: { kind: "import" },
  });
  const waiting = dockVessel(physical, {
    portBuildingId: port.id, direction: "import", goods: "salt", qty: 1,
    metadata: { kind: "import" },
  });
  stale.status = "completed";
  const transfers = stepPortHandling(physical, 1);
  assert.equal(waiting.status, "completed");
  assert.equal(transfers[0].callId, waiting.id);
});

test("需要網7: 接岸索引から落ちたdocked船は状態から復旧して荷役する", () => {
  const { physical } = createLogisticsTestFixture({ connectPort: true });
  const port = companyLogisticsSite(physical, "port");
  const call = dockVessel(physical, {
    portBuildingId: port.id, direction: "import", goods: "wheat", qty: 1,
    metadata: { kind: "import" },
  });
  physical.activePortCallIds = [];
  const transfers = stepPortHandling(physical, 1);
  assert.equal(call.status, "completed");
  assert.equal(transfers[0].callId, call.id);
});

test("需要網7: 実行対象索引から落ちた運搬中の荷は状態から復旧して動き続ける", () => {
  const { physical } = createLogisticsTestFixture({ connectMarketWarehouse: true });
  const market = companyLogisticsSite(physical, "market");
  const warehouse = companyLogisticsSite(physical, "warehouse");
  depositInventory(market, "outbound", "tools", 1);
  const job = createHaulJob(physical, {
    from: { building: market, section: "outbound" },
    to: { building: warehouse, section: "storage" },
    goods: "tools",
    qty: 1,
    carrier: createWalkCarrier(physical),
  });
  physical.activeHaulJobIds = [];
  for (let tick = 0; tick < 30 && job.status === "in_transit"; tick += 1) {
    stepHaulCarriers(physical, 1);
  }
  assert.equal(job.status, "completed");
  assert.equal(sectionAmount(warehouse, "storage", "tools"), 1);
});

test("段42: 期限切れ注文の港残荷は船へ出さず倉庫へ返してヤードを空ける", () => {
  const { economy, physical } = createLogisticsTestFixture({ connectPort: true });
  const warehouse = companyLogisticsSite(physical, "warehouse");
  const port = companyLogisticsSite(physical, "port");
  economy.stock.tools = 4;
  economy.stockCost.tools = 8;
  depositInventory(warehouse, "storage", "tools", 4);
  economy.order = { g: "tools", qty: 5, left: 5, price: 2.5, due: 3 };
  const before = economicMaterialSnapshot(economy, physical);
  const moneyBefore = economy.company.money;

  runCompanyDayStart(economy, { day: 1, random: () => 1, physical });
  for (let tick = 0; tick < 20 && physical.haulJobs[0].status !== "completed"; tick += 1) {
    stepHaulCarriers(physical, 1);
  }
  settleCompanyLogistics(economy, physical, { day: 2 });
  assert.equal(sectionAmount(port, "outbound", "tools"), 4);
  assert.equal(physical.portCalls[0].status, "docked");

  const dueDay = runCompanyDayStart(economy, { day: 3, random: () => 1, physical });
  assert.equal(dueDay.expired, null, "期限当日の荷役はまだ有効");
  const expiry = runCompanyDayStart(economy, { day: 4, random: () => 1, physical });
  assert.equal(expiry.expired.left, 5);
  assert.equal(physical.portCalls[0].status, "cancelled");
  assert.equal(sectionAmount(port, "outbound", "tools"), 0);
  assert.deepEqual(stepPortHandling(physical, 10), []);
  for (let tick = 0; tick < 20 && (economy.stock.tools ?? 0) < 4; tick += 1) {
    stepHaulCarriers(physical, 1);
    settleCompanyLogistics(economy, physical, { day: 4 });
  }
  assert.equal(economy.stock.tools, 4);
  assert.equal(economy.stockCost.tools, 8);
  assert.equal(sectionAmount(warehouse, "storage", "tools"), 4);
  assert.equal(economy.company.money, moneyBefore);
  assertMaterialBalance({
    before,
    after: economicMaterialSnapshot(economy, physical),
    flows: economy.dailyMaterialFlows,
  });
});

test("段42: CO輸入は船から1荷/tickでヤードへ降ろし荷車で市場へ届いた後だけ買える", () => {
  const { economy, physical } = createLogisticsTestFixture({ connectPort: true });
  const request = requestCompanyImport(economy, physical, "wheat", { day: 1, qty: 3 });
  const moneyBefore = economy.company.money;
  assert.ok(request);
  assert.equal(economy.imported.wheat, undefined);
  assert.equal(economy.importStock.wheat, undefined);

  const first = stepPortHandling(physical, 1);
  settlePortTransfers(economy, physical, { day: 1, transfers: first });
  assert.equal(first.length, 1);
  assert.equal(first[0].qty, 1);
  assert.equal(economy.imported.wheat, 1);
  assert.equal(economy.importStock.wheat, undefined);
  assert.equal(sectionAmount(companyLogisticsSite(physical, "port"), "inbound", "wheat"), 1);
  assert.equal(economy.company.money, moneyBefore - P.IMP_COST.wheat);

  const rest = stepPortHandling(physical, 2);
  settlePortTransfers(economy, physical, { day: 1, transfers: rest });
  assert.equal(physical.haulJobs.some((job) => job.economicLogistics?.kind === "import_delivery"), true);
  for (let tick = 0; tick < 30 && (economy.importStock.wheat ?? 0) < 3; tick += 1) {
    stepHaulCarriers(physical, 1);
    settleCompanyLogistics(economy, physical, { day: 1 });
  }
  assert.equal(economy.importStock.wheat, 3);
  assert.equal(sectionAmount(companyLogisticsSite(physical, "port"), "inbound", "wheat"), 0);
  assert.equal(sectionAmount(companyLogisticsSite(physical, "market"), "inbound", "wheat"), 3);
  assert.ok(Math.abs(economy.company.money - (moneyBefore - 3 * P.IMP_COST.wheat)) < 1e-9);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段42: EXP買付は市場・倉庫・港を経て船積みした数量だけ本土売上になる", () => {
  const { economy, physical } = createLogisticsTestFixture({ connectPort: true });
  const fisher = createHousehold(economy, { job: "fisher", x: 7, y: 4 });
  fisher.pantry.pres = 100;
  const sale = sellAtMarket(economy, physical, fisher, { day: 61, random: () => 0 });
  assert.equal(sale.listed[0].goods, "pres");
  ageMarketStalls(economy, { day: 62, physical });
  ageMarketStalls(economy, { day: 63, physical });
  ageMarketStalls(economy, { day: 64, physical });
  const lot = economy.exportLots[0];
  assert.ok(lot);
  assert.equal(economy.exported.pres, undefined);
  assert.equal(economy.co.expSell, 0);

  for (let tick = 0; tick < 80 && physical.portCalls.length === 0; tick += 1) {
    stepHaulCarriers(physical, 1);
    settleCompanyLogistics(economy, physical, { day: 64 });
  }
  assert.equal(physical.portCalls.length > 0, true);
  assert.equal(economy.exported.pres, undefined);
  const first = stepPortHandling(physical, 1);
  settlePortTransfers(economy, physical, { day: 64, transfers: first });
  assert.equal(economy.exported.pres, 1);
  assert.equal(lot.shippedQty, 1);
  for (let tick = 0; tick < 200 && lot.status !== "shipped"; tick += 1) {
    stepHaulCarriers(physical, 1);
    settleCompanyLogistics(economy, physical, { day: 64 });
    const transfers = stepPortHandling(physical, 1);
    settlePortTransfers(economy, physical, { day: 64, transfers });
  }
  assert.equal(
    lot.status,
    "shipped",
    `輸出便が停止: qty=${lot.qty} market=${lot.marketQty} warehouse=${lot.warehouseQty} port=${lot.portQty} shipped=${lot.shippedQty}`,
  );
  assert.equal(economy.exported.pres, lot.qty);
  assert.equal(sectionAmount(companyLogisticsSite(physical, "port"), "outbound", "pres"), 0);
  assert.equal(assertMoneyConservation(economy), true);
});

test("段43: 購入品を先に積み残容量だけ返品を持ち帰り残りは棚へ持ち越す", () => {
  const { economy, physical } = createLogisticsTestFixture({ connectMarketWarehouse: true });
  const owner = createHousehold(economy, { job: "woodshop", x: 7, y: 4 });
  const seller = createHousehold(economy, { job: "wheat", x: 7, y: 4 });
  for (const goods of FOODS) owner.pantry[goods] = 0;
  owner.pantry.tools = 20;
  owner.cargo = { direction: "outbound", manifest: {} };
  const returnQty = householdHaul(owner) * 2;
  economy.marketReturns.push({
    id: "ret1", householdId: owner.id, goods: "tools", qty: returnQty, queuedDay: 6,
  });
  economy.nextMarketReturnId = 2;
  depositInventory(companyLogisticsSite(physical, "market"), "pickup", "tools", returnQty);
  const wheatQty = householdHaul(owner) / 2;
  seller.pantry.wheat -= wheatQty;
  economy.stalls.wheat.push({ householdId: seller.id, qty: wheatQty, price: 1, age: 0 });
  depositInventory(companyLogisticsSite(physical, "market"), "outbound", "wheat", wheatQty);

  const result = transactMarketCargo(economy, physical, owner, { day: 8, random: () => 0 });
  const boughtWeight = Object.entries(result.bought.cargo.manifest)
    .reduce((sum, [goods, qty]) => sum + qty * (goods === "ore" || goods === "bar" ? 2 : 1), 0);
  const returned = result.bought.cargo.returnManifest.tools ?? 0;
  assert.ok(boughtWeight > 0);
  assert.ok(returned > 0 && returned < returnQty);
  assert.ok(Math.abs(boughtWeight + returned - householdHaul(owner)) < 1e-9);
  assert.equal(economy.marketReturns[0].qty, returnQty - returned);
  const pantryBefore = owner.pantry.tools;
  unloadMarketBuyCargo(owner, physical);
  assert.equal(owner.pantry.tools, pantryBefore + returned);
});

test("段43: 生鮮は引き取り棚で待つ間も同じ寿命で腐敗する", () => {
  const { economy, physical } = createLogisticsTestFixture();
  const fisher = createHousehold(economy, { job: "fisher", x: 7, y: 4 });
  economy.stalls.fish.push({ householdId: fisher.id, qty: 30, price: 1, age: 5 });
  depositInventory(companyLogisticsSite(physical, "market"), "outbound", "fish", 30);
  ageMarketStalls(economy, { day: 6, physical });
  assert.ok(Math.abs(economy.marketReturns[0].qty - 20) < 1e-9);
  ageMarketStalls(economy, { day: 7, physical });
  assert.ok(Math.abs(economy.marketReturns[0].qty - (20 - 20 / P.FISH_LIFE)) < 1e-9);
  assert.ok(Math.abs(
    sectionAmount(companyLogisticsSite(physical, "market"), "pickup", "fish")
      - economy.marketReturns[0].qty,
  ) < 1e-9);
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

test("段31履歴/§0.2: 旧監査診断と物理不変条件を維持する", () => {
  const world = createAuditWorld(11);
  ensureCompanyLogisticsSites(world.state.economy, world.state.physical);
  const port = companyLogisticsSite(world.state.physical, "port");
  assert.deepEqual({ x: port.x, y: port.y }, { x: 28, y: 33 });
  assert.deepEqual(port.entrance, { x: 28, y: 32 });
  assert.equal(hasRoad(world.state.physical, 28, 32), true);
  assert.equal(hasRoad(world.state.physical, 28, 33), false);
  assert.equal(assertCarrierInvariants(world.state.physical), true);
  assert.equal(assertOccupancyInvariant(world.state.physical), true);
});

test("段31: 市場へ出す要求は有限の輸送人員で予約全量を順次運ぶ", () => {
  const { economy, physical } = createLogisticsTestFixture({ connectMarketWarehouse: true });
  const warehouse = companyLogisticsSite(physical, "warehouse");
  economy.stock.wheat = 40;
  economy.stockCost.wheat = 40;
  depositInventory(warehouse, "storage", "wheat", 40);

  const first = requestCompanyStockRelease(economy, physical, "wheat", { day: 1, qty: 40 });
  const initialJobs = physical.haulJobs
    .filter((job) => job.economicLogistics?.kind === "stock_release");
  assert.equal(first, initialJobs[0]);
  assert.deepEqual(initialJobs.map((job) => job.qty), [40]);
  assert.equal(initialJobs[0].carrier.porters.length, 20);
  assert.ok(initialJobs[0].carrier.porters.every((porter) => (
    porter.cargo.qty === 2 && porter.people === 1 && porter.capacity === 2
  )));
  assert.equal(
    new Set(initialJobs[0].carrier.porters.map((porter) => porter.departureDelay)).size,
    20,
  );
  stepHaulCarriers(physical, 1);
  assert.equal(initialJobs[0].carrier.batchElapsed, 1);
  assert.ok(new Set(initialJobs[0].carrier.porters.map((porter) => (
    Math.max(0, initialJobs[0].carrier.batchElapsed - porter.departureDelay).toFixed(3)
  ))).size > 2, "大口出庫は同期した塊でなく続けざまの個人列になる");
  assert.equal(economy.stock.wheat, 0);
  assert.deepEqual(economy.stockReleaseQueue, []);
  for (let tick = 0; tick < 200 && (economy.marketStock.wheat ?? 0) < 40; tick += 1) {
    stepHaulCarriers(physical, 1);
    settleCompanyLogistics(economy, physical, { day: 2 });
    const activePorters = physical.activeHaulJobIds
      .map(jobId => physical.haulJobs.find(job => job.id === jobId))
      .reduce((total, job) => total + (job?.carrier.people ?? 0), 0);
    assert.equal(activePorters <= P.COMPANY_HAND_PORTERS, true);
  }
  assert.equal(economy.marketStock.wheat, 40);
  assert.equal(economy.stock.wheat, 0);
  assert.deepEqual(economy.stockReleaseQueue, []);
  const jobs = physical.haulJobs.filter((job) => job.economicLogistics?.kind === "stock_release");
  assert.equal(jobs.reduce((total, job) => total + job.qty, 0), 40);
  assert.equal(sectionAmount(companyLogisticsSite(physical, "market"), "inbound", "wheat"), 40);
});

test("段32: 鉄鉱床と炭層は§6.1の座標式どおり生成される", () => {
  const terrain = makeFlowIslandTerrain();
  const actualOre = [];
  const actualCoal = [];
  const expectedOre = [];
  const expectedCoal = [];
  for (let y = 0; y < 40; y += 1) {
    for (let x = 0; x < 48; x += 1) {
      if (terrain[y][x].kind === "ore") actualOre.push(`${x},${y}`);
      if (terrain[y][x].kind === "coal") actualCoal.push(`${x},${y}`);
      if (x >= 8 && x <= 13 && y >= 20 && y <= 24 && ((x * 5 + y * 3) % 4 < 2)) {
        expectedOre.push(`${x},${y}`);
      }
      if (x >= 3 && x <= 7 && y >= 26 && y <= 30 && ((x * 7 + y * 5) % 4 < 2)) {
        expectedCoal.push(`${x},${y}`);
      }
    }
  }
  assert.deepEqual(actualOre, expectedOre);
  assert.deepEqual(actualCoal, expectedCoal);
  assert.deepEqual(GOODS.slice(-3), ["ore", "coal", "bar"]);
});

test("段32: oreとbarは重量2で徒歩・荷車の数量容量が通常財の半分", () => {
  const terrain = Array.from({ length: 3 }, () => (
    Array.from({ length: 8 }, () => ({ kind: "grass", variant: 0 }))
  ));
  const physical = createPhysicalState({ width: 8, height: 3, terrain });
  addRoadLine(physical, { x: 1, y: 1 }, { x: 6, y: 1 });
  const definitions = {
    mine: { w: 1, h: 1 },
    smelter: { w: 1, h: 1 },
  };
  const source = addBuilding(physical, "mine", 1, 0, {
    definitions,
    entrance: { x: 1, y: 1 },
    requireRoad: false,
    caps: { output: { ore: 100, bar: 100, coal: 100 } },
  }).building;
  const target = addBuilding(physical, "smelter", 6, 0, {
    definitions,
    entrance: { x: 6, y: 1 },
    requireRoad: false,
    caps: { input: { ore: 100, bar: 100, coal: 100 } },
  }).building;
  depositInventory(source, "output", "ore", 20);

  const cart = createCartCarrier(physical);
  const walkers = createWalkCarrier(physical, { people: 2 });
  assert.equal(carrierGoodsCapacity(cart, "coal"), 8);
  assert.equal(carrierGoodsCapacity(cart, "ore"), 4);
  assert.equal(carrierGoodsCapacity(cart, "bar"), 4);
  assert.equal(carrierGoodsCapacity(walkers, "coal"), 2);
  assert.equal(carrierGoodsCapacity(walkers, "ore"), 1);
  assert.throws(() => createHaulJob(physical, {
    from: { building: source, section: "output" },
    to: { building: target, section: "input" },
    goods: "ore",
    qty: 5,
    carrier: cart,
  }), /キャリア容量超過/);
  const job = createHaulJob(physical, {
    from: { building: source, section: "output" },
    to: { building: target, section: "input" },
    goods: "ore",
    qty: 4,
    carrier: cart,
  });
  assert.equal(job.carrier.cargo.qty, 4);
});

test("段33履歴/段44改定: 鉱夫・炭鉱夫の立地制約は建物の配置時に検証する", () => {
  const physical = createPhysicalState({
    width: 48,
    height: 40,
    terrain: makeFlowIslandTerrain(),
  });
  const economy = createEconomicState();
  assert.deepEqual(canPlaceSettlement(economy, physical, "miner", 8, 18), [true, ""]);
  assert.match(canPlaceSettlement(economy, physical, "miner", 8, 17)[1], /鉄鉱床/);
  assert.deepEqual(canPlaceSettlement(economy, physical, "collier", 3, 25), [true, ""]);
  assert.match(canPlaceSettlement(economy, physical, "collier", 3, 23)[1], /炭層/);

});

test("需要網7: minerとcollierは既存キットから再較正後の日産鉱石・石炭を生産する", () => {
  const physical = createPhysicalState({
    width: 48,
    height: 40,
    terrain: makeFlowIslandTerrain(),
  });
  const economy = createEconomicState();
  const miner = createHousehold(economy, { job: "miner", x: 8, y: 18 });
  const collier = createHousehold(economy, { job: "collier", x: 3, y: 25 });
  assert.equal(miner.pantry.tools, 5);
  assert.equal(miner.pantry.wheat, 240);
  assert.equal(collier.pantry.tools, 5);
  assert.equal(collier.pantry.wheat, 240);
  assert.equal(miner.pantry.ore, 0);
  assert.equal(collier.pantry.coal, 0);

  producePrimaryTick(economy, physical, miner, { day: 1, fraction: 1 });
  producePrimaryTick(economy, physical, collier, { day: 1, fraction: 1 });
  assert.equal(miner.pantry.ore, P.Y_ORE);
  assert.equal(collier.pantry.coal, P.Y_COAL);
  assert.equal(economy.materialFlows.ore.prod, P.Y_ORE);
  assert.equal(economy.materialFlows.coal.prod, P.Y_COAL);
});

test("段34: 製鉄・鍛冶の開拓キットとpx初期値を持つ", () => {
  const economy = createEconomicState();
  assert.equal(economy.px.ore, P.BELIEF0.ore);
  assert.equal(economy.px.coal, P.BELIEF0.coal);
  assert.equal(economy.px.bar, P.BELIEF0.bar);

  const smelter = createHousehold(economy, { job: "smelter", x: 20, y: 20 });
  assert.equal(smelter.pantry.tools, 5);
  assert.equal(smelter.pantry.wheat, 240);
  assert.equal(smelter.pantry.ore, 20);
  assert.equal(smelter.pantry.char, 10);

  const smith = createHousehold(economy, { job: "smith", x: 21, y: 20 });
  assert.equal(smith.pantry.tools, 5);
  assert.equal(smith.pantry.wheat, 240);
  assert.equal(smith.pantry.bar, 10);
  assert.equal(smith.pantry.char, 5);
});

test("段34: 鉱石2+燃料1→銑鉄1、銑鉄1+燃料0.5→鉄1で変換する", () => {
  const economy = createEconomicState();
  const smelter = createHousehold(economy, { job: "smelter", x: 20, y: 20 });
  smelter.pantry.ore = 4;
  smelter.pantry.char = 2;
  smelter.pantry.coal = 0;
  smelter.pantry.bar = 0;
  const smelted = producePrimaryTick(economy, null, smelter, { day: 1, fraction: 1 });
  assert.deepEqual(smelted, { bar: 2 });
  assert.equal(smelter.pantry.ore, 0);
  assert.equal(smelter.pantry.char, 0);
  assert.equal(smelter.pantry.bar, 2);
  assert.equal(economy.materialFlows.ore.cons, 4);
  assert.equal(economy.materialFlows.char.cons, 2);
  assert.equal(economy.materialFlows.bar.prod, 2);

  const smith = createHousehold(economy, { job: "smith", x: 21, y: 20 });
  smith.pantry.bar = P.Y_SMITH;
  smith.pantry.char = P.Y_SMITH * P.SMITH_FUEL;
  smith.pantry.coal = 0;
  smith.pantry.iron = 0;
  const forged = producePrimaryTick(economy, null, smith, { day: 1, fraction: 1 });
  assert.deepEqual(forged, { iron: P.Y_SMITH });
  assert.equal(smith.pantry.bar, 0);
  assert.equal(smith.pantry.char, 0);
  assert.equal(smith.pantry.iron, P.Y_SMITH);
  assert.equal(economy.materialFlows.bar.cons, P.Y_SMITH);
  assert.equal(economy.materialFlows.iron.prod, P.Y_SMITH);
});

test("段34: 製鉄・鍛冶の原料買い天井式を適用する", () => {
  const economy = createEconomicState();
  economy.px.bar = 2.2;
  economy.px.iron = 4.5;

  const smelter = createHousehold(economy, { job: "smelter", x: 20, y: 20 });
  smelter.pantry.ore = 0;
  smelter.pantry.char = 0;
  smelter.pantry.coal = 0;
  const smelterTargets = buyTargets(economy, smelter, { day: 1 });
  const smelterCeiling = 2.2 / 2 * 0.6;
  assert.deepEqual(smelterTargets.ore, [20, smelterCeiling]);
  assert.deepEqual(smelterTargets.char, [10, smelterCeiling]);
  assert.deepEqual(smelterTargets.coal, [10, smelterCeiling]);

  const smith = createHousehold(economy, { job: "smith", x: 21, y: 20 });
  smith.pantry.bar = 0;
  smith.pantry.char = 0;
  smith.pantry.coal = 0;
  const smithTargets = buyTargets(economy, smith, { day: 1 });
  const smithCeiling = 4.5 * 0.6;
  assert.deepEqual(smithTargets.bar, [10, smithCeiling]);
  assert.deepEqual(smithTargets.char, [5, smithCeiling]);
  assert.deepEqual(smithTargets.coal, [5, smithCeiling]);
});

test("段35 E-Fe3: 炭焼き小屋なしでも安い石炭棚を選び製鉄が回る", () => {
  const economy = createEconomicState();
  economy.px.bar = 4;
  const smelter = createHousehold(economy, { job: "smelter", x: 20, y: 20 });
  const coalSeller = createHousehold(economy, { job: "collier", x: 3, y: 25 });
  const otherSeller = createHousehold(economy, { job: "logger", x: 27, y: 26 });
  assert.equal(economy.households.some((household) => household.job === "charburner"), false);
  smelter.pantry.ore = 0;
  smelter.pantry.char = 0;
  smelter.pantry.coal = 0;
  smelter.pantry.bar = 0;
  smelter.purse = 100;
  economy.stalls.char.push({
    householdId: otherSeller.id,
    qty: 10,
    price: 1.1,
    age: 0,
  });
  economy.stalls.coal.push({
    householdId: coalSeller.id,
    qty: 10,
    price: 0.7,
    age: 0,
  });

  const purchase = buyAtMarket(economy, smelter, { day: 1 });
  const fuelPurchases = purchase.transactions.filter(({ goods }) => (
    goods === "char" || goods === "coal"
  ));
  assert.deepEqual(
    fuelPurchases.map(({ goods, qty, price }) => ({ goods, qty, price })),
    [{ goods: "coal", qty: 10, price: 0.7 }],
  );
  assert.equal(smelter.pantry.char, 0);
  assert.equal(smelter.pantry.coal, 10);
  assert.equal(purchase.remainingCapacity, smelter.members.length * 4 - 10);

  smelter.pantry.ore = 4;
  const produced = producePrimaryTick(economy, null, smelter, { day: 1, fraction: 1 });
  assert.deepEqual(produced, { bar: 2 });
  assert.equal(smelter.pantry.ore, 0);
  assert.equal(smelter.pantry.coal, 8);
  assert.equal(smelter.pantry.bar, 2);
});

test("需要網7: 鉄連鎖はLv0で輸入より高く全工程Lv2で国産が下回る", () => {
  const chainCost = ({ upstreamLevel, smithLevel }) => {
    const economy = createEconomicState();
    const miner = createHousehold(economy, { job: "miner", x: 0, y: 0 });
    const collier = createHousehold(economy, { job: "collier", x: 1, y: 0 });
    const smelter = createHousehold(economy, { job: "smelter", x: 2, y: 0 });
    const smith = createHousehold(economy, { job: "smith", x: 3, y: 0 });
    for (const household of [miner, collier, smelter, smith]) {
      household.members = Array.from({ length: 9 }, (_, index) => ({
        name: `算術${index}`,
        sex: "♂",
        age: 30,
      }));
    }
    miner.lv = upstreamLevel;
    collier.lv = upstreamLevel;
    smelter.lv = upstreamLevel;
    smith.lv = smithLevel;
    const ore = productionCost(economy, null, miner, "ore", { day: 1 });
    const coal = productionCost(economy, null, collier, "coal", { day: 1 });
    economy.px.ore = ore;
    economy.px.coal = coal;
    economy.px.char = 99;
    const bar = productionCost(economy, null, smelter, "bar", { day: 1 });
    economy.px.bar = bar;
    const iron = productionCost(economy, null, smith, "iron", { day: 1 });
    return { ore, coal, bar, iron };
  };

  const immature = chainCost({ upstreamLevel: 0, smithLevel: 0 });
  const levelOne = chainCost({ upstreamLevel: 1, smithLevel: 1 });
  const matured = chainCost({ upstreamLevel: 2, smithLevel: 2 });
  assert.ok(immature.iron > P.IMP.iron);
  assert.ok(levelOne.iron > P.IMP.iron);
  assert.ok(matured.iron >= 9.5 && matured.iron <= 11);
  assert.ok(matured.iron < P.IMP.iron);
  assert.ok(matured.iron < levelOne.iron);
});

test("段36: シナリオDの鉱床道路だけが遠隔2職の市場往復を30tick以内にする", () => {
  const connected = createIronAuditWorld(11, {
    depositRoads: true,
    placeHouseholds: false,
  });
  const disconnected = createIronAuditWorld(11, {
    depositRoads: false,
    placeHouseholds: false,
  });
  for (const site of IRON_AUDIT_SITES.filter(({ roadTarget }) => roadTarget)) {
    const withRoad = marketTripDuration(
      connected.state.economy,
      connected.state.physical,
      site,
    );
    const withoutRoad = marketTripDuration(
      disconnected.state.economy,
      disconnected.state.physical,
      site,
    );
    assert.ok(withRoad <= 30, `${site.job}: ${withRoad}`);
    assert.ok(withoutRoad > 30, `${site.job}: ${withoutRoad}`);
  }
});

if (includeFullAcceptance) test("段36履歴/段45: Lv4世帯4軒の成熟需要で狭めたE-Fe1/2帯と保存則を通る", async () => {
  // 8年安定監査と鉄連鎖監査を同時に5 worker走らせると、個別運搬化後は
  // CPU競合の待ち時間を監査そのものの性能劣化と誤認する。先に安定監査を閉じる。
  await fullStableAuditPromise;
  const workers = await fullIronAudit();
  const connected = workers.find(({ depositRoads }) => depositRoads).scenario;
  const disconnected = workers.find(({ depositRoads }) => !depositRoads).scenario;
  const audit = evaluateIronChainScenarios(connected, disconnected);
  assert.equal(audit.total, 4);
  assert.deepEqual(audit.results.map(({ id }) => id), ["E-Fe1", "E-Fe2", "E-Fe4", "E-Fe5"]);
  assert.equal(audit.results.find(({ id }) => id === "E-Fe5").passed, true);
  assert.equal(audit.connected.day, 1440);
  assert.equal(audit.disconnected.day, 1080);
  assert.equal(audit.passed, audit.total);
  assert.equal(IRON_DEMAND_HOUSEHOLDS, 4);
  assert.equal(IRON_DEMAND_LEVEL, 4);
  assert.equal(audit.connected.matureHouseholdIds.length, 4);
  const replacement = audit.connected.yearly.find(
    ({ day }) => day === IRON_CHAIN_BANDS.replacementByDay,
  );
  assert.ok(replacement.ironImport <= IRON_CHAIN_BANDS.ironImportMax);
  assert.ok(replacement.ironProduction >= IRON_CHAIN_BANDS.ironProductionMin);
  for (const [job, minimum] of Object.entries(IRON_CHAIN_BANDS.incomeMinimums)) {
    assert.ok(audit.connected.incomes[job] >= minimum, job);
  }
  assert.ok(Math.max(...audit.connected.yearly.map(({ ironImport }) => ironImport)) > 0);
  for (const income of Object.values(audit.connected.incomes)) assert.ok(Number.isFinite(income));
  for (const scenario of [audit.connected, audit.disconnected]) {
    assert.deepEqual(scenario.physical, { carriers: true, occupancy: true });
    for (const goods of GOODS) {
      assert.ok(Math.abs(scenario.material[goods].residual) < 1e-6, goods);
    }
  }
  assert.ok(
    Math.max(...workers.map(({ elapsedMs }) => elapsedMs)) < 60_000,
    JSON.stringify(workers.map(({ depositRoads, elapsedMs }) => ({ depositRoads, elapsedMs }))),
  );
});

test("段41: buildBaseCityは全建物を実寸・外周入口・非重複道路で配置する", () => {
  const world = buildBaseCity(11);
  const { economy, physical } = world.state;
  assert.equal(world.state.day, 0);
  assert.equal(world.state.seed, 11);
  assert.deepEqual(economy.market, { x: 25, y: 28 });
  assert.deepEqual(economy.warehouse, { x: 28, y: 30 });
  assert.deepEqual(economy.port, { x: 28, y: 32 });
  assert.deepEqual(
    economy.zones.map(({ job, x, y, buildingId, filled }) => {
      const building = physical.buildings.find((candidate) => candidate.id === buildingId);
      return [job, x, y, building.x, building.y, filled];
    }),
    E_STABLE_BASE.map(([job, x, y, buildingX, buildingY]) => (
      [job, x, y, buildingX, buildingY, false]
    )),
  );
  const market = companyLogisticsSite(physical, "market");
  const warehouse = companyLogisticsSite(physical, "warehouse");
  const port = companyLogisticsSite(physical, "port");
  assert.deepEqual([market.w, market.h], [5, 5]);
  assert.deepEqual([warehouse.w, warehouse.h], [4, 4]);
  assert.deepEqual([port.w, port.h], [4, 3]);
  assert.equal(port.roles.includes("trade_port"), true);
  assert.equal(physical.buildings.every((building) => building.w > 0 && building.h > 0), true);
  assert.equal(Object.keys(physical.occupied).length, 212);
  assert.equal(assertOccupancyInvariant(physical), true);
  assert.equal(hasRoad(physical, port.entrance.x, port.entrance.y), true);
  assert.equal(isConnected(physical, market, warehouse), true);
  assert.equal(isConnected(physical, warehouse, port), true);
  for (const zone of economy.zones) {
    assert.ok(pathLen(physical, zone, economy.market) <= 12, `${zone.job}@${zone.x},${zone.y}`);
  }
});

test("段46: E-Stable配置は市場アンカーからの相対生成式でpathLen帯を満たす", () => {
  const shiftedAnchor = { x: 40, y: 50 };
  const shifted = makeStableCityPlan(shiftedAnchor);
  assert.deepEqual(shifted.anchor, shiftedAnchor);
  assert.deepEqual(
    shifted.layout.map(([job, x, y, buildingX, buildingY]) => [
      job,
      x - shiftedAnchor.x,
      y - shiftedAnchor.y,
      buildingX - shiftedAnchor.x,
      buildingY - shiftedAnchor.y,
    ]),
    E_STABLE_RELATIVE_LAYOUT,
  );
  assert.deepEqual(makeStableCityPlan(E_STABLE_MARKET_ANCHOR).layout, E_STABLE_BASE);

  const world = buildBaseCity(11);
  const distances = world.state.economy.zones.map((zone) => (
    pathLen(world.state.physical, zone, world.state.economy.market, "walk")
  ));
  assert.ok(Math.min(...distances) >= E_STABLE_PATH_BAND[0] - 1e-9);
  assert.ok(Math.max(...distances) <= E_STABLE_PATH_BAND[1] + 1e-9);
});

if (includeFullAcceptance) test("段47: 相対悪配置はpathLen>25で良配置との失敗シグネチャを示す", async () => {
  const badWorld = buildBadCity(11);
  for (const zone of badWorld.state.economy.zones) {
    assert.ok(
      pathLen(badWorld.state.physical, zone, badWorld.state.economy.market, "walk")
        > E_STABLE_BAD_MIN_PATH,
      `${zone.job}@${zone.x},${zone.y}`,
    );
  }
  const [stableWorkers, ironWorkers] = await Promise.all([
    fullStableAuditPromise,
    fullIronAudit(),
  ]);
  const goodAtFourYears = stableWorkers
    .find(({ seed, mode }) => seed === 11 && mode === "api")
    .apiScenario.yearly.find(({ day }) => day === 1440);
  const bad = ironWorkers.find(({ depositRoads }) => !depositRoads).badScenario;
  assert.deepEqual(
    { day: goodAtFourYears.day, population: goodAtFourYears.population, famine: goodAtFourYears.famine },
    badBaselineYearly[0],
  );
  assert.equal(bad.passed, true);
  assert.ok(bad.failureSignature.famineRatio >= E_STABLE_BAD_FAMINE_RATIO_MIN);
  assert.ok(bad.failureSignature.populationRatio <= E_STABLE_BAD_POPULATION_RATIO_MAX);
  assert.deepEqual(bad.physical, { carriers: true, occupancy: true });
  assert.equal(bad.material.passed, true);
});

test("段37: mimicPlayerは5日商館目標と90日ごと1軒の枯れ職再建を模写する", () => {
  const world = buildBaseCity(11);
  const { economy } = world.state;
  const household = createHousehold(economy, { job: "veg", x: 20, y: 30 });
  economy.order = { g: "salt", left: 23 };
  economy.stock.salt = 7;

  assert.deepEqual(mimicPlayer(world, 1), {
    stockTargetsUpdated: false,
    acceptedOrder: null,
    rebuilt: null,
  });
  assert.deepEqual(mimicPlayer(world, 5), {
    stockTargetsUpdated: true,
    acceptedOrder: null,
    rebuilt: null,
  });
  assert.equal(economy.stockTgt.salt, 30);
  assert.equal(economy.stockTgt.wheat, household.members.length * 2);

  economy.zones = economy.zones.filter(({ job }) => job !== "woodshop");
  const before = economy.zones.length;
  assert.deepEqual(mimicPlayer(world, 90), {
    stockTargetsUpdated: true,
    acceptedOrder: null,
    rebuilt: "woodshop",
  });
  assert.equal(economy.zones.length, before + 1);
  assert.equal(economy.zones.filter(({ job }) => job === "woodshop").length, 1);
});

test("段46: mimicPlayerは採算内の注文だけ受諾し終了後に目標を解除する", () => {
  const world = buildBaseCity(11);
  const { economy } = world.state;
  economy.orderOffer = { g: "cloth", qty: 20, left: 20, price: 2, due: 100 };
  economy.stalls.cloth.push({ householdId: 1, qty: 20, price: 4, age: 0 });
  assert.equal(mimicPlayer(world, 1).acceptedOrder, null);
  assert.equal(economy.order, null);
  assert.equal(economy.stockTgt.cloth ?? 0, 0);

  economy.stalls.cloth[0].price = 1.5;
  const accepted = mimicPlayer(world, 2);
  assert.equal(accepted.acceptedOrder.g, "cloth");
  assert.equal(economy.stockTgt.cloth, 20);

  economy.order = null;
  const cleared = mimicPlayer(world, 3);
  assert.equal(cleared.stockTargetsUpdated, true);
  assert.equal(economy.stockTgt.cloth, 0);
});

test("支援要請: 逓減と拒絶・既存輸入経路での実配送・journal決定論(Nao_u裁可2026-07-20)", () => {
  const api = createEngineApi(buildBaseCity(11));
  const first = api.applyOperation({ type: "request_aid" });
  assert.deepEqual([first.ok, first.qty, first.requests], [true, 240, 1]);
  assert.equal(api.applyOperation({ type: "request_aid" }).qty, 180);
  assert.equal(api.applyOperation({ type: "request_aid" }).qty, 120);
  assert.equal(api.applyOperation({ type: "request_aid" }).qty, 60);
  const fifth = api.applyOperation({ type: "request_aid" });
  assert.deepEqual([fifth.ok, fifth.refused], [false, true]);
  const economy = api.snapshot({ scope: "full" }).economy;
  assert.equal(economy.mainlandAid.requests, 4);
  for (const qty of [240, 180, 120, 60]) {
    const request = economy.importRequests.find((row) => row.goods === "wheat" && row.qty === qty);
    assert.ok(request, `支援${qty}荷が輸入要請として実在する`);
    assert.deepEqual([request.aid, request.unitCost], [true, 0], "支援は贈与(仕入原価0)");
  }
  for (let tick = 0; tick < 12 * 30; tick += 1) api.advanceTicks(1);
  const after = api.snapshot({ scope: "full" }).economy;
  const delivered = (after.imported?.wheat ?? 0);
  assert.ok(delivered >= 240, `支援の麦が実際に上陸している(累計輸入${delivered.toFixed(1)}荷)`);

  let replayTick = 0;
  const replay = createEngineApi(buildBaseCity(11));
  for (const row of api.inputJournal()) {
    while (replayTick < row.tick) { replay.advanceTicks(1); replayTick += 1; }
    replay.applyOperation(row.op);
  }
  while (replayTick < 12 * 30) { replay.advanceTicks(1); replayTick += 1; }
  assert.deepEqual(replay.snapshot({ scope: "full" }), api.snapshot({ scope: "full" }));
});

test("段48: 操作APIは買上げ・注文受諾・道路操作をday/tick付きでジャーナル化する", () => {
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  world.state.economy.orderOffer = {
    g: "tools", qty: 10, left: 10, price: 2.5, due: 90,
  };
  assert.equal(api.applyOperation({
    type: "set_stock_target", goods: "wheat", qty: 12,
  }).qty, 12);
  assert.equal(api.applyOperation({ type: "accept_order" }).ok, true);
  assert.equal(api.applyOperation({ type: "remove_road", x: 25, y: 27 }).ok, true);
  assert.equal(api.applyOperation({
    type: "add_road", start: { x: 25, y: 27 }, end: { x: 25, y: 27 },
  }).ok, true);

  const journal = api.inputJournal();
  assert.equal(journal.length, 4);
  assert.equal(journal.every(({ day, tick, op }) => (
    day === 0 && tick === 0 && typeof op.type === "string"
  )), true);
  assert.doesNotThrow(() => JSON.stringify(api.snapshot()));
  const operationEvents = api.events().filter(({ type }) => type === "operation");
  assert.equal(operationEvents.length, 4);
  assert.equal(operationEvents.every(({ day, tick, x, y }) => (
    Number.isSafeInteger(day)
    && Number.isSafeInteger(tick)
    && Number.isFinite(x)
    && Number.isFinite(y)
  )), true);
});

test("表示snapshot: 同じ地形revisionの再送を省き、変更後は完全地形を返す", () => {
  const world = buildBaseCity(11);
  const api = createEngineApi(world);
  api.advanceDays(1);
  const first = api.snapshot({ scope: "view" });
  const revision = first.physical.travelRevision;
  assert.ok(Array.isArray(first.physical.terrain));
  assert.equal(first.economy.households.every((household) => (
    household.productionHistory === undefined
    && household.productionToday === undefined
    && household.productionSummary
  )), true);
  assert.equal(
    api.snapshot({ scope: "view", terrainAfterRevision: revision }).physical.terrain,
    null,
  );

  const tile = world.state.physical.terrain[0][0];
  if (typeof tile === "string") {
    world.state.physical.terrain[0][0] = tile === "water" ? "grass" : "water";
  } else {
    tile.kind = tile.kind === "water" ? "grass" : "water";
  }
  world.state.physical.travelRevision += 1;
  const changed = api.snapshot({ scope: "view", terrainAfterRevision: revision });
  assert.equal(changed.physical.travelRevision, revision + 1);
  assert.ok(Array.isArray(changed.physical.terrain));
  assert.notDeepEqual(changed.physical.terrain[0][0], first.physical.terrain[0][0]);
});

test("完成後拡張: 港だけの世界は市場・倉庫を自動生成せず公開操作で実体化する", () => {
  const world = createPortOnlyTestWorld();
  const api = createEngineApi(world);
  assert.deepEqual(world.state.physical.buildings.map(({ type }) => type), ["port"]);
  api.advanceDays(1);
  assert.deepEqual(world.state.physical.buildings.map(({ type }) => type), ["port"]);

  const plan = makeStableCityPlan();
  const marketPlan = plan.logisticsSites.market;
  const warehousePlan = plan.logisticsSites.warehouse;
  const marketResult = api.applyOperation({
    type: "place_building",
    job: "market",
    x: marketPlan.entrance.x,
    y: marketPlan.entrance.y,
    buildingX: marketPlan.x,
    buildingY: marketPlan.y,
  });
  const warehouseResult = api.applyOperation({
    type: "place_building",
    job: "warehouse",
    x: warehousePlan.entrance.x,
    y: warehousePlan.entrance.y,
    buildingX: warehousePlan.x,
    buildingY: warehousePlan.y,
  });
  assert.equal(marketResult.ok, true);
  assert.equal(warehouseResult.ok, true);
  assert.equal(api.applyOperation({
    type: "place_building",
    job: "market",
    x: 18,
    y: 18,
  }).ok, false);

  const { economy, physical } = world.state;
  const market = companyLogisticsSite(physical, "market");
  const warehouse = companyLogisticsSite(physical, "warehouse");
  assert.equal(market.id, marketResult.buildingId);
  assert.equal(warehouse.id, warehouseResult.buildingId);
  assert.deepEqual(economy.market, marketPlan.entrance);
  assert.deepEqual(economy.warehouse, warehousePlan.entrance);
  assert.equal(market.fixed, false);
  assert.equal(warehouse.fixed, false);
  assert.ok(sectionCapacity(market, "outbound", "log") > 1e9);
  assert.ok(sectionCapacity(warehouse, "storage", "log") > 1e9);
  assert.equal(economy.company.money, P.TREASURY0 - P.BUILD_COST * 2);
  assert.equal(economy.moneyBoundary.out, P.BUILD_COST * 2);
  assert.deepEqual(api.inputJournal().slice(0, 2).map(({ op }) => op.job), ["market", "warehouse"]);
});

test("完成後拡張: 市場を建てるまでは住民が見えない市場へ往復しない", () => {
  const world = createPortOnlyTestWorld();
  const api = createEngineApi(world);
  const [x, y] = findAuditSpot(world, "woodshop");
  assert.equal(api.applyOperation({ type: "place_building", job: "woodshop", x, y }).ok, true);
  api.advanceDays(45);
  const { economy, physical } = world.state;
  assert.ok(economy.households.length > 0);
  assert.equal(economy.households.every((household) => household.marketCarrier === null), true);
  assert.equal(Object.values(economy.stalls).every((stalls) => stalls.length === 0), true);
  assert.deepEqual(physical.buildings.map(({ type }) => type).sort(), ["port", "woodshop"]);
  assert.equal(companyLogisticsSite(physical, "market"), null);
  assert.equal(companyLogisticsSite(physical, "warehouse"), null);
});

test("完成後拡張: 後置きの市場・倉庫が従来どおり道路限定の買上げと市場へ出すを担う", () => {
  const world = createPortOnlyTestWorld();
  const api = createEngineApi(world);
  const plan = makeStableCityPlan();
  for (const type of ["market", "warehouse"]) {
    const site = plan.logisticsSites[type];
    assert.equal(api.applyOperation({
      type: "place_building",
      job: type,
      x: site.entrance.x,
      y: site.entrance.y,
      buildingX: site.x,
      buildingY: site.y,
    }).ok, true);
  }
  assert.equal(api.applyOperation({
    type: "add_road",
    start: { x: 25, y: 28 },
    end: { x: 28, y: 28 },
  }).ok, true);
  assert.equal(api.applyOperation({
    type: "add_road",
    start: { x: 28, y: 28 },
    end: { x: 28, y: 32 },
  }).ok, true);

  const { economy, physical } = world.state;
  const market = companyLogisticsSite(physical, "market");
  const warehouse = companyLogisticsSite(physical, "warehouse");
  const seller = createHousehold(economy, { job: "logger", x: 20, y: 20 });
  economy.stalls.log.push({ householdId: seller.id, qty: 8, price: 1, age: 0 });
  depositInventory(market, "outbound", "log", 8);
  setCompanyStockTarget(economy, "log", 8);
  const [purchase] = runCompanyProcurement(economy, { day: 1, physical });
  assert.equal(purchase.qty, 8);
  const purchaseJob = physical.haulJobs.find((job) => job.id === purchase.jobId);
  assert.equal(purchaseJob.carrier.porters.length, 4);
  assert.equal(sectionAmount(market, "outbound", "log"), 0);
  assert.equal(api.applyOperation({ type: "remove_building", buildingId: market.id }).ok, false);
  assert.equal(api.applyOperation({ type: "remove_building", buildingId: warehouse.id }).ok, false);
  while (physical.activeHaulJobIds.length > 0) stepHaulCarriers(physical, 1);
  settleCompanyLogistics(economy, physical, { day: 1 });
  assert.equal(economy.stock.log, 8);
  assert.equal(sectionAmount(warehouse, "storage", "log"), 8);

  assert.ok(requestCompanyStockRelease(economy, physical, "log", { day: 2, qty: 8 }));
  while (physical.activeHaulJobIds.length > 0) stepHaulCarriers(physical, 1);
  settleCompanyLogistics(economy, physical, { day: 2 });
  assert.equal(economy.stock.log, 0);
  assert.equal(economy.marketStock.log, 8);
  assert.equal(sectionAmount(market, "inbound", "log"), 8);
  assert.equal(assertMoneyConservation(economy), true);
});

test("完成後拡張: 空の市場・倉庫は撤去後に復活せず配置journalを再生できる", () => {
  const create = () => createPortOnlyTestWorld(13);
  const world = create();
  const api = createEngineApi(world);
  const plan = makeStableCityPlan();
  for (const type of ["market", "warehouse"]) {
    const site = plan.logisticsSites[type];
    assert.equal(api.applyOperation({
      type: "place_building",
      job: type,
      x: site.entrance.x,
      y: site.entrance.y,
      buildingX: site.x,
      buildingY: site.y,
    }).ok, true);
  }
  const placedState = api.snapshot({ scope: "full" });
  const placementJournal = api.inputJournal();
  const replay = replayInputJournal(create, placementJournal, { untilTick: 0 });
  assert.deepEqual(replay.api.snapshot({ scope: "full" }), placedState);

  const market = companyLogisticsSite(world.state.physical, "market");
  const warehouse = companyLogisticsSite(world.state.physical, "warehouse");
  assert.equal(api.applyOperation({ type: "remove_building", buildingId: market.id }).ok, true);
  assert.equal(api.applyOperation({ type: "remove_building", buildingId: warehouse.id }).ok, true);
  api.advanceDays(1);
  assert.deepEqual(world.state.physical.buildings.map(({ type }) => type), ["port"]);
  assert.equal(companyLogisticsSite(world.state.physical, "market"), null);
  assert.equal(companyLogisticsSite(world.state.physical, "warehouse"), null);
});

test("段48: API版mimicPlayerと入力ジャーナル再生は直接版と同一状態になる", () => {
  const days = 150;
  const direct = buildBaseCity(13);
  const operated = buildBaseCity(13);
  const api = createEngineApi(operated);
  const observedEventTypes = new Set();
  let eventSequence = 0;
  const collectEvents = () => {
    const events = api.events({ afterSequence: eventSequence });
    if (events.length) eventSequence = events.at(-1).sequence;
    for (const event of events) observedEventTypes.add(event.type);
  };
  for (let day = 1; day <= days; day += 1) {
    mimicPlayer(direct, day);
    direct.step();
    mimicPlayerThroughApi(api, day);
    collectEvents();
    api.advanceDays(1);
    collectEvents();
  }
  const expected = JSON.parse(JSON.stringify(direct.state));
  assert.deepEqual(api.snapshot(), expected);

  const replayed = replayInputJournal(
    () => buildBaseCity(13),
    api.inputJournal(),
    { untilTick: days * 30 },
  );
  assert.deepEqual(replayed.api.snapshot(), expected);
  for (const type of ["operation", "departure", "arrival", "transaction"]) {
    assert.equal(observedEventTypes.has(type), true, type);
  }
  assert.equal(api.events().every(({ day, tick, x, y }) => (
    Number.isSafeInteger(day)
    && Number.isSafeInteger(tick)
    && Number.isFinite(x)
    && Number.isFinite(y)
  )), true);
});

test("段41診断器: 座標再構成後も年次観測・月次物資出納・物理不変条件を採取する", () => {
  const scenario = runStableCityScenario(11, { days: 360, materialCheckInterval: 30 });
  assert.equal(scenario.day, 360);
  assert.deepEqual(scenario.physical, { carriers: true, occupancy: true });
  assert.equal(scenario.material.passed, true);
  assert.equal(scenario.yearly.length, 1);
  assert.equal(scenario.yearly[0].year, 1);
  assert.ok(Number.isSafeInteger(scenario.yearly[0].population));
  assert.ok(Number.isFinite(scenario.yearly[0].famine));
  assert.deepEqual(Object.keys(scenario.yearly[0].jobs), [...E_STABLE_JOBS]);
});

test("段44: 転職は建物型を変えず空き工房へ世帯と家財を移し物資を保存する", () => {
  const physical = createEconomicTestPhysical();
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 5, y: 3 });
  const loggerHome = addEconomicTestBuilding(
    physical,
    "logger",
    2,
    2,
    5,
    3,
    household.id,
  );
  const woodshopHome = addEconomicTestBuilding(physical, "woodshop", 10, 2, 9, 3);
  household.buildingId = loggerHome.id;
  economy.zones.push(
    { job: "logger", x: 5, y: 3, buildingId: loggerHome.id, filled: true },
    { job: "woodshop", x: 9, y: 3, buildingId: woodshopHome.id, filled: false },
  );
  economy.jobSelectionPool = ["woodshop"];
  depositInventory(loggerHome, "input", "log", 17);
  household.pantry.salt = 4;
  household.hungerHist = Array(P.DISTRESS).fill(1);
  household.jobCycleDone = true;
  const before = economicMaterialSnapshot(economy, physical);

  const changes = runPopulationDynamicsPhase(economy, physical, {
    day: 360,
    random: () => 0,
  });
  const after = economicMaterialSnapshot(economy, physical);

  assert.deepEqual(changes.at(-1), {
    kind: "job_switch",
    householdId: household.id,
    from: "logger",
    to: "woodshop",
  });
  assert.equal(loggerHome.type, "logger");
  assert.equal(woodshopHome.type, "woodshop");
  assert.equal(loggerHome.ownerHouseholdId, null);
  assert.equal(woodshopHome.ownerHouseholdId, household.id);
  assert.equal(household.buildingId, woodshopHome.id);
  assert.deepEqual([household.x, household.y, household.px, household.py], [9, 3, 9, 3]);
  assert.equal(sectionAmount(loggerHome, "input", "log"), 0);
  assert.equal(sectionAmount(woodshopHome, "input", "log"), 17);
  assert.deepEqual(economy.zones.map(({ filled }) => filled), [false, true]);
  assert.deepEqual(after, before);
  assert.match(economy.events.at(-1)[1], /へ移住/);
});

test("段44: 空き職建物がなければ転職せず理由をイベントに残す", () => {
  const physical = createEconomicTestPhysical();
  const economy = createEconomicState();
  const household = createHousehold(economy, { job: "logger", x: 5, y: 3 });
  const home = addEconomicTestBuilding(physical, "logger", 2, 2, 5, 3, household.id);
  household.buildingId = home.id;
  household.hungerHist = Array(P.DISTRESS).fill(1);
  household.jobCycleDone = true;

  const changes = runPopulationDynamicsPhase(economy, physical, {
    day: 360,
    random: () => 0,
  });

  assert.deepEqual(changes, []);
  assert.equal(household.job, "logger");
  assert.equal(household.buildingId, home.id);
  assert.match(economy.events.at(-1)[1], /空いている他職の建物がありません/);
});

test("段44: 離散した世帯の建物は同じbuildingIdの空き家として再入居できる", () => {
  const physical = createEconomicTestPhysical();
  const economy = createEconomicState();
  economy.port = { x: 1, y: 1 };
  const household = createHousehold(economy, { job: "woodshop", x: 5, y: 3 });
  const home = addEconomicTestBuilding(physical, "woodshop", 2, 2, 5, 3, household.id);
  household.buildingId = home.id;
  household.members = household.members.slice(0, 3);
  household.hungerRun = 59;
  for (const goods of GOODS) household.pantry[goods] = 0;
  const zone = { job: "woodshop", x: 5, y: 3, buildingId: home.id, filled: true };
  economy.zones.push(zone);

  runHouseholdSurvival(economy, { day: 1, physical });
  assert.equal(economy.households.length, 0);
  assert.equal(home.ownerHouseholdId, null);
  assert.equal(zone.filled, false);
  assert.equal(zone.vacated, true);
  assert.equal(economy.ruins.at(-1).buildingId, home.id);

  economy.hungryN = 0;
  const [settlement] = fillSettlementZones(economy, { day: 15, physical });
  assert.equal(settlement.kind, "immigrant");
  assert.equal(settlement.household.buildingId, home.id);
  assert.equal(settlement.household.state, "home");
  assert.equal(home.ownerHouseholdId, settlement.household.id);
  assert.equal(zone.filled, true);
  assert.equal(zone.vacated, false);
  assert.equal(assertMoneyConservation(economy), true);
});

if (includeFullAcceptance) test("段49: T=8年×3シード+公開API版の完全帯を各60秒未満に通す", async () => {
  const workers = await fullStableAuditPromise;
  assert.deepEqual(workers.map(({ seed }) => seed).sort((a, b) => a - b), [11, 13, 14]);
  assert.equal(workers.every(({ scenario, apiScenario }) => (
    (scenario ?? apiScenario).passed
  )), true);
  const api = workers.find(({ mode }) => mode === "api");
  assert.ok(api.journalLength > 0);
  assert.equal(api.apiScenario.day, 2880);
  assert.ok(
    Math.max(...workers.map(({ elapsedMs }) => elapsedMs)) < 60_000,
    JSON.stringify(workers.map(({ seed, mode, elapsedMs }) => ({ seed, mode, elapsedMs }))),
  );
});

let failures = 0;
const selectedTests = testMatch ? tests.filter(({ name }) => testMatch.test(name)) : tests;
for (const { name, run } of selectedTests) {
  try {
    console.log(`run - ${name}`);
    const startedAt = performance.now();
    await run();
    console.log(`ok - ${name} (${((performance.now() - startedAt) / 1000).toFixed(2)}s)`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`\n${selectedTests.length} tests passed`);
}
