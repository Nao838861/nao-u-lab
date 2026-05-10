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
    fixedDt: 1 / 120,
    minRestLength: 135,
    maxRestLength: 360,
    reelSpeed: 115,
    springK: 5.8,
    radialDamping: 2.6,
    airDamping: 0.018,
    beadRadius: 13,
    trailLimit: 130,
    predictionSteps: 420,
    predictionStride: 5,
  };

  const initial = {
    x: center.x + 260,
    y: center.y,
    vx: 0,
    vy: 190,
    restLength: 240,
  };

  const state = {
    running: false,
    paused: false,
    time: 0,
    lastTime: 0,
    accumulator: 0,
    x: initial.x,
    y: initial.y,
    vx: initial.vx,
    vy: initial.vy,
    restLength: initial.restLength,
    trail: [],
    stars: [],
    pulses: [],
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function inputMode() {
    if (keys.has(" ") || keys.has("ArrowUp")) return -1;
    if (keys.has("Shift") || keys.has("ArrowDown")) return 1;
    return 0;
  }

  function metrics(model = state) {
    const dx = model.x - center.x;
    const dy = model.y - center.y;
    const radius = Math.hypot(dx, dy) || 1;
    const ux = dx / radius;
    const uy = dy / radius;
    const radialVelocity = model.vx * ux + model.vy * uy;
    const tx = -uy;
    const ty = ux;
    const tangentialVelocity = model.vx * tx + model.vy * ty;
    const angularVelocity = tangentialVelocity / radius;
    const stretch = Math.max(0, radius - model.restLength);
    return {
      radius,
      ux,
      uy,
      radialVelocity,
      tangentialVelocity,
      angularVelocity,
      stretch,
    };
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    state.time = 0;
    state.accumulator = 0;
    state.x = initial.x;
    state.y = initial.y;
    state.vx = initial.vx;
    state.vy = initial.vy;
    state.restLength = initial.restLength;
    state.trail = [];
    state.pulses = [];
    makeStars();
    showOverlay("目標なし。弾性コードの自然長だけを変えて、玉が遅れて縮む・流れる感触を見る。", "開始");
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
    }
  }

  function makeStars() {
    state.stars = [];
    for (let i = 0; i < 120; i += 1) {
      state.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.5 + Math.random() * 1.3,
        a: 0.18 + Math.random() * 0.55,
      });
    }
  }

  function integrate(model, dt, mode = 0) {
    if (mode !== 0) {
      model.restLength = clamp(
        model.restLength + mode * config.reelSpeed * dt,
        config.minRestLength,
        config.maxRestLength,
      );
    }

    const m = metrics(model);
    let ax = 0;
    let ay = 0;

    if (m.stretch > 0) {
      const tension = config.springK * m.stretch + config.radialDamping * m.radialVelocity;
      ax -= tension * m.ux;
      ay -= tension * m.uy;
    }

    ax -= model.vx * config.airDamping;
    ay -= model.vy * config.airDamping;
    model.vx += ax * dt;
    model.vy += ay * dt;
    model.x += model.vx * dt;
    model.y += model.vy * dt;
  }

  function update(dt) {
    if (!state.running || state.paused) return;
    state.time += dt;
    const mode = inputMode();
    const beforeRestLength = state.restLength;
    integrate(state, dt, mode);
    const m = metrics();
    state.trail.push({ x: state.x, y: state.y, mode, speed: Math.abs(m.tangentialVelocity) });
    if (state.trail.length > config.trailLimit) state.trail.shift();
    if (mode !== 0 && Math.abs(state.restLength - beforeRestLength) > 0.3) {
      state.pulses.push({ r: state.restLength, life: 0.22, mode });
    }
    updatePulses(dt);
  }

  function updatePulses(dt) {
    for (const pulse of state.pulses) pulse.life -= dt;
    state.pulses = state.pulses.filter((pulse) => pulse.life > 0);
  }

  function prediction() {
    const ghost = {
      x: state.x,
      y: state.y,
      vx: state.vx,
      vy: state.vy,
      restLength: state.restLength,
    };
    const dots = [];
    for (let i = 0; i < config.predictionSteps; i += 1) {
      integrate(ghost, config.fixedDt, 0);
      if (i % config.predictionStride === 0) dots.push({ x: ghost.x, y: ghost.y });
    }
    return dots;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSpace();
    drawRings();
    drawPrediction();
    drawTrail();
    drawCord();
    drawPulses();
    drawBead();
    drawHud();
  }

  function drawSpace() {
    ctx.fillStyle = "#091012";
    ctx.fillRect(0, 0, W, H);
    for (const star of state.stars) {
      ctx.globalAlpha = star.a;
      ctx.fillStyle = "#f4f2ea";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawRings() {
    ctx.strokeStyle = "rgba(244,242,234,0.08)";
    ctx.lineWidth = 1;
    for (const r of [config.minRestLength, initial.restLength, config.maxRestLength]) {
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#f0c85a";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#091012";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPrediction() {
    ctx.fillStyle = "rgba(240,200,90,0.32)";
    for (const dot of prediction()) {
      ctx.fillRect(dot.x - 1.5, dot.y - 1.5, 3, 3);
    }
  }

  function drawTrail() {
    for (let i = 0; i < state.trail.length; i += 1) {
      const p = state.trail[i];
      const alpha = (i + 1) / state.trail.length;
      ctx.globalAlpha = alpha * 0.58;
      ctx.fillStyle = p.mode < 0 ? "#f0c85a" : p.mode > 0 ? "#68c7d8" : "#f4f2ea";
      const size = 1.5 + clamp(p.speed / 260, 0, 1.4);
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  function drawCord() {
    const mode = inputMode();
    const m = metrics();
    ctx.strokeStyle = mode < 0 ? "rgba(240,200,90,0.84)" : mode > 0 ? "rgba(104,199,216,0.78)" : "rgba(244,242,234,0.46)";
    ctx.lineWidth = 2 + clamp(m.stretch / 45, 0, 2.4);
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(state.x, state.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(240,200,90,0.34)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center.x, center.y, state.restLength, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawPulses() {
    for (const pulse of state.pulses) {
      ctx.globalAlpha = clamp(pulse.life / 0.22, 0, 1) * 0.28;
      ctx.strokeStyle = pulse.mode < 0 ? "#f0c85a" : "#68c7d8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(center.x, center.y, pulse.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawBead() {
    ctx.fillStyle = "#f4f2ea";
    ctx.beginPath();
    ctx.arc(state.x, state.y, config.beadRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#091012";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawHud() {
    const mode = inputMode();
    const m = metrics();
    const action = mode < 0 ? "巻く: 自然長を短くする" : mode > 0 ? "ゆるめる: 自然長を長くする" : "慣性で流れる";
    ctx.fillStyle = "rgba(5,7,8,0.76)";
    ctx.fillRect(16, 16, 560, 124);
    ctx.fillStyle = "#f4f2ea";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText("Tide Loom v002: Elastic Feel Lab", 30, 44);
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText(`距離 ${Math.round(m.radius)}   自然長 ${Math.round(state.restLength)}   張り ${Math.round(m.stretch)}`, 30, 74);
    ctx.fillText(`半径方向 ${Math.round(m.radialVelocity)}   接線方向 ${Math.round(m.tangentialVelocity)}`, 30, 98);
    ctx.fillStyle = mode < 0 ? "#f0c85a" : mode > 0 ? "#68c7d8" : "#aab2aa";
    ctx.fillText(action, 30, 122);
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
    if (event.key.toLowerCase() === "r") resetGame();
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

  window.__tideLoomV2 = {
    snapshot() {
      const m = metrics();
      return {
        running: state.running,
        paused: state.paused,
        time: Math.round(state.time * 100) / 100,
        radius: Math.round(m.radius * 100) / 100,
        restLength: Math.round(state.restLength * 100) / 100,
        stretch: Math.round(m.stretch * 100) / 100,
        radialVelocity: Math.round(m.radialVelocity * 100) / 100,
        tangentialVelocity: Math.round(m.tangentialVelocity * 100) / 100,
        angularVelocity: Math.round(m.angularVelocity * 1000) / 1000,
        trailCount: state.trail.length,
        predictionCount: prediction().length,
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
