#!/usr/bin/env python3
"""Validate the human-facing MEMORY.md entry sections.

Checks are intentionally small and deterministic:
- High Signal / Recent / Game Task Entry Points / Tag Entry Points atom ids exist in per-file atoms.
- High Signal / Recent ids are not duplicated.
- Referenced per-atom markdown files exist through memory/atoms/index.jsonl.
- Entry sections do not contain common mojibake residue.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from atoms_fileformat import load_atoms_from_per_file


ROOT = Path(__file__).resolve().parents[1]
MEMORY_PATH = ROOT / "memory" / "MEMORY.md"
ATOMS_DIR = ROOT / "memory" / "atoms"
INDEX_PATH = ATOMS_DIR / "index.jsonl"

SECTION_NAMES = ["High Signal", "Recent", "Game Task Entry Points", "Tag Entry Points"]
MOJIBAKE_RE = re.compile(r"(縺|繧|譁|螳|蟆|邵|荳|逕|蜿|隱|髢|鬆|豁|譛|驕|雜)")
ATOM_ID_RE = re.compile(r"`([^`]+)`")


def load_index_paths() -> dict[str, Path]:
    paths: dict[str, Path] = {}
    if not INDEX_PATH.exists():
        return paths
    with INDEX_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            row = json.loads(line)
            atom_id = row.get("id")
            rel_path = row.get("path")
            if atom_id and rel_path:
                paths[str(atom_id)] = ATOMS_DIR / str(rel_path)
    return paths


def extract_sections(text: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    current: str | None = None
    for line in text.splitlines():
        if line.startswith("## "):
            name = line[3:].strip()
            current = name if name in SECTION_NAMES else None
            if current:
                sections[current] = []
            continue
        if current:
            sections[current].append(line)
    return {name: "\n".join(lines).strip() for name, lines in sections.items()}


def extract_entry_ids(section_text: str) -> list[str]:
    ids: list[str] = []
    for line in section_text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("- "):
            continue
        match = ATOM_ID_RE.search(stripped)
        if match:
            ids.append(match.group(1))
    return ids


def extract_tag_example_ids(section_text: str) -> list[str]:
    ids: list[str] = []
    for line in section_text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("- `"):
            continue
        _, _, tail = stripped.partition(":")
        if not tail:
            continue
        ids.extend(part.strip() for part in tail.split("/") if part.strip())
    return ids


def validate(memory_path: Path = MEMORY_PATH) -> list[str]:
    errors: list[str] = []
    if not memory_path.exists():
        return [f"missing file: {memory_path}"]

    text = memory_path.read_text(encoding="utf-8")
    sections = extract_sections(text)
    for name in SECTION_NAMES:
        if name not in sections:
            errors.append(f"missing section: {name}")

    atoms = load_atoms_from_per_file(ATOMS_DIR)
    atoms_by_id: dict[str, dict[str, Any]] = {str(atom.get("id")): atom for atom in atoms if atom.get("id")}
    index_paths = load_index_paths()

    for name in ("High Signal", "Recent"):
        section = sections.get(name, "")
        if MOJIBAKE_RE.search(section):
            errors.append(f"mojibake-like residue in section: {name}")
        ids = extract_entry_ids(section)
        duplicates = sorted({atom_id for atom_id in ids if ids.count(atom_id) > 1})
        for atom_id in duplicates:
            errors.append(f"{name}: duplicate atom id: {atom_id}")
        for atom_id in ids:
            atom = atoms_by_id.get(atom_id)
            if not atom:
                errors.append(f"{name}: unknown atom id: {atom_id}")
                continue
            if not atom.get("title"):
                errors.append(f"{name}: missing title in per-file atom: {atom_id}")
            if not atom.get("tags"):
                errors.append(f"{name}: missing tags in per-file atom: {atom_id}")
            if not atom.get("source"):
                errors.append(f"{name}: missing source in per-file atom: {atom_id}")
            path = index_paths.get(atom_id)
            if not path or not path.exists():
                errors.append(f"{name}: missing per-file markdown path: {atom_id}")

    tag_section = sections.get("Tag Entry Points", "")
    if MOJIBAKE_RE.search(tag_section):
        errors.append("mojibake-like residue in section: Tag Entry Points")
    for atom_id in extract_tag_example_ids(tag_section):
        if atom_id not in atoms_by_id:
            errors.append(f"Tag Entry Points: unknown example atom id: {atom_id}")

    game_task_section = sections.get("Game Task Entry Points", "")
    for atom_id in extract_tag_example_ids(game_task_section):
        if atom_id not in atoms_by_id:
            errors.append(f"Game Task Entry Points: unknown example atom id: {atom_id}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate memory/MEMORY.md against per-file atom index.")
    parser.add_argument("--path", type=Path, default=MEMORY_PATH, help="MEMORY.md path")
    args = parser.parse_args()

    errors = validate(args.path)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("OK: memory/MEMORY.md entry sections match per-file atom index.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
