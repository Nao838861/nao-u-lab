#!/usr/bin/env python3
"""Regenerate the shared-reads posted-source index from Slack raw and candidates."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from shared_reads_posted_source_index import (
    DEFAULT_POSTED_SOURCE_INDEX,
    DEFAULT_RAW_SLACK,
    build_index,
    render_index,
)
from shared_reads_title_index import DEFAULT_CANDIDATES_DIR


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw", type=Path, default=DEFAULT_RAW_SLACK)
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_POSTED_SOURCE_INDEX)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    generated_at = datetime.now().astimezone().isoformat(timespec="seconds")
    metadata, rows = build_index(args.raw, args.candidates_dir, generated_at)
    if args.check and args.output.exists():
        with args.output.open("r", encoding="utf-8-sig") as handle:
            first = json.loads(next((line for line in handle if line.strip()), "{}"))
        stable_generated_at = str(first.get("generated_at") or generated_at)
        metadata, rows = build_index(args.raw, args.candidates_dir, stable_generated_at)
        expected = render_index(metadata, rows)
        current = args.output.read_text(encoding="utf-8")
        if current != expected:
            print(f"stale shared-reads posted-source index: {args.output} expected_rows={len(rows)}")
            return 1
        print(f"shared-reads posted-source index ok: rows={len(rows)}")
        return 0
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(render_index(metadata, rows), encoding="utf-8", newline="\n")
    print(
        json.dumps(
            {
                "output": str(args.output),
                "rows": len(rows),
                "unresolved_posts": len(metadata["unresolved_posts"]),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
