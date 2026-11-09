import React from 'react';
import {Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT} from './common';

export const MONO = '"Consolas","Courier New",monospace';
export const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ramp = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], cl);
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Web版と同じコアの録画（256×240を3倍、60fps。コマ番号＝コアのコマ番号）。crop は実画素 [x,y,w,h] */
export type NesSrc = 'main' | 'ground' | 'views' | 'prev2d';
export const Nes: React.FC<{src: NesSrc; from: number; x: number; y: number; w: number; crop?: [number, number, number, number];
  volume?: number; style?: React.CSSProperties; children?: React.ReactNode; native?: [number, number]}> =
  ({src, from, x, y, w, crop = [0, 0, 256, 240], volume = 0, style, children, native = [256, 240]}) => {
    const s = w / crop[2];
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, height: crop[3] * s, overflow: 'hidden', background: '#000', borderRadius: 8,
        boxShadow: '0 12px 44px rgba(0,0,0,.6)', ...style}}>
        <OffthreadVideo src={staticFile(`video/${src}.mp4`)} startFrom={from} muted={volume === 0} volume={volume}
          style={{position: 'absolute', left: -crop[0] * s, top: -crop[1] * s, width: native[0] * s, height: native[1] * s, imageRendering: 'pixelated'}} />
        {children}
      </div>
    );
  };

/** 実機をカメラで撮った映像（1920×1080・30fps）。sec は映像内の秒。crop は映像の画素 [x,y,w,h] */
export const Hw: React.FC<{sec: number; x: number; y: number; w: number; crop?: [number, number, number, number]; volume?: number;
  style?: React.CSSProperties; children?: React.ReactNode}> = ({sec, x, y, w, crop = [0, 0, 1920, 1080], volume = 0, style, children}) => {
  const s = w / crop[2];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: crop[3] * s, overflow: 'hidden', background: '#000', borderRadius: 8,
      boxShadow: '0 12px 44px rgba(0,0,0,.6)', ...style}}>
      <OffthreadVideo src={staticFile('video/hw.mp4')} startFrom={Math.round(sec * 60)} muted={volume === 0} volume={volume}
        style={{position: 'absolute', left: -crop[0] * s, top: -crop[1] * s, width: 1920 * s, height: 1080 * s}} />
      {children}
    </div>
  );
};

/** 画素のままの画像。src は public/ からの相対パス */
export const Px: React.FC<{src: string; x: number; y: number; w: number; h?: number; o?: number; style?: React.CSSProperties}> =
  ({src, x, y, w, h, o = 1, style}) => (
    <Img src={staticFile(src)} style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, imageRendering: 'pixelated', ...style}} />
  );

/** 画素の一部を切り抜いて拡大する（画像の実寸 iw×ih、切り抜き [x,y,w,h]） */
export const PxCrop: React.FC<{src: string; iw: number; ih: number; crop: [number, number, number, number]; x: number; y: number; w: number;
  o?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({src, iw, ih, crop, x, y, w, o = 1, style, children}) => {
  const s = w / crop[2];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: crop[3] * s, overflow: 'hidden', opacity: o, borderRadius: 8, ...style}}>
      <Img src={staticFile(src)} style={{position: 'absolute', left: -crop[0] * s, top: -crop[1] * s, width: iw * s, height: ih * s, imageRendering: 'pixelated'}} />
      {children}
    </div>
  );
};

export const Grid: React.FC<{cw: number; ch?: number; ox?: number; oy?: number; color?: string; o?: number; lw?: number}> =
  ({cw, ch, ox = 0, oy = 0, color = 'rgba(255,255,255,.55)', o = 1, lw = 1.5}) => (
    <div style={{position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none',
      backgroundImage: `linear-gradient(to right, ${color} ${lw}px, transparent ${lw}px), linear-gradient(to bottom, ${color} ${lw}px, transparent ${lw}px)`,
      backgroundSize: `${cw}px ${ch ?? cw}px`, backgroundPosition: `${ox}px ${oy}px`}} />
  );

export const Txt: React.FC<{x: number; y: number; size?: number; color?: string; w?: number; align?: 'left' | 'center' | 'right'; weight?: number; o?: number;
  mono?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, size = 40, color = C.text, w, align = 'left', weight = 800, o = 1, mono, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: align, fontSize: size, color, fontWeight: weight, opacity: o,
    fontFamily: mono ? MONO : FONT, lineHeight: 1.3, whiteSpace: 'pre-wrap', transform: `translateY(${(1 - o) * 18}px)`, textShadow: '0 3px 14px rgba(0,0,0,.7)', ...style}}>{children}</div>
);

export const Card: React.FC<{x: number; y: number; w: number; h?: number; color?: string; o?: number; children: React.ReactNode; style?: React.CSSProperties}> =
  ({x, y, w, h, color = C.line, o = 1, children, style}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 16, background: 'rgba(19,27,49,.94)', border: `3px solid ${color}`,
      padding: '22px 30px', boxSizing: 'border-box', opacity: o, transform: `translateY(${(1 - o) * 20}px)`, fontFamily: FONT, ...style}}>{children}</div>
  );

export const Label: React.FC<{x: number; y: number; color?: string; o?: number; children: React.ReactNode; size?: number}> = ({x, y, color = C.cyan, o = 1, children, size = 28}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, padding: '6px 16px', borderRadius: 10, background: 'rgba(5,8,18,.85)', border: `2px solid ${color}`,
    color, fontWeight: 800, fontSize: size, fontFamily: FONT, whiteSpace: 'nowrap'}}>{children}</div>
);

/** NESの色（録画から読んだ実際のRGB） */
export const NES = {gray: 'rgb(102,102,102)', green: 'rgb(12,147,0)', red: 'rgb(181,49,32)', white: 'rgb(255,254,255)', sky: 'rgb(100,176,255)'};

/** 色見本（2色なら1ドットごとの市松模様） */
export const Swatch: React.FC<{a: string; b?: string; size?: number; dot?: number; x?: number; y?: number; blur?: number; style?: React.CSSProperties}> =
  ({a, b, size = 120, dot = 10, x, y, blur = 0, style}) => (
    <div style={{position: x === undefined ? 'relative' : 'absolute', left: x, top: y, width: size, height: size, borderRadius: 10, overflow: 'hidden',
      border: '2px solid rgba(255,255,255,.25)', ...style}}>
      <div style={{position: 'absolute', inset: -blur * 3, filter: blur ? `blur(${blur}px)` : undefined,
        background: b ? `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / ${dot * 2}px ${dot * 2}px` : a}} />
    </div>
  );

export const Big: React.FC<{children: React.ReactNode; o?: number; color?: string; size?: number; y?: number}> = ({children, o = 1, color = C.text, size = 110, y = 380}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, color, opacity: o,
    transform: `scale(${0.92 + 0.08 * o})`, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>{children}</div>
);

export const useF = () => useCurrentFrame();
