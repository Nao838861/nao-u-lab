const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "signal_shepherd", "v001", "game.js"), "utf8");

const listeners = new Map();
function addListener(target, type, handler) {
  const key = `${target}:${type}`;
  if (!listeners.has(key)) listeners.set(key, []);
  listeners.get(key).push(handler);
}

function makeElement(id) {
  return {
    id,
    textContent: "",
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener(type, handler) { addListener(id, type, handler); },
  };
}

function makeContext() {
  return {
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    lineWidth: 1,
    font: "",
    textAlign: "left",
    clearRect() {},
    fillRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    fillText() {},
    moveTo() {},
    lineTo() {},
  };
}

const elements = new Map();
for (const id of ["game", "overlay", "overlayText", "startButton"]) elements.set(id, makeElement(id));
elements.get("game").width = 960;
elements.get("game").height = 720;
elements.get("game").getContext = () => makeContext();

const context = vm.createContext({
  console,
  document: { getElementById(id) { return elements.get(id) || makeElement(id); } },
  window: { addEventListener(type, handler) { addListener("window", type, handler); } },
  Math,
  performance: { now: () => 1000 },
  requestAnimationFrame() {},
});
context.globalThis = context;

vm.runInContext(source, context, { filename: "game/signal_shepherd/v001/game.js" });

const api = context.window.__signalShepherdV1;
const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

function clearKeys() {
  for (const key of keys) api.setKey(key, false);
}

function pressToward(from, to) {
  clearKeys();
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > 18) api.setKey(dx > 0 ? "ArrowRight" : "ArrowLeft", true);
  if (Math.abs(dy) > 18) api.setKey(dy > 0 ? "ArrowDown" : "ArrowUp", true);
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(x, y) {
  const len = Math.max(1, Math.hypot(x, y));
  return { x: x / len, y: y / len };
}

const config = {
  fixedDt: 1 / 120,
  beaconSpeed: 255,
  attract: 118,
  repel: 92,
  damping: 0.992,
  moteRadius: 11,
  gateRadius: 44,
  hazardRadius: 36,
  width: 960,
  height: 720,
};

const actions = [
  { dx: 0, dy: 0, polarity: 1 },
  { dx: -1, dy: 0, polarity: 1 },
  { dx: 1, dy: 0, polarity: 1 },
  { dx: 0, dy: -1, polarity: 1 },
  { dx: 0, dy: 1, polarity: 1 },
  { dx: -1, dy: -1, polarity: 1 },
  { dx: 1, dy: -1, polarity: 1 },
  { dx: -1, dy: 1, polarity: 1 },
  { dx: 1, dy: 1, polarity: 1 },
  { dx: 0, dy: 0, polarity: -1 },
  { dx: -1, dy: 0, polarity: -1 },
  { dx: 1, dy: 0, polarity: -1 },
  { dx: 0, dy: -1, polarity: -1 },
  { dx: 0, dy: 1, polarity: -1 },
  { dx: -1, dy: -1, polarity: -1 },
  { dx: 1, dy: -1, polarity: -1 },
  { dx: -1, dy: 1, polarity: -1 },
  { dx: 1, dy: 1, polarity: -1 },
];

function cloneSim(snap) {
  return {
    beacon: { x: snap.beacon.x, y: snap.beacon.y },
    motes: snap.motes.map((mote) => ({ ...mote })),
    gates: snap.gates,
    hazards: snap.hazards,
    failed: false,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function stepSim(sim, action) {
  let dx = action.dx;
  let dy = action.dy;
  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    sim.beacon.x = clamp(sim.beacon.x + (dx / len) * config.beaconSpeed * config.fixedDt, 36, config.width - 36);
    sim.beacon.y = clamp(sim.beacon.y + (dy / len) * config.beaconSpeed * config.fixedDt, 36, config.height - 36);
  }

  for (const mote of sim.motes) {
    if (mote.delivered) continue;
    const axBase = sim.beacon.x - mote.x;
    const ayBase = sim.beacon.y - mote.y;
    const distSq = Math.max(1600, axBase * axBase + ayBase * ayBase);
    const d = Math.sqrt(distSq);
    const strength = (action.polarity > 0 ? config.attract : -config.repel) * (90000 / distSq);
    mote.vx = (mote.vx + (axBase / d) * strength * config.fixedDt) * config.damping;
    mote.vy = (mote.vy + (ayBase / d) * strength * config.fixedDt) * config.damping;
    mote.x += mote.vx * config.fixedDt;
    mote.y += mote.vy * config.fixedDt;

    if (mote.x < config.moteRadius || mote.x > config.width - config.moteRadius) {
      mote.vx *= -0.88;
      mote.x = clamp(mote.x, config.moteRadius, config.width - config.moteRadius);
    }
    if (mote.y < config.moteRadius || mote.y > config.height - config.moteRadius) {
      mote.vy *= -0.88;
      mote.y = clamp(mote.y, config.moteRadius, config.height - config.moteRadius);
    }

    for (const hazard of sim.hazards) {
      if (dist(mote, hazard) < config.hazardRadius + config.moteRadius) sim.failed = true;
    }
    if (dist(mote, sim.gates[mote.gate]) < config.gateRadius) mote.delivered = true;
  }
}

function heuristic(sim) {
  if (sim.failed) return 1_000_000;
  let value = 0;
  for (const mote of sim.motes) {
    if (mote.delivered) {
      value -= 2000;
      continue;
    }
    const gate = sim.gates[mote.gate];
    value += dist(mote, gate) * 3;
    value += Math.hypot(mote.vx, mote.vy) * 0.08;
    for (const hazard of sim.hazards) {
      const margin = dist(mote, hazard) - (config.hazardRadius + config.moteRadius);
      if (margin < 70) value += (70 - margin) * (70 - margin) * 0.8;
    }
  }
  return value;
}

function chooseAction(snap) {
  let best = null;
  for (const action of actions) {
    const sim = cloneSim(snap);
    for (let i = 0; i < 45; i += 1) stepSim(sim, action);
    const score = heuristic(sim);
    if (!best || score < best.score) best = { action, score };
  }
  return best.action;
}

function runPlaytest(maxFrames = 12000) {
  api.reset();
  api.start();
  const timeline = [];
  let lastScore = 0;
  let usedAttract = false;
  let usedRepel = false;
  let maxActive = 0;

  for (let frame = 0; frame < maxFrames; frame += 1) {
    const snap = api.snapshot();
    maxActive = Math.max(maxActive, snap.activeMotes);
    if (snap.score !== lastScore || frame % 600 === 0) {
      timeline.push({
        frame,
        time: snap.time,
        score: snap.score,
        activeMotes: snap.activeMotes,
        polarity: snap.polarity,
        beacon: snap.beacon,
        motes: snap.motes.filter((mote) => !mote.delivered).map((mote) => ({
          index: mote.index,
          x: mote.x,
          y: mote.y,
          gate: mote.gate,
        })),
      });
      lastScore = snap.score;
    }
    if (!snap.running) return { final: snap, timeline, usedAttract, usedRepel, maxActive };

    const action = chooseAction(snap);
    if (snap.polarity !== action.polarity) api.flip();
    if (action.polarity > 0) usedAttract = true;
    else usedRepel = true;
    clearKeys();
    if (action.dx < 0) api.setKey("ArrowLeft", true);
    if (action.dx > 0) api.setKey("ArrowRight", true);
    if (action.dy < 0) api.setKey("ArrowUp", true);
    if (action.dy > 0) api.setKey("ArrowDown", true);
    api.step(8);
    frame += 7;
  }

  return { final: api.snapshot(), timeline, usedAttract, usedRepel, maxActive };
}

const result = runPlaytest();
const report = {
  final: result.final,
  usedAttract: result.usedAttract,
  usedRepel: result.usedRepel,
  maxActive: result.maxActive,
  cleared: result.final.complete,
  survived: !result.final.failed,
  timeline: result.timeline,
};

console.log(JSON.stringify(report, null, 2));

if (!report.cleared || !report.usedAttract || !report.usedRepel || report.maxActive < 3) {
  process.exit(1);
}
