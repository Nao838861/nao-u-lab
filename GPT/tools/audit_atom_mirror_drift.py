#!/usr/bin/env python3
"""Audit and explicitly repair atom mirror drift.

Phase C keeps `memory/atoms.jsonl` as the canonical read source while
per-file `.md` atoms run as a mirror. This tool detects ids that differ across:

- memory/atoms/*.md
- memory/atoms/index.jsonl
- memory/atoms.jsonl

`--repair` is intentionally narrow: append per-file-only atoms to atoms.jsonl
and rebuild index.jsonl from the resulting atom list. It does not delete atoms
or rewrite existing `.md` files.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

from atoms_fileformat import build_index_entry, parse_atom_md, shard_for


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_JSONL = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"
INDEX_PATH = ATOMS_DIR / "index.jsonl"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def atom_id(row: dict[str, Any]) -> str:
    return str(row.get("id") or "")


def comparable_atom(row: dict[str, Any]) -> dict[str, Any]:
    # Frontmatter materializes defaults and normalizes some metadata. A
    # collision here means the user-authored payload for the same id differs.
    # `title` is intentionally excluded: legacy long titles are shortened in
    # the Markdown heading/frontmatter representation. `content` is the
    # authored payload when present; source_ts guards identity otherwise.
    return {key: row.get(key) for key in ("id", "content", "source_ts")}


def content_digest(row: dict[str, Any]) -> str:
    payload = json.dumps(comparable_atom(row), ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def load_per_file_atoms(atoms_dir: Path) -> tuple[list[dict[str, Any]], dict[str, str], list[str]]:
    atoms: list[dict[str, Any]] = []
    paths_by_id: dict[str, str] = {}
    parse_errors: list[str] = []
    for path in sorted(atoms_dir.glob("*/*.md")):
        rel_path = path.relative_to(atoms_dir).as_posix()
        try:
            atom = parse_atom_md(path)
        except Exception as exc:  # noqa: BLE001 - audit should report and continue
            parse_errors.append(f"{rel_path}: {exc}")
            continue
        aid = atom_id(atom)
        if not aid:
            parse_errors.append(f"{rel_path}: missing id")
            continue
        atom["_atom_file_path"] = rel_path
        atoms.append(atom)
        paths_by_id.setdefault(aid, rel_path)
    return atoms, paths_by_id, parse_errors


def load_index_entries(index_path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    entries: list[dict[str, Any]] = []
    errors: list[str] = []
    if not index_path.exists():
        return entries, [f"missing index: {index_path}"]
    with index_path.open("r", encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            if not line.strip():
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError as exc:
                errors.append(f"line {lineno}: {exc}")
    return entries, errors


def rel_path_for(atom: dict[str, Any], paths_by_id: dict[str, str]) -> str:
    aid = atom_id(atom)
    if aid in paths_by_id:
        return paths_by_id[aid]
    return f"{shard_for(atom)}/{aid}.md"


def rebuild_index(atoms: list[dict[str, Any]], paths_by_id: dict[str, str]) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    seen: set[str] = set()
    for atom in atoms:
        aid = atom_id(atom)
        if not aid or aid in seen:
            continue
        seen.add(aid)
        clean_atom = {k: v for k, v in atom.items() if not k.startswith("_")}
        entries.append(build_index_entry(clean_atom, rel_path_for(clean_atom, paths_by_id)))
    return entries


def build_audit(
    jsonl_atoms: Sequence[Mapping[str, Any]] | None = None,
    snapshot_provenance: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Build the mirror report, optionally reusing an already-loaded JSONL view."""
    if jsonl_atoms is None:
        loaded_jsonl_atoms = read_jsonl(ATOMS_JSONL)
    else:
        loaded_jsonl_atoms = [dict(atom) for atom in jsonl_atoms]
    per_file_atoms, paths_by_id, per_file_errors = load_per_file_atoms(ATOMS_DIR)
    index_entries, index_errors = load_index_entries(INDEX_PATH)

    jsonl_ids = {atom_id(row) for row in loaded_jsonl_atoms if atom_id(row)}
    per_file_ids = {atom_id(row) for row in per_file_atoms if atom_id(row)}
    index_ids = {atom_id(row) for row in index_entries if atom_id(row)}

    jsonl_by_id = {atom_id(row): row for row in loaded_jsonl_atoms if atom_id(row)}
    per_file_by_id = {atom_id(row): row for row in per_file_atoms if atom_id(row)}
    content_conflicts = [
        aid for aid in sorted(jsonl_ids & per_file_ids)
        if content_digest(jsonl_by_id[aid]) != content_digest(per_file_by_id[aid])
    ]

    missing_file = []
    for entry in index_entries:
        rel = str(entry.get("path") or "")
        if rel and not (ATOMS_DIR / rel).exists():
            missing_file.append({"id": atom_id(entry), "path": rel})

    report = {
        "counts": {
            "atoms_jsonl": len(jsonl_ids),
            "per_file_md": len(per_file_ids),
            "index_jsonl": len(index_ids),
        },
        "per_file_only": sorted(per_file_ids - jsonl_ids),
        "index_only": sorted(index_ids - per_file_ids - jsonl_ids),
        "jsonl_only": sorted(jsonl_ids - per_file_ids),
        "missing_file": missing_file,
        "parse_errors": per_file_errors,
        "index_errors": index_errors,
        "content_conflicts": content_conflicts,
        "_jsonl_atoms": loaded_jsonl_atoms,
        "_per_file_atoms": per_file_atoms,
        "_paths_by_id": paths_by_id,
    }
    if snapshot_provenance is not None:
        report["snapshot"] = dict(snapshot_provenance)
    return report


def public_report(audit: dict[str, Any], repaired: dict[str, Any] | None = None) -> dict[str, Any]:
    report = {k: v for k, v in audit.items() if not k.startswith("_")}
    if repaired is not None:
        report["repair"] = repaired
    return report


def repair(audit: dict[str, Any]) -> dict[str, Any]:
    blockers = {
        "parse_errors": audit["parse_errors"],
        "index_errors": audit["index_errors"],
        "content_conflicts": audit["content_conflicts"],
        "index_only": audit["index_only"],
        "jsonl_only": audit["jsonl_only"],
        "missing_file": audit["missing_file"],
    }
    active_blockers = {key: value for key, value in blockers.items() if value}
    if active_blockers:
        raise RuntimeError(f"reconcile refused; resolve blockers first: {active_blockers}")
    jsonl_atoms: list[dict[str, Any]] = audit["_jsonl_atoms"]
    per_file_atoms: list[dict[str, Any]] = audit["_per_file_atoms"]
    paths_by_id: dict[str, str] = audit["_paths_by_id"]

    existing_ids = {atom_id(atom) for atom in jsonl_atoms if atom_id(atom)}
    append_ids = set(audit["per_file_only"])
    to_append = []
    for atom in per_file_atoms:
        aid = atom_id(atom)
        if aid in append_ids and aid not in existing_ids:
            to_append.append({k: v for k, v in atom.items() if not k.startswith("_")})

    repaired_atoms = jsonl_atoms + to_append
    write_jsonl(ATOMS_JSONL, repaired_atoms)
    index_entries = rebuild_index(repaired_atoms, paths_by_id)
    write_jsonl(INDEX_PATH, index_entries)

    return {
        "appended_to_atoms_jsonl": [atom_id(atom) for atom in to_append],
        "index_entries_written": len(index_entries),
        "atoms_jsonl_total": len(repaired_atoms),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit atoms.jsonl / per-file .md / index.jsonl drift.")
    parser.add_argument("--repair", "--reconcile", action="store_true", help="after audit, append only safe per-file-only atoms and rebuild index.jsonl")
    args = parser.parse_args()

    audit = build_audit()
    repaired = repair(audit) if args.repair else None
    print(json.dumps(public_report(audit, repaired), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
