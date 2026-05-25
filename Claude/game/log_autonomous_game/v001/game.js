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

  const STATE = { TITLE: 'TITLE', PLAYING: 'PLAYING', GAMEOVER: 'GAMEOVER', CLEAR: 'CLEAR' };

  const game = {
    state: STATE.TITLE,
    frame: 0,
    player: { x: W * 0.5, y: H * 0.78, r: 8, speed: 3.4 },
    keys: new Set(),
    spaceEdge: false,
    trail: [], // 過去 ECHO_FRAMES フレーム分のプレイヤー座標
    echo: null, // { startFrame, path: [{x,y}], result: null }
    enemies: [],
    waveSpawned: false,
    waveCount: 0,
    lockResults: { hit: 0, miss: 0, idle: 0 },
    idleSince: 0,
    introGhostPhase: 0,
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
    game.echo = { startFrame: game.frame, path, result: null, hit: false };
    game.idleSince = game.frame;
  }
  function resolveLock() {
    if (!game.echo) return;
    const e = game.echo;
    e.result = e.hit ? 'miss' : 'hit'; // 再演中に被弾していなければ予測当
    if (e.result === 'hit') game.lockResults.hit += 1;
    else game.lockResults.miss += 1;
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
      });
    }
    game.waveSpawned = true;
    game.waveCount += 1;
  }
  function updateEnemies() {
    for (const e of game.enemies) {
      if (!e.alive) continue;
      e.x += e.vx; e.y += e.vy;
      if (e.y > H + 30) e.alive = false; // 退場
    }
    game.enemies = game.enemies.filter(e => e.alive);
  }

  // --- 衝突 ---
  function checkCollisions() {
    for (const e of game.enemies) {
      const d = Math.hypot(e.x - game.player.x, e.y - game.player.y);
      if (d < e.r + game.player.r) {
        if (game.echo) game.echo.hit = true; // 再演中の被弾フラグ
        game.state = STATE.GAMEOVER;
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
    }

    // 敵
    for (const e of game.enemies) {
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    }

    // プレイヤー
    ctx.fillStyle = '#dfe7f3';
    ctx.beginPath(); ctx.arc(game.player.x, game.player.y, game.player.r, 0, Math.PI * 2); ctx.fill();

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
    game.waveSpawned = false;
    game.waveCount = 0;
    game.lockResults = { hit: 0, miss: 0, idle: 0 };
    game.idleSince = 0;
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
