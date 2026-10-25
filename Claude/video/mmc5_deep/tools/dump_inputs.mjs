// リプレイの入力列を1コマ1バイトのファイルに書き出す（Mesen の Lua から読む）
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'webcore', 'web');
const {unpackReplay} = await import(pathToFileURL(path.join(web, 'replay-format.js')).href);
const {REPLAY} = await import(pathToFileURL(path.join(web, 'replay-version.js')).href);
const [src, dst] = process.argv.slice(2);
const raw = JSON.parse(fs.readFileSync(path.resolve(root, src), 'utf8'));
const {inputs} = await unpackReplay(raw.replay ?? raw, REPLAY);
fs.writeFileSync(path.resolve(root, dst), Buffer.from(inputs));
console.log(inputs.length);
