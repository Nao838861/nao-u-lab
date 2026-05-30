#!/usr/bin/env node
// build_proxy_csv.js — log_autonomous_game v003 Phase 4 (C269) 中間成果物生成
//
// 役割:
//   (1) agent_difficulty_proxy.js を実行して 30 trials の JSON を取得
//   (2) 各 trial を 1 行 jsonl に展開して `measurements.jsonl` を書く (30 行)
//   (3) self_judgment 暫定値 (v003) を行毎定数列として結合し、
//       `proxy_vs_judgment.csv` を 1 ヘッダ + 30 データ行で出力
//
// 中間 csv は Pearson 相関第 1 回計算の準備基盤。実機判定値が確定したら
// q_d / q_success_fb / q_c の列を更新するだけで再計算可能な構造にしてある。
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
const OUT_JSONL = path.join(__dirname, 'measurements.jsonl');
const OUT_CSV = path.join(__dirname, 'proxy_vs_judgment.csv');

const JUDGMENT = {
  q_a: 5,
  q_intro: 4.5,
  q_success_fb: 3,
  q_d: 4.0,
  q_c: 4.5,
  q_e: 5,
};

function main() {
  const stdout = execFileSync(process.execPath, [PROXY], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  const report = JSON.parse(stdout);
  if (!Array.isArray(report.all_trials) || report.all_trials.length !== 30) {
    throw new Error(`expected 30 trials, got ${report.all_trials && report.all_trials.length}`);
  }

  const jsonlLines = report.all_trials.map(t => JSON.stringify({
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
  }));
  fs.writeFileSync(OUT_JSONL, jsonlLines.join('\n') + '\n');

  const header = [
    'run_id',
    'proxy_clear_rate',
    'proxy_damage_per_min',
    'proxy_survival_time',
    'proxy_input_density',
    'q_a',
    'q_intro',
    'q_success_fb',
    'q_d',
    'q_c',
    'q_e',
  ];
  const rows = report.all_trials.map(t => {
    const survived = t.outcome === 'survived' ? 1 : 0;
    const damagePerMin = survived ? 0 : Number((60 / t.play_time_sec).toFixed(4));
    const inputDensity = t.play_time_sec > 0
      ? Number((t.cast_count / t.play_time_sec * 60).toFixed(4))
      : 0;
    return [
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
  });
  fs.writeFileSync(OUT_CSV, [header.join(','), ...rows].join('\n') + '\n');

  console.log(JSON.stringify({
    wrote_jsonl: path.relative(process.cwd(), OUT_JSONL),
    wrote_csv: path.relative(process.cwd(), OUT_CSV),
    trials: report.all_trials.length,
    median_clear_wave: report.median_clear_wave,
    median_play_time_sec: report.median_play_time_sec,
    median_graze_count: report.median_graze_count,
    survival_rate: report.survival_rate,
  }, null, 2));
}

main();
