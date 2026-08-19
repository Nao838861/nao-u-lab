import {readFile, writeFile, mkdir, access} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {compactPcmWavSilence} from './compact-narration-silence.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const manifestArg = process.argv.find((argument) => argument.startsWith('--manifest='));
const manifestFileName = manifestArg?.slice('--manifest='.length) ?? 'prototype-cuts.json';
const manifestPath = path.resolve(projectRoot, 'narration', manifestFileName);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const outputRelativePath = manifest.outputDirectory ?? 'narration';
const outputDir = path.resolve(projectRoot, 'public', outputRelativePath);
const rawOutputDir = path.join(outputDir, 'raw');
const reportPath = path.join(outputDir, manifest.reportFileName ?? 'duration-report.json');
const force = process.argv.includes('--force');
const reportOnly = process.argv.includes('--report-only');
const compactOnly = process.argv.includes('--compact-only');
const cutArg = process.argv.find((argument) => argument.startsWith('--cut='));
const selectedCutId = cutArg?.slice('--cut='.length);

const parseEnv = (source) => {
  const values = {};
  for (const rawLine of source.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
};

const loadApiKey = async () => {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const candidates = [
    path.join(projectRoot, '.env'),
    path.join(projectRoot, 'key.env'),
    path.resolve(projectRoot, '..', '..', '.env'),
  ];
  for (const envPath of candidates) {
    try {
      const source = await readFile(envPath, 'utf8');
      const values = parseEnv(source);
      if (values.OPENAI_API_KEY) return values.OPENAI_API_KEY;
      if (path.basename(envPath) === 'key.env' && /^sk-/u.test(source.trim())) return source.trim();
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  throw new Error('OPENAI_API_KEY が環境変数、.env、key.envのいずれにも見つかりません。');
};

const fileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const wavDurationSeconds = (buffer) => {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('WAVヘッダーを認識できません。');
  }
  let offset = 12;
  let byteRate;
  let dataSize;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    if (chunkId === 'fmt ' && chunkSize >= 16) byteRate = buffer.readUInt32LE(dataOffset + 8);
    if (chunkId === 'data') {
      dataSize = Math.min(chunkSize, buffer.length - dataOffset);
      break;
    }
    offset = dataOffset + chunkSize + (chunkSize % 2);
  }
  if (!byteRate || dataSize === undefined) throw new Error('WAVのfmt/dataチャンクを認識できません。');
  return dataSize / byteRate;
};

const apiKey = reportOnly || compactOnly ? undefined : await loadApiKey();
await mkdir(outputDir, {recursive: true});
await mkdir(rawOutputDir, {recursive: true});
const compactionStatsByCut = new Map();

const syncNarrationTiming = () => {
  const fps = manifest.fps ?? 30;
  const tailPaddingSeconds = manifest.tailPaddingSeconds ?? 0.35;
  let startFrame = 0;

  for (const cut of manifest.cuts) {
    const measured = cut.measuredDurationSeconds;
    cut.startFrame = startFrame;
    if (Number.isFinite(measured)) {
      const audioAlignedFrames = Math.ceil((measured + tailPaddingSeconds) * fps);
      cut.durationFrames = Math.max(cut.minimumDurationFrames ?? 0, audioAlignedFrames);
    }
    cut.targetSeconds = Number((cut.durationFrames / fps).toFixed(3));
    startFrame += cut.durationFrames;
  }
};

const report = {
  generatedAt: new Date().toISOString(),
  model: manifest.model,
  voice: manifest.voice,
  speed: manifest.speed ?? 1,
  fps: manifest.fps ?? 30,
  tailPaddingSeconds: manifest.tailPaddingSeconds ?? 0.35,
  silenceCompaction: manifest.silenceCompaction,
  cuts: [],
};

const selectedCuts = selectedCutId
  ? manifest.cuts.filter((cut) => cut.id === selectedCutId)
  : manifest.cuts;

if (selectedCutId && selectedCuts.length === 0) {
  throw new Error(`指定されたカットが見つかりません: ${selectedCutId}`);
}

for (const cut of selectedCuts) {
  const outputPath = path.join(outputDir, `${cut.id}.wav`);
  let buffer;
  if (reportOnly) {
    if (!await fileExists(outputPath)) throw new Error(`${cut.id}.wav が見つかりません。`);
    buffer = await readFile(outputPath);
  } else if (compactOnly) {
    const rawPath = path.join(rawOutputDir, `${cut.id}.wav`);
    if (!await fileExists(rawPath)) throw new Error(`${cut.id}の未加工WAVが見つかりません。`);
    const rawBuffer = await readFile(rawPath);
    const compacted = compactPcmWavSilence(rawBuffer, {
      ...manifest.silenceCompaction,
      ...cut.silenceCompaction,
    });
    buffer = compacted.buffer;
    compactionStatsByCut.set(cut.id, compacted.stats);
    await writeFile(outputPath, buffer);
  } else if (!force && await fileExists(outputPath)) {
    buffer = await readFile(outputPath);
  } else {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: manifest.model,
        voice: manifest.voice,
        speed: cut.speed ?? manifest.speed,
        input: cut.ttsText ?? cut.text,
        instructions: `${manifest.commonInstructions}${cut.instructions}`,
        response_format: manifest.responseFormat,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`${cut.id} の音声生成に失敗しました (${response.status}): ${detail}`);
    }
    buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(path.join(rawOutputDir, `${cut.id}.wav`), buffer);
    const compacted = compactPcmWavSilence(buffer, {
      ...manifest.silenceCompaction,
      ...cut.silenceCompaction,
    });
    buffer = compacted.buffer;
    compactionStatsByCut.set(cut.id, compacted.stats);
    await writeFile(outputPath, buffer);
  }

  const durationSeconds = wavDurationSeconds(buffer);
  const item = {
    id: cut.id,
    file: `${outputRelativePath.replaceAll('\\', '/')}/${cut.id}.wav`,
    speed: cut.speed ?? manifest.speed ?? 1,
    durationSeconds: Number(durationSeconds.toFixed(3)),
  };
  const compactionStats = compactionStatsByCut.get(cut.id);
  if (compactionStats) {
    item.silenceRemovedSeconds = Number(compactionStats.removedSeconds.toFixed(3));
    item.silenceInsertedSeconds = Number((compactionStats.insertedSeconds ?? 0).toFixed(3));
    item.compactedSpanCount = compactionStats.compactedSpanCount;
    item.normalizedSentenceSpanCount = compactionStats.normalizedSentenceSpanCount ?? 0;
    item.normalizedCustomSpanCount = compactionStats.normalizedCustomSpanCount ?? 0;
    console.log(
      `${cut.id}: compacted ${item.compactedSpanCount} pauses`
      + ` / normalized ${item.normalizedSentenceSpanCount} sentence pauses`
      + ` / aligned ${item.normalizedCustomSpanCount} scheduled pauses`
      + ` / removed ${item.silenceRemovedSeconds}s`
      + ` / inserted ${item.silenceInsertedSeconds}s`,
    );
  }
  cut.measuredDurationSeconds = item.durationSeconds;
  report.cuts.push(item);
}

syncNarrationTiming();
for (const item of report.cuts) {
  const cut = manifest.cuts.find((candidate) => candidate.id === item.id);
  const targetSeconds = cut.durationFrames / (manifest.fps ?? 30);
  const overflowSeconds = Math.max(0, item.durationSeconds - targetSeconds);
  item.startFrame = cut.startFrame;
  item.durationFrames = cut.durationFrames;
  item.targetSeconds = Number(targetSeconds.toFixed(3));
  item.overflowSeconds = Number(overflowSeconds.toFixed(3));
  item.fits = overflowSeconds <= 0.05;
  console.log(`${item.id}: ${item.durationSeconds}s audio / ${item.targetSeconds}s video / ${item.fits ? 'FIT' : `OVER ${item.overflowSeconds}s`}`);
}

if (!reportOnly) {
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`report: ${reportPath}`);
