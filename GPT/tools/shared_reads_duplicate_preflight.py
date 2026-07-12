#!/usr/bin/env python3
"""Check shared-reads title and URL before writing a candidate file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from shared_reads_title_index import DEFAULT_TITLE_INDEX, duplicate_preflight, load_title_index


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", required=True)
    parser.add_argument("--url", required=True)
    parser.add_argument("--index", type=Path, default=DEFAULT_TITLE_INDEX)
    parser.add_argument("--log", type=Path, help="append skip/review evidence as JSONL")
    args = parser.parse_args()
    result = duplicate_preflight(args.title, args.url, load_title_index(args.index))
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    if args.log and result["decision"] in {"skip", "review"}:
        args.log.parent.mkdir(parents=True, exist_ok=True)
        with args.log.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(result, ensure_ascii=False, sort_keys=True) + "\n")
    return {"continue": 0, "review": 2, "skip": 3}[result["decision"]]


if __name__ == "__main__":
    raise SystemExit(main())
