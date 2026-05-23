"use strict";

const { W, WAVE_EVENTS } = require("./game.js");

const HP = { scout: 13, weaver: 18, bruiser: 46, boss: 80 };
const PURPOSES = {
  laneSpread: "敵が単一縦線に偏っていないかを見る。良し悪しではなく、射線が単調になる危険の検出。",
  pacing: "Wave間隔の長すぎ/短すぎを見る。空白と過密の両方を疑うための検査。",
  hpLoad: "同時期の高HP過多を見る。撃つ快感より処理待ちになる危険の検出。",
  bossFuel: "ボス中に雑魚燃料があるかを見る。ボス孤立でリズムが止まる危険の検出。",
};

function groupByLabel(events) {
  const groups = new Map();
  for (const e of events) {
    const key = e.label || e.kind;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

function sd(values) {
  if (values.length < 2) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - m) * (b - m), 0) / values.length);
}

function check() {
  const groups = groupByLabel(WAVE_EVENTS);
  const rows = [];
  const warnings = [];
  for (const g of groups) {
    const xs = g.items.map(e => e.x);
    const frames = g.items.map(e => e.frame);
    const hp = g.items.reduce((sum, e) => sum + (HP[e.kind] || 0), 0);
    const row = {
      label: g.label,
      count: g.items.length,
      startFrame: Math.min(...frames),
      endFrame: Math.max(...frames),
      startSec: Math.round(Math.min(...frames) / 60 * 10) / 10,
      laneSd: Math.round(sd(xs) * 10) / 10,
      hp,
      kinds: countKinds(g.items),
    };
    if (row.count >= 3 && row.laneSd < W / 7) {
      warnings.push({ label: g.label, type: "low_lane_spread", purpose: PURPOSES.laneSpread, laneSd: row.laneSd });
    }
    if (hp > 150 && !g.items.some(e => e.kind === "boss")) {
      warnings.push({ label: g.label, type: "high_hp_load", purpose: PURPOSES.hpLoad, hp });
    }
    rows.push(row);
  }
  const starts = rows.map(r => r.startFrame).sort((a, b) => a - b);
  for (let i = 1; i < starts.length; i++) {
    const gap = starts[i] - starts[i - 1];
    if (gap > 360) warnings.push({ afterFrame: starts[i - 1], type: "long_pacing_gap", purpose: PURPOSES.pacing, gapSec: Math.round(gap / 60 * 10) / 10 });
    if (gap < 90) warnings.push({ afterFrame: starts[i - 1], type: "dense_pacing_gap", purpose: PURPOSES.pacing, gapSec: Math.round(gap / 60 * 10) / 10 });
  }
  const bossFrame = WAVE_EVENTS.find(e => e.kind === "boss")?.frame;
  if (bossFrame) {
    const bossFuel = WAVE_EVENTS.filter(e => e.frame > bossFrame + 120 && e.kind !== "boss");
    if (bossFuel.length < 12) warnings.push({ type: "boss_fuel_low", purpose: PURPOSES.bossFuel, count: bossFuel.length });
  }
  return { purposes: PURPOSES, eventCount: WAVE_EVENTS.length, waves: rows, warnings };
}

function countKinds(items) {
  const out = {};
  for (const e of items) out[e.kind] = (out[e.kind] || 0) + 1;
  return out;
}

function main() {
  const report = check();
  console.log(JSON.stringify(report, null, 2));
  const severe = report.warnings.filter(w => w.type === "boss_fuel_low");
  if (severe.length) throw new Error("wave grammar severe warning: boss fuel low");
}

if (require.main === module) main();

module.exports = { check, PURPOSES };
