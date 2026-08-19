import React from 'react';
import {Composition} from 'remotion';
import {
  BenefitNarrationPreview,
  ConstraintNarrationPreview,
  DevelopmentNarrationPreview,
  DrawingNarrationPreview,
  ExplainerPrototype,
  LaterNarrationPreview,
} from './ExplainerPrototype';
import {benefitNarrationDurationInFrames} from './benefitNarrationTiming';
import {constraintNarrationDurationInFrames} from './constraintNarrationTiming';
import {developmentNarrationDurationInFrames} from './developmentNarrationTiming';
import {drawingNarrationDurationInFrames} from './drawingNarrationTiming';
import {laterNarrationPreviewDurationInFrames} from './laterNarrationTiming';
import {
  fullCompositionDurationInFrames,
  narrationPreviewDurationInFrames,
} from './narrationTiming';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ExplainerPrototype"
        component={ExplainerPrototype}
        durationInFrames={fullCompositionDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ExplainerNarrationPreview"
        component={ExplainerPrototype}
        durationInFrames={narrationPreviewDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="DevelopmentNarrationPreview"
        component={DevelopmentNarrationPreview}
        durationInFrames={developmentNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="BenefitNarrationPreview"
        component={BenefitNarrationPreview}
        durationInFrames={benefitNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ConstraintNarrationPreview"
        component={ConstraintNarrationPreview}
        durationInFrames={constraintNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="DrawingNarrationPreview"
        component={DrawingNarrationPreview}
        durationInFrames={drawingNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="LaterNarrationPreview"
        component={LaterNarrationPreview}
        durationInFrames={laterNarrationPreviewDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
