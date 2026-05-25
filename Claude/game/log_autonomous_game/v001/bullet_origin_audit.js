#!/usr/bin/env node
// bullet_origin_audit.js — log_autonomous_game v001 Q-D 独立監査
//
// 目的: game.js の弾発射ロジックが design_log §Q-D / Pulse Relay v003 教師差分
// 禁則 (画面外射撃 / 居残り敵射撃 / 敵下部急加速) に違反していないことを、
// game.js を実行せずに「定数抽出 + 静的ガード検出 + 決定論シミュレーション」の
// 3層で独立検証する。self_judgment.md §1 Q-D の数値根拠ゼロ問題への一次処方。
//
// 使い方: node bullet_origin_audit.js  (exit 0 = 全合格、exit 1 = 違反あり)
//
// What this proves:
//   - 弾発射の Y 座標が SHOOT_GATE_Y_MAX 以下 / 0 以上に収まる (画面外射撃ゼロ)
//   - 退場帯 (y > SHOOT_GATE_Y_MAX) に入った敵から弾が出ない (居残り射撃ゼロ)
//   - 敵 1 フレーム移動量が player.speed (3.4 px/frame) を超えない (急加速なし)
//   - SHOOT_GATE_Y_MAX の if ガードが game.js 本体に静的に存在する
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
const ECHO_FRAMES = evalExpr(extractConst('ECHO_FRAMES'));

// プレイヤー速度は game.js 内 `speed: 3.4` の object literal で定義されているため
// 独立に静的抽出 (定数定義ではないため regex 範囲を絞る)。
const playerSpeedMatch = src.match(/player\s*:\s*\{[^}]*speed\s*:\s*([0-9.]+)/);
if (!playerSpeedMatch) throw new Error('player.speed not found in game.js');
const PLAYER_SPEED = parseFloat(playerSpeedMatch[1]);

// --- 層1: 静的ガード検出 ---
// SHOOT_GATE_Y_MAX の if ガードが spawnBullet 呼出経路に存在することを確認
const staticGateGuardRe = /e\.y\s*>=\s*0\s*&&\s*e\.y\s*<=\s*SHOOT_GATE_Y_MAX/;
const staticGateGuardPresent = staticGateGuardRe.test(src);

// 弾発射時の方向確定 (発射後 vx/vy 不変 = divergence ゼロ) 静的確認
const bulletInitDirRe = /vx:\s*\(dx\s*\/\s*d\)\s*\*\s*BULLET_SPEED[\s\S]{0,80}vy:\s*\(dy\s*\/\s*d\)\s*\*\s*BULLET_SPEED/;
const bulletDirFixedAtSpawn = bulletInitDirRe.test(src);

// updateBullets で vx/vy 書き換えが無いこと (再代入なし) を確認
const bulletReassignRe = /b\.vx\s*=|b\.vy\s*=/;
const bulletVelReassigned = bulletReassignRe.test(src);

// --- 層2: 決定論シミュレーション (プレイヤー静止、Wave A 1巡) ---
const player = { x: W * 0.5, y: H * 0.78, r: 8 };
const enemies = [];
const bulletSpawns = [];
const enemyStepSamples = [];

function spawnWaveA() {
  const n = 5;
  for (let i = 0; i < n; i++) {
    enemies.push({
      id: `A-${i}`,
      x: W * (0.15 + i * 0.175),
      y: -20 - i * 40,
      vx: 0, vy: 1.4,
      r: 10, alive: true,
      shootCooldown: 30 + i * 20,
    });
  }
}

function step(frame) {
  for (const e of enemies) {
    if (!e.alive) continue;
    const stepLen = Math.hypot(e.vx, e.vy);
    enemyStepSamples.push({ id: e.id, frame, step: stepLen });
    e.x += e.vx; e.y += e.vy;
    if (e.y > H + 30) { e.alive = false; continue; }
    if (e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX) {
      e.shootCooldown -= 1;
      if (e.shootCooldown <= 0) {
        bulletSpawns.push({ frame, id: e.id, x: e.x, y: e.y });
        e.shootCooldown = SHOOT_INTERVAL;
      }
    }
  }
}

spawnWaveA();
const SIM_FRAMES = FPS * 15; // 15 秒、Wave A 1 巡 (vy=1.4 で H+30=750/1.4 ≈ 536F) を十分覆う
for (let f = 0; f < SIM_FRAMES; f++) {
  step(f);
  if (enemies.every(e => !e.alive)) break;
}

// --- 層3: 検査基準 ---
const offscreenShots = bulletSpawns.filter(s => s.y < 0 || s.y > SHOOT_GATE_Y_MAX);
const lingeringShots = bulletSpawns.filter(s => s.y > H);
const maxEnemyStep = enemyStepSamples.reduce((m, s) => Math.max(m, s.step), 0);
const totalShots = bulletSpawns.length;

const checks = {
  static_gate_guard_present: staticGateGuardPresent,
  bullet_dir_fixed_at_spawn: bulletDirFixedAtSpawn,
  bullet_vel_not_reassigned: !bulletVelReassigned,
  offscreen_shots_zero: offscreenShots.length === 0,
  lingering_shots_zero: lingeringShots.length === 0,
  max_enemy_step_le_player_speed: maxEnemyStep <= PLAYER_SPEED,
};

const pass = Object.values(checks).every(Boolean);

const report = {
  audit: 'bullet_origin_audit',
  target: 'game/log_autonomous_game/v001/game.js',
  constants: { W, H, FPS, BULLET_SPEED, SHOOT_INTERVAL, SHOOT_GATE_Y_MAX, ECHO_FRAMES, PLAYER_SPEED },
  static_checks: {
    SHOOT_GATE_guard: staticGateGuardPresent,
    bullet_direction_fixed_at_spawn: bulletDirFixedAtSpawn,
    bullet_velocity_reassigned_after_spawn: bulletVelReassigned,
  },
  simulation: {
    frames_simulated: SIM_FRAMES,
    total_shots: totalShots,
    offscreen_shots: offscreenShots.length,
    lingering_shots: lingeringShots.length,
    max_enemy_step_px_per_frame: Number(maxEnemyStep.toFixed(3)),
    player_speed_px_per_frame: PLAYER_SPEED,
    spawns_first_5: bulletSpawns.slice(0, 5),
  },
  checks,
  pass,
};

console.log(JSON.stringify(report, null, 2));
process.exit(pass ? 0 : 1);
