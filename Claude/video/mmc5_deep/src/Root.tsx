import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile} from 'remotion';
import {FONT, FPS, H, W, Subtitle, sceneFrames, sceneOrder, sceneInfo} from './common';
import {P00, A1, A2, A3, A4, A5} from './d1';
import {B1, B2, B3, B4, C1, C2, C3, C4} from './d2';
import {C5, C6, C7, C8, D1, D2, D3, D4, D5} from './d3';
import {E1, E2, E3, F1, F2, F3, Z9} from './d4';

const SCENES: Record<string, React.FC> = {P00, A1, A2, A3, A4, A5, B1, B2, B3, B4, C1, C2, C3, C4, C5, C6, C7, C8, D1, D2, D3, D4, D5, E1, E2, E3, F1, F2, F3, Z9};
const LEAD = 0.5;
const QUIET = new Set(['E1', 'E3', 'Z9']); // 音を聴かせる場面ではBGMを下げる

const starts = (() => { const m: Record<string, number> = {}; let t = 0; for (const id of sceneOrder) { m[id] = t; t += sceneFrames(id); } return m; })();
const bgmVolume = (f: number, total: number) => {
  let v = 0.1;
  for (const id of QUIET) { const s = starts[id], e = s + sceneFrames(id); if (f > s - 20 && f < e + 20) v = 0; }
  return v * Math.min(1, f / 60) * Math.min(1, (total - f) / 120);
};

const Full: React.FC<{only?: string}> = ({only}) => {
  const order = only ? [only] : sceneOrder;
  let at = 0;
  const total = order.reduce((a, id) => a + sceneFrames(id), 0);
  return (
    <AbsoluteFill style={{background: '#000', fontFamily: FONT, color: '#eef3ff'}}>
      {!only && <Audio src={staticFile('audio/bgm.mp3')} loop volume={(f) => bgmVolume(f, total)} />}
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
    <Composition id="MMC5Deep" component={Full} durationInFrames={sceneOrder.reduce((a, id) => a + sceneFrames(id), 0)} fps={FPS} width={W} height={H} />
    {sceneOrder.map((id) => (
      <Composition key={id} id={`Scene-${id}`} component={() => <Full only={id} />} durationInFrames={sceneFrames(id)} fps={FPS} width={W} height={H} />
    ))}
  </>
);
