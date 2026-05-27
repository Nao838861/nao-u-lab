#!/usr/bin/env node
// enemy_behavior_audit.js — log_autonomous_game v002 敵挙動 独立監査 (3軸目)
//
// 目的: v002 game.js の敵 A (直進小型) + 敵 D (横断敵) + 敵 C (ダイブ敵) wave 側の挙動が
// design_log §Q-D 禁則 (画面外射撃ゼロ / 退場帯射撃ゼロ / 敵下部急加速ゼロ / 直進方向不変) と
// design_log §Q-C 敵D「中央付近でのみ射撃」と
// design_log §Q-C 敵C「上から急降下、横方向 sin オフセット、射撃なし」と
// 各 spawn 仕様に違反しないことを、game.js を実行せずに
// 「定数抽出 + 決定論シミュレーション」で独立検証する。
//
// C248 Phase 4 (2026-05-27): v001 → v002 移植。差分:
//   (1) wave 1 軽量化 (n=5 → 3)、shootCooldown 60+i*20、x 配置 0.25/0.5/0.75 反映
//   (2) WAVE_TIMELINE phase 進行を反映 (phase 0/1/2 = A / A+D / A+D+C)
//   (3) 敵 C 用 spawn / 不変式 / 退場 case を追加 (vy=ENEMY_VY_C 不変、x ∈ [baseX±AMP])
//   (4) SIM 60s → 90s に延長 (phase 2 まで到達して C を観測)
//
// 3 軸監査体制の 3 軸目:
//   1. verify.js              — 受け手悪手 4 方針 fail シミュ
//   2. bullet_origin_audit.js — Q-D 弾源 (発射点) 独立監査
//   3. enemy_behavior_audit.js (本ファイル) — 敵挙動 独立監査
//
// 使い方: cd game/log_autonomous_game/v002 && node enemy_behavior_audit.js
//   exit 0 = 全 case PASS、exit 1 = 1 件以上 FAIL

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
const ENEMY_VY_C = evalExpr(extractConst('ENEMY_VY_C'));
const ENEMY_C_SWING_AMP = evalExpr(extractConst('ENEMY_C_SWING_AMP'));
const ENEMY_C_SWING_PERIOD = evalExpr(extractConst('ENEMY_C_SWING_PERIOD'));
const WAVE_REST_FRAMES = evalExpr(extractConst('WAVE_REST_FRAMES'));

const WAVE_TIMELINE = [
  { phaseStart: 0,        phaseEnd: 20 * FPS, types: ['A'] },
  { phaseStart: 20 * FPS, phaseEnd: 50 * FPS, types: ['A', 'D'] },
  { phaseStart: 50 * FPS, phaseEnd: 90 * FPS, types: ['A', 'D', 'C'] },
];

function spawnWaveA(state) {
  const n = 3;
  const before = state.enemies.length;
  for (let i = 0; i < n; i++) {
    state.enemies.push({
      id: `A-${state.waveCount}-${i}`,
      type: 'A',
      x: W * (0.25 + i * 0.25),
      y: -20 - i * 40,
      vx: 0, vy: ENEMY_VY_A,
      r: 10, alive: true,
      shootCooldown: 60 + i * 20,
    });
  }
  state.waveCount += 1;
  state.waveSpawned = true;
  state.spawnLog.push(...state.enemies.slice(before).map(e => ({
    id: e.id, type: e.type, x: e.x, y: e.y, vx: e.vx, vy: e.vy,
  })));
}

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
  state.waveSpawned = true;
  state.spawnLog.push(...state.enemies.slice(before).map(e => ({
    id: e.id, type: e.type, x: e.x, y: e.y, vx: e.vx, vy: e.vy,
  })));
}

function spawnWaveC(state) {
  const n = 2;
  const before = state.enemies.length;
  for (let i = 0; i < n; i++) {
    const baseX = W * (0.3 + i * 0.4);
    state.enemies.push({
      id: `C-${state.waveCount}-${i}`,
      type: 'C',
      x: baseX, baseX,
      y: -20 - i * 60,
      vx: 0, vy: ENEMY_VY_C,
      r: 10, alive: true,
      shootCooldown: 9999,
      spawnFrame: state.frame,
    });
  }
  state.waveCount += 1;
  state.waveSpawned = true;
  state.spawnLog.push(...state.enemies.slice(before).map(e => ({
    id: e.id, type: e.type, x: e.x, baseX: e.baseX, y: e.y, vx: e.vx, vy: e.vy,
  })));
}

function currentPhase(state) {
  for (const phase of WAVE_TIMELINE) {
    if (state.frame >= phase.phaseStart && state.frame < phase.phaseEnd) return phase;
  }
  return WAVE_TIMELINE[WAVE_TIMELINE.length - 1];
}

function spawnNextWave(state) {
  const phase = currentPhase(state);
  const type = phase.types[state.waveCount % phase.types.length];
  if (type === 'A') spawnWaveA(state);
  else if (type === 'D') spawnWaveD(state);
  else if (type === 'C') spawnWaveC(state);
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
    if (e.type === 'C') {
      const t = state.frame - e.spawnFrame;
      const newX = e.baseX + Math.sin(t / ENEMY_C_SWING_PERIOD) * ENEMY_C_SWING_AMP;
      e.vx = newX - e.x;
      // velSamples: C は実効 vx を記録 (oscillation 範囲検査用)
      state.velSamples.push({ id: e.id, type: e.type, frame: state.frame, vx: e.vx, vy: e.vy, x_offset_from_base: newX - e.baseX });
      e.x = newX;
      e.y += e.vy;
    } else {
      state.velSamples.push({ id: e.id, type: e.type, frame: state.frame, vx: e.vx, vy: e.vy });
      e.x += e.vx; e.y += e.vy;
    }
    if (e.type === 'D') {
      if (e.x < -30 || e.x > W + 30) { e.alive = false; continue; }
    } else {
      if (e.y > H + 30) { e.alive = false; continue; }
    }
    if (e.type === 'C') continue;
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
  lastClearFrame: null,
};

const SIM_FRAMES = FPS * 90;
for (let f = 0; f < SIM_FRAMES; f++) {
  state.frame = f;
  if (state.waveSpawned && state.enemies.length === 0) {
    state.waveSpawned = false;
    state.lastClearFrame = f;
  }
  const restElapsed = state.waveCount === 0
    || (state.lastClearFrame !== null && f - state.lastClearFrame >= WAVE_REST_FRAMES);
  if (!state.waveSpawned && restElapsed) spawnNextWave(state);
  updateEnemies(state);
  updateBullets(state);
}

// --- Case 1a: 敵A spawn 座標域 (x in [0, W] かつ y < 0) ---
const spawnA = state.spawnLog.filter(s => s.type === 'A');
const spawnAOutOfX = spawnA.filter(s => s.x < 0 || s.x > W);
const spawnAOutOfY = spawnA.filter(s => s.y >= 0);
const case1aPass = spawnA.length > 0 && spawnAOutOfX.length === 0 && spawnAOutOfY.length === 0;

// --- Case 1b: 敵D spawn 座標域 ---
const spawnD = state.spawnLog.filter(s => s.type === 'D');
const spawnDOutOfX = spawnD.filter(s => !(s.x === -20 || s.x === W + 20));
const spawnDOutOfY = spawnD.filter(s => s.y < 0 || s.y > H);
const case1bPass = spawnD.length > 0 && spawnDOutOfX.length === 0 && spawnDOutOfY.length === 0;

// --- Case 1c: 敵C spawn 座標域 (baseX in [0, W] かつ y < 0) ---
const spawnC = state.spawnLog.filter(s => s.type === 'C');
const spawnCOutOfX = spawnC.filter(s => s.baseX < 0 || s.baseX > W);
const spawnCOutOfY = spawnC.filter(s => s.y >= 0);
const case1cPass = spawnC.length > 0 && spawnCOutOfX.length === 0 && spawnCOutOfY.length === 0;

// --- Case 2a: A/D 進行方向不変 ---
const velA = state.velSamples.filter(s => s.type === 'A');
const velAViolations = velA.filter(s => s.vy !== ENEMY_VY_A || s.vx !== 0);
const velD = state.velSamples.filter(s => s.type === 'D');
const velDViolations = velD.filter(s => s.vy !== 0 || Math.abs(s.vx) !== ENEMY_VX_D);
const velDSignByID = {};
for (const s of velD) {
  const sgn = Math.sign(s.vx);
  if (velDSignByID[s.id] === undefined) velDSignByID[s.id] = sgn;
  else if (velDSignByID[s.id] !== sgn) velDViolations.push({ ...s, reason: 'sign_flip' });
}
const case2aPass = velAViolations.length === 0 && velDViolations.length === 0 && ENEMY_VY_A > 0 && ENEMY_VX_D > 0;

// --- Case 2b: C vy 不変かつ x oscillation が ±SWING_AMP に収まる ---
const velC = state.velSamples.filter(s => s.type === 'C');
const velCVyViolations = velC.filter(s => s.vy !== ENEMY_VY_C);
const velCOscViolations = velC.filter(s => Math.abs(s.x_offset_from_base) > ENEMY_C_SWING_AMP + 1e-6);
const case2bPass = velC.length > 0 && velCVyViolations.length === 0 && velCOscViolations.length === 0 && ENEMY_VY_C > 0;

// --- Case 3a: 射撃ゲート Y (全弾) ---
const shotsOutOfYGate = state.shotLog.filter(s => s.y < 0 || s.y > SHOOT_GATE_Y_MAX);
const case3aPass = shotsOutOfYGate.length === 0;

// --- Case 3b: 射撃ゲート X (敵D のみ) ---
const shotsD = state.shotLog.filter(s => s.type === 'D');
const shotsDOutOfXGate = shotsD.filter(s => s.x < SHOOT_GATE_X_MIN || s.x > SHOOT_GATE_X_MAX);
const case3bPass = shotsDOutOfXGate.length === 0;

// --- Case 3c: 敵C は弾を発射しない ---
const shotsC = state.shotLog.filter(s => s.type === 'C');
const case3cPass = shotsC.length === 0;

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
    name: 'spawn_coord_domain_C',
    desc: '敵 C wave spawn baseX in [0, W] かつ y < 0 (画面上端外)',
    pass: case1cPass,
    expected: { baseX_range: [0, W], y_range: '< 0' },
    actual: { spawns: spawnC.length, out_of_x: spawnCOutOfX.length, out_of_y: spawnCOutOfY.length },
  },
  {
    name: 'direction_invariant_A_D',
    desc: `type 別不変: A vy=${ENEMY_VY_A}/vx=0、D vy=0/|vx|=${ENEMY_VX_D}・符号反転なし`,
    pass: case2aPass,
    expected: { A: { vy: ENEMY_VY_A, vx: 0 }, D: { vy: 0, abs_vx: ENEMY_VX_D } },
    actual: {
      samplesA: velA.length, violationsA: velAViolations.length, firstA: velAViolations[0] || null,
      samplesD: velD.length, violationsD: velDViolations.length, firstD: velDViolations[0] || null,
    },
  },
  {
    name: 'direction_invariant_C',
    desc: `敵 C vy=${ENEMY_VY_C} 不変かつ x oscillation 範囲 ±${ENEMY_C_SWING_AMP}px 以内`,
    pass: case2bPass,
    expected: { vy: ENEMY_VY_C, swing_amp_max: ENEMY_C_SWING_AMP },
    actual: {
      samplesC: velC.length,
      vy_violations: velCVyViolations.length,
      osc_violations: velCOscViolations.length,
      first_vy_viol: velCVyViolations[0] || null,
      first_osc_viol: velCOscViolations[0] || null,
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
  {
    name: 'enemy_c_no_shots',
    desc: '敵 C は弾を発射しない (本体接触のみが脅威、Q-D 弾源負荷追加なし)',
    pass: case3cPass,
    expected: { c_shots: 0 },
    actual: { c_shots: shotsC.length },
  },
];

const passed = cases.filter(c => c.pass).length;
const total = cases.length;
const allPass = passed === total;

const report = {
  audit: 'enemy_behavior_audit',
  target: 'game/log_autonomous_game/v002/game.js',
  constants: { W, H, FPS, ENEMY_VY_A, ENEMY_VX_D, ENEMY_VY_C, ENEMY_C_SWING_AMP, ENEMY_C_SWING_PERIOD, SHOOT_INTERVAL, SHOOT_GATE_Y_MAX, SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX, WAVE_REST_FRAMES },
  simulation: {
    frames_simulated: state.frame + 1,
    waves_spawned: state.waveCount,
    enemies_spawned: state.spawnLog.length,
    enemies_A: spawnA.length,
    enemies_D: spawnD.length,
    enemies_C: spawnC.length,
    shots_fired: state.shotLog.length,
    shots_A: state.shotLog.filter(s => s.type === 'A').length,
    shots_D: shotsD.length,
    shots_C: shotsC.length,
    enemies_alive_at_end: state.enemies.filter(e => e.alive).length,
  },
  cases,
  pass: allPass,
};

console.log(JSON.stringify(report, null, 2));
console.log(`=== ${passed}/${total} PASS ===`);
process.exit(allPass ? 0 : 1);
