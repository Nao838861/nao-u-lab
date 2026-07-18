#!/usr/bin/env python3
"""Persistent lifecycle inbox for Phase 4a -> next-cycle Phase 2 group actions."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INBOX = ROOT / "memory" / "shared_reads_group_handoff_inbox.jsonl"
DEFAULT_QUEUE = ROOT / "memory" / "shared_reads_group_action_queue.jsonl"
VALID_STATUSES = {"pending", "handled"}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8-sig") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def render_jsonl(rows: list[dict[str, Any]]) -> str:
    return "".join(
        json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
        for row in rows
    )


def write_jsonl_atomic(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(path.name + ".tmp")
    temp_path.write_text(render_jsonl(rows), encoding="utf-8", newline="\n")
    os.replace(temp_path, path)


def item_id(group_key: str, source_cycle_id: str) -> str:
    raw = f"{source_cycle_id}\0{group_key}".encode("utf-8")
    return "gha-" + hashlib.sha256(raw).hexdigest()[:16]


def validate_rows(rows: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    seen_ids: set[str] = set()
    seen_pairs: set[tuple[str, str]] = set()
    for number, row in enumerate(rows, start=1):
        row_id = str(row.get("id") or "")
        group_key = str(row.get("group_key") or "")
        source_cycle_id = str(row.get("source_cycle_id") or "")
        pair = (group_key, source_cycle_id)
        if not row_id or not group_key or not source_cycle_id:
            errors.append(f"row {number}: id/group_key/source_cycle_id is required")
        if row_id in seen_ids:
            errors.append(f"row {number}: duplicate id {row_id}")
        if pair in seen_pairs:
            errors.append(f"row {number}: duplicate group/cycle pair {pair!r}")
        if row.get("status") not in VALID_STATUSES:
            errors.append(f"row {number}: invalid status {row.get('status')!r}")
        if not isinstance(row.get("payload"), dict):
            errors.append(f"row {number}: payload must be an object")
        if row.get("status") == "handled" and not row.get("handled_evidence"):
            errors.append(f"row {number}: handled item lacks handled_evidence")
        seen_ids.add(row_id)
        seen_pairs.add(pair)
    return errors


def enqueue_rows(
    inbox_rows: list[dict[str, Any]],
    queue_rows: list[dict[str, Any]],
    source_cycle_id: str,
    selected_at: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Idempotently enqueue selections and suppress a second pending copy per group."""
    rows = list(inbox_rows)
    outcomes: list[dict[str, Any]] = []
    by_id = {str(row.get("id") or ""): row for row in rows}
    pending_by_group = {
        str(row.get("group_key") or ""): row for row in rows if row.get("status") == "pending"
    }
    for payload in queue_rows:
        group_key = str(payload.get("group_key") or "").strip()
        if not group_key:
            raise ValueError("queue row lacks group_key")
        new_id = item_id(group_key, source_cycle_id)
        if new_id in by_id:
            outcomes.append({"id": new_id, "group_key": group_key, "result": "already_enqueued"})
            continue
        if group_key in pending_by_group:
            existing = pending_by_group[group_key]
            outcomes.append(
                {
                    "id": existing["id"],
                    "group_key": group_key,
                    "result": "pending_duplicate_suppressed",
                    "requested_source_cycle_id": source_cycle_id,
                }
            )
            continue
        row = {
            "id": new_id,
            "group_key": group_key,
            "source_cycle_id": source_cycle_id,
            "status": "pending",
            "selected_at": selected_at,
            "selection_reason": str(payload.get("priority_reason") or ""),
            "payload": payload,
            "handled_at": None,
            "handled_by": None,
            "handled_evidence": None,
        }
        rows.append(row)
        by_id[new_id] = row
        pending_by_group[group_key] = row
        outcomes.append({"id": new_id, "group_key": group_key, "result": "enqueued"})
    return rows, outcomes


def pending_rows(rows: list[dict[str, Any]], limit: int = -1) -> list[dict[str, Any]]:
    pending = sorted(
        (row for row in rows if row.get("status") == "pending"),
        # sorted() is stable, so queue insertion order is preserved inside one cycle/time.
        key=lambda row: (str(row.get("selected_at") or ""), str(row.get("source_cycle_id") or "")),
    )
    return pending if limit < 0 else pending[:limit]


def acknowledge(
    rows: list[dict[str, Any]],
    target_id: str,
    evidence: str,
    handled_by: str,
    handled_at: str,
) -> tuple[list[dict[str, Any]], str]:
    for row in rows:
        if row.get("id") != target_id:
            continue
        if row.get("status") == "handled":
            return rows, "already_handled"
        row["status"] = "handled"
        row["handled_at"] = handled_at
        row["handled_by"] = handled_by
        row["handled_evidence"] = evidence
        return rows, "handled"
    raise KeyError(f"unknown handoff id: {target_id}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inbox", type=Path, default=DEFAULT_INBOX)
    subparsers = parser.add_subparsers(dest="command", required=True)

    enqueue = subparsers.add_parser("enqueue", help="upsert queue rows as pending handoffs")
    enqueue.add_argument("--source-cycle-id", required=True)
    enqueue.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    enqueue.add_argument("--limit", type=int, default=1)

    pending = subparsers.add_parser("pending", help="print oldest pending handoffs")
    pending.add_argument("--limit", type=int, default=-1)

    handled = subparsers.add_parser("acknowledge", help="mark one item handled after group_actions is recorded")
    handled.add_argument("--id", required=True)
    handled.add_argument("--evidence", required=True)
    handled.add_argument("--handled-by", default="log_cdx Phase 2")

    subparsers.add_parser("audit", help="validate schema and lifecycle invariants")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.inbox)
    if args.command == "enqueue":
        queue_rows = read_jsonl(args.queue)
        if args.limit >= 0:
            queue_rows = queue_rows[: args.limit]
        rows, outcomes = enqueue_rows(rows, queue_rows, args.source_cycle_id, now_iso())
        errors = validate_rows(rows)
        if errors:
            raise ValueError("; ".join(errors))
        write_jsonl_atomic(args.inbox, rows)
        print(json.dumps({"outcomes": outcomes, "pending_count": len(pending_rows(rows))}, ensure_ascii=False))
        return 0
    if args.command == "pending":
        selected = pending_rows(rows, args.limit)
        print(json.dumps({"pending_count": len(pending_rows(rows)), "items": selected}, ensure_ascii=False))
        return 0
    if args.command == "acknowledge":
        rows, result = acknowledge(rows, args.id, args.evidence, args.handled_by, now_iso())
        errors = validate_rows(rows)
        if errors:
            raise ValueError("; ".join(errors))
        write_jsonl_atomic(args.inbox, rows)
        print(json.dumps({"id": args.id, "result": result, "pending_count": len(pending_rows(rows))}, ensure_ascii=False))
        return 0
    errors = validate_rows(rows)
    print(json.dumps({"rows": len(rows), "pending_count": len(pending_rows(rows)), "errors": errors}, ensure_ascii=False))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
