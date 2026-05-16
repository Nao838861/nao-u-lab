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
const before = api.snapshot();
api.start();
api.setKey("ArrowRight", true);
api.step(60);
api.setKey("ArrowRight", false);
const afterMove = api.snapshot();

api.reset();
api.start();
api.setKey("ArrowLeft", true);
api.setKey("ArrowUp", true);
api.step(135);
api.setKey("ArrowLeft", false);
api.setKey("ArrowUp", false);
const afterPickup = api.snapshot();

api.setKey("ArrowLeft", true);
api.step(130);
api.setKey("ArrowLeft", false);
api.setKey("ArrowUp", true);
api.step(28);
api.setKey("ArrowUp", false);
const afterDeliver = api.snapshot();

const report = {
  before,
  afterMove,
  afterPickup,
  afterDeliver,
  movementWorks: afterMove.player.x > before.player.x,
  pickupWorks: afterPickup.carrying !== null,
  deliverWorks: afterDeliver.delivered >= 1 && afterDeliver.carrying === null,
  directCarryReadable: before.crates.length === before.docks.length && before.crates.every((crate) => before.docks[crate.dock]),
};

console.log(JSON.stringify(report, null, 2));

if (!report.movementWorks || !report.pickupWorks || !report.deliverWorks || !report.directCarryReadable) {
  process.exit(1);
}
