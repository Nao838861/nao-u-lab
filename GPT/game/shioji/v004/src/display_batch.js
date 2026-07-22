export const DISPLAY_BATCH_TICKS = 3;

export function displayBatchSizeFor({ speedIndex, tutorialActive = false, tutorialComplete = false }) {
  const tutorialObserving = tutorialActive && !tutorialComplete;
  return speedIndex === 3 && !tutorialObserving ? DISPLAY_BATCH_TICKS : 1;
}

export function advanceInBatches(controller, count, {
  batchSize = DISPLAY_BATCH_TICKS,
  afterBatch = () => {},
} = {}) {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new TypeError('tick count must be a non-negative safe integer');
  }
  if (!Number.isSafeInteger(batchSize) || batchSize <= 0) {
    throw new TypeError('batch size must be a positive safe integer');
  }
  let advanced = 0;
  let batches = 0;
  while (advanced < count) {
    const ticks = Math.min(batchSize, count - advanced);
    controller.advanceTicks(ticks);
    advanced += ticks;
    batches += 1;
    afterBatch(ticks, advanced);
  }
  return { ticks: advanced, batches };
}
