// 全編を書き出し、そのときの時刻表を out/fxracing3d_<video>.timing.json に保存する（tools/splice.mjs が使う）。
// 使い方: node tools/render.mjs overview|deep [remotion の追加オプション…]
// 書き出しの同時処理は2本（4本以上だと実機映像 hw.mp4 のコマが取り出せずに止まる）。
import {spawnSync} from 'node:child_process';
import {copyFileSync} from 'node:fs';
const v = process.argv[2];
const comp = {overview: 'FxOverview', deep: 'FxDeep'}[v];
if (!comp) throw new Error('overview か deep を指定してください');
const r = spawnSync('npx', ['remotion', 'render', 'src/index.ts', comp, `out/fxracing3d_${v}.mp4`, '--codec=h264', '--crf=18', '--concurrency=2', ...process.argv.slice(3)],
  {stdio: 'inherit', shell: true});
if (r.status !== 0) process.exit(r.status ?? 1);
copyFileSync('src/timing.json', `out/fxracing3d_${v}.timing.json`);
console.log(`書き出しました: out/fxracing3d_${v}.mp4`);
