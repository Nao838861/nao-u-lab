#!/usr/bin/env node
// build_instinct_multiseed.js — kaizen #137 真の段階2: 本能側列 5 列化のための素データ生成 (C285 Phase 4)
//
// 役割:
//   instinct_probe.js を 10 seed_base (1M..10M) × 30 trial 走らせて、各行に
//   probe_density (本能側応答密度の代理) を含む JSONL を生成する。
//   出力ファイル: measurements_instinct_multiseed.jsonl
//
// proxy_icc_diagnose.py が PROXY_COLUMNS = [...4 列..., proxy_instinct_response_density] を
// 5 列で ICC 計算するための素データ源 (build_proxy_csv.js の multiseed と class 軸構造を揃え、
// seed_base 軸で 10 group × 30 trial に集約)。
//
// 既存 measurements_multiseed.jsonl (build_proxy_csv.js --multiseed 出力) との関係:
//   - 同じ seed_base 列構造 (10 seed × 30 trial = 300 行)、ただし agent は instinct_probe.js
//     の素朴良手 (trail-based ECHO 経路あり) に固定 (naive_good 戦略)
//   - probe_density 列が追加されている点が違い (proxy 4 列も同 jsonl から再 derive 可能)
//
// CLI:
//   node build_instinct_multiseed.js
//   node build_instinct_multiseed.js --trials 30 --strategy naive_good
//
// 設計判断 (C285 Phase 4):
//   instinct_probe.js を child_process 経由で reuse する形を取り、コード複製を避けた。
//   駆動側の seed_base リストは build_proxy_csv.js --multiseed と意図的に同一値を採用し、
//   将来 proxy 系データと結合した analysis をする時の class 軸を一致させた。

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROBE = path.join(__dirname, 'instinct_probe.js');
const OUT = path.join(__dirname, 'measurements_instinct_multiseed.jsonl');

const SEED_BASES = [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000];

function parseArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx === process.argv.length - 1) return fallback;
  return process.argv[idx + 1];
}

const TRIALS = Number(parseArg('--trials', '30'));
const STRATEGY = parseArg('--strategy', 'naive_good');

if (!Number.isFinite(TRIALS) || TRIALS <= 0) {
  process.stderr.write(`[ERROR] --trials must be positive integer, got: ${TRIALS}\n`);
  process.exit(1);
}

const allLines = [];
for (const sb of SEED_BASES) {
  process.stderr.write(`[instinct-multiseed] seed_base=${sb} trials=${TRIALS} strategy=${STRATEGY}...\n`);
  const stdout = execFileSync(
    process.execPath,
    [PROBE, '--seed-base', String(sb), '--trials', String(TRIALS), '--strategy', STRATEGY],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
  );
  const lines = stdout.trim().split('\n').filter(s => s.length > 0);
  if (lines.length !== TRIALS) {
    throw new Error(`expected ${TRIALS} lines for seed_base=${sb}, got ${lines.length}`);
  }
  for (const line of lines) allLines.push(line);
}

fs.writeFileSync(OUT, allLines.join('\n') + '\n');

console.log(JSON.stringify({
  mode: 'instinct-multiseed',
  seed_bases: SEED_BASES,
  trials_per_seed: TRIALS,
  total_trials: allLines.length,
  strategy: STRATEGY,
  out_jsonl: path.relative(process.cwd(), OUT),
}, null, 2));
