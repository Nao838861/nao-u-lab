"""Shared-reads probe の期限付き lease / receipt ledger を管理する。"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_LEDGER = ROOT / "memory" / "shared_reads_probe_lifecycle.jsonl"
DEFAULT_STATE = ROOT / "memory" / "shared_reads_self_feedback_state.json"
VALID_STATUSES = {"pending", "resolved", "dormant", "merged", "retired"}
RECEIPT_FIELDS = ("before_decision", "after_decision", "changed", "evidence")
REQUIRED_FIELDS = (
    "probe_id",
    "source_review_ts",
    "consumer_phase",
    "trigger_artifact",
    "expected_delta",
    "leased_at",
    "lease_due",
    "status",
    "receipt",
    "superseded_by",
)


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def parse_iso(value: str) -> datetime:
    parsed = datetime.fromisoformat(value)
    return parsed if parsed.tzinfo else parsed.astimezone()


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


def load_probe_source_map(path: Path = DEFAULT_STATE) -> dict[str, str]:
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    probes = payload.get("active_probes")
    if not isinstance(probes, list):
        raise ValueError("shared-reads state lacks active_probes")
    result: dict[str, str] = {}
    for probe in probes:
        probe_id = str(probe.get("id") or "").strip()
        source_ts = str(probe.get("source_ts") or "").strip()
        if not probe_id or not source_ts:
            raise ValueError("active probe lacks id/source_ts")
        if probe_id in result:
            raise ValueError(f"duplicate active probe id: {probe_id}")
        result[probe_id] = source_ts
    return result


def empty_receipt() -> dict[str, Any]:
    return {field: None for field in RECEIPT_FIELDS}


def _cycle_errors(rows: list[dict[str, Any]]) -> list[str]:
    edges: dict[str, set[str]] = {}
    for row in rows:
        source = str(row.get("probe_id") or "")
        target = str(row.get("superseded_by") or "")
        if source and target:
            edges.setdefault(source, set()).add(target)

    errors: list[str] = []

    def visit(node: str, path: tuple[str, ...]) -> None:
        if node in path:
            cycle = path[path.index(node) :] + (node,)
            message = "circular superseded_by: " + " -> ".join(cycle)
            if message not in errors:
                errors.append(message)
            return
        for target in edges.get(node, set()):
            visit(target, path + (node,))

    for node in edges:
        visit(node, ())
    return errors


def validate_rows(rows: list[dict[str, Any]], source_map: dict[str, str]) -> list[str]:
    errors: list[str] = []
    pending_by_probe: set[str] = set()
    seen_leases: set[tuple[str, str]] = set()
    for number, row in enumerate(rows, start=1):
        missing = [field for field in REQUIRED_FIELDS if field not in row]
        if missing:
            errors.append(f"row {number}: missing fields {missing!r}")
            continue
        probe_id = str(row.get("probe_id") or "")
        if probe_id not in source_map:
            errors.append(f"row {number}: unknown probe_id {probe_id!r}")
        elif str(row.get("source_review_ts") or "") != source_map[probe_id]:
            errors.append(f"row {number}: source_review_ts does not match active probe")
        for field in ("consumer_phase", "trigger_artifact", "expected_delta"):
            if not str(row.get(field) or "").strip():
                errors.append(f"row {number}: {field} is required")
        try:
            leased_at = parse_iso(str(row.get("leased_at") or ""))
            lease_due = parse_iso(str(row.get("lease_due") or ""))
            if lease_due < leased_at:
                errors.append(f"row {number}: lease_due precedes leased_at")
        except ValueError:
            errors.append(f"row {number}: leased_at/lease_due must be ISO-8601")
        lease_key = (probe_id, str(row.get("leased_at") or ""))
        if lease_key in seen_leases:
            errors.append(f"row {number}: duplicate probe_id/leased_at lease")
        seen_leases.add(lease_key)
        status = row.get("status")
        if status not in VALID_STATUSES:
            errors.append(f"row {number}: invalid status {status!r}")
        if status == "pending":
            if probe_id in pending_by_probe:
                errors.append(f"row {number}: duplicate pending lease for {probe_id}")
            pending_by_probe.add(probe_id)
        receipt = row.get("receipt")
        if not isinstance(receipt, dict) or any(field not in receipt for field in RECEIPT_FIELDS):
            errors.append(f"row {number}: receipt requires {RECEIPT_FIELDS!r}")
            receipt = {}
        if status in {"resolved", "merged", "retired"}:
            if not str(receipt.get("evidence") or "").strip():
                errors.append(f"row {number}: {status} requires receipt evidence")
            if not str(receipt.get("before_decision") or "").strip():
                errors.append(f"row {number}: {status} requires before_decision")
            if not str(receipt.get("after_decision") or "").strip():
                errors.append(f"row {number}: {status} requires after_decision")
            if not isinstance(receipt.get("changed"), bool):
                errors.append(f"row {number}: {status} requires boolean changed")
        superseded_by = row.get("superseded_by")
        if status == "merged":
            if not superseded_by:
                errors.append(f"row {number}: merged requires superseded_by")
            elif superseded_by not in source_map:
                errors.append(f"row {number}: unknown superseded_by {superseded_by!r}")
            elif superseded_by == probe_id:
                errors.append(f"row {number}: probe cannot supersede itself")
        elif superseded_by is not None:
            errors.append(f"row {number}: only merged rows may set superseded_by")
    errors.extend(_cycle_errors(rows))
    return errors


def enqueue_probe(
    rows: list[dict[str, Any]],
    source_map: dict[str, str],
    probe_id: str,
    consumer_phase: str,
    trigger_artifact: str,
    expected_delta: str,
    lease_due: str,
    leased_at: str,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if probe_id not in source_map:
        raise ValueError(f"unknown probe_id: {probe_id}")
    if any(row.get("probe_id") == probe_id and row.get("status") == "pending" for row in rows):
        raise ValueError(f"duplicate pending lease for {probe_id}")
    row = {
        "probe_id": probe_id,
        "source_review_ts": source_map[probe_id],
        "consumer_phase": consumer_phase,
        "trigger_artifact": trigger_artifact,
        "expected_delta": expected_delta,
        "leased_at": leased_at,
        "lease_due": lease_due,
        "status": "pending",
        "receipt": empty_receipt(),
        "superseded_by": None,
    }
    candidate = [*rows, row]
    errors = validate_rows(candidate, source_map)
    if errors:
        raise ValueError("; ".join(errors))
    return candidate, row


def resolve_probe(
    rows: list[dict[str, Any]],
    source_map: dict[str, str],
    probe_id: str,
    status: str,
    before_decision: str | None,
    after_decision: str | None,
    changed: bool | None,
    evidence: str | None,
    superseded_by: str | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if status not in VALID_STATUSES - {"pending"}:
        raise ValueError(f"invalid resolution status: {status}")
    matches = [row for row in rows if row.get("probe_id") == probe_id and row.get("status") == "pending"]
    if len(matches) != 1:
        raise ValueError(f"expected one pending lease for {probe_id}; found {len(matches)}")
    row = matches[0]
    row["status"] = status
    row["receipt"] = {
        "before_decision": before_decision,
        "after_decision": after_decision,
        "changed": changed,
        "evidence": evidence,
    }
    row["superseded_by"] = superseded_by
    errors = validate_rows(rows, source_map)
    if errors:
        row["status"] = "pending"
        row["receipt"] = empty_receipt()
        row["superseded_by"] = None
        raise ValueError("; ".join(errors))
    return rows, row


def pending_rows(
    rows: list[dict[str, Any]],
    due_only: bool = False,
    as_of: datetime | None = None,
    limit: int = -1,
) -> list[dict[str, Any]]:
    selected = [row for row in rows if row.get("status") == "pending"]
    if due_only:
        boundary = as_of or datetime.now().astimezone()
        selected = [row for row in selected if parse_iso(str(row["lease_due"])) <= boundary]
    selected.sort(key=lambda row: (str(row.get("lease_due") or ""), str(row.get("leased_at") or "")))
    return selected if limit < 0 else selected[:limit]


def current_status_counts(rows: list[dict[str, Any]]) -> dict[str, int]:
    latest: dict[str, dict[str, Any]] = {}
    for row in rows:
        probe_id = str(row.get("probe_id") or "")
        if probe_id not in latest or str(row.get("leased_at") or "") > str(latest[probe_id].get("leased_at") or ""):
            latest[probe_id] = row
    return {status: sum(row.get("status") == status for row in latest.values()) for status in sorted(VALID_STATUSES)}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ledger", type=Path, default=DEFAULT_LEDGER)
    parser.add_argument("--state", type=Path, default=DEFAULT_STATE)
    subparsers = parser.add_subparsers(dest="command", required=True)

    enqueue = subparsers.add_parser("enqueue", help="probe を1件 lease する")
    enqueue.add_argument("--probe-id", required=True)
    enqueue.add_argument("--consumer-phase", required=True)
    enqueue.add_argument("--trigger-artifact", required=True)
    enqueue.add_argument("--expected-delta", required=True)
    enqueue.add_argument("--lease-due", required=True)

    pending = subparsers.add_parser("pending", help="pending lease と status 件数を表示する")
    pending.add_argument("--due-only", action="store_true")
    pending.add_argument("--as-of")
    pending.add_argument("--limit", type=int, default=-1)

    resolve = subparsers.add_parser("resolve", help="receipt を付けて pending lease を閉じる")
    resolve.add_argument("--probe-id", required=True)
    resolve.add_argument("--status", choices=sorted(VALID_STATUSES - {"pending"}), required=True)
    resolve.add_argument("--before-decision")
    resolve.add_argument("--after-decision")
    changed = resolve.add_mutually_exclusive_group()
    changed.add_argument("--changed", action="store_true", dest="changed")
    changed.add_argument("--unchanged", action="store_false", dest="changed")
    resolve.set_defaults(changed=None)
    resolve.add_argument("--evidence")
    resolve.add_argument("--superseded-by")

    subparsers.add_parser("validate", help="schema と lifecycle invariant を検証する")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_map = load_probe_source_map(args.state)
    rows = read_jsonl(args.ledger)
    if args.command == "enqueue":
        rows, row = enqueue_probe(
            rows,
            source_map,
            args.probe_id,
            args.consumer_phase,
            args.trigger_artifact,
            args.expected_delta,
            args.lease_due,
            now_iso(),
        )
        write_jsonl_atomic(args.ledger, rows)
        print(json.dumps({"result": "enqueued", "item": row, "counts": current_status_counts(rows)}, ensure_ascii=False))
        return 0
    if args.command == "resolve":
        rows, row = resolve_probe(
            rows,
            source_map,
            args.probe_id,
            args.status,
            args.before_decision,
            args.after_decision,
            args.changed,
            args.evidence,
            args.superseded_by,
        )
        write_jsonl_atomic(args.ledger, rows)
        print(json.dumps({"result": args.status, "item": row, "counts": current_status_counts(rows)}, ensure_ascii=False))
        return 0
    errors = validate_rows(rows, source_map)
    if args.command == "pending":
        if errors:
            raise ValueError("; ".join(errors))
        as_of = parse_iso(args.as_of) if args.as_of else None
        selected = pending_rows(rows, args.due_only, as_of, args.limit)
        print(json.dumps({"items": selected, "counts": current_status_counts(rows)}, ensure_ascii=False))
        return 0
    print(json.dumps({"rows": len(rows), "counts": current_status_counts(rows), "errors": errors}, ensure_ascii=False))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
