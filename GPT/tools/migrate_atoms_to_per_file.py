#!/usr/bin/env python3
"""Migrate atoms.jsonl to per-atom .md files + index.jsonl.

決定: directive_atoms_per_file_migration_20260513.md
出力先: memory/atoms/<YYYY-MM>/<id>.md  +  memory/atoms/index.jsonl

特徴:
- idempotent (複数回実行しても同じ結果)
- atoms.jsonl は読むだけ、書き換えない
- --dry-run default (実行には --execute が必要)
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
ATOMS_JSONL = ROOT / "memory" / "atoms.jsonl"
ATOMS_DIR = ROOT / "memory" / "atoms"
INDEX_PATH = ATOMS_DIR / "index.jsonl"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def read_atoms() -> list[dict[str, Any]]:
    if not ATOMS_JSONL.exists():
        return []
    rows = []
    with ATOMS_JSONL.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def shard_for(atom: dict[str, Any]) -> str:
    """Return YYYY-MM shard from source_ts (JST), or 'unknown'."""
    ts_raw = atom.get("source_ts")
    try:
        ts = float(ts_raw) if ts_raw else 0.0
    except (TypeError, ValueError):
        ts = 0.0
    if ts <= 0:
        return "unknown"
    try:
        return datetime.fromtimestamp(ts).strftime("%Y-%m")
    except (OSError, OverflowError, ValueError):
        return "unknown"


def yaml_inline_scalar(v: Any) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return json.dumps(v)
    if isinstance(v, str):
        return yaml_string(v)
    return json.dumps(v, ensure_ascii=False)


def yaml_string(s: str) -> str:
    """Quote string when needed for YAML 1.2 safety."""
    if s == "":
        return '""'
    risky_chars = set("\n\r\t:#&*?{}[],\"'\\|<>=!%@`")
    if any(c in risky_chars for c in s) or s[0] in "-?:%@`" or s.lower() in {"true", "false", "null", "yes", "no", "~", "on", "off"}:
        escaped = s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
        return f'"{escaped}"'
    # Numeric-looking strings should be quoted
    try:
        float(s)
        return f'"{s}"'
    except ValueError:
        pass
    return s


def yaml_list(items: list[Any]) -> str:
    if not items:
        return "[]"
    parts = [yaml_inline_scalar(x) for x in items]
    return "[" + ", ".join(parts) + "]"


def yaml_dump_frontmatter(d: dict[str, Any]) -> str:
    lines = []
    for k, v in d.items():
        if v is None:
            lines.append(f"{k}: null")
        elif isinstance(v, bool):
            lines.append(f"{k}: {'true' if v else 'false'}")
        elif isinstance(v, (int, float)):
            lines.append(f"{k}: {v}")
        elif isinstance(v, list):
            lines.append(f"{k}: {yaml_list(v)}")
        elif isinstance(v, str):
            lines.append(f"{k}: {yaml_string(v)}")
        else:
            lines.append(f"{k}: {json.dumps(v, ensure_ascii=False)}")
    return "\n".join(lines)


# Fields we surface in frontmatter (order matters for readability).
FRONTMATTER_KEYS = [
    "id",
    "title",
    "source",
    "source_ts",
    "author",
    "channel",
    "user",
    "tags",
    "kind",
    "score",
    "status",
    "group_id",
    "canonical_id",
    "supersedes",
    "superseded_by",
    "duplicate_reason",
    "ingested_via",
    "ingested_at",
    "datetime",
]


def build_atom_md(atom: dict[str, Any]) -> str:
    fm = {}
    for key in FRONTMATTER_KEYS:
        if key in atom:
            fm[key] = atom[key]
    # Default missing status to active (post-Phase 4c migration semantics)
    if "status" not in fm:
        fm["status"] = "active"
    fm_text = yaml_dump_frontmatter(fm)

    title = str(atom.get("title", atom.get("id", "")))
    body_parts: list[str] = [f"# {title}"]

    trigger = str(atom.get("trigger", "")).strip()
    if trigger:
        body_parts.append("## Use when\n\n" + trigger)

    excerpt = str(atom.get("excerpt", "")).strip()
    if excerpt:
        body_parts.append("## Excerpt\n\n" + excerpt)

    links = atom.get("links")
    if isinstance(links, list) and links:
        link_lines = []
        for link in links:
            link_str = str(link)
            link_lines.append(f"- {link_str}")
        body_parts.append("## Links\n\n" + "\n".join(link_lines))

    md = f"---\n{fm_text}\n---\n\n" + "\n\n".join(body_parts) + "\n"
    return md


def build_index_entry(atom: dict[str, Any], rel_path: str) -> dict[str, Any]:
    return {
        "id": atom.get("id"),
        "path": rel_path,
        "title": atom.get("title"),
        "tags": atom.get("tags", []),
        "source_ts": atom.get("source_ts"),
        "status": atom.get("status", "active"),
        "canonical_id": atom.get("canonical_id"),
        "score": atom.get("score", 0),
    }


def migrate(args: argparse.Namespace) -> int:
    atoms = read_atoms()
    if not atoms:
        print(f"no atoms found at {ATOMS_JSONL}")
        return 1

    write_count = 0
    skip_count = 0
    err_count = 0
    index: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for atom in atoms:
        atom_id = atom.get("id")
        if not atom_id:
            err_count += 1
            continue
        if atom_id in seen_ids:
            # Duplicate id within atoms.jsonl: keep first only
            continue
        seen_ids.add(atom_id)

        shard = shard_for(atom)
        shard_dir = ATOMS_DIR / shard
        target = shard_dir / f"{atom_id}.md"
        rel_path = f"{shard}/{atom_id}.md"

        content = build_atom_md(atom)

        if args.execute:
            shard_dir.mkdir(parents=True, exist_ok=True)
            if target.exists() and not args.force:
                # idempotent: skip if existing content matches new content
                existing = target.read_text(encoding="utf-8")
                if existing == content:
                    skip_count += 1
                else:
                    target.write_text(content, encoding="utf-8", newline="\n")
                    write_count += 1
            else:
                target.write_text(content, encoding="utf-8", newline="\n")
                write_count += 1
        else:
            write_count += 1

        index.append(build_index_entry(atom, rel_path))

    # Write index.jsonl
    if args.execute:
        ATOMS_DIR.mkdir(parents=True, exist_ok=True)
        with INDEX_PATH.open("w", encoding="utf-8", newline="\n") as f:
            for entry in index:
                f.write(json.dumps(entry, ensure_ascii=False, sort_keys=True) + "\n")

    report = {
        "atoms_jsonl_path": str(ATOMS_JSONL),
        "atoms_in_jsonl": len(atoms),
        "unique_ids": len(seen_ids),
        "would_write": write_count if not args.execute else None,
        "wrote": write_count if args.execute else None,
        "skipped_no_change": skip_count if args.execute else None,
        "errors_no_id": err_count,
        "index_entries": len(index),
        "index_path": str(INDEX_PATH),
        "executed": args.execute,
        "force_overwrite": args.force,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Migrate atoms.jsonl to per-atom .md files + index.jsonl.")
    parser.add_argument("--execute", action="store_true", help="actually write files (default: dry-run)")
    parser.add_argument("--force", action="store_true", help="overwrite existing .md files even if content matches")
    args = parser.parse_args()
    return migrate(args)


if __name__ == "__main__":
    raise SystemExit(main())
