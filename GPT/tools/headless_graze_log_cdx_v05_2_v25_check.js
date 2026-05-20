const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v25", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");

const source = match[1].replace(
  "loop();",
  `window.__check={state,keys,STAGE_EVENTS,WAVE_INTENTS,EXPECTED_X,startGame,update,fireBomb,triggerActiveDef,bombReady,gaugeReady,spawnLane,spawnSwitchMarker,spawnGapSweep,spawnAnchorCore,constants:{G_MAX,G_LV3,GRAZE_STREAK_TH,BOMB_COOLDOWN_FRAMES,BOMB_BRAKE_FRAMES,BOSS_START_FRAME,STAGE_TARGET_FRAME,BOSS_HP,FINAL_BOMB_CUE_FRAMES,START_SHIELDS}};`
);

function ctx(){return {fillStyle:"",strokeStyle:"",globalAlpha:1,lineWidth:1,font:"",textAlign:"",fillRect(){},strokeRect(){},beginPath(){},arc(){},fill(){},stroke(){},fillText(){},moveTo(){},lineTo(){},closePath(){}};}
const context = vm.createContext({
  console, Math, URLSearchParams, location:{search:"?seed=12345"},
  document:{getElementById(id){return id==="c"?{getContext:()=>ctx()}:{textContent:""};}},
  window:{addEventListener(){}}, requestAnimationFrame(){},
});
context.globalThis = context;
vm.runInContext(source, context, { filename: htmlPath });
const api = context.window.__check;

function run(frames){
  for(let i=0;i<frames&&api.state.mode==="play";i++)api.update();
}

api.startGame();
api.state.gauge = api.constants.G_MAX;
api.fireBomb();
const bombProbe = {
  bombCount: api.state.bombCount,
  gauge: api.state.gauge,
  cooldown: api.state.bombCooldownT,
  brake: api.state.bombBrakeT,
  ready: api.bombReady(),
};

api.startGame();
api.state.player.iframe = 999999;
run(api.constants.BOSS_START_FRAME + 20);
const bossStart = {
  t: api.state.t,
  mode: api.state.mode,
  wave: api.state.wave,
  phaseLabel: api.state.phaseLabel,
  bossCount: api.state.enemies.filter(e=>e.type==="boss").length,
  flags: {...api.state.stageFlags},
  labels: api.STAGE_EVENTS.map(e=>e.label),
};

const boss = api.state.enemies.find(e=>e.type==="boss");
if (!boss) throw new Error("boss not spawned");
boss.hp = 1;
api.state.gauge = api.constants.G_MAX;
api.fireBomb();
boss.hp = 0;
api.state.enemies = api.state.enemies.filter(e=>e.hp>0);
run(180);
const clearProbe = {
  mode: api.state.mode,
  clearTime: api.state.clearTime,
  score: api.state.score,
  contractScore: api.state.contractScore,
  grade: api.state.lastGrade,
};

api.startGame();
api.state.player.iframe = 999999;
api.state.grazeStreak = api.constants.GRAZE_STREAK_TH;
api.state.ebullets = [{x:api.state.player.x+20,y:api.state.player.y,vx:0,vy:0,grazed:false}];
api.triggerActiveDef();
const defProbe = {
  activeDefCount: api.state.activeDefCount,
  bullets: api.state.ebullets.length,
};

api.startGame();
api.state.player.iframe = 999999;
run(api.constants.STAGE_TARGET_FRAME + 500);
const botProbe = {
  mode: api.state.mode,
  t: api.state.t,
  phaseLabel: api.state.phaseLabel,
  wave: api.state.wave,
  killCount: api.state.killCount,
  grazeCount: api.state.grazeCount,
  bombCount: api.state.bombCount,
  activeDefCount: api.state.activeDefCount,
  contractScore: api.state.contractScore,
  contractBreaks: api.state.contractBreaks,
  grade: api.state.lastGrade,
};

const report = {
  bombProbe,
  bossStart,
  clearProbe,
  defProbe,
  botProbe,
  hasCleanEnemySource:
    !/spawn1942|redWing|orangeAce|hookWing|wheelWing|sinePair|shotLog/.test(html) &&
    /function spawnLane/.test(html) &&
    /function spawnSwitchMarker/.test(html) &&
    /function updateIntentEnemy/.test(html),
  hasBrainstorm: fs.readFileSync(path.join(root,"game","graze_log_cdx","v05_1_cdx_v25","design_log.md"),"utf8").includes("ブレスト cycle 1"),
  labelsGuidePlayer:
    api.STAGE_EVENTS.map(e=>e.label).join("|") ===
    "galaga left lane|switch right marker|galaga right lane|1942 gap left|focus center pin|left lane under fire|right lane under fire|midboss anchor|midboss right switch|midboss left stream|restock left right|final relay switch|final gap right|boss warning|boss",
  expectedPositions: Object.keys(api.EXPECTED_X).length === api.STAGE_EVENTS.length,
  stageFlags:
    bossStart.flags.laneLeft &&
    bossStart.flags.switchRight &&
    bossStart.flags.laneRight &&
    bossStart.flags.gapLeft &&
    bossStart.flags.centerPin &&
    bossStart.flags.anchorCore &&
    bossStart.flags.restockSweep &&
    bossStart.flags.finalRelay &&
    bossStart.flags.gapRight &&
    bossStart.flags.boss,
  bombWorks:
    bombProbe.bombCount === 1 &&
    bombProbe.gauge === api.constants.G_LV3 &&
    bombProbe.cooldown === api.constants.BOMB_COOLDOWN_FRAMES &&
    bombProbe.brake === api.constants.BOMB_BRAKE_FRAMES &&
    !bombProbe.ready,
  activeDefWorks: defProbe.activeDefCount === 1 && defProbe.bullets === 0,
  bossSpawns: bossStart.bossCount === 1 && bossStart.wave === api.STAGE_EVENTS.length,
  clearWorks: clearProbe.mode === "clear" && clearProbe.clearTime !== null,
  botClears: botProbe.mode === "clear" && botProbe.killCount > 20,
};

console.log(JSON.stringify(report,null,2));
if(!report.hasCleanEnemySource||!report.hasBrainstorm||!report.labelsGuidePlayer||!report.expectedPositions||!report.stageFlags||!report.bombWorks||!report.activeDefWorks||!report.bossSpawns||!report.clearWorks||!report.botClears)process.exit(1);
