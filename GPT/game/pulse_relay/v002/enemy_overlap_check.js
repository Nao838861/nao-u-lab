const { WAVES, routePosition, routeDuration, FPS } = require("./game.js");

const samples = [];
for (const s of WAVES) {
  if (s.type === "boss") continue;
  const dur = routeDuration(s.route);
  for (let f = s.frame; f < s.frame + dur; f += 2) {
    const p = routePosition(Object.assign({}, s, { spawn: s.frame, maxHp: s.hp }), f);
    if (p.active) {
      samples.push({
        id: s.id,
        type: s.type,
        route: s.route,
        intent: s.intent,
        frame: f,
        x: p.x,
        y: p.y,
        r: s.radius,
        phase: p.phase,
      });
    }
  }
}

let overlaps = 0;
let minGap = Infinity;
let closest = null;
const byFrame = new Map();
for (const s of samples) {
  const list = byFrame.get(s.frame) || [];
  list.push(s);
  byFrame.set(s.frame, list);
}

for (const [frame, list] of byFrame) {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const gap = d - (a.r + b.r) * 0.85;
      if (gap < minGap) {
        minGap = gap;
        closest = { frame, second: Number((frame / FPS).toFixed(2)), gap: Number(gap.toFixed(2)), a, b };
      }
      if (gap < 0) overlaps += 1;
    }
  }
}

const densityBySecond = {};
for (const s of samples) {
  const sec = Math.floor(s.frame / FPS);
  densityBySecond[sec] = Math.max(densityBySecond[sec] || 0, (byFrame.get(s.frame) || []).length);
}

const result = {
  pairOverlaps: overlaps,
  minGap: Number(minGap.toFixed(2)),
  closest,
  maxVisibleBySecond: densityBySecond,
};

console.log(JSON.stringify(result, null, 2));

if (overlaps > 0) {
  console.error(`OVERLAP FAILED: ${overlaps} pair overlaps`);
  process.exit(1);
}
if (minGap > 90) {
  console.error(`DENSITY FAILED: closest gap too loose (${minGap.toFixed(2)}), likely over-applied no-overlap`);
  process.exit(1);
}

console.log("OVERLAP OK");
