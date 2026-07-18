#!/usr/bin/env python3
"""Build a group-level action queue from existing shared-reads audit queues."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from shared_reads_group_handoff import DEFAULT_INBOX, ROOT, resolution_suppresses


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_STALE_QUEUE = ROOT / "memory" / "shared_reads_stale_triage_queue.jsonl"
DEFAULT_MIXED_QUEUE = ROOT / "memory" / "shared_reads_mixed_duplicate_queue.jsonl"
DEFAULT_OUTPUT = ROOT / "memory" / "shared_reads_group_action_queue.jsonl"
TERMINAL_STATUSES = {"posted", "failed"}
TRANSFER_RANK = {"high": 0, "medium": 1, "low": 2}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a group-level shared-reads review queue.")
    parser.add_argument("--stale-queue", type=Path, default=DEFAULT_STALE_QUEUE)
    parser.add_argument("--mixed-queue", type=Path, default=DEFAULT_MIXED_QUEUE)
    parser.add_argument("--inbox", type=Path, default=DEFAULT_INBOX)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--limit", type=int, default=-1)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    return parser.parse_args()


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def select_representative(open_paths: list[str], stale_by_path: dict[str, dict[str, Any]]) -> str:
    def rank(path: str) -> tuple[int, str, str]:
        stale = stale_by_path.get(path, {})
        # ISO dates sort lexically. Invert digits so newer dates sort first.
        stale_after = str(stale.get("stale_after") or "0000-00-00")
        inverted_date = "".join(str(9 - int(char)) if char.isdigit() else char for char in stale_after)
        return (TRANSFER_RANK.get(str(stale.get("game_transfer_value") or "low"), 9), inverted_date, path)

    # The outline requires update time before transfer value.
    def required_rank(path: str) -> tuple[str, int, str]:
        transfer_rank, inverted_date, stable_path = rank(path)
        return (inverted_date, transfer_rank, stable_path)

    return min(open_paths, key=required_rank)


def build_queue(
    stale_rows: list[dict[str, Any]],
    mixed_rows: list[dict[str, Any]],
    inbox_rows: list[dict[str, Any]] | None = None,
    root: Path = ROOT,
    as_of: datetime | None = None,
) -> list[dict[str, Any]]:
    stale_by_path = {str(row.get("path") or ""): row for row in stale_rows if row.get("path")}
    records: list[dict[str, Any]] = []
    for group in mixed_rows:
        evidence = group.get("evidence") or {}
        open_paths = sorted(str(path) for path in evidence.get("open_paths", []) if path)
        terminal_paths = sorted(str(path) for path in evidence.get("terminal_paths", []) if path)
        stale_open_paths = [path for path in open_paths if path in stale_by_path]
        if not stale_open_paths:
            continue
        representative = select_representative(stale_open_paths, stale_by_path)
        representative_stale = stale_by_path[representative]
        latest_path = max(
            stale_open_paths,
            key=lambda path: (str(stale_by_path[path].get("stale_after") or ""), path),
        )
        latest = stale_by_path[latest_path]
        record = {
                "group_key": group.get("group_key", ""),
                "representative": representative,
                "open_siblings": open_paths,
                "terminal_siblings": terminal_paths,
                "latest_evidence": {
                    "path": latest_path,
                    "stale_after": latest.get("stale_after", ""),
                    "reason": latest.get("reason", ""),
                },
                "recommended_action": group.get("recommended_action", "reevaluate_representative"),
                "priority_reason": representative_stale.get("reason", ""),
            }
        if not resolution_suppresses(record, inbox_rows or [], root, as_of):
            records.append(record)

    records.sort(
        key=lambda row: (
            TRANSFER_RANK.get(
                str(stale_by_path.get(str(row["representative"]), {}).get("game_transfer_value") or "low"), 9
            ),
            -int(stale_by_path.get(str(row["representative"]), {}).get("age_days") or 0),
            row["group_key"],
        )
    )
    return records


def render_jsonl(records: list[dict[str, Any]]) -> str:
    return "".join(
        json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for record in records
    )


def main() -> int:
    args = parse_args()
    inbox_rows = read_jsonl(args.inbox) if args.inbox.exists() else []
    records = build_queue(read_jsonl(args.stale_queue), read_jsonl(args.mixed_queue), inbox_rows)
    if args.limit >= 0:
        records = records[: args.limit]
    rendered = render_jsonl(records)
    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != rendered:
            print(f"stale shared-reads group action queue: {args.output} expected_rows={len(records)}")
            return 1
        print(f"shared-reads group action queue ok: rows={len(records)}")
        return 0
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8", newline="\n")
    print(json.dumps({"output": str(args.output), "rows": len(records)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
