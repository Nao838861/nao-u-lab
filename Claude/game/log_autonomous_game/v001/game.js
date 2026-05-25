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
  const GHOST_ALPHA_LINE = 0.30;   // ゴースト線 alpha (弾本体 1.0 比)
  const GHOST_ALPHA_TIP = 0.65;    // ゴースト末端 × マーカー alpha
  const SHOOT_GATE_Y_MAX = H * 0.85; // 退場フェーズ手前まで

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
        vy: 1.4,
        r: 10,
        alive: true,
        // 射撃タイミングを敵間でずらす (画面内到達後 30フレーム + i*20 で初弾)
        shootCooldown: 30 + i * 20,
      });
    }
    game.waveSpawned = true;
    game.waveCount += 1;
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
      if (e.y > H + 30) { e.alive = false; continue; } // 退場
      // SHOOT_GATE: 画面内 (y in [0, H*0.85]) かつ退場前のみ射撃
      if (e.y >= 0 && e.y <= SHOOT_GATE_Y_MAX) {
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
        game.state = STATE.GAMEOVER;
        return;
      }
    }
    for (const b of game.bullets) {
      const d = Math.hypot(b.x - game.player.x, b.y - game.player.y);
      if (d < b.r + game.player.r) {
        if (game.echo) game.echo.hit = true;
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

    // 敵
    for (const e of game.enemies) {
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }

    // Q-D: 敵弾 + 1秒先予測軌道ゴースト
    for (const b of game.bullets) {
      const gx = b.x + b.vx * ECHO_FRAMES;
      const gy = b.y + b.vy * ECHO_FRAMES;
      // 予測軌道線 (弾本体より淡い半透明、divergence 警告 = 「予測 ≠ 確定」を視覚化)
      ctx.strokeStyle = `rgba(255, 180, 120, ${GHOST_ALPHA_LINE})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      // ゴースト末端 × マーカー (軌道線と別記号で「ここに来る」を強調)
      ctx.strokeStyle = `rgba(255, 180, 120, ${GHOST_ALPHA_TIP})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx - 4, gy - 4); ctx.lineTo(gx + 4, gy + 4);
      ctx.moveTo(gx - 4, gy + 4); ctx.lineTo(gx + 4, gy - 4);
      ctx.stroke();
      // 弾本体 (alpha=1.0 で「確定」)
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
    if ((game.frame >> 4) & 1) {
      ctx.fillStyle = '#cbd8ec';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('PRESS SPACE', W * 0.5, H * 0.54);
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
      if (!game.waveSpawned && game.frame % 2 === 0) spawnWaveA();
      // Wave が全て退場したら次 Wave (骨格段階ではループ)
      if (game.waveSpawned && game.enemies.length === 0) game.waveSpawned = false;
      updateEnemies();
      updateBullets();
      checkCollisions();
      // idle (Q-成功FB 状態3 未立): 3 秒以上 lock なしで idle カウント
      if (!game.echo && game.frame - game.idleSince > FPS * 3) {
        game.lockResults.idle += 1;
        game.idleSince = game.frame;
      }
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
