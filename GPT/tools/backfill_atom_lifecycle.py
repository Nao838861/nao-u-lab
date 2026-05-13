#!/usr/bin/env python3
"""Backfill lifecycle metadata for known repeated atom title clusters."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
ATOMS_PATH = ROOT / "memory" / "atoms.jsonl"

TARGET_TITLES = {
    "[Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版",
    "[Codex external research] 日記前検索: 現在の目的に関係する外部情報",
    "議論に回したい論点: 新規Slack/記憶atomから拾ったコアミッション関連",
}


def load_atoms() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with ATOMS_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def write_atoms(atoms: list[dict[str, Any]]) -> None:
    with ATOMS_PATH.open("w", encoding="utf-8", newline="\n") as f:
        for atom in atoms:
            f.write(json.dumps(atom, ensure_ascii=False, sort_keys=True) + "\n")


def group_name(title: str) -> str:
    digest = hashlib.sha1(title.encode("utf-8")).hexdigest()[:10]
    return f"title-dupe-{digest}"


def choose_canonical(group: list[dict[str, Any]]) -> dict[str, Any]:
    return sorted(
        group,
        key=lambda a: (int(a.get("score", 0)), str(a.get("datetime", "")), str(a.get("id", ""))),
        reverse=True,
    )[0]


def backfill(atoms: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    by_title: dict[str, list[dict[str, Any]]] = {}
    for atom in atoms:
        title = str(atom.get("title", ""))
        if title in TARGET_TITLES:
            by_title.setdefault(title, []).append(atom)

    changed = 0
    groups = []
    for title, group in sorted(by_title.items()):
        if len(group) < 2:
            continue
        gid = group_name(title)
        canonical = choose_canonical(group)
        canonical_id = str(canonical["id"])
        member_ids = [str(atom["id"]) for atom in group]
        for atom in group:
            atom["group_id"] = gid
            atom["canonical_id"] = canonical_id
            atom["duplicate_reason"] = "repeated_title_phase4a_evidence"
            if atom is canonical:
                atom["status"] = "active"
                atom["supersedes"] = [id_ for id_ in member_ids if id_ != canonical_id]
            else:
                atom["status"] = "superseded"
                atom["superseded_by"] = canonical_id
            changed += 1
        groups.append({"title": title, "count": len(group), "group_id": gid, "canonical_id": canonical_id})
    return atoms, {"changed_atoms": changed, "groups": groups}


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill lifecycle metadata for repeated-title atom clusters.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    atoms = load_atoms()
    atoms, summary = backfill(atoms)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if not args.dry_run:
        write_atoms(atoms)


if __name__ == "__main__":
    main()
