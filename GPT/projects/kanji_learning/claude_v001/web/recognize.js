// 手書きの形チェック（候補の中で一番近いかで判定する）。
// 見本の線に何ユニット以内か、という絶対基準だけで判定すると、実際の手書きの歪み（全体の傾き・
// 部品の大きさのずれ・線の長さ）でほとんど落ちる。そこで「同じ問題で出し得る候補（12字・18部品）の
// 中で、答えの字が一番近いか」と、ゆるい絶対上限の二つで判定する。筆順・線の向きは問わない。
import {samplePath, resample, fitStrokes, bounds} from './handwriting.mjs';

const cache = new Map();
function prep(strokes) {
  const b = bounds(strokes);
  const fitted = fitStrokes(strokes).map(s => resample(s, 2.5)).filter(s => s.length);
  return {strokes: fitted, pts: fitted.flat(), n: strokes.length, aspect: (b.width + 6) / (b.height + 6)};
}
function prepTemplate(key, paths) {
  if (!cache.has(key)) cache.set(key, prep(paths.map(samplePath)));
  return cache.get(key);
}
const d2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
function meanNearest(A, B) {
  let sum = 0;
  for (const p of A) { let m = Infinity; for (const q of B) { const v = d2(p, q); if (v < m) m = v; } sum += Math.sqrt(m); }
  return sum / A.length;
}
// 一画ずつの対応：各見本の画に、いちばん形の近い書いた画を当てる（向きは問わない）。
function strokeCost(a, b) {
  const pairs = [];
  for (let j = 0; j < b.strokes.length; j++) {
    const t = b.strokes[j];
    for (let i = 0; i < a.strokes.length; i++) {
      const s = a.strokes[i];
      const ends = Math.min(Math.sqrt(d2(s[0], t[0])) + Math.sqrt(d2(s.at(-1), t.at(-1))), Math.sqrt(d2(s[0], t.at(-1))) + Math.sqrt(d2(s.at(-1), t[0]))) / 2;
      pairs.push({i, j, c: ends * .5 + (meanNearest(s, t) + meanNearest(t, s)) * .25});
    }
  }
  pairs.sort((x, y) => x.c - y.c);
  const ua = new Set(), ub = new Set(); let sum = 0, k = 0;
  for (const p of pairs) if (!ua.has(p.i) && !ub.has(p.j)) { ua.add(p.i); ub.add(p.j); sum += p.c; k++; }
  // 対応の付かなかった見本の画は罰点
  return (sum + (b.strokes.length - k) * 18) / b.strokes.length;
}
export function distance(ink, tpl) {
  const shape = (meanNearest(ink.pts, tpl.pts) + meanNearest(tpl.pts, ink.pts)) / 2;
  const count = Math.abs(ink.n - tpl.n) / tpl.n * 6;
  const aspect = Math.abs(Math.log(ink.aspect / tpl.aspect)) * 8;
  return shape + strokeCost(ink, tpl) * .5 + count + aspect;
}

// ink: [[x,y]...] の配列（0〜109の座標）。target: 答えの id。candidates: {id: 筆画d[]}。
export function judge(ink, target, candidates) {
  const fail = reason => ({ok: false, reason});
  if (!Array.isArray(ink) || !ink.length) return fail('empty');
  if (ink.length > 60 || ink.reduce((n, s) => n + s.length, 0) > 8000) return fail('too-much');
  const b = bounds(ink);
  if (!b || Math.max(b.width, b.height) < 15) return fail('too-small');
  const tpl = prepTemplate(target, candidates[target]);
  if (ink.length < Math.max(1, Math.ceil(tpl.n * .4)) || ink.length > tpl.n * 2 + 2) return fail('stroke-count');
  const me = prep(ink);
  const ranked = Object.keys(candidates).map(id => ({id, d: distance(me, prepTemplate(id, candidates[id]))})).sort((x, y) => x.d - y.d);
  const mine = ranked.find(r => r.id === target);
  const ok = ranked[0].id === target && mine.d < LIMIT;
  return {ok, reason: ok ? 'ok' : ranked[0].id !== target ? 'closer-other' : 'too-far', d: mine.d, best: ranked[0].id, ranked: ranked.slice(0, 3)};
}
export const LIMIT = 20;
