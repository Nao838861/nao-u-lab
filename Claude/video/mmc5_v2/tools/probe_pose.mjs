// 図解用の実験: カウントダウン中に位置と向きを書き換え、背景がその姿勢で描かれるかを見る（録画用リプレイとは別コア）
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'webcore', 'web');
const createCore = (await import(pathToFileURL(path.join(web, 'emulator/core.js')).href)).default;
const rom = fs.readFileSync(path.join(web, 'assets', 'game.nes'));
const core = await createCore({wasmBinary: fs.readFileSync(path.join(web, 'emulator', 'core.wasm'))});
const p = core._malloc(rom.length); core.HEAPU8.set(rom, p); core._web_load_rom(p, rom.length); core._free(p);
const rd = (a, n = 1) => { let v = 0; for (let i = 0; i < n; i++) v += core._web_peek(a + i) * 2 ** (8 * i); return v; };
const wr = (a, v, n = 1) => { for (let i = 0; i < n; i++) core._web_poke(a + i, Math.floor(v / 2 ** (8 * i)) & 255); };
const run = (n, m = 0) => { for (let i = 0; i < n; i++) core._web_run(m); };
run(180); run(1, 8);
let k = 0; while (rd(0x6720) !== 3 && rd(0x6720) !== 1 && k++ < 600) run(1);
console.log('scene', rd(0x6720), 'x', rd(0x41, 3) / 256, 'y', rd(0x44, 3) / 256, 'head', rd(0x48, 2), 'c2', rd(0xc2, 2), 'angle', rd(0x6800));
const save = (name) => {
  const px = core.HEAPU8.subarray(core._web_pixels(), core._web_pixels() + 256 * 240 * 4);
  const rgb = Buffer.alloc(256 * 240 * 3); for (let i = 0, j = 0; i < px.length; i += 4) { rgb[j++] = px[i]; rgb[j++] = px[i + 1]; rgb[j++] = px[i + 2]; }
  fs.writeFileSync(path.join(root, 'rec', name + '.rgb'), rgb);
};
save('probe0');
const tests = [[300, 300, 0], [300, 300, 32], [400, 200, 64]];
tests.forEach(([x, y, a], i) => {
  for (let t = 0; t < 3; t++) { wr(0x41, x * 256, 3); wr(0x44, y * 256, 3); wr(0x48, a * 512, 2); wr(0xc2, (-a * 512) & 65535, 2); run(1); }
  console.log(i, 'scene', rd(0x6720), 'x', rd(0x41, 3) / 256, 'y', rd(0x44, 3) / 256, 'angle', rd(0x6800), 'c2', rd(0xc2, 2));
  save('probe' + (i + 1));
});
