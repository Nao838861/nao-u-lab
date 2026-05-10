const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game", "tide_loom", "v002", "game.js"), "utf8");

function makeElement(id) {
  return {
    id,
    textContent: "",
    classList: {
      add() {},
      remove() {},
      contains() { return false; },
    },
    addEventListener() {},
  };
}

function makeContext() {
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
    moveTo() {},
    lineTo() {},
  };
}

const elements = new Map();
for (const id of ["game", "overlay", "overlayText", "startButton"]) elements.set(id, makeElement(id));
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
  window: { addEventListener() {} },
  Math,
  performance: { now: () => 1000 },
  requestAnimationFrame() {},
});
context.globalThis = context;
vm.runInContext(source, context, { filename: "game/tide_loom/v002/game.js" });

const api = context.window.__tideLoomV2;
api.start();
const before = api.snapshot();
api.step(120);
const afterCoast = api.snapshot();

api.setKey(" ", true);
api.step(170);
api.setKey(" ", false);
const afterReel = api.snapshot();

api.setKey("Shift", true);
api.step(170);
api.setKey("Shift", false);
const afterSlack = api.snapshot();

const report = {
  before,
  afterCoast,
  afterReel,
  afterSlack,
  predictionExists: before.predictionCount > 40,
  trailBuilds: afterCoast.trailCount > 20,
  reelShortensRestLength: afterReel.restLength < afterCoast.restLength,
  reelPullsInward: afterReel.radius < afterCoast.radius,
  reelCreatesTension: afterReel.stretch > 5,
  slackLengthensRestLength: afterSlack.restLength > afterReel.restLength,
  slackLetsOutwardMotion: afterSlack.radius > afterReel.radius,
  slackReducesTension: afterSlack.stretch < afterReel.stretch,
};

console.log(JSON.stringify(report, null, 2));

if (
  !report.predictionExists ||
  !report.trailBuilds ||
  !report.reelShortensRestLength ||
  !report.reelPullsInward ||
  !report.reelCreatesTension ||
  !report.slackLengthensRestLength ||
  !report.slackLetsOutwardMotion ||
  !report.slackReducesTension
) {
  process.exit(1);
}
