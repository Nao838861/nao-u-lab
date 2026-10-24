// 図解用: 別コアで位置・向きを書き換えて背景を撮る共通処理（リプレイ録画とは無関係）
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'webcore', 'web');
export async function makeCore() {
  const createCore = (await import(pathToFileURL(path.join(web, 'emulator/core.js')).href)).default;
  const rom = fs.readFileSync(path.join(web, 'assets', 'game.nes'));
  const core = await createCore({wasmBinary: fs.readFileSync(path.join(web, 'emulator', 'core.wasm'))});
  const p = core._malloc(rom.length); core.HEAPU8.set(rom, p); core._web_load_rom(p, rom.length); core._free(p);
  const rd = (a, n = 1) => { let v = 0; for (let i = 0; i < n; i++) v += core._web_peek(a + i) * 2 ** (8 * i); return v; };
  const wr = (a, v, n = 1) => { for (let i = 0; i < n; i++) core._web_poke(a + i, Math.floor(v / 2 ** (8 * i)) & 255); };
  const run = (n, m = 0) => { for (let i = 0; i < n; i++) core._web_run(m); };
  run(180); run(1, 8);
  let k = 0; while (rd(0x6720) !== 3 && k++ < 600) run(1);
  // カウントダウン開始直後の状態を保存し、カウントダウンが終わる前に戻す（走行が始まると衝突で画面が変わる）
  const size = core._web_state_size(), sp = core._malloc(size);
  if (!core._web_state_save(sp, size)) throw Error('state save');
  const saved = core.HEAPU8.slice(sp, sp + size); core._free(sp);
  let since = 0;
  const restore = () => { const q = core._malloc(saved.length); core.HEAPU8.set(saved, q); core._web_state_load(q, saved.length); core._free(q); since = 0; };
  let rival = null;
  const setRival = (v) => { rival = v; };
  const shot = (x, y, a) => {
    if (since > 120 || rd(0x6720) !== 3) restore();
    since += 3;
    for (let t = 0; t < 3; t++) { if (rival !== null) for (let c = 0; c < 3; c++) wr(0x6110 + c * 4, rival + c * 40, 2); wr(0x41, Math.round(x * 256), 3); wr(0x44, Math.round(y * 256), 3); wr(0x48, a * 512, 2); wr(0xc2, (-a * 512) & 65535, 2); run(1); }
    const px = core.HEAPU8.subarray(core._web_pixels(), core._web_pixels() + 256 * 240 * 4);
    const rgb = Buffer.alloc(256 * 240 * 3); for (let i = 0, j = 0; i < px.length; i += 4) { rgb[j++] = px[i]; rgb[j++] = px[i + 1]; rgb[j++] = px[i + 2]; }
    return rgb;
  };
  return {core, rd, wr, run, shot, setRival};
}
