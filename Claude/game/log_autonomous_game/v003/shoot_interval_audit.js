// log_autonomous_game v003 — shoot_interval_audit.js
// 校正 diff (C297 Phase 3, 1mm action): currentShootInterval(elapsed) の境界値
// + ease-in 曲線形状を静的検証する。game.js IIFE 内 closure のため re-implement
// し、6 観測点 + 単調減少 + 後半急加速を 1 pass で全 check。
// 純 Node (依存ゼロ)、exit 0 で全 PASS。
//
// 設計動機: kaizen #139 段階1-3 PASS 系列で「観測したが判定に反映していない」
// 構造的死角を縮めた延長。currentShootInterval の境界 (50s/90s) は game.js
// コメントで宣言済だが、テスト or 数値確認が無く「宣言と挙動のズレ」を検出
// できなかった。本 audit は宣言値と実挙動を 1 pass で固定する。
//
// 反証ライン: re-implement が game.js 本体と乖離した時に audit だけ PASS する
// 二重死角 → 緩和: 本ファイル冒頭で game.js L385-393 の formula を明示参照、
// game.js 改修時に本ファイル形状確認を visual_review.md V-09 (新設) でリマインド。

'use strict';

const FPS = 60;
const SHOOT_INTERVAL = 90;
const SHOOT_INTERVAL_PHASE2_MIN = 60;
const PHASE2_START = 50 * FPS; // 3000F
const PHASE2_END = 90 * FPS;   // 5400F

// game.js L385-393 currentShootInterval(elapsed) の re-impl (closure 直接 import 不可)
function currentShootInterval(elapsed) {
  if (elapsed < PHASE2_START) return SHOOT_INTERVAL;
  if (elapsed >= PHASE2_END) return SHOOT_INTERVAL_PHASE2_MIN;
  const t = (elapsed - PHASE2_START) / (PHASE2_END - PHASE2_START);
  const eased = t * t;
  return Math.round(SHOOT_INTERVAL + (SHOOT_INTERVAL_PHASE2_MIN - SHOOT_INTERVAL) * eased);
}

const checks = [];
function expect(name, actual, expected) {
  const pass = actual === expected;
  checks.push({ name, actual, expected, pass });
}

// 境界値 6 観測点
expect('elapsed=0F (title/pre-phase)',             currentShootInterval(0),                 90);
expect('elapsed=49s末尾 (phase1 終端)',           currentShootInterval(49 * FPS),          90);
expect('elapsed=50s 開始 (phase2 入口)',          currentShootInterval(50 * FPS),          90);
expect('elapsed=70s 中点 (t=0.5, eased=0.25)',    currentShootInterval(70 * FPS),          83);
expect('elapsed=89s 末尾手前 (t=0.975)',          currentShootInterval(89 * FPS),          61);
expect('elapsed=90s 終端 (clamp)',                currentShootInterval(90 * FPS),          60);
expect('elapsed=120s 終端後 (clamp 維持)',        currentShootInterval(120 * FPS),         60);

// 単調減少 (phase2 全域、1秒刻み)
let monotonic = true;
let prev = currentShootInterval(50 * FPS);
for (let s = 51; s <= 90; s += 1) {
  const cur = currentShootInterval(s * FPS);
  if (cur > prev) { monotonic = false; break; }
  prev = cur;
}
expect('phase2 monotonic non-increasing (1s 刻み)', monotonic, true);

// ease-in 性質: 後半 10s (80-90s) の減少量 >= 前半 10s (50-60s) の減少量 の 3 倍
const drop_front = currentShootInterval(50 * FPS) - currentShootInterval(60 * FPS);
const drop_back  = currentShootInterval(80 * FPS) - currentShootInterval(90 * FPS);
expect('ease-in: drop_back >= drop_front * 3', drop_back >= drop_front * 3, true);

const failed = checks.filter(c => !c.pass);
for (const c of checks) {
  console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}: actual=${c.actual} expected=${c.expected}`);
}
console.log(`---`);
console.log(`total: ${checks.length}, pass: ${checks.length - failed.length}, fail: ${failed.length}`);
console.log(`drop_front=${drop_front}F (50→60s), drop_back=${drop_back}F (80→90s), ratio=${(drop_back/Math.max(drop_front,1)).toFixed(2)}x`);

process.exit(failed.length === 0 ? 0 : 1);
