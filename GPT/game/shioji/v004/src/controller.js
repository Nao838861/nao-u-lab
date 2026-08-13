import {
  snapshotToViewModel, terrainRevisionForModel,
} from './view_model.js?v=v004.51.0-caravan-guidance';

export function createViewController(api) {
  if (!api?.snapshot || !api?.advanceTicks || !api?.applyOperation) {
    throw new TypeError('public engine API is required');
  }
  const counts = {
    advanceCalls: 0,
    advancedTicks: 0,
    snapshotReads: 0,
    viewModelBuilds: 0,
    eventReads: 0,
  };
  let previousModel = null;
  return Object.freeze({
    readModel() {
      counts.snapshotReads += 1;
      const snapshot = api.snapshot({
        scope: 'view',
        terrainAfterRevision: terrainRevisionForModel(previousModel),
      });
      counts.viewModelBuilds += 1;
      previousModel = snapshotToViewModel(snapshot, { previousModel });
      return previousModel;
    },
    advanceTicks(count = 1) {
      counts.advanceCalls += 1;
      counts.advancedTicks += count;
      api.advanceTicks(count);
    },
    advanceOneDay() {
      api.advanceDays(1);
    },
    operate(operation) {
      return api.applyOperation(operation);
    },
    events(afterSequence = 0) {
      counts.eventReads += 1;
      return api.events({ afterSequence });
    },
    inputJournal() {
      return api.inputJournal();
    },
    saveState() {
      return api.snapshot({ scope: 'full' });
    },
    metrics() {
      return Object.freeze({ ...counts });
    },
    resetMetrics() {
      for (const key of Object.keys(counts)) counts[key] = 0;
    },
  });
}
