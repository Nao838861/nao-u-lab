import { runStableCityAudit } from "../src/audit.js";

const audit = runStableCityAudit();
const summary = {
  passed: audit.passed,
  seeds: audit.seeds,
  days: audit.days,
  bands: audit.bands,
  scenarios: audit.scenarios.map((scenario) => ({
    seed: scenario.seed,
    passed: scenario.passed,
    bands: scenario.bands,
    firstPopulationBreach: scenario.yearly.find((sample) => (
      sample.population < 80 || sample.population > 250
    )) ?? null,
    firstJobBreach: scenario.yearly.find((sample) => (
      Object.values(sample.jobs).some((count) => count < 1)
    )) ?? null,
    prices: scenario.prices,
    famine: scenario.famine,
    bankruptcyDay: scenario.bankruptcyDay,
    material: scenario.material,
    physical: scenario.physical,
  })),
};

console.log(JSON.stringify(summary, null, 2));
if (!audit.passed) process.exitCode = 1;
