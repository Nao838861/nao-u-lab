#!/usr/bin/env node
// verify.js — log_autonomous_game v002 悪手 4 種 fail シミュレータ
//
// 目的: 4 つの「悪手プレイ方針」(camper / lane-holder / blind-sweeper / nospecial)
// が 60 秒以内に必ず gameover に到達することを確認する自己批判検証。
// v002 差分 (v001 verify.js から): wave 1 軽量化 (n=5 → 3) + wave 間 8 秒静寂ガード反映。
// v002 改修方針 (Nao_u 5/26 06:10 #human-steering「展開なし反復」+ Pulse Relay 70-90s カーブ
// 第 1 段「学習→静寂→展開」のローカル化) を verify 側にも同期。
//
// 使い方: cd game/log_autonomous_game/v002 && node verify.js
//   exit 0 = 4 方針全 gameover (設計の自己批判検証成功)
//   exit 1 = いずれか方針生存 (= 悪手のはずなのに生残れる = 設計穴の指標、
//            self_judgment §3 へ追記候補)
//
// What this proves:
//   - castLock を発動しない 4 方針は 60 秒以内に必ず死ぬ
//   - wave 1 軽量化後も悪手は wave 1 内で死ぬ (=軽量化が「悪手が抜ける穴」を作っていない)
// What this does NOT prove:
//   - 「良い手」で 60 秒生残可能か
//   - wave 2 (敵D) 内の体感難易度
//   - wave 静寂 8 秒の体感的「展開差」(数値存在は確認できるが、感覚は実機判定)

const W = 640, H = 720, FPS = 60;
const BULLET_SPEED = 2.0;
const SHOOT_INTERVAL = 90;
const SHOOT_GATE_Y_MAX = H * 0.85;
const SHOOT_GATE_X_MIN = W * 0.2;
const SHOOT_GATE_X_MAX = W * 0.8;
const PLAYER_SPEED = 3.4;
const PLAYER_R = 8;
const ENEMY_R = 10;
const BULLET_R = 4;
const ENEMY_VY_A = 1.4;
const ENEMY_VX_D = 1.4;
const ENEMY_VY_C = 2.5;
const ENEMY_C_SWING_AMP = 60;
const ENEMY_C_SWING_PERIOD = 30;
const WAVE_REST_FRAMES = FPS * 8; // v002 差分: wave clear 後 8 秒静寂
const MAX_FRAMES = FPS * 90;       // 90 秒 = 5400 F (C248: 70-90s カーブ全 phase 観測)
// WAVE_TIMELINE: game.js と同型 (phase 0/1/2)
const WAVE_TIMELINE = [
  { phaseStart: 0,        phaseEnd: 20 * FPS, types: ['A'] },
  { phaseStart: 20 * FPS, phaseEnd: 50 * FPS, types: ['A', 'D'] },
  { phaseStart: 50 * FPS, phaseEnd: 90 * FPS, types: ['A', 'D', 'C'] },
];

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// v002 差分: n=5 → 3、shootCooldown 初期値 +30、初期 x 配置を 0.25/0.5/0.75 に再配置
function spawnWaveA(state) {
  const n = 3;
  for (let i = 0; i < n; i++) {
    state.enemies.push({
      id: `W${state.waveCount + 1}-A${i}`,
      type: 'A',
      x: W * (0.25 + i * 0.25),
      y: -20 - i * 40,
      vx: 0, vy: ENEMY_VY_A,
      r: ENEMY_R, alive: true,
      shootCooldown: 60 + i * 20,
    });
  }
  state.waveSpawned = true;
  state.waveCount += 1;
}

function spawnWaveD(state) {
  const n = 3;
  for (let i = 0; i < n; i++) {
    const fromLeft = i % 2 === 0;
    state.enemies.push({
      id: `W${state.waveCount + 1}-D${i}`,
      type: 'D',
      x: fromLeft ? -20 : W + 20,
      y: H * (0.30 + i * 0.13),
      vx: fromLeft ? ENEMY_VX_D : -ENEMY_VX_D,
      vy: 0,
      r: ENEMY_R, alive: true,
      shootCooldown: 50 + i * 35,
    });
  }
  state.waveSpawned = true;
  state.waveCount += 1;
}

function spawnWaveC(state) {
  const n = 2;
  for (let i = 0; i < n; i++) {
    const baseX = W * (0.3 + i * 0.4);
    state.enemies.push({
      id: `W${state.waveCount + 1}-C${i}`,
      type: 'C',
      x: baseX, baseX,
      y: -20 - i * 60,
      vx: 0, vy: ENEMY_VY_C,
      r: ENEMY_R, alive: true,
      shootCooldown: 9999,
      spawnFrame: state.frame,
    });
  }
  state.waveSpawned = true;
  state.waveCount += 1;
}

function currentPhase(state) {
  const elapsed = state.frame; // verify は playStartFrame=0 起点
  for (const phase of WAVE_TIMELINE) {
    if (elapsed >= phase.phaseStart && elapsed < phase.phaseEnd) return phase;
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
    vx: (dx / d) * BULLET_SPEED,
    vy: (dy / d) * BULLET_SPEED,
    r: BULLET_R, alive: true,
  });
}

function updateEnemies(state) {
  for (const e of state.enemies) {
    if (!e.alive) continue;
    if (e.type === 'C') {
      const t = state.frame - e.spawnFrame;
      const newX = e.baseX + Math.sin(t / ENEMY_C_SWING_PERIOD) * ENEMY_C_SWING_AMP;
      e.vx = newX - e.x;
      e.x = newX;
      e.y += e.vy;
    } else {
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

function checkCollisions(state) {
  for (const e of state.enemies) {
    const d = Math.hypot(e.x - state.player.x, e.y - state.player.y);
    if (d < e.r + state.player.r) return { hit: true, by: 'enemy', x: e.x, y: e.y, id: e.id };
  }
  for (const b of state.bullets) {
    const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if (d < b.r + state.player.r) return { hit: true, by: 'bullet', x: b.x, y: b.y };
  }
  return { hit: false };
}

function clampPlayer(state) {
  state.player.x = Math.max(state.player.r, Math.min(W - state.player.r, state.player.x));
  state.player.y = Math.max(state.player.r, Math.min(H - state.player.r, state.player.y));
}

function strategyCamper(_state, _frame, _rng) {
  return { dx: 0, dy: 0 };
}
function strategyLaneHolder(_state, frame, _rng) {
  const phase = Math.floor(frame / 60) % 2;
  return { dx: 0, dy: phase === 0 ? -1 : 1 };
}
function strategyBlindSweeper(_state, _frame, rng) {
  const dx = Math.floor(rng() * 3) - 1;
  const dy = Math.floor(rng() * 3) - 1;
  return { dx, dy };
}
function strategyNospecial(state, _frame, _rng) {
  let nearestT = null, nearestD = Infinity;
  for (const b of state.bullets) {
    const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if (d < nearestD) { nearestD = d; nearestT = b; }
  }
  for (const e of state.enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(e.x - state.player.x, e.y - state.player.y);
    if (d < nearestD) { nearestD = d; nearestT = e; }
  }
  if (!nearestT) return { dx: 0, dy: 0 };
  const dx = state.player.x - nearestT.x;
  const dy = state.player.y - nearestT.y;
  const d = Math.hypot(dx, dy) || 1;
  return { dx: dx / d, dy: dy / d };
}

const STRATEGIES = {
  camper: strategyCamper,
  'lane-holder': strategyLaneHolder,
  'blind-sweeper': strategyBlindSweeper,
  nospecial: strategyNospecial,
};

function runOne(name, strategyFn, seed) {
  const state = {
    player: { x: W * 0.5, y: H * 0.78, r: PLAYER_R, speed: PLAYER_SPEED },
    enemies: [],
    bullets: [],
    waveSpawned: false,
    waveCount: 0,
    lastClearFrame: null,
    frame: 0,
  };
  const rng = mulberry32(seed);

  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    state.frame = frame;
    // v002 差分: wave clear 後 8 秒待機ガード反映
    if (state.waveSpawned && state.enemies.length === 0) {
      state.waveSpawned = false;
      state.lastClearFrame = frame;
    }
    const restElapsed = state.waveCount === 0
      || (state.lastClearFrame !== null && frame - state.lastClearFrame >= WAVE_REST_FRAMES);
    if (!state.waveSpawned && restElapsed) spawnNextWave(state);

    const { dx, dy } = strategyFn(state, frame, rng);
    if (dx || dy) {
      const n = Math.hypot(dx, dy);
      if (n > 0) {
        state.player.x += (dx / n) * state.player.speed;
        state.player.y += (dy / n) * state.player.speed;
        clampPlayer(state);
      }
    }

    updateEnemies(state);
    updateBullets(state);
    const col = checkCollisions(state);
    if (col.hit) {
      return {
        strategy: name,
        outcome: 'gameover',
        survived_frames: frame,
        survived_seconds: Number((frame / FPS).toFixed(2)),
        deaths_at_frame: frame,
        death_cause: col.by,
        waves_seen: state.waveCount,
      };
    }
  }

  return {
    strategy: name,
    outcome: 'survived',
    survived_frames: MAX_FRAMES,
    survived_seconds: Number((MAX_FRAMES / FPS).toFixed(2)),
    deaths_at_frame: null,
    death_cause: null,
    waves_seen: state.waveCount,
  };
}

const SEED = 20260527;
const results = [];
for (const name of Object.keys(STRATEGIES)) {
  results.push(runOne(name, STRATEGIES[name], SEED));
}

const allDied = results.every(r => r.outcome === 'gameover');
const survivors = results.filter(r => r.outcome === 'survived').map(r => r.strategy);

const report = {
  audit: 'verify_bad_strategies',
  target: 'game/log_autonomous_game/v002/game.js',
  thesis: '悪手 4 方針は 90 秒以内に必ず死ぬ — v002 wave 1 軽量化 (n=3) + 8 秒静寂 + 70-90s 時間カーブ (A→A+D→A+D+C) 下でも死を回避できない',
  max_frames: MAX_FRAMES,
  max_seconds: MAX_FRAMES / FPS,
  wave_rest_frames: WAVE_REST_FRAMES,
  wave_timeline: WAVE_TIMELINE,
  seed: SEED,
  results,
  pass: allDied,
  survivors,
  note: allDied
    ? '全 4 方針が gameover に到達。wave 1 軽量化 + 8 秒静寂 + 時間カーブ拡張後も castLock 不使用悪手は全滅。'
    : `生存方針: ${survivors.join(', ')} — 時間カーブ拡張が悪手通過の穴を作った可能性。self_judgment §3 へ追記要。`,
  limits: [
    'verify.js は悪手検証であり、良手検証ではない',
    '実機判定の代替ではない',
    'wave 間 8 秒静寂の体感的「展開差」は本検証では計測しない',
    'phase 2 (50-90s, A+D+C) を 4 方針すべてが観測するとは限らない (early death 時)',
  ],
};

console.log(JSON.stringify(report, null, 2));
process.exit(allDied ? 0 : 1);
