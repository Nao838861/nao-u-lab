const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "gap_dash", "v001", "game.js"), "utf8");

function makeElement(id) {
  return {
    id,
    textContent: "",
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener() {},
  };
}

function makeContext() {
  return {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "left",
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fillText() {},
  };
}

const elements = new Map();
for (const id of ["game", "overlay", "overlayText", "startButton"]) elements.set(id, makeElement(id));
elements.get("game").width = 720;
elements.get("game").height = 900;
elements.get("game").getContext = () => makeContext();

const context = vm.createContext({
  console,
  document: { getElementById(id) { return elements.get(id) || makeElement(id); } },
  window: { addEventListener() {} },
  Math,
  performance: { now: () => 1000 },
  requestAnimationFrame() {},
});
context.globalThis = context;
vm.runInContext(source, context, { filename: "game/gap_dash/v001/game.js" });

const api = context.window.__gapDashV1;
const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

const config = {
  fixedDt: 1 / 120,
  playerSize: 28,
  speed: 205,
  dashSpeed: 520,
  dashTime: 0.14,
  dashCooldown: 0.55,
  carWidth: 82,
  carHeight: 34,
  width: 720,
  height: 900,
  goalY: 52,
};

const laneDefs = [
  { y: 708, speed: 132, dir: 1, phase: 0, gap: 230 },
  { y: 598, speed: 164, dir: -1, phase: 70, gap: 250 },
  { y: 488, speed: 190, dir: 1, phase: 140, gap: 240 },
  { y: 378, speed: 152, dir: -1, phase: 30, gap: 220 },
  { y: 268, speed: 176, dir: 1, phase: 110, gap: 245 },
  { y: 158, speed: 138, dir: -1, phase: 190, gap: 235 },
];

function clearKeys() {
  for (const key of keys) api.setKey(key, false);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectHit(ax, ay, aw, ah, bx, by, bw, bh) {
  return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
}

function carsAt(time) {
  const cars = [];
  for (const lane of laneDefs) {
    for (let i = -1; i < 5; i += 1) {
      let x = lane.phase + i * lane.gap + lane.dir * lane.speed * time;
      x = ((x % (config.width + lane.gap)) + (config.width + lane.gap)) % (config.width + lane.gap) - lane.gap / 2;
      cars.push({ x, y: lane.y, w: config.carWidth, h: config.carHeight });
    }
  }
  return cars;
}

function dangerAt(time, x, y, marginX = 10, marginY = 8) {
  return carsAt(time).some((car) => rectHit(x, y, config.playerSize, config.playerSize, car.x, car.y, car.w + marginX, car.h + marginY));
}

function nearDanger(snap) {
  return snap.cars.some((car) => Math.abs(car.y - snap.player.y) < 54 && Math.abs(car.x - snap.player.x) < 110);
}

function nextLane(y) {
  return laneDefs.find((lane) => y > lane.y + 38) || null;
}

function crossingSafe(snap, x, useDash) {
  let time = snap.time;
  let y = snap.player.y;
  let dashTimer = useDash && snap.dashReady ? config.dashTime : 0;
  const lane = nextLane(y);
  const targetY = lane ? lane.y - 42 : config.goalY + 18;

  for (let i = 0; i < 110; i += 1) {
    time += config.fixedDt;
    const speed = dashTimer > 0 ? config.dashSpeed : config.speed;
    dashTimer = Math.max(0, dashTimer - config.fixedDt);
    y = clamp(y - speed * config.fixedDt, 34, config.height - 34);
    if (dangerAt(time, x, y, 8, 4)) return false;
    if (y <= targetY) return true;
  }
  return false;
}

function laneClearanceScore(time, lane, x) {
  let score = 0;
  for (const car of carsAt(time).filter((candidate) => candidate.y === lane.y)) {
    const dx = Math.abs(car.x - x);
    if (dx < 132) score -= (132 - dx) * 4;
    else score += Math.min(dx, 220) * 0.1;
  }
  return score - Math.abs(x - config.width / 2) * 0.03;
}

function targetGapX(snap, lane) {
  let bestX = snap.player.x;
  let bestScore = -Infinity;
  for (let x = 42; x <= config.width - 42; x += 18) {
    let score = 0;
    for (let i = 0; i < 70; i += 10) score += laneClearanceScore(snap.time + i * config.fixedDt, lane, x);
    if (crossingSafe(snap, x, snap.dashReady)) score += 900;
    if (score > bestScore) {
      bestScore = score;
      bestX = x;
    }
  }
  return bestX;
}

function chooseAction(snap) {
  const lane = nextLane(snap.player.y);
  if (!lane) return { key: "ArrowUp", dash: snap.dashReady };

  if (crossingSafe(snap, snap.player.x, snap.dashReady)) return { key: "ArrowUp", dash: snap.dashReady };

  const targetX = targetGapX(snap, lane);
  if (Math.abs(targetX - snap.player.x) > 9) {
    return { key: targetX < snap.player.x ? "ArrowLeft" : "ArrowRight", dash: false };
  }
  return { key: null, dash: false };
}

function run(maxFrames = 12000) {
  api.reset();
  api.start();
  let dashed = false;
  let passedNearDanger = false;
  const timeline = [];

  for (let frame = 0; frame < maxFrames; frame += 6) {
    const snap = api.snapshot();
    if (nearDanger(snap)) passedNearDanger = true;
    if (frame % 600 === 0 || !snap.running) {
      timeline.push({ frame, time: snap.time, player: snap.player, dashReady: snap.dashReady });
    }
    if (!snap.running) return { final: snap, dashed, nearDanger: passedNearDanger, timeline };

    const action = chooseAction(snap);
    clearKeys();
    if (action.key) api.setKey(action.key, true);
    if (action.dash && snap.dashReady) {
      api.dash();
      dashed = true;
    }
    api.step(6);
  }

  return { final: api.snapshot(), dashed, nearDanger: passedNearDanger, timeline };
}

const result = run();
const report = {
  final: result.final,
  cleared: result.final.complete,
  survived: !result.final.failed,
  dashed: result.dashed,
  nearDanger: result.nearDanger,
  timeline: result.timeline,
};

console.log(JSON.stringify(report, null, 2));

if (!report.cleared || !report.survived || !report.dashed || !report.nearDanger) process.exit(1);
