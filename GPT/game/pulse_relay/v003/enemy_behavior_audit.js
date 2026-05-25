"use strict";

const { Game, W, H } = require("./game.js");
const { POLICIES } = require("./timeline_eval.js");

const game = new Game(1779);
let offscreenShots = 0;
let lingeringEnemies = 0;
let maxEnemyStep = 0;
const last = new Map();

for (let i = 0; i < 60 * 105 && game.state === "play"; i++) {
  game.update(POLICIES.route(game));
  for (const b of game.enemyBullets) {
    if (b.bornVisible === false) offscreenShots++;
  }
  for (const e of game.enemies) {
    const prev = last.get(e);
    if (prev) maxEnemyStep = Math.max(maxEnemyStep, Math.hypot(e.x - prev.x, e.y - prev.y));
    last.set(e, { x: e.x, y: e.y });
    const visible = e.x > -e.r && e.x < W + e.r && e.y > -e.r && e.y < H + e.r;
    if (!e.boss && visible && e.age > 7.2) lingeringEnemies++;
  }
}

const result = {
  state: game.state,
  time: Number(game.t.toFixed(2)),
  offscreenShots,
  lingeringEnemies,
  maxEnemyStep: Number(maxEnemyStep.toFixed(2)),
};

console.log(JSON.stringify(result, null, 2));

if (offscreenShots > 0) throw new Error(`offscreen shots detected: ${offscreenShots}`);
if (lingeringEnemies > 0) throw new Error(`lingering non-boss enemies detected: ${lingeringEnemies}`);
if (maxEnemyStep > 16) throw new Error(`enemy movement jump too large: ${maxEnemyStep.toFixed(2)}`);
console.log("ENEMY BEHAVIOR OK");
