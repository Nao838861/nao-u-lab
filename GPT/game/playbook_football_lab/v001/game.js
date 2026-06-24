(() => {
  "use strict";

  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");
  const playList = document.getElementById("playList");
  const snapButton = document.getElementById("snapButton");
  const editButton = document.getElementById("editButton");
  const resetButton = document.getElementById("resetButton");
  const resultCard = document.getElementById("resultCard");
  const eventLog = document.getElementById("eventLog");
  const modeText = document.getElementById("modeText");

  const W = canvas.width;
  const H = canvas.height;
  const field = { x: 54, y: 58, w: 1012, h: 584 };
  const losX = field.x + field.w * 0.34;
  const goalX = field.x + field.w * 0.92;

  const plays = [
    {
      name: "Mesh Slant",
      note: "交差する短いルートでマンカバーを剥がす",
      routes: {
        X: [[0, 0], [120, -70], [250, -56]],
        Z: [[0, 0], [104, 62], [244, 54]],
        Y: [[0, 0], [78, 0], [172, -4]],
        H: [[0, 0], [82, 38], [170, 92]],
      },
    },
    {
      name: "Flood Boot",
      note: "右サイドに3層を作り、QBを流して読む",
      routes: {
        X: [[0, 0], [88, -118], [242, -146]],
        Z: [[0, 0], [142, 24], [324, 18]],
        Y: [[0, 0], [96, -26], [220, -54]],
        H: [[0, 0], [64, 84], [190, 118]],
      },
    },
    {
      name: "Draw Screen",
      note: "ラッシュを誘い、RBへの遅いスクリーンで外へ出す",
      routes: {
        X: [[0, 0], [70, -92], [130, -142]],
        Z: [[0, 0], [60, 94], [126, 138]],
        Y: [[0, 0], [64, -8], [116, -16]],
        H: [[0, 0], [36, 66], [170, 96], [292, 116]],
      },
    },
  ];

  const baseOffense = [
    { id: "QB", role: "QB", x: losX - 46, y: field.y + field.h * 0.5, speed: 126, catch: 0 },
    { id: "X", role: "WR", x: losX - 4, y: field.y + field.h * 0.24, speed: 176, catch: 84 },
    { id: "Y", role: "TE", x: losX - 6, y: field.y + field.h * 0.43, speed: 142, catch: 78 },
    { id: "H", role: "RB", x: losX - 42, y: field.y + field.h * 0.63, speed: 152, catch: 76 },
    { id: "Z", role: "WR", x: losX - 4, y: field.y + field.h * 0.78, speed: 184, catch: 82 },
  ];

  const baseDefense = [
    { id: "CB1", role: "CB", x: losX + 62, y: field.y + field.h * 0.24, speed: 170, trait: "man" },
    { id: "S", role: "S", x: losX + 200, y: field.y + field.h * 0.5, speed: 160, trait: "zone" },
    { id: "LB", role: "LB", x: losX + 92, y: field.y + field.h * 0.47, speed: 132, trait: "zone" },
    { id: "N", role: "N", x: losX + 34, y: field.y + field.h * 0.56, speed: 112, trait: "rush" },
    { id: "CB2", role: "CB", x: losX + 62, y: field.y + field.h * 0.78, speed: 174, trait: "man" },
  ];

  const state = {
    selectedPlay: 0,
    edit: false,
    running: false,
    t: 0,
    throwTime: 1.62,
    ball: null,
    offense: [],
    defense: [],
    logs: [],
    result: null,
    dragging: null,
    routeOverrides: {},
  };

  function clonePlayer(p) {
    return { ...p, px: p.x, py: p.y, target: null, open: 0 };
  }

  function activePlay() {
    return plays[state.selectedPlay];
  }

  function routesFor(id) {
    const origin = baseOffense.find((p) => p.id === id);
    const src = state.routeOverrides[id] || activePlay().routes[id] || [[0, 0]];
    return src.map((pt) => ({ x: origin.x + pt[0], y: origin.y + pt[1] }));
  }

  function resetFormation(keepResult = false) {
    state.running = false;
    state.t = 0;
    state.ball = null;
    state.offense = baseOffense.map(clonePlayer);
    state.defense = baseDefense.map(clonePlayer);
    state.logs = [];
    if (!keepResult) state.result = null;
    modeText.textContent = state.edit ? "ルート編集" : "設計中";
    renderResult();
    draw();
  }

  function setPlay(index) {
    state.selectedPlay = index;
    state.routeOverrides = {};
    state.result = null;
    renderPlayList();
    resetFormation();
  }

  function logEvent(text) {
    state.logs.unshift(text);
    state.logs = state.logs.slice(0, 6);
    eventLog.innerHTML = state.logs.map((entry) => `<li>${entry}</li>`).join("");
  }

  function renderPlayList() {
    playList.innerHTML = "";
    plays.forEach((play, index) => {
      const button = document.createElement("button");
      button.className = `play-card${index === state.selectedPlay ? " active" : ""}`;
      button.type = "button";
      button.innerHTML = `<strong>${index + 1}. ${play.name}</strong><span>${play.note}</span>`;
      button.addEventListener("click", () => setPlay(index));
      playList.appendChild(button);
    });
  }

  function renderResult() {
    if (!state.result) {
      resultCard.innerHTML = "<strong>未実行</strong><p>プレーを選んで Snap。Edit routes 中は WR/TE/RB の終点をドラッグできます。</p>";
      eventLog.innerHTML = "";
      return;
    }
    const color = state.result.success ? "var(--green)" : "var(--red)";
    resultCard.innerHTML = `<strong style="color:${color}">${state.result.title}</strong><p>${state.result.detail}</p>`;
  }

  function routePointAt(id, t) {
    const pts = routesFor(id);
    if (pts.length === 1) return pts[0];
    const total = pts.length - 1;
    const scaled = Math.min(total - 0.001, Math.max(0, t / 2.7 * total));
    const i = Math.floor(scaled);
    const a = pts[i];
    const b = pts[i + 1];
    const f = scaled - i;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  function moveToward(p, target, speed, dt) {
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const step = Math.min(dist, speed * dt);
    p.x += (dx / dist) * step;
    p.y += (dy / dist) * step;
  }

  function nearestDefender(receiver) {
    let best = null;
    let bestDist = Infinity;
    for (const d of state.defense) {
      const dist = Math.hypot(d.x - receiver.x, d.y - receiver.y);
      if (dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    return { defender: best, dist: bestDist };
  }

  function chooseTarget() {
    let best = null;
    let bestScore = -Infinity;
    for (const p of state.offense) {
      if (p.id === "QB") continue;
      const nearest = nearestDefender(p);
      const depth = Math.max(0, p.x - losX);
      const score = nearest.dist * 1.7 + depth * 0.22 + p.catch * 0.2 - Math.abs(p.y - field.y - field.h * 0.5) * 0.05;
      p.open = nearest.dist;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  }

  function startSnap() {
    if (state.running) return;
    resetFormation(true);
    state.running = true;
    state.t = 0;
    state.result = null;
    state.logs = [];
    modeText.textContent = "実行中";
    logEvent(`${activePlay().name} をコール。QB は ${state.throwTime.toFixed(1)} 秒で判断。`);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    state.t += dt;
    const qb = state.offense[0];
    qb.x = losX - 48 + Math.sin(state.t * 2.1) * 10;
    qb.y = field.y + field.h * 0.5 + Math.sin(state.t * 1.4) * 6;

    for (const p of state.offense) {
      if (p.id === "QB") continue;
      moveToward(p, routePointAt(p.id, state.t), p.speed, dt);
    }

    for (const d of state.defense) {
      if (d.trait === "rush") {
        moveToward(d, qb, d.speed * 1.06, dt);
      } else if (d.trait === "man") {
        const target = d.id === "CB1" ? state.offense.find((p) => p.id === "X") : state.offense.find((p) => p.id === "Z");
        moveToward(d, target, d.speed, dt);
      } else {
        const zone = d.id === "S" ? { x: losX + 250, y: field.y + field.h * 0.5 } : { x: losX + 145, y: field.y + field.h * 0.48 };
        const nearest = state.offense.slice(1).sort((a, b) => Math.hypot(a.x - zone.x, a.y - zone.y) - Math.hypot(b.x - zone.x, b.y - zone.y))[0];
        const target = Math.hypot(nearest.x - zone.x, nearest.y - zone.y) < 120 ? nearest : zone;
        moveToward(d, target, d.speed * 0.94, dt);
      }
    }

    const pressure = Math.hypot(state.defense.find((d) => d.id === "N").x - qb.x, state.defense.find((d) => d.id === "N").y - qb.y);
    if (!state.ball && (state.t >= state.throwTime || pressure < 35)) {
      const target = chooseTarget();
      state.ball = { x: qb.x, y: qb.y, target, progress: 0, pressure };
      logEvent(pressure < 35 ? "ラッシュが早く、QB は予定より早く投げた。" : `${target.id} が最も空いた。`);
    }

    if (state.ball) {
      state.ball.progress += dt * 1.6;
      const f = Math.min(1, state.ball.progress);
      state.ball.x += (state.ball.target.x - state.ball.x) * Math.min(1, dt * 8);
      state.ball.y += (state.ball.target.y - state.ball.y) * Math.min(1, dt * 8);
      if (f >= 1) finishPlay(state.ball.target, state.ball.pressure);
    }

    if (state.t > 4.2 && !state.result) finishPlay(null, pressure);
  }

  function finishPlay(target, pressure) {
    const rec = target || chooseTarget();
    const nearest = nearestDefender(rec);
    const depth = Math.max(0, rec.x - losX);
    const catchWindow = nearest.dist + rec.catch * 0.45 - pressure * 0.18;
    const success = catchWindow > 44;
    const yards = Math.max(0, Math.round(depth / 13));
    state.result = success
      ? { success: true, title: `${rec.id} へ成功、${yards} yd`, detail: `セパレーション ${Math.round(nearest.dist)}、プレッシャー ${Math.round(pressure)}。${rec.role} のルートが守備の間に入りました。` }
      : { success: false, title: "パス失敗", detail: `最終ターゲット ${rec.id}。セパレーション ${Math.round(nearest.dist)}、プレッシャー ${Math.round(pressure)} で投球窓が潰れました。` };
    logEvent(success ? `${rec.id} が捕球。次は同じ構造を深く試せる。` : `${nearest.defender.id} が窓を閉じた。ルート幅か投げる時刻を見直す。`);
    state.running = false;
    state.ball = null;
    modeText.textContent = "分析中";
    renderResult();
  }

  function loop(now) {
    if (!state.last) state.last = now;
    const dt = Math.min(0.033, (now - state.last) / 1000);
    state.last = now;
    if (state.running) {
      update(dt);
      draw();
      requestAnimationFrame(loop);
    }
  }

  function drawField() {
    const grad = ctx.createLinearGradient(field.x, field.y, field.x + field.w, field.y);
    grad.addColorStop(0, "#183822");
    grad.addColorStop(0.5, "#214d2e");
    grad.addColorStop(1, "#17351f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i <= 10; i += 1) {
      const x = field.x + (field.w / 10) * i;
      ctx.fillRect(x, field.y, 2, field.h);
      ctx.fillText(String(Math.abs(50 - i * 10)), x + 6, field.y + 28);
    }

    ctx.strokeStyle = "rgba(245,242,233,0.9)";
    ctx.lineWidth = 3;
    ctx.strokeRect(field.x, field.y, field.w, field.h);
    ctx.strokeStyle = "rgba(231,191,90,0.95)";
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(losX, field.y);
    ctx.lineTo(losX, field.y + field.h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(83,192,122,0.7)";
    ctx.beginPath();
    ctx.moveTo(goalX, field.y);
    ctx.lineTo(goalX, field.y + field.h);
    ctx.stroke();
  }

  function drawRoutes() {
    for (const p of state.offense) {
      if (p.id === "QB") continue;
      const pts = routesFor(p.id);
      ctx.strokeStyle = p.id === "H" ? "rgba(111,182,232,0.92)" : "rgba(231,191,90,0.86)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      const last = pts[pts.length - 1];
      ctx.fillStyle = state.edit ? "#f5f2e9" : "rgba(245,242,233,0.72)";
      ctx.beginPath();
      ctx.arc(last.x, last.y, state.edit ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPlayer(p, side) {
    const color = side === "offense" ? "#f5f2e9" : "#24313a";
    const stroke = side === "offense" ? "#101316" : "#e8685f";
    ctx.fillStyle = color;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.id === "QB" ? 17 : 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = side === "offense" ? "#101316" : "#f5f2e9";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.id, p.x, p.y + 1);
  }

  function drawHud() {
    ctx.fillStyle = "rgba(16,19,22,0.82)";
    ctx.fillRect(70, 72, 360, 72);
    ctx.fillStyle = "#e7bf5a";
    ctx.font = "bold 18px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(activePlay().name, 88, 101);
    ctx.fillStyle = "#aeb7b4";
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText(state.edit ? "終点をドラッグしてルートを変える" : "Snap で実行。守備との距離が捕球窓になる", 88, 127);
  }

  function drawBall() {
    if (!state.ball) return;
    ctx.fillStyle = "#8b4a2b";
    ctx.strokeStyle = "#f5f2e9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(state.ball.x, state.ball.y, 11, 7, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawField();
    drawRoutes();
    state.defense.forEach((p) => drawPlayer(p, "defense"));
    state.offense.forEach((p) => drawPlayer(p, "offense"));
    drawBall();
    drawHud();
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.edit || state.running) return;
    const pos = pointerPos(event);
    for (const p of baseOffense) {
      if (p.id === "QB") continue;
      const pts = routesFor(p.id);
      const last = pts[pts.length - 1];
      if (Math.hypot(pos.x - last.x, pos.y - last.y) < 24) {
        state.dragging = p.id;
        canvas.setPointerCapture(event.pointerId);
        return;
      }
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) return;
    const pos = pointerPos(event);
    const origin = baseOffense.find((p) => p.id === state.dragging);
    const current = (state.routeOverrides[state.dragging] || activePlay().routes[state.dragging]).map((pt) => [...pt]);
    const last = current[current.length - 1];
    last[0] = Math.max(45, Math.min(410, pos.x - origin.x));
    last[1] = Math.max(-210, Math.min(210, pos.y - origin.y));
    state.routeOverrides[state.dragging] = current;
    draw();
  });

  canvas.addEventListener("pointerup", () => {
    state.dragging = null;
  });

  snapButton.addEventListener("click", startSnap);
  resetButton.addEventListener("click", () => {
    state.routeOverrides = {};
    resetFormation();
  });
  editButton.addEventListener("click", () => {
    state.edit = !state.edit;
    editButton.setAttribute("aria-pressed", String(state.edit));
    modeText.textContent = state.edit ? "ルート編集" : "設計中";
    draw();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      startSnap();
    }
    if (event.key === "r" || event.key === "R") {
      state.routeOverrides = {};
      resetFormation();
    }
    const n = Number(event.key);
    if (n >= 1 && n <= plays.length) setPlay(n - 1);
  });

  window.__playbookLab = {
    snapshot() {
      return {
        selectedPlay: activePlay().name,
        running: state.running,
        result: state.result,
        offense: state.offense.map((p) => ({ id: p.id, x: Math.round(p.x), y: Math.round(p.y) })),
      };
    },
    snap: startSnap,
    setPlay,
    finishFast() {
      for (let i = 0; i < 220 && state.running; i += 1) update(1 / 60);
      draw();
      return state.result;
    },
  };

  renderPlayList();
  resetFormation();
})();
