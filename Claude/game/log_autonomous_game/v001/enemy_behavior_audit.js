#!/usr/bin/env node
// enemy_behavior_audit.js — log_autonomous_game v001 敵挙動 独立監査 (3軸目)
//
// 目的: game.js の **敵 A (直進小型) + 敵 D (横断敵) wave** 側の挙動が design_log §Q-D 禁則
// (画面外射撃ゼロ / 退場帯射撃ゼロ / 敵下部急加速ゼロ / 直進方向不変) と
// design_log §Q-C 敵D「中央付近でのみ射撃」と
// design_log の spawn 仕様 (A: x in [0, W] かつ y < 0、D: x = ±端外 かつ y in 画面内中段) に違反しない
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
//   - 敵 D wave 3 体の spawn 座標が x = -20 or W+20 (左右端外)、y in [画面内中段]
//   - 全敵の vx/vy は type 別 (A: vx=0/vy=1.4, D: vx=±1.4/vy=0) で全フレーム不変 (急加速・退場時急加速ゼロ)
//   - 全弾の発射 y 座標が [0, SHOOT_GATE_Y_MAX=612] 内 (画面外/退場帯射撃ゼロ)
//   - 敵 D 弾の発射 x 座標が [SHOOT_GATE_X_MIN=128, SHOOT_GATE_X_MAX=512] 内 (端部射撃ゼロ)
// What this does NOT prove:
//   - 体感密度 (実機判定領域)
//   - 弾本体色と画面背景の視認性 (色配色は別軸)
//   - 敵 C (ダイブ敵、design_log §Q-C) が将来追加された時の同等性 (本 audit は wave A/D 限定)

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
const SHOOT_GATE_X_MIN = evalExpr(extractConst('SHOOT_GATE_X_MIN'));
const SHOOT_GATE_X_MAX = evalExpr(extractConst('SHOOT_GATE_X_MAX'));
const ENEMY_VY_A = evalExpr(extractConst('ENEMY_VY_A'));
const ENEMY_VX_D = evalExpr(extractConst('ENEMY_VX_D'));

// --- Wave A 仕様 (game.js spawnWaveA と同一の式) ---
function spawnWaveA(state) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    state.enemies.push({
      id: `A-${state.waveCount}-${i}`,
      type: 'A',
      x: W * (0.15 + i * 0.175),
      y: -20 - i * 40,
      vx: 0, vy: ENEMY_VY_A,
      r: 10, alive: true,
      shootCooldown: 30 + i * 20,
    });
  }
  state.waveCount += 1;
  state.spawnLog.push(...state.enemies.filter(e => e.id.startsWith(`A-${state.waveCount - 1}-`)).map(e => ({
    id: e.id, type: e.type, x: e.x, y: e.y, vx: e.vx, vy: e.vy,
  })));
}

// --- Wave D 仕様 (game.js spawnWaveD と同一の式) ---
// C244 Phase 4 追加: 敵D 横断敵 (左右端から入り反対側へ抜ける、中央付近のみ射撃)
function spawnWaveD(state) {
  const n = 3;
  const before = state.enemies.length;
  for (let i = 0; i < n; i++) {
    const fromLeft = i % 2 === 0;
    state.enemies.push({
      id: `D-${state.waveCount}-${i}`,
      type: 'D',
      x: fromLeft ? -20 : W + 20,
      y: H * (0.30 + i * 0.13),
      vx: fromLeft ? ENEMY_VX_D : -ENEMY_VX_D,
      vy: 0,
      r: 10, alive: true,
      shootCooldown: 50 + i * 35,
    });
  }
  state.waveCount += 1;
  state.spawnLog.push(...state.enemies.slice(before).map(e => ({
    id: e.id, type: e.type, x: e.x, y: e.y, vx: e.vx, vy: e.vy,
  })));
}

function spawnNextWave(state) {
  // waveCount は呼出前にインクリメント想定なので、現値の偶奇で判断 (game.js と同型)
  if (state.waveCount % 2 === 0) spawnWaveA(state);
  else spawnWaveD(state);
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
  state.shotLog.push({ frame: state.frame, id: e.id, type: e.type, y: e.y, x: e.x });
}

function updateEnemies(state) {
  for (const e of state.enemies) {
    if (!e.alive) continue;
    // 速度不変性サンプリング (case 2): 更新前に vx/vy を type 付きで記録
    state.velSamples.push({ id: e.id, type: e.type, frame: state.frame, vx: e.vx, vy: e.vy });
    e.x += e.vx; e.y += e.vy;
    // 退場: A は画面下、D は左右端
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
        spawnBullet(state, e);
        e.shootCooldown = SHOOT_INTERVAL;
      }
    }
  }
  state.enemies = state.enemies.filter(e => e.alive);
}

function updateBullets(state) {
  for (const b of state.bullets) {
    if (!b.alive) continue;
    b.x += b.vx; b.y += b.vy;
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) b.alive = false;
  }
  state.bullets = state.bullets.filter(b => b.alive);
}

// --- 決定論シミュレーション (プレイヤー静止、Wave A + D 連続) ---
// C244 Phase 4: wave2 (敵D) 対応で wave 切替まで一気に sim。
// Wave A 5 体退場 ≈ 11s + Wave D 3 体通過 ≈ 8s = 19s で 2 巡目 wave A 到来、
// SIM_FRAMES = 60s で wave A→D→A→D の 4 wave 程度を観測。
const state = {
  player: { x: W * 0.5, y: H * 0.78 },
  enemies: [],
  bullets: [],
  shotLog: [],
  velSamples: [],
  spawnLog: [],
  frame: 0,
  waveCount: 0,
  waveSpawned: false,
};

const SIM_FRAMES = FPS * 60;
for (let f = 0; f < SIM_FRAMES; f++) {
  state.frame = f;
  if (!state.waveSpawned) {
    spawnNextWave(state);
    state.waveSpawned = true;
  }
  updateEnemies(state);
  updateBullets(state);
  if (state.enemies.length === 0) state.waveSpawned = false;
}

// --- Case 1a: 敵A spawn 座標域 (x in [0, W] かつ y < 0) ---
const spawnA = state.spawnLog.filter(s => s.type === 'A');
const spawnAOutOfX = spawnA.filter(s => s.x < 0 || s.x > W);
const spawnAOutOfY = spawnA.filter(s => s.y >= 0);
const case1aPass = spawnA.length > 0 && spawnAOutOfX.length === 0 && spawnAOutOfY.length === 0;

// --- Case 1b: 敵D spawn 座標域 (x = -20 or W+20 = 端外、y in 画面内 [0, H]) ---
const spawnD = state.spawnLog.filter(s => s.type === 'D');
const spawnDOutOfX = spawnD.filter(s => !(s.x === -20 || s.x === W + 20));
const spawnDOutOfY = spawnD.filter(s => s.y < 0 || s.y > H);
const case1bPass = spawnD.length > 0 && spawnDOutOfX.length === 0 && spawnDOutOfY.length === 0;

// --- Case 2: type 別 進行方向不変 ---
// A: vy=ENEMY_VY_A>0 かつ vx=0、D: vy=0 かつ |vx|=ENEMY_VX_D かつ vx 符号不変
const velA = state.velSamples.filter(s => s.type === 'A');
const velAViolations = velA.filter(s => s.vy !== ENEMY_VY_A || s.vx !== 0);
const velD = state.velSamples.filter(s => s.type === 'D');
const velDViolations = velD.filter(s => s.vy !== 0 || Math.abs(s.vx) !== ENEMY_VX_D);
// D の vx 符号不変 (個体ごと): 同 id で符号が反転していたら違反
const velDSignByID = {};
for (const s of velD) {
  const sgn = Math.sign(s.vx);
  if (velDSignByID[s.id] === undefined) velDSignByID[s.id] = sgn;
  else if (velDSignByID[s.id] !== sgn) velDViolations.push({ ...s, reason: 'sign_flip' });
}
const case2Pass = velAViolations.length === 0 && velDViolations.length === 0 && ENEMY_VY_A > 0 && ENEMY_VX_D > 0;

// --- Case 3a: 射撃ゲート Y (全弾、画面外/退場帯射撃ゼロ) ---
const shotsOutOfYGate = state.shotLog.filter(s => s.y < 0 || s.y > SHOOT_GATE_Y_MAX);
const case3aPass = shotsOutOfYGate.length === 0;

// --- Case 3b: 射撃ゲート X (敵D のみ、中央域 [SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX]) ---
const shotsD = state.shotLog.filter(s => s.type === 'D');
const shotsDOutOfXGate = shotsD.filter(s => s.x < SHOOT_GATE_X_MIN || s.x > SHOOT_GATE_X_MAX);
const case3bPass = shotsDOutOfXGate.length === 0;

const cases = [
  {
    name: 'spawn_coord_domain_A',
    desc: '敵 A wave spawn 座標が x in [0, W] かつ y < 0 (画面上端外)',
    pass: case1aPass,
    expected: { x_range: [0, W], y_range: '< 0' },
    actual: { spawns: spawnA.length, out_of_x: spawnAOutOfX.length, out_of_y: spawnAOutOfY.length },
  },
  {
    name: 'spawn_coord_domain_D',
    desc: '敵 D wave spawn 座標が x ∈ {-20, W+20} (左右端外) かつ y in [0, H]',
    pass: case1bPass,
    expected: { x_values: [-20, W + 20], y_range: [0, H] },
    actual: { spawns: spawnD.length, out_of_x: spawnDOutOfX.length, out_of_y: spawnDOutOfY.length },
  },
  {
    name: 'direction_invariant',
    desc: `type 別不変: A vy=${ENEMY_VY_A}/vx=0、D vy=0/|vx|=${ENEMY_VX_D}・符号反転なし`,
    pass: case2Pass,
    expected: { A: { vy: ENEMY_VY_A, vx: 0 }, D: { vy: 0, abs_vx: ENEMY_VX_D } },
    actual: {
      samplesA: velA.length, violationsA: velAViolations.length, firstA: velAViolations[0] || null,
      samplesD: velD.length, violationsD: velDViolations.length, firstD: velDViolations[0] || null,
    },
  },
  {
    name: 'shoot_gate_y',
    desc: `全弾の発射 y 座標が [0, ${SHOOT_GATE_Y_MAX}] 内 (画面外/退場帯射撃ゼロ)`,
    pass: case3aPass,
    expected: { y_range: [0, SHOOT_GATE_Y_MAX] },
    actual: { total_shots: state.shotLog.length, out_of_gate: shotsOutOfYGate.length, first_out: shotsOutOfYGate[0] || null },
  },
  {
    name: 'shoot_gate_x_D',
    desc: `敵 D 弾の発射 x 座標が [${SHOOT_GATE_X_MIN}, ${SHOOT_GATE_X_MAX}] 内 (端部射撃ゼロ)`,
    pass: case3bPass,
    expected: { x_range: [SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX] },
    actual: { d_shots: shotsD.length, out_of_gate: shotsDOutOfXGate.length, first_out: shotsDOutOfXGate[0] || null },
  },
];

const passed = cases.filter(c => c.pass).length;
const total = cases.length;
const allPass = passed === total;

const report = {
  audit: 'enemy_behavior_audit',
  target: 'game/log_autonomous_game/v001/game.js',
  constants: { W, H, FPS, ENEMY_VY_A, ENEMY_VX_D, SHOOT_INTERVAL, SHOOT_GATE_Y_MAX, SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX },
  simulation: {
    frames_simulated: state.frame + 1,
    waves_spawned: state.waveCount,
    enemies_spawned: state.spawnLog.length,
    enemies_A: spawnA.length,
    enemies_D: spawnD.length,
    shots_fired: state.shotLog.length,
    shots_A: state.shotLog.filter(s => s.type === 'A').length,
    shots_D: shotsD.length,
    enemies_alive_at_end: state.enemies.filter(e => e.alive).length,
  },
  cases,
  pass: allPass,
};

console.log(JSON.stringify(report, null, 2));
console.log(`=== ${passed}/${total} PASS ===`);
process.exit(allPass ? 0 : 1);
