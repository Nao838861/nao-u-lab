import {readFile, writeFile, mkdir, access} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const manifestPath = path.join(projectRoot, 'narration', 'prototype-cuts.json');
const outputDir = path.join(projectRoot, 'public', 'narration');
const reportPath = path.join(outputDir, 'duration-report.json');
const force = process.argv.includes('--force');
const reportOnly = process.argv.includes('--report-only');

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

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const apiKey = reportOnly ? undefined : await loadApiKey();
await mkdir(outputDir, {recursive: true});

const report = {
  generatedAt: new Date().toISOString(),
  model: manifest.model,
  voice: manifest.voice,
  cuts: [],
};

for (const cut of manifest.cuts) {
  const outputPath = path.join(outputDir, `${cut.id}.wav`);
  let buffer;
  if (reportOnly) {
    if (!await fileExists(outputPath)) throw new Error(`${cut.id}.wav が見つかりません。`);
    buffer = await readFile(outputPath);
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
        input: cut.text,
        instructions: `${manifest.commonInstructions}${cut.instructions}`,
        response_format: manifest.responseFormat,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`${cut.id} の音声生成に失敗しました (${response.status}): ${detail}`);
    }
    buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(outputPath, buffer);
  }

  const durationSeconds = wavDurationSeconds(buffer);
  const overflowSeconds = Math.max(0, durationSeconds - cut.targetSeconds);
  const item = {
    id: cut.id,
    file: `narration/${cut.id}.wav`,
    targetSeconds: cut.targetSeconds,
    durationSeconds: Number(durationSeconds.toFixed(3)),
    overflowSeconds: Number(overflowSeconds.toFixed(3)),
    fits: overflowSeconds <= 0.05,
  };
  report.cuts.push(item);
  console.log(`${cut.id}: ${item.durationSeconds}s / target ${cut.targetSeconds}s / ${item.fits ? 'FIT' : `OVER ${item.overflowSeconds}s`}`);
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`report: ${reportPath}`);
