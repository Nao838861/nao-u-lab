#!/usr/bin/env python3
"""Backfill triage hints for Codex Slack pending queues.

This does not mark anything handled. It only adds routing fields introduced in
Phase 4c so future cycles can tell why a row is pending and what would count as
done.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from codex_slack_directives import BROADCASTS_PATH, DIRECTIVES_PATH, triage_fields


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


TRIAGE_KEYS = {"action_type", "domain", "next_step", "done_condition", "triage_status"}


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8-sig") as f:
        for line in f:
            if not line.strip():
                continue
            rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def backfill(path: Path, queue_kind: str, dry_run: bool) -> dict[str, Any]:
    rows = read_jsonl(path)
    changed = 0
    pending = 0
    needs_human_review = 0
    domains: dict[str, int] = {}
    for row in rows:
        if row.get("status") == "pending":
            pending += 1
        hints = triage_fields(row, queue_kind)
        missing = {key: value for key, value in hints.items() if not row.get(key)}
        if missing:
            row.update(missing)
            changed += 1
        domain = str(row.get("domain") or "unknown")
        domains[domain] = domains.get(domain, 0) + 1
        if row.get("triage_status") == "needs_human_review":
            needs_human_review += 1

    if changed and not dry_run:
        write_jsonl(path, rows)

    return {
        "path": str(path),
        "rows": len(rows),
        "pending": pending,
        "changed": changed,
        "needs_human_review": needs_human_review,
        "domains": domains,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Backfill Slack pending triage hints.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    result = {
        "dry_run": args.dry_run,
        "directives": backfill(DIRECTIVES_PATH, "direct", args.dry_run),
        "broadcasts": backfill(BROADCASTS_PATH, "broadcast", args.dry_run),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
