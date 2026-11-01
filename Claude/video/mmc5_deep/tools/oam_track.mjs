// リプレイを録画と同じコアで再生し、摩擦円の点（OAM 15,19,23,27）の毎フレームの位置とタイルを書き出す。
// 出力: src/data/dot_oam.json  {from, slots, frames: [[y,tile,x]×4]...}（録画の i フレーム目＝video の i フレーム目）
// 使い方: node tools/oam_track.mjs rec/replay_drift1.json 300 1800
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'webcore', 'web');
const imp = (p) => import(pathToFileURL(path.join(web, p)).href);
const {unpackReplay} = await imp('replay-format.js');
const {REPLAY} = await imp('replay-version.js');
const {loadState} = await imp('replay.js');
const createCore = (await imp('emulator/core.js')).default;

const [src, fromArg, countArg] = process.argv.slice(2);
const from = Number(fromArg), count = Number(countArg);
const raw = JSON.parse(fs.readFileSync(path.resolve(root, src), 'utf8'));
const {state, inputs} = await unpackReplay(raw.replay ?? raw, REPLAY);
const rom = fs.readFileSync(path.join(web, 'assets', 'game.nes'));
const core = await createCore({wasmBinary: fs.readFileSync(path.join(web, 'emulator', 'core.wasm'))});
const p = core._malloc(rom.length); core.HEAPU8.set(rom, p); core._web_load_rom(p, rom.length); core._free(p);
loadState(core, state);
const rd = (a) => core._web_peek(a);
const slots = [15, 19, 23, 27];
const frames = [];
for (let i = 0; i < from + count; i++) {
  core._web_run(i < inputs.length ? inputs[i] : 0);
  if (i >= from) frames.push(slots.map((s) => [rd(0x200 + s * 4), rd(0x201 + s * 4), rd(0x203 + s * 4)]));
}
fs.writeFileSync(path.join(root, 'src/data/dot_oam.json'), JSON.stringify({from, slots, frames}));
const xs = slots.map((_, j) => new Set(frames.map((f) => f[j][2])).size), ys = slots.map((_, j) => new Set(frames.map((f) => f[j][0])).size);
console.log('distinct x per slot', xs, 'distinct y per slot', ys);
