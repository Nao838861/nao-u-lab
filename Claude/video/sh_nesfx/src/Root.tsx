import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile} from 'remotion';
import {FONT, FPS, H, W, Subtitle, leadOf, sceneFrames, sceneOrder, sceneInfo, videoOrder} from './common';
import {S01, S02, S03, S04, S05} from './scenesA';
import {S06, S07, S08, S09, Thumbnail} from './scenesB';

const SCENES: Record<string, React.FC> = {S01, S02, S03, S04, S05, S06, S07, S08, S09};

const Full: React.FC<{order: string[]}> = ({order}) => {
  let at = 0;
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT, color: '#eef3ff'}}>
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
    <Composition id="ShMain" component={() => <Full order={videoOrder('main')} />} durationInFrames={videoOrder('main').reduce((a, s) => a + sceneFrames(s), 0)} fps={FPS} width={W} height={H} />
    {sceneOrder.map((id) => (
      <Composition key={id} id={`Scene-${id}`} component={() => <Full order={[id]} />} durationInFrames={sceneFrames(id)} fps={FPS} width={W} height={H} />
    ))}
    <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);
