const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "memory", "raw", "game_eval", "graze_log_style_compare.jsonl");

function loadRecords() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`missing ${path.relative(root, inputPath)}`);
  }
  return fs
    .readFileSync(inputPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (err) {
        throw new Error(`invalid JSONL at line ${index + 1}: ${err.message}`);
      }
    })
    .filter((row) => row.game === "graze_log_cdx" && row.grazeTraceDigest && row.version);
}

function latestDistinctVersions(records) {
  const byVersion = new Map();
  for (const row of records) byVersion.set(row.version, row);
  return Array.from(byVersion.values())
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
    .slice(-2);
}

function deltaNumber(after, before) {
  if (typeof after !== "number" || typeof before !== "number") return null;
  return Number((after - before).toFixed(3));
}

function digestDelta(before, after) {
  const styles = Array.from(new Set([...Object.keys(before.grazeTraceDigest), ...Object.keys(after.grazeTraceDigest)]));
  const out = {};
  for (const style of styles) {
    const a = after.grazeTraceDigest[style] || {};
    const b = before.grazeTraceDigest[style] || {};
    out[style] = {
      result: { before: b.result || null, after: a.result || null, changed: b.result !== a.result },
      routeEvents: { before: b.routeEvents ?? null, after: a.routeEvents ?? null, delta: deltaNumber(a.routeEvents, b.routeEvents) },
      kills: { before: b.kills ?? null, after: a.kills ?? null, delta: deltaNumber(a.kills, b.kills) },
      hits: { before: b.hits ?? null, after: a.hits ?? null, delta: deltaNumber(a.hits, b.hits) },
      bombs: { before: b.bombs ?? null, after: a.bombs ?? null, delta: deltaNumber(a.bombs, b.bombs) },
      activeDef: { before: b.activeDef ?? null, after: a.activeDef ?? null, delta: deltaNumber(a.activeDef, b.activeDef) },
      bossCue: { before: b.bossCue ?? 0, after: a.bossCue ?? 0, delta: deltaNumber(a.bossCue ?? 0, b.bossCue ?? 0) },
      bossCueVolley: {
        before: b.bossCueVolley ?? 0,
        after: a.bossCueVolley ?? 0,
        delta: deltaNumber(a.bossCueVolley ?? 0, b.bossCueVolley ?? 0),
      },
      bossCueSteer: {
        before: b.bossCueSteer ?? 0,
        after: a.bossCueSteer ?? 0,
        delta: deltaNumber(a.bossCueSteer ?? 0, b.bossCueSteer ?? 0),
      },
      pressure: { before: b.pressure ?? null, after: a.pressure ?? null, delta: deltaNumber(a.pressure, b.pressure) },
      movementSwitches: {
        before: b.movementSwitches ?? null,
        after: a.movementSwitches ?? null,
        delta: deltaNumber(a.movementSwitches, b.movementSwitches),
      },
    };
  }
  return out;
}

const records = loadRecords();
const pair = latestDistinctVersions(records);
if (pair.length < 2) {
  throw new Error("need at least two distinct graze_log_cdx versions in JSONL");
}

const [before, after] = pair;
const report = {
  methodVersion: "graze-style-latest2-digest-v001",
  source: path.relative(root, inputPath),
  before: { version: before.version, recordedAt: before.recordedAt, methodVersion: before.methodVersion },
  after: { version: after.version, recordedAt: after.recordedAt, methodVersion: after.methodVersion },
  styleDelta: digestDelta(before, after),
  notes: [
    "This is a headless comparison aid, not a fun verdict.",
    "Missing cue fields in older records are treated as 0 so newer versions can prove whether the prompt, pressure event, and steering response entered the trace.",
  ],
};

console.log(JSON.stringify(report, null, 2));

const hasRoute = report.styleDelta.route && report.styleDelta.route.result.after === "clear";
const hasBossCueDelta = Object.values(report.styleDelta).some((row) => row.bossCue.after > row.bossCue.before);
const hasBossCueVolley = Object.values(report.styleDelta).some((row) => row.bossCueVolley.after > 0);
const hasBossCueSteer = Object.values(report.styleDelta).some((row) => row.bossCueSteer.after > 0);
if (!hasRoute || (!hasBossCueDelta && !hasBossCueVolley && !hasBossCueSteer)) process.exit(1);
