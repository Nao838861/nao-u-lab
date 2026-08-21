import {benefitNarrationDurationInFrames} from './benefitNarrationTiming';
import {constraintNarrationDurationInFrames} from './constraintNarrationTiming';
import {developmentNarrationDurationInFrames} from './developmentNarrationTiming';
import {drawingNarrationDurationInFrames} from './drawingNarrationTiming';
import {c17Timing} from './laterNarrationTiming';
import {narrationPreviewDurationInFrames} from './narrationTiming';

const c01StartFrame = 0;
const c04StartFrame = c01StartFrame + narrationPreviewDurationInFrames;
const c08StartFrame = c04StartFrame + developmentNarrationDurationInFrames;
const c11StartFrame = c08StartFrame + drawingNarrationDurationInFrames;
const c14StartFrame = c11StartFrame + benefitNarrationDurationInFrames;
const c17StartFrame = c14StartFrame + constraintNarrationDurationInFrames;

export const c01C17GroupStartFrames = {
  c01: c01StartFrame,
  c04: c04StartFrame,
  c08: c08StartFrame,
  c11: c11StartFrame,
  c14: c14StartFrame,
  c17: c17StartFrame,
};

export const c01C17NarrationDurationInFrames =
  c17StartFrame + c17Timing.durationFrames;
