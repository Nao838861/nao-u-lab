#!/usr/bin/env python3
"""Build a bounded stale shared-reads candidate triage queue."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any

from build_shared_reads_mixed_duplicate_queue import DEFAULT_OUTPUT as DEFAULT_MIXED_QUEUE
from build_shared_reads_mixed_duplicate_queue import build_queue as build_mixed_duplicate_queue
from shared_reads_title_index import DEFAULT_CANDIDATES_DIR, normalize_title_key, read_frontmatter, rel_path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "memory" / "shared_reads_stale_triage_queue.jsonl"
TARGET_STATUSES = {"postponed", "needs_review"}

GAME_KEYWORDS = {
    "agent",
    "ai",
    "automated",
    "benchmark",
    "dialogue",
    "game",
    "gameplay",
    "level",
    "llm",
    "npc",
    "pcg",
    "playtest",
    "player",
    "procedural",
    "prototype",
    "rl",
    "world",
}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build memory/shared_reads_stale_triage_queue.jsonl from stale candidate frontmatter."
    )
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--mixed-queue", type=Path, default=DEFAULT_MIXED_QUEUE)
    parser.add_argument("--today", default=date.today().isoformat())
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    return parser.parse_args()


def parse_iso_date(value: str) -> date | None:
    match = re.match(r"(\d{4}-\d{2}-\d{2})", value or "")
    if not match:
        return None
    return date.fromisoformat(match.group(1))


def scalar_list(value: str) -> list[str]:
    if not value:
        return []
    stripped = value.strip()
    if stripped.startswith("[") and stripped.endswith("]"):
        stripped = stripped[1:-1]
    return [part.strip().strip("\"'") for part in stripped.split(",") if part.strip()]


def game_transfer_value(meta: dict[str, str]) -> str:
    text = " ".join(
        [
            meta.get("title", ""),
            meta.get("gate_reason", ""),
            meta.get("evidence", ""),
            " ".join(scalar_list(meta.get("genre_tags", ""))),
        ]
    ).casefold()
    hits = sum(1 for keyword in GAME_KEYWORDS if keyword in text)
    if hits >= 3:
        return "high"
    if hits >= 1:
        return "medium"
    return "low"


def reason_for(meta: dict[str, str], age_days: int, duplicate_group_key: str) -> str:
    base = meta.get("gate_reason") or meta.get("evidence") or meta.get("last_decision") or "stale_after reached"
    base = " ".join(base.split())
    if len(base) > 160:
        base = base[:157].rstrip() + "..."
    duplicate_note = "mixed duplicate group present" if duplicate_group_key else "no mixed duplicate group"
    return f"age_days={age_days}; {duplicate_note}; {base}"


def recommended_review_action(duplicate_group_key: str, transfer_value: str, age_days: int) -> str:
    if duplicate_group_key:
        return "merge_duplicate"
    if transfer_value in {"high", "medium"}:
        return "keep_for_phase2"
    if age_days >= 45:
        return "defer_with_reason"
    return "keep_for_phase2"


def load_mixed_group_keys(candidates_dir: Path, mixed_queue_path: Path) -> set[str]:
    if mixed_queue_path.exists():
        rows = []
        with mixed_queue_path.open("r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    rows.append(json.loads(line))
    else:
        rows = build_mixed_duplicate_queue(candidates_dir)
    return {str(row.get("group_key") or "") for row in rows if row.get("group_key")}


def build_queue(candidates_dir: Path, today: date, mixed_queue_path: Path, limit: int) -> list[dict[str, Any]]:
    mixed_group_keys = load_mixed_group_keys(candidates_dir, mixed_queue_path)
    records: list[dict[str, Any]] = []
    for path in sorted(candidates_dir.glob("*.md")):
        if path.name.upper() == "README.MD":
            continue
        meta = read_frontmatter(path)
        status = meta.get("status") or meta.get("candidate_status") or ""
        if status not in TARGET_STATUSES:
            continue
        stale_after = parse_iso_date(meta.get("stale_after", ""))
        if stale_after is None or stale_after > today:
            continue
        group_key = normalize_title_key(meta.get("title", ""))
        duplicate_group_key = group_key if group_key in mixed_group_keys else ""
        age_days = (today - stale_after).days
        transfer_value = game_transfer_value(meta)
        records.append(
            {
                "path": rel_path(path),
                "title": meta.get("title", ""),
                "status": status,
                "stale_after": stale_after.isoformat(),
                "age_days": age_days,
                "duplicate_group_key": duplicate_group_key,
                "game_transfer_value": transfer_value,
                "recommended_review_action": recommended_review_action(duplicate_group_key, transfer_value, age_days),
                "reason": reason_for(meta, age_days, duplicate_group_key),
            }
        )

    value_rank = {"high": 0, "medium": 1, "low": 2}
    action_rank = {"merge_duplicate": 0, "keep_for_phase2": 1, "defer_with_reason": 2, "fail_candidate": 3}
    records.sort(
        key=lambda row: (
            0 if row["duplicate_group_key"] else 1,
            value_rank.get(row["game_transfer_value"], 9),
            action_rank.get(row["recommended_review_action"], 9),
            row["stale_after"],
            row["path"],
        )
    )
    return records if limit < 0 else records[:limit]


def render_jsonl(records: list[dict[str, Any]]) -> str:
    return "".join(json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for record in records)


def main() -> int:
    args = parse_args()
    today = date.fromisoformat(args.today)
    records = build_queue(args.candidates_dir, today, args.mixed_queue, args.limit)
    rendered = render_jsonl(records)

    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != rendered:
            print(f"stale shared-reads stale triage queue: {args.output} expected_rows={len(records)}")
            return 1
        print(f"shared-reads stale triage queue ok: rows={len(records)}")
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8", newline="\n")
    print(json.dumps({"output": str(args.output), "rows": len(records), "limit": args.limit}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
