import React from 'react';
import {Composition} from 'remotion';
import {MMC5Explainer, totalFrames} from './Explainer';

export const RemotionRoot: React.FC = () => (
  <Composition id="MMC5Explainer" component={MMC5Explainer} durationInFrames={totalFrames} fps={30} width={1280} height={720} />
);
