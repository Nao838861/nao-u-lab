#!/usr/bin/env python3
"""Lightweight quality checks for memory atoms."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any


CHECK_FIELDS = ("title", "trigger", "excerpt")


def mojibake_score(text: str) -> dict[str, Any]:
    """Return simple mojibake indicators for generated atom text.

    This intentionally stays conservative. A few question marks are normal in
    English prose, but dense replacement marks in Japanese-heavy Slack posts
    usually mean the atom should not enter the recall index.
    """
    if not text:
        return {"suspect": False, "question_ratio": 0.0, "replacement_count": 0, "run_count": 0}
    length = max(len(text), 1)
    question_ratio = text.count("?") / length
    replacement_count = text.count("\ufffd")
    run_count = sum(1 for marker in ("???", "????", "????????") if marker in text)
    suspect = replacement_count > 0 or question_ratio >= 0.08 or run_count >= 1
    return {
        "suspect": suspect,
        "question_ratio": round(question_ratio, 4),
        "replacement_count": replacement_count,
        "run_count": run_count,
    }


def atom_quality_report(atom: dict[str, Any]) -> dict[str, Any]:
    field_reports = {
        field: mojibake_score(str(atom.get(field, "")))
        for field in CHECK_FIELDS
        if atom.get(field)
    }
    suspect_fields = [field for field, report in field_reports.items() if report["suspect"]]
    return {
        "suspect": bool(suspect_fields),
        "suspect_fields": suspect_fields,
        "fields": field_reports,
    }


def is_mojibake_suspect(atom: dict[str, Any]) -> bool:
    return bool(atom_quality_report(atom)["suspect"])


def append_quarantine(path: Path, atom: dict[str, Any], row: dict[str, Any], reason: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "quarantined_at": datetime.now().isoformat(timespec="seconds"),
        "reason": reason,
        "quality": atom_quality_report(atom),
        "atom": {
            "id": atom.get("id"),
            "source_ts": atom.get("source_ts"),
            "title": atom.get("title"),
            "source": atom.get("source"),
        },
        "evidence": {
            "channel": row.get("channel"),
            "ts": row.get("ts"),
            "datetime": row.get("datetime"),
            "text_excerpt": str(row.get("text", ""))[:500],
        },
    }
    with path.open("a", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
