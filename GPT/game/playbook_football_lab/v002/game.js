(() => {
  "use strict";

  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");
  const playList = document.getElementById("playList");
  const defenseList = document.getElementById("defenseList");
  const snapButton = document.getElementById("snapButton");
  const editButton = document.getElementById("editButton");
  const addPointButton = document.getElementById("addPointButton");
  const resetButton = document.getElementById("resetButton");
  const resultCard = document.getElementById("resultCard");
  const eventLog = document.getElementById("eventLog");
  const modeText = document.getElementById("modeText");
  const throwSlider = document.getElementById("throwSlider");
  const throwValue = document.getElementById("throwValue");
  const downText = document.getElementById("downText");
  const fieldText = document.getElementById("fieldText");
  const driveText = document.getElementById("driveText");

  const W = canvas.width;
  const H = canvas.height;
  const field = { x: 54, y: 58, w: 1012, h: 584 };
  const losX = field.x + field.w * 0.34;
  const yardPx = field.w / 100;
  const routeDuration = 3.6;
  const maxPlayTime = 6.2;

  const plays = [
    {
      name: "Mesh Slant",
      note: "交差する短いルートでマンカバーを剥がす",
      routes: {
        X: [[0, 0], [98, -64], [234, -50]],
        Z: [[0, 0], [94, 56], [236, 44]],
        Y: [[0, 0], [82, -6], [176, -8]],
        H: [[0, 0], [74, 38], [166, 86]],
      },
    },
    {
      name: "Flood Boot",
      note: "右サイドに深中浅の3層を作る",
      routes: {
        X: [[0, 0], [78, -118], [236, -150]],
        Z: [[0, 0], [126, 20], [324, 14]],
        Y: [[0, 0], [96, -28], [220, -56]],
        H: [[0, 0], [58, 84], [196, 118]],
      },
    },
    {
      name: "Draw Screen",
      note: "ラッシュを誘ってRBへ遅いスクリーン",
      routes: {
        X: [[0, 0], [70, -92], [130, -142]],
        Z: [[0, 0], [60, 94], [126, 138]],
        Y: [[0, 0], [64, -8], [116, -16]],
        H: [[0, 0], [28, 60], [154, 96], [300, 116]],
      },
    },
  ];

  const defenseCalls = [
    { name: "Nickel Zone", note: "ゾーンが中間を締める。深い Flood に弱い", call: "zone" },
    { name: "Press Man", note: "外のWRに密着。交差ルートに弱い", call: "press" },
    { name: "Edge Blitz", note: "早い圧力。遅い展開を潰す", call: "blitz" },
  ];

  const baseOffense = [
    { id: "QB", role: "QB", x: losX - 46, y: field.y + field.h * 0.5, speed: 128, catch: 0 },
    { id: "X", role: "WR", x: losX - 4, y: field.y + field.h * 0.24, speed: 178, catch: 84 },
    { id: "Y", role: "TE", x: losX - 6, y: field.y + field.h * 0.43, speed: 142, catch: 80 },
    { id: "H", role: "RB", x: losX - 42, y: field.y + field.h * 0.63, speed: 154, catch: 76 },
    { id: "Z", role: "WR", x: losX - 4, y: field.y + field.h * 0.78, speed: 184, catch: 82 },
  ];

  const defenseBase = [
    { id: "CB1", role: "CB", x: losX + 60, y: field.y + field.h * 0.24, speed: 170 },
    { id: "S", role: "S", x: losX + 208, y: field.y + field.h * 0.5, speed: 160 },
    { id: "LB", role: "LB", x: losX + 94, y: field.y + field.h * 0.47, speed: 134 },
    { id: "N", role: "N", x: losX + 34, y: field.y + field.h * 0.56, speed: 114 },
    { id: "CB2", role: "CB", x: losX + 60, y: field.y + field.h * 0.78, speed: 174 },
  ];

  const state = {
    selectedPlay: 0,
    selectedDefense: 0,
    edit: false,
    addPoint: false,
    running: false,
    t: 0,
    last: 0,
    throwTime: 2.2,
    ball: null,
    carrier: null,
    catchInfo: null,
    offense: [],
    defense: [],
    logs: [],
    result: null,
    dragging: null,
    routeOverrides: {},
    reads: [],
    down: 2,
    distance: 6,
    ballOn: 38,
    drive: 1,
  };

  function activePlay() {
    return plays[state.selectedPlay];
  }

  function activeDefense() {
    return defenseCalls[state.selectedDefense];
  }

  function clonePlayer(p) {
    return {
      ...p,
      angle: p.angle || 0,
      turnRate: p.turnRate || 7,
      stride: 0,
      vx: 0,
      vy: 0,
      open: 0,
      trail: [],
      cutFlash: 0,
    };
  }

  function defenseTrait(id) {
    const call = activeDefense().call;
    if (id === "N") return "rush";
    if (call === "blitz" && id === "LB") return "rush";
    if (call === "press" && (id === "CB1" || id === "CB2")) return "press";
    if (id === "CB1" || id === "CB2") return "man";
    return "zone";
  }

  function routeRelative(id) {
    const src = state.routeOverrides[id] || activePlay().routes[id] || [[0, 0]];
    return src.map((pt) => [pt[0], pt[1]]);
  }

  function routeAbs(id) {
    const origin = baseOffense.find((p) => p.id === id);
    return routeRelative(id).map((pt) => ({ x: origin.x + pt[0], y: origin.y + pt[1] }));
  }

  function setRoutePoint(id, index, x, y) {
    const origin = baseOffense.find((p) => p.id === id);
    const rel = routeRelative(id);
    rel[index][0] = Math.max(26, Math.min(430, x - origin.x));
    rel[index][1] = Math.max(-230, Math.min(230, y - origin.y));
    state.routeOverrides[id] = rel;
  }

  function resetFormation(keepResult = false) {
    state.running = false;
    state.t = 0;
    state.last = 0;
    state.ball = null;
    state.carrier = null;
    state.catchInfo = null;
    state.offense = baseOffense.map((p) => ({ ...clonePlayer(p), angle: 0 }));
    state.defense = defenseBase.map((p) => ({ ...clonePlayer(p), angle: Math.PI, trait: defenseTrait(p.id) }));
    state.logs = [];
    state.reads = [];
    if (!keepResult) state.result = null;
    updateTopline();
    renderResult();
    draw();
  }

  function updateTopline() {
    downText.textContent = `${ordinal(state.down)} & ${state.distance}`;
    fieldText.textContent = `Ball on ${state.ballOn}`;
    driveText.textContent = `Drive ${state.drive}`;
    modeText.textContent = state.edit ? (state.addPoint ? "点を追加" : "ルート編集") : state.carrier ? "RAC" : state.running ? "実行中" : state.result ? "分析中" : "設計中";
  }

  function ordinal(n) {
    return ["", "1st", "2nd", "3rd", "4th"][n] || `${n}th`;
  }

  function setPlay(index) {
    state.selectedPlay = index;
    state.routeOverrides = {};
    state.result = null;
    renderPlayList();
    resetFormation();
  }

  function setDefense(index) {
    state.selectedDefense = index;
    state.result = null;
    renderDefenseList();
    resetFormation();
  }

  function logEvent(text) {
    state.logs.unshift(text);
    state.logs = state.logs.slice(0, 7);
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

  function renderDefenseList() {
    defenseList.innerHTML = "";
    defenseCalls.forEach((call, index) => {
      const button = document.createElement("button");
      button.className = `defense-card${index === state.selectedDefense ? " active" : ""}`;
      button.type = "button";
      button.innerHTML = `<strong>${call.name}</strong><span>${call.note}</span>`;
      button.addEventListener("click", () => setDefense(index));
      defenseList.appendChild(button);
    });
  }

  function renderResult() {
    if (!state.result) {
      resultCard.innerHTML = "<strong>未実行</strong><p>プレー、守備、投球タイミングを決めて Snap。Edit routes 中はルート点をドラッグできます。</p>";
      eventLog.innerHTML = "";
      return;
    }
    const color = state.result.success ? "var(--green)" : "var(--red)";
    resultCard.innerHTML = `<strong style="color:${color}">${state.result.title}</strong><p>${state.result.detail}</p>`;
  }

  function routePointAt(id, t) {
    const pts = routeAbs(id);
    if (pts.length === 1) return pts[0];
    const total = pts.length - 1;
    const scaled = Math.min(total - 0.001, Math.max(0, t / routeDuration * total));
    const i = Math.floor(scaled);
    const a = pts[i];
    const b = pts[i + 1];
    const f = scaled - i;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  function angleLerp(current, target, amount) {
    let delta = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return current + delta * Math.min(1, amount);
  }

  function moveToward(p, target, speed, dt, options = {}) {
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const desiredAngle = Math.atan2(dy, dx);
    const previousAngle = p.angle;
    const turnScale = options.turnScale || 1;
    p.angle = angleLerp(p.angle, desiredAngle, dt * p.turnRate * turnScale);
    const turnDelta = Math.abs(((p.angle - previousAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
    if (turnDelta > 0.045) p.cutFlash = 0.18;

    const alignment = Math.max(0.36, Math.cos(desiredAngle - p.angle));
    const slowRadius = options.slowRadius || 38;
    const slow = Math.min(1, Math.max(0.42, dist / slowRadius));
    const step = Math.min(dist, speed * alignment * slow * dt);
    const nx = Math.cos(p.angle);
    const ny = Math.sin(p.angle);
    p.x += nx * step;
    p.y += ny * step;
    p.vx = nx * step / Math.max(dt, 0.001);
    p.vy = ny * step / Math.max(dt, 0.001);
    p.stride += step * 0.18;
    p.cutFlash = Math.max(0, p.cutFlash - dt);
  }

  function backpedalToward(p, target, speed, dt) {
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const faceBall = Math.atan2(field.y + field.h * 0.5 - p.y, losX - p.x);
    p.angle = angleLerp(p.angle, faceBall, dt * p.turnRate * 0.8);
    const step = Math.min(dist, speed * 0.72 * dt);
    p.x += (dx / dist) * step;
    p.y += (dy / dist) * step;
    p.vx = (dx / dist) * step / Math.max(dt, 0.001);
    p.vy = (dy / dist) * step / Math.max(dt, 0.001);
    p.stride += step * 0.16;
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

  function pressureDistance() {
    const qb = state.offense.find((p) => p.id === "QB");
    return Math.min(...state.defense.filter((d) => d.trait === "rush").map((d) => Math.hypot(d.x - qb.x, d.y - qb.y)));
  }

  function evaluateReceivers(pressure) {
    const pressurePenalty = Math.max(0, 72 - pressure) * 0.45;
    return state.offense
      .filter((p) => p.id !== "QB")
      .map((p) => {
        const nearest = nearestDefender(p);
        const depth = Math.max(0, p.x - losX);
        const middleBonus = 18 - Math.abs(p.y - (field.y + field.h * 0.5)) * 0.045;
        const score = nearest.dist * 1.45 + depth * 0.18 + p.catch * 0.26 + middleBonus - pressurePenalty;
        p.open = nearest.dist;
        return { id: p.id, player: p, defender: nearest.defender.id, separation: nearest.dist, depth, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  function startSnap() {
    if (state.running) return;
    resetFormation(true);
    state.running = true;
    state.t = 0;
    state.last = 0;
    state.result = null;
    state.logs = [];
    state.reads = [];
    state.carrier = null;
    state.catchInfo = null;
    updateTopline();
    logEvent(`${activePlay().name} vs ${activeDefense().name}。投球予定 ${state.throwTime.toFixed(2)} 秒。`);
    requestAnimationFrame(loop);
  }

  function update(dt) {
    state.t += dt;
    const qb = state.offense[0];
    const boot = activePlay().name === "Flood Boot" ? 28 : 6;
    qb.x = losX - 48 + Math.min(boot, state.t * boot * 0.8);
    qb.y = field.y + field.h * 0.5 + Math.sin(state.t * 1.8) * 5;

    for (const p of state.offense) {
      if (state.carrier && p.id === state.carrier.id) {
        moveToward(p, { x: Math.min(field.x + field.w - 42, p.x + 120), y: p.y + Math.sin(state.t * 3) * 18 }, p.speed * 0.92, dt, { turnScale: 0.82, slowRadius: 60 });
      } else if (p.id !== "QB") {
        moveToward(p, routePointAt(p.id, state.t), p.speed, dt, { turnScale: p.role === "RB" ? 0.72 : 1, slowRadius: 48 });
      }
      p.trail.push({ x: p.x, y: p.y });
      p.trail = p.trail.slice(-24);
    }

    for (const d of state.defense) {
      if (state.carrier) {
        moveToward(d, state.carrier, d.speed * 1.05, dt, { turnScale: 0.86, slowRadius: 52 });
      } else if (d.trait === "rush") {
        moveToward(d, qb, d.speed * (d.id === "LB" ? 1.24 : 1.08), dt, { turnScale: 0.9, slowRadius: 42 });
      } else if (d.trait === "press" || d.trait === "man") {
        const target = d.id === "CB1" ? state.offense.find((p) => p.id === "X") : state.offense.find((p) => p.id === "Z");
        const cushion = d.trait === "press" ? -8 : 16;
        moveToward(d, { x: target.x + cushion, y: target.y }, d.speed * (d.trait === "press" ? 1.02 : 0.98), dt, { turnScale: 0.72, slowRadius: 56 });
      } else {
        const zone = d.id === "S" ? { x: losX + 260, y: field.y + field.h * 0.5 } : { x: losX + 142, y: field.y + field.h * 0.48 };
        const nearest = state.offense.slice(1).sort((a, b) => Math.hypot(a.x - zone.x, a.y - zone.y) - Math.hypot(b.x - zone.x, b.y - zone.y))[0];
        const target = Math.hypot(nearest.x - zone.x, nearest.y - zone.y) < 128 ? nearest : zone;
        backpedalToward(d, target, d.speed * 0.92, dt);
      }
      d.trail.push({ x: d.x, y: d.y });
      d.trail = d.trail.slice(-20);
    }

    if (state.carrier) {
      const nearest = nearestDefender(state.carrier);
      const runTime = state.t - state.catchInfo.t;
      if (nearest.dist < 20 || runTime > 1.55 || state.carrier.x >= field.x + field.w - 48) {
        finishRunAfterCatch(nearest);
      }
      return;
    }

    const pressure = pressureDistance();
    if (!state.ball && (state.t >= state.throwTime || pressure < 18)) {
      const reads = evaluateReceivers(pressure);
      state.reads = reads;
      const target = reads[0].player;
      const airDistance = Math.hypot(target.x - qb.x, target.y - qb.y);
      const flightTime = Math.max(0.75, Math.min(1.25, airDistance / 260));
      state.ball = { x: qb.x, y: qb.y, target, progress: 0, flightTime, pressure, read: reads[0] };
      logEvent(pressure < 18 ? "圧力が近すぎて早投げ。" : `${target.id} を選択。2番手は ${reads[1].id}。`);
    }

    if (state.ball) {
      state.ball.progress += dt / state.ball.flightTime;
      const f = Math.min(1, state.ball.progress);
      state.ball.x += (state.ball.target.x - state.ball.x) * Math.min(1, dt * 5);
      state.ball.y += (state.ball.target.y - state.ball.y) * Math.min(1, dt * 5);
      if (f >= 1) resolveCatch(state.ball.target, state.ball.pressure, state.ball.read);
    }

    if (state.t > maxPlayTime && !state.result) {
      const pressure = pressureDistance();
      const reads = evaluateReceivers(pressure);
      resolveCatch(reads[0].player, pressure, reads[0]);
    }
  }

  function catchCheck(receiver, pressure) {
    const nearest = nearestDefender(receiver);
    const pressurePenalty = Math.max(0, 72 - pressure) * 0.52;
    const trafficPenalty = nearest.defender.role === "S" ? 6 : 0;
    const catchWindow = nearest.dist + receiver.catch * 0.38 - pressurePenalty - trafficPenalty;
    const success = catchWindow > 43;
    return { nearest, catchWindow, success };
  }

  function resolveCatch(receiver, pressure, read) {
    const check = catchCheck(receiver, pressure);
    state.ball = null;
    if (check.success) {
      state.carrier = receiver;
      state.catchInfo = {
        receiver,
        pressure,
        read,
        t: state.t,
        x: receiver.x,
        y: receiver.y,
        catchWindow: check.catchWindow,
        nearestAtCatch: check.nearest,
      };
      logEvent(`${receiver.id} が捕球。キャッチ後ランへ。`);
      updateTopline();
      return;
    }
    finishIncomplete(receiver, pressure, read, check);
  }

  function finishIncomplete(receiver, pressure, read, check) {
    const nearest = check.nearest;
    state.result = {
      success: false,
      title: "パス失敗",
      detail: `${receiver.id} へのパスは incomplete。${nearest.defender.id} が近く、セパレーション ${Math.round(nearest.dist)}、プレッシャー距離 ${Math.round(pressure)}、捕球窓 ${Math.round(check.catchWindow)}。${advanceDrive(false, 0)}`,
    };
    logEvent(`${nearest.defender.id} が投球窓を潰した。投球時刻かルートの幅を見直す。`);
    if (read) logEvent(`QB評価: ${read.id} score ${Math.round(read.score)} / sep ${Math.round(read.separation)} / depth ${Math.round(read.depth / 12)}yd`);
    state.running = false;
    state.ball = null;
    state.carrier = null;
    updateTopline();
    renderResult();
  }

  function finishRunAfterCatch(nearest) {
    const receiver = state.carrier;
    const info = state.catchInfo;
    const depth = Math.max(0, receiver.x - losX);
    const catchDepth = Math.max(0, info.x - losX);
    const rac = Math.max(0, Math.round((depth - catchDepth) / 12));
    const yards = Math.max(1, Math.round(depth / 12));
    const next = advanceDrive(true, yards);
    state.result = {
      success: true,
      title: `${receiver.id} が捕球、${yards} yd`,
      detail: `捕球窓 ${Math.round(info.catchWindow)}、キャッチ後 ${rac} yd。${nearest.defender.id} が ${Math.round(nearest.dist)} px まで詰めてタックル。${next}`,
    };
    logEvent(`${receiver.id} がタックルされて終了。${next}`);
    if (info.read) logEvent(`QB評価: ${info.read.id} score ${Math.round(info.read.score)} / sep ${Math.round(info.read.separation)} / depth ${Math.round(info.read.depth / 12)}yd`);
    state.running = false;
    state.ball = null;
    state.carrier = null;
    state.catchInfo = null;
    updateTopline();
    renderResult();
  }

  function advanceDrive(success, yards) {
    if (success && yards >= state.distance) {
      state.ballOn = Math.min(99, state.ballOn + yards);
      state.down = 1;
      state.distance = Math.min(10, 100 - state.ballOn);
      if (state.ballOn >= 90) return "レッドゾーン突入。1st down。";
      return "1st down 更新。";
    }
    if (success) {
      state.ballOn += yards;
      state.distance = Math.max(1, state.distance - yards);
      state.down += 1;
      if (state.down > 4) {
        state.drive += 1;
        state.down = 1;
        state.distance = 10;
        state.ballOn = 25;
        return "4th downで届かず、新しいドライブへ。";
      }
      return `${ordinal(state.down)} & ${state.distance}。`;
    }
    state.down += 1;
    if (state.down > 4) {
      state.drive += 1;
      state.down = 1;
      state.distance = 10;
      state.ballOn = 25;
      return "4th down 失敗で新しいドライブへ。";
    }
    return `${ordinal(state.down)} & ${state.distance}。`;
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
    grad.addColorStop(0, "#173722");
    grad.addColorStop(0.5, "#245132");
    grad.addColorStop(1, "#17351f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.055)";
    ctx.font = "14px Segoe UI, sans-serif";
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
    const firstDownX = Math.min(field.x + field.w - 24, losX + state.distance * yardPx);
    ctx.strokeStyle = "rgba(83,192,122,0.7)";
    ctx.beginPath();
    ctx.moveTo(firstDownX, field.y);
    ctx.lineTo(firstDownX, field.y + field.h);
    ctx.stroke();
  }

  function drawRoutes() {
    for (const p of state.offense) {
      if (p.id === "QB") continue;
      const pts = routeAbs(p.id);
      ctx.strokeStyle = p.id === "H" ? "rgba(111,182,232,0.94)" : "rgba(231,191,90,0.86)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();
      pts.forEach((pt, i) => {
        if (i === 0) return;
        ctx.fillStyle = state.edit ? "#f5f2e9" : "rgba(245,242,233,0.72)";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, state.edit ? 8 : 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  function drawTrails() {
    for (const p of [...state.offense, ...state.defense]) {
      if (!p.trail || p.trail.length < 3) continue;
      ctx.strokeStyle = state.offense.includes(p) ? "rgba(245,242,233,0.24)" : "rgba(232,104,95,0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      p.trail.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.stroke();
    }
  }

  function drawMatchups() {
    if (!state.reads.length) return;
    for (const read of state.reads.slice(0, 3)) {
      const defender = state.defense.find((d) => d.id === read.defender);
      ctx.strokeStyle = read.id === state.reads[0].id ? "rgba(83,192,122,0.62)" : "rgba(245,242,233,0.16)";
      ctx.lineWidth = read.id === state.reads[0].id ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(read.player.x, read.player.y);
      ctx.lineTo(defender.x, defender.y);
      ctx.stroke();
    }
  }

  function drawPlayer(p, side) {
    const color = side === "offense" ? "#f5f2e9" : "#24313a";
    const stroke = side === "offense" ? "#101316" : p.trait === "rush" ? "#e7bf5a" : "#e8685f";
    const radius = p.id === "QB" ? 17 : 15;
    const length = p.id === "QB" ? 40 : 36;
    const width = p.id === "QB" ? 25 : 22;
    ctx.fillStyle = color;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.beginPath();
    roundedRectPath(ctx, -length * 0.42, -width * 0.5, length, width, radius * 0.35);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = side === "offense" ? "#d7d1c3" : "#3c4c56";
    ctx.beginPath();
    ctx.arc(length * 0.36, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = side === "offense" ? "rgba(16,19,22,0.8)" : "rgba(245,242,233,0.72)";
    ctx.lineWidth = 2;
    const leg = Math.sin(p.stride) * 4;
    ctx.beginPath();
    ctx.moveTo(-length * 0.2, -width * 0.48);
    ctx.lineTo(-length * 0.36, -width * 0.64 - leg);
    ctx.moveTo(-length * 0.2, width * 0.48);
    ctx.lineTo(-length * 0.36, width * 0.64 + leg);
    ctx.stroke();
    if (p.cutFlash > 0) {
      ctx.strokeStyle = "rgba(231,191,90,0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 24, -0.4, 0.8);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = side === "offense" ? "#101316" : "#f5f2e9";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.id, p.x, p.y + 1);
  }

  function roundedRectPath(targetCtx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    targetCtx.moveTo(x + radius, y);
    targetCtx.lineTo(x + w - radius, y);
    targetCtx.quadraticCurveTo(x + w, y, x + w, y + radius);
    targetCtx.lineTo(x + w, y + h - radius);
    targetCtx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    targetCtx.lineTo(x + radius, y + h);
    targetCtx.quadraticCurveTo(x, y + h, x, y + h - radius);
    targetCtx.lineTo(x, y + radius);
    targetCtx.quadraticCurveTo(x, y, x + radius, y);
  }

  function drawHud() {
    ctx.fillStyle = "rgba(16,19,22,0.84)";
    ctx.fillRect(70, 72, 470, 92);
    ctx.fillStyle = "#e7bf5a";
    ctx.font = "bold 18px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${activePlay().name} vs ${activeDefense().name}`, 88, 101);
    ctx.fillStyle = "#aeb7b4";
    ctx.font = "14px Segoe UI, sans-serif";
    const editHelp = state.addPoint ? "フィールドのルート上をクリックして中間点を追加" : "白い点をドラッグしてルートを変える";
    ctx.fillText(state.edit ? editHelp : `投球 ${state.throwTime.toFixed(2)} 秒。緑線が1st down`, 88, 127);
    if (state.reads.length) {
      ctx.fillText(`Read: ${state.reads.map((r) => `${r.id} ${Math.round(r.score)}`).join(" / ")}`, 88, 149);
    }
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

  function drawCatchMarker() {
    if (!state.catchInfo) return;
    ctx.fillStyle = "rgba(83,192,122,0.14)";
    ctx.strokeStyle = "rgba(83,192,122,0.82)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.catchInfo.x, state.catchInfo.y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f5f2e9";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CATCH", state.catchInfo.x, state.catchInfo.y - 31);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawField();
    drawRoutes();
    drawTrails();
    drawMatchups();
    state.defense.forEach((p) => drawPlayer(p, "defense"));
    state.offense.forEach((p) => drawPlayer(p, "offense"));
    drawBall();
    drawCatchMarker();
    drawHud();
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * W, y: ((event.clientY - rect.top) / rect.height) * H };
  }

  function addPointNear(pos) {
    let best = null;
    for (const p of baseOffense) {
      if (p.id === "QB") continue;
      const pts = routeAbs(p.id);
      for (let i = 0; i < pts.length - 1; i += 1) {
        const a = pts[i];
        const b = pts[i + 1];
        const len2 = Math.max(1, (b.x - a.x) ** 2 + (b.y - a.y) ** 2);
        const t = Math.max(0, Math.min(1, ((pos.x - a.x) * (b.x - a.x) + (pos.y - a.y) * (b.y - a.y)) / len2));
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const dist = Math.hypot(pos.x - x, pos.y - y);
        if (!best || dist < best.dist) best = { id: p.id, index: i + 1, x: pos.x, y: pos.y, dist };
      }
    }
    if (!best || best.dist > 28) return false;
    const origin = baseOffense.find((p) => p.id === best.id);
    const rel = routeRelative(best.id);
    rel.splice(best.index, 0, [best.x - origin.x, best.y - origin.y]);
    state.routeOverrides[best.id] = rel;
    return true;
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.edit || state.running) return;
    const pos = pointerPos(event);
    if (state.addPoint && addPointNear(pos)) {
      draw();
      return;
    }
    for (const p of baseOffense) {
      if (p.id === "QB") continue;
      const pts = routeAbs(p.id);
      for (let i = 1; i < pts.length; i += 1) {
        if (Math.hypot(pos.x - pts[i].x, pos.y - pts[i].y) < 24) {
          state.dragging = { id: p.id, index: i };
          canvas.setPointerCapture(event.pointerId);
          return;
        }
      }
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) return;
    const pos = pointerPos(event);
    setRoutePoint(state.dragging.id, state.dragging.index, pos.x, pos.y);
    draw();
  });

  canvas.addEventListener("pointerup", () => {
    state.dragging = null;
  });

  snapButton.addEventListener("click", startSnap);
  resetButton.addEventListener("click", () => {
    state.routeOverrides = {};
    state.down = 2;
    state.distance = 6;
    state.ballOn = 38;
    state.drive = 1;
    resetFormation();
  });
  editButton.addEventListener("click", () => {
    state.edit = !state.edit;
    editButton.setAttribute("aria-pressed", String(state.edit));
    if (!state.edit) {
      state.addPoint = false;
      addPointButton.setAttribute("aria-pressed", "false");
    }
    updateTopline();
    draw();
  });
  addPointButton.addEventListener("click", () => {
    state.addPoint = !state.addPoint;
    if (state.addPoint && !state.edit) {
      state.edit = true;
      editButton.setAttribute("aria-pressed", "true");
    }
    addPointButton.setAttribute("aria-pressed", String(state.addPoint));
    updateTopline();
    draw();
  });
  throwSlider.addEventListener("input", () => {
    state.throwTime = Number(throwSlider.value);
    throwValue.textContent = `${state.throwTime.toFixed(2)}s`;
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
        selectedDefense: activeDefense().name,
        running: state.running,
        throwTime: state.throwTime,
        down: state.down,
        distance: state.distance,
        ballOn: state.ballOn,
        result: state.result,
        reads: state.reads.map((r) => ({ id: r.id, score: Math.round(r.score), separation: Math.round(r.separation) })),
      };
    },
    snap: startSnap,
    setPlay,
    setDefense,
    finishFast() {
      if (!state.running) startSnap();
      for (let i = 0; i < 420 && state.running; i += 1) update(1 / 60);
      draw();
      return state.result;
    },
  };

  renderPlayList();
  renderDefenseList();
  throwValue.textContent = `${state.throwTime.toFixed(2)}s`;
  resetFormation();
})();
