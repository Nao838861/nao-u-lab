const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v71", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");

const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,summarizeEvalTelemetry,exportEvalLedger,ROUTE_EVENTS};"
);

const seeds = [12345, 22345, 32345, 42345, 52345];
const policies = ["route", "aggressive", "defensive", "panic", "novice", "marksman", "survival", "camper"];

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
    bottomCampPct: summary.bottomCampPct,
    forwardAttackPct: summary.forwardAttackPct,
    forwardChaseKills: summary.forwardChaseKills,
    chaseBonus: summary.chaseBonus,
    chasePopupCount: summary.chasePopupCount,
    suppressedChasePopups: summary.suppressedChasePopups,
    chasePopupRepositioned: summary.chasePopupRepositioned,
    chasePopupDensity: summary.chasePopupDensity,
    chasePopupMeanSpawnPlayerDist: summary.chasePopupMeanSpawnPlayerDist,
    chasePopupMeanActivePlayerDist: summary.chasePopupMeanActivePlayerDist,
    chasePopupMeanSpawnKillDist: summary.chasePopupMeanSpawnKillDist,
    chasePopupSideBalance: summary.chasePopupSideBalance,
    chasePopupSideSwitches: summary.chasePopupSideSwitches,
    maxChasePopupsActive: summary.maxChasePopupsActive,
    chasePopupPct: summary.chasePopupPct,
    chasePopupThreatOverlapPct: summary.chasePopupThreatOverlapPct,
    chasePopupBossCueOverlapPct: summary.chasePopupBossCueOverlapPct,
    chasePopupTooNearPct: summary.chasePopupTooNearPct,
    chasePopupTooFarPct: summary.chasePopupTooFarPct,
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
    maxNoShootableGapSec: summary.maxNoShootableGapSec,
    maxEmptyScreenGapSec: summary.maxEmptyScreenGapSec,
    midgameMeanShootable: summary.midgameMeanShootable,
    midgameMeanBullets: summary.midgameMeanBullets,
    bossApproachMeanShootable: summary.bossApproachMeanShootable,
    bossApproachMeanBullets: summary.bossApproachMeanBullets,
    worstNoShootablePhases: summary.densityAnalysis?.worstNoShootablePhases || [],
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
      meanBottomCampPct: mean(group.map((row) => row.bottomCampPct)),
      meanForwardAttackPct: mean(group.map((row) => row.forwardAttackPct)),
      meanForwardChaseKills: mean(group.map((row) => row.forwardChaseKills)),
      meanChaseBonus: mean(group.map((row) => row.chaseBonus)),
      meanChasePopupCount: mean(group.map((row) => row.chasePopupCount)),
      meanSuppressedChasePopups: mean(group.map((row) => row.suppressedChasePopups)),
      meanChasePopupRepositioned: mean(group.map((row) => row.chasePopupRepositioned)),
      meanChasePopupDensity: mean(group.map((row) => row.chasePopupDensity)),
      meanChasePopupSpawnPlayerDist: mean(group.map((row) => row.chasePopupMeanSpawnPlayerDist)),
      meanChasePopupActivePlayerDist: mean(group.map((row) => row.chasePopupMeanActivePlayerDist)),
      meanChasePopupSpawnKillDist: mean(group.map((row) => row.chasePopupMeanSpawnKillDist)),
      meanChasePopupSideBalance: mean(group.map((row) => row.chasePopupSideBalance)),
      meanChasePopupSideSwitches: mean(group.map((row) => row.chasePopupSideSwitches)),
      maxChasePopupsActive: Math.max(...group.map((row) => row.maxChasePopupsActive)),
      meanChasePopupPct: mean(group.map((row) => row.chasePopupPct)),
      meanChasePopupThreatOverlapPct: mean(group.map((row) => row.chasePopupThreatOverlapPct)),
      maxChasePopupBossCueOverlapPct: Math.max(...group.map((row) => row.chasePopupBossCueOverlapPct)),
      maxChasePopupTooNearPct: Math.max(...group.map((row) => row.chasePopupTooNearPct)),
      maxChasePopupTooFarPct: Math.max(...group.map((row) => row.chasePopupTooFarPct)),
      meanMovementSwitches: mean(group.map((row) => row.horizontalSwitches + row.verticalSwitches)),
      meanEmergencyUses: mean(group.map((row) => row.emergencyUses)),
      meanKills: mean(group.map((row) => row.kills)),
      meanMaxNoShootableGapSec: mean(group.map((row) => row.maxNoShootableGapSec)),
      meanMaxEmptyScreenGapSec: mean(group.map((row) => row.maxEmptyScreenGapSec)),
      meanMidgameShootable: mean(group.map((row) => row.midgameMeanShootable)),
      meanMidgameBullets: mean(group.map((row) => row.midgameMeanBullets)),
      meanBossApproachShootable: mean(group.map((row) => row.bossApproachMeanShootable)),
      meanBossApproachBullets: mean(group.map((row) => row.bossApproachMeanBullets)),
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
  version: "v05_1_cdx_v71",
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
    "human-like policy split, because novice hesitation, target fixation, and survival-first routing fail in different ways",
    "one-second density timeline, because target uptime alone hides empty seconds and shootable-target gaps",
  ],
  byPolicy,
  assertions: {
    routeHasClearBestCase: byPolicy.route.bestCase.clear && byPolicy.route.bestCase.routeCoveragePct === 1,
    routeStableCoverage: byPolicy.route.meanCoverage >= 0.98,
    aggressivePressureSignatureDiffers:
      byPolicy.aggressive.meanKills > byPolicy.route.meanKills &&
      byPolicy.aggressive.meanTargetUptime < byPolicy.route.meanTargetUptime,
    aggressiveKillsMoreThanRoute: byPolicy.aggressive.meanKills > byPolicy.route.meanKills,
    defensivePressureSignatureDiffers:
      byPolicy.defensive.meanUrgentPct > byPolicy.route.meanUrgentPct &&
      byPolicy.defensive.clearRate < byPolicy.route.clearRate,
    panicShowsHigherPressureThanRoute: byPolicy.panic.meanUrgentPct > byPolicy.route.meanUrgentPct,
    noviceSeparatesFromRoute:
      byPolicy.novice.meanCoverage !== byPolicy.route.meanCoverage ||
      byPolicy.novice.meanMovementSwitches !== byPolicy.route.meanMovementSwitches ||
      byPolicy.novice.meanScore !== byPolicy.route.meanScore,
    marksmanKillsAtLeastRoute: byPolicy.marksman.meanKills >= byPolicy.route.meanKills,
    survivalPressureDistinct:
      byPolicy.survival.meanUrgentPct > byPolicy.route.meanUrgentPct &&
      byPolicy.survival.meanMaxEmptyScreenGapSec <= byPolicy.route.meanMaxEmptyScreenGapSec,
    policiesSeparateScore: new Set(policies.map((policy) => byPolicy[policy].meanScore)).size >= 3,
    densityTimelinePresent: rows.every(
      (row) =>
        Number.isFinite(row.maxNoShootableGapSec) &&
        Number.isFinite(row.maxEmptyScreenGapSec) &&
        Number.isFinite(row.midgameMeanShootable) &&
        Number.isFinite(row.bossApproachMeanShootable)
    ),
    routeDensityHealthy:
      byPolicy.route.meanMidgameShootable > 0 &&
      byPolicy.route.meanBossApproachShootable > 0 &&
      byPolicy.route.meanMaxEmptyScreenGapSec <= 2,
    routeDensityCalibrated:
      byPolicy.route.meanMidgameShootable >= 5.0 &&
      byPolicy.route.meanMidgameBullets <= 28 &&
      byPolicy.route.meanMaxEmptyScreenGapSec <= 1.5,
    corePoliciesReachReadableGuides: ["route", "aggressive", "marksman"].every((policy) =>
      rows.filter((row) => row.policy === policy).every((row) => row.eventTypes.route >= 20 && row.traceDigest.readabilityGuides === 2)
    ),
    panicEarlyChurnDetected:
      byPolicy.panic.clearRate === 0 &&
      byPolicy.panic.meanCoverage < byPolicy.route.meanCoverage * 0.7 &&
      byPolicy.panic.meanUrgentPct > byPolicy.route.meanUrgentPct * 1.4,
    camperNotDominant:
      byPolicy.camper.meanBottomCampPct > 0.65 &&
      byPolicy.camper.meanScore < byPolicy.route.meanScore * 0.9 &&
      byPolicy.camper.meanKills < byPolicy.aggressive.meanKills,
    forwardRewardSeparates:
      byPolicy.route.meanChaseBonus > byPolicy.camper.meanChaseBonus &&
      byPolicy.route.meanForwardChaseKills > byPolicy.camper.meanForwardChaseKills &&
      byPolicy.route.meanForwardAttackPct > byPolicy.camper.meanForwardAttackPct,
    skilledPoliciesUseForwardReward:
      byPolicy.route.meanChaseBonus > 0 &&
      byPolicy.aggressive.meanChaseBonus > 0 &&
      byPolicy.marksman.meanChaseBonus > 0,
    chasePopupNoiseBounded:
      ["route", "aggressive", "marksman"].every(
        (policy) =>
          byPolicy[policy].meanChasePopupCount > 0 &&
          byPolicy[policy].meanChasePopupDensity < 0.45 &&
          byPolicy[policy].maxChasePopupsActive <= 3 &&
          byPolicy[policy].meanChasePopupPct < 0.35
      ),
    chasePopupOcclusionBounded:
      ["route", "aggressive", "marksman"].every(
        (policy) =>
          byPolicy[policy].meanChasePopupThreatOverlapPct <= 0.005 &&
          byPolicy[policy].maxChasePopupBossCueOverlapPct === 0
      ),
    chasePopupReadabilityMeasured:
      ["route", "aggressive", "marksman"].every(
        (policy) =>
          byPolicy[policy].meanChasePopupSpawnPlayerDist >= 90 &&
          byPolicy[policy].meanChasePopupSpawnPlayerDist <= 310 &&
          byPolicy[policy].meanChasePopupActivePlayerDist >= 90 &&
          byPolicy[policy].meanChasePopupActivePlayerDist <= 310 &&
          byPolicy[policy].maxChasePopupTooNearPct <= 0.005 &&
          byPolicy[policy].maxChasePopupTooFarPct === 0 &&
          byPolicy[policy].meanChasePopupSideBalance >= 0.15
      ),
  },
};

console.log(JSON.stringify(report, null, 2));

const outDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(outDir, { recursive: true });
fs.appendFileSync(
  path.join(outDir, "graze_log_cdx_policy_matrix.jsonl"),
  JSON.stringify({
    recordedAt: new Date().toISOString(),
    game: report.game,
    version: report.version,
    methodVersion: report.methodVersion,
    source: report.source,
    fixedInputs: report.fixedInputs,
    byPolicy: report.byPolicy,
    assertions: report.assertions,
  }) + "\n",
  "utf8"
);

const ok = Object.values(report.assertions).every(Boolean);
if (!ok) process.exit(1);

