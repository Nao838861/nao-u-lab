"use strict";

const { WAVE_EVENTS } = require("./game.js");

const SHOT_W = 420;
const SHOT_H = 620;

function pathDuration(path) {
  return path.slice(1).reduce((sum, p) => sum + (p.t || 0), 0);
}

function segmentCount(path) {
  return Math.max(0, path.length - 1);
}

function dwellFrames(path) {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    if (Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01) total += b.t || 0;
  }
  return total;
}

function pTopDown(x, endY) {
  return [{ x, y: -15, t: 0 }, { x, y: endY, t: 140 }, { x, y: SHOT_H + 20, t: 160 }];
}

function pLineDown(x, endY, n, gap) {
  return Array.from({ length: n }, (_, i) => ({ path: pTopDown(x, endY - i * 14), delay: i * gap, motion: "lineDown" }));
}

function pVForm(cx, sp, endY) {
  return Array.from({ length: 5 }, (_, k) => {
    const i = k - 2;
    const x = cx + i * sp;
    const sign = i < 0 ? -1 : 1;
    return {
      path: [{ x, y: -15, t: 0 }, { x, y: endY, t: 150 }, { x: x + sign * 80, y: -30, t: 140 }],
      delay: Math.abs(i) * 10,
      motion: "vForm",
    };
  });
}

function pSideEntry(left, cy) {
  const x0 = left ? -15 : SHOT_W + 15;
  const x1 = left ? SHOT_W * 0.6 : SHOT_W * 0.4;
  const x2 = left ? SHOT_W + 15 : -15;
  return [{ x: x0, y: cy - 30, t: 0 }, { x: x1, y: cy, t: 110 }, { x: x2, y: cy - 30, t: 110 }];
}

function pSideSweep(left, y, n) {
  return Array.from({ length: n }, (_, i) => ({ path: pSideEntry(left, y + i * 8), delay: i * 10, motion: "sideSweep" }));
}

function pDive(x, ty) {
  const xoff = x > SHOT_W / 2 ? 100 : -100;
  return [{ x, y: -15, t: 0 }, { x, y: ty, t: 100 }, { x, y: ty - 30, t: 40 }, { x: x + xoff, y: -30, t: 110 }];
}

function pLarge(x) {
  return [{ x, y: -25, t: 0 }, { x, y: 200, t: 160 }, { x, y: 200, t: 80 }, { x, y: -40, t: 140 }];
}

function pBoss(x) {
  return [{ x, y: -35, t: 0 }, { x, y: 140, t: 180 }, { x, y: 140, t: 800 }, { x, y: -40, t: 200 }];
}

function tag(arr, type, extraDelay = 0) {
  return arr.map(e => ({ ...e, type, delay: (e.delay || 0) + extraDelay }));
}

function one(path, type, motion, delay = 0) {
  return { path, type, motion, delay };
}

function buildShotWaves() {
  const waves = [];
  let t = 0;
  waves.push({ t, enemies: tag(pLineDown(210, 355, 6, 10), "small").concat(tag(pLineDown(120, 365, 6, 9), "small", 24), tag(pLineDown(300, 365, 6, 9), "small", 28)) });
  t += 120;
  waves.push({ t, enemies: tag(pLineDown(80, 360, 6, 8), "small").concat(tag(pLineDown(210, 350, 6, 8), "small", 4), tag(pLineDown(340, 360, 6, 8), "small", 8)) });
  t += 160;
  waves.push({ t, enemies: tag(pSideSweep(true, 190, 20), "small") });
  t += 140;
  waves.push({ t, enemies: tag(pSideSweep(false, 260, 20), "small") });
  t += 160;
  waves.push({ t, enemies: tag(pVForm(SHOT_W / 2, 30, 280), "small").concat(tag(pVForm(SHOT_W / 2 - 90, 25, 310), "small", 20), tag(pVForm(SHOT_W / 2 + 90, 25, 310), "small", 20), tag(pLineDown(80, 370, 6, 10), "small", 50), tag(pLineDown(210, 360, 6, 10), "small", 55), tag(pLineDown(340, 370, 6, 10), "small", 50)) });
  t += 250;
  waves.push({ t, enemies: Array.from({ length: 16 }, (_, i) => one(pDive(40 + i * 24, 390 + (i % 3) * 8), "small", "dive", i * 10)).concat(tag(pLineDown(80, 365, 8, 8), "small", 86), tag(pLineDown(340, 365, 8, 8), "small", 92)) });
  t += 180;
  waves.push({ t, enemies: tag(pSideSweep(true, 160, 12), "medium").concat(tag(pSideSweep(false, 300, 12), "small", 30), tag(pLineDown(SHOT_W / 2, 350, 12, 8), "small", 60)) });
  t += 260;
  waves.push({ t, enemies: [one(pLarge(SHOT_W / 2), "large", "large")].concat(tag(pSideSweep(true, 170, 6), "medium", 20), tag(pSideSweep(false, 280, 6), "medium", 50), tag(pLineDown(70, 360, 10, 7), "small", 10), tag(pLineDown(350, 360, 10, 7), "small", 15)) });
  t += 280;
  waves.push({ t, enemies: [one(pLarge(130), "large", "large"), one(pLarge(290), "large", "large", 20)].concat(tag(pLineDown(50, 350, 8, 8), "small", 10), tag(pLineDown(210, 340, 8, 8), "small", 15), tag(pLineDown(370, 350, 8, 8), "small", 10), tag(pSideSweep(true, 380, 8), "medium", 80)) });
  t += 330;
  waves.push({ t, enemies: tag(pVForm(SHOT_W / 2, 35, 290), "small").concat(tag(pVForm(SHOT_W / 2, 35, 290), "small", 50), Array.from({ length: 10 }, (_, i) => one(pDive(40 + i * 40, 400), "small", "dive", 60 + i * 10)), tag(pSideSweep(true, 340, 8), "medium", 100), tag(pSideSweep(false, 200, 8), "small", 110)) });
  t += 330;
  waves.push({ t, enemies: [one(pLarge(SHOT_W / 2), "large", "large")].concat(tag(pSideSweep(true, 170, 10), "medium", 20), tag(pSideSweep(false, 330, 10), "medium", 40), tag(pLineDown(SHOT_W / 2 - 80, 360, 8, 8), "small", 60), tag(pLineDown(SHOT_W / 2 + 80, 360, 8, 8), "small", 65)) });
  t += 320;
  waves.push({ t, enemies: [one(pBoss(SHOT_W / 2), "boss", "boss"), one(pLarge(100), "large", "large", 150), one(pLarge(320), "large", "large", 300)].concat(tag(pLineDown(60, 370, 8, 8), "small", 200), tag(pLineDown(360, 370, 8, 8), "small", 205), tag(pSideSweep(true, 300, 10), "small", 280), tag(pSideSweep(false, 200, 10), "small", 320), tag(pSideSweep(true, 250, 6), "medium", 380), tag(pLineDown(140, 350, 8, 8), "small", 400), tag(pLineDown(280, 350, 8, 8), "small", 405), tag(pLineDown(80, 365, 8, 8), "small", 420), tag(pLineDown(340, 365, 8, 8), "small", 425), tag(pSideSweep(false, 290, 6), "medium", 455)) });
  t += 500;
  waves.push({ t, enemies: [one(pLarge(120), "large", "large"), one(pLarge(300), "large", "large", 20)].concat(tag(pLineDown(50, 360, 10, 7), "small"), tag(pLineDown(150, 350, 10, 7), "small", 5), tag(pLineDown(270, 350, 10, 7), "small", 5), tag(pLineDown(370, 360, 10, 7), "small"), tag(pSideSweep(true, 200, 12), "medium", 80), tag(pSideSweep(false, 350, 12), "medium", 100)) });
  t += 300;
  waves.push({ t, enemies: [one(pBoss(SHOT_W / 2 - 80), "boss", "boss"), one(pLarge(SHOT_W / 2 + 100), "large", "large", 60)].concat(tag(pSideSweep(true, 160, 16), "small", 100), tag(pSideSweep(false, 320, 16), "small", 120), tag(pSideSweep(true, 280, 8), "medium", 250), tag(pLineDown(SHOT_W / 2, 350, 10, 7), "small", 300), Array.from({ length: 8 }, (_, i) => one(pDive(40 + i * 48, 400), "small", "dive", 350 + i * 12))) });
  return waves;
}

function summarizeEntries(entries) {
  const flat = entries.slice().sort((a, b) => a.spawn - b.spawn);
  const gaps = flat.slice(1).map((e, i) => e.spawn - flat[i].spawn);
  const activeEnd = Math.max(...flat.map(e => e.spawn + e.duration));
  const concurrent = [];
  for (let f = 0; f <= activeEnd; f += 30) {
    concurrent.push(flat.filter(e => e.spawn <= f && f < e.spawn + e.duration).length);
  }
  const counts = {};
  const typeCounts = {};
  for (const e of flat) {
    counts[e.motion] = (counts[e.motion] || 0) + 1;
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  }
  return {
    count: flat.length,
    motionCounts: counts,
    typeCounts,
    avgSpawnGap: Number((gaps.reduce((a, b) => a + b, 0) / Math.max(1, gaps.length)).toFixed(2)),
    maxSpawnGap: Math.max(...gaps),
    maxConcurrent: Math.max(...concurrent),
    avgConcurrent: Number((concurrent.reduce((a, b) => a + b, 0) / concurrent.length).toFixed(2)),
    avgSegments: Number((flat.reduce((a, e) => a + e.segments, 0) / flat.length).toFixed(2)),
    avgDuration: Number((flat.reduce((a, e) => a + e.duration, 0) / flat.length).toFixed(2)),
    totalDwellFrames: flat.reduce((a, e) => a + e.dwell, 0),
  };
}

function summarizeShotLog() {
  const waves = buildShotWaves();
  const entries = [];
  for (let waveIndex = 0; waveIndex < waves.length; waveIndex += 1) {
    const wave = waves[waveIndex];
    for (const e of wave.enemies) {
      const motion = e.motion || "lineDown";
      entries.push({
        wave: waveIndex + 1,
        spawn: wave.t + (e.delay || 0),
        type: e.type,
        motion,
        duration: pathDuration(e.path),
        segments: segmentCount(e.path),
        dwell: dwellFrames(e.path),
      });
    }
  }
  const waveCounts = waves.map((wave, i) => ({ wave: i + 1, t: wave.t, count: wave.enemies.length }));
  return { waves: waves.length, waveCounts, ...summarizeEntries(entries) };
}

function summarizePulseRelay() {
  const events = WAVE_EVENTS.map(e => ({ ...e, spawn: e.frame }));
  const gaps = events.slice(1).map((e, i) => e.frame - events[i].frame);
  const routeCounts = {};
  const blockCounts = {};
  const typeCounts = {};
  for (const e of events) {
    routeCounts[e.route] = (routeCounts[e.route] || 0) + 1;
    blockCounts[e.block] = (blockCounts[e.block] || 0) + 1;
    typeCounts[e.kind] = (typeCounts[e.kind] || 0) + 1;
  }
  const dwellCrawlFrames = events
    .filter(e => e.route === "dwell")
    .map(e => Math.ceil((150 - (e.y == null ? -42 : e.y)) / (e.kind === "armored" ? 38 : 32) * 60))
    .filter(n => Number.isFinite(n) && n > 0);
  return {
    count: events.length,
    blocks: Object.keys(blockCounts).length,
    routeCounts,
    typeCounts,
    blockCounts,
    avgSpawnGap: Number((gaps.reduce((a, b) => a + b, 0) / Math.max(1, gaps.length)).toFixed(2)),
    maxSpawnGap: Math.max(...gaps),
    routePrimitiveFrames: {
      lineEntry: 140,
      lineEntryEase: "smooth",
      minLineSpawnGap: 18,
      openingLineEntry: 130,
      openingLineSpawnGap: 16,
      defaultLineTargetStepY: 24,
      lineExit: 160,
      sideEntry: 90,
      sideEntryEase: "smooth",
      minSideSpawnGap: 28,
      mirrorSideEntry: 80,
      mirrorSideSpawnGap: 24,
      sideExit: 90,
      vEntry: 150,
      vExit: 140,
      diveEntry: 100,
      diveKick: 40,
      diveExit: 110,
      largeEntry: 136,
      largeHold: 84,
      largeExit: 138,
      dwellCrawlToY150: dwellCrawlFrames,
      bossEntryCue: 180,
    },
  };
}

const report = {
  source: {
    shotLog: "../shot_log_cdx/v01_from_bd6c65a/headless.py and index.html",
    pulseRelay: "./game.js WAVE_EVENTS and updateEnemies routes",
  },
  shotLog: summarizeShotLog(),
  pulseRelay: summarizePulseRelay(),
  deltas: {
    enemyCountRatio: Number((summarizeShotLog().count / summarizePulseRelay().count).toFixed(2)),
    mainFinding: "shot_log is not just smoother or faster; it uses dense subformations with explicit entry/stay/exit path segments, eased motion, and spawn-delay separation. Pulse Relay follows that style at a smaller scale: formations stay on clean shared rails, overlap is handled by spawn delay and along-route spacing instead of ugly perpendicular offsets or intra-formation phase shifts, while line, side, V, dive, large-deadline, and boss-fuel primitives keep distinct entry/exit reasons.",
    pulseRisks: [
      "Pulse Relay still has fewer enemies than shot_log, so density should be protected if new mechanics increase enemy HP",
      "route policy still reports a few shootable_gap seconds, so future tuning should add overlap instead of slowing enemies",
      "boss fuel is present, but boss phase variety is still simpler than shot_log's late-wave layering",
    ],
  },
};

console.log(JSON.stringify(report, null, 2));
