#!/usr/bin/env python3
"""Restore selected shared-reads atoms from candidate metadata.

Phase 4c implementation for ISS-4A-20260517-01.
The Slack-ingested rows are valid JSON but their searchable text is mojibake.
This migration only touches the Phase 4a evidence rows that have a matching
posted candidate record.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import atoms_fileformat


ROOT = Path(__file__).resolve().parents[1]
ATOMS_JSONL = ROOT / "memory" / "atoms.jsonl"
ATOMS_DIR = ROOT / "memory" / "atoms"

RESTORES: dict[str, dict[str, Any]] = {
    "sr-1778796436-33420ab144": {
        "candidate": "memory/shared_reads_candidates/20260515_fly_fail_fix_iterative_game_repair.md",
        "title": "Fly, Fail, Fix: Iterative Game Repair with Reinforcement Learning and Large Multimodal Models",
        "url": "https://arxiv.org/abs/2507.12666",
        "tags": ["harness", "game-design", "agent", "evaluation"],
        "kind": ["observation", "synthesis"],
        "status": "active",
        "score": 6,
        "trigger": (
            "Use when designing headless playtests, automated game repair loops, "
            "or small mechanics-parameter probes. Fly, Fail, Fix uses an RL "
            "playtest agent and an LMM designer to iteratively revise a Flappy "
            "Bird-style YAML game configuration from score, survival-time, and "
            "visual traces."
        ),
        "excerpt": (
            "NVIDIA Research / arXiv. The paper treats game repair as a closed "
            "loop: an RL agent playtests a Flappy Bird-like game, then an LMM "
            "designer revises YAML mechanics parameters using text metrics and "
            "recent gameplay frames. For Nao_u_BOT, the useful pattern is to turn "
            "headless playtest traces into bounded configuration patches such as "
            "gravity, cooldown, spawn interval, enemy speed, or hitbox margins."
        ),
    },
    "sr-1778796437-c1a41cf983": {
        "candidate": "memory/shared_reads_candidates/20260515_smart_coverage_aware_game_playtesting.md",
        "title": "Synergizing Code Coverage and Gameplay Intent: Coverage-Aware Game Playtesting with LLM-Guided Reinforcement Learning",
        "url": "https://arxiv.org/abs/2512.12706",
        "tags": ["memory", "harness", "game-design", "agent", "evaluation"],
        "kind": ["observation", "synthesis"],
        "status": "active",
        "score": 7,
        "trigger": (
            "Use when connecting code changes to gameplay-intent checks in a "
            "headless harness. SMART reads AST differences, derives semantic "
            "subgoals, maps them to structural anchors, and uses hybrid rewards "
            "so an RL agent explores changed game behavior rather than only raw "
            "coverage or task completion."
        ),
        "excerpt": (
            "The candidate frames SMART as a bridge between code-centric coverage "
            "and player-centric gameplay validation. It uses LLM-generated "
            "subgoals and reward rules from AST diffs, then guides RL playtesting "
            "toward modified branches and gameplay intent. For Nao_u_BOT, this "
            "maps to event-level regression checks such as changed anchors, "
            "intent subgoals, test traces, and missed anchors."
        ),
    },
    "sr-1778884869-fd7c05e74c": {
        "candidate": "memory/shared_reads_candidates/20260516_runtime_pcg_autonomous_agents.md",
        "title": "Runtime Evaluation of Procedural Content Generation in an Endless Runner Game Using Autonomous Agents",
        "url": "https://arxiv.org/abs/2605.01783",
        "tags": ["memory", "harness", "game-design", "agent", "operation", "evaluation"],
        "kind": ["observation", "synthesis"],
        "status": "active",
        "score": 9,
        "trigger": (
            "Use when evaluating procedural generation before it reaches a human "
            "player. The candidate describes runtime PCG validation in an endless "
            "runner with autonomous scanner and traversal agents, ray casts, "
            "physics sweeps, crash reports, and playability/diversity/"
            "controllability/performance axes."
        ),
        "excerpt": (
            "The candidate centers on unifying generation and validation in the "
            "same runtime loop. In the Momentum endless-runner example, PCG output "
            "is checked by autonomous agents before delivery to the player. For "
            "Nao_u_BOT, this suggests seed-keyed agent probes that record corridor "
            "geometry, obstacle failures, crash causes, and runtime performance "
            "rather than treating generated content as valid until manual review."
        ),
    },
    "sr-1778884870-0332249b8f": {
        "candidate": "memory/shared_reads_candidates/20260516_bounded_autonomy_llm_characters.md",
        "title": "Bounded Autonomy: Controlling LLM Characters in Live Multiplayer Games",
        "url": "https://arxiv.org/abs/2604.04703",
        "tags": ["game-design", "agent", "operation", "evaluation"],
        "kind": ["observation", "synthesis"],
        "status": "active",
        "score": 6,
        "trigger": (
            "Use when designing LLM NPC or AI companion behavior that must remain "
            "grounded in world state and player intent. Bounded Autonomy separates "
            "agent-agent interaction, agent-world action execution, and "
            "player-agent steering, with decay, grounding, fallback, and whisper "
            "style soft steering."
        ),
        "excerpt": (
            "The candidate treats LLM characters as a control-interface problem, "
            "not just free-form conversation. It separates social interaction, "
            "world-action grounding, and player steering, then evaluates stability, "
            "grounding quality, and intervention success in live multiplayer play. "
            "For Nao_u_BOT, this becomes a small probe for NPC action sets, "
            "fallback behavior, and lightweight steering signals."
        ),
    },
}


def load_atoms(path: Path) -> list[dict[str, Any]]:
    atoms: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                atoms.append(json.loads(line))
    return atoms


def save_atoms(path: Path, atoms: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for atom in atoms:
            f.write(json.dumps(atom, ensure_ascii=False, sort_keys=True) + "\n")


def candidate_exists(rel_path: str) -> bool:
    return (ROOT / rel_path).exists()


def restore_atom(atom: dict[str, Any], restore: dict[str, Any]) -> dict[str, Any]:
    candidate = restore["candidate"]
    links = [restore["url"], slack_permalink(atom), candidate]
    updated = dict(atom)
    for key in ("title", "trigger", "excerpt", "tags", "kind", "status", "score"):
        updated[key] = restore[key]
    updated["links"] = links
    updated["restored_from_candidate"] = candidate
    updated["restored_reason"] = (
        "ISS-4A-20260517-01: restored a mojibake Slack atom from the posted candidate record"
    )
    return updated


def slack_permalink(atom: dict[str, Any]) -> str:
    ts = str(atom.get("source_ts", "")).replace(".", "")
    return f"https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p{ts}"


def main() -> int:
    missing_candidates = [
        data["candidate"] for data in RESTORES.values() if not candidate_exists(data["candidate"])
    ]
    if missing_candidates:
        for path in missing_candidates:
            print(f"missing candidate: {path}")
        return 1

    atoms = load_atoms(ATOMS_JSONL)
    restored = 0
    seen_targets: set[str] = set()
    next_atoms: list[dict[str, Any]] = []
    for atom in atoms:
        aid = atom.get("id")
        if aid in RESTORES:
            seen_targets.add(aid)
            next_atoms.append(restore_atom(atom, RESTORES[aid]))
            restored += 1
        else:
            next_atoms.append(atom)

    missing_atoms = sorted(set(RESTORES) - seen_targets)
    if missing_atoms:
        for aid in missing_atoms:
            print(f"missing atom: {aid}")
        return 1

    save_atoms(ATOMS_JSONL, next_atoms)
    changed, total = atoms_fileformat.sync_per_file_atoms(next_atoms, ATOMS_DIR)
    print(f"restored={restored} per_file_changed={changed} per_file_total={total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
