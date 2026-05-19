const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v07", "index.html");
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
      BOMB_COOLDOWN_FRAMES, BOMB_BRAKE_FRAMES, MIDBOSS_START_FRAME, BOSS_START_FRAME, STAGE_TARGET_FRAME,
      BOSS_HP, BOSS_SOFT_ENRAGE_FRAME, MIDBOSS_REWARD_GAUGE, BOSS_WARNING_REWARD_GAUGE
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
for (let i = 0; i <= api.constants.MIDBOSS_START_FRAME + 10; i++) api.update();
const afterMidbossStart = {
  t: api.state.t,
  eventIndex: api.state.eventIndex,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  midbossCount: api.state.enemies.filter((e) => e.type === "midboss").length,
  typeCount: new Set(api.state.enemies.map((e) => e.type)).size,
};

for (let i = api.state.t; i <= api.constants.BOSS_START_FRAME + 10; i++) api.update();
const afterBossStart = {
  t: api.state.t,
  eventIndex: api.state.eventIndex,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  gauge: api.state.gauge,
  bombReady: api.bombReady(),
  warningRewardGauge: api.constants.BOSS_WARNING_REWARD_GAUGE,
  bossCount: api.state.enemies.filter((e) => e.type === "boss").length,
  seenTypes: [...new Set(api.state.enemies.map((e) => e.type))].sort(),
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

function runSimpleBot() {
  api.startGame();
  const frames = api.constants.STAGE_TARGET_FRAME + 900;
  const bossStats = { enteredFinal: false, bombedFinal: false, lowestHpRate: 1 };
  for (let i = 0; i < frames && api.state.mode === "play"; i++) {
    const p = api.state.player;
    let targetX = 210 + Math.sin(api.state.t * 0.012) * 54;
    let targetY = 548;
    const shouldCommitToShot = api.state.phaseLabel === "boss warning";
    const shootTargets = shouldCommitToShot ? api.state.enemies
      .filter((e) => e.y < p.y - 46)
      .sort((a, b) => {
        const rank = { boss: 0, midboss: 1, elite: 2, turret: 3, sniper: 4, weaver: 5, scout: 6 };
        return (rank[a.type] ?? 9) - (rank[b.type] ?? 9) || Math.abs(a.x - p.x) - Math.abs(b.x - p.x);
      }) : [];
    if (shootTargets[0]) {
      targetX = shootTargets[0].x;
    }
    for (const b of api.state.ebullets) {
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 125 * 125) {
        const w = (125 * 125 - d2) / (125 * 125);
        targetX += dx * w * 4.2;
        targetY += dy * w * 3.0;
      }
    }
    for (const e of api.state.enemies) {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 170 * 170) {
        const w = (170 * 170 - d2) / (170 * 170);
        targetX += dx * w * 3.2;
        targetY += dy * w * 2.8;
      }
    }
    targetX = Math.max(30, Math.min(390, targetX));
    targetY = Math.max(360, Math.min(590, targetY));
    api.keys.arrowleft = targetX < p.x - 8;
    api.keys.arrowright = targetX > p.x + 8;
    api.keys.arrowup = targetY < p.y - 8;
    api.keys.arrowdown = targetY > p.y + 8;
    const boss = api.state.enemies.find((e) => e.type === "boss");
    if (boss) {
      const hpRate = boss.hp / boss.maxHp;
      bossStats.lowestHpRate = Math.min(bossStats.lowestHpRate, hpRate);
      if (hpRate <= 0.28) bossStats.enteredFinal = true;
    }
    const nearBullets = api.state.ebullets.filter((b) => {
      const dx = p.x - b.x, dy = p.y - b.y;
      return dx * dx + dy * dy < 74 * 74;
    }).length;
    if (boss && boss.t > 150 && api.bombReady()) {
      api.fireBomb();
      bossStats.bombedFinal = boss.hp / boss.maxHp <= 0.30;
      bossStats.bombedBoss = true;
    }
    else if (nearBullets >= 7 && api.bombReady()) api.fireBomb();
    else if (nearBullets >= 3 && api.state.grazeStreak >= api.constants.GRAZE_STREAK_TH) api.triggerActiveDef();
    api.update();
  }
  api.keys.arrowleft = api.keys.arrowright = api.keys.arrowup = api.keys.arrowdown = false;
  return {
    mode: api.state.mode,
    t: api.state.t,
    phaseLabel: api.state.phaseLabel,
    wave: api.state.wave,
    score: api.state.score,
    gauge: api.state.gauge,
    bombReady: api.bombReady(),
    killCount: api.state.killCount,
    grazeCount: api.state.grazeCount,
    bombCount: api.state.bombCount,
    activeDefCount: api.state.activeDefCount,
    bossStats,
  };
}

const simpleBot = runSimpleBot();

const report = {
  afterBomb,
  afterCooldownWithoutGain,
  afterEarlyDef,
  afterReadyDef,
  afterMidbossStart,
  afterBossStart,
  afterBossKilled,
  simpleBot,
  constants: api.constants,
  bombKeepsLv3ButNotMax: afterBomb.gauge === api.constants.G_LV3,
  bombStartsCooldown: afterBomb.cooldown === api.constants.BOMB_COOLDOWN_FRAMES,
  bombStartsBrake: afterBomb.brake === api.constants.BOMB_BRAKE_FRAMES,
  bombDoesNotGrantFiveWay: afterBomb.shotCount === 3 && afterBomb.shotCooldown === 6,
  bombDoesNotAutoRecharge: afterCooldownWithoutGain.gauge < api.constants.G_MAX && !afterCooldownWithoutGain.ready,
  defNotEarly: afterEarlyDef.activeDefCount === 0 && afterEarlyDef.bullets === 1,
  defAtThreshold: afterReadyDef.activeDefCount === 1 && afterReadyDef.bullets === 0 && afterReadyDef.iframe >= api.constants.ACTIVE_DEF_FRAMES,
  finiteScriptReachesMidboss: afterMidbossStart.midbossCount === 1 && afterMidbossStart.phaseLabel === "midboss",
  finiteScriptReachesBoss: afterBossStart.bossCount === 1 && afterBossStart.wave === 14 && afterBossStart.eventIndex === 14,
  stageUsesMultipleEnemyRoles:
    afterBossStart.seenTypes.includes("boss") &&
    (afterMidbossStart.typeCount >= 2 || afterBossStart.seenTypes.length >= 2),
  bossBombStockIsEarnedByWarningWave:
    !/function spawnBoss\(\)[\s\S]*?state\.gauge=G_MAX/.test(html) &&
    api.constants.MIDBOSS_REWARD_GAUGE > api.constants.BOSS_WARNING_REWARD_GAUGE &&
    afterBossStart.warningRewardGauge > 2 &&
    afterBossStart.warningRewardGauge <= 14 &&
    afterBossStart.bombReady,
  bossKillClearsStage: afterBossKilled.mode === "clear" && afterBossKilled.clearTime !== null,
  simpleBotReachesMidgame: simpleBot.t >= api.constants.MIDBOSS_START_FRAME || simpleBot.phaseLabel === "midboss" || simpleBot.phaseLabel === "boss",
  simpleBotClearsWithBossBomb:
    simpleBot.mode === "clear" &&
    simpleBot.bombCount >= 1 &&
    simpleBot.bossStats.enteredFinal &&
    simpleBot.bossStats.bombedBoss,
  bombDamageIsMeaningfulButNotInstant:
    api.constants.BOSS_HP >= 40 &&
    api.constants.BOSS_HP / 12 > 3 &&
    api.constants.BOSS_HP / 12 < 5,
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
  !report.finiteScriptReachesMidboss ||
  !report.finiteScriptReachesBoss ||
  !report.stageUsesMultipleEnemyRoles ||
  !report.bossBombStockIsEarnedByWarningWave ||
  !report.bossKillClearsStage ||
  !report.simpleBotReachesMidgame ||
  !report.simpleBotClearsWithBossBomb ||
  !report.bombDamageIsMeaningfulButNotInstant
) {
  process.exit(1);
}
