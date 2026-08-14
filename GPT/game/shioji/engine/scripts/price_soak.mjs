import { Worker } from "node:worker_threads";

const SEEDS = Object.freeze([101, 211, 307, 401, 503, 601]);
const DAYS = 3 * 360;

function runWorker(seed) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./stable_worker.mjs", import.meta.url), {
      workerData: {
        seed,
        mode: "price_soak",
        days: DAYS,
        materialCheckInterval: 360,
      },
    });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`price soak worker exited with code ${code}`));
    });
  });
}

const workers = await Promise.all(SEEDS.map(runWorker));
const results = workers.map(({ seed, elapsedMs, scenario }) => ({
  seed,
  elapsedMs,
  samples: scenario.priceAnchors.samples,
  passed: scenario.priceAnchors.passed,
  firstViolation: scenario.priceAnchors.firstViolation,
}));
const passed = results.every((result) => result.passed && result.samples >= DAYS * 17);

console.log(JSON.stringify({ passed, seeds: SEEDS, days: DAYS, results }, null, 2));
if (!passed) process.exitCode = 1;
