const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "tide_loom", "v001", "game.js"), "utf8");

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
    moveTo() {},
    lineTo() {},
    setLineDash() {},
  };
}

const elements = new Map();
for (const id of ["game", "overlay", "overlayText", "startButton"]) {
  elements.set(id, makeElement(id));
}
elements.get("game").width = 900;
elements.get("game").height = 900;
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

vm.runInContext(source, context, { filename: "game/tide_loom/v001/game.js" });

const api = context.window.__tideLoomV1;
api.start();
const before = api.snapshot();
api.step(120);
const afterCoast = api.snapshot();

api.setKey(" ", true);
api.step(80);
api.setKey(" ", false);
const afterReel = api.snapshot();

api.setKey("Shift", true);
api.step(80);
api.setKey("Shift", false);
const afterSlack = api.snapshot();

api.forceCollectAll();
api.forceAtHarbor();
const afterComplete = api.snapshot();

api.reset();
api.start();
api.forceOffscreen();
const afterOffscreen = api.snapshot();

const report = {
  before,
  afterCoast,
  afterReel,
  afterSlack,
  afterComplete,
  afterOffscreen,
  predictionExists: before.predictionCount > 40,
  motionChangesRadius: Math.abs(afterCoast.radius - before.radius) > 2,
  reelShortens: afterReel.ropeTarget < afterCoast.ropeTarget,
  slackLengthens: afterSlack.ropeTarget > afterReel.ropeTarget,
  canComplete: afterComplete.complete,
  offscreenResets: !afterOffscreen.running && afterOffscreen.time === 0 && afterOffscreen.collected === 0,
};

console.log(JSON.stringify(report, null, 2));

if (!report.predictionExists || !report.motionChangesRadius || !report.reelShortens || !report.slackLengthens || !report.canComplete || !report.offscreenResets) {
  process.exit(1);
}
