// 書き出し済みの全編（out/fxracing3d_<overview|deep>.mp4）のうち、指定した場面の映像だけを作り直して差し替える。
// 引数: 場面ID（複数可）と --video=overview|deep。例: node tools/splice.mjs S06 S07 --video=overview
// - 前の書き出しの時刻表（out/fxracing3d_<video>.timing.json。npm run render:<video> のあとに保存される）と今の src/timing.json を比べる。
//   指定した場面は長さが変わってもよい（台本を直したとき）。指定していない場面の長さが変わっていたら止める。
// - 作り直す範囲は、場面の前後のキーフレームまで広げる。それ以外の映像は再圧縮せずにつなぐ。
// - 長さが変わったときは、音（ナレーション・BGM・動画の音）を tools/mix_audio.mjs で合成し直す。変わらないときは前の音をそのまま使う。
import path from 'node:path';
import {readFile, copyFile, rename, rm, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {mixAudio} from './mix_audio.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (f) => path.join(root, 'out', f);
const V = process.argv.find((a) => a.startsWith('--video='))?.slice(8) ?? 'overview';  // overview＝概要編 / deep＝詳細編
const COMP = {overview: 'FxOverview', deep: 'FxDeep'}[V];
const base = out(`fxracing3d_${V}.mp4`);
const json = async (p) => JSON.parse(await readFile(p, 'utf8'));
const T = await json(path.join(root, 'src/timing.json'));
const O = await json(out(`fxracing3d_${V}.timing.json`)).catch(() => {
  throw new Error(`out/fxracing3d_${V}.timing.json がありません。全編を npm run render:${V} で書き出してください`);
});
// src/common.tsx の EXTRA_LEAD / EXTRA_TAIL と同じ値
const LEAD = {S01: 0.8, S11: 0.5};
const TAIL = {S01: 0.5, S08: 1.5, S10: 2, S11: 3, S12: 4};
const frames = (t, id) => Math.ceil((t.leadSeconds + (LEAD[id] ?? 0) + t.scenes[id].audioSeconds + t.tailSeconds + (TAIL[id] ?? 0)) * 60);
const only = process.argv.slice(2).filter((a) => /^[SD]\d\d[a-z]?$/.test(a));
if (!only.length) throw new Error('場面IDを指定してください（例: S06）');
T.order = T.videos[V];
O.order = O.videos?.[V] ?? O.order;
if (T.order.join() !== O.order.join()) throw new Error('場面の並びが変わっています。全編を書き出し直してください');

// ffmpeg を実行し、ログ（標準エラー）を返す
const ffmpeg = (args) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', ...args], {cwd: out(''), encoding: 'utf8', maxBuffer: 1 << 28});
  if (r.status !== 0) throw new Error(`ffmpeg が失敗しました:\n${r.stderr}`);
  return r.stderr;
};

// 場面ごとのコマ範囲（前の書き出しの位置）と、長さの増減
let oldTotal = 0, newTotal = 0;
const changed = [];
for (const id of T.order) {
  const a = frames(O, id), b = frames(T, id);
  if (only.includes(id)) changed.push({id, start: oldTotal, end: oldTotal + a, delta: b - a});
  else if (a !== b) throw new Error(`${id} の長さが変わっています（${a}→${b}コマ）。${id} も指定してください`);
  oldTotal += a; newTotal += b;
}
// 前の書き出しの位置 p が、今の書き出しでは何コマ目か
const shift = (p) => p + changed.filter((c) => c.end <= p).reduce((s, c) => s + c.delta, 0);

// 前の全編のキーフレーム（コマ番号）
const keys = [...ffmpeg(['-skip_frame', 'nokey', '-i', base, '-map', '0:v', '-vf', 'showinfo', '-f', 'null', '-'])
  .matchAll(/pts_time:([0-9.]+)/g)].map((m) => Math.round(Number(m[1]) * 60));
if (!keys.length) throw new Error('キーフレームが読めません');

// 前後のキーフレームまで広げ、重なる範囲はまとめる
const spans = changed
  .map(({start, end}) => [Math.max(...keys.filter((k) => k <= start)), Math.min(oldTotal, ...keys.filter((k) => k >= end))])
  .reduce((acc, s) => { const l = acc.at(-1); if (l && s[0] <= l[1]) l[1] = Math.max(l[1], s[1]); else acc.push(s); return acc; }, []);

// 前の全編を、作り直す範囲の境目（キーフレーム）で分ける
const cuts = [...new Set(spans.flat())].filter((c) => c > 0 && c < oldTotal);
const bounds = [0, ...cuts, oldTotal];
await Promise.all(bounds.map((_, i) => rm(out(`splice_seg_${i}.mp4`), {force: true})));
ffmpeg(['-v', 'error', '-y', '-i', base, '-map', '0:v', '-c', 'copy', '-f', 'segment', '-reset_timestamps', '1',
  ...(cuts.length ? ['-segment_frames', cuts.join(',')] : []), 'splice_seg_%d.mp4']);

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: COMP});
if (composition.durationInFrames !== newTotal) throw new Error(`全編のコマ数が計算と合いません（${composition.durationInFrames} ≠ ${newTotal}）`);

const list = [], temps = [];
for (let i = 0; i < bounds.length - 1; i++) {
  const [a, b] = [bounds[i], bounds[i + 1]];
  if (!spans.some(([s]) => s === a)) { list.push(`splice_seg_${i}.mp4`); continue; }
  const [na, nb] = [shift(a), shift(b)];
  const chunk = `splice_new_${i}.mp4`;
  console.log(`作り直し: 今の${na}〜${nb - 1}コマ（${(na / 60).toFixed(2)}〜${(nb / 60).toFixed(2)}秒）`);
  // 同時処理を増やすと実機映像のコマが取り出せずに止まるので2にする
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 18, muted: true, concurrency: 2, frameRange: [na, nb - 1], outputLocation: out(chunk)});
  list.push(chunk); temps.push(chunk);
}
await writeFile(out('splice.txt'), list.map((f) => `file '${f}'`).join('\n'));

// 音：長さが変わったら全編分を合成し直す（Remotion で音だけ書き出すと映像と同じくらい時間がかかる）
let audio = base;
if (changed.some((c) => c.delta)) {
  console.log('音を合成し直します');
  audio = out('splice_audio.m4a');
  mixAudio(T, audio);
  temps.push('splice_audio.m4a');
}

const tmp = `fxracing3d_${V}.splice.mp4`;
ffmpeg(['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'splice.txt', '-i', audio,
  '-map', '0:v', '-map', '1:a', '-c', 'copy', '-movflags', '+faststart', tmp]);

// 全コマを読んで、エラーがなくコマ数が合うことを確かめる
const check = ffmpeg(['-v', 'error', '-i', tmp, '-map', '0:v', '-f', 'null', '-']);
if (check.trim()) throw new Error(`つないだ動画にエラーがあります。元の全編はそのままです:\n${check}`);
const count = Number(ffmpeg(['-i', tmp, '-map', '0:v', '-c', 'copy', '-f', 'null', '-']).match(/frame=\s*(\d+)/g)?.at(-1)?.match(/\d+/)?.[0]);
console.log(`コマ数 ${count}（今の全編 ${newTotal}）`);
if (count !== newTotal) throw new Error('コマ数が合いません。元の全編はそのままです');

await rename(base, out(`fxracing3d_${V}.prev.mp4`));
await rename(out(tmp), base);
await copyFile(path.join(root, 'src/timing.json'), out(`fxracing3d_${V}.timing.json`));
await Promise.all([...temps, 'splice.txt', ...bounds.map((_, i) => `splice_seg_${i}.mp4`)].map((f) => rm(out(f), {force: true})));
console.log(`差し替えました。前の版は out/fxracing3d_${V}.prev.mp4`);
