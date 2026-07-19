import {
  GOODS,
  P,
  companyCreditLimit,
  createHousehold,
  economicMaterialSnapshot,
  fundSettlementZone,
  localWood,
} from "./econ.js";
import {
  addRoadLine,
  assertCarrierInvariants,
  assertOccupancyInvariant,
  createPhysicalState,
  findLandRoadEntrance,
  hasRoad,
  makeFlowIslandTerrain,
} from "./physical.js";
import { createWorld } from "./world.js";

export const AUDIT_SEEDS = Object.freeze([11, 13, 14]);

export const AUDIT_BASE = Object.freeze([
  ["fisher", 23, 32],
  ["fisher", 27, 32],
  ["veg", 22, 30],
  ["wheat", 21, 28],
  ["logger", 27, 26],
  ["woodshop", 24, 30],
  ["charburner", 26, 29],
  ["saltworks", 26, 31],
  ["shepherd", 24, 28],
  ["veg", 22, 28],
  ["fisher", 21, 33],
]);

const LEGACY_AUDIT_JOBS = Object.freeze([
  "fisher", "fisher2", "wheat", "veg", "shepherd", "rapeseed",
  "logger", "woodshop", "charburner", "quarryman", "saltworks",
]);

export const IRON_AUDIT_SITES = Object.freeze([
  Object.freeze({ job: "miner", x: 12, y: 20, roadTarget: Object.freeze({ x: 13, y: 20 }) }),
  Object.freeze({ job: "collier", x: 7, y: 30, roadTarget: Object.freeze({ x: 8, y: 30 }) }),
  Object.freeze({ job: "smelter", x: 28, y: 30 }),
  Object.freeze({ job: "smith", x: 29, y: 32 }),
]);
const IRON_AUDIT_START_DAY = 720;
const IRON_DEMAND_HOUSEHOLDS = 8;

export const AUDIT_ROAD_TARGETS = Object.freeze([
  Object.freeze({ x: 27, y: 26 }),
  Object.freeze({ x: 21, y: 28 }),
]);

function terrainKind(physical, x, y) {
  if (x < 0 || y < 0 || x >= physical.width || y >= physical.height) return undefined;
  const tile = physical.terrain[y][x];
  return typeof tile === "string" ? tile : tile.kind;
}

function nearTerrain(physical, x, y, kind, radius = 2) {
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (terrainKind(physical, Math.round(x) + offsetX, Math.round(y) + offsetY) === kind) {
        return true;
      }
    }
  }
  return false;
}

export function canPlaceSettlement(economy, physical, job, x, y) {
  const roundedX = Math.round(x);
  const roundedY = Math.round(y);
  const terrain = terrainKind(physical, roundedX, roundedY);
  if (!terrain || terrain === "water") return [false, "水の上には建てられません"];
  if (
    economy.zones.some((zone) => Math.round(zone.x) === roundedX && Math.round(zone.y) === roundedY)
    || economy.households.some(
      (household) => Math.round(household.x) === roundedX && Math.round(household.y) === roundedY,
    )
  ) return [false, "この土地には既に建物があります"];
  if (
    hasRoad(physical, roundedX, roundedY)
    || physical.roadWorksites.some((site) => site.x === roundedX && site.y === roundedY)
  ) return [false, "道の上には建てられません"];
  if (Math.round(economy.market.x) === roundedX && Math.round(economy.market.y) === roundedY) {
    return [false, "ここは市場です"];
  }
  if (terrain === "forest") return [false, "森を切り開く仕組みはまだありません——森の際に"];
  if (terrain === "rock") return [false, "岩場の上には建てられません——際に"];
  if (
    (job === "fisher" || job === "fisher2")
    && !nearTerrain(physical, x, y, "water", 2)
  ) return [false, "漁師は水際にしか住めません"];
  if (job === "logger" && !nearTerrain(physical, x, y, "forest", 2)) {
    return [false, "木こりは森の際でないと立ち行きません"];
  }
  if (job === "quarryman" && !nearTerrain(physical, x, y, "rock", 2)) {
    return [false, "採石は岩場の際でないと立ち行きません"];
  }
  if (job === "miner" && !nearTerrain(physical, x, y, "ore", 2)) {
    return [false, "鉱夫は鉄鉱床の2マス以内でないと立ち行きません"];
  }
  if (job === "collier" && !nearTerrain(physical, x, y, "coal", 2)) {
    return [false, "炭鉱夫は炭層の2マス以内でないと立ち行きません"];
  }
  return [true, ""];
}

export function addAuditZone(world, job, x, y) {
  return fundSettlementZone(world.state.economy, {
    job,
    x,
    y,
    day: world.state.day,
    canPlace: (candidateJob, candidateX, candidateY) => canPlaceSettlement(
      world.state.economy,
      world.state.physical,
      candidateJob,
      candidateX,
      candidateY,
    ),
  });
}

export function createAuditWorld(seed) {
  const physical = createPhysicalState({
    width: 48,
    height: 40,
    terrain: makeFlowIslandTerrain(48, 40),
  });
  const world = createWorld({
    seed,
    physicalState: physical,
    market: { x: 25, y: 32 },
    port: { x: 25, y: 35 },
  });
  world.state.economy.jobSelectionPool = [...LEGACY_AUDIT_JOBS];
  for (const [job, x, y] of AUDIT_BASE) {
    if (!addAuditZone(world, job, x, y)) {
      throw new Error(`基準村の配置不可: ${job}@${x},${y}`);
    }
  }
  const roadTargets = [
    ...AUDIT_ROAD_TARGETS,
    findLandRoadEntrance(physical, world.state.economy.port, world.state.economy.market),
  ];
  for (const target of roadTargets) {
    const road = target && addRoadLine(physical, world.state.economy.market, target);
    if (!road?.ok && !road?.cells?.every(({ x, y }) => hasRoad(physical, x, y))) {
      throw new Error(`基準村の道路敷設不可: ${target?.x},${target?.y}`);
    }
  }
  return world;
}

function placeIronAuditHouseholds(world) {
  const { economy } = world.state;
  economy.jobSelectionPool = [
    ...LEGACY_AUDIT_JOBS,
    ...IRON_AUDIT_SITES.map(({ job }) => job),
  ];
  for (const site of IRON_AUDIT_SITES) {
    let { x, y } = site;
    if (!canPlaceSettlement(economy, world.state.physical, site.job, x, y)[0] && !site.roadTarget) {
      const fallback = findAuditSpot(world, site.job);
      if (fallback) [x, y] = fallback;
    }
    if (!addAuditZone(world, site.job, x, y)) {
      throw new Error(`鉄監査の配置不可: ${site.job}@${x},${y}`);
    }
    economy.zones.at(-1).filled = true;
    createHousehold(economy, { job: site.job, x, y });
  }
}

export function createIronAuditWorld(
  seed,
  { depositRoads = true, placeHouseholds = true } = {},
) {
  const world = createAuditWorld(seed);
  const { economy, physical } = world.state;
  if (depositRoads) {
    for (const { roadTarget } of IRON_AUDIT_SITES) {
      if (!roadTarget) continue;
      const road = addRoadLine(physical, economy.market, roadTarget);
      if (!road.ok && !road.cells.every((cell) => hasRoad(physical, cell.x, cell.y))) {
        throw new Error(`鉄監査の鉱床道路敷設不可: ${roadTarget.x},${roadTarget.y}`);
      }
    }
  }
  if (placeHouseholds) placeIronAuditHouseholds(world);
  return world;
}

export function findAuditSpot(world, job) {
  const { economy, physical } = world.state;
  const marketX = economy.market.x;
  const marketY = economy.market.y;
  for (let radius = 2; radius < 26; radius += 1) {
    for (let angle = 0; angle < 24; angle += 1) {
      const radians = angle / 24 * 6.283;
      const x = Math.round(marketX + Math.cos(radians) * radius);
      const y = Math.round(marketY + Math.sin(radians) * radius);
      const [ok] = canPlaceSettlement(economy, physical, job, x, y);
      const crowdedLogger = job === "logger" && economy.households.some(
        (household) => household.job === "logger" && Math.hypot(household.x - x, household.y - y) < 6,
      );
      if (
        ok
        && !crowdedLogger
        && !economy.zones.some((zone) => Math.abs(zone.x - x) < 1.5 && Math.abs(zone.y - y) < 1.5)
        && !economy.households.some(
          (household) => Math.abs(household.x - x) < 1.5 && Math.abs(household.y - y) < 1.5,
        )
      ) return [x, y];
    }
  }
  return null;
}

export function auditPopulation(economy) {
  return economy.households.reduce((total, household) => total + household.members.length, 0);
}

function setPlayerStockTargets(economy) {
  if (economy.order) {
    economy.stockTgt[economy.order.g] = Math.max(
      economy.stockTgt[economy.order.g] ?? 0,
      Math.ceil((economy.stock[economy.order.g] ?? 0) + economy.order.left),
    );
  }
  economy.stockTgt.wheat = Math.max(
    economy.stockTgt.wheat ?? 0,
    Math.round(auditPopulation(economy) * 2),
  );
}

function countJobAndZones(economy, job) {
  return economy.households.filter((household) => household.job === job).length
    + economy.zones.filter((zone) => !zone.filled && zone.job === job).length;
}

function addResult(results, id, name, passed, detail) {
  results.push({ id, name, passed: Boolean(passed), detail });
}

function averageBySeason(log, predicate) {
  const values = log.filter(([month]) => predicate(month)).map(([, value]) => value);
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;
}

function runScenarioA() {
  const worlds = [];
  const stallAverage = {};
  const famineByYear = [[], [], [], []];
  const priceLog = { fish: [], char: [] };
  const stuck = {};
  const stuckRun = {};
  const earlyWheatSwitch = [];
  const plan = { 13: "wheat", 16: "logger", 20: "fisher", 26: "woodshop", 30: "rapeseed" };

  for (const seed of AUDIT_SEEDS) {
    const world = createAuditWorld(seed);
    const { economy } = world.state;
    for (let day = 1; day <= 1440; day += 1) {
      if (day % 30 === 1) {
        const month = Math.floor(day / 30) + 1;
        if (plan[month]) {
          const spot = findAuditSpot(world, plan[month]);
          if (spot) addAuditZone(world, plan[month], spot[0], spot[1]);
        }
      }
      if (day % 5 === 0) setPlayerStockTargets(economy);
      if (day % 90 === 0 && economy.company.money * 10 > 8000) {
        for (const job of ["woodshop", "charburner", "saltworks"]) {
          if (countJobAndZones(economy, job) >= 1) continue;
          const spot = findAuditSpot(world, job);
          if (spot) {
            addAuditZone(world, job, spot[0], spot[1]);
            break;
          }
        }
      }
      world.step();
      for (const [eventDay, message] of economy.events) {
        if (
          eventDay === day
          && day < 255
          && message.startsWith("破綻転職: wheat")
          && !earlyWheatSwitch.some(([knownSeed, knownDay, known]) => (
            knownSeed === seed && knownDay === day && known === message
          ))
        ) earlyWheatSwitch.push([seed, day, message]);
      }
      for (const goods of ["wheat", "meat", "tools", "veg"]) {
        const qty = economy.stalls[goods].reduce((total, stall) => total + stall.qty, 0);
        stallAverage[goods] = (stallAverage[goods] ?? 0) + qty / 1440 / AUDIT_SEEDS.length;
      }
      if (day % 360 === 0) famineByYear[day / 360 - 1].push(economy.famine);
      const month = ((Math.floor((day - 1) / 30)) % 12) + 1;
      for (const goods of Object.keys(priceLog)) {
        const prices = economy.prices[goods];
        if (prices.length > 0 && prices.at(-1)[0] === day) {
          priceLog[goods].push([month, prices.at(-1)[1]]);
        }
      }
      for (const household of economy.households) {
        const key = `${seed}_${household.id}`;
        if (household.purse < -2.5) {
          const run = (stuckRun[key] ?? 0) + 1;
          stuckRun[key] = run;
          stuck[key] = Math.max(stuck[key] ?? 0, run);
        } else {
          stuckRun[key] = 0;
        }
      }
    }
    worlds.push(world);
  }
  return {
    worlds,
    stallAverage,
    famineByYear,
    priceLog,
    stuck,
    earlyWheatSwitch,
  };
}

function runAdvisorScenario() {
  const world = createAuditWorld(12);
  const { economy, physical } = world.state;
  const builds = [];
  for (let day = 1; day <= 1440; day += 1) {
    if (day % 5 === 0) setPlayerStockTargets(economy);
    world.step();
    if (day % 90 !== 0 || builds.length >= 10 || economy.company.money * 10 <= 15000) continue;
    const flow = (goods) => economy.f30[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    const poorCount = economy.households.filter((household) => household.purse < 5).length;
    const debt = Math.max(0, -economy.company.money);
    const month = Math.floor(day / 30) + 1;
    let recommendation = null;
    if (countJobAndZones(economy, "fisher") < 2) recommendation = "fisher";
    else if (countJobAndZones(economy, "veg") < 1) recommendation = "veg";
    else if (
      (flow("wheat").imp > 8 || economy.hungryN >= 3)
      && countJobAndZones(economy, "wheat") < Math.ceil(auditPopulation(economy) / 42)
    ) recommendation = "wheat";
    else if (countJobAndZones(economy, "woodshop") < 1) recommendation = "woodshop";
    else if (countJobAndZones(economy, "charburner") < 1) recommendation = "charburner";
    else if (countJobAndZones(economy, "saltworks") < 1) recommendation = "saltworks";
    else if (
      economy.households.some(
        (household) => household.job === "logger" && localWood(economy, physical, household) < 0.1,
      )
      && builds.filter((job) => job === "logger").length < 2
    ) recommendation = "logger";
    else if (debt > companyCreditLimit(economy, { day }) * 0.3) recommendation = null;
    else if (
      month > 18
      && poorCount >= economy.households.length * 0.45
      && countJobAndZones(economy, "rapeseed") < 2
    ) recommendation = "rapeseed";
    else if (flow("salt").imp > 0.5) recommendation = "saltworks";
    else if (flow("tools").imp > 0.5) recommendation = "woodshop";
    if (recommendation) {
      const spot = findAuditSpot(world, recommendation);
      if (spot && addAuditZone(world, recommendation, spot[0], spot[1])) builds.push(recommendation);
    }
  }
  return { world, builds };
}

function runBuildingRhythmScenario() {
  const list = ["wheat", "wheat", "charburner", "saltworks", "logger"];
  const result = {};
  for (const mode of ["lump", "paced"]) {
    const world = createAuditWorld(12);
    const { economy } = world.state;
    let buildIndex = 0;
    for (let day = 1; day <= 1440; day += 1) {
      if (day % 5 === 0) setPlayerStockTargets(economy);
      if (mode === "lump" && day === 120) {
        for (const job of list) {
          const spot = findAuditSpot(world, job);
          if (spot) addAuditZone(world, job, spot[0], spot[1]);
        }
      }
      if (
        mode === "paced"
        && day % 90 === 0
        && buildIndex < list.length
        && economy.company.money * 10 > 15000
      ) {
        const spot = findAuditSpot(world, list[buildIndex]);
        if (spot && addAuditZone(world, list[buildIndex], spot[0], spot[1])) buildIndex += 1;
      }
      world.step();
    }
    result[mode] = {
      famine: economy.famine,
      population: auditPopulation(economy),
      fee: economy.co.fee,
    };
  }
  return result;
}

function runMaterialAudit() {
  const world = createAuditWorld(11);
  const { economy, physical } = world.state;
  const goodsList = ["wheat", "log", "salt", "tools"];
  const total = (snapshot, goods) => {
    return (snapshot.inventory[goods] ?? 0) + (snapshot.cargo[goods] ?? 0);
  };
  const unexplained = Object.fromEntries(goodsList.map((goods) => [goods, 0]));
  const flows = Object.fromEntries(goodsList.map((goods) => [goods, 0]));
  const initialSnapshot = economicMaterialSnapshot(economy, physical);
  const previous = Object.fromEntries(
    goodsList.map((goods) => [goods, total(initialSnapshot, goods)]),
  );
  const previousFlows = Object.fromEntries(goodsList.map((goods) => [
    goods,
    { ...(economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 }) },
  ]));
  const plan = { 13: "wheat", 16: "logger", 20: "fisher", 26: "woodshop", 30: "rapeseed" };
  for (let day = 1; day <= 1440; day += 1) {
    if (day % 30 === 1) {
      const month = Math.floor(day / 30) + 1;
      if (plan[month]) {
        const spot = findAuditSpot(world, plan[month]);
        if (spot) addAuditZone(world, plan[month], spot[0], spot[1]);
      }
    }
    if (day % 5 === 0) setPlayerStockTargets(economy);
    world.step();
    const currentSnapshot = economicMaterialSnapshot(economy, physical);
    for (const goods of goodsList) {
      const cumulative = economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
      const flow = Object.fromEntries(
        ["prod", "cons", "imp", "exp"].map((kind) => [
          kind,
          cumulative[kind] - previousFlows[goods][kind],
        ]),
      );
      const current = total(currentSnapshot, goods);
      const explained = flow.prod - flow.cons + flow.imp - flow.exp;
      unexplained[goods] += current - previous[goods] - explained;
      flows[goods] += Math.abs(flow.prod) + Math.abs(flow.cons) + Math.abs(flow.imp) + Math.abs(flow.exp);
      previous[goods] = current;
      previousFlows[goods] = { ...cumulative };
    }
  }
  return Object.fromEntries(goodsList.map((goods) => {
    const ratio = flows[goods] > 1 ? Math.abs(unexplained[goods]) / flows[goods] * 100 : 0;
    return [goods, {
      unexplained: unexplained[goods],
      totalFlow: flows[goods],
      ratio,
      warning: ratio > 10,
    }];
  }));
}

function materialTotals(snapshot) {
  return Object.fromEntries(GOODS.map((goods) => [
    goods,
    (snapshot.inventory[goods] ?? 0) + (snapshot.cargo[goods] ?? 0),
  ]));
}

function captureMaterialFlows(economy) {
  return Object.fromEntries(GOODS.map((goods) => [
    goods,
    { ...(economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 }) },
  ]));
}

function ironScenarioMaterialReport(economy, physical, initialTotals, initialFlows) {
  const finalTotals = materialTotals(economicMaterialSnapshot(economy, physical));
  return Object.fromEntries(GOODS.map((goods) => {
    const finalFlow = economy.materialFlows[goods] ?? { prod: 0, cons: 0, imp: 0, exp: 0 };
    const delta = Object.fromEntries(["prod", "cons", "imp", "exp"].map((kind) => [
      kind,
      finalFlow[kind] - initialFlows[goods][kind],
    ]));
    const explained = delta.prod - delta.cons + delta.imp - delta.exp;
    const residual = finalTotals[goods] - initialTotals[goods] - explained;
    const throughput = Math.abs(delta.prod) + Math.abs(delta.cons)
      + Math.abs(delta.imp) + Math.abs(delta.exp);
    return [goods, {
      residual,
      throughput,
      ratio: throughput > 1 ? Math.abs(residual) / throughput * 100 : 0,
    }];
  }));
}

export function runIronChainScenario({ seed, depositRoads, days = 2160 }) {
  const world = createIronAuditWorld(seed, { depositRoads, placeHouseholds: false });
  const { economy, physical } = world.state;
  const initialTotals = materialTotals(economicMaterialSnapshot(economy, physical));
  const initialFlows = captureMaterialFlows(economy);
  const plan = { 13: "wheat", 16: "logger", 20: "fisher", 26: "woodshop", 30: "rapeseed" };
  const ironJobSwitches = [];
  const yearly = [];
  const maxIncomes = Object.fromEntries(IRON_AUDIT_SITES.map(({ job }) => [job, 0]));
  for (let day = 1; day <= days; day += 1) {
    if (day % 30 === 1) {
      const month = Math.floor(day / 30) + 1;
      if (plan[month]) {
        const spot = findAuditSpot(world, plan[month]);
        if (spot) addAuditZone(world, plan[month], spot[0], spot[1]);
      }
    }
    if (day % 5 === 0) setPlayerStockTargets(economy);
    if (day % 90 === 0 && economy.company.money * 10 > 8000) {
      for (const job of ["woodshop", "charburner", "saltworks"]) {
        if (countJobAndZones(economy, job) >= 1) continue;
        const spot = findAuditSpot(world, job);
        if (spot) {
          addAuditZone(world, job, spot[0], spot[1]);
          break;
        }
      }
    }
    if (day === IRON_AUDIT_START_DAY + 1) {
      for (const household of economy.households.slice(0, IRON_DEMAND_HOUSEHOLDS)) {
        household.lv = Math.max(household.lv, 5);
        household.up = 0;
        household.down = 0;
      }
      placeIronAuditHouseholds(world);
    }
    world.step();
    for (const { job } of IRON_AUDIT_SITES) {
      maxIncomes[job] = Math.max(
        maxIncomes[job],
        ...economy.households
          .filter((household) => household.job === job)
          .map((household) => (household.incY ?? 0) * 10),
      );
    }
    for (const [eventDay, message] of economy.events) {
      if (eventDay === day && message.startsWith("破綻転職:")) {
        const touchesIronJob = IRON_AUDIT_SITES.some(({ job }) => message.includes(job));
        if (touchesIronJob && !ironJobSwitches.some((entry) => (
          entry.day === day && entry.message === message
        ))) {
          const householdId = Number(message.match(/#(\d+)/)?.[1]);
          const household = economy.households.find(({ id }) => id === householdId);
          ironJobSwitches.push({
            day,
            message,
            purse: household?.purse ?? null,
            income: (household?.incY ?? 0) * 10,
            hunger180: household?.hungerHist?.reduce((total, value) => total + value, 0) ?? null,
            insolvencyMonths: household?.insolvM ?? null,
          });
        }
      }
    }
    if (day % 360 === 0) {
      yearly.push({
        day,
        ironImport: economy.f30.iron?.imp ?? 0,
        ironProduction: economy.f30.iron?.prod ?? 0,
        level5: economy.households.filter((household) => household.lv >= 5).length,
        jobs: Object.fromEntries(IRON_AUDIT_SITES.map(({ job }) => [
          job,
          economy.households.filter((household) => household.job === job).length,
        ])),
      });
    }
  }
  return {
    day: world.state.day,
    ironImport: economy.f30.iron?.imp ?? 0,
    ironProduction: economy.f30.iron?.prod ?? 0,
    incomes: maxIncomes,
    ironJobSwitches,
    yearly,
    jobs: Object.fromEntries(IRON_AUDIT_SITES.map(({ job }) => [
      job,
      economy.households.filter((household) => household.job === job).length,
    ])),
    physical: {
      carriers: assertCarrierInvariants(physical),
      occupancy: assertOccupancyInvariant(physical),
    },
    material: ironScenarioMaterialReport(economy, physical, initialTotals, initialFlows),
  };
}

export function runIronChainAudit({ seed = 11, days = 2160 } = {}) {
  const connected = runIronChainScenario({ seed, depositRoads: true, days });
  const disconnected = runIronChainScenario({ seed, depositRoads: false, days });
  const materialGreen = [connected, disconnected].every((scenario) => (
    GOODS.every((goods) => Math.abs(scenario.material[goods].residual) < 1e-6)
    && scenario.physical.carriers
    && scenario.physical.occupancy
  ));
  const replacement = connected.yearly.find((sample) => (
    sample.day > IRON_AUDIT_START_DAY
    && sample.ironImport < 0.05
    && sample.ironProduction > 0.05
  ));
  const disconnectedAtReplacement = disconnected.yearly.find((sample) => (
    sample.day === replacement?.day
  ));
  const results = [
    {
      id: "E-Fe1",
      passed: Boolean(replacement),
      detail: replacement
        ? `day${replacement.day} 鉄輸入EMA ${replacement.ironImport.toFixed(3)} / 国産EMA ${replacement.ironProduction.toFixed(3)}`
        : "6年以内に国産置換を観測できず",
    },
    {
      id: "E-Fe2",
      passed: Object.values(connected.incomes).every((income) => income > 2000),
      detail: Object.entries(connected.incomes)
        .map(([job, income]) => `${job}:${Math.round(income)}`)
        .join(" "),
    },
    {
      id: "E-Fe4",
      passed: Boolean(
        replacement
        && disconnectedAtReplacement
        && disconnectedAtReplacement.ironProduction < 0.05
        && replacement.ironProduction > disconnectedAtReplacement.ironProduction * 10,
      ),
      detail: replacement && disconnectedAtReplacement
        ? `day${replacement.day} 国産EMA 道路あり${replacement.ironProduction.toFixed(3)} / なし${disconnectedAtReplacement.ironProduction.toFixed(3)}`
        : "比較可能な国産置換時点なし",
    },
    {
      id: "E-Fe5",
      passed: materialGreen,
      detail: `最大残差${Math.max(
        ...[connected, disconnected].flatMap((scenario) => (
          GOODS.map((goods) => Math.abs(scenario.material[goods].residual))
        )),
      ).toExponential(3)}`,
    },
  ];
  return {
    connected,
    disconnected,
    results,
    passed: results.filter((result) => result.passed).length,
    total: results.length,
  };
}

export function runFlowIslandAudit() {
  const results = [];
  const scenario = runScenarioA();
  const economies = scenario.worlds.map((world) => world.state.economy);
  const famineTotal = economies.reduce((total, economy) => total + economy.famine, 0) / AUDIT_SEEDS.length;

  const worstImport = Math.max(...economies.map((economy) => economy.f30.wheat?.imp ?? 9));
  addResult(results, "E1", "麦自給(輸入<2/日)", worstImport < 2, `最悪シード輸入${worstImport.toFixed(1)}/日`);

  const incomeByJob = {};
  for (const economy of economies) {
    for (const household of economy.households) {
      (incomeByJob[household.job] ??= []).push((household.incY ?? 0) * 10);
    }
  }
  const legacyAuditJobs = new Set(LEGACY_AUDIT_JOBS);
  for (const [job, incomes] of Object.entries(incomeByJob)) {
    if (!legacyAuditJobs.has(job)) continue;
    const best = Math.max(...incomes);
    addResult(results, `E2-${job}`, `${job}が稼げる`, best > 2000, `最良世帯の年間収入${Math.round(best)}デナリ`);
  }

  const worstDebtRun = Math.max(0, ...Object.values(scenario.stuck));
  addResult(results, "E3", "借金漬け世帯なし", worstDebtRun < 90, `最長張り付き${worstDebtRun}日`);
  addResult(results, "E4", "飢餓(年平均)", famineTotal / 4 < 150, `4年計平均${Math.round(famineTotal)}(年${Math.round(famineTotal / 4)})`);
  const firstEconomy = economies[0];
  addResult(
    results,
    "E5",
    "森の持続",
    firstEconomy.grove > 5000,
    `残${Math.round(firstEconomy.grove)}`,
  );
  addResult(results, "E6", "湾の持続", firstEconomy.natural.bay > 72, `残${Math.round(firstEconomy.natural.bay)}`);
  for (const [goods, average] of Object.entries(scenario.stallAverage)) {
    addResult(results, `E7-${goods}`, `${goods}滞留なし`, average < 200, `平均${Math.round(average)}荷`);
  }

  const maxLevels = economies.map((economy) => Math.max(...economy.households.map((household) => household.lv)));
  const medianLevels = economies.map((economy) => {
    const levels = economy.households.map((household) => household.lv).sort((a, b) => a - b);
    return levels[Math.floor(levels.length / 2)];
  });
  addResult(
    results,
    "E8",
    "ラダー機能",
    Math.max(...maxLevels) >= 5 && Math.min(...medianLevels) >= 2,
    `最高${maxLevels.join("/")} 中央値${medianLevels.join("/")}`,
  );
  addResult(
    results,
    "E9",
    "財政の弧",
    economies.every((economy) => (
      economy.goDay === null
      && economy.company.money * 10 > -companyCreditLimit(economy, { day: 1440 }) * 10
      && economy.company.money * 10 < 150000
    )),
    economies.map((economy) => Math.round(economy.company.money * 10)).join("/"),
  );

  const fishWinter = averageBySeason(scenario.priceLog.fish, (month) => month >= 10 || month <= 2);
  const fishSummer = averageBySeason(scenario.priceLog.fish, (month) => month >= 4 && month <= 9);
  addResult(results, "E10-fish", "冬の魚価>夏", fishWinter > fishSummer * 1.3, `冬${fishWinter.toFixed(2)} 夏${fishSummer.toFixed(2)}`);
  const charWinter = averageBySeason(scenario.priceLog.char, (month) => month >= 10 || month <= 2);
  const charSummer = averageBySeason(scenario.priceLog.char, (month) => month >= 4 && month <= 9);
  addResult(results, "E10-char", "冬の炭価>夏", charWinter > charSummer, `冬${charWinter.toFixed(2)} 夏${charSummer.toFixed(2)}`);

  let hoard = null;
  for (const economy of economies) {
    for (const household of economy.households) {
      for (const goods of GOODS) {
        if (household.pantry[goods] > 1.5 * P.Y_WHEAT * 2) {
          hoard = `${household.job}が${goods}${Math.round(household.pantry[goods])}`;
        }
      }
    }
  }
  addResult(results, "E11", "死蔵なし", !hoard, hoard ?? "");
  const populations = economies.map(auditPopulation);
  addResult(
    results,
    "E12",
    "人口成長",
    populations.every((population) => population >= 90 && population <= 90 * 2.2),
    populations.join("/"),
  );
  const yearlyFamine = scenario.famineByYear.map(
    (values) => values.reduce((total, value) => total + value, 0) / AUDIT_SEEDS.length,
  );
  const year2 = yearlyFamine[1] - yearlyFamine[0];
  const year4 = yearlyFamine[3] - yearlyFamine[2];
  addResult(results, "E13", "飢えの出口", year4 < year2 * 1.1, `Y2飢餓${Math.round(year2)}→Y4飢餓${Math.round(year4)}`);
  addResult(
    results,
    "E14",
    "麦農家が初回収穫前に転職しない",
    scenario.earlyWheatSwitch.length === 0,
    scenario.earlyWheatSwitch.map(([seed, day]) => `seed${seed}:day${day}`).join(",") || "全seedで初回収穫を観測",
  );

  const advisor = runAdvisorScenario();
  addResult(
    results,
    "E15",
    "アドバイザ追従で生存",
    advisor.world.state.economy.goDay === null && advisor.world.state.economy.famine < 600,
    `建てた:${advisor.builds.join(",") || "なし"} 金庫${Math.round(advisor.world.state.economy.company.money * 10)} 飢餓${advisor.world.state.economy.famine}`,
  );

  const rhythm = runBuildingRhythmScenario();
  addResult(
    results,
    "E16",
    "漸進建築>一括建築",
    rhythm.paced.famine < rhythm.lump.famine
      && rhythm.paced.population >= rhythm.lump.population,
    `飢餓 漸進${rhythm.paced.famine}/一括${rhythm.lump.famine} 人口${rhythm.paced.population}/${rhythm.lump.population}`,
  );

  const material = runMaterialAudit();
  const physical = {
    carriers: scenario.worlds.every((world) => assertCarrierInvariants(world.state.physical)),
    occupancy: scenario.worlds.every((world) => assertOccupancyInvariant(world.state.physical)),
    material: Object.values(material).every((report) => report.ratio < 5 && !report.warning),
  };
  const passed = results.filter((result) => result.passed).length;
  return {
    results,
    material,
    physical,
    passed,
    failed: results.length - passed,
    total: results.length,
  };
}
