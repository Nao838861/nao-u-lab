import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {C, Game, clamp, cueOf, useIn} from './common';
import {CLIP} from './clips';

// ───────────────────────── C16 まとめ
export const C16: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C16', i);
  const tri = useIn(q(0));
  const thanks = interpolate(f, [q(2) - 10, q(2) + 10], [0, 1], clamp);
  const rows = [
    ['道A　2bpp＋パレット', '色が付く', '60fps', '8×8ごとの色の制約', C.green],
    ['道B　4bpp', '16色', '30fps', '絵の仕上げはこれから', C.amber],
    ['道C　SA-1', '16色', '60fps未達', '挑戦中', C.violet],
  ];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Game clip="color" field={CLIP.ending} w={1536} style={{borderRadius: 0}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(5,8,18,${0.55 + thanks * 0.3})`}} />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: tri * (1 - thanks)}}>
        <div style={{fontSize: 52, fontWeight: 900}}><span style={{color: C.green}}>色数</span>・<span style={{color: C.cyan}}>速さ</span>・<span style={{color: C.amber}}>絵の品質</span>　三つ同時はまだ取れていない</div>
      </div>
      <div style={{position: 'absolute', left: 200, top: 280, width: 1520, opacity: (1 - thanks)}}>
        {rows.map((r, i) => {
          const p = interpolate(f, [q(1) + i * 70, q(1) + i * 70 + 18], [0, 1], clamp);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '22px 30px', marginBottom: 20, borderRadius: 18, border: `4px solid ${r[4]}`, background: 'rgba(19,27,49,.88)', opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
              <div style={{width: 480, fontSize: 38, fontWeight: 900, color: r[4]}}>{r[0]}</div>
              <div style={{width: 220, fontSize: 36, fontWeight: 800}}>{r[1]}</div>
              <div style={{width: 260, fontSize: 36, fontWeight: 900, color: r[4]}}>{r[2]}</div>
              <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>{r[3]}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 440, width: '100%', textAlign: 'center', opacity: thanks, fontSize: 72, fontWeight: 900, color: '#fff'}}>ご視聴ありがとうございました</div>
    </AbsoluteFill>
  );
};

export const _c = [Easing];
