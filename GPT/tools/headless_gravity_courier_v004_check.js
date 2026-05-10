const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "gravity_courier", "v004", "game.js"), "utf8");

const listeners = new Map();
const frameQueue = [];
let now = 1000;

function addListener(target, type, handler) {
  const key = `${target}:${type}`;
  if (!listeners.has(key)) listeners.set(key, []);
  listeners.get(key).push(handler);
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
    textAlign: "left",
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

vm.runInContext(source, context, { filename: "game/gravity_courier/v004/game.js" });

const api = context.window.__gravityCourierV4;
api.start();
const before = api.snapshot();
api.step(120);
const afterCoast = api.snapshot();
api.setKey(" ", true);
api.step(12);
const duringRamp = api.snapshot();
api.step(180);
api.setKey(" ", false);
api.step(1);
const afterPrograde = api.snapshot();

api.forceObjectiveClear();
api.forceObjectiveClear();
api.forceObjectiveClear();
const afterObjectives = api.snapshot();

const report = {
  before,
  afterCoast,
  duringRamp,
  afterPrograde,
  afterObjectives,
  predictionExists: before.predictionCount > 20,
  movingGateMoves: Math.abs(afterCoast.activeGateAngle - before.activeGateAngle) > 0.05,
  moonUsesCircleCollision: before.activeShape === "moon" && before.activeHitRadius > 0,
  rampIsAnalog: duringRamp.thrustPower > 0 && duringRamp.thrustPower < 1,
  releaseCutsThrust: afterPrograde.thrustPower === 0,
  progradeAffectsMotion: Math.abs(afterPrograde.radius - before.radius) > 8,
  objectivesCanComplete: afterObjectives.complete && afterObjectives.objectiveIndex === 3,
};

console.log(JSON.stringify(report, null, 2));

if (!report.predictionExists || !report.movingGateMoves || !report.moonUsesCircleCollision || !report.rampIsAnalog || !report.releaseCutsThrust || !report.progradeAffectsMotion || !report.objectivesCanComplete) {
  process.exit(1);
}
