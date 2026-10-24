// 各カットの指定位置の静止画を out/stills/ に出す。引数: 0..1 の位置（既定 0.85）か "Cxx:frame"
import path from 'node:path';
import {readFile, mkdir} from 'node:fs/promises';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'narration/cuts.json'), 'utf8'));
const args = process.argv.slice(2);
const pos = args.find((a) => /^[0-9.]+$/.test(a)) ? Number(args.find((a) => /^[0-9.]+$/.test(a))) : 0.85;
const only = args.filter((a) => /^C\d\d/.test(a));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: 'MMC5Explainer'});
await mkdir(path.join(root, 'out/stills'), {recursive: true});
for (const c of manifest.cuts) for (const spec of (only.length ? only.filter((a) => a.split(':')[0] === c.id) : ['all'])) {
  const local = spec.includes(':') ? Number(spec.split(':')[1]) : Math.floor(c.durationFrames * pos);
  const frame = c.startFrame + local;
  const output = path.join(root, 'out/stills', `${c.id}_${local}.png`);
  await renderStill({composition, serveUrl, output, frame});
  console.log(output);
}
