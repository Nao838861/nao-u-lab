#!/usr/bin/env python3
"""Audit shared-reads candidate duplicate title groups against the canonical index."""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

from shared_reads_title_index import (
    DEFAULT_CANDIDATES_DIR,
    DEFAULT_TITLE_INDEX,
    load_title_index,
    normalize_title_key,
    read_frontmatter,
    rel_path,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="List duplicate shared-reads title groups and whether they are indexed."
    )
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--title-index", type=Path, default=DEFAULT_TITLE_INDEX)
    parser.add_argument("--unindexed-only", action="store_true")
    parser.add_argument("--limit", type=int, default=20)
    return parser.parse_args()


def build_groups(candidates_dir: Path) -> list[dict[str, object]]:
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for path in sorted(candidates_dir.glob("*.md")):
        if path.name.upper() == "README.MD":
            continue
        meta = read_frontmatter(path)
        title = meta.get("title", "")
        title_key = normalize_title_key(title)
        if not title_key:
            continue
        grouped[title_key].append(
            {
                "path": rel_path(path),
                "status": meta.get("status") or meta.get("candidate_status") or "",
                "title": title,
                "url": meta.get("url", ""),
            }
        )

    rows: list[dict[str, object]] = []
    for title_key, items in grouped.items():
        if len(items) < 2:
            continue
        status_counts: dict[str, int] = defaultdict(int)
        urls = sorted({item["url"] for item in items if item["url"]})
        for item in items:
            status_counts[item["status"]] += 1
        rows.append(
            {
                "title_key": title_key,
                "title": items[0]["title"],
                "count": len(items),
                "status_counts": dict(sorted(status_counts.items())),
                "urls": urls,
                "paths": [item["path"] for item in items],
            }
        )
    rows.sort(key=lambda row: (-int(row["count"]), str(row["title_key"])))
    return rows


def main() -> int:
    args = parse_args()
    index = load_title_index(args.title_index)
    rows = build_groups(args.candidates_dir)
    if args.unindexed_only:
        rows = [row for row in rows if str(row["title_key"]) not in index]
    if args.limit >= 0:
        rows = rows[: args.limit]

    for row in rows:
        row["indexed"] = str(row["title_key"]) in index
        print(json.dumps(row, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
