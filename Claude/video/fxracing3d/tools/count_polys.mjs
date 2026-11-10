// 撮影用ROM（GRIP 8位のリプレイ）を解説用コアで走らせ、描画1回ごとに塗ったポリゴン数（GSU RAM $8024）と
// 描画の回数（＝実際のフレームレート）を数える。faces は処理したポリゴン数（裏面カリングで捨てた面も含む。GSUの面ループ入口 $9279 を通った回数）。視点は --select で切り替える。
// 使い方: node tools/count_polys.mjs [--select=コマ,...] [--out=src/data/polys.json]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root = path.resolve('.');
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const selects = (arg('select', '') || '').split(',').filter(Boolean).map(Number);
const {loadCore} = await import(pathToFileURL(path.join(root, 'webcore/core-loader.js')).href);
const createCore = (await import(pathToFileURL(path.join(root, 'webcore/explainer/core.js')).href)).default;
const core = await loadCore(createCore, fs.readFileSync(path.join(root, 'webcore/explainer/core.wasm')));
const rom = fs.readFileSync(path.join(root, 'webcore/rank8.nes'));
const p = core._malloc(rom.length); core.HEAPU8.set(rom, p); core._web_load_rom(p, rom.length); core._free(p);
const rd = (a, n = 1) => { let v = 0; for (let i = 0; i < n; i++) v += core._web_peek(a + i) * 2 ** (8 * i); return v; };
const samples = []; let last = core._web_explainer_draws(), racing = 0, view = 0;
const segs = [541, ...selects, 4222];
for (let i = 0; i < 4300; i++) {
  let m = (i >= 300 && i < 306 ? 32 : 0) | (i >= 360 && i < 366 ? 8 : 0);
  for (const s of selects) if (i >= s && i < s + 6) m |= 4;
  core._web_run(m);
  const d = core._web_explainer_draws();
  const inRace = rd(0x6720) === 1 && rd(0x6726, 3) > 0;
  if (inRace) racing++;
  view = segs.filter((s) => i >= s).length - 1;
  if (d !== last && inRace) samples.push({f: i, view, polys: core._web_explainer_polys(), faces: core._web_explainer_faces()});
  last = d;
}
const stat = (xs) => { const s = [...xs].sort((a, b) => a - b); return {n: s.length, min: s[0], median: s[s.length >> 1], mean: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(1), p95: s[Math.floor(s.length * 0.95)], max: s[s.length - 1]}; };
const byView = {};
for (const v of new Set(samples.map((s) => s.view))) {
  const xs = samples.filter((s) => s.view === v);
  const span = (segs[v + 1] ?? 4222) - segs[v];
  byView[v] = {...stat(xs.map((s) => s.polys)), drawsPerSecond: +(xs.length / (span / 60)).toFixed(1)};
}
const out = {rom: 'rank8.nes', series: samples.map((x) => [x.f, x.polys, x.faces]), faces: stat(samples.map((s) => s.faces)), racingFrames: racing, all: {...stat(samples.map((s) => s.polys)), drawsPerSecond: +(samples.length / (racing / 60)).toFixed(1)}, byView, segments: segs};
fs.writeFileSync(arg('out', 'rec/polys.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
