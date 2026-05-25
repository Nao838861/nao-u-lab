"use strict";

const { Game, POLICIES, STAGE_SECONDS } = require("../game/resonance_cdx/v001/game.js");

function run(seed, policyName) {
  const game = new Game(seed);
  game.update({ ring: true });
  for (let i = 0; i < Math.ceil((STAGE_SECONDS + 4) * 60); i++) {
    game.update(POLICIES[policyName](game));
    if (game.state !== "play") break;
  }
  return game.snapshot();
}

function summarize(policyName) {
  const seeds = [1779657780, 1779658696, 1779661734];
  return seeds.map(seed => ({ seed, policy: policyName, result: run(seed, policyName) }));
}

const route = summarize("route");
const noRing = summarize("noRing");
const camper = summarize("camper");
const emptyRinger = summarize("emptyRinger");
const all = { route, noRing, camper, emptyRinger };
console.log(JSON.stringify(all, null, 2));

function avg(rows, pick) {
  return rows.reduce((sum, row) => sum + pick(row.result), 0) / rows.length;
}

const routeBoss = route.filter(row => row.result.metrics.bossReached).length;
const routeMeaningful = route.every(row => row.result.metrics.meaningfulRings >= 2);
const routeMarkers = route.every(row => row.result.metrics.markerFrames > 0);
const routeThreeStates = route.every(row => {
  const m = row.result.metrics;
  return m.stateUnavailable > 0 && m.stateReadyThin > 0 && m.stateReadyUseful > 0;
});
const noOffscreen = route.every(row => row.result.metrics.offscreenShots === 0 && row.result.metrics.abruptExits === 0);
const routeScore = avg(route, r => r.score);
const badScore = Math.max(avg(noRing, r => r.score), avg(camper, r => r.score), avg(emptyRinger, r => r.score));
const routeTime = avg(route, r => r.time);
const badTime = Math.max(avg(noRing, r => r.time), avg(camper, r => r.time), avg(emptyRinger, r => r.time));

if (routeBoss < 2) {
  throw new Error(`route policy did not reach boss often enough: ${routeBoss}/3`);
}
if (!routeMeaningful) {
  throw new Error("route policy did not exercise meaningful ring use in every seed");
}
if (!routeMarkers) {
  throw new Error("object-side markers were not observed in every route seed");
}
if (!routeThreeStates) {
  throw new Error("ring three-state telemetry was incomplete");
}
if (!noOffscreen) {
  throw new Error("enemy behavior audit failed: offscreen shot or abrupt exit recorded");
}
if (!(routeScore > badScore * 1.03 && routeTime > badTime * 1.08)) {
  throw new Error(`bad-policy split too weak: route=${routeScore.toFixed(1)}/${routeTime.toFixed(1)} bad=${badScore.toFixed(1)}/${badTime.toFixed(1)}`);
}
