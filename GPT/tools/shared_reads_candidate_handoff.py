#!/usr/bin/env python3
"""Persistent, replay-safe handoff ledger for stale shared-reads candidates."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from shared_reads_group_handoff import parse_iso, read_jsonl, write_jsonl_atomic
from shared_reads_title_index import read_frontmatter


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INBOX = ROOT / "memory" / "shared_reads_candidate_handoff_inbox.jsonl"
DEFAULT_QUEUE = ROOT / "memory" / "shared_reads_stale_triage_queue.jsonl"
VALID_STATUSES = {"pending", "handled", "deferred"}
VALID_DECISIONS = {"pass", "fail", "postpone", "defer"}
OPEN_STATUSES = {"ready_to_post", "postponed", "needs_review"}
EXPECTED_STATUS = {
    "pass": "ready_to_post",
    "fail": "failed",
    "postpone": "postponed",
}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_dt() -> datetime:
    return datetime.now().astimezone()


def now_iso() -> str:
    return now_dt().isoformat(timespec="seconds")


def candidate_path(root: Path, relative: str) -> Path:
    path = Path(relative)
    resolved = path.resolve() if path.is_absolute() else (root / path).resolve()
    try:
        resolved.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError(f"candidate path escapes root: {relative}") from exc
    return resolved


def candidate_snapshot(root: Path, relative: str) -> dict[str, str]:
    path = candidate_path(root, relative)
    if not path.exists():
        return {"status": "__missing__", "stale_after": ""}
    meta = read_frontmatter(path)
    return {
        "status": str(meta.get("status") or meta.get("candidate_status") or "__unknown__").casefold(),
        "stale_after": str(meta.get("stale_after") or ""),
    }


def selection_matches(
    row: dict[str, Any],
    current_status: str,
    current_stale_after: str,
) -> bool:
    return (
        str(row.get("selected_status") or "").casefold() == current_status.casefold()
        and str(row.get("selected_stale_after") or "") == current_stale_after
    )


def retry_is_due(row: dict[str, Any], as_of: datetime | None = None) -> bool:
    if row.get("status") != "deferred":
        return False
    retry_after = str(row.get("retry_after") or "")
    if not retry_after:
        return True
    return parse_iso(retry_after) <= (as_of or now_dt())


def lease_suppresses(
    relative: str,
    current_status: str,
    current_stale_after: str,
    rows: list[dict[str, Any]],
    as_of: datetime | None = None,
) -> bool:
    """Return whether a live lease for this exact candidate state suppresses triage."""
    for row in reversed(rows):
        if str(row.get("candidate_path") or "") != relative:
            continue
        if not selection_matches(row, current_status, current_stale_after):
            continue
        if row.get("status") in {"pending", "handled"}:
            return True
        if row.get("status") == "deferred":
            return not retry_is_due(row, as_of)
    return False


def item_id(relative: str, source_cycle_id: str, status: str, stale_after: str) -> str:
    raw = f"{source_cycle_id}\0{relative}\0{status}\0{stale_after}".encode("utf-8")
    return "cha-" + hashlib.sha256(raw).hexdigest()[:16]


def validate_rows(rows: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    seen_ids: set[str] = set()
    seen_selections: set[tuple[str, str, str, str]] = set()
    for number, row in enumerate(rows, start=1):
        row_id = str(row.get("id") or "")
        relative = str(row.get("candidate_path") or "")
        source_cycle_id = str(row.get("source_cycle_id") or "")
        selected_status = str(row.get("selected_status") or "")
        selected_stale_after = str(row.get("selected_stale_after") or "")
        selected_at = str(row.get("selected_at") or "")
        selection = (relative, source_cycle_id, selected_status, selected_stale_after)
        if not all((row_id, relative, source_cycle_id, selected_status, selected_stale_after, selected_at)):
            errors.append(
                f"row {number}: id/candidate_path/source_cycle_id/selected state/selected_at is required"
            )
        if not str(row.get("priority_reason") or "").strip():
            errors.append(f"row {number}: priority_reason is required")
        if not str(row.get("recommended_review_action") or "").strip():
            errors.append(f"row {number}: recommended_review_action is required")
        if row_id in seen_ids:
            errors.append(f"row {number}: duplicate id {row_id}")
        if selection in seen_selections:
            errors.append(f"row {number}: duplicate candidate/cycle/state selection {selection!r}")
        if row.get("status") not in VALID_STATUSES:
            errors.append(f"row {number}: invalid status {row.get('status')!r}")
        decision = row.get("decision")
        if decision is not None and decision not in VALID_DECISIONS:
            errors.append(f"row {number}: invalid decision {decision!r}")
        if row.get("status") == "deferred":
            if decision != "defer" or not row.get("retry_after") or not row.get("decision_reason"):
                errors.append(f"row {number}: deferred item requires decision, reason, and retry_after")
        if row.get("status") == "handled":
            if decision not in EXPECTED_STATUS:
                errors.append(f"row {number}: handled item requires terminal review decision")
            if not row.get("handled_evidence") or not row.get("staging_evidence"):
                errors.append(f"row {number}: handled item lacks handled/staging evidence")
        seen_ids.add(row_id)
        seen_selections.add(selection)
    return errors


def enqueue_rows(
    inbox_rows: list[dict[str, Any]],
    queue_rows: list[dict[str, Any]],
    source_cycle_id: str,
    selected_at: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Idempotently enqueue stale queue rows by candidate path and selected state."""
    rows = list(inbox_rows)
    outcomes: list[dict[str, Any]] = []
    by_id = {str(row.get("id") or ""): row for row in rows}
    for payload in queue_rows:
        relative = str(payload.get("path") or payload.get("candidate_path") or "").strip()
        selected_status = str(payload.get("status") or payload.get("selected_status") or "").casefold()
        selected_stale_after = str(payload.get("stale_after") or payload.get("selected_stale_after") or "")
        if not relative or not selected_status or not selected_stale_after:
            raise ValueError("queue row lacks path/status/stale_after")
        new_id = item_id(relative, source_cycle_id, selected_status, selected_stale_after)
        if new_id in by_id:
            outcomes.append({"id": new_id, "candidate_path": relative, "result": "already_enqueued"})
            continue
        matching = next(
            (
                row
                for row in reversed(rows)
                if str(row.get("candidate_path") or "") == relative
                and selection_matches(row, selected_status, selected_stale_after)
            ),
            None,
        )
        if matching is not None:
            suffix = "handled_state_suppressed" if matching.get("status") == "handled" else "active_duplicate_suppressed"
            outcomes.append({"id": matching["id"], "candidate_path": relative, "result": suffix})
            continue
        row = {
            "schema_version": 1,
            "id": new_id,
            "candidate_path": relative,
            "selected_status": selected_status,
            "selected_stale_after": selected_stale_after,
            "priority_reason": str(payload.get("priority_reason") or payload.get("reason") or ""),
            "recommended_review_action": str(payload.get("recommended_review_action") or ""),
            "source_cycle_id": source_cycle_id,
            "selected_at": selected_at,
            "status": "pending",
            "retry_after": None,
            "decision": None,
            "decision_reason": None,
            "resolved_status": None,
            "resolved_stale_after": None,
            "staging_evidence": None,
            "handled_at": None,
            "handled_by": None,
            "handled_evidence": None,
            "apply_result": None,
        }
        rows.append(row)
        by_id[new_id] = row
        outcomes.append({"id": new_id, "candidate_path": relative, "result": "enqueued"})
    return rows, outcomes


def pending_rows(
    rows: list[dict[str, Any]],
    root: Path = ROOT,
    limit: int = -1,
    as_of: datetime | None = None,
) -> list[dict[str, Any]]:
    eligible: list[dict[str, Any]] = []
    for row in rows:
        if row.get("status") not in {"pending", "deferred"}:
            continue
        if row.get("status") == "pending":
            # Keep pending work replayable even if Phase 2 updated the candidate
            # and crashed before recording the handled receipt.
            eligible.append(row)
            continue
        if not retry_is_due(row, as_of):
            continue
        snapshot = candidate_snapshot(root, str(row.get("candidate_path") or ""))
        if not selection_matches(row, snapshot["status"], snapshot["stale_after"]):
            continue
        eligible.append(row)
    eligible.sort(
        key=lambda row: (
            str(row.get("selected_at") or ""),
            str(row.get("source_cycle_id") or ""),
        )
    )
    return eligible if limit < 0 else eligible[:limit]


def _review_validation_errors(
    row: dict[str, Any],
    decision: str,
    root: Path,
) -> tuple[list[str], dict[str, str], dict[str, str]]:
    relative = str(row["candidate_path"])
    path = candidate_path(root, relative)
    if not path.exists():
        return [f"candidate missing: {relative}"], {}, {"status": "__missing__", "stale_after": ""}
    meta = read_frontmatter(path)
    snapshot = {
        "status": str(meta.get("status") or meta.get("candidate_status") or "__unknown__").casefold(),
        "stale_after": str(meta.get("stale_after") or ""),
    }
    errors: list[str] = []
    expected_status = EXPECTED_STATUS[decision]
    for field in ("status", "candidate_status"):
        value = str(meta.get(field) or "").casefold()
        if value != expected_status:
            errors.append(f"candidate {field} {value!r} does not match {expected_status!r}")
    for field in ("last_reviewed_at", "last_decision", "evidence", "next_action"):
        if not str(meta.get(field) or "").strip():
            errors.append(f"candidate frontmatter lacks {field}")
    allowed_last_decisions = {
        "pass": {"pass", "ready_to_post"},
        "fail": {"fail", "failed"},
        "postpone": {"postpone", "postponed"},
    }
    last_decision = str(meta.get("last_decision") or "").casefold()
    if last_decision and last_decision not in allowed_last_decisions[decision]:
        errors.append(f"candidate last_decision {last_decision!r} does not match {decision!r}")
    if not snapshot["stale_after"]:
        errors.append("candidate frontmatter lacks stale_after")
    if decision == "postpone":
        previous = str(row.get("selected_stale_after") or "")
        current = snapshot["stale_after"]
        if current:
            try:
                if parse_iso(current) <= parse_iso(previous):
                    errors.append("postponed candidate stale_after was not advanced")
            except ValueError:
                errors.append("postponed candidate stale_after is not ISO formatted")
    return errors, meta, snapshot


def resolve(
    rows: list[dict[str, Any]],
    target_id: str,
    decision: str,
    reason: str,
    staging_evidence: str,
    handled_by: str,
    handled_at: str,
    root: Path = ROOT,
    retry_after: str | None = None,
) -> tuple[list[dict[str, Any]], str]:
    row = next((item for item in rows if item.get("id") == target_id), None)
    if row is None:
        raise KeyError(f"unknown handoff id: {target_id}")
    if row.get("status") == "handled":
        return rows, "already_handled"
    if decision not in VALID_DECISIONS:
        raise ValueError(f"invalid decision: {decision!r}")
    if not reason.strip():
        raise ValueError("decision reason is required")
    if decision == "defer":
        if not retry_after:
            raise ValueError("defer requires retry_after")
        parse_iso(retry_after)
        row.update(
            {
                "status": "deferred",
                "decision": "defer",
                "decision_reason": reason,
                "retry_after": retry_after,
                "staging_evidence": staging_evidence or None,
                "handled_at": None,
                "handled_by": None,
                "handled_evidence": None,
                "apply_result": {"state": "deferred", "errors": []},
            }
        )
        return rows, "deferred"
    if not staging_evidence.strip():
        raise ValueError("handled review requires staging_evidence")
    errors, _meta, snapshot = _review_validation_errors(row, decision, root)
    row.update(
        {
            "decision": decision,
            "decision_reason": reason,
            "resolved_status": snapshot["status"],
            "resolved_stale_after": snapshot["stale_after"] or None,
            "staging_evidence": staging_evidence,
            "retry_after": None,
            "apply_result": {"state": "partial" if errors else "verified", "errors": errors},
        }
    )
    if errors:
        row["status"] = "pending"
        row["handled_at"] = None
        row["handled_by"] = None
        row["handled_evidence"] = None
        return rows, "partial"
    row["status"] = "handled"
    row["handled_at"] = handled_at
    row["handled_by"] = handled_by
    row["handled_evidence"] = (
        f"candidate frontmatter verified: {row['candidate_path']} "
        f"status={snapshot['status']} staging={staging_evidence}"
    )
    return rows, "handled"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inbox", type=Path, default=DEFAULT_INBOX)
    parser.add_argument("--root", type=Path, default=ROOT)
    subparsers = parser.add_subparsers(dest="command", required=True)

    enqueue = subparsers.add_parser("enqueue", help="enqueue stale triage rows as candidate handoffs")
    enqueue.add_argument("--source-cycle-id", required=True)
    enqueue.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    enqueue.add_argument("--limit", type=int, default=5)

    pending = subparsers.add_parser("pending", help="print oldest eligible candidate handoffs")
    pending.add_argument("--limit", type=int, default=-1)
    pending.add_argument("--as-of")

    resolve_parser = subparsers.add_parser("resolve", help="verify candidate/staging completion or defer")
    resolve_parser.add_argument("--id", required=True)
    resolve_parser.add_argument("--decision", choices=sorted(VALID_DECISIONS), required=True)
    resolve_parser.add_argument("--reason", required=True)
    resolve_parser.add_argument("--staging-evidence", default="")
    resolve_parser.add_argument("--retry-after")
    resolve_parser.add_argument("--handled-by", default="log_cdx Phase 2")

    audit = subparsers.add_parser("audit", help="validate schema and report live/stale rows")
    audit.add_argument("--as-of")
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
        print(
            json.dumps(
                {"outcomes": outcomes, "pending_count": len(pending_rows(rows, args.root))},
                ensure_ascii=False,
            )
        )
        return 0
    if args.command == "pending":
        as_of = parse_iso(args.as_of) if args.as_of else now_dt()
        selected = pending_rows(rows, args.root, args.limit, as_of)
        print(
            json.dumps(
                {"pending_count": len(pending_rows(rows, args.root, as_of=as_of)), "items": selected},
                ensure_ascii=False,
            )
        )
        return 0
    if args.command == "resolve":
        rows, result = resolve(
            rows,
            args.id,
            args.decision,
            args.reason,
            args.staging_evidence,
            args.handled_by,
            now_iso(),
            args.root,
            args.retry_after,
        )
        errors = validate_rows(rows)
        if errors:
            raise ValueError("; ".join(errors))
        write_jsonl_atomic(args.inbox, rows)
        print(
            json.dumps(
                {"id": args.id, "result": result, "pending_count": len(pending_rows(rows, args.root))},
                ensure_ascii=False,
            )
        )
        return 1 if result == "partial" else 0
    as_of = parse_iso(args.as_of) if args.as_of else now_dt()
    errors = validate_rows(rows)
    stale_pending = 0
    for row in rows:
        if row.get("status") not in {"pending", "deferred"}:
            continue
        snapshot = candidate_snapshot(args.root, str(row.get("candidate_path") or ""))
        if not selection_matches(row, snapshot["status"], snapshot["stale_after"]):
            stale_pending += 1
    print(
        json.dumps(
            {
                "rows": len(rows),
                "pending_count": len(pending_rows(rows, args.root, as_of=as_of)),
                "stale_pending_count": stale_pending,
                "errors": errors,
            },
            ensure_ascii=False,
        )
    )
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
