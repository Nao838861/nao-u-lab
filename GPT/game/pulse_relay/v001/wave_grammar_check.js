"use strict";

const { WAVE_EVENTS } = require("./game.js");

const HP = { curve: 11, feeder: 15, anchor: 28, armored: 58, harvest: 8, escort: 22, boss: 245 };
const LANES = [60, 120, 180, 240, 300, 360, 420];

const PURPOSES = {
  toaplan: "前 wave と反対側 spawn を使い、プレイヤーの横移動を作るための検査。",
  lanes: "5-7 本程度の離散 lane を使い、連続 x 座標の散発配置へ戻っていないかを見る。",
  layered: "popcorn と tank が異なる周期で並走し、単独敵の羅列になっていないかを見る。",
  pacing: "constant intensity と退屈な空白を分け、意図した休符と収穫 wave があるかを見る。",
  failurePatterns: "垂直スタック、画面端配置、同時高HP複数、下方ドリフトを禁止する。",
  sideEntry: "side enemy が画面端で弾だけ撃って終わらず、射線または Pulse 対象になるかを見る。",
};

function blockGroups() {
  const groups = new Map();
  for (const e of WAVE_EVENTS) {
    const key = e.block || e.label || "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  return [...groups.entries()].map(([block, events]) => ({ block, events: events.sort((a, b) => a.frame - b.frame) }));
}

function check() {
  const blocks = blockGroups();
  const hardIssues = [];
  const rows = blocks.map(group => {
    const startFrame = Math.min(...group.events.map(e => e.frame));
    const endFrame = Math.max(...group.events.map(e => e.frame));
    const kinds = count(group.events.map(e => e.kind));
    const hp = group.events.reduce((sum, e) => sum + (HP[e.kind] || 0), 0);
    return {
      block: group.block,
      count: group.events.length,
      startSec: round(startFrame / 60),
      endSec: round(endFrame / 60),
      lanes: [...new Set(group.events.map(nearestLane))].sort((a, b) => a - b),
      sides: count(group.events.map(sideOf)),
      hp,
      kinds,
      hasPopcorn: group.events.some(e => ["curve", "harvest", "feeder"].includes(e.kind)),
      hasTank: group.events.some(e => ["anchor", "armored", "boss"].includes(e.kind)),
      badPolicies: [...new Set(group.events.flatMap(e => e.badPolicy || []))],
    };
  });

  requireBlocks(blocks, hardIssues);
  checkToaplan(rows, hardIssues);
  checkLanes(rows, hardIssues);
  checkLayered(rows, hardIssues);
  checkPacing(rows, hardIssues);
  checkFailurePatterns(blocks, hardIssues);
  checkSideEntry(blocks, hardIssues);

  return { purposes: PURPOSES, eventCount: WAVE_EVENTS.length, blocks: rows, hardIssues };
}

function requireBlocks(blocks, hardIssues) {
  const required = [
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
  const names = new Set(blocks.map(b => b.block));
  for (const r of required) {
    if (!names.has(r)) hardIssues.push({ type: "missing_required_block", block: r, purpose: PURPOSES.pacing });
  }
}

function checkToaplan(rows, hardIssues) {
  let oppositeCount = 0;
  for (let i = 1; i < rows.length; i++) {
    const prevLeft = (rows[i - 1].sides.left || 0) > (rows[i - 1].sides.right || 0);
    const curRight = (rows[i].sides.right || 0) > (rows[i].sides.left || 0);
    const prevRight = (rows[i - 1].sides.right || 0) > (rows[i - 1].sides.left || 0);
    const curLeft = (rows[i].sides.left || 0) > (rows[i].sides.right || 0);
    if ((prevLeft && curRight) || (prevRight && curLeft)) oppositeCount++;
  }
  if (oppositeCount < 3) hardIssues.push({ type: "toaplan_opposite_spawn_low", count: oppositeCount, purpose: PURPOSES.toaplan });
}

function checkLanes(rows, hardIssues) {
  const used = new Set(rows.flatMap(r => r.lanes));
  if (used.size < 5 || used.size > 7) {
    hardIssues.push({ type: "lane_count_out_of_range", used: used.size, purpose: PURPOSES.lanes });
  }
  for (const row of rows) {
    if (row.count >= 4 && row.lanes.length < 2) {
      hardIssues.push({ type: "vertical_stack", block: row.block, lanes: row.lanes, purpose: PURPOSES.failurePatterns });
    }
  }
}

function checkLayered(rows, hardIssues) {
  const layered = rows.filter(r => r.hasPopcorn && r.hasTank).length;
  if (layered < 4) hardIssues.push({ type: "layered_design_low", count: layered, purpose: PURPOSES.layered });
}

function checkPacing(rows, hardIssues) {
  for (let i = 1; i < rows.length; i++) {
    const gap = rows[i].startSec - rows[i - 1].endSec;
    if (gap > 11) hardIssues.push({ type: "long_empty_gap", after: rows[i - 1].block, gap, purpose: PURPOSES.pacing });
    if (gap < 3 && rows[i].hp + rows[i - 1].hp > 180 && !rows[i].block.includes("boss")) {
      hardIssues.push({ type: "dense_high_hp_overlap", block: rows[i].block, gap, purpose: PURPOSES.failurePatterns });
    }
  }
  const relief = rows.find(r => r.block === "relief_harvest");
  if (!relief || relief.kinds.harvest < 6) hardIssues.push({ type: "relief_harvest_missing", purpose: PURPOSES.pacing });
}

function checkFailurePatterns(blocks, hardIssues) {
  for (const group of blocks) {
    const highHp = group.events.filter(e => (HP[e.kind] || 0) >= 50 && e.kind !== "boss");
    if (highHp.length > 2) hardIssues.push({ type: "simultaneous_high_hp_multiple", block: group.block, count: highHp.length, purpose: PURPOSES.failurePatterns });
    const edge = group.events.filter(e => e.route !== "side" && (e.x < 34 || e.x > 446));
    if (edge.length) hardIssues.push({ type: "screen_edge_non_side_spawn", block: group.block, count: edge.length, purpose: PURPOSES.failurePatterns });
    const drifters = group.events.filter(e => e.route === "down" && !["harvest", "curve"].includes(e.kind));
    if (drifters.length) hardIssues.push({ type: "downward_drift_non_popcorn", block: group.block, count: drifters.length, purpose: PURPOSES.failurePatterns });
  }
}

function checkSideEntry(blocks, hardIssues) {
  for (const group of blocks) {
    const side = group.events.filter(e => e.route === "side");
    for (const e of side) {
      if (!["feeder", "escort", "armored"].includes(e.kind)) {
        hardIssues.push({ type: "side_enemy_unknown_role", block: group.block, kind: e.kind, purpose: PURPOSES.sideEntry });
      }
      if (!e.badPolicy || !e.badPolicy.length) {
        hardIssues.push({ type: "side_enemy_without_bad_policy", block: group.block, kind: e.kind, purpose: PURPOSES.sideEntry });
      }
    }
  }
}

function nearestLane(e) {
  if (typeof e.lane === "number" && e.lane >= 0 && e.lane < LANES.length) return e.lane;
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < LANES.length; i++) {
    const d = Math.abs((e.targetX || e.x) - LANES[i]);
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best;
}

function sideOf(e) {
  if (e.side < 0) return "left";
  if (e.side > 0) return "right";
  const x = e.targetX || e.x;
  if (x < 200) return "left";
  if (x > 280) return "right";
  return "center";
}

function count(items) {
  const out = {};
  for (const item of items) out[item] = (out[item] || 0) + 1;
  return out;
}

function round(v) {
  return Math.round(v * 10) / 10;
}

function main() {
  const report = check();
  console.log(JSON.stringify(report, null, 2));
  if (report.hardIssues.length) {
    throw new Error(`wave grammar hard issues: ${report.hardIssues.map(i => i.type).join("; ")}`);
  }
}

if (require.main === module) main();

module.exports = { check, PURPOSES };
