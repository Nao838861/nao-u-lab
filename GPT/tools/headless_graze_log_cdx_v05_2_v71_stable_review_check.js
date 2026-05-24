const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const version = "v05_1_cdx_v71";
const htmlPath = path.join(root, "game", "graze_log_cdx", version, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");
const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,makeProbeSnapshot,makeReviewPacket,exportEvalLedger};"
);

const outDir = path.join(root, ".tmp", "graze_log_cdx_v71_stable_review");
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

function makeVm(search) {
  const context = vm.createContext({
    console,
    Math,
    URLSearchParams,
    location: { search },
    document: {
      body: { classList: { add() {} }, dataset: {} },
      getElementById(id) {
        return id === "c"
          ? { getContext: () => makeCtx(), setAttribute() {} }
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

function packetAt(frame) {
  const api = makeVm("?seed=12345&bot=1&botStyle=route&probeReview=1");
  runToFrame(api, Math.max(0, frame - 2));
  const before = api.makeProbeSnapshot();
  runToFrame(api, frame);
  const current = api.makeProbeSnapshot();
  runToFrame(api, frame + 2);
  const after = api.makeProbeSnapshot();
  return { frame, packet: api.makeReviewPacket(current, before, after), current };
}

function findStableFrames() {
  const api = makeVm("?seed=12345&bot=1&botStyle=route");
  runToFrame(api, 6500);
  const events = api.exportEvalLedger().events.filter((e) => e.type === "chasePopup").slice(0, 6);
  const results = [];
  for (const event of events) {
    let chosen = null;
    const start = Math.max(0, event.t - 8);
    const end = event.t + 28;
    for (let frame = start; frame <= end; frame++) {
      const candidate = packetAt(frame);
      if (candidate.packet.stable) {
        chosen = candidate;
        break;
      }
    }
    results.push({
      eventFrame: event.t,
      stableFrame: chosen ? chosen.frame : null,
      packet: chosen ? chosen.packet : null,
      current: chosen
        ? {
            frame: chosen.current.frame,
            readable: chosen.current.readableChasePopupFrame,
            chasePopupActiveCount: chosen.current.chasePopupActiveCount,
            phaseIntent: chosen.current.phaseIntent,
          }
        : null,
    });
  }
  return results;
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

const stableFrames = findStableFrames();
const selected = stableFrames.find((x) => x.stableFrame !== null);
if (!selected) {
  console.log(JSON.stringify({ version, stableFrames }, null, 2));
  throw new Error("no stable CHASE review frame found");
}

const stableUrl = `${fileUrl(htmlPath)}?seed=12345&bot=1&botStyle=route&probeFrame=${selected.stableFrame}&probeDraw=1&probeReview=1`;
const dom = dumpDom(stableUrl);
const screenshotPath = path.join(outDir, `v71_stable_review_frame_${selected.stableFrame}.png`);
const screenshotBytes = screenshot(stableUrl, screenshotPath);

const domContract = {
  bodyGameVersion: /<body[^>]*data-game-version="v05_1_cdx_v71"/.test(dom),
  reviewStableDataset: /<div[^>]*id="reviewinfo"[^>]*data-review-stable="true"/.test(dom),
  stableText: /<span>stable<\/span><span>yes<\/span>/.test(dom),
  stableReason: /<span>reason<\/span><span>stable readable CHASE popup<\/span>/.test(dom),
  verdictPass: /<span>verdict<\/span><span>pass<\/span>/.test(dom),
  windowTriplet: /<span>window<\/span><span>\d+\/\d+\/\d+<\/span>/.test(dom),
};

const report = {
  version,
  chrome,
  stableFrames,
  selected,
  screenshotPath,
  screenshotBytes,
  domContract,
  pass:
    stableFrames.filter((x) => x.stableFrame !== null).length >= 2 &&
    Object.values(domContract).every(Boolean) &&
    screenshotBytes > 15000,
};

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exit(1);
