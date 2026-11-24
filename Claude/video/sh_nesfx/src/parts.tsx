import React from 'react';
import {Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT} from './common';
import clips from './clips.json';

/** 録画の切り出し位置（main.mp4 のフレーム番号、60fps）。tools/make_media.py と共有 */
export const CLIP = clips as Record<string, number>;

/** 枠付きの映像。src は public/ 以下。nearest 拡大のため pixelated */
export const Clip: React.FC<{src: string; x: number; y: number; w: number; h: number; from?: number; volume?: number | ((f: number) => number); label?: string; color?: string; fit?: 'fill' | 'cover' | 'contain'; style?: React.CSSProperties; rate?: number}> =
  ({src, x, y, w, h, from = 0, volume = 0, label, color = C.cyan, fit = 'fill', style, rate}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 10, overflow: 'hidden', border: `3px solid ${color}`, background: '#000', boxShadow: `0 0 24px ${color}33`, ...style}}>
      <OffthreadVideo src={staticFile(src)} trimBefore={from} volume={volume} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: fit, imageRendering: 'pixelated'}} />
      {label && <div style={{position: 'absolute', left: 12, top: 10, padding: '4px 14px', borderRadius: 8, background: 'rgba(5,8,18,.82)', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 26, border: `2px solid ${color}`}}>{label}</div>}
    </div>
  );

export const Pic: React.FC<{src: string; x: number; y: number; w: number; h: number; color?: string; label?: string; fit?: 'contain' | 'cover' | 'fill'; style?: React.CSSProperties}> = ({src, x, y, w, h, color = C.line, label, fit = 'contain', style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 10, overflow: 'hidden', border: `3px solid ${color}`, background: '#05070d', ...style}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: fit, imageRendering: 'pixelated'}} />
    {label && <div style={{position: 'absolute', left: 10, bottom: 10, padding: '3px 12px', borderRadius: 8, background: 'rgba(5,8,18,.85)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 22}}>{label}</div>}
  </div>
);

/** at から dur で 0→1、out から 0 へ */
export const win = (f: number, at: number, out?: number, dur = 14) => {
  const a = interpolate(f, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const b = out === undefined ? 1 : interpolate(f, [out, out + dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return a * b;
};

export const Card: React.FC<{x: number; y: number; w: number; h?: number; color?: string; title: string; sub?: string; on?: number; fs?: number; children?: React.ReactNode}> = ({x, y, w, h, color = C.cyan, title, sub, on = 1, fs = 34, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', padding: '16px 22px', borderRadius: 14, background: C.panel, borderLeft: `10px solid ${color}`, border: `2px solid ${color}${on > 0.5 ? 'ff' : '55'}`, boxShadow: on > 0.5 ? `0 0 26px ${color}55` : 'none', opacity: 0.35 + 0.65 * on, fontFamily: FONT}}>
    <div style={{fontWeight: 800, fontSize: fs, color: C.text, lineHeight: 1.25}}>{title}</div>
    {sub && <div style={{fontWeight: 600, fontSize: fs * 0.66, color: color, marginTop: 6, lineHeight: 1.35}}>{sub}</div>}
    {children}
  </div>
);

/** 横向きの時間の帯。ms を幅に換算 */
export const Bar: React.FC<{x: number; y: number; scale: number; h?: number; segs: {ms: number; color: string; label: string; dashed?: boolean}[]; p?: number}> = ({x, y, scale, h = 84, segs, p = 1}) => {
  let at = 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, height: h}}>
      {segs.map((s, i) => {
        const left = at * scale; at += s.ms;
        const vis = interpolate(p * segs.length, [i, i + 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', left, top: 0, width: s.ms * scale * vis, height: h, boxSizing: 'border-box', background: s.dashed ? `repeating-linear-gradient(45deg, ${s.color}33 0 12px, ${s.color}11 12px 24px)` : `${s.color}cc`, border: `2px ${s.dashed ? 'dashed' : 'solid'} ${s.color}`, borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: '#fff', whiteSpace: 'nowrap', opacity: vis > 0.9 ? 1 : 0, textShadow: '0 2px 4px #000'}}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Label: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; color?: string; o?: number; w?: number; align?: 'left' | 'center' | 'right'}> = ({x, y, children, size = 30, color = C.text, o = 1, w, align = 'left'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: align, fontFamily: FONT, fontWeight: 800, fontSize: size, color, opacity: o, lineHeight: 1.3}}>{children}</div>
);
