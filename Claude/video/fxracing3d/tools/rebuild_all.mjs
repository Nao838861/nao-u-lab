// 別のPCで、GitHubに置いた assets/ から動画の素材をすべて作り直す。
// 使い方（プロジェクトのフォルダーで）:
//   npm install
//   node tools/rebuild_all.mjs            … 素材を作り直す（数分）
//   node tools/rebuild_all.mjs --tts      … ナレーション音声も作り直す（edge-tts とネット接続が必要）
//   npm run render                        … 動画を書き出す
// 必要なもの: Node 20以上、Python 3（numpy, Pillow）、ffmpeg、（--tts のとき）edge-tts
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = (...p) => path.join(root, 'assets', ...p);
const P = (...p) => path.join(root, ...p);
const run = (cmd, args) => { console.log('>', cmd, args.join(' ')); execFileSync(cmd, args, {cwd: root, stdio: 'inherit'}); };
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), {recursive: true}); fs.cpSync(from, to, {recursive: true}); };
const py = process.platform === 'win32' ? 'python' : 'python3';

// 1) assets → 作業用の場所（webcore/ rec/ public/ は git の対象外）
copy(A('webcore'), P('webcore'));
copy(A('replays'), P('rec', 'replays'));
copy(A('shapes'), P('rec', 'shapes'));
copy(A('hw', 'FxRacing3.mp4'), P('public', 'video', 'hw.mp4'));
copy(A('prev', 'prev2d.mp4'), P('public', 'video', 'prev2d.mp4'));
copy(A('prev', 'pictures'), P('public', 'pictures'));
copy(A('img'), P('public', 'img'));
copy(A('audio', 'bgm_game.mp3'), P('public', 'audio', 'bgm_game.mp3'));

// 2) 解説用コアが元のコアと同じ画面・音を出すことの確認
run('node', ['tools/check_same.mjs', '4500']);

// 3) 録画（Web版と同じコア）。main は層画像用の合成情報も保存する
const layers = Array.from({length: 38}, (_, i) => 600 + i * 100).join(',');
run('node', ['tools/record.mjs', 'main', `--layers=${layers}`]);
run('node', ['tools/record.mjs', 'views', '--select=900,1500,2100,2700,3300,3900']);
copy(P('rec', 'main', 'video.mp4'), P('public', 'video', 'main.mp4'));
copy(P('rec', 'main', 'ground.mp4'), P('public', 'video', 'ground.mp4'));
copy(P('rec', 'views', 'video.mp4'), P('public', 'video', 'views.mp4'));

// 4) 層画像・コース地図と行テーブル・車のクリップ
run(py, ['-I', 'tools/make_layers.py', '600', '1500', '2100', '2300', '3200', '4100']);
run(py, ['-I', 'tools/make_mode7.py', '1500', '2100', '2700', '3200']);
run(py, ['-I', 'tools/make_car_clips.py']);

// 5) 2D版のリプレイを3D版で（2D版のエンジン → presentation コア）
run('node', ['tools/record_2d3d.mjs', 'rec/replays/naou_drift.json', 'rec/naou2d3d']);
const meta = JSON.parse(fs.readFileSync(P('rec', 'naou2d3d', 'meta.json'), 'utf8'));
run('ffmpeg', ['-v', 'error', '-y', '-i', 'rec/naou2d3d/2d.mp4', '-f', 's16le', '-ar', String(meta.sampleRate), '-ac', '2', '-i', 'rec/naou2d3d/audio2d.s16',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', 'public/video/n2d.mp4']);
copy(P('rec', 'naou2d3d', '3d.mp4'), P('public', 'video', 'n3d.mp4'));

// 6) ナレーション：assets/narration の音声（src/timing.json と対応）を使う。--tts のときは edge-tts で作り直す
if (process.argv.includes('--tts')) run('node', ['tools/tts.mjs']);
else for (const f of fs.readdirSync(A('narration'))) copy(A('narration', f), P('public', 'audio', f));
console.log('完了。npm run render で書き出せます。');
