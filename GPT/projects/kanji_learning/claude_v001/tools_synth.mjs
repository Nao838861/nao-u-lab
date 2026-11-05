// 手書きらしい揺らぎを付けた合成筆跡。判定の受理率・誤受理率を比べるための開発用。
import {samplePath} from './web/handwriting.mjs';
export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function synth(paths, R, level = 1) {
  const u = (a) => (R() * 2 - 1) * a * level;
  const sx = 1 + u(.18), sy = 1 + u(.18), rot = u(.09), sh = u(.12), tx = u(10), ty = u(10);
  const glob = ([x, y]) => { x -= 54.5; y -= 54.5; const X = x * sx + y * sh, Y = y * sy; return [X * Math.cos(rot) - Y * Math.sin(rot) + 54.5 + tx, X * Math.sin(rot) + Y * Math.cos(rot) + 54.5 + ty]; };
  return paths.map(d => {
    let s = samplePath(d);
    const ox = u(5), oy = u(5), sc = 1 + u(.2), cx = s.reduce((a, p) => a + p[0], 0) / s.length, cy = s.reduce((a, p) => a + p[1], 0) / s.length;
    const t0 = Math.max(0, u(.12)), t1 = Math.max(0, u(.12));
    s = s.slice(Math.floor(s.length * t0), Math.max(2, Math.ceil(s.length * (1 - t1))));
    const ph = R() * 6, amp = 1.6 * level;
    return s.map(([x, y], i) => glob([(x - cx) * sc + cx + ox + Math.sin(i * .25 + ph) * amp, (y - cy) * sc + cy + oy + Math.cos(i * .21 + ph) * amp]))
      .filter((_, i) => i % 2 === 0);
  });
}
