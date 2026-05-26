"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const workdir = path.join(root, "game", "pulse_relay", "v008");

const checks = [
  ["node", ["verify.js"]],
  ["node", ["timeline_eval.js"]],
  ["node", ["enemy_behavior_audit.js"]],
  ["node", ["wave_grammar_check.js"]],
  ["node", ["enemy_overlap_check.js"]],
];

for (const [cmd, args] of checks) {
  const result = spawnSync(cmd, args, {
    cwd: workdir,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
  console.log(`${args[0]}: pass`);
}

console.log("HEADLESS PULSE RELAY V008 OK");
