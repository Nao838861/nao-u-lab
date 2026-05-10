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
    minRadius: 46,
    maxRadius: 410,
    thrust: 34,
    thrustRampTime: 0.45,
    fixedDt: 1 / 120,
    predictionSteps: 760,
    predictionStride: 6,
  };

  const lessons = [
    {
      title: "1 慣性を見る",
      goal: "何も押さず、数秒間だけ予測線どおりに青いゲートへ進む。",
      startRadius: 190,
      gateHalfWidth: 26,
      gateHalfAngle: 0.42,
      gates: [{ radius: 190, angle: 2.65, color: "#69b9ff", label: "1" }],
    },
    {
      title: "2 外へ上げる",
      goal: "順行噴射で軌道を外へ広げ、黄色いゲートへ入る。",
      startRadius: 150,
      gateHalfWidth: 22,
      gateHalfAngle: 0.4,
      gates: [{ radius: 228, angle: 1.05, color: "#f0c85a", label: "2" }],
    },
    {
      title: "3 内へ下げる",
      goal: "逆行噴射で軌道を内へ下げ、緑のゲートへ入る。",
      startRadius: 220,
      gateHalfWidth: 22,
      gateHalfAngle: 0.4,
      gates: [{ radius: 150, angle: 2.75, color: "#74d680", label: "3" }],
    },
    {
      title: "4 つなぐ",
      goal: "内外のゲートを順番に通過する。",
      startRadius: 168,
      gateHalfWidth: 18,
      gateHalfAngle: 0.34,
      gates: [
        { radius: 196, angle: -0.45, color: "#69b9ff", label: "A" },
        { radius: 250, angle: 1.18, color: "#f0c85a", label: "B" },
        { radius: 182, angle: 2.78, color: "#74d680", label: "C" },
      ],
    },
  ];

  const state = {
    running: false,
    paused: false,
    complete: false,
    lessonIndex: 0,
    gateIndex: 0,
    lastTime: 0,
    accumulator: 0,
    thrustMode: 0,
    thrustPower: 0,
    message: "",
    messageTimer: 0,
    lessonAdvanceTimer: 0,
    stars: [],
    ripples: [],
    ship: { x: 0, y: 0, vx: 0, vy: 0 },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lesson() {
    return lessons[Math.min(state.lessonIndex, lessons.length - 1)];
  }

  function currentGate() {
    return lesson().gates[state.gateIndex];
  }

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

  function placeShip(radius) {
    state.ship.x = center.x;
    state.ship.y = center.y - radius;
    state.ship.vx = Math.sqrt(config.mu / radius);
    state.ship.vy = 0;
  }

  function resetLesson(message = "") {
    const l = lesson();
    state.gateIndex = 0;
    state.thrustMode = 0;
    state.thrustPower = 0;
    state.lessonAdvanceTimer = 0;
    placeShip(l.startRadius);
    state.message = message || l.goal;
    state.messageTimer = 2.5;
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    state.complete = false;
    state.lessonIndex = 0;
    state.gateIndex = 0;
    state.ripples = [];
    makeStars();
    resetLesson();
    showOverlay("4つのレッスンで、慣性、順行噴射、逆行噴射、連続ゲート通過を覚える。", "開始");
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
      state.complete = false;
      state.lessonIndex = 0;
      state.gateIndex = 0;
      state.ripples = [];
      resetLesson();
      hideOverlay();
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

  function angleOf(ship = state.ship) {
    return Math.atan2(ship.y - center.y, ship.x - center.x);
  }

  function angleDelta(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function unitVelocity(ship = state.ship) {
    const speed = Math.max(1, speedOf(ship));
    return { x: ship.vx / speed, y: ship.vy / speed };
  }

  function integrate(ship, dt, thrust = 0) {
    const dx = ship.x - center.x;
    const dy = ship.y - center.y;
    const r2 = Math.max(900, dx * dx + dy * dy);
    const r = Math.sqrt(r2);
    const grav = -config.mu / (r2 * r);
    let ax = dx * grav;
    let ay = dy * grav;

    if (thrust !== 0) {
      const u = unitVelocity(ship);
      ax += u.x * config.thrust * thrust;
      ay += u.y * config.thrust * thrust;
    }

    ship.vx += ax * dt;
    ship.vy += ay * dt;
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
  }

  function currentInputMode() {
    if (keys.has(" ") || keys.has("ArrowUp")) return 1;
    if (keys.has("Shift") || keys.has("ArrowDown")) return -1;
    return 0;
  }

  function updateThrust(dt) {
    const inputMode = currentInputMode();
    if (inputMode === 0) {
      state.thrustMode = 0;
      state.thrustPower = 0;
      return;
    }
    if (state.thrustMode !== inputMode) {
      state.thrustMode = inputMode;
      state.thrustPower = 0;
    }
    state.thrustPower = clamp(state.thrustPower + dt / config.thrustRampTime, 0, 1);
  }

  function currentThrust() {
    return state.thrustMode * state.thrustPower;
  }

  function gateHit(ship, gate = currentGate(), l = lesson()) {
    if (!gate) return false;
    const radiusOk = Math.abs(radiusOf(ship) - gate.radius) <= l.gateHalfWidth;
    const angleOk = Math.abs(angleDelta(angleOf(ship), gate.angle)) <= l.gateHalfAngle;
    return radiusOk && angleOk;
  }

  function passGate() {
    const gate = currentGate();
    const gx = center.x + Math.cos(gate.angle) * gate.radius;
    const gy = center.y + Math.sin(gate.angle) * gate.radius;
    state.ripples.push({ x: gx, y: gy, r: 12, life: 0.8, color: gate.color });
    state.gateIndex += 1;

    if (state.gateIndex >= lesson().gates.length) {
      state.message = `${lesson().title} 完了`;
      state.messageTimer = 1.2;
      state.lessonAdvanceTimer = 0.95;
      return;
    }

    state.message = `次のゲートへ。`;
    state.messageTimer = 1.4;
  }

  function advanceLesson() {
    state.lessonAdvanceTimer = 0;
    state.lessonIndex += 1;
    if (state.lessonIndex >= lessons.length) {
      state.complete = true;
      state.message = "全レッスン完了。";
      state.messageTimer = 99;
      showOverlay("全レッスン完了。軌道操作の基本を通過しました。", "再挑戦");
      return;
    }
    resetLesson(`${lesson().title}: ${lesson().goal}`);
  }

  function update(dt) {
    if (!state.running || state.paused || state.complete) return;

    if (state.lessonAdvanceTimer > 0) {
      state.lessonAdvanceTimer -= dt;
      if (state.lessonAdvanceTimer <= 0) advanceLesson();
      updateRipples(dt);
      return;
    }

    updateThrust(dt);
    integrate(state.ship, dt, currentThrust());
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    updateRipples(dt);

    const radius = radiusOf();
    if (radius < config.minRadius) {
      resetLesson("低すぎるため再投入。");
      return;
    }
    if (radius > config.maxRadius) {
      resetLesson("高すぎるため再投入。");
      return;
    }

    if (gateHit(state.ship)) passGate();
  }

  function updateRipples(dt) {
    for (const ripple of state.ripples) {
      ripple.r += 80 * dt;
      ripple.life -= dt;
    }
    state.ripples = state.ripples.filter((ripple) => ripple.life > 0);
  }

  function prediction() {
    if (state.complete) return [];
    const ghost = { ...state.ship };
    const dots = [];
    for (let i = 0; i < config.predictionSteps; i += 1) {
      integrate(ghost, config.fixedDt, 0);
      if (i % config.predictionStride === 0) {
        dots.push({ x: ghost.x, y: ghost.y, hit: gateHit(ghost) });
      }
      const r = radiusOf(ghost);
      if (r < config.minRadius * 0.8 || r > config.maxRadius * 1.12) break;
    }
    return dots;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSpace();
    drawOrbitGuides();
    drawGates();
    drawPrediction();
    drawRipples();
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

  function drawOrbitGuides() {
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 1;
    for (const gate of lesson().gates) {
      ctx.beginPath();
      ctx.arc(center.x, center.y, gate.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(center.x - 10, center.y - 12, 4, center.x, center.y, config.planetRadius);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.35, "#69b9ff");
    grad.addColorStop(1, "#16314a");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center.x, center.y, config.planetRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGates() {
    const l = lesson();
    for (let i = 0; i < l.gates.length; i += 1) {
      const gate = l.gates[i];
      const active = i === state.gateIndex && state.lessonAdvanceTimer <= 0;
      const done = i < state.gateIndex;
      const start = gate.angle - l.gateHalfAngle;
      const end = gate.angle + l.gateHalfAngle;
      ctx.strokeStyle = done ? "rgba(242,244,243,0.42)" : active ? gate.color : "rgba(170,180,177,0.22)";
      ctx.lineWidth = active ? l.gateHalfWidth * 2 : 10;
      ctx.beginPath();
      ctx.arc(center.x, center.y, gate.radius, start, end);
      ctx.stroke();

      const lx = center.x + Math.cos(gate.angle) * gate.radius;
      const ly = center.y + Math.sin(gate.angle) * gate.radius;
      ctx.fillStyle = active ? "#f2f4f3" : done ? "rgba(242,244,243,0.6)" : "rgba(170,180,177,0.45)";
      ctx.font = "700 16px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(done ? "OK" : gate.label, lx, ly + 5);
      ctx.textAlign = "left";
    }
  }

  function drawPrediction() {
    const dots = prediction();
    for (const dot of dots) {
      if (dot.x < -20 || dot.x > W + 20 || dot.y < -20 || dot.y > H + 20) continue;
      ctx.fillStyle = dot.hit ? "rgba(105,185,255,0.95)" : "rgba(240,200,90,0.38)";
      ctx.fillRect(dot.x - 1.5, dot.y - 1.5, 3, 3);
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

  function drawShip() {
    const angle = Math.atan2(state.ship.vy, state.ship.vx);
    const thrustMode = state.thrustMode;
    const thrustPower = state.thrustPower;
    ctx.save();
    ctx.translate(state.ship.x, state.ship.y);
    ctx.rotate(angle);
    ctx.fillStyle = thrustPower === 0 ? "#f2f4f3" : "#f0c85a";
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-9, -8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-9, 8);
    ctx.closePath();
    ctx.fill();
    if (thrustPower > 0) {
      const flame = 10 + thrustPower * 22;
      const flameHalf = 2 + thrustPower * 4;
      ctx.fillStyle = thrustMode > 0 ? "#69b9ff" : "#ff6f7a";
      ctx.beginPath();
      ctx.moveTo(-9, -flameHalf);
      ctx.lineTo(-9 - flame, 0);
      ctx.lineTo(-9, flameHalf);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawHud() {
    const radius = radiusOf();
    const speed = speedOf();
    const thrustMode = state.thrustMode;
    const thrustPower = state.thrustPower;
    const gate = currentGate() || lesson().gates[lesson().gates.length - 1];
    const radialError = gate ? Math.round(radius - gate.radius) : 0;
    const thrustText = thrustPower > 0 ? (thrustMode > 0 ? "順行噴射" : "逆行噴射") : "慣性飛行";

    ctx.fillStyle = "rgba(5,7,9,0.76)";
    ctx.fillRect(14, 14, 520, 142);
    ctx.fillStyle = "#f2f4f3";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText(`Gravity Courier v003: ${lesson().title}`, 28, 42);
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText(lesson().goal, 28, 68);
    ctx.fillText(`ゲート ${Math.min(state.gateIndex + 1, lesson().gates.length)}/${lesson().gates.length}   半径差 ${radialError}`, 28, 93);
    ctx.fillText(`半径 ${Math.round(radius)}   速度 ${Math.round(speed)}`, 28, 116);
    ctx.fillStyle = thrustMode > 0 ? "#69b9ff" : thrustMode < 0 ? "#ff6f7a" : "#aab4b1";
    ctx.fillText(`${thrustText} ${Math.round(thrustPower * 100)}%`, 28, 140);
    ctx.fillStyle = "#172027";
    ctx.fillRect(190, 130, 180, 10);
    ctx.fillStyle = thrustMode > 0 ? "#69b9ff" : thrustMode < 0 ? "#ff6f7a" : "#46505a";
    ctx.fillRect(190, 130, 180 * thrustPower, 10);

    if (state.messageTimer > 0) {
      ctx.fillStyle = "rgba(5,7,9,0.74)";
      ctx.fillRect(302, H - 66, 440, 38);
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
      state.complete = false;
      state.lessonIndex = 0;
      state.gateIndex = 0;
      state.ripples = [];
      resetLesson("最初からやり直し。");
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

  window.__gravityCourierV3 = {
    snapshot() {
      return {
        running: state.running,
        complete: state.complete,
        lessonIndex: state.lessonIndex,
        gateIndex: state.gateIndex,
        radius: Math.round(radiusOf() * 100) / 100,
        speed: Math.round(speedOf() * 100) / 100,
        thrustMode: state.thrustMode,
        thrustPower: Math.round(state.thrustPower * 100) / 100,
        predictionCount: prediction().length,
        predictionHits: prediction().filter((dot) => dot.hit).length,
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
    forceLessonClear() {
      if (!state.complete) {
        state.gateIndex = lesson().gates.length;
        state.lessonAdvanceTimer = 0.01;
        update(config.fixedDt);
      }
    },
    reset: resetGame,
  };

  resetGame();
})();
