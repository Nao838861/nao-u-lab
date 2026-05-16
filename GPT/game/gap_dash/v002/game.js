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
    speed: 188,
    dashSpeed: 740,
    dashTime: 0.25,
    dashCooldown: 0.78,
    carWidth: 86,
    carHeight: 34,
    startY: 828,
    goalY: 66,
  };

  const stages = [
    {
      name: "1",
      lanes: [
        { y: 682, speed: 108, dir: 1, phase: 40, gap: 340 },
        { y: 518, speed: 124, dir: -1, phase: 130, gap: 350 },
        { y: 354, speed: 116, dir: 1, phase: 220, gap: 344 },
      ],
    },
    {
      name: "2",
      lanes: [
        { y: 708, speed: 124, dir: 1, phase: 20, gap: 322 },
        { y: 584, speed: 146, dir: -1, phase: 160, gap: 334 },
        { y: 460, speed: 136, dir: 1, phase: 70, gap: 326 },
        { y: 298, speed: 156, dir: -1, phase: 230, gap: 342 },
      ],
    },
    {
      name: "3",
      lanes: [
        { y: 700, speed: 132, dir: 1, phase: 40, gap: 358 },
        { y: 530, speed: 152, dir: -1, phase: 150, gap: 372 },
        { y: 360, speed: 142, dir: 1, phase: 250, gap: 362 },
        { y: 190, speed: 158, dir: -1, phase: 90, gap: 376 },
      ],
    },
  ];

  const state = {
    running: false,
    complete: false,
    failed: false,
    stageIndex: 0,
    time: 0,
    stageTime: 0,
    lastTime: 0,
    accumulator: 0,
    player: { x: W / 2, y: config.startY },
    dashTimer: 0,
    dashCooldown: 0,
    dashCount: 0,
    message: "",
    messageTimer: 0,
  };

  function stage() {
    return stages[state.stageIndex];
  }

  function showOverlay(text, buttonText) {
    overlayText.textContent = text;
    startButton.textContent = buttonText;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function resetRun() {
    state.running = false;
    state.complete = false;
    state.failed = false;
    state.stageIndex = 0;
    state.time = 0;
    state.stageTime = 0;
    state.accumulator = 0;
    state.player.x = W / 2;
    state.player.y = config.startY;
    state.dashTimer = 0;
    state.dashCooldown = 0;
    state.dashCount = 0;
    state.message = "";
    state.messageTimer = 0;
    showOverlay("赤い車を避けて、上のゴールへ。Spaceは上方向への突破ダッシュ。", "開始");
    draw();
  }

  function resetStage() {
    state.player.x = W / 2;
    state.player.y = config.startY;
    state.dashTimer = 0;
    state.dashCooldown = 0;
    state.stageTime = 0;
  }

  function start() {
    if (state.complete || state.failed) resetRun();
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
    state.dashTimer = config.dashTime;
    state.dashCooldown = config.dashCooldown;
    state.dashCount += 1;
  }

  function carsAt(time = state.stageTime, stageIndex = state.stageIndex) {
    const cars = [];
    for (const lane of stages[stageIndex].lanes) {
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
    state.stageTime += dt;
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    state.dashCooldown = Math.max(0, state.dashCooldown - dt);

    const v = inputVector();
    let dx = v.x;
    let dy = v.y;
    let speed = config.speed;
    if (state.dashTimer > 0) {
      dx = 0;
      dy = -1;
      speed = config.dashSpeed;
      state.dashTimer = Math.max(0, state.dashTimer - dt);
    }

    state.player.x = clamp(state.player.x + dx * speed * dt, 22, W - 22);
    state.player.y = clamp(state.player.y + dy * speed * dt, 34, H - 34);

    for (const car of carsAt()) {
      if (rectHit(state.player.x, state.player.y, config.playerSize, config.playerSize, car.x, car.y, car.w, car.h)) {
        state.failed = true;
        state.running = false;
        showOverlay("赤い車に当たった。次は車列の隙間に合わせて、Spaceで上へ抜ける。", "再挑戦");
        return;
      }
    }

    if (state.player.y < config.goalY + 20) {
      if (state.stageIndex < stages.length - 1) {
        state.stageIndex += 1;
        resetStage();
        state.message = `Stage ${state.stageIndex} clear`;
        state.messageTimer = 1.1;
      } else {
        state.complete = true;
        state.running = false;
        showOverlay(`全ステージ到達。${state.time.toFixed(1)}秒 / Dash ${state.dashCount}`, "再挑戦");
      }
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

  function drawChevron(x, y) {
    ctx.strokeStyle = "#f0c95a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 16, y + 8);
    ctx.lineTo(x, y - 8);
    ctx.lineTo(x + 16, y + 8);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#151a21";
    ctx.fillRect(0, 0, W, H);

    drawRect(W / 2, 30, W, 60, "#233d2d");
    ctx.fillStyle = "#90df78";
    ctx.font = "24px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GOAL", W / 2, 38);

    drawRect(W / 2, config.startY + 34, W, 88, "#202632");
    for (const lane of stage().lanes) {
      drawRect(W / 2, lane.y, W, 58, "#1b2028");
      drawChevron(W / 2, lane.y + 58);
    }

    for (const car of carsAt()) {
      drawRect(car.x, car.y, car.w, car.h, "#ff4f76", "#ffd0da");
      ctx.fillStyle = "#2b1118";
      ctx.fillRect(car.x - 24, car.y - 13, 17, 8);
      ctx.fillRect(car.x + 8, car.y - 13, 17, 8);
    }

    const dashReady = state.dashCooldown <= 0;
    if (dashReady) drawChevron(state.player.x, state.player.y - 30);
    drawRect(state.player.x, state.player.y, config.playerSize, config.playerSize, "#69c8ff", dashReady ? "#f5f1e8" : "#3a5269");
    if (state.dashTimer > 0) {
      ctx.strokeStyle = "#f0c95a";
      ctx.lineWidth = 4;
      ctx.strokeRect(state.player.x - 23, state.player.y - 23, 46, 46);
    }

    ctx.textAlign = "left";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillStyle = "#f5f1e8";
    ctx.fillText(`Stage ${state.stageIndex + 1}/3`, 18, 30);
    ctx.fillText(`時間 ${state.time.toFixed(1)}  Dash ${dashReady ? "OK" : state.dashCooldown.toFixed(1)}  使用 ${state.dashCount}`, 18, H - 54);
    ctx.fillText("WASD/矢印: 移動  Space: 上へダッシュ", 18, H - 26);
    if (state.messageTimer > 0) {
      ctx.textAlign = "center";
      ctx.font = "34px Segoe UI, sans-serif";
      ctx.fillStyle = "#f0c95a";
      ctx.fillText(state.message, W / 2, H / 2);
    }
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

  window.__gapDashV2 = {
    snapshot() {
      return {
        running: state.running,
        complete: state.complete,
        failed: state.failed,
        stageIndex: state.stageIndex,
        time: Math.round(state.time * 100) / 100,
        stageTime: Math.round(state.stageTime * 100) / 100,
        player: { x: Math.round(state.player.x * 10) / 10, y: Math.round(state.player.y * 10) / 10 },
        dashReady: state.dashCooldown <= 0,
        dashTimer: Math.round(state.dashTimer * 100) / 100,
        dashCount: state.dashCount,
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
    reset: resetRun,
  };

  resetRun();
})();
