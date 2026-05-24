const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v82";
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
const variants = [
  { id: "baseline", jitter: 0, lag: 0, role: "control" },
  { id: "j4_lag4", jitter: 4, lag: 4, role: "anomaly" },
  { id: "j6_lag6", jitter: 6, lag: 6, role: "asserted" },
  { id: "j12_lag14", jitter: 12, lag: 14, role: "stress" },
];
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

function makeVm(seed, policy, variant) {
  const context = vm.createContext({
    console,
    Math,
    Number,
    URLSearchParams,
    location: {
      search: `?seed=${seed}&bot=1&botStyle=${policy}&botJitter=${variant.jitter}&botLag=${variant.lag}`,
    },
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

function runPolicy(seed, policy, variant) {
  const api = makeVm(seed, policy, variant);
  while (api.state.t < 6500 && api.state.mode === "play") api.update();
  const summary = api.summarizeEvalTelemetry();
  const ledger = api.exportEvalLedger();
  return {
    seed,
    policy,
    variant: variant.id,
    jitter: variant.jitter,
    lag: variant.lag,
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
for (const variant of variants) {
  for (const seed of seeds) {
    for (const policy of policies) runs.push(runPolicy(seed, policy, variant));
  }
}
const byKey = Object.fromEntries(runs.map((run) => [`${run.variant}:${run.seed}:${run.policy}`, run]));
const routeGrid = variants.map((variant) => {
  const routeRuns = seeds.map((seed) => byKey[`${variant.id}:${seed}:route`]);
  return {
    variant: variant.id,
    role: variant.role,
    jitter: variant.jitter,
    lag: variant.lag,
    clearSeeds: routeRuns.filter((run) => run.result === "clear" && run.routeCoveragePct === 1).map((run) => run.seed),
    failSeeds: routeRuns.filter((run) => run.result !== "clear" || run.routeCoveragePct < 1).map((run) => run.seed),
    frames: routeRuns.map((run) => run.durationFrames),
  };
});
const replayPairs = seeds.map((seed) => {
  const base = byKey[`baseline:${seed}:route`];
  const j4 = byKey[`j4_lag4:${seed}:route`];
  const j6 = byKey[`j6_lag6:${seed}:route`];
  return {
    seed,
    baseline: { result: base.result, frames: base.durationFrames, score: base.score, coverage: base.routeCoveragePct },
    j4: {
      result: j4.result,
      frames: j4.durationFrames,
      score: j4.score,
      coverage: j4.routeCoveragePct,
      deathPhase: j4.deathContext ? j4.deathContext.phase : null,
      hitBullet: j4.deathContext ? j4.deathContext.hitBullet : null,
    },
    j6: { result: j6.result, frames: j6.durationFrames, score: j6.score, coverage: j6.routeCoveragePct },
    nonMonotonic: (j4.result !== "clear" || j4.routeCoveragePct < 1) && j6.result === "clear" && j6.routeCoveragePct === 1,
  };
});

const j6BadRuns = runs.filter((run) => run.variant === "j6_lag6" && run.policy !== "route");
const packetUrl = fileUrl(packetPath);
const dom = dumpDom(packetUrl);
const outDir = path.join(root, ".tmp", "graze_log_cdx_v82_nonmonotonic_replay");
fs.mkdirSync(outDir, { recursive: true });
const screenshotBytes = screenshot(packetUrl, path.join(outDir, "v82_nonmonotonic_replay_packet.png"));

const assertions = {
  gameplayVersionMarked: html.includes("v82 - non-monotonic replay packet") && html.includes("non-monotonic j4/lag4 versus j6/lag6"),
  baselineRouteStillClears: seeds.every((seed) => {
    const run = byKey[`baseline:${seed}:route`];
    return run.result === "clear" && run.routeCoveragePct === 1;
  }),
  assertedJ6RouteStillClears: seeds.every((seed) => {
    const run = byKey[`j6_lag6:${seed}:route`];
    return run.result === "clear" && run.routeCoveragePct === 1;
  }),
  j4FailureIsRecorded: [12345, 77777].every((seed) => {
    const run = byKey[`j4_lag4:${seed}:route`];
    return run.result === "over" && run.routeCoveragePct < 1 && run.deathContext && run.deathContext.hitBullet;
  }),
  nonMonotonicReplayRecorded: replayPairs.filter((pair) => pair.nonMonotonic).length >= 2,
  assertedJ6BadPoliciesStillFail: j6BadRuns.every((run) => {
    if (run.policy === "novice") return run.result === "over" && run.routeCoveragePct < 1 && run.bottomCampPct > 0.85;
    return run.result === "over" && run.routeCoveragePct < 0.55 && run.deathContext && run.deathContext.hitBullet;
  }),
  stressBoundaryNotAsserted: routeGrid.find((row) => row.variant === "j12_lag14").clearSeeds.length < seeds.length,
  packetDomContract:
    /data-game-version="v05_1_cdx_v82"/.test(dom) &&
    /data-review-packet="bot-perturbation-nonmonotonic-replay-v001"/.test(dom) &&
    packetHtml.includes("j4/lag4") &&
    packetHtml.includes("j6/lag6") &&
    packetHtml.includes("単調"),
  packetScreenshotContract: screenshotBytes > 50000,
};

const report = {
  methodVersion: "graze-bot-perturbation-nonmonotonic-replay-v001",
  game: "graze_log_cdx",
  version,
  source: path.relative(root, packetPath),
  fixedInputs: { seeds, policies, variants },
  routeGrid,
  replayPairs,
  runs,
  assertions,
  screenshotBytes,
  pass: Object.values(assertions).every(Boolean),
};

const rawDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(rawDir, { recursive: true });
fs.appendFileSync(
  path.join(rawDir, "graze_log_cdx_bot_perturbation_nonmonotonic_replay.jsonl"),
  JSON.stringify({
    recordedAt: new Date().toISOString(),
    game: report.game,
    version: report.version,
    methodVersion: report.methodVersion,
    fixedInputs: report.fixedInputs,
    routeGrid: report.routeGrid,
    replayPairs: report.replayPairs,
    assertions: report.assertions,
  }) + "\n",
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
