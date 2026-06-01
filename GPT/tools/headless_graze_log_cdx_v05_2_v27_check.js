const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v27", "index.html");
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
      ACTIVE_DEF_GAUGE_PER_CLEAR, ACTIVE_DEF_GAUGE_CAP, DEF_PROMPT_FRAMES, DEF_PROMPT_RING_LIFE, DEF_PROMPT_OUTER_LIFE, DEF_PROMPT_WINDOW,
      CONTRACT_BONUS_BASE, ORANGE_FOCUS_OPEN_START, ORANGE_FOCUS_OPEN_END, ORANGE_FOCUS_OPEN_DAMAGE,
      ORANGE_COMMIT_WARN_START, ORANGE_FOCUS_MAGNET_RADIUS, ORANGE_FOCUS_MAGNET_PULL,
      ORANGE_FOCUS_BREAK_RADIUS, ORANGE_FOCUS_BREAK_GAUGE
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
    finishPhaseContract,
    routeGrade,
    phaseContractTarget,
    spawnEnemy,
    orangeFocusOpen,
    orangeFocusWarn,
    applyOrangeFocusMagnet,
    triggerOrangeFocusBreak,
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
api.state.eventIndex = api.STAGE_EVENTS.length;
api.state.enemies = [];
api.state.ebullets = [];
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
  contractScore: api.state.contractScore,
  lastGrade: api.state.lastGrade,
};

api.startGame();
api.state.phaseLabel = "read center vee";
api.state.phaseIntent = "READ";
api.state.phaseStats = {
  label: api.state.phaseLabel,
  intent: api.state.phaseIntent,
  startT: api.state.t,
  graze: 5,
  kills: 2,
  bombs: 0,
  defs: 0,
  hits: 0,
  score0: api.state.score,
};
api.finishPhaseContract();
const contractPassProbe = {
  contractScore: api.state.contractScore,
  contractChain: api.state.contractChain,
  contractBreaks: api.state.contractBreaks,
  score: api.state.score,
  log: api.state.contractLog.at(-1),
};
api.state.phaseLabel = "boss";
api.state.phaseIntent = "BOSS";
api.state.phaseStats = {
  label: api.state.phaseLabel,
  intent: api.state.phaseIntent,
  startT: api.state.t,
  graze: 8,
  kills: 1,
  bombs: 2,
  defs: 0,
  hits: 2,
  score0: api.state.score,
};
api.finishPhaseContract();
const contractFailProbe = {
  contractScore: api.state.contractScore,
  contractChain: api.state.contractChain,
  contractBreaks: api.state.contractBreaks,
  log: api.state.contractLog.at(-1),
  bossTarget: api.phaseContractTarget("BOSS"),
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

api.startGame();
const orangeClosed = api.spawnEnemy("orangeAce", 210, 0, {});
orangeClosed.t = api.constants.ORANGE_FOCUS_OPEN_START - 12;
orangeClosed.y = 92;
const orangeClosedBeforeHp = orangeClosed.hp;
api.state.bullets = [{ x: orangeClosed.x, y: orangeClosed.y, vx: 0, vy: 0 }];
api.update();
const orangeClosedProbe = {
  beforeHp: orangeClosedBeforeHp,
  afterHp: orangeClosed.hp,
  open: api.orangeFocusOpen(orangeClosed),
};

api.startGame();
const orangeOpen = api.spawnEnemy("orangeAce", 210, 0, {});
orangeOpen.t = api.constants.ORANGE_FOCUS_OPEN_START + 18;
orangeOpen.y = 92;
const orangeOpenBeforeHp = orangeOpen.hp;
api.state.bullets = [{ x: orangeOpen.x, y: orangeOpen.y, vx: 0, vy: 0 }];
api.update();
const orangeOpenProbe = {
  beforeHp: orangeOpenBeforeHp,
  afterHp: orangeOpen.hp,
  open: api.orangeFocusOpen(orangeOpen),
};

api.startGame();
const orangeBreak = api.spawnEnemy("orangeAce", 210, 0, {});
orangeBreak.t = api.constants.ORANGE_FOCUS_OPEN_START + 18;
orangeBreak.y = 92;
api.state.gauge = 10;
api.state.ebullets = [
  { x: orangeBreak.x + 20, y: orangeBreak.y + 4, vx: 0, vy: 2, grazed: false, grazedT: 0 },
  { x: orangeBreak.x - 28, y: orangeBreak.y + 8, vx: 0, vy: 2, grazed: false, grazedT: 0 },
  { x: orangeBreak.x + api.constants.ORANGE_FOCUS_BREAK_RADIUS + 18, y: orangeBreak.y, vx: 0, vy: 2, grazed: false, grazedT: 0 },
];
api.state.bullets = [{ x: orangeBreak.x, y: orangeBreak.y, vx: 0, vy: 0 }];
const orangeBreakBefore = {
  hp: orangeBreak.hp,
  gauge: api.state.gauge,
  ebullets: api.state.ebullets.length,
  breaks: api.state.orangeFocusBreaks,
  graze: api.state.grazeCount,
  streak: api.state.grazeStreak,
};
api.update();
const orangeBreakProbe = {
  before: orangeBreakBefore,
  afterHp: orangeBreak.hp,
  gauge: api.state.gauge,
  ebullets: api.state.ebullets.length,
  breaks: api.state.orangeFocusBreaks,
  graze: api.state.grazeCount,
  streak: api.state.grazeStreak,
  rewarded: orangeBreak.focusBreakRewarded,
  popupText: api.state.popups.map((p) => p.text).join(" | "),
};

api.startGame();
const orangeWarn = api.spawnEnemy("orangeAce", 210, 0, {});
orangeWarn.t = api.constants.ORANGE_COMMIT_WARN_START + 10;
orangeWarn.x = 210;
orangeWarn.y = 92;
orangeWarn.commitX = 320;
orangeWarn.pattern = "orangeBrake";
api.update();
const orangeWarnProbe = {
  warn: api.orangeFocusWarn(orangeWarn),
  open: api.orangeFocusOpen(orangeWarn),
  movedRight: orangeWarn.x > 210,
};

api.startGame();
const orangeMagnet = api.spawnEnemy("orangeAce", 210, 0, {});
orangeMagnet.t = api.constants.ORANGE_FOCUS_OPEN_START + 20;
orangeMagnet.y = 92;
api.state.bullets = [{ x: orangeMagnet.x + 42, y: orangeMagnet.y + 10, vx: 0, vy: -9 }];
const magnetBefore = { ...api.state.bullets[0] };
const magnetApplied = api.applyOrangeFocusMagnet(api.state.bullets[0]);
const magnetAfter = { ...api.state.bullets[0] };
const orangeMagnetProbe = {
  applied: magnetApplied,
  before: magnetBefore,
  after: magnetAfter,
  vxPulledLeft: magnetAfter.vx < magnetBefore.vx,
  vyStillUp: magnetAfter.vy < 0,
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
    const survivalPhase = ["final braid lanes", "orange break line"].includes(api.state.phaseLabel);
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
      (api.state.phaseLabel.includes("vee") ||
      api.state.phaseLabel.includes("hook") ||
      api.state.phaseLabel.includes("wheel") ||
      api.state.phaseLabel.includes("carpet") ||
      api.state.phaseLabel.includes("braid") ||
      api.state.phaseLabel.includes("orange") ||
      api.state.phaseLabel.includes("midboss") ||
      api.state.phaseLabel === "boss warning" ||
      api.state.t >= api.constants.VOLCANO_START_FRAME + 650 ||
      api.state.enemies.some((e) =>
        ["volcanoMid", "heavyTankMid", "boss", "bossPart", "bunker", "hatch", "medium", "weaver", "sniper", "elite", "orangeAce", "redWing", "hookWing", "wheelWing"].includes(e.type)
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
          orangeAce: 8,
          sniper: 9,
          medium: 10,
          weaver: 11,
          wheelWing: 12,
          redWing: 13,
          hookWing: 14,
          sFairy: 15,
          sinePair: 16,
          scout: 17,
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
    contractScore: api.state.contractScore,
    contractBreaks: api.state.contractBreaks,
    contractLog: api.state.contractLog,
    grade: api.state.lastGrade,
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
  contractPassProbe,
  contractFailProbe,
  simpleBot,
  constants: api.constants,
  mediumThreat,
  orangeClosedProbe,
  orangeOpenProbe,
  orangeBreakProbe,
  orangeWarnProbe,
  orangeMagnetProbe,
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
    !/WINDOW \$\{windowN\}/.test(html) &&
    !/DEF \$\{Math\.min\(99,state\.defReadyT\)\}/.test(html) &&
    !/SPACE \[D\]EF/.test(html) &&
    /R_GRAZE\+7/.test(html),
  defPromptIsQuietRingOnly:
    defPromptProbeBefore.ready &&
    defPromptProbeAfter.ready &&
    defPromptProbeAfter.defReadyT === api.constants.DEF_PROMPT_FRAMES &&
    defPromptProbeAfter.promptCount === 1 &&
    defPromptProbeAfter.ringCount >= 2 &&
    defPromptProbeAfter.latestRing &&
    defPromptProbeAfter.latestRing.r0 === api.constants.ACTIVE_DEF_RADIUS + 6 &&
    defPromptProbeAfter.latestRing.r1 === api.constants.ACTIVE_DEF_RADIUS + 24 &&
    defPromptProbeAfter.latestRing.life === api.constants.DEF_PROMPT_OUTER_LIFE &&
    !/DEF WINDOW/.test(defPromptProbeAfter.popupText) &&
    defPromptProbeAfterDef.defReadyT === 0 &&
    defPromptProbeAfterDef.promptCount === 0 &&
    defPromptProbeAfterDef.activeDefCount === 1 &&
    /DEF_PROMPT_FRAMES/.test(html) &&
    /const DEF_PROMPT_FRAMES=78/.test(html) &&
    /focus break rewards/.test(html) &&
    /const DEF_PROMPT_RING_LIFE=52/.test(html) &&
    /const DEF_PROMPT_OUTER_LIFE=34/.test(html) &&
    /ACTIVE_DEF_RADIUS\+18/.test(html) &&
    /ACTIVE_DEF_RADIUS\+24/.test(html) &&
    /ACTIVE_DEF_RADIUS\+16/.test(html) &&
    /lineWidth=prompt\?4:1\.5/.test(html) &&
    !/DEF WINDOW/.test(html),
  finiteScriptReachesMidboss: afterMidbossStart.midbossCount === 1 && afterMidbossStart.phaseLabel === "midboss red stream",
  finiteScriptReachesBoss: afterBossStart.bossCount === 1 && afterBossStart.wave === api.STAGE_EVENTS.length && afterBossStart.eventIndex === api.STAGE_EVENTS.length,
  stageScriptUsesResearchedGrammar:
    api.STAGE_EVENTS.length >= 14 &&
    afterBossStart.scriptLabels.includes("read center vee") &&
    afterBossStart.scriptLabels.includes("lead left hook") &&
    afterBossStart.scriptLabels.includes("hold wheel turn") &&
    afterBossStart.scriptLabels.includes("focus orange gate") &&
    afterBossStart.scriptLabels.includes("cross hook dodge") &&
    afterBossStart.scriptLabels.includes("final braid lanes") &&
    afterBossStart.stageFlags.formation1942Vee &&
    afterBossStart.stageFlags.formation1942SideHook &&
    afterBossStart.stageFlags.formation1942WheelTurn &&
    afterBossStart.stageFlags.formation1942PeelEscort &&
    afterBossStart.stageFlags.formationOrangeAcePair &&
    afterBossStart.stageFlags.formationFinalBraid &&
    afterBossStart.stageFlags.heavyTankMidboss &&
    afterBossStart.stageFlags.bossParts,
  stageHasVisibleWaveIntent:
    api.STAGE_EVENTS.every((e) => api.WAVE_INTENTS[e.label]) &&
    new Set(Object.values(api.WAVE_INTENTS)).size >= 8 &&
    /phaseIntent/.test(html) &&
    /waveIntent/.test(html) &&
    /RESTOCK/.test(html) &&
    /RECOVER/.test(html) &&
    /FOCUS/.test(html) &&
    /LEAD/.test(html) &&
    /LANE/.test(html),
  mediumAnchorsAreThreatRewards:
    !!mediumThreat &&
    mediumThreat.r >= 16 &&
    mediumThreat.maxHp >= 6 &&
    mediumThreat.rewardGauge >= 10 &&
    mediumThreat.anchorT >= 180 &&
    /ANCHOR ESCAPING/.test(html),
  orangeFocusWindowsAreRealGameplay:
    api.constants.ORANGE_FOCUS_OPEN_START === 132 &&
    api.constants.ORANGE_FOCUS_OPEN_END === 218 &&
    api.constants.ORANGE_FOCUS_OPEN_DAMAGE === 3 &&
    orangeClosedProbe.open === false &&
    orangeClosedProbe.beforeHp - orangeClosedProbe.afterHp === 1 &&
    orangeOpenProbe.open === true &&
    orangeOpenProbe.beforeHp - orangeOpenProbe.afterHp === api.constants.ORANGE_FOCUS_OPEN_DAMAGE &&
    orangeBreakProbe.afterHp === orangeBreakProbe.before.hp - api.constants.ORANGE_FOCUS_OPEN_DAMAGE &&
    orangeBreakProbe.gauge === orangeBreakProbe.before.gauge + api.constants.ORANGE_FOCUS_BREAK_GAUGE &&
    orangeBreakProbe.ebullets === 1 &&
    orangeBreakProbe.breaks === orangeBreakProbe.before.breaks + 1 &&
    orangeBreakProbe.graze === orangeBreakProbe.before.graze + 2 &&
    orangeBreakProbe.streak === orangeBreakProbe.before.streak + 2 &&
    orangeBreakProbe.rewarded === true &&
    /FOCUS BREAK \+3/.test(orangeBreakProbe.popupText) &&
    api.constants.ORANGE_COMMIT_WARN_START === 104 &&
    api.constants.ORANGE_FOCUS_MAGNET_RADIUS === 54 &&
    api.constants.ORANGE_FOCUS_BREAK_RADIUS === 48 &&
    api.constants.ORANGE_FOCUS_BREAK_GAUGE === 3 &&
    orangeWarnProbe.warn === true &&
    orangeWarnProbe.open === false &&
    orangeWarnProbe.movedRight === true &&
    orangeMagnetProbe.applied === true &&
    orangeMagnetProbe.vxPulledLeft === true &&
    orangeMagnetProbe.vyStillUp === true &&
    /function orangeFocusOpen/.test(html) &&
    /function orangeFocusWarn/.test(html) &&
    /function applyOrangeFocusMagnet/.test(html) &&
    /function triggerOrangeFocusBreak/.test(html) &&
    /focusHit\?ORANGE_FOCUS_OPEN_DAMAGE:1/.test(html) &&
    /focus break rewards/.test(html),
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
  routeContractsScoreRealPlay:
    contractPassProbe.contractScore >= api.constants.CONTRACT_BONUS_BASE &&
    contractPassProbe.contractChain === 1 &&
    contractPassProbe.contractBreaks === 0 &&
    contractPassProbe.log &&
    contractPassProbe.log.ok === true &&
    contractPassProbe.log.intent === "READ" &&
    contractFailProbe.contractBreaks === 1 &&
    contractFailProbe.contractChain === 0 &&
    contractFailProbe.log &&
    contractFailProbe.log.ok === false &&
    contractFailProbe.bossTarget.bombsMax === 1 &&
    contractFailProbe.bossTarget.hitsMax === 1 &&
    /function finishPhaseContract/.test(html) &&
    /function routeGrade/.test(html) &&
    /ROUTE \+\$\{bonus\}/.test(html) &&
    /contractScore/.test(html),
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
  simpleBotEarnsRouteContracts:
    simpleBot.mode === "clear" &&
    simpleBot.contractScore > 0 &&
    simpleBot.contractLog.length > 0 &&
    ["S", "A", "B", "C", "D"].includes(simpleBot.grade),
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
  !report.orangeFocusWindowsAreRealGameplay ||
  !report.shieldStockIsTighterThanV13 ||
  !report.stageUsesMultipleEnemyRoles ||
  !report.bossBombStockIsEarnedByWarningWave ||
  !report.bossKillClearsStage ||
  !report.routeContractsScoreRealPlay ||
  !report.simpleBotReachesMidgame ||
  !report.simpleBotClearsAndSeesFinalCue ||
  !report.simpleBotUsesFinalBomb ||
  !report.simpleBotUsesActiveDefCue ||
  !report.simpleBotEarnsRouteContracts ||
  !report.finalBombCueIsTelegraphed ||
  !report.bombDamageIsMeaningfulButNotInstant
) {
  process.exit(1);
}
