const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v40", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");

const source = match[1].replace(
  "loop();",
  `window.__check={state,keys,ROUTE_EVENTS,ROUTE_SOURCE_NOTES,startGame,update,fireBomb,triggerActiveDef,bombReady,constants:{G_MAX,G_LV3,START_SHIELDS,CHAIN_WINDOW,MIDBOSS_START_FRAME,BOSS_START_FRAME,STAGE_TARGET_FRAME,BOSS_HP,W,H}};`
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
  location: { search: "?seed=12345&bot=1" },
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
};

const report = {
  midProbe,
  bossProbe,
  botProbe,
  usesSingleSource:
    api.ROUTE_SOURCE_NOTES.some((x) => /DonPachi GPS chain/.test(x)) &&
    api.ROUTE_SOURCE_NOTES.some((x) => /one source grammar only/.test(x)) &&
    !api.ROUTE_SOURCE_NOTES.some((x) => /Ikaruga|Gradius|Touhou/.test(x)),
  hasRouteTimeline:
    api.ROUTE_EVENTS.length >= 25 &&
    bossProbe.routeLabels.includes("DP bunker opens small tanks") &&
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
    bossProbe.routeLabels.includes("DP post-midboss center tanks") &&
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
};

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
  !report.relayRouteChoiceCommitted
) {
  process.exit(1);
}
