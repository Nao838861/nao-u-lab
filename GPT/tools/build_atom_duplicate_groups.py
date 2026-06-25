#!/usr/bin/env python3
"""Build a derived index for duplicate memory atom clusters.

The index is intentionally non-destructive: it records duplicate bodies so
recall/health tools can inspect them without changing atom rows or ingest
schema.
"""
from __future__ import annotations

import argparse
import hashlib
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
OUTPUT_PATH = ATOMS_DIR / "duplicate_clusters.jsonl"
LEGACY_OUTPUT_PATH = ATOMS_DIR / "duplicate_groups.jsonl"
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


def parse_datetime_ts(value: Any) -> float:
    text = str(value or "").strip()
    if not text:
        return 0.0
    try:
        return float(text)
    except ValueError:
        pass
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return 0.0


def canonical_rank(atom: dict[str, Any]) -> tuple[int, int, int, float, str]:
    """Prefer active shared-read rows with richer evidence, then oldest id."""
    status = str(atom.get("status") or "active").lower()
    quality = str(atom.get("quality") or "").lower()
    active_rank = 0 if status == "active" and quality != "quarantine" else 1
    source_text = " ".join(
        str(atom.get(field) or "")
        for field in ("source", "channel", "id")
    ).lower()
    links = atom.get("links") if isinstance(atom.get("links"), list) else []
    has_permalink = any("slack.com/archives/" in str(link).lower() for link in links)
    shared_rank = 0 if has_permalink or "shared" in source_text or atom_id(atom).startswith("sr-") else 1
    richness = len(str(atom.get("title") or "")) + len(str(atom.get("excerpt") or "")) + len(str(atom.get("trigger") or ""))
    source_ts = parse_source_ts(atom)
    if source_ts <= 0:
        source_ts = float("inf")
    return (
        active_rank,
        shared_rank,
        -richness,
        source_ts,
        atom_id(atom),
    )


def canonical_atom(group: list[dict[str, Any]]) -> dict[str, Any]:
    return sorted(group, key=canonical_rank)[0]


def preferred_atom(group: list[dict[str, Any]]) -> dict[str, Any]:
    return canonical_atom(group)


def normalize_text(value: Any) -> str:
    return " ".join(str(value or "").lower().split())


def title_trigger_excerpt_key(atom: dict[str, Any]) -> str:
    parts = [
        normalize_text(atom.get("title")),
        normalize_text(atom.get("trigger")),
        normalize_text(atom.get("excerpt")),
    ]
    if not any(parts):
        return ""
    return "\n".join(parts)


def title_excerpt_key(atom: dict[str, Any]) -> str:
    parts = [
        normalize_text(atom.get("title")),
        normalize_text(atom.get("excerpt")),
    ]
    if not any(parts):
        return ""
    key = "\n".join(parts)
    if len(key) < 120:
        return ""
    return key


def short_hash(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16]


def build_groups(atoms: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atoms:
        content_hash = str(atom.get("normalized_content_hash") or memory_lifecycle.normalized_content_hash(atom) or "")
        if content_hash:
            grouped[content_hash].append(atom)

    generated_at = datetime.now().isoformat(timespec="seconds")
    rows: list[dict[str, Any]] = []
    already_grouped_ids: set[str] = set()
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
                "duplicate_key": content_hash,
                "normalized_content_hash": content_hash,
                "hash_basis": "normalized_content_hash",
                "reason": "normalized_content_hash",
                "canonical_id": canonical_id,
                "preferred_id": atom_id(preferred),
                "duplicate_ids": [item for item in all_ids if item != canonical_id],
                "count": len(group),
                "source_ts_min": min(source_ts_values) if source_ts_values else None,
                "source_ts_max": max(source_ts_values) if source_ts_values else None,
                "source": "tools/build_atom_duplicate_groups.py",
                "updated_at": generated_at,
                "sample_title": canonical.get("title") or preferred.get("title") or "",
                "generated_at": generated_at,
            }
        )
        already_grouped_ids.update(all_ids)

    secondary_grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    title_excerpt_grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atoms:
        aid = atom_id(atom)
        if aid in already_grouped_ids:
            continue
        key = title_excerpt_key(atom)
        if key:
            title_excerpt_grouped[key].append(atom)

    secondary_grouped_ids: set[str] = set()
    for key, group in title_excerpt_grouped.items():
        if len(group) < 2:
            continue
        secondary_grouped[("title_excerpt_exact", key)] = group
        secondary_grouped_ids.update(atom_id(atom) for atom in group if atom_id(atom))

    for atom in atoms:
        aid = atom_id(atom)
        if aid in already_grouped_ids or aid in secondary_grouped_ids:
            continue
        key = title_trigger_excerpt_key(atom)
        if key:
            secondary_grouped[("title_trigger_excerpt_exact", key)].append(atom)

    for (reason, duplicate_key), group in secondary_grouped.items():
        if len(group) < 2:
            continue
        canonical = canonical_atom(group)
        preferred = preferred_atom(group)
        sorted_group = sorted(group, key=lambda atom: (parse_source_ts(atom), atom_id(atom)))
        source_ts_values = [parse_source_ts(atom) for atom in group if parse_source_ts(atom) > 0]
        all_ids = [atom_id(atom) for atom in sorted_group if atom_id(atom)]
        canonical_id = atom_id(canonical)
        key_hash = short_hash(duplicate_key)
        rows.append(
            {
                "content_hash": key_hash,
                "duplicate_key": key_hash,
                "normalized_content_hash": key_hash,
                "hash_basis": reason,
                "reason": reason,
                "canonical_id": canonical_id,
                "preferred_id": atom_id(preferred),
                "duplicate_ids": [item for item in all_ids if item != canonical_id],
                "count": len(group),
                "source_ts_min": min(source_ts_values) if source_ts_values else None,
                "source_ts_max": max(source_ts_values) if source_ts_values else None,
                "source": "tools/build_atom_duplicate_groups.py",
                "updated_at": generated_at,
                "sample_title": canonical.get("title") or preferred.get("title") or "",
                "generated_at": generated_at,
            }
        )

    rows.sort(key=lambda row: (str(row.get("reason") or ""), -int(row["count"]), float(row["source_ts_min"] or 0), row["content_hash"]))
    return rows


def build_overlay_rows(group_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for group in group_rows:
        duplicate_key = str(group.get("duplicate_key") or group.get("content_hash") or "")
        canonical_id = str(group.get("canonical_id") or "")
        duplicate_ids = [str(item) for item in group.get("duplicate_ids", []) if item]
        reason = str(group.get("reason") or "normalized_content_hash")
        if not duplicate_key or not canonical_id or not duplicate_ids:
            continue
        rows.append(
            {
                "group_id": f"{reason}:{duplicate_key}",
                "normalized_content_hash": duplicate_key,
                "canonical_id": canonical_id,
                "preferred_id": group.get("preferred_id"),
                "duplicate_ids": duplicate_ids,
                "member_ids": [canonical_id, *duplicate_ids],
                "reason": reason,
                "hash_basis": group.get("hash_basis") or reason,
                "evidence_hash": duplicate_key,
                "count": int(group.get("count") or (len(duplicate_ids) + 1)),
                "source": group.get("source") or "tools/build_atom_duplicate_groups.py",
                "updated_at": group.get("updated_at") or group.get("generated_at"),
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
            if "updated_at" in rendered:
                rendered["updated_at"] = generated_at
        rendered_rows.append(json.dumps(rendered, ensure_ascii=False, separators=(",", ":")) + "\n")
    return "".join(rendered_rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build memory/atoms/duplicate_clusters.jsonl.")
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--legacy-output", type=Path, default=LEGACY_OUTPUT_PATH)
    parser.add_argument("--no-legacy-output", action="store_true")
    parser.add_argument("--overlay-output", type=Path, default=OVERLAY_PATH)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    args = parser.parse_args()

    rows = build_groups(load_atoms())
    overlay_rows = build_overlay_rows(rows)
    if args.check:
        expected = render_jsonl(rows, generated_at=read_generated_at(args.output))
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != expected:
            print(f"stale duplicate cluster index: {args.output} expected_clusters={len(rows)}")
            return 1
        if not args.no_legacy_output:
            legacy_expected = render_jsonl(rows, generated_at=read_generated_at(args.legacy_output))
            legacy_current = args.legacy_output.read_text(encoding="utf-8") if args.legacy_output.exists() else ""
            if legacy_current != legacy_expected:
                print(f"stale legacy duplicate group index: {args.legacy_output} expected_clusters={len(rows)}")
                return 1
        overlay_expected = render_jsonl(overlay_rows, generated_at=read_generated_at(args.overlay_output))
        overlay_current = args.overlay_output.read_text(encoding="utf-8") if args.overlay_output.exists() else ""
        if overlay_current != overlay_expected:
            print(f"stale canonical overlay index: {args.overlay_output} expected_groups={len(overlay_rows)}")
            return 1
        print(f"duplicate cluster index ok: clusters={len(rows)} overlay_groups={len(overlay_rows)}")
        return 0

    write_jsonl(args.output, rows)
    if not args.no_legacy_output:
        write_jsonl(args.legacy_output, rows)
    write_jsonl(args.overlay_output, overlay_rows)
    print(f"wrote {args.output} clusters={len(rows)}")
    if not args.no_legacy_output:
        print(f"wrote {args.legacy_output} clusters={len(rows)}")
    print(f"wrote {args.overlay_output} groups={len(overlay_rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
