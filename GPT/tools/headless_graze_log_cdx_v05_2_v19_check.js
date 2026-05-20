const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v19", "index.html");
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
      BOMB_COOLDOWN_FRAMES, BOMB_BRAKE_FRAMES, VOLCANO_START_FRAME, MIDBOSS_START_FRAME, BOSS_START_FRAME, STAGE_TARGET_FRAME,
      BOSS_HP, BOSS_SOFT_ENRAGE_FRAME, MIDBOSS_REWARD_GAUGE, BOSS_WARNING_REWARD_GAUGE, FINAL_BOMB_CUE_FRAMES, START_SHIELDS,
      ACTIVE_DEF_GAUGE_PER_CLEAR, ACTIVE_DEF_GAUGE_CAP, DEF_PROMPT_FRAMES, DEF_PROMPT_WINDOW
    },
    STAGE_EVENTS,
    WAVE_INTENTS,
    waveIntent,
    startGame,
    update,
    fireBomb,
    triggerActiveDef,
    grazeWindowCount,
    defPromptReady,
    activeDefGaugeReward,
    spawnEnemy,
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
api.state.grazeStreak = api.constants.GRAZE_STREAK_TH;
api.state.gauge = 40;
const px = api.state.player.x;
const py = api.state.player.y;
api.state.ebullets = [
  { x: px + 16, y: py, vx: 0, vy: 0, grazed: false, grazedT: 0 },
  { x: px - 18, y: py + 2, vx: 0, vy: 0, grazed: false, grazedT: 0 },
  { x: px + 24, y: py - 4, vx: 0, vy: 0, grazed: false, grazedT: 0 },
  { x: px - 36, y: py, vx: 0, vy: 0, grazed: false, grazedT: 0 },
];
const activeDefProbeBefore = {
  gauge: api.state.gauge,
  windowCount: api.grazeWindowCount(),
  rewardForFour: api.activeDefGaugeReward(4),
};
api.triggerActiveDef();
const activeDefProbeAfter = {
  gauge: api.state.gauge,
  bullets: api.state.ebullets.length,
  activeDefCount: api.state.activeDefCount,
  popupText: api.state.popups.map((p) => p.text).join(" | "),
};

api.startGame();
api.state.player.iframe = 999999;
api.state.grazeStreak = api.constants.GRAZE_STREAK_TH;
api.state.ebullets = [
  { x: px + 18, y: py, vx: 0, vy: 0, grazed: false, grazedT: 0 },
  { x: px - 22, y: py + 4, vx: 0, vy: 0, grazed: false, grazedT: 0 },
];
const defPromptProbeBefore = {
  ready: api.defPromptReady(),
  defReadyT: api.state.defReadyT,
  promptCount: api.state.defPromptCount,
};
for (let i = 0; i < api.constants.DEF_PROMPT_FRAMES; i++) api.update();
const defPromptProbeAfter = {
  ready: api.defPromptReady(),
  defReadyT: api.state.defReadyT,
  promptCount: api.state.defPromptCount,
  ringCount: api.state.rings.length,
  latestRing: api.state.rings.at(-1),
  popupText: api.state.popups.map((p) => p.text).join(" | "),
};
api.triggerActiveDef();
const defPromptProbeAfterDef = {
  defReadyT: api.state.defReadyT,
  promptCount: api.state.defPromptCount,
  activeDefCount: api.state.activeDefCount,
};

api.startGame();
api.state.player.iframe = 999999;
for (let i = 0; i <= api.constants.MIDBOSS_START_FRAME + 10; i++) api.update();
const afterMidbossStart = {
  t: api.state.t,
  eventIndex: api.state.eventIndex,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  midbossCount: api.state.enemies.filter((e) => e.type === "heavyTankMid").length,
  typeCount: new Set(api.state.enemies.map((e) => e.type)).size,
  stageFlags: { ...api.state.stageFlags },
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
  stageFlags: { ...api.state.stageFlags },
  scriptLabels: api.STAGE_EVENTS.map((e) => e.label),
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

api.startGame();
const mediumProbe = api.spawnEnemy("medium", 210, 0, {});
const mediumThreat = {
  r: mediumProbe.r,
  hp: mediumProbe.hp,
  maxHp: mediumProbe.maxHp,
  rewardGauge: mediumProbe.rewardGauge || 0,
  anchorT: mediumProbe.anchorT || 0,
};

function runSimpleBot() {
  api.startGame();
  const frames = api.constants.STAGE_TARGET_FRAME + 900;
  const bossStats = { enteredFinal: false, bombedFinal: false, lowestHpRate: 1, chargeSeen: false, finalCueFired: false };
  for (let i = 0; i < frames && api.state.mode === "play"; i++) {
    const p = api.state.player;
    let targetX = 210 + Math.sin(api.state.t * 0.012) * 54;
    let targetY = 548;
    const boss = api.state.enemies.find((e) => e.type === "boss");
    const survivalPhase = ["shot_log cross pressure", "last chain wall"].includes(api.state.phaseLabel);
    const bossPressure = !!boss && api.state.ebullets.length >= 6;
    if (survivalPhase || bossPressure) {
      targetY = 588;
      let best = { x: targetX, risk: Infinity };
      for (let x = 34; x <= 386; x += 22) {
        let risk = 0;
        for (const b of api.state.ebullets) {
          const px = b.x + b.vx * 14;
          const py = b.y + b.vy * 14;
          const dx = x - px;
          const dy = targetY - py;
          risk += 28000 / Math.max(220, dx * dx + dy * dy);
        }
        for (const e of api.state.enemies) {
          const dx = x - e.x;
          const dy = targetY - e.y;
          risk += 52000 / Math.max(260, dx * dx + dy * dy);
        }
        if (risk < best.risk) best = { x, risk };
      }
      targetX = best.x;
    }
    const shouldCommitToShot =
      !survivalPhase &&
      (api.state.phaseLabel.startsWith("shot_log") ||
      api.state.phaseLabel === "boss warning" ||
      api.state.t >= api.constants.VOLCANO_START_FRAME + 650 ||
      api.state.enemies.some((e) =>
        ["volcanoMid", "heavyTankMid", "boss", "bossPart", "bunker", "hatch", "medium", "weaver", "sniper", "elite"].includes(e.type)
      ));
    const shootTargets = shouldCommitToShot ? api.state.enemies
      .filter((e) => e.y < p.y - 46)
      .sort((a, b) => {
        const rank = {
          boss: 0,
          heavyTankMid: 1,
          volcanoMid: 2,
          bossPart: 3,
          bunker: 4,
          hatch: 5,
          elite: 6,
          turret: 7,
          sniper: 8,
          weaver: 9,
          sFairy: 10,
          sinePair: 11,
          scout: 12,
        };
        return (rank[a.type] ?? 99) - (rank[b.type] ?? 99) || Math.abs(a.x - p.x) - Math.abs(b.x - p.x);
      }) : [];
    if (shootTargets[0]) {
      targetX = shootTargets[0].x;
    }
    for (const b of api.state.ebullets) {
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 155 * 155) {
        const w = (155 * 155 - d2) / (155 * 155);
        targetX += dx * w * 5.0;
        targetY += dy * w * 3.6;
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
    if (boss) {
      const hpRate = boss.hp / boss.maxHp;
      bossStats.lowestHpRate = Math.min(bossStats.lowestHpRate, hpRate);
      if (hpRate <= 0.28) bossStats.enteredFinal = true;
      if (boss.finalChargeT > 0) bossStats.chargeSeen = true;
      if (boss.finalCueFired) bossStats.finalCueFired = true;
    }
    const nearBullets = api.state.ebullets.filter((b) => {
      const dx = p.x - b.x, dy = p.y - b.y;
      return dx * dx + dy * dy < 74 * 74;
    }).length;
    if (boss && boss.finalCueFired && api.bombReady()) {
      api.fireBomb();
      bossStats.bombedFinal = boss.hp / boss.maxHp <= 0.30;
      bossStats.bombedBoss = true;
    }
    else if (!boss && nearBullets >= 7 && api.bombReady()) api.fireBomb();
    else if (api.state.grazeStreak >= api.constants.GRAZE_STREAK_TH) api.triggerActiveDef();
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
  activeDefProbeBefore,
  activeDefProbeAfter,
  defPromptProbeBefore,
  defPromptProbeAfter,
  defPromptProbeAfterDef,
  afterMidbossStart,
  afterBossStart,
  afterBossKilled,
  simpleBot,
  constants: api.constants,
  mediumThreat,
  waveIntents: api.WAVE_INTENTS,
  startShields: api.constants.START_SHIELDS,
  bombKeepsLv3ButNotMax: afterBomb.gauge === api.constants.G_LV3,
  bombStartsCooldown: afterBomb.cooldown === api.constants.BOMB_COOLDOWN_FRAMES,
  bombStartsBrake: afterBomb.brake === api.constants.BOMB_BRAKE_FRAMES,
  bombDoesNotGrantFiveWay: afterBomb.shotCount === 3 && afterBomb.shotCooldown === 6,
  bombDoesNotAutoRecharge: afterCooldownWithoutGain.gauge < api.constants.G_MAX && !afterCooldownWithoutGain.ready,
  defNotEarly: afterEarlyDef.activeDefCount === 0 && afterEarlyDef.bullets === 1,
  defAtThreshold: afterReadyDef.activeDefCount === 1 && afterReadyDef.bullets === 0 && afterReadyDef.iframe >= api.constants.ACTIVE_DEF_FRAMES,
  activeDefReadsAndRewardsGraze:
    activeDefProbeBefore.windowCount >= 3 &&
    activeDefProbeBefore.rewardForFour === 8 &&
    activeDefProbeAfter.activeDefCount === 1 &&
    activeDefProbeAfter.bullets === 0 &&
    activeDefProbeAfter.gauge === activeDefProbeBefore.gauge + 8 &&
    /DEF x4 \+8/.test(activeDefProbeAfter.popupText) &&
    /WINDOW \$\{windowN\}/.test(html) &&
    /R_GRAZE\+7/.test(html),
  defPromptIsQuietRingOnly:
    defPromptProbeBefore.ready &&
    defPromptProbeAfter.ready &&
    defPromptProbeAfter.defReadyT === api.constants.DEF_PROMPT_FRAMES &&
    defPromptProbeAfter.promptCount === 1 &&
    defPromptProbeAfter.ringCount >= 1 &&
    defPromptProbeAfter.latestRing &&
    defPromptProbeAfter.latestRing.r0 === api.constants.ACTIVE_DEF_RADIUS - 18 &&
    defPromptProbeAfter.latestRing.r1 === api.constants.ACTIVE_DEF_RADIUS + 10 &&
    defPromptProbeAfter.latestRing.life === 42 &&
    !/DEF WINDOW/.test(defPromptProbeAfter.popupText) &&
    defPromptProbeAfterDef.defReadyT === 0 &&
    defPromptProbeAfterDef.promptCount === 0 &&
    defPromptProbeAfterDef.activeDefCount === 1 &&
    /DEF_PROMPT_FRAMES/.test(html) &&
    /const DEF_PROMPT_FRAMES=78/.test(html) &&
    /DEF \$\{Math\.min\(99,state\.defReadyT\)\}/.test(html) &&
    /ACTIVE_DEF_RADIUS\+10/.test(html) &&
    /ACTIVE_DEF_RADIUS\+12/.test(html) &&
    /lineWidth=prompt\?3:1\.5/.test(html) &&
    /readable quiet DEF cue/.test(html) &&
    !/DEF WINDOW/.test(html),
  finiteScriptReachesMidboss: afterMidbossStart.midbossCount === 1 && afterMidbossStart.phaseLabel === "donpachi heavy tank",
  finiteScriptReachesBoss: afterBossStart.bossCount === 1 && afterBossStart.wave === api.STAGE_EVENTS.length && afterBossStart.eventIndex === api.STAGE_EVENTS.length,
  stageScriptUsesResearchedGrammar:
    api.STAGE_EVENTS.length >= 18 &&
    afterBossStart.scriptLabels.includes("shot_log center column") &&
    afterBossStart.scriptLabels.includes("shot_log left sweep") &&
    afterBossStart.scriptLabels.includes("shot_log v clamp") &&
    afterBossStart.scriptLabels.includes("shot_log dive curtain") &&
    afterBossStart.scriptLabels.includes("ikaruga dual column") &&
    afterBossStart.scriptLabels.includes("gradius hatch lane") &&
    afterBossStart.scriptLabels.includes("touhou s-stream") &&
    afterBossStart.scriptLabels.includes("gradius volcano") &&
    afterBossStart.scriptLabels.includes("donpachi bunker") &&
    afterBossStart.scriptLabels.includes("donpachi heavy tank") &&
    afterBossStart.stageFlags.dualColumn &&
    afterBossStart.stageFlags.shotLogCenterColumn &&
    afterBossStart.stageFlags.shotLogSideSweep &&
    afterBossStart.stageFlags.shotLogVClamp &&
    afterBossStart.stageFlags.shotLogDiveCurtain &&
    afterBossStart.stageFlags.shotLogMediumAnchor &&
    afterBossStart.stageFlags.hatchLane &&
    afterBossStart.stageFlags.sStream &&
    afterBossStart.stageFlags.volcanoMidboss &&
    afterBossStart.stageFlags.bunkerRelease &&
    afterBossStart.stageFlags.heavyTankMidboss &&
    afterBossStart.stageFlags.bossParts,
  stageHasVisibleWaveIntent:
    api.STAGE_EVENTS.every((e) => api.WAVE_INTENTS[e.label]) &&
    new Set(Object.values(api.WAVE_INTENTS)).size >= 8 &&
    /phaseIntent/.test(html) &&
    /waveIntent/.test(html) &&
    /RESTOCK/.test(html) &&
    /RECOVER/.test(html) &&
    /ANCHOR/.test(html),
  mediumAnchorsAreThreatRewards:
    !!mediumThreat &&
    mediumThreat.r >= 16 &&
    mediumThreat.maxHp >= 6 &&
    mediumThreat.rewardGauge >= 10 &&
    mediumThreat.anchorT >= 180 &&
    /ANCHOR ESCAPING/.test(html),
  shieldStockIsTighterThanV13:
    api.constants.START_SHIELDS === 4 &&
    !/shieldStock=6/.test(html) &&
    /SHIELD \$\{state\.shieldStock\}\/\$\{START_SHIELDS\}/.test(html),
  stageUsesMultipleEnemyRoles:
    afterBossStart.seenTypes.includes("boss") &&
    (afterMidbossStart.typeCount >= 2 || afterBossStart.seenTypes.length >= 2),
  bossBombStockIsEarnedByWarningWave:
    !/function spawnBoss\(\)[\s\S]*?state\.gauge=G_MAX/.test(html) &&
    api.constants.MIDBOSS_REWARD_GAUGE > api.constants.BOSS_WARNING_REWARD_GAUGE &&
    afterBossStart.warningRewardGauge > 2 &&
    afterBossStart.warningRewardGauge <= 40 &&
    afterBossStart.bombReady,
  bossKillClearsStage: afterBossKilled.mode === "clear" && afterBossKilled.clearTime !== null,
  simpleBotReachesMidgame: simpleBot.t >= api.constants.MIDBOSS_START_FRAME || simpleBot.phaseLabel === "midboss" || simpleBot.phaseLabel === "boss",
  simpleBotClearsAndSeesFinalCue:
    simpleBot.mode === "clear" &&
    simpleBot.bossStats.enteredFinal &&
    simpleBot.bossStats.chargeSeen &&
    simpleBot.bossStats.finalCueFired,
  simpleBotUsesFinalBomb:
    simpleBot.mode === "clear" &&
    simpleBot.bombCount >= 1 &&
    simpleBot.bossStats.bombedFinal &&
    simpleBot.bossStats.bombedBoss,
  simpleBotUsesActiveDefCue:
    simpleBot.mode === "clear" &&
    simpleBot.grazeCount >= api.constants.GRAZE_STREAK_TH &&
    simpleBot.activeDefCount >= 1,
  finalBombCueIsTelegraphed:
    api.constants.FINAL_BOMB_CUE_FRAMES >= 60 &&
    api.constants.FINAL_BOMB_CUE_FRAMES <= 120 &&
    /FINAL PHASE - CHARGE/.test(html) &&
    /CORE OPEN/.test(html) &&
    /CORE CHARGED/.test(html) &&
    /SHIELD BREAK/.test(html) &&
    /BOSS BREAK - GOLD LINE/.test(html) &&
    /finalChargeT/.test(html) &&
    !/BOMB NOW/.test(html) &&
    !/EARN BOMB/.test(html),
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
  !report.activeDefReadsAndRewardsGraze ||
  !report.defPromptIsQuietRingOnly ||
  !report.finiteScriptReachesMidboss ||
  !report.finiteScriptReachesBoss ||
  !report.stageScriptUsesResearchedGrammar ||
  !report.stageHasVisibleWaveIntent ||
  !report.mediumAnchorsAreThreatRewards ||
  !report.shieldStockIsTighterThanV13 ||
  !report.stageUsesMultipleEnemyRoles ||
  !report.bossBombStockIsEarnedByWarningWave ||
  !report.bossKillClearsStage ||
  !report.simpleBotReachesMidgame ||
  !report.simpleBotClearsAndSeesFinalCue ||
  !report.simpleBotUsesFinalBomb ||
  !report.simpleBotUsesActiveDefCue ||
  !report.finalBombCueIsTelegraphed ||
  !report.bombDamageIsMeaningfulButNotInstant
) {
  process.exit(1);
}
