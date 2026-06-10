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
  // v003 C276 (Log Phase 4): Q-導入 H-001 teaser 仮説 — phase 0 第 1 wave (waveCount === 0) のみ、
  // 敵A の y-stagger を WAVE_A_STAGGER_Y_DEFAULT (40px = 28F) から WAVE_A_STAGGER_Y_PHASE0 (168px = 120F)
  // に拡大し、先行 1 体が単独で約 2 秒間プレイヤーに観測される「teaser → 本体 2 体」構造を作る。
  // 詳細: hypotheses.md H-001
  const WAVE_A_STAGGER_Y_DEFAULT = 40;
  const WAVE_A_STAGGER_Y_PHASE0 = 168;
  // C298 Phase 4 H-004: phase 1 (20-50s) wave 内 2 段階 ease-in カーブ。
  // warmup = 単独 1 体 spawn → WAVE_SUBPHASE_WARMUP_FRAMES (= 120F = 2.0s) 後に main = 残り 2 体 spawn。
  // phase 0 → phase 1 接続のなめらかさ補強、Q-展開差カーブ採点 +0.2 改善見込み。hypotheses.md H-004
  const WAVE_SUBPHASE_WARMUP_FRAMES = 120;

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
    cameraShake: null, // { frames, magnitude } — castLock miss 時カメラシェイク (Lin B1.3, SA ドメイン)
    // C296 Phase 4: castLock SUCCESS 時 particle effect (Lin B1.4, SA ドメイン未着地 1 件)
    // [{x,y,vx,vy,life}] 各 particle は radial 等間隔、life=12F (200ms) で減衰、半径も縮小。
    // 描画層のみ (gameplay logic 非変更) = verify.js 4 方針 PASS 維持。
    // 状態2 シアン薄爆発との視覚棲み分け: 爆発リングは radius 膨張、particles は radial 散布で別軸。
    successParticles: [],
    // C297 Phase 4 H-002: wave_clear 瞬間の薄テロップ FB (hypotheses.md H-002)。
    // Pulse Relay 70-90s カーブ「学習→静寂→展開」の静寂フェーズ意味づけ補強、Q-成功FB 状態 4 候補。
    // { text, frame } 形式 (lockMessage と同型)、frame セット以降 45F フェード、薄白系 alpha 0.6 max。
    waveClearMessage: null,
    // C298 Phase 4 H-003: 次 wave 起動 1 秒前カウントダウン FB (hypotheses.md H-003)。
    // waveClearMessage 発火から 7 秒 (420F) 経過時に 1 回セット、80F (60F フェードイン + 20F フェードアウト)。
    // 静寂フェーズ両端意味づけ完成 (H-002 退場側 + H-003 起動側)、Q-成功FB 状態 5 候補。
    waveCountdownMessage: null,
    // C298 Phase 4 H-004: phase 1 (20-50s) wave 内 2 段階 ease-in 状態 (hypotheses.md H-004)。
    // waveSubPhase: 0 = 未 spawn, 1 = warmup spawned (main pending), 2 = main spawned / single-stage wave 済
    // pendingMainSpawn: phase 1 warmup 後の main 待機タイプ ('A' or 'D')、phase 0/2 は常に null
    // waveSubPhaseFrame: warmup spawn 時 frame (main spawn 時刻判定の起点)
    waveSubPhase: 0,
    pendingMainSpawn: null,
    waveSubPhaseFrame: null,
    // C295 Phase 4: 視覚 reward feedback (+1 popup + 連続 hit combo)
    // 「撃って当てた」相当= castLock SUCCESS (resolveLock hit)。既存 lockMessage/lockExplosion の補強層。
    // (C301 Phase 4 再着地: daa3b5d48b auto-sync 巻き戻り同型 2 件目、cameraShake C297 着地と同手順)
    scorePopups: [], // [{ text, x, y, frame, kind }] kind ∈ {'crisis','echo','combo'}
    combo: { count: 0, lastHitFrame: -9999 }, // COMBO_WINDOW_FRAMES (=180F, 3s) 内連続 hit で count++
    // window=180F の根拠: castLock 最短サイクル = trail 蓄積 60F + echo 再演 60F = 120F (= 2s)。
    // 余裕 60F (1s) を加え 180F とすることで「ノーミスで castLock を回し続ける」プレイに対し
    // combo が継続する設定。窓を最短サイクル未満にすると combo は構造的に成立しない。
    // --- Trace logger (Lap 応答 ts=1779748594/1779748624 整合) ---
    // 1 frame = 1 jsonl 行。state スナップショット + actions_available + action_taken + action_source + event
    trace: { buffer: [], playId: null, startedAt: null, pendingEvent: null },
    // C305 Phase 3: echo 起点マーカー初回活性化 frame (trail.length が初めて ECHO_FRAMES に到達した瞬間)。
    // null 時はマーカー非表示、値が入っていれば drawPlaying() でその frame からの経過で
    // 初期 40F は cosine pulse 揺らぎ alpha (0.32 ± 0.18)、以降は安定 alpha 0.32。
    // 描画層のみ (gameplay logic 非変更)、verify.js 4 方針 PASS 維持。
    // H-006 段階化様式 (動作 step) の精神を「視覚 FB の段階化」(視覚 step) に転用する 1mm 改修。
    markerActivatedFrame: null,
    // C292 Phase 4 hit stop (C305 Phase 4 再着地: daa3b5d48b 同型 auto-sync 巻き戻り 3 件目)。
    // castLock SUCCESS 確定 frame で 4 frame (≒67ms) の全 update skip → drawPlaying 継続で freeze。
    // PH/SA 境界の体感的重み演出。null = inactive。verify.js は game.js を読まない独立シミュレータの
    // ため bit 一致は自動維持 (camper 5.32s / lane-holder 4.73s / blind-sweeper 6.30s / nospecial 9.08s)。
    hitStop: null,
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

  // --- successParticles ---
  // C296 Phase 4 (B1.4 Particle Effect on castLock success, SA ドメイン未着地 1 件着地):
  //   resolveLock hit 時に player 位置から radial n 発、life=12F (200ms)、speed=1.5px/frame、
  //   半径は life に比例して 2.5 → 0 縮小、alpha も life/12 で減衰。
  // 視覚棲み分け: 状態2 シアン薄爆発 (radius 膨張リング、30F) と状態3 危機回避 (中央テキスト、45F)
  //   とは別軸 (radial 粒、12F)、3 重畳しても各 frame 内の N=1 強FB 監査 (visual_review §3.1) は
  //   alpha 0.55 / 寿命 12F / 画面占有 ≤ 6 粒で「強」閾値 (alpha≥0.6 + size≥5%) 未達 = 弱FB 分類維持。
  function spawnSuccessParticles(cx, cy, n) {
    const LIFE = 12;
    const SPEED = 1.5;
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      game.successParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        life: LIFE,
        maxLife: LIFE,
      });
    }
  }

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
      // C296 Phase 4: castLock SUCCESS 時 particle 6 発 radial 散布 (B1.4 SA ドメイン)
      // hadBullets 有無問わず発火 = 成功イベントの共通 base feedback、状態 2/3 と階差で重畳
      spawnSuccessParticles(game.player.x, game.player.y, 6);
      // C292 Phase 4 hit stop (C305 Phase 4 再着地): 4 frame (≒67ms) の全 update skip。
      // resolveLock 確定後にだけ発火 = castLock 判断阻害リスク回避、PH/SA 境界の体感的重み演出。
      game.hitStop = { frames: 4 };
      // C295 Phase 4: +1 popup + 連続 hit combo (180F=3s 窓内連続で count++、外で reset to 1)
      // 「撃って当てた → 即時 +1」相当を castLock SUCCESS に写像。HUD Relay hit:N とは別系統で
      // 「今この瞬間の成功」を画面中央近傍に短期表示 = pull-and-release のリリース感を 1mm 強化。
      const COMBO_WINDOW_FRAMES = 180;
      if (game.frame - game.combo.lastHitFrame <= COMBO_WINDOW_FRAMES) {
        game.combo.count += 1;
      } else {
        game.combo.count = 1;
      }
      game.combo.lastHitFrame = game.frame;
      game.scorePopups.push({
        text: '+1',
        x: game.player.x,
        y: game.player.y - 18,
        frame: game.frame,
        kind: e.hadBullets ? 'crisis' : 'echo',
      });
      if (game.combo.count >= 2) {
        game.scorePopups.push({
          text: 'x' + game.combo.count,
          x: game.player.x + 22,
          y: game.player.y - 32,
          frame: game.frame,
          kind: 'combo',
        });
      }
    } else {
      game.lockResults.miss += 1;
      // C297 Phase 4: castLock miss 時カメラシェイク (Lin B1.3, C291 着地物の auto-sync 巻き戻り再復元)
      // magnitude 3px = player r=8 の 38% で過剰でない / 8 frame = 133ms で持続短く制限
      // 判断中には発火せず resolveLock 確定後にだけ発火 = castLock 判断阻害リスク回避
      game.cameraShake = { frames: 8, magnitude: 3 };
      // C295 Phase 4: miss で combo 即リセット (連続成功の重み付けが目的、miss を許容しない)
      game.combo.count = 0;
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
    // C305 Phase 3: trail.length が初めて ECHO_FRAMES に到達した瞬間を記録 (1 play 中 1 回のみ)。
    if (game.markerActivatedFrame === null && game.trail.length >= ECHO_FRAMES) {
      game.markerActivatedFrame = game.frame;
    }
  }

  // --- 敵 A (直進小型) Wave ---
  // Pulse Relay 70-90s カーブ第 1 段 (学習導入): n=5 → 3 に軽量化、shootCooldown +30 オフセット。
  // 「導入で 1.5秒 castLock 機構の意味を読み解く時間を返す」設計。
  // wave 2 (敵D) と wave 3+ (waveCount 偶奇で A 復帰) では同じ軽量パラメータを共有する。
  function spawnWaveA() {
    const n = 3;
    // H-001 Q-導入 teaser: phase 0 第 1 wave (waveCount === 0) のみ y-stagger 拡大
    const staggerY = game.waveCount === 0 ? WAVE_A_STAGGER_Y_PHASE0 : WAVE_A_STAGGER_Y_DEFAULT;
    for (let i = 0; i < n; i++) {
      game.enemies.push({
        type: 'A',
        x: W * (0.25 + i * 0.25),
        y: -20 - i * staggerY,
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
    logEvent('wave_spawn', { wave: game.waveCount, type: 'A', count: n, stagger_y: staggerY });
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

  // v003: phase 2 (50-90s) 内で SHOOT_INTERVAL を漸変させる関数。phase 0/1 は既定値 90 を返す。
  // 設計: phase 内密度カーブ平坦を解消 (v002 completion_report §4「does NOT prove」第1項への直処方)。
  //   phase 2 開始時 (50s): 90 frame = 1.5秒間隔
  //   phase 2 末尾 (90s):   60 frame = 1.0秒間隔 (= 射撃頻度 50% 増)
  //   90s 超は SHOOT_INTERVAL_PHASE2_MIN で固定 (90s 完走後の安全側維持)
  // C293 Phase 4 (Log_cdx 2026-06-04): 漸変カーブを linear → ease-in (t²) に変更。
  //   逆算側体験ゴール「読みが追いつかない瞬間」 1 mm 試行 (前半 rest 感を残し終盤に圧迫集中)。
  // C313 Phase 4 (Log 2026-06-08): ease-in (t²) → linear に**再差し戻し**。
  //   理由: C293 ease-in は「終盤集中」狙いだったが、実機体感未収集のまま 4 サイクル放置で
  //   linear/ease-in 比較材料ゼロ。原点 linear に戻して **A/B 比較の B 側を再現** = 次回
  //   実機判定時に「linear がどう感じたか」を Nao_u/Mir/Ash に問える状態に置く。
  //   linear は「phase 2 全域で徐々に圧迫」= rest_感より「読みの連続更新」を要求する曲線。
  //   境界値 (90F at 50s / 60F at 90s) は維持 = verify.js 悪手検証への影響なし
  //   (悪手 4 方針は phase 0 で死亡 = phase 2 曲線形状は悪手検証に届かない)。
  function currentShootInterval(nowFrame) {
    const elapsed = (nowFrame !== undefined ? nowFrame : game.frame - game.playStartFrame);
    const p2 = WAVE_TIMELINE[2]; // {phaseStart: 50*FPS, phaseEnd: 90*FPS, types: ['A','D','C']}
    if (elapsed < p2.phaseStart) return SHOOT_INTERVAL;
    if (elapsed >= p2.phaseEnd) return SHOOT_INTERVAL_PHASE2_MIN;
    const t = (elapsed - p2.phaseStart) / (p2.phaseEnd - p2.phaseStart); // 0..1
    // linear: phase 2 全域で均一に圧迫を増やす (C293 ease-in t² から差し戻し)
    return Math.round(SHOOT_INTERVAL + (SHOOT_INTERVAL_PHASE2_MIN - SHOOT_INTERVAL) * t);
  }

  // wave dispatcher: 現 phase の types 配列を waveCount % types.length でローテ
  // phase 0 (0-20s): [A] → A のみ
  //   - wave 1 (waveCount=0): 単段 spawn + H-001 teaser (y-stagger 168px = 空間軸段階化)
  //   - wave 2+ (waveCount>=1): H-005 で 2 段階 ease-in (時間軸段階化、phase 1 同型)
  // phase 1 (20-50s): [A, D] → A, D, A, D, ... (H-004: 2 段階 ease-in)
  // phase 2 (50-90s+): [A, D, C] → A, D, C, A, D, C, ...
  //   - A/D は単段 spawn (phase 1 と同 type だが密度設計を変えて「展開→収束」対比)
  //   - C は H-006 (C302 Phase 4) で 2 段階 ease-in に拡張。ダイブ 1 体先行 → 2.0s 後 もう 1 体
  function spawnNextWave() {
    const phase = currentPhase();
    const type = phase.types[game.waveCount % phase.types.length];
    // H-004: phase 1 (phaseStart = 20*FPS = 1200F) かつ type A/D のみ 2 段階 ease-in。
    // H-005: phase 0 (phaseStart = 0) 内の wave 2 以降 (waveCount >= 1) も 2 段階 ease-in に拡張。
    //   wave 1 (waveCount === 0) は H-001 teaser (静的 stagger) 維持で空間軸段階化、
    //   wave 2+ は warmup→main で時間軸段階化、phase 0 内で段階化様式が「空間→時間」と進化する設計。
    // H-006 (C302 Phase 4): phase 2 (phaseStart = 50*FPS = 3000F) 内 type C も 2 段階 ease-in に拡張。
    //   ダイブ敵 1 体先行 (baseX=W*0.3) → WAVE_SUBPHASE_WARMUP_FRAMES 後 もう 1 体 (baseX=W*0.7)。
    //   単独ダイブの軌道学習を孤立観測させ、終盤の認知負荷ピークを時間軸で平準化する狙い。
    const isPhase1 = phase.phaseStart === 20 * FPS;
    const isPhase0Wave2Plus = phase.phaseStart === 0 && game.waveCount >= 1;
    const isPhase2C = phase.phaseStart === 50 * FPS && type === 'C';
    if ((isPhase1 && (type === 'A' || type === 'D')) || (isPhase0Wave2Plus && type === 'A') || isPhase2C) {
      spawnWaveWarmup(type);
    } else if (type === 'A') {
      spawnWaveA();
    } else if (type === 'D') {
      spawnWaveD();
    } else if (type === 'C') {
      spawnWaveC();
    }
  }

  // H-004 (C298 Phase 4): phase 1 wave 内 2 段階 ease-in の第 1 段 (warmup)。
  // 1 体のみ spawn (i=0 位置)、waveSpawned=true で wave_clear ガード、
  // pendingMainSpawn セットで step() が WAVE_SUBPHASE_WARMUP_FRAMES 後に main spawn 発火。
  // waveCount はここでは +1 しない (main spawn 時に初めて +1、次 wave 型決定の整合性維持)。
  function spawnWaveWarmup(type) {
    if (type === 'A') {
      const staggerY = game.waveCount === 0 ? WAVE_A_STAGGER_Y_PHASE0 : WAVE_A_STAGGER_Y_DEFAULT;
      game.enemies.push({
        type: 'A',
        x: W * 0.25, // i=0 位置
        y: -20,
        vx: 0,
        vy: ENEMY_VY_A,
        r: 10,
        alive: true,
        shootCooldown: 60, // i=0: 60 + 0*20
      });
      logEvent('wave_warmup', { wave: game.waveCount + 1, type: 'A', count: 1, stagger_y: staggerY });
    } else if (type === 'D') {
      game.enemies.push({
        type: 'D',
        x: -20, // i=0: fromLeft
        y: H * 0.30, // i=0
        vx: ENEMY_VX_D,
        vy: 0,
        r: 10,
        alive: true,
        shootCooldown: 50, // i=0: 50 + 0*35
      });
      logEvent('wave_warmup', { wave: game.waveCount + 1, type: 'D', count: 1 });
    } else if (type === 'C') {
      // H-006 (C302 Phase 4): phase 2 type C 2 段階 ease-in 第 1 段 (warmup)。
      // n=2 中の i=0 のみ spawn。baseX=W*0.3 で左寄り単独ダイブ、軌道学習を孤立観測させる。
      const baseX = W * 0.3;
      game.enemies.push({
        type: 'C',
        x: baseX,
        baseX,
        y: -20,
        vx: 0,
        vy: ENEMY_VY_C,
        r: 10,
        alive: true,
        shootCooldown: 9999,
        spawnFrame: game.frame,
      });
      logEvent('wave_warmup', { wave: game.waveCount + 1, type: 'C', count: 1 });
    }
    game.waveSpawned = true;
    game.waveSubPhase = 1;
    game.waveSubPhaseFrame = game.frame;
    game.pendingMainSpawn = type;
  }

  // H-004: phase 1 wave 内 2 段階 ease-in の第 2 段 (main)。残り 2 体 (i=1, i=2) を spawn。
  // ここで waveCount += 1 (wave 全体完成扱い)、waveSpawned は warmup ですでに true、waveSubPhase=2 に進む。
  function spawnWaveMain() {
    const type = game.pendingMainSpawn;
    if (type === 'A') {
      const staggerY = game.waveCount === 0 ? WAVE_A_STAGGER_Y_PHASE0 : WAVE_A_STAGGER_Y_DEFAULT;
      for (let i = 1; i < 3; i++) {
        game.enemies.push({
          type: 'A',
          x: W * (0.25 + i * 0.25),
          y: -20 - i * staggerY,
          vx: 0,
          vy: ENEMY_VY_A,
          r: 10,
          alive: true,
          shootCooldown: 60 + i * 20,
        });
      }
      game.waveCount += 1;
      logEvent('wave_main', { wave: game.waveCount, type: 'A', count: 2 });
    } else if (type === 'D') {
      for (let i = 1; i < 3; i++) {
        const fromLeft = i % 2 === 0;
        game.enemies.push({
          type: 'D',
          x: fromLeft ? -20 : W + 20,
          y: H * (0.30 + i * 0.13),
          vx: fromLeft ? ENEMY_VX_D : -ENEMY_VX_D,
          vy: 0,
          r: 10,
          alive: true,
          shootCooldown: 50 + i * 35,
        });
      }
      game.waveCount += 1;
      logEvent('wave_main', { wave: game.waveCount, type: 'D', count: 2 });
    } else if (type === 'C') {
      // H-006: 第 2 段 (main)。n=2 中の i=1 を spawn (baseX=W*0.7, y=-20-1*60=-80)。
      // warmup i=0 と stagger 60px (= 24F @ vy=2.5) + 120F 時間差 で wave 内 2 ダイブが時間軸分節化。
      const baseX = W * 0.7;
      game.enemies.push({
        type: 'C',
        x: baseX,
        baseX,
        y: -20 - 1 * 60,
        vx: 0,
        vy: ENEMY_VY_C,
        r: 10,
        alive: true,
        shootCooldown: 9999,
        spawnFrame: game.frame,
      });
      game.waveCount += 1;
      logEvent('wave_main', { wave: game.waveCount, type: 'C', count: 1 });
    }
    game.pendingMainSpawn = null;
    game.waveSubPhase = 2;
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
    // C297 Phase 4: cameraShake 適用 (castLock miss 時のみ発火、gameplay logic 非変更 = 描画層 translate のみ)
    let shakeApplied = false;
    if (game.cameraShake && game.cameraShake.frames > 0) {
      const m = game.cameraShake.magnitude;
      ctx.save();
      ctx.translate((Math.random() * 2 - 1) * m, (Math.random() * 2 - 1) * m);
      game.cameraShake.frames -= 1;
      if (game.cameraShake.frames <= 0) game.cameraShake = null;
      shakeApplied = true;
    }
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
        ctx.strokeStyle = 'rgba(120,170,220,0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tail[0].x, tail[0].y);
        for (let i = 1; i < tail.length; i++) ctx.lineTo(tail[i].x, tail[i].y);
        ctx.stroke();
        // C301: Echo 再演の起点 (1秒前、tail[0]) にマーカーを 1 点描画。
        // 「過去の自分の位置 = 未来道の始まり」を視覚化し、castLock 発動への注意を引く。
        // 描画のみで update / proxy / instinct_probe には影響しない。
        // C305 Phase 3: 初回活性化直後 40F (= 約 0.67s) は cosine pulse で揺らぎを与え、
        // 「castLock 発動可能になった瞬間」を視覚 step として強調。以降は安定 alpha 0.32。
        // alpha 上限 0.50 で「強FB 閾値 (≥0.6)」未達維持、state 3 危機回避メッセージとの
        // 同 frame 強FB N≥2 WARN 抵触なし (visual_review.md §3.1 順守)。
        if (game.trail.length >= ECHO_FRAMES) {
          let alpha = 0.32;
          if (game.markerActivatedFrame !== null) {
            const age = game.frame - game.markerActivatedFrame;
            if (age < 40) {
              const t = age / 40; // 0 → 1
              const envelope = 1 - t; // 線形減衰 (1 → 0)
              // cosine 周期 = 20F (= 約 0.33s) で揺らぎ、減衰 envelope で fade out
              alpha = 0.32 + Math.cos(age * Math.PI / 10) * 0.18 * envelope;
            }
          }
          ctx.fillStyle = `rgba(120, 170, 220, ${alpha})`;
          ctx.beginPath();
          ctx.arc(tail[0].x, tail[0].y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
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

    // C296 Phase 4: successParticles 更新+描画 (B1.4 SA ドメイン)
    // 各 frame で位置更新 + life デクリメント、life ≤ 0 で削除。
    // alpha = life/maxLife (0.55 max, 状態2 alpha 0.32 より高めだが「強」閾値 0.6 未満維持)
    for (const p of game.successParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
    }
    game.successParticles = game.successParticles.filter(p => p.life > 0);
    for (const p of game.successParticles) {
      const t = p.life / p.maxLife; // 1 → 0
      const alpha = t * 0.55;
      const radius = t * 2.5;
      ctx.fillStyle = `rgba(140, 230, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
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

    // C295 Phase 4: scorePopups 描画 (+1 / xN combo)、age 0..24F (400ms) で上昇しつつ fade out
    // kind 別配色: crisis=赤(危機回避hit) / echo=青(意味薄hit) / combo=橙(連続強調)
    // C302 Phase 3: crisis popup alpha を state 3 (lockMessage) alpha と乗算同期 — 同frame 強FB N=2 WARN
    // (visual_review §V-09 反証ライン c) の緩和。state 3 と crisis は hadBullets=true で同情報二重表現の関係に
    // あるため、state 3 alpha カーブ (1 - age/45) を crisis popup alpha に乗算することで「state 3 支配 +
    // crisis 補助」の階差を構造化、強FB N=2 → 強1+弱1 として強度依存統合する。echo/combo は不変。
    const POPUP_LIFE_FRAMES = 24;
    for (const p of game.scorePopups) {
      const age = game.frame - p.frame;
      if (age >= POPUP_LIFE_FRAMES) continue;
      const t = age / POPUP_LIFE_FRAMES;
      let alpha = 1 - t;
      if (p.kind === 'crisis' && game.lockMessage && game.frame - game.lockMessage.frame < 45) {
        const lockAge = game.frame - game.lockMessage.frame;
        const lockAlpha = 1.0 - lockAge / 45;
        alpha = alpha * lockAlpha;
      }
      const yOffset = -t * 14;
      let color;
      if (p.kind === 'crisis') color = `rgba(255, 110, 90, ${alpha})`;
      else if (p.kind === 'echo') color = `rgba(170, 220, 255, ${alpha})`;
      else color = `rgba(255, 200, 130, ${alpha})`;
      ctx.fillStyle = color;
      ctx.font = p.kind === 'combo' ? 'bold 16px sans-serif' : 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y + yOffset);
    }
    game.scorePopups = game.scorePopups.filter(p => game.frame - p.frame < POPUP_LIFE_FRAMES);

    // C297 Phase 4 H-002: wave_clear 薄テロップ (45F フェード、画面上端寄り H*0.18、castLock 系シアンと
    // 色相分離した薄白系、alpha 0.6 max、フォント 14px、静寂フェーズ意味づけ補強。hypotheses.md H-002)
    if (game.waveClearMessage && game.frame - game.waveClearMessage.frame < 45) {
      const age = game.frame - game.waveClearMessage.frame;
      const alpha = (1.0 - age / 45) * 0.6;
      ctx.fillStyle = `rgba(180, 220, 255, ${alpha})`;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(game.waveClearMessage.text, W * 0.5, H * 0.18);
    }

    // C298 Phase 4 H-003: 次 wave 起動 1 秒前カウントダウン FB (静寂フェーズ末尾の起動側意味づけ)。
    // 80F 寿命 (60F フェードイン + 20F フェードアウト)、薄白系 alpha 0.5 max、フォント 12px、H*0.18 配置。
    // H-002 と同 line + 同色相 + 同位置で「静寂両端」を対称表現、内容は "Wave N+1" (未来化)。hypotheses.md H-003
    if (game.waveCountdownMessage && game.frame - game.waveCountdownMessage.frame < 80) {
      const age = game.frame - game.waveCountdownMessage.frame;
      const alpha = age < 60
        ? (age / 60) * 0.5            // フェードイン: 0.0 → 0.5 (60F)
        : (1.0 - (age - 60) / 20) * 0.5; // フェードアウト: 0.5 → 0.0 (20F)
      ctx.fillStyle = `rgba(180, 220, 255, ${alpha})`;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(game.waveCountdownMessage.text, W * 0.5, H * 0.18);
    }

    // HUD (最小): Relay (hit/miss/idle)
    ctx.fillStyle = '#9aa9c2';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Relay  hit:${game.lockResults.hit}  miss:${game.lockResults.miss}  idle:${game.lockResults.idle}`, 8, 16);
    ctx.textAlign = 'right';
    const elapsedSec = Math.floor((game.frame - game.playStartFrame) / FPS);
    ctx.fillText(`wave:${game.waveCount}  t:${elapsedSec}s`, W - 8, 16);

    // C295 Phase 4: COMBO HUD (上中央、count>=2 時のみ)、180F 経過で fade
    if (game.combo.count >= 2) {
      const sinceLast = game.frame - game.combo.lastHitFrame;
      const alpha = Math.max(0.35, 1 - sinceLast / 180);
      ctx.fillStyle = `rgba(255, 200, 130, ${alpha})`;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`COMBO x${game.combo.count}`, W * 0.5, 18);
    }

    if (shakeApplied) ctx.restore();
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
    game.cameraShake = null;
    game.successParticles = [];
    game.waveClearMessage = null;
    game.waveCountdownMessage = null;
    game.waveSubPhase = 0;
    game.pendingMainSpawn = null;
    game.waveSubPhaseFrame = null;
    game.scorePopups = [];
    game.combo = { count: 0, lastHitFrame: -9999 };
    game.markerActivatedFrame = null;
    game.hitStop = null;
    startTrace();
  }

  function step() {
    game.frame += 1;

    if (game.state === STATE.TITLE) {
      drawTitle();
      if (game.spaceEdge) { resetForPlay(); game.state = STATE.PLAYING; }
    } else if (game.state === STATE.PLAYING) {
      // C292 Phase 4 hit stop guard (C305 Phase 4 再着地): hitStop.frames > 0 の間、全 update を skip して
      // drawPlaying のみ継続 = freeze 描画。frames カウントダウン、0 で hitStop = null。trace logger も
      // pushTraceFrame() が呼ばれないため frame 連続性は hit stop 中に「飛ぶ」(v004 proxy 化時の留意点)。
      if (game.hitStop && game.hitStop.frames > 0) {
        game.hitStop.frames -= 1;
        if (game.hitStop.frames <= 0) game.hitStop = null;
        drawPlaying();
        game.spaceEdge = false;
        requestAnimationFrame(step);
        return;
      }
      if (game.spaceEdge) castLock();
      updatePlayer();
      updateEcho();
      // Wave が全て退場したら lastClearFrame 記録 (静寂ガード材料)
      // H-004: pendingMainSpawn 中 (warmup spawned, main 未 spawn) は wave_clear ガード対象外。
      // warmup を 120F 内に倒しても main spawn 前に wave_clear が走ると本 wave が中断扱いになる。
      if (game.waveSpawned && game.enemies.length === 0 && !game.pendingMainSpawn) {
        game.waveSpawned = false;
        game.lastClearFrame = game.frame;
        // H-002: 静寂フェーズ意味づけ補強、45F フェード薄テロップ (hypotheses.md H-002)
        game.waveClearMessage = { text: 'Wave ' + game.waveCount + ' Clear', frame: game.frame };
        logEvent('wave_clear', { wave: game.waveCount });
      }
      // H-003: 静寂フェーズ末尾 (7 秒経過時 = 残 60F = WAVE_REST_FRAMES の 7/8) で次 wave カウントダウン FB を 1 回起動
      // waveClearMessage.frame との大小比較で wave_clear ごとに 1 回だけセット (hypotheses.md H-003)
      if (game.waveClearMessage
          && game.frame - game.waveClearMessage.frame >= 7 * FPS
          && (game.waveCountdownMessage === null || game.waveCountdownMessage.frame < game.waveClearMessage.frame)) {
        game.waveCountdownMessage = { text: 'Wave ' + (game.waveCount + 1), frame: game.frame };
        logEvent('wave_countdown', { next_wave: game.waveCount + 1 });
      }
      // 初回 wave (waveCount=0) は即起動、wave 2+ は前 wave clear から 8 秒静寂後に起動
      // (Pulse Relay 70-90s カーブ第 1 段: 学習→静寂→展開、Nao_u 5/26 06:10「展開なし反復」直対応)
      const restElapsed = game.waveCount === 0
        || (game.lastClearFrame !== null && game.frame - game.lastClearFrame >= WAVE_REST_FRAMES);
      if (!game.waveSpawned && restElapsed && game.frame % 2 === 0) spawnNextWave();
      // H-004: phase 1 wave 内 main spawn (warmup から WAVE_SUBPHASE_WARMUP_FRAMES = 120F = 2.0s 後)
      if (game.pendingMainSpawn && game.frame - game.waveSubPhaseFrame >= WAVE_SUBPHASE_WARMUP_FRAMES) {
        spawnWaveMain();
      }
      updateEnemies();
      updateBullets();
      checkCollisions();
      // C295 Phase 4: combo 切れ判定 (lastHitFrame から 180F 超過で HUD/連続カウントリセット)
      if (game.combo.count > 0 && game.frame - game.combo.lastHitFrame > 180) {
        game.combo.count = 0;
      }
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
