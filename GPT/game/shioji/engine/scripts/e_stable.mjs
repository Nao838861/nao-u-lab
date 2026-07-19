import { Worker } from "node:worker_threads";

import {
  AUDIT_SEEDS,
  E_STABLE_DAYS,
  E_STABLE_POPULATION_BAND,
} from "../src/audit.js";

function runWorker(seed, runBad = false) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./stable_worker.mjs", import.meta.url), {
      workerData: {
        seed,
        mode: "direct",
        days: E_STABLE_DAYS,
        materialCheckInterval: 360,
        runBad,
      },
    });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`stable worker exited with code ${code}`));
    });
  });
}

const workers = await Promise.all(AUDIT_SEEDS.map((seed, index) => runWorker(seed, index === 0)));
const scenarios = workers.map(({ scenario }) => scenario);
const bands = Object.fromEntries(Object.keys(scenarios[0].bands).map((band) => [
  band,
  scenarios.every((scenario) => scenario.bands[band]),
]));
const bad = workers[0].badScenario;
const [minimumPopulation, maximumPopulation] = E_STABLE_POPULATION_BAND;
const audit = {
  passed: scenarios.every(({ passed }) => passed) && bad.passed,
  seeds: [...AUDIT_SEEDS],
  days: E_STABLE_DAYS,
  bands,
  elapsedMs: workers.map(({ seed, elapsedMs }) => ({ seed, elapsedMs })),
  scenarios: scenarios.map((scenario) => ({
    seed: scenario.seed,
    passed: scenario.passed,
    bands: scenario.bands,
    firstPopulationBreach: scenario.yearly.find((sample) => (
      sample.population < minimumPopulation || sample.population > maximumPopulation
    )) ?? null,
    firstJobBreach: scenario.yearly.find((sample) => (
      Object.values(sample.jobs).some((count) => count < 1)
    )) ?? null,
    yearly: scenario.yearly,
    prices: scenario.prices,
    famine: scenario.famine,
    bankruptcyDay: scenario.bankruptcyDay,
    material: scenario.material,
    physical: scenario.physical,
  })),
  bad,
};

console.log(JSON.stringify(audit, null, 2));
if (!audit.passed) process.exitCode = 1;
