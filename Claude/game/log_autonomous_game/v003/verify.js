#!/usr/bin/env node
// verify.js — log_autonomous_game v003 悪手 4 種 fail シミュレータ
//
// 目的: 4 つの「悪手プレイ方針」(camper / lane-holder / blind-sweeper / nospecial)
// が 90 秒以内に必ず gameover に到達することを確認する自己批判検証。
// v003 差分 (v002 verify.js から): phase 2 (50-90s) 内で SHOOT_INTERVAL を 90 → 60 frame 漸変。
//   currentShootInterval(elapsed) を game.js と同型で実装し、密度カーブ追加後も悪手 4 方針が
//   全 wave 内で死ぬこと (= 密度カーブが「悪手通過の穴」を作っていない) を確認する。
//   C313 Phase 4 (2026-06-08): 漸変曲線 ease-in (t²) → linear に差し戻し。境界値は維持、悪手検証無影響。
// C298 Phase 4 (H-004) 差分: phase 1 (20-50s) wave 内 2 段階 ease-in (warmup 1 体 + 120F 後 main 2 体)。
//   game.js と完全同型で実装。悪手 4 方針は phase 0 (wave 1) 内死亡で phase 1 非到達のため、
//   本変更は survived_frames に影響しない (H-002/H-003 同型論証 3 度目、bit 完全一致期待)。
// C302 Phase 4 (H-006) 差分: phase 2 (50-90s) type C も 2 段階 ease-in に拡張 (warmup 1 体 + 120F 後 main 1 体)。
//   game.js と完全同型で実装。悪手 4 方針は phase 0 (≤ 545F = 9.08s) 内死亡で phase 2 (3000F+) 非到達のため、
//   本変更も survived_frames に影響しない (H-004/H-005 同型論証 5 度目、bit 完全一致期待)。
// C311 Phase 4 (H-007) 差分: instinct trigger 発火率計測軸を追加 (4 方針 + good 全体に純並列 read-only probe)。
//   instinct trigger = 任意の弾が INSTINCT_TRIGGER_PX (=50px) 以内に入った rising edge (前frame外→今frame内)。
//   定義根拠: instinct_probe.js は castLock 発動条件 (trail 充填 + cooldown) を本能 trigger とするが、本 verify.js
//     悪手 4 方針は castLock 機構を持たないため non-applicable。代替として「近接危険検知 (proximity rising edge)」を
//     instinct trigger proxy として採用 (staging C311 Phase 3 §着手手順 参照)。
//   設計意図: Togelius (IEEE Spectrum, Ash C307 cross-cut) 「LLM が code では優れゲームでは失敗する非対称
//     = フィードバック構造の貧弱さ」洞察への v003 物理処方。フィードバック軸 (min_approach_p10 + cont_grazing_max)
//     に 3 本目「instinct trigger 発火数」を加え、4 方針ごとに「本能トリガーがどの程度引き出されているか」を分離観測。
//     §I 補強 (MaRS reflective consolidation 多重化) の game レーン射影 = フィードバック多重化 1mm。
//   副作用ゼロ確証: bullet object に内部フラグ `_instinctNear` を追加するが、collision/motion は (x,y,vx,vy,r) のみ
//     参照するため gameplay logic に一切影響しない (H-002/H-003/H-004/H-005/H-006 同型論証 6 度目、bit 完全一致期待)。
// C311 Phase 4 (本来) 差分: temporal_inconsistency_probe を追加 (4 方針 + good 全体に純並列 read-only probe)。
//   定義: 弾発射時の player 位置 = "予測末端" (predicted ghost target)。弾消滅時 (画面外 or 衝突) の実末端位置との
//     Euclidean 距離が TEMPORAL_INCONSISTENCY_THRESHOLD_PX (=15px) を超えた弾を 1 inconsistency としてカウント。
//   設計根拠: shared-reads C311 投稿で立ち上げた「VLM 4 失敗 taxonomy → v003 audit 翻訳」軸の 2 本目射影
//     (1 本目 = H-007 instinct_trigger は visual_intensity_bias × confidence_miscalibration 間接捕捉、
//      本 probe = temporal_inconsistency 直接物理化)。VLM 「時間的整合性の予測失敗」 = 「ghost target が動いた後の
//     世界を予測できない」を、本能反射ゲームの「弾発射時に決まる予測末端 vs 実末端」距離で代理測定する。
//   閾値設計: 15px = player_r (=8) × 2 + bullet_r (=4) - 5px = 「予測 ghost が外れたと認知される最小単位」。
//     player 直径 16px ＋ bullet 直径 8px の半分程度＝「衝突したかどうか」の判定窓に近い距離尺度。
//   副作用ゼロ確証: bullet object に内部フラグ `_predictedEndX`/`_predictedEndY` を追加するが、collision/motion は
//     (x,y,vx,vy,r) のみ参照するため gameplay logic に一切影響しない (H-002〜H-007 同型論証 7 度目、bit 完全一致期待
//      = camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545)。
//
// 使い方: cd game/log_autonomous_game/v003 && node verify.js
//   exit 0 = 4 方針全 gameover (設計の自己批判検証成功)
//   exit 1 = いずれか方針生存 (= 悪手のはずなのに生残れる = 設計穴の指標、
//            self_judgment §3 へ追記候補)
//
// What this proves:
//   - castLock を発動しない 4 方針は 90 秒以内に必ず死ぬ
//   - 密度カーブ漸変 (90→60 frame) 追加後も悪手は wave 内で死ぬ
//     (= 密度カーブが「悪手通過の穴」を作っていない)
// What this does NOT prove:
//   - 「良い手」で 90 秒生残可能か
//   - 密度カーブ漸変の体感 (「圧迫の増加が感じられるか」は実機判定)
//   - phase 2 早期死亡で漸変区間を観測しない可能性 (= 漸変が悪手の死亡時刻を早めるか未測定)

const W = 640, H = 720, FPS = 60;
const BULLET_SPEED = 2.0;
const SHOOT_INTERVAL = 90;             // phase 0/1 既定 / phase 2 初値
const SHOOT_INTERVAL_PHASE2_MIN = 60;  // v003: phase 2 末尾 (=90s) で 60 frame = 1.0秒間隔
const SHOOT_GATE_Y_MAX = H * 0.85;
const SHOOT_GATE_X_MIN = W * 0.2;
const SHOOT_GATE_X_MAX = W * 0.8;
const PLAYER_SPEED = 3.4;
const PLAYER_R = 8;
const ENEMY_R = 10;
const BULLET_R = 4;
// C306 Phase 4: Shikhondo "how close" proxy 計測 (min_approach + cont_grazing)
// 閾値 = player_r + bullet_r + 8px = 20px (= 「ニアミス」体感ライン、center-to-center 換算)
const GRAZE_THRESHOLD_PX = 20;
// C311 Phase 4: instinct trigger proxy 計測閾値。50px = bullet ~15F 後到達距離 (反応時間 ~250ms) + player_r + bullet_r 余裕。
// 設計値根拠: BULLET_SPEED (=2.0) × 15F = 30px (反応時間中の弾移動) + player_r (=8) + bullet_r (=4) + 8px 認知マージン = 50px。
// この距離内に弾が入った瞬間 = 「反応すべき距離」 = 本能 trigger 発火タイミング。
// C313 Phase 4: env (INSTINCT_TRIGGER_PX) または --sensitivity-sweep モードで外部化。デフォルトは 50。
let INSTINCT_TRIGGER_PX = (() => {
  const env = process.env.INSTINCT_TRIGGER_PX;
  if (env === undefined || env === '') return 50;
  const v = Number(env);
  return Number.isFinite(v) && v > 0 ? v : 50;
})();
// C311 Phase 4 (本来): temporal_inconsistency_probe 閾値。15px = player 直径 16px ＋ bullet 半径 4px 弱 (= 衝突窓近傍)。
// 弾発射時の player 位置 (= predicted ghost target) と弾消滅時の実末端位置の Euclidean 距離が
// この値を超えた弾を「予測末端と実末端の時間的不整合 1 件」としてカウント。
// C316 Phase 4: env (TEMPORAL_INCONSISTENCY_THRESHOLD_PX) または --temporal-sensitivity-sweep モードで外部化。デフォルトは 15。
let TEMPORAL_INCONSISTENCY_THRESHOLD_PX = (() => {
  const env = process.env.TEMPORAL_INCONSISTENCY_THRESHOLD_PX;
  if (env === undefined || env === '') return 15;
  const v = Number(env);
  return Number.isFinite(v) && v > 0 ? v : 15;
})();
const ENEMY_VY_A = 1.4;
const ENEMY_VX_D = 1.4;
const ENEMY_VY_C = 2.5;
const ENEMY_C_SWING_AMP = 60;
const ENEMY_C_SWING_PERIOD = 30;
// v003 C276 (Log Phase 4): H-001 Q-導入 teaser 用 stagger 定数 (game.js と同型)
const WAVE_A_STAGGER_Y_DEFAULT = 40;
const WAVE_A_STAGGER_Y_PHASE0 = 168;
const WAVE_REST_FRAMES = FPS * 8; // v002 差分: wave clear 後 8 秒静寂
// C298 Phase 4 H-004 (Log): phase 1 wave 内 2 段階 ease-in。warmup → main 間隔 (game.js と同型)
const WAVE_SUBPHASE_WARMUP_FRAMES = 120;
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
  // H-001: phase 0 第 1 wave のみ y-stagger 拡大 (game.js spawnWaveA と同型)
  const staggerY = state.waveCount === 0 ? WAVE_A_STAGGER_Y_PHASE0 : WAVE_A_STAGGER_Y_DEFAULT;
  for (let i = 0; i < n; i++) {
    state.enemies.push({
      id: `W${state.waveCount + 1}-A${i}`,
      type: 'A',
      x: W * (0.25 + i * 0.25),
      y: -20 - i * staggerY,
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

// v003: game.js currentShootInterval と完全同型 (phase 2 内 90→60 漸変)
// C293 Phase 4: linear → ease-in (t²) に変更。境界値は維持。
// C313 Phase 4: ease-in (t²) → linear に差し戻し (実機 A/B 比較の B 側再現)。
// 悪手 4 方針は phase 0 で死亡するため、phase 2 曲線形状変更は本悪手検証に影響しない。
function currentShootInterval(elapsed) {
  const p2 = WAVE_TIMELINE[2];
  if (elapsed < p2.phaseStart) return SHOOT_INTERVAL;
  if (elapsed >= p2.phaseEnd) return SHOOT_INTERVAL_PHASE2_MIN;
  const t = (elapsed - p2.phaseStart) / (p2.phaseEnd - p2.phaseStart);
  return Math.round(SHOOT_INTERVAL + (SHOOT_INTERVAL_PHASE2_MIN - SHOOT_INTERVAL) * t);
}

function spawnNextWave(state) {
  const phase = currentPhase(state);
  const type = phase.types[state.waveCount % phase.types.length];
  // H-004 (C298): phase 1 のみ 2 段階 ease-in。phase 0/2 + type C は単段 spawn 維持。
  // H-005 (C300): phase 0 wave 2+ (waveCount >= 1) も 2 段階 ease-in に拡張 (game.js と完全同型)。
  //   悪手 4 方針は phase 0 wave 1 内死亡 = wave 2 spawn 非到達のため、本判定拡張は survived_frames に影響しない。
  // H-006 (C302 Phase 4): phase 2 (phaseStart = 50*FPS = 3000F) 内 type C も 2 段階 ease-in に拡張。
  //   悪手 4 方針は phase 0 (≤ 1200F) で死亡 = phase 2 spawn 非到達のため、本判定拡張も survived_frames に影響しない。
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

// H-004: phase 1 wave 内 warmup spawn (game.js spawnWaveWarmup と同型)
function spawnWaveWarmup(state, type) {
  if (type === 'A') {
    const staggerY = state.waveCount === 0 ? WAVE_A_STAGGER_Y_PHASE0 : WAVE_A_STAGGER_Y_DEFAULT;
    state.enemies.push({
      id: `W${state.waveCount + 1}-A0w`,
      type: 'A',
      x: W * 0.25,
      y: -20,
      vx: 0, vy: ENEMY_VY_A,
      r: ENEMY_R, alive: true,
      shootCooldown: 60,
    });
    void staggerY; // game.js と論証一致 (悪手は phase 0 で死亡、phase 1 未到達)
  } else if (type === 'D') {
    state.enemies.push({
      id: `W${state.waveCount + 1}-D0w`,
      type: 'D',
      x: -20,
      y: H * 0.30,
      vx: ENEMY_VX_D, vy: 0,
      r: ENEMY_R, alive: true,
      shootCooldown: 50,
    });
  } else if (type === 'C') {
    // H-006 (C302 Phase 4): phase 2 type C warmup (game.js と同型)。
    const baseX = W * 0.3;
    state.enemies.push({
      id: `W${state.waveCount + 1}-C0w`,
      type: 'C',
      x: baseX, baseX,
      y: -20,
      vx: 0, vy: ENEMY_VY_C,
      r: ENEMY_R, alive: true,
      shootCooldown: 9999,
      spawnFrame: state.frame,
    });
  }
  state.waveSpawned = true;
  state.waveSubPhase = 1;
  state.waveSubPhaseFrame = state.frame;
  state.pendingMainSpawn = type;
}

// H-004: phase 1 wave 内 main spawn (game.js spawnWaveMain と同型)
function spawnWaveMain(state) {
  const type = state.pendingMainSpawn;
  if (type === 'A') {
    const staggerY = state.waveCount === 0 ? WAVE_A_STAGGER_Y_PHASE0 : WAVE_A_STAGGER_Y_DEFAULT;
    for (let i = 1; i < 3; i++) {
      state.enemies.push({
        id: `W${state.waveCount + 1}-A${i}`,
        type: 'A',
        x: W * (0.25 + i * 0.25),
        y: -20 - i * staggerY,
        vx: 0, vy: ENEMY_VY_A,
        r: ENEMY_R, alive: true,
        shootCooldown: 60 + i * 20,
      });
    }
    state.waveCount += 1;
  } else if (type === 'D') {
    for (let i = 1; i < 3; i++) {
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
  } else if (type === 'C') {
    // H-006 main (game.js と同型): i=1 のみ spawn, baseX=W*0.7, y=-20-60.
    const baseX = W * 0.7;
    state.enemies.push({
      id: `W${state.waveCount + 1}-C1`,
      type: 'C',
      x: baseX, baseX,
      y: -20 - 1 * 60,
      vx: 0, vy: ENEMY_VY_C,
      r: ENEMY_R, alive: true,
      shootCooldown: 9999,
      spawnFrame: state.frame,
    });
    state.waveCount += 1;
  }
  state.pendingMainSpawn = null;
  state.waveSubPhase = 2;
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
    // C311 Phase 4 (本来) temporal probe: 発射時 player 位置 = "予測末端" (ghost target)。
    // collision/motion は (x,y,vx,vy,r) のみ参照、_predictedEnd* は probe 計測専用 = 副作用ゼロ。
    _predictedEndX: state.player.x,
    _predictedEndY: state.player.y,
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
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
      // C311 Phase 4 (本来) temporal probe: 画面外消滅時 predicted_end と実末端の Euclidean 距離計測
      if (b._predictedEndX !== undefined) {
        const dEnd = Math.hypot(b.x - b._predictedEndX, b.y - b._predictedEndY);
        if (dEnd > TEMPORAL_INCONSISTENCY_THRESHOLD_PX) {
          state._temporalInconsistencyCount = (state._temporalInconsistencyCount || 0) + 1;
        }
      }
      b.alive = false;
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
    // C311 Phase 4 (本来) temporal probe: 衝突弾も probe 集計対象とするため bullet 参照を返す
    if (d < b.r + state.player.r) return { hit: true, by: 'bullet', x: b.x, y: b.y, bullet: b };
  }
  return { hit: false };
}

function clampPlayer(state) {
  state.player.x = Math.max(state.player.r, Math.min(W - state.player.r, state.player.x));
  state.player.y = Math.max(state.player.r, Math.min(H - state.player.r, state.player.y));
}

// C306 Phase 4: percentile (下位 p%) — min_approach_p10 = 各 run の 10 percentile = "how close" 代表値
function percentile(arr, p) {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return Number(sorted[idx].toFixed(2));
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

// C306 Phase 4: good mock (grazer) — proxy validity 一次判定用。
// castLock 不使用 (verify.js は castLock 機構を持たない) のため 90 秒生存は構造上不可、
// あくまで「近接 → 直前 lateral dodge」の挙動で min_approach_p10 が悪手 4 方針より小さくなる
// かを測定するのが目的。良手代理 (mock) であり真の最良戦略ではない。
function strategyGrazer(state, _frame, _rng) {
  let nearest = null, nd = Infinity;
  for (const b of state.bullets) {
    const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if (d < nd) { nd = d; nearest = b; }
  }
  // 弾なし or 遠い場合は中央寄せ
  if (!nearest || nd > 60) {
    const cx = W * 0.5, cy = H * 0.6;
    return { dx: cx - state.player.x, dy: cy - state.player.y };
  }
  // 弾が至近 (< 22px) なら弾速度ベクトルの法線方向に lateral dodge
  if (nd < 22) {
    return { dx: -nearest.vy, dy: nearest.vx };
  }
  // 中距離: 弾速度ベクトル法線方向に並走 (grazing setup)、center bias を弱く混入
  const cx = W * 0.5;
  const lateralDx = -nearest.vy;
  const lateralDy = nearest.vx;
  const centerDx = (cx - state.player.x) * 0.01;
  return { dx: lateralDx + centerDx, dy: lateralDy };
}

// C321 Phase 4: 8 castLock 不使用悪手 strategy 追加 (N=5 → N=13)
// 目的: N=5 Pearson 線形回帰の `good` outlier 支配バイアス (multi_seed_correlation.md §6.2-4)
//   を strategy 集合拡張で解消、N=13 strategy 内分布の真の冗長性を判定する。
// 各 strategy の挙動仕様 (frame 当たり player 移動の delta):
//   zig-zag-narrow:  dx = (frame % 20 < 10) ? +1 : -1, dy = 0 — 鋭い水平往復、決定論
//   random-rush:     (dx, dy) = (rng()*2-1, rng()*2-1) を毎 frame 再抽選 — rng 重依存、seed 軸変動大
//   corner-stay:     target = (W*0.9, H*0.1) (右上角) への線形接近、決定論
//   mid-orbit:       中央 (W/2, H/2) 周回、半径 80px、周期 180F、決定論
//   vertical-bounce: dy = (frame % 120 < 60) ? -1 : +1, dx = (rng()-0.5)*0.5 — rng 軽依存
//   triangle-loop:   3 頂点 (左下/右下/上中央) を 60F ずつ巡回、決定論
//   spiral-out:      中央から外向き螺旋、radius=min(120, frame*0.05), angle=frame*0.08、決定論
//   wave-rider:      dx = sin(frame*0.07), dy = cos(frame*0.05) + (rng()-0.5)*0.2 — rng 軽依存
// 共通: castLock 機構不使用 = 全 strategy が ≤90s (5400 frame) で gameover 判定される設計。
//   rng 使用 strategy (random-rush / vertical-bounce / wave-rider) は seed 軸変動を生み、
//   既存 blind-sweeper 1 点のみ動く構造バイアス (multi_seed_correlation.md §3.1) を解消する。
function strategyZigZagNarrow(_state, frame, _rng) {
  const dx = (frame % 20 < 10) ? 1 : -1;
  return { dx, dy: 0 };
}
function strategyRandomRush(_state, _frame, rng) {
  const dx = rng() * 2 - 1;
  const dy = rng() * 2 - 1;
  return { dx, dy };
}
function strategyCornerStay(state, _frame, _rng) {
  const tx = W * 0.9, ty = H * 0.1;
  return { dx: tx - state.player.x, dy: ty - state.player.y };
}
function strategyMidOrbit(state, frame, _rng) {
  const cx = W * 0.5, cy = H * 0.5;
  const radius = 80;
  const angle = frame * (2 * Math.PI) / 180;
  const tx = cx + radius * Math.cos(angle);
  const ty = cy + radius * Math.sin(angle);
  return { dx: tx - state.player.x, dy: ty - state.player.y };
}
function strategyVerticalBounce(_state, frame, rng) {
  const dy = (frame % 120 < 60) ? -1 : 1;
  const dx = (rng() - 0.5) * 0.5;
  return { dx, dy };
}
function strategyTriangleLoop(state, frame, _rng) {
  const vertices = [
    { x: W * 0.3, y: H * 0.6 },
    { x: W * 0.7, y: H * 0.6 },
    { x: W * 0.5, y: H * 0.3 },
  ];
  const idx = Math.floor(frame / 60) % 3;
  const t = vertices[idx];
  return { dx: t.x - state.player.x, dy: t.y - state.player.y };
}
function strategySpiralOut(state, frame, _rng) {
  const cx = W * 0.5, cy = H * 0.5;
  const radius = Math.min(120, frame * 0.05);
  const angle = frame * 0.08;
  const tx = cx + radius * Math.cos(angle);
  const ty = cy + radius * Math.sin(angle);
  return { dx: tx - state.player.x, dy: ty - state.player.y };
}
function strategyWaveRider(_state, frame, rng) {
  const dx = Math.sin(frame * 0.07);
  const dy = Math.cos(frame * 0.05) + (rng() - 0.5) * 0.2;
  return { dx, dy };
}

const STRATEGIES = {
  good: strategyGrazer,
  camper: strategyCamper,
  'lane-holder': strategyLaneHolder,
  'blind-sweeper': strategyBlindSweeper,
  nospecial: strategyNospecial,
  // C321 Phase 4: 8 castLock 不使用悪手追加 (N=5 → N=13)
  'zig-zag-narrow':  strategyZigZagNarrow,
  'random-rush':     strategyRandomRush,
  'corner-stay':     strategyCornerStay,
  'mid-orbit':       strategyMidOrbit,
  'vertical-bounce': strategyVerticalBounce,
  'triangle-loop':   strategyTriangleLoop,
  'spiral-out':      strategySpiralOut,
  'wave-rider':      strategyWaveRider,
};

const BAD_STRATEGIES = [
  'camper', 'lane-holder', 'blind-sweeper', 'nospecial',
  // C321 Phase 4: 8 種追加 (pass 判定対象に組み込み)
  'zig-zag-narrow', 'random-rush', 'corner-stay', 'mid-orbit',
  'vertical-bounce', 'triangle-loop', 'spiral-out', 'wave-rider',
];

function runOne(name, strategyFn, seed) {
  const state = {
    player: { x: W * 0.5, y: H * 0.78, r: PLAYER_R, speed: PLAYER_SPEED },
    enemies: [],
    bullets: [],
    waveSpawned: false,
    waveCount: 0,
    lastClearFrame: null,
    frame: 0,
    // H-004 (C298 Phase 4): phase 1 wave 内 2 段階 ease-in 状態 (game.js と同型)
    waveSubPhase: 0,
    pendingMainSpawn: null,
    waveSubPhaseFrame: null,
    // C311 Phase 4 (本来) temporal probe: state 経由で updateBullets/checkCollisions と共有
    _temporalInconsistencyCount: 0,
  };
  const rng = mulberry32(seed);
  // C306 Phase 4: min_approach_p10 + cont_grazing_max 計測用
  const minApproachHistory = [];
  let currentGrazeStreak = 0;
  let maxGrazeStreak = 0;
  let bulletFrameCount = 0;
  // C311 Phase 4: instinct trigger 発火数 (rising-edge bullet proximity)
  let instinctTriggerCount = 0;

  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    state.frame = frame;
    // v002 差分: wave clear 後 8 秒待機ガード反映
    // H-004: pendingMainSpawn 中は wave_clear ガード対象外 (warmup を倒しても main 待機継続)
    if (state.waveSpawned && state.enemies.length === 0 && !state.pendingMainSpawn) {
      state.waveSpawned = false;
      state.lastClearFrame = frame;
    }
    const restElapsed = state.waveCount === 0
      || (state.lastClearFrame !== null && frame - state.lastClearFrame >= WAVE_REST_FRAMES);
    if (!state.waveSpawned && restElapsed) spawnNextWave(state);
    // H-004: phase 1 wave 内 main spawn (warmup から 120F = 2.0s 後)
    if (state.pendingMainSpawn && frame - state.waveSubPhaseFrame >= WAVE_SUBPHASE_WARMUP_FRAMES) {
      spawnWaveMain(state);
    }

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

    // C306 Phase 4: per-frame min_approach + cont_grazing 計測
    // 衝突判定の直前で計測することで「致命弾の最接近 frame」も history に含む。
    // 弾不在 frame は history に push しない (Shikhondo "how close" は弾と player の距離軸)
    let frameMinDist = Infinity;
    for (const b of state.bullets) {
      const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
      if (d < frameMinDist) frameMinDist = d;
    }
    if (Number.isFinite(frameMinDist)) {
      minApproachHistory.push(frameMinDist);
      bulletFrameCount += 1;
      if (frameMinDist < GRAZE_THRESHOLD_PX) {
        currentGrazeStreak += 1;
        if (currentGrazeStreak > maxGrazeStreak) maxGrazeStreak = currentGrazeStreak;
      } else {
        currentGrazeStreak = 0;
      }
    } else {
      currentGrazeStreak = 0;
    }

    // C311 Phase 4: instinct trigger 発火数 (rising-edge bullet proximity, read-only probe)
    // 各 alive bullet について「前 frame 外 (= _instinctNear !== true) かつ今 frame 内 (= d < 50px)」を 1 trigger としてカウント。
    // _instinctNear プロパティ追加は gameplay logic に影響しない (collision/motion は x,y,vx,vy,r のみ参照)。
    for (const b of state.bullets) {
      const dx = b.x - state.player.x, dy = b.y - state.player.y;
      const d = Math.hypot(dx, dy);
      const nowNear = d < INSTINCT_TRIGGER_PX;
      if (nowNear && b._instinctNear !== true) instinctTriggerCount += 1;
      b._instinctNear = nowNear;
    }

    const col = checkCollisions(state);
    if (col.hit) {
      // C311 Phase 4 (本来) temporal probe: 衝突弾も predicted_end との距離計測対象に含める
      if (col.by === 'bullet' && col.bullet && col.bullet._predictedEndX !== undefined) {
        const b = col.bullet;
        const dEnd = Math.hypot(b.x - b._predictedEndX, b.y - b._predictedEndY);
        if (dEnd > TEMPORAL_INCONSISTENCY_THRESHOLD_PX) {
          state._temporalInconsistencyCount += 1;
        }
      }
      return {
        strategy: name,
        outcome: 'gameover',
        survived_frames: frame,
        survived_seconds: Number((frame / FPS).toFixed(2)),
        deaths_at_frame: frame,
        death_cause: col.by,
        waves_seen: state.waveCount,
        min_approach_p10: percentile(minApproachHistory, 10),
        min_approach_p50: percentile(minApproachHistory, 50),
        cont_grazing_max: maxGrazeStreak,
        bullet_frame_count: bulletFrameCount,
        instinct_trigger_count: instinctTriggerCount,
        temporal_inconsistency_count: state._temporalInconsistencyCount,
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
    min_approach_p10: percentile(minApproachHistory, 10),
    min_approach_p50: percentile(minApproachHistory, 50),
    cont_grazing_max: maxGrazeStreak,
    bullet_frame_count: bulletFrameCount,
    instinct_trigger_count: instinctTriggerCount,
    temporal_inconsistency_count: state._temporalInconsistencyCount,
  };
}

const SEED = 20260527;

// C313 Phase 4: --sensitivity-sweep モード = 4 PX × 5 strategy = 20 run の感度分析 + 3 軸独立性
// 通常出力 (悪手検証 JSON) と異なる JSON schema を出力する。pass 判定は本モードでは行わない (副作用ゼロ確認は通常モード)。
if (process.argv.includes('--sensitivity-sweep')) {
  const PX_VALUES = [40, 50, 60, 80];
  const sweepRows = [];
  for (const px of PX_VALUES) {
    INSTINCT_TRIGGER_PX = px;
    for (const name of Object.keys(STRATEGIES)) {
      const r = runOne(name, STRATEGIES[name], SEED);
      sweepRows.push({
        instinct_trigger_px: px,
        strategy: r.strategy,
        survived_frames: r.survived_frames,
        outcome: r.outcome,
        instinct_trigger_count: r.instinct_trigger_count,
        min_approach_p10: r.min_approach_p10,
        cont_grazing_max: r.cont_grazing_max,
      });
    }
  }

  // 3 軸独立性 (Pearson/Spearman) — PX=50 条件下、5 strategy 全体で算出 (純 stdlib)
  function pearson(xs, ys) {
    const n = xs.length;
    if (n < 2) return null;
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
    const mx = sx / n, my = sy / n;
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - mx, dy = ys[i] - my;
      num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
    }
    const denom = Math.sqrt(dx2 * dy2);
    return denom > 0 ? Number((num / denom).toFixed(4)) : null;
  }
  function ranksOf(arr) {
    const n = arr.length;
    const idx = arr.map((v, i) => ({ v, i }));
    idx.sort((a, b) => a.v - b.v);
    const r = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && idx[j + 1].v === idx[i].v) j++;
      const avg = (i + j) / 2 + 1; // 1-indexed
      for (let k = i; k <= j; k++) r[idx[k].i] = avg;
      i = j + 1;
    }
    return r;
  }
  function spearman(xs, ys) {
    return pearson(ranksOf(xs), ranksOf(ys));
  }
  const at50 = sweepRows.filter(r => r.instinct_trigger_px === 50);
  const axInstinct = at50.map(r => r.instinct_trigger_count);
  const axMinP10   = at50.map(r => r.min_approach_p10);
  const axGraze    = at50.map(r => r.cont_grazing_max);
  const correlations = {
    n_strategies: at50.length,
    sample_strategies: at50.map(r => r.strategy),
    pearson: {
      instinct_x_min_approach_p10: pearson(axInstinct, axMinP10),
      instinct_x_cont_grazing_max: pearson(axInstinct, axGraze),
      min_approach_p10_x_cont_grazing_max: pearson(axMinP10, axGraze),
    },
    spearman: {
      instinct_x_min_approach_p10: spearman(axInstinct, axMinP10),
      instinct_x_cont_grazing_max: spearman(axInstinct, axGraze),
      min_approach_p10_x_cont_grazing_max: spearman(axMinP10, axGraze),
    },
    threshold_strong_correlation_abs: 0.9,
    threshold_weak_correlation_abs: 0.5,
    interpretation_note: '|r| ≥ 0.9 = 軸独立性なし(1 軸で代替可能), |r| < 0.5 = 真の独立 3 軸として feedback richness 物理化完了',
  };

  // 各 strategy 行で trigger_count が PX に対し単調増加か (装置の物理整合性)
  const STRATS = Array.from(new Set(sweepRows.map(r => r.strategy)));
  const monotonic = {};
  for (const s of STRATS) {
    const seq = PX_VALUES.map(px => {
      const row = sweepRows.find(r => r.instinct_trigger_px === px && r.strategy === s);
      return row.instinct_trigger_count;
    });
    let nondecreasing = true, strictlyIncreasing = true;
    for (let i = 1; i < seq.length; i++) {
      if (seq[i] < seq[i - 1]) nondecreasing = false;
      if (seq[i] <= seq[i - 1]) strictlyIncreasing = false;
    }
    monotonic[s] = { sequence: seq, nondecreasing, strictly_increasing: strictlyIncreasing };
  }

  // bit 不変性 (survived_frames が PX 4 値で一致するか) — probe 副作用ゼロの数学的確証
  const survivedInvariance = {};
  for (const s of STRATS) {
    const seq = PX_VALUES.map(px => {
      const row = sweepRows.find(r => r.instinct_trigger_px === px && r.strategy === s);
      return row.survived_frames;
    });
    const invariant = seq.every(v => v === seq[0]);
    survivedInvariance[s] = { sequence: seq, invariant };
  }
  const survivedInvariantAll = Object.values(survivedInvariance).every(v => v.invariant);

  const sweepReport = {
    audit: 'instinct_trigger_px_sensitivity_sweep',
    purpose: 'C313 Phase 4: INSTINCT_TRIGGER_PX 感度分析 + 3 軸独立性 (Pearson/Spearman) 検証',
    seed: SEED,
    px_values: PX_VALUES,
    rows: sweepRows,
    monotonic_check: monotonic,
    survived_frames_invariance: survivedInvariance,
    survived_frames_invariant_all: survivedInvariantAll,
    correlations_at_px50: correlations,
    notes: [
      '相関係数は 5 strategy (N=5) の少サンプル算出のため 95%CI は広い。値の方向性確認用。',
      'good (grazer mock) は castLock 不使用の代理戦略。3 軸に挙動的に異なる影響を与える可能性',
      'survived_frames_invariant_all=true なら probe 副作用ゼロ確証 (H-002〜H-008 同型論証)',
    ],
  };
  console.log(JSON.stringify(sweepReport, null, 2));
  process.exit(survivedInvariantAll ? 0 : 1);
}

// C316 Phase 4: --temporal-sensitivity-sweep モード = 4 PX × 5 strategy = 20 run の TEMPORAL_INCONSISTENCY_THRESHOLD_PX 感度分析
//   + 4 軸 (instinct_trigger / min_approach_p10 / cont_grazing_max / temporal_inconsistency) 6 ペア独立性 (Pearson/Spearman)。
// C313 INSTINCT_TRIGGER_PX sweep と同型構造。pass 判定は survived_frames bit 不変性のみで実施 (本モードは probe 副作用ゼロ確認の数学的確証 9 度目)。
if (process.argv.includes('--temporal-sensitivity-sweep')) {
  const PX_VALUES = [10, 15, 20, 30];
  const sweepRows = [];
  for (const px of PX_VALUES) {
    TEMPORAL_INCONSISTENCY_THRESHOLD_PX = px;
    for (const name of Object.keys(STRATEGIES)) {
      const r = runOne(name, STRATEGIES[name], SEED);
      sweepRows.push({
        temporal_inconsistency_threshold_px: px,
        strategy: r.strategy,
        survived_frames: r.survived_frames,
        outcome: r.outcome,
        instinct_trigger_count: r.instinct_trigger_count,
        min_approach_p10: r.min_approach_p10,
        cont_grazing_max: r.cont_grazing_max,
        temporal_inconsistency_count: r.temporal_inconsistency_count,
      });
    }
  }

  // 純 stdlib 相関係数 (Pearson / Spearman) — C313 sweep と同実装
  function pearson(xs, ys) {
    const n = xs.length;
    if (n < 2) return null;
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
    const mx = sx / n, my = sy / n;
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - mx, dy = ys[i] - my;
      num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
    }
    const denom = Math.sqrt(dx2 * dy2);
    return denom > 0 ? Number((num / denom).toFixed(4)) : null;
  }
  function ranksOf(arr) {
    const n = arr.length;
    const idx = arr.map((v, i) => ({ v, i }));
    idx.sort((a, b) => a.v - b.v);
    const r = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && idx[j + 1].v === idx[i].v) j++;
      const avg = (i + j) / 2 + 1; // 1-indexed
      for (let k = i; k <= j; k++) r[idx[k].i] = avg;
      i = j + 1;
    }
    return r;
  }
  function spearman(xs, ys) {
    return pearson(ranksOf(xs), ranksOf(ys));
  }

  // 4 軸 6 ペア独立性 = 各 PX 条件下で 5 strategy 全体 N=5 で算出
  function correlationsAt(px) {
    const at = sweepRows.filter(r => r.temporal_inconsistency_threshold_px === px);
    const axInstinct = at.map(r => r.instinct_trigger_count);
    const axMinP10   = at.map(r => r.min_approach_p10);
    const axGraze    = at.map(r => r.cont_grazing_max);
    const axTemporal = at.map(r => r.temporal_inconsistency_count);
    const pairs = {
      instinct_x_min_approach_p10:           { x: axInstinct, y: axMinP10 },
      instinct_x_cont_grazing_max:           { x: axInstinct, y: axGraze },
      instinct_x_temporal_inconsistency:     { x: axInstinct, y: axTemporal },
      min_approach_p10_x_cont_grazing_max:   { x: axMinP10,   y: axGraze },
      min_approach_p10_x_temporal_inconsistency: { x: axMinP10, y: axTemporal },
      cont_grazing_max_x_temporal_inconsistency: { x: axGraze,  y: axTemporal },
    };
    const pearsonOut = {}, spearmanOut = {};
    for (const [k, v] of Object.entries(pairs)) {
      pearsonOut[k] = pearson(v.x, v.y);
      spearmanOut[k] = spearman(v.x, v.y);
    }
    return {
      px,
      n_strategies: at.length,
      sample_strategies: at.map(r => r.strategy),
      pearson: pearsonOut,
      spearman: spearmanOut,
    };
  }
  const correlations_per_px = PX_VALUES.map(px => correlationsAt(px));

  // 各 strategy 行で temporal_inconsistency_count が PX に対し物理的に整合的か (PX 大 → 閾値超え件数小 = 非増加 期待)
  const STRATS = Array.from(new Set(sweepRows.map(r => r.strategy)));
  const monotonic = {};
  for (const s of STRATS) {
    const seq = PX_VALUES.map(px => {
      const row = sweepRows.find(r => r.temporal_inconsistency_threshold_px === px && r.strategy === s);
      return row.temporal_inconsistency_count;
    });
    let nonincreasing = true, strictlyDecreasing = true;
    for (let i = 1; i < seq.length; i++) {
      if (seq[i] > seq[i - 1]) nonincreasing = false;
      if (seq[i] >= seq[i - 1]) strictlyDecreasing = false;
    }
    monotonic[s] = { sequence: seq, nonincreasing, strictly_decreasing: strictlyDecreasing };
  }

  // bit 不変性 (survived_frames が PX 4 値で一致するか) = probe 副作用ゼロの数学的確証 (H-002〜H-008 + 本軸の同型論証 9 度目)
  const survivedInvariance = {};
  for (const s of STRATS) {
    const seq = PX_VALUES.map(px => {
      const row = sweepRows.find(r => r.temporal_inconsistency_threshold_px === px && r.strategy === s);
      return row.survived_frames;
    });
    const invariant = seq.every(v => v === seq[0]);
    survivedInvariance[s] = { sequence: seq, invariant };
  }
  const survivedInvariantAll = Object.values(survivedInvariance).every(v => v.invariant);

  // instinct/min_approach/cont_grazing 不変性も同時確認 (PX 変動は temporal probe のみ影響する設計上)
  const otherProbesInvariance = {};
  for (const s of STRATS) {
    const at = sweepRows.filter(r => r.strategy === s);
    const seqInstinct = at.map(r => r.instinct_trigger_count);
    const seqMinP10   = at.map(r => r.min_approach_p10);
    const seqGraze    = at.map(r => r.cont_grazing_max);
    otherProbesInvariance[s] = {
      instinct_trigger_count: { sequence: seqInstinct, invariant: seqInstinct.every(v => v === seqInstinct[0]) },
      min_approach_p10:       { sequence: seqMinP10,   invariant: seqMinP10.every(v => v === seqMinP10[0]) },
      cont_grazing_max:       { sequence: seqGraze,    invariant: seqGraze.every(v => v === seqGraze[0]) },
    };
  }
  const otherProbesInvariantAll = Object.values(otherProbesInvariance).every(o =>
    o.instinct_trigger_count.invariant && o.min_approach_p10.invariant && o.cont_grazing_max.invariant
  );

  // staging §完遂の定義 3 順守: breakdown_per_strategy (strategy → PX → 4 軸値) を集約フィールドとして明示
  const breakdownPerStrategy = {};
  for (const s of STRATS) {
    breakdownPerStrategy[s] = {};
    for (const px of PX_VALUES) {
      const row = sweepRows.find(r => r.temporal_inconsistency_threshold_px === px && r.strategy === s);
      breakdownPerStrategy[s][`px_${px}`] = {
        survived_frames: row.survived_frames,
        temporal_inconsistency_count: row.temporal_inconsistency_count,
        instinct_trigger_count: row.instinct_trigger_count,
        min_approach_p10: row.min_approach_p10,
        cont_grazing_max: row.cont_grazing_max,
      };
    }
  }

  const sweepReport = {
    audit: 'temporal_inconsistency_px_sensitivity_sweep',
    purpose: 'C316 Phase 4: TEMPORAL_INCONSISTENCY_THRESHOLD_PX 感度分析 + 4 軸 6 ペア独立性 (Pearson/Spearman) 検証',
    seed: SEED,
    px_values: PX_VALUES,
    baseline_px: 15,
    breakdown_per_strategy: breakdownPerStrategy,
    rows: sweepRows,
    monotonic_check: monotonic,
    monotonic_note: 'temporal_inconsistency_count は PX 閾値超え件数なので PX 大 → 件数小 (非増加) が物理整合期待。strictly_decreasing は要件ではない (同値 plateau 許容)',
    survived_frames_invariance: survivedInvariance,
    survived_frames_invariant_all: survivedInvariantAll,
    other_probes_invariance: otherProbesInvariance,
    other_probes_invariant_all: otherProbesInvariantAll,
    correlations_per_px,
    correlation_thresholds: {
      strong_abs: 0.9,
      weak_abs: 0.5,
      interpretation_note: '|r| ≥ 0.9 = 軸独立性なし(1 軸で代替可能), |r| < 0.5 = 真の独立 4 軸として feedback richness 物理化 (6 ペア × 2 統計量 × 4 PX = 48 値)',
    },
    notes: [
      '相関係数は 5 strategy (N=5) の少サンプル算出のため 95%CI は広い。値の方向性確認用。',
      'good (grazer mock) は castLock 不使用の代理戦略。4 軸に挙動的に異なる影響を与える可能性',
      'survived_frames_invariant_all=true + other_probes_invariant_all=true なら本 sweep の probe 副作用ゼロ確証 (H-002〜H-008 + C313 + 本軸の同型論証 9 度目)',
      'PX 4 値 (10/15/20/30) 各々で 4 軸 6 ペア相関を独立算出 = 計 48 値 (Pearson 24 + Spearman 24)',
    ],
  };
  console.log(JSON.stringify(sweepReport, null, 2));
  process.exit((survivedInvariantAll && otherProbesInvariantAll) ? 0 : 1);
}

// C320 Phase 4: --multi-seed-sweep N モード = N seed × 5 strategy = N×5 run。
//   N 既定 = 10、seed 系列 = [SEED, SEED+1, ..., SEED+N-1] 連続値固定。
//   PX 既定 (50 / 15) 固定 — env override は本モードで無効化 (sweep 軸を seed 単一に絞る)。
//   目的: C316 で N=5 単一観測の Pearson 0.9959 (instinct × temporal) の安定性 / 疑似相関判定。
//   各 seed で 5 strategy 全体 N=5 の 6 ペア Pearson/Spearman を算出し、seed 軸 (N) の分布
//   (mean/std/min/max) で focus pair の信頼性を判定する。
//   bit invariance: seed=SEED について sweep ループ内行 vs sweep 外 baseline 再実行 が bit 完全一致
//     = multi-seed ループが state を汚染しない数学的確証 (H-002〜H-008 + C313 + C316 同型論証 10 度目)。
//   判定基準 (focus = instinct × temporal Pearson 分布):
//     mean ≥ 0.9 && std < 0.1 → REDUNDANCY_CONFIRMED (4 軸 → 3 軸縮約発火候補)
//     std ≥ 0.2               → PSEUDO_CORRELATION (strategy 二極分布、N=5 単一は信頼区間外)
//     0.1 ≤ std < 0.2         → HOLD (N=20 拡張候補)
if (process.argv.includes('--multi-seed-sweep')) {
  const flagIdx = process.argv.indexOf('--multi-seed-sweep');
  let N = 10;
  if (flagIdx >= 0 && process.argv[flagIdx + 1] !== undefined && !process.argv[flagIdx + 1].startsWith('--')) {
    const v = Number(process.argv[flagIdx + 1]);
    if (Number.isFinite(v) && v >= 2 && v <= 100) N = Math.floor(v);
  }
  const SEEDS = Array.from({ length: N }, (_, i) => SEED + i);

  // PX 既定 (50 / 15) 固定 — 本 sweep は seed 軸単独
  INSTINCT_TRIGGER_PX = 50;
  TEMPORAL_INCONSISTENCY_THRESHOLD_PX = 15;

  const sweepRows = [];
  for (const seed of SEEDS) {
    for (const name of Object.keys(STRATEGIES)) {
      const r = runOne(name, STRATEGIES[name], seed);
      sweepRows.push({
        seed,
        strategy: r.strategy,
        survived_frames: r.survived_frames,
        outcome: r.outcome,
        instinct_trigger_count: r.instinct_trigger_count,
        min_approach_p10: r.min_approach_p10,
        cont_grazing_max: r.cont_grazing_max,
        temporal_inconsistency_count: r.temporal_inconsistency_count,
      });
    }
  }

  // 純 stdlib 相関係数 (C313/C316 と同実装、再宣言は scope 隔離のため許容)
  function pearson(xs, ys) {
    const n = xs.length;
    if (n < 2) return null;
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
    const mx = sx / n, my = sy / n;
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - mx, dy = ys[i] - my;
      num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
    }
    const denom = Math.sqrt(dx2 * dy2);
    return denom > 0 ? Number((num / denom).toFixed(4)) : null;
  }
  function ranksOf(arr) {
    const n = arr.length;
    const idx = arr.map((v, i) => ({ v, i }));
    idx.sort((a, b) => a.v - b.v);
    const r = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && idx[j + 1].v === idx[i].v) j++;
      const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k].i] = avg;
      i = j + 1;
    }
    return r;
  }
  function spearman(xs, ys) {
    return pearson(ranksOf(xs), ranksOf(ys));
  }

  // 4 軸 6 ペア定義
  const PAIRS = [
    ['instinct_x_min_approach_p10',                'instinct_trigger_count',     'min_approach_p10'],
    ['instinct_x_cont_grazing_max',                'instinct_trigger_count',     'cont_grazing_max'],
    ['instinct_x_temporal_inconsistency',          'instinct_trigger_count',     'temporal_inconsistency_count'],
    ['min_approach_p10_x_cont_grazing_max',        'min_approach_p10',           'cont_grazing_max'],
    ['min_approach_p10_x_temporal_inconsistency',  'min_approach_p10',           'temporal_inconsistency_count'],
    ['cont_grazing_max_x_temporal_inconsistency',  'cont_grazing_max',           'temporal_inconsistency_count'],
  ];

  // seed ごとに 5 strategy 全体 N=5 で 6 ペア相関算出
  const correlationsPerSeed = SEEDS.map(seed => {
    const at = sweepRows.filter(r => r.seed === seed);
    const pearsonOut = {}, spearmanOut = {};
    for (const [k, xAxis, yAxis] of PAIRS) {
      const xs = at.map(r => r[xAxis]);
      const ys = at.map(r => r[yAxis]);
      pearsonOut[k] = pearson(xs, ys);
      spearmanOut[k] = spearman(xs, ys);
    }
    return { seed, n_strategies: at.length, pearson: pearsonOut, spearman: spearmanOut };
  });

  // 6 ペア各々の seed 軸分布 (N=SEEDS.length)
  function distOf(values) {
    const vs = values.filter(v => v !== null && Number.isFinite(v));
    if (vs.length === 0) return { n: 0, mean: null, std: null, min: null, max: null };
    const m = vs.reduce((a, b) => a + b, 0) / vs.length;
    const variance = vs.reduce((a, b) => a + (b - m) * (b - m), 0) / vs.length;
    return {
      n: vs.length,
      mean: Number(m.toFixed(4)),
      std: Number(Math.sqrt(variance).toFixed(4)),
      min: Number(Math.min(...vs).toFixed(4)),
      max: Number(Math.max(...vs).toFixed(4)),
    };
  }
  const pearsonDistribution = {}, spearmanDistribution = {};
  for (const [k] of PAIRS) {
    pearsonDistribution[k] = distOf(correlationsPerSeed.map(c => c.pearson[k]));
    spearmanDistribution[k] = distOf(correlationsPerSeed.map(c => c.spearman[k]));
  }

  // bit invariance: seed=SEED 行と sweep 外 baseline 再実行を比較
  const baselineReRun = {};
  for (const name of Object.keys(STRATEGIES)) {
    baselineReRun[name] = runOne(name, STRATEGIES[name], SEED);
  }
  const baselineSeedRows = sweepRows.filter(r => r.seed === SEED);
  const bitMatchPerStrategy = {};
  for (const r of baselineSeedRows) {
    const b = baselineReRun[r.strategy];
    bitMatchPerStrategy[r.strategy] = {
      sweep_survived_frames: r.survived_frames,
      baseline_survived_frames: b.survived_frames,
      survived_bit_match: r.survived_frames === b.survived_frames,
      sweep_instinct_trigger_count: r.instinct_trigger_count,
      baseline_instinct_trigger_count: b.instinct_trigger_count,
      instinct_bit_match: r.instinct_trigger_count === b.instinct_trigger_count,
      sweep_temporal_inconsistency_count: r.temporal_inconsistency_count,
      baseline_temporal_inconsistency_count: b.temporal_inconsistency_count,
      temporal_bit_match: r.temporal_inconsistency_count === b.temporal_inconsistency_count,
      sweep_min_approach_p10: r.min_approach_p10,
      baseline_min_approach_p10: b.min_approach_p10,
      min_approach_bit_match: r.min_approach_p10 === b.min_approach_p10,
      sweep_cont_grazing_max: r.cont_grazing_max,
      baseline_cont_grazing_max: b.cont_grazing_max,
      cont_grazing_bit_match: r.cont_grazing_max === b.cont_grazing_max,
    };
  }
  const bitMatchAll = Object.values(bitMatchPerStrategy).every(v =>
    v.survived_bit_match && v.instinct_bit_match && v.temporal_bit_match
    && v.min_approach_bit_match && v.cont_grazing_bit_match
  );

  // breakdown_per_seed (seed → strategy → 4 軸 + survived)
  const breakdownPerSeed = {};
  for (const seed of SEEDS) {
    breakdownPerSeed[`seed_${seed}`] = {};
    for (const r of sweepRows.filter(rr => rr.seed === seed)) {
      breakdownPerSeed[`seed_${seed}`][r.strategy] = {
        survived_frames: r.survived_frames,
        instinct_trigger_count: r.instinct_trigger_count,
        min_approach_p10: r.min_approach_p10,
        cont_grazing_max: r.cont_grazing_max,
        temporal_inconsistency_count: r.temporal_inconsistency_count,
      };
    }
  }

  // focus pair 判定 (instinct × temporal Pearson 分布)
  const focusKey = 'instinct_x_temporal_inconsistency';
  const focusDist = pearsonDistribution[focusKey];
  let verdict;
  if (focusDist.std === null) {
    verdict = 'INSUFFICIENT_DATA';
  } else if (focusDist.mean >= 0.9 && focusDist.std < 0.1) {
    verdict = 'REDUNDANCY_CONFIRMED — 4軸 → 3軸縮約発火候補 (kaizen #140 段階3 family統合 GO)';
  } else if (focusDist.std >= 0.2) {
    verdict = 'PSEUDO_CORRELATION — strategy 二極分布による偽相関 (N=5 単一観測は信頼区間外、4 軸独立性維持)';
  } else {
    verdict = 'HOLD — 判定保留 + N=20 拡張候補 (0.1 ≤ std < 0.2 = 判定領域グレー)';
  }

  const sweepReport = {
    audit: 'multi_seed_correlation_sweep',
    purpose: `C320 Phase 4: multi-seed (N=${N}) 4 軸 6 ペア sweep — instinct × temporal Pearson 0.9959 (C316 N=5 単一観測) の信頼性確証 / 疑似相関判定`,
    N_seeds: N,
    seeds: SEEDS,
    baseline_seed: SEED,
    instinct_trigger_px: INSTINCT_TRIGGER_PX,
    temporal_inconsistency_threshold_px: TEMPORAL_INCONSISTENCY_THRESHOLD_PX,
    breakdown_per_seed: breakdownPerSeed,
    rows: sweepRows,
    correlations_per_seed: correlationsPerSeed,
    pearson_distribution: pearsonDistribution,
    spearman_distribution: spearmanDistribution,
    focus_pair: focusKey,
    focus_pair_pearson_distribution: focusDist,
    verdict_thresholds: {
      redundancy_confirmed: 'pearson mean >= 0.9 && std < 0.1',
      pseudo_correlation:   'pearson std >= 0.2',
      hold:                 '0.1 <= pearson std < 0.2',
    },
    verdict,
    bit_invariance: {
      baseline_seed: SEED,
      per_strategy: bitMatchPerStrategy,
      all_match: bitMatchAll,
      note: `sweep 内 seed=${SEED} 行と sweep 外 baseline 再実行が bit 完全一致 = multi-seed ループが state を汚染しない (H-002〜H-008 + C313 + C316 同型論証 10 度目)`,
    },
    notes: [
      `N=${N} seed × 5 strategy = ${N * 5} run + baseline 再実行 5 run = 合計 ${N * 5 + 5} run`,
      'seed ごとの 6 ペア相関は 5 strategy (N=5) 内算出 = 少サンプル、相関値の方向性確認用',
      `pearson_distribution は seed 軸分布 (N=${N}) = focus 軸 instinct × temporal の安定性判定対象`,
      '判定基準: mean ≥ 0.9 && std < 0.1 → 冗長性確定 / std ≥ 0.2 → 疑似相関 / それ以外 → 判定保留',
      'PX 既定 (50 / 15) 固定 — env override は本モードで無効化 (sweep 軸を seed 単一に絞る)',
    ],
  };
  console.log(JSON.stringify(sweepReport, null, 2));
  process.exit(bitMatchAll ? 0 : 1);
}

const results = [];
for (const name of Object.keys(STRATEGIES)) {
  results.push(runOne(name, STRATEGIES[name], SEED));
}

// C306 Phase 4: pass 判定は悪手 4 方針 (BAD_STRATEGIES) 全 gameover に限定。
// good (grazer) は proxy 計測専用 mock のため survival 結果は pass に影響させない。
const badResults = results.filter(r => BAD_STRATEGIES.includes(r.strategy));
const allBadDied = badResults.every(r => r.outcome === 'gameover');
const survivors = badResults.filter(r => r.outcome === 'survived').map(r => r.strategy);

// C306 Phase 4: proxy validity 一次判定 (min_approach_p10 良手 vs 悪手 1.5 倍以上比較)
const goodResult = results.find(r => r.strategy === 'good');
const goodP10 = goodResult ? goodResult.min_approach_p10 : null;
const badP10s = badResults.map(r => r.min_approach_p10).filter(v => v !== null);
const badP10Mean = badP10s.length > 0 ? Number((badP10s.reduce((a, b) => a + b, 0) / badP10s.length).toFixed(2)) : null;
const badP10Min = badP10s.length > 0 ? Math.min(...badP10s) : null;
const proxy_validity_ratio = (goodP10 !== null && badP10Mean !== null && goodP10 > 0)
  ? Number((badP10Mean / goodP10).toFixed(2)) : null;
const proxy_validity_pass = proxy_validity_ratio !== null && proxy_validity_ratio >= 1.5;

const report = {
  audit: 'verify_bad_strategies_plus_proxy_probe',
  target: 'game/log_autonomous_game/v003/game.js',
  thesis: '悪手 4 方針は 90 秒以内に必ず死ぬ — v003 phase 2 内 SHOOT_INTERVAL 漸変 (90→60F) + H-001 phase 0 第1wave Q-導入 teaser (y-stagger 40→168) + H-004 phase 1 wave 内 2 段階 ease-in (warmup 1体 + 120F 後 main 2体) + H-006 phase 2 type C 2 段階 ease-in (warmup 1体 + 120F 後 main 1体) + H-007 instinct trigger 発火率計測軸 + C311 Phase 4 (本来) temporal_inconsistency 計測軸 (4 方針純並列 read-only probe) 追加後も castLock 不使用悪手は全滅',
  proxy_probe_thesis: 'min_approach_p10 (Shikhondo "how close" 1 数字圧縮 proxy) は良手 (grazer mock) と悪手 4 方針を 1.5 倍以上の比で差別化できる',
  instinct_trigger_thesis: 'instinct_trigger_count (弾が 50px 以内に入った rising edge 発火数) は 4 悪手方針ごとに異なる値を取り、フィードバック構造分析の 3 本目軸 (min_approach_p10 / cont_grazing_max に続く) として観測可能。castLock 機構不使用悪手の「本能トリガー引き出し量」を分離観測する probe — 値の解釈は実機判定 (Nao_u/Mir/Ash) と結合検証。',
  temporal_probe_thesis: 'temporal_inconsistency_count (発射時 player 位置 = 予測末端 vs 弾消滅時の実末端 Euclidean 距離 > 15px の弾数) は 4 悪手方針ごとに異なる値を取り、フィードバック構造分析の 4 本目軸 (instinct_trigger_count に続く) として観測可能。VLM 「時間的整合性予測失敗」軸の game レーン射影 — ghost target が動いた後の世界の予測ズレ量を分離観測する probe。値の解釈は実機判定 (Nao_u/Mir/Ash) と結合検証。',
  max_frames: MAX_FRAMES,
  max_seconds: MAX_FRAMES / FPS,
  wave_rest_frames: WAVE_REST_FRAMES,
  wave_timeline: WAVE_TIMELINE,
  shoot_interval_phase01: SHOOT_INTERVAL,
  shoot_interval_phase2_end: SHOOT_INTERVAL_PHASE2_MIN,
  graze_threshold_px: GRAZE_THRESHOLD_PX,
  temporal_inconsistency_threshold_px: TEMPORAL_INCONSISTENCY_THRESHOLD_PX,
  seed: SEED,
  // C311 Phase 4 (本来): 5 strategy ごとの temporal_inconsistency_count (staging §完遂の定義 2)
  breakdown_per_strategy: Object.fromEntries(
    results.map(r => [r.strategy, {
      survived_frames: r.survived_frames,
      survived_seconds: r.survived_seconds,
      temporal_inconsistency_count: r.temporal_inconsistency_count,
      instinct_trigger_count: r.instinct_trigger_count,
      cont_grazing_max: r.cont_grazing_max,
      min_approach_p10: r.min_approach_p10,
    }])
  ),
  results,
  pass: allBadDied,
  survivors,
  proxy_probe: {
    good_p10: goodP10,
    bad_p10_mean: badP10Mean,
    bad_p10_min: badP10Min,
    bad_p10_each: badResults.map(r => ({ strategy: r.strategy, p10: r.min_approach_p10, p50: r.min_approach_p50, cont_grazing_max: r.cont_grazing_max })),
    good_summary: goodResult ? { p10: goodResult.min_approach_p10, p50: goodResult.min_approach_p50, cont_grazing_max: goodResult.cont_grazing_max, survived_seconds: goodResult.survived_seconds } : null,
    ratio_bad_mean_over_good: proxy_validity_ratio,
    threshold: 1.5,
    proxy_validity_pass,
    interpretation: proxy_validity_pass
      ? 'good < bad で 1.5 倍以上の差 = min_approach_p10 は "how close" proxy の一次 validity PASS。Pearson 相関 / 人間体感との一致は別関門。'
      : '差が 1.5 倍未満 = min_approach_p10 単独では悪手と差別化できない。cont_grazing_max 単独 proxy 化または別軸 (連続回避時間 / 再挑戦同地点到達率) への切替検討候補。',
  },
  note: allBadDied
    ? '悪手 4 方針が gameover に到達。phase 内密度カーブ (phase 2 漸変) 追加後も castLock 不使用悪手は全滅。good (grazer) は proxy 計測専用 mock。'
    : `生存方針: ${survivors.join(', ')} — 密度カーブが悪手通過の穴を作った可能性。self_judgment §3 へ追記要。`,
  limits: [
    'verify.js は悪手検証であり、良手検証ではない',
    '実機判定の代替ではない',
    '密度カーブ漸変の体感は本検証では計測しない (Pearson 相関 = proxy 数値↔人間体感は次サイクル課題)',
    'phase 2 (50-90s, A+D+C) を 4 方針すべてが観測するとは限らない (early death 時)',
    'good (grazer) は castLock 不使用 mock = 真の最良戦略ではない、proxy validity 一次判定の対照群',
    'min_approach_p10 は 1 seed の単一観測値 = 統計的信頼性は seed × n_trial 拡張で確認要 (次サイクル候補)',
  ],
};

console.log(JSON.stringify(report, null, 2));
process.exit(allBadDied ? 0 : 1);
