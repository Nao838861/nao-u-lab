const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "gravity_courier", "v001", "game.js"), "utf8");

const listeners = new Map();
const frameQueue = [];
let now = 1000;

function addListener(target, type, handler) {
  const key = `${target}:${type}`;
  if (!listeners.has(key)) listeners.set(key, []);
  listeners.get(key).push(handler);
}

function dispatch(target, type, event = {}) {
  const handlers = listeners.get(`${target}:${type}`) || [];
  const e = {
    key: event.key || "",
    preventDefault() {},
    ...event,
  };
  for (const handler of handlers) handler(e);
}

function makeElement(id) {
  const classes = new Set();
  return {
    id,
    textContent: "",
    style: {},
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    addEventListener(type, handler) {
      addListener(id, type, handler);
    },
  };
}

function makeContext() {
  const gradient = { addColorStop() {} };
  return {
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    clearRect() {},
    fillRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    fillText() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    createRadialGradient() { return gradient; },
  };
}

const elements = new Map();
for (const id of ["game", "overlay", "overlayText", "startButton"]) {
  elements.set(id, makeElement(id));
}
elements.get("game").width = 960;
elements.get("game").height = 640;
elements.get("game").getContext = () => makeContext();

const document = {
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  },
};

const window = {
  addEventListener(type, handler) {
    addListener("window", type, handler);
  },
};

const context = vm.createContext({
  console,
  document,
  window,
  Math,
  performance: { now: () => now },
  requestAnimationFrame(callback) {
    frameQueue.push(callback);
  },
});
context.globalThis = context;

vm.runInContext(source, context, { filename: "game/gravity_courier/v001/game.js" });

context.window.__gravityCourier.start();
const before = context.window.__gravityCourier.snapshot();
context.window.__gravityCourier.setKey(" ", true);
context.window.__gravityCourier.step(240);
context.window.__gravityCourier.setKey(" ", false);
const afterPrograde = context.window.__gravityCourier.snapshot();
context.window.__gravityCourier.setKey("Shift", true);
context.window.__gravityCourier.step(120);
context.window.__gravityCourier.setKey("Shift", false);
const afterRetrograde = context.window.__gravityCourier.snapshot();

const report = {
  before,
  afterPrograde,
  afterRetrograde,
  predictionExists: before.predictionCount > 20,
  progradeRaisesRadius: afterPrograde.radius > before.radius + 10,
  retrogradeChangesRadius: Math.abs(afterRetrograde.radius - afterPrograde.radius) > 2,
  stillRunning: afterRetrograde.running,
};

console.log(JSON.stringify(report, null, 2));

if (!report.predictionExists || !report.progradeRaisesRadius || !report.retrogradeChangesRadius || !report.stillRunning) {
  process.exit(1);
}
