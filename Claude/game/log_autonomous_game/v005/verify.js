#!/usr/bin/env node
// verify.js — log_autonomous_game v005 悪手 fail + 弾源 0% Echo 単独緊張 audit
//
// v005 改修ポイント: lockFlash 描画の連続 erase 視覚段階化のみ追加 (game.js +10〜15 行)。
//   game ロジック (castLock 中 erase / 経済反転ガード / 弾源依存) は v004 と完全同一のため、
//   本 verify.js の構造的 pass 条件 (default 4 悪手 fail + bullet-density-zero (a)(b)(c)) は変動しない。
//
// 目的:
//   (default) v003 既存 4 悪手方針 (camper / lane-holder / blind-sweeper / nospecial)
//             が 90 秒以内に gameover 到達 = v004→v005 段階化追加後も悪手は救済されない
//             (= regression test — v004 既存検証穴を v005 で塞がない確認)
//   (--bullet-density-zero) SHOOT_INTERVAL = Infinity で 5 方針 (上 4 種 + Echo-spam) を 90 秒走らせ
//             全方針生存 + Echo-spam の bulletsErased=0 = Echo 単独で緊張が成立していないことの
//             構造的確認 (graze_log v01 同型事故予兆検出、design_log §3 §1 直接物理化)
//
// 使い方:
//   node verify.js                          → default mode (regression test)
//   node verify.js --bullet-density-zero    → 弾源 0% 緊張成立テスト
//   exit 0 = pass / exit 1 = fail
//
// What this proves (default):
//   - v003 から弾消し追加だけでは castLock 不使用悪手は救済されない
// What this proves (--bullet-density-zero):
//   - 弾源 0% 環境では 5 方針すべてが 90 秒生存 = 弾源以外で死ぬ穴が無い
//   - Echo-spam が bulletsErased=0 = 弾源が無いと弾消し報酬は発火しない
//     → 「Echo 単独で緊張が成立する」自発コア化を構造的に排除
// What this does NOT prove:
//   - 「良い手」で 90 秒生残可能か
//   - 弾消し体感 (= 黄色 flash の知覚) — 実機判定
//   - 経済反転 audit §2 (敵を倒さない方が得になっていないか) — 次サイクル拡張対象

// --- CLI ---
const CLI_ARGS = process.argv.slice(2);
const BULLET_DENSITY_ZERO = CLI_ARGS.includes('--bullet-density-zero');

const W = 640, H = 720, FPS = 60;
const BULLET_SPEED = 2.0;
const SHOOT_INTERVAL = 90;             // phase 0/1 既定 / phase 2 初値
const SHOOT_INTERVAL_PHASE2_MIN = 60;  // v003: phase 2 末尾 (=90s) で 60 frame = 1.0秒間隔
const ECHO_FRAMES = 60;                // v005: castLock 1 秒 = 60 frame (game.js と同型、v004 と変更なし)
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

// v003: game.js currentShootInterval と完全同型 (phase 2 内 90→60 線形漸変)
// v004 --bullet-density-zero: Infinity 返却 = 弾を一切撃たない (= shootCooldown が減算されても 0 以下に到達しない)
function currentShootInterval(elapsed) {
  if (BULLET_DENSITY_ZERO) return Infinity;
  const p2 = WAVE_TIMELINE[2];
  if (elapsed < p2.phaseStart) return SHOOT_INTERVAL;
  if (elapsed >= p2.phaseEnd) return SHOOT_INTERVAL_PHASE2_MIN;
  const t = (elapsed - p2.phaseStart) / (p2.phaseEnd - p2.phaseStart);
  return Math.round(SHOOT_INTERVAL + (SHOOT_INTERVAL_PHASE2_MIN - SHOOT_INTERVAL) * t);
}

function spawnNextWave(state) {
  const phase = currentPhase(state);
  const type = phase.types[state.waveCount % phase.types.length];
  if (type === 'A') spawnWaveA(state);
  else if (type === 'D') spawnWaveD(state);
  else if (type === 'C') spawnWaveC(state);
}

function spawnBullet(state, e) {
  // v004 --bullet-density-zero: 弾を一切撃たない (shootCooldown は減算されるが spawn 自体をスキップ)
  if (BULLET_DENSITY_ZERO) return;
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
  // 敵本体は echo 中でも貫通させない (= castLock を強引な突撃武器に転用させない、design_log §2.A.1)
  for (const e of state.enemies) {
    const d = Math.hypot(e.x - state.player.x, e.y - state.player.y);
    if (d < e.r + state.player.r) return { hit: true, by: 'enemy', x: e.x, y: e.y, id: e.id };
  }
  for (const b of state.bullets) {
    if (!b.alive) continue;
    const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if (d < b.r + state.player.r) {
      // v004 案 A: castLock 中の弾接触は erase + bulletsErased 加算、death 報告しない
      if (state.echo) {
        b.alive = false;
        state.bulletsErased += 1;
        continue;
      }
      return { hit: true, by: 'bullet', x: b.x, y: b.y };
    }
  }
  return { hit: false };
}

// v004: castLock 発動 (game.js castLock と同型: trail >= ECHO_FRAMES でのみ成功、echo 中は無視)
function tryCastLock(state, frame) {
  if (state.echo) return false;
  if (state.trail.length < ECHO_FRAMES) return false;
  const path = state.trail.slice(-ECHO_FRAMES).map(p => ({ x: p.x, y: p.y }));
  state.echo = { startFrame: frame, path };
  state.echoCasts += 1;
  return true;
}

// v004: echo 経過更新 (game.js updateEcho と同型: ECHO_FRAMES 経過で resolve、それまでは path 上を follow)
function updateEcho(state, frame) {
  if (!state.echo) return;
  const elapsed = frame - state.echo.startFrame;
  if (elapsed >= ECHO_FRAMES) { state.echo = null; return; }
  const p = state.echo.path[elapsed];
  if (p) { state.player.x = p.x; state.player.y = p.y; }
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

// v004: Echo-spam — 毎 frame Space 要求 (実際の castLock 発火は trail 蓄積 + 非echo 中の制約で受理される時のみ)。
// 移動は camper と同型 (停止) = 「Echo 連打しか変えない」純粋差分。bullet-density-zero 下で
// camper と Echo-spam の生存/bulletsErased を比較し、Echo 単独で報われていないことを確認する。
function strategyEchoSpam(_state, _frame, _rng) {
  return { dx: 0, dy: 0, space: true };
}

// default mode (regression): v003 と同じ 4 悪手のみ。--bullet-density-zero 時は Echo-spam を加えた 5 方針。
const STRATEGIES_BASE = {
  camper: strategyCamper,
  'lane-holder': strategyLaneHolder,
  'blind-sweeper': strategyBlindSweeper,
  nospecial: strategyNospecial,
};
const STRATEGIES = BULLET_DENSITY_ZERO
  ? Object.assign({}, STRATEGIES_BASE, { 'echo-spam': strategyEchoSpam })
  : STRATEGIES_BASE;

function runOne(name, strategyFn, seed) {
  const state = {
    player: { x: W * 0.5, y: H * 0.78, r: PLAYER_R, speed: PLAYER_SPEED },
    enemies: [],
    bullets: [],
    waveSpawned: false,
    waveCount: 0,
    lastClearFrame: null,
    frame: 0,
    // v004: echo / 弾消し追跡
    trail: [],
    echo: null,
    echoCasts: 0,
    bulletsErased: 0,
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

    const req = strategyFn(state, frame, rng);
    const dx = req.dx || 0, dy = req.dy || 0;
    const wantSpace = !!req.space;

    // v004: castLock 要求は移動より先に処理 (game.js step 順序と同型: spaceEdge → updatePlayer → updateEcho)
    if (wantSpace) tryCastLock(state, frame);

    if (!state.echo) {
      // 通常移動 (echo 中はプレイヤー入力ロック = game.js updatePlayer 早期 return と同型)
      if (dx || dy) {
        const n = Math.hypot(dx, dy);
        if (n > 0) {
          state.player.x += (dx / n) * state.player.speed;
          state.player.y += (dy / n) * state.player.speed;
          clampPlayer(state);
        }
      }
      // trail 蓄積は移動後 (game.js updatePlayer 末尾と同型)
      state.trail.push({ x: state.player.x, y: state.player.y });
      if (state.trail.length > ECHO_FRAMES * 2) state.trail.shift();
    } else {
      updateEcho(state, frame); // path 上を follow + ECHO_FRAMES 経過で echo=null
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
        echo_casts: state.echoCasts,
        bullets_erased: state.bulletsErased,
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
    echo_casts: state.echoCasts,
    bullets_erased: state.bulletsErased,
  };
}

const SEED = 20260527;
const results = [];
for (const name of Object.keys(STRATEGIES)) {
  results.push(runOne(name, STRATEGIES[name], SEED));
}

let pass, note;
let survivors = results.filter(r => r.outcome === 'survived').map(r => r.strategy);
let deaths = results.filter(r => r.outcome === 'gameover').map(r => r.strategy);

if (BULLET_DENSITY_ZERO) {
  // 構造的テスト (design_log §3 §1 改訂):
  //   (a) 全方針 bulletsErased=0 = 弾源 0% なら弾消し報酬は 1 度も発火しない (= 報酬経路は外発依存)
  //   (b) echo-spam.death_frame === camper.death_frame = 「Echo 連打」が「Echo 非発動」と完全に等価
  //       (= Echo を打っても死亡時刻すら変わらない = Echo 単独で得失は一切動かない)
  //   (c) 移動系方針 (blind-sweeper / nospecial) が 90 秒生存 = 弾以外の経路で死ぬ穴は移動で回避可能
  //       (= 静止方針が enemy 接触で死ぬのは弾源と独立、案 A 案件ではない)
  // 初版 (C253 Phase 4) は「5 方針全生存」を pass 条件にしていたが、SHOOT_INTERVAL=Infinity でも
  // 敵 A は vy=1.4 で縦進行し続けるため静止方針は frame ~430 で接触死する。これは案 A 弾消し
  // 機構とは独立の構造で、staging 初版の pass 条件が「弾源 0% なら何も死なない」と過剰仮定して
  // いたため改訂した。本テストの本丸は (a)+(b)。
  const allErasedZero = results.every(r => r.bullets_erased === 0);
  const echoSpam = results.find(r => r.strategy === 'echo-spam');
  const camper = results.find(r => r.strategy === 'camper');
  const echoSpamMatchesCamper = echoSpam && camper
    && echoSpam.outcome === camper.outcome
    && echoSpam.survived_frames === camper.survived_frames;
  const movingSurvived = ['blind-sweeper', 'nospecial']
    .every(n => results.find(r => r.strategy === n && r.outcome === 'survived'));
  pass = allErasedZero && echoSpamMatchesCamper && movingSurvived;
  if (pass) {
    note = '弾源 0% で (a) 全方針 bulletsErased=0 (b) Echo-spam と camper が同フレーム死亡'
      + ' (c) 移動系 2 方針が 90 秒生存 = Echo 単独で報酬経路も死亡時刻も動かない。'
      + ' graze_log v01 同型事故予兆を構造的に否定。静止方針の敵接触死は弾源と独立の別軸。';
  } else if (!allErasedZero) {
    const offender = results.find(r => r.bullets_erased > 0);
    note = `弾源 0% にも関わらず ${offender.strategy} の bullets_erased=${offender.bullets_erased} ≠ 0`
      + ' = 実装ミスか BULLET_DENSITY_ZERO gate 漏れ。';
  } else if (!echoSpamMatchesCamper) {
    note = `Echo-spam と camper の死亡時刻/結果が一致しない: echo-spam=${echoSpam.outcome}@${echoSpam.survived_frames}f`
      + ` vs camper=${camper.outcome}@${camper.survived_frames}f = Echo を打つだけで何かが変わっている`
      + ' = 自発コア化兆候、設計巻き戻し対象。';
  } else {
    note = '移動系方針が 90 秒生存しなかった = 弾以外の経路で全方針が死ぬ穴あり (弾源 0% でも回避不可)'
      + ' = wave / 敵速度の基礎パラメータに問題、design_log §3 §1 で点検要。';
  }
} else {
  // 期待: 4 方針全死亡 (v003 regression test と同じ意味、v004 弾消し追加が悪手を救済していないことの確認)
  pass = results.every(r => r.outcome === 'gameover');
  note = pass
    ? '全 4 方針が gameover に到達。v004 案 A 弾消し追加後も castLock 不使用悪手は救済されない。'
    : `生存方針: ${survivors.join(', ')} — v004 弾消し追加が悪手通過の穴を作った可能性 (regression failure)。`;
}

const report = {
  audit: BULLET_DENSITY_ZERO ? 'verify_bullet_density_zero' : 'verify_bad_strategies',
  target: 'game/log_autonomous_game/v005/game.js',
  mode: BULLET_DENSITY_ZERO ? 'bullet-density-zero' : 'default',
  thesis: BULLET_DENSITY_ZERO
    ? '弾源 0% (SHOOT_INTERVAL=Infinity) で 5 方針 (4 悪手 + Echo-spam) 全生存 かつ Echo-spam の bulletsErased=0 = Echo 単独で緊張も報酬も成立しない'
    : 'v003 既存 4 悪手方針は v004 案 A 弾消し追加後も 90 秒以内に必ず死ぬ (regression test)',
  max_frames: MAX_FRAMES,
  max_seconds: MAX_FRAMES / FPS,
  wave_rest_frames: WAVE_REST_FRAMES,
  wave_timeline: WAVE_TIMELINE,
  shoot_interval_phase01: SHOOT_INTERVAL,
  shoot_interval_phase2_end: SHOOT_INTERVAL_PHASE2_MIN,
  echo_frames: ECHO_FRAMES,
  seed: SEED,
  results,
  pass,
  survivors,
  deaths,
  note,
  limits: [
    'verify.js は悪手検証 + 弾源 0% 構造確認であり、良手検証ではない',
    '実機判定の代替ではない',
    'BULLET_DENSITY_ZERO モードでは弾消し体感 (黄色 flash の知覚) は計測しない',
    '経済反転 audit §2 (敵を倒さない vs 倒すの score 比較) は本サイクル未実装 (案 A score 非接続のため意味希薄、案 B/D 実装時に拡張)',
    'phase 2 (50-90s, A+D+C) を 4 方針すべてが観測するとは限らない (early death 時)',
  ],
};

console.log(JSON.stringify(report, null, 2));
process.exit(pass ? 0 : 1);
