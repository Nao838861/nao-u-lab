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
    crashRadius: 38,
    startRadius: 170,
    minRadius: 46,
    thrust: 34,
    thrustRampTime: 0.45,
    fixedDt: 1 / 120,
    predictionSteps: 840,
    predictionStride: 6,
    gateHalfWidth: 22,
    gateHalfAngle: 0.38,
    moonMu: 900_000,
    moonInfluenceEdgeBand: 55,
    moonOrbitTargetAngle: Math.PI * 2,
    moonCrashPadding: 2,
  };

  const objectives = [
    {
      title: "月周回",
      goal: "黄色い月の影響圏に入り、月の周りを360度まわる。",
      radius: 260,
      baseAngle: -2.8,
      angularSpeed: 0.14,
      color: "#f0c85a",
      label: "月",
      shape: "moon",
      hitRadius: 22,
      influenceRadius: 220,
    },
    {
      title: "帰還窓",
      goal: "地球近くの低い帰還窓へ戻る。",
      radius: 108,
      baseAngle: 2.4,
      angularSpeed: 0.24,
      color: "#74d680",
      label: "帰",
    },
  ];

  const state = {
    running: false,
    paused: false,
    complete: false,
    objectiveIndex: 0,
    time: 0,
    lastTime: 0,
    accumulator: 0,
    thrustMode: 0,
    thrustPower: 0,
    message: "",
    messageTimer: 0,
    capture: 0,
    moonOrbitAngle: 0,
    moonOrbitLastAngle: null,
    moonOrbitInside: false,
    stars: [],
    ripples: [],
    ship: { x: 0, y: 0, vx: 0, vy: 0 },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function objective() {
    return objectives[Math.min(state.objectiveIndex, objectives.length - 1)];
  }

  function gateAngle(obj = objective(), time = state.time) {
    return obj.baseAngle + obj.angularSpeed * time;
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

  function placeShip(radius = config.startRadius) {
    state.ship.x = center.x;
    state.ship.y = center.y - radius;
    state.ship.vx = Math.sqrt(config.mu / radius);
    state.ship.vy = 0;
  }

  function resetAttempt(message = "") {
    state.thrustMode = 0;
    state.thrustPower = 0;
    state.capture = 0;
    state.moonOrbitAngle = 0;
    state.moonOrbitLastAngle = null;
    state.moonOrbitInside = false;
    placeShip(config.startRadius);
    state.message = message || objective().goal;
    state.messageTimer = 2.2;
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    state.complete = false;
    state.objectiveIndex = 0;
    state.time = 0;
    state.ripples = [];
    makeStars();
    resetAttempt();
    showOverlay("月の影響圏に入り、月の周りをまわる。", "開始");
    draw();
  }

  function failGame(message) {
    state.running = false;
    state.paused = false;
    state.complete = false;
    state.objectiveIndex = 0;
    state.time = 0;
    state.ripples = [];
    resetAttempt(message);
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
    if (state.complete) {
      state.complete = false;
      state.objectiveIndex = 0;
      state.time = 0;
      state.ripples = [];
      resetAttempt();
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

  function isOffscreen(ship = state.ship) {
    return ship.x < 0 || ship.x > W || ship.y < 0 || ship.y > H;
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

  function moonInfluence(ship = state.ship, time = state.time, obj = objectives[0]) {
    if (!obj || obj.shape !== "moon") return null;
    const pos = gatePosition(obj, time);
    const dx = pos.x - ship.x;
    const dy = pos.y - ship.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    if (distance > obj.influenceRadius) return null;
    const edge = clamp((obj.influenceRadius - distance) / config.moonInfluenceEdgeBand, 0, 1);
    const depth = 1 - distance / obj.influenceRadius;
    return {
      x: dx / distance,
      y: dy / distance,
      distance,
      angle: Math.atan2(ship.y - pos.y, ship.x - pos.x),
      frameBlend: edge,
      strength: edge * (0.72 + 0.28 * depth),
      pos,
    };
  }

  function moonVelocity(obj = objectives[0], time = state.time) {
    const a = gateAngle(obj, time);
    const speed = obj.radius * obj.angularSpeed;
    return {
      x: -Math.sin(a) * speed,
      y: Math.cos(a) * speed,
    };
  }

  function moonRelativeSpeed(ship = state.ship, time = state.time, obj = objectives[0]) {
    if (!obj || obj.shape !== "moon") return 0;
    const moonV = moonVelocity(obj, time);
    return Math.hypot(ship.vx - moonV.x, ship.vy - moonV.y);
  }

  function integrate(ship, dt, thrust = 0, time = state.time) {
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

    const moonPull = moonInfluence(ship, time);
    if (moonPull) {
      const mdx = moonPull.pos.x - center.x;
      const mdy = moonPull.pos.y - center.y;
      const mr2 = Math.max(900, mdx * mdx + mdy * mdy);
      const mr = Math.sqrt(mr2);
      const moonEarthGrav = -config.mu / (mr2 * mr);
      ax -= mdx * moonEarthGrav * moonPull.frameBlend;
      ay -= mdy * moonEarthGrav * moonPull.frameBlend;
      const pull = config.moonMu * moonPull.strength / Math.max(1600, moonPull.distance * moonPull.distance);
      ax += moonPull.x * pull;
      ay += moonPull.y * pull;
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

  function gateHitAt(ship, obj = objective(), time = state.time) {
    if (!obj) return false;
    if (obj.shape === "moon") {
      return Boolean(moonInfluence(ship, time, obj));
    }
    const radiusOk = Math.abs(radiusOf(ship) - obj.radius) <= config.gateHalfWidth;
    const angleOk = Math.abs(angleDelta(angleOf(ship), gateAngle(obj, time))) <= config.gateHalfAngle;
    return radiusOk && angleOk;
  }

  function gatePosition(obj = objective(), time = state.time) {
    const a = gateAngle(obj, time);
    return {
      x: center.x + Math.cos(a) * obj.radius,
      y: center.y + Math.sin(a) * obj.radius,
      angle: a,
    };
  }

  function passObjective() {
    const obj = objective();
    const pos = gatePosition(obj);
    state.ripples.push({ x: pos.x, y: pos.y, r: 12, life: 0.9, color: obj.color });
    state.objectiveIndex += 1;
    state.capture = 0;
    state.moonOrbitAngle = 0;
    state.moonOrbitLastAngle = null;
    state.moonOrbitInside = false;
    if (state.objectiveIndex >= objectives.length) {
      state.complete = true;
      state.message = "帰還成功。";
      state.messageTimer = 99;
      showOverlay("月周回から帰還まで成功しました。", "再挑戦");
      return;
    }
    state.message = `${obj.title} 通過。次は ${objective().title}。`;
    state.messageTimer = 2;
  }

  function updateMoonOrbitProgress() {
    const obj = objective();
    const influence = moonInfluence(state.ship, state.time, obj);
    if (!influence) {
      state.moonOrbitInside = false;
      state.moonOrbitLastAngle = null;
      state.moonOrbitAngle = Math.max(0, state.moonOrbitAngle - config.fixedDt * 1.1);
      return;
    }
    if (influence.distance <= obj.hitRadius + config.moonCrashPadding) {
      failGame("月面に衝突。最初からやり直し。");
      return;
    }
    if (!state.moonOrbitInside || state.moonOrbitLastAngle === null) {
      state.moonOrbitInside = true;
      state.moonOrbitLastAngle = influence.angle;
      return;
    }
    const delta = angleDelta(influence.angle, state.moonOrbitLastAngle);
    state.moonOrbitAngle = clamp(state.moonOrbitAngle + Math.abs(delta), 0, config.moonOrbitTargetAngle);
    state.moonOrbitLastAngle = influence.angle;
    if (state.moonOrbitAngle >= config.moonOrbitTargetAngle) passObjective();
  }

  function update(dt) {
    if (!state.running || state.paused || state.complete) return;
    state.time += dt;
    updateThrust(dt);
    integrate(state.ship, dt, currentThrust(), state.time);
    updateRipples(dt);
    state.messageTimer = Math.max(0, state.messageTimer - dt);

    const radius = radiusOf();
    if (radius < config.crashRadius) {
      failGame("地球に衝突。最初からやり直し。");
      return;
    }
    if (isOffscreen()) {
      failGame("画面外へ出ました。最初からやり直し。");
      return;
    }
    if (objective().shape === "moon") {
      updateMoonOrbitProgress();
    } else if (gateHitAt(state.ship)) {
      passObjective();
    }
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
    let futureTime = state.time;
    for (let i = 0; i < config.predictionSteps; i += 1) {
      integrate(ghost, config.fixedDt, 0, futureTime);
      futureTime += config.fixedDt;
      if (i % config.predictionStride === 0) {
        dots.push({ x: ghost.x, y: ghost.y, hit: gateHitAt(ghost, objective(), futureTime) });
      }
      const r = radiusOf(ghost);
      if (r < config.minRadius * 0.8 || isOffscreen(ghost)) break;
    }
    return dots;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSpace();
    drawOrbitGuides();
    drawObjective();
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
    for (const obj of objectives) {
      ctx.beginPath();
      ctx.arc(center.x, center.y, obj.radius, 0, Math.PI * 2);
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

  function drawObjective() {
    for (let i = 0; i < objectives.length; i += 1) {
      const obj = objectives[i];
      const active = i === state.objectiveIndex;
      const done = i < state.objectiveIndex;
      const a = gateAngle(obj);
      const pos = gatePosition(obj);
      if (obj.shape === "moon") {
        ctx.strokeStyle = active ? "rgba(240,200,90,0.32)" : "rgba(240,200,90,0.12)";
        ctx.lineWidth = active ? 2 : 1;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, obj.influenceRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (obj.shape !== "moon") {
        ctx.strokeStyle = done ? "rgba(242,244,243,0.36)" : active ? obj.color : "rgba(170,180,177,0.18)";
        ctx.lineWidth = active ? config.gateHalfWidth * 2 : 10;
        ctx.beginPath();
        ctx.arc(center.x, center.y, obj.radius, a - config.gateHalfAngle, a + config.gateHalfAngle);
        ctx.stroke();
      }

      ctx.fillStyle = obj.shape === "moon" ? "#f0c85a" : active ? obj.color : done ? "rgba(242,244,243,0.55)" : "rgba(170,180,177,0.35)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, obj.shape === "moon" ? obj.hitRadius : active ? 10 : 7, 0, Math.PI * 2);
      ctx.fill();
      if (obj.shape === "moon" && active) {
        ctx.strokeStyle = "rgba(240,200,90,0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, obj.hitRadius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#081016";
      ctx.font = "700 13px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(done ? "OK" : obj.label, pos.x, pos.y + 4);
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
    const obj = objective();
    const radius = radiusOf();
    const speed = speedOf();
    const thrustMode = state.thrustMode;
    const thrustPower = state.thrustPower;
    const radialError = Math.round(radius - obj.radius);
    const moonOn = Boolean(moonInfluence());
    const moonRel = obj.shape === "moon" ? Math.round(moonRelativeSpeed()) : 0;
    const orbitDegrees = Math.round((state.moonOrbitAngle * 180) / Math.PI);
    const progressText = obj.shape === "moon" ? `周回 ${orbitDegrees}° / 360°` : `半径差 ${radialError}`;
    const thrustText = thrustPower > 0 ? (thrustMode > 0 ? "順行噴射" : "逆行噴射") : "慣性飛行";

    ctx.fillStyle = "rgba(5,7,9,0.76)";
    ctx.fillRect(14, 14, 530, 142);
    ctx.fillStyle = "#f2f4f3";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText(`Gravity Courier v005: ${obj.title}`, 28, 42);
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText(obj.goal, 28, 68);
    ctx.fillText(`目標 ${state.objectiveIndex + 1}/${objectives.length}   ${progressText}`, 28, 93);
    ctx.fillText(`半径 ${Math.round(radius)}   速度 ${Math.round(speed)}${obj.shape === "moon" ? `   月相対 ${moonRel}` : ""}`, 28, 116);
    ctx.fillStyle = thrustMode > 0 ? "#69b9ff" : thrustMode < 0 ? "#ff6f7a" : "#aab4b1";
    ctx.fillText(`${thrustText} ${Math.round(thrustPower * 100)}%`, 28, 140);
    ctx.fillStyle = moonOn ? "#f0c85a" : "#aab4b1";
    ctx.fillText(moonOn ? "月重力 ON" : "月重力 OFF", 390, 140);
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
      state.objectiveIndex = 0;
      state.time = 0;
      state.ripples = [];
      resetAttempt("最初からやり直し。");
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

  window.__gravityCourierV5 = {
    snapshot() {
      return {
        running: state.running,
        complete: state.complete,
        objectiveIndex: state.objectiveIndex,
        time: Math.round(state.time * 100) / 100,
        activeGateAngle: Math.round(gateAngle(objective()) * 1000) / 1000,
        activeShape: objective().shape || "window",
        activeHitRadius: objective().hitRadius || 0,
        moonGravityActive: Boolean(moonInfluence()),
        capture: Math.round(state.capture * 100) / 100,
        moonOrbitDegrees: Math.round((state.moonOrbitAngle * 180) / Math.PI),
        moonRelativeSpeed: Math.round(moonRelativeSpeed() * 100) / 100,
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
    forceObjectiveClear() {
      if (!state.complete) passObjective();
    },
    debugMoonOrbitProbe() {
      const obj = objectives[0];
      const pos = gatePosition(obj);
      const vel = moonVelocity(obj);
      let best = { inInfluence: false, relativeSpeed: 0, sweepDegrees: 0 };
      for (const distance of [44, 54, 66, 82, 104]) {
        for (const speedFactor of [0.72, 0.86, 1, 1.14]) {
          for (const direction of [-1, 1]) {
            const orbitalSpeed = Math.sqrt(config.moonMu / distance) * speedFactor;
            const probe = {
              x: pos.x,
              y: pos.y - distance,
              vx: vel.x + orbitalSpeed * direction,
              vy: vel.y,
            };
            const before = { ...probe };
            let angle = null;
            let sweep = 0;
            for (let i = 0; i < 900; i += 1) {
              integrate(probe, config.fixedDt, 0, state.time + i * config.fixedDt);
              const influence = moonInfluence(probe, state.time + i * config.fixedDt, obj);
              if (!influence) break;
              if (influence.distance <= obj.hitRadius + config.moonCrashPadding) break;
              if (angle !== null) sweep += Math.abs(angleDelta(influence.angle, angle));
              angle = influence.angle;
            }
            const sweepDegrees = Math.round((sweep * 180) / Math.PI);
            if (sweepDegrees > best.sweepDegrees) {
              best = {
                inInfluence: Boolean(moonInfluence(before, state.time, obj)),
                relativeSpeed: Math.round(moonRelativeSpeed(before, state.time, obj) * 100) / 100,
                sweepDegrees,
              };
            }
          }
        }
      }
      return best;
    },
    reset: resetGame,
  };

  resetGame();
})();
