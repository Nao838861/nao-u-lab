const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "dockhand_dash", "v001", "game.js"), "utf8");

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
elements.get("game").height = 640;
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
vm.runInContext(source, context, { filename: "game/dockhand_dash/v001/game.js" });

const api = context.window.__dockhandDashV1;
const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

function clearKeys() {
  for (const key of keys) api.setKey(key, false);
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function chooseTarget(snap) {
  if (snap.carrying !== null) {
    const crate = snap.crates[snap.carrying];
    return snap.docks[crate.dock];
  }
  const open = snap.crates.filter((crate) => !crate.delivered);
  open.sort((a, b) => dist(snap.player, a) - dist(snap.player, b));
  return open[0];
}

function steer(snap, target) {
  let vx = target.x - snap.player.x;
  let vy = target.y - snap.player.y;
  for (const cart of snap.carts) {
    const d = Math.max(1, dist(snap.player, cart));
    if (d < 120) {
      const push = (120 - d) * 4.6;
      vx += ((snap.player.x - cart.x) / d) * push;
      vy += ((snap.player.y - cart.y) / d) * push;
    }
  }
  clearKeys();
  if (Math.abs(vx) > 10) api.setKey(vx > 0 ? "ArrowRight" : "ArrowLeft", true);
  if (Math.abs(vy) > 10) api.setKey(vy > 0 ? "ArrowDown" : "ArrowUp", true);
}

function run(maxFrames = 9000) {
  api.reset();
  api.start();
  let carriedAtLeastOnce = false;
  let avoidedCartNear = false;
  const timeline = [];
  let lastDelivered = 0;

  for (let frame = 0; frame < maxFrames; frame += 6) {
    const snap = api.snapshot();
    if (snap.carrying !== null) carriedAtLeastOnce = true;
    if (snap.carts.some((cart) => dist(snap.player, cart) < 130)) avoidedCartNear = true;
    if (snap.delivered !== lastDelivered || frame % 600 === 0 || !snap.running) {
      timeline.push({
        frame,
        time: snap.time,
        delivered: snap.delivered,
        carrying: snap.carrying,
        player: snap.player,
      });
      lastDelivered = snap.delivered;
    }
    if (!snap.running) return { final: snap, carriedAtLeastOnce, avoidedCartNear, timeline };
    steer(snap, chooseTarget(snap));
    api.step(6);
  }
  return { final: api.snapshot(), carriedAtLeastOnce, avoidedCartNear, timeline };
}

const result = run();
const report = {
  final: result.final,
  cleared: result.final.complete,
  survived: !result.final.failed,
  carriedAtLeastOnce: result.carriedAtLeastOnce,
  avoidedCartNear: result.avoidedCartNear,
  timeline: result.timeline,
};

console.log(JSON.stringify(report, null, 2));

if (!report.cleared || !report.survived || !report.carriedAtLeastOnce || !report.avoidedCartNear) {
  process.exit(1);
}
