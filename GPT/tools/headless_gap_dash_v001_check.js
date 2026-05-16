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
const before = api.snapshot();
api.start();
api.step(240);
const afterIdle = api.snapshot();
api.setKey("ArrowUp", true);
api.step(60);
api.setKey("ArrowUp", false);
const afterMove = api.snapshot();
api.setKey("ArrowUp", true);
api.dash();
api.step(20);
api.setKey("ArrowUp", false);
const afterDash = api.snapshot();

api.reset();
api.start();
api.setKey("ArrowUp", true);
api.step(4000);
api.setKey("ArrowUp", false);
const afterHitOrGoal = api.snapshot();

const report = {
  before,
  afterIdle,
  afterMove,
  afterDash,
  afterHitOrGoal,
  safeStart: afterIdle.running && !afterIdle.failed,
  movementWorks: afterMove.player.y < afterIdle.player.y,
  dashWorks: afterDash.player.y < afterMove.player.y - 20,
  hasFailureOrGoal: afterHitOrGoal.failed || afterHitOrGoal.complete,
};

console.log(JSON.stringify(report, null, 2));

if (!report.safeStart || !report.movementWorks || !report.dashWorks || !report.hasFailureOrGoal) process.exit(1);
