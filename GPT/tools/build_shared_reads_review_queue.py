#!/usr/bin/env python3
"""Build the shared-reads reevaluation queue from stale candidate frontmatter."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date, datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANDIDATES_DIR = ROOT / "memory" / "shared_reads_candidates"
DEFAULT_OUTPUT = ROOT / "memory" / "shared_reads_review_queue.jsonl"
TARGET_STATUSES = {"postponed", "needs_review"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build memory/shared_reads_review_queue.jsonl from stale shared-reads candidates."
    )
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--today", default=date.today().isoformat())
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


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


def strip_scalar(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def parse_iso_date(value: str) -> date | None:
    if not value:
        return None
    match = re.match(r"(\d{4}-\d{2}-\d{2})", value)
    if not match:
        return None
    return date.fromisoformat(match.group(1))


def priority_for(source_status: str, stale_after: date, today: date) -> str:
    overdue_days = (today - stale_after).days
    if source_status == "needs_review" or overdue_days >= 14:
        return "high"
    return "medium"


def reason_for(meta: dict[str, str], today: date) -> str:
    source = meta.get("evidence") or meta.get("gate_reason") or "stale_after reached"
    source = " ".join(source.split())
    if len(source) > 180:
        source = source[:177].rstrip() + "..."
    return f"stale_after <= {today.isoformat()}; {source}"


def build_queue(candidates_dir: Path, today: date) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for path in sorted(candidates_dir.glob("*.md")):
        if path.name.upper() == "README.MD":
            continue
        meta = read_frontmatter(path)
        source_status = meta.get("status") or meta.get("candidate_status") or ""
        if source_status not in TARGET_STATUSES:
            continue
        stale_after = parse_iso_date(meta.get("stale_after", ""))
        if stale_after is None or stale_after > today:
            continue

        rel_path = path.relative_to(ROOT).as_posix()
        records.append(
            {
                "path": rel_path,
                "source_status": source_status,
                "stale_after": stale_after.isoformat(),
                "priority": priority_for(source_status, stale_after, today),
                "reason": reason_for(meta, today),
                "next_action": meta.get("next_action") or "reevaluate_in_phase2",
                "updated_at": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
            }
        )

    priority_rank = {"high": 0, "medium": 1}
    records.sort(key=lambda row: (priority_rank.get(row["priority"], 9), row["stale_after"], row["path"]))
    return records


def main() -> int:
    args = parse_args()
    today = date.fromisoformat(args.today)
    records = build_queue(args.candidates_dir, today)

    if args.dry_run:
        print(json.dumps({"records": len(records)}, ensure_ascii=False))
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="\n") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
    print(json.dumps({"output": str(args.output), "records": len(records)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
