import React from 'react';
import {AbsoluteFill, Img, Loop, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FONT, SceneTitle, Tag, cueOf, useIn} from './common';
import {Card, Hw, Label, MONO, Nes, Txt, ramp} from './parts';

const K = (id: string) => (i: number) => cueOf(id, i);

// ---------------- S09 走りは2D版と同じ ----------------
export const S09: React.FC = () => {
  const f = useCurrentFrame(), k = K('S09');
  const a1 = useIn(k(1)), a2 = useIn(k(2)), a3 = useIn(k(3));
  const S = 900 / 256;
  return (
    <Bg>
      <SceneTitle label="走りは2D版と同じ" color={C.violet} />
      <Nes src="main" from={1300} x={80} y={140} w={900}>
        <div style={{position: 'absolute', left: 184 * S, top: 192 * S, width: 72 * S, height: 48 * S, border: `5px solid ${C.amber}`, borderRadius: 10,
          opacity: a2, boxShadow: `0 0 24px ${C.amber}`}} />
      </Nes>
      <Card x={1060} y={150} w={800} color={C.violet} o={a1}>
        <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>物理演算のプログラム</div>
        <div style={{fontSize: 44, fontWeight: 900}}>2D版の6502のコードを<br />そのまま動かす</div>
        <div style={{fontSize: 30, color: C.violet, fontWeight: 800, marginTop: 8}}>変えたのは描き方だけ</div>
      </Card>
      <Card x={1060} y={430} w={800} color={C.amber} o={a2}>
        <div style={{fontSize: 34, fontWeight: 900}}>右下：4つのタイヤの摩擦円</div>
        <div style={{fontSize: 28, color: C.sub, fontWeight: 700, marginTop: 6}}>前回紹介したものが、そのまま出ている</div>
      </Card>
      <div style={{position: 'absolute', left: 1060, top: 640, display: 'flex', gap: 14, opacity: a3}}>
        {[['ブレーキ', C.red], ['前に重さ', C.amber], ['旋回', C.cyan], ['アクセル', C.green]].map(([t, c], i) => (
          <Tag key={t} color={c} style={{fontSize: 30, opacity: ramp(f, k(3) + i * 20, k(3) + i * 20 + 14)}}>{t}</Tag>
        ))}
      </div>
    </Bg>
  );
};

// ---------------- S10 4つの視点 ----------------
const VIEWS: [number, string][] = [[920, '高い追従'], [1520, '真上からの俯瞰'], [2120, '運転席'], [2720, '低い追従']];
export const S10: React.FC = () => {
  const f = useCurrentFrame(), k = K('S10');
  const W = 560;
  return (
    <Bg>
      <SceneTitle label="4つの視点" color={C.cyan} />
      {VIEWS.map(([from, t], i) => {
        const o = ramp(f, k(0) + i * 24, k(0) + i * 24 + 16);
        const x = 380 + (i % 2) * (W + 40), y = 120 + Math.floor(i / 2) * (W * 0.75 + 30);
        return (
          <div key={t} style={{opacity: o}}>
            <Loop durationInFrames={560} layout="none"><Nes src="views" from={from} x={x} y={y} w={W} crop={[0, 0, 256, 192]} /></Loop>
            <Label x={x + 14} y={y + 14} color={C.cyan}>{`${i + 1}　${t}`}</Label>
          </div>
        );
      })}
    </Bg>
  );
};

// ---------------- S11 2D版のリプレイを3D版で ----------------
export const S11: React.FC = () => {
  const f = useCurrentFrame(), k = K('S11');
  const W = 780;
  const a2 = ramp(f, k(2), k(2) + 18);
  return (
    <Bg>
      <SceneTitle label="2D版のリプレイを3D版で" color={C.green} />
      <div style={{opacity: useIn(k(0)) * (1 - 0.7 * a2)}}>
        <Nes src="n2d" from={420} x={110} y={140} w={W} volume={0.5} />
        <Nes src="n3d" from={420} x={1030} y={140} w={W} />
        <Label x={130} y={160} color={C.amber}>2D版で記録したリプレイ（DRIFT）</Label>
        <Label x={1050} y={160} color={C.green}>同じリプレイを3D版で再生</Label>
      </div>
      {[['drift', 450], ['grip', 1010]].map(([m, x], i) => (
        <div key={m as string} style={{position: 'absolute', left: x as number, top: 140, width: 460, height: 760, overflow: 'hidden', borderRadius: 12,
          boxShadow: '0 16px 50px rgba(0,0,0,.7)', opacity: ramp(f, k(2) + i * 12, k(2) + i * 12 + 18)}}>
          <Img src={staticFile(`img/web_ranking_${m}.png`)} style={{width: 460, display: 'block', transform: `translateY(${m === 'drift' ? -480 * ramp(f, k(2) + 60, k(2) + 300) : 0}px)`}} />
        </div>
      ))}
    </Bg>
  );
};

// ---------------- S12 まとめ ----------------
export const S12: React.FC = () => {
  const f = useCurrentFrame(), k = K('S12');
  const a1 = useIn(k(1));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Hw sec={40} x={0} y={0} w={1920} style={{borderRadius: 0}} volume={0.3} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.1) 60%)'}} />
      <Txt x={80} y={170} size={40} color={C.cyan} o={useIn(k(0))}>ゲームは6502　描画は SuperFX ＋ Mode7</Txt>
      <div style={{position: 'absolute', left: 80, top: 250, display: 'flex', flexDirection: 'column', gap: 16, opacity: useIn(k(0) + 20)}}>
        {['絵を描く', '地面を回す', '色を増やす'].map((t, i) => (
          <Tag key={t} color={[C.cyan, C.green, C.amber][i]} style={{fontSize: 38, background: 'rgba(5,8,18,.8)'}}>{`できないこと${i + 1}　→　${t}`}</Tag>
        ))}
      </div>
      <Txt x={80} y={540} size={64} o={a1}>{'見た目は3Dになっても\n中身は2D版と同じゲーム'}</Txt>
    </AbsoluteFill>
  );
};
