// Generate narration per line with edge-tts (Microsoft neural voice), then build one WAV per scene and src/timing.json.
// Usage: node tools/tts.mjs [--force] [--scene=S03]
import {readFile, writeFile, mkdir, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = JSON.parse(await readFile(path.join(root, 'narration/script.json'), 'utf8'));
const rawDir = path.join(root, 'narration/raw');
const outDir = path.join(root, 'public/audio');
await mkdir(rawDir, {recursive: true});
await mkdir(outDir, {recursive: true});
const force = process.argv.includes('--force');
const only = process.argv.find((a) => a.startsWith('--scene='))?.slice(8);

import {execFileSync} from 'node:child_process';
const exists = async (p) => access(p).then(() => true, () => false);

// Parse PCM WAV -> {rate, channels, bits, data}
const parseWav = (buf) => {
  let off = 12, fmt, data;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    let size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === 'fmt ') fmt = {channels: buf.readUInt16LE(body + 2), rate: buf.readUInt32LE(body + 4), bits: buf.readUInt16LE(body + 14)};
    if (id === 'data') { if (size === 0xffffffff || body + size > buf.length) size = buf.length - body; data = buf.subarray(body, body + size); break; }
    off = body + size + (size % 2);
  }
  return {...fmt, data};
};
const makeWav = ({rate, channels, bits}, data) => {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * channels * bits / 8, 28); h.writeUInt16LE(channels * bits / 8, 32);
  h.writeUInt16LE(bits, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};
// Trim leading/trailing near-silence (16-bit mono assumed).
const trim = (w) => {
  const s = new Int16Array(w.data.buffer, w.data.byteOffset, w.data.length / 2);
  const th = 400; let a = 0, b = s.length - 1;
  while (a < s.length && Math.abs(s[a]) < th) a++;
  while (b > a && Math.abs(s[b]) < th) b--;
  const pad = Math.round(w.rate * 0.03);
  a = Math.max(0, a - pad); b = Math.min(s.length - 1, b + pad);
  return w.data.subarray(a * 2, (b + 1) * 2);
};

const tts = async (text, raw) => {
  const mp3 = raw.replace(/\.wav$/, '.mp3');
  execFileSync('edge-tts', ['--voice', script.voice, `--rate=${script.rate}`, `--pitch=${script.pitch ?? '+0Hz'}`, '--text', text, '--write-media', mp3]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp3, '-ac', '1', '-ar', '24000', '-c:a', 'pcm_s16le', raw]);
};

const timingPath = path.join(root, 'src/timing.json');
const timing = (await exists(timingPath)) ? JSON.parse(await readFile(timingPath, 'utf8')) : {scenes: {}};
for (const scene of script.scenes) {
  if (only && scene.id !== only) continue;
  const parts = [], lines = [];
  let fmt, t = 0;
  for (const [i, text] of scene.lines.entries()) {
    const spoken = (scene.tts && scene.tts[i]) ?? (script.readings ?? []).reduce((acc, [from, to]) => acc.split(from).join(to), text);
    const hash = crypto.createHash('sha1').update(JSON.stringify([script.voice, script.rate, script.pitch, spoken])).digest('hex').slice(0, 10);
    const raw = path.join(rawDir, `${scene.id}_${i}_${hash}.wav`);
    if (force || !(await exists(raw))) {
      process.stdout.write(`TTS ${scene.id}#${i} ... `);
      await tts(spoken, raw);
      console.log('ok');
    }
    const w = parseWav(await readFile(raw));
    fmt = w;
    const pcm = trim(w);
    const dur = pcm.length / (w.rate * w.channels * w.bits / 8);
    lines.push({text, start: Number(t.toFixed(3)), end: Number((t + dur).toFixed(3))});
    parts.push(pcm);
    t += dur;
    if (i < scene.lines.length - 1) {
      const gap = Buffer.alloc(Math.round(script.gapSeconds * w.rate) * 2);
      parts.push(gap); t += script.gapSeconds;
    }
  }
  await writeFile(path.join(outDir, `${scene.id}.wav`), makeWav(fmt, Buffer.concat(parts)));
  timing.scenes[scene.id] = {title: scene.title, audioSeconds: Number(t.toFixed(3)), lines};
}
timing.order = script.scenes.map((s) => s.id);
timing.leadSeconds = 0.5;
timing.tailSeconds = script.sceneTailSeconds;
await writeFile(timingPath, JSON.stringify(timing, null, 1));
const total = timing.order.reduce((a, id) => a + (timing.scenes[id]?.audioSeconds ?? 0) + timing.leadSeconds + timing.tailSeconds, 0);
console.log('total seconds', total.toFixed(1));
