import React from 'react';
import {OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FONT, SceneTitle, cueOf, useIn} from './common';
import {Nes, Txt, ramp} from './parts';

const K = (id: string) => (i: number) => cueOf(id, i);

// ---------------- S05c ファミコンと16bit機の違い ----------------
// 事実：ファミコンはカートリッジ端子にPPUのバス（パターンテーブル）が出ていて、PPUは描画のたびにカートリッジを読む。
// スーパーファミコンなど多くの16bit機は、PPUが本体内のVRAMだけを読み、カートリッジとPPUの間に配線がない（DMAでVRAMへ転送）。
// 6KBは前回のスーパーファミコン版の実測（sfc_fx2_explainer の S07）。図の動きは仕組みを示す模式図。
const PW = 840;
const Box: React.FC<{x: number; y: number; w: number; h: number; color: string; title: string; sub?: string; glow?: number; o?: number}> =
  ({x, y, w, h, color, title, sub, glow = 0, o = 1}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 14, background: C.panel, border: `3px solid ${color}`, opacity: o,
      boxShadow: glow ? `0 0 ${20 + 30 * glow}px ${color}` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
      <div style={{fontSize: 32, fontWeight: 900, color: C.text}}>{title}</div>
      {sub && <div style={{fontSize: 22, fontWeight: 700, color: C.sub, marginTop: 4, textAlign: 'center'}}>{sub}</div>}
    </div>
  );

const Dot: React.FC<{x: number; y: number; color: string; s?: number}> = ({x, y, color, s = 16}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: 4, background: color, boxShadow: `0 0 10px ${color}`}} />
);

/** 折れ線の上の位置（0〜1） */
const along = (pts: number[][], t: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = t * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) { const r = d / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r]; }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
const Wire: React.FC<{pts: number[][]; color: string; w?: number; dash?: boolean; o?: number}> = ({pts, color, w = 6, dash, o = 1}) => (
  <svg width={PW} height={700} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}}>
    <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeDasharray={dash ? '14 10' : undefined} />
  </svg>
);


export const S05c: React.FC = () => {
  const f = useCurrentFrame(), k = K('S05c');
  const sfcFocus = ramp(f, k(1), k(1) + 16) * (1 - ramp(f, k(3), k(3) + 16));
  const fcFocus = ramp(f, k(3), k(3) + 16);
  const end = ramp(f, k(5), k(5) + 20);
  const panelO = (focus: number, other: number) => (1 - end) * (1 - 0.6 * other * (1 - focus));
  // スーパーファミコン：VBLANKの間だけDMAが流れる（60フレーム周期の模式）
  const cyc = f % 60, vblank = cyc < 12;
  const sent = (Math.min(cyc, 12) / 12) * 0.5; // VBLANKの間に半分まで送って止まる
  const sfcPath = [[200, 470], [200, 330], [200, 215], [380, 215], [560, 255]]; // カートリッジ→CPU→（DMA）→VRAM
  // ファミコン：PPU⇔カートリッジを絶えず往復
  const fcPath = [[640, 470], [640, 330], [640, 195]];
  // 「前作の2D版は…MMC5は…」の行は削除（2026-11-11）。カートリッジの中身の切り替え演出もなし
  return (
    <Bg>
      <SceneTitle label="ファミコンと16bit機の違い" color={C.violet} />
      {/* 左：スーパーファミコン */}
      <div style={{position: 'absolute', left: 80, top: 140, width: PW, height: 700, opacity: panelO(sfcFocus, fcFocus) * useIn(k(0))}}>
        <Txt x={20} y={0} size={34} color={C.red}>スーパーファミコンなど 多くの16bit機</Txt>
        <div style={{position: 'absolute', left: 20, top: 60, width: 800, height: 290, borderRadius: 18, border: `3px dashed ${C.line}`}} />
        <Txt x={36} y={66} size={24} color={C.sub}>本体</Txt>
        <Box x={60} y={170} w={200} h={90} color={C.violet} title="CPU" />
        <Box x={560} y={110} w={200} h={90} color={C.amber} title="PPU" sub="→ 画面" />
        <Box x={560} y={225} w={200} h={80} color={C.red} title="VRAM" sub="本体の中" glow={sfcFocus * (vblank ? 1 : 0.3)} />
        <Wire pts={[[200, 470], [200, 260]]} color={C.violet} />
        <Wire pts={[[260, 215], [560, 255]]} color={C.red} dash o={ramp(f, k(2), k(2) + 16)} />
        <Wire pts={[[660, 225], [660, 200]]} color={C.amber} />
        {/* カートリッジとPPUの間には配線がない */}
        <Wire pts={[[640, 470], [640, 305]]} color={C.red} w={4} dash o={ramp(f, k(1) + 60, k(1) + 76)} />
        <div style={{position: 'absolute', left: 612, top: 360, fontSize: 70, fontWeight: 900, color: C.red, opacity: ramp(f, k(1) + 60, k(1) + 76), fontFamily: FONT}}>×</div>
        <Txt x={300} y={400} size={24} color={C.red} w={300} o={ramp(f, k(1) + 80, k(1) + 96)}>{'カートリッジと\nPPUをつなぐ配線がない'}</Txt>
        <Box x={120} y={470} w={560} h={130} color={C.cyan} title="カートリッジ" sub="SuperFX が描いた絵" />
        {/* DMA：VBLANKの間だけ流れる */}
        {f >= k(2) && vblank && Array.from({length: 4}, (_, i) => {
          const [x, y] = along(sfcPath, ((cyc + i * 3) % 12) / 12);
          return <Dot key={i} x={x} y={y} color={C.red} />;
        })}
        <div style={{position: 'absolute', left: 270, top: 225, opacity: ramp(f, k(2), k(2) + 16)}}>
          <div style={{fontSize: 24, fontWeight: 900, color: vblank ? C.red : C.sub, fontFamily: FONT}}>{vblank ? 'DMA転送中（VBLANK）' : '転送できない（描画中）'}</div>
        </div>
        <div style={{position: 'absolute', left: 60, top: 610, width: 700, opacity: ramp(f, k(2) + 30, k(2) + 46)}}>
          <div style={{fontSize: 24, fontWeight: 800, color: C.sub, fontFamily: FONT}}>1フレームに送れた量（前回のスーパーファミコン版）</div>
          <div style={{marginTop: 6, width: 700, height: 30, borderRadius: 8, background: C.panel2, overflow: 'hidden', position: 'relative'}}>
            <div style={{width: `${sent * 100}%`, height: '100%', background: C.red}} />
            <div style={{position: 'absolute', left: 350, top: 0, bottom: 0, width: 3, background: C.text}} />
          </div>
          <div style={{fontSize: 26, fontWeight: 900, color: C.red, fontFamily: FONT, marginTop: 4}}>約6KB ／ 必要な12KB</div>
        </div>
      </div>
      {/* 右：ファミコン */}
      <div style={{position: 'absolute', left: 1000, top: 140, width: PW, height: 700, opacity: panelO(fcFocus, sfcFocus) * useIn(k(0))}}>
        <Txt x={20} y={0} size={34} color={C.green}>ファミコン</Txt>
        <div style={{position: 'absolute', left: 20, top: 60, width: 800, height: 290, borderRadius: 18, border: `3px dashed ${C.line}`}} />
        <Txt x={36} y={66} size={24} color={C.sub}>本体</Txt>
        <Box x={60} y={170} w={200} h={90} color={C.violet} title="CPU" sub="6502" />
        <Box x={560} y={110} w={200} h={90} color={C.amber} title="PPU" sub="→ 画面" />
        <Wire pts={[[200, 470], [200, 260]]} color={C.violet} />
        <Wire pts={[[640, 470], [640, 200]]} color={C.green} w={10 + 4 * fcFocus} />
        <Txt x={660} y={370} size={24} color={C.green} w={180} o={ramp(f, k(3), k(3) + 16)}>{'PPUの配線が\nカートリッジへ'}</Txt>
        {f >= k(3) && Array.from({length: 5}, (_, i) => {
          const t = ((f * 3 + i * 20) % 100) / 100, up = Math.floor((f * 3 + i * 20) / 100) % 2 === 0;
          const [x, y] = along(up ? [...fcPath].reverse() : fcPath, t);
          return <Dot key={i} x={x} y={y} color={up ? C.green : C.amber} s={14} />;
        })}
        <Box x={120} y={470} w={560} h={130} color={C.cyan} title="カートリッジ" sub="パターンを、読みに来た瞬間に返す" />
        <div style={{position: 'absolute', left: 60, top: 615, opacity: ramp(f, k(4), k(4) + 16)}}>
          <div style={{fontSize: 30, fontWeight: 900, color: C.green, fontFamily: FONT}}>VRAMへの転送そのものがない</div>
        </div>
      </div>
      {/* 締め：実際の映像を並べる */}
      <div style={{opacity: end}}>
        <Sequence from={k(5)} layout="none">
          <div style={{position: 'absolute', left: 120, top: 170, width: 760, height: 534, borderRadius: 8, overflow: 'hidden', boxShadow: '0 12px 44px rgba(0,0,0,.6)'}}>
            <OffthreadVideo src={staticFile('video/sfc.mp4')} muted style={{width: 760, height: 534, imageRendering: 'pixelated'}} />
          </div>
          <Nes src="main" from={1500} x={1040} y={170} w={712} crop={[0, 0, 256, 192]} />
        </Sequence>
        <Txt x={120} y={720} size={30} color={C.red} w={760} align="center">{'16bit機：VRAMへの転送が壁\n（前回のスーパーファミコン版）'}</Txt>
        <Txt x={1040} y={720} size={30} color={C.green} w={712} align="center">{'ファミコン：カートリッジで拡張\n（今回）'}</Txt>
      </div>
    </Bg>
  );
};
