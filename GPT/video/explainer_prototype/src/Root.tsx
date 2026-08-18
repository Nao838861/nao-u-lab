import React from 'react';
import {Composition} from 'remotion';
import {
  DevelopmentNarrationPreview,
  DrawingNarrationPreview,
  ExplainerPrototype,
} from './ExplainerPrototype';
import {developmentNarrationDurationInFrames} from './developmentNarrationTiming';
import {drawingNarrationDurationInFrames} from './drawingNarrationTiming';
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
        id="DrawingNarrationPreview"
        component={DrawingNarrationPreview}
        durationInFrames={drawingNarrationDurationInFrames}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
