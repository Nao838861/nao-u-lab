const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v74";
const gameDir = path.join(root, "game", "graze_log_cdx", version);
const htmlPath = path.join(gameDir, "index.html");
const packetPath = path.join(gameDir, "review_packet.html");
const html = fs.readFileSync(htmlPath, "utf8");
const packetHtml = fs.readFileSync(packetPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");
const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,makeProbeSnapshot,exportEvalLedger,summarizeEvalTelemetry};"
);

const seed = 12345;
const policies = ["route", "aggressive", "marksman", "survival"];
const cueTypes = ["chasePopup", "activeDef", "bossCue", "bomb"];
const ranges = { chasePopup: [-8, 28], activeDef: [0, 20], bossCue: [0, 60], bomb: [0, 12] };

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

function makeVm(policy, extra = "") {
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

function snapshotAt(policy, frame) {
  const api = makeVm(policy, "&probeReview=1");
  runToFrame(api, Math.max(0, frame));
  return {
    frame,
    mode: api.state.mode,
    bombFlash: api.state.bombFlash,
    activeDefT: api.state.activeDefT,
    bossFinalCue: !!api.state.stageFlags.bossFinalCue,
    bossCueAge: api.state.bossCueT > -1 ? api.state.t - api.state.bossCueT : null,
    popups: api.state.popups.map((p) => p.text),
    probe: api.makeProbeSnapshot(),
  };
}

function stableAt(policy, frame, type) {
  const before = snapshotAt(policy, Math.max(0, frame - 2));
  const current = snapshotAt(policy, frame);
  const after = snapshotAt(policy, frame + 2);
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
      current.popups.some((text) => /CORE OPEN|GAP/.test(text)) &&
      current.bossCueAge !== null &&
      current.bossCueAge >= 0 &&
      current.bossCueAge <= 100,
  };
  return !!checks[type];
}

function runPolicy(policy) {
  const api = makeVm(policy);
  runToFrame(api, 6500);
  return { policy, summary: api.summarizeEvalTelemetry(), events: api.exportEvalLedger().events };
}

function findStableCandidate(policy, events, type) {
  for (const event of events.filter((e) => e.type === type)) {
    for (let frame = Math.max(0, event.t + ranges[type][0]); frame <= event.t + ranges[type][1]; frame++) {
      if (stableAt(policy, frame, type)) return { type, eventFrame: event.t, stableFrame: frame };
    }
  }
  return { type, eventFrame: null, stableFrame: null };
}

function dumpDom(url) {
  const result = spawnSync(chrome, ["--headless=new", "--disable-gpu", "--dump-dom", url], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Chrome DOM dump failed: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function screenshot(url, outPath) {
  const result = spawnSync(
    chrome,
    ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1280,960", `--screenshot=${outPath}`, url],
    { encoding: "utf8" }
  );
  if (result.status !== 0) throw new Error(`Chrome screenshot failed: ${result.stderr || result.stdout}`);
  return fs.statSync(outPath).size;
}

const runs = policies.map(runPolicy);
const matrix = Object.fromEntries(
  runs.map((run) => [
    run.policy,
    {
      result: run.summary.result,
      routeCoveragePct: run.summary.routeCoveragePct,
      candidates: Object.fromEntries(cueTypes.map((type) => [type, findStableCandidate(run.policy, run.events, type)])),
    },
  ])
);

const expectedSamples = [
  ["route", "activeDef"],
  ["route", "bomb"],
  ["aggressive", "bossCue"],
  ["marksman", "chasePopup"],
  ["survival", "activeDef"],
  ["survival", "bomb"],
];
const packetSamples = expectedSamples.map(([policy, type]) => {
  const stableFrame = matrix[policy].candidates[type].stableFrame;
  const urlNeedle = `botStyle=${policy}&amp;probeFrame=${stableFrame}`;
  return { policy, type, stableFrame, included: packetHtml.includes(urlNeedle) };
});

const packetUrl = fileUrl(packetPath);
const dom = dumpDom(packetUrl);
const outDir = path.join(root, ".tmp", "graze_log_cdx_v74_human_packet");
fs.mkdirSync(outDir, { recursive: true });
const screenshotBytes = screenshot(packetUrl, path.join(outDir, "v74_human_review_packet.png"));

const assertions = {
  routeStillClear: matrix.route.result === "clear" && matrix.route.routeCoveragePct === 1,
  routeAllCueFamiliesFound: cueTypes.every((type) => matrix.route.candidates[type].stableFrame !== null),
  skilledBossCueFramesFound:
    matrix.aggressive.candidates.bossCue.stableFrame !== null &&
    matrix.marksman.candidates.bossCue.stableFrame !== null,
  survivalAbsenceStillVisible:
    matrix.survival.result !== "clear" &&
    matrix.survival.candidates.bossCue.stableFrame === null &&
    matrix.survival.candidates.activeDef.stableFrame !== null &&
    matrix.survival.candidates.bomb.stableFrame !== null,
  packetIncludesComputedFrames: packetSamples.every((sample) => sample.included),
  packetDomContract:
    /data-game-version="v05_1_cdx_v74"/.test(dom) &&
    /data-review-packet="policy-cue-human-v001"/.test(dom) &&
    (dom.match(/data-sample="/g) || []).length === expectedSamples.length,
  packetScreenshotContract: screenshotBytes > 50000,
};

const report = {
  methodVersion: "graze-human-review-packet-v001",
  game: "graze_log_cdx",
  version,
  source: path.relative(root, packetPath),
  fixedInputs: { seed, policies, cueTypes, expectedSamples },
  packetSamples,
  assertions,
  screenshotBytes,
  pass: Object.values(assertions).every(Boolean),
};

const rawDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(rawDir, { recursive: true });
fs.appendFileSync(
  path.join(rawDir, "graze_log_cdx_human_packet_review.jsonl"),
  JSON.stringify({
    recordedAt: new Date().toISOString(),
    game: report.game,
    version: report.version,
    methodVersion: report.methodVersion,
    packetSamples: report.packetSamples,
    assertions: report.assertions,
  }) + "\n",
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
