import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile} from 'remotion';
import {FONT, FPS, H, W, Subtitle, sceneFrames, sceneOrder, sceneInfo} from './common';
import {S01, S02, S03, S04, S05, S06} from './scenes1';
import {S07, S08, S09, S11, S12} from './scenes2';

const SCENES: Record<string, React.FC> = {S01, S02, S03, S04, S05, S06, S07, S08, S09, S11, S12};
const LEAD = 0.5;

const Full: React.FC<{only?: string}> = ({only}) => {
  const order = only ? [only] : sceneOrder;
  let at = 0;
  const total = order.reduce((a, id) => a + sceneFrames(id), 0);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT, color: '#eef3ff'}}>
      {!only && <Audio src={staticFile('audio/bgm.mp3')} loop volume={(f) => Math.min(1, f / 60) * Math.min(1, (total - f) / 120) * 0.13} />}
      {order.map((id) => {
        const Comp = SCENES[id];
        const from = at;
        at += sceneFrames(id);
        return (
          <Sequence key={id} from={from} durationInFrames={sceneFrames(id)} name={`${id} ${sceneInfo(id).title}`}>
            <Comp />
            <Sequence from={Math.round(LEAD * FPS)}>
              <Audio src={staticFile(`audio/${id}.wav`)} />
            </Sequence>
            <Subtitle id={id} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FX2Explainer" component={Full} durationInFrames={sceneOrder.reduce((a, id) => a + sceneFrames(id), 0)} fps={FPS} width={W} height={H} />
    {sceneOrder.map((id) => (
      <Composition key={id} id={`Scene-${id}`} component={() => <Full only={id} />} durationInFrames={sceneFrames(id)} fps={FPS} width={W} height={H} />
    ))}
  </>
);
