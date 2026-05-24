const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v73";
const htmlPath = path.join(root, "game", "graze_log_cdx", version, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");
const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,makeProbeSnapshot,makeReviewPacket,exportEvalLedger};"
);

const outDir = path.join(root, ".tmp", "graze_log_cdx_v73_policy_review");
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

const seed = 12345;
const policies = ["route", "aggressive", "marksman", "camper"];

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

function packetAt(policy, frame) {
  const api = makeVm(policy, "&probeReview=1");
  runToFrame(api, Math.max(0, frame - 2));
  const before = api.makeProbeSnapshot();
  runToFrame(api, frame);
  const current = api.makeProbeSnapshot();
  runToFrame(api, frame + 2);
  const after = api.makeProbeSnapshot();
  return { frame, packet: api.makeReviewPacket(current, before, after), current };
}

function stableFramesFor(policy) {
  const api = makeVm(policy);
  runToFrame(api, 6500);
  const events = api.exportEvalLedger().events.filter((e) => e.type === "chasePopup").slice(0, 8);
  const stable = [];
  for (const event of events) {
    for (let frame = Math.max(0, event.t - 8); frame <= event.t + 28; frame++) {
      const candidate = packetAt(policy, frame);
      if (candidate.packet.stable) {
        stable.push({
          eventFrame: event.t,
          stableFrame: candidate.frame,
          side: candidate.packet.side,
          distance: candidate.packet.playerDist,
          phaseIntent: candidate.current.phaseIntent,
          packet: candidate.packet,
        });
        break;
      }
    }
  }
  return { policy, events: events.length, stable };
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

function domContractFor(policy, stableFrame) {
  const url = `${fileUrl(htmlPath)}?seed=${seed}&bot=1&botStyle=${policy}&probeFrame=${stableFrame}&probeDraw=1&probeReview=1`;
  const dom = dumpDom(url);
  const screenshotPath = path.join(outDir, `v73_${policy}_stable_review_frame_${stableFrame}.png`);
  const screenshotBytes = screenshot(url, screenshotPath);
  return {
    policy,
    stableFrame,
    screenshotPath,
    screenshotBytes,
    bodyGameVersion: /<body[^>]*data-game-version="v05_1_cdx_v73"/.test(dom),
    panelPolicy: new RegExp(`<span>policy<\\/span><span>${policy}<\\/span>`).test(dom),
    reviewStableDataset: /<div[^>]*id="reviewinfo"[^>]*data-review-stable="true"/.test(dom),
    stableText: /<span>stable<\/span><span>yes<\/span>/.test(dom),
    stableReason: /<span>reason<\/span><span>stable readable CHASE popup<\/span>/.test(dom),
    verdictPass: /<span>verdict<\/span><span>pass<\/span>/.test(dom),
  };
}

const byPolicy = policies.map(stableFramesFor);
const contracts = byPolicy
  .filter((row) => row.stable.length > 0)
  .map((row) => domContractFor(row.policy, row.stable[0].stableFrame));

const route = byPolicy.find((row) => row.policy === "route");
const aggressive = byPolicy.find((row) => row.policy === "aggressive");
const marksman = byPolicy.find((row) => row.policy === "marksman");
const camper = byPolicy.find((row) => row.policy === "camper");

const stablePolicyCount = byPolicy.filter((row) => row.stable.length > 0).length;
const routeFrames = new Set(route.stable.map((x) => x.stableFrame));
const nonRouteHasDifferentFrame = byPolicy
  .filter((row) => row.policy !== "route")
  .some((row) => row.stable.some((x) => !routeFrames.has(x.stableFrame)));

const assertions = {
  routeStableReviewPresent: route.stable.length >= 2,
  skilledPoliciesHaveStableReview:
    route.stable.length >= 2 && aggressive.stable.length >= 1 && marksman.stable.length >= 1,
  policySurfaceDiffers: nonRouteHasDifferentFrame,
  camperDoesNotOutnumberRoute: camper.stable.length <= route.stable.length,
  browserContractsPass:
    contracts.length >= 3 &&
    contracts.every(
      (contract) =>
        contract.screenshotBytes > 15000 &&
        contract.bodyGameVersion &&
        contract.panelPolicy &&
        contract.reviewStableDataset &&
        contract.stableText &&
        contract.stableReason &&
        contract.verdictPass
    ),
};

const report = {
  methodVersion: "graze-policy-review-stable-v001",
  game: "graze_log_cdx",
  version,
  source: path.relative(root, htmlPath),
  purpose:
    "Headless review aid: compare stable human-review candidate frames across bot policies before choosing evidence screenshots.",
  fixedInputs: { seed, policies, maxFrames: 6500, eventWindowFrames: [-8, 28] },
  byPolicy,
  contracts,
  assertions,
  pass: Object.values(assertions).every(Boolean),
};

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
