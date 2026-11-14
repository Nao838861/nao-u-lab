import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile} from 'remotion';
import {FONT, FPS, H, W, Subtitle, leadOf, sceneFrames, sceneOrder, sceneInfo, videoOrder} from './common';
import {S01, S02, S03, S04, Thumbnail} from './scenesA';
import {S03b, S05b, S07b} from './scenesDeep';
import {S05c} from './scenesBus';
import {S05, S06, S07} from './scenesB';
import {S08, S08b} from './scenesCar';
import {S09, S10, S11, S12} from './scenesC';
import {D00, D01, D90} from './scenesExtra';

const SCENES: Record<string, React.FC> = {S01, S02, S03, S03b, S04, S05, S05b, S05c, S06, S07, S07b, S08, S08b, S09, S10, S11, S12, D00, D01, D90};
// 概要編と詳細編。並びは narration/script.json の videos（src/timing.json に写される）
export const VIDEOS = {overview: 'FxOverview', deep: 'FxDeep'} as const;

const Full: React.FC<{order: string[]; bgm?: boolean}> = ({order, bgm = true}) => {
  let at = 0;
  const total = order.reduce((a, id) => a + sceneFrames(id), 0);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT, color: '#eef3ff'}}>
      {bgm && <Audio src={staticFile('audio/bgm_game.mp3')} loop volume={(f) => Math.min(1, f / 60) * Math.min(1, (total - f) / 120) * 0.12} />}
      {order.map((id) => {
        const Comp = SCENES[id];
        const from = at;
        at += sceneFrames(id);
        return (
          <Sequence key={id} from={from} durationInFrames={sceneFrames(id)} name={`${id} ${sceneInfo(id).title}`}>
            <Comp />
            <Sequence from={Math.round(leadOf(id) * FPS)}>
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
    {Object.entries(VIDEOS).map(([v, id]) => (
      <Composition key={id} id={id} component={() => <Full order={videoOrder(v)} />} durationInFrames={videoOrder(v).reduce((a, s) => a + sceneFrames(s), 0)} fps={FPS} width={W} height={H} />
    ))}
    {sceneOrder.map((id) => (
      <Composition key={id} id={`Scene-${id}`} component={() => <Full order={[id]} bgm={false} />} durationInFrames={sceneFrames(id)} fps={FPS} width={W} height={H} />
    ))}
    <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);
