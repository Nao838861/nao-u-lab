#!/usr/bin/env python3
"""Build duplicate title groups that contain at least one open candidate."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from build_shared_reads_mixed_duplicate_queue import (
    OPEN_STATUSES,
    TERMINAL_STATUSES,
    candidate_rows,
    recommended_representatives,
)
from shared_reads_title_index import DEFAULT_CANDIDATES_DIR, canonicalize_url


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "memory" / "shared_reads_open_duplicate_group_queue.jsonl"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build open duplicate title groups from shared-reads candidate frontmatter."
    )
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    return parser.parse_args()


def source_url_evidence(group: list[dict[str, str]]) -> list[dict[str, Any]]:
    paths_by_url: dict[str, list[str]] = defaultdict(list)
    for row in group:
        canonical_url = canonicalize_url(row.get("url", ""))
        if canonical_url:
            paths_by_url[canonical_url].append(row["path"])
    return [
        {"url": url, "paths": sorted(paths)}
        for url, paths in sorted(paths_by_url.items())
    ]


def build_queue(candidates_dir: Path) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in candidate_rows(candidates_dir):
        grouped[row["group_key"]].append(row)

    records: list[dict[str, Any]] = []
    for group_key, group in grouped.items():
        if len(group) < 2:
            continue
        open_rows = [row for row in group if row["status"] in OPEN_STATUSES]
        terminal_rows = [row for row in group if row["status"] in TERMINAL_STATUSES]
        if not open_rows:
            continue
        if terminal_rows:
            group_kind = "mixed"
        elif len(open_rows) == len(group):
            group_kind = "all_open"
        else:
            # Unknown lifecycle states are not safe to classify as all-open.
            continue

        sorted_group = sorted(group, key=lambda row: row["path"])
        status_counts = Counter(row["status"] for row in sorted_group)
        records.append(
            {
                "group_key": group_key,
                "group_kind": group_kind,
                "title": sorted_group[0]["title"],
                "status_counts": dict(sorted(status_counts.items())),
                "open_paths": [row["path"] for row in sorted_group if row["status"] in OPEN_STATUSES],
                "terminal_paths": [
                    row["path"] for row in sorted_group if row["status"] in TERMINAL_STATUSES
                ],
                "source_url_evidence": source_url_evidence(sorted_group),
                "representative_paths": recommended_representatives(sorted_group),
                "recommended_action": "review_group",
            }
        )

    records.sort(
        key=lambda row: (
            0 if row["group_kind"] == "mixed" else 1,
            -sum(row["status_counts"].values()),
            row["group_key"],
        )
    )
    return records


def render_jsonl(records: list[dict[str, Any]]) -> str:
    return "".join(
        json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
        for record in records
    )


def main() -> int:
    args = parse_args()
    records = build_queue(args.candidates_dir)
    rendered = render_jsonl(records)
    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != rendered:
            print(f"stale shared-reads open duplicate group queue: {args.output} expected_rows={len(records)}")
            return 1
        print(f"shared-reads open duplicate group queue ok: rows={len(records)}")
        return 0
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8", newline="\n")
    print(json.dumps({"output": str(args.output), "rows": len(records)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
