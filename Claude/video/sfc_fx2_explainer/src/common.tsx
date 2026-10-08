import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import timing from './timing.json';

export const FPS = 60;
export const W = 1920;
export const H = 1080;

export const C = {
  bg: '#0a0f1e',
  panel: '#131b31',
  panel2: '#1b2643',
  line: '#2c3b63',
  text: '#eef3ff',
  sub: '#9fb0d6',
  cyan: '#3fe0ff',
  amber: '#ffb547',
  red: '#ff5b6e',
  green: '#5fe38d',
  violet: '#b98cff',
};
export const FONT = '"Noto Sans JP","BIZ UDPGothic","Yu Gothic UI",sans-serif';

type Line = {text: string; start: number; end: number};
type SceneTiming = {title: string; audioSeconds: number; lines: Line[]};
const T = timing as unknown as {order: string[]; leadSeconds: number; tailSeconds: number; scenes: Record<string, SceneTiming>};

export const sceneFrames = (id: string) => Math.ceil((T.leadSeconds + T.scenes[id].audioSeconds + T.tailSeconds) * FPS);
export const sceneOrder = T.order;
export const sceneInfo = (id: string) => T.scenes[id];
/** frame (within scene) where line i starts / ends */
export const cueOf = (id: string, i: number) => Math.round((T.leadSeconds + T.scenes[id].lines[i].start) * FPS);
export const cueEnd = (id: string, i: number) => Math.round((T.leadSeconds + T.scenes[id].lines[i].end) * FPS);

/** 0→1 ease-in starting at frame `at` over `dur` frames */
export const useIn = (at: number, dur = 18) => {
  const f = useCurrentFrame();
  return interpolate(f, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
};
export const usePop = (at: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config: {damping: 14, stiffness: 140}});
};

export const Fade: React.FC<{at: number; out?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({at, out, dy = 24, style, children}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [at, at + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const b = out === undefined ? 1 : interpolate(f, [out, out + 14], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(a, [0, 1], [dy, 0]);
  return <div style={{opacity: a * b, transform: `translateY(${y}px)`, ...style}}>{children}</div>;
};

/** Game footage (main.mp4 = 512x360, 60fps, field n = frame n-1). */
export const Game: React.FC<{src?: string; field: number; w: number; style?: React.CSSProperties}> = ({src = 'video/main.mp4', field, w, style}) => (
  <div style={{width: w, height: (w * 180) / 256, overflow: 'hidden', position: 'relative', borderRadius: 6, boxShadow: '0 10px 40px rgba(0,0,0,.55)', ...style}}>
    <OffthreadVideo src={staticFile(src)} startFrom={field} muted style={{width: '100%', height: '100%', imageRendering: 'pixelated'}} />
  </div>
);

/** PNG sequence frame from public/seq/<layer>/ (1500 frames, loops). */
export const SeqImg: React.FC<{layer: string; offset?: number; style?: React.CSSProperties}> = ({layer, offset = 0, style}) => {
  const f = useCurrentFrame();
  const i = (((f + offset) % 1500) + 1500) % 1500;
  return <Img src={staticFile(`seq/${layer}/${String(i).padStart(5, '0')}.png`)} style={{imageRendering: 'pixelated', ...style}} />;
};

export const Subtitle: React.FC<{id: string}> = ({id}) => {
  const f = useCurrentFrame();
  const lines = T.scenes[id].lines;
  let idx = -1;
  for (let i = 0; i < lines.length; i++) if (f >= cueOf(id, i) - 3) idx = i;
  if (idx < 0) return null;
  const endF = cueEnd(id, idx) + 14;
  const o = interpolate(f, [cueOf(id, idx) - 3, cueOf(id, idx) + 5, endF, endF + 8], [0, 1, 1, idx === lines.length - 1 ? 0 : 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', opacity: o, pointerEvents: 'none'}}>
      <div style={{maxWidth: 1640, background: 'rgba(5,8,18,.82)', borderRadius: 14, padding: '14px 34px', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 40, lineHeight: 1.45, textAlign: 'center', letterSpacing: 0.5, border: '1px solid rgba(255,255,255,.08)'}}>
        {lines[idx].text}
      </div>
    </div>
  );
};

export const SceneTitle: React.FC<{label: string; color?: string}> = ({label, color = C.cyan}) => {
  const p = useIn(4, 20);
  return (
    <div style={{position: 'absolute', top: 40, left: 56, display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}>
      <div style={{width: 10, height: 46, background: color, borderRadius: 4}} />
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.text, letterSpacing: 1}}>{label}</div>
    </div>
  );
};

export const Bg: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, #16203d 0%, ${C.bg} 70%)`, fontFamily: FONT, color: C.text}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)', backgroundSize: '48px 48px'}} />
    {children}
  </AbsoluteFill>
);

export const Box: React.FC<{x: number; y: number; w: number; h: number; color?: string; title: string; sub?: string; glow?: number; dim?: number; children?: React.ReactNode; fs?: number}> = ({x, y, w, h, color = C.cyan, title, sub, glow = 0, dim = 0, children, fs = 34}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 16, background: C.panel, border: `3px solid ${color}`, boxShadow: `0 0 ${10 + glow * 40}px ${color}${glow > 0 ? '99' : '33'}`, opacity: 1 - dim * 0.65, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
    <div style={{fontWeight: 800, fontSize: fs, color: C.text, lineHeight: 1.2}}>{title}</div>
    {sub && <div style={{fontWeight: 500, fontSize: fs * 0.62, color: C.sub, marginTop: 6, lineHeight: 1.3}}>{sub}</div>}
    {children}
  </div>
);

export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; color?: string; p?: number; width?: number; dashed?: boolean; label?: string}> = ({x1, y1, x2, y2, color = C.cyan, p = 1, width = 6, dashed, label}) => {
  const x = x1 + (x2 - x1) * p, y = y1 + (y2 - y1) * p;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hs = 22;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={W} height={H}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '14 10' : undefined} strokeLinecap="round" opacity={p > 0 ? 1 : 0} />
      {p > 0.98 && <polygon points={`${x2},${y2} ${x2 - hs * Math.cos(ang - 0.45)},${y2 - hs * Math.sin(ang - 0.45)} ${x2 - hs * Math.cos(ang + 0.45)},${y2 - hs * Math.sin(ang + 0.45)}`} fill={color} />}
      {label && p > 0.5 && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 16} fill={color} fontSize={28} fontWeight={700} textAnchor="middle" fontFamily={FONT}>{label}</text>}
    </svg>
  );
};

export const Tag: React.FC<{color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({color = C.cyan, children, style}) => (
  <span style={{display: 'inline-block', padding: '6px 18px', borderRadius: 999, border: `2px solid ${color}`, color, fontWeight: 700, fontSize: 28, background: `${color}18`, ...style}}>{children}</span>
);
