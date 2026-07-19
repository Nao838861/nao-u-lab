import { parentPort, workerData } from "node:worker_threads";

import { runBadCityScenario, runIronChainScenario } from "../src/audit.js";

const {
  seed = 11,
  depositRoads,
  days = 2160,
  badBaselineYearly = null,
} = workerData;
const startedAt = performance.now();
const scenario = runIronChainScenario({ seed, depositRoads, days });
const badScenario = badBaselineYearly
  ? runBadCityScenario(seed, {
      days: 1440,
      baselineYearly: badBaselineYearly,
      materialCheckInterval: 360,
    })
  : null;

parentPort.postMessage({
  seed,
  depositRoads,
  elapsedMs: performance.now() - startedAt,
  scenario,
  badScenario,
});
