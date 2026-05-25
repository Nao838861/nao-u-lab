#!/usr/bin/env node
// verify.js — log_autonomous_game v001 悪手 4 種 fail シミュレータ
//
// 目的: 4 つの「悪手プレイ方針」(camper / lane-holder / blind-sweeper / nospecial)
// が 30 秒以内に必ず gameover に到達することを確認する自己批判検証。
// Pulse Relay v003 教師差分の核命題「悪いプレイ方針を設計の自己批判装置として使う」
// を本ファイルで物理化する。bullet_origin_audit.js (Q-D 弾発射側の独立監査) の対として、
// プレイヤー受け手側の設計健全性をシミュレートする 2 軸目。
//
// 使い方: cd game/log_autonomous_game/v001 && node verify.js
//   exit 0 = 4 方針全 gameover (設計の自己批判検証成功)
//   exit 1 = いずれか方針生存 (= 悪手のはずなのに生残れる = 設計穴の指標、
//            self_judgment 追記候補)
//
// What this proves:
//   - camper (静止): 直撃敵 (i=2 が同 x=320) に必ず接触
//   - lane-holder (縦軸往復): 横軸方向の弾と直撃敵を回避不能
//   - blind-sweeper (ランダム): 統計的に長く生残不可
//   - nospecial (衝突回避 AI のみ、castLock 不使用): 移動だけでは弾密度に対応不可
// What this does NOT prove:
//   - 「良い手」で生残可能か (= 良手検証ではない)
//   - 実機ブラウザの体感難易度 (実機判定の代替ではない)
//   - castLock 機構の機能保証 (本検証は castLock 抜きで全滅することのみ示す)

const W = 640, H = 720, FPS = 60;
const BULLET_SPEED = 2.0;
const SHOOT_INTERVAL = 90;
const SHOOT_GATE_Y_MAX = H * 0.85; // 612
const PLAYER_SPEED = 3.4;
const PLAYER_R = 8;
const ENEMY_R = 10;
const BULLET_R = 4;
const ENEMY_VY = 1.4;
const MAX_FRAMES = FPS * 30; // 30 秒 = 1800 F

// seeded PRNG (mulberry32) — blind-sweeper の再現性確保
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spawnWaveA(state) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    state.enemies.push({
      id: `W${state.waveCount + 1}-A${i}`,
      x: W * (0.15 + i * 0.175),
      y: -20 - i * 40,
      vx: 0, vy: ENEMY_VY,
      r: ENEMY_R, alive: true,
      shootCooldown: 30 + i * 20,
    });
  }
  state.waveSpawned = true;
  state.waveCount += 1;
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

// --- 4 strategies ---
// 全方針共通の悪手条件: castLock を一度も発動しない (= echo 機構不使用)
// 返却: { dx, dy } 単位ベクトル前の方向。dx=dy=0 で静止。

function strategyCamper(_state, _frame, _rng) {
  // 初期位置 (W*0.5, H*0.78) で完全静止。最弱の悪手。
  return { dx: 0, dy: 0 };
}

function strategyLaneHolder(state, frame, _rng) {
  // 縦軸ピンポン: 60F 上 → 60F 下 を繰り返す。横軸ゼロ。
  // 同 x の敵 i=2 (x=320) と必ずぶつかる。
  const phase = Math.floor(frame / 60) % 2;
  return { dx: 0, dy: phase === 0 ? -1 : 1 };
}

function strategyBlindSweeper(_state, _frame, rng) {
  // 各フレームで dx/dy をランダム化 (-1, 0, +1 の 9 通り)。
  // seed 固定で再現性確保。状況を読まないので統計的に死ぬ。
  const dx = Math.floor(rng() * 3) - 1;
  const dy = Math.floor(rng() * 3) - 1;
  return { dx, dy };
}

function strategyNospecial(state, _frame, _rng) {
  // 最近接「脅威」(弾 or 敵) から逃げる単純ルール。castLock は発動しない。
  // 弾だけでなく敵も脅威に含める (敵 r=10 で接触ダメージ大きいため)。
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
  };
  const rng = mulberry32(seed);

  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    // Wave 管理: 1 Wave 退場後に次 Wave (game.js と同型、frame % 2 ゲートは省略)
    if (!state.waveSpawned) spawnWaveA(state);
    if (state.waveSpawned && state.enemies.length === 0) state.waveSpawned = false;

    // Player movement (castLock 不使用、毎フレーム strategyFn で方向決定)
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

const SEED = 20260525;
const results = [];
for (const name of Object.keys(STRATEGIES)) {
  results.push(runOne(name, STRATEGIES[name], SEED));
}

const allDied = results.every(r => r.outcome === 'gameover');
const survivors = results.filter(r => r.outcome === 'survived').map(r => r.strategy);

const report = {
  audit: 'verify_bad_strategies',
  target: 'game/log_autonomous_game/v001/game.js',
  thesis: '悪手 4 方針は 30 秒以内に必ず死ぬ — 死なないものは設計穴の指標',
  max_frames: MAX_FRAMES,
  max_seconds: MAX_FRAMES / FPS,
  seed: SEED,
  results,
  pass: allDied,
  survivors,
  note: allDied
    ? '全 4 方針が gameover に到達。castLock 不使用の悪手は設計通り全滅。'
    : `生存方針: ${survivors.join(', ')} — 「悪手なのに生残れる」= 設計穴候補。self_judgment §3 へ追記検討。`,
  limits: [
    'verify.js は悪手検証であり、良手検証ではない',
    '実機判定の代替ではない',
    'castLock を発動しないことが全方針共通の悪手条件',
  ],
};

console.log(JSON.stringify(report, null, 2));
process.exit(allDied ? 0 : 1);
