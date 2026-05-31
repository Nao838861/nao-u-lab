// log_autonomous_game v003 — Echo-Path (v002 ベース)
// 中心入力 Space: castLock で過去 1 秒の足跡を記録開始 → 1 秒後 resolveLock で判定
// 副入力: 矢印キー / WASD で移動
// v003 改修方針 (C250 Phase 4 大作業 — v002 completion_report §4「does NOT prove」7項目のうち
//   「phase 内密度カーブ」への着地):
//   (1) phase 2 (50-90s) 内で SHOOT_INTERVAL を 90 → 60 frame に線形漸変
//       (currentShootInterval(elapsed) 関数化、SHOOT_INTERVAL 定数は phase 0/1 のデフォルト値として残存)
//   (2) v002 までは wave 種別の単調増加 (A→A+D→A+D+C) のみで phase 内は平坦だった部分への直処方。
//       「展開差カーブ 21/25 = -1 失点」の出所 (completion_report §2) を v003 でクリアする最小差分

(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const FPS = 60;
  const ECHO_FRAMES = 60; // 1 秒
  // Q-D 弾パラメータ (design_log.md §Q-D 実装パラメータ準拠 / Movement Prediction 外部知見裏付け)
  const BULLET_SPEED = 2.0;        // pixel/frame、120 px/s、1秒先=120px=画面短辺640pxの19%
  const SHOOT_INTERVAL = 90;       // 1.5秒間隔 (phase 0/1 既定 / phase 2 初値)
  // v003: phase 2 (50-90s) 内で 90 → 60 frame に線形漸変させる範囲を保持
  const SHOOT_INTERVAL_PHASE2_MIN = 60; // phase 2 末尾 (=90s) で 60 frame = 1.0秒間隔 (33%増密度)
  const SHOOT_GATE_Y_MAX = H * 0.85; // 退場フェーズ手前まで (敵A 縦進行用)
  // 敵D 横断敵: 中央付近のみ射撃 (design_log §Q-C 敵D「中央付近でのみ射撃」)
  const SHOOT_GATE_X_MIN = W * 0.2;  // 128
  const SHOOT_GATE_X_MAX = W * 0.8;  // 512
  // 敵速度定数 (audit が静的抽出するため const 化)
  const ENEMY_VY_A = 1.4;          // 敵A 直進小型 縦速度
  const ENEMY_VX_D = 1.4;          // 敵D 横断敵 横速度 (vy_A と対称)
  const ENEMY_VY_C = 2.5;          // 敵C ダイブ 縦速度 (A の約 1.8 倍 = 「急襲」体感)
  const ENEMY_C_SWING_AMP = 60;    // 敵C 横揺れ振幅 (px)、baseX ± この値
  const ENEMY_C_SWING_PERIOD = 30; // 敵C 横揺れ角速度分母 (frame 単位、t/30 で sin 周期 ≈ 188F=3.1s)

  const STATE = { TITLE: 'TITLE', PLAYING: 'PLAYING', GAMEOVER: 'GAMEOVER', CLEAR: 'CLEAR' };

  // v002 wave カーブ: wave 1 軽量化 (n=3 + 初弾遅延 +30) → wave clear 後 8 秒静寂 → wave 2 (敵D)
  // Pulse Relay 70-90s カーブ第 1 段 「4-12s 学習 → 静寂 → 12-25s 基本混合」 のローカル化。
  const WAVE_REST_FRAMES = FPS * 8;

  // 70-90 秒時間カーブ本体 (C248 Phase 4): プレイ開始 frame からの経過で 3 phase 切替
  //   phase 0: 0-20s  導入  (A 単体ループ — 1 wave 内学習)
  //   phase 1: 20-50s 中盤  (A + D ローテ — 縦横の脅威同居)
  //   phase 2: 50-90s 終盤  (A + D + C ローテ — ダイブ敵 C で「展開」軸を成立)
  // 時間カーブ第1段で「2 wave 偶奇ループ反復」を解消するため、phase 進行で wave 種別が増える。
  const WAVE_TIMELINE = [
    { phaseStart: 0,        phaseEnd: 20 * FPS, types: ['A'] },
    { phaseStart: 20 * FPS, phaseEnd: 50 * FPS, types: ['A', 'D'] },
    { phaseStart: 50 * FPS, phaseEnd: 90 * FPS, types: ['A', 'D', 'C'] },
  ];

  const game = {
    state: STATE.TITLE,
    frame: 0,
    player: { x: W * 0.5, y: H * 0.78, r: 8, speed: 3.4 },
    keys: new Set(),
    spaceEdge: false,
    trail: [], // 過去 ECHO_FRAMES フレーム分のプレイヤー座標
    echo: null, // { startFrame, path: [{x,y}], result: null, hit: bool, hadBullets: bool }
    enemies: [],
    bullets: [],
    waveSpawned: false,
    waveCount: 0,
    playStartFrame: 0, // PLAYING 開始 frame、WAVE_TIMELINE phase 判定基準
    lastClearFrame: null, // 直前 wave 撃破時 frame。次 wave 起動の静寂ガード材料
    lockResults: { hit: 0, miss: 0, idle: 0 },
    idleSince: 0,
    introGhostPhase: 0,
    lockMessage: null, // { text, frame } — Q-成功FB 状態3 (危機回避) 表示用
    lockExplosion: null, // { x, y, frame } — Q-成功FB 状態2 (シアン薄爆発) 表示用
    // --- Trace logger (Lap 応答 ts=1779748594/1779748624 整合) ---
    // 1 frame = 1 jsonl 行。state スナップショット + actions_available + action_taken + action_source + event
    trace: { buffer: [], playId: null, startedAt: null, pendingEvent: null },
  };

  // --- Trace logger ---
  // 設計: 全 frame を記録 (60秒×60FPS=3600行)。LLM プレイヤー側で frame skip するかは後段判断。
  // action_taken は「この frame で確定したアクション」: space 押下=cast / 移動キー1つ=方向 / 複数=斜め / 無入力=noop。
  // 再演中 (game.echo) は player 入力ロックなので action_taken=auto_replay。
  function newPlayId() {
    return 'p' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }
  function snapshotState() {
    return {
      player: { x: Math.round(game.player.x), y: Math.round(game.player.y), r: game.player.r },
      enemies: game.enemies.map(e => ({ x: Math.round(e.x), y: Math.round(e.y), vx: +e.vx.toFixed(2), vy: +e.vy.toFixed(2), r: e.r })),
      bullets: game.bullets.map(b => ({ x: Math.round(b.x), y: Math.round(b.y), vx: +b.vx.toFixed(2), vy: +b.vy.toFixed(2), r: b.r })),
      trail_len: game.trail.length,
      echo: game.echo ? { startFrame: game.echo.startFrame, elapsed: game.frame - game.echo.startFrame } : null,
      wave: game.waveCount,
      relay: { hit: game.lockResults.hit, miss: game.lockResults.miss, idle: game.lockResults.idle },
    };
  }
  function deriveAction() {
    if (game.echo) return 'auto_replay';
    if (game.spaceEdge) return 'space';
    const dirs = [];
    if (game.keys.has('ArrowLeft') || game.keys.has('KeyA')) dirs.push('left');
    if (game.keys.has('ArrowRight') || game.keys.has('KeyD')) dirs.push('right');
    if (game.keys.has('ArrowUp') || game.keys.has('KeyW')) dirs.push('up');
    if (game.keys.has('ArrowDown') || game.keys.has('KeyS')) dirs.push('down');
    if (dirs.length === 0) return 'noop';
    if (dirs.length === 1) return dirs[0];
    return dirs.join('+');
  }
  function pushTraceFrame() {
    if (game.state !== STATE.PLAYING) return;
    const actionsAvailable = game.echo
      ? ['auto_replay']
      : (game.trail.length >= ECHO_FRAMES
          ? ['left', 'right', 'up', 'down', 'space', 'noop']
          : ['left', 'right', 'up', 'down', 'noop']);
    const row = {
      frame: game.frame,
      state: snapshotState(),
      actions_available: actionsAvailable,
      action_taken: deriveAction(),
      action_source: 'human',
      event: game.trace.pendingEvent,
    };
    game.trace.buffer.push(row);
    game.trace.pendingEvent = null;
  }
  function logEvent(name, extra) {
    // 複数 event が 1 frame で同時発火する場合は配列化 (frame=castLock時の echo_cast + space)
    const ev = extra ? Object.assign({ name }, extra) : { name };
    if (game.trace.pendingEvent === null) {
      game.trace.pendingEvent = ev;
    } else if (Array.isArray(game.trace.pendingEvent)) {
      game.trace.pendingEvent.push(ev);
    } else {
      game.trace.pendingEvent = [game.trace.pendingEvent, ev];
    }
  }
  function startTrace() {
    game.trace.buffer = [];
    game.trace.playId = newPlayId();
    game.trace.startedAt = new Date().toISOString();
    game.trace.pendingEvent = null;
  }
  function downloadTrace() {
    if (game.trace.buffer.length === 0) return;
    // header 行 + 各 frame 行 (header は frame: -1 で識別)
    const header = {
      frame: -1,
      meta: {
        play_id: game.trace.playId,
        started_at: game.trace.startedAt,
        ended_at: new Date().toISOString(),
        game: 'log_autonomous_game/v003',
        format_version: 1,
        FPS, ECHO_FRAMES, W, H,
      },
    };
    const lines = [JSON.stringify(header)].concat(game.trace.buffer.map(r => JSON.stringify(r)));
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'application/x-ndjson' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = (game.trace.startedAt || new Date().toISOString()).replace(/[:.]/g, '-');
    a.href = url;
    a.download = `trace_${ts}_${game.trace.playId}.jsonl`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }
  // expose for index.html Save Trace ボタン + 外部呼び出し用
  window.__logAutonomousV003 = {
    downloadTrace,
    getTrace: () => game.trace.buffer.slice(),
    getMeta: () => ({ playId: game.trace.playId, startedAt: game.trace.startedAt, frames: game.trace.buffer.length }),
  };

  // --- 入力 ---
  window.addEventListener('keydown', (e) => {
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    if (e.repeat) return;
    if (e.code === 'Space') game.spaceEdge = true;
    game.keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => { game.keys.delete(e.code); });

  // --- castLock / resolveLock ---
  function castLock() {
    // 過去 1 秒の足跡を未来 1 秒の再演軌道として確定
    if (game.echo) return;
    if (game.trail.length < ECHO_FRAMES) return;
    const path = game.trail.slice(-ECHO_FRAMES).map(p => ({ x: p.x, y: p.y }));
    // hadBullets = ロック発動時に画面内に敵弾が存在したか (Q-成功FB 状態3 判定材料)
    const hadBullets = game.bullets.length > 0;
    game.echo = { startFrame: game.frame, path, result: null, hit: false, hadBullets };
    game.idleSince = game.frame;
    logEvent('echo_cast', { had_bullets: hadBullets });
  }
  function resolveLock() {
    if (!game.echo) return;
    const e = game.echo;
    e.result = e.hit ? 'miss' : 'hit'; // 再演中に被弾していなければ予測当
    if (e.result === 'hit') {
      game.lockResults.hit += 1;
      // Q-成功FB 状態3: ロック発動時に敵弾があった = 「危機回避」した hit
      if (e.hadBullets) {
        game.lockMessage = { text: '危機回避', frame: game.frame };
      } else {
        // Q-成功FB 状態2: ロック発動時に敵弾なし = 「意味薄」hit、シアン薄爆発で控えめフィードバック
        game.lockExplosion = { x: game.player.x, y: game.player.y, frame: game.frame };
      }
    } else {
      game.lockResults.miss += 1;
    }
    logEvent('echo_resolve', {
      result: e.result,
      had_bullets: e.hadBullets,
      miss_reason: e.result === 'miss' ? 'hit_during_replay' : null,
    });
    game.echo = null;
  }

  function updateEcho() {
    if (!game.echo) return;
    const elapsed = game.frame - game.echo.startFrame;
    if (elapsed >= ECHO_FRAMES) { resolveLock(); return; }
    // 再演中はプレイヤーを足跡に沿って動かす (副入力ロック)
    const p = game.echo.path[elapsed];
    if (p) { game.player.x = p.x; game.player.y = p.y; }
  }

  // --- プレイヤー移動 (再演中以外) ---
  function updatePlayer() {
    if (game.echo) return;
    let dx = 0, dy = 0;
    if (game.keys.has('ArrowLeft') || game.keys.has('KeyA')) dx -= 1;
    if (game.keys.has('ArrowRight') || game.keys.has('KeyD')) dx += 1;
    if (game.keys.has('ArrowUp') || game.keys.has('KeyW')) dy -= 1;
    if (game.keys.has('ArrowDown') || game.keys.has('KeyS')) dy += 1;
    if (dx || dy) {
      const n = Math.hypot(dx, dy);
      dx /= n; dy /= n;
      game.player.x += dx * game.player.speed;
      game.player.y += dy * game.player.speed;
    }
    game.player.x = Math.max(game.player.r, Math.min(W - game.player.r, game.player.x));
    game.player.y = Math.max(game.player.r, Math.min(H - game.player.r, game.player.y));
    game.trail.push({ x: game.player.x, y: game.player.y });
    if (game.trail.length > ECHO_FRAMES * 2) game.trail.shift();
  }

  // --- 敵 A (直進小型) Wave ---
  // Pulse Relay 70-90s カーブ第 1 段 (学習導入): n=5 → 3 に軽量化、shootCooldown +30 オフセット。
  // 「導入で 1.5秒 castLock 機構の意味を読み解く時間を返す」設計。
  // wave 2 (敵D) と wave 3+ (waveCount 偶奇で A 復帰) では同じ軽量パラメータを共有する。
  function spawnWaveA() {
    const n = 3;
    for (let i = 0; i < n; i++) {
      game.enemies.push({
        type: 'A',
        x: W * (0.25 + i * 0.25),
        y: -20 - i * 40,
        vx: 0,
        vy: ENEMY_VY_A,
        r: 10,
        alive: true,
        // 軽量化: 初弾 60 + i*20 (v001=30 + i*20)、敵間ズレ 0.33s 維持
        shootCooldown: 60 + i * 20,
      });
    }
    game.waveSpawned = true;
    game.waveCount += 1;
    logEvent('wave_spawn', { wave: game.waveCount, type: 'A', count: n });
  }

  // --- 敵 D (横断敵) Wave ---
  // C244 Phase 4 (2026-05-26): Mir 5/26 06:43「展開がなく繰り返し」指摘への対応
  // design_log §Q-C 敵D「左右端から入り反対側へ抜ける、中央付近でのみ射撃」を実装。
  // 70-90 秒カーブ「12-25s 基本混合 (A+D)」に従い、wave 2 として A 撃破後に出現。
  // 内側→外側流出 1 原則 (feedback_inside_to_outside_leak.md): 1秒先計算は echo 機構の内部に閉じる、
  // 敵 D 追加に伴う UI 流出 (ゴースト/予告線/×印) を一切持たない。
  function spawnWaveD() {
    const n = 3;
    for (let i = 0; i < n; i++) {
      const fromLeft = i % 2 === 0;
      game.enemies.push({
        type: 'D',
        x: fromLeft ? -20 : W + 20,
        y: H * (0.30 + i * 0.13), // 216 / 309.6 / 403.2 — 上半身〜中段に分散、プレイヤー H*0.78 帯と分離
        vx: fromLeft ? ENEMY_VX_D : -ENEMY_VX_D,
        vy: 0,
        r: 10,
        alive: true,
        // X gate (中央域 [128, 512]) に入った後 50F+ で初弾、敵間で時差
        shootCooldown: 50 + i * 35,
      });
    }
    game.waveSpawned = true;
    game.waveCount += 1;
    logEvent('wave_spawn', { wave: game.waveCount, type: 'D', count: n });
  }

  // --- 敵 C (ダイブ敵) Wave ---
  // C248 Phase 4 (2026-05-27): 70-90 秒カーブ phase 2 (50-90s 終盤) の「展開」軸を成立させる第3敵。
  // design_log §Q-C 敵C「上から急降下、横方向 sin オフセットで読み筋を一筋に縛らせない」を実装。
  // 設計理由: 敵A (縦進行)・敵D (横進行) の 2 種ループでは「次 wave も同じ向き」予測が成立し、
  //   Nao_u 5/25 21:10「展開なし繰り返し」批判の本丸 = 「3 種以上の組み合わせで予測を崩す」へ応答。
  // C は射撃しない (本体接触のみが脅威) = Q-D 弾源負荷の追加なし、純粋に運動軸を1本増やす設計。
  function spawnWaveC() {
    const n = 2;
    for (let i = 0; i < n; i++) {
      const baseX = W * (0.3 + i * 0.4); // 0.3 / 0.7 = プレイヤー中央 H*0.5 帯と分散
      game.enemies.push({
        type: 'C',
        x: baseX,
        baseX,
        y: -20 - i * 60,
        vx: 0,
        vy: ENEMY_VY_C,
        r: 10,
        alive: true,
        shootCooldown: 9999, // C は射撃しない (ループ内 inYGate 通過時も無発火)
        spawnFrame: game.frame,
      });
    }
    game.waveSpawned = true;
    game.waveCount += 1;
    logEvent('wave_spawn', { wave: game.waveCount, type: 'C', count: n });
  }

  // 70-90s 時間カーブ phase 判定: playStartFrame からの経過 frame で現 phase を返す
  function currentPhase() {
    const elapsed = game.frame - game.playStartFrame;
    for (const phase of WAVE_TIMELINE) {
      if (elapsed >= phase.phaseStart && elapsed < phase.phaseEnd) return phase;
    }
    return WAVE_TIMELINE[WAVE_TIMELINE.length - 1]; // 90s 超は phase 2 維持
  }

  // v003: phase 2 (50-90s) 内で SHOOT_INTERVAL を線形漸変させる関数。phase 0/1 は既定値 90 を返す。
  // 設計: phase 内密度カーブ平坦を解消 (v002 completion_report §4「does NOT prove」第1項への直処方)。
  //   phase 2 開始時 (50s): 90 frame = 1.5秒間隔
  //   phase 2 末尾 (90s):   60 frame = 1.0秒間隔 (= 射撃頻度 50% 増)
  //   90s 超は SHOOT_INTERVAL_PHASE2_MIN で固定 (90s 完走後の安全側維持)
  function currentShootInterval(nowFrame) {
    const elapsed = (nowFrame !== undefined ? nowFrame : game.frame - game.playStartFrame);
    const p2 = WAVE_TIMELINE[2]; // {phaseStart: 50*FPS, phaseEnd: 90*FPS, types: ['A','D','C']}
    if (elapsed < p2.phaseStart) return SHOOT_INTERVAL;
    if (elapsed >= p2.phaseEnd) return SHOOT_INTERVAL_PHASE2_MIN;
    const t = (elapsed - p2.phaseStart) / (p2.phaseEnd - p2.phaseStart); // 0..1
    return Math.round(SHOOT_INTERVAL + (SHOOT_INTERVAL_PHASE2_MIN - SHOOT_INTERVAL) * t);
  }

  // wave dispatcher: 現 phase の types 配列を waveCount % types.length でローテ
  // phase 0 (0-20s): [A] → A のみ
  // phase 1 (20-50s): [A, D] → A, D, A, D, ...
  // phase 2 (50-90s+): [A, D, C] → A, D, C, A, D, C, ...
  function spawnNextWave() {
    const phase = currentPhase();
    const type = phase.types[game.waveCount % phase.types.length];
    if (type === 'A') spawnWaveA();
    else if (type === 'D') spawnWaveD();
    else if (type === 'C') spawnWaveC();
  }

  // Q-D: 敵→プレイヤー狙いの単発射撃 (弾自体は発射時の角度で直進 = divergence ゼロ)
  function spawnBullet(enemy) {
    const dx = game.player.x - enemy.x;
    const dy = game.player.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1;
    game.bullets.push({
      x: enemy.x,
      y: enemy.y,
      vx: (dx / d) * BULLET_SPEED,
      vy: (dy / d) * BULLET_SPEED,
      r: 4,
      alive: true,
      spawnFrame: game.frame,
    });
  }

  function updateEnemies() {
    for (const e of game.enemies) {
      if (!e.alive) continue;
      // 運動更新: C は baseX 中心の sin 横揺れ + 一定 vy ダイブ、A/D は vx/vy 加算
      if (e.type === 'C') {
        const t = game.frame - e.spawnFrame;
        const newX = e.baseX + Math.sin(t / ENEMY_C_SWING_PERIOD) * ENEMY_C_SWING_AMP;
        e.vx = newX - e.x; // 実効 vx を反映 (audit / trace の整合性)
        e.x = newX;
        e.y += e.vy;
      } else {
        e.x += e.vx; e.y += e.vy;
      }
      // 退場判定 (type 別): A/C は画面下端、D は左右端
      if (e.type === 'D') {
        if (e.x < -30 || e.x > W + 30) { e.alive = false; continue; }
      } else {
        if (e.y > H + 30) { e.alive = false; continue; }
      }
      // SHOOT_GATE: y in [0, H*0.85] (退場前)、type='D' は追加で x in [W*0.2, W*0.8] (中央域)
      // C は射撃しないため inYGate/inXGate 評価をスキップ (shootCooldown 9999 でも無害だが明示)
      if (e.type === 'C') continue;
      const inYGate = e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX;
      const inXGate = e.type !== 'D' || (e.x >= SHOOT_GATE_X_MIN && e.x <= SHOOT_GATE_X_MAX);
      if (inYGate && inXGate) {
        e.shootCooldown -= 1;
        if (e.shootCooldown <= 0) {
          spawnBullet(e);
          e.shootCooldown = currentShootInterval();
        }
      }
    }
    game.enemies = game.enemies.filter(e => e.alive);
  }

  function updateBullets() {
    for (const b of game.bullets) {
      if (!b.alive) continue;
      b.x += b.vx; b.y += b.vy;
      if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) b.alive = false;
    }
    game.bullets = game.bullets.filter(b => b.alive);
  }

  // --- 衝突 ---
  function checkCollisions() {
    for (const e of game.enemies) {
      const d = Math.hypot(e.x - game.player.x, e.y - game.player.y);
      if (d < e.r + game.player.r) {
        if (game.echo) game.echo.hit = true; // 再演中の被弾フラグ
        logEvent('death', { by: 'enemy', during_echo: !!game.echo });
        pushTraceFrame(); // 死の frame を残してから state 遷移
        game.state = STATE.GAMEOVER;
        return;
      }
    }
    for (const b of game.bullets) {
      const d = Math.hypot(b.x - game.player.x, b.y - game.player.y);
      if (d < b.r + game.player.r) {
        if (game.echo) game.echo.hit = true;
        logEvent('death', { by: 'bullet', during_echo: !!game.echo });
        pushTraceFrame();
        game.state = STATE.GAMEOVER;
        return;
      }
    }
  }

  // --- 描画 ---
  function drawTitle() {
    ctx.fillStyle = '#05070b'; ctx.fillRect(0, 0, W, H);

    // v002: 未来ゴースト + 結線描画を削除 (feedback_inside_to_outside_leak.md 徹底適用)。
    // 「1 秒先計算結果を画面に流出させる」禁則はゲーム本編 (drawPlaying) では C242 適用済だったが、
    // タイトル画面で残存していた。Nao_u 5/26 06:10 指摘「予測軌跡+×印が逆によけにくい」の
    // 1 原則 (内側→外側流出) が画面 1 箇所に残ったため、本 v002 で完全廃止。
    // タイトルのキャラ本体のみ静止描画 (落ち着いた導入)。
    const cx = W * 0.5, cy = H * 0.55;
    ctx.fillStyle = '#dfe7f3';
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#e6edf7';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Echo-Path', W * 0.5, H * 0.32);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#9aa9c2';
    ctx.fillText('あなたの足跡が、これから歩く道になる', W * 0.5, H * 0.36);

    // PRESS SPACE 点滅
    if ((game.frame >> 4) & 1) {
      ctx.fillStyle = '#cbd8ec';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('PRESS SPACE', W * 0.5, H * 0.72);
    }
  }

  function drawPlaying() {
    ctx.fillStyle = '#05070b'; ctx.fillRect(0, 0, W, H);

    // 再演中の足跡ゴースト (対象物側マーカー方針)
    if (game.echo) {
      ctx.strokeStyle = 'rgba(100,200,255,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const path = game.echo.path;
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.stroke();
      // 残り再演時間リング
      const elapsed = game.frame - game.echo.startFrame;
      const t = elapsed / ECHO_FRAMES;
      ctx.strokeStyle = 'rgba(100,200,255,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(game.player.x, game.player.y, game.player.r + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - t));
      ctx.stroke();
    } else {
      // 過去軌道の薄い残像 (Echo 候補のプレビュー)
      const tail = game.trail.slice(-ECHO_FRAMES);
      if (tail.length > 2) {
        ctx.strokeStyle = 'rgba(120,170,220,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tail[0].x, tail[0].y);
        for (let i = 1; i < tail.length; i++) ctx.lineTo(tail[i].x, tail[i].y);
        ctx.stroke();
      }
      // Q-成功FB 状態1: castLock 発動不可 (trail < ECHO_FRAMES = 1秒未満の足跡) → グレー薄リング常時表示
      // 「今は撃てない」を視覚化、足跡が溜まるほどリングを閉じていく (進捗バー兼)
      if (game.trail.length < ECHO_FRAMES) {
        const readiness = game.trail.length / ECHO_FRAMES; // 0→1
        const remain = 1 - readiness;
        ctx.strokeStyle = `rgba(150, 155, 165, ${0.22 + 0.18 * remain})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
          game.player.x, game.player.y, game.player.r + 6,
          -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remain
        );
        ctx.stroke();
      }
    }

    // 敵 (type 別配色: A=赤(縦), D=紫(横), C=黄(ダイブ) = 運動軸 3 種を視覚で峻別、
    //   内側→外側流出 1 原則は弾本体・予測非表示で維持)
    for (const e of game.enemies) {
      ctx.fillStyle = e.type === 'D' ? '#b878ff' : (e.type === 'C' ? '#ffd84d' : '#ff6b6b');
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }

    // Q-D: 敵弾本体 + 過去6frameベクトル方向の短い弾尾
    // C242 Phase 3 (2026-05-26): Nao_u 06:10 「1秒先軌跡+×印が邪魔で逆によけにくい」批判を受け
    // 予測軌道線・×マーカーを削除。1秒先計算は内部状態 (echo 機構) に閉じ、
    // プレイヤーには弾本体の素直な読み取りで対決させる方向に転回。
    // C271 Phase 3 (2026-05-31) 弾尾追加: 弾の vx/vy ベクトル方向に長さ 6frame 分 (= 12px)・
    //   alpha 0.35 の短い尾を後方に描画。性質判別: 過去/現在の運動ベクトルの視覚化であり
    //   未来 1 秒先の予測計算結果ではない = 内側→外側流出 1 原則違反しない。
    //   根拠 (二重): (a) self_judgment.md v003 Q-D 4.0/5 の根拠「静止 1 フレームから弾速度
    //   ベクトル判別不能」への直処方、(b) Boghog 経験則「Single stray bullets are hard to
    //   read and can often feel unfair」(memory/external_notes_log.md L249-261, C258 摂取)
    //   と独立到達。Nao_u 5/26 06:10 指摘の再発リスクは pre-mortem: 弾尾長を castLock の
    //   1秒予測の 1/10 (6frame) に抑制 + alpha 控えめで邪魔感を最小化。
    for (const b of game.bullets) {
      ctx.strokeStyle = 'rgba(255, 184, 120, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 6, b.y - b.vy * 6);
      ctx.stroke();
      ctx.fillStyle = '#ffb878';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }

    // プレイヤー
    ctx.fillStyle = '#dfe7f3';
    ctx.beginPath(); ctx.arc(game.player.x, game.player.y, game.player.r, 0, Math.PI * 2); ctx.fill();

    // Q-成功FB 状態2: シアン薄爆発 (resolveLock 後 30 フレーム = 0.5秒、半径膨張+alpha減衰)
    // 「ロック成功したが敵弾なし = 意味薄 hit」を控えめに伝達。状態3 より淡く・小さく
    if (game.lockExplosion && game.frame - game.lockExplosion.frame < 30) {
      const age = game.frame - game.lockExplosion.frame;
      const t = age / 30;
      const alpha = (1 - t) * 0.32;
      const radius = game.player.r + 4 + t * 26;
      ctx.strokeStyle = `rgba(140, 230, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(game.lockExplosion.x, game.lockExplosion.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Q-成功FB 状態3: 危機回避メッセージ (resolveLock 後 45 フレーム = 0.75秒表示)
    if (game.lockMessage && game.frame - game.lockMessage.frame < 45) {
      const age = game.frame - game.lockMessage.frame;
      const alpha = 1.0 - age / 45;
      ctx.fillStyle = `rgba(140, 230, 255, ${alpha})`;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(game.lockMessage.text, W * 0.5, H * 0.42);
    }

    // HUD (最小): Relay (hit/miss/idle)
    ctx.fillStyle = '#9aa9c2';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Relay  hit:${game.lockResults.hit}  miss:${game.lockResults.miss}  idle:${game.lockResults.idle}`, 8, 16);
    ctx.textAlign = 'right';
    const elapsedSec = Math.floor((game.frame - game.playStartFrame) / FPS);
    ctx.fillText(`wave:${game.waveCount}  t:${elapsedSec}s`, W - 8, 16);
  }

  function drawGameOver() {
    drawPlaying();
    ctx.fillStyle = 'rgba(5,7,11,0.62)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff8a8a';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('未来に追いつけなかった', W * 0.5, H * 0.46);
    ctx.fillStyle = 'rgba(255,180,180,0.65)';
    ctx.font = '12px sans-serif';
    ctx.fillText('— パイロットは死線を抜けられなかった —', W * 0.5, H * 0.50);
    if ((game.frame >> 4) & 1) {
      ctx.fillStyle = '#cbd8ec';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('PRESS SPACE', W * 0.5, H * 0.56);
    }
  }

  // --- 状態遷移 / メインループ ---
  function resetForPlay() {
    game.player.x = W * 0.5;
    game.player.y = H * 0.78;
    game.trail = [];
    game.echo = null;
    game.enemies = [];
    game.bullets = [];
    game.waveSpawned = false;
    game.waveCount = 0;
    game.playStartFrame = game.frame; // WAVE_TIMELINE phase 基準
    game.lastClearFrame = null;
    game.lockResults = { hit: 0, miss: 0, idle: 0 };
    game.idleSince = 0;
    game.lockMessage = null;
    game.lockExplosion = null;
    startTrace();
  }

  function step() {
    game.frame += 1;

    if (game.state === STATE.TITLE) {
      drawTitle();
      if (game.spaceEdge) { resetForPlay(); game.state = STATE.PLAYING; }
    } else if (game.state === STATE.PLAYING) {
      if (game.spaceEdge) castLock();
      updatePlayer();
      updateEcho();
      // Wave が全て退場したら lastClearFrame 記録 (静寂ガード材料)
      if (game.waveSpawned && game.enemies.length === 0) {
        game.waveSpawned = false;
        game.lastClearFrame = game.frame;
        logEvent('wave_clear', { wave: game.waveCount });
      }
      // 初回 wave (waveCount=0) は即起動、wave 2+ は前 wave clear から 8 秒静寂後に起動
      // (Pulse Relay 70-90s カーブ第 1 段: 学習→静寂→展開、Nao_u 5/26 06:10「展開なし反復」直対応)
      const restElapsed = game.waveCount === 0
        || (game.lastClearFrame !== null && game.frame - game.lastClearFrame >= WAVE_REST_FRAMES);
      if (!game.waveSpawned && restElapsed && game.frame % 2 === 0) spawnNextWave();
      updateEnemies();
      updateBullets();
      checkCollisions();
      // idle (Q-成功FB 状態3 未立): 3 秒以上 lock なしで idle カウント
      if (!game.echo && game.frame - game.idleSince > FPS * 3) {
        game.lockResults.idle += 1;
        game.idleSince = game.frame;
        logEvent('lock_idle_warning', { idle_total: game.lockResults.idle });
      }
      // checkCollisions が death を pushTrace 済みなら state は GAMEOVER に変わっている → 二重 push しない
      if (game.state === STATE.PLAYING) pushTraceFrame();
      drawPlaying();
    } else if (game.state === STATE.GAMEOVER) {
      drawGameOver();
      if (game.spaceEdge) { resetForPlay(); game.state = STATE.PLAYING; }
    }

    game.spaceEdge = false;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
