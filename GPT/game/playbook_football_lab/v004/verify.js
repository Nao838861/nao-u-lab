const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const js = fs.readFileSync("game.js", "utf8");

const checks = [
  ["canvas exists", html.includes('<canvas id="field"')],
  ["throw slider exists", html.includes('id="throwSlider"')],
  ["defense list exists", html.includes('id="defenseList"')],
  ["add point button exists", html.includes('id="addPointButton"')],
  ["three plays", (js.match(/name: "/g) || []).length >= 6],
  ["defense calls", js.includes("defenseCalls") && js.includes("Edge Blitz")],
  ["throw timing", js.includes("throwSlider") && js.includes("throwTime")],
  ["longer play timing", html.includes('value="2.2"') && js.includes("routeDuration = 3.6") && js.includes("maxPlayTime = 6.2")],
  ["route point editing", js.includes("addPointNear") && js.includes("setRoutePoint")],
  ["drive advancement", js.includes("advanceDrive") && js.includes("state.down")],
  ["analysis reads", js.includes("evaluateReceivers") && js.includes("QB評価")],
  ["catch clarity", js.includes("resolveCatch") && js.includes("finishRunAfterCatch") && js.includes("CATCH")],
  ["player orientation", js.includes("angleLerp") && js.includes("backpedalToward") && js.includes("cutFlash")],
  ["read game", js.includes("chooseActualDefense") && js.includes("gradeCall") && js.includes("Coach")],
  ["football contact", js.includes("finishSack") && js.includes("hitPenalty") && js.includes("sackRadius")],
  ["round player markers", js.includes("ctx.arc(0, 0, radius") && !js.includes("roundedRectPath")],
  ["pass protection", js.includes("baseLine") && js.includes("updatePassProtection") && js.includes("pocketWidth")],
  ["responsive CSS", css.includes("@media")],
  ["debug snapshot", js.includes("window.__playbookLab")],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "ok" : "ng"} ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) process.exit(1);
