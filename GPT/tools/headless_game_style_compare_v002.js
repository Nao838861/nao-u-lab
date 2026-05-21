const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");

function parseShotLogSummary(text) {
  const rows = {};
  const re = /^\s+(center|aggressive|defensive|sweeper)\s*: time=\s*([0-9.]+)s\s+score=\s*([0-9.]+)\s+hits=\s*([0-9.]+)\s+items=\s*([0-9.]+)\s+3way=([0-9.]+)%\s+bomb=([0-9.]+)/gm;
  let m;
  while ((m = re.exec(text))) {
    rows[m[1]] = {
      timeSec: Number(m[2]),
      score: Number(m[3]),
      hits: Number(m[4]),
      items: Number(m[5]),
      topPowerPct: Number(m[6]) / 100,
      emergencyUses: Number(m[7]),
    };
  }
  return rows;
}

function runShotLog() {
  const script = path.join(root, "game", "shot_log_cdx", "v01_from_bd6c65a", "headless.py");
  const result = spawnSync("python", [script], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  if (result.status !== 0) {
    throw new Error(`shot_log headless failed\n${result.stdout}\n${result.stderr}`);
  }
  const summary = parseShotLogSummary(result.stdout);
  if (!summary.center || !summary.aggressive || !summary.defensive || !summary.sweeper) {
    throw new Error("shot_log summary parse failed");
  }
  return {
    source: "game/shot_log_cdx/v01_from_bd6c65a/headless.py",
    policyCount: Object.keys(summary).length,
    summary,
  };
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

function runGrazeLog(style) {
  const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v42", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("script block not found");
  const source = match[1].replace(
    "loop();",
    "window.__check={state,startGame,update,summarizeEvalTelemetry,ROUTE_EVENTS};"
  );
  const context = vm.createContext({
    console,
    Math,
    URLSearchParams,
    location: { search: `?seed=12345&bot=1&botStyle=${style}` },
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
  const s = api.summarizeEvalTelemetry();
  return {
    source: "game/graze_log_cdx/v05_1_cdx_v42/index.html",
    style,
    summary: {
      clear: s.result === "clear",
      timeSec: s.durationSec,
      score: s.score,
      routeCoveragePct: s.routeCoveragePct,
      targetUptime: s.targetUptime,
      urgentPct: s.urgentPct,
      maxThreat: s.maxThreat,
      dangerSpikes: s.dangerSpikes,
      horizontalSwitches: s.horizontalSwitches,
      verticalSwitches: s.verticalSwitches,
      routeIntentSwitches: s.routeIntentSwitches,
      kills: s.killCount,
      maxChain: s.maxChain,
      chainBreaks: s.chainBreaks,
      emergencyUses: s.bombCount + s.activeDefCount,
      sampleCount: s.sampleCount,
      eventCount: s.eventCount,
      eventTypes: s.eventTypes,
    },
  };
}

function compare(shot, graze) {
  const center = shot.summary.center;
  const aggressive = shot.summary.aggressive;
  const defensive = shot.summary.defensive;
  const sweeper = shot.summary.sweeper;
  return {
    methodVersion: "headless-style-v002",
    fixedInputs: {
      shotLogSeeds: [42, 123, 7777],
      shotLogPolicies: ["center", "aggressive", "defensive", "sweeper"],
      grazeLogSeed: 12345,
      grazeLogPolicies: Object.keys(graze),
      telemetryCadenceFrames: 30,
    },
    requiredSignals: [
      "outcome and survival time",
      "policy split: center/aggressive/defensive/sweeper where available",
      "power or emergency economy",
      "target uptime",
      "pressure / urgent frames",
      "movement intent switching",
      "route or wave coverage",
      "sparse event log for route/kill/bomb/hit/clear",
    ],
    shotSignature: {
      centerSurvivesLongerThanDefensive: center.timeSec > defensive.timeSec * 2,
      aggressiveScoresMoreThanDefensive: aggressive.score > defensive.score * 5,
      sweeperFailsFast: sweeper.timeSec < 10,
      bombSeparatesPolicies: center.emergencyUses > 0 && defensive.emergencyUses === 0,
      interpretation: "shot_log rewards sustained target engagement and power economy; pure movement without shooting collapses quickly.",
    },
    grazeSignature: {
      routeClears: graze.route.summary.clear,
      routeCoverageComplete: graze.route.summary.routeCoveragePct === 1,
      hasPressureTrace: graze.route.summary.urgentPct > 0.01 && graze.route.summary.dangerSpikes > 0,
      hasIntentSwitchTrace: graze.route.summary.horizontalSwitches >= 10 && graze.route.summary.routeIntentSwitches >= 20,
      hasSparseEvents: graze.route.summary.eventTypes.route >= 20 && graze.route.summary.eventTypes.kill >= 60,
      policyScoreSplit: new Set(Object.values(graze).map((g) => g.summary.score)).size >= 3,
      aggressiveKillsMoreThanRoute: graze.aggressive.summary.kills > graze.route.summary.kills,
      defensivePreservesLongerChains: graze.defensive.summary.maxChain >= graze.route.summary.maxChain,
      panicFailsEarlierThanRoute: graze.panic.summary.timeSec < graze.route.summary.timeSec * 0.6,
      panicShowsHigherPressure: graze.panic.summary.urgentPct > graze.route.summary.urgentPct * 2,
      interpretation: "graze_log v42 can compare route, aggressive, defensive, and panic signatures under the same stage and seed.",
    },
  };
}

const shot = runShotLog();
const graze = {
  route: runGrazeLog("route"),
  aggressive: runGrazeLog("aggressive"),
  defensive: runGrazeLog("defensive"),
  panic: runGrazeLog("panic"),
};
const report = { shot, graze, comparison: compare(shot, graze) };
console.log(JSON.stringify(report, null, 2));

const ok =
  report.comparison.shotSignature.centerSurvivesLongerThanDefensive &&
  report.comparison.shotSignature.aggressiveScoresMoreThanDefensive &&
  report.comparison.shotSignature.sweeperFailsFast &&
  report.comparison.shotSignature.bombSeparatesPolicies &&
  report.comparison.grazeSignature.routeClears &&
  report.comparison.grazeSignature.routeCoverageComplete &&
  report.comparison.grazeSignature.hasPressureTrace &&
  report.comparison.grazeSignature.hasIntentSwitchTrace &&
  report.comparison.grazeSignature.hasSparseEvents &&
  report.comparison.grazeSignature.policyScoreSplit &&
  report.comparison.grazeSignature.aggressiveKillsMoreThanRoute &&
  report.comparison.grazeSignature.defensivePreservesLongerChains &&
  report.comparison.grazeSignature.panicFailsEarlierThanRoute &&
  report.comparison.grazeSignature.panicShowsHigherPressure;

if (!ok) process.exit(1);
