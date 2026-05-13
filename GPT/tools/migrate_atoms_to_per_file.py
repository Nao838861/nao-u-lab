#!/usr/bin/env python3
"""Migrate atoms.jsonl to per-atom .md files + index.jsonl.

決定: directive_atoms_per_file_migration_20260513.md
出力先: memory/atoms/<YYYY-MM>/<id>.md  +  memory/atoms/index.jsonl

特徴:
- idempotent (複数回実行しても同じ結果)
- atoms.jsonl は読むだけ、書き換えない
- --dry-run default (実行には --execute が必要)

実体は tools/atoms_fileformat.py の `sync_per_file_atoms` に委譲。
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from atoms_fileformat import build_atom_md, build_index_entry, shard_for, sync_per_file_atoms


ROOT = Path(__file__).resolve().parents[1]
ATOMS_JSONL = ROOT / "memory" / "atoms.jsonl"
ATOMS_DIR = ROOT / "memory" / "atoms"
INDEX_PATH = ATOMS_DIR / "index.jsonl"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def read_atoms() -> list[dict[str, Any]]:
    if not ATOMS_JSONL.exists():
        return []
    rows: list[dict[str, Any]] = []
    with ATOMS_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def migrate(args: argparse.Namespace) -> int:
    atoms = read_atoms()
    if not atoms:
        print(f"no atoms found at {ATOMS_JSONL}")
        return 1

    seen_ids: set[str] = set()
    unique: list[dict[str, Any]] = []
    err_count = 0
    for atom in atoms:
        aid = atom.get("id")
        if not aid:
            err_count += 1
            continue
        if aid in seen_ids:
            continue
        seen_ids.add(aid)
        unique.append(atom)

    if args.execute:
        new_writes, total = sync_per_file_atoms(unique, ATOMS_DIR)
    else:
        # Dry-run: count how many would be new
        new_writes = 0
        total = 0
        for atom in unique:
            shard = shard_for(atom)
            target = ATOMS_DIR / shard / f"{atom['id']}.md"
            content = build_atom_md(atom)
            if not target.exists() or target.read_text(encoding="utf-8") != content:
                new_writes += 1
            total += 1

    report = {
        "atoms_jsonl_path": str(ATOMS_JSONL),
        "atoms_in_jsonl": len(atoms),
        "unique_ids": len(seen_ids),
        "would_write_or_change": new_writes if not args.execute else None,
        "wrote_or_changed": new_writes if args.execute else None,
        "errors_no_id": err_count,
        "total_md_atoms": total,
        "index_path": str(INDEX_PATH),
        "executed": args.execute,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Migrate atoms.jsonl to per-atom .md + index.jsonl.")
    parser.add_argument("--execute", action="store_true", help="actually write files (default: dry-run)")
    args = parser.parse_args()
    return migrate(args)


if __name__ == "__main__":
    raise SystemExit(main())
