const fs = require("fs");
const path = require("path");
const vm = require("vm");
const zlib = require("zlib");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v69", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error("script block not found");
const source = match[1].replace(
  "loop();",
  "window.__check={state,startGame,update,makeProbeSnapshot,exportEvalLedger};"
);

const outDir = path.join(root, ".tmp", "graze_log_cdx_v69_chase_probe");
fs.mkdirSync(outDir, { recursive: true });

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (!chrome) throw new Error("Chrome or Edge executable not found for real-browser probe screenshots");

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

function runGame(search, frames = 6500) {
  const context = vm.createContext({
    console,
    Math,
    URLSearchParams,
    location: { search },
    document: {
      body: { classList: { add() {} } },
      getElementById(id) {
        return id === "c" ? { getContext: () => makeCtx() } : { textContent: "" };
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
  for (let i = 0; i < frames && api.state.mode === "play"; i++) api.update();
  return api;
}

function probeSnapshot(frame, search = "?seed=12345&bot=1&botStyle=route&probeBare=1") {
  const api = runGame(search, frame);
  return api.makeProbeSnapshot();
}

function readPng(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString("hex", 0, 8) !== "89504e470d0a1a0a") throw new Error(`not a PNG: ${file}`);
  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    pos += 12 + len;
  }
  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error(`unsupported PNG format bitDepth=${bitDepth} colorType=${colorType}`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(width * height * 4);
  let src = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = prev[x] || 0;
      const upLeft = x >= channels ? prev[x - channels] || 0 : 0;
      const val = raw[src++];
      let recon;
      if (filter === 0) recon = val;
      else if (filter === 1) recon = val + left;
      else if (filter === 2) recon = val + up;
      else if (filter === 3) recon = val + Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upLeft);
        recon = val + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
      } else {
        throw new Error(`unsupported PNG filter ${filter}`);
      }
      row[x] = recon & 255;
    }
    for (let x = 0; x < width; x++) {
      const si = x * channels;
      const di = (y * width + x) * 4;
      pixels[di] = row[si];
      pixels[di + 1] = row[si + 1];
      pixels[di + 2] = row[si + 2];
      pixels[di + 3] = channels === 4 ? row[si + 3] : 255;
    }
    prev = row;
  }
  return { width, height, pixels };
}

function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function pixelAt(img, x, y) {
  const i = (Math.floor(y) * img.width + Math.floor(x)) * 4;
  return [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2], img.pixels[i + 3]];
}

function analyzeBox(img, box, minChasePixels = 24) {
  const x0 = Math.max(0, Math.floor(box.x - 3));
  const y0 = Math.max(0, Math.floor(box.y - 3));
  const x1 = Math.min(img.width - 1, Math.ceil(box.x + box.w + 3));
  const y1 = Math.min(img.height - 1, Math.ceil(box.y + box.h + 3));
  let chasePixels = 0;
  let chaseLuma = 0;
  let bgPixels = 0;
  let bgLuma = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = pixelAt(img, x, y);
      const isChase = r >= 20 && g >= 70 && b >= 55 && g - r >= 25 && g - b >= 0;
      if (isChase) {
        chasePixels++;
        chaseLuma += luma(r, g, b);
      } else if (r < 40 && g < 60 && b < 90) {
        bgPixels++;
        bgLuma += luma(r, g, b);
      }
    }
  }
  const meanChaseLuma = chasePixels ? chaseLuma / chasePixels : 0;
  const meanBgLuma = bgPixels ? bgLuma / bgPixels : 0;
  return {
    box,
    chasePixels,
    bgPixels,
    meanChaseLuma: Number(meanChaseLuma.toFixed(1)),
    meanBgLuma: Number(meanBgLuma.toFixed(1)),
    lumaGap: Number((meanChaseLuma - meanBgLuma).toFixed(1)),
    pass: chasePixels >= minChasePixels && bgPixels >= 20 && meanChaseLuma - meanBgLuma >= 40,
  };
}

function detectCanvasRect(img) {
  for (let y = 0; y < img.height; y++) {
    let canvasLike = 0;
    for (let x = 0; x < img.width; x++) {
      const [r, g, b] = pixelAt(img, x, y);
      if (r <= 24 && g >= 12 && g <= 42 && b >= 26 && b <= 62) canvasLike++;
    }
    if (canvasLike >= 360) return { x: 0, y, w: 420, h: 620 };
  }
  return null;
}

function detectReviewPanelRect(img, canvasRect) {
  const startY = canvasRect ? canvasRect.y + canvasRect.h + 1 : 620;
  for (let y = startY; y < img.height; y++) {
    let panelLike = 0;
    for (let x = 0; x < img.width; x++) {
      const [r, g, b] = pixelAt(img, x, y);
      const border = r >= 25 && r <= 55 && g >= 40 && g <= 75 && b >= 70 && b <= 105;
      const bg = r >= 4 && r <= 16 && g >= 14 && g <= 30 && b >= 32 && b <= 55;
      if (border || bg) panelLike++;
    }
    if (panelLike >= 330) return { x: 6, y, w: 408, h: 56 };
  }
  return null;
}

function translateBox(box, dx, dy) {
  return { x: box.x + dx, y: box.y + dy, w: box.w, h: box.h };
}

function dumpDom(url) {
  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--dump-dom",
      url,
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0) throw new Error(`Chrome DOM dump failed: ${result.stderr || result.stdout}`);
  return result.stdout;
}

const routeApi = runGame("?seed=12345&bot=1&botStyle=route");
const probes = routeApi
  .exportEvalLedger()
  .events.filter((e) => e.type === "chasePopup")
  .slice(0, 4)
  .map((e, i) => ({ name: ["early", "mid", "bunker", "late"][i], frame: e.t + 1 }));

const outputs = [];
for (const probe of probes) {
  const snapshot = probeSnapshot(probe.frame);
  const outPath = path.join(outDir, `v69_chase_popup_${probe.name}.png`);
  const url = `${fileUrl(htmlPath)}?seed=12345&bot=1&botStyle=route&probeFrame=${probe.frame}&probeDraw=1&probeBare=1`;
  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=420,620",
      `--screenshot=${outPath}`,
      url,
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0) throw new Error(`Chrome screenshot failed for ${probe.name}: ${result.stderr || result.stdout}`);
  const stat = fs.statSync(outPath);
  const img = readPng(outPath);
  const boxes = snapshot.chasePopups.map((p) => analyzeBox(img, p.box));
  outputs.push({
    ...probe,
    path: outPath,
    bytes: stat.size,
    image: { width: img.width, height: img.height },
    snapshotFrame: snapshot.frame,
    readableChasePopupFrame: snapshot.readableChasePopupFrame,
    visualContract: snapshot.visualContract,
    boxes,
  });
}

const reviewOutputs = [];
for (const probe of probes.slice(0, 2)) {
  const snapshot = probeSnapshot(probe.frame, "?seed=12345&bot=1&botStyle=route&probeReview=1");
  const outPath = path.join(outDir, `v69_review_surface_${probe.name}.png`);
  const url = `${fileUrl(htmlPath)}?seed=12345&bot=1&botStyle=route&probeFrame=${probe.frame}&probeDraw=1&probeReview=1`;
  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=420,780",
      `--screenshot=${outPath}`,
      url,
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0) throw new Error(`Chrome review screenshot failed for ${probe.name}: ${result.stderr || result.stdout}`);
  const stat = fs.statSync(outPath);
  const img = readPng(outPath);
  const canvasRect = detectCanvasRect(img);
  const reviewPanelRect = canvasRect ? detectReviewPanelRect(img, canvasRect) : null;
  const viewportBoxes = canvasRect
    ? snapshot.chasePopups.map((p) => analyzeBox(img, translateBox(p.box, canvasRect.x, canvasRect.y), 12))
    : [];
  reviewOutputs.push({
    ...probe,
    path: outPath,
    bytes: stat.size,
    image: { width: img.width, height: img.height },
    canvasRect,
    reviewPanelRect,
    snapshotFrame: snapshot.frame,
    visualContract: { ...snapshot.visualContract, reviewUi: true },
    viewportBoxes,
    pass:
      stat.size > 15000 &&
      img.width === 420 &&
      img.height === 780 &&
      canvasRect &&
      canvasRect.y >= 36 &&
      canvasRect.y <= 90 &&
      reviewPanelRect &&
      reviewPanelRect.y > canvasRect.y + canvasRect.h &&
      reviewPanelRect.y + reviewPanelRect.h <= img.height &&
      viewportBoxes.length >= 1 &&
      viewportBoxes.every((box) => box.chasePixels >= 12 && box.bgPixels >= 20 && box.lumaGap >= 40),
  });
}

const reviewDom = dumpDom(`${fileUrl(htmlPath)}?seed=12345&bot=1&botStyle=route&probeFrame=${probes[1].frame}&probeDraw=1&probeReview=1`);
const browserDomContract = {
  bodyReviewClass: /<body[^>]*class="[^"]*\bprobe-review\b/.test(reviewDom),
  bodyProbeMode: /<body[^>]*data-probe-mode="review"/.test(reviewDom),
  bodyGameVersion: /<body[^>]*data-game-version="v05_1_cdx_v69"/.test(reviewDom),
  canvasProbe: /<canvas[^>]*data-probe-canvas="game-surface"/.test(reviewDom),
  canvasGameVersion: /<canvas[^>]*data-game-version="v05_1_cdx_v69"/.test(reviewDom),
  canvasAria: /<canvas[^>]*aria-label="graze_log v05\.2_cdx_v69 playfield"/.test(reviewDom),
  reviewPanelProbe: /<div[^>]*id="reviewinfo"[^>]*data-probe-review-panel="chase-summary"/.test(reviewDom),
  reviewPanelGameVersion: /<div[^>]*id="reviewinfo"[^>]*data-game-version="v05_1_cdx_v69"/.test(reviewDom),
  reviewPanelFrame: /<div[^>]*id="reviewinfo"[^>]*data-probe-frame="\d+"/.test(reviewDom),
  reviewPanelReadableChase: /<div[^>]*id="reviewinfo"[^>]*data-readable-chase="true"/.test(reviewDom),
  reviewPanelVerdict: /<div[^>]*id="reviewinfo"[^>]*data-review-verdict="pass"/.test(reviewDom),
  reviewPanelDistanceBand: /<div[^>]*id="reviewinfo"[^>]*data-distance-band="readable"/.test(reviewDom),
  reviewPanelOcclusion: /<div[^>]*id="reviewinfo"[^>]*data-occlusion="clear"/.test(reviewDom),
  reviewPanelStable: /<div[^>]*id="reviewinfo"[^>]*data-review-stable="false"/.test(reviewDom),
  reviewPanelWindow: /<div[^>]*id="reviewinfo"[^>]*data-review-window="\d+\/\d+\/\d+"/.test(reviewDom),
  reviewPanelReason: /<div[^>]*id="reviewinfo"[^>]*data-review-reason="unstable neighboring frames"/.test(reviewDom),
  reviewPanelVisibleText: /<span>chase<\/span><span>\d+ active<\/span>/.test(reviewDom),
  reviewPanelVerdictText: /<span>verdict<\/span><span>pass<\/span>/.test(reviewDom),
  reviewPanelBandText: /<span>band<\/span><span>readable<\/span>/.test(reviewDom),
  reviewPanelOcclusionText: /<span>occlusion<\/span><span>clear<\/span>/.test(reviewDom),
  reviewPanelStableText: /<span>stable<\/span><span>no<\/span>/.test(reviewDom),
  reviewPanelWindowText: /<span>window<\/span><span>\d+\/\d+\/\d+<\/span>/.test(reviewDom),
  reviewPanelReasonText: /<span>reason<\/span><span>unstable neighboring frames<\/span>/.test(reviewDom),
  title: /<title>graze_log v05\.2_cdx_v69 - review panel probe<\/title>/.test(reviewDom),
};

const report = {
  version: "v05_1_cdx_v69",
  chrome,
  outputs,
  reviewOutputs,
  browserDomContract,
  browserDomContractPass: Object.values(browserDomContract).every(Boolean),
  screenshotsPresent: outputs.every((x) => x.bytes > 10000 && x.image.width === 420 && x.image.height === 620),
  reviewSurfacePresent: reviewOutputs.every((x) => x.pass),
  movingProbeFrames: outputs.length,
  pixelProbePass: outputs.every(
    (x) =>
      x.readableChasePopupFrame &&
      x.visualContract.bareCanvas === true &&
      x.boxes.length >= 1 &&
      x.boxes.every((box) => box.pass)
  ),
};

console.log(JSON.stringify(report, null, 2));
if (!report.screenshotsPresent || !report.reviewSurfacePresent || !report.browserDomContractPass || report.movingProbeFrames !== 4 || !report.pixelProbePass) process.exit(1);

