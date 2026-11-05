// 手書き判定の評価：合成筆跡で「正しい字の受理率」と「別の字・落書きの誤受理率」を測る。
// 使い方: node eval_handwriting.mjs
import fs from 'node:fs';
import {samplePath, compareInk} from './web/handwriting.mjs';
import {judge, distance} from './web/recognize.js';

import {synth, rng} from './tools_synth.mjs';
// 学年データ（web/grades/g4.json・g6.json）の全字・全部品を候補にして測る。
const sets = [];
for (const g of [4, 6]) {
  const D = JSON.parse(fs.readFileSync(new URL(`./web/grades/g${g}.json`, import.meta.url), 'utf8'));
  const K = Object.fromEntries(D.kanji.map(k => [k.c, k.p]));
  const P = Object.fromEntries(Object.entries(D.parts).filter(([, v]) => !v.k).map(([id, v]) => [id, v.d]));
  sets.push([`${g}年の漢字${D.kanji.length}字`, K], [`${g}年の部品${Object.keys(P).length}個`, P]);
}
const R = rng(11), N = 2;
const pct = (a, b) => `${(a / b * 100).toFixed(0)}%`;
for (const [label, C] of sets) {
  console.log(`--- ${label}`);
  for (const level of [1, 1.5, 2]) {
    let okNew = 0, okOld = 0, n = 0, fa = 0, fn = 0;
    for (const id of Object.keys(C).filter((_, i) => i % Math.ceil(Object.keys(C).length / 40) === 0)) for (let k = 0; k < N; k++) {
      const ink = synth(C[id], R, level); n++;
      if (judge(ink, id, C).ok) okNew++;
      if (compareInk(ink, C[id].map(samplePath)).ok) okOld++;
      for (const other of Object.keys(C).filter(o => o !== id).filter((_, i) => i % 37 === 0)) { fn++; if (judge(ink, other, C).ok) fa++; }
    }
    console.log(`揺らぎ${level}: 受理 新${pct(okNew, n)} 旧${pct(okOld, n)} ／ 別の字を誤受理 新${pct(fa, fn)}`);
  }
  // 落書き：ランダムな線
  let sc = 0, sn = 0;
  for (const id of Object.keys(C).slice(0, 20)) for (let k = 0; k < 2; k++) {
    const m = 2 + (R() * 8 | 0), ink = Array.from({length: m}, () => { const a = [R() * 109, R() * 109], b = [R() * 109, R() * 109]; return Array.from({length: 20}, (_, i) => [a[0] + (b[0] - a[0]) * i / 19, a[1] + (b[1] - a[1]) * i / 19]); });
    sn++; if (judge(ink, id, C).ok) sc++;
  }
  console.log(`落書きの誤受理 ${pct(sc, sn)}`);
}
