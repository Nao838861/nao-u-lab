const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v54", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");

const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,summarizeEvalTelemetry,exportEvalLedger,ROUTE_EVENTS};"
);

const seeds = [12345, 22345, 32345, 42345, 52345];
const policies = ["route", "aggressive", "defensive", "panic"];

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

function runOne(seed, policy) {
  const context = vm.createContext({
    console,
    Math,
    URLSearchParams,
    location: { search: `?seed=${seed}&bot=1&botStyle=${policy}` },
    document: {
      getElementById(id) {
        return id === "c" ? { getContext: () => makeCtx() } : { textContent: "" };
      },
    },
    window: { addEventListener() {} },
    requestAnimationFrame() {},
  });
  context.globalThis = context;
  vm.runInContext(source, context, { filename: htmlPath });
  const api = context.window.__check;
  api.startGame();
  for (let i = 0; i < 6500 && api.state.mode === "play"; i++) api.update();
  const summary = api.summarizeEvalTelemetry();
  return {
    seed,
    policy,
    result: summary.result,
    clear: summary.result === "clear",
    timeSec: summary.durationSec,
    score: summary.score,
    routeCoveragePct: summary.routeCoveragePct,
    targetUptime: summary.targetUptime,
    urgentPct: summary.urgentPct,
    maxThreat: summary.maxThreat,
    dangerSpikes: summary.dangerSpikes,
    horizontalSwitches: summary.horizontalSwitches,
    verticalSwitches: summary.verticalSwitches,
    routeIntentSwitches: summary.routeIntentSwitches,
    kills: summary.killCount,
    maxChain: summary.maxChain,
    chainBreaks: summary.chainBreaks,
    emergencyUses: summary.bombCount + summary.activeDefCount,
    riskEconomyScore: summary.riskEconomyScore,
    traceDigest: summary.traceDigest,
    eventTypes: summary.eventTypes,
  };
}

function mean(values) {
  return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(3));
}

function bestBy(rows, key) {
  return rows.slice().sort((a, b) => b[key] - a[key])[0];
}

function worstBy(rows, key) {
  return rows.slice().sort((a, b) => a[key] - b[key])[0];
}

function aggregate(rows) {
  const byPolicy = {};
  for (const policy of policies) {
    const group = rows.filter((row) => row.policy === policy);
    byPolicy[policy] = {
      runs: group.length,
      clearRate: mean(group.map((row) => (row.clear ? 1 : 0))),
      meanScore: mean(group.map((row) => row.score)),
      bestScore: bestBy(group, "score").score,
      bestSeed: bestBy(group, "score").seed,
      worstScore: worstBy(group, "score").score,
      meanTimeSec: mean(group.map((row) => row.timeSec)),
      meanCoverage: mean(group.map((row) => row.routeCoveragePct)),
      meanTargetUptime: mean(group.map((row) => row.targetUptime)),
      meanUrgentPct: mean(group.map((row) => row.urgentPct)),
      meanMovementSwitches: mean(group.map((row) => row.horizontalSwitches + row.verticalSwitches)),
      meanEmergencyUses: mean(group.map((row) => row.emergencyUses)),
      meanKills: mean(group.map((row) => row.kills)),
      bestCase: bestBy(group, "score"),
      worstCase: worstBy(group, "score"),
    };
  }
  return byPolicy;
}

const rows = [];
for (const seed of seeds) {
  for (const policy of policies) rows.push(runOne(seed, policy));
}

const byPolicy = aggregate(rows);
const report = {
  methodVersion: "graze-policy-matrix-v001",
  game: "graze_log_cdx",
  version: "v05_1_cdx_v54",
  source: path.relative(root, htmlPath),
  purpose:
    "Headless comparison aid: vary seed and bot policy, then inspect best-case, mean, worst-case, pressure, movement, and coverage. This is not a fun verdict.",
  fixedInputs: { seeds, policies, maxFrames: 6500, telemetryCadenceFrames: 30 },
  requiredSignals: [
    "best-case per policy, because a single average run hides learnable routes",
    "mean and worst-case per policy, because churn-like failure risk is different from solvability",
    "route coverage and sparse events, because clear without visiting authored content is weak evidence",
    "pressure and movement switching, because calm survival and frantic survival should not collapse to one score",
    "emergency economy, because BOMB / Active DEF usage separates risk handling from raw score",
  ],
  byPolicy,
  assertions: {
    routeHasClearBestCase: byPolicy.route.bestCase.clear && byPolicy.route.bestCase.routeCoveragePct === 1,
    routeStableCoverage: byPolicy.route.meanCoverage >= 0.98,
    aggressiveScoresHigherThanRoute: byPolicy.aggressive.meanScore > byPolicy.route.meanScore,
    aggressiveKillsMoreThanRoute: byPolicy.aggressive.meanKills > byPolicy.route.meanKills,
    defensiveMovesMoreThanRoute: byPolicy.defensive.meanMovementSwitches > byPolicy.route.meanMovementSwitches,
    panicShowsHigherPressureThanRoute: byPolicy.panic.meanUrgentPct > byPolicy.route.meanUrgentPct,
    policiesSeparateScore: new Set(policies.map((policy) => byPolicy[policy].meanScore)).size >= 3,
    corePoliciesReachReadableGuides: ["route", "aggressive", "defensive"].every((policy) =>
      rows.filter((row) => row.policy === policy).every((row) => row.eventTypes.route >= 20 && row.traceDigest.readabilityGuides === 2)
    ),
    panicEarlyChurnDetected:
      byPolicy.panic.clearRate === 0 &&
      byPolicy.panic.meanCoverage < byPolicy.route.meanCoverage * 0.5 &&
      byPolicy.panic.meanUrgentPct > byPolicy.route.meanUrgentPct * 3,
  },
};

console.log(JSON.stringify(report, null, 2));

const ok = Object.values(report.assertions).every(Boolean);
if (!ok) process.exit(1);
