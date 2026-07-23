import assert from 'node:assert/strict';

import { buildBaseCity } from '../../engine/src/audit.js';
import { createEngineApi, mimicPlayerThroughApi } from '../../engine/src/api.js';
import { createViewController } from '../src/controller.js';

const days = Number(process.env.PERF_DAYS ?? 1300);
const interval = Number(process.env.PERF_INTERVAL ?? 100);
const world = buildBaseCity(11);
const api = createEngineApi(world);
const controller = createViewController(api);
const samples = [];
let blockStartedAt = performance.now();

for (let day = 1; day <= days; day += 1) {
  mimicPlayerThroughApi(api, world.state.day);
  api.advanceDays(1);
  controller.readModel();
  api.events({ afterSequence: 0 });
  if (day % interval !== 0) continue;

  globalThis.gc?.();
  const now = performance.now();
  const economy = world.state.economy;
  const physical = world.state.physical;
  const sample = {
    day,
    blockMs: Number((now - blockStartedAt).toFixed(1)),
    heapMB: Number((process.memoryUsage().heapUsed / 1_048_576).toFixed(1)),
    ledgerRows: economy.company.ledger.length,
    ledgerTotal: economy.company.ledgerCount,
    materialRows: economy.materialLedger.length,
    priceRows: Object.values(economy.prices).reduce((total, rows) => total + rows.length, 0),
    importRows: economy.importRequests.length,
    exportRows: economy.exportLots.length,
    haulRows: physical.haulJobs.length,
    portRows: physical.portCalls.length,
    queuedPortCalls: physical.portCallQueueIds.length,
    viewPortCalls: controller.readModel().portCalls.length,
    eventRows: api.events().length,
  };
  samples.push(sample);
  console.log(JSON.stringify(sample));
  blockStartedAt = performance.now();
}

const first = samples[0];
const mature = samples.find(sample => sample.day === 200) ?? samples[1] ?? first;
const last = samples.at(-1);
assert.ok(first && last, '性能計測には少なくとも1区間が必要');
assert.ok(last.ledgerRows <= 640);
assert.ok(last.materialRows <= 640);
assert.ok(Object.values(world.state.economy.prices).every(rows => rows.length <= 320));
assert.ok(last.haulRows <= 130 + world.state.physical.activeHaulJobIds.length);
assert.ok(last.viewPortCalls <= 9);
assert.ok(last.eventRows <= 128);
assert.ok(last.heapMB - first.heapMB <= 8, 'ヒープが日数に比例して増え続けている');

const result = {
  days,
  rawFirstToLastRatio: Number((last.blockMs / first.blockMs).toFixed(2)),
  matureToLastRatio: Number((last.blockMs / mature.blockMs).toFixed(2)),
  heapGrowthMB: Number((last.heapMB - first.heapMB).toFixed(1)),
};
assert.ok(
  result.matureToLastRatio <= 1.5,
  `定常人口到達後の100日区間が1.5倍を超えた: ${result.matureToLastRatio}`,
);
console.log(`long-run performance: PASS ${JSON.stringify(result)}`);
