// Web版と同じコアでROMを起動し、指定コマの画面をPPMにする（確認用）
// 使い方: node tools/probe.mjs ROM コマ番号,コマ番号,...
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root = path.resolve('.');
const {loadCore} = await import(pathToFileURL(path.join(root, 'webcore/core-loader.js')).href);
const createCore = (await import(pathToFileURL(path.join(root, 'webcore/emulator/core.js')).href)).default;
const core = await loadCore(createCore, fs.readFileSync('webcore/emulator/core.wasm'));
const rom = fs.readFileSync(process.argv[2]);
const p = core._malloc(rom.length);
core.HEAPU8.set(rom, p);
console.log('load', core._web_load_rom(p, rom.length));
core._free(p);

const shots = new Set(process.argv[3].split(',').map(Number));
const START = 8;
const header = Buffer.from([0x50, 0x36, 0x20, 0x32, 0x35, 0x36, 0x20, 0x32, 0x34, 0x30, 0x20, 0x32, 0x35, 0x35, 0x0a]); // "P6 256 240 255" + LF
fs.mkdirSync('rec/probe', {recursive: true});
const t0 = Date.now();
for (let i = 0; i <= Math.max(...shots); i++) {
  core._web_run(i >= 300 && i < 306 ? 32 : i >= 360 && i < 366 ? START : 0);
  if (!shots.has(i)) continue;
  const px = core.HEAPU8.subarray(core._web_pixels(), core._web_pixels() + 256 * 240 * 4);
  const b = Buffer.alloc(256 * 240 * 3);
  for (let k = 0, j = 0; k < px.length; k += 4) { b[j++] = px[k]; b[j++] = px[k + 1]; b[j++] = px[k + 2]; }
  fs.writeFileSync(`rec/probe/${i}.ppm`, Buffer.concat([header, b]));
}
console.log('sec', (Date.now() - t0) / 1000);
