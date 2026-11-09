// Web版と同じコア（解説用に「FXを消す」切り替えと8ドットごとの合成情報だけを足した版）で
// 撮影用ROM（Web版GRIP 8位のリプレイを自動入力する実機用ROM）を走らせ、映像・音・毎コマの状態を記録する。
// 使い方: node tools/record.mjs <出力名> [--select=コマ,コマ,...] [--layers=コマ,コマ,...] [--frames=N]
//   --select : そのコマから6コマSELECTを押す（視点切り替え）
//   --layers : そのコマの8ドットごとの合成情報を保存する
// 「FXなし（地面だけ）」の映像は、同じ入力を与えたもう1台のコアで同時に作る（ground.mp4）。
// 切り替えは画面の合成だけに効くので、2台のゲーム状態は毎コマ一致する（RAMを比べて確かめる）。
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const name = process.argv[2];
const list = (s) => (s ? s.split(',').filter(Boolean).map(Number) : []);
const selects = list(arg('select'));
const layers = new Set(list(arg('layers')));
const total = Number(arg('frames', 4500));
const coreDir = path.join(root, 'webcore', arg('core', 'explainer'));
const out = path.join(root, 'rec', name);
fs.mkdirSync(path.join(out, 'layers'), {recursive: true});

const {loadCore} = await import(pathToFileURL(path.join(root, 'webcore/core-loader.js')).href);
const createCore = (await import(pathToFileURL(path.join(coreDir, 'core.js')).href)).default;
const rom = fs.readFileSync(path.join(root, 'webcore', arg('rom', 'rank8.nes')));
const boot = async () => {
  const c = await loadCore(createCore, fs.readFileSync(path.join(coreDir, 'core.wasm')));
  const p = c._malloc(rom.length);
  c.HEAPU8.set(rom, p);
  if (!c._web_load_rom(p, rom.length)) throw Error('rom');
  c._free(p);
  return c;
};
const core = await boot();
const ground = await boot();
ground._web_explainer_hide(1);

const DOWN = 32, START = 8, SELECT = 4;
const input = (i) => {
  let m = 0;
  if (i >= 300 && i < 306) m |= DOWN;     // タイトルでGRIPを選ぶ
  if (i >= 360 && i < 366) m |= START;    // 開始（以後はROMがリプレイの入力を流す）
  for (const s of selects) if (i >= s && i < s + 6) m |= SELECT;
  return m;
};
const rgbOf = (c = core) => {
  const px = c.HEAPU8.subarray(core._web_pixels(), core._web_pixels() + 256 * 240 * 4);
  const b = Buffer.alloc(256 * 240 * 3);
  for (let k = 0, j = 0; k < px.length; k += 4) { b[j++] = px[k]; b[j++] = px[k + 1]; b[j++] = px[k + 2]; }
  return b;
};
const rd = (a, n = 1) => { let v = 0; for (let i = 0; i < n; i++) v += core._web_peek(a + i) * 2 ** (8 * i); return v; };

const enc = (file) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '256x240', '-r', '60', '-i', '-',
  '-vf', 'scale=768:720:flags=neighbor', '-c:v', 'libx264', '-crf', '10', '-preset', 'medium', '-pix_fmt', 'yuv444p', path.join(out, file)]);
const ff = enc('video_noaudio.mp4');
const fg = enc('ground.mp4');
const audio = fs.openSync(path.join(out, 'audio.s16'), 'w');
const log = fs.openSync(path.join(out, 'log.jsonl'), 'w');
const write = (e, b) => new Promise((r) => (e.stdin.write(b) ? r() : e.stdin.once('drain', r)));
const ram = (c) => { const b = Buffer.alloc(0x800); for (let a = 0; a < 0x800; a++) b[a] = c._web_peek(a); return b; };
let mismatch = 0;

for (let i = 0; i < total; i++) {
  const m = input(i);
  core._web_run(m);
  ground._web_run(m);
  if (i % 30 === 0 && !ram(core).equals(ram(ground))) mismatch++;
  const frame = rgbOf();
  const gframe = rgbOf(ground);
  if (layers.has(i)) {
    fs.writeFileSync(path.join(out, 'layers', `${i}_full.rgb`), frame);
    fs.writeFileSync(path.join(out, 'layers', `${i}_ground.rgb`), gframe);
    fs.writeFileSync(path.join(out, 'layers', `${i}_info.bin`), Buffer.from(core.HEAPU8.subarray(core._web_explainer_info(), core._web_explainer_info() + 240 * 34 * 4)));
    fs.writeFileSync(path.join(out, 'layers', `${i}_rows.bin`), Buffer.from(core.HEAPU8.subarray(core._web_explainer_rows(), core._web_explainer_rows() + 192 * 6 * 4)));
  }
  await write(ff, frame);
  await write(fg, gframe);
  const n = core._web_audio_frames() * 2;
  if (n) fs.writeSync(audio, Buffer.from(core.HEAP16.slice(core._web_audio() >> 1, (core._web_audio() >> 1) + n).buffer));
  fs.writeSync(log, JSON.stringify({f: i, in: m, scene: rd(0x6720), laps: rd(0x6721), tick: rd(0x6726, 3)}) + '\n');
}
ff.stdin.end(); fg.stdin.end();
await Promise.all([ff, fg].map((e) => new Promise((r) => e.on('close', r))));
fs.closeSync(audio); fs.closeSync(log);
const rate = core._web_sample_rate();
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({rom: arg('rom', 'rank8.nes'), core: arg('core', 'explainer'), frames: total, selects, layers: [...layers], sampleRate: rate, ramChecks: Math.ceil(total / 30), ramMismatches: mismatch}, null, 1));
await new Promise((r) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, 'video_noaudio.mp4'), '-f', 's16le', '-ar', String(rate), '-ac', '2',
  '-i', path.join(out, 'audio.s16'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', path.join(out, 'video.mp4')]).on('close', r));
console.log('done', out, 'RAM不一致', mismatch);
