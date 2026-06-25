#!/usr/bin/env python3
"""Utilities for shared-reads title-level canonical decisions."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANDIDATES_DIR = ROOT / "memory" / "shared_reads_candidates"
DEFAULT_TITLE_INDEX = ROOT / "memory" / "shared_reads_title_canonical_index.jsonl"
TERMINAL_STATUSES = {"posted", "failed"}


def normalize_title_key(title: str) -> str:
    """Return the stable title key used by the canonical index."""
    title = title.casefold()
    title = re.sub(r"https?://\S+", " ", title)
    title = re.sub(r"[_\W]+", " ", title, flags=re.UNICODE)
    return " ".join(title.split())


def strip_scalar(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def read_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    try:
        _, frontmatter, _ = text.split("---", 2)
    except ValueError:
        return {}

    data: dict[str, str] = {}
    current_key: str | None = None
    folded: list[str] = []

    def flush_folded() -> None:
        nonlocal current_key, folded
        if current_key is not None:
            data[current_key] = " ".join(part.strip() for part in folded if part.strip())
        current_key = None
        folded = []

    for raw_line in frontmatter.splitlines():
        if current_key is not None:
            if raw_line.startswith((" ", "\t")) or not raw_line.strip():
                folded.append(raw_line)
                continue
            flush_folded()

        if ":" not in raw_line:
            continue
        key, value = raw_line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value in {">", ">-", "|", "|-"}:
            current_key = key
            folded = []
            continue
        data[key] = strip_scalar(value)

    flush_folded()
    return data


def candidate_title_key(path: Path) -> str:
    return normalize_title_key(read_frontmatter(path).get("title", ""))


def rel_path(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def load_title_index(path: Path = DEFAULT_TITLE_INDEX) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}

    rows: dict[str, dict[str, Any]] = {}
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            title_key = str(row.get("title_key") or "")
            if not title_key:
                raise ValueError(f"{path}:{line_number}: missing title_key")
            rows[title_key] = row
    return rows


def title_index_terminal_match(meta: dict[str, str], index: dict[str, dict[str, Any]]) -> dict[str, Any] | None:
    title_key = normalize_title_key(meta.get("title", ""))
    if not title_key:
        return None
    row = index.get(title_key)
    if not row:
        return None
    best_status = str(row.get("best_status") or "").lower()
    if best_status not in TERMINAL_STATUSES:
        return None
    return row
