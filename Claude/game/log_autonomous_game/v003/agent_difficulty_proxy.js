#!/usr/bin/env node
// agent_difficulty_proxy.js — log_autonomous_game v003 LLM-agent 難易度プロキシ runner (4 軸目)
//
// C263 Phase 4 (2026-05-29): v002 → v003 移植。差分:
//   (1) currentShootInterval(elapsed) 関数を追加移植 (phase 2 内 90→60 frame 線形漸変)
//   (2) updateEnemies 内の e.shootCooldown = SHOOT_INTERVAL を currentShootInterval(state.frame) に置換
//   (3) SHOOT_INTERVAL_PHASE2_MIN 定数抽出
//   target を v003/game.js に変更
//
// 出典: Chang Xiao, Brenda Z. Yang
//   "LLMs May Not Be Human-Level Players, But They Can Be Testers:
//    Measuring Game Difficulty with LLM Agents" arXiv:2410.02829 (2024-10-01)
//   - Wordle: agent 平均推測回数 vs 人間平均 Pearson r=0.624 (p<10^-3)
//   - Slay the Spire (Act 1): agent 残存 HP 比率 vs 人間ボス突破率 Pearson r=0.871 (p<10^-3)
//
// 目的: v002 の「素朴良手 agent」を 30 試行 (各 90秒 = 5400 フレーム) 走らせ、
//       4 指標 (clear_wave / residual_hp_ratio / play_time_sec / graze_count) の
//       中央値を JSON で出す。v001 ⇄ v002 で同じ runner を回せば 4 指標差分が
//       「人間体感難易度の変化の代理」になる。
//
// C248 Phase 4 (2026-05-27): v001 → v002 移植。差分:
//   (1) wave 1 軽量化 (n=5 → 3) + WAVE_TIMELINE phase 進行を反映
//   (2) 敵 C (ダイブ敵、射撃なし、x oscillation) を追加
//   (3) wave 間 8 秒静寂ガード反映
//   (4) MAX_FRAMES 60s → 90s 拡張 (phase 2 まで到達)
//
// 既存 audit / runner 体系における位置 (4 軸目):
//   1. verify.js              — 悪手 4 方針 fail シミュ
//   2. bullet_origin_audit.js — Q-D 弾源 独立監査
//   3. enemy_behavior_audit.js — 敵挙動 独立監査
//   4. agent_difficulty_proxy.js (本ファイル) — 良手 1 方針 中央値 4 指標 計測
//
// 使い方: cd game/log_autonomous_game/v002 && node agent_difficulty_proxy.js
//   exit 0 = 30 試行全完走、exit 1 = 全試行が frame=0 で死ぬ等の frame 計算破綻
//
// C271 Phase 4 (2026-05-30): マルチシード化対応。CLI 引数:
//   --seed-base N    : 各 trial の seed = N + i (default 20260527)
//   --noise-scale F  : 移動 noise 振幅 (default 0.25)
// build_proxy_csv.js 側から SEED ループでこの runner を 10 回叩く。

const fs = require('fs');
const path = require('path');

function parseArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx === process.argv.length - 1) return fallback;
  const v = process.argv[idx + 1];
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const SRC_PATH = path.join(__dirname, 'game.js');
const src = fs.readFileSync(SRC_PATH, 'utf8');

const W = 640;
const H = 720;
const FPS = 60;
const MAX_FRAMES = FPS * 90; // 90 秒 = 5400 F
const TRIALS = 30;

function extractConst(name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*([^;]+?);`);
  const m = src.match(re);
  if (!m) throw new Error(`const ${name} not found in game.js`);
  return m[1].trim();
}
function evalExpr(expr) {
  return Function('W', 'H', 'FPS', `return (${expr});`)(W, H, FPS);
}

const ECHO_FRAMES = evalExpr(extractConst('ECHO_FRAMES'));
const BULLET_SPEED = evalExpr(extractConst('BULLET_SPEED'));
const SHOOT_INTERVAL = evalExpr(extractConst('SHOOT_INTERVAL'));
const SHOOT_INTERVAL_PHASE2_MIN = evalExpr(extractConst('SHOOT_INTERVAL_PHASE2_MIN'));
const SHOOT_GATE_Y_MAX = evalExpr(extractConst('SHOOT_GATE_Y_MAX'));
const SHOOT_GATE_X_MIN = evalExpr(extractConst('SHOOT_GATE_X_MIN'));
const SHOOT_GATE_X_MAX = evalExpr(extractConst('SHOOT_GATE_X_MAX'));
const ENEMY_VY_A = evalExpr(extractConst('ENEMY_VY_A'));
const ENEMY_VX_D = evalExpr(extractConst('ENEMY_VX_D'));
const ENEMY_VY_C = evalExpr(extractConst('ENEMY_VY_C'));
const ENEMY_C_SWING_AMP = evalExpr(extractConst('ENEMY_C_SWING_AMP'));
const ENEMY_C_SWING_PERIOD = evalExpr(extractConst('ENEMY_C_SWING_PERIOD'));
const WAVE_REST_FRAMES = evalExpr(extractConst('WAVE_REST_FRAMES'));

const playerSpeedMatch = src.match(/player\s*:\s*\{[^}]*speed\s*:\s*([0-9.]+)/);
if (!playerSpeedMatch) throw new Error('player.speed not found in game.js');
const PLAYER_SPEED = parseFloat(playerSpeedMatch[1]);

// C264 Phase 4 強化 agent 暫定値: phase 2 (50-90s) 到達率を上げるための agent 単独 boost。
// game.js は変えず agent 側だけ 1.5 倍化 → proxy の測定解像度向上を狙う。
// 退路: phase 2 到達ゼロのまま=不十分 / 30/30 全クリア=強すぎ 1.2-1.3 倍に下げる。
const PLAYER_SPEED_STRENGTH = 1.5;
const PLAYER_SPEED_AGENT = PLAYER_SPEED * PLAYER_SPEED_STRENGTH;

const PLAYER_R = 8;
const ENEMY_R = 10;
const BULLET_R = 4;
const GRAZE_DIST = (PLAYER_R + BULLET_R) * 2.5;
const CAST_GAP_FRAMES = ECHO_FRAMES * 2;

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
  state.waveCount += 1;
  state.waveSpawned = true;
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
  state.waveCount += 1;
  state.waveSpawned = true;
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
  state.waveCount += 1;
  state.waveSpawned = true;
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

// v003: phase 2 (50-90s) 内で SHOOT_INTERVAL を 90 → 60 frame に線形漸変
function currentShootInterval(elapsed) {
  const p2 = WAVE_TIMELINE[2];
  if (elapsed < p2.phaseStart) return SHOOT_INTERVAL;
  if (elapsed >= p2.phaseEnd) return SHOOT_INTERVAL_PHASE2_MIN;
  const t = (elapsed - p2.phaseStart) / (p2.phaseEnd - p2.phaseStart);
  return Math.round(SHOOT_INTERVAL + (SHOOT_INTERVAL_PHASE2_MIN - SHOOT_INTERVAL) * t);
}

function spawnBullet(state, e) {
  const dx = state.player.x - e.x;
  const dy = state.player.y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  state.bullets.push({
    id: state.nextBulletId++,
    x: e.x, y: e.y,
    vx: (dx / d) * BULLET_SPEED,
    vy: (dy / d) * BULLET_SPEED,
    r: BULLET_R, alive: true,
    grazed: false,
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
    if (e.type === 'C') continue;
    const inYGate = e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX;
    const inXGate = e.type !== 'D' || (e.x >= SHOOT_GATE_X_MIN && e.x <= SHOOT_GATE_X_MAX);
    if (inYGate && inXGate) {
      e.shootCooldown -= 1;
      if (e.shootCooldown <= 0) {
        spawnBullet(state, e);
        e.shootCooldown = currentShootInterval(state.frame);
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
    if (d < e.r + state.player.r) return { hit: true, by: 'enemy', id: e.id };
  }
  for (const b of state.bullets) {
    const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if (d < b.r + state.player.r) return { hit: true, by: 'bullet', id: b.id };
  }
  return { hit: false };
}

function countGrazes(state) {
  for (const b of state.bullets) {
    if (!b.alive || b.grazed) continue;
    const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if (d < GRAZE_DIST && d >= b.r + state.player.r) {
      b.grazed = true;
      state.grazeCount += 1;
    }
  }
}

function clampPlayer(state) {
  state.player.x = Math.max(state.player.r, Math.min(W - state.player.r, state.player.x));
  state.player.y = Math.max(state.player.r, Math.min(H - state.player.r, state.player.y));
}

const MOVE_NOISE_SCALE = parseArg('--noise-scale', 0.25);
const SEED_BASE = parseArg('--seed-base', 20260527);

function naiveGoodHandMove(state, rng) {
  let dx = 0, dy = 0;
  let nearestT = null, nearestD = Infinity;
  for (const b of state.bullets) {
    if (!b.alive) continue;
    const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if (d < nearestD) { nearestD = d; nearestT = b; }
  }
  for (const e of state.enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(e.x - state.player.x, e.y - state.player.y);
    if (d < nearestD) { nearestD = d; nearestT = e; }
  }
  if (nearestT) {
    const fx = state.player.x - nearestT.x;
    const fy = state.player.y - nearestT.y;
    const n = Math.hypot(fx, fy) || 1;
    dx = fx / n;
    dy = fy / n;
  }
  const cx = W * 0.5, cy = H * 0.78;
  const tx = cx - state.player.x;
  const ty = cy - state.player.y;
  const tn = Math.hypot(tx, ty) || 1;
  dx += (tx / tn) * 0.25;
  dy += (ty / tn) * 0.25;
  dx += (rng() - 0.5) * 2 * MOVE_NOISE_SCALE;
  dy += (rng() - 0.5) * 2 * MOVE_NOISE_SCALE;
  const m = Math.hypot(dx, dy);
  if (m > 0) {
    dx /= m; dy /= m;
    state.player.x += dx * PLAYER_SPEED_AGENT;
    state.player.y += dy * PLAYER_SPEED_AGENT;
  }
  clampPlayer(state);
}

function castLock(state) {
  if (state.echo) return false;
  if (state.trail.length < ECHO_FRAMES) return false;
  const path = state.trail.slice(-ECHO_FRAMES).map(p => ({ x: p.x, y: p.y }));
  state.echo = { startFrame: state.frame, path, hit: false };
  state.castCount += 1;
  return true;
}

function updateEcho(state) {
  if (!state.echo) return;
  const elapsed = state.frame - state.echo.startFrame;
  if (elapsed >= ECHO_FRAMES) {
    if (state.echo.hit) state.lockResults.miss += 1;
    else state.lockResults.hit += 1;
    state.lastEchoEndFrame = state.frame;
    state.echo = null;
    return;
  }
  const p = state.echo.path[elapsed];
  if (p) {
    state.player.x = p.x;
    state.player.y = p.y;
  }
}

function runOne(seed) {
  const state = {
    player: { x: W * 0.5, y: H * 0.78, r: PLAYER_R },
    enemies: [],
    bullets: [],
    trail: [],
    echo: null,
    waveSpawned: false,
    waveCount: 0,
    grazeCount: 0,
    castCount: 0,
    lockResults: { hit: 0, miss: 0 },
    lastEchoEndFrame: -CAST_GAP_FRAMES,
    lastClearFrame: null,
    nextBulletId: 1,
    frame: 0,
  };
  const rng = mulberry32(seed);

  let deathFrame = null;
  let deathCause = null;

  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    state.frame = frame;

    // cast 試行
    if (!state.echo && state.trail.length >= ECHO_FRAMES &&
        frame - state.lastEchoEndFrame >= CAST_GAP_FRAMES) {
      castLock(state);
    }

    // 移動 (echo 中はスキップ)
    if (!state.echo) {
      naiveGoodHandMove(state, rng);
      state.trail.push({ x: state.player.x, y: state.player.y });
      if (state.trail.length > ECHO_FRAMES * 2) state.trail.shift();
    }

    updateEcho(state);

    // wave 管理 (v002 差分: WAVE_TIMELINE + 8 秒静寂)
    if (state.waveSpawned && state.enemies.length === 0) {
      state.waveSpawned = false;
      state.lastClearFrame = frame;
    }
    const restElapsed = state.waveCount === 0
      || (state.lastClearFrame !== null && frame - state.lastClearFrame >= WAVE_REST_FRAMES);
    if (!state.waveSpawned && restElapsed) spawnNextWave(state);

    updateEnemies(state);
    updateBullets(state);
    countGrazes(state);
    const col = checkCollisions(state);
    if (col.hit) {
      if (state.echo) state.echo.hit = true;
      deathFrame = frame;
      deathCause = col.by;
      break;
    }
  }

  const survived = deathFrame === null;
  const endFrame = survived ? MAX_FRAMES : deathFrame;
  return {
    seed,
    outcome: survived ? 'survived' : 'gameover',
    death_cause: deathCause,
    clear_wave: state.waveCount,
    residual_hp_ratio: survived ? 1.0 : 0.0,
    play_time_sec: Number((endFrame / FPS).toFixed(2)),
    graze_count: state.grazeCount,
    cast_count: state.castCount,
    lock_hit: state.lockResults.hit,
    lock_miss: state.lockResults.miss,
  };
}

function median(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  const n = s.length;
  if (n === 0) return null;
  if (n % 2 === 1) return s[(n - 1) / 2];
  return (s[n / 2 - 1] + s[n / 2]) / 2;
}

function main() {
  const trials = [];
  for (let i = 0; i < TRIALS; i++) {
    trials.push(runOne(SEED_BASE + i));
  }

  const allInstantDeath = trials.every(t => t.play_time_sec < 0.05);

  const report = {
    audit: 'agent_difficulty_proxy',
    target: 'game/log_autonomous_game/v003/game.js',
    source: 'arXiv:2410.02829 (Wordle r=0.624 / Slay the Spire r=0.871, Pearson, p<10^-3)',
    thesis: '素朴良手 agent (Space 約2秒に1回 castLock + 中央バイアス nospecial 移動) 30 試行 4 指標中央値で v002 を計測',
    trials_count: trials.length,
    max_frames: MAX_FRAMES,
    max_seconds: MAX_FRAMES / FPS,
    cast_gap_frames: CAST_GAP_FRAMES,
    graze_distance_px: GRAZE_DIST,
    wave_rest_frames: WAVE_REST_FRAMES,
    wave_timeline: WAVE_TIMELINE,
    extracted_params: {
      ECHO_FRAMES, BULLET_SPEED, SHOOT_INTERVAL, SHOOT_INTERVAL_PHASE2_MIN, SHOOT_GATE_Y_MAX, SHOOT_GATE_X_MIN, SHOOT_GATE_X_MAX, PLAYER_SPEED, ENEMY_VY_A, ENEMY_VX_D, ENEMY_VY_C, ENEMY_C_SWING_AMP, ENEMY_C_SWING_PERIOD,
      PLAYER_SPEED_STRENGTH, PLAYER_SPEED_AGENT,
      SEED_BASE, MOVE_NOISE_SCALE,
    },
    median_clear_wave: median(trials.map(t => t.clear_wave)),
    median_residual_hp_ratio: median(trials.map(t => t.residual_hp_ratio)),
    median_play_time_sec: median(trials.map(t => t.play_time_sec)),
    median_graze_count: median(trials.map(t => t.graze_count)),
    survival_rate: trials.filter(t => t.outcome === 'survived').length / trials.length,
    death_cause_breakdown: trials.reduce((acc, t) => {
      const k = t.death_cause || 'survived';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}),
    all_trials: trials,
    limits: [
      '人間体感難易度との Pearson 相関は未測定、3 サイクル運用後に Nao_u 体感ランキング vs proxy ランキング合致で妥当性判定',
      '論文 (Wordle / Slay the Spire) はターン制、v002 はリアルタイム弾避け = 構造違いリスクあり',
      '本数値は self_judgment の 3→4 暫定昇格根拠まで。確定 5 採点は実機判定依存',
      'residual_hp_ratio は 1-hit kill のため binary (1.0/0.0)、HP system 導入時に連続値化',
      '素朴良手 agent には MOVE_NOISE_SCALE=0.25 の方向微小ノイズあり、seed 差で結果分散が出る',
    ],
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(allInstantDeath ? 1 : 0);
}

main();
