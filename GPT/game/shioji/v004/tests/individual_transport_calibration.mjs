import assert from 'node:assert/strict';

import { createEngineApi, mimicPlayerThroughApi } from '../../engine/src/api.js';
import { buildBaseCity } from '../../engine/src/audit.js';
import { assertMoneyConservation } from '../../engine/src/econ.js';

const seeds = [11, 13, 14];
const days = Number(process.env.TRANSPORT_DAYS ?? 720);
const rows = [];

for (const seed of seeds) {
  const world = buildBaseCity(seed);
  const api = createEngineApi(world);
  let multiplierTotal = 0;
  let multiplierSamples = 0;
  let maximumConcurrentPeople = 0;

  for (let day = 1; day <= days; day += 1) {
    mimicPlayerThroughApi(api, world.state.day);
    api.advanceDays(1);
    const { economy, physical } = world.state;
    multiplierTotal += economy.households.reduce(
      (total, household) => total + (household.productionMultiplier ?? 0),
      0,
    );
    multiplierSamples += economy.households.length;
    maximumConcurrentPeople = Math.max(
      maximumConcurrentPeople,
      physical.activeHaulJobIds.length
        + economy.households.reduce((total, household) => (
          total
          + (household.marketCarrier?.porters?.length ?? 0)
          + Number(Boolean(household.workCarrier))
        ), 0),
    );
    if (day % 30 === 0) assert.equal(assertMoneyConservation(economy), true);
  }

  const tiers = Object.fromEntries(
    Object.entries(world.state.economy.transportStats ?? {}).map(([tier, stats]) => [
      tier,
      {
        trips: stats.trips,
        load: Number(stats.load.toFixed(2)),
        capacity: Number(stats.capacity.toFixed(2)),
        utilization: Number((stats.load / Math.max(1e-9, stats.capacity)).toFixed(3)),
        averageLoad: Number((stats.load / Math.max(1, stats.trips)).toFixed(3)),
      },
    ]),
  );
  const row = {
    seed,
    day: world.state.day,
    population: world.state.economy.households.reduce(
      (total, household) => total + household.members.length,
      0,
    ),
    households: world.state.economy.households.length,
    famine: world.state.economy.famine,
    hungry: world.state.economy.hungryN,
    averageProductionMultiplier: Number(
      (multiplierTotal / Math.max(1, multiplierSamples)).toFixed(4),
    ),
    maximumConcurrentPeople,
    cartStats: { ...world.state.economy.cartStats },
    tiers,
  };
  rows.push(row);
  console.log(JSON.stringify(row));
}

assert.ok(rows.every((row) => row.population > 0), '3シードとも生活人口が残る');
assert.ok(rows.every((row) => row.tiers.backpack?.trips > 0), '背負い便が全シードで実働する');
assert.ok(rows.every((row) => row.averageProductionMultiplier > 0.5),
  '運搬後も世帯生産倍率の平均が生活床を保つ');
console.log(`individual transport calibration: PASS ${JSON.stringify({ days, seeds })}`);
