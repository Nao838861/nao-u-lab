#!/usr/bin/env node
// agent_difficulty_proxy.js — log_autonomous_game v001 LLM-agent 難易度プロキシ runner (4 軸目)
//
// 出典: Chang Xiao, Brenda Z. Yang
//   "LLMs May Not Be Human-Level Players, But They Can Be Testers:
//    Measuring Game Difficulty with LLM Agents" arXiv:2410.02829 (2024-10-01)
//   - Wordle: agent 平均推測回数 vs 人間平均 Pearson r=0.624 (p<10^-3)
//   - Slay the Spire (Act 1): agent 残存 HP 比率 vs 人間ボス突破率 Pearson r=0.871 (p<10^-3)
//   - fine-tune 不要 = 汎用 prompting / 既存 agent そのままで人間体感難易度の代理になる
//
// 目的: v001 の「素朴良手 agent」を 30 試行 (各 60秒 = 3600 フレーム) 走らせ、
//       4 指標 (clear_wave / residual_hp_ratio / play_time_sec / graze_count) の
//       中央値を JSON で出す。v001 ⇄ v002 で同じ runner を回せば 4 指標差分が
//       「人間体感難易度の変化の代理」になる。論文 Wordle/Slay の 1 命題:
//       「勝てなくても、どれが難しいかは当てられる」を当方環境へ翻訳。
//
// 既存 audit / runner 体系における位置 (4 軸目):
//   1. verify.js              — 受け手悪手 4 方針 fail シミュ (生残ゼロ確認)
//   2. bullet_origin_audit.js — Q-D 弾源 (発射点) 独立監査
//   3. enemy_behavior_audit.js — 敵挙動 独立監査
//   4. agent_difficulty_proxy.js (本ファイル) — 良手 1 方針 中央値 4 指標 計測
//
// 使い方: cd game/log_autonomous_game/v001 && node agent_difficulty_proxy.js
//   exit 0 = 30 試行全完走 (中央値 4 指標が JSON 標準出力)
//   exit 1 = 全試行が frame=0 で死ぬ等の frame 計算破綻
//
// What this proves:
//   - 「Space を 1.5-2 秒に 1 回 castLock + 中央バイアス nospecial 移動」素朴良手が
//     v001 で何 wave 到達 / 何秒生残 / 何 graze 取るかの 30 試行中央値
//   - 4 指標 × 中央値が JSON で出る = v002 改修時のベースライン化に使える
//
// What this does NOT prove:
//   - 人間体感難易度との Pearson 相関 (本実装では未測定、3 サイクル運用後に
//     Nao_u 体感ランキング vs proxy ランキング合致を見て妥当性判定)
//   - リアルタイム弾避けへの転用妥当性 (論文は Wordle/Slay = ターン制、構造違いリスク)
//   - 5 採点への直接昇格 (確定 5 は実機判定依存、本数値は 3→4 暫定昇格根拠まで)
//   - residual_hp_ratio の連続値 (v001 は 1-hit kill のため binary 1.0/0.0、
//     HP system 導入時に連続値化が望ましい)

const fs = require('fs');
const path = require('path');

const SRC_PATH = path.join(__dirname, 'game.js');
const src = fs.readFileSync(SRC_PATH, 'utf8');

// --- index.html canvas 寸法 (audit 側で固定値として取り扱う、bullet_origin_audit.js と同型) ---
const W = 640;
const H = 720;
const FPS = 60;
const MAX_FRAMES = FPS * 60; // 60 秒 = 3600 F
const TRIALS = 30;

// --- game.js から定数抽出 (drift 防止、bullet_origin_audit.js と同型のパターン) ---
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
const SHOOT_GATE_Y_MAX = evalExpr(extractConst('SHOOT_GATE_Y_MAX'));

// player.speed は object literal の中、enemy vy も同様。bullet_origin/enemy_behavior と同型抽出。
const playerSpeedMatch = src.match(/player\s*:\s*\{[^}]*speed\s*:\s*([0-9.]+)/);
if (!playerSpeedMatch) throw new Error('player.speed not found in game.js');
const PLAYER_SPEED = parseFloat(playerSpeedMatch[1]);

// C264 Phase 4 強化 agent 暫定値: phase 2 (50-90s) 到達率を上げるための agent 単独 boost。
// game.js は変えず agent 側だけ 1.5 倍化 → proxy の測定解像度向上を狙う。
// 退路: phase 2 到達ゼロのまま=不十分 / 30/30 全クリア=強すぎ 1.2-1.3 倍に下げる。
const PLAYER_SPEED_STRENGTH = 1.5;
const PLAYER_SPEED_AGENT = PLAYER_SPEED * PLAYER_SPEED_STRENGTH;

const enemyVyMatch = src.match(/vy:\s*([0-9.]+),\s*\n\s*r:\s*10,/);
if (!enemyVyMatch) throw new Error('ENEMY_VY (vy in spawnWaveA) not found in game.js');
const ENEMY_VY = parseFloat(enemyVyMatch[1]);

const PLAYER_R = 8;
const ENEMY_R = 10;
const BULLET_R = 4;

// graze: 弾本体 + プレイヤー本体の和 × 2.5 倍 = 30 px 以内に入った distinct bullet をカウント。
// 既存 game.js に graze 概念はないが、proxy 指標として「弾がどれだけプレイヤーに掠めたか」を計測。
const GRAZE_DIST = (PLAYER_R + BULLET_R) * 2.5; // 30 px

// cast 試行 cadence: ECHO_FRAMES * 2 = 120 frames = 2 秒。
// 理由: cast 後 echo が ECHO_FRAMES=60 走り、その後 trail が再充填されるのに最低 ECHO_FRAMES=60 必要。
// CAST_GAP < 120 だと trail が echo 前と被って同じ path を繰り返す degenerate ケースが起きる。
// 「1 秒に 1 回程度」という素朴良手の意図に対し、game 機構上の自然下限 = 2 秒/cast に固定。
const CAST_GAP_FRAMES = ECHO_FRAMES * 2;

// --- seeded PRNG (verify.js と同型) ---
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- game.js spawnWaveA / spawnBullet / updateEnemies / updateBullets 同型 ---
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
    if (d < e.r + state.player.r) return { hit: true, by: 'enemy', id: e.id };
  }
  for (const b of state.bullets) {
    const d = Math.hypot(b.x - state.player.x, b.y - state.player.y);
    if (d < b.r + state.player.r) return { hit: true, by: 'bullet', id: b.id };
  }
  return { hit: false };
}

// graze: 弾 1 個につき 1 回だけカウント (grazed フラグで重複防止)
// 「衝突半径より大きく GRAZE_DIST より小さい」帯に入った distinct bullet をインクリメント
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

// --- 素朴良手 agent ---
// 設計: nospecial (最近接脅威から逃げる) + 中央バイアス (重み 0.25) で画面端張り付き防止。
// 端に張り付くと予測ロック中の path が画面端で固定され、castLock の意味が薄れるため。
// CAMP_TARGET = (W*0.5, H*0.78) はプレイヤー初期位置 = 縦シューにおける「下中央=避けやすい帯」。
// 加えて MOVE_NOISE_SCALE で方向に微小ノイズを足す。完全決定論だと seed 差が結果に出ず
// 「30 試行中央値」の意味が消えるため、人間プレイヤーの揺らぎ代理として微小確率を導入。
const MOVE_NOISE_SCALE = 0.25;

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
  // 中央バイアス
  const cx = W * 0.5, cy = H * 0.78;
  const tx = cx - state.player.x;
  const ty = cy - state.player.y;
  const tn = Math.hypot(tx, ty) || 1;
  dx += (tx / tn) * 0.25;
  dy += (ty / tn) * 0.25;
  // 微小ノイズ (seed 差を結果に反映する人間揺らぎ代理)
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

// --- castLock / updateEcho (game.js と同型) ---
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
    // resolveLock 相当: hit/miss 集計、echo 解除、最終 echo 終端フレームを記録
    if (state.echo.hit) {
      state.lockResults.miss += 1;
    } else {
      state.lockResults.hit += 1;
    }
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
    lastEchoEndFrame: -CAST_GAP_FRAMES, // 起動直後から trail 充填待ちで castable
    nextBulletId: 1,
    frame: 0,
  };
  const rng = mulberry32(seed); // agent move noise 用 (seed 差を結果に反映)

  let deathFrame = null;
  let deathCause = null;

  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    state.frame = frame;

    // game.js step() と同順:
    //   1) cast 判定 (echo 内ならスキップ) — game.js では spaceEdge → castLock
    //   2) updatePlayer (echo 中は早期 return) — game.js と同型
    //   3) updateEcho — game.js と同型
    //   4) wave 管理 — game.js では frame % 2 === 0 ゲートだが、本 runner では即 spawn (audit 性のため決定論優先)
    //   5) updateEnemies / updateBullets / countGrazes / checkCollisions

    // 1) cast 試行: 非 echo、trail 十分、最終 echo 終端から CAST_GAP 経過の3条件
    if (!state.echo && state.trail.length >= ECHO_FRAMES &&
        frame - state.lastEchoEndFrame >= CAST_GAP_FRAMES) {
      castLock(state);
    }

    // 2) 移動 (echo 中はスキップ、trail も push しない = game.js と同型)
    if (!state.echo) {
      naiveGoodHandMove(state, rng);
      state.trail.push({ x: state.player.x, y: state.player.y });
      if (state.trail.length > ECHO_FRAMES * 2) state.trail.shift();
    }

    // 3) updateEcho (echo 中なら player 上書き、終端なら resolve)
    updateEcho(state);

    // 4) wave 管理 (audit 用に frame % 2 === 0 ゲート省略、即 spawn)
    if (!state.waveSpawned) spawnWaveA(state);
    if (state.waveSpawned && state.enemies.length === 0) state.waveSpawned = false;

    // 5) enemy / bullet update + graze count + collision
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
  const baseSeed = 20260526;
  for (let i = 0; i < TRIALS; i++) {
    trials.push(runOne(baseSeed + i));
  }

  // 全試行が play_time_sec < 0.05 (= 3 frames 以内死) なら frame 計算破綻として exit 1
  const allInstantDeath = trials.every(t => t.play_time_sec < 0.05);

  const report = {
    audit: 'agent_difficulty_proxy',
    target: 'game/log_autonomous_game/v001/game.js',
    source: 'arXiv:2410.02829 (Wordle r=0.624 / Slay the Spire r=0.871, Pearson, p<10^-3)',
    thesis: '素朴良手 agent (Space 約2秒に1回 castLock + 中央バイアス nospecial 移動) 30 試行 4 指標中央値で v001 を計測',
    trials_count: trials.length,
    max_frames: MAX_FRAMES,
    max_seconds: MAX_FRAMES / FPS,
    cast_gap_frames: CAST_GAP_FRAMES,
    graze_distance_px: GRAZE_DIST,
    extracted_params: {
      ECHO_FRAMES, BULLET_SPEED, SHOOT_INTERVAL, SHOOT_GATE_Y_MAX, PLAYER_SPEED, ENEMY_VY,
      PLAYER_SPEED_STRENGTH, PLAYER_SPEED_AGENT,
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
      '論文 (Wordle / Slay the Spire) はターン制、本 v001 はリアルタイム弾避け = 構造違いリスクあり',
      '本数値は self_judgment の 3→4 暫定昇格根拠まで。確定 5 採点は実機判定依存',
      'residual_hp_ratio は v001 が 1-hit kill のため binary (1.0/0.0)、HP system 導入時に連続値化',
      '素朴良手 agent には MOVE_NOISE_SCALE=0.25 の方向微小ノイズあり (人間揺らぎ代理)、seed 差で結果分散が出る',
    ],
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(allInstantDeath ? 1 : 0);
}

main();
