"""Build a small Phase 2 reevaluation queue for shared-reads candidates.

This is intentionally a generated view over candidate frontmatter. It does not
modify candidate files; Phase 2 owns the actual pass/postpone/fail decision.
"""

from __future__ import annotations

import argparse
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

from backfill_shared_reads_candidate_status import (
    DEFAULT_CANDIDATES_DIR,
    ROOT,
    audit_file,
)


DEFAULT_LIMIT = 10
JST = timezone(timedelta(hours=9))


def yaml_quote(value: object) -> str:
    text = str(value).replace("\\", "\\\\").replace('"', '\\"')
    return f'"{text}"'


def build_queue(candidate_dir: Path, today: date, limit: int) -> dict[str, object]:
    results = [
        audit_file(path, apply=False, fix_conflicts=False, include_unreviewed=True, today=today)
        for path in sorted(candidate_dir.glob("*.md"))
        if path.name != "README.md"
    ]
    overdue = [
        item
        for item in results
        if item.get("overdue_for_reassessment")
    ]
    overdue.sort(key=lambda item: (str(item.get("stale_after") or ""), str(item.get("path") or "")))
    selected = overdue[:limit]
    items = [
        {
            "path": str(item["path"]).replace("\\", "/"),
            "status": item.get("candidate_lifecycle_status") or item.get("candidate_status") or "",
            "stale_after": item.get("stale_after") or "",
            "reason": "stale_after reached; route to next Phase 2 reevaluation",
        }
        for item in selected
    ]
    return {
        "generated_at": datetime.now(JST).isoformat(timespec="seconds"),
        "today": today.isoformat(),
        "source": str(candidate_dir.relative_to(ROOT)).replace("\\", "/"),
        "max_items": limit,
        "total_stale_count": len(overdue),
        "remaining_stale_count": max(0, len(overdue) - len(items)),
        "items": items,
    }


def print_yaml(queue: dict[str, object]) -> None:
    print("shared_reads_reevaluation_queue:")
    for key in ("generated_at", "today", "source"):
        print(f"  {key}: {yaml_quote(queue[key])}")
    print(f"  max_items: {queue['max_items']}")
    print(f"  total_stale_count: {queue['total_stale_count']}")
    print(f"  remaining_stale_count: {queue['remaining_stale_count']}")
    print("  items:")
    items = queue["items"]
    if not items:
        print("    []")
        return
    for item in items:
        print(f"    - path: {yaml_quote(item['path'])}")
        print(f"      status: {yaml_quote(item['status'])}")
        print(f"      stale_after: {yaml_quote(item['stale_after'])}")
        print(f"      reason: {yaml_quote(item['reason'])}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--today", default=date.today().isoformat())
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT)
    args = parser.parse_args()

    if args.limit < 1:
        parser.error("--limit must be at least 1")
    candidate_dir = args.dir.resolve()
    queue = build_queue(candidate_dir, date.fromisoformat(args.today), args.limit)
    print_yaml(queue)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
