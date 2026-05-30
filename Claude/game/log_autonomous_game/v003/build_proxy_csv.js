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
//   node build_proxy_csv.js --labeled            — v001/v002/v003 ラベル付き 900 行
//                                                 (10 SEED × 30 trial × 3 version、judgment 列を version 別に転記)
//
// C272 Phase 4 (2026-05-31) 新設:
//   - --labeled フラグで v_label カラム + JUDGMENT_BY_VERSION 経路を有効化
//   - 出力: proxy_vs_judgment_labeled.csv (900 行) + measurements_labeled.jsonl (900 行)
//   - judgment 6 列の std を計算し >0 列数を報告 (Pearson 計算前提 2/3 = judgment 側分散獲得 の検証)
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
// JUDGMENT_BY_VERSION (出典は本ファイル下記 dict 参照、projects/log_autonomous_game.md §fun_score §2 headline 値):
//   v001: 20.5/25 (5 軸、Q-C 軸未設定) — v001/self_judgment.md §7b 新合計
//   v002: 26.5/30 (Q-C 軸新設後) — v002/self_judgment.md §1 新合計
//   v003: 26.5/30 暫定継続 (実機判定到達まで) — feedback_headless_unfit_for_unfinished_eval.md T:5 順守

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROXY = path.join(__dirname, 'agent_difficulty_proxy.js');

// 単一 SEED モード / 旧 multiseed モード で使う v003 暫定値 (後方互換維持)。
// 新 --labeled モードは JUDGMENT_BY_VERSION を参照する。
const JUDGMENT = {
  q_a: 5,
  q_intro: 4.5,
  q_success_fb: 3,
  q_d: 4.0,
  q_c: 4.5,
  q_e: 5,
};

// version 別判定値 (--labeled モード用、Pearson 前提 2/3 解消の素データ源)
// 出典:
//   v001 — game/log_autonomous_game/v001/self_judgment.md §7b 新合計 20.5/25 (Q-C 軸未設定)
//   v002 — game/log_autonomous_game/v002/self_judgment.md §1 新合計 26.5/30
//   v003 — projects/log_autonomous_game.md §fun_score §2 v002 値暫定継続 26.5/30
//          (実機判定到達まで暫定、feedback_headless_unfit_for_unfinished_eval.md T:5 順守)
const JUDGMENT_BY_VERSION = {
  v001: { q_a: 5,   q_intro: 4,   q_success_fb: 3, q_d: 3.5, q_c: null, q_e: 5 },
  v002: { q_a: 5,   q_intro: 4.5, q_success_fb: 3, q_d: 4.5, q_c: 4.5,  q_e: 5 },
  v003: { q_a: 5,   q_intro: 4.5, q_success_fb: 3, q_d: 4.5, q_c: 4.5,  q_e: 5 },
};

const JUDGMENT_TOTAL_BY_VERSION = {
  v001: '20.5/25',
  v002: '26.5/30',
  v003: '26.5/30 (暫定継続)',
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

function trialToLabeledCsvRow(t, seedBase, vLabel) {
  const survived = t.outcome === 'survived' ? 1 : 0;
  const damagePerMin = survived ? 0 : Number((60 / t.play_time_sec).toFixed(4));
  const inputDensity = t.play_time_sec > 0
    ? Number((t.cast_count / t.play_time_sec * 60).toFixed(4))
    : 0;
  const j = JUDGMENT_BY_VERSION[vLabel];
  const fmt = (x) => (x === null || x === undefined) ? '' : x;
  return [
    seedBase,
    vLabel,
    t.seed,
    survived,
    damagePerMin,
    t.play_time_sec,
    inputDensity,
    fmt(j.q_a),
    fmt(j.q_intro),
    fmt(j.q_success_fb),
    fmt(j.q_d),
    fmt(j.q_c),
    fmt(j.q_e),
  ].join(',');
}

function trialToLabeledJsonl(t, seedBase, vLabel) {
  return JSON.stringify({
    seed_base: seedBase,
    v_label: vLabel,
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

function labeledMode() {
  const noiseScale = parseArg('--noise-scale', 1.5);
  const seedBases = [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000];
  const versions = ['v001', 'v002', 'v003'];
  const OUT_JSONL = path.join(__dirname, 'measurements_labeled.jsonl');
  const OUT_CSV = path.join(__dirname, 'proxy_vs_judgment_labeled.csv');

  const allRowsJsonl = [];
  const allRowsCsv = [];

  // proxy 計測は version 不変 (本サイクル時点で agent_difficulty_proxy.js は v003 内常駐、game/proxy
  // ロジックは v001/v002/v003 で同一の素朴良手 agent 経路を踏む)。同一 trials を 3 version 分複製し、
  // judgment 列だけ version 別に差し替えることで「judgment 側分散獲得」に絞った素データを作る。
  for (const seedBase of seedBases) {
    process.stderr.write(`[labeled] running seed_base=${seedBase} noise_scale=${noiseScale}...\n`);
    const trials = runProxy(seedBase, noiseScale);
    for (const t of trials) {
      for (const vLabel of versions) {
        allRowsJsonl.push(trialToLabeledJsonl(t, seedBase, vLabel));
        allRowsCsv.push(trialToLabeledCsvRow(t, seedBase, vLabel));
      }
    }
  }

  const header = [
    'seed_base', 'v_label', 'run_id',
    'proxy_clear_rate', 'proxy_damage_per_min', 'proxy_survival_time', 'proxy_input_density',
    'q_a', 'q_intro', 'q_success_fb', 'q_d', 'q_c', 'q_e',
  ];
  fs.writeFileSync(OUT_JSONL, allRowsJsonl.join('\n') + '\n');
  fs.writeFileSync(OUT_CSV, [header.join(','), ...allRowsCsv].join('\n') + '\n');

  // std 計算 — proxy 4 列 + judgment 6 列
  const parseCsvRowVals = (row) => row.split(',').map(s => s === '' ? NaN : Number(s));
  const vals = allRowsCsv.map(parseCsvRowVals);

  const colName = ['seed_base', 'v_label', 'run_id',
    'proxy_clear_rate', 'proxy_damage_per_min', 'proxy_survival_time', 'proxy_input_density',
    'q_a', 'q_intro', 'q_success_fb', 'q_d', 'q_c', 'q_e'];

  const stdsByColumn = {};
  const finiteCountByColumn = {};
  for (const colIdx of [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    const arr = vals.map(r => r[colIdx]).filter(x => Number.isFinite(x));
    stdsByColumn[colName[colIdx]] = Number(std(arr).toFixed(6));
    finiteCountByColumn[colName[colIdx]] = arr.length;
  }

  const judgmentCols = ['q_a', 'q_intro', 'q_success_fb', 'q_d', 'q_c', 'q_e'];
  const judgmentStdGtZeroCount = judgmentCols.filter(c => stdsByColumn[c] > 0).length;

  // Pearson 前提 2/3 の判定: 完遂定義 2「judgment 6 列のうち少なくとも 2 列で std > 0」
  const variancePassed = judgmentStdGtZeroCount >= 2;

  console.log(JSON.stringify({
    mode: 'labeled',
    noise_scale: noiseScale,
    seed_bases: seedBases,
    versions: versions,
    judgment_total_by_version: JUDGMENT_TOTAL_BY_VERSION,
    total_rows: allRowsCsv.length,
    wrote_jsonl: path.relative(process.cwd(), OUT_JSONL),
    wrote_csv: path.relative(process.cwd(), OUT_CSV),
    stds: stdsByColumn,
    finite_count: finiteCountByColumn,
    judgment_std_gt_zero_count: judgmentStdGtZeroCount,
    variance_check_passed: variancePassed,
    variance_check_rule: 'judgment 列 (q_a/q_intro/q_success_fb/q_d/q_c/q_e) のうち std > 0 の列が 2 以上',
  }, null, 2));

  if (!variancePassed) process.exit(2);
}

function main() {
  if (hasFlag('--labeled')) {
    labeledMode();
  } else if (hasFlag('--multiseed')) {
    multiseedMode();
  } else {
    singleSeedMode();
  }
}

main();
