import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import manifest from '../narration/cuts.json';
import {C, FPS, font, clamp, fade, SceneProps} from './ui';
import {SCENES} from './scenes';

type Cut = {id: string; chapter: string; title: string; text: string; startFrame: number; durationFrames: number;
  narrationLeadFrames: number; measuredDurationSeconds?: number; silent?: boolean};
export const cuts = manifest.cuts as Cut[];
export const totalFrames = cuts.reduce((n, c) => Math.max(n, c.startFrame + c.durationFrames), 0);

const CHAPTERS = ['はじめに', '回転をデータに変える', '1ラインずつの攻防', '4輪の摩擦円', 'AIとの開発', 'まとめ'];

const sentences = (text: string) => text.split(/(?<=。)/u).filter((s) => s.trim());

/** 文字数比例で各文の開始フレームを推定する（カット内ローカルフレーム） */
const beatsOf = (c: Cut) => {
  const ss = sentences(c.text);
  const total = ss.reduce((n, s) => n + s.length, 0) || 1;
  const len = (c.measuredDurationSeconds ?? 0) * FPS;
  let acc = 0;
  return ss.map((s) => {
    const b = c.narrationLeadFrames + Math.round((acc / total) * len);
    acc += s.length;
    return b;
  });
};

const Subtitle: React.FC<{c: Cut; beats: number[]}> = ({c, beats}) => {
  const f = useCurrentFrame();
  const ss = sentences(c.text);
  if (!ss.length) return null;
  const end = c.narrationLeadFrames + (c.measuredDurationSeconds ?? 0) * FPS;
  let i = -1;
  for (let k = 0; k < beats.length; k++) if (f >= beats[k]) i = k;
  if (i < 0 || f > end + 6) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', justifyContent: 'center'}}>
      <div style={{maxWidth: 1080, background: 'rgba(0,0,0,0.72)', borderRadius: 8, padding: '8px 18px', color: C.white,
        fontFamily: font, fontSize: 24, fontWeight: 600, lineHeight: 1.45, textAlign: 'center'}}>{ss[i]}</div>
    </div>
  );
};

const ChapterCard: React.FC<{c: Cut}> = ({c}) => {
  const f = useCurrentFrame();
  const n = CHAPTERS.indexOf(c.chapter);
  const o = Math.min(fade(f, 0, 10), interpolate(f, [c.narrationLeadFrames - 12, c.narrationLeadFrames], [1, 0], clamp));
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{background: C.bg, opacity: o, justifyContent: 'center', alignItems: 'center', fontFamily: font}}>
      <div style={{color: C.mag, fontSize: 22, fontWeight: 800, letterSpacing: 6}}>{`CHAPTER ${n}`}</div>
      <div style={{color: C.white, fontSize: 52, fontWeight: 800, marginTop: 12}}>{c.chapter}</div>
      <div style={{width: interpolate(f, [0, 30], [0, 420], clamp), height: 3, background: C.cyan, marginTop: 22}} />
    </AbsoluteFill>
  );
};

export const MMC5Explainer: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    {cuts.map((c) => {
      const Scene = SCENES[c.id] as React.FC<SceneProps> | undefined;
      const beats = beatsOf(c);
      const card = c.narrationLeadFrames >= 40;
      return (
        <Sequence key={c.id} from={c.startFrame} durationInFrames={c.durationFrames} name={`${c.id} ${c.title}`}>
          {Scene ? <Scene lead={c.narrationLeadFrames} dur={c.durationFrames} beats={beats} /> : null}
          {!c.silent ? (
            <Sequence from={c.narrationLeadFrames}>
              <Audio src={staticFile(`narration/${c.id}.wav`)} />
            </Sequence>
          ) : null}
          <Subtitle c={c} beats={beats} />
          {card ? <ChapterCard c={c} /> : null}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
