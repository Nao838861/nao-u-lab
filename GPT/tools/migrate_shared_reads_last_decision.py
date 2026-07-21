"""shared-reads candidate の legacy last_decision を状態語へ正規化する。

状態は last_decision、重複や backfill の原因は専用 reason field と evidence に
分離する。既知の legacy 値だけを対象にし、未知値は変更せず集計へ残す。
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from backfill_shared_reads_candidate_status import (
    DEFAULT_CANDIDATES_DIR,
    parse_frontmatter,
    scalar_fields,
    set_or_insert_scalar,
)


LEGACY_DECISION_MIGRATIONS = {
    "failed_duplicate_of_terminal_sibling": ("failed", "duplicate_reason"),
    "fail_duplicate_posted": ("failed", "duplicate_reason"),
    "posted_existing_duplicate": ("posted", "duplicate_reason"),
    "posted_url_match": ("postponed", "duplicate_reason"),
    "postponed_duplicate": ("postponed", "duplicate_reason"),
    "postpone_lifecycle_backfill": ("postponed", "lifecycle_backfill_reason"),
}


def migrate_file(path: Path, apply: bool) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    parsed = parse_frontmatter(text)
    if parsed is None:
        return {"path": str(path), "status": "no_frontmatter"}

    prefix, frontmatter, suffix = parsed
    fields = scalar_fields(frontmatter)
    previous = fields.get("last_decision", "").casefold()
    migration = LEGACY_DECISION_MIGRATIONS.get(previous)
    if migration is None:
        return {"path": str(path), "status": "unchanged", "last_decision": previous}

    canonical_decision, reason_field = migration
    lifecycle_status = fields.get("status", "").casefold()
    candidate_status = fields.get("candidate_status", "").casefold()
    if lifecycle_status != canonical_decision or candidate_status != canonical_decision:
        return {
            "path": str(path),
            "status": "conflict",
            "last_decision": previous,
            "expected_status": canonical_decision,
            "actual_status": lifecycle_status,
            "actual_candidate_status": candidate_status,
        }

    if not fields.get(reason_field):
        frontmatter = set_or_insert_scalar(
            frontmatter,
            reason_field,
            previous,
            ["last_decision"],
        )
    frontmatter = set_or_insert_scalar(
        frontmatter,
        "last_decision",
        canonical_decision,
        ["last_reviewed_at"],
    )
    frontmatter = frontmatter.rstrip("\r\n")
    if apply:
        path.write_text(prefix + frontmatter + suffix, encoding="utf-8", newline="\n")
    return {
        "path": str(path),
        "status": "changed",
        "from": previous,
        "to": canonical_decision,
        "reason_field": reason_field,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    args = parser.parse_args()

    candidate_dir = args.dir.resolve()
    results = [
        migrate_file(path, args.apply)
        for path in sorted(candidate_dir.glob("*.md"))
        if path.name != "README.md"
    ]
    changed = [item for item in results if item["status"] == "changed"]
    conflicts = [item for item in results if item["status"] == "conflict"]
    summary = {
        "mode": "apply" if args.apply else "dry_run",
        "files": len(results),
        "changed": len(changed),
        "conflicts": conflicts,
        "migrations": {},
    }
    for item in changed:
        key = f"{item['from']}->{item['to']}"
        summary["migrations"][key] = summary["migrations"].get(key, 0) + 1
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if conflicts else 0


if __name__ == "__main__":
    raise SystemExit(main())
