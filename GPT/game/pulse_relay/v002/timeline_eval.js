const fs = require("fs");
const { runHeadless, sampleRoutes } = require("./game.js");

const run = runHeadless("balanced");
const rows = run.timeline.map((s) => ({
  sec: Math.round(s.time),
  state: s.state,
  visibleTargets: s.visibleTargets,
  shootableTargets: s.shootableTargets,
  enemyBullets: s.enemyBullets,
  nearBullets: s.nearBullets,
  pulseCharge: Math.round(s.player.charge),
  pulseUses: s.pulseUses,
  bossHp: Math.round(s.bossHp),
  damageTaken: s.damageTaken,
}));

const boring = rows.filter((r) => r.sec < 48 && r.visibleTargets === 0 && r.enemyBullets < 3).map((r) => r.sec);
const notShootable = rows.filter((r) => r.visibleTargets > 0 && r.shootableTargets === 0).map((r) => r.sec);
const heavy = rows.filter((r) => r.enemyBullets > 42 || r.nearBullets > 7).map((r) => r.sec);
const bossRows = rows.filter((r) => r.sec >= 48 && r.bossHp > 0);
const bossStart = bossRows[0];
const bossEnd = bossRows[bossRows.length - 1];

function runs(values) {
  const out = [];
  let cur = [];
  for (const v of values) {
    if (!cur.length || v === cur[cur.length - 1] + 1) cur.push(v);
    else {
      out.push(cur);
      cur = [v];
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

const boringRuns = runs(boring).filter((r) => r.length >= 2);
const notShootableRuns = runs(notShootable).filter((r) => r.length >= 2);

const summary = {
  final: run.final,
  boring,
  boringRuns,
  notShootable,
  notShootableRuns,
  heavy,
  bossStart,
  bossEnd,
  routeSamples: sampleRoutes().filter((r) => [1, 2, 9, 16, 25, 28].includes(r.id)),
  rows,
};

console.log(JSON.stringify(summary, null, 2));

const md = [
  "# eval timeline",
  "",
  "## 実行結果",
  "",
  `- final state: ${run.final.state}`,
  `- final time: ${run.final.time.toFixed(2)}s`,
  `- score: ${run.final.score}`,
  `- damageTaken: ${run.final.damageTaken}`,
  `- pulseUses: ${run.final.pulseUses}`,
  `- isolated boring seconds before boss: ${boring.length ? boring.join(", ") : "none"}`,
  `- boring runs before boss: ${boringRuns.length ? boringRuns.map((r) => r.join("-")).join(", ") : "none"}`,
  `- isolated visible-but-not-shootable seconds: ${notShootable.length ? notShootable.join(", ") : "none"}`,
  `- visible-but-not-shootable runs: ${notShootableRuns.length ? notShootableRuns.map((r) => r.join("-")).join(", ") : "none"}`,
  `- heavy pressure seconds: ${heavy.length ? heavy.join(", ") : "none"}`,
  `- boss start row: ${bossStart ? JSON.stringify(bossStart) : "none"}`,
  `- boss end row: ${bossEnd ? JSON.stringify(bossEnd) : "none"}`,
  "",
  "## 秒別 rows",
  "",
  "```json",
  JSON.stringify(rows, null, 2),
  "```",
  "",
  "## 読み",
  "",
  "- 0-10 秒は scout と side の重なりで visible/shootable が維持されるかを見る。",
  "- 30-45 秒は carrier と side arc で pulse の必要性があるかを見る。",
  "- boss は 3 秒以内に hp が消えていないかを見る。",
  "",
].join("\n");

fs.writeFileSync("eval_timeline.md", md, "utf8");

const failures = [];
if (boringRuns.length > 0) failures.push(`boring run before boss: ${boringRuns.map((r) => r.join("-")).join(",")}`);
if (notShootableRuns.length > 0) failures.push(`visible-but-not-shootable run: ${notShootableRuns.map((r) => r.join("-")).join(",")}`);
if (heavy.length > 8) failures.push(`too many heavy pressure seconds: ${heavy.join(",")}`);
if (!bossStart) failures.push("boss was not reached");
if (failures.length) {
  console.error("TIMELINE FAILED");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log("TIMELINE OK");
