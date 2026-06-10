#!/usr/bin/env python3
"""Build a derived index for same-content memory atom groups.

The index is intentionally non-destructive: it records duplicate bodies so
recall/health tools can inspect them without changing atom rows or ingest
schema.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

import memory_lifecycle
from atoms_fileformat import CANONICAL_OVERLAY_FILENAME, load_atoms_from_per_file


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"
OUTPUT_PATH = ATOMS_DIR / "duplicate_groups.jsonl"
OVERLAY_PATH = ATOMS_DIR / CANONICAL_OVERLAY_FILENAME


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


def parse_source_ts(atom: dict[str, Any]) -> float:
    try:
        return float(atom.get("source_ts") or 0)
    except (TypeError, ValueError):
        return 0.0


def atom_id(atom: dict[str, Any]) -> str:
    return str(atom.get("id") or "")


def canonical_atom(group: list[dict[str, Any]]) -> dict[str, Any]:
    """Earliest source_ts is the provenance anchor for a duplicate body."""
    return sorted(group, key=lambda atom: (parse_source_ts(atom), atom_id(atom)))[0]


def preferred_atom(group: list[dict[str, Any]]) -> dict[str, Any]:
    """Latest source_ts is preferred for display/corrected repost inspection."""
    return sorted(group, key=lambda atom: (parse_source_ts(atom), int(atom.get("score", 0)), atom_id(atom)), reverse=True)[0]


def build_groups(atoms: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atoms:
        content_hash = str(atom.get("normalized_content_hash") or memory_lifecycle.normalized_content_hash(atom) or "")
        if content_hash:
            grouped[content_hash].append(atom)

    generated_at = datetime.now().isoformat(timespec="seconds")
    rows: list[dict[str, Any]] = []
    for content_hash, group in grouped.items():
        if len(group) < 2:
            continue
        canonical = canonical_atom(group)
        preferred = preferred_atom(group)
        sorted_group = sorted(group, key=lambda atom: (parse_source_ts(atom), atom_id(atom)))
        source_ts_values = [parse_source_ts(atom) for atom in group if parse_source_ts(atom) > 0]
        all_ids = [atom_id(atom) for atom in sorted_group if atom_id(atom)]
        canonical_id = atom_id(canonical)
        rows.append(
            {
                "content_hash": content_hash,
                "canonical_id": canonical_id,
                "preferred_id": atom_id(preferred),
                "duplicate_ids": [item for item in all_ids if item != canonical_id],
                "count": len(group),
                "source_ts_min": min(source_ts_values) if source_ts_values else None,
                "source_ts_max": max(source_ts_values) if source_ts_values else None,
                "sample_title": canonical.get("title") or preferred.get("title") or "",
                "generated_at": generated_at,
            }
        )

    rows.sort(key=lambda row: (-int(row["count"]), float(row["source_ts_min"] or 0), row["content_hash"]))
    return rows


def build_overlay_rows(group_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for group in group_rows:
        content_hash = str(group.get("content_hash") or "")
        canonical_id = str(group.get("canonical_id") or "")
        duplicate_ids = [str(item) for item in group.get("duplicate_ids", []) if item]
        if not content_hash or not canonical_id or not duplicate_ids:
            continue
        rows.append(
            {
                "group_id": f"content:{content_hash}",
                "canonical_id": canonical_id,
                "preferred_id": group.get("preferred_id"),
                "duplicate_ids": duplicate_ids,
                "member_ids": [canonical_id, *duplicate_ids],
                "reason": "normalized_content_hash",
                "evidence_hash": content_hash,
                "count": int(group.get("count") or (len(duplicate_ids) + 1)),
                "sample_title": group.get("sample_title") or "",
                "generated_at": group.get("generated_at"),
            }
        )
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")


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
    parser = argparse.ArgumentParser(description="Build memory/atoms/duplicate_groups.jsonl.")
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--overlay-output", type=Path, default=OVERLAY_PATH)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    args = parser.parse_args()

    rows = build_groups(load_atoms())
    overlay_rows = build_overlay_rows(rows)
    if args.check:
        expected = render_jsonl(rows, generated_at=read_generated_at(args.output))
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != expected:
            print(f"stale duplicate group index: {args.output} expected_groups={len(rows)}")
            return 1
        overlay_expected = render_jsonl(overlay_rows, generated_at=read_generated_at(args.overlay_output))
        overlay_current = args.overlay_output.read_text(encoding="utf-8") if args.overlay_output.exists() else ""
        if overlay_current != overlay_expected:
            print(f"stale canonical overlay index: {args.overlay_output} expected_groups={len(overlay_rows)}")
            return 1
        print(f"duplicate group index ok: groups={len(rows)} overlay_groups={len(overlay_rows)}")
        return 0

    write_jsonl(args.output, rows)
    write_jsonl(args.overlay_output, overlay_rows)
    print(f"wrote {args.output} groups={len(rows)}")
    print(f"wrote {args.overlay_output} groups={len(overlay_rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
