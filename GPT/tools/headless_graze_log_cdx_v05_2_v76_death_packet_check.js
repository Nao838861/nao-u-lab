const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v76";
const gameDir = path.join(root, "game", "graze_log_cdx", version);
const htmlPath = path.join(gameDir, "index.html");
const packetPath = path.join(gameDir, "review_packet.html");
const html = fs.readFileSync(htmlPath, "utf8");
const packetHtml = fs.readFileSync(packetPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");
const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,exportEvalLedger,summarizeEvalTelemetry};"
);

const seed = 12345;
const policies = ["route", "camper", "panic", "novice"];
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

function makeVm(policy) {
  const context = vm.createContext({
    console,
    Math,
    URLSearchParams,
    location: { search: `?seed=${seed}&bot=1&botStyle=${policy}` },
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
  return api;
}

function runPolicy(policy) {
  const api = makeVm(policy);
  while (api.state.t < 6500 && api.state.mode === "play") api.update();
  const summary = api.summarizeEvalTelemetry();
  const events = api.exportEvalLedger().events;
  return {
    policy,
    result: summary.result,
    durationFrames: summary.durationFrames,
    durationSec: summary.durationSec,
    routeCoveragePct: summary.routeCoveragePct,
    score: summary.score,
    killCount: summary.killCount,
    bottomCampPct: summary.bottomCampPct,
    activeDefCount: summary.activeDefCount,
    bombCount: summary.bombCount,
    deathContext: summary.deathContext,
    eventTypes: summary.eventTypes,
    lastEvents: events.slice(-8),
  };
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

const runs = Object.fromEntries(policies.map((policy) => [policy, runPolicy(policy)]));
const expectedSamples = [
  ["route", "clear"],
  ["camper", "gameOver"],
  ["panic", "gameOver"],
  ["novice", "gameOver"],
];
const packetSamples = expectedSamples.map(([policy, state]) => {
  const run = runs[policy];
  const frame = runs[policy].durationFrames;
  const urlNeedle = state === "gameOver"
    ? `botStyle=${policy}&amp;probeFrame=${frame}&amp;probeDraw=1&amp;probeReview=1&amp;probeForceIframe=0`
    : `botStyle=${policy}&amp;probeFrame=${frame}`;
  const sourceType = run.deathContext?.hitBullet?.sourceType || "none";
  const phase = run.deathContext?.phase || run.lastEvents.at(-1)?.phase || "";
  return {
    policy,
    state,
    frame,
    sourceType,
    phase,
    included: packetHtml.includes(urlNeedle) && packetHtml.includes(`data-policy="${policy}"`) && packetHtml.includes(sourceType),
  };
});

const packetUrl = fileUrl(packetPath);
const dom = dumpDom(packetUrl);
const outDir = path.join(root, ".tmp", "graze_log_cdx_v76_death_packet");
fs.mkdirSync(outDir, { recursive: true });
const screenshotBytes = screenshot(packetUrl, path.join(outDir, "v76_death_review_packet.png"));

const assertions = {
  routeClearsWithoutForcedIframe:
    runs.route.result === "clear" &&
    runs.route.routeCoveragePct === 1 &&
    runs.route.durationFrames > 4300,
  camperFailsAsBadPolicy:
    runs.camper.result === "over" &&
    runs.camper.routeCoveragePct < 0.5 &&
    runs.camper.bottomCampPct > 0.95 &&
    runs.camper.score < runs.route.score * 0.1,
  panicFailsBeforeMidboss:
    runs.panic.result === "over" &&
    runs.panic.routeCoveragePct < 0.5 &&
    runs.panic.bottomCampPct > 0.9,
  noviceFailsDespiteLateCoverage:
    runs.novice.result === "over" &&
    runs.novice.routeCoveragePct > 0.9 &&
    runs.novice.routeCoveragePct < 1 &&
    runs.novice.score < runs.route.score * 0.25,
  deathContextPresent:
    ["camper", "panic", "novice"].every((policy) =>
      runs[policy].deathContext &&
      runs[policy].deathContext.hitBullet &&
      runs[policy].deathContext.density.enemyBullets > 0 &&
      runs[policy].deathContext.nearestBullets.length > 0 &&
      runs[policy].lastEvents.some((event) => event.type === "gameOver" && event.deathContext)
    ),
  packetIncludesComputedFrames: packetSamples.every((sample) => sample.included),
  packetDomContract:
    /data-game-version="v05_1_cdx_v76"/.test(dom) &&
    /data-review-packet="bad-policy-death-cause-v001"/.test(dom) &&
    (dom.match(/data-sample="/g) || []).length === expectedSamples.length,
  packetScreenshotContract: screenshotBytes > 50000,
};

const report = {
  methodVersion: "graze-bad-policy-death-cause-packet-v001",
  game: "graze_log_cdx",
  version,
  source: path.relative(root, packetPath),
  fixedInputs: { seed, policies, expectedSamples, forcedIframeForBadPolicies: false },
  runs,
  packetSamples,
  assertions,
  screenshotBytes,
  pass: Object.values(assertions).every(Boolean),
};

const rawDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(rawDir, { recursive: true });
fs.appendFileSync(
  path.join(rawDir, "graze_log_cdx_bad_policy_death_packet_review.jsonl"),
  JSON.stringify({
    recordedAt: new Date().toISOString(),
    game: report.game,
    version: report.version,
    methodVersion: report.methodVersion,
    fixedInputs: report.fixedInputs,
    runs: report.runs,
    packetSamples: report.packetSamples,
    assertions: report.assertions,
  }) + "\n",
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
