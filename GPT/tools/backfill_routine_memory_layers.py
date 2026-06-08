#!/usr/bin/env python3
"""Backfill routine memory layers onto existing atoms.

This is the Phase 4c implementation for generic operational prefixes. It tags
high-volume routine atoms so default recall can skip them, while exact id and
--include-operational paths can still read them.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any

import memory_ingest
from atom_quality import routine_layer_report
from atoms_fileformat import sync_per_file_atoms


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
BACKFILL_LOG_PATH = MEMORY_DIR / "atom_routine_layer_backfill.jsonl"
TARGET_LAYERS = {"operational_log", "lifecycle_repost"}
TOOL_OWNED_REASONS = {
    "operational_log_generic_prefix",
    "lifecycle_repost_generic_prefix",
}


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


def owned_routine_metadata(atom: dict[str, Any]) -> bool:
    if atom.get("memory_layer") not in TARGET_LAYERS:
        return False
    reasons = {item for item in str(atom.get("quality_reason") or "").split(",") if item}
    return bool(reasons) and reasons <= TOOL_OWNED_REASONS


def backfill(atoms: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    now = datetime.now().isoformat(timespec="seconds")
    changed: list[dict[str, Any]] = []
    updated: list[dict[str, Any]] = []
    for atom in atoms:
        report = routine_layer_report(atom)
        before = (atom.get("quality"), atom.get("memory_layer"), atom.get("quality_reason"))
        if report["memory_layer"] in TARGET_LAYERS:
            atom["quality"] = report["quality"]
            atom["memory_layer"] = report["memory_layer"]
            atom["quality_reason"] = ",".join(report["reasons"])
        elif owned_routine_metadata(atom):
            atom.pop("quality", None)
            atom.pop("memory_layer", None)
            atom.pop("quality_reason", None)
        after = (atom.get("quality"), atom.get("memory_layer"), atom.get("quality_reason"))
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
    parser = argparse.ArgumentParser(description="Tag routine operational memory atoms.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    atoms = memory_ingest.read_jsonl(memory_ingest.ATOMS_PATH)
    updated, changed = backfill(atoms)
    summary: dict[str, Any] = {
        "atoms": len(atoms),
        "changed": len(changed),
        "dry_run": args.dry_run,
        "layers": {},
    }
    for row in changed:
        layer = str(row.get("memory_layer") or "cleared")
        summary["layers"][layer] = int(summary["layers"].get(layer, 0)) + 1
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if args.dry_run or not changed:
        return 0

    write_jsonl(memory_ingest.ATOMS_PATH, updated)
    append_jsonl(BACKFILL_LOG_PATH, changed)
    sync_per_file_atoms(updated, memory_ingest.ATOMS_DIR)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
