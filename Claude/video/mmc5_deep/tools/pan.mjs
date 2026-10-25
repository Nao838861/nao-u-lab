// 図解用の「壊れた状態／直った状態」の比較映像を撮る。
// 指定ROMをWeb版と同じWASMコアで起動し、カウントダウン中に自車の位置と向きを毎フレーム書き換えて視点を流す。
// ゲームのロジックはカウントダウン中で止まっているので、背景・HUD・スプライトの描画だけが動く。
// 使い方: node tools/pan.mjs <rom> <out_dir> <x0> <y0> <dx> <dy> <angle> <frames> [dAngle]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'webcore', 'web');
const createCore = (await import(pathToFileURL(path.join(web, 'emulator/core.js')).href)).default;
const [romPath, outDir, x0, y0, dx, dy, a0, frames, dA = '0'] = process.argv.slice(2);
const rom = fs.readFileSync(path.resolve(root, romPath));
const core = await createCore({wasmBinary: fs.readFileSync(path.join(web, 'emulator', 'core.wasm'))});
const p = core._malloc(rom.length); core.HEAPU8.set(rom, p); core._web_load_rom(p, rom.length); core._free(p);
const rd = (a) => core._web_peek(a);
const wr = (a, v, n = 1) => { for (let i = 0; i < n; i++) core._web_poke(a + i, Math.floor(v / 2 ** (8 * i)) & 255); };
const run = (n, m = 0) => { for (let i = 0; i < n; i++) core._web_run(m); };
run(180); run(1, 8);
let k = 0; while (rd(0x6720) !== 3 && k++ < 600) run(1);
if (rd(0x6720) !== 3) throw Error('countdown not reached');
const size = core._web_state_size(), sp = core._malloc(size);
core._web_state_save(sp, size); const saved = core.HEAPU8.slice(sp, sp + size); core._free(sp);
const restore = () => { const q = core._malloc(saved.length); core.HEAPU8.set(saved, q); core._web_state_load(q, saved.length); core._free(q); };
const out = path.resolve(root, outDir); fs.mkdirSync(out, {recursive: true});
const fd = fs.openSync(path.join(out, 'frames.rgb'), 'w');
const rgb = Buffer.alloc(256 * 240 * 3);
let since = 0;
for (let f = 0; f < Number(frames); f++) {
  if (since > 100 || rd(0x6720) !== 3) { restore(); since = 0; }
  const x = Number(x0) + Number(dx) * f, y = Number(y0) + Number(dy) * f;
  const a = Math.round(Number(a0) + Number(dA) * f) & 127;
  wr(0x41, Math.round(x * 256), 3); wr(0x44, Math.round(y * 256), 3); wr(0x48, a * 512, 2); wr(0xc2, (-a * 512) & 65535, 2);
  run(1); since++;
  const px = core.HEAPU8.subarray(core._web_pixels(), core._web_pixels() + 256 * 240 * 4);
  for (let i = 0, j = 0; i < px.length; i += 4) { rgb[j++] = px[i]; rgb[j++] = px[i + 1]; rgb[j++] = px[i + 2]; }
  fs.writeSync(fd, rgb);
}
fs.closeSync(fd);
console.log('ok', out);
