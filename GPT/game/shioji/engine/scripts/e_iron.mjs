import { runIronChainBandAudit } from "../src/audit.js";

const audit = runIronChainBandAudit();
const summary = {
  passed: audit.passed,
  seeds: audit.seeds,
  days: audit.days,
  bands: audit.bands,
  envelope: audit.envelope,
  scenarios: audit.audits.map(({ connected, disconnected, results }) => ({
    results,
    connected: {
      yearly: connected.yearly,
      incomes: connected.incomes,
      jobs: connected.jobs,
      physical: connected.physical,
    },
    disconnected: {
      yearly: disconnected.yearly,
      jobs: disconnected.jobs,
      physical: disconnected.physical,
    },
  })),
};

console.log(JSON.stringify(summary, null, 2));
if (!audit.passed) process.exitCode = 1;
