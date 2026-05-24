const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v75";
const htmlPath = path.join(root, "game", "graze_log_cdx", version, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");
const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,makeProbeSnapshot,makeReviewPacket,exportEvalLedger,summarizeEvalTelemetry};"
);

const seed = 12345;
const policy = "route";
const outDir = path.join(root, ".tmp", "graze_log_cdx_v75_cue_review");
fs.mkdirSync(outDir, { recursive: true });

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (!chrome) throw new Error("Chrome or Edge executable not found");

function fileUrl(p) {
  return `file:///${p.replace(/\\/g, "/").replace(/ /g, "%20")}`;
}

function makeCtx() {
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

function makeVm(extra = "") {
  const context = vm.createContext({
    console,
    Math,
    URLSearchParams,
    location: { search: `?seed=${seed}&bot=1&botStyle=${policy}${extra}` },
    document: {
      body: { classList: { add() {} }, dataset: {} },
      title: "",
      getElementById(id) {
        return id === "c"
          ? { getContext: () => makeCtx(), setAttribute() {}, getAttribute() { return ""; } }
          : { textContent: "", dataset: {}, setAttribute() {}, getAttribute() { return ""; } };
      },
    },
    window: { addEventListener() {} },
    requestAnimationFrame() {},
  });
  context.globalThis = context;
  vm.runInContext(source, context, { filename: htmlPath });
  const api = context.window.__check;
  api.startGame();
  api.state.player.iframe = 999999;
  return api;
}

function runToFrame(api, frame) {
  while (api.state.t < frame && api.state.mode === "play") api.update();
}

function snapshotAt(frame) {
  const api = makeVm("&probeReview=1");
  runToFrame(api, Math.max(0, frame));
  const probe = api.makeProbeSnapshot();
  const popups = api.state.popups.map((p) => ({
    text: p.text,
    x: Number(p.x.toFixed(1)),
    y: Number(p.y.toFixed(1)),
    life: p.life,
    kind: p.kind || "cue",
  }));
  return {
    frame,
    mode: api.state.mode,
    phaseIntent: api.state.phaseIntent,
    bombFlash: api.state.bombFlash,
    activeDefT: api.state.activeDefT,
    activeDefCount: api.state.activeDefCount,
    bombCount: api.state.bombCount,
    bossFinalCue: !!api.state.stageFlags.bossFinalCue,
    bossCueAge: api.state.bossCueT > -1 ? api.state.t - api.state.bossCueT : null,
    bossCueGapX: api.state.bossCueGapX,
    enemyBulletCount: api.state.ebullets.length,
    popups,
    chaseReview: api.makeReviewPacket(probe, probe, probe),
    probe,
  };
}

function stableAt(frame, type) {
  const before = snapshotAt(Math.max(0, frame - 2));
  const current = snapshotAt(frame);
  const after = snapshotAt(frame + 2);
  const checks = {
    chasePopup:
      before.probe.readableChasePopupFrame &&
      current.probe.readableChasePopupFrame &&
      after.probe.readableChasePopupFrame,
    activeDef: before.activeDefT > 0 && current.activeDefT > 0 && after.activeDefT > 0,
    bomb: before.bombFlash > 0 && current.bombFlash > 0 && after.bombFlash > 0,
    bossCue:
      before.bossFinalCue &&
      current.bossFinalCue &&
      after.bossFinalCue &&
      current.popups.some((p) => /CORE OPEN|GAP/.test(p.text)) &&
      current.bossCueAge !== null &&
      current.bossCueAge >= 0 &&
      current.bossCueAge <= 100,
  };
  return { before, current, after, stable: !!checks[type] };
}

function findStableCandidate(events, type, range) {
  for (const event of events.filter((e) => e.type === type)) {
    for (let frame = Math.max(0, event.t + range[0]); frame <= event.t + range[1]; frame++) {
      const candidate = stableAt(frame, type);
      if (candidate.stable) return { type, eventFrame: event.t, stableFrame: frame, candidate };
    }
  }
  return { type, eventFrame: null, stableFrame: null, candidate: null };
}

function dumpDom(url) {
  const result = spawnSync(chrome, ["--headless=new", "--disable-gpu", "--dump-dom", url], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Chrome DOM dump failed: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function screenshot(url, outPath) {
  const result = spawnSync(
    chrome,
    ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=420,780", `--screenshot=${outPath}`, url],
    { encoding: "utf8" }
  );
  if (result.status !== 0) throw new Error(`Chrome screenshot failed: ${result.stderr || result.stdout}`);
  return fs.statSync(outPath).size;
}

const api = makeVm();
runToFrame(api, 6500);
const ledger = api.exportEvalLedger();
const ranges = {
  chasePopup: [-8, 28],
  activeDef: [0, 20],
  bossCue: [0, 60],
  bomb: [0, 12],
};
const cueTypes = ["chasePopup", "activeDef", "bossCue", "bomb"];
const candidates = cueTypes.map((type) => findStableCandidate(ledger.events, type, ranges[type]));

const browserContracts = candidates
  .filter((row) => row.stableFrame !== null)
  .map((row) => {
    const url = `${fileUrl(htmlPath)}?seed=${seed}&bot=1&botStyle=${policy}&probeFrame=${row.stableFrame}&probeDraw=1`;
    const dom = dumpDom(url);
    const screenshotPath = path.join(outDir, `v75_${row.type}_review_frame_${row.stableFrame}.png`);
    const screenshotBytes = screenshot(url, screenshotPath);
    return {
      type: row.type,
      stableFrame: row.stableFrame,
      screenshotPath,
      screenshotBytes,
      bodyGameVersion: /<body[^>]*data-game-version="v05_1_cdx_v75"/.test(dom),
      canvasVersion: /<canvas[^>]*data-game-version="v05_1_cdx_v75"/.test(dom),
      canvasLabel: /aria-label="graze_log v05\.2_cdx_v75 playfield"/.test(dom),
    };
  });

const summary = api.summarizeEvalTelemetry();
const assertions = {
  allCueFamiliesFound: candidates.every((row) => row.stableFrame !== null),
  stableWindowsFound: candidates.every((row) => row.candidate && row.candidate.stable),
  routeStillClears: summary.result === "clear" && summary.routeCoveragePct === 1,
  routeUsesBombAndActiveDef: summary.bombCount >= 1 && summary.activeDefCount >= 1,
  bossCueStillRecorded: summary.eventTypes.bossCue === 1 && summary.eventTypes.bossCueVolley === 1,
  browserContractsPass:
    browserContracts.length === cueTypes.length &&
    browserContracts.every(
      (contract) =>
        contract.screenshotBytes > 12000 &&
        contract.bodyGameVersion &&
        contract.canvasVersion &&
        contract.canvasLabel
    ),
};

const report = {
  methodVersion: "graze-cue-family-review-v001",
  game: "graze_log_cdx",
  version,
  source: path.relative(root, htmlPath),
  purpose:
    "Headless review aid: select stable evidence frames for different cue families before asking a human to judge screenshots.",
  fixedInputs: { seed, policy, maxFrames: 6500, ranges },
  candidates: candidates.map((row) => ({
    type: row.type,
    eventFrame: row.eventFrame,
    stableFrame: row.stableFrame,
    phaseIntent: row.candidate?.current.phaseIntent || null,
    popups: row.candidate?.current.popups || [],
    activeDefT: row.candidate?.current.activeDefT || 0,
    bombFlash: row.candidate?.current.bombFlash || 0,
    bossCueAge: row.candidate?.current.bossCueAge || null,
    enemyBulletCount: row.candidate?.current.enemyBulletCount || 0,
  })),
  browserContracts,
  assertions,
  pass: Object.values(assertions).every(Boolean),
};

const rawDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(rawDir, { recursive: true });
fs.appendFileSync(
  path.join(rawDir, "graze_log_cdx_cue_review.jsonl"),
  JSON.stringify({
    recordedAt: new Date().toISOString(),
    game: report.game,
    version: report.version,
    methodVersion: report.methodVersion,
    fixedInputs: report.fixedInputs,
    candidates: report.candidates,
    assertions: report.assertions,
  }) + "\n",
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
