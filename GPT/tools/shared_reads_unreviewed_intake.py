"""Find valid shared-reads candidates that have never reached Phase 2.

Candidate markdown remains the source of truth.  This command only scans and
reports; it never adds provisional lifecycle fields or mutates a candidate.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
import re

from backfill_shared_reads_candidate_status import parse_frontmatter, scalar_fields


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANDIDATES_DIR = ROOT / "memory" / "shared_reads_candidates"
DEFAULT_STAGING = ROOT / "log" / "cycle_staging_log_cdx.md"

REQUIRED_PROVENANCE_FIELDS = ("title", "url", "collected_at", "collected_by")
EVALUATION_FIELDS = ("status", "candidate_status", "gate_decision", "evaluated_at")
PHASE1_SECTION_RE = re.compile(
    r"^## Phase 1:[^\n]*\n(?P<body>.*?)(?=^## Phase 2:|\Z)",
    re.MULTILINE | re.DOTALL,
)
CANDIDATE_PATH_RE = re.compile(
    r"memory[\\/]shared_reads_candidates[\\/][^\s\]\[(){}<>]+?\.md",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class IntakeCandidate:
    path: str
    title: str
    collected_at: str
    sort_time: datetime

    def as_dict(self) -> dict[str, str]:
        return {
            "path": self.path,
            "title": self.title,
            "collected_at": self.collected_at,
        }


def normalize_relative_path(value: str) -> str:
    return value.strip("`'\".,:;。、").replace("\\", "/")


def workspace_relative(path: Path, workspace_root: Path) -> str:
    try:
        return path.resolve().relative_to(workspace_root.resolve()).as_posix()
    except ValueError:
        return path.resolve().as_posix()


def parse_sort_time(value: str) -> datetime | None:
    try:
        parsed = datetime.fromisoformat(value.strip().strip('"').strip("'"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def inspect_candidates(
    candidates_dir: Path = DEFAULT_CANDIDATES_DIR,
    workspace_root: Path = ROOT,
) -> tuple[list[IntakeCandidate], list[dict[str, object]], int]:
    valid: list[IntakeCandidate] = []
    malformed: list[dict[str, object]] = []
    evaluated_or_in_progress = 0

    for path in sorted(candidates_dir.glob("*.md")):
        if path.name.casefold() == "readme.md":
            continue
        relative = workspace_relative(path, workspace_root)
        parsed = parse_frontmatter(path.read_text(encoding="utf-8"))
        if parsed is None:
            malformed.append(
                {
                    "path": relative,
                    "reason": "missing_or_unclosed_frontmatter",
                    "missing_fields": list(REQUIRED_PROVENANCE_FIELDS),
                }
            )
            continue

        fields = scalar_fields(parsed[1])
        if any(fields.get(field, "").strip() for field in EVALUATION_FIELDS):
            evaluated_or_in_progress += 1
            continue

        missing = [
            field
            for field in REQUIRED_PROVENANCE_FIELDS
            if not fields.get(field, "").strip()
        ]
        sort_time = parse_sort_time(fields.get("collected_at", ""))
        if sort_time is None and "collected_at" not in missing:
            missing.append("collected_at(valid ISO 8601)")
        if missing:
            malformed.append(
                {
                    "path": relative,
                    "reason": "missing_or_invalid_phase1_provenance",
                    "missing_fields": missing,
                }
            )
            continue

        assert sort_time is not None
        valid.append(
            IntakeCandidate(
                path=relative,
                title=fields["title"],
                collected_at=fields["collected_at"],
                sort_time=sort_time,
            )
        )

    valid.sort(key=lambda item: (item.sort_time, item.path.casefold()))
    malformed.sort(key=lambda item: str(item["path"]).casefold())
    return valid, malformed, evaluated_or_in_progress


def phase1_candidate_paths(staging_path: Path) -> set[str]:
    if not staging_path.exists():
        return set()
    match = PHASE1_SECTION_RE.search(staging_path.read_text(encoding="utf-8-sig"))
    if not match:
        return set()
    return {
        normalize_relative_path(found.group(0))
        for found in CANDIDATE_PATH_RE.finditer(match.group("body"))
    }


def build_report(
    candidates_dir: Path,
    workspace_root: Path,
    limit: int,
    staging_path: Path | None = None,
) -> dict[str, object]:
    valid, malformed, evaluated_or_in_progress = inspect_candidates(candidates_dir, workspace_root)
    phase1_paths = phase1_candidate_paths(staging_path) if staging_path else set()
    eligible = [item for item in valid if normalize_relative_path(item.path) not in phase1_paths]
    selected = eligible[:limit]
    excluded = [item for item in valid if normalize_relative_path(item.path) in phase1_paths]
    return {
        "valid_unreviewed_count": len(valid),
        "malformed_count": len(malformed),
        "evaluated_or_in_progress_count": evaluated_or_in_progress,
        "phase1_excluded_count": len(excluded),
        "eligible_count": len(eligible),
        "selection_limit": limit,
        "oldest_collected_at": valid[0].collected_at if valid else None,
        "selected": [item.as_dict() for item in selected],
        "phase1_excluded_paths": [item.path for item in excluded],
        "malformed": malformed,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("audit", "select"))
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--candidates-dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    parser.add_argument("--workspace-root", type=Path, default=ROOT)
    parser.add_argument("--staging", type=Path, default=DEFAULT_STAGING)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.limit < 1:
        raise SystemExit("--limit must be at least 1")
    staging = args.staging if args.mode == "select" else None
    report = build_report(args.candidates_dir, args.workspace_root, args.limit, staging)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
