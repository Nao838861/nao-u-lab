#!/usr/bin/env python3
"""Backfill operational_ack metadata onto existing memory atoms.

This is intentionally narrow and idempotent. It does not delete atoms; it tags
low-value Slack receipt records so normal recall can ignore them while audit
commands can still include them.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any

import memory_ingest
from atom_quality import apply_memory_layer, operational_ack_report
from atoms_fileformat import sync_per_file_atoms


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
BACKFILL_LOG_PATH = MEMORY_DIR / "atom_operational_ack_quarantine.jsonl"


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def append_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def backfill(atoms: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    now = datetime.now().isoformat(timespec="seconds")
    changed: list[dict[str, Any]] = []
    updated: list[dict[str, Any]] = []
    for atom in atoms:
        report = operational_ack_report(atom)
        if not report["is_operational_ack"]:
            updated.append(atom)
            continue
        before = (
            atom.get("quality"),
            atom.get("memory_layer"),
            atom.get("quality_reason"),
        )
        apply_memory_layer(atom)
        after = (
            atom.get("quality"),
            atom.get("memory_layer"),
            atom.get("quality_reason"),
        )
        if before != after:
            changed.append(
                {
                    "backfilled_at": now,
                    "id": atom.get("id"),
                    "source": atom.get("source"),
                    "source_ts": atom.get("source_ts"),
                    "title": atom.get("title"),
                    "quality": atom.get("quality"),
                    "memory_layer": atom.get("memory_layer"),
                    "reason": atom.get("quality_reason"),
                }
            )
        updated.append(atom)
    return updated, changed


def main() -> int:
    parser = argparse.ArgumentParser(description="Tag existing operational ack atoms.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    atoms = memory_ingest.read_jsonl(memory_ingest.ATOMS_PATH)
    updated, changed = backfill(atoms)
    result: dict[str, Any] = {
        "atoms": len(atoms),
        "changed": len(changed),
        "changed_ids": [row["id"] for row in changed],
        "dry_run": args.dry_run,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if args.dry_run or not changed:
        return 0

    write_jsonl(memory_ingest.ATOMS_PATH, updated)
    append_jsonl(BACKFILL_LOG_PATH, changed)
    sync_per_file_atoms(updated, memory_ingest.ATOMS_DIR)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
