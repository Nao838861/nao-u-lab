const { runHeadless, idealBossTTK } = require("./game.js");

const policies = ["balanced", "aggressive", "conservative", "pulse-heavy"];
const results = policies.map((policy) => {
  const run = runHeadless(policy);
  const final = run.final;
  return {
    policy,
    state: final.state,
    time: Number(final.time.toFixed(2)),
    score: final.score,
    kills: final.kills,
    damageTaken: final.damageTaken,
    pulseUses: final.pulseUses,
    bossKillTime: run.stats.bossKillFrame ? Number((run.stats.bossKillFrame / 60).toFixed(2)) : null,
    bossDuration: run.stats.bossSpawnFrame && run.stats.bossKillFrame
      ? Number(((run.stats.bossKillFrame - run.stats.bossSpawnFrame) / 60).toFixed(2))
      : null,
  };
});

const ttk = idealBossTTK();
const clearCount = results.filter((r) => r.state === "clear").length;
const bossDurations = results.map((r) => r.bossDuration).filter((v) => v != null);
const minBossDuration = bossDurations.length ? Math.min(...bossDurations) : 0;
const maxDamage = Math.max(...results.map((r) => r.damageTaken));

console.log(JSON.stringify({ results, idealTTK: ttk }, null, 2));

const failures = [];
if (clearCount < 2) failures.push(`expected at least 2 policies to clear, got ${clearCount}`);
if (ttk.normal < 12 || ttk.normal > 22) failures.push(`normal ideal boss TTK out of target: ${ttk.normal.toFixed(2)}s`);
if (ttk.pulseBurst < 9 || ttk.pulseBurst > 16) failures.push(`pulse burst boss TTK out of target: ${ttk.pulseBurst.toFixed(2)}s`);
if (minBossDuration && minBossDuration < 8) failures.push(`headless boss duration too short: ${minBossDuration.toFixed(2)}s`);
if (maxDamage > 6) failures.push(`bot damage too high: ${maxDamage}`);
if (results.every((r) => r.pulseUses === 0)) failures.push("no policy used pulse");

if (failures.length) {
  console.error("VERIFY FAILED");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log("VERIFY OK");
