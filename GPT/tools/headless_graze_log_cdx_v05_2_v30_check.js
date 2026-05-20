const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v30", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");

const source = match[1].replace(
  "loop();",
  `window.__check={state,keys,TRACE_EVENTS,TRACE_SOURCE_NOTES,startGame,update,fireBomb,triggerActiveDef,bombReady,spawnRedV5,spawnRedTenLadder,spawnSideCurl,spawnBonusPlane,spawnWidthPass,spawnBomberEscort,spawnBoss,spawnFuelColumns,spawnBossApproachFuel,constants:{G_MAX,G_LV3,START_SHIELDS,BOMB_COOLDOWN_FRAMES,BOMB_BRAKE_FRAMES,BOSS_START_FRAME,STAGE_TARGET_FRAME,BOSS_HP,BOSS_FINAL_LOCK_HP,SRC_W,SRC_H,W,H}};`
);

function ctx() {
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
run(api.constants.BOSS_START_FRAME + 50);
const bossStart = {
  t: api.state.t,
  mode: api.state.mode,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  flags: { ...api.state.stageFlags },
  labels: api.TRACE_EVENTS.map((e) => e.label),
  traceLog: api.state.traceLog,
  enemyTypes: [...new Set(api.state.enemies.map((e) => e.type))].sort(),
  bossCount: api.state.enemies.filter((e) => e.type === "boss").length,
};

const boss = api.state.enemies.find((e) => e.type === "boss");
if (!boss) throw new Error("boss not spawned");
api.state.gauge = api.constants.G_MAX;
api.fireBomb();
boss.hp = 0;
api.state.enemies = api.state.enemies.filter((e) => e.hp > 0);
run(900);
const clearProbe = {
  mode: api.state.mode,
  clearTime: api.state.clearTime,
  bombCount: api.state.bombCount,
  grade: api.state.lastGrade,
};

api.startGame();
api.state.player.iframe = 999999;
api.state.grazeStreak = 8;
api.state.ebullets = [{ x: api.state.player.x + 20, y: api.state.player.y, vx: 0, vy: 0, grazed: false }];
api.triggerActiveDef();
const defProbe = { activeDefCount: api.state.activeDefCount, bullets: api.state.ebullets.length };

api.startGame();
api.state.player.iframe = 999999;
run(api.constants.STAGE_TARGET_FRAME + 700);
const botProbe = {
  mode: api.state.mode,
  t: api.state.t,
  phaseLabel: api.state.phaseLabel,
  wave: api.state.wave,
  killCount: api.state.killCount,
  grazeCount: api.state.grazeCount,
  bombCount: api.state.bombCount,
  activeDefCount: api.state.activeDefCount,
  flags: { ...api.state.stageFlags },
  grade: api.state.lastGrade,
};

const report = {
  bossStart,
  clearProbe,
  defProbe,
  botProbe,
  hasTraceSourceNotes:
    api.TRACE_SOURCE_NOTES.length >= 4 &&
    api.TRACE_SOURCE_NOTES.some((x) => /five- and ten-plane red formations/.test(x)) &&
    api.TRACE_SOURCE_NOTES.some((x) => /lower left\/right/.test(x)) &&
    api.TRACE_SOURCE_NOTES.some((x) => /shot_log_cdx delta/.test(x)),
  usesSourceCoordinateScale:
    api.constants.SRC_W === 224 &&
    api.constants.SRC_H === 256 &&
    /function sx\(x\)/.test(html) &&
    /function sy\(y\)/.test(html),
  hasConcrete1942Labels:
    bossStart.labels.includes("1942 red five V down") &&
    bossStart.labels.includes("1942 red ten ladder") &&
    bossStart.labels.includes("1942 bottom bonus plane L") &&
    bossStart.labels.includes("1942 screen width pass gap R") &&
    bossStart.labels.includes("1942 large bomber proxy"),
  stageFlags:
    bossStart.flags.redFiveV &&
    bossStart.flags.redTenFormation &&
    bossStart.flags.leftCurl &&
    bossStart.flags.rightCurl &&
    bossStart.flags.bonusLeft &&
    bossStart.flags.bonusRight &&
    bossStart.flags.widthPass &&
    bossStart.flags.bomberEscort &&
    bossStart.flags.boss,
  traceLogsEveryWave: botProbe.wave === api.TRACE_EVENTS.length,
  bossSpawns: bossStart.bossCount === 1,
  densityFuelAdded:
    api.TRACE_EVENTS.length >= 24 &&
    bossStart.labels.includes("cdx opening left fuel columns") &&
    bossStart.labels.includes("cdx boss approach fuel gate") &&
    bossStart.flags.cdxDensityFuel &&
    bossStart.flags.cdxBossApproachFuel,
  clearWorks: clearProbe.mode === "clear" && clearProbe.clearTime !== null && clearProbe.bombCount === 1,
  activeDefWorks: defProbe.activeDefCount === 1 && defProbe.bullets === 0,
  finalCueReached: botProbe.flags.bossFinalCue === true,
  botClearsWithBomb: botProbe.mode === "clear" && botProbe.killCount > 20 && botProbe.bombCount > 0 && botProbe.grade === "S",
};

console.log(JSON.stringify(report, null, 2));
if (
  !report.hasTraceSourceNotes ||
  !report.usesSourceCoordinateScale ||
  !report.hasConcrete1942Labels ||
  !report.stageFlags ||
  !report.traceLogsEveryWave ||
  !report.bossSpawns ||
  !report.densityFuelAdded ||
  !report.clearWorks ||
  !report.activeDefWorks ||
  !report.finalCueReached ||
  !report.botClearsWithBomb
) {
  process.exit(1);
}
