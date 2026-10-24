import React from 'react';
import {Img, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT} from './common';
import drift from './data/drift.json';
import grip from './data/grip.json';

export const D = drift as {angle: number[]; cost: number[]; scene: number[]; tick: number[]};
export const G = grip as {cap: number[][]; lon: number[][]; lat: number[][]; over: number[][]; angle: number[]};
export const MONO = '"Consolas","Courier New",monospace';
export const pad3 = (n: number) => String(n).padStart(3, '0');
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
export const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ramp = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], cl);
export const at = <T,>(arr: T[], i: number) => arr[Math.max(0, Math.min(arr.length - 1, i))];

/** リプレイ録画（256x240を3倍=768x720、60fps）。crop は NES ピクセル座標 [x,y,w,h]。 */
/** loop を指定すると from から loop コマ分を繰り返す（ゴール後のリザルト画面に入らないように）。データ側は idx() で同じ位置を引く */
export const idx = (from: number, f: number, loop?: number) => from + (loop ? f % loop : f);
export const Nes: React.FC<{src: 'drift1' | 'grip1'; from: number; x: number; y: number; w: number; crop?: [number, number, number, number];
  volume?: number; loop?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({src, from, x, y, w, crop = [0, 0, 256, 240], volume = 0, loop, style, children}) => {
  const s = w / crop[2];
  const video = <OffthreadVideo src={staticFile(`video/${src}.mp4`)} startFrom={from} muted={volume === 0} volume={volume}
        style={{position: 'absolute', left: -crop[0] * s, top: -crop[1] * s, width: 256 * s, height: 240 * s, imageRendering: 'pixelated'}} />;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: crop[3] * s, overflow: 'hidden', background: '#000', borderRadius: 8,
      boxShadow: '0 12px 44px rgba(0,0,0,.6)', ...style}}>
      {loop ? <Loop durationInFrames={loop}>{video}</Loop> : video}
      {children}
    </div>
  );
};

/** 最新ROMの実画面から組み立てた、向き a のコース全体の絵（920x920）の一部 */
export const Pic: React.FC<{a: number; x: number; y: number; scale: number; sx?: number; sy?: number; sw?: number; sh?: number;
  style?: React.CSSProperties; children?: React.ReactNode}> = ({a, x, y, scale, sx = 0, sy = 0, sw = 920, sh = 920, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: sw * scale, height: sh * scale, overflow: 'hidden', ...style}}>
    <Img src={staticFile(`pictures/angle_${pad3(((a % 128) + 128) % 128)}.png`)}
      style={{position: 'absolute', left: -sx * scale, top: -sy * scale, width: 920 * scale, height: 920 * scale, imageRendering: 'pixelated'}} />
    {children}
  </div>
);

export const Grid: React.FC<{cell: number; ox?: number; oy?: number; color?: string; o?: number}> = ({cell, ox = 0, oy = 0, color = 'rgba(255,255,255,.55)', o = 1}) => (
  <div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none',
    backgroundImage: `linear-gradient(to right, ${color} 1.5px, transparent 1.5px), linear-gradient(to bottom, ${color} 1.5px, transparent 1.5px)`,
    backgroundSize: `${cell}px ${cell}px`, backgroundPosition: `${ox}px ${oy}px`}} />
);

export const Txt: React.FC<{x: number; y: number; size?: number; color?: string; w?: number; align?: 'left' | 'center' | 'right'; weight?: number; o?: number;
  mono?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, size = 40, color = C.text, w, align = 'left', weight = 800, o = 1, mono, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: align, fontSize: size, color, fontWeight: weight, opacity: o,
    fontFamily: mono ? MONO : FONT, lineHeight: 1.3, whiteSpace: 'pre-wrap', transform: `translateY(${(1 - o) * 18}px)`, ...style}}>{children}</div>
);

export const Card: React.FC<{x: number; y: number; w: number; h?: number; color?: string; o?: number; children: React.ReactNode; style?: React.CSSProperties}> =
  ({x, y, w, h, color = C.line, o = 1, children, style}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 16, background: C.panel, border: `3px solid ${color}`,
      padding: '22px 30px', boxSizing: 'border-box', opacity: o, transform: `translateY(${(1 - o) * 20}px)`, fontFamily: FONT, ...style}}>{children}</div>
  );

/** 横棒（値ラベル付き） */
export const Bar: React.FC<{x: number; y: number; len: number; h?: number; color: string; label: string; value: string; o?: number; p?: number}> =
  ({x, y, len, h = 54, color, label, value, o = 1, p = 1}) => (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, fontFamily: FONT}}>
      <div style={{fontSize: 30, fontWeight: 700, color: C.sub, marginBottom: 8}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: Math.max(4, len * p), height: h, background: color, borderRadius: 8, boxShadow: `0 0 24px ${color}66`}} />
        <div style={{fontSize: 44, fontWeight: 800, color, whiteSpace: 'nowrap'}}>{value}</div>
      </div>
    </div>
  );

export const Big: React.FC<{children: React.ReactNode; o?: number; color?: string; size?: number; y?: number}> = ({children, o = 1, color = C.text, size = 110, y = 380}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, color, opacity: o,
    transform: `scale(${0.92 + 0.08 * o})`, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>{children}</div>
);

export const useF = () => useCurrentFrame();
