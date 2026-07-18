#!/usr/bin/env python3
"""Check shared-reads title and URL before writing a candidate file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from shared_reads_posted_source_index import (
    DEFAULT_POSTED_SOURCE_INDEX,
    DEFAULT_RAW_SLACK,
    load_index as load_posted_source_index,
)
from shared_reads_title_index import DEFAULT_TITLE_INDEX, duplicate_preflight, load_title_index
from shared_reads_title_index import DEFAULT_CANDIDATES_DIR


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", required=True)
    parser.add_argument("--url", required=True)
    parser.add_argument("--index", type=Path, default=DEFAULT_TITLE_INDEX)
    parser.add_argument("--posted-source-index", type=Path, default=DEFAULT_POSTED_SOURCE_INDEX)
    parser.add_argument("--raw-slack", type=Path, default=DEFAULT_RAW_SLACK)
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--log", type=Path, help="append skip/review evidence as JSONL")
    args = parser.parse_args()
    posted_rows, posted_status = load_posted_source_index(
        args.posted_source_index,
        raw_path=args.raw_slack,
        candidates_dir=args.candidates_dir,
    )
    result = duplicate_preflight(
        args.title,
        args.url,
        load_title_index(args.index),
        posted_source_rows=posted_rows,
        posted_source_status=posted_status,
    )
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    if args.log and result["decision"] in {"skip", "review"}:
        args.log.parent.mkdir(parents=True, exist_ok=True)
        with args.log.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(result, ensure_ascii=False, sort_keys=True) + "\n")
    return {"continue": 0, "review": 2, "skip": 3}[result["decision"]]


if __name__ == "__main__":
    raise SystemExit(main())
