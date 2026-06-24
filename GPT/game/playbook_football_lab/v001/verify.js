const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const js = fs.readFileSync("game.js", "utf8");

const checks = [
  ["canvas exists", html.includes('<canvas id="field"')],
  ["snap button exists", html.includes('id="snapButton"')],
  ["edit button exists", html.includes('id="editButton"')],
  ["three plays", (js.match(/name: "/g) || []).length === 3],
  ["route editing", js.includes("routeOverrides") && js.includes("pointermove")],
  ["analysis result", js.includes("finishPlay") && js.includes("セパレーション")],
  ["responsive CSS", css.includes("@media")],
  ["debug snapshot", js.includes("window.__playbookLab")],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "ok" : "ng"} ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) process.exit(1);
