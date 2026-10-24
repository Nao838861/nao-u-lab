import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const C = {
  bg: '#07090d', panel: '#10151d', line: '#2a3340', white: '#f2f4f7', dim: '#8a95a5',
  cyan: '#5ad1ff', mag: '#f552d2', yellow: '#ffc94a', red: '#ff5a5a', green: '#7ee08a', grass: 'rgb(56,135,0)',
};
export const font = '"Yu Gothic UI", "Hiragino Sans", system-ui, sans-serif';
export const mono = '"Consolas", "Courier New", monospace';
export const FPS = 30;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const fade = (f: number, start: number, dur = 12) => interpolate(f, [start, start + dur], [0, 1], clamp);
export const lerp = (f: number, a: number, b: number, from: number, to: number) => interpolate(f, [a, b], [from, to], clamp);
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export type SceneProps = {lead: number; dur: number; beats: number[]};

/** 章ラベルと見出し */
export const Heading: React.FC<{chapter: string; title: string}> = ({chapter, title}) => {
  const f = useCurrentFrame();
  const e = fade(f, 0, 14);
  return (
    <div style={{position: 'absolute', left: 64, top: 34, right: 64, fontFamily: font, opacity: e, transform: `translateY(${(1 - e) * 10}px)`}}>
      <div style={{color: C.cyan, fontSize: 17, fontWeight: 700, letterSpacing: 1}}>{chapter}</div>
      <div style={{color: C.white, fontSize: 36, fontWeight: 800, marginTop: 6}}>{title}</div>
    </div>
  );
};

export const Panel: React.FC<{x: number; y: number; w: number; h?: number; border?: string; children?: React.ReactNode; style?: React.CSSProperties; o?: number}> =
  ({x, y, w, h, border = C.line, children, style, o = 1}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: C.panel, border: `1.5px solid ${border}`, borderRadius: 10,
      padding: '14px 18px', boxSizing: 'border-box', fontFamily: font, color: C.white, opacity: o, whiteSpace: 'pre-wrap', ...style}}>{children}</div>
  );

export const Label: React.FC<{x: number; y: number; color?: string; size?: number; children: React.ReactNode; o?: number; w?: number; align?: 'left' | 'center' | 'right'; weight?: number; m?: boolean}> =
  ({x, y, color = C.white, size = 22, children, o = 1, w, align = 'left', weight = 700, m}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: align, color, fontSize: size, fontWeight: weight,
      fontFamily: m ? mono : font, opacity: o, whiteSpace: 'pre-wrap', lineHeight: 1.35}}>{children}</div>
  );

/** 復号したコース画像（928x928）の一部を拡大表示する */
export const Course: React.FC<{src?: string; angle?: number; sx: number; sy: number; sw: number; sh: number; scale: number; x: number; y: number;
  grid?: number; gridO?: number; gridColor?: string; children?: React.ReactNode; border?: string}> =
  ({src, angle = 0, sx, sy, sw, sh, scale, x, y, grid, gridO = 1, gridColor = 'rgba(255,255,255,0.35)', children, border}) => {
    const file = src ?? `gen/course/angle_${String(angle).padStart(3, '0')}.png`;
    const cell = grid ? grid * scale : 0;
    return (
      <div style={{position: 'absolute', left: x, top: y, width: sw * scale, height: sh * scale, overflow: 'hidden', border: border ? `2px solid ${border}` : undefined}}>
        <Img src={staticFile(file)} style={{position: 'absolute', left: -sx * scale, top: -sy * scale, width: 928 * scale, height: 928 * scale, imageRendering: 'pixelated'}} />
        {grid ? <div style={{position: 'absolute', inset: 0, opacity: gridO,
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: `${cell}px ${cell}px`, backgroundPosition: `${-((sx * scale) % cell)}px ${-((sy * scale) % cell)}px`}} /> : null}
        {children}
      </div>
    );
  };

/** 角括弧付きの小さな数値カード */
export const Stat: React.FC<{x: number; y: number; w: number; label: string; value: string; unit?: string; color?: string; o?: number}> =
  ({x, y, w, label, value, unit, color = C.cyan, o = 1}) => (
    <Panel x={x} y={y} w={w} o={o}>
      <div style={{fontSize: 17, color: C.dim, fontWeight: 700}}>{label}</div>
      <div style={{fontSize: 40, fontWeight: 800, color, marginTop: 2}}>{value}<span style={{fontSize: 20, color: C.white, marginLeft: 6}}>{unit}</span></div>
    </Panel>
  );

export const Arrow: React.FC<{x: number; y: number; w: number; color?: string; o?: number}> = ({x, y, w, color = C.dim, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: 0, borderTop: `3px solid ${color}`, opacity: o}}>
    <div style={{position: 'absolute', right: -2, top: -9, width: 0, height: 0, borderTop: '7.5px solid transparent', borderBottom: '7.5px solid transparent', borderLeft: `14px solid ${color}`}} />
  </div>
);
