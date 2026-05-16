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
    playerRadius: 17,
    playerSpeed: 245,
    carrySpeed: 188,
    crateRadius: 14,
    dockRadius: 38,
    cartRadius: 24,
  };

  const colors = ["#69c8ff", "#ffcf5a", "#ff7a90", "#8ee07a"];

  const docks = [
    { x: 84, y: 92, color: colors[0], label: "A" },
    { x: 876, y: 92, color: colors[1], label: "B" },
    { x: 84, y: 548, color: colors[2], label: "C" },
    { x: 876, y: 548, color: colors[3], label: "D" },
  ];

  const initialCrates = [
    { x: 292, y: 148, color: colors[0], dock: 0 },
    { x: 666, y: 148, color: colors[1], dock: 1 },
    { x: 292, y: 492, color: colors[2], dock: 2 },
    { x: 666, y: 492, color: colors[3], dock: 3 },
  ];

  const carts = [
    { x: 224, y: 320, min: 154, max: 806, speed: 122, axis: "x", dir: 1 },
    { x: 480, y: 168, min: 138, max: 502, speed: 92, axis: "y", dir: 1 },
    { x: 736, y: 320, min: 154, max: 806, speed: 112, axis: "x", dir: -1 },
  ];

  const state = {
    running: false,
    complete: false,
    failed: false,
    time: 0,
    lastTime: 0,
    accumulator: 0,
    player: { x: W / 2, y: H / 2 },
    crates: [],
    carrying: null,
    delivered: new Set(),
    message: "",
    messageTimer: 0,
  };

  function cloneCrate(crate) {
    return { x: crate.x, y: crate.y, color: crate.color, dock: crate.dock };
  }

  function resetGame() {
    state.running = false;
    state.complete = false;
    state.failed = false;
    state.time = 0;
    state.accumulator = 0;
    state.player.x = W / 2;
    state.player.y = H / 2;
    state.crates = initialCrates.map(cloneCrate);
    state.carrying = null;
    state.delivered = new Set();
    state.message = "";
    state.messageTimer = 0;
    for (let i = 0; i < carts.length; i += 1) {
      carts[i].x = [224, 480, 736][i];
      carts[i].y = [320, 168, 320][i];
      carts[i].dir = [1, 1, -1][i];
    }
    showOverlay("荷物に触れて拾い、同じ色の港へ運ぶ。赤いカートを避ける。", "開始");
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

  function movePlayer(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
    if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("s")) dy += 1;
    if (dx === 0 && dy === 0) return;
    const len = Math.hypot(dx, dy);
    const speed = state.carrying === null ? config.playerSpeed : config.carrySpeed;
    state.player.x = clamp(state.player.x + (dx / len) * speed * dt, 28, W - 28);
    state.player.y = clamp(state.player.y + (dy / len) * speed * dt, 28, H - 28);
  }

  function moveCarts(dt) {
    for (const cart of carts) {
      if (cart.axis === "x") {
        cart.x += cart.speed * cart.dir * dt;
        if (cart.x < cart.min || cart.x > cart.max) {
          cart.x = clamp(cart.x, cart.min, cart.max);
          cart.dir *= -1;
        }
      } else {
        cart.y += cart.speed * cart.dir * dt;
        if (cart.y < cart.min || cart.y > cart.max) {
          cart.y = clamp(cart.y, cart.min, cart.max);
          cart.dir *= -1;
        }
      }
    }
  }

  function pickupAndDeliver() {
    if (state.carrying === null) {
      for (let i = 0; i < state.crates.length; i += 1) {
        if (state.delivered.has(i)) continue;
        const crate = state.crates[i];
        if (Math.hypot(crate.x - state.player.x, crate.y - state.player.y) < config.playerRadius + config.crateRadius + 2) {
          state.carrying = i;
          state.message = "拾った";
          state.messageTimer = 0.8;
          return;
        }
      }
    } else {
      const crate = state.crates[state.carrying];
      crate.x = state.player.x;
      crate.y = state.player.y;
      const dock = docks[crate.dock];
      if (Math.hypot(dock.x - state.player.x, dock.y - state.player.y) < config.dockRadius) {
        state.delivered.add(state.carrying);
        state.carrying = null;
        state.message = `納品 ${state.delivered.size}/${state.crates.length}`;
        state.messageTimer = 1.0;
      }
    }
  }

  function checkHazards() {
    for (const cart of carts) {
      if (Math.hypot(cart.x - state.player.x, cart.y - state.player.y) < config.cartRadius + config.playerRadius) {
        state.failed = true;
        state.running = false;
        showOverlay("赤いカートにぶつかった。荷物を取りに行く順番と通る道を変える。", "再挑戦");
        return;
      }
    }
  }

  function update(dt) {
    if (!state.running || state.complete || state.failed) return;
    state.time += dt;
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    movePlayer(dt);
    moveCarts(dt);
    pickupAndDeliver();
    checkHazards();
    if (state.delivered.size === state.crates.length) {
      state.complete = true;
      state.running = false;
      showOverlay(`全て納品。時間 ${state.time.toFixed(1)} 秒。`, "再挑戦");
    }
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

  function drawCrate(crate) {
    ctx.fillStyle = crate.color;
    ctx.fillRect(crate.x - 13, crate.y - 13, 26, 26);
    ctx.strokeStyle = "#111820";
    ctx.strokeRect(crate.x - 13, crate.y - 13, 26, 26);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#151a20";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#2c3440";
    ctx.lineWidth = 1;
    for (let x = 80; x < W; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 80; y < H; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.font = "17px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    for (const dock of docks) {
      ctx.lineWidth = 5;
      drawCircle(dock.x, dock.y, config.dockRadius, dock.color, true);
      ctx.fillStyle = dock.color;
      ctx.fillText(dock.label, dock.x, dock.y + 6);
    }

    ctx.lineWidth = 3;
    for (const cart of carts) {
      drawCircle(cart.x, cart.y, config.cartRadius, "#ff4f76");
      ctx.strokeStyle = "#ffd0da";
      ctx.strokeRect(cart.x - 18, cart.y - 11, 36, 22);
    }

    for (let i = 0; i < state.crates.length; i += 1) {
      if (state.delivered.has(i) || state.carrying === i) continue;
      drawCrate(state.crates[i]);
    }
    if (state.carrying !== null) drawCrate(state.crates[state.carrying]);

    drawCircle(state.player.x, state.player.y, config.playerRadius, "#f4f1e8");
    drawCircle(state.player.x, state.player.y, config.playerRadius + 5, "#f0c95a", true);

    ctx.textAlign = "left";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillStyle = "#f4f1e8";
    ctx.fillText("WASD/矢印: 移動  荷物に触れる: 拾う  同じ色の港: 納品", 24, 32);
    ctx.fillText(`納品 ${state.delivered.size}/${state.crates.length}  時間 ${state.time.toFixed(1)}  ${state.carrying === null ? "空手" : "運搬中"}`, 24, 62);
    if (state.messageTimer > 0) ctx.fillText(state.message, 24, 92);
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
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
    if (event.key.toLowerCase() === "r") resetGame();
    keys.add(event.key);
    keys.add(event.key.toLowerCase());
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key);
    keys.delete(event.key.toLowerCase());
  });

  startButton.addEventListener("click", start);
  canvas.addEventListener("pointerdown", start);

  window.__dockhandDashV1 = {
    snapshot() {
      return {
        running: state.running,
        complete: state.complete,
        failed: state.failed,
        time: Math.round(state.time * 100) / 100,
        delivered: state.delivered.size,
        carrying: state.carrying,
        player: { x: Math.round(state.player.x * 10) / 10, y: Math.round(state.player.y * 10) / 10 },
        crates: state.crates.map((crate, index) => ({
          index,
          x: Math.round(crate.x * 10) / 10,
          y: Math.round(crate.y * 10) / 10,
          dock: crate.dock,
          delivered: state.delivered.has(index),
          carried: state.carrying === index,
        })),
        docks: docks.map((dock, index) => ({ index, x: dock.x, y: dock.y })),
        carts: carts.map((cart) => ({ x: Math.round(cart.x * 10) / 10, y: Math.round(cart.y * 10) / 10 })),
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
