// 2D版の記録（リプレイ）を、記録した2D版のエンジンでそのまま走らせ、
// 毎コマの車の状態をWeb版と同じ方法（presentation コア）で3D版のROMに渡して描かせる。
// 2Dの画面と3Dの画面を同じコマで並べて録画する。3D側は物理を計算しない（2D側の状態を表示するだけ）。
// 使い方: node tools/record_2d3d.mjs rec/replays/naou_drift.json rec/naou2d3d
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root = path.resolve('.');
const web = path.join(root, 'webcore/web');
const imp = (p) => import(pathToFileURL(path.join(web, p)).href);
const {loadCore} = await imp('core-loader.js');
const {unpackReplay} = await imp('replay-format.js');
const {loadState} = await imp('replay.js');
const {REPLAY_VERSIONS} = await imp('replay-versions.js');
const {presentationPacket, PRESENTATION_BYTES} = await imp('replay-presentation.js');
const {readPose} = await imp('replay-trajectory.js');

const [src, outArg] = process.argv.slice(2);
const out = path.resolve(outArg);
fs.mkdirSync(out, {recursive: true});
const replay = JSON.parse(fs.readFileSync(src, 'utf8'));
const engine = REPLAY_VERSIONS.find((v) => v.rom === replay.rom && v.core === replay.core);
if (!engine) throw Error('engine');
const {state, inputs} = await unpackReplay(replay, engine);

const boot = async (dir, romFile, wasmFile, jsFile) => {
  const createCore = (await import(pathToFileURL(path.join(dir, jsFile)).href)).default;
  const c = await loadCore(createCore, fs.readFileSync(path.join(dir, wasmFile)));
  const rom = fs.readFileSync(path.join(dir, romFile));
  const p = c._malloc(rom.length); c.HEAPU8.set(rom, p);
  if (!c._web_load_rom(p, rom.length)) throw Error('rom ' + dir);
  c._free(p);
  return c;
};
// 2D：記録時のエンジン
const source = await boot(web, engine.romPath, engine.corePath, engine.modulePath.replace('./', ''));
loadState(source, state);
// 3D：Web版の presentation コア（native3DPresentation と同じ起動手順）
const pres = path.join(web, 'presentation');
const core3 = await boot(pres, 'game.nes', 'core.wasm', 'core.js');
const run = (n, mask = 0) => { for (let i = 0; i < n; i++) core3._web_run(mask); };
run(600);
if ((core3._web_peek(0x674d) === 1 ? 'grip' : 'drift') !== replay.mode) { run(1, 4); run(30); }
run(1, 8);
for (let i = 0; i < 300 && core3._web_peek(0x6720) !== 1; i++) run(1);
if (core3._web_peek(0x6720) !== 1) throw Error('3D start');
const buf = core3._malloc(PRESENTATION_BYTES);

const enc = (file) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '256x240', '-r', '60', '-i', '-',
  '-vf', 'scale=768:720:flags=neighbor', '-c:v', 'libx264', '-crf', '10', '-pix_fmt', 'yuv444p', path.join(out, file)]);
const e2 = enc('2d.mp4'), e3 = enc('3d.mp4');
const rgb = (c) => {
  const px = c.HEAPU8.subarray(c._web_pixels(), c._web_pixels() + 256 * 240 * 4);
  const b = Buffer.alloc(256 * 240 * 3);
  for (let k = 0, j = 0; k < px.length; k += 4) { b[j++] = px[k]; b[j++] = px[k + 1]; b[j++] = px[k + 2]; }
  return b;
};
const write = (e, b) => new Promise((r) => (e.stdin.write(b) ? r() : e.stdin.once('drain', r)));
const audio = fs.openSync(path.join(out, 'audio2d.s16'), 'w');
let mismatch = 0;
const log = [];
for (let i = 0; i < inputs.length; i++) {
  source._web_run(inputs[i]);
  const n = source._web_audio_frames() * 2;
  if (n) fs.writeSync(audio, Buffer.from(source.HEAP16.slice(source._web_audio() >> 1, (source._web_audio() >> 1) + n).buffer));
  const packet = presentationPacket(source);
  core3.HEAPU8.set(packet, buf);
  if (!core3._web_present_frame(buf, packet.length)) throw Error('present ' + i);
  const a = readPose(source), b = readPose(core3);
  if (!a.every((v, k) => v === b[k])) mismatch++;
  await write(e2, rgb(source));
  await write(e3, rgb(core3));
  if (i % 60 === 0) log.push({f: i, pose: a});
}
e2.stdin.end(); e3.stdin.end();
await Promise.all([e2, e3].map((e) => new Promise((r) => e.on('close', r))));
fs.closeSync(audio);
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({source: src, mode: replay.mode, ticks: replay.ticks, lapTicks: replay.lapTicks,
  frames: inputs.length, engine: {epoch: engine.epoch, rom: engine.rom}, presentationRom: JSON.parse(fs.readFileSync(path.join(pres, 'manifest.json'))).rom,
  poseMismatches: mismatch, sampleRate: source._web_sample_rate(), finalTicks: source._web_peek(0x6726) | (source._web_peek(0x6727) << 8) | (source._web_peek(0x6728) << 16), log}, null, 1));
console.log('done', inputs.length, 'pose不一致', mismatch);
