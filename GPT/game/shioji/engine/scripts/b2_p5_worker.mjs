import { readFileSync } from "node:fs";
import { parentPort, workerData } from "node:worker_threads";

import {
  FOODS,
  assertMoneyConservation,
  companyCreditLimit,
} from "../src/econ.js";
import {
  runB2ExpansionScenario,
  runB2MotherPortScenario,
} from "../src/audit.js";
import { parseB2MapData } from "../../v004/src/b2_map.js";

const {
  mode = "strategy",
  strategyId = "fishery",
  seed = 11,
  days = mode === "mother" ? 1080 : 1800,
} = workerData;
const sourceUrl = new URL("../../design/map_b2/b2_map_data.json", import.meta.url);
const definition = parseB2MapData(JSON.parse(readFileSync(sourceUrl, "utf8")));
const startedAt = performance.now();

function recentHunger(household, days = 30) {
  return (household.hungerHist ?? []).slice(-days)
    .reduce((total, hungry) => total + (hungry ? 1 : 0), 0);
}

function summarizeMarkets(economy) {
  const marketIds = [...new Set(economy.households
    .map(household => household.marketId ?? "main"))].sort();
  if (!marketIds.includes("main")) marketIds.unshift("main");
  return marketIds.map(id => {
    const households = economy.households.filter(
      household => (household.marketId ?? "main") === id,
    );
    const population = households.reduce(
      (total, household) => total + household.members.length,
      0,
    );
    const pantryFood = households.reduce((total, household) => (
      total + FOODS.reduce(
        (sum, goods) => sum + Math.max(0, household.pantry[goods] ?? 0),
        0,
      )
    ), 0);
    const publicFood = FOODS.reduce((total, goods) => (
      total
        + (economy.stalls[goods] ?? []).reduce((sum, stall) => (
          (stall.marketId ?? "main") === id
            ? sum + Math.max(0, stall.qty ?? 0)
            : sum
        ), 0)
        + Math.max(0, economy.marketStockM?.[id]?.[goods] ?? 0)
        + (id === "main" ? Math.max(0, economy.importStock?.[goods] ?? 0) : 0)
    ), 0);
    return {
      id,
      households: households.length,
      population,
      hungry30: households.reduce(
        (total, household) => total + recentHunger(household),
        0,
      ),
      foodDays: (pantryFood + publicFood) / Math.max(1, population),
    };
  });
}

function summarizeJobs(economy) {
  return Object.fromEntries([...new Set(economy.households.map(household => household.job))]
    .sort()
    .map(job => {
      const households = economy.households.filter(household => household.job === job);
      return [job, {
        households: households.length,
        population: households.reduce(
          (total, household) => total + household.members.length,
          0,
        ),
        hungry30: households.reduce(
          (total, household) => total + recentHunger(household),
          0,
        ),
        purse: households.reduce((total, household) => total + household.purse, 0),
        income30: households.reduce((total, household) => total + household.income30, 0),
      }];
    }));
}

let payload;
if (mode === "mother") {
  const result = runB2MotherPortScenario(definition, { seed, days });
  const { economy } = result.world.state;
  payload = {
    mode,
    seed,
    days,
    companyStart: result.companyStart,
    companyEnd: result.companyEnd,
    bankruptcyDay: result.bankruptcyDay,
    populationStart: result.populationStart,
    population: result.population,
    famine: result.famine,
    hungry30: result.hungry30,
    initialBaldTiles: result.initialBaldTiles,
    baldTiles: result.baldTiles,
    initialLoggerWood: result.initialLoggerWood,
    loggerWood: result.loggerWood,
    fisheries: result.fisheries,
    markets: summarizeMarkets(economy),
    jobs: summarizeJobs(economy),
    yearly: result.yearly,
    orderRevenue: economy.co.ordSell ?? 0,
    regularExportRevenue: economy.co.expSell ?? 0,
    moneyConserved: assertMoneyConservation(economy),
  };
} else {
  const result = runB2ExpansionScenario(definition, { seed, strategyId, days });
  const { economy } = result.world.state;
  payload = {
    mode,
    seed,
    strategyId,
    days,
    companyStart: result.companyStart,
    companyEnd: result.companyEnd,
    companyDelta: result.companyDelta,
    creditLimit: companyCreditLimit(economy, { day: days }),
    bankruptcyDay: result.bankruptcyDay,
    population: result.population,
    famine: result.famine,
    medianLevel: result.medianLevel,
    highLevelHouseholds: result.highLevelHouseholds,
    markets: summarizeMarkets(economy),
    expansions: result.expansions.map(expansion => ({
      marketId: expansion.marketId,
      openedDay: expansion.openedDay,
    })),
    routes: result.routes,
    yearly: result.yearly,
    orderRevenue: result.orderRevenue,
    regularExportRevenue: result.regularExportRevenue,
    exported: result.exported,
    developmentImports: result.developmentImports,
    fleetPurchases: result.fleetPurchases,
    moneyConserved: assertMoneyConservation(economy),
  };
}

parentPort.postMessage({
  ...payload,
  elapsedMs: performance.now() - startedAt,
});
