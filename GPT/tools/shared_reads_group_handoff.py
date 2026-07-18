#!/usr/bin/env python3
"""Persistent, replay-safe lifecycle ledger for shared-reads group actions."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from shared_reads_title_index import read_frontmatter


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INBOX = ROOT / "memory" / "shared_reads_group_handoff_inbox.jsonl"
DEFAULT_QUEUE = ROOT / "memory" / "shared_reads_group_action_queue.jsonl"
VALID_STATUSES = {"pending", "handled", "deferred"}
VALID_ACTIONS = {"close_siblings", "keep_distinct", "defer"}
OPEN_STATUSES = {"ready_to_post", "postponed", "needs_review"}
TERMINAL_STATUSES = {"posted", "failed"}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_dt() -> datetime:
    return datetime.now().astimezone()


def now_iso() -> str:
    return now_dt().isoformat(timespec="seconds")


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


def item_id(group_key: str, source_cycle_id: str) -> str:
    raw = f"{source_cycle_id}\0{group_key}".encode("utf-8")
    return "gha-" + hashlib.sha256(raw).hexdigest()[:16]


def candidate_path(root: Path, relative: str) -> Path:
    path = Path(relative)
    resolved = path.resolve() if path.is_absolute() else (root / path).resolve()
    try:
        resolved.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError(f"candidate path escapes root: {relative}") from exc
    return resolved


def candidate_status(root: Path, relative: str) -> str:
    path = candidate_path(root, relative)
    if not path.exists():
        return "__missing__"
    meta = read_frontmatter(path)
    return str(meta.get("status") or meta.get("candidate_status") or "__unknown__").casefold()


def membership_snapshot(payload: dict[str, Any], root: Path = ROOT) -> list[dict[str, str]]:
    paths = {
        str(path)
        for field in ("open_siblings", "terminal_siblings")
        for path in payload.get(field, [])
        if path
    }
    representative = str(payload.get("representative") or "")
    if representative:
        paths.add(representative)
    return [{"path": path, "status": candidate_status(root, path)} for path in sorted(paths)]


def membership_fingerprint(payload: dict[str, Any], root: Path = ROOT) -> str:
    encoded = json.dumps(membership_snapshot(payload, root), ensure_ascii=False, sort_keys=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def retry_is_due(row: dict[str, Any], as_of: datetime | None = None) -> bool:
    if row.get("status") != "deferred":
        return False
    retry_after = str(row.get("retry_after") or "")
    if not retry_after:
        return True
    return parse_iso(retry_after) <= (as_of or now_dt())


def resolution_suppresses(
    payload: dict[str, Any],
    inbox_rows: list[dict[str, Any]],
    root: Path = ROOT,
    as_of: datetime | None = None,
) -> bool:
    """Return whether a live keep/defer decision suppresses this queue payload."""
    group_key = str(payload.get("group_key") or "")
    relevant = [row for row in inbox_rows if str(row.get("group_key") or "") == group_key]
    relevant.sort(key=lambda row: str(row.get("selected_at") or ""), reverse=True)
    if not relevant:
        return False
    row = relevant[0]
    action = row.get("decision_action")
    if row.get("status") == "deferred" and action == "defer":
        return not retry_is_due(row, as_of)
    if row.get("status") == "handled" and action == "keep_distinct":
        return str(row.get("membership_fingerprint") or "") == membership_fingerprint(payload, root)
    return row.get("status") in {"pending", "deferred"}


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
        action = row.get("decision_action")
        if action is not None and action not in VALID_ACTIONS:
            errors.append(f"row {number}: invalid decision_action {action!r}")
        if row.get("status") == "deferred" and (action != "defer" or not row.get("retry_after")):
            errors.append(f"row {number}: deferred item requires defer decision and retry_after")
        if row.get("status") == "handled" and not row.get("handled_evidence"):
            errors.append(f"row {number}: handled item lacks handled_evidence")
        if row.get("status") == "handled" and action is not None and not isinstance(row.get("apply_result"), dict):
            errors.append(f"row {number}: resolved item lacks apply_result")
        seen_ids.add(row_id)
        seen_pairs.add(pair)
    return errors


def enqueue_rows(
    inbox_rows: list[dict[str, Any]],
    queue_rows: list[dict[str, Any]],
    source_cycle_id: str,
    selected_at: str,
    root: Path = ROOT,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Idempotently enqueue selections and suppress unresolved/live decisions."""
    rows = list(inbox_rows)
    outcomes: list[dict[str, Any]] = []
    by_id = {str(row.get("id") or ""): row for row in rows}
    for payload in queue_rows:
        group_key = str(payload.get("group_key") or "").strip()
        if not group_key:
            raise ValueError("queue row lacks group_key")
        new_id = item_id(group_key, source_cycle_id)
        if new_id in by_id:
            outcomes.append({"id": new_id, "group_key": group_key, "result": "already_enqueued"})
            continue
        active = next(
            (
                row
                for row in reversed(rows)
                if row.get("group_key") == group_key and row.get("status") in {"pending", "deferred"}
            ),
            None,
        )
        if active is not None:
            outcomes.append(
                {
                    "id": active["id"],
                    "group_key": group_key,
                    "result": "pending_duplicate_suppressed",
                    "requested_source_cycle_id": source_cycle_id,
                }
            )
            continue
        if resolution_suppresses(payload, rows, root):
            outcomes.append({"id": "", "group_key": group_key, "result": "live_resolution_suppressed"})
            continue
        row = {
            "schema_version": 2,
            "id": new_id,
            "group_key": group_key,
            "source_cycle_id": source_cycle_id,
            "status": "pending",
            "selected_at": selected_at,
            "selection_reason": str(payload.get("priority_reason") or ""),
            "payload": payload,
            "membership_fingerprint": membership_fingerprint(payload, root),
            "decision_action": None,
            "decision_reason": None,
            "target_paths": [],
            "terminal_evidence": [],
            "representative_decision": None,
            "apply_result": None,
            "retry_after": None,
            "handled_at": None,
            "handled_by": None,
            "handled_evidence": None,
        }
        rows.append(row)
        by_id[new_id] = row
        outcomes.append({"id": new_id, "group_key": group_key, "result": "enqueued"})
    return rows, outcomes


def pending_rows(
    rows: list[dict[str, Any]], limit: int = -1, as_of: datetime | None = None
) -> list[dict[str, Any]]:
    pending = sorted(
        (
            row
            for row in rows
            if row.get("status") == "pending" or retry_is_due(row, as_of)
        ),
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
    """Legacy acknowledgement retained for old automation; new Phase 2 uses resolve."""
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


def yaml_scalar(value: str) -> str:
    if re.fullmatch(r"[A-Za-z0-9_.+-]+", value):
        return value
    return json.dumps(value, ensure_ascii=False)


def update_frontmatter_fields(path: Path, changes: dict[str, str]) -> None:
    raw = path.read_bytes()
    has_bom = raw.startswith(b"\xef\xbb\xbf")
    text = raw.decode("utf-8-sig")
    newline = "\r\n" if "\r\n" in text else "\n"
    lines = text.splitlines()
    if not lines or lines[0] != "---":
        raise ValueError(f"frontmatter opening delimiter missing: {path}")
    closing = next((index for index, line in enumerate(lines[1:], start=1) if line == "---"), None)
    if closing is None:
        raise ValueError(f"frontmatter closing delimiter missing: {path}")
    output = ["---"]
    written: set[str] = set()
    index = 1
    while index < closing:
        line = lines[index]
        match = re.match(r"^([A-Za-z0-9_-]+):", line)
        key = match.group(1) if match else ""
        if key in changes:
            output.append(f"{key}: {yaml_scalar(changes[key])}")
            written.add(key)
            index += 1
            while index < closing and lines[index].startswith((" ", "\t")):
                index += 1
            continue
        output.append(line)
        index += 1
    for key, value in changes.items():
        if key not in written:
            output.append(f"{key}: {yaml_scalar(value)}")
    output.extend(lines[closing:])
    rendered = newline.join(output)
    if text.endswith(("\n", "\r")):
        rendered += newline
    encoded = rendered.encode("utf-8")
    if has_bom:
        encoded = b"\xef\xbb\xbf" + encoded
    temp_path = path.with_name(path.name + ".tmp")
    temp_path.write_bytes(encoded)
    os.replace(temp_path, path)


def validate_decision(row: dict[str, Any], decision: dict[str, Any]) -> None:
    action = str(decision.get("action") or "")
    if action not in VALID_ACTIONS:
        raise ValueError(f"invalid action: {action!r}")
    if str(decision.get("group_key") or row.get("group_key") or "") != row.get("group_key"):
        raise ValueError("decision group_key does not match handoff")
    if not str(decision.get("reason") or "").strip():
        raise ValueError("decision reason is required")
    target_paths = [str(path) for path in decision.get("target_paths", [])]
    allowed_targets = {str(path) for path in row.get("payload", {}).get("open_siblings", [])}
    if not set(target_paths).issubset(allowed_targets):
        raise ValueError("target_paths must be drawn from payload.open_siblings")
    terminal_evidence = decision.get("terminal_evidence")
    if not isinstance(terminal_evidence, list):
        raise ValueError("terminal_evidence must be a list")
    if action in {"close_siblings", "keep_distinct"} and not terminal_evidence:
        raise ValueError(f"{action} requires terminal_evidence")
    if action == "defer":
        retry_after = str(decision.get("retry_after") or "")
        if not retry_after:
            raise ValueError("defer requires retry_after")
        parse_iso(retry_after)


def resolve(
    rows: list[dict[str, Any]],
    target_id: str,
    decision: dict[str, Any],
    handled_by: str,
    handled_at: str,
    root: Path = ROOT,
) -> tuple[list[dict[str, Any]], str]:
    row = next((item for item in rows if item.get("id") == target_id), None)
    if row is None:
        raise KeyError(f"unknown handoff id: {target_id}")
    if row.get("status") == "handled" and row.get("decision_action"):
        return rows, "already_resolved"
    validate_decision(row, decision)
    action = str(decision["action"])
    row.update(
        {
            "schema_version": 2,
            "decision_action": action,
            "decision_reason": str(decision.get("reason") or ""),
            "target_paths": [str(path) for path in decision.get("target_paths", [])],
            "terminal_evidence": decision.get("terminal_evidence", []),
            "representative_decision": decision.get("representative_decision"),
            "retry_after": decision.get("retry_after"),
        }
    )
    if action == "defer":
        row["status"] = "deferred"
        row["apply_result"] = {"state": "deferred", "updated_paths": [], "errors": []}
        row["handled_at"] = None
        row["handled_by"] = None
        row["handled_evidence"] = None
        return rows, "deferred"
    if action == "keep_distinct":
        row["membership_fingerprint"] = membership_fingerprint(row["payload"], root)
        row["status"] = "handled"
        row["apply_result"] = {"state": "resolved", "updated_paths": [], "errors": []}
        row["handled_at"] = handled_at
        row["handled_by"] = handled_by
        row["handled_evidence"] = f"keep_distinct fingerprint:{row['membership_fingerprint']}"
        return rows, "resolved"

    updated_paths: list[str] = []
    errors: list[str] = []
    evidence = "; ".join(
        f"{item.get('path', '')}: {item.get('evidence', '')}" for item in decision.get("terminal_evidence", [])
    )
    for relative in row["target_paths"]:
        try:
            path = candidate_path(root, relative)
            if not path.exists():
                raise FileNotFoundError(path)
            status = candidate_status(root, relative)
            if status in TERMINAL_STATUSES:
                continue
            if status not in OPEN_STATUSES:
                raise ValueError(f"unexpected non-open status {status!r}")
            update_frontmatter_fields(
                path,
                {
                    "status": "failed",
                    "candidate_status": "failed",
                    "last_reviewed_at": handled_at,
                    "last_decision": "failed_duplicate_of_terminal_sibling",
                    "evidence": f"group_handoff:{target_id}; terminal:{evidence}; reason:{decision['reason']}",
                    "next_action": "none",
                },
            )
            updated_paths.append(relative)
        except Exception as exc:  # preserve partial progress in the ledger for replay
            errors.append(f"{relative}: {exc}")
    # A close decision is complete only when the entire payload's open membership is terminal.
    # This catches representatives that Phase 2 marked postponed_duplicate but did not truly close.
    verify_targets = [str(path) for path in row["payload"].get("open_siblings", [])]
    unexpected = [path for path in verify_targets if candidate_status(root, path) not in TERMINAL_STATUSES]
    if unexpected:
        errors.append("targets_not_terminal:" + ",".join(unexpected))
    state = "partial" if errors else "resolved"
    row["membership_fingerprint"] = membership_fingerprint(row["payload"], root)
    row["apply_result"] = {"state": state, "updated_paths": updated_paths, "errors": errors}
    if errors:
        row["status"] = "pending"
        row["handled_at"] = None
        row["handled_by"] = None
        row["handled_evidence"] = None
        return rows, "partial"
    row["status"] = "handled"
    row["handled_at"] = handled_at
    row["handled_by"] = handled_by
    row["handled_evidence"] = f"close_siblings verified terminal: {','.join(verify_targets) or 'no remaining open targets'}"
    return rows, "resolved"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inbox", type=Path, default=DEFAULT_INBOX)
    parser.add_argument("--root", type=Path, default=ROOT)
    subparsers = parser.add_subparsers(dest="command", required=True)

    enqueue = subparsers.add_parser("enqueue", help="upsert queue rows as pending handoffs")
    enqueue.add_argument("--source-cycle-id", required=True)
    enqueue.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    enqueue.add_argument("--limit", type=int, default=1)

    pending = subparsers.add_parser("pending", help="print oldest eligible handoffs")
    pending.add_argument("--limit", type=int, default=-1)

    handled = subparsers.add_parser("acknowledge", help="legacy: mark one item handled without applying an action")
    handled.add_argument("--id", required=True)
    handled.add_argument("--evidence", required=True)
    handled.add_argument("--handled-by", default="log_cdx Phase 2")

    resolve_parser = subparsers.add_parser("resolve", help="validate and apply one group action idempotently")
    resolve_parser.add_argument("--id", required=True)
    resolve_parser.add_argument("--action", choices=sorted(VALID_ACTIONS), required=True)
    resolve_parser.add_argument("--group-key")
    resolve_parser.add_argument("--target-path", action="append", default=[])
    resolve_parser.add_argument("--reason", required=True)
    resolve_parser.add_argument("--terminal-evidence", action="append", default=[], help="PATH=EVIDENCE")
    resolve_parser.add_argument("--representative-decision")
    resolve_parser.add_argument("--retry-after")
    resolve_parser.add_argument("--handled-by", default="log_cdx Phase 2")

    subparsers.add_parser("audit", help="validate schema and lifecycle invariants")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.inbox)
    if args.command == "enqueue":
        queue_rows = read_jsonl(args.queue)
        if args.limit >= 0:
            queue_rows = queue_rows[: args.limit]
        rows, outcomes = enqueue_rows(rows, queue_rows, args.source_cycle_id, now_iso(), args.root)
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
    if args.command == "resolve":
        terminal_evidence = []
        for item in args.terminal_evidence:
            path, separator, evidence = item.partition("=")
            if not separator:
                raise ValueError("--terminal-evidence must be PATH=EVIDENCE")
            terminal_evidence.append({"path": path, "evidence": evidence})
        target_row = next((row for row in rows if row.get("id") == args.id), None)
        if target_row is None:
            raise KeyError(f"unknown handoff id: {args.id}")
        decision = {
            "group_key": args.group_key or target_row.get("group_key"),
            "action": args.action,
            "target_paths": args.target_path,
            "reason": args.reason,
            "terminal_evidence": terminal_evidence,
            "representative_decision": args.representative_decision,
            "retry_after": args.retry_after,
        }
        rows, result = resolve(rows, args.id, decision, args.handled_by, now_iso(), args.root)
        errors = validate_rows(rows)
        if errors:
            raise ValueError("; ".join(errors))
        write_jsonl_atomic(args.inbox, rows)
        print(json.dumps({"id": args.id, "result": result, "pending_count": len(pending_rows(rows))}, ensure_ascii=False))
        return 1 if result == "partial" else 0
    errors = validate_rows(rows)
    print(json.dumps({"rows": len(rows), "pending_count": len(pending_rows(rows)), "errors": errors}, ensure_ascii=False))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
