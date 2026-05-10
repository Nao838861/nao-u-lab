(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlayText");
  const startButton = document.getElementById("startButton");
  const pauseButton = document.getElementById("pauseButton");
  const resetButton = document.getElementById("resetButton");

  const ui = {
    score: document.getElementById("score"),
    stage: document.getElementById("stage"),
    balls: document.getElementById("balls"),
    relayMeter: document.getElementById("relayMeter"),
    focusMeter: document.getElementById("focusMeter"),
  };

  const W = canvas.width;
  const H = canvas.height;
  const keys = new Set();

  const state = {
    running: false,
    paused: false,
    launched: false,
    score: 0,
    stage: 1,
    balls: 3,
    focus: 0,
    relayIntegrity: 100,
    lastTime: 0,
    shake: 0,
    paddle: { x: W / 2 - 58, y: H - 48, w: 116, h: 14, speed: 520 },
    ball: { x: W / 2, y: H - 68, r: 8, vx: 210, vy: -310, speed: 380 },
    bricks: [],
    sparks: [],
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    state.launched = false;
    state.score = 0;
    state.stage = 1;
    state.balls = 3;
    state.focus = 0;
    state.relayIntegrity = 100;
    state.shake = 0;
    state.paddle.x = W / 2 - state.paddle.w / 2;
    resetBall();
    buildStage();
    showOverlay("赤いBREAKと黄色いSHIELDを壊し、青いRELAYは残してステージを進めます。", "Start");
    updateHud();
    draw();
  }

  function resetBall() {
    state.launched = false;
    state.ball.x = state.paddle.x + state.paddle.w / 2;
    state.ball.y = state.paddle.y - 12;
    state.ball.vx = 190 + state.stage * 12;
    state.ball.vy = -320 - state.stage * 12;
    state.ball.speed = Math.hypot(state.ball.vx, state.ball.vy);
  }

  function buildStage() {
    state.bricks = [];
    const rows = 6;
    const cols = 10;
    const bw = 72;
    const bh = 26;
    const gap = 8;
    const ox = (W - (cols * bw + (cols - 1) * gap)) / 2;
    const oy = 72;

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const relay = (r === 1 && (c === 2 || c === 7)) || (r === 4 && c === 5);
        const shield = !relay && ((r + c + state.stage) % 7 === 0);
        state.bricks.push({
          x: ox + c * (bw + gap),
          y: oy + r * (bh + gap),
          baseX: ox + c * (bw + gap),
          y0: oy + r * (bh + gap),
          w: bw,
          h: bh,
          row: r,
          type: relay ? "relay" : shield ? "shield" : "break",
          hp: relay ? 3 : shield ? 2 : 1,
          alive: true,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  function showOverlay(text, buttonText) {
    overlayText.textContent = text;
    startButton.textContent = buttonText;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function launch() {
    if (!state.running) {
      state.running = true;
      state.paused = false;
      hideOverlay();
    }
    if (!state.launched) {
      state.launched = true;
      const dir = Math.random() < 0.5 ? -1 : 1;
      state.ball.vx = dir * (190 + state.stage * 12);
      state.ball.vy = -320 - state.stage * 14;
      normalizeBall();
    }
  }

  function normalizeBall() {
    const b = state.ball;
    const speed = 380 + state.stage * 22;
    const len = Math.max(1, Math.hypot(b.vx, b.vy));
    b.vx = (b.vx / len) * speed;
    b.vy = (b.vy / len) * speed;
    b.speed = speed;
  }

  function togglePause() {
    if (!state.running) return;
    state.paused = !state.paused;
    if (state.paused) {
      showOverlay("一時停止中です。Resumeで再開します。", "Resume");
    } else {
      hideOverlay();
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function useFocus() {
    if (state.focus < 100 || !state.launched) return;
    state.focus = 0;
    state.ball.vy = -Math.abs(state.ball.vy) - 60;
    state.ball.vx += (state.ball.x - (state.paddle.x + state.paddle.w / 2)) * 2.5;
    state.shake = 10;
    normalizeBall();
    spawnSparks(state.ball.x, state.ball.y, "#f2b84b", 20);
  }

  function spawnSparks(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = 40 + Math.random() * 160;
      state.sparks.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.35 + Math.random() * 0.35,
        color,
      });
    }
  }

  function update(dt) {
    if (!state.running || state.paused) return;

    const p = state.paddle;
    if (keys.has("ArrowLeft") || keys.has("a")) p.x -= p.speed * dt;
    if (keys.has("ArrowRight") || keys.has("d")) p.x += p.speed * dt;
    p.x = clamp(p.x, 18, W - p.w - 18);

    if (!state.launched) {
      state.ball.x = p.x + p.w / 2;
      state.ball.y = p.y - 12;
    } else {
      moveBall(dt);
    }

    moveBricks(dt);
    updateSparks(dt);
    state.shake = Math.max(0, state.shake - 26 * dt);
    updateHud();
  }

  function moveBricks(dt) {
    const t = performance.now() / 1000;
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      const lane = brick.row % 2 === 0 ? 1 : -1;
      const amp = brick.type === "relay" ? 28 : 16 + state.stage * 2;
      brick.x = brick.baseX + Math.sin(t * (0.85 + brick.row * 0.08) + brick.phase) * amp * lane;
    }
  }

  function updateSparks(dt) {
    for (const s of state.sparks) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 280 * dt;
      s.life -= dt;
    }
    state.sparks = state.sparks.filter((s) => s.life > 0);
  }

  function moveBall(dt) {
    const b = state.ball;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x < b.r + 10) {
      b.x = b.r + 10;
      b.vx = Math.abs(b.vx);
    }
    if (b.x > W - b.r - 10) {
      b.x = W - b.r - 10;
      b.vx = -Math.abs(b.vx);
    }
    if (b.y < b.r + 10) {
      b.y = b.r + 10;
      b.vy = Math.abs(b.vy);
    }

    paddleCollision();
    brickCollision();

    if (b.y > H + 32) {
      state.balls -= 1;
      state.relayIntegrity = Math.max(0, state.relayIntegrity - 18);
      if (state.balls <= 0 || state.relayIntegrity <= 0) {
        state.running = false;
        showOverlay("ボールまたはRelay耐久が尽きました。", "Retry");
      } else {
        resetBall();
      }
    }
  }

  function paddleCollision() {
    const b = state.ball;
    const p = state.paddle;
    if (b.vy <= 0) return;
    if (b.x + b.r < p.x || b.x - b.r > p.x + p.w || b.y + b.r < p.y || b.y - b.r > p.y + p.h) return;

    const hit = ((b.x - p.x) / p.w) * 2 - 1;
    const angle = hit * 1.05;
    b.vx = Math.sin(angle) * b.speed;
    b.vy = -Math.cos(angle) * b.speed;
    b.y = p.y - b.r - 1;
    state.focus = Math.min(100, state.focus + 9);
    spawnSparks(b.x, b.y, "#5bc6d8", 5);
  }

  function brickCollision() {
    const b = state.ball;
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      if (b.x + b.r < brick.x || b.x - b.r > brick.x + brick.w || b.y + b.r < brick.y || b.y - b.r > brick.y + brick.h) continue;

      const overlapX = Math.min(b.x + b.r - brick.x, brick.x + brick.w - (b.x - b.r));
      const overlapY = Math.min(b.y + b.r - brick.y, brick.y + brick.h - (b.y - b.r));
      if (overlapX < overlapY) b.vx *= -1;
      else b.vy *= -1;

      hitBrick(brick);
      normalizeBall();
      break;
    }
  }

  function hitBrick(brick) {
    brick.hp -= 1;
    if (brick.type === "relay") {
      state.relayIntegrity = Math.max(0, state.relayIntegrity - 7);
      state.focus = Math.min(100, state.focus + 24);
      state.score += 25;
      state.shake = 5;
      spawnSparks(brick.x + brick.w / 2, brick.y + brick.h / 2, "#5bc6d8", 14);
      if (brick.hp <= 0) {
        brick.alive = false;
        state.relayIntegrity = Math.max(0, state.relayIntegrity - 20);
      }
    } else {
      state.score += brick.type === "shield" ? 80 : 50;
      state.focus = Math.min(100, state.focus + (brick.type === "shield" ? 16 : 10));
      spawnSparks(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.type === "shield" ? "#f2b84b" : "#e85d4f", 10);
      if (brick.hp <= 0) brick.alive = false;
    }

    const remainingBreaks = state.bricks.some((x) => x.alive && x.type !== "relay");
    const livingRelays = state.bricks.some((x) => x.alive && x.type === "relay");
    if (!remainingBreaks && livingRelays) {
      nextStage();
    } else if (!livingRelays) {
      state.running = false;
      showOverlay("青いRELAYがすべて壊れました。RELAYは残す必要があります。", "Retry");
    }
  }

  function nextStage() {
    state.stage += 1;
    state.balls = Math.min(5, state.balls + 1);
    state.relayIntegrity = Math.min(100, state.relayIntegrity + 22);
    state.focus = Math.min(100, state.focus + 35);
    buildStage();
    resetBall();
    showOverlay("成功です。RELAYを残したまま障害ブロックをすべて壊しました。", "Next");
  }

  function updateHud() {
    ui.score.textContent = String(state.score);
    ui.stage.textContent = String(state.stage);
    ui.balls.textContent = String(state.balls);
    ui.relayMeter.style.width = `${clamp(state.relayIntegrity, 0, 100)}%`;
    ui.focusMeter.style.width = `${clamp(state.focus, 0, 100)}%`;
  }

  function draw() {
    const shakeX = state.shake ? (Math.random() - 0.5) * state.shake : 0;
    const shakeY = state.shake ? (Math.random() - 0.5) * state.shake : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.clearRect(-20, -20, W + 40, H + 40);
    drawBackground();
    drawBricks();
    drawPaddle();
    drawBall();
    drawSparks();
    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = "#11151a";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(91,198,216,0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(91,198,216,0.08)";
    ctx.fillRect(10, 10, W - 20, 2);
    ctx.fillRect(10, 10, 2, H - 20);
    ctx.fillRect(W - 12, 10, 2, H - 20);
  }

  function drawBricks() {
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      const color = brick.type === "relay" ? "#5bc6d8" : brick.type === "shield" ? "#f2b84b" : "#e85d4f";
      ctx.fillStyle = color;
      ctx.globalAlpha = brick.type === "relay" ? 0.92 : 0.86;
      roundRect(brick.x, brick.y, brick.w, brick.h, 5, true);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(brick.x + 6, brick.y + 5, brick.w - 12, 3);
      if (brick.type === "relay") {
        ctx.strokeStyle = "#d8fbff";
        ctx.lineWidth = 2;
        roundRect(brick.x + 4, brick.y + 4, brick.w - 8, brick.h - 8, 4, false);
      }
    }
  }

  function drawPaddle() {
    const p = state.paddle;
    ctx.fillStyle = "#d9dee4";
    roundRect(p.x, p.y, p.w, p.h, 7, true);
    ctx.fillStyle = "#5bc6d8";
    roundRect(p.x + p.w * 0.38, p.y - 4, p.w * 0.24, 5, 4, true);
  }

  function drawBall() {
    const b = state.ball;
    const g = ctx.createRadialGradient(b.x - 3, b.y - 4, 2, b.x, b.y, b.r + 5);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.42, "#5bc6d8");
    g.addColorStop(1, "#1d5360");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSparks() {
    for (const s of state.sparks) {
      ctx.globalAlpha = clamp(s.life * 2, 0, 1);
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  function roundRect(x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    if (fill) ctx.fill();
    else ctx.stroke();
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - state.lastTime) / 1000 || 0);
    state.lastTime = t;
    update(dt);
    draw();
    if (state.running && !state.paused) requestAnimationFrame(loop);
  }

  function startLoop() {
    launch();
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (e) => {
    keys.add(e.key);
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      startLoop();
    }
    if (e.key.toLowerCase() === "z") useFocus();
    if (e.key === "Escape") togglePause();
  });

  window.addEventListener("keyup", (e) => keys.delete(e.key));

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scale = W / rect.width;
    state.paddle.x = clamp((e.clientX - rect.left) * scale - state.paddle.w / 2, 18, W - state.paddle.w - 18);
  });

  canvas.addEventListener("pointerdown", startLoop);
  startButton.addEventListener("click", startLoop);
  pauseButton.addEventListener("click", togglePause);
  resetButton.addEventListener("click", resetGame);

  resetGame();
})();
