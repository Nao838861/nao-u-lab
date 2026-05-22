const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v58", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");

const source = match[1].replace(
  "loop();",
  `window.__check={state,keys,ROUTE_EVENTS,ROUTE_SOURCE_NOTES,startGame,update,fireBomb,triggerActiveDef,bombReady,summarizeEvalTelemetry,exportEvalLedger,constants:{G_MAX,G_LV3,START_SHIELDS,CHAIN_WINDOW,MIDBOSS_START_FRAME,BOSS_START_FRAME,STAGE_TARGET_FRAME,BOSS_HP,W,H}};`
);

function ctx() {
  return {
    fillStyle: "", strokeStyle: "", globalAlpha: 1, lineWidth: 1, font: "", textAlign: "",
    fillRect() {}, strokeRect() {}, beginPath() {}, arc() {}, ellipse() {}, fill() {}, stroke() {},
    fillText() {}, moveTo() {}, lineTo() {}, closePath() {},
  };
}

const context = vm.createContext({
  console,
  Math,
  URLSearchParams,
    location: { search: "?seed=12345&bot=1&botStyle=route" },
  document: {
    getElementById(id) {
      return id === "c" ? { getContext: () => ctx() } : { textContent: "" };
    },
  },
  window: { addEventListener() {} },
  requestAnimationFrame() {},
});
context.globalThis = context;
vm.runInContext(source, context, { filename: htmlPath });
const api = context.window.__check;

function run(frames) {
  for (let i = 0; i < frames && api.state.mode === "play"; i++) api.update();
}

api.startGame();
api.state.player.iframe = 999999;
run(api.constants.MIDBOSS_START_FRAME + 60);
const midProbe = {
  t: api.state.t,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  flags: { ...api.state.stageFlags },
  midbossCount: api.state.enemies.filter((e) => e.type === "midboss").length,
  typeCount: new Set(api.state.enemies.map((e) => e.type)).size,
  routeLog: api.state.routeLog,
};

api.startGame();
api.state.player.iframe = 999999;
run(api.constants.BOSS_START_FRAME + 120);
const bossProbe = {
  t: api.state.t,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  flags: { ...api.state.stageFlags },
  bossCount: api.state.enemies.filter((e) => e.type === "boss").length,
  bossPartCount: api.state.enemies.filter((e) => e.type === "bossPart").length,
  routeLabels: api.ROUTE_EVENTS.map((e) => e.label),
};

api.startGame();
api.state.player.iframe = 999999;
run(api.constants.STAGE_TARGET_FRAME + 900);
const botProbe = {
  mode: api.state.mode,
  t: api.state.t,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  killCount: api.state.killCount,
  grazeCount: api.state.grazeCount,
  bombCount: api.state.bombCount,
  activeDefCount: api.state.activeDefCount,
  chain: api.state.chain,
  maxChain: api.state.maxChain,
  chainBreaks: api.state.chainBreaks,
  flags: { ...api.state.stageFlags },
  grade: api.state.lastGrade,
  evalSummary: api.summarizeEvalTelemetry(),
};

const report = {
  midProbe,
  bossProbe,
  botProbe,
  usesSingleSource:
    api.ROUTE_SOURCE_NOTES.some((x) => /DonPachi GPS chain/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /one source grammar only/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v50 quiets those guides/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v51 removes the guide chevrons/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v52 adds a deterministic probeFrame render mode/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v53 raises the two cross-wave path guide alpha/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v54 intentionally keeps gameplay identical/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v55 keeps gameplay identical/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v56 adds one-second density timeline/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v57 calibrates density against shot_log/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /v58 addresses bottom-camp triviality/.test(x)) &&
    !api.ROUTE_SOURCE_NOTES.some((x) => /Ikaruga|Gradius|Touhou/.test(x)),
  hasRouteTimeline:
    api.ROUTE_EVENTS.length >= 25 &&
    bossProbe.routeLabels.includes("DP bunker opens small tanks") &&
    bossProbe.routeLabels.includes("DP right bunker chase sweep") &&
    bossProbe.routeLabels.includes("DP midboss topoff bridge") &&
    bossProbe.routeLabels.includes("DP stage1 high turret midboss") &&
    bossProbe.routeLabels.includes("DP stage1 part boss"),
  chainWindowModeled: api.constants.CHAIN_WINDOW === 30,
  reachesMidboss: midProbe.midbossCount === 1 && midProbe.flags.dpHighTurretMidboss,
  reachesBossParts: bossProbe.bossCount === 1 && bossProbe.bossPartCount >= 2 && bossProbe.flags.dpPartBoss,
  usesHardTargetRelease:
    botProbe.flags.dpTankPair &&
    botProbe.flags.dpBunkerRelease &&
    botProbe.flags.bunkerDestroyed,
  bossPartStructure:
    botProbe.flags.bossBackTurretDestroyed &&
    botProbe.flags.bossSideTurretDestroyed &&
    botProbe.flags.bossFinalCue,
  botClearsWithBomb:
    botProbe.mode === "clear" &&
    botProbe.bombCount >= 1 &&
    botProbe.grade === "S" &&
    botProbe.killCount >= 60,
  chainIsMeasurable: botProbe.maxChain >= 8,
  midLateDensity:
    bossProbe.routeLabels.includes("DP midboss left feeder") &&
    bossProbe.routeLabels.includes("DP midboss escort left") &&
    bossProbe.routeLabels.includes("DP post-midboss cross squeeze") &&
    bossProbe.routeLabels.includes("DP post-midboss center tanks") &&
    bossProbe.routeLabels.includes("DP cross-lock carrier braid") &&
    bossProbe.routeLabels.includes("DP boss approach braid"),
  antiInstantKillStructure:
    bossProbe.routeLabels.includes("DP armored carrier gate") &&
    bossProbe.routeLabels.includes("DP shield wall choice") &&
    botProbe.flags.dpArmoredCarrier &&
    botProbe.flags.dpShieldWall &&
    botProbe.flags.armoredCarrierDestroyed,
  guaranteedFollowUpResidency:
    botProbe.flags.armoredBurstRelease &&
    botProbe.flags.shieldAbsorbedHits &&
    botProbe.flags.shieldBreakConnector,
  readableShieldAbsorption:
    botProbe.flags.shieldArmorMeter &&
    botProbe.flags.shieldCrackWarning &&
    botProbe.flags.shieldBreakCue,
  shieldBreakCreatesRelay:
    botProbe.flags.shieldBreakRelay &&
    botProbe.flags.shieldRelayDestroyed,
  relayOpensSideRoute:
    botProbe.flags.shieldRelayDestroyed &&
    botProbe.flags.shieldRelayOpensRoute &&
    botProbe.flags.shieldBreakConnector,
  relayPreviewUnlocks:
    botProbe.flags.relayShowsLockedRoutePreview &&
    botProbe.flags.relayPreviewUnlocks &&
    botProbe.flags.shieldRelayOpensRoute,
  relayRouteChoiceCommitted:
    botProbe.flags.relayRouteChoiceCommitted &&
    (botProbe.flags.relayRouteChoiceLeft || botProbe.flags.relayRouteChoiceRight) &&
    botProbe.flags.relayRouteCommittedFollowup,
  evalTelemetryCadence:
    botProbe.evalSummary.cadenceFrames === 30 &&
    botProbe.evalSummary.version === "v05_1_cdx_v58" &&
    botProbe.evalSummary.evalMethod === "graze-ledger-v003-density" &&
    botProbe.evalSummary.sampleCount >= 120 &&
    botProbe.evalSummary.eventCount >= 82,
  densityTimelinePresent:
    botProbe.evalSummary.densityAnalysis &&
    botProbe.evalSummary.densityAnalysis.seconds.length >= 60 &&
    Number.isFinite(botProbe.evalSummary.maxNoShootableGapSec) &&
    Number.isFinite(botProbe.evalSummary.maxEmptyScreenGapSec) &&
    Number.isFinite(botProbe.evalSummary.midgameMeanShootable) &&
    Number.isFinite(botProbe.evalSummary.bossApproachMeanShootable),
  densityTimelineUseful:
    botProbe.evalSummary.midgameMeanShootable > 0 &&
    botProbe.evalSummary.bossApproachMeanShootable > 0 &&
    botProbe.evalSummary.maxEmptyScreenGapSec <= 2,
  calibratedDensity:
    botProbe.evalSummary.midgameMeanShootable >= 5.0 &&
    botProbe.evalSummary.midgameMeanBullets <= 28 &&
    botProbe.evalSummary.maxEmptyScreenGapSec <= 1,
  evalTelemetryCoverage:
    botProbe.evalSummary.routeCoverage >= api.ROUTE_EVENTS.length &&
    botProbe.evalSummary.routeCoveragePct === 1 &&
    botProbe.evalSummary.eventTypes.route >= api.ROUTE_EVENTS.length &&
    botProbe.evalSummary.eventTypes.kill >= 60,
  evalTelemetryStyleVector:
    botProbe.evalSummary.targetUptime > 0.45 &&
    botProbe.evalSummary.urgentPct > 0.01 &&
    botProbe.evalSummary.horizontalSwitches >= 10 &&
    botProbe.evalSummary.dangerSpikes >= 1,
  evalLedgerExport:
    api.exportEvalLedger().version === "v05_1_cdx_v58" &&
    api.exportEvalLedger().evalMethod === "graze-ledger-v003-density" &&
    api.exportEvalLedger().summary.traceDigest.routeEvents >= api.ROUTE_EVENTS.length &&
    api.exportEvalLedger().summary.traceDigest.bossCue === 1 &&
    api.exportEvalLedger().summary.traceDigest.bossCueVolley === 1 &&
    api.exportEvalLedger().summary.traceDigest.bossCueSteer === 1 &&
    api.exportEvalLedger().summary.traceDigest.crossLockWave === 1 &&
    api.exportEvalLedger().summary.traceDigest.postMidCrossWave === 1 &&
    api.exportEvalLedger().summary.traceDigest.crossLockGuide === 1 &&
    api.exportEvalLedger().summary.traceDigest.postMidCrossGuide === 1 &&
    api.exportEvalLedger().summary.traceDigest.readabilityGuides === 2 &&
    api.exportEvalLedger().events.length === botProbe.evalSummary.eventCount,
};

report.readabilityGuideTrace =
  botProbe.evalSummary.eventTypes.crossLockGuide === 1 &&
  botProbe.evalSummary.eventTypes.postMidCrossGuide === 1 &&
  botProbe.evalSummary.traceDigest.readabilityGuides === 2;

const guideEvents = api.exportEvalLedger().events.filter((e) => e.type === "crossLockGuide" || e.type === "postMidCrossGuide");
report.quietGuideStyle =
  guideEvents.length === 2 &&
  guideEvents.every((e) => e.alpha === 0.12 && e.lineWidth === 2.2 && e.chevrons === false) &&
  guideEvents.find((e) => e.type === "crossLockGuide")?.paths === 2 &&
  guideEvents.find((e) => e.type === "postMidCrossGuide")?.paths === 2;

function runStyle(style) {
  const styleContext = vm.createContext({
    console,
    Math,
    URLSearchParams,
    location: { search: `?seed=12345&bot=1&botStyle=${style}` },
    document: {
      getElementById(id) {
        return id === "c" ? { getContext: () => ctx() } : { textContent: "" };
      },
    },
    window: { addEventListener() {} },
    requestAnimationFrame() {},
  });
  styleContext.globalThis = styleContext;
  vm.runInContext(source, styleContext, { filename: htmlPath });
  const styleApi = styleContext.window.__check;
  styleApi.startGame();
  if (style !== "camper") styleApi.state.player.iframe = 999999;
  for (let i = 0; i < styleApi.constants.STAGE_TARGET_FRAME + 900 && styleApi.state.mode === "play"; i++) {
    styleApi.update();
  }
  return styleApi.summarizeEvalTelemetry();
}

report.botStyleSplit = {
  route: runStyle("route"),
  aggressive: runStyle("aggressive"),
  defensive: runStyle("defensive"),
  panic: runStyle("panic"),
  novice: runStyle("novice"),
  marksman: runStyle("marksman"),
  survival: runStyle("survival"),
  camper: runStyle("camper"),
};

report.botStylePolicySignals = {
  styleNamesMatch:
    report.botStyleSplit.route.botStyle === "route" &&
    report.botStyleSplit.aggressive.botStyle === "aggressive" &&
    report.botStyleSplit.defensive.botStyle === "defensive" &&
    report.botStyleSplit.panic.botStyle === "panic" &&
    report.botStyleSplit.novice.botStyle === "novice" &&
    report.botStyleSplit.marksman.botStyle === "marksman" &&
    report.botStyleSplit.survival.botStyle === "survival" &&
    report.botStyleSplit.camper.botStyle === "camper",
  scoresSeparate: new Set([
    report.botStyleSplit.route.score,
    report.botStyleSplit.aggressive.score,
    report.botStyleSplit.defensive.score,
    report.botStyleSplit.panic.score,
    report.botStyleSplit.novice.score,
    report.botStyleSplit.marksman.score,
    report.botStyleSplit.survival.score,
    report.botStyleSplit.camper.score,
  ]).size >= 3,
  aggressiveKillsMore: report.botStyleSplit.aggressive.killCount > report.botStyleSplit.route.killCount,
  marksmanKillsAtLeastRoute: report.botStyleSplit.marksman.killCount >= report.botStyleSplit.route.killCount,
  defensivePressureDiffers: report.botStyleSplit.defensive.urgentPct > report.botStyleSplit.route.urgentPct,
  panicPressureDiffers: report.botStyleSplit.panic.urgentPct > report.botStyleSplit.route.urgentPct * 2,
  panicChurnsEarly:
    report.botStyleSplit.panic.urgentPct > report.botStyleSplit.route.urgentPct * 2,
  noviceSeparatesFromRoute:
    report.botStyleSplit.novice.result !== report.botStyleSplit.route.result ||
    report.botStyleSplit.novice.routeCoveragePct < report.botStyleSplit.route.routeCoveragePct * 0.75 ||
    report.botStyleSplit.novice.killCount < report.botStyleSplit.route.killCount * 0.75 ||
    report.botStyleSplit.novice.score !== report.botStyleSplit.route.score,
  survivalPressureDistinct:
    report.botStyleSplit.survival.result !== report.botStyleSplit.route.result ||
    report.botStyleSplit.survival.urgentPct > report.botStyleSplit.route.urgentPct * 1.5,
  camperIsNotDominant:
    report.botStyleSplit.camper.score < report.botStyleSplit.route.score * 0.9 &&
    report.botStyleSplit.camper.killCount < report.botStyleSplit.aggressive.killCount,
  camperStaysBottom: report.botStyleSplit.camper.bottomCampPct > 0.65,
};
report.botStylePoliciesDiffer = Object.values(report.botStylePolicySignals).every(Boolean);

console.log(JSON.stringify(report, null, 2));
if (
  !report.usesSingleSource ||
  !report.hasRouteTimeline ||
  !report.chainWindowModeled ||
  !report.reachesMidboss ||
  !report.reachesBossParts ||
  !report.usesHardTargetRelease ||
  !report.bossPartStructure ||
  !report.botClearsWithBomb ||
  !report.chainIsMeasurable ||
  !report.midLateDensity ||
  !report.antiInstantKillStructure ||
  !report.guaranteedFollowUpResidency ||
  !report.readableShieldAbsorption ||
  !report.shieldBreakCreatesRelay ||
  !report.relayOpensSideRoute ||
  !report.relayPreviewUnlocks ||
  !report.relayRouteChoiceCommitted ||
  !report.evalTelemetryCadence ||
  !report.evalTelemetryCoverage ||
  !report.evalTelemetryStyleVector
  || !report.densityTimelinePresent
  || !report.densityTimelineUseful
  || !report.calibratedDensity
  || !report.evalLedgerExport
  || !report.readabilityGuideTrace
  || !report.quietGuideStyle
  || !report.botStylePoliciesDiffer
) {
  process.exit(1);
}
