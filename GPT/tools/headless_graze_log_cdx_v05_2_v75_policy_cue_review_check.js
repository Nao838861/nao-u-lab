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
const policies = ["route", "aggressive", "marksman", "survival"];
const cueTypes = ["chasePopup", "activeDef", "bossCue", "bomb"];
const ranges = {
  chasePopup: [-8, 28],
  activeDef: [0, 20],
  bossCue: [0, 60],
  bomb: [0, 12],
};
const outDir = path.join(root, ".tmp", "graze_log_cdx_v75_policy_cue_review");
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

function runPolicy(policy) {
  const api = makeVm(policy);
  runToFrame(api, 6500);
  return {
    policy,
    summary: api.summarizeEvalTelemetry(),
    events: api.exportEvalLedger().events,
  };
}

function snapshotAt(policy, frame) {
  const api = makeVm(policy, "&probeReview=1");
  runToFrame(api, Math.max(0, frame));
  const probe = api.makeProbeSnapshot();
  return {
    frame,
    policy,
    mode: api.state.mode,
    phaseIntent: api.state.phaseIntent,
    bombFlash: api.state.bombFlash,
    activeDefT: api.state.activeDefT,
    activeDefCount: api.state.activeDefCount,
    bombCount: api.state.bombCount,
    bossFinalCue: !!api.state.stageFlags.bossFinalCue,
    bossCueAge: api.state.bossCueT > -1 ? api.state.t - api.state.bossCueT : null,
    bossCueGapX: api.state.bossCueGapX,
    popups: api.state.popups.map((p) => ({
      text: p.text,
      x: Number(p.x.toFixed(1)),
      y: Number(p.y.toFixed(1)),
      life: p.life,
      kind: p.kind || "cue",
    })),
    probe,
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
      current.popups.some((p) => /CORE OPEN|GAP/.test(p.text)) &&
      current.bossCueAge !== null &&
      current.bossCueAge >= 0 &&
      current.bossCueAge <= 100,
  };
  return { before, current, after, stable: !!checks[type] };
}

function findStableCandidate(policy, events, type) {
  for (const event of events.filter((e) => e.type === type)) {
    for (let frame = Math.max(0, event.t + ranges[type][0]); frame <= event.t + ranges[type][1]; frame++) {
      const candidate = stableAt(policy, frame, type);
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

const runs = policies.map(runPolicy);
const matrix = runs.map((run) => ({
  policy: run.policy,
  result: run.summary.result,
  routeCoveragePct: run.summary.routeCoveragePct,
  score: run.summary.score,
  bombCount: run.summary.bombCount,
  activeDefCount: run.summary.activeDefCount,
  bossCue: run.summary.eventTypes.bossCue || 0,
  candidates: Object.fromEntries(
    cueTypes.map((type) => {
      const row = findStableCandidate(run.policy, run.events, type);
      return [
        type,
        {
          found: row.stableFrame !== null,
          eventFrame: row.eventFrame,
          stableFrame: row.stableFrame,
          phaseIntent: row.candidate?.current.phaseIntent || null,
          activeDefT: row.candidate?.current.activeDefT || 0,
          bombFlash: row.candidate?.current.bombFlash || 0,
          bossCueAge: row.candidate?.current.bossCueAge || null,
          popupTexts: row.candidate?.current.popups.map((p) => p.text) || [],
        },
      ];
    })
  ),
}));

const browserSamples = [];
for (const [policy, type] of [
  ["route", "activeDef"],
  ["route", "bomb"],
  ["aggressive", "bossCue"],
  ["marksman", "chasePopup"],
]) {
  const candidate = matrix.find((row) => row.policy === policy).candidates[type];
  if (!candidate.found) continue;
  const url = `${fileUrl(htmlPath)}?seed=${seed}&bot=1&botStyle=${policy}&probeFrame=${candidate.stableFrame}&probeDraw=1`;
  const dom = dumpDom(url);
  const screenshotPath = path.join(outDir, `v75_${policy}_${type}_frame_${candidate.stableFrame}.png`);
  const screenshotBytes = screenshot(url, screenshotPath);
  browserSamples.push({
    policy,
    type,
    stableFrame: candidate.stableFrame,
    screenshotPath,
    screenshotBytes,
    bodyGameVersion: /<body[^>]*data-game-version="v05_1_cdx_v75"/.test(dom),
    canvasVersion: /<canvas[^>]*data-game-version="v05_1_cdx_v75"/.test(dom),
    canvasLabel: /aria-label="graze_log v05\.2_cdx_v75 playfield"/.test(dom),
  });
}

const route = matrix.find((row) => row.policy === "route");
const aggressive = matrix.find((row) => row.policy === "aggressive");
const marksman = matrix.find((row) => row.policy === "marksman");
const survival = matrix.find((row) => row.policy === "survival");

const assertions = {
  routeAllCueFamiliesFound: cueTypes.every((type) => route.candidates[type].found),
  skilledPoliciesHaveBossCue:
    aggressive.candidates.bossCue.found && marksman.candidates.bossCue.found,
  survivalCueAbsenceRecorded:
    survival.result !== "clear" &&
    survival.candidates.bossCue.found === false &&
    survival.candidates.bomb.found === true,
  skilledPoliciesHaveBomb: aggressive.candidates.bomb.found && marksman.candidates.bomb.found && survival.candidates.bomb.found,
  activeDefPolicyDifferencesVisible:
    new Set(matrix.map((row) => row.activeDefCount)).size >= 2 &&
    matrix.filter((row) => row.candidates.activeDef.found).length >= 2,
  cueFrameSurfaceDiffers:
    new Set(matrix.map((row) => row.candidates.bossCue.stableFrame).filter((v) => v !== null)).size >= 2 ||
    new Set(matrix.map((row) => row.candidates.bomb.stableFrame).filter((v) => v !== null)).size >= 2,
  routeStillClear:
    route.result === "clear" && route.routeCoveragePct === 1 && route.bombCount >= 1 && route.activeDefCount >= 1,
  browserSamplesPass:
    browserSamples.length === 4 &&
    browserSamples.every(
      (sample) =>
        sample.screenshotBytes > 12000 &&
        sample.bodyGameVersion &&
        sample.canvasVersion &&
        sample.canvasLabel
    ),
};

const report = {
  methodVersion: "graze-policy-cue-review-v001",
  game: "graze_log_cdx",
  version,
  source: path.relative(root, htmlPath),
  purpose:
    "Headless review aid: compare stable cue-family evidence frames across bot policies, without using the score as a fun verdict.",
  fixedInputs: { seed, policies, cueTypes, ranges, maxFrames: 6500 },
  matrix,
  browserSamples,
  assertions,
  pass: Object.values(assertions).every(Boolean),
};

const rawDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(rawDir, { recursive: true });
fs.appendFileSync(
  path.join(rawDir, "graze_log_cdx_policy_cue_review.jsonl"),
  JSON.stringify({
    recordedAt: new Date().toISOString(),
    game: report.game,
    version: report.version,
    methodVersion: report.methodVersion,
    fixedInputs: report.fixedInputs,
    matrix: report.matrix,
    assertions: report.assertions,
  }) + "\n",
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
