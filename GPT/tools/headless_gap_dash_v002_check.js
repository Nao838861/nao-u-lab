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

api.start();
api.step(240);
const afterIdle = api.snapshot();
api.reset();
api.start();
api.setKey("ArrowRight", true);
api.dash();
api.step(10);
api.setKey("ArrowRight", false);
const afterDash = api.snapshot();

api.reset();
api.start();
api.setKey("ArrowUp", true);
api.step(4000);
api.setKey("ArrowUp", false);
const afterHitOrGoal = api.snapshot();

const report = {
  afterIdle,
  afterDash,
  afterHitOrGoal,
  safeStart: afterIdle.running && !afterIdle.failed,
  dashIsUpward: afterDash.player.y < afterIdle.player.y - 40,
  horizontalDuringDashIsLimited: Math.abs(afterDash.player.x - afterIdle.player.x) < 35,
  hasFailureOrGoal: afterHitOrGoal.failed || afterHitOrGoal.complete || afterHitOrGoal.stageIndex > 0,
};

console.log(JSON.stringify(report, null, 2));

if (!report.safeStart || !report.dashIsUpward || !report.horizontalDuringDashIsLimited || !report.hasFailureOrGoal) process.exit(1);
