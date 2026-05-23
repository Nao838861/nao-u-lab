"use strict";

const { W, H, WAVE_EVENTS } = require("./game.js");

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function easeMotion(t, mode = "smooth") {
  if (mode === "linear") return t;
  if (mode === "outCubic") return 1 - Math.pow(1 - t, 3);
  if (mode === "inCubic") return t * t * t;
  if (mode === "snapOut") return 1 - Math.pow(1 - t, 2);
  return t * t * (3 - 2 * t);
}

const RADII = {
  curve: 13,
  feeder: 14,
  anchor: 18,
  armored: 23,
  harvest: 12,
  escort: 16,
  boss: 42,
};

function pathFor(e) {
  if (e.route === "line") {
    return [
      { x: e.x, y: -42, t: 0 },
      { x: e.targetX, y: e.targetY, t: 140, ease: "smooth" },
      { x: e.targetX, y: H + 62, t: 160, ease: "smooth" },
    ];
  }
  if (e.route === "v") {
    return [
      { x: e.x, y: -42, t: 0 },
      { x: e.targetX, y: e.targetY, t: 150, ease: "smooth" },
      { x: e.exitX, y: -58, t: 140, ease: "smooth" },
    ];
  }
  if (e.route === "dive") {
    return [
      { x: e.x, y: -42, t: 0 },
      { x: e.targetX, y: e.targetY, t: 100, ease: "outCubic" },
      { x: e.targetX, y: e.targetY - 30, t: 40, ease: "linear" },
      { x: e.exitX, y: -58, t: 110, ease: "outCubic" },
    ];
  }
  if (e.route === "side") {
    return [
      { x: e.x, y: e.y - 26, t: 0 },
      { x: e.targetX, y: e.y, t: 90, ease: "smooth" },
      { x: e.exitX == null ? (e.side < 0 ? W + 34 : -34) : e.exitX, y: e.y - 26, t: 90, ease: "smooth" },
    ];
  }
  if (e.route === "large") {
    return [
      { x: e.x, y: -42, t: 0 },
      { x: e.targetX, y: e.targetY, t: 136, ease: "smooth" },
      { x: e.targetX, y: e.targetY, t: 84, ease: "linear" },
      { x: e.targetX, y: -58, t: 138, ease: "inCubic" },
    ];
  }
  return null;
}

function samplePath(path, age) {
  let elapsed = 0;
  for (let i = 1; i < path.length; i += 1) {
    const p0 = path[i - 1];
    const p1 = path[i];
    const dur = p1.t || 1;
    if (age <= elapsed + dur) {
      const f = easeMotion(clamp((age - elapsed) / dur, 0, 1), p1.ease || "smooth");
      return {
        x: p0.x + (p1.x - p0.x) * f,
        y: p0.y + (p1.y - p0.y) * f,
      };
    }
    elapsed += dur;
  }
  return null;
}

function main() {
  const authored = WAVE_EVENTS
    .filter(e => ["line", "v", "dive", "side", "large"].includes(e.route))
    .map((e, idx) => ({ ...e, idx, r: RADII[e.kind] || 12, path: pathFor(e) }))
    .filter(e => e.path);
  const endFrame = Math.max(...authored.map(e => e.frame + e.path.slice(1).reduce((a, p) => a + (p.t || 0), 0)));
  const overlaps = [];
  for (let frame = 0; frame <= endFrame; frame += 2) {
    const live = authored
      .map(e => ({ ...e, pos: frame >= e.frame ? samplePath(e.path, frame - e.frame) : null }))
      .filter(e => e.pos && e.pos.y > -24 && e.pos.y < H + 24);
    for (let i = 0; i < live.length; i += 1) {
      for (let j = i + 1; j < live.length; j += 1) {
        const a = live[i];
        const b = live[j];
        if (a.block !== b.block || a.route !== b.route) continue;
        const dx = a.pos.x - b.pos.x;
        const dy = a.pos.y - b.pos.y;
        const dist = Math.hypot(dx, dy);
        const min = a.r + b.r + 2;
        if (dist < min) {
          overlaps.push({
            frame,
            block: a.block,
            route: a.route,
            a: `${a.kind}@${a.frame}`,
            b: `${b.kind}@${b.frame}`,
            dist: Number(dist.toFixed(1)),
            min,
          });
        }
      }
    }
  }
  const worstByPair = new Map();
  for (const o of overlaps) {
    const key = `${o.block}|${o.route}|${o.a}|${o.b}`;
    const prev = worstByPair.get(key);
    if (!prev || o.dist < prev.dist) worstByPair.set(key, o);
  }
  const worst = Array.from(worstByPair.values()).sort((a, b) => a.dist - b.dist || a.frame - b.frame);
  const report = {
    checkedEnemies: authored.length,
    pairOverlaps: worst.length,
    byRoute: worst.reduce((acc, o) => {
      acc[o.route] = (acc[o.route] || 0) + 1;
      return acc;
    }, {}),
    worst: worst.slice(0, 30),
  };
  console.log(JSON.stringify(report, null, 2));
  if (worst.length) throw new Error(`enemy route overlaps: ${worst.length}`);
}

if (require.main === module) main();
