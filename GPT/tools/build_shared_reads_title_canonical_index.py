#!/usr/bin/env python3
"""Build the shared-reads duplicate title canonical sidecar index."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any

from shared_reads_title_index import (
    DEFAULT_CANDIDATES_DIR,
    DEFAULT_TITLE_INDEX,
    normalize_title_key,
    read_frontmatter,
    rel_path,
)


TERMINAL_PRIORITY = {"posted": 0, "failed": 1}
TERMINAL_STATUSES = set(TERMINAL_PRIORITY)


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build memory/shared_reads_title_canonical_index.jsonl from duplicate title groups."
    )
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_TITLE_INDEX)
    parser.add_argument(
        "--terminal-only",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="only include duplicate groups whose candidates are all posted or failed",
    )
    parser.add_argument("--check", action="store_true", help="do not write; fail if output is stale")
    return parser.parse_args()


def candidate_rows(candidates_dir: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for path in sorted(candidates_dir.glob("*.md")):
        if path.name.upper() == "README.MD":
            continue
        meta = read_frontmatter(path)
        title = meta.get("title", "")
        title_key = normalize_title_key(title)
        if not title_key:
            continue
        rows.append(
            {
                "path": rel_path(path),
                "status": meta.get("status") or meta.get("candidate_status") or "",
                "title": title,
                "title_key": title_key,
                "url": meta.get("url", ""),
                "evidence": meta.get("evidence", ""),
                "last_decision": meta.get("last_decision") or meta.get("gate_decision") or "",
            }
        )
    return rows


def canonical_rank(row: dict[str, str]) -> tuple[int, str]:
    status = row.get("status", "")
    return (TERMINAL_PRIORITY.get(status, 9), row.get("path", ""))


def build_index_rows(
    candidates_dir: Path,
    generated_at: str,
    terminal_only: bool = True,
) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in candidate_rows(candidates_dir):
        grouped[row["title_key"]].append(row)

    index_rows: list[dict[str, Any]] = []
    for title_key, group in grouped.items():
        if len(group) < 2:
            continue
        statuses = {row.get("status", "") for row in group}
        if terminal_only and (not statuses or not statuses <= TERMINAL_STATUSES):
            continue
        terminal = [row for row in group if row.get("status") in TERMINAL_STATUSES]
        canonical = sorted(terminal or group, key=canonical_rank)[0]
        best_status = canonical.get("status", "")
        if terminal_only and best_status not in TERMINAL_STATUSES:
            continue

        siblings = sorted(group, key=lambda row: row["path"])
        status_counts = Counter(row.get("status", "") for row in siblings)
        duplicate_paths = [row["path"] for row in siblings if row["path"] != canonical["path"]]
        urls = sorted({row["url"] for row in siblings if row.get("url")})
        index_rows.append(
            {
                "title_key": title_key,
                "title": canonical.get("title") or siblings[0].get("title") or "",
                "canonical_path": canonical["path"],
                "best_status": best_status,
                "duplicate_paths": duplicate_paths,
                "siblings": [
                    {
                        "path": row["path"],
                        "status": row.get("status", ""),
                        "url": row.get("url", ""),
                    }
                    for row in siblings
                ],
                "status_counts": dict(sorted(status_counts.items())),
                "source_url": canonical.get("url") or (urls[0] if urls else ""),
                "source_urls": urls,
                "decision_note": (
                    "Phase 4c ISS-4A-002 backfill. Exact title duplicate group is terminal "
                    "(all candidates are posted or failed), so it should not enter Phase 2 "
                    "reevaluation unless manually reopened."
                ),
                "updated_at": generated_at,
            }
        )

    index_rows.sort(key=lambda row: (str(row["title_key"])))
    return index_rows


def render_jsonl(rows: list[dict[str, Any]], updated_at: str | None = None) -> str:
    rendered: list[str] = []
    for row in rows:
        item = dict(row)
        if updated_at is not None:
            item["updated_at"] = updated_at
        rendered.append(json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")
    return "".join(rendered)


def read_first_updated_at(path: Path) -> str | None:
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            try:
                value = json.loads(line).get("updated_at")
            except json.JSONDecodeError:
                return None
            return str(value) if value else None
    return None


def main() -> int:
    args = parse_args()
    generated_at = datetime.now().astimezone().isoformat(timespec="seconds")
    rows = build_index_rows(args.candidates_dir, generated_at, terminal_only=args.terminal_only)

    if args.check:
        current_updated_at = read_first_updated_at(args.output)
        expected = render_jsonl(rows, updated_at=current_updated_at)
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != expected:
            print(f"stale shared-reads title canonical index: {args.output} expected_rows={len(rows)}")
            return 1
        print(f"shared-reads title canonical index ok: rows={len(rows)}")
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(render_jsonl(rows), encoding="utf-8", newline="\n")
    suppressed = sum(
        count
        for row in rows
        for status, count in row.get("status_counts", {}).items()
        if status in {"postponed", "needs_review"}
    )
    print(json.dumps({"output": str(args.output), "rows": len(rows), "suppressible_siblings": suppressed}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
