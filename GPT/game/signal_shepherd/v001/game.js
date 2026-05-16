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
    beaconSpeed: 255,
    attract: 118,
    repel: 92,
    damping: 0.992,
    moteRadius: 11,
    beaconRadius: 16,
    gateRadius: 34,
    hazardRadius: 36,
    predictionSteps: 120,
    predictionStride: 6,
  };

  const gates = [
    { x: 118, y: 108, color: "#69c8ff", label: "A" },
    { x: 842, y: 108, color: "#ffcf5a", label: "B" },
    { x: 480, y: 616, color: "#ff7a90", label: "C" },
  ];

  const hazards = [
    { x: 300, y: 302 },
    { x: 660, y: 360 },
    { x: 480, y: 218 },
  ];

  const initialMotes = [
    { x: 278, y: 534, vx: 52, vy: -34, gate: 0 },
    { x: 688, y: 528, vx: -44, vy: -28, gate: 1 },
    { x: 480, y: 126, vx: 32, vy: 58, gate: 2 },
  ];

  const state = {
    running: false,
    complete: false,
    failed: false,
    time: 0,
    lastTime: 0,
    accumulator: 0,
    polarity: 1,
    score: 0,
    message: "",
    messageTimer: 0,
    beacon: { x: W / 2, y: H / 2 },
    motes: [],
    delivered: new Set(),
  };

  function cloneMote(mote) {
    return { x: mote.x, y: mote.y, vx: mote.vx, vy: mote.vy, gate: mote.gate };
  }

  function resetGame() {
    state.running = false;
    state.complete = false;
    state.failed = false;
    state.time = 0;
    state.accumulator = 0;
    state.polarity = 1;
    state.score = 0;
    state.message = "";
    state.messageTimer = 0;
    state.beacon.x = W / 2;
    state.beacon.y = H / 2;
    state.motes = initialMotes.map(cloneMote);
    state.delivered = new Set();
    showOverlay("ビーコンを動かし、極性を切り替えて信号粒を同じ色のゲートへ導く。", "開始");
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
    if (state.complete || state.failed) resetGame();
    state.running = true;
    hideOverlay();
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function moveBeacon(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
    if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("s")) dy += 1;
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      state.beacon.x = clamp(state.beacon.x + (dx / len) * config.beaconSpeed * dt, 36, W - 36);
      state.beacon.y = clamp(state.beacon.y + (dy / len) * config.beaconSpeed * dt, 36, H - 36);
    }
  }

  function fieldAccel(mote, beacon = state.beacon, polarity = state.polarity) {
    const dx = beacon.x - mote.x;
    const dy = beacon.y - mote.y;
    const distSq = Math.max(1600, dx * dx + dy * dy);
    const dist = Math.sqrt(distSq);
    const strength = (polarity > 0 ? config.attract : -config.repel) * (90000 / distSq);
    return { ax: (dx / dist) * strength, ay: (dy / dist) * strength };
  }

  function stepMote(mote, dt, beacon = state.beacon, polarity = state.polarity) {
    const a = fieldAccel(mote, beacon, polarity);
    mote.vx = (mote.vx + a.ax * dt) * config.damping;
    mote.vy = (mote.vy + a.ay * dt) * config.damping;
    mote.x += mote.vx * dt;
    mote.y += mote.vy * dt;

    if (mote.x < config.moteRadius || mote.x > W - config.moteRadius) {
      mote.vx *= -0.88;
      mote.x = clamp(mote.x, config.moteRadius, W - config.moteRadius);
    }
    if (mote.y < config.moteRadius || mote.y > H - config.moteRadius) {
      mote.vy *= -0.88;
      mote.y = clamp(mote.y, config.moteRadius, H - config.moteRadius);
    }
  }

  function update(dt) {
    if (!state.running || state.complete || state.failed) return;
    state.time += dt;
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    moveBeacon(dt);

    for (let i = 0; i < state.motes.length; i += 1) {
      if (state.delivered.has(i)) continue;
      const mote = state.motes[i];
      stepMote(mote, dt);

      for (const hazard of hazards) {
        if (Math.hypot(mote.x - hazard.x, mote.y - hazard.y) < config.hazardRadius + config.moteRadius) {
          state.failed = true;
          state.running = false;
          showOverlay("信号粒がノイズに落ちた。ビーコン位置と極性の切り替えを見直す。", "再挑戦");
          return;
        }
      }

      const gate = gates[mote.gate];
      if (Math.hypot(mote.x - gate.x, mote.y - gate.y) < config.gateRadius) {
        state.delivered.add(i);
        state.score += 1;
        state.message = `配送 ${state.score}/${state.motes.length}`;
        state.messageTimer = 1.2;
      }
    }

    if (state.delivered.size === state.motes.length) {
      state.complete = true;
      state.running = false;
      showOverlay(`全信号を配送。時間 ${state.time.toFixed(1)} 秒。`, "再挑戦");
    }
  }

  function predictionFor(mote) {
    const ghost = cloneMote(mote);
    const points = [];
    for (let i = 0; i < config.predictionSteps; i += 1) {
      stepMote(ghost, config.fixedDt, state.beacon, state.polarity);
      if (i % config.predictionStride === 0) points.push({ x: ghost.x, y: ghost.y });
    }
    return points;
  }

  function drawCircle(x, y, r, color, stroke = false) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (stroke) {
      ctx.strokeStyle = color;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#151820";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#29303b";
    ctx.lineWidth = 1;
    for (let x = 60; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 60; y < H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    for (const hazard of hazards) {
      drawCircle(hazard.x, hazard.y, config.hazardRadius, "#3a2430");
      drawCircle(hazard.x, hazard.y, config.hazardRadius + 7, "#ff4f76", true);
    }

    ctx.font = "18px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    for (const gate of gates) {
      ctx.lineWidth = 4;
      drawCircle(gate.x, gate.y, config.gateRadius, gate.color, true);
      ctx.fillStyle = gate.color;
      ctx.fillText(gate.label, gate.x, gate.y + 6);
    }

    for (let i = 0; i < state.motes.length; i += 1) {
      if (state.delivered.has(i)) continue;
      const mote = state.motes[i];
      const gate = gates[mote.gate];
      const points = predictionFor(mote);
      ctx.strokeStyle = gate.color;
      ctx.globalAlpha = 0.38;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let j = 0; j < points.length; j += 1) {
        const p = points[j];
        if (j === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      drawCircle(mote.x, mote.y, config.moteRadius, gate.color);
    }

    ctx.lineWidth = 3;
    drawCircle(state.beacon.x, state.beacon.y, config.beaconRadius, state.polarity > 0 ? "#f2e07a" : "#9fe0ff");
    drawCircle(state.beacon.x, state.beacon.y, 82, state.polarity > 0 ? "#f2e07a" : "#9fe0ff", true);

    ctx.textAlign = "left";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillStyle = "#f3f0e8";
    ctx.fillText(`WASD/矢印: 移動  Space: 極性 ${state.polarity > 0 ? "引く" : "押す"}  R: リセット`, 28, 34);
    ctx.fillText(`配送 ${state.score}/${state.motes.length}  時間 ${state.time.toFixed(1)}`, 28, 64);
    if (state.messageTimer > 0) ctx.fillText(state.message, 28, 94);
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
    if (event.key === " ") state.polarity *= -1;
    if (event.key.toLowerCase() === "r") resetGame();
    keys.add(event.key.toLowerCase());
    keys.add(event.key);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
    keys.delete(event.key);
  });

  startButton.addEventListener("click", start);
  canvas.addEventListener("pointerdown", start);

  window.__signalShepherdV1 = {
    snapshot() {
      return {
        running: state.running,
        complete: state.complete,
        failed: state.failed,
        time: Math.round(state.time * 100) / 100,
        polarity: state.polarity,
        score: state.score,
        beacon: { x: Math.round(state.beacon.x), y: Math.round(state.beacon.y) },
        activeMotes: state.motes.length - state.delivered.size,
        predictionCount: predictionFor(state.motes.find((_, i) => !state.delivered.has(i)) || state.motes[0]).length,
      };
    },
    setKey(key, down) {
      if (down) keys.add(key);
      else keys.delete(key);
    },
    flip() {
      state.polarity *= -1;
    },
    start,
    step(frames = 1) {
      for (let i = 0; i < frames; i += 1) update(config.fixedDt);
    },
    forceDeliverAll() {
      for (let i = 0; i < state.motes.length; i += 1) state.delivered.add(i);
      state.score = state.motes.length;
      update(config.fixedDt);
    },
    forceMoteToGate(index = 0) {
      const mote = state.motes[index];
      const gate = gates[mote.gate];
      mote.x = gate.x;
      mote.y = gate.y;
      mote.vx = 0;
      mote.vy = 0;
      update(config.fixedDt);
    },
    forceMoteToHazard(index = 0) {
      const mote = state.motes[index];
      mote.x = hazards[0].x;
      mote.y = hazards[0].y;
      mote.vx = 0;
      mote.vy = 0;
      update(config.fixedDt);
    },
    reset: resetGame,
  };

  resetGame();
})();
