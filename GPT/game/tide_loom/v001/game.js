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
    minRope: 120,
    maxRope: 330,
    reelSpeed: 105,
    spring: 3.2,
    damping: 0.045,
    predictionSteps: 720,
    predictionStride: 6,
    beadRadius: 12,
    noteRadius: 18,
    harborRadius: 24,
  };

  const notes = [
    { angle: -0.95, radius: 190 },
    { angle: 0.35, radius: 286 },
    { angle: 1.42, radius: 220 },
    { angle: 2.55, radius: 310 },
    { angle: -2.45, radius: 250 },
  ];
  const harbor = { angle: -1.62, radius: 235 };

  const state = {
    running: false,
    paused: false,
    complete: false,
    time: 0,
    lastTime: 0,
    accumulator: 0,
    ropeTarget: 230,
    message: "",
    messageTimer: 0,
    ripples: [],
    stars: [],
    collected: new Set(),
    bead: { x: 0, y: 0, vx: 0, vy: 0 },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function pointOnRing(item) {
    return {
      x: center.x + Math.cos(item.angle) * item.radius,
      y: center.y + Math.sin(item.angle) * item.radius,
    };
  }

  function resetBead() {
    state.ropeTarget = 230;
    state.bead.x = center.x + state.ropeTarget;
    state.bead.y = center.y;
    state.bead.vx = 0;
    state.bead.vy = -126;
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    state.complete = false;
    state.time = 0;
    state.accumulator = 0;
    state.ripples = [];
    state.collected = new Set();
    state.message = "";
    state.messageTimer = 0;
    makeStars();
    resetBead();
    showOverlay("糸を巻く、ゆるめる。振り子の軌道で音符を拾い、港へ戻る。", "開始");
    draw();
  }

  function failGame(message) {
    state.running = false;
    state.paused = false;
    state.complete = false;
    state.time = 0;
    state.ripples = [];
    state.collected = new Set();
    resetBead();
    showOverlay(message, "再挑戦");
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
    if (state.complete) resetGame();
  }

  function makeStars() {
    state.stars = [];
    for (let i = 0; i < 120; i += 1) {
      state.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.5 + Math.random() * 1.3,
        a: 0.2 + Math.random() * 0.55,
      });
    }
  }

  function inputMode() {
    if (keys.has(" ") || keys.has("ArrowUp")) return -1;
    if (keys.has("Shift") || keys.has("ArrowDown")) return 1;
    return 0;
  }

  function radiusOf(bead = state.bead) {
    return Math.hypot(bead.x - center.x, bead.y - center.y);
  }

  function speedOf(bead = state.bead) {
    return Math.hypot(bead.vx, bead.vy);
  }

  function isOffscreen(bead = state.bead) {
    return bead.x < 0 || bead.x > W || bead.y < 0 || bead.y > H;
  }

  function integrate(bead, dt, ropeTarget = state.ropeTarget) {
    const dx = bead.x - center.x;
    const dy = bead.y - center.y;
    const r = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / r;
    const uy = dy / r;
    const stretch = ropeTarget - r;
    let ax = ux * stretch * config.spring;
    let ay = uy * stretch * config.spring;
    ax -= bead.vx * config.damping;
    ay -= bead.vy * config.damping;
    bead.vx += ax * dt;
    bead.vy += ay * dt;
    bead.x += bead.vx * dt;
    bead.y += bead.vy * dt;
  }

  function updateInput(dt) {
    const mode = inputMode();
    if (mode === 0) return;
    state.ropeTarget = clamp(
      state.ropeTarget + mode * config.reelSpeed * dt,
      config.minRope,
      config.maxRope,
    );
  }

  function update(dt) {
    if (!state.running || state.paused || state.complete) return;
    state.time += dt;
    updateInput(dt);
    integrate(state.bead, dt);
    updateRipples(dt);
    state.messageTimer = Math.max(0, state.messageTimer - dt);

    if (isOffscreen()) {
      failGame("画面外へ出ました。最初からやり直し。");
      return;
    }

    for (let i = 0; i < notes.length; i += 1) {
      if (state.collected.has(i)) continue;
      const p = pointOnRing(notes[i]);
      if (Math.hypot(state.bead.x - p.x, state.bead.y - p.y) <= config.noteRadius + config.beadRadius) {
        state.collected.add(i);
        state.ripples.push({ x: p.x, y: p.y, r: 12, life: 0.8, color: "#68c7d8" });
        state.message = `音符 ${state.collected.size}/${notes.length}`;
        state.messageTimer = 1.2;
      }
    }

    if (state.collected.size === notes.length) {
      const p = pointOnRing(harbor);
      if (Math.hypot(state.bead.x - p.x, state.bead.y - p.y) <= config.harborRadius + config.beadRadius) {
        state.complete = true;
        state.message = "港へ帰還。";
        state.messageTimer = 99;
        showOverlay("すべての音符を拾い、港へ戻りました。", "再挑戦");
      }
    }
  }

  function updateRipples(dt) {
    for (const ripple of state.ripples) {
      ripple.r += 72 * dt;
      ripple.life -= dt;
    }
    state.ripples = state.ripples.filter((ripple) => ripple.life > 0);
  }

  function prediction() {
    const ghost = { ...state.bead };
    const dots = [];
    for (let i = 0; i < config.predictionSteps; i += 1) {
      integrate(ghost, config.fixedDt, state.ropeTarget);
      if (i % config.predictionStride === 0) dots.push({ x: ghost.x, y: ghost.y });
      if (isOffscreen(ghost)) break;
    }
    return dots;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSpace();
    drawGuides();
    drawPrediction();
    drawTargets();
    drawRipples();
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

  function drawGuides() {
    ctx.strokeStyle = "rgba(240,200,90,0.24)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, state.ropeTarget, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(244,242,234,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(state.bead.x, state.bead.y);
    ctx.stroke();

    ctx.fillStyle = "#f0c85a";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0b1112";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPrediction() {
    const dots = prediction();
    ctx.fillStyle = "rgba(240,200,90,0.42)";
    for (const dot of dots) {
      ctx.fillRect(dot.x - 1.5, dot.y - 1.5, 3, 3);
    }
  }

  function drawTargets() {
    for (let i = 0; i < notes.length; i += 1) {
      if (state.collected.has(i)) continue;
      const p = pointOnRing(notes[i]);
      ctx.fillStyle = "#68c7d8";
      ctx.beginPath();
      ctx.arc(p.x, p.y, config.noteRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#071012";
      ctx.font = "700 16px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("♪", p.x, p.y + 6);
      ctx.textAlign = "left";
    }

    if (state.collected.size === notes.length) {
      const p = pointOnRing(harbor);
      ctx.fillStyle = "#74d680";
      ctx.beginPath();
      ctx.arc(p.x, p.y, config.harborRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#071012";
      ctx.font = "700 14px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("港", p.x, p.y + 5);
      ctx.textAlign = "left";
    }
  }

  function drawRipples() {
    for (const ripple of state.ripples) {
      ctx.globalAlpha = clamp(ripple.life, 0, 1);
      ctx.strokeStyle = ripple.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawBead() {
    ctx.fillStyle = "#f4f2ea";
    ctx.beginPath();
    ctx.arc(state.bead.x, state.bead.y, config.beadRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0b1112";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawHud() {
    const mode = inputMode();
    const action = mode < 0 ? "巻き取り" : mode > 0 ? "ゆるめ" : "慣性";
    ctx.fillStyle = "rgba(5,7,8,0.76)";
    ctx.fillRect(16, 16, 500, 126);
    ctx.fillStyle = "#f4f2ea";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText("Tide Loom v001", 30, 44);
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText(`音符 ${state.collected.size}/${notes.length}   ${state.collected.size === notes.length ? "港へ戻る" : "音符を拾う"}`, 30, 72);
    ctx.fillText(`糸 ${Math.round(radiusOf())} / 目標 ${Math.round(state.ropeTarget)}   速度 ${Math.round(speedOf())}`, 30, 98);
    ctx.fillStyle = mode === 0 ? "#aab2aa" : mode < 0 ? "#f0c85a" : "#68c7d8";
    ctx.fillText(action, 30, 124);

    if (state.messageTimer > 0) {
      ctx.fillStyle = "rgba(5,7,8,0.74)";
      ctx.fillRect(580, H - 68, 260, 40);
      ctx.fillStyle = "#f4f2ea";
      ctx.font = "16px Segoe UI, sans-serif";
      ctx.fillText(state.message, 596, H - 43);
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

  window.__tideLoomV1 = {
    snapshot() {
      return {
        running: state.running,
        paused: state.paused,
        complete: state.complete,
        time: Math.round(state.time * 100) / 100,
        collected: state.collected.size,
        ropeTarget: Math.round(state.ropeTarget * 100) / 100,
        radius: Math.round(radiusOf() * 100) / 100,
        speed: Math.round(speedOf() * 100) / 100,
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
    forceCollectAll() {
      for (let i = 0; i < notes.length; i += 1) state.collected.add(i);
    },
    forceAtHarbor() {
      const p = pointOnRing(harbor);
      state.bead.x = p.x;
      state.bead.y = p.y;
      state.bead.vx = 0;
      state.bead.vy = 0;
      update(config.fixedDt);
    },
    forceOffscreen() {
      state.bead.x = -20;
      state.bead.y = center.y;
      update(config.fixedDt);
    },
    reset: resetGame,
  };

  resetGame();
})();
