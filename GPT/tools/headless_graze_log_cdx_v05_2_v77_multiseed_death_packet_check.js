const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v77";
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

const seeds = [12345, 54321, 77777];
const policies = ["route", "camper", "panic", "novice"];
const focusSamples = [
  { seed: 12345, policy: "route", expected: "clear" },
  { seed: 12345, policy: "camper", expected: "over" },
  { seed: 54321, policy: "panic", expected: "over" },
  { seed: 77777, policy: "novice", expected: "over" },
];
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

function makeVm(seed, policy) {
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

function runPolicy(seed, policy) {
  const api = makeVm(seed, policy);
  while (api.state.t < 6500 && api.state.mode === "play") api.update();
  const summary = api.summarizeEvalTelemetry();
  const events = api.exportEvalLedger().events;
  return {
    seed,
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

const runs = [];
for (const seed of seeds) {
  for (const policy of policies) runs.push(runPolicy(seed, policy));
}
const byKey = Object.fromEntries(runs.map((run) => [`${run.seed}:${run.policy}`, run]));
const routeRuns = seeds.map((seed) => byKey[`${seed}:route`]);
const badRuns = runs.filter((run) => run.policy !== "route");
const focusRuns = focusSamples.map((sample) => byKey[`${sample.seed}:${sample.policy}`]);
const packetSamples = focusSamples.map((sample) => {
  const run = byKey[`${sample.seed}:${sample.policy}`];
  const frame = run.durationFrames;
  const sourceRole = run.deathContext?.hitBullet?.sourceRole || "none";
  const urlNeedle = sample.expected === "over"
    ? `seed=${sample.seed}&amp;bot=1&amp;botStyle=${sample.policy}&amp;probeFrame=${frame}&amp;probeDraw=1&amp;probeReview=1&amp;probeForceIframe=0`
    : `seed=${sample.seed}&amp;bot=1&amp;botStyle=${sample.policy}&amp;probeFrame=${frame}`;
  return {
    ...sample,
    frame,
    sourceRole,
    included:
      packetHtml.includes(urlNeedle) &&
      packetHtml.includes(`data-seed="${sample.seed}"`) &&
      packetHtml.includes(`data-policy="${sample.policy}"`) &&
      packetHtml.includes(sourceRole),
  };
});

const packetUrl = fileUrl(packetPath);
const dom = dumpDom(packetUrl);
const outDir = path.join(root, ".tmp", "graze_log_cdx_v77_multiseed_death_packet");
fs.mkdirSync(outDir, { recursive: true });
const screenshotBytes = screenshot(packetUrl, path.join(outDir, "v77_multiseed_death_review_packet.png"));

const assertions = {
  routeClearsEverySeed:
    routeRuns.every((run) => run.result === "clear" && run.routeCoveragePct === 1 && run.durationFrames > 4300),
  camperFailsEverySeed:
    seeds.every((seed) => {
      const run = byKey[`${seed}:camper`];
      return run.result === "over" && run.routeCoveragePct < 0.5 && run.bottomCampPct > 0.95;
    }),
  panicFailsEverySeed:
    seeds.every((seed) => {
      const run = byKey[`${seed}:panic`];
      return run.result === "over" && run.routeCoveragePct < 0.5 && run.bottomCampPct > 0.9;
    }),
  noviceFailsEverySeed:
    seeds.every((seed) => {
      const run = byKey[`${seed}:novice`];
      return run.result === "over" && run.routeCoveragePct > 0.9 && run.routeCoveragePct < 1;
    }),
  deathContextPresentForBadPolicies:
    badRuns.every((run) =>
      run.deathContext &&
      run.deathContext.hitBullet &&
      run.deathContext.density.enemyBullets > 0 &&
      run.deathContext.nearestBullets.length > 0 &&
      run.lastEvents.some((event) => event.type === "gameOver" && event.deathContext)
    ),
  packetIncludesComputedFrames: packetSamples.every((sample) => sample.included),
  packetDomContract:
    /data-game-version="v05_1_cdx_v77"/.test(dom) &&
    /data-review-packet="bad-policy-multiseed-death-cause-v001"/.test(dom) &&
    (dom.match(/data-sample="/g) || []).length === focusSamples.length &&
    (dom.match(/data-seed="/g) || []).length >= focusSamples.length,
  packetScreenshotContract: screenshotBytes > 50000,
};

const report = {
  methodVersion: "graze-bad-policy-multiseed-death-cause-packet-v001",
  game: "graze_log_cdx",
  version,
  source: path.relative(root, packetPath),
  fixedInputs: { seeds, policies, focusSamples, forcedIframeForBadPolicies: false },
  runs,
  packetSamples,
  assertions,
  screenshotBytes,
  pass: Object.values(assertions).every(Boolean),
};

const rawDir = path.join(root, "memory", "raw", "headless_eval");
fs.mkdirSync(rawDir, { recursive: true });
fs.appendFileSync(
  path.join(rawDir, "graze_log_cdx_bad_policy_multiseed_death_packet_review.jsonl"),
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
