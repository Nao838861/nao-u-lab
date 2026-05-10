(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlayText");
  const startButton = document.getElementById("startButton");

  const W = canvas.width;
  const H = canvas.height;
  const center = { x: W / 2, y: H / 2 };
  const keys = new Set();

  const config = {
    mu: 5_200_000,
    planetRadius: 34,
    startRadius: 150,
    targetRadius: 220,
    targetHalfWidth: 18,
    minRadius: 46,
    maxRadius: 390,
    thrust: 52,
    fixedDt: 1 / 120,
    predictionSteps: 680,
    predictionStride: 6,
  };

  const state = {
    running: false,
    paused: false,
    complete: false,
    lastTime: 0,
    accumulator: 0,
    hold: 0,
    attempts: 1,
    message: "Raise orbit into the green band.",
    messageTimer: 2,
    stars: [],
    ship: {
      x: center.x,
      y: center.y - config.startRadius,
      vx: Math.sqrt(config.mu / config.startRadius),
      vy: 0,
    },
  };

  function makeStars() {
    state.stars = [];
    for (let i = 0; i < 150; i += 1) {
      state.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.6 + Math.random() * 1.4,
        a: 0.25 + Math.random() * 0.65,
      });
    }
  }

  function resetAttempt(message = "Raise orbit into the green band.") {
    state.complete = false;
    state.hold = 0;
    state.message = message;
    state.messageTimer = 2;
    state.ship.x = center.x;
    state.ship.y = center.y - config.startRadius;
    state.ship.vx = Math.sqrt(config.mu / config.startRadius);
    state.ship.vy = 0;
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    state.attempts = 1;
    makeStars();
    resetAttempt();
    showOverlay("Use prograde and retrograde thrust to hold the green target orbit.", "Start");
    draw();
  }

  function showOverlay(text, buttonText) {
    overlayText.textContent = text;
    startButton.textContent = buttonText;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function start() {
    if (!state.running) {
      state.running = true;
      state.paused = false;
      hideOverlay();
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
      return;
    }
    if (state.complete) {
      state.attempts += 1;
      resetAttempt();
      hideOverlay();
      state.complete = false;
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function radiusOf(ship = state.ship) {
    return Math.hypot(ship.x - center.x, ship.y - center.y);
  }

  function speedOf(ship = state.ship) {
    return Math.hypot(ship.vx, ship.vy);
  }

  function unitVelocity(ship = state.ship) {
    const speed = Math.max(1, speedOf(ship));
    return { x: ship.vx / speed, y: ship.vy / speed };
  }

  function integrate(ship, dt, thrustMode = 0) {
    const dx = ship.x - center.x;
    const dy = ship.y - center.y;
    const r2 = Math.max(900, dx * dx + dy * dy);
    const r = Math.sqrt(r2);
    const grav = -config.mu / (r2 * r);
    let ax = dx * grav;
    let ay = dy * grav;

    if (thrustMode !== 0) {
      const u = unitVelocity(ship);
      ax += u.x * config.thrust * thrustMode;
      ay += u.y * config.thrust * thrustMode;
    }

    ship.vx += ax * dt;
    ship.vy += ay * dt;
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
  }

  function currentThrustMode() {
    if (keys.has(" ") || keys.has("ArrowUp")) return 1;
    if (keys.has("Shift") || keys.has("ArrowDown")) return -1;
    return 0;
  }

  function update(dt) {
    if (!state.running || state.paused || state.complete) return;

    integrate(state.ship, dt, currentThrustMode());
    state.messageTimer = Math.max(0, state.messageTimer - dt);

    const radius = radiusOf();
    if (radius < config.minRadius) {
      state.attempts += 1;
      resetAttempt("Crash. Too low.");
      return;
    }
    if (radius > config.maxRadius) {
      state.attempts += 1;
      resetAttempt("Escape. Too high.");
      return;
    }

    const inBand = Math.abs(radius - config.targetRadius) <= config.targetHalfWidth;
    state.hold = inBand ? state.hold + dt : Math.max(0, state.hold - dt * 0.8);
    if (state.hold >= 3) {
      state.complete = true;
      state.message = "Mission complete.";
      state.messageTimer = 99;
      showOverlay("Mission complete. The orbit held for 3 seconds.", "Retry");
    }
  }

  function prediction() {
    const ghost = { ...state.ship };
    const dots = [];
    for (let i = 0; i < config.predictionSteps; i += 1) {
      integrate(ghost, config.fixedDt, 0);
      if (i % config.predictionStride === 0) {
        const r = radiusOf(ghost);
        dots.push({ x: ghost.x, y: ghost.y, inBand: Math.abs(r - config.targetRadius) <= config.targetHalfWidth });
      }
      const r = radiusOf(ghost);
      if (r < config.minRadius * 0.8 || r > config.maxRadius * 1.15) break;
    }
    return dots;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSpace();
    drawOrbitBands();
    drawPrediction();
    drawShip();
    drawHud();
  }

  function drawSpace() {
    ctx.fillStyle = "#080c10";
    ctx.fillRect(0, 0, W, H);
    for (const star of state.stars) {
      ctx.globalAlpha = star.a;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawOrbitBands() {
    ctx.strokeStyle = "rgba(116,214,128,0.26)";
    ctx.lineWidth = config.targetHalfWidth * 2;
    ctx.beginPath();
    ctx.arc(center.x, center.y, config.targetRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(116,214,128,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center.x, center.y, config.targetRadius - config.targetHalfWidth, 0, Math.PI * 2);
    ctx.arc(center.x, center.y, config.targetRadius + config.targetHalfWidth, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center.x, center.y, config.startRadius, 0, Math.PI * 2);
    ctx.stroke();

    const grad = ctx.createRadialGradient(center.x - 10, center.y - 12, 4, center.x, center.y, config.planetRadius);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.35, "#69b9ff");
    grad.addColorStop(1, "#16314a");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center.x, center.y, config.planetRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPrediction() {
    const dots = prediction();
    for (const dot of dots) {
      if (dot.x < -20 || dot.x > W + 20 || dot.y < -20 || dot.y > H + 20) continue;
      ctx.fillStyle = dot.inBand ? "rgba(116,214,128,0.92)" : "rgba(240,200,90,0.42)";
      ctx.fillRect(dot.x - 1.5, dot.y - 1.5, 3, 3);
    }
  }

  function drawShip() {
    const ship = state.ship;
    const angle = Math.atan2(ship.vy, ship.vx);
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(angle);
    ctx.fillStyle = currentThrustMode() === 0 ? "#f2f4f3" : "#f0c85a";
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-9, -8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-9, 8);
    ctx.closePath();
    ctx.fill();
    if (currentThrustMode() !== 0) {
      ctx.fillStyle = currentThrustMode() > 0 ? "#69b9ff" : "#ff6f7a";
      ctx.fillRect(-17, -3, 8, 6);
    }
    ctx.restore();
  }

  function drawHud() {
    const r = radiusOf();
    const s = speedOf();
    const holdPct = Math.min(1, state.hold / 3);
    ctx.fillStyle = "rgba(5,7,9,0.74)";
    ctx.fillRect(14, 14, 398, 118);
    ctx.fillStyle = "#f2f4f3";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText("Gravity Courier v001", 28, 42);
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText(`半径 ${Math.round(r)} / 目標 ${config.targetRadius} +/- ${config.targetHalfWidth}`, 28, 68);
    ctx.fillText(`速度 ${Math.round(s)}   試行 ${state.attempts}`, 28, 91);
    ctx.fillStyle = "#1b2520";
    ctx.fillRect(28, 108, 220, 10);
    ctx.fillStyle = "#74d680";
    ctx.fillRect(28, 108, 220 * holdPct, 10);

    ctx.fillStyle = currentThrustMode() > 0 ? "#69b9ff" : currentThrustMode() < 0 ? "#ff6f7a" : "#aab4b1";
    ctx.fillText(currentThrustMode() > 0 ? "順行噴射" : currentThrustMode() < 0 ? "逆行噴射" : "慣性飛行", 265, 116);

    if (state.messageTimer > 0) {
      ctx.fillStyle = "rgba(5,7,9,0.74)";
      ctx.fillRect(302, H - 66, 360, 38);
      ctx.fillStyle = "#f2f4f3";
      ctx.font = "16px Segoe UI, sans-serif";
      ctx.fillText(state.message, 318, H - 42);
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
    if (state.running && !state.paused) requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Shift") {
      event.preventDefault();
    }
    keys.add(event.key);
    if (event.key === "Enter") start();
    if (event.key.toLowerCase() === "r") {
      state.attempts += 1;
      resetAttempt("リセットしました。");
      hideOverlay();
      state.running = true;
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
    }
    if (event.key.toLowerCase() === "p" && state.running) {
      state.paused = !state.paused;
      if (!state.paused) {
        state.lastTime = performance.now();
        requestAnimationFrame(loop);
      }
    }
  });

  window.addEventListener("keyup", (event) => keys.delete(event.key));
  startButton.addEventListener("click", start);
  canvas.addEventListener("pointerdown", start);

  window.__gravityCourier = {
    snapshot() {
      return {
        running: state.running,
        complete: state.complete,
        radius: Math.round(radiusOf() * 100) / 100,
        speed: Math.round(speedOf() * 100) / 100,
        hold: Math.round(state.hold * 100) / 100,
        attempts: state.attempts,
        predictionCount: prediction().length,
        ship: {
          x: Math.round(state.ship.x * 100) / 100,
          y: Math.round(state.ship.y * 100) / 100,
          vx: Math.round(state.ship.vx * 100) / 100,
          vy: Math.round(state.ship.vy * 100) / 100,
        },
      };
    },
    setKey(key, down) {
      if (down) keys.add(key);
      else keys.delete(key);
    },
    start,
    step(frames = 1) {
      for (let i = 0; i < frames; i += 1) update(config.fixedDt);
    },
    reset: resetGame,
  };

  resetGame();
})();
