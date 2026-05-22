const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v53", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");

const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,draw,exportEvalLedger,constants:{W,H}};"
);

const ops = [];
let currentPath = [];
const ctx = {
  fillStyle: "",
  strokeStyle: "",
  globalAlpha: 1,
  lineWidth: 1,
  font: "",
  textAlign: "",
  fillRect(x, y, w, h) {
    ops.push({ type: "fillRect", fillStyle: this.fillStyle, alpha: this.globalAlpha, x, y, w, h });
  },
  strokeRect(x, y, w, h) {
    ops.push({ type: "strokeRect", strokeStyle: this.strokeStyle, alpha: this.globalAlpha, lineWidth: this.lineWidth, x, y, w, h });
  },
  beginPath() {
    currentPath = [];
  },
  moveTo(x, y) {
    currentPath.push({ cmd: "M", x, y });
  },
  lineTo(x, y) {
    currentPath.push({ cmd: "L", x, y });
  },
  arc(x, y, r) {
    currentPath.push({ cmd: "A", x, y, r });
  },
  ellipse(x, y, rx, ry) {
    currentPath.push({ cmd: "E", x, y, rx, ry });
  },
  closePath() {
    currentPath.push({ cmd: "Z" });
  },
  fill() {
    ops.push({ type: "fill", fillStyle: this.fillStyle, alpha: this.globalAlpha, commands: currentPath.slice() });
  },
  stroke() {
    ops.push({ type: "stroke", strokeStyle: this.strokeStyle, alpha: this.globalAlpha, lineWidth: this.lineWidth, commands: currentPath.slice() });
  },
  fillText(text, x, y) {
    ops.push({ type: "fillText", fillStyle: this.fillStyle, alpha: this.globalAlpha, text, x, y });
  },
};

const context = vm.createContext({
  console,
  Math,
  URLSearchParams,
  location: { search: "?seed=12345&bot=1&botStyle=route" },
  document: {
    getElementById(id) {
      return id === "c" ? { getContext: () => ctx } : { textContent: "" };
    },
  },
  window: { addEventListener() {} },
  requestAnimationFrame() {},
});
context.globalThis = context;
vm.runInContext(source, context, { filename: htmlPath });
const api = context.window.__check;

function runTo(frame) {
  api.startGame();
  api.state.player.iframe = 999999;
  while (api.state.t < frame && api.state.mode === "play") api.update();
  ops.length = 0;
  api.draw();
  const guideStrokes = ops.filter(
    (op) =>
      op.type === "stroke" &&
      (op.strokeStyle === "#ffd870" || op.strokeStyle === "#7ee7ff") &&
      op.alpha > 0 &&
      op.alpha <= 0.12 &&
      op.lineWidth === 2.2
  );
  const chevronLike = guideStrokes.filter(
    (op) =>
      op.commands.length === 3 &&
      op.commands[0]?.cmd === "M" &&
      op.commands[1]?.cmd === "L" &&
      op.commands[2]?.cmd === "L"
  );
  return {
    frame: api.state.t,
    activeGuides: api.state.guides.map((g) => ({
      kind: g.kind,
      paths: g.paths.length,
      alpha: g.alpha,
      lineWidth: g.lineWidth,
      chevrons: g.chevrons,
      t: g.t,
    })),
    guideStrokeCount: guideStrokes.length,
    guidePathStrokeCount: guideStrokes.filter((op) => op.commands.length === 4).length,
    chevronStrokeCount: chevronLike.length,
    nonBlankDrawOps: ops.length,
  };
}

const postMid = runTo(3090);
const crossLock = runTo(3890);
const ledger = api.exportEvalLedger();
const guideEvents = ledger.events.filter((e) => e.type === "crossLockGuide" || e.type === "postMidCrossGuide");

const report = {
  version: ledger.version,
  source: ledger.source,
  postMid,
  crossLock,
  guideEvents,
  nonBlank:
    postMid.nonBlankDrawOps > 100 &&
    crossLock.nonBlankDrawOps > 100,
  guidePathsOnly:
    postMid.activeGuides.some((g) => g.kind === "postMidCrossGuide" && g.paths === 2 && g.chevrons === false) &&
    crossLock.activeGuides.some((g) => g.kind === "crossLockGuide" && g.paths === 2 && g.chevrons === false) &&
    postMid.guideStrokeCount === 2 &&
    crossLock.guideStrokeCount === 2 &&
    postMid.guidePathStrokeCount === 2 &&
    crossLock.guidePathStrokeCount === 2 &&
    postMid.chevronStrokeCount === 0 &&
    crossLock.chevronStrokeCount === 0,
  ledgerChevronsOff:
    guideEvents.length === 2 &&
    guideEvents.every((e) => e.chevrons === false && e.alpha === 0.12 && e.lineWidth === 2.2 && e.paths === 2),
};

console.log(JSON.stringify(report, null, 2));
if (report.version !== "v05_1_cdx_v53" || !report.nonBlank || !report.guidePathsOnly || !report.ledgerChevronsOff) {
  process.exit(1);
}

