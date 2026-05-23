const { WAVES, routePosition, routeDuration, FPS } = require("./game.js");

const ROUTE_LIMITS = {
  scoutRail: { max: 9.8, minShow: 0.6, maxShow: 2.4 },
  sideLance: { max: 9.6, minShow: 0.6, maxShow: 2.8 },
  sideArc: { max: 9.4, minShow: 0.5, maxShow: 2.6 },
  diverCut: { max: 12.5, minShow: 0.35, maxShow: 3.0 },
  carrierWake: { max: 6.8, minShow: 0.2, maxShow: 2.2 },
};

function summarizeRoute(spawn) {
  const dur = routeDuration(spawn.route);
  const perPhase = {};
  let prev = null;
  for (let f = spawn.frame; f <= spawn.frame + dur; f++) {
    const p = routePosition(Object.assign({}, spawn, { spawn: spawn.frame, maxHp: spawn.hp }), f);
    if (!p.active) {
      prev = null;
      continue;
    }
    if (prev) {
      const speed = Math.hypot(p.x - prev.x, p.y - prev.y);
      const phase = p.phase || "unknown";
      const bucket = perPhase[phase] || { count: 0, max: 0, sum: 0 };
      bucket.count += 1;
      bucket.max = Math.max(bucket.max, speed);
      bucket.sum += speed;
      perPhase[phase] = bucket;
    }
    prev = p;
  }
  const out = {};
  for (const [phase, v] of Object.entries(perPhase)) {
    out[phase] = {
      avg: Number((v.sum / v.count).toFixed(2)),
      max: Number(v.max.toFixed(2)),
    };
  }
  return out;
}

const byRoute = {};
const worst = [];
for (const spawn of WAVES) {
  if (spawn.type === "boss") continue;
  const summary = summarizeRoute(spawn);
  const routeBucket = byRoute[spawn.route] || {};
  for (const [phase, stats] of Object.entries(summary)) {
    const bucket = routeBucket[phase] || { samples: 0, avgSum: 0, max: 0 };
    bucket.samples += 1;
    bucket.avgSum += stats.avg;
    bucket.max = Math.max(bucket.max, stats.max);
    routeBucket[phase] = bucket;
    worst.push({
      id: spawn.id,
      route: spawn.route,
      intent: spawn.intent,
      phase,
      avg: stats.avg,
      max: stats.max,
    });
  }
  byRoute[spawn.route] = routeBucket;
}

const routeSummary = {};
for (const [route, phases] of Object.entries(byRoute)) {
  routeSummary[route] = {};
  for (const [phase, stats] of Object.entries(phases)) {
    routeSummary[route][phase] = {
      avg: Number((stats.avgSum / stats.samples).toFixed(2)),
      max: Number(stats.max.toFixed(2)),
    };
  }
}

worst.sort((a, b) => b.max - a.max);

const failures = [];
for (const [route, phases] of Object.entries(routeSummary)) {
  const limits = ROUTE_LIMITS[route];
  if (!limits) continue;
  for (const [phase, stats] of Object.entries(phases)) {
    if (stats.max > limits.max) {
      failures.push(`${route}.${phase} max ${stats.max} exceeds ${limits.max}`);
    }
    if (phase === "show" && stats.avg > limits.maxShow) {
      failures.push(`${route}.show avg ${stats.avg} exceeds ${limits.maxShow}`);
    }
    if (phase === "show" && stats.avg < limits.minShow) {
      failures.push(`${route}.show avg ${stats.avg} below ${limits.minShow}`);
    }
  }
}

const report = {
  fps: FPS,
  purpose: "Check that enemy entry/exit speeds are brisk but not teleport-like, and show speeds stay readable for formation shooting.",
  routeSummary,
  fastestSamples: worst.slice(0, 12),
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.error("ROUTE MOTION FAILED");
  process.exit(1);
}

console.log("ROUTE MOTION OK");
