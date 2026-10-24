// Web版ランキングのリプレイ（開始状態＋全フレーム入力）を、Web版と同じWASMコアで再生して録画する。
// 出力: <out>/frames.rgb (256x240 RGB 60fps), audio.s16 (stereo s16le), log.jsonl (毎フレームのRAM値), meta.json
// ゲーム状態への書き込みはしない。web_run と web_peek だけを使う。
// 使い方: node tools/record_replay.mjs rec/replay_drift1.json rec/drift1
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'webcore', 'web');
const imp = (p) => import(pathToFileURL(path.join(web, p)).href);
const {unpackReplay} = await imp('replay-format.js');
const {REPLAY} = await imp('replay-version.js');
const {loadState} = await imp('replay.js');
const {snapshot} = await imp('race.js');
const createCore = (await imp('emulator/core.js')).default;

const [src, outArg] = process.argv.slice(2);
const out = path.resolve(root, outArg);
fs.mkdirSync(out, {recursive: true});
const raw = JSON.parse(fs.readFileSync(path.resolve(root, src), 'utf8'));
const replay = raw.replay ?? raw;
const {state, inputs} = await unpackReplay(replay, REPLAY);

const rom = fs.readFileSync(path.join(web, 'assets', 'game.nes'));
const core = await createCore({wasmBinary: fs.readFileSync(path.join(web, 'emulator', 'core.wasm'))});
const p = core._malloc(rom.length); core.HEAPU8.set(rom, p);
if (!core._web_load_rom(p, rom.length)) throw Error('rom'); core._free(p);
loadState(core, state);

const rd = (a, n = 1) => { let v = 0; for (let i = 0; i < n; i++) v += core._web_peek(a + i) * 2 ** (8 * i); return v; };
const sg = (a, n) => { const v = rd(a, n); return v >= 2 ** (n * 8 - 1) ? v - 2 ** (n * 8) : v; };

const frames = fs.openSync(path.join(out, 'frames.rgb'), 'w');
const audio = fs.openSync(path.join(out, 'audio.s16'), 'w');
const log = fs.openSync(path.join(out, 'log.jsonl'), 'w');
const rgb = Buffer.alloc(256 * 240 * 3);
// 開始状態の前後で画面が落ち着くよう、そのまま入力列を最後まで流し、完走後も少し回す
const tail = 240;
for (let i = 0; i < inputs.length + tail; i++) {
  const mask = i < inputs.length ? inputs[i] : 0;
  core._web_run(mask);
  const px = core.HEAPU8.subarray(core._web_pixels(), core._web_pixels() + 256 * 240 * 4);
  for (let k = 0, j = 0; k < px.length; k += 4) { rgb[j++] = px[k]; rgb[j++] = px[k + 1]; rgb[j++] = px[k + 2]; }
  fs.writeSync(frames, rgb);
  const n = core._web_audio_frames() * 2;
  if (n) fs.writeSync(audio, Buffer.from(core.HEAP16.slice(core._web_audio() >> 1, (core._web_audio() >> 1) + n).buffer));
  const row = {
    f: i, in: mask, scene: rd(0x6720), tick: rd(0x6726, 3),
    x: sg(0x41, 3) / 256, y: sg(0x44, 3) / 256, vx: sg(0x4b, 2) / 256, vy: sg(0x4e, 2) / 256,
    head: rd(0x48, 2), yaw: sg(0x51, 2), angle: rd(0x6800), cost: rd(0x67f6, 2), pub: rd(2, 2), reject: rd(0x67fd),
    cap: [0, 1, 2, 3].map((w) => rd(0xb8 + w)), lon: [0, 1, 2, 3].map((w) => sg(0xac + w, 1)),
    lat: [0, 1, 2, 3].map((w) => sg(0xb0 + w, 1)), over: [0, 1, 2, 3].map((w) => rd(0xb4 + w)),
  };
  fs.writeSync(log, JSON.stringify(row) + '\n');
}
fs.closeSync(frames); fs.closeSync(audio); fs.closeSync(log);
const race = snapshot(core);
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({
  source: src, mode: replay.mode, ticks: replay.ticks, lapTicks: replay.lapTicks, frames: inputs.length + tail,
  sampleRate: core._web_sample_rate(), finalRace: race,
}, null, 1));
console.log('done', out, inputs.length, race);
