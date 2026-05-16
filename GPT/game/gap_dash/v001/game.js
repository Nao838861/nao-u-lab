(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlayText");
  const startButton = document.getElementById("startButton");
  const W = canvas.width;
  const H = canvas.height;
  const keys = new Set();

  const config = {
    fixedDt: 1 / 120,
    playerSize: 28,
    speed: 205,
    dashSpeed: 520,
    dashTime: 0.14,
    dashCooldown: 0.55,
    carWidth: 82,
    carHeight: 34,
    startY: 828,
    goalY: 52,
  };

  const laneDefs = [
    { y: 708, speed: 132, dir: 1, phase: 0, gap: 230 },
    { y: 598, speed: 164, dir: -1, phase: 70, gap: 250 },
    { y: 488, speed: 190, dir: 1, phase: 140, gap: 240 },
    { y: 378, speed: 152, dir: -1, phase: 30, gap: 220 },
    { y: 268, speed: 176, dir: 1, phase: 110, gap: 245 },
    { y: 158, speed: 138, dir: -1, phase: 190, gap: 235 },
  ];

  const state = {
    running: false,
    complete: false,
    failed: false,
    time: 0,
    lastTime: 0,
    accumulator: 0,
    player: { x: W / 2, y: config.startY },
    dashTimer: 0,
    dashCooldown: 0,
    dashVector: { x: 0, y: -1 },
  };

  function showOverlay(text, buttonText) {
    overlayText.textContent = text;
    startButton.textContent = buttonText;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function resetGame() {
    state.running = false;
    state.complete = false;
    state.failed = false;
    state.time = 0;
    state.accumulator = 0;
    state.player.x = W / 2;
    state.player.y = config.startY;
    state.dashTimer = 0;
    state.dashCooldown = 0;
    state.dashVector.x = 0;
    state.dashVector.y = -1;
    showOverlay("赤い車を避けて、上の緑のゴールへ。Spaceで短くダッシュ。", "開始");
    draw();
  }

  function start() {
    if (state.complete || state.failed) resetGame();
    state.running = true;
    hideOverlay();
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function inputVector() {
    let dx = 0;
    let dy = 0;
    if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
    if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("s")) dy += 1;
    if (dx === 0 && dy === 0) return { x: 0, y: 0 };
    const len = Math.hypot(dx, dy);
    return { x: dx / len, y: dy / len };
  }

  function triggerDash() {
    if (!state.running || state.dashCooldown > 0 || state.dashTimer > 0) return;
    const v = inputVector();
    state.dashVector.x = v.x || 0;
    state.dashVector.y = v.y || -1;
    state.dashTimer = config.dashTime;
    state.dashCooldown = config.dashCooldown;
  }

  function carsAt(time = state.time) {
    const cars = [];
    for (const lane of laneDefs) {
      for (let i = -1; i < 5; i += 1) {
        let x = lane.phase + i * lane.gap + lane.dir * lane.speed * time;
        x = ((x % (W + lane.gap)) + (W + lane.gap)) % (W + lane.gap) - lane.gap / 2;
        cars.push({ x, y: lane.y, w: config.carWidth, h: config.carHeight, dir: lane.dir });
      }
    }
    return cars;
  }

  function rectHit(ax, ay, aw, ah, bx, by, bw, bh) {
    return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
  }

  function update(dt) {
    if (!state.running || state.complete || state.failed) return;
    state.time += dt;
    state.dashCooldown = Math.max(0, state.dashCooldown - dt);
    const v = inputVector();
    let speed = config.speed;
    let dx = v.x;
    let dy = v.y;
    if (state.dashTimer > 0) {
      speed = config.dashSpeed;
      dx = state.dashVector.x;
      dy = state.dashVector.y;
      state.dashTimer = Math.max(0, state.dashTimer - dt);
    }
    state.player.x = clamp(state.player.x + dx * speed * dt, 22, W - 22);
    state.player.y = clamp(state.player.y + dy * speed * dt, 34, H - 34);

    for (const car of carsAt()) {
      if (rectHit(state.player.x, state.player.y, config.playerSize, config.playerSize, car.x, car.y, car.w, car.h)) {
        state.failed = true;
        state.running = false;
        showOverlay("赤い車に当たった。隙間を待つか、Spaceで抜ける。", "再挑戦");
        return;
      }
    }

    if (state.player.y < config.goalY + 22) {
      state.complete = true;
      state.running = false;
      showOverlay(`到達。時間 ${state.time.toFixed(1)} 秒。`, "再挑戦");
    }
  }

  function drawRect(cx, cy, w, h, fill, stroke = null) {
    ctx.fillStyle = fill;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#151a21";
    ctx.fillRect(0, 0, W, H);

    drawRect(W / 2, 28, W, 56, "#223b2c");
    ctx.fillStyle = "#8ee07a";
    ctx.font = "24px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GOAL", W / 2, 36);

    drawRect(W / 2, config.startY + 34, W, 88, "#202632");
    ctx.strokeStyle = "#2d3542";
    ctx.lineWidth = 1;
    for (const lane of laneDefs) {
      drawRect(W / 2, lane.y, W, 56, "#1b2028");
      ctx.beginPath();
      ctx.moveTo(0, lane.y + 28);
      ctx.lineTo(W, lane.y + 28);
      ctx.stroke();
    }

    for (const car of carsAt()) {
      drawRect(car.x, car.y, car.w, car.h, "#ff4f76", "#ffd0da");
      ctx.fillStyle = "#2b1118";
      ctx.fillRect(car.x - 23, car.y - 13, 16, 8);
      ctx.fillRect(car.x + 7, car.y - 13, 16, 8);
    }

    const dashReady = state.dashCooldown <= 0;
    drawRect(state.player.x, state.player.y, config.playerSize, config.playerSize, "#69c8ff", dashReady ? "#f5f1e8" : "#3a5269");
    if (state.dashTimer > 0) {
      ctx.strokeStyle = "#f0c95a";
      ctx.lineWidth = 4;
      ctx.strokeRect(state.player.x - 22, state.player.y - 22, 44, 44);
    }

    ctx.textAlign = "left";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillStyle = "#f5f1e8";
    ctx.fillText("WASD/矢印: 移動  Space: ダッシュ", 18, H - 26);
    ctx.fillText(`時間 ${state.time.toFixed(1)}  Dash ${dashReady ? "OK" : state.dashCooldown.toFixed(1)}`, 18, H - 54);
  }

  function loop(t) {
    const frameDt = Math.min(0.05, (t - state.lastTime) / 1000 || 0);
    state.lastTime = t;
    state.accumulator += frameDt;
    while (state.accumulator >= config.fixedDt) {
      update(config.fixedDt);
      state.accumulator -= config.fixedDt;
    }
    draw();
    if (state.running) requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (event) => {
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
    if (event.key === " ") triggerDash();
    keys.add(event.key);
    keys.add(event.key.toLowerCase());
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key);
    keys.delete(event.key.toLowerCase());
  });

  startButton.addEventListener("click", start);
  canvas.addEventListener("pointerdown", start);

  window.__gapDashV1 = {
    snapshot() {
      return {
        running: state.running,
        complete: state.complete,
        failed: state.failed,
        time: Math.round(state.time * 100) / 100,
        player: { x: Math.round(state.player.x * 10) / 10, y: Math.round(state.player.y * 10) / 10 },
        dashReady: state.dashCooldown <= 0,
        dashTimer: Math.round(state.dashTimer * 100) / 100,
        cars: carsAt().map((car) => ({ x: Math.round(car.x * 10) / 10, y: car.y, w: car.w, h: car.h })),
        goalY: config.goalY,
      };
    },
    setKey(key, down) {
      if (down) keys.add(key);
      else keys.delete(key);
    },
    dash: triggerDash,
    start,
    step(frames = 1) {
      for (let i = 0; i < frames; i += 1) update(config.fixedDt);
    },
    reset: resetGame,
  };

  resetGame();
})();
