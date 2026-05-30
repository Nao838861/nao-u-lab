#!/usr/bin/env node
// build_proxy_csv.js — log_autonomous_game v003 Phase 4 (C269 / C271 マルチシード化)
//
// 役割:
//   (1) agent_difficulty_proxy.js を実行して trials の JSON を取得
//   (2) 各 trial を 1 行 jsonl に展開して measurements.jsonl / measurements_multiseed.jsonl を書く
//   (3) self_judgment 暫定値 (v003) を行毎定数列として結合し、
//       proxy_vs_judgment.csv / proxy_vs_judgment_multiseed.csv を出力
//
// CLI:
//   node build_proxy_csv.js                      — 単一 SEED モード (旧来動作、30 行)
//   node build_proxy_csv.js --multiseed          — マルチシード 10 SEED × 30 trial = 300 行
//   node build_proxy_csv.js --multiseed --noise-scale 1.5
//                                                 — noise 振幅指定 (default 1.5, agent 側 default は 0.25)
//
// C271 Phase 4 (2026-05-30) 新設:
//   - --multiseed フラグで 10 SEED ループ (SEED ∈ {1000000, 2000000, ..., 10000000})
//   - --noise-scale で agent_difficulty_proxy.js に --noise-scale 引数を伝播
//   - measurements_multiseed.jsonl (300 行) / proxy_vs_judgment_multiseed.csv (300 行) 出力
//   - proxy 4 列の std を 300 行で計算し標準出力に出す (Pearson 計算前提 1/3 = proxy 側分散獲得 の検証)
//
// proxy 4 列の意味:
//   proxy_clear_rate     — 1 trial 内 survived フラグ (0/1)。1-hit kill のため binary
//   proxy_damage_per_min — 死亡時 60/play_time_sec, 生存時 0。被弾頻度の代理
//   proxy_survival_time  — play_time_sec
//   proxy_input_density  — cast_count / play_time_sec * 60 (cast/min)
//
// self_judgment 列 (v003 暫定、起点 = v002/self_judgment.md + v003/self_judgment.md C268):
//   q_a=5 / q_intro=4.5 / q_success_fb=3 / q_d=4.0 (C268暫定) / q_c=4.5 / q_e=5

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROXY = path.join(__dirname, 'agent_difficulty_proxy.js');

const JUDGMENT = {
  q_a: 5,
  q_intro: 4.5,
  q_success_fb: 3,
  q_d: 4.0,
  q_c: 4.5,
  q_e: 5,
};

function parseArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx === process.argv.length - 1) return fallback;
  const v = process.argv[idx + 1];
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function hasFlag(name) {
  return process.argv.includes(name);
}

function runProxy(seedBase, noiseScale) {
  const args = [PROXY, '--seed-base', String(seedBase), '--noise-scale', String(noiseScale)];
  const stdout = execFileSync(process.execPath, args, {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  const report = JSON.parse(stdout);
  if (!Array.isArray(report.all_trials) || report.all_trials.length !== 30) {
    throw new Error(`expected 30 trials, got ${report.all_trials && report.all_trials.length}`);
  }
  return report.all_trials;
}

function trialToJsonl(t, seedBase) {
  return JSON.stringify({
    seed_base: seedBase,
    run_id: t.seed,
    outcome: t.outcome,
    death_cause: t.death_cause,
    clear_wave: t.clear_wave,
    residual_hp_ratio: t.residual_hp_ratio,
    play_time_sec: t.play_time_sec,
    graze_count: t.graze_count,
    cast_count: t.cast_count,
    lock_hit: t.lock_hit,
    lock_miss: t.lock_miss,
  });
}

function trialToCsvRow(t, seedBase) {
  const survived = t.outcome === 'survived' ? 1 : 0;
  const damagePerMin = survived ? 0 : Number((60 / t.play_time_sec).toFixed(4));
  const inputDensity = t.play_time_sec > 0
    ? Number((t.cast_count / t.play_time_sec * 60).toFixed(4))
    : 0;
  return [
    seedBase,
    t.seed,
    survived,
    damagePerMin,
    t.play_time_sec,
    inputDensity,
    JUDGMENT.q_a,
    JUDGMENT.q_intro,
    JUDGMENT.q_success_fb,
    JUDGMENT.q_d,
    JUDGMENT.q_c,
    JUDGMENT.q_e,
  ].join(',');
}

function std(arr) {
  const n = arr.length;
  if (n === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const v = arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n;
  return Math.sqrt(v);
}

function singleSeedMode() {
  // 旧来動作 (build_proxy_csv.js の互換性維持). 30 行のみ。
  const OUT_JSONL = path.join(__dirname, 'measurements.jsonl');
  const OUT_CSV = path.join(__dirname, 'proxy_vs_judgment.csv');
  const trials = runProxy(20260527, 0.25);
  const jsonlLines = trials.map(t => trialToJsonl(t, 20260527));
  fs.writeFileSync(OUT_JSONL, jsonlLines.join('\n') + '\n');
  const header = [
    'seed_base', 'run_id', 'proxy_clear_rate', 'proxy_damage_per_min', 'proxy_survival_time', 'proxy_input_density',
    'q_a', 'q_intro', 'q_success_fb', 'q_d', 'q_c', 'q_e',
  ];
  const rows = trials.map(t => trialToCsvRow(t, 20260527));
  fs.writeFileSync(OUT_CSV, [header.join(','), ...rows].join('\n') + '\n');
  console.log(JSON.stringify({
    mode: 'single',
    wrote_jsonl: path.relative(process.cwd(), OUT_JSONL),
    wrote_csv: path.relative(process.cwd(), OUT_CSV),
    trials: trials.length,
  }, null, 2));
}

function multiseedMode() {
  const noiseScale = parseArg('--noise-scale', 1.5);
  const seedBases = [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000];
  const OUT_JSONL = path.join(__dirname, 'measurements_multiseed.jsonl');
  const OUT_CSV = path.join(__dirname, 'proxy_vs_judgment_multiseed.csv');

  const allRowsJsonl = [];
  const allRowsCsv = [];
  for (const seedBase of seedBases) {
    process.stderr.write(`[multiseed] running seed_base=${seedBase} noise_scale=${noiseScale}...\n`);
    const trials = runProxy(seedBase, noiseScale);
    for (const t of trials) {
      allRowsJsonl.push(trialToJsonl(t, seedBase));
      allRowsCsv.push(trialToCsvRow(t, seedBase));
    }
  }

  const header = [
    'seed_base', 'run_id', 'proxy_clear_rate', 'proxy_damage_per_min', 'proxy_survival_time', 'proxy_input_density',
    'q_a', 'q_intro', 'q_success_fb', 'q_d', 'q_c', 'q_e',
  ];
  fs.writeFileSync(OUT_JSONL, allRowsJsonl.join('\n') + '\n');
  fs.writeFileSync(OUT_CSV, [header.join(','), ...allRowsCsv].join('\n') + '\n');

  // std 計算 (300 行)
  const parseCsvRowVals = (row) => row.split(',').map(Number);
  const vals = allRowsCsv.map(parseCsvRowVals);
  const stdClear = std(vals.map(r => r[2]));
  const stdDmg = std(vals.map(r => r[3]));
  const stdSurv = std(vals.map(r => r[4]));
  const stdInput = std(vals.map(r => r[5]));
  const stdsByColumn = {
    proxy_clear_rate: stdClear,
    proxy_damage_per_min: stdDmg,
    proxy_survival_time: stdSurv,
    proxy_input_density: stdInput,
  };
  const variancePassed = stdClear > 0 || stdDmg > 0 || stdSurv > 0 || stdInput > 0;

  console.log(JSON.stringify({
    mode: 'multiseed',
    noise_scale: noiseScale,
    seed_bases: seedBases,
    total_trials: allRowsCsv.length,
    wrote_jsonl: path.relative(process.cwd(), OUT_JSONL),
    wrote_csv: path.relative(process.cwd(), OUT_CSV),
    stds: stdsByColumn,
    variance_check_passed: variancePassed,
    variance_check_rule: 'std(proxy_clear_rate) > 0 OR std(proxy_damage_per_min) > 0 OR std(proxy_survival_time) > 0 OR std(proxy_input_density) > 0',
  }, null, 2));

  if (!variancePassed) process.exit(2);
}

function main() {
  if (hasFlag('--multiseed')) {
    multiseedMode();
  } else {
    singleSeedMode();
  }
}

main();
