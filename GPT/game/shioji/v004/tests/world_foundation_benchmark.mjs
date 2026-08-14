import assert from 'node:assert/strict';

import { buildWorldScaleFoundation } from '../../engine/src/audit.js';
import { createEngineApi } from '../../engine/src/api.js';
import { VERSION } from '../src/config.js';
import { snapshotToViewModel } from '../src/view_model.js';

const RUNS = 7;
const BUILDS_PER_RUN = 10;

function median(values) {
  return [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)];
}

const api = createEngineApi(buildWorldScaleFoundation(11));
const fullSnapshot = api.snapshot({ scope: 'view' });
let previousModel = snapshotToViewModel(fullSnapshot);
assert.deepEqual([previousModel.width, previousModel.height], [256, 256]);
assert.equal(previousModel.households.length, 150);
assert.equal(previousModel.population, 750);

const samples = [];
for (let run = 0; run < RUNS; run += 1) {
  const startedAt = performance.now();
  for (let index = 0; index < BUILDS_PER_RUN; index += 1) {
    const snapshot = api.snapshot({
      scope: 'view',
      terrainAfterRevision: fullSnapshot.physical.travelRevision,
    });
    previousModel = snapshotToViewModel(snapshot, { previousModel });
  }
  samples.push((performance.now() - startedAt) / BUILDS_PER_RUN);
}

console.log(JSON.stringify({
  build: VERSION,
  size: [previousModel.width, previousModel.height],
  households: previousModel.households.length,
  population: previousModel.population,
  medianIncrementalViewMs: median(samples),
  samples,
}));
