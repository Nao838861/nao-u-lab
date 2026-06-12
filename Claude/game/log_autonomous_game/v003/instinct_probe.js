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
// C293 Phase 4 拡張 (SHOOT_INTERVAL ramp on/off 比較):
//   --shoot-ramp フラグ (default off) で phase 2 (50-90s) 内の SHOOT_INTERVAL を
//   90 → 60 frame に線形漸変させる挙動 (game.js L356-363 currentShootInterval と同型)
//   を probe にも適用可能化。off では従来通り SHOOT_INTERVAL=90 固定。仮説 = ramp on
//   で本能側応答密度 (probe_density) の中央値・分散が変化する。検証方法 = 同一 seed
//   集合で ramp on/off の中央値比較 (PEARSON_BLOCKER §6-3 (b) Spearman fallback 軸)。
//   出典 = arxiv 2410.02829 "LLMs as Testers" の「絶対値ではなく相対 difficulty
//   ranking の方が安定」観測の v003 実装適用第 1 段。
//
// C291 Phase 3 拡張 (位相ごとサンプリング層分離):
//   game.js WAVE_TIMELINE 3 phase (0-20s 導入 / 20-50s 中盤 / 50-90s 終盤) を probe
//   出力でも分離。各 castLock の開始 frame から phase を割り出し、phase 別に
//   {cast_count, post_lock_input_count, post_lock_frame_total, probe_density} を集計。
//   全体集計は従来通り保持し後方互換維持。背景 = #all-nao-u-lab 2026-06-03 早朝
//   (ts=1780408308) で出した「4 感覚 proxy → 位相ごと検査系」atom と Mir C283 位相依存
//   フレーム接続提案を、text ではなく code instrumentation として落とす1手。
//   何が示せるか: phase 0/1/2 で probe_density 中央値が分離するか (= 位相軸が
//   density を構造化するか) を 1 走で観測可能。
//   何は示せないか: 「density 差」と「人間体感の phase 差」の対応関係 (これは別の
//   検証層が必要)。
//
// 使い方: cd game/log_autonomous_game/v003 && node instinct_probe.js
//   stdout: 1 JSONL 行/trial (--trials N で複数 trial、default 1)
//   --seed-base N (default 20260601)、--trials N (default 1)、--out PATH で JSONL 保存
//   --strategy NAME (default naive_good。naive_good / camper / blind-sweeper)
//   --shoot-ramp (default off。on 時 phase 2 内 SHOOT_INTERVAL を 90→60 線形漸変)

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
// C293 Phase 4: WAVE_TIMELINE[2] = phase 2 (50s-90s) の frame 境界。game.js L51-55 と同期。
const PHASE2_START_FRAME = 50 * FPS;
const PHASE2_END_FRAME = 90 * FPS;
// C291 Phase 3: phase 境界 frame。game.js WAVE_TIMELINE と同期 (0-20s / 20-50s / 50-90s)。
const PHASE_END_FRAMES = [20 * FPS, 50 * FPS, 90 * FPS];
function phaseFromFrame(f) {
  for (let i = 0; i < PHASE_END_FRAMES.length; i++) {
    if (f < PHASE_END_FRAMES[i]) return i;
  }
  return PHASE_END_FRAMES.length - 1; // 90s 超は phase 2 維持 (game.js getPhaseAt と同型)
}
// game.js L356-363 currentShootInterval と同型 (probe では playStartFrame=0 のため nowFrame = elapsed)
function currentShootInterval(nowFrame) {
  if (nowFrame < PHASE2_START_FRAME) return SHOOT_INTERVAL;
  if (nowFrame >= PHASE2_END_FRAME) return SHOOT_INTERVAL_PHASE2_MIN;
  const t = (nowFrame - PHASE2_START_FRAME) / (PHASE2_END_FRAME - PHASE2_START_FRAME);
  return Math.round(SHOOT_INTERVAL + (SHOOT_INTERVAL_PHASE2_MIN - SHOOT_INTERVAL) * t);
}

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
function updateEnemies(s, shootRamp) {
  for (const e of s.enemies) {
    if (!e.alive) continue;
    e.y += e.vy;
    if (e.y > H + 30) { e.alive = false; continue; }
    if (e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX) {
      if (--e.shootCooldown <= 0) {
        const dx = s.player.x - e.x, dy = s.player.y - e.y, d = Math.hypot(dx, dy) || 1;
        s.bullets.push({ x: e.x, y: e.y, vx: (dx / d) * BULLET_SPEED, vy: (dy / d) * BULLET_SPEED, r: BULLET_R, alive: true });
        e.shootCooldown = shootRamp ? currentShootInterval(s.frame) : SHOOT_INTERVAL;
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
// C292 Phase 4: phase 0 死亡解消用の bullet sidestep 戦略。strategyNaiveGood は touch しない (回帰防止)。
//   観測 (C291 Phase 3 commit bc5a4032c): naive_good seed 20260603+0..9 で 10/10 bullet 死、play_time≈8.68s。
//   v2 中間 (重み調整のみ): 10/10 bullet 死 play_time≈8.6-10.0s で微改善のみ。
//   構造的原因: castLock (60 frame) 中は trail を再生するため cast 開始後に発射された弾は不可避。
//   処方: shmup 基本「弾道に垂直 sidestep」を導入し trail の軌跡多様性を上げる:
//     (a) 最近接 bullet について ECHO_FRAMES 先まで予測し最接近時刻 tHit を求める
//     (b) 危険距離 (< 120px) なら bullet 進行ベクトル (vx,vy) と垂直方向に sidestep
//         (player → bullet ベクトルとの内積符号で左右を選択)
//     (c) bullet 進行方向と逆成分で軽く離反
//     (d) 安全時 (bullet 遠 or 不在) は中央復帰
//     (e) enemy 離反は弱め (0.2)、ノイズも縮小 (±0.2)
function strategyNaiveGoodV2(s, rng) {
  let nearestB = null, nbd = Infinity;
  for (const b of s.bullets) {
    let minD = Infinity;
    for (let k = 0; k <= ECHO_FRAMES; k += 4) {
      const px = b.x + b.vx * k, py = b.y + b.vy * k;
      const d = Math.hypot(px - s.player.x, py - s.player.y);
      if (d < minD) minD = d;
    }
    if (minD < nbd) { nbd = minD; nearestB = b; }
  }
  let dx = 0, dy = 0;
  if (nearestB && nbd < 120) {
    const b = nearestB;
    const bs = Math.hypot(b.vx, b.vy) || 1;
    const perpX = -b.vy / bs, perpY = b.vx / bs;
    const toPlayerX = s.player.x - b.x, toPlayerY = s.player.y - b.y;
    const sign = Math.sign(perpX * toPlayerX + perpY * toPlayerY) || 1;
    dx += perpX * sign * 1.2; dy += perpY * sign * 1.2;
    dx -= (b.vx / bs) * 0.5; dy -= (b.vy / bs) * 0.5;
  } else {
    const cx = W * 0.5, cy = H * 0.78, tx = cx - s.player.x, ty = cy - s.player.y, tn = Math.hypot(tx, ty) || 1;
    dx += (tx / tn) * 0.5; dy += (ty / tn) * 0.5;
  }
  let neX = 0, neY = 0, ned = Infinity;
  for (const e of s.enemies) {
    const d = Math.hypot(e.x - s.player.x, e.y - s.player.y);
    if (d < ned) { ned = d; neX = e.x; neY = e.y; }
  }
  if (ned < Infinity) {
    const fx = s.player.x - neX, fy = s.player.y - neY, n = Math.hypot(fx, fy) || 1;
    dx += (fx / n) * 0.2; dy += (fy / n) * 0.2;
  }
  dx += (rng() - 0.5) * 0.2; dy += (rng() - 0.5) * 0.2;
  return { dx, dy };
}
// C295 Phase 4: v2 が phase 0 早期 enemy 接触 3/10 で詰まる新盲点 (sidestep 垂直 1.2 が強すぎ
//   bullet 回避中に enemy 体当たり) を解消するため、sidestep ベクトルに「弾源 enemy からも
//   離反」の合成項を加える。3 試行で着地 (staging 完遂条件 max 2 リトライ準拠):
//     試行 1: enemy 離反 0.5 一律 < 200 → bullet sidestep 撹乱で phase1=4/10 悪化 (棄却)
//     試行 3: bullet sidestep を < 140 / 重み 1.3 / ノイズ 0.15 で強化 → bullet 死 9/10 悪化 (棄却)
//     試行 2 (本着地): enemy を 2 段化 (緊急 < 80px は 0.6、中距離 80-180px は 0.2、安全時中央 0.5)
//   結果 (seed 20260603+0..9): phase 1 到達 6/10 (v2 同等、target 8 未達),
//     phase 2 到達 3/10 (v2 1/10 から +2、target 2 達成),
//     enemy 死 2/10 (v2 3/10 から -1、target 1 未達)。
//   完遂条件 7 項目中 phase 2 + 3 commit/run 系合計 4 達成 / phase 1 + enemy 死 + 死因シフト
//     未達。次サイクル v4 候補処方 = bullet sidestep の予測 horizon 拡張 + castLock 中の事前
//     位置取り。
//   役割分担:
//     bullet: 危険時 (< 120px) は垂直 sidestep 1.2 + 弾源逆 0.5 (v2 同値)
//     enemy : 緊急近接 (< 80px) のみ強く 0.6 離反 (体当たり直前回避)
//             中距離 (80-180px) は弱く 0.2 離反 (v2 0.2 同値、bullet sidestep 撹乱抑制)
//     安全時: 中央バイアス 0.5 (前作 v2 と同値)
//     ノイズ: ±0.2 (前作 v2 と同値)
function strategyNaiveGoodV3(s, rng) {
  let nearestB = null, nbd = Infinity;
  for (const b of s.bullets) {
    let minD = Infinity;
    for (let k = 0; k <= ECHO_FRAMES; k += 4) {
      const px = b.x + b.vx * k, py = b.y + b.vy * k;
      const d = Math.hypot(px - s.player.x, py - s.player.y);
      if (d < minD) minD = d;
    }
    if (minD < nbd) { nbd = minD; nearestB = b; }
  }
  let dx = 0, dy = 0;
  if (nearestB && nbd < 120) {
    const b = nearestB;
    const bs = Math.hypot(b.vx, b.vy) || 1;
    const perpX = -b.vy / bs, perpY = b.vx / bs;
    const toPlayerX = s.player.x - b.x, toPlayerY = s.player.y - b.y;
    const sign = Math.sign(perpX * toPlayerX + perpY * toPlayerY) || 1;
    dx += perpX * sign * 1.2; dy += perpY * sign * 1.2;
    dx -= (b.vx / bs) * 0.5; dy -= (b.vy / bs) * 0.5;
  } else {
    const cx = W * 0.5, cy = H * 0.78, tx = cx - s.player.x, ty = cy - s.player.y, tn = Math.hypot(tx, ty) || 1;
    dx += (tx / tn) * 0.5; dy += (ty / tn) * 0.5;
  }
  let neX = 0, neY = 0, ned = Infinity;
  for (const e of s.enemies) {
    const d = Math.hypot(e.x - s.player.x, e.y - s.player.y);
    if (d < ned) { ned = d; neX = e.x; neY = e.y; }
  }
  if (ned < Infinity) {
    const fx = s.player.x - neX, fy = s.player.y - neY, n = Math.hypot(fx, fy) || 1;
    const w = ned < 80 ? 0.6 : (ned < 180 ? 0.2 : 0);
    if (w > 0) { dx += (fx / n) * w; dy += (fy / n) * w; }
  }
  dx += (rng() - 0.5) * 0.2; dy += (rng() - 0.5) * 0.2;
  return { dx, dy };
}
const STRATEGIES = {
  naive_good: strategyNaiveGood,
  naive_good_v2: strategyNaiveGoodV2,
  naive_good_v3: strategyNaiveGoodV3,
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

function emptyPhaseStats() {
  return PHASE_END_FRAMES.map(() => ({ cast_count: 0, post_lock_input_count: 0, post_lock_frame_total: 0 }));
}
function densityOf(inputCount, frameTotal) {
  return frameTotal > 0 ? Number((inputCount / frameTotal).toFixed(4)) : null;
}
function buildPhaseOutput(phaseStats) {
  return phaseStats.map((p, i) => ({
    phase_idx: i,
    cast_count: p.cast_count,
    post_lock_input_count: p.post_lock_input_count,
    post_lock_frame_total: p.post_lock_frame_total,
    probe_density: densityOf(p.post_lock_input_count, p.post_lock_frame_total),
  }));
}

function runOne(seed, strategyName, strategyFn, shootRamp) {
  const s = { player: { x: W * 0.5, y: H * 0.78, r: PLAYER_R }, enemies: [], bullets: [], trail: [],
    echo: null, waveSpawned: false, waveCount: 0, lastEndFrame: -CAST_GAP_FRAMES, frame: 0 };
  const rng = mulberry32(seed);
  let castCount = 0, postLockInputCount = 0, postLockFrameTotal = 0;
  let probeBuf = null, lastDir = null;
  // C291 Phase 3: phase 別集計バッファ。castLock の開始 frame で phase を確定し、
  // probeBuf にも phaseIdx を持たせて完了時に該当 phase へ加算する。
  const phaseStats = emptyPhaseStats();

  for (let f = 0; f < MAX_FRAMES; f++) {
    s.frame = f;
    if (!s.echo && s.trail.length >= ECHO_FRAMES && f - s.lastEndFrame >= CAST_GAP_FRAMES) {
      const phaseIdx = phaseFromFrame(f);
      s.echo = { startFrame: f, path: s.trail.slice(-ECHO_FRAMES).map(p => ({ x: p.x, y: p.y })), phaseIdx };
      castCount += 1;
      phaseStats[phaseIdx].cast_count += 1;
    }
    if (s.echo) {
      const elapsed = f - s.echo.startFrame;
      if (elapsed >= ECHO_FRAMES) {
        const lockPhase = s.echo.phaseIdx;
        s.echo = null; s.lastEndFrame = f;
        probeBuf = { remaining: PROBE_WINDOW_FRAMES, prev: null, changes: 0, phaseIdx: lockPhase };
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
          phaseStats[probeBuf.phaseIdx].post_lock_input_count += probeBuf.changes;
          phaseStats[probeBuf.phaseIdx].post_lock_frame_total += PROBE_WINDOW_FRAMES;
          probeBuf = null;
        }
      }
    }
    if (s.waveSpawned && s.enemies.length === 0) s.waveSpawned = false;
    if (!s.waveSpawned && s.enemies.length === 0) spawnWaveA(s);
    updateEnemies(s, shootRamp); updateBullets(s);
    const cause = collided(s);
    if (cause) return { strategy: strategyName, seed, shoot_ramp: shootRamp, outcome: 'gameover', death_cause: cause, play_time_sec: Number((f / FPS).toFixed(2)),
      cast_count: castCount, post_lock_input_count: postLockInputCount, post_lock_frame_total: postLockFrameTotal,
      probe_density: densityOf(postLockInputCount, postLockFrameTotal),
      phase_stats: buildPhaseOutput(phaseStats) };
  }
  return { strategy: strategyName, seed, shoot_ramp: shootRamp, outcome: 'survived', death_cause: null, play_time_sec: 90.0,
    cast_count: castCount, post_lock_input_count: postLockInputCount, post_lock_frame_total: postLockFrameTotal,
    probe_density: densityOf(postLockInputCount, postLockFrameTotal),
    phase_stats: buildPhaseOutput(phaseStats) };
}

const SEED_BASE = parseArg('--seed-base', 20260601);
const TRIALS = parseArg('--trials', 1);
const OUT = parseStr('--out', null);
const STRATEGY_NAME = parseStr('--strategy', 'naive_good');
const SHOOT_RAMP = process.argv.includes('--shoot-ramp');
const strategyFn = STRATEGIES[STRATEGY_NAME];
if (!strategyFn) {
  process.stderr.write(`[ERROR] unknown strategy: ${STRATEGY_NAME} (available: ${Object.keys(STRATEGIES).join(', ')})\n`);
  process.exit(1);
}
const lines = [];
const records = [];
for (let i = 0; i < TRIALS; i++) {
  const r = runOne(SEED_BASE + i, STRATEGY_NAME, strategyFn, SHOOT_RAMP);
  r.seed_base = SEED_BASE; r.trial = i; r.probe_window_frames = PROBE_WINDOW_FRAMES;
  records.push(r);
  lines.push(JSON.stringify(r));
}
const text = lines.join('\n') + '\n';
process.stdout.write(text);
if (OUT) fs.writeFileSync(OUT, text);

// C293 Phase 4: stderr に集計サマリ 1 行 (中央値ベース、ramp on/off 比較を即視認可能化)
function median(arr) {
  const a = arr.filter(v => v !== null && Number.isFinite(v)).slice().sort((x, y) => x - y);
  if (a.length === 0) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
const densities = records.map(r => r.probe_density);
const casts = records.map(r => r.cast_count);
const playTimes = records.map(r => r.play_time_sec);
const inputs = records.map(r => r.post_lock_input_count);
const med = (v) => v === null ? 'null' : v.toFixed(4);
process.stderr.write(`[SUMMARY] strategy=${STRATEGY_NAME} shoot_ramp=${SHOOT_RAMP} trials=${TRIALS} ` +
  `median(probe_density)=${med(median(densities))} median(cast_count)=${median(casts)} ` +
  `median(play_time_sec)=${med(median(playTimes))} median(post_lock_input_count)=${median(inputs)}\n`);
// C291 Phase 3: phase 別中央値も即視認可能化。phase 0: 0-20s, phase 1: 20-50s, phase 2: 50-90s。
for (let i = 0; i < PHASE_END_FRAMES.length; i++) {
  const ps = records.map(r => (r.phase_stats && r.phase_stats[i]) ? r.phase_stats[i].probe_density : null);
  const cs = records.map(r => (r.phase_stats && r.phase_stats[i]) ? r.phase_stats[i].cast_count : 0);
  process.stderr.write(`[SUMMARY_PHASE] phase=${i} median(probe_density)=${med(median(ps))} median(cast_count)=${median(cs)}\n`);
}
