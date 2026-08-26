#!/usr/bin/env python3
"""Lightweight quality and routing checks for memory atoms."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any


CHECK_FIELDS = ("title", "trigger", "excerpt")
QUESTION_RATIO_THRESHOLD = 0.08

# Compatibility contract: `suspect` and `is_mojibake_suspect()` remain a union
# of both classes until every consumer has moved to a class-specific field or
# helper. Remove them only after repository-wide call-site and stored-report
# audits show no remaining readers.
LEGACY_SUSPECT_RETIREMENT = (
    "Remove suspect compatibility only after all consumers use "
    "hard_corruption or ambiguous_question_run explicitly."
)

OPERATIONAL_LOG_PATTERNS = (
    "[Codex external research]",
    "external research",
    "日記前検索",
    "議論に回したい論点",
    "Slack/記憶atom",
)

LIFECYCLE_REPOST_PATTERNS = (
    "[Codex shared-reads",
    "shared-reads再投稿",
    "shared-reads蜀肴兜",
)

OPERATIONAL_ACK_PATTERNS = (
    "受領しました",
    "memory/slack_broadcasts.jsonl",
    "memory/slack_directives.jsonl",
    "slack_broadcasts.jsonl",
    "slack_directives.jsonl",
)


def atom_search_text(atom: dict[str, Any]) -> str:
    return "\n".join(
        str(atom.get(field, ""))
        for field in ("title", "trigger", "excerpt")
        if atom.get(field)
    )


def mojibake_score(text: str) -> dict[str, Any]:
    """Return reason-coded corruption and question-run indicators."""
    if not text:
        return {
            "classifications": [],
            "reasons": [],
            "hard_reasons": [],
            "ambiguous_reasons": [],
            "hard_corruption": False,
            "ambiguous_question_run": False,
            "suspect": False,
            "question_ratio": 0.0,
            "replacement_count": 0,
            "run_count": 0,
        }
    length = max(len(text), 1)
    question_ratio = text.count("?") / length
    replacement_count = text.count("\ufffd")
    run_count = sum(1 for marker in ("???", "????", "????????") if marker in text)
    hard_reasons = ["replacement_character"] if replacement_count > 0 else []
    ambiguous_reasons = []
    if run_count >= 1:
        ambiguous_reasons.append("question_run")
    if question_ratio >= QUESTION_RATIO_THRESHOLD:
        ambiguous_reasons.append("question_ratio_threshold")
    hard_corruption = bool(hard_reasons)
    ambiguous_question_run = bool(ambiguous_reasons)
    classifications = []
    if hard_corruption:
        classifications.append("hard_corruption")
    if ambiguous_question_run:
        classifications.append("ambiguous_question_run")
    return {
        "classifications": classifications,
        "reasons": hard_reasons + ambiguous_reasons,
        "hard_reasons": hard_reasons,
        "ambiguous_reasons": ambiguous_reasons,
        "hard_corruption": hard_corruption,
        "ambiguous_question_run": ambiguous_question_run,
        "suspect": hard_corruption or ambiguous_question_run,
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
    hard_fields = [field for field, report in field_reports.items() if report["hard_corruption"]]
    ambiguous_fields = [
        field for field, report in field_reports.items() if report["ambiguous_question_run"]
    ]
    reason_codes = {
        "hard_corruption": sorted(
            {
                reason
                for field in hard_fields
                for reason in field_reports[field]["hard_reasons"]
            }
        ),
        "ambiguous_question_run": sorted(
            {
                reason
                for field in ambiguous_fields
                for reason in field_reports[field]["ambiguous_reasons"]
            }
        ),
    }
    return {
        "hard_corruption": bool(hard_fields),
        "hard_fields": hard_fields,
        "ambiguous_question_run": bool(ambiguous_fields),
        "ambiguous_fields": ambiguous_fields,
        "reason_codes": reason_codes,
        "suspect": bool(suspect_fields),
        "suspect_fields": suspect_fields,
        "fields": field_reports,
    }


def is_mojibake_suspect(atom: dict[str, Any]) -> bool:
    """Legacy union helper; do not use it to decide ingest quarantine."""
    return bool(atom_quality_report(atom)["suspect"])


def has_hard_corruption(atom: dict[str, Any]) -> bool:
    """Return whether an atom contains a non-recoverable replacement character."""
    return bool(atom_quality_report(atom)["hard_corruption"])


def has_ambiguous_question_run(atom: dict[str, Any]) -> bool:
    """Return whether an atom has a review-only ASCII question-mark signal."""
    return bool(atom_quality_report(atom)["ambiguous_question_run"])


def slack_ingest_quality_action(atom: dict[str, Any]) -> str:
    """Route only hard corruption to quarantine; ambiguity remains ingestible."""
    return "quarantine" if has_hard_corruption(atom) else "ingest"


def _contains_any(text: str, patterns: tuple[str, ...]) -> bool:
    lowered = text.lower()
    return any(pattern.lower() in lowered for pattern in patterns)


def operational_ack_report(atom: dict[str, Any]) -> dict[str, Any]:
    """Classify low-value Slack receipt atoms for default recall filtering."""
    text = atom_search_text(atom)
    lowered = text.lower()
    reasons: list[str] = []
    if _contains_any(text, OPERATIONAL_ACK_PATTERNS):
        reasons.append("operational_ack_pattern")
    if "[Log_cdx]" in text and "broadcast" in lowered and "memory/slack_broadcasts.jsonl" in text:
        reasons.append("codex_work_receipt")
    return {
        "is_operational_ack": bool(reasons),
        "reasons": reasons,
    }


def is_operational_ack(atom: dict[str, Any]) -> bool:
    return bool(operational_ack_report(atom)["is_operational_ack"])


def routine_layer_report(atom: dict[str, Any]) -> dict[str, Any]:
    """Classify high-volume routine atoms without deleting or rewriting them."""
    text = atom_search_text(atom)
    if _contains_any(text, LIFECYCLE_REPOST_PATTERNS):
        return {
            "memory_layer": "lifecycle_repost",
            "quality": "routine",
            "reasons": ["lifecycle_repost_generic_prefix"],
        }
    if _contains_any(text, OPERATIONAL_LOG_PATTERNS):
        return {
            "memory_layer": "operational_log",
            "quality": "routine",
            "reasons": ["operational_log_generic_prefix"],
        }
    ack = operational_ack_report(atom)
    if ack["is_operational_ack"]:
        return {
            "memory_layer": "operational_ack",
            "quality": "quarantine",
            "reasons": ack["reasons"],
        }
    return {
        "memory_layer": None,
        "quality": None,
        "reasons": [],
    }


def apply_memory_layer(atom: dict[str, Any]) -> dict[str, Any]:
    """Attach memory quality/layer metadata used by ingest and recall."""
    report = routine_layer_report(atom)
    if report["memory_layer"]:
        atom["quality"] = report["quality"]
        atom["memory_layer"] = report["memory_layer"]
        atom["quality_reason"] = ",".join(report["reasons"])
    return atom


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
