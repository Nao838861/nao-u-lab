import { parentPort, workerData } from "node:worker_threads";

import { runBadCityScenario, runStableCityScenario } from "../src/audit.js";
import { createEngineApi, mimicPlayerThroughApi } from "../src/api.js";

const {
  seed,
  mode = "direct",
  days,
  materialCheckInterval = 1,
  runBad = false,
} = workerData;
const startedAt = performance.now();
const scenario = mode === "api" ? null : runStableCityScenario(seed, {
  days,
  materialCheckInterval,
});
let api = null;
let apiScenario = null;
if (mode === "api" || mode === "direct_api") {
  const controller = (world, day) => {
    api ??= createEngineApi(world, { captureEventStream: false });
    return mimicPlayerThroughApi(api, day);
  };
  apiScenario = runStableCityScenario(seed, {
    days,
    materialCheckInterval,
    controller,
  });
}
const badScenario = runBad
  ? runBadCityScenario(seed, {
      days: 1440,
      baselineYearly: (scenario ?? apiScenario).yearly,
      materialCheckInterval: 360,
    })
  : null;
parentPort.postMessage({
  mode,
  seed,
  elapsedMs: performance.now() - startedAt,
  journalLength: api?.inputJournal().length ?? 0,
  scenario,
  apiScenario,
  badScenario,
});
