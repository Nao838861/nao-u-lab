"use strict";

const { Game, W, H } = require("./game.js");
const { POLICIES } = require("./timeline_eval.js");

function makeInput(game) {
  const p = game.player;
  let tx = W / 2;
  let ty = H - 92;
  let nearest = null;
  let nd = Infinity;
  for (const b of game.enemyBullets) {
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    const d = dx * dx + dy * dy;
    if (d < nd) {
      nd = d;
      nearest = b;
    }
  }
  if (nearest && nd < 150 * 150) {
    tx = clamp(p.x - (nearest.x - p.x) * 1.25, 30, W - 30);
    ty = clamp(p.y - (nearest.y - p.y) * 0.75, 100, H - 40);
  }
  const boss = game.enemies.find(e => e.boss);
  if (boss && (!nearest || nd > 120 * 120)) {
    tx = clamp(boss.x, 45, W - 45);
    ty = H - 110;
  }
  const inPulse = game.enemyBullets.filter(b => {
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    return dx * dx + dy * dy < 92 * 92;
  }).length;
  return {
    left: p.x > tx + 8,
    right: p.x < tx - 8,
    up: p.y > ty + 8,
    down: p.y < ty - 8,
    pulse: p.pulseCd <= 0 && inPulse >= 3,
    restart: false,
  };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function run(seed) {
  const game = new Game(seed);
  for (let i = 0; i < 60 * 100; i++) {
    game.update(POLICIES.route(game));
    if (game.state !== "play") break;
  }
  return game.snapshot();
}

function mechanicCheck() {
  const game = new Game(4001);
  game.enemies = [];
  game.enemyBullets = [];
  game.playerBullets = [];
  game.player.x = W / 2;
  game.player.y = H - 120;
  game.spawnEnemy("armored", W / 2, H - 360, { fireCd: 99, route: "dwell", block: "mechanic_check" });
  for (let i = -2; i <= 2; i++) {
    game.enemyBullets.push({ x: game.player.x + i * 12, y: game.player.y - 34, vx: 0, vy: 100, r: 5 });
  }
  game.update({ left: false, right: false, up: false, down: false, pulse: true, restart: false });
  const converted = game.metrics.converted;
  for (let i = 0; i < 40; i++) {
    game.update({ left: false, right: false, up: false, down: false, pulse: false, restart: false });
  }
  return {
    converted,
    conversionHits: game.metrics.conversionHits,
    fieldConversions: game.metrics.fieldConversions,
    gateConversions: game.metrics.gateConversions,
    gateActiveTime: game.metrics.gateActiveTime,
    resonantEnemies: game.metrics.resonantEnemies,
    chainHits: game.metrics.chainHits,
    enemyHp: game.enemies[0] ? game.enemies[0].hp : 0,
  };
}

const results = [1779, 1780, 1781].map(run);
const mechanic = mechanicCheck();
console.log(JSON.stringify({ mechanic, runs: results }, null, 2));

const reached = results.filter(r => r.bossReached).length;
const usedRelay = results.every(r => r.converted > 0 && r.conversionHits > 0);
if (mechanic.converted < 5 || mechanic.conversionHits < 1) {
  throw new Error("core pulse conversion did not damage the target enemy");
}
if (results.some(r => r.fieldConversions < 4 || r.resonantEnemies < 6 || r.chainHits < 6)) {
  throw new Error("v005 resonance field / enemy reaction / chain relay was not exercised enough");
}
if (results.some(r => r.gateConversions < 18 || r.gateActiveTime < 6)) {
  throw new Error("v009 Relay Gate was not exercised enough");
}
if (reached < 2) {
  throw new Error(`boss reach regression: ${reached}/3`);
}
if (!usedRelay) {
  throw new Error("relay mechanic was not exercised in every run");
}
