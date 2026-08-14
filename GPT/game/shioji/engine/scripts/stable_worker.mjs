import { parentPort, workerData } from "node:worker_threads";

import {
  E_STABLE_JOBS,
  mimicPlayer,
  runBadCityScenario,
  runStableCityScenario,
} from "../src/audit.js";
import { createEngineApi, mimicPlayerThroughApi } from "../src/api.js";

const {
  seed,
  mode = "direct",
  days,
  materialCheckInterval = 1,
  runBad = false,
} = workerData;
const startedAt = performance.now();
let scenario = null;
if (mode !== "api") {
  let controller = mimicPlayer;
  if (mode === "price_soak") {
    let randomState = (seed >>> 0) || 1;
    const nextRandom = () => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
      return randomState / 0x100000000;
    };
    const randomJobPool = Array.from({ length: 24 }, () => (
      E_STABLE_JOBS[Math.floor(nextRandom() * E_STABLE_JOBS.length)]
    ));
    let initialized = false;
    controller = (world, day) => {
      if (!initialized) {
        world.state.economy.jobSelectionPool = [...randomJobPool];
        initialized = true;
      }
      return mimicPlayer(world, day);
    };
  }
  scenario = runStableCityScenario(seed, {
    days,
    materialCheckInterval,
    controller,
  });
}
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
