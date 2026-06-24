const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const js = fs.readFileSync("game.js", "utf8");

const checks = [
  ["canvas exists", html.includes('<canvas id="field"')],
  ["throw slider exists", html.includes('id="throwSlider"')],
  ["defense list exists", html.includes('id="defenseList"')],
  ["add point button exists", html.includes('id="addPointButton"')],
  ["speed controls exist", html.includes('class="speedButton active"') && html.includes('id="pauseButton"')],
  ["replay button exists", html.includes('id="replayButton"') && html.includes("Replay")],
  ["replay scrubber exists", html.includes('id="replayScrubber"') && html.includes('id="frameBackButton"') && html.includes('id="frameForwardButton"')],
  ["replay marker strip exists", html.includes('id="markerStrip"') && html.includes("replay event markers")],
  ["three plays", (js.match(/name: "/g) || []).length >= 6],
  ["defense calls", js.includes("defenseCalls") && js.includes("Edge Blitz")],
  ["throw timing", js.includes("throwSlider") && js.includes("throwTime")],
  ["longer play timing", html.includes('value="2.2"') && js.includes("routeDuration = 3.6") && js.includes("maxPlayTime = 6.2")],
  ["route point editing", js.includes("addPointNear") && js.includes("setRoutePoint")],
  ["drive advancement", js.includes("advanceDrive") && js.includes("state.down")],
  ["analysis reads", js.includes("evaluateReceivers") && js.includes("QB評価")],
  ["catch clarity", js.includes("resolveCatch") && js.includes("finishRunAfterCatch") && js.includes("CATCH")],
  ["player orientation", js.includes("angleLerp") && js.includes("backpedalToward") && js.includes("cutFlash")],
  ["read game", js.includes("chooseActualDefense") && js.includes("gradeCall") && js.includes("Coach")],
  ["football contact", js.includes("finishSack") && js.includes("hitPenalty") && js.includes("sackRadius")],
  ["round player markers", js.includes("ctx.arc(0, 0, radius") && !js.includes("roundedRectPath")],
  ["pass protection", js.includes("baseLine") && js.includes("updatePassProtection") && js.includes("pocketWidth")],
  ["screen release", js.includes("screenReleaseTime") && js.includes("screenReleased") && js.includes("SCREEN RELEASE")],
  ["rb pass protection", js.includes("screenProtectPoint") && js.includes('rusher.id === "LB"') && js.includes("blocker.id === \"H\"")],
  ["screen target logic", js.includes("screenBonus") && js.includes("screenReleased() ?")],
  ["screen snapshot", js.includes("screenReleased: screenReleased()") && js.includes("screenReleaseTime: screenReleaseTime()")],
  ["screen wall lead blockers", js.includes("activeScreenCatch") && js.includes("screenWallTarget") && js.includes("ol.screenLead = true")],
  ["screen wall slowdown", js.includes("screenWallSlowdown") && js.includes("defender.screenPicked")],
  ["screen wall snapshot", js.includes("screenWall: state.line.filter") && js.includes("screenPicks: state.defense.filter")],
  ["screen wall replay state", js.includes("screenLead: p.screenLead") && js.includes("screenPicked: p.screenPicked")],
  ["pocket penalty logging", js.includes("contactPenalty") && js.includes("足場の悪い投球")],
  ["slow playback state", js.includes("speedScale") && js.includes("setSpeedScale") && js.includes("dt * state.speedScale")],
  ["pause controls", js.includes("setPaused") && js.includes("state.paused") && js.includes('event.key === "p"')],
  ["event banners", js.includes("showBanner") && js.includes("HIT AS THROWN") && js.includes("INCOMPLETE") && js.includes("TACKLE")],
  ["snapshot playback observability", js.includes("banner: state.banner") && js.includes("paused: state.paused")],
  ["replay frame recording", js.includes("recordReplayFrame") && js.includes("drawReplayFrame") && js.includes("replayFrames")],
  ["replay controls", js.includes("startReplay") && js.includes('event.key === "l"') && js.includes("replaying: state.replaying")],
  ["replay frame stepping", js.includes("showReplayFrame") && js.includes("updateReplayControls") && js.includes("replayIndex: state.replayIndex")],
  ["replay event markers", js.includes("replayMarkers") && js.includes("renderReplayMarkers") && js.includes("marker.frame")],
  ["replay marker snapshot", js.includes("replayMarkers: state.replayMarkers.map")],
  ["replay scrubber styling", css.includes("#replayScrubber") && css.includes("#frameBackButton")],
  ["replay marker styling", css.includes(".marker-strip") && css.includes('button[data-kind="bad"]')],
  ["responsive CSS", css.includes("@media")],
  ["debug snapshot", js.includes("window.__playbookLab")],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "ok" : "ng"} ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) process.exit(1);
