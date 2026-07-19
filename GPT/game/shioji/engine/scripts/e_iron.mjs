import { Worker } from "node:worker_threads";

import {
  AUDIT_SEEDS,
  IRON_CHAIN_BANDS,
  evaluateIronChainScenarios,
} from "../src/audit.js";

const days = 2160;

function runWorker(seed, depositRoads) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./iron_worker.mjs", import.meta.url), {
      workerData: { seed, depositRoads, days },
    });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`iron worker exited with code ${code}`));
    });
  });
}

const workerResults = await Promise.all(AUDIT_SEEDS.flatMap((seed) => [
  runWorker(seed, true),
  runWorker(seed, false),
]));
const audits = AUDIT_SEEDS.map((seed) => {
  const connected = workerResults.find((result) => result.seed === seed && result.depositRoads);
  const disconnected = workerResults.find((result) => result.seed === seed && !result.depositRoads);
  return evaluateIronChainScenarios(connected.scenario, disconnected.scenario);
});
const atReplacement = audits.map(({ connected }) => (
  connected.yearly.find(({ day }) => day === IRON_CHAIN_BANDS.replacementByDay)
));
const incomes = Object.fromEntries(Object.keys(IRON_CHAIN_BANDS.incomeMinimums).map((job) => {
  const values = audits.map(({ connected }) => connected.incomes[job]);
  return [job, { min: Math.min(...values), max: Math.max(...values) }];
}));
const audit = {
  passed: audits.every(({ passed, total }) => passed === total),
  seeds: [...AUDIT_SEEDS],
  days,
  bands: IRON_CHAIN_BANDS,
  envelope: {
    ironImport: {
      min: Math.min(...atReplacement.map(({ ironImport }) => ironImport)),
      max: Math.max(...atReplacement.map(({ ironImport }) => ironImport)),
    },
    ironProduction: {
      min: Math.min(...atReplacement.map(({ ironProduction }) => ironProduction)),
      max: Math.max(...atReplacement.map(({ ironProduction }) => ironProduction)),
    },
    incomes,
  },
  elapsedMs: workerResults.map(({ seed, depositRoads, elapsedMs }) => ({
    seed,
    depositRoads,
    elapsedMs,
  })),
  scenarios: audits.map(({ connected, disconnected, results }) => ({
    results,
    connected: {
      yearly: connected.yearly,
      incomes: connected.incomes,
      jobs: connected.jobs,
      physical: connected.physical,
      material: connected.material,
    },
    disconnected: {
      yearly: disconnected.yearly,
      jobs: disconnected.jobs,
      physical: disconnected.physical,
      material: disconnected.material,
    },
  })),
};

console.log(JSON.stringify(audit, null, 2));
if (!audit.passed) process.exitCode = 1;
