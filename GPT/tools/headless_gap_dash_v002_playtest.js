const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "gap_dash", "v002", "game.js"), "utf8");

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
vm.runInContext(source, context, { filename: "game/gap_dash/v002/game.js" });

const api = context.window.__gapDashV2;
const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

const config = {
  fixedDt: 1 / 120,
  playerSize: 28,
  speed: 188,
  dashSpeed: 740,
  dashTime: 0.25,
  width: 720,
  height: 900,
  carWidth: 86,
  carHeight: 34,
  goalY: 66,
};

const stages = [
  {
    lanes: [
      { y: 682, speed: 108, dir: 1, phase: 40, gap: 340 },
      { y: 518, speed: 124, dir: -1, phase: 130, gap: 350 },
      { y: 354, speed: 116, dir: 1, phase: 220, gap: 344 },
    ],
  },
  {
    lanes: [
      { y: 708, speed: 124, dir: 1, phase: 20, gap: 322 },
      { y: 584, speed: 146, dir: -1, phase: 160, gap: 334 },
      { y: 460, speed: 136, dir: 1, phase: 70, gap: 326 },
      { y: 298, speed: 156, dir: -1, phase: 230, gap: 342 },
    ],
  },
  {
    lanes: [
      { y: 700, speed: 132, dir: 1, phase: 40, gap: 358 },
      { y: 530, speed: 152, dir: -1, phase: 150, gap: 372 },
      { y: 360, speed: 142, dir: 1, phase: 250, gap: 362 },
      { y: 190, speed: 158, dir: -1, phase: 90, gap: 376 },
    ],
  },
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

function carsAt(stageIndex, time) {
  const cars = [];
  for (const lane of stages[stageIndex].lanes) {
    for (let i = -1; i < 5; i += 1) {
      let x = lane.phase + i * lane.gap + lane.dir * lane.speed * time;
      x = ((x % (config.width + lane.gap)) + (config.width + lane.gap)) % (config.width + lane.gap) - lane.gap / 2;
      cars.push({ x, y: lane.y, w: config.carWidth, h: config.carHeight });
    }
  }
  return cars;
}

function dangerAt(stageIndex, time, x, y, marginX = 10, marginY = 4) {
  return carsAt(stageIndex, time).some((car) => rectHit(x, y, config.playerSize, config.playerSize, car.x, car.y, car.w + marginX, car.h + marginY));
}

function nextLane(stageIndex, y) {
  return stages[stageIndex].lanes.find((lane) => y > lane.y + 38) || null;
}

function crossingSafe(snap, x, useDash) {
  let time = snap.stageTime;
  let y = snap.player.y;
  let dashTimer = useDash && snap.dashReady ? config.dashTime : 0;
  const lane = nextLane(snap.stageIndex, y);
  const targetY = lane ? lane.y - 44 : config.goalY + 18;

  for (let i = 0; i < 120; i += 1) {
    time += config.fixedDt;
    const speed = dashTimer > 0 ? config.dashSpeed : config.speed;
    dashTimer = Math.max(0, dashTimer - config.fixedDt);
    y = clamp(y - speed * config.fixedDt, 34, config.height - 34);
    if (dangerAt(snap.stageIndex, time, x, y)) return false;
    if (y <= targetY) return true;
  }
  return false;
}

function targetGapX(snap, lane) {
  let bestX = snap.player.x;
  let bestScore = -Infinity;
  for (let x = 42; x <= config.width - 42; x += 18) {
    let score = -Math.abs(x - config.width / 2) * 0.04;
    for (const car of carsAt(snap.stageIndex, snap.stageTime)) {
      if (car.y !== lane.y) continue;
      const dx = Math.abs(car.x - x);
      score += dx < 150 ? -(150 - dx) * 3 : Math.min(dx, 230) * 0.12;
    }
    if (crossingSafe(snap, x, true)) score += 1200;
    if (score > bestScore) {
      bestScore = score;
      bestX = x;
    }
  }
  return bestX;
}

function chooseAction(snap) {
  const lane = nextLane(snap.stageIndex, snap.player.y);
  if (!lane) return { key: "ArrowUp", dash: snap.dashReady };
  if (crossingSafe(snap, snap.player.x, true)) return { key: "ArrowUp", dash: snap.dashReady };
  const targetX = targetGapX(snap, lane);
  if (Math.abs(targetX - snap.player.x) > 9) return { key: targetX < snap.player.x ? "ArrowLeft" : "ArrowRight", dash: false };
  return { key: null, dash: false };
}

function run(maxFrames = 24000) {
  api.reset();
  api.start();
  let nearDanger = false;
  const stageVisits = new Set();
  const timeline = [];

  for (let frame = 0; frame < maxFrames; frame += 6) {
    const snap = api.snapshot();
    stageVisits.add(snap.stageIndex);
    if (snap.cars.some((car) => Math.abs(car.y - snap.player.y) < 56 && Math.abs(car.x - snap.player.x) < 116)) nearDanger = true;
    if (frame % 900 === 0 || !snap.running) timeline.push({ frame, time: snap.time, stageIndex: snap.stageIndex, player: snap.player, dashCount: snap.dashCount });
    if (!snap.running) return { final: snap, nearDanger, stageVisits: [...stageVisits], timeline };

    const action = chooseAction(snap);
    clearKeys();
    if (action.key) api.setKey(action.key, true);
    if (action.dash) api.dash();
    api.step(6);
  }
  return { final: api.snapshot(), nearDanger, stageVisits: [...stageVisits], timeline };
}

const result = run();
const report = {
  final: result.final,
  cleared: result.final.complete,
  survived: !result.final.failed,
  usedDash: result.final.dashCount >= 3,
  nearDanger: result.nearDanger,
  stageVisits: result.stageVisits,
  timeline: result.timeline,
};

console.log(JSON.stringify(report, null, 2));

if (!report.cleared || !report.survived || !report.usedDash || !report.nearDanger || report.stageVisits.length < 3) process.exit(1);
