import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const parsePcmWav = (buffer) => {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('WAVヘッダーを認識できません。');
  }

  let offset = 12;
  let format;
  let data;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const payloadOffset = offset + 8;
    if (id === 'fmt ' && size >= 16) {
      format = {
        audioFormat: buffer.readUInt16LE(payloadOffset),
        channels: buffer.readUInt16LE(payloadOffset + 2),
        sampleRate: buffer.readUInt32LE(payloadOffset + 4),
        blockAlign: buffer.readUInt16LE(payloadOffset + 12),
        bitsPerSample: buffer.readUInt16LE(payloadOffset + 14),
      };
    }
    if (id === 'data') {
      data = {
        headerOffset: offset,
        offset: payloadOffset,
        size: Math.min(size, buffer.length - payloadOffset),
      };
      break;
    }
    offset = payloadOffset + size + (size % 2);
  }

  if (!format || !data) throw new Error('WAVのfmt/dataチャンクを認識できません。');
  if (format.audioFormat !== 1 || format.bitsPerSample !== 16) {
    throw new Error(`16-bit PCM WAVだけを処理できます: format=${format.audioFormat}, bits=${format.bitsPerSample}`);
  }
  return {...format, data};
};

export const analyzePcmWavSilence = (buffer, options = {}) => {
  const wav = parsePcmWav(buffer);
  const windowMs = options.windowMs ?? 5;
  const thresholdDb = options.thresholdDb ?? -44;
  const framesPerWindow = Math.max(1, Math.round(wav.sampleRate * windowMs / 1000));
  const totalFrames = Math.floor(wav.data.size / wav.blockAlign);
  const threshold = 32767 * 10 ** (thresholdDb / 20);
  const silentWindows = [];

  for (let startFrame = 0; startFrame < totalFrames; startFrame += framesPerWindow) {
    const endFrame = Math.min(totalFrames, startFrame + framesPerWindow);
    let sumSquares = 0;
    let sampleCount = 0;
    for (let frame = startFrame; frame < endFrame; frame += 1) {
      const frameOffset = wav.data.offset + frame * wav.blockAlign;
      for (let channel = 0; channel < wav.channels; channel += 1) {
        const sample = buffer.readInt16LE(frameOffset + channel * 2);
        sumSquares += sample * sample;
        sampleCount += 1;
      }
    }
    const rms = Math.sqrt(sumSquares / sampleCount);
    silentWindows.push({startFrame, endFrame, silent: rms <= threshold});
  }

  const spans = [];
  let active;
  for (const window of silentWindows) {
    if (window.silent && !active) active = {startFrame: window.startFrame, endFrame: window.endFrame};
    else if (window.silent) active.endFrame = window.endFrame;
    else if (active) {
      spans.push(active);
      active = undefined;
    }
  }
  if (active) spans.push(active);

  return {
    ...wav,
    durationSeconds: totalFrames / wav.sampleRate,
    totalFrames,
    thresholdDb,
    windowMs,
    spans: spans.map((span) => ({
      ...span,
      startSeconds: span.startFrame / wav.sampleRate,
      endSeconds: span.endFrame / wav.sampleRate,
      durationMs: (span.endFrame - span.startFrame) / wav.sampleRate * 1000,
    })),
  };
};

export const compactPcmWavSilence = (buffer, options = {}) => {
  const analysis = analyzePcmWavSilence(buffer, options);
  const minimumSilenceMs = options.minimumSilenceMs ?? 90;
  const maximumInternalSilenceMs = options.maximumInternalSilenceMs ?? 80;
  const maximumCommaSilenceMs = options.maximumCommaSilenceMs ?? 180;
  const sentenceSilenceThresholdMs = options.sentenceSilenceThresholdMs ?? 450;
  const maximumSentenceSilenceMs = options.maximumSentenceSilenceMs ?? 140;
  const maximumLeadingSilenceMs = options.maximumLeadingSilenceMs ?? 20;
  const maximumTrailingSilenceMs = options.maximumTrailingSilenceMs ?? 80;
  const normalizeSentenceSilence = options.normalizeSentenceSilence ?? false;
  const commaPauseCandidateIndices = new Set(options.commaPauseCandidateIndices ?? []);
  const removals = [];
  const insertions = [];
  let candidateIndex = -1;

  for (const span of analysis.spans) {
    if (span.durationMs < minimumSilenceMs) continue;
    candidateIndex += 1;
    const isLeading = span.startFrame === 0;
    const isTrailing = span.endFrame === analysis.totalFrames;
    const isCommaPause = commaPauseCandidateIndices.has(candidateIndex);
    const isSentencePause = !isLeading
      && !isTrailing
      && !isCommaPause
      && span.durationMs >= sentenceSilenceThresholdMs;
    const maximumMs = isLeading
      ? maximumLeadingSilenceMs
      : isTrailing
        ? maximumTrailingSilenceMs
        : isCommaPause
          ? maximumCommaSilenceMs
          : isSentencePause
            ? maximumSentenceSilenceMs
            : maximumInternalSilenceMs;
    const maximumFrames = Math.round(analysis.sampleRate * maximumMs / 1000);
    const spanFrames = span.endFrame - span.startFrame;
    if (isSentencePause && normalizeSentenceSilence && spanFrames < maximumFrames) {
      insertions.push({
        atFrame: Math.round((span.startFrame + span.endFrame) / 2),
        insertedFrames: maximumFrames - spanFrames,
      });
      continue;
    }
    if (spanFrames <= maximumFrames) continue;

    const keptBefore = isLeading ? 0 : Math.floor(maximumFrames / 2);
    const keptAfter = isTrailing ? 0 : maximumFrames - keptBefore;
    removals.push({
      startFrame: span.startFrame + keptBefore,
      endFrame: span.endFrame - keptAfter,
      originalDurationMs: span.durationMs,
      compactedDurationMs: maximumMs,
      pauseKind: isLeading
        ? 'leading'
        : isTrailing
          ? 'trailing'
          : isCommaPause
            ? 'comma'
            : isSentencePause
              ? 'sentence'
              : 'internal',
    });
  }

  const audioParts = [];
  let cursorFrame = 0;
  const operations = [
    ...removals.map((removal) => ({
      startFrame: removal.startFrame,
      endFrame: removal.endFrame,
      insertedFrames: 0,
    })),
    ...insertions.map((insertion) => ({
      startFrame: insertion.atFrame,
      endFrame: insertion.atFrame,
      insertedFrames: insertion.insertedFrames,
    })),
  ].sort((left, right) => left.startFrame - right.startFrame);
  for (const operation of operations) {
    const startByte = analysis.data.offset + cursorFrame * analysis.blockAlign;
    const endByte = analysis.data.offset + operation.startFrame * analysis.blockAlign;
    audioParts.push(buffer.subarray(startByte, endByte));
    if (operation.insertedFrames > 0) {
      audioParts.push(Buffer.alloc(operation.insertedFrames * analysis.blockAlign));
    }
    cursorFrame = operation.endFrame;
  }
  audioParts.push(buffer.subarray(
    analysis.data.offset + cursorFrame * analysis.blockAlign,
    analysis.data.offset + analysis.data.size,
  ));

  let compactedAudio = Buffer.concat(audioParts);
  if (compactedAudio.length % 2) compactedAudio = Buffer.concat([compactedAudio, Buffer.alloc(1)]);
  const header = Buffer.from(buffer.subarray(0, analysis.data.offset));
  header.writeUInt32LE(compactedAudio.length, analysis.data.headerOffset + 4);
  const trailing = buffer.subarray(analysis.data.offset + analysis.data.size);
  const output = Buffer.concat([header, compactedAudio, trailing]);
  output.writeUInt32LE(output.length - 8, 4);

  const removedFrames = removals.reduce(
    (sum, removal) => sum + removal.endFrame - removal.startFrame,
    0,
  );
  const insertedFrames = insertions.reduce(
    (sum, insertion) => sum + insertion.insertedFrames,
    0,
  );
  return {
    buffer: output,
    stats: {
      originalDurationSeconds: analysis.durationSeconds,
      compactedDurationSeconds: (analysis.totalFrames - removedFrames + insertedFrames) / analysis.sampleRate,
      removedSeconds: removedFrames / analysis.sampleRate,
      insertedSeconds: insertedFrames / analysis.sampleRate,
      compactedSpanCount: removals.length,
      normalizedSentenceSpanCount: insertions.length,
      removals,
      insertions,
    },
  };
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, '..');
  const manifestArg = process.argv.find((argument) => argument.startsWith('--manifest='));
  const manifestFileName = manifestArg?.slice('--manifest='.length) ?? 'prototype-cuts.json';
  const manifest = JSON.parse(await readFile(path.resolve(projectRoot, 'narration', manifestFileName), 'utf8'));
  const outputRelativePath = manifest.outputDirectory ?? 'narration';
  const analyzeOnly = process.argv.includes('--analyze');
  const analyzeRaw = process.argv.includes('--raw');
  const selectedCut = process.argv.find((argument) => argument.startsWith('--cut='))?.slice('--cut='.length);
  const cuts = selectedCut ? manifest.cuts.filter((cut) => cut.id === selectedCut) : manifest.cuts;
  if (cuts.length === 0) throw new Error(`指定されたカットが見つかりません: ${selectedCut}`);

  for (const cut of cuts) {
    const filePath = path.join(
      projectRoot,
      'public',
      outputRelativePath,
      ...(analyzeRaw ? ['raw', `${cut.id}.wav`] : [`${cut.id}.wav`]),
    );
    const source = await readFile(filePath);
    if (analyzeOnly) {
      const options = {...manifest.silenceCompaction, ...cut.silenceCompaction};
      const analysis = analyzePcmWavSilence(source, options);
      const longSpans = analysis.spans.filter((span) => span.durationMs >= 60);
      console.log(`${cut.id}: ${analysis.durationSeconds.toFixed(3)}s, silence >=60ms: ${longSpans.length}`);
      for (const span of longSpans) {
        console.log(`  ${span.startSeconds.toFixed(3)}-${span.endSeconds.toFixed(3)}s (${span.durationMs.toFixed(0)}ms)`);
      }
    } else {
      const options = {...manifest.silenceCompaction, ...cut.silenceCompaction};
      const result = compactPcmWavSilence(source, options);
      await writeFile(filePath, result.buffer);
      console.log(`${cut.id}: removed ${result.stats.removedSeconds.toFixed(3)}s from ${result.stats.compactedSpanCount} spans`);
    }
  }
}
