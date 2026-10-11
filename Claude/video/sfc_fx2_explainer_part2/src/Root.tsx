import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile} from 'remotion';
import {FONT, FPS, H, W, Subtitle, sceneFrames, sceneOrder, sceneInfo} from './common';
import {C01, C02, C03, C04, C05, C06, C07} from './scenesA';
import {C08, C09, C10, C11, C12} from './scenesB';
import {C16} from './scenesC';

const SCENES: Record<string, React.FC> = {C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11, C12, C16};
const LEAD = 0.5;

const Full: React.FC<{only?: string}> = ({only}) => {
  const order = only ? [only] : sceneOrder;
  const starts: Record<string, number> = {};
  let at = 0;
  for (const id of order) { starts[id] = at; at += sceneFrames(id); }
  const total = at;
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT, color: '#eef3ff'}}>
      {!only && <Audio src={staticFile('audio/bgm.mp3')} loop volume={(f) => Math.min(1, f / 60) * Math.min(1, (total - f) / 120) * 0.13} />}
      {order.map((id) => {
        const Comp = SCENES[id];
        return (
          <Sequence key={id} from={starts[id]} durationInFrames={sceneFrames(id)} name={`${id} ${sceneInfo(id).title}`}>
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
