// 手書き判定の評価：合成筆跡で「正しい字の受理率」と「別の字・落書きの誤受理率」を測る。
// 使い方: node eval_handwriting.mjs
import fs from 'node:fs';
import {samplePath, compareInk} from './web/handwriting.mjs';
import {judge, distance} from './web/recognize.js';
import {LESSONS} from './web/data.mjs';
import {synth, rng} from './tools_synth.mjs';
const G = JSON.parse(fs.readFileSync(new URL('./web/glyphs.json', import.meta.url), 'utf8'));
const K = Object.fromEntries(Object.keys(G).map(ch => [ch, [...G[ch][0], ...G[ch][1]]]));
const P = {};
for (const l of LESSONS) {
  const all = K[l.char], split = l.split || G[l.char].map(h => h.length); let at = 0;
  split.map(n => all.slice(at, at += n)).forEach((st, k) => { P[l.parts[k]] ||= st; });
}
const R = rng(11), N = 8;
const pct = (a, b) => `${(a / b * 100).toFixed(0)}%`;
for (const [label, C] of [['漢字12字', K], ['部品19個', P]]) {
  console.log(`--- ${label}`);
  for (const level of [.5, 1, 1.5, 2, 2.5]) {
    let okNew = 0, okOld = 0, n = 0, fa = 0, fn = 0;
    for (const id in C) for (let k = 0; k < N; k++) {
      const ink = synth(C[id], R, level); n++;
      if (judge(ink, id, C).ok) okNew++;
      if (compareInk(ink, C[id].map(samplePath)).ok) okOld++;
      for (const other in C) if (other !== id) { fn++; if (judge(ink, other, C).ok) fa++; }
    }
    console.log(`揺らぎ${level}: 受理 新${pct(okNew, n)} 旧${pct(okOld, n)} ／ 別の字を誤受理 新${pct(fa, fn)}`);
  }
  // 落書き：ランダムな線
  let sc = 0, sn = 0;
  for (const id in C) for (let k = 0; k < 20; k++) {
    const m = 2 + (R() * 8 | 0), ink = Array.from({length: m}, () => { const a = [R() * 109, R() * 109], b = [R() * 109, R() * 109]; return Array.from({length: 20}, (_, i) => [a[0] + (b[0] - a[0]) * i / 19, a[1] + (b[1] - a[1]) * i / 19]); });
    sn++; if (judge(ink, id, C).ok) sc++;
  }
  console.log(`落書きの誤受理 ${pct(sc, sn)}`);
}
