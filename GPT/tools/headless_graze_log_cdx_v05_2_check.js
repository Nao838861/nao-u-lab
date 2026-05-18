const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v01", "index.html");
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
      BOMB_COOLDOWN_FRAMES, BOMB_OVERDRIVE_FRAMES
    },
    startGame,
    update,
    fireBomb,
    triggerActiveDef,
    shotCount,
    shotCooldownF,
    bombReady,
    gaugeReady
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
  setTimeout(handler) { handler(); return 1; },
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
  overdrive: api.state.overdriveT,
  shotCount: api.shotCount(),
  shotCooldown: api.shotCooldownF(),
};

api.fireBomb();
const afterBlockedBomb = {
  bombCount: api.state.bombCount,
  cooldown: api.state.bombCooldownT,
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

for (let i = 0; i < 1800; i++) api.update();
const afterThirtySeconds = {
  mode: api.state.mode,
  t: api.state.t,
  wave: api.state.wave,
  cooldown: api.state.bombCooldownT,
  overdrive: api.state.overdriveT,
};

const report = {
  afterBomb,
  afterBlockedBomb,
  afterEarlyDef,
  afterReadyDef,
  afterThirtySeconds,
  constants: api.constants,
  bombKeepsLv3: afterBomb.gauge === api.constants.G_LV3,
  bombStartsCooldown: afterBomb.cooldown === api.constants.BOMB_COOLDOWN_FRAMES,
  bombStartsOverdrive: afterBomb.overdrive === api.constants.BOMB_OVERDRIVE_FRAMES,
  overdriveChangesShot: afterBomb.shotCount === 5 && afterBomb.shotCooldown === 4,
  cooldownBlocksSecondBomb: afterBlockedBomb.bombCount === 1,
  defThresholdTightened: api.constants.GRAZE_STREAK_TH === 9 && api.constants.ACTIVE_DEF_RADIUS === 58,
  defNotEarly: afterEarlyDef.activeDefCount === 0 && afterEarlyDef.bullets === 1,
  defAtThreshold: afterReadyDef.activeDefCount === 1 && afterReadyDef.bullets === 0 && afterReadyDef.iframe >= api.constants.ACTIVE_DEF_FRAMES,
  thirtySecondsRuns: afterThirtySeconds.t >= 1800,
};

console.log(JSON.stringify(report, null, 2));

if (
  !report.bombKeepsLv3 ||
  !report.bombStartsCooldown ||
  !report.bombStartsOverdrive ||
  !report.overdriveChangesShot ||
  !report.cooldownBlocksSecondBomb ||
  !report.defThresholdTightened ||
  !report.defNotEarly ||
  !report.defAtThreshold ||
  !report.thirtySecondsRuns
) {
  process.exit(1);
}
