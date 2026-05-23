const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "game", "graze_log_cdx", "v05_1_cdx_v63", "index.html");
const outDir = path.join(root, ".tmp", "graze_log_cdx_v63_chase_probe");
fs.mkdirSync(outDir, { recursive: true });

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (!chrome) {
  throw new Error("Chrome or Edge executable not found for real-browser probe screenshots");
}

function fileUrl(p) {
  return `file:///${p.replace(/\\/g, "/").replace(/ /g, "%20")}`;
}

const probes = [
  { name: "chase_popup_early", frame: 751 },
  { name: "chase_popup_mid", frame: 906 },
  { name: "chase_popup_bunker", frame: 1676 },
  { name: "chase_popup_late", frame: 2296 },
];

const outputs = [];
for (const probe of probes) {
  const outPath = path.join(outDir, `v63_${probe.name}.png`);
  const url = `${fileUrl(htmlPath)}?seed=12345&bot=1&botStyle=route&probeFrame=${probe.frame}&probeDraw=1`;
  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=520,760",
      `--screenshot=${outPath}`,
      url,
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    throw new Error(`Chrome screenshot failed for ${probe.name}: ${result.stderr || result.stdout}`);
  }
  const stat = fs.statSync(outPath);
  outputs.push({ ...probe, path: outPath, bytes: stat.size });
}

const report = {
  version: "v05_1_cdx_v63",
  chrome,
  outputs,
  screenshotsPresent: outputs.every((x) => x.bytes > 25000),
  movingProbeFrames: outputs.length,
};

console.log(JSON.stringify(report, null, 2));
if (!report.screenshotsPresent || report.movingProbeFrames !== 4) process.exit(1);
