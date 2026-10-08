// Render review stills: one per narration line (70% through the line). Usage: node tools/stills.mjs [S07,S08]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const root = path.resolve(import.meta.dirname, '..');
const timing = JSON.parse(fs.readFileSync(path.join(root, 'src/timing.json'), 'utf8'));
const only = process.argv[2]?.split(',');
const fps = 60;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'FX2Explainer'});
const out = path.join(root, 'out/stills');
fs.mkdirSync(out, {recursive: true});
let at = 0;
for (const id of timing.order) {
  const s = timing.scenes[id];
  const len = Math.ceil((timing.leadSeconds + s.audioSeconds + timing.tailSeconds) * fps);
  if (!only || only.includes(id)) {
    for (const [i, l] of s.lines.entries()) {
      const fr = at + Math.round((timing.leadSeconds + l.start + (l.end - l.start) * 0.7) * fps);
      await renderStill({composition: comp, serveUrl, frame: fr, output: path.join(out, `${id}_${i}.png`), scale: 0.5});
      console.log(id, i, fr);
    }
  }
  at += len;
}
