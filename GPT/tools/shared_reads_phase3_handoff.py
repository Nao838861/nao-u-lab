#!/usr/bin/env python3
"""Persistent, replay-safe handoff ledger for Phase 3 shared-reads delivery."""

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
DEFAULT_INBOX = ROOT / "memory" / "shared_reads_phase3_handoff_inbox.jsonl"
DEFAULT_QUEUE = ROOT / "memory" / "shared_reads_phase3_queue.jsonl"
VALID_STATUSES = {"pending", "handled", "deferred"}
VALID_DECISIONS = {"posted", "postponed", "invalidated", "defer"}
VALID_PREFLIGHT_DECISIONS = {"continue", "review", "skip"}


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


def state_snapshot_from_meta(meta: dict[str, str]) -> dict[str, str]:
    return {
        "status": str(meta.get("status") or "").casefold(),
        "candidate_status": str(meta.get("candidate_status") or "").casefold(),
        "evaluated_at": str(meta.get("evaluated_at") or meta.get("last_reviewed_at") or ""),
        "last_reviewed_at": str(meta.get("last_reviewed_at") or ""),
        "title": str(meta.get("title") or ""),
        "url": str(meta.get("url") or ""),
        "stale_after": str(meta.get("stale_after") or ""),
        "next_action": str(meta.get("next_action") or ""),
    }


def state_fingerprint(snapshot: dict[str, str]) -> str:
    encoded = json.dumps(snapshot, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def candidate_snapshot(root: Path, relative: str) -> dict[str, Any]:
    path = candidate_path(root, relative)
    if not path.exists():
        snapshot = state_snapshot_from_meta({})
        snapshot["status"] = "__missing__"
        snapshot["candidate_status"] = "__missing__"
        return {"fields": snapshot, "fingerprint": state_fingerprint(snapshot)}
    fields = state_snapshot_from_meta(read_frontmatter(path))
    return {"fields": fields, "fingerprint": state_fingerprint(fields)}


def item_id(relative: str, evaluated_at: str, fingerprint: str) -> str:
    raw = f"{relative}\0{evaluated_at}\0{fingerprint}".encode("utf-8")
    return "p3h-" + hashlib.sha256(raw).hexdigest()[:16]


def retry_is_due(row: dict[str, Any], as_of: datetime | None = None) -> bool:
    if row.get("status") != "deferred":
        return False
    retry_after = str(row.get("retry_after") or "")
    if not retry_after:
        return True
    return parse_iso(retry_after) <= (as_of or now_dt())


def lease_suppresses(
    relative: str,
    fingerprint: str,
    rows: list[dict[str, Any]],
) -> bool:
    """Return whether this exact candidate selection already has a durable receipt."""
    return any(
        str(row.get("candidate_path") or "") == relative
        and str(row.get("state_fingerprint") or "") == fingerprint
        and row.get("status") in VALID_STATUSES
        for row in rows
    )


def validate_rows(rows: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    seen_ids: set[str] = set()
    seen_selections: set[tuple[str, str, str]] = set()
    for number, row in enumerate(rows, start=1):
        row_id = str(row.get("id") or "")
        relative = str(row.get("candidate_path") or "")
        evaluated_at = str(row.get("evaluated_at") or "")
        fingerprint = str(row.get("state_fingerprint") or "")
        selection = (relative, evaluated_at, fingerprint)
        if not all((row_id, relative, evaluated_at, fingerprint, row.get("selected_at"))):
            errors.append(f"row {number}: id/path/evaluated_at/fingerprint/selected_at is required")
        if row_id in seen_ids:
            errors.append(f"row {number}: duplicate id {row_id}")
        if selection in seen_selections:
            errors.append(f"row {number}: duplicate Phase 3 selection {selection!r}")
        if row.get("status") not in VALID_STATUSES:
            errors.append(f"row {number}: invalid status {row.get('status')!r}")
        decision = row.get("decision")
        if decision is not None and decision not in VALID_DECISIONS:
            errors.append(f"row {number}: invalid decision {decision!r}")
        if not isinstance(row.get("selected_candidate_state"), dict):
            errors.append(f"row {number}: selected_candidate_state must be an object")
        if row.get("status") == "deferred":
            if decision != "defer" or not row.get("retry_after") or not row.get("decision_reason"):
                errors.append(f"row {number}: deferred item requires decision, reason, and retry_after")
            if row.get("preflight_decision") != "continue" or not row.get("preflight_evidence"):
                errors.append(f"row {number}: deferred item requires successful preflight evidence")
        if row.get("status") == "handled":
            if decision not in {"posted", "postponed", "invalidated"}:
                errors.append(f"row {number}: handled item requires a terminal Phase 3 decision")
            if not row.get("handled_evidence") or not row.get("staging_evidence"):
                errors.append(f"row {number}: handled item lacks handled/staging evidence")
            if decision == "posted" and not row.get("slack_permalink"):
                errors.append(f"row {number}: posted item lacks Slack permalink")
        seen_ids.add(row_id)
        seen_selections.add(selection)
    return errors


def enqueue_rows(
    inbox_rows: list[dict[str, Any]],
    queue_rows: list[dict[str, Any]],
    source_cycle_id: str,
    selected_at: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Idempotently enqueue queue rows by path, evaluation time, and state fingerprint."""
    rows = list(inbox_rows)
    outcomes: list[dict[str, Any]] = []
    by_id = {str(row.get("id") or ""): row for row in rows}
    for payload in queue_rows:
        relative = str(payload.get("path") or payload.get("candidate_path") or "").strip()
        evaluated_at = str(payload.get("evaluated_at") or "").strip()
        fingerprint = str(payload.get("state_fingerprint") or "").strip()
        selected_state = payload.get("selected_candidate_state")
        if not relative or not evaluated_at or not fingerprint or not isinstance(selected_state, dict):
            raise ValueError("queue row lacks path/evaluated_at/state fingerprint/selected state")
        new_id = item_id(relative, evaluated_at, fingerprint)
        if new_id in by_id:
            outcomes.append({"id": new_id, "candidate_path": relative, "result": "already_enqueued"})
            continue
        if lease_suppresses(relative, fingerprint, rows):
            matching = next(
                row
                for row in reversed(rows)
                if str(row.get("candidate_path") or "") == relative
                and str(row.get("state_fingerprint") or "") == fingerprint
            )
            outcomes.append(
                {"id": matching["id"], "candidate_path": relative, "result": "live_lease_suppressed"}
            )
            continue
        row = {
            "schema_version": 1,
            "id": new_id,
            "candidate_path": relative,
            "title": str(payload.get("title") or ""),
            "url": str(payload.get("url") or ""),
            "evaluated_at": evaluated_at,
            "stale_after": str(payload.get("stale_after") or ""),
            "state_fingerprint": fingerprint,
            "selected_candidate_state": selected_state,
            "priority_order": payload.get("priority_order"),
            "priority_reason": str(payload.get("priority_reason") or ""),
            "source_cycle_id": source_cycle_id,
            "selected_at": selected_at,
            "status": "pending",
            "retry_after": None,
            "decision": None,
            "decision_reason": None,
            "preflight_decision": None,
            "preflight_evidence": None,
            "slack_permalink": None,
            "candidate_evidence": None,
            "staging_evidence": None,
            "resolved_candidate_state": None,
            "apply_result": None,
            "handled_at": None,
            "handled_by": None,
            "handled_evidence": None,
        }
        rows.append(row)
        by_id[new_id] = row
        outcomes.append({"id": new_id, "candidate_path": relative, "result": "enqueued"})
    return rows, outcomes


def delivery_action(row: dict[str, Any], root: Path = ROOT) -> str:
    snapshot = candidate_snapshot(root, str(row.get("candidate_path") or ""))
    same_state = snapshot["fingerprint"] == str(row.get("state_fingerprint") or "")
    if same_state:
        return "process"
    if row.get("slack_permalink") or row.get("decision") in {"posted", "postponed"}:
        return "complete_receipt"
    return "invalidate"


def pending_rows(
    rows: list[dict[str, Any]],
    root: Path = ROOT,
    limit: int = -1,
    as_of: datetime | None = None,
) -> list[dict[str, Any]]:
    eligible: list[dict[str, Any]] = []
    for row in rows:
        if row.get("status") == "pending" or retry_is_due(row, as_of):
            delivered = dict(row)
            delivered["delivery_action"] = delivery_action(row, root)
            eligible.append(delivered)
    eligible.sort(
        key=lambda row: (
            str(row.get("evaluated_at") or ""),
            str(row.get("selected_at") or ""),
            str(row.get("candidate_path") or ""),
        )
    )
    return eligible if limit < 0 else eligible[:limit]


def _candidate_validation_errors(
    row: dict[str, Any],
    decision: str,
    root: Path,
    permalink: str,
) -> tuple[list[str], dict[str, Any]]:
    relative = str(row.get("candidate_path") or "")
    path = candidate_path(root, relative)
    if not path.exists():
        return [f"candidate missing: {relative}"], candidate_snapshot(root, relative)
    meta = read_frontmatter(path)
    snapshot = candidate_snapshot(root, relative)
    errors: list[str] = []
    expected_status = "posted" if decision == "posted" else "postponed"
    for field in ("status", "candidate_status"):
        if str(meta.get(field) or "").casefold() != expected_status:
            errors.append(f"candidate {field} does not match {expected_status!r}")
    for field in ("last_reviewed_at", "last_decision", "evidence", "next_action"):
        if not str(meta.get(field) or "").strip():
            errors.append(f"candidate frontmatter lacks {field}")
    allowed_last_decisions = {
        "posted": {"posted"},
        "postponed": {"postpone", "postponed"},
    }
    last_decision = str(meta.get("last_decision") or "").casefold()
    if last_decision and last_decision not in allowed_last_decisions[decision]:
        errors.append(f"candidate last_decision {last_decision!r} does not match {decision!r}")
    if decision == "posted":
        for field in ("ts", "permalink", "char_count", "posted_at"):
            if not str(meta.get(field) or "").strip():
                errors.append(f"posted candidate lacks posted.{field}")
        candidate_permalink = str(meta.get("permalink") or "")
        if permalink and candidate_permalink != permalink:
            errors.append("candidate posted.permalink does not match receipt permalink")
        if permalink and permalink not in str(meta.get("evidence") or ""):
            errors.append("candidate evidence does not contain receipt permalink")
    elif not str(meta.get("stale_after") or "").strip():
        errors.append("postponed candidate lacks stale_after")
    return errors, snapshot


def resolve(
    rows: list[dict[str, Any]],
    target_id: str,
    decision: str,
    reason: str,
    preflight_decision: str,
    preflight_evidence: str,
    candidate_evidence: str,
    staging_evidence: str,
    handled_by: str,
    handled_at: str,
    root: Path = ROOT,
    retry_after: str | None = None,
    permalink: str = "",
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
    if decision == "invalidated":
        if not candidate_evidence.strip() or not staging_evidence.strip():
            raise ValueError("invalidated receipt requires candidate and staging evidence")
        snapshot = candidate_snapshot(root, str(row.get("candidate_path") or ""))
        if snapshot["fingerprint"] == str(row.get("state_fingerprint") or ""):
            raise ValueError("cannot invalidate an unchanged candidate selection")
        row.update(
            {
                "status": "handled",
                "decision": "invalidated",
                "decision_reason": reason,
                "candidate_evidence": candidate_evidence,
                "staging_evidence": staging_evidence,
                "resolved_candidate_state": snapshot,
                "apply_result": {"state": "verified", "errors": []},
                "handled_at": handled_at,
                "handled_by": handled_by,
                "handled_evidence": f"candidate state changed before Phase 3 processing: {candidate_evidence}",
                "retry_after": None,
            }
        )
        return rows, "handled"
    if preflight_decision not in VALID_PREFLIGHT_DECISIONS or not preflight_evidence.strip():
        raise ValueError("Phase 3 decision requires duplicate preflight decision and evidence")
    if not staging_evidence.strip():
        raise ValueError("Phase 3 decision requires staging evidence")
    if decision == "defer":
        if preflight_decision != "continue":
            raise ValueError("Slack failure defer requires preflight decision continue")
        if not retry_after:
            raise ValueError("defer requires retry_after")
        parse_iso(retry_after)
        snapshot = candidate_snapshot(root, str(row.get("candidate_path") or ""))
        if snapshot["fingerprint"] != str(row.get("state_fingerprint") or ""):
            raise ValueError("changed candidate must be invalidated instead of deferred")
        row.update(
            {
                "status": "deferred",
                "decision": "defer",
                "decision_reason": reason,
                "preflight_decision": preflight_decision,
                "preflight_evidence": preflight_evidence,
                "staging_evidence": staging_evidence,
                "retry_after": retry_after,
                "resolved_candidate_state": snapshot,
                "apply_result": {"state": "deferred", "errors": []},
                "handled_at": None,
                "handled_by": None,
                "handled_evidence": None,
            }
        )
        return rows, "deferred"
    if not candidate_evidence.strip():
        raise ValueError("handled Phase 3 decision requires candidate evidence")
    if decision == "posted":
        if preflight_decision != "continue":
            raise ValueError("posted decision requires preflight decision continue")
        if not permalink.strip():
            raise ValueError("posted decision requires Slack permalink")
    errors, snapshot = _candidate_validation_errors(row, decision, root, permalink)
    row.update(
        {
            "decision": decision,
            "decision_reason": reason,
            "preflight_decision": preflight_decision,
            "preflight_evidence": preflight_evidence,
            "slack_permalink": permalink or None,
            "candidate_evidence": candidate_evidence,
            "staging_evidence": staging_evidence,
            "resolved_candidate_state": snapshot,
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
        f"candidate frontmatter and staging verified: {row['candidate_path']} "
        f"decision={decision} staging={staging_evidence}"
    )
    return rows, "handled"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inbox", type=Path, default=DEFAULT_INBOX)
    parser.add_argument("--root", type=Path, default=ROOT)
    subparsers = parser.add_subparsers(dest="command", required=True)

    enqueue = subparsers.add_parser("enqueue", help="enqueue Phase 3 queue rows")
    enqueue.add_argument("--source-cycle-id", required=True)
    enqueue.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    enqueue.add_argument("--limit", type=int, default=-1)
    enqueue.add_argument("--dry-run", action="store_true")

    pending = subparsers.add_parser("pending", help="print oldest eligible Phase 3 handoffs")
    pending.add_argument("--limit", type=int, default=1)
    pending.add_argument("--as-of")

    resolve_parser = subparsers.add_parser("resolve", help="record verified Phase 3 result or defer")
    resolve_parser.add_argument("--id", required=True)
    resolve_parser.add_argument("--decision", choices=sorted(VALID_DECISIONS), required=True)
    resolve_parser.add_argument("--reason", required=True)
    resolve_parser.add_argument("--preflight-decision", choices=sorted(VALID_PREFLIGHT_DECISIONS), default="continue")
    resolve_parser.add_argument("--preflight-evidence", default="")
    resolve_parser.add_argument("--candidate-evidence", default="")
    resolve_parser.add_argument("--staging-evidence", default="")
    resolve_parser.add_argument("--retry-after")
    resolve_parser.add_argument("--permalink", default="")
    resolve_parser.add_argument("--handled-by", default="log_cdx Phase 3")

    audit = subparsers.add_parser("audit", help="validate schema and report delivery state")
    audit.add_argument("--as-of")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.inbox)
    if args.command == "enqueue":
        queue_rows = read_jsonl(args.queue)
        if args.limit >= 0:
            queue_rows = queue_rows[: args.limit]
        updated, outcomes = enqueue_rows(rows, queue_rows, args.source_cycle_id, now_iso())
        errors = validate_rows(updated)
        if errors:
            raise ValueError("; ".join(errors))
        if not args.dry_run:
            write_jsonl_atomic(args.inbox, updated)
        print(
            json.dumps(
                {
                    "dry_run": args.dry_run,
                    "outcomes": outcomes,
                    "pending_count": len(pending_rows(updated, args.root)),
                },
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
            args.preflight_decision,
            args.preflight_evidence,
            args.candidate_evidence,
            args.staging_evidence,
            args.handled_by,
            now_iso(),
            args.root,
            args.retry_after,
            args.permalink,
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
    pending = pending_rows(rows, args.root, as_of=as_of)
    action_counts: dict[str, int] = {}
    for row in pending:
        action = str(row.get("delivery_action") or "unknown")
        action_counts[action] = action_counts.get(action, 0) + 1
    print(
        json.dumps(
            {
                "rows": len(rows),
                "pending_count": len(pending),
                "action_counts": action_counts,
                "errors": errors,
            },
            ensure_ascii=False,
        )
    )
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
