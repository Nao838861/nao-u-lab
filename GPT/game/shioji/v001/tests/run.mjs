import assert from "node:assert/strict";
import { World } from "../src/world.js";
import { findPath, keyOf, orthogonalLine } from "../src/pathfinding.js";

const positions = {
  farm: [10, 13],
  logger: [19, 8],
  sawmill: [15, 10],
  farm2: [22, 14],
  farm3: [24, 15],
  market2: [20, 11],
  tradehouse: [18, 10],
  workshop: [12, 11]
};

function build(world, type, position) {
  const [x, y] = position;
  const actualType = type.replace(/\d+$/, "");
  if (world.buildings.some((building) => building.type === actualType && building.x === x && building.y === y)) return true;
  if (world.constructions.some((building) => building.type === actualType && building.x === x && building.y === y)) return true;
  return world.placeBuilding(actualType, x, y).ok;
}

function road(world, start, end) {
  const points = orthogonalLine({ x: start[0], y: start[1] }, { x: end[0], y: end[1] });
  const exists = (point) => world.roads.has(keyOf(point.x, point.y))
    || world.roadProjects.some((project) => project.points.some((item) => item.x === point.x && item.y === point.y));
  if (points.every(exists)) return true;
  const result = world.planRoad({ x: start[0], y: start[1] }, { x: end[0], y: end[1] });
  return result.ok;
}

function chooseUsefulContract(world) {
  if (!world.pausedForDecision || !world.pendingContractChoices.length) return;
  let choice;
  if (!world.seals.life) choice = world.pendingContractChoices.find((contract) => contract.id === "first_grain");
  else if (!world.seals.timber) choice = world.pendingContractChoices.find((contract) => contract.id === "timber_charter");
  else {
    // 木材契約は、製材所→木こり→食料生産者へ現金が循環する安定路線。
    choice = world.pendingContractChoices.find((contract) => contract.id === "timber_charter");
  }
  world.chooseContract((choice || world.pendingContractChoices[0]).id);
}

function manageBalanced(world, flags) {
  chooseUsefulContract(world);
  if (world.funds <= 40) world.requestEmergencyCredit();
  if (!flags.food) {
    flags.food = build(world, "farm", positions.farm);
    if (flags.food) road(world, [8, 14], [10, 14]);
  }
  if (world.unlockTier >= 2 && !flags.timber) {
    const mainRoad = road(world, [8, 9], [22, 9]);
    const logger = build(world, "logger", positions.logger);
    const sawmill = build(world, "sawmill", positions.sawmill);
    flags.timber = mainRoad && logger && sawmill;
  }
  if (world.unlockTier >= 3 && !flags.trade) {
    const farm = build(world, "farm2", positions.farm2);
    const farm3 = build(world, "farm3", positions.farm3);
    const market = build(world, "market2", positions.market2);
    const trader = build(world, "tradehouse", positions.tradehouse);
    const workshop = build(world, "workshop", positions.workshop);
    const marketSpur = road(world, [20, 10], [20, 10]);
    const farmSpur = road(world, [22, 10], [22, 13]);
    const farm3Spur = road(world, [23, 13], [24, 14]);
    const workshopSpur = road(world, [12, 10], [12, 10]);
    flags.trade = farm && farm3 && market && trader && workshop && marketSpur && farmSpur && farm3Spur && workshopSpur;
  }
}

function simulate({ seed = 11, days = 300, manager = null } = {}) {
  const world = new World({ seed });
  const flags = {};
  for (let step = 0; step < days; step += 1) {
    manager?.(world, flags);
    if (world.pausedForDecision) chooseUsefulContract(world);
    world.tickDay();
    world.assertInvariants();
    if (world.independenceStatus.ready && !world._firstReadyDay) world._firstReadyDay = world.day;
    world._maxStableDays = Math.max(world._maxStableDays || 0, world.hungerFreeDays);
  }
  return world;
}

function testBalancedSeeds() {
  const results = [];
  for (const seed of [3, 11, 29]) {
    const world = simulate({ seed, days: 320, manager: manageBalanced });
    results.push({ ...world.summary(), firstReadyDay: world._firstReadyDay });
    if (!world.independenceStatus.ready) console.error("balanced diagnostic", seed, world.summary(), world.buildings.filter((b) => b.household).map((b) => ({ type: b.type, members: b.household.members, cash: Number(b.household.cash.toFixed(1)), hunger: Number(b.household.hunger.toFixed(1)), hungry: b.household.hungryToday, food: Number((b.inventory.grain + b.inventory.fish).toFixed(1)), market: b.marketId, activity: b.household.activity })));
    assert.equal(world.seals.life, true, `seed ${seed}: 食の章印`);
    assert.equal(world.seals.timber, true, `seed ${seed}: 材の章印`);
    assert.equal(world.seals.trade, true, `seed ${seed}: 商の章印`);
    assert.equal(world.independenceStatus.ready, true, `seed ${seed}: 独立可能`);
  }
  return results;
}

function testSaveRoundTrip() {
  const original = simulate({ seed: 17, days: 123, manager: manageBalanced });
  const restored = World.fromJSON(structuredClone(original.toJSON()));
  assert.deepEqual(restored.summary(), original.summary());
  for (let day = 0; day < 40; day += 1) {
    manageBalanced(original, {});
    manageBalanced(restored, {});
    chooseUsefulContract(original);
    chooseUsefulContract(restored);
    original.tickDay();
    restored.tickDay();
  }
  assert.deepEqual(restored.toJSON(), original.toJSON());
}

function testNoSelfTrade() {
  const world = simulate({ seed: 8, days: 160, manager: manageBalanced });
  assert.equal(world.shipments.some((shipment) => shipment.buyer === shipment.seller), false);
}

function testCartNeedsRoad() {
  const world = new World({ seed: 5 });
  const second = world.addBuilding("market", 20, 11, { complete: true });
  assert.equal(findPath(world, world.markets()[0], second, "cart"), null);
  for (let x = 8; x <= 20; x += 1) world.roads.add(`${x},9`);
  world.roads.add("20,10");
  assert.ok(findPath(world, world.markets()[0], second, "cart"));
}

function testWarehouseAndEmergencyCreditAccounting() {
  const warehouseWorld = new World({ seed: 9 });
  warehouseWorld.unlockTier = 2;
  assert.equal(warehouseWorld.placeBuilding("warehouse", 8, 10).ok, true);
  for (let day = 0; day < 6; day += 1) warehouseWorld.tickDay();
  const warehouse = warehouseWorld.buildings.find((building) => building.type === "warehouse");
  assert.ok(warehouse?.warehouse);
  assert.equal(warehouse.warehouse.cash, 120);
  warehouseWorld.assertInvariants();

  const creditWorld = new World({ seed: 12 });
  creditWorld.unlockTier = 3;
  assert.equal(creditWorld.placeBuilding("market", 9, 10).ok, true);
  assert.equal(creditWorld.placeBuilding("tradehouse", 11, 10).ok, true);
  assert.equal(creditWorld.placeBuilding("workshop", 13, 10).ok, true);
  assert.equal(creditWorld.placeBuilding("logger", 19, 8).ok, true);
  assert.ok(creditWorld.funds <= 90);
  assert.equal(creditWorld.requestEmergencyCredit(), true);
  assert.equal(creditWorld.requestEmergencyCredit(), false);
  creditWorld.assertInvariants();
}

function manageNoRoad(world, flags) {
  chooseUsefulContract(world);
  if (!flags.food) flags.food = build(world, "farm", positions.farm);
  if (world.unlockTier >= 2 && !flags.timber) {
    flags.timber = build(world, "logger", positions.logger) && build(world, "sawmill", positions.sawmill);
  }
}

function managePortOnly(world, flags) {
  chooseUsefulContract(world);
  if (!flags.food) {
    flags.food = build(world, "farm", positions.farm);
    road(world, [8, 14], [10, 14]);
  }
  if (world.unlockTier >= 2 && !flags.timber) {
    road(world, [8, 9], [22, 9]);
    flags.timber = build(world, "logger", positions.logger) && build(world, "sawmill", positions.sawmill);
  }
}

function chooseExportContract(world) {
  if (!world.pausedForDecision || !world.pendingContractChoices.length) return;
  const id = !world.seals.life
    ? "first_grain"
    : !world.seals.timber
      ? "timber_charter"
      : "grain_relief";
  const choice = world.pendingContractChoices.find((contract) => contract.id === id) || world.pendingContractChoices[0];
  world.chooseContract(choice.id);
}

function manageExportAll(world, flags) {
  chooseExportContract(world);
  if (!flags.food) {
    flags.food = build(world, "farm", positions.farm);
    road(world, [8, 14], [10, 14]);
  }
  if (world.unlockTier >= 2 && !flags.timber) {
    const mainRoad = road(world, [8, 9], [22, 9]);
    flags.timber = mainRoad && build(world, "logger", positions.logger) && build(world, "sawmill", positions.sawmill);
  }
  if (world.unlockTier >= 3 && !flags.expansion) {
    flags.expansion = build(world, "market2", positions.market2)
      && build(world, "tradehouse", positions.tradehouse)
      && build(world, "workshop", positions.workshop)
      && road(world, [20, 10], [20, 10])
      && road(world, [12, 10], [12, 10]);
  }
}

function testBadPoliciesStayMeaningfullyIncomplete() {
  const noRoad = simulate({ seed: 11, days: 230, manager: manageNoRoad });
  assert.equal(noRoad.seals.timber, false, "道路なしでは製材契約を達成できない");

  const portOnly = simulate({ seed: 11, days: 280, manager: managePortOnly });
  assert.equal(portOnly.seals.trade, false, "港契約だけでは商いの章印を得られない");
  assert.equal(portOnly.independenceStatus.ready, false);

  const exportAll = simulate({ seed: 11, days: 320, manager: manageExportAll });
  assert.equal(exportAll.independenceStatus.wellbeing, false, "輸出だけを優先すると食卓安定を維持できない");
  assert.equal(exportAll.independenceStatus.ready, false);
}

const balanced = testBalancedSeeds();
testSaveRoundTrip();
testNoSelfTrade();
testCartNeedsRoad();
testWarehouseAndEmergencyCreditAccounting();
testBadPoliciesStayMeaningfullyIncomplete();

console.log("SHIOJI deterministic test suite: PASS");
console.table(balanced.map((item) => ({
  day: item.day,
  funds: item.funds,
  population: item.population,
  waiting: item.waiting,
  stableDays: item.hungerFreeDays,
  residentShare: item.residentTradeShare,
  merchantGoods: item.merchantGoods,
  firstReadyDay: item.firstReadyDay,
  ready: item.independence.ready
})));
