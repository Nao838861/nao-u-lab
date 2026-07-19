import { snapshotToViewModel } from './view_model.js';

export function createViewController(api) {
  if (!api?.snapshot || !api?.advanceTicks || !api?.applyOperation) {
    throw new TypeError('public engine API is required');
  }
  return Object.freeze({
    readModel() {
      return snapshotToViewModel(api.snapshot({ scope: 'full' }));
    },
    advanceTicks(count = 1) {
      api.advanceTicks(count);
    },
    advanceOneDay() {
      api.advanceDays(1);
    },
    operate(operation) {
      return api.applyOperation(operation);
    },
    events(afterSequence = 0) {
      return api.events({ afterSequence });
    },
    inputJournal() {
      return api.inputJournal();
    },
  });
}
