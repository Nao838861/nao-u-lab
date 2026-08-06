import { buildBaseCity } from '../../engine/src/audit.js';
import { createEngineApi } from '../../engine/src/api.js';
import { VERSION } from '../src/config.js';
import { createViewController } from '../src/controller.js';
import { interpolateWorldModel } from '../src/presentation.js';
import { snapshotToViewModel } from '../src/view_model.js';

const RUNS = 5;
const VIEW_BUILDS = 40;
const INTERPOLATIONS = 600;

function median(values) {
  return [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)];
}

function measure(iterations, operation) {
  const samples = [];
  for (let run = 0; run < RUNS; run += 1) {
    const started = performance.now();
    for (let index = 0; index < iterations; index += 1) operation(index);
    samples.push(performance.now() - started);
  }
  return {
    medianTotalMs: median(samples),
    medianCallMs: median(samples) / iterations,
    samples,
  };
}

const api = createEngineApi(buildBaseCity(11));
api.advanceTicks(3600);
const beforeSnapshot = api.snapshot({ scope: 'view' });
const beforeModel = snapshotToViewModel(beforeSnapshot);
api.advanceTicks(3);
const afterSnapshot = api.snapshot({ scope: 'view' });
const afterModel = snapshotToViewModel(afterSnapshot);

for (let index = 0; index < 10; index += 1) snapshotToViewModel(afterSnapshot);
for (let index = 0; index < 60; index += 1) {
  interpolateWorldModel(beforeModel, afterModel, [], (index % 60) / 59);
}

const controller = createViewController(api);
for (let index = 0; index < 10; index += 1) controller.readModel();
const viewPipeline = measure(VIEW_BUILDS, () => controller.readModel());
const viewModel = measure(VIEW_BUILDS, () => snapshotToViewModel(afterSnapshot));
let previousModel = afterModel;
const incrementalViewModel = measure(VIEW_BUILDS, () => {
  previousModel = snapshotToViewModel(afterSnapshot, { previousModel });
});
const interpolation = measure(INTERPOLATIONS, index => (
  interpolateWorldModel(beforeModel, afterModel, [], (index % 60) / 59)
));

console.log(JSON.stringify({
  build: VERSION,
  tick: afterModel.tick,
  buildings: afterModel.buildings.length,
  carriers: afterModel.carriers.length,
  staticDrawables: afterModel.renderScene.staticDrawables.length,
  viewModel,
  incrementalViewModel,
  viewPipeline,
  interpolation,
}));
