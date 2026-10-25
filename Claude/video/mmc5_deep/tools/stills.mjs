// 各場面・各文の開始から少し後の静止画を out/stills/ に出す。引数: 場面ID（省略時は全場面）
import path from 'node:path';
import {readFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(await readFile(path.join(root, 'src/timing.json'), 'utf8'));
const only = process.argv.slice(2).filter((a) => /^S\d\d$/.test(a));
const delay = Number(process.argv.find((a) => a.startsWith('--delay='))?.slice(8) ?? 70);
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
await mkdir(path.join(root, 'out/stills'), {recursive: true});
let start = 0;
for (const id of T.order) {
  const sc = T.scenes[id];
  const frames = Math.ceil((T.leadSeconds + sc.audioSeconds + T.tailSeconds) * 60);
  if (!only.length || only.includes(id)) {
    const composition = await selectComposition({serveUrl, id: 'MMC5Deep'});
    for (const [i, l] of sc.lines.entries()) {
      const local = Math.min(frames - 1, Math.round((T.leadSeconds + l.start) * 60) + delay);
      const output = path.join(root, 'out/stills', `${id}_${i}.png`);
      await renderStill({composition, serveUrl, output, frame: start + local});
    }
    console.log(id);
  }
  start += frames;
}
