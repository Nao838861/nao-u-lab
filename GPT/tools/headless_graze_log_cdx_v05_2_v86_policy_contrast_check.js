const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v86";
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

const seeds = [12345, 77777];
const variants = [
  { id: "baseline", jitter: 0, lag: 0 },
  { id: "j4_lag4", jitter: 4, lag: 4 },
  { id: "j6_lag6", jitter: 6, lag: 6 },
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

function makeVm(seed, variant, botStyle = "route") {
  const context = vm.createContext({
    console,
    Math,
    Number,
    URLSearchParams,
    location: {
      search: `?seed=${seed}&bot=1&botStyle=${botStyle}&botJitter=${variant.jitter}&botLag=${variant.lag}`,
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

function run(seed, variant, botStyle = "route") {
  const api = makeVm(seed, variant, botStyle);
  while (api.state.t < 6500 && api.state.mode === "play") api.update();
  const ledger = api.exportEvalLedger();
  const summary = ledger.summary;
  const deathT = summary.deathContext ? summary.deathContext.frame : summary.durationFrames;
  const windowStart = Math.max(0, deathT - 180);
  const nearDeathTrace = ledger.botTrace.filter((row) => row.t >= windowStart && row.t <= deathT + 5);
  const actionTrace = ledger.botTrace.filter((row) => row.action);
  return {
    seed,
    botStyle,
    variant: variant.id,
    jitter: variant.jitter,
    lag: variant.lag,
    result: summary.result,
    durationFrames: summary.durationFrames,
    routeCoveragePct: summary.routeCoveragePct,
    score: summary.score,
    bottomCampPct: summary.bottomCampPct,
    chaseBonusCount: summary.chaseBonusCount,
    killCount: summary.killCount,
    activeDefCount: summary.activeDefCount,
    bombCount: summary.bombCount,
    deathContext: summary.deathContext,
    traceCount: ledger.botTrace.length,
    botTrace: ledger.botTrace,
    nearDeathTrace: nearDeathTrace.slice(-16),
    actionTrace: actionTrace.slice(-12),
    eventTail: ledger.events.slice(-10),
  };
}

function key(seed, variant) {
  return `${seed}:${variant}`;
}

function summarizePair(seed, runsByKey) {
  const baseline = runsByKey[key(seed, "baseline")];
  const j4 = runsByKey[key(seed, "j4_lag4")];
  const j6 = runsByKey[key(seed, "j6_lag6")];
  const j4Tail = j4.nearDeathTrace.slice(-8);
  const j6SameWindow = j6.botTrace.filter((row) => row.t >= Math.max(0, j4.durationFrames - 180) && row.t <= j4.durationFrames + 5);
  const j4Actions = j4Tail.map((row) => row.keys);
  const j6Actions = j6SameWindow.slice(-8).map((row) => row.keys);
  const keyDivergence = JSON.stringify(j4Actions) !== JSON.stringify(j6Actions);
  const finalTargetDelta = j4Tail.length && j6SameWindow.length
    ? Math.round(Math.abs(j4Tail[j4Tail.length - 1].finalTx - j6SameWindow[j6SameWindow.length - 1].finalTx) +
        Math.abs(j4Tail[j4Tail.length - 1].finalTy - j6SameWindow[j6SameWindow.length - 1].finalTy))
    : null;
  return {
    seed,
    baseline: { result: baseline.result, frames: baseline.durationFrames, coverage: baseline.routeCoveragePct },
    j4: { result: j4.result, frames: j4.durationFrames, coverage: j4.routeCoveragePct, activeDefCount: j4.activeDefCount, bombCount: j4.bombCount },
    j6: { result: j6.result, frames: j6.durationFrames, coverage: j6.routeCoveragePct, activeDefCount: j6.activeDefCount, bombCount: j6.bombCount },
    keyDivergence,
    finalTargetDelta,
    j4NearDeathTail: j4Tail,
    j6SameTimeTail: j6SameWindow.slice(-8),
  };
}

function countActions(run, action) {
  return run.actionTrace.filter((row) => row.action === action).length;
}

function summarizeCausalSlice(pair, runsByKey) {
  const j4 = runsByKey[key(pair.seed, "j4_lag4")];
  const j6 = runsByKey[key(pair.seed, "j6_lag6")];
  const j4Last = pair.j4NearDeathTail[pair.j4NearDeathTail.length - 1] || {};
  const j6Last = pair.j6SameTimeTail[pair.j6SameTimeTail.length - 1] || {};
  const j4Targets = [...new Set(pair.j4NearDeathTail.map((row) => row.targetType).filter(Boolean))];
  const j6Targets = [...new Set(pair.j6SameTimeTail.map((row) => row.targetType).filter(Boolean))];
  const j4KeyTail = pair.j4NearDeathTail.map((row) => row.keys);
  const j6KeyTail = pair.j6SameTimeTail.map((row) => row.keys);
  const j4LagSources = pair.j4NearDeathTail.map((row) => row.lagSourceT).filter((v) => Number.isFinite(v));
  const j6LagSources = pair.j6SameTimeTail.map((row) => row.lagSourceT).filter((v) => Number.isFinite(v));
  const lateSurvivalFrames = j6.durationFrames - j4.durationFrames;
  return {
    seed: pair.seed,
    resultSplit: `${j4.result}->${j6.result}`,
    lateSurvivalFrames,
    routeCoverageGap: Number((j6.routeCoveragePct - j4.routeCoveragePct).toFixed(3)),
    activeDefGap: j6.activeDefCount - j4.activeDefCount,
    bombGap: j6.bombCount - j4.bombCount,
    actionReach: {
      j4ActiveDefActions: countActions(j4, "activeDef"),
      j6ActiveDefActions: countActions(j6, "activeDef"),
      j4BombActions: countActions(j4, "bomb"),
      j6BombActions: countActions(j6, "bomb"),
    },
    targetSplit: {
      finalTargetDelta: pair.finalTargetDelta,
      j4Targets,
      j6Targets,
      j4Final: { x: j4Last.finalTx, y: j4Last.finalTy, target: j4Last.targetType },
      j6SameTimeFinal: { x: j6Last.finalTx, y: j6Last.finalTy, target: j6Last.targetType },
    },
    keyTail: { j4: j4KeyTail, j6: j6KeyTail },
    lagSourceTail: { j4: j4LagSources.slice(-4), j6: j6LagSources.slice(-4) },
    hypothesis:
      lateSurvivalFrames > 250 && pair.finalTargetDelta > 0
        ? "j4_lag4 does not merely score lower: it diverges in target/input before death, then fails to reach the late BOMB and final route segment that j6_lag6 reaches."
        : "split requires more seeds before assigning cause.",
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
for (const seed of seeds) {
  for (const variant of variants) runs.push(run(seed, variant));
}
const runsByKey = Object.fromEntries(runs.map((row) => [key(row.seed, row.variant), row]));
const pairSummaries = seeds.map((seed) => summarizePair(seed, runsByKey));
const causalSlices = pairSummaries.map((pair) => summarizeCausalSlice(pair, runsByKey));
const reportRuns = runs.map(({ botTrace, ...row }) => row);

const policyStyles = ["route", "aggressive", "marksman", "camper", "survival", "panic", "defensive", "novice"];
const policyRuns = [];
for (const seed of seeds) {
  for (const style of policyStyles) policyRuns.push(run(seed, { id: "baseline", jitter: 0, lag: 0 }, style));
}
function policyKey(seed, style) {
  return `${seed}:${style}`;
}
const policyByKey = Object.fromEntries(policyRuns.map((row) => [policyKey(row.seed, row.botStyle), row]));
const policySummaries = policyRuns.map(({ botTrace, nearDeathTrace, actionTrace, eventTail, ...row }) => row);
function allPolicies(styles, predicate) {
  return seeds.every((seed) => styles.every((style) => predicate(policyByKey[policyKey(seed, style)])));
}

const packetUrl = fileUrl(packetPath);
const dom = dumpDom(packetUrl);
const outDir = path.join(root, ".tmp", "graze_log_cdx_v86_policy_contrast");
fs.mkdirSync(outDir, { recursive: true });
const screenshotBytes = screenshot(packetUrl, path.join(outDir, "v86_policy_contrast_packet.png"));

const assertions = {
  gameplayVersionMarked:
    html.includes("v05_1_cdx_v86") &&
    html.includes("botTrace") &&
    html.includes("recordBotTrace") &&
    html.includes("v86 - policy contrast packet"),
  botTraceRecorded: runs.every((row) => row.traceCount > 120 && row.nearDeathTrace.length >= 8),
  baselineRouteClears: seeds.every((seed) => runsByKey[key(seed, "baseline")].result === "clear" && runsByKey[key(seed, "baseline")].routeCoveragePct === 1),
  j4FailuresRetained: seeds.every((seed) => runsByKey[key(seed, "j4_lag4")].result === "over" && runsByKey[key(seed, "j4_lag4")].routeCoveragePct < 1),
  j6ClearsRetained: seeds.every((seed) => runsByKey[key(seed, "j6_lag6")].result === "clear" && runsByKey[key(seed, "j6_lag6")].routeCoveragePct === 1),
  inputDivergenceVisible: pairSummaries.every((pair) => pair.keyDivergence && pair.finalTargetDelta !== null && pair.finalTargetDelta > 0),
  causalSlicesBuilt: causalSlices.every((slice) => slice.lateSurvivalFrames > 250 && slice.routeCoverageGap > 0),
  bombReachSplit: causalSlices.every((slice) => slice.bombGap === 1 && slice.actionReach.j4BombActions === 0 && slice.actionReach.j6BombActions === 1),
  activeDefSplit: causalSlices.every((slice) => slice.activeDefGap > 0),
  packetDomContract:
    /data-game-version="v05_1_cdx_v86"/.test(dom) &&
    /data-review-packet="policy-contrast-trace-table-v003"/.test(dom) &&
    packetHtml.includes("causal slice"),
  packetTraceTableContract:
    /data-trace-table="j4-j6-causal-window"/.test(dom) &&
    /data-trace-row="12345-baseline"/.test(dom) &&
    /data-trace-row="12345-j4"/.test(dom) &&
    /data-trace-row="12345-j6"/.test(dom) &&
    /data-trace-row="77777-j4-j6"/.test(dom) &&
    packetHtml.includes("人間確認用 trace table"),
  policyGoodClears:
    allPolicies(["route", "aggressive", "marksman"], (row) => row.result === "clear" && row.routeCoveragePct === 1),
  policyBadFails:
    allPolicies(["camper", "survival", "panic", "defensive", "novice"], (row) => row.result === "over" && row.routeCoveragePct < 1),
  camperDominanceBlocked:
    allPolicies(["camper"], (row) => row.routeCoveragePct < 0.4 && row.chaseBonusCount === 0 && row.bottomCampPct > 0.98),
  forwardRewardSplit:
    allPolicies(["aggressive", "marksman"], (row) => row.chaseBonusCount > 100 && row.bottomCampPct < 0.02),
  policyTableContract:
    /data-policy-table="good-bad-policy-contrast"/.test(dom) &&
    /data-policy-row="route-clear"/.test(dom) &&
    /data-policy-row="aggressive-marksman-clear"/.test(dom) &&
    /data-policy-row="camper-fail"/.test(dom) &&
    /data-policy-row="survival-panic-fail"/.test(dom) &&
    /data-policy-row="novice-defensive-fail"/.test(dom),
  packetScreenshotContract: screenshotBytes > 50000,
};

const report = {
  methodVersion: "graze-policy-contrast-trace-table-v003",
  game: "graze_log_cdx",
  version,
  fixedInputs: { seeds, variants, policyStyles },
  pairSummaries,
  causalSlices,
  runs: reportRuns,
  policySummaries,
  assertions,
  screenshotBytes,
  pass: Object.values(assertions).every(Boolean),
};

const rawDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(rawDir, { recursive: true });
fs.appendFileSync(
  path.join(rawDir, "graze_log_cdx_policy_contrast_trace_table.jsonl"),
  JSON.stringify({
    recordedAt: new Date().toISOString(),
    game: report.game,
    version: report.version,
    methodVersion: report.methodVersion,
    fixedInputs: report.fixedInputs,
    pairSummaries: report.pairSummaries,
    causalSlices: report.causalSlices,
    policySummaries: report.policySummaries,
    assertions: report.assertions,
  }) + "\n",
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);

