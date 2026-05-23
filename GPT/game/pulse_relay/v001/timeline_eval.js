"use strict";

const { Game, W, H, WAVE_EVENTS } = require("./game.js");

const SEEDS = [1779, 1780, 1781, 1782, 1783];
const MAX_FRAMES = 60 * 100;

const METRIC_PURPOSES = {
  visibleEnemies: "撃つ対象が画面に存在するかを見る。少なすぎる秒が続くと退屈や空白の疑い。",
  shootableEnemies: "自機の射線に乗る対象があるかを見る。敵がいても撃てない時間の検出用。",
  enemyBullets: "外発緊張の量を見る。多いほど良いわけではなく、敵や反撃先なしに増えると悪い。",
  nearBullets: "パルス判断が自然に発生するかを見る。自発カスリではなく向こうから来る危険の検出用。",
  conversions: "独自メカが発火しているかを見る。多さだけで合格にしない。",
  relayHits: "変換が攻撃快感へ接続したかを見る。低い時は敵配置や反撃角度を疑う。",
  damage: "難度スパイクの位置を見る。被弾ゼロが目的ではなく、学習前の急死検出用。",
  bossHp: "山場が進んでいるかを見る。ボス到達後に削れない時は燃料/攻撃接続不足。",
};

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function nearestBullet(game) {
  const p = game.player;
  let best = null;
  let bestD = Infinity;
  for (const b of game.enemyBullets) {
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      best = b;
      bestD = d;
    }
  }
  return { bullet: best, d2: bestD };
}

function countNearBullets(game, radius = 92) {
  const p = game.player;
  const r2 = radius * radius;
  return game.enemyBullets.filter(b => {
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    return dx * dx + dy * dy <= r2;
  }).length;
}

function baseMove(game, preferredY) {
  const p = game.player;
  let tx = W / 2;
  let ty = preferredY;
  const nb = nearestBullet(game);
  let threatX = 0;
  let threatY = 0;
  let threatCount = 0;
  for (const b of game.enemyBullets) {
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < 185 * 185) {
      const w = (185 * 185 - d2) / (d2 + 900);
      threatX += dx * w;
      threatY += dy * w;
      threatCount++;
    }
  }
  if (threatCount > 0) {
    tx = clamp(p.x + threatX * 36, 32, W - 32);
    ty = clamp(preferredY + threatY * 10, 96, H - 42);
  }
  const boss = game.enemies.find(e => e.boss);
  const target = boss || game.enemies.filter(e => e.y > -10 && e.y < H * 0.72).sort((a, b) => b.hp - a.hp)[0];
  if (target && (!nb.bullet || nb.d2 > 105 * 105)) {
    tx = clamp(target.x, 36, W - 36);
  }
  return { tx, ty };
}

function inputToward(game, tx, ty, pulse) {
  const p = game.player;
  return {
    left: p.x > tx + 8,
    right: p.x < tx - 8,
    up: p.y > ty + 8,
    down: p.y < ty - 8,
    pulse,
    restart: false,
  };
}

const POLICIES = {
  route(game) {
    const n = countNearBullets(game, 92);
    const m = baseMove(game, H - 105);
    return inputToward(game, m.tx, m.ty, game.player.pulseCd <= 0 && n >= 3);
  },
  aggressive(game) {
    const n = countNearBullets(game, 96);
    const m = baseMove(game, H - 190);
    return inputToward(game, m.tx, m.ty, game.player.pulseCd <= 0 && n >= 2);
  },
  defensive(game) {
    const n = countNearBullets(game, 92);
    const m = baseMove(game, H - 58);
    return inputToward(game, m.tx, m.ty, game.player.pulseCd <= 0 && n >= 4);
  },
  camper(game) {
    const p = game.player;
    const nb = nearestBullet(game);
    let tx = W / 2;
    if (nb.bullet && nb.d2 < 85 * 85) tx = clamp(p.x - (nb.bullet.x - p.x) * 0.8, 40, W - 40);
    return inputToward(game, tx, H - 44, false);
  },
  noPulse(game) {
    const m = baseMove(game, H - 105);
    return inputToward(game, m.tx, m.ty, false);
  },
  pulseHeavy(game) {
    const n = countNearBullets(game, 100);
    const m = baseMove(game, H - 125);
    return inputToward(game, m.tx, m.ty, game.player.pulseCd <= 0 && n >= 1);
  },
};

function secondMetrics(game, prev) {
  const visibleEnemies = game.enemies.filter(e => e.y > -30 && e.y < H + 10).length;
  const shootableEnemies = game.enemies.filter(e => e.y > -30 && e.y < H * 0.78 && Math.abs(e.x - game.player.x) < 70).length;
  const nearBullets = countNearBullets(game, 110);
  const boss = game.enemies.find(e => e.boss);
  return {
    sec: Math.floor(game.t),
    visibleEnemies,
    shootableEnemies,
    enemyBullets: game.enemyBullets.length,
    playerBullets: game.playerBullets.length,
    nearBullets,
    conversions: game.metrics.converted - prev.converted,
    relayHits: game.metrics.conversionHits - prev.relayHits,
    damage: game.metrics.damageTaken - prev.damage,
    score: game.score,
    bossHp: boss ? Math.round(boss.hp) : null,
    state: game.state,
  };
}

function run(policyName, seed) {
  const game = new Game(seed);
  const policy = POLICIES[policyName];
  const timeline = [];
  let nextSecondFrame = 60;
  let prev = { converted: 0, relayHits: 0, damage: 0 };
  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    game.update(policy(game));
    if (game.frame >= nextSecondFrame || game.state !== "play") {
      const m = secondMetrics(game, prev);
      timeline.push(m);
      prev = {
        converted: game.metrics.converted,
        relayHits: game.metrics.conversionHits,
        damage: game.metrics.damageTaken,
      };
      nextSecondFrame += 60;
    }
    if (game.state !== "play") break;
  }
  return { policy: policyName, seed, summary: game.snapshot(), timeline, issues: detectIssues(timeline, game.snapshot()) };
}

function detectIssues(timeline, summary) {
  const issues = [];
  let emptyRun = 0;
  let bulletOnlyRun = 0;
  for (const row of timeline) {
    emptyRun = row.shootableEnemies === 0 ? emptyRun + 1 : 0;
    bulletOnlyRun = row.enemyBullets > 8 && row.shootableEnemies === 0 ? bulletOnlyRun + 1 : 0;
    if (emptyRun === 3) issues.push({ sec: row.sec, type: "shootable_gap", purpose: METRIC_PURPOSES.shootableEnemies });
    if (bulletOnlyRun === 3) issues.push({ sec: row.sec, type: "bullets_without_targets", purpose: METRIC_PURPOSES.enemyBullets });
    if (row.damage > 0 && row.sec < 18) issues.push({ sec: row.sec, type: "early_damage", purpose: METRIC_PURPOSES.damage });
  }
  if (summary.converted > 20 && summary.conversionHits < 4) {
    issues.push({ sec: Math.floor(summary.time), type: "relay_hits_low", purpose: METRIC_PURPOSES.relayHits });
  }
  if (!summary.bossReached) {
    issues.push({ sec: Math.floor(summary.time), type: "no_boss_reach", purpose: METRIC_PURPOSES.bossHp });
  }
  return issues;
}

function aggregate(runs) {
  const byPolicy = {};
  for (const policyName of Object.keys(POLICIES)) {
    const group = runs.filter(r => r.policy === policyName);
    byPolicy[policyName] = {
      runs: group.length,
      clearRate: avg(group.map(r => r.summary.state === "clear" ? 1 : 0)),
      bossReachRate: avg(group.map(r => r.summary.bossReached ? 1 : 0)),
      meanTime: avg(group.map(r => r.summary.time)),
      meanScore: avg(group.map(r => r.summary.score)),
      meanConverted: avg(group.map(r => r.summary.converted)),
      meanRelayHits: avg(group.map(r => r.summary.conversionHits)),
      meanDamage: avg(group.map(r => r.summary.damageTaken || 0)),
      issueCounts: countTypes(group.flatMap(r => r.issues)),
    };
  }
  return { metricPurposes: METRIC_PURPOSES, waveEventCount: WAVE_EVENTS.length, byPolicy };
}

function avg(values) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100) / 100 : 0;
}

function countTypes(items) {
  const out = {};
  for (const item of items) out[item.type] = (out[item.type] || 0) + 1;
  return out;
}

function main() {
  const runs = [];
  for (const policyName of Object.keys(POLICIES)) {
    for (const seed of SEEDS) runs.push(run(policyName, seed));
  }
  const report = aggregate(runs);
  report.sampleTimelines = Object.fromEntries(Object.keys(POLICIES).map(name => {
    const r = runs.find(x => x.policy === name);
    return [name, r.timeline.slice(0, 80)];
  }));
  console.log(JSON.stringify(report, null, 2));
  const hardIssues = [];
  if (report.byPolicy.route.bossReachRate < 0.6) hardIssues.push("route rarely reaches boss");
  if (report.byPolicy.route.meanConverted <= 0) hardIssues.push("route never exercises pulse conversion");
  if (report.byPolicy.noPulse.meanScore >= report.byPolicy.route.meanScore) hardIssues.push("no-pulse is not weaker than route on score");
  if (hardIssues.length) {
    throw new Error(`timeline eval hard issues: ${hardIssues.join("; ")}`);
  }
}

if (require.main === module) main();

module.exports = { POLICIES, run, aggregate, METRIC_PURPOSES };
