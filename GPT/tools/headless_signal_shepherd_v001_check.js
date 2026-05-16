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
    classList: {
      add() {},
      remove() {},
      contains() { return false; },
    },
    addEventListener(type, handler) {
      addListener(id, type, handler);
    },
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
for (const id of ["game", "overlay", "overlayText", "startButton"]) {
  elements.set(id, makeElement(id));
}
elements.get("game").width = 960;
elements.get("game").height = 720;
elements.get("game").getContext = () => makeContext();

const context = vm.createContext({
  console,
  document: {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeElement(id));
      return elements.get(id);
    },
  },
  window: {
    addEventListener(type, handler) {
      addListener("window", type, handler);
    },
  },
  Math,
  performance: { now: () => 1000 },
  requestAnimationFrame() {},
});
context.globalThis = context;

vm.runInContext(source, context, { filename: "game/signal_shepherd/v001/game.js" });

const api = context.window.__signalShepherdV1;
const before = api.snapshot();
api.start();
api.setKey("ArrowRight", true);
api.step(60);
api.setKey("ArrowRight", false);
const afterMove = api.snapshot();
api.flip();
const afterFlip = api.snapshot();
api.forceMoteToGate(0);
const afterDelivery = api.snapshot();
api.forceDeliverAll();
const afterComplete = api.snapshot();
api.reset();
api.start();
api.forceMoteToHazard(0);
const afterHazard = api.snapshot();

const report = {
  before,
  afterMove,
  afterFlip,
  afterDelivery,
  afterComplete,
  afterHazard,
  predictionExists: before.predictionCount > 10,
  movementWorks: afterMove.beacon.x > before.beacon.x,
  polarityFlips: afterFlip.polarity === -before.polarity,
  deliveryWorks: afterDelivery.score >= 1,
  completeWorks: afterComplete.complete && !afterComplete.running,
  hazardFails: afterHazard.failed && !afterHazard.running,
};

console.log(JSON.stringify(report, null, 2));

if (!report.predictionExists || !report.movementWorks || !report.polarityFlips || !report.deliveryWorks || !report.completeWorks || !report.hazardFails) {
  process.exit(1);
}
