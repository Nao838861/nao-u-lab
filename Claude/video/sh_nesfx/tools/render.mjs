// 全編を書き出す。使い方: node tools/render.mjs [remotion の追加オプション…]
// 書き出しの同時処理は2本（多いと実機映像のコマ取り出しが詰まることがある）。
import {spawnSync} from 'node:child_process';
const r = spawnSync('npx', ['remotion', 'render', 'src/index.ts', 'ShMain', 'out/sh_nesfx.mp4', '--codec=h264', '--crf=18', '--concurrency=2', ...process.argv.slice(2)],
  {stdio: 'inherit', shell: true});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log('書き出しました: out/sh_nesfx.mp4');
