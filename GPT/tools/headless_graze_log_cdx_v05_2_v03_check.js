const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v03", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");

const source = match[1].replace(
  "loop();",
  `window.__grazeLogCheck = {
    state,
    keys,
    constants: {
      G_MAX, G_LV2, G_LV3, GRAZE_STREAK_TH, ACTIVE_DEF_FRAMES, ACTIVE_DEF_RADIUS,
      BOMB_COOLDOWN_FRAMES, BOMB_BRAKE_FRAMES, BOSS_START_FRAME, STAGE_TARGET_FRAME
    },
    startGame,
    update,
    fireBomb,
    triggerActiveDef,
    shotCount,
    shotCooldownF,
    bombReady,
    gaugeReady,
    killEnemy
  };`
);

function makeContext() {
  return {
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    lineWidth: 1,
    font: "",
    textAlign: "left",
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    fillText() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
  };
}

const listeners = new Map();
const canvas = { getContext: () => makeContext() };
const seedinfo = { textContent: "" };
const storage = new Map();

const context = vm.createContext({
  console,
  Math,
  URLSearchParams,
  location: { search: "?seed=12345" },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
  document: {
    getElementById(id) {
      if (id === "c") return canvas;
      if (id === "seedinfo") return seedinfo;
      return { textContent: "" };
    },
  },
  window: {
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
  },
  requestAnimationFrame() {},
});
context.globalThis = context;

vm.runInContext(source, context, { filename: htmlPath });

const api = context.window.__grazeLogCheck;
api.startGame();

api.state.gauge = api.constants.G_MAX;
api.fireBomb();
const afterBomb = {
  bombCount: api.state.bombCount,
  gauge: api.state.gauge,
  cooldown: api.state.bombCooldownT,
  brake: api.state.bombBrakeT,
  shotCount: api.shotCount(),
  shotCooldown: api.shotCooldownF(),
};

api.state.player.iframe = 999999;
for (let i = 0; i < 720; i++) api.update();
const afterCooldownWithoutGain = {
  gauge: api.state.gauge,
  ready: api.bombReady(),
  shotCount: api.shotCount(),
};

api.state.grazeStreak = api.constants.GRAZE_STREAK_TH - 1;
api.state.ebullets = [{ x: api.state.player.x, y: api.state.player.y, vx: 0, vy: 0, grazed: false, grazedT: 0 }];
api.triggerActiveDef();
const afterEarlyDef = {
  activeDefCount: api.state.activeDefCount,
  bullets: api.state.ebullets.length,
};

api.state.grazeStreak = api.constants.GRAZE_STREAK_TH;
api.triggerActiveDef();
const afterReadyDef = {
  activeDefCount: api.state.activeDefCount,
  bullets: api.state.ebullets.length,
  iframe: api.state.player.iframe,
};

api.startGame();
api.state.player.iframe = 999999;
for (let i = 0; i <= api.constants.BOSS_START_FRAME + 10; i++) api.update();
const afterBossStart = {
  t: api.state.t,
  eventIndex: api.state.eventIndex,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  bossCount: api.state.enemies.filter((e) => e.type === "boss").length,
};

const boss = api.state.enemies.find((e) => e.type === "boss");
if (!boss) throw new Error("boss did not spawn");
api.killEnemy(boss);
boss.hp = 0;
api.state.enemies = api.state.enemies.filter((e) => e.hp > 0);
for (let i = 0; i < 100; i++) api.update();
const afterBossKilled = {
  mode: api.state.mode,
  clearTime: api.state.clearTime,
  score: api.state.score,
};

const report = {
  afterBomb,
  afterCooldownWithoutGain,
  afterEarlyDef,
  afterReadyDef,
  afterBossStart,
  afterBossKilled,
  constants: api.constants,
  bombKeepsLv3ButNotMax: afterBomb.gauge === api.constants.G_LV3,
  bombStartsCooldown: afterBomb.cooldown === api.constants.BOMB_COOLDOWN_FRAMES,
  bombStartsBrake: afterBomb.brake === api.constants.BOMB_BRAKE_FRAMES,
  bombDoesNotGrantFiveWay: afterBomb.shotCount === 3 && afterBomb.shotCooldown === 6,
  bombDoesNotAutoRecharge: afterCooldownWithoutGain.gauge < api.constants.G_MAX && !afterCooldownWithoutGain.ready,
  defNotEarly: afterEarlyDef.activeDefCount === 0 && afterEarlyDef.bullets === 1,
  defAtThreshold: afterReadyDef.activeDefCount === 1 && afterReadyDef.bullets === 0 && afterReadyDef.iframe >= api.constants.ACTIVE_DEF_FRAMES,
  finiteScriptReachesBoss: afterBossStart.bossCount === 1 && afterBossStart.wave === 9 && afterBossStart.eventIndex === 9,
  bossKillClearsStage: afterBossKilled.mode === "clear" && afterBossKilled.clearTime !== null,
};

console.log(JSON.stringify(report, null, 2));

if (
  !report.bombKeepsLv3ButNotMax ||
  !report.bombStartsCooldown ||
  !report.bombStartsBrake ||
  !report.bombDoesNotGrantFiveWay ||
  !report.bombDoesNotAutoRecharge ||
  !report.defNotEarly ||
  !report.defAtThreshold ||
  !report.finiteScriptReachesBoss ||
  !report.bossKillClearsStage
) {
  process.exit(1);
}
