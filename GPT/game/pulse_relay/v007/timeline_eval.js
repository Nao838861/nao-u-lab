"use strict";

const { Game, W, H, WAVE_EVENTS, LOW_PULSE_COST, MID_PULSE_COST, HIGH_PULSE_COST } = require("./game.js");

const SEEDS = [1779, 1780, 1781, 1782, 1783];
const MAX_FRAMES = 60 * 105;

const METRIC_PURPOSES = {
  visibleTargets: "画面に処理対象がいるかを見る。空白や退屈な待ち時間の検出に使う。",
  shootableTargets: "自機の射線または近い横移動で撃てる敵がいるかを見る。敵がいても撃てない時間を疑う。",
  hardTargets: "硬い敵が複数重なって処理待ちになっていないかを見る。",
  enemyBullets: "敵側から来る緊張量を見る。反撃対象なしに増えていないかを疑う。",
  nearBullets: "Pulse Relay を押したくなる弾が来ているかを見る。自発リスクではなく外発緊張の検査。",
  emptyGapSec: "撃つ対象がない連続秒数。意図した休符と退屈な空白を分ける。",
  routeCoverage: "authored block を通過した割合。clear だけでなく stage 内容を通ったかを見る。",
  bottomCampPct: "画面下で待つ雑な勝ち方の成立度を見る。",
  laneSwitches: "左右の切り替えを要求できているかを見る。",
  relayHits: "pulse 変換が敵処理へつながっているかを見る。",
  bossHp: "ボス山場が進行しているかを見る。",
};

Object.assign(METRIC_PURPOSES, {
  pressure: "Targets and bullets overlap in the same second. This checks whether the player shoots while reading danger, not just dodges empty space.",
  pulseOpportunity: "Near bullets during active play. This checks whether Pulse Relay is naturally invited by pressure instead of being an abstract score button.",
  deadlinePressure: "Hard targets with bullets on screen. This checks whether durable enemies create a kill deadline rather than waiting passively.",
  bossPressure: "Boss-phase bullets near or around the player. This checks whether the finale escalates after the boss appears.",
  bossSeconds: "Seconds with a live boss. This catches boss HP or phase gates that are too low for focused human fire.",
});

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
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

function countRewriteTargets(game, radius = 132) {
  const p = game.player;
  return game.enemies.filter(e => {
    const commandTarget = e.kind === "feeder" || e.kind === "armored" || e.kind === "anchor" || e.kind === "escort" || e.boss;
    return commandTarget && e.y > 12 && e.y < H * 0.86 && Math.abs(e.x - p.x) <= radius;
  }).length;
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

function priorityTarget(game, mode = "route") {
  const boss = game.enemies.find(e => e.boss);
  if (boss) return boss;
  const candidates = game.enemies.filter(e => e.y > -20 && e.y < H * 0.78);
  if (!candidates.length) return null;
  if (mode === "marksman") return candidates.sort((a, b) => a.y - b.y || b.hp - a.hp)[0];
  if (mode === "aggressive") return candidates.sort((a, b) => b.score - a.score || b.hp - a.hp)[0];
  return candidates.sort((a, b) => {
    const ap = (a.kind === "armored" || a.kind === "anchor" ? 200 : 0) + (a.y > H * 0.55 ? 120 : 0);
    const bp = (b.kind === "armored" || b.kind === "anchor" ? 200 : 0) + (b.y > H * 0.55 ? 120 : 0);
    return bp - ap || Math.abs(a.x - game.player.x) - Math.abs(b.x - game.player.x);
  })[0];
}

function authoredRouteX(game) {
  const f = game.frame;
  if (f < 230) return 170;
  if (f < 470) return 330;
  if (f < 740) return 220;
  if (f < 1050) return game.player.x < W / 2 ? 180 : 300;
  if (f < 1450) return f < 1220 ? 145 : 335;
  if (f < 1850) return 240;
  if (f < 2250) return 250;
  if (f < 2700) return f < 2450 ? 330 : 180;
  return priorityTarget(game)?.x || W / 2;
}

function authoredRouteY(game) {
  const f = game.frame;
  if (f < 470) return H - 128;
  if (f < 1050) return H - 148;
  if (f < 1450) return H - 168;
  if (f < 2000) return H - 144;
  if (f < 2550) return H - 160;
  if (f < 3000) return H - 150;
  return H - 136;
}

function routeMove(game, preferredY, mode = "route") {
  const p = game.player;
  const target = priorityTarget(game, mode);
  const bossTarget = target && target.boss;
  const nb = nearestBullet(game);
  let tx = authoredRouteX(game);
  let ty = preferredY;

  if (target && (!nb.bullet || nb.d2 > 105 * 105)) tx = clamp(target.x, 34, W - 34);

  let threatX = 0;
  let threatY = 0;
  let threatCount = 0;
  for (const b of game.enemyBullets) {
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < 165 * 165) {
      const w = (165 * 165 - d2) / (d2 + 850);
      threatX += dx * w;
      threatY += dy * w;
      threatCount++;
    }
  }
  if (threatCount > 0) {
    tx = clamp(tx + threatX * (bossTarget ? 14 : 24), 32, W - 32);
    const lowerBound = preferredY <= H - 110 ? H - 112 : H - 42;
    ty = clamp(preferredY + threatY * 12, 90, lowerBound);
  }
  if (bossTarget && (!nb.bullet || nb.d2 > 62 * 62)) {
    tx = clamp(target.x + (tx - target.x) * 0.35, 34, W - 34);
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

function pulseReady(game, minCharge = LOW_PULSE_COST) {
  return game.player.pulseCd <= 0 && game.player.pulseCharge >= minCharge;
}

const POLICIES = {
  route(game) {
    // v004 の標準ルートは marksman 基準に寄せる。強化した Pulse 経済は、
    // 中央で待つだけではなく、狙う敵を選びながら敵弾を収穫する前提で評価する。
    return POLICIES.marksman(game);
  },
  marksman(game) {
    const n = countNearBullets(game, 92);
    const rewriteTargets = countRewriteTargets(game, 160);
    const m = routeMove(game, authoredRouteY(game) - 6, "marksman");
    return inputToward(game, m.tx, m.ty, pulseReady(game, MID_PULSE_COST) && (rewriteTargets >= 1 || n >= 1));
  },
  aggressive(game) {
    const n = countNearBullets(game, 96);
    const rewriteTargets = countRewriteTargets(game, 172);
    const m = routeMove(game, H - 185, "aggressive");
    return inputToward(game, m.tx, m.ty, pulseReady(game, MID_PULSE_COST) && (rewriteTargets >= 1 || n >= 2));
  },
  survival(game) {
    const n = countNearBullets(game, 92);
    const m = routeMove(game, H - 62, "route");
    return inputToward(game, m.tx, m.ty, pulseReady(game, LOW_PULSE_COST) && n >= 4);
  },
  camper(game) {
    const p = game.player;
    const nb = nearestBullet(game);
    let tx = W / 2 + Math.sin(game.t * 1.7) * 100;
    if (nb.bullet && nb.d2 < 86 * 86) tx = clamp(p.x - (nb.bullet.x - p.x) * 0.85, 38, W - 38);
    return inputToward(game, tx, H - 42, false);
  },
  "lane-holder"(game) {
    const n = countNearBullets(game, 92);
    return inputToward(game, W / 2, H - 105, pulseReady(game, LOW_PULSE_COST) && n >= 11);
  },
  "blind-sweeper"(game) {
    const n = countNearBullets(game, 88);
    const phase = Math.sin(game.t * 1.15);
    return inputToward(game, phase > 0 ? 395 : 85, H - 96, pulseReady(game, LOW_PULSE_COST) && n >= 5);
  },
  noPulse(game) {
    const m = routeMove(game, authoredRouteY(game), "route");
    return inputToward(game, m.tx, m.ty, false);
  },
  pulseHeavy(game) {
    const n = countNearBullets(game, 104);
    const m = routeMove(game, authoredRouteY(game) - 10, "route");
    return inputToward(game, m.tx, m.ty, pulseReady(game, LOW_PULSE_COST) && n >= 1);
  },
  "boss-rush"(game) {
    const boss = game.enemies.find(e => e.boss);
    if (!boss) return POLICIES.route(game);
    const n = countNearBullets(game, 96);
    const rewriteTargets = countRewriteTargets(game, 190);
    const tx = clamp(boss.x, 34, W - 34);
    const ty = H - 172;
    return inputToward(game, tx, ty, pulseReady(game, MID_PULSE_COST) && (rewriteTargets >= 1 || n >= 1));
  },
};

function secondMetrics(game, prev, routeState) {
  const visibleTargets = game.enemies.filter(e => e.y > -35 && e.y < H + 10).length;
  const shootableTargets = game.enemies.filter(e => e.y > -30 && e.y < H * 0.82 && Math.abs(e.x - game.player.x) < 72).length;
  const hardTargets = game.enemies.filter(e => (e.kind === "armored" || e.kind === "boss") && e.y > -20 && e.y < H * 0.82).length;
  const nearBullets = countNearBullets(game, 110);
  const boss = game.enemies.find(e => e.boss);
  const pressure = visibleTargets > 0 && (nearBullets >= 2 || game.enemyBullets.length >= 14) ? 1 : 0;
  const pulseOpportunity = visibleTargets > 0 && nearBullets >= 1 ? 1 : 0;
  const deadlinePressure = hardTargets > 0 && game.enemyBullets.length >= 8 ? 1 : 0;
  const bossPressure = boss && (nearBullets >= 1 || game.enemyBullets.length >= 12) ? 1 : 0;
  const blockNames = new Set(game.enemies.map(e => e.block).filter(Boolean));
  for (const name of blockNames) routeState.seenBlocks.add(name);
  if (game.player.y > H - 86) routeState.bottomFrames += 60;
  const lane = Math.floor(game.player.x / 80);
  if (routeState.lastLane != null && Math.abs(lane - routeState.lastLane) >= 2) routeState.laneSwitches++;
  routeState.lastLane = lane;
  routeState.seconds++;
  routeState.pressureSeconds += pressure;
  routeState.pulseOpportunitySeconds += pulseOpportunity;
  routeState.deadlinePressureSeconds += deadlinePressure;
  routeState.bossPressureSeconds += bossPressure;
  if (boss) routeState.bossSeconds++;
  return {
    sec: Math.floor(game.t),
    visibleTargets,
    shootableTargets,
    hardTargets,
    enemyBullets: game.enemyBullets.length,
    nearBullets,
    pressure,
    pulseOpportunity,
    deadlinePressure,
    bossPressure,
    emptyGapSec: routeState.emptyRun,
    routeCoverage: round(routeState.seenBlocks.size / requiredBlocks().length),
    bottomCampPct: round(routeState.bottomFrames / Math.max(1, routeState.seconds * 60)),
    laneSwitches: routeState.laneSwitches,
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
  const routeState = {
    seenBlocks: new Set(),
    emptyRun: 0,
    bottomFrames: 0,
    seconds: 0,
    bossSeconds: 0,
    lastLane: null,
    laneSwitches: 0,
    pressureSeconds: 0,
    pulseOpportunitySeconds: 0,
    deadlinePressureSeconds: 0,
    bossPressureSeconds: 0,
  };
  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    game.update(policy(game));
    if (game.enemies.some(e => e.block)) {
      for (const e of game.enemies) routeState.seenBlocks.add(e.block);
    }
    if (game.frame >= nextSecondFrame || game.state !== "play") {
      const visibleShootable = game.enemies.filter(e => e.y > -30 && e.y < H * 0.82 && Math.abs(e.x - game.player.x) < 72).length;
      routeState.emptyRun = visibleShootable === 0 ? routeState.emptyRun + 1 : 0;
      const m = secondMetrics(game, prev, routeState);
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
  const summary = game.snapshot();
  summary.routeCoverage = round(routeState.seenBlocks.size / requiredBlocks().length);
  summary.bottomCampPct = round(routeState.bottomFrames / Math.max(1, routeState.seconds * 60));
  summary.laneSwitches = routeState.laneSwitches;
  summary.pressurePct = round(routeState.pressureSeconds / Math.max(1, routeState.seconds));
  summary.pulseOpportunityPct = round(routeState.pulseOpportunitySeconds / Math.max(1, routeState.seconds));
  summary.deadlinePressurePct = round(routeState.deadlinePressureSeconds / Math.max(1, routeState.seconds));
  summary.bossPressurePct = round(routeState.bossPressureSeconds / Math.max(1, routeState.bossSeconds));
  summary.bossSeconds = routeState.bossSeconds;
  return { policy: policyName, seed, summary, timeline, issues: detectIssues(timeline, summary, policyName) };
}

function detectIssues(timeline, summary, policyName) {
  const issues = [];
  let shootableGap = 0;
  let bulletOnly = 0;
  for (const row of timeline) {
    shootableGap = row.shootableTargets === 0 ? shootableGap + 1 : 0;
    bulletOnly = row.enemyBullets > 10 && row.shootableTargets === 0 ? bulletOnly + 1 : 0;
    if (shootableGap === 4) issues.push({ sec: row.sec, type: "shootable_gap", purpose: METRIC_PURPOSES.shootableTargets });
    if (bulletOnly === 3) issues.push({ sec: row.sec, type: "bullets_without_targets", purpose: METRIC_PURPOSES.enemyBullets });
    if (row.damage > 0 && row.sec < 10 && policyName === "route") issues.push({ sec: row.sec, type: "early_route_damage", purpose: METRIC_PURPOSES.enemyBullets });
    if (row.hardTargets > 2) issues.push({ sec: row.sec, type: "hard_target_stack", purpose: METRIC_PURPOSES.hardTargets });
    if (row.bossHp != null && row.bossPressure === 0 && row.sec > 50) issues.push({ sec: row.sec, type: "boss_lull", purpose: METRIC_PURPOSES.bossPressure });
  }
  if (["route", "marksman"].includes(policyName) && summary.routeCoverage < 0.85) {
    issues.push({ sec: Math.floor(summary.time), type: "low_route_coverage", purpose: METRIC_PURPOSES.routeCoverage });
  }
  if (policyName === "route" && summary.converted > 0 && summary.conversionHits < 3) {
    issues.push({ sec: Math.floor(summary.time), type: "relay_hits_low", purpose: METRIC_PURPOSES.relayHits });
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
      meanRouteCoverage: avg(group.map(r => r.summary.routeCoverage)),
      meanBottomCampPct: avg(group.map(r => r.summary.bottomCampPct)),
      meanPressurePct: avg(group.map(r => r.summary.pressurePct)),
      meanPulseOpportunityPct: avg(group.map(r => r.summary.pulseOpportunityPct)),
      meanDeadlinePressurePct: avg(group.map(r => r.summary.deadlinePressurePct)),
      meanBossPressurePct: avg(group.map(r => r.summary.bossPressurePct)),
      meanBossSeconds: avg(group.map(r => r.summary.bossSeconds || 0)),
      meanLaneSwitches: avg(group.map(r => r.summary.laneSwitches)),
      meanTime: avg(group.map(r => r.summary.time)),
      meanScore: avg(group.map(r => r.summary.score)),
      meanConverted: avg(group.map(r => r.summary.converted)),
      meanRelayHits: avg(group.map(r => r.summary.conversionHits)),
      meanFieldConversions: avg(group.map(r => r.summary.fieldConversions || 0)),
      meanResonantEnemies: avg(group.map(r => r.summary.resonantEnemies || 0)),
      meanChainHits: avg(group.map(r => r.summary.chainHits || 0)),
      meanRelayKills: avg(group.map(r => r.summary.relayKills || 0)),
      meanRewrittenEnemies: avg(group.map(r => r.summary.rewrittenEnemies || 0)),
      meanRewriteFuelShots: avg(group.map(r => r.summary.rewriteFuelShots || 0)),
      meanRewriteKills: avg(group.map(r => r.summary.rewriteKills || 0)),
      meanRewriteBossPatternCount: avg(group.map(r => r.summary.rewriteBossPatternCount || 0)),
      meanRewriteActiveTime: avg(group.map(r => r.summary.rewriteActiveTime || 0)),
      meanAlliedShots: avg(group.map(r => r.summary.alliedShots || 0)),
      meanAlliedHits: avg(group.map(r => r.summary.alliedHits || 0)),
      meanAlliedKills: avg(group.map(r => r.summary.alliedKills || 0)),
      meanNearMissCharge: avg(group.map(r => r.summary.nearMissCharge || 0)),
      meanSpentCharge: avg(group.map(r => r.summary.spentCharge || 0)),
      meanLowPulseCount: avg(group.map(r => r.summary.lowPulseCount || 0)),
      meanMidPulseCount: avg(group.map(r => r.summary.midPulseCount || 0)),
      meanMaxPulseCount: avg(group.map(r => r.summary.maxPulseCount || 0)),
      meanPulseWhiffs: avg(group.map(r => r.summary.pulseWhiffs || 0)),
      meanDamage: avg(group.map(r => r.summary.damageTaken || 0)),
      issueCounts: countTypes(group.flatMap(r => r.issues)),
    };
  }
  return { metricPurposes: METRIC_PURPOSES, waveEventCount: WAVE_EVENTS.length, requiredBlocks: requiredBlocks(), byPolicy };
}

function requiredBlocks() {
  return [
    "opening_curve_train",
    "mirror_answer",
    "center_lane_bait",
    "side_feeder_cover",
    "armored_gate",
    "relief_harvest",
    "midboss_setup",
    "boss_approach_final_braid",
    "boss_relay_exam",
  ];
}

function avg(values) {
  return values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

function countTypes(items) {
  const out = {};
  for (const item of items) out[item.type] = (out[item.type] || 0) + 1;
  return out;
}

function round(v) {
  return Math.round(v * 100) / 100;
}

function main() {
  const runs = [];
  for (const policyName of Object.keys(POLICIES)) {
    for (const seed of SEEDS) runs.push(run(policyName, seed));
  }
  const report = aggregate(runs);
  report.sampleTimelines = Object.fromEntries(Object.keys(POLICIES).map(name => {
    const r = runs.find(x => x.policy === name);
    return [name, r.timeline.slice(0, 90)];
  }));
  console.log(JSON.stringify(report, null, 2));

  const hardIssues = [];
  if (report.byPolicy.route.clearRate < 0.6) hardIssues.push("route clear rate too low");
  if (report.byPolicy.marksman.bossReachRate < 0.8) hardIssues.push("marksman does not reach authored boss");
  if (report.byPolicy.route.meanConverted <= 0 || report.byPolicy.route.meanRelayHits < 3) hardIssues.push("route does not exercise Pulse Relay");
  if (report.byPolicy.route.meanNearMissCharge < 80) hardIssues.push("v007 charge economy is not being earned through danger");
  if (report.byPolicy.route.meanSpentCharge < 100) hardIssues.push("v007 route is not spending enough pulse charge");
  if (report.byPolicy.route.meanMidPulseCount < 3) hardIssues.push("v007 route is not using command pulses enough");
  if (report.byPolicy.route.meanFieldConversions < 12) hardIssues.push("v007 resonance field is not supporting rewrite play enough");
  if (report.byPolicy.route.meanResonantEnemies < 24) hardIssues.push("v007 enemy resonance reaction is not exercised enough");
  if (report.byPolicy.route.meanChainHits < 6) hardIssues.push("v007 chain relay is not exercised enough");
  if (report.byPolicy.route.meanRewrittenEnemies < 7) hardIssues.push("v007 route is not rewriting enough enemies");
  if (report.byPolicy.route.meanRewriteActiveTime < 18) hardIssues.push("v007 rewritten enemies do not stay alive as allies long enough");
  if (report.byPolicy.route.meanRewriteFuelShots < 24) hardIssues.push("v007 rewritten enemies are not producing enough fuel shots");
  if (report.byPolicy.route.meanRewriteBossPatternCount < 1) hardIssues.push("v007 boss rewrite pattern is not exercised by the route policy");
  if (report.byPolicy.route.meanAlliedShots < 20) hardIssues.push("v007 rewritten enemies are not visibly firing enough allied shots");
  if (report.byPolicy.route.meanAlliedHits < 10) hardIssues.push("v007 allied rewrite shots are not hitting enough enemies");
  if (report.byPolicy.route.meanAlliedKills < 3) hardIssues.push("v007 allied rewrite shots are not killing enough enemies");
  if (report.byPolicy.route.meanPulseWhiffs > 1) hardIssues.push("v007 pulse is still whiffing too often");
  if (report.byPolicy.route.meanPressurePct < 0.25) hardIssues.push("route pressure is still too sparse");
  if (report.byPolicy.route.meanPulseOpportunityPct < 0.12) hardIssues.push("route does not create enough pulse opportunities");
  if (report.byPolicy.route.meanDeadlinePressurePct < 0.08) hardIssues.push("hard targets do not create enough deadline pressure");
  if (report.byPolicy.route.meanBossPressurePct < 0.45) hardIssues.push("boss phase pressure is too low");
  if (report.byPolicy["boss-rush"].clearRate > 0 && report.byPolicy["boss-rush"].meanBossSeconds < 15) hardIssues.push("focused boss-rush can end boss too quickly");
  if (report.byPolicy.noPulse.meanScore >= report.byPolicy.route.meanScore) hardIssues.push("noPulse score is not weaker than route");
  if (report.byPolicy.camper.clearRate >= report.byPolicy.route.clearRate && report.byPolicy.camper.meanScore >= report.byPolicy.route.meanScore * 0.85) hardIssues.push("camper remains a dominant policy");
  if (report.byPolicy["lane-holder"].clearRate >= report.byPolicy.route.clearRate && report.byPolicy["lane-holder"].meanScore >= report.byPolicy.route.meanScore * 0.9) hardIssues.push("lane-holder covers too much authored content");
  if (report.byPolicy["blind-sweeper"].clearRate >= report.byPolicy.route.clearRate && report.byPolicy["blind-sweeper"].meanScore >= report.byPolicy.route.meanScore * 0.85) hardIssues.push("blind-sweeper remains too strong");
  if (hardIssues.length) throw new Error(`timeline eval hard issues: ${hardIssues.join("; ")}`);
}

if (require.main === module) main();

module.exports = { POLICIES, run, aggregate, METRIC_PURPOSES };
