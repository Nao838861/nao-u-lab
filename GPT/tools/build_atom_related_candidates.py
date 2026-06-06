#!/usr/bin/env python3
"""Build memory/atoms/related_candidates.jsonl."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from atom_related_candidates import (
    RELATED_CANDIDATES_PATH,
    build_related_candidate_rows,
    count_targets,
    summarize_rows,
    write_jsonl,
)
from atoms_fileformat import load_atoms_from_per_file


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_atoms() -> list[dict[str, Any]]:
    if ATOMS_PATH.exists():
        rows: list[dict[str, Any]] = []
        with ATOMS_PATH.open("r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    rows.append(json.loads(line))
        return rows
    return load_atoms_from_per_file(ATOMS_DIR)


def read_generated_at(path: Path) -> str | None:
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                value = json.loads(line).get("generated_at")
            except json.JSONDecodeError:
                return None
            return str(value) if value else None
    return None


def render_jsonl(rows: list[dict[str, Any]], generated_at: str | None = None) -> str:
    rendered_rows = []
    for row in rows:
        rendered = dict(row)
        if generated_at is not None:
            rendered["generated_at"] = generated_at
        rendered_rows.append(json.dumps(rendered, ensure_ascii=False, separators=(",", ":")) + "\n")
    return "".join(rendered_rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build memory/atoms/related_candidates.jsonl.")
    parser.add_argument("--output", type=Path, default=RELATED_CANDIDATES_PATH)
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--min-score", type=float, default=4.0)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    args = parser.parse_args()

    atoms = load_atoms()
    rows = build_related_candidate_rows(atoms, limit=args.limit, min_score=args.min_score)
    target_count = count_targets(atoms)
    summary = summarize_rows(rows, target_count)

    if args.check:
        expected = render_jsonl(rows, generated_at=read_generated_at(args.output))
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != expected:
            print(f"stale related candidate index: {args.output} expected_rows={len(rows)}")
            return 1
        print(f"related candidate index ok: {json.dumps(summary, ensure_ascii=False, sort_keys=True)}")
        return 0

    write_jsonl(args.output, rows)
    print(f"wrote {len(rows)} related candidate rows to {args.output}")
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
