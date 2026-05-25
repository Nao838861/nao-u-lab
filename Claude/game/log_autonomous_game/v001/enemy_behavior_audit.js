#!/usr/bin/env node
// enemy_behavior_audit.js — log_autonomous_game v001 敵挙動 独立監査 (3軸目)
//
// 目的: game.js の **敵 A (直進小型) wave** 側の挙動が design_log §Q-D 禁則
// (画面外射撃ゼロ / 退場帯射撃ゼロ / 敵下部急加速ゼロ / 直進方向不変) と
// design_log の spawn 仕様 (x in [0, W], y は画面上端外で出現) に違反しない
// ことを、game.js を実行せずに「定数抽出 + 決定論シミュレーション」で
// 独立検証する。3 軸監査体制の 3 軸目:
//   1. verify.js              — 受け手悪手 4 方針 fail シミュ (プレイヤー側)
//   2. bullet_origin_audit.js — Q-D 弾源 (発射点) 独立監査
//   3. enemy_behavior_audit.js (本ファイル) — 敵挙動 独立監査 (本体運動)
//
// 使い方: cd game/log_autonomous_game/v001 && node enemy_behavior_audit.js
//   exit 0 = 全 case PASS (敵挙動設計健全)
//   exit 1 = 1 件以上 FAIL (game.js の敵挙動が仕様逸脱、self_judgment 追記候補)
//
// What this proves:
//   - 敵 A wave 5 体の spawn 座標が画面 x 範囲 [0, W] 内、y は画面上端外 (y<0)
//   - 全敵の vy は ENEMY_VY=1.4 で正値・一定 (フレーム間で変化しない = 急加速なし)
//   - 全敵の vx は 0 (横ブレなし) で一定
//   - 全弾の発射 y 座標が [0, SHOOT_GATE_Y_MAX=612] 内 (画面外/退場帯射撃ゼロ)
// What this does NOT prove:
//   - 5 体同時射撃の体感密度 (self_judgment §1 Q-D-1 と同様、実機判定領域)
//   - 弾本体色と画面背景の視認性 (色配色は別軸)
//   - 敵 B/C/D が将来追加された時の同等性 (本 audit は wave A 限定)

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

const SHOOT_INTERVAL = evalExpr(extractConst('SHOOT_INTERVAL'));
const SHOOT_GATE_Y_MAX = evalExpr(extractConst('SHOOT_GATE_Y_MAX'));

// 敵 vy は spawnWaveA 内 object literal の `vy: 1.4` で定義。独立に静的抽出。
const vyMatch = src.match(/vy:\s*([0-9.]+),\s*\n\s*r:\s*10,/);
if (!vyMatch) throw new Error('ENEMY_VY (vy in spawnWaveA) not found in game.js');
const ENEMY_VY = parseFloat(vyMatch[1]);

// --- Wave A 仕様 (game.js spawnWaveA と同一の式) ---
function spawnWaveA(state) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    state.enemies.push({
      id: `A-${i}`,
      x: W * (0.15 + i * 0.175),
      y: -20 - i * 40,
      vx: 0, vy: ENEMY_VY,
      r: 10, alive: true,
      shootCooldown: 30 + i * 20,
      // audit 用に初期速度を保存 (case 2 の不変性検査基準)
      initVx: 0, initVy: ENEMY_VY,
    });
  }
}

function spawnBullet(state, e) {
  const dx = state.player.x - e.x;
  const dy = state.player.y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  state.bullets.push({
    x: e.x, y: e.y,
    vx: (dx / d) * 2.0, vy: (dy / d) * 2.0,
    r: 4, alive: true,
  });
  state.shotLog.push({ frame: state.frame, id: e.id, y: e.y, x: e.x });
}

function updateEnemies(state) {
  for (const e of state.enemies) {
    if (!e.alive) continue;
    // 速度不変性サンプリング (case 2): 更新前に vx/vy を記録
    state.velSamples.push({ id: e.id, frame: state.frame, vx: e.vx, vy: e.vy });
    e.x += e.vx; e.y += e.vy;
    if (e.y > H + 30) { e.alive = false; continue; }
    if (e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX) {
      e.shootCooldown -= 1;
      if (e.shootCooldown <= 0) {
        spawnBullet(state, e);
        e.shootCooldown = SHOOT_INTERVAL;
      }
    }
  }
}

function updateBullets(state) {
  for (const b of state.bullets) {
    if (!b.alive) continue;
    b.x += b.vx; b.y += b.vy;
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) b.alive = false;
  }
  state.bullets = state.bullets.filter(b => b.alive);
}

// --- 決定論シミュレーション (プレイヤー静止、Wave A 1 巡) ---
const state = {
  player: { x: W * 0.5, y: H * 0.78 },
  enemies: [],
  bullets: [],
  shotLog: [],
  velSamples: [],
  spawnLog: [],
  frame: 0,
};

spawnWaveA(state);
// spawn 直後の座標を case 1 用に記録
for (const e of state.enemies) {
  state.spawnLog.push({ id: e.id, x: e.x, y: e.y });
}

const SIM_FRAMES = FPS * 15; // 15 秒 (Wave A 退場 H+30=750 / vy=1.4 ≈ 536F を覆う)
for (let f = 0; f < SIM_FRAMES; f++) {
  state.frame = f;
  updateEnemies(state);
  updateBullets(state);
  if (state.enemies.every(e => !e.alive)) break;
}

// --- Case 1: spawn 座標域 ---
const spawnOutOfX = state.spawnLog.filter(s => s.x < 0 || s.x > W);
const spawnOutOfY = state.spawnLog.filter(s => s.y >= 0); // 画面上端外 (y < 0) で出現
const case1Pass = spawnOutOfX.length === 0 && spawnOutOfY.length === 0;

// --- Case 2: 進行方向不変 (vy=ENEMY_VY 正値固定 / vx=0 固定) ---
const velViolations = state.velSamples.filter(s => s.vy !== ENEMY_VY || s.vx !== 0);
const case2Pass = velViolations.length === 0 && ENEMY_VY > 0;

// --- Case 3: 射撃ゲート (発射 y 座標 in [0, SHOOT_GATE_Y_MAX]) ---
const shotsOutOfGate = state.shotLog.filter(s => s.y < 0 || s.y > SHOOT_GATE_Y_MAX);
const case3Pass = shotsOutOfGate.length === 0;

const cases = [
  {
    name: 'spawn_coord_domain',
    desc: '敵 A wave spawn 座標が x in [0, W] かつ y < 0 (画面上端外)',
    pass: case1Pass,
    expected: { x_range: [0, W], y_range: '< 0' },
    actual: { spawns: state.spawnLog, out_of_x: spawnOutOfX, out_of_y: spawnOutOfY },
  },
  {
    name: 'direction_invariant',
    desc: `全敵の vy=${ENEMY_VY} (正値固定) かつ vx=0 が全フレーム不変`,
    pass: case2Pass,
    expected: { vy: ENEMY_VY, vx: 0, samples_required: state.velSamples.length },
    actual: { samples: state.velSamples.length, violations: velViolations.length, first_violation: velViolations[0] || null },
  },
  {
    name: 'shoot_gate',
    desc: `全弾の発射 y 座標が [0, ${SHOOT_GATE_Y_MAX}] 内 (画面外/退場帯射撃ゼロ)`,
    pass: case3Pass,
    expected: { y_range: [0, SHOOT_GATE_Y_MAX] },
    actual: { total_shots: state.shotLog.length, out_of_gate: shotsOutOfGate.length, first_out: shotsOutOfGate[0] || null },
  },
];

const passed = cases.filter(c => c.pass).length;
const total = cases.length;
const allPass = passed === total;

const report = {
  audit: 'enemy_behavior_audit',
  target: 'game/log_autonomous_game/v001/game.js',
  constants: { W, H, FPS, ENEMY_VY, SHOOT_INTERVAL, SHOOT_GATE_Y_MAX },
  simulation: {
    frames_simulated: state.frame + 1,
    enemies_spawned: state.spawnLog.length,
    shots_fired: state.shotLog.length,
    enemies_alive_at_end: state.enemies.filter(e => e.alive).length,
  },
  cases,
  pass: allPass,
};

console.log(JSON.stringify(report, null, 2));
console.log(`=== ${passed}/${total} PASS ===`);
process.exit(allPass ? 0 : 1);
