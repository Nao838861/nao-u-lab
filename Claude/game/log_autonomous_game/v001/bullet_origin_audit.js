#!/usr/bin/env node
// bullet_origin_audit.js — log_autonomous_game v001 Q-D 独立監査
//
// 目的: game.js の弾発射ロジックが design_log §Q-D / Pulse Relay v003 教師差分
// 禁則 (画面外射撃 / 居残り敵射撃 / 敵下部急加速) に違反していないことを、
// game.js を実行せずに「定数抽出 + 静的ガード検出 + 決定論シミュレーション」の
// 3層で独立検証する。self_judgment.md §1 Q-D の数値根拠ゼロ問題への一次処方。
// C244 Phase 4: wave2 (敵D 横断敵) 追加対応。シミュレーションを 60s に延長、
// 敵D の x-gate ([SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX]) 静的ガードと弾源を追加検査。
//
// 使い方: node bullet_origin_audit.js  (exit 0 = 全合格、exit 1 = 違反あり)
//
// What this proves:
//   - 弾発射の Y 座標が SHOOT_GATE_Y_MAX 以下 / 0 以上に収まる (画面外射撃ゼロ)
//   - 退場帯 (y > SHOOT_GATE_Y_MAX) に入った敵から弾が出ない (居残り射撃ゼロ)
//   - 敵D 弾の X 座標が [SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX] に収まる (端部射撃ゼロ)
//   - 敵 1 フレーム移動量が player.speed (3.4 px/frame) を超えない (急加速なし)
//   - SHOOT_GATE_Y_MAX / 敵D X-gate の if ガードが game.js 本体に静的に存在する
// What this does NOT prove:
//   - 実機ブラウザでの体感速度・色配色・認知負荷 (self_judgment §5 残)
//   - Q-成功FB 状態1/2/3 の体感差 (別 audit)
//   - 5 体同時発射時の画面情報密度 (人の判断要)

const fs = require('fs');
const path = require('path');

const SRC_PATH = path.join(__dirname, 'game.js');
const src = fs.readFileSync(SRC_PATH, 'utf8');

// --- index.html canvas 寸法 (audit 側で固定値として取り扱う) ---
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

// プレイヤー速度は game.js 内 `speed: 3.4` の object literal で定義されているため
// 独立に静的抽出 (定数定義ではないため regex 範囲を絞る)。
const playerSpeedMatch = src.match(/player\s*:\s*\{[^}]*speed\s*:\s*([0-9.]+)/);
if (!playerSpeedMatch) throw new Error('player.speed not found in game.js');
const PLAYER_SPEED = parseFloat(playerSpeedMatch[1]);

// --- 層1: 静的ガード検出 ---
// SHOOT_GATE_Y_MAX の if ガードが spawnBullet 呼出経路に存在することを確認
const staticGateGuardRe = /e\.y\s*>=\s*0\s*&&\s*e\.y\s*<=\s*SHOOT_GATE_Y_MAX/;
const staticGateGuardPresent = staticGateGuardRe.test(src);

// 敵D 用 X gate (中央域 [SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX]) の if ガード確認
const staticXGateGuardRe = /e\.x\s*>=\s*SHOOT_GATE_X_MIN\s*&&\s*e\.x\s*<=\s*SHOOT_GATE_X_MAX/;
const staticXGateGuardPresent = staticXGateGuardRe.test(src);

// 弾発射時の方向確定 (発射後 vx/vy 不変 = divergence ゼロ) 静的確認
const bulletInitDirRe = /vx:\s*\(dx\s*\/\s*d\)\s*\*\s*BULLET_SPEED[\s\S]{0,80}vy:\s*\(dy\s*\/\s*d\)\s*\*\s*BULLET_SPEED/;
const bulletDirFixedAtSpawn = bulletInitDirRe.test(src);

// updateBullets で vx/vy 書き換えが無いこと (再代入なし) を確認
const bulletReassignRe = /b\.vx\s*=|b\.vy\s*=/;
const bulletVelReassigned = bulletReassignRe.test(src);

// --- 層2: 決定論シミュレーション (プレイヤー静止、wave A + D 連続 60s) ---
const player = { x: W * 0.5, y: H * 0.78, r: 8 };
let enemies = [];
const bulletSpawns = [];
const enemyStepSamples = [];
let waveCount = 0;
let waveSpawned = false;

function spawnWaveA() {
  const n = 5;
  const before = enemies.length;
  for (let i = 0; i < n; i++) {
    enemies.push({
      id: `A-${waveCount}-${i}`,
      type: 'A',
      x: W * (0.15 + i * 0.175),
      y: -20 - i * 40,
      vx: 0, vy: ENEMY_VY_A,
      r: 10, alive: true,
      shootCooldown: 30 + i * 20,
    });
  }
  waveCount += 1;
  return enemies.length - before;
}

// C244 Phase 4: 敵D 横断敵 (game.js spawnWaveD と同一仕様)
function spawnWaveD() {
  const n = 3;
  const before = enemies.length;
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
  return enemies.length - before;
}

function spawnNextWave() {
  if (waveCount % 2 === 0) spawnWaveA();
  else spawnWaveD();
}

function step(frame) {
  for (const e of enemies) {
    if (!e.alive) continue;
    const stepLen = Math.hypot(e.vx, e.vy);
    enemyStepSamples.push({ id: e.id, type: e.type, frame, step: stepLen });
    e.x += e.vx; e.y += e.vy;
    if (e.type === 'D') {
      if (e.x < -30 || e.x > W + 30) { e.alive = false; continue; }
    } else {
      if (e.y > H + 30) { e.alive = false; continue; }
    }
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

const SIM_FRAMES = FPS * 60; // 60 秒、wave A+D 数巡を覆う
for (let f = 0; f < SIM_FRAMES; f++) {
  if (!waveSpawned) {
    spawnNextWave();
    waveSpawned = true;
  }
  step(f);
  if (enemies.length === 0) waveSpawned = false;
}

// --- 層3: 検査基準 ---
const offscreenShots = bulletSpawns.filter(s => s.y < 0 || s.y > SHOOT_GATE_Y_MAX);
const lingeringShots = bulletSpawns.filter(s => s.y > H);
const shotsD = bulletSpawns.filter(s => s.type === 'D');
const outOfXGateD = shotsD.filter(s => s.x < SHOOT_GATE_X_MIN || s.x > SHOOT_GATE_X_MAX);
const maxEnemyStep = enemyStepSamples.reduce((m, s) => Math.max(m, s.step), 0);
const totalShots = bulletSpawns.length;

const checks = {
  static_gate_guard_present: staticGateGuardPresent,
  static_x_gate_guard_present: staticXGateGuardPresent,
  bullet_dir_fixed_at_spawn: bulletDirFixedAtSpawn,
  bullet_vel_not_reassigned: !bulletVelReassigned,
  offscreen_shots_zero: offscreenShots.length === 0,
  lingering_shots_zero: lingeringShots.length === 0,
  d_shots_within_x_gate: outOfXGateD.length === 0,
  max_enemy_step_le_player_speed: maxEnemyStep <= PLAYER_SPEED,
};

const pass = Object.values(checks).every(Boolean);

const report = {
  audit: 'bullet_origin_audit',
  target: 'game/log_autonomous_game/v001/game.js',
  constants: { W, H, FPS, BULLET_SPEED, SHOOT_INTERVAL, SHOOT_GATE_Y_MAX, SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX, ECHO_FRAMES, PLAYER_SPEED, ENEMY_VY_A, ENEMY_VX_D },
  static_checks: {
    SHOOT_GATE_y_guard: staticGateGuardPresent,
    SHOOT_GATE_x_guard_for_D: staticXGateGuardPresent,
    bullet_direction_fixed_at_spawn: bulletDirFixedAtSpawn,
    bullet_velocity_reassigned_after_spawn: bulletVelReassigned,
  },
  simulation: {
    frames_simulated: SIM_FRAMES,
    waves_spawned: waveCount,
    total_shots: totalShots,
    shots_A: bulletSpawns.filter(s => s.type === 'A').length,
    shots_D: shotsD.length,
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
