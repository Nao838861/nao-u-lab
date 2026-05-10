(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlayText");
  const missionChoices = document.getElementById("missionChoices");
  const startButton = document.getElementById("startButton");
  const pauseButton = document.getElementById("pauseButton");
  const resetButton = document.getElementById("resetButton");

  const ui = {
    score: document.getElementById("score"),
    day: document.getElementById("day"),
    cargo: document.getElementById("cargo"),
    cargoStrip: document.getElementById("cargoStrip"),
    combo: document.getElementById("combo"),
    comboMeter: document.getElementById("comboMeter"),
    mission: document.getElementById("mission"),
    weather: document.getElementById("weather"),
    hull: document.getElementById("hullMeter"),
  };

  const W = canvas.width;
  const H = canvas.height;
  const COLORS = ["#65b7ff", "#ff6f91", "#f0c85a"];

  const state = {
    running: false,
    paused: false,
    lastTime: 0,
    score: 0,
    day: 1,
    hull: 100,
    delivered: 0,
    target: 3,
    combo: 0,
    comboTimer: 0,
    message: "",
    messageTimer: 0,
    cargo: null,
    planets: [],
    parcels: [],
    stars: [],
    bursts: [],
    ship: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      orbit: 0,
      orbitRadius: 92,
      mode: "orbit",
      rescue: null,
      launchGrace: 0,
    },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function makeStars() {
    state.stars = [];
    for (let i = 0; i < 130; i += 1) {
      state.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.7 + Math.random() * 1.5,
        a: 0.25 + Math.random() * 0.65,
      });
    }
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    state.score = 0;
    state.day = 1;
    state.hull = 100;
    state.delivered = 0;
    state.combo = 0;
    state.comboTimer = 0;
    state.cargo = null;
    makeStars();
    buildStage();
    showOverlay("Press Space to launch. Aim for capture rings and orbit parcels.", "Start");
    updateHud();
    draw();
  }

  function buildStage() {
    const shift = Math.min(44, (state.day - 1) * 8);
    state.target = 2 + Math.ceil(state.day / 2);
    state.planets = [
      { x: 250, y: 315, r: 38, color: COLORS[0], orbitSpeed: 1.16, capture: 86 },
      { x: 710, y: 315 + shift, r: 42, color: COLORS[1], orbitSpeed: 1.28, capture: 90 },
    ];
    if (state.day >= 2) {
      state.planets.push({ x: 480, y: 470 - shift, r: 40, color: COLORS[2], orbitSpeed: 1.08, capture: 96 });
    }
    state.parcels = [];
    state.cargo = null;
    resetShip();
    buildParcels();
    state.message = `Deliver ${state.delivered}/${state.target}`;
    state.messageTimer = 1.8;
  }

  function resetShip() {
    const planet = state.planets[state.ship.orbit] || state.planets[0];
    state.ship.orbit = state.planets.indexOf(planet);
    state.ship.orbitRadius = planet.r + 54;
    state.ship.angle = Math.PI;
    state.ship.mode = "orbit";
    state.ship.rescue = null;
    state.ship.vx = 0;
    state.ship.vy = 0;
    placeShipOnOrbit();
  }

  function buildParcels() {
    for (let i = 0; i < state.target + 3; i += 1) {
      const planet = state.planets[i % state.planets.length];
      const angle = (i / (state.target + 3)) * Math.PI * 2 + 0.45;
      const radius = planet.r + 54;
      state.parcels.push({
        x: planet.x + Math.cos(angle) * radius,
        y: planet.y + Math.sin(angle) * radius,
        color: planet.color,
        taken: false,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function showOverlay(text, buttonText) {
    overlayText.textContent = text;
    startButton.textContent = buttonText;
    missionChoices.innerHTML = "";
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
      launch();
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
      return;
    }
    if (state.paused) {
      togglePause();
      return;
    }
    launch();
  }

  function launch() {
    if (state.ship.mode !== "orbit") return;
    const speed = 285 + state.day * 10;
    const tangent = state.ship.angle + Math.PI / 2;
    state.ship.vx = Math.cos(tangent) * speed;
    state.ship.vy = Math.sin(tangent) * speed;
    state.ship.mode = "free";
    state.ship.launchGrace = 0.42;
  }

  function placeShipOnOrbit() {
    const planet = state.planets[state.ship.orbit];
    state.ship.x = planet.x + Math.cos(state.ship.angle) * state.ship.orbitRadius;
    state.ship.y = planet.y + Math.sin(state.ship.angle) * state.ship.orbitRadius;
  }

  function update(dt) {
    if (!state.running || state.paused) return;
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    if (state.comboTimer === 0) state.combo = 0;
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    updateShip(dt);
    updateBursts(dt);
    collectParcel();
    deliverCargo();
    updateHud();
  }

  function updateShip(dt) {
    if (state.ship.mode === "orbit") {
      const planet = state.planets[state.ship.orbit];
      state.ship.angle += planet.orbitSpeed * dt;
      placeShipOnOrbit();
      return;
    }
    if (state.ship.mode === "rescue") {
      updateRescue(dt);
      return;
    }
    updateFree(dt);
  }

  function updateFree(dt) {
    const ship = state.ship;
    const g = nearestGravity();
    if (g) {
      const pull = 56 * g.strength;
      ship.vx += g.nx * pull * dt;
      ship.vy += g.ny * pull * dt;
    }
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    ship.launchGrace = Math.max(0, ship.launchGrace - dt);

    for (let i = 0; i < state.planets.length; i += 1) {
      if (i === ship.orbit && ship.launchGrace > 0) continue;
      const planet = state.planets[i];
      const d = Math.hypot(ship.x - planet.x, ship.y - planet.y);
      if (d < planet.r + planet.capture) {
        capturePlanet(i);
        return;
      }
    }

    if (ship.x < -45 || ship.x > W + 45 || ship.y < -45 || ship.y > H + 45) {
      beginRescue();
    }
  }

  function nearestGravity() {
    let best = null;
    for (const planet of state.planets) {
      const dx = planet.x - state.ship.x;
      const dy = planet.y - state.ship.y;
      const d = Math.hypot(dx, dy);
      const range = planet.r + planet.capture + 130;
      if (d > range) continue;
      const strength = 1 - d / range;
      if (!best || strength > best.strength) {
        best = { nx: dx / Math.max(1, d), ny: dy / Math.max(1, d), strength };
      }
    }
    return best;
  }

  function capturePlanet(index) {
    const planet = state.planets[index];
    state.ship.orbit = index;
    state.ship.orbitRadius = planet.r + 54;
    state.ship.angle = Math.atan2(state.ship.y - planet.y, state.ship.x - planet.x);
    state.ship.mode = "orbit";
    placeShipOnOrbit();
    spawnBurst(state.ship.x, state.ship.y, planet.color, 12);
  }

  function beginRescue() {
    const target = nearestPlanetIndex();
    const planet = state.planets[target];
    state.ship.mode = "rescue";
    state.ship.rescue = {
      t: 0,
      sx: state.ship.x,
      sy: state.ship.y,
      ex: planet.x,
      ey: planet.y - (planet.r + 54),
      target,
    };
    state.combo = 0;
    state.comboTimer = 0;
    state.hull = Math.max(0, state.hull - 8);
    state.message = "Missed route";
    state.messageTimer = 1.2;
  }

  function nearestPlanetIndex() {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < state.planets.length; i += 1) {
      const d = distance(state.ship, state.planets[i]);
      if (d < bestD) {
        best = i;
        bestD = d;
      }
    }
    return best;
  }

  function updateRescue(dt) {
    const r = state.ship.rescue;
    if (!r) return;
    r.t = Math.min(1, r.t + dt / 0.75);
    const s = r.t * r.t * (3 - 2 * r.t);
    state.ship.x = r.sx + (r.ex - r.sx) * s;
    state.ship.y = r.sy + (r.ey - r.sy) * s;
    if (r.t >= 1) capturePlanet(r.target);
  }

  function collectParcel() {
    if (state.cargo) return;
    for (const parcel of state.parcels) {
      if (parcel.taken) continue;
      if (distance(state.ship, parcel) < 23) {
        parcel.taken = true;
        state.cargo = { color: parcel.color };
        state.score += 20;
        state.message = "Parcel picked up";
        state.messageTimer = 1;
        spawnBurst(parcel.x, parcel.y, parcel.color, 16);
        return;
      }
    }
  }

  function deliverCargo() {
    if (!state.cargo || state.ship.mode !== "orbit") return;
    const planet = state.planets[state.ship.orbit];
    if (planet.color !== state.cargo.color) return;
    state.combo += 1;
    state.comboTimer = 5;
    state.delivered += 1;
    state.score += Math.round(100 * (1 + Math.min(0.75, (state.combo - 1) * 0.15)));
    state.cargo = null;
    state.message = `Delivered ${state.delivered}/${state.target}`;
    state.messageTimer = 1.2;
    spawnBurst(planet.x, planet.y, planet.color, 24);
    if (state.delivered >= state.target) {
      state.score += 150 + state.day * 25;
      state.day += 1;
      state.delivered = 0;
      buildStage();
    }
  }

  function updateBursts(dt) {
    for (const burst of state.bursts) {
      burst.x += burst.vx * dt;
      burst.y += burst.vy * dt;
      burst.life -= dt;
    }
    state.bursts = state.bursts.filter((burst) => burst.life > 0);
  }

  function togglePause() {
    if (!state.running) return;
    state.paused = !state.paused;
    if (state.paused) {
      showOverlay("Paused", "Resume");
    } else {
      hideOverlay();
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function updateHud() {
    ui.score.textContent = String(state.score);
    ui.day.textContent = String(state.day);
    ui.cargo.textContent = state.cargo ? "1/1" : "0/1";
    ui.combo.textContent = state.combo > 1 ? `x${state.combo}` : "-";
    ui.comboMeter.style.width = `${clamp((state.comboTimer / 5) * 100, 0, 100)}%`;
    ui.mission.textContent = `Deliver ${state.delivered}/${state.target}`;
    ui.weather.textContent = "Free launch";
    ui.hull.style.width = `${clamp(state.hull, 0, 100)}%`;
    ui.cargoStrip.innerHTML = "";
    if (state.cargo) {
      const chip = document.createElement("span");
      chip.style.borderColor = state.cargo.color;
      chip.textContent = "parcel";
      ui.cargoStrip.appendChild(chip);
    }
  }

  function snapshot() {
    return {
      running: state.running,
      paused: state.paused,
      score: state.score,
      day: state.day,
      hull: Math.round(state.hull),
      cargo: state.cargo ? 1 : 0,
      combo: state.combo,
      mission: "free",
      weather: "free",
      delivered: state.delivered,
      ship: {
        x: Math.round(state.ship.x * 100) / 100,
        y: Math.round(state.ship.y * 100) / 100,
        vx: Math.round(state.ship.vx * 100) / 100,
        vy: Math.round(state.ship.vy * 100) / 100,
        orbit: state.ship.orbit,
        launchOrbit: state.ship.mode === "free" ? state.ship.orbit : null,
        freeTime: state.ship.mode === "free" ? 1 : 0,
      },
      overlayHidden: overlay.classList.contains("hidden"),
    };
  }

  async function runHeadlessProbe() {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const before = snapshot();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true, cancelable: true }));
    await wait(500);
    const afterSpace = snapshot();
    canvas.dispatchEvent(new PointerEvent("pointerdown", {
      bubbles: true,
      clientX: canvas.getBoundingClientRect().left + canvas.getBoundingClientRect().width / 2,
      clientY: canvas.getBoundingClientRect().top + canvas.getBoundingClientRect().height / 2,
    }));
    await wait(500);
    const afterClick = snapshot();
    const pixel = Array.from(ctx.getImageData(480, 320, 1, 1).data);
    const report = document.createElement("pre");
    report.id = "headless-report";
    report.textContent = JSON.stringify({ before, afterSpace, afterClick, pixel }, null, 2);
    document.body.appendChild(report);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSpace();
    drawPlanets();
    drawPrediction();
    drawParcels();
    drawShip();
    drawBursts();
    drawCanvasHud();
  }

  function drawSpace() {
    ctx.fillStyle = "#0b0f13";
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

  function drawPlanets() {
    const targetColor = state.cargo ? state.cargo.color : null;
    for (const planet of state.planets) {
      ctx.strokeStyle = targetColor === planet.color ? planet.color : "rgba(255,255,255,0.18)";
      ctx.lineWidth = targetColor === planet.color ? 4 : 1;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.r + planet.capture, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.r + 54, 0, Math.PI * 2);
      ctx.stroke();

      const grad = ctx.createRadialGradient(planet.x - 10, planet.y - 12, 4, planet.x, planet.y, planet.r);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.28, planet.color);
      grad.addColorStop(1, "#151a20");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPrediction() {
    if (state.ship.mode !== "orbit") return;
    const tangent = state.ship.angle + Math.PI / 2;
    const speed = 285 + state.day * 10;
    let x = state.ship.x;
    let y = state.ship.y;
    let vx = Math.cos(tangent) * speed;
    let vy = Math.sin(tangent) * speed;
    ctx.strokeStyle = "rgba(243,244,242,0.26)";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 8]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < 40; i += 1) {
      const g = nearestGravityAt(x, y);
      if (g) {
        vx += g.nx * 56 * g.strength * 0.035;
        vy += g.ny * 56 * g.strength * 0.035;
      }
      x += vx * 0.035;
      y += vy * 0.035;
      ctx.lineTo(clamp(x, 0, W), clamp(y, 0, H));
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function nearestGravityAt(x, y) {
    let best = null;
    for (const planet of state.planets) {
      const dx = planet.x - x;
      const dy = planet.y - y;
      const d = Math.hypot(dx, dy);
      const range = planet.r + planet.capture + 130;
      if (d > range) continue;
      const strength = 1 - d / range;
      if (!best || strength > best.strength) {
        best = { nx: dx / Math.max(1, d), ny: dy / Math.max(1, d), strength };
      }
    }
    return best;
  }

  function drawParcels() {
    for (const parcel of state.parcels) {
      if (parcel.taken) continue;
      ctx.fillStyle = parcel.color;
      ctx.fillRect(parcel.x - 9, parcel.y - 9, 18, 18);
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.strokeRect(parcel.x - 11, parcel.y - 11, 22, 22);
    }
  }

  function drawShip() {
    const angle = state.ship.mode === "orbit" ? state.ship.angle + Math.PI / 2 : Math.atan2(state.ship.vy, state.ship.vx);
    ctx.save();
    ctx.translate(state.ship.x, state.ship.y);
    ctx.rotate(angle);
    ctx.fillStyle = "#f3f4f2";
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-9, -8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-9, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS[0];
    ctx.fillRect(-12, -3, 6, 6);
    ctx.restore();

    if (state.cargo) {
      ctx.fillStyle = state.cargo.color;
      ctx.fillRect(state.ship.x - 4, state.ship.y + 16, 8, 8);
    }
  }

  function spawnBurst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 120;
      state.bursts.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.3 + Math.random() * 0.45, color });
    }
  }

  function drawBursts() {
    for (const burst of state.bursts) {
      ctx.globalAlpha = clamp(burst.life * 2.5, 0, 1);
      ctx.fillStyle = burst.color;
      ctx.fillRect(burst.x - 2, burst.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  function drawCanvasHud() {
    ctx.fillStyle = "rgba(7,9,11,0.72)";
    ctx.fillRect(14, 14, 390, 92);
    ctx.fillStyle = "#f3f4f2";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText(`Deliver ${state.delivered}/${state.target}`, 28, 42);
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText(`Score ${state.score}   Hull ${Math.round(state.hull)}   Cargo ${state.cargo ? "yes" : "no"}`, 28, 68);
    ctx.fillStyle = state.cargo ? state.cargo.color : "#a9b0ae";
    ctx.fillText(state.cargo ? "Return to matching capture ring" : "Launch toward orbit parcels", 28, 92);

    if (state.messageTimer > 0) {
      ctx.fillStyle = "rgba(7,9,11,0.72)";
      ctx.fillRect(300, H - 70, 360, 42);
      ctx.fillStyle = "#f3f4f2";
      ctx.font = "16px Segoe UI, sans-serif";
      ctx.fillText(state.message, 318, H - 43);
    }
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - state.lastTime) / 1000 || 0);
    state.lastTime = t;
    update(dt);
    draw();
    if (state.running && !state.paused) requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (event.repeat) return;
      start();
    }
    if (event.key.toLowerCase() === "p") togglePause();
    if (event.key.toLowerCase() === "r") resetGame();
  });

  canvas.addEventListener("pointerdown", start);
  overlay.addEventListener("pointerdown", start);
  startButton.addEventListener("click", (event) => {
    event.stopPropagation();
    start();
  });
  pauseButton.addEventListener("click", togglePause);
  resetButton.addEventListener("click", resetGame);

  window.__orbitCourier = {
    snapshot,
    start,
    jump: launch,
    reset: resetGame,
  };

  resetGame();
  if (new URLSearchParams(window.location.search).get("headless-test") === "1") {
    runHeadlessProbe();
  }
})();
