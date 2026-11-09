// 全編の音（BGM＋各場面のナレーション）を ffmpeg で合成する。src/Root.tsx の Full と同じ組み立て。
// Remotion で音だけ書き出すと映像と同じくらい時間がかかるので、tools/splice.mjs で長さが変わったときに使う。
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// src/common.tsx の EXTRA_LEAD / EXTRA_TAIL と同じ値
const LEAD = {S01: 0.8, S11: 0.5};
const TAIL = {S01: 0.5, S08: 1.5, S10: 2, S11: 3, S12: 4};
const lead = (t, id) => t.leadSeconds + (LEAD[id] ?? 0);
// 音を鳴らしている動画（場面の頭から終わりまで）。src/scenesA.tsx・scenesC.tsx の Hw / Nes の volume と同じ
const VIDEO_AUDIO = {
  S01: {src: 'video/hw.mp4', from: 7, volume: 0.35},
  S11: {src: 'video/n2d.mp4', from: 420 / 60, volume: 0.5},
  S12: {src: 'video/hw.mp4', from: 40, volume: 0.3},
};
const frames = (t, id) => Math.ceil((lead(t, id) + t.scenes[id].audioSeconds + t.tailSeconds + (TAIL[id] ?? 0)) * 60);

/** t: 時刻表、output: 書き出し先（.aac / .wav）、wav: 場面ごとのナレーションのパス（省略時は public/audio/<id>.wav） */
export const mixAudio = (t, output, wav = (id) => path.join(root, 'public/audio', `${id}.wav`)) => {
  const total = t.order.reduce((a, id) => a + frames(t, id), 0) / 60;
  const inputs = ['-stream_loop', '-1', '-i', path.join(root, 'public/audio/bgm_game.mp3')];
  // BGM: 音量 0.12、最初の60コマで上げ、最後の120コマで下げる
  const filters = [`[0:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${total},volume=0.12,afade=t=in:d=1,afade=t=out:st=${total - 2}:d=2[bgm]`];
  const labels = ['[bgm]'];
  const add = (args, filter) => {
    inputs.push(...args);
    const n = labels.length;
    filters.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,${filter}[s${n}]`);
    labels.push(`[s${n}]`);
  };
  let at = 0;
  for (const id of t.order) {
    const ms = Math.round(((at + Math.round(lead(t, id) * 60)) / 60) * 1000);
    add(['-i', wav(id)], `adelay=${ms}:all=1`);
    const v = VIDEO_AUDIO[id];
    if (v) add(['-ss', String(v.from), '-t', String(frames(t, id) / 60), '-i', path.join(root, 'public', v.src)],
      `volume=${v.volume},adelay=${Math.round((at / 60) * 1000)}:all=1`);
    at += frames(t, id);
  }
  filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${total}[a]`);
  const r = spawnSync('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '[a]',
    ...(output.endsWith('.wav') ? ['-c:a', 'pcm_s16le'] : ['-c:a', 'aac', '-b:a', '320k']), output], {encoding: 'utf8'});
  if (r.status !== 0) throw new Error(`音の合成に失敗しました:\n${r.stderr}`);
};
