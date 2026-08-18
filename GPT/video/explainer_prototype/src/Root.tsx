import React from 'react';
import {Composition} from 'remotion';
import {ExplainerPrototype} from './ExplainerPrototype';
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
    </>
  );
};
