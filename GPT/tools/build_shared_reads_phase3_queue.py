#!/usr/bin/env python3
"""Build the regenerable queue of ready-to-post candidates for Phase 3."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from shared_reads_phase3_handoff import (
    DEFAULT_INBOX,
    ROOT,
    lease_suppresses,
    state_fingerprint,
    state_snapshot_from_meta,
)
from shared_reads_posted_source_index import (
    DEFAULT_POSTED_SOURCE_INDEX,
    DEFAULT_RAW_SLACK,
    find_source_match,
    load_index as load_posted_source_index,
)
from shared_reads_title_index import DEFAULT_CANDIDATES_DIR, normalize_title_key, read_frontmatter, rel_path
from shared_reads_group_handoff import read_jsonl


DEFAULT_OUTPUT = ROOT / "memory" / "shared_reads_phase3_queue.jsonl"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def build_queue(
    candidates_dir: Path,
    inbox_rows: list[dict[str, Any]],
    posted_source_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(candidates_dir.glob("*.md")):
        if path.name.casefold() == "readme.md":
            continue
        meta = read_frontmatter(path)
        snapshot = state_snapshot_from_meta(meta)
        if snapshot["status"] != "ready_to_post" or snapshot["candidate_status"] != "ready_to_post":
            continue
        if not snapshot["evaluated_at"] or not snapshot["title"] or not snapshot["url"]:
            continue
        posted_match, posted_reason = find_source_match(snapshot["url"], posted_source_rows)
        if posted_match is not None and posted_match.get("posted_verified"):
            continue
        relative = rel_path(path)
        fingerprint = state_fingerprint(snapshot)
        if lease_suppresses(relative, fingerprint, inbox_rows):
            continue
        records.append(
            {
                "schema_version": 1,
                "path": relative,
                "title": snapshot["title"],
                "url": snapshot["url"],
                "evaluated_at": snapshot["evaluated_at"],
                "stale_after": snapshot["stale_after"],
                "status": snapshot["status"],
                "candidate_status": snapshot["candidate_status"],
                "state_fingerprint": fingerprint,
                "selected_candidate_state": snapshot,
                "title_evidence": f"{relative} frontmatter:title_key={normalize_title_key(snapshot['title'])}",
                "url_evidence": f"{relative} frontmatter:url={snapshot['url']}",
                "posted_source_check": posted_reason or "no_verified_posted_source_match",
                "priority_reason": "oldest evaluated ready_to_post candidate first",
            }
        )
    records.sort(
        key=lambda row: (
            str(row.get("evaluated_at") or ""),
            str(row.get("stale_after") or "9999-12-31"),
            str(row.get("path") or ""),
        )
    )
    for order, row in enumerate(records, start=1):
        row["priority_order"] = order
    return records


def render_jsonl(records: list[dict[str, Any]]) -> str:
    return "".join(
        json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
        for record in records
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--inbox", type=Path, default=DEFAULT_INBOX)
    parser.add_argument("--posted-source-index", type=Path, default=DEFAULT_POSTED_SOURCE_INDEX)
    parser.add_argument("--raw-slack", type=Path, default=DEFAULT_RAW_SLACK)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--limit", type=int, default=-1)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    inbox_rows = read_jsonl(args.inbox)
    posted_rows, posted_status = load_posted_source_index(
        args.posted_source_index,
        raw_path=args.raw_slack,
        candidates_dir=args.candidates_dir,
    )
    records = build_queue(args.candidates_dir, inbox_rows, posted_rows)
    if args.limit >= 0:
        records = records[: args.limit]
    rendered = render_jsonl(records)
    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != rendered:
            print(f"stale shared-reads Phase 3 queue: {args.output} expected_rows={len(records)}")
            return 1
        print(
            json.dumps(
                {"queue_rows": len(records), "posted_source_status": posted_status, "state": "fresh"},
                ensure_ascii=False,
            )
        )
        return 0
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8", newline="\n")
    print(
        json.dumps(
            {"output": str(args.output), "queue_rows": len(records), "posted_source_status": posted_status},
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
