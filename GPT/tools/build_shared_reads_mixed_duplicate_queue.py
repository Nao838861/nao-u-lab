#!/usr/bin/env python3
"""Build the shared-reads mixed duplicate title queue."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from shared_reads_title_index import DEFAULT_CANDIDATES_DIR, normalize_title_key, read_frontmatter, rel_path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "memory" / "shared_reads_mixed_duplicate_queue.jsonl"
TERMINAL_STATUSES = {"posted", "failed"}
OPEN_STATUSES = {"ready_to_post", "postponed", "needs_review"}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build memory/shared_reads_mixed_duplicate_queue.jsonl from duplicate candidate titles."
    )
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    return parser.parse_args()


def candidate_rows(candidates_dir: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for path in sorted(candidates_dir.glob("*.md")):
        if path.name.upper() == "README.MD":
            continue
        meta = read_frontmatter(path)
        title = meta.get("title", "")
        group_key = normalize_title_key(title)
        if not group_key:
            continue
        rows.append(
            {
                "path": rel_path(path),
                "title": title,
                "group_key": group_key,
                "status": meta.get("status") or meta.get("candidate_status") or "",
                "url": meta.get("url", ""),
                "stale_after": meta.get("stale_after", ""),
                "last_decision": meta.get("last_decision") or meta.get("gate_decision") or "",
            }
        )
    return rows


def recommended_representatives(group: list[dict[str, str]]) -> list[str]:
    open_rank = {"ready_to_post": 0, "postponed": 1, "needs_review": 2}
    open_rows = [row for row in group if row["status"] in OPEN_STATUSES]
    ranked = sorted(open_rows, key=lambda row: (open_rank.get(row["status"], 9), row["stale_after"], row["path"]))
    return [row["path"] for row in ranked[:3]]


def recommended_action(statuses: set[str]) -> str:
    if "ready_to_post" in statuses and "posted" in statuses:
        return "merge_duplicate"
    if "needs_review" in statuses:
        return "review_representative"
    return "reevaluate_representative"


def build_queue(candidates_dir: Path) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in candidate_rows(candidates_dir):
        grouped[row["group_key"]].append(row)

    records: list[dict[str, Any]] = []
    for group_key, group in grouped.items():
        if len(group) < 2:
            continue
        statuses = {row["status"] for row in group}
        if not (statuses & TERMINAL_STATUSES and statuses & OPEN_STATUSES):
            continue

        status_counts = Counter(row["status"] for row in group)
        sorted_group = sorted(group, key=lambda row: row["path"])
        terminal_paths = [row["path"] for row in sorted_group if row["status"] in TERMINAL_STATUSES]
        open_paths = [row["path"] for row in sorted_group if row["status"] in OPEN_STATUSES]
        representative_paths = recommended_representatives(sorted_group)
        urls = sorted({row["url"] for row in sorted_group if row["url"]})
        records.append(
            {
                "group_key": group_key,
                "title": sorted_group[0]["title"],
                "status_counts": dict(sorted(status_counts.items())),
                "representative_paths": representative_paths,
                "evidence": {
                    "terminal_paths": terminal_paths,
                    "open_paths": open_paths,
                    "source_urls": urls,
                },
                "recommended_action": recommended_action(statuses),
            }
        )

    records.sort(
        key=lambda row: (
            0 if row["recommended_action"] == "merge_duplicate" else 1,
            -sum(row["status_counts"].values()),
            row["group_key"],
        )
    )
    return records


def render_jsonl(records: list[dict[str, Any]]) -> str:
    return "".join(json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for record in records)


def main() -> int:
    args = parse_args()
    records = build_queue(args.candidates_dir)
    rendered = render_jsonl(records)

    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != rendered:
            print(f"stale shared-reads mixed duplicate queue: {args.output} expected_rows={len(records)}")
            return 1
        print(f"shared-reads mixed duplicate queue ok: rows={len(records)}")
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8", newline="\n")
    print(json.dumps({"output": str(args.output), "rows": len(records)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
