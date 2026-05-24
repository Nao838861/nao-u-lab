const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v79";
const gameDir = path.join(root, "game", "graze_log_cdx", version);
const htmlPath = path.join(gameDir, "index.html");
const packetPath = path.join(gameDir, "review_packet.html");
const html = fs.readFileSync(htmlPath, "utf8");
const packetHtml = fs.readFileSync(packetPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");
const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,exportEvalLedger,summarizeEvalTelemetry};"
);

const seeds = [12345, 54321, 77777];
const policies = ["route", "camper", "panic", "novice"];
const lags = [0, 6, 14];
const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (!chrome) throw new Error("Chrome or Edge executable not found");

function fileUrl(p) {
  return `file:///${p.replace(/\\/g, "/").replace(/ /g, "%20")}`;
}

function makeCtx() {
  return {
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    lineWidth: 1,
    font: "",
    textAlign: "",
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    arc() {},
    ellipse() {},
    fill() {},
    stroke() {},
    fillText() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
  };
}

function makeVm(seed, policy, lag) {
  const context = vm.createContext({
    console,
    Math,
    Number,
    URLSearchParams,
    location: { search: `?seed=${seed}&bot=1&botStyle=${policy}&botLag=${lag}` },
    document: {
      body: { classList: { add() {} }, dataset: {} },
      title: "",
      getElementById(id) {
        return id === "c"
          ? { getContext: () => makeCtx(), setAttribute() {}, getAttribute() { return ""; } }
          : { textContent: "", dataset: {}, setAttribute() {}, getAttribute() { return ""; } };
      },
    },
    window: { addEventListener() {} },
    requestAnimationFrame() {},
  });
  context.globalThis = context;
  vm.runInContext(source, context, { filename: htmlPath });
  const api = context.window.__check;
  api.startGame();
  return api;
}

function runPolicy(seed, policy, lag) {
  const api = makeVm(seed, policy, lag);
  while (api.state.t < 6500 && api.state.mode === "play") api.update();
  const summary = api.summarizeEvalTelemetry();
  const ledger = api.exportEvalLedger();
  return {
    seed,
    policy,
    lag,
    result: summary.result,
    durationFrames: summary.durationFrames,
    routeCoveragePct: summary.routeCoveragePct,
    score: summary.score,
    killCount: summary.killCount,
    bottomCampPct: summary.bottomCampPct,
    activeDefCount: summary.activeDefCount,
    bombCount: summary.bombCount,
    deathContext: summary.deathContext,
    lastEvents: ledger.events.slice(-8),
  };
}

function dumpDom(url) {
  const result = spawnSync(chrome, ["--headless=new", "--disable-gpu", "--dump-dom", url], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Chrome DOM dump failed: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function screenshot(url, outPath) {
  const result = spawnSync(
    chrome,
    ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1280,960", `--screenshot=${outPath}`, url],
    { encoding: "utf8" }
  );
  if (result.status !== 0) throw new Error(`Chrome screenshot failed: ${result.stderr || result.stdout}`);
  return fs.statSync(outPath).size;
}

const runs = [];
for (const lag of lags) {
  for (const seed of seeds) {
    for (const policy of policies) runs.push(runPolicy(seed, policy, lag));
  }
}
const byKey = Object.fromEntries(runs.map((run) => [`${run.lag}:${run.seed}:${run.policy}`, run]));
const mildRuns = runs.filter((run) => run.lag === 6);
const badMildRuns = mildRuns.filter((run) => run.policy !== "route");
const routeMildRuns = mildRuns.filter((run) => run.policy === "route");
const strongRuns = runs.filter((run) => run.lag === 14);

const lagDeltas = seeds.map((seed) => {
  const base = byKey[`0:${seed}:route`];
  const mild = byKey[`6:${seed}:route`];
  return {
    seed,
    frameDelta: mild.durationFrames - base.durationFrames,
    scoreDelta: mild.score - base.score,
    activeDefDelta: mild.activeDefCount - base.activeDefCount,
  };
});

const packetUrl = fileUrl(packetPath);
const dom = dumpDom(packetUrl);
const outDir = path.join(root, ".tmp", "graze_log_cdx_v79_lag_envelope");
fs.mkdirSync(outDir, { recursive: true });
const screenshotBytes = screenshot(packetUrl, path.join(outDir, "v79_lag_envelope_packet.png"));

const assertions = {
  defaultRouteStillClears: seeds.every((seed) => {
    const run = byKey[`0:${seed}:route`];
    return run.result === "clear" && run.routeCoveragePct === 1;
  }),
  mildLagRouteStillClears: routeMildRuns.every((run) => run.result === "clear" && run.routeCoveragePct === 1),
  mildLagBadPoliciesStillFail: badMildRuns.every((run) => {
    if (run.policy === "novice") return run.result === "over" && run.routeCoveragePct < 1 && run.bottomCampPct > 0.85;
    return run.result === "over" && run.routeCoveragePct < 0.55 && run.deathContext && run.deathContext.hitBullet;
  }),
  lagActuallyChangesTelemetry: lagDeltas.some((delta) =>
    delta.frameDelta !== 0 || delta.scoreDelta !== 0 || delta.activeDefDelta !== 0
  ),
  strongLagProbeRecorded: strongRuns.length === seeds.length * policies.length,
  packetDomContract:
    /data-game-version="v05_1_cdx_v79"/.test(dom) &&
    /data-review-packet="bot-lag-envelope-v001"/.test(dom) &&
    packetHtml.includes("botLag=6") &&
    packetHtml.includes("botLag=14"),
  packetScreenshotContract: screenshotBytes > 50000,
};

const report = {
  methodVersion: "graze-bot-lag-envelope-v001",
  game: "graze_log_cdx",
  version,
  source: path.relative(root, packetPath),
  fixedInputs: { seeds, policies, lags },
  lagDeltas,
  runs,
  assertions,
  screenshotBytes,
  pass: Object.values(assertions).every(Boolean),
};

const rawDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(rawDir, { recursive: true });
fs.appendFileSync(
  path.join(rawDir, "graze_log_cdx_bot_lag_envelope.jsonl"),
  JSON.stringify({
    recordedAt: new Date().toISOString(),
    game: report.game,
    version: report.version,
    methodVersion: report.methodVersion,
    fixedInputs: report.fixedInputs,
    lagDeltas: report.lagDeltas,
    runs: report.runs,
    assertions: report.assertions,
  }) + "\n",
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
