// log_autonomous_game v001 — Echo-Path 骨格 (case=2)
// 中心入力 Space: castLock で過去 1 秒の足跡を記録開始 → 1 秒後 resolveLock で判定
// 副入力: 矢印キー / WASD で移動
// 骨格段階: 敵 A (直進小型) を 1 wave、衝突判定、最小ロジックのみ

(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const FPS = 60;
  const ECHO_FRAMES = 60; // 1 秒
  // Q-D 弾パラメータ (design_log.md §Q-D 実装パラメータ準拠 / Movement Prediction 外部知見裏付け)
  const BULLET_SPEED = 2.0;        // pixel/frame、120 px/s、1秒先=120px=画面短辺640pxの19%
  const SHOOT_INTERVAL = 90;       // 1.5秒間隔
  const SHOOT_GATE_Y_MAX = H * 0.85; // 退場フェーズ手前まで (敵A 縦進行用)
  // Q-D 発射予告ゴースト (C312 Phase 4 / 2026-06-08):
  // 弾発射 GHOST_LEAD_FRAMES 前から発射元 (= 敵の位置) に半透明な予告ドット + チャージリングを表示。
  // 発射時にゴースト pop + 実弾 push の遷移で「いつ・どこから弾が出るか」を origin 側で可視化する。
  // C242 (Nao_u 5/26 06:10 批判) で削除した「弾本体の予測軌跡 line + 終端 × marker」とは別軸:
  //   削除済 = 弾の future trajectory (画面内を動く軌跡)
  //   本実装 = 弾の発射 origin (敵の位置で出る予告) = Q-D「攻撃元の可視化」本来主旨
  // 軌跡 line・×印・座標固定マーカーは一切出さない。敵自身の位置で脈動するドット+リングのみ。
  const GHOST_LEAD_FRAMES = 36;    // 600ms 前から予告開始 (発射ホライズン < 1秒、Movement Prediction 整合)
  const GHOST_ALPHA_BASE = 0.18;   // 開始時 alpha
  const GHOST_ALPHA_PEAK = 0.55;   // 発射直前 alpha
  // 敵D 横断敵: 中央付近のみ射撃 (design_log §Q-C 敵D「中央付近でのみ射撃」)
  const SHOOT_GATE_X_MIN = W * 0.2;  // 128
  const SHOOT_GATE_X_MAX = W * 0.8;  // 512
  // 敵速度定数 (audit が静的抽出するため const 化)
  const ENEMY_VY_A = 1.4;          // 敵A 直進小型 縦速度
  const ENEMY_VX_D = 1.4;          // 敵D 横断敵 横速度 (vy_A と対称)

  const STATE = { TITLE: 'TITLE', PLAYING: 'PLAYING', GAMEOVER: 'GAMEOVER', CLEAR: 'CLEAR' };

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
        game: 'log_autonomous_game/v001',
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
  window.__logAutonomousV001 = {
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
  function spawnWaveA() {
    const n = 5;
    for (let i = 0; i < n; i++) {
      game.enemies.push({
        type: 'A',
        x: W * (0.15 + i * 0.175),
        y: -20 - i * 40,
        vx: 0,
        vy: ENEMY_VY_A,
        r: 10,
        alive: true,
        // 射撃タイミングを敵間でずらす (画面内到達後 30フレーム + i*20 で初弾)
        shootCooldown: 30 + i * 20,
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

  // wave dispatcher: waveCount 偶数 → A、奇数 → D (1=A, 2=D, 3=A, 4=D, ...)
  function spawnNextWave() {
    if (game.waveCount % 2 === 0) spawnWaveA();
    else spawnWaveD();
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
      e.x += e.vx; e.y += e.vy;
      // 退場判定 (type 別): A は画面下端、D は左右端
      if (e.type === 'D') {
        if (e.x < -30 || e.x > W + 30) { e.alive = false; continue; }
      } else {
        if (e.y > H + 30) { e.alive = false; continue; }
      }
      // SHOOT_GATE: y in [0, H*0.85] (退場前)、type='D' は追加で x in [W*0.2, W*0.8] (中央域)
      const inYGate = e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX;
      const inXGate = e.type !== 'D' || (e.x >= SHOOT_GATE_X_MIN && e.x <= SHOOT_GATE_X_MAX);
      if (inYGate && inXGate) {
        e.shootCooldown -= 1;
        if (e.shootCooldown <= 0) {
          spawnBullet(e);
          e.shootCooldown = SHOOT_INTERVAL;
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

    // 導入: プレイヤーキャラの 1 秒先に薄い未来ゴーストを出す (Q-導入)
    game.introGhostPhase += 0.02;
    const cx = W * 0.5, cy = H * 0.55;
    const ghostX = cx + Math.sin(game.introGhostPhase) * 24;
    const ghostY = cy - 32 + Math.cos(game.introGhostPhase * 0.7) * 6;
    ctx.fillStyle = 'rgba(140,200,255,0.35)';
    ctx.beginPath(); ctx.arc(ghostX, ghostY, 7, 0, Math.PI * 2); ctx.fill();
    // 本体
    ctx.fillStyle = '#dfe7f3';
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
    // 結ぶ細線 (足跡=道のメタファ)
    ctx.strokeStyle = 'rgba(120,170,220,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ghostX, ghostY); ctx.stroke();

    ctx.fillStyle = '#e6edf7';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Echo-Path', W * 0.5, H * 0.32);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#9aa9c2';
    ctx.fillText('あなたの足跡が、これから歩く道になる', W * 0.5, H * 0.36);
    ctx.fillStyle = 'rgba(140,200,255,0.55)';
    ctx.font = '12px sans-serif';
    ctx.fillText('— 1 秒先の自分に賭けるパイロットごっこ —', W * 0.5, H * 0.40);

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

    // 敵 (type 別配色: A=赤, D=紫寄り = 横軸の差別化を視覚で示す、内側→外側流出 1 原則は弾本体・予測非表示で維持)
    for (const e of game.enemies) {
      ctx.fillStyle = e.type === 'D' ? '#b878ff' : '#ff6b6b';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }

    // Q-D 発射予告ゴースト (C312 Phase 4 / 2026-06-08):
    // shootCooldown が GHOST_LEAD_FRAMES 以下に入った敵の位置に、発射元 (origin) 予告を描画。
    // 発射時 (shootCooldown <= 0) でゴースト消滅 + 実弾出現の遷移で「いつ・どこから出るか」を可視化。
    // C242 削除済の「弾本体の軌跡 line + 終端 × marker」とは別軸 (= 弾の origin を敵位置で示すのみ、
    // 弾の future trajectory は出さない)。SHOOT_GATE 外の敵は撃たないので予告も出さない。
    for (const e of game.enemies) {
      if (!e.alive) continue;
      if (e.shootCooldown > GHOST_LEAD_FRAMES || e.shootCooldown <= 0) continue;
      const inYGate = e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX;
      const inXGate = e.type !== 'D' || (e.x >= SHOOT_GATE_X_MIN && e.x <= SHOOT_GATE_X_MAX);
      if (!inYGate || !inXGate) continue;
      const t = 1 - (e.shootCooldown / GHOST_LEAD_FRAMES); // 0 → 1 (発射に近いほど大)
      const alpha = GHOST_ALPHA_BASE + (GHOST_ALPHA_PEAK - GHOST_ALPHA_BASE) * t;
      // 予告ドット (実弾と同じ橙色、半透明、発射直前で実弾サイズに膨張)
      ctx.fillStyle = `rgba(255, 184, 120, ${alpha})`;
      ctx.beginPath(); ctx.arc(e.x, e.y, 2 + t * 2.5, 0, Math.PI * 2); ctx.fill();
      // チャージリング (発射が近いほど内側に閉じる)
      ctx.strokeStyle = `rgba(255, 184, 120, ${alpha * 0.75})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r + 6 - t * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Q-D: 敵弾本体のみ描画
    // C242 Phase 3 (2026-05-26): Nao_u 06:10 「1秒先軌跡+×印が邪魔で逆によけにくい」批判を受け
    // 予測軌道線・×マーカーを削除。1秒先計算は内部状態 (echo 機構) に閉じ、
    // プレイヤーには弾本体の素直な読み取りで対決させる方向に転回。
    // 1 原則: 内側で計算したものを外側に流出させない (feedback_inside_to_outside_leak.md)
    // C312 Phase 4: origin 側予告 (上記ループ) は弾本体軌跡とは別軸、批判削除対象外。
    for (const b of game.bullets) {
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
    ctx.fillText(`wave:${game.waveCount}`, W - 8, 16);
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
      if (!game.waveSpawned && game.frame % 2 === 0) spawnNextWave();
      // Wave が全て退場したら次 Wave (waveCount 偶奇で A/D 切替)
      if (game.waveSpawned && game.enemies.length === 0) {
        game.waveSpawned = false;
        logEvent('wave_clear', { wave: game.waveCount });
      }
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
