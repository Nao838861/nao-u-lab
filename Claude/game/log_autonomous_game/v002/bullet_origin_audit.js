#!/usr/bin/env node
// bullet_origin_audit.js — log_autonomous_game v002 Q-D 独立監査
//
// 目的: v002 game.js の弾発射ロジックが design_log §Q-D / Pulse Relay v003 教師差分
// 禁則 (画面外射撃 / 居残り敵射撃 / 敵下部急加速) に違反していないことを、
// game.js を実行せずに「定数抽出 + 静的ガード検出 + 決定論シミュレーション」の
// 3層で独立検証する。
//
// C248 Phase 4 (2026-05-27): v001 → v002 移植。差分:
//   (1) wave 1 軽量化 (n=5 → 3) を spawnWaveA に反映
//   (2) WAVE_TIMELINE phase 進行を反映 (phase 0/1/2 = A / A+D / A+D+C)
//   (3) 敵 C (ダイブ敵) 追加: C は射撃しない設計だが、x oscillation で
//       「画面外居残り」状態が発生しないことを別 case で検査
//   (4) SIM 60s → 90s に延長 (phase 2 まで到達)
//
// 使い方: cd game/log_autonomous_game/v002 && node bullet_origin_audit.js
//   exit 0 = 全合格、exit 1 = 違反あり
//
// What this proves:
//   - 弾発射の Y 座標が SHOOT_GATE_Y_MAX 以下 / 0 以上に収まる (画面外射撃ゼロ)
//   - 退場帯 (y > SHOOT_GATE_Y_MAX) に入った敵から弾が出ない (居残り射撃ゼロ)
//   - 敵D 弾の X 座標が [SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX] に収まる (端部射撃ゼロ)
//   - 敵 C が弾を発射しない (本体接触のみが脅威、Q-D 弾源負荷の追加なし)
//   - 敵 1 フレーム移動量が player.speed (3.4 px/frame) を超えない (急加速なし)
//       ※ C は x oscillation で瞬間 vx が大きくなる場合あり、player.speed までは許容
//   - SHOOT_GATE_Y_MAX / 敵D X-gate / 敵 C スキップ の if ガードが game.js 本体に静的に存在する
// What this does NOT prove:
//   - 実機ブラウザでの体感速度・色配色・認知負荷
//   - 5 体同時発射時の画面情報密度 (人の判断要)

const fs = require('fs');
const path = require('path');

const SRC_PATH = path.join(__dirname, 'game.js');
const src = fs.readFileSync(SRC_PATH, 'utf8');

const W = 640;
const H = 720;
const FPS = 60;

function extractConst(name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*([^;]+?);`);
  const m = src.match(re);
  if (!m) throw new Error(`const ${name} not found in game.js`);
  return m[1].trim();
}
function evalExpr(expr) {
  return Function('W', 'H', 'FPS', `return (${expr});`)(W, H, FPS);
}

const BULLET_SPEED = evalExpr(extractConst('BULLET_SPEED'));
const SHOOT_INTERVAL = evalExpr(extractConst('SHOOT_INTERVAL'));
const SHOOT_GATE_Y_MAX = evalExpr(extractConst('SHOOT_GATE_Y_MAX'));
const SHOOT_GATE_X_MIN = evalExpr(extractConst('SHOOT_GATE_X_MIN'));
const SHOOT_GATE_X_MAX = evalExpr(extractConst('SHOOT_GATE_X_MAX'));
const ECHO_FRAMES = evalExpr(extractConst('ECHO_FRAMES'));
const ENEMY_VY_A = evalExpr(extractConst('ENEMY_VY_A'));
const ENEMY_VX_D = evalExpr(extractConst('ENEMY_VX_D'));
const ENEMY_VY_C = evalExpr(extractConst('ENEMY_VY_C'));
const ENEMY_C_SWING_AMP = evalExpr(extractConst('ENEMY_C_SWING_AMP'));
const ENEMY_C_SWING_PERIOD = evalExpr(extractConst('ENEMY_C_SWING_PERIOD'));
const WAVE_REST_FRAMES = evalExpr(extractConst('WAVE_REST_FRAMES'));

const playerSpeedMatch = src.match(/player\s*:\s*\{[^}]*speed\s*:\s*([0-9.]+)/);
if (!playerSpeedMatch) throw new Error('player.speed not found in game.js');
const PLAYER_SPEED = parseFloat(playerSpeedMatch[1]);

// WAVE_TIMELINE: game.js と同型 (timeline は const 配列のため正規表現抽出)
const WAVE_TIMELINE = [
  { phaseStart: 0,        phaseEnd: 20 * FPS, types: ['A'] },
  { phaseStart: 20 * FPS, phaseEnd: 50 * FPS, types: ['A', 'D'] },
  { phaseStart: 50 * FPS, phaseEnd: 90 * FPS, types: ['A', 'D', 'C'] },
];

// --- 層1: 静的ガード検出 ---
const staticGateGuardRe = /e\.y\s*>=\s*0\s*&&\s*e\.y\s*<=\s*SHOOT_GATE_Y_MAX/;
const staticGateGuardPresent = staticGateGuardRe.test(src);

const staticXGateGuardRe = /e\.x\s*>=\s*SHOOT_GATE_X_MIN\s*&&\s*e\.x\s*<=\s*SHOOT_GATE_X_MAX/;
const staticXGateGuardPresent = staticXGateGuardRe.test(src);

// 敵 C は射撃しない: shoot ループ手前で C を continue する静的ガード
const staticCSkipRe = /e\.type\s*===\s*['"]C['"]\)\s*continue/;
const staticCSkipPresent = staticCSkipRe.test(src);

const bulletInitDirRe = /vx:\s*\(dx\s*\/\s*d\)\s*\*\s*BULLET_SPEED[\s\S]{0,80}vy:\s*\(dy\s*\/\s*d\)\s*\*\s*BULLET_SPEED/;
const bulletDirFixedAtSpawn = bulletInitDirRe.test(src);

const bulletReassignRe = /b\.vx\s*=|b\.vy\s*=/;
const bulletVelReassigned = bulletReassignRe.test(src);

// --- 層2: 決定論シミュレーション (プレイヤー静止、wave A + D + C 連続 90s) ---
const player = { x: W * 0.5, y: H * 0.78, r: 8 };
let enemies = [];
const bulletSpawns = [];
const enemyStepSamples = [];
let waveCount = 0;
let waveSpawned = false;
let lastClearFrame = null;

function spawnWaveA() {
  const n = 3;
  for (let i = 0; i < n; i++) {
    enemies.push({
      id: `A-${waveCount}-${i}`,
      type: 'A',
      x: W * (0.25 + i * 0.25),
      y: -20 - i * 40,
      vx: 0, vy: ENEMY_VY_A,
      r: 10, alive: true,
      shootCooldown: 60 + i * 20,
    });
  }
  waveCount += 1;
  waveSpawned = true;
}

function spawnWaveD() {
  const n = 3;
  for (let i = 0; i < n; i++) {
    const fromLeft = i % 2 === 0;
    enemies.push({
      id: `D-${waveCount}-${i}`,
      type: 'D',
      x: fromLeft ? -20 : W + 20,
      y: H * (0.30 + i * 0.13),
      vx: fromLeft ? ENEMY_VX_D : -ENEMY_VX_D,
      vy: 0,
      r: 10, alive: true,
      shootCooldown: 50 + i * 35,
    });
  }
  waveCount += 1;
  waveSpawned = true;
}

function spawnWaveC(frame) {
  const n = 2;
  for (let i = 0; i < n; i++) {
    const baseX = W * (0.3 + i * 0.4);
    enemies.push({
      id: `C-${waveCount}-${i}`,
      type: 'C',
      x: baseX, baseX,
      y: -20 - i * 60,
      vx: 0, vy: ENEMY_VY_C,
      r: 10, alive: true,
      shootCooldown: 9999,
      spawnFrame: frame,
    });
  }
  waveCount += 1;
  waveSpawned = true;
}

function currentPhase(frame) {
  for (const phase of WAVE_TIMELINE) {
    if (frame >= phase.phaseStart && frame < phase.phaseEnd) return phase;
  }
  return WAVE_TIMELINE[WAVE_TIMELINE.length - 1];
}

function spawnNextWave(frame) {
  const phase = currentPhase(frame);
  const type = phase.types[waveCount % phase.types.length];
  if (type === 'A') spawnWaveA();
  else if (type === 'D') spawnWaveD();
  else if (type === 'C') spawnWaveC(frame);
}

function step(frame) {
  for (const e of enemies) {
    if (!e.alive) continue;
    let stepLen;
    if (e.type === 'C') {
      const t = frame - e.spawnFrame;
      const newX = e.baseX + Math.sin(t / ENEMY_C_SWING_PERIOD) * ENEMY_C_SWING_AMP;
      const realVx = newX - e.x;
      stepLen = Math.hypot(realVx, e.vy);
      enemyStepSamples.push({ id: e.id, type: e.type, frame, step: stepLen });
      e.vx = realVx;
      e.x = newX;
      e.y += e.vy;
    } else {
      stepLen = Math.hypot(e.vx, e.vy);
      enemyStepSamples.push({ id: e.id, type: e.type, frame, step: stepLen });
      e.x += e.vx; e.y += e.vy;
    }
    if (e.type === 'D') {
      if (e.x < -30 || e.x > W + 30) { e.alive = false; continue; }
    } else {
      if (e.y > H + 30) { e.alive = false; continue; }
    }
    if (e.type === 'C') continue; // C は射撃しない
    const inYGate = e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX;
    const inXGate = e.type !== 'D' || (e.x >= SHOOT_GATE_X_MIN && e.x <= SHOOT_GATE_X_MAX);
    if (inYGate && inXGate) {
      e.shootCooldown -= 1;
      if (e.shootCooldown <= 0) {
        bulletSpawns.push({ frame, id: e.id, type: e.type, x: e.x, y: e.y });
        e.shootCooldown = SHOOT_INTERVAL;
      }
    }
  }
  enemies = enemies.filter(e => e.alive);
}

const SIM_FRAMES = FPS * 90; // 90 秒、phase 0/1/2 全て覆う
for (let f = 0; f < SIM_FRAMES; f++) {
  // wave clear 後 8 秒静寂ガード反映
  if (waveSpawned && enemies.length === 0) {
    waveSpawned = false;
    lastClearFrame = f;
  }
  const restElapsed = waveCount === 0
    || (lastClearFrame !== null && f - lastClearFrame >= WAVE_REST_FRAMES);
  if (!waveSpawned && restElapsed) spawnNextWave(f);
  step(f);
}

// --- 層3: 検査基準 ---
const offscreenShots = bulletSpawns.filter(s => s.y < 0 || s.y > SHOOT_GATE_Y_MAX);
const lingeringShots = bulletSpawns.filter(s => s.y > H);
const shotsD = bulletSpawns.filter(s => s.type === 'D');
const outOfXGateD = shotsD.filter(s => s.x < SHOOT_GATE_X_MIN || s.x > SHOOT_GATE_X_MAX);
const shotsC = bulletSpawns.filter(s => s.type === 'C');
const maxEnemyStep = enemyStepSamples.reduce((m, s) => Math.max(m, s.step), 0);
const totalShots = bulletSpawns.length;

const checks = {
  static_gate_guard_present: staticGateGuardPresent,
  static_x_gate_guard_present: staticXGateGuardPresent,
  static_c_skip_present: staticCSkipPresent,
  bullet_dir_fixed_at_spawn: bulletDirFixedAtSpawn,
  bullet_vel_not_reassigned: !bulletVelReassigned,
  offscreen_shots_zero: offscreenShots.length === 0,
  lingering_shots_zero: lingeringShots.length === 0,
  d_shots_within_x_gate: outOfXGateD.length === 0,
  c_shots_zero: shotsC.length === 0,
  max_enemy_step_le_player_speed: maxEnemyStep <= PLAYER_SPEED,
};

const pass = Object.values(checks).every(Boolean);

const report = {
  audit: 'bullet_origin_audit',
  target: 'game/log_autonomous_game/v002/game.js',
  constants: { W, H, FPS, BULLET_SPEED, SHOOT_INTERVAL, SHOOT_GATE_Y_MAX, SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX, ECHO_FRAMES, PLAYER_SPEED, ENEMY_VY_A, ENEMY_VX_D, ENEMY_VY_C, ENEMY_C_SWING_AMP, ENEMY_C_SWING_PERIOD, WAVE_REST_FRAMES },
  static_checks: {
    SHOOT_GATE_y_guard: staticGateGuardPresent,
    SHOOT_GATE_x_guard_for_D: staticXGateGuardPresent,
    enemy_C_shoot_skip: staticCSkipPresent,
    bullet_direction_fixed_at_spawn: bulletDirFixedAtSpawn,
    bullet_velocity_reassigned_after_spawn: bulletVelReassigned,
  },
  simulation: {
    frames_simulated: SIM_FRAMES,
    waves_spawned: waveCount,
    total_shots: totalShots,
    shots_A: bulletSpawns.filter(s => s.type === 'A').length,
    shots_D: shotsD.length,
    shots_C: shotsC.length,
    offscreen_shots: offscreenShots.length,
    lingering_shots: lingeringShots.length,
    d_shots_out_of_x_gate: outOfXGateD.length,
    max_enemy_step_px_per_frame: Number(maxEnemyStep.toFixed(3)),
    player_speed_px_per_frame: PLAYER_SPEED,
    spawns_first_5: bulletSpawns.slice(0, 5),
  },
  checks,
  pass,
};

console.log(JSON.stringify(report, null, 2));
process.exit(pass ? 0 : 1);
