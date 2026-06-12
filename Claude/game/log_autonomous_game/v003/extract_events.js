#!/usr/bin/env node
// extract_events.js — log_autonomous_game v003 最小 event schema (4軸 + 5 kind) 物理化
//
// 目的: C307/C308 (#all-nao-u-lab) で議論した最小 event schema 設計を verify.js の
//   シミュレーションコアにフックして event_log_<strategy>.jsonl として物理化する。
//   Slack 議論を「議論したけど残っていない」状態にせず、コードに落とす (原則6「わかった」と
//   「残った」は違う直処方)。
//
// schema (4 軸):
//   { t: int (frame), kind: string, actor_id: string, payload: object }
//
// 5 kind と発火点:
//   - spawn        : 敵 wave 関数 (spawnWaveA/D/C/Warmup/Main) で enemy push 時、spawnBullet で bullet push 時
//   - despawn      : updateEnemies / updateBullets で alive=false 設定時 (画面外)
//   - collide      : checkCollisions が hit を返した直後 (player×敵 or player×弾)
//   - score_delta  : v003 はスコア機構を持たないため 0 件 (= 仕様。次世代ゲームで本 schema 再利用時に初有効化)
//   - state_change : player alive→dead 1 点のみ。payload = { prev: enum, next: enum } 2 キー固定
//
// state_change 列挙集合:
//   player : "alive" / "dead"
//   (enemy の state_change は本 v003 では発生しない。次世代 schema 拡張点)
//
// actor_id 命名規則 (verify.js spawn 系と同型):
//   - player : "player"
//   - enemy  : "W{wave}-{type}{i}"   例: W1-A0、phase 1 warmup は W1-A0w
//   - bullet : "b{n}"                n = 0 から spawnBullet 順の連番
//
// actor_snapshot.jsonl (C314 Phase 4 追加 — Ash Togelius (4) 空間推論弱さ対策の連続値量化レイヤー):
//   - 連続値 (position / velocity / alive / score プレースホルダ) を frame ごと per actor で出力
//   - schema: { t, actor_id, x, y, vx, vy, alive, score }
//   - event_log と分離し、離散値 (4 軸 schema) と連続値を別レイヤーで保存
//     (C307/C308 議論「actor_snapshot は別ファイルへ逃がす」拡張点を本 C314 Phase 4 で物理化)
//   - 各 update 関数末尾 (updateEnemies / updateBullets / プレイヤー移動後) で発火
//   - v003 はスコア機構を持たないため score は 0 固定 (次世代ゲーム再利用時の placeholder)
//
// 使い方:
//   cd game/log_autonomous_game/v003 && node extract_events.js
//     → event_log_<strategy>.jsonl + actor_snapshot_<strategy>.jsonl 各 4 ファイル
//        (camper / lane-holder / blind-sweeper / nospecial)
//   node extract_events.js --strategy camper
//     → 単一方針のみ
//   node extract_events.js --strategy camper --stdout
//     → event はファイル書き出しせず標準出力。snapshot は --stdout 時はスキップ
//       (snapshot は連続値で行数が多いため debug 流れに混入させない)
//
// verify.js との関係:
//   - verify.js / game.js には一切手を入れない (副作用ゼロ)
//   - シミュレーションコアは verify.js から同型コピー (シード固定 = 20260527、定数完全一致)
//   - 同じ frame で同じ event 系列が再現される (deterministic)

const fs = require('fs');
const path = require('path');

const W = 640, H = 720, FPS = 60;
const BULLET_SPEED = 2.0;
const SHOOT_INTERVAL = 90;
const SHOOT_INTERVAL_PHASE2_MIN = 60;
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
const WAVE_A_STAGGER_Y_DEFAULT = 40;
const WAVE_A_STAGGER_Y_PHASE0 = 168;
const WAVE_REST_FRAMES = FPS * 8;
const WAVE_SUBPHASE_WARMUP_FRAMES = 120;
const MAX_FRAMES = FPS * 90;
const WAVE_TIMELINE = [
  { phaseStart: 0,        phaseEnd: 20 * FPS, types: ['A'] },
  { phaseStart: 20 * FPS, phaseEnd: 50 * FPS, types: ['A', 'D'] },
  { phaseStart: 50 * FPS, phaseEnd: 90 * FPS, types: ['A', 'D', 'C'] },
];

const SEED = 20260527;

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pushEvent(state, kind, actor_id, payload) {
  state.events.push({ t: state.frame, kind, actor_id, payload });
}

function pushSnapshot(state, actor_id, snapshot_dict) {
  state.snapshots.push({ t: state.frame, actor_id, ...snapshot_dict });
}

function snapshotAllActors(state) {
  pushSnapshot(state, 'player', {
    x: state.player.x,
    y: state.player.y,
    vx: state.player.lastVx,
    vy: state.player.lastVy,
    alive: state.player.alive,
    score: 0,
  });
  for (const e of state.enemies) {
    pushSnapshot(state, e.id, {
      x: e.x, y: e.y, vx: e.vx, vy: e.vy, alive: e.alive, score: 0,
    });
  }
  for (const b of state.bullets) {
    pushSnapshot(state, b.id, {
      x: b.x, y: b.y, vx: b.vx, vy: b.vy, alive: b.alive, score: 0,
    });
  }
}

function spawnWaveA(state) {
  const n = 3;
  const staggerY = state.waveCount === 0 ? WAVE_A_STAGGER_Y_PHASE0 : WAVE_A_STAGGER_Y_DEFAULT;
  for (let i = 0; i < n; i++) {
    const e = {
      id: `W${state.waveCount + 1}-A${i}`,
      type: 'A',
      x: W * (0.25 + i * 0.25),
      y: -20 - i * staggerY,
      vx: 0, vy: ENEMY_VY_A,
      r: ENEMY_R, alive: true,
      shootCooldown: 60 + i * 20,
    };
    state.enemies.push(e);
    pushEvent(state, 'spawn', e.id, { type: 'A', x: e.x, y: e.y });
  }
  state.waveSpawned = true;
  state.waveCount += 1;
}

function spawnWaveD(state) {
  const n = 3;
  for (let i = 0; i < n; i++) {
    const fromLeft = i % 2 === 0;
    const e = {
      id: `W${state.waveCount + 1}-D${i}`,
      type: 'D',
      x: fromLeft ? -20 : W + 20,
      y: H * (0.30 + i * 0.13),
      vx: fromLeft ? ENEMY_VX_D : -ENEMY_VX_D,
      vy: 0,
      r: ENEMY_R, alive: true,
      shootCooldown: 50 + i * 35,
    };
    state.enemies.push(e);
    pushEvent(state, 'spawn', e.id, { type: 'D', x: e.x, y: e.y });
  }
  state.waveSpawned = true;
  state.waveCount += 1;
}

function spawnWaveC(state) {
  const n = 2;
  for (let i = 0; i < n; i++) {
    const baseX = W * (0.3 + i * 0.4);
    const e = {
      id: `W${state.waveCount + 1}-C${i}`,
      type: 'C',
      x: baseX, baseX,
      y: -20 - i * 60,
      vx: 0, vy: ENEMY_VY_C,
      r: ENEMY_R, alive: true,
      shootCooldown: 9999,
      spawnFrame: state.frame,
    };
    state.enemies.push(e);
    pushEvent(state, 'spawn', e.id, { type: 'C', x: e.x, y: e.y });
  }
  state.waveSpawned = true;
  state.waveCount += 1;
}

function currentPhase(state) {
  const elapsed = state.frame;
  for (const phase of WAVE_TIMELINE) {
    if (elapsed >= phase.phaseStart && elapsed < phase.phaseEnd) return phase;
  }
  return WAVE_TIMELINE[WAVE_TIMELINE.length - 1];
}

function currentShootInterval(elapsed) {
  const p2 = WAVE_TIMELINE[2];
  if (elapsed < p2.phaseStart) return SHOOT_INTERVAL;
  if (elapsed >= p2.phaseEnd) return SHOOT_INTERVAL_PHASE2_MIN;
  const t = (elapsed - p2.phaseStart) / (p2.phaseEnd - p2.phaseStart);
  const eased = t * t;
  return Math.round(SHOOT_INTERVAL + (SHOOT_INTERVAL_PHASE2_MIN - SHOOT_INTERVAL) * eased);
}

function spawnNextWave(state) {
  const phase = currentPhase(state);
  const type = phase.types[state.waveCount % phase.types.length];
  const isPhase1 = phase.phaseStart === 20 * FPS;
  const isPhase0Wave2Plus = phase.phaseStart === 0 && state.waveCount >= 1;
  const isPhase2C = phase.phaseStart === 50 * FPS && type === 'C';
  if ((isPhase1 && (type === 'A' || type === 'D')) || (isPhase0Wave2Plus && type === 'A') || isPhase2C) {
    spawnWaveWarmup(state, type);
  } else if (type === 'A') {
    spawnWaveA(state);
  } else if (type === 'D') {
    spawnWaveD(state);
  } else if (type === 'C') {
    spawnWaveC(state);
  }
}

function spawnWaveWarmup(state, type) {
  if (type === 'A') {
    const e = {
      id: `W${state.waveCount + 1}-A0w`,
      type: 'A',
      x: W * 0.25,
      y: -20,
      vx: 0, vy: ENEMY_VY_A,
      r: ENEMY_R, alive: true,
      shootCooldown: 60,
    };
    state.enemies.push(e);
    pushEvent(state, 'spawn', e.id, { type: 'A', x: e.x, y: e.y });
  } else if (type === 'D') {
    const e = {
      id: `W${state.waveCount + 1}-D0w`,
      type: 'D',
      x: -20,
      y: H * 0.30,
      vx: ENEMY_VX_D, vy: 0,
      r: ENEMY_R, alive: true,
      shootCooldown: 50,
    };
    state.enemies.push(e);
    pushEvent(state, 'spawn', e.id, { type: 'D', x: e.x, y: e.y });
  } else if (type === 'C') {
    const baseX = W * 0.3;
    const e = {
      id: `W${state.waveCount + 1}-C0w`,
      type: 'C',
      x: baseX, baseX,
      y: -20,
      vx: 0, vy: ENEMY_VY_C,
      r: ENEMY_R, alive: true,
      shootCooldown: 9999,
      spawnFrame: state.frame,
    };
    state.enemies.push(e);
    pushEvent(state, 'spawn', e.id, { type: 'C', x: e.x, y: e.y });
  }
  state.waveSpawned = true;
  state.waveSubPhase = 1;
  state.waveSubPhaseFrame = state.frame;
  state.pendingMainSpawn = type;
}

function spawnWaveMain(state) {
  const type = state.pendingMainSpawn;
  if (type === 'A') {
    const staggerY = state.waveCount === 0 ? WAVE_A_STAGGER_Y_PHASE0 : WAVE_A_STAGGER_Y_DEFAULT;
    for (let i = 1; i < 3; i++) {
      const e = {
        id: `W${state.waveCount + 1}-A${i}`,
        type: 'A',
        x: W * (0.25 + i * 0.25),
        y: -20 - i * staggerY,
        vx: 0, vy: ENEMY_VY_A,
        r: ENEMY_R, alive: true,
        shootCooldown: 60 + i * 20,
      };
      state.enemies.push(e);
      pushEvent(state, 'spawn', e.id, { type: 'A', x: e.x, y: e.y });
    }
    state.waveCount += 1;
  } else if (type === 'D') {
    for (let i = 1; i < 3; i++) {
      const fromLeft = i % 2 === 0;
      const e = {
        id: `W${state.waveCount + 1}-D${i}`,
        type: 'D',
        x: fromLeft ? -20 : W + 20,
        y: H * (0.30 + i * 0.13),
        vx: fromLeft ? ENEMY_VX_D : -ENEMY_VX_D,
        vy: 0,
        r: ENEMY_R, alive: true,
        shootCooldown: 50 + i * 35,
      };
      state.enemies.push(e);
      pushEvent(state, 'spawn', e.id, { type: 'D', x: e.x, y: e.y });
    }
    state.waveCount += 1;
  } else if (type === 'C') {
    const baseX = W * 0.7;
    const e = {
      id: `W${state.waveCount + 1}-C1`,
      type: 'C',
      x: baseX, baseX,
      y: -20 - 1 * 60,
      vx: 0, vy: ENEMY_VY_C,
      r: ENEMY_R, alive: true,
      shootCooldown: 9999,
      spawnFrame: state.frame,
    };
    state.enemies.push(e);
    pushEvent(state, 'spawn', e.id, { type: 'C', x: e.x, y: e.y });
    state.waveCount += 1;
  }
  state.pendingMainSpawn = null;
  state.waveSubPhase = 2;
}

function spawnBullet(state, e) {
  const dx = state.player.x - e.x;
  const dy = state.player.y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  const id = `b${state.nextBulletId}`;
  state.nextBulletId += 1;
  const b = {
    id,
    x: e.x, y: e.y,
    vx: (dx / d) * BULLET_SPEED,
    vy: (dy / d) * BULLET_SPEED,
    r: BULLET_R, alive: true,
  };
  state.bullets.push(b);
  pushEvent(state, 'spawn', id, { type: 'bullet', x: b.x, y: b.y, from: e.id });
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
      if (e.x < -30 || e.x > W + 30) {
        e.alive = false;
        pushEvent(state, 'despawn', e.id, { reason: 'offscreen', x: e.x, y: e.y });
        continue;
      }
    } else {
      if (e.y > H + 30) {
        e.alive = false;
        pushEvent(state, 'despawn', e.id, { reason: 'offscreen', x: e.x, y: e.y });
        continue;
      }
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
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
      b.alive = false;
      pushEvent(state, 'despawn', b.id, { reason: 'offscreen', x: b.x, y: b.y });
    }
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
    if (d < b.r + state.player.r) return { hit: true, by: 'bullet', x: b.x, y: b.y, id: b.id };
  }
  return { hit: false };
}

function clampPlayer(state) {
  state.player.x = Math.max(state.player.r, Math.min(W - state.player.r, state.player.x));
  state.player.y = Math.max(state.player.r, Math.min(H - state.player.r, state.player.y));
}

function strategyCamper(_state, _frame, _rng) { return { dx: 0, dy: 0 }; }
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
    player: { x: W * 0.5, y: H * 0.78, r: PLAYER_R, speed: PLAYER_SPEED, alive: true, lastVx: 0, lastVy: 0 },
    enemies: [],
    bullets: [],
    waveSpawned: false,
    waveCount: 0,
    lastClearFrame: null,
    frame: 0,
    waveSubPhase: 0,
    pendingMainSpawn: null,
    waveSubPhaseFrame: null,
    events: [],
    snapshots: [],
    nextBulletId: 0,
  };
  const rng = mulberry32(seed);

  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    state.frame = frame;
    if (state.waveSpawned && state.enemies.length === 0 && !state.pendingMainSpawn) {
      state.waveSpawned = false;
      state.lastClearFrame = frame;
    }
    const restElapsed = state.waveCount === 0
      || (state.lastClearFrame !== null && frame - state.lastClearFrame >= WAVE_REST_FRAMES);
    if (!state.waveSpawned && restElapsed) spawnNextWave(state);
    if (state.pendingMainSpawn && frame - state.waveSubPhaseFrame >= WAVE_SUBPHASE_WARMUP_FRAMES) {
      spawnWaveMain(state);
    }

    const { dx, dy } = strategyFn(state, frame, rng);
    state.player.lastVx = 0;
    state.player.lastVy = 0;
    if (dx || dy) {
      const n = Math.hypot(dx, dy);
      if (n > 0) {
        const mvx = (dx / n) * state.player.speed;
        const mvy = (dy / n) * state.player.speed;
        state.player.x += mvx;
        state.player.y += mvy;
        state.player.lastVx = mvx;
        state.player.lastVy = mvy;
        clampPlayer(state);
      }
    }

    updateEnemies(state);
    updateBullets(state);
    snapshotAllActors(state);

    const col = checkCollisions(state);
    if (col.hit) {
      pushEvent(state, 'collide', 'player', {
        by: col.by,
        with: col.id || null,
        x: col.x,
        y: col.y,
      });
      pushEvent(state, 'state_change', 'player', { prev: 'alive', next: 'dead' });
      state.player.alive = false;
      return {
        strategy: name,
        outcome: 'gameover',
        survived_frames: frame,
        events: state.events,
        snapshots: state.snapshots,
      };
    }
  }

  return {
    strategy: name,
    outcome: 'survived',
    survived_frames: MAX_FRAMES,
    events: state.events,
    snapshots: state.snapshots,
  };
}

function summarize(events) {
  const counts = {
    spawn: 0,
    despawn: 0,
    collide: 0,
    score_delta: 0,
    state_change: 0,
  };
  for (const e of events) {
    if (counts[e.kind] !== undefined) counts[e.kind] += 1;
  }
  return counts;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let strategy = null;
  let toStdout = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--strategy') { strategy = args[i + 1]; i += 1; }
    else if (args[i] === '--stdout') { toStdout = true; }
  }
  return { strategy, toStdout };
}

function main() {
  const { strategy, toStdout } = parseArgs();
  const names = strategy ? [strategy] : Object.keys(STRATEGIES);
  for (const name of names) {
    const fn = STRATEGIES[name];
    if (!fn) {
      console.error(`unknown strategy: ${name}`);
      process.exit(2);
    }
    const result = runOne(name, fn, SEED);
    const counts = summarize(result.events);
    const lines = result.events.map(e => JSON.stringify(e)).join('\n') + '\n';
    if (toStdout) {
      process.stdout.write(lines);
    } else {
      const outPath = path.join(__dirname, `event_log_${name}.jsonl`);
      fs.writeFileSync(outPath, lines);
      const snapLines = result.snapshots.map(s => JSON.stringify(s)).join('\n') + '\n';
      const snapPath = path.join(__dirname, `actor_snapshot_${name}.jsonl`);
      fs.writeFileSync(snapPath, snapLines);
    }
    const snapInfo = toStdout ? ' (snapshot skipped in stdout mode)' : ` -> event_log_${name}.jsonl, actor_snapshot_${name}.jsonl (snapshots=${result.snapshots.length})`;
    console.error(`[extract_events] strategy=${name} outcome=${result.outcome} survived_frames=${result.survived_frames} events=${result.events.length} kinds=${JSON.stringify(counts)}${snapInfo}`);
  }
}

main();
