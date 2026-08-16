import React from 'react';
import {Composition} from 'remotion';
import {ExplainerPrototype} from './ExplainerPrototype';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ExplainerPrototype"
      component={ExplainerPrototype}
      durationInFrames={2340}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
