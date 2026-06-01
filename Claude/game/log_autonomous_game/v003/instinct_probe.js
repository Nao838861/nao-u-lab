#!/usr/bin/env node
// instinct_probe.js — log_autonomous_game v003 本能側応答密度の最小計測 (C281 Phase 4)
//
// 出典・狙い:
//   gdlab_hama 2026-06-01 09:15 ツイート「ゲームの核 = 本能的に気持ち良い要素 + 体験ゴール
//   逆算要素の複合、再設計時はまず分解」を v003 に適用した結果、proxy_icc_diagnose.py が
//   「逆算側の道具を本能側の測定器として流用している」混線であると Phase 2 で発見。
//   本 probe は「本能側」を直接観測する第 1 本: castLock 解除直後 100ms (= 6 frame @60FPS)
//   窓内に bot がどれだけ「方向変更を伴う即応」をしたかを 1 試行ごとに記録する。
//
// 観測仕様:
//   1 frame = 1 方向トークン (9-way: noop / 8 方位)。trail を持つ素朴良手 bot を 1 seed × 1 trial
//   走らせ、resolveLock 発火直後 6 frame の方向トークン列をとり、隣接 frame 間で方向が変わった
//   回数を post_lock_input_count とする。probe_density = post_lock_input_count / (castLock_count × 6)。
//
// What this proves:
//   - 「resolveLock 直後の 6 frame 窓で方向変更が観測可能」= 測定経路が動く
//   - seed/方針を変えると probe_density が分散することの初回観測 (= 計測解像度の証拠)
// What this does NOT prove:
//   - probe_density と人間体感の相関 (本サイクルでは反証ライン §1 の「測れているように見えて
//     測れていない」二重事故リスクの初期検証段階。3 trial 程度で分散が見えれば成立)
//   - 本能側応答密度 ↔ 「面白さ」の写像 (本 probe は density の値そのものではなく
//     density 軸が機能することを示す段階)
//
// C282 Phase 4 物理的再定義 (Wayline / ACM CHI 2024 接続):
//   本 probe を「本能側応答密度」の量化ではなく **action-feedback link 切断の代理指標** として
//   再定義する。出典 = (a) Wayline "The Juice Problem" (2024) は「juice for the sake of juice
//   は core mechanic を覆い隠す」と主張、(b) ACM CHI 2024 "How does Juicy Game Feedback Motivate?"
//   (Lieberoth et al.) は curiosity / competence / effectance を媒介変数として「juice 強度天井
//   を超えると action-feedback link が隠れて competence が下がる」を実験。本 probe の post_lock
//   方向変化を「link 切断時のリカバリ動作 (確認入力) or 麻痺フリーズ」の代理として読む。
//   仮説: 同一 seed × 同一方針で probe_density が trial 間で大きく振れる場合は link 切断発生の
//   間接エビデンス、振れが小さい場合は link 維持。3 trial 分散観測で仮説の方向性 (上振れ /
//   下振れ どちらが link 切断と相関するか) を判定する段階に進める。
//   実証ステータス: 本 docstring 更新 (C282) は仮説提示のみ、3 trial 分散観測は C283-C290 で実施。
//   独立同型: 濱村 6/01 09:15「本能側 + 逆算側の複合、再設計時はまず分解」と 3 ソース独立到達。
//
// C284 Phase 4 拡張 (戦略 × seed grid + ICC 軸独立性検証):
//   --strategy フラグで 3 bot 戦略を切替可能化 (naive_good / camper / blind-sweeper)。
//   3 戦略 × 10 seeds = 30 trials の probe_density 集合に対し instinct_grid_icc.py で
//   戦略軸 ICC(2,1) を計算、軸独立性 (probe_density が戦略間で分離するか) を 1 関門
//   進める。proxy_icc_diagnose.py が seed_base 軸で 4 列とも ICC≈0 / FAIL 確定済 → 軸を
//   変えて再計測する処方の第 1 段。
//
// 使い方: cd game/log_autonomous_game/v003 && node instinct_probe.js
//   stdout: 1 JSONL 行/trial (--trials N で複数 trial、default 1)
//   --seed-base N (default 20260601)、--trials N (default 1)、--out PATH で JSONL 保存
//   --strategy NAME (default naive_good。naive_good / camper / blind-sweeper)

const fs = require('fs');
const path = require('path');

function parseArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx === process.argv.length - 1) return fallback;
  const v = process.argv[idx + 1];
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function parseStr(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx === process.argv.length - 1) return fallback;
  return process.argv[idx + 1];
}

// game.js から const 値を抽出 (agent_difficulty_proxy.js と同型)
const SRC = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');
function constOf(name) {
  const m = SRC.match(new RegExp(`const\\s+${name}\\s*=\\s*([^;]+?);`));
  if (!m) throw new Error(`const ${name} not in game.js`);
  return Function('W', 'H', 'FPS', `return (${m[1]});`)(640, 720, 60);
}
const W = 640, H = 720, FPS = 60;
const ECHO_FRAMES = constOf('ECHO_FRAMES');
const SHOOT_INTERVAL = constOf('SHOOT_INTERVAL');
const SHOOT_INTERVAL_PHASE2_MIN = constOf('SHOOT_INTERVAL_PHASE2_MIN');
const SHOOT_GATE_Y_MAX = constOf('SHOOT_GATE_Y_MAX');
const BULLET_SPEED = constOf('BULLET_SPEED');
const ENEMY_VY_A = constOf('ENEMY_VY_A');
const PROBE_WINDOW_FRAMES = 6;       // 100ms 窓 (6 / 60 FPS = 0.1s)
const CAST_GAP_FRAMES = ECHO_FRAMES * 2;
const MAX_FRAMES = FPS * 90;
const PLAYER_SPEED = 3.4 * 1.5;      // agent boost 同型 (PLAYER_SPEED_AGENT)
const PLAYER_R = 8, ENEMY_R = 10, BULLET_R = 4;

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 9-way 方向トークン: (sx, sy) ∈ {-1, 0, 1} → 0..8
function dirToken(dx, dy) {
  const sx = dx > 0.15 ? 1 : (dx < -0.15 ? -1 : 0);
  const sy = dy > 0.15 ? 1 : (dy < -0.15 ? -1 : 0);
  return (sx + 1) * 3 + (sy + 1);
}

function spawnWaveA(s) {
  for (let i = 0; i < 3; i++) {
    s.enemies.push({ type: 'A', x: W * (0.25 + i * 0.25), y: -20 - i * 40,
      vy: ENEMY_VY_A, r: ENEMY_R, alive: true, shootCooldown: 60 + i * 20 });
  }
  s.waveCount += 1; s.waveSpawned = true;
}
function updateEnemies(s) {
  for (const e of s.enemies) {
    if (!e.alive) continue;
    e.y += e.vy;
    if (e.y > H + 30) { e.alive = false; continue; }
    if (e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX) {
      if (--e.shootCooldown <= 0) {
        const dx = s.player.x - e.x, dy = s.player.y - e.y, d = Math.hypot(dx, dy) || 1;
        s.bullets.push({ x: e.x, y: e.y, vx: (dx / d) * BULLET_SPEED, vy: (dy / d) * BULLET_SPEED, r: BULLET_R, alive: true });
        e.shootCooldown = SHOOT_INTERVAL;
      }
    }
  }
  s.enemies = s.enemies.filter(e => e.alive);
}
function updateBullets(s) {
  for (const b of s.bullets) { b.x += b.vx; b.y += b.vy;
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) b.alive = false; }
  s.bullets = s.bullets.filter(b => b.alive);
}
function collided(s) {
  for (const e of s.enemies) if (Math.hypot(e.x - s.player.x, e.y - s.player.y) < e.r + s.player.r) return 'enemy';
  for (const b of s.bullets) if (Math.hypot(b.x - s.player.x, b.y - s.player.y) < b.r + s.player.r) return 'bullet';
  return null;
}

// 戦略: 各関数は正規化前の (dx, dy) を返す。applyMove で速度反映・クランプ・dirToken 生成。
//   - naive_good: 素朴良手 (最近接脅威から離反 + 中央バイアス + 微小ノイズ)
//   - camper: 完全不動 (verify.js strategyCamper 同型) — castLock 自体は発火するが
//             post-lock 6 frame の dirToken 列は中央停止のまま → probe_density = 0.0 想定
//   - blind-sweeper: 毎 frame 一様乱数 ±1 方向 (verify.js strategyBlindSweeper 同型)
function strategyNaiveGood(s, rng) {
  let nx = null, nd = Infinity;
  for (const b of s.bullets) { const d = Math.hypot(b.x - s.player.x, b.y - s.player.y); if (d < nd) { nd = d; nx = b; } }
  for (const e of s.enemies) { const d = Math.hypot(e.x - s.player.x, e.y - s.player.y); if (d < nd) { nd = d; nx = e; } }
  let dx = 0, dy = 0;
  if (nx) { const fx = s.player.x - nx.x, fy = s.player.y - nx.y, n = Math.hypot(fx, fy) || 1; dx = fx / n; dy = fy / n; }
  const cx = W * 0.5, cy = H * 0.78, tx = cx - s.player.x, ty = cy - s.player.y, tn = Math.hypot(tx, ty) || 1;
  dx += (tx / tn) * 0.25; dy += (ty / tn) * 0.25;
  dx += (rng() - 0.5) * 0.5; dy += (rng() - 0.5) * 0.5;
  return { dx, dy };
}
function strategyCamper(_s, _rng) { return { dx: 0, dy: 0 }; }
function strategyBlindSweeper(_s, rng) {
  const dx = Math.floor(rng() * 3) - 1;
  const dy = Math.floor(rng() * 3) - 1;
  return { dx, dy };
}
const STRATEGIES = {
  naive_good: strategyNaiveGood,
  camper: strategyCamper,
  'blind-sweeper': strategyBlindSweeper,
};

function applyMove(s, rawDx, rawDy) {
  const m = Math.hypot(rawDx, rawDy);
  let dx = 0, dy = 0;
  if (m > 0) { dx = rawDx / m; dy = rawDy / m; s.player.x += dx * PLAYER_SPEED; s.player.y += dy * PLAYER_SPEED; }
  s.player.x = Math.max(s.player.r, Math.min(W - s.player.r, s.player.x));
  s.player.y = Math.max(s.player.r, Math.min(H - s.player.r, s.player.y));
  return { dx, dy };
}

function runOne(seed, strategyName, strategyFn) {
  const s = { player: { x: W * 0.5, y: H * 0.78, r: PLAYER_R }, enemies: [], bullets: [], trail: [],
    echo: null, waveSpawned: false, waveCount: 0, lastEndFrame: -CAST_GAP_FRAMES, frame: 0 };
  const rng = mulberry32(seed);
  let castCount = 0, postLockInputCount = 0, postLockFrameTotal = 0;
  let probeBuf = null, lastDir = null;

  for (let f = 0; f < MAX_FRAMES; f++) {
    s.frame = f;
    if (!s.echo && s.trail.length >= ECHO_FRAMES && f - s.lastEndFrame >= CAST_GAP_FRAMES) {
      s.echo = { startFrame: f, path: s.trail.slice(-ECHO_FRAMES).map(p => ({ x: p.x, y: p.y })) };
      castCount += 1;
    }
    if (s.echo) {
      const elapsed = f - s.echo.startFrame;
      if (elapsed >= ECHO_FRAMES) {
        s.echo = null; s.lastEndFrame = f;
        probeBuf = { remaining: PROBE_WINDOW_FRAMES, prev: null, changes: 0 };
      } else {
        const p = s.echo.path[elapsed];
        if (p) { s.player.x = p.x; s.player.y = p.y; }
      }
    } else {
      const raw = strategyFn(s, rng);
      const { dx, dy } = applyMove(s, raw.dx, raw.dy);
      s.trail.push({ x: s.player.x, y: s.player.y });
      if (s.trail.length > ECHO_FRAMES * 2) s.trail.shift();
      lastDir = dirToken(dx, dy);
      if (probeBuf && probeBuf.remaining > 0) {
        if (probeBuf.prev !== null && probeBuf.prev !== lastDir) probeBuf.changes += 1;
        probeBuf.prev = lastDir; probeBuf.remaining -= 1;
        if (probeBuf.remaining === 0) {
          postLockInputCount += probeBuf.changes;
          postLockFrameTotal += PROBE_WINDOW_FRAMES;
          probeBuf = null;
        }
      }
    }
    if (s.waveSpawned && s.enemies.length === 0) s.waveSpawned = false;
    if (!s.waveSpawned && s.enemies.length === 0) spawnWaveA(s);
    updateEnemies(s); updateBullets(s);
    const cause = collided(s);
    if (cause) return { strategy: strategyName, seed, outcome: 'gameover', death_cause: cause, play_time_sec: Number((f / FPS).toFixed(2)),
      cast_count: castCount, post_lock_input_count: postLockInputCount, post_lock_frame_total: postLockFrameTotal,
      probe_density: postLockFrameTotal > 0 ? Number((postLockInputCount / postLockFrameTotal).toFixed(4)) : null };
  }
  return { strategy: strategyName, seed, outcome: 'survived', death_cause: null, play_time_sec: 90.0,
    cast_count: castCount, post_lock_input_count: postLockInputCount, post_lock_frame_total: postLockFrameTotal,
    probe_density: postLockFrameTotal > 0 ? Number((postLockInputCount / postLockFrameTotal).toFixed(4)) : null };
}

const SEED_BASE = parseArg('--seed-base', 20260601);
const TRIALS = parseArg('--trials', 1);
const OUT = parseStr('--out', null);
const STRATEGY_NAME = parseStr('--strategy', 'naive_good');
const strategyFn = STRATEGIES[STRATEGY_NAME];
if (!strategyFn) {
  process.stderr.write(`[ERROR] unknown strategy: ${STRATEGY_NAME} (available: ${Object.keys(STRATEGIES).join(', ')})\n`);
  process.exit(1);
}
const lines = [];
for (let i = 0; i < TRIALS; i++) {
  const r = runOne(SEED_BASE + i, STRATEGY_NAME, strategyFn);
  r.seed_base = SEED_BASE; r.trial = i; r.probe_window_frames = PROBE_WINDOW_FRAMES;
  lines.push(JSON.stringify(r));
}
const text = lines.join('\n') + '\n';
process.stdout.write(text);
if (OUT) fs.writeFileSync(OUT, text);
