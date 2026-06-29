#!/usr/bin/env python3
"""Close or inspect Codex Slack inbox JSONL rows.

`status` is the source of truth. This tool only closes rows when an operator
provides explicit evidence, so handled rows do not stay visible as pending.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
PATHS = {
    "directives": MEMORY_DIR / "slack_directives.jsonl",
    "broadcasts": MEMORY_DIR / "slack_broadcasts.jsonl",
}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig") as f:
        for line_no, line in enumerate(f, 1):
            if not line.strip():
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_no}: invalid JSONL: {exc}") from exc
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def select_path(name: str) -> Path:
    try:
        return PATHS[name]
    except KeyError as exc:
        raise SystemExit(f"unknown inbox: {name}") from exc


def pending(args: argparse.Namespace) -> int:
    results: dict[str, Any] = {}
    names = [args.inbox] if args.inbox else sorted(PATHS)
    for name in names:
        rows = read_jsonl(select_path(name))
        pending_rows = [row for row in rows if row.get("status") == "pending"]
        results[name] = {
            "path": str(select_path(name)),
            "rows": len(rows),
            "pending": [
                {
                    "id": row.get("id"),
                    "channel": row.get("channel"),
                    "datetime": row.get("datetime"),
                    "domain": row.get("domain"),
                    "permalink": row.get("permalink"),
                    "triage_status": row.get("triage_status"),
                }
                for row in pending_rows
            ],
        }
    print(json.dumps(results, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


def close(args: argparse.Namespace) -> int:
    if not args.evidence:
        raise SystemExit("--evidence is required when closing an inbox row")
    if not args.reason:
        raise SystemExit("--reason is required when closing an inbox row")
    evidence_text = "\n".join(str(x) for x in args.evidence)
    reason_text = str(args.reason)
    if args.require_rule_update:
        rule_markers = ("commit", "diff", ".md", ".py", "phase", "rule", "prompt")
        if not any(marker in evidence_text or marker in reason_text for marker in rule_markers):
            raise SystemExit("--require-rule-update needs evidence that a future-facing rule/script/prompt was changed")

    path = select_path(args.inbox)
    rows = read_jsonl(path)
    ids = set(args.id)
    found: set[str] = set()
    changed = 0
    for row in rows:
        row_id = str(row.get("id", ""))
        if row_id not in ids:
            continue
        found.add(row_id)
        if row.get("status") == "handled":
            continue
        row["status"] = "handled"
        row["handled_at"] = args.handled_at or now_iso()
        row["handled_by"] = args.handled_by
        row["handled_reason"] = args.reason
        row["evidence"] = args.evidence
        if args.supersedes:
            row["supersedes"] = args.supersedes
        if args.superseded_by:
            row["superseded_by"] = args.superseded_by
        changed += 1

    missing = sorted(ids - found)
    if missing:
        raise SystemExit(f"id not found in {path}: {', '.join(missing)}")

    if changed and not args.dry_run:
        write_jsonl(path, rows)

    print(json.dumps({"path": str(path), "changed": changed, "dry_run": args.dry_run}, ensure_ascii=False, sort_keys=True))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect or close Codex Slack inbox rows.")
    sub = parser.add_subparsers(dest="command", required=True)

    p_pending = sub.add_parser("pending", help="List rows whose status is still pending.")
    p_pending.add_argument("--inbox", choices=sorted(PATHS))
    p_pending.set_defaults(func=pending)

    p_close = sub.add_parser("close", help="Mark pending rows handled with explicit evidence.")
    p_close.add_argument("--inbox", choices=sorted(PATHS), required=True)
    p_close.add_argument("--id", action="append", required=True)
    p_close.add_argument("--handled-by", default="log_cdx_phase4c")
    p_close.add_argument("--handled-at")
    p_close.add_argument("--reason", required=True)
    p_close.add_argument("--evidence", action="append", required=True)
    p_close.add_argument("--require-rule-update", action="store_true")
    p_close.add_argument("--supersedes", action="append")
    p_close.add_argument("--superseded-by")
    p_close.add_argument("--dry-run", action="store_true")
    p_close.set_defaults(func=close)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
