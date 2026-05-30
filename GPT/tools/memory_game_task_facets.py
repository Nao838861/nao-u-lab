#!/usr/bin/env python3
"""Build derived game-task facets for memory/MEMORY.md.

The facet index is a generated view. It must not mutate atom tags or frontmatter.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class Facet:
    name: str
    keywords: tuple[str, ...]


FACETS: tuple[Facet, ...] = (
    Facet(
        "enemy-pattern",
        (
            "enemy-pattern",
            "stage-design",
            "shmup",
            "shot-log",
            "shot_log",
            "graze-log",
            "graze_log",
            "bullet hell",
            "spawn",
            "path",
            "fire_rule",
            "wave",
            "敵",
            "弾幕",
            "編隊",
            "出現",
        ),
    ),
    Facet(
        "px-evaluation",
        (
            "px",
            "player experience",
            "playtesting",
            "playtest",
            "telemetry",
            "survey",
            "biometrics",
            "enjoyment",
            "appraisal",
            "emotion",
            "プレイヤー体験",
        ),
    ),
    Facet(
        "impact-feel",
        (
            "impact feel",
            "hit stop",
            "hitstop",
            "screen shake",
            "juice",
            "action-game",
            "affordance",
            "手触り",
            "打撃感",
            "操作感",
        ),
    ),
    Facet(
        "ui-agent",
        (
            "ui-agent",
            "gui-agent",
            "gui agent",
            "gameuiagent",
            "visual agent",
            "interface",
            "screen understanding",
        ),
    ),
    Facet(
        "headless-eval",
        (
            "headless",
            "bad-policy",
            "bad policy",
            "bot policy",
            "self-play",
            "route",
            "regression",
        ),
    ),
    Facet(
        "memory-routing",
        (
            "memory-routing",
            "memory_redesign",
            "routing",
            "skillreducer",
            "tag entry",
            "game task",
            "lens",
        ),
    ),
    Facet(
        "game-rights-feedback",
        (
            "game-rights",
            "nao-u-feedback",
            "supervised-feedback",
            "teacher-source",
            "cross_review",
        ),
    ),
)


def atom_search_text(atom: dict[str, Any]) -> str:
    fields = [
        atom.get("id", ""),
        atom.get("title", ""),
        atom.get("trigger", ""),
        atom.get("excerpt", ""),
        " ".join(str(tag) for tag in atom.get("tags", [])),
        " ".join(str(kind) for kind in atom.get("kind", [])),
        " ".join(str(link) for link in atom.get("links", [])),
    ]
    return "\n".join(str(field) for field in fields if field).lower()


def facet_score(atom: dict[str, Any], facet: Facet) -> int:
    haystack = atom_search_text(atom)
    tags = {str(tag).lower() for tag in atom.get("tags", [])}
    score = 0
    for keyword in facet.keywords:
        needle = keyword.lower()
        if needle in tags:
            score += 5
        elif re.search(re.escape(needle), haystack):
            score += 2
    return score


def build_game_task_entry_points(
    atoms: list[dict[str, Any]],
    *,
    examples_per_facet: int = 3,
) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for facet in FACETS:
        scored: list[tuple[int, int, str, dict[str, Any]]] = []
        for atom in atoms:
            score = facet_score(atom, facet)
            if score <= 0:
                continue
            scored.append(
                (
                    score,
                    int(atom.get("score") or 0),
                    str(atom.get("datetime") or atom.get("source_ts") or ""),
                    atom,
                )
            )
        scored.sort(key=lambda row: (-row[0], -row[1], row[2]), reverse=False)
        examples = [row[3] for row in scored[:examples_per_facet]]
        entries.append(
            {
                "name": facet.name,
                "count": len(scored),
                "examples": [str(atom.get("id")) for atom in examples if atom.get("id")],
            }
        )
    return entries
