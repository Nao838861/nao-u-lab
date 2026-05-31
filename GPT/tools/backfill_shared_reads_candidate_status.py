"""Audit and backfill shared-reads candidate lifecycle frontmatter.

The per-file candidate markdown is the source of truth. This script fills the
minimal lifecycle metadata used by Phase 2/3/4a without introducing a separate
index or append-only log.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANDIDATES_DIR = ROOT / "memory" / "shared_reads_candidates"

FRONTMATTER_RE = re.compile(r"\A---\r?\n(?P<body>.*?)(?P<end>\r?\n---\r?\n)", re.DOTALL)
FIELD_RE = re.compile(r"^(?P<key>[A-Za-z_][A-Za-z0-9_]*):(?P<value>.*)$")
STALE_AFTER_DAYS = 30
STATUS_BY_GATE_DECISION = {
    "pass": "ready_to_post",
    "postpone": "postponed",
    "fail": "failed",
}
NEXT_ACTION_BY_STATUS = {
    "posted": "none",
    "ready_to_post": "post_to_shared_reads",
    "postponed": "revise_or_research",
    "failed": "keep_for_reference",
    "needs_review": "evaluate_in_phase2",
}


def parse_frontmatter(text: str) -> tuple[str, str, str] | None:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return None
    return text[: match.start("body")], match.group("body"), text[match.end("body") :]


def scalar_fields(frontmatter: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    for line in frontmatter.splitlines():
        match = FIELD_RE.match(line)
        if not match:
            continue
        fields[match.group("key")] = match.group("value").strip().strip('"').strip("'")
    return fields


def has_top_level_block(frontmatter: str, key: str) -> bool:
    return any(line == f"{key}:" for line in frontmatter.splitlines())


def nested_block_fields(frontmatter: str, key: str) -> dict[str, str]:
    lines = frontmatter.splitlines()
    values: dict[str, str] = {}
    in_block = False
    for line in lines:
        if line == f"{key}:":
            in_block = True
            continue
        if in_block and line and not line.startswith(" "):
            break
        if not in_block:
            continue
        stripped = line.strip()
        match = FIELD_RE.match(stripped)
        if match:
            values[match.group("key")] = match.group("value").strip().strip('"').strip("'")
    return values


def infer_candidate_status(fields: dict[str, str], has_posted: bool, has_phase3_skip: bool) -> str:
    if has_posted:
        return "posted"
    if has_phase3_skip:
        return "postponed"
    gate_decision = fields.get("gate_decision", "").lower()
    if gate_decision in STATUS_BY_GATE_DECISION:
        return STATUS_BY_GATE_DECISION[gate_decision]
    return "needs_review"


def status_matches_gate(status: str, gate_decision: str, has_posted: bool, has_phase3_skip: bool) -> bool:
    if has_posted:
        return status == "posted"
    if has_phase3_skip:
        return status == "postponed"
    if gate_decision == "pass":
        return status == "ready_to_post"
    if gate_decision == "postpone":
        return status == "postponed"
    if gate_decision == "fail":
        return status == "failed"
    return status == "needs_review"


def parse_iso(value: str) -> datetime | None:
    if not value:
        return None
    normalized = value.strip().strip('"').strip("'")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def infer_stale_after(fields: dict[str, str]) -> str:
    base = parse_iso(fields.get("evaluated_at", "")) or parse_iso(fields.get("collected_at", ""))
    if base is None:
        return ""
    return (base + timedelta(days=STALE_AFTER_DAYS)).date().isoformat()


def infer_last_reviewed_at(
    fields: dict[str, str],
    posted_fields: dict[str, str],
    phase3_skip_fields: dict[str, str],
) -> str:
    return (
        posted_fields.get("posted_at", "")
        or phase3_skip_fields.get("skipped_at", "")
        or fields.get("evaluated_at", "")
        or fields.get("collected_at", "")
    )


def infer_last_decision(fields: dict[str, str], has_posted: bool, has_phase3_skip: bool) -> str:
    if has_posted:
        return "posted"
    if has_phase3_skip:
        return "postpone"
    return fields.get("gate_decision", "").lower() or "needs_review"


def infer_evidence(
    fields: dict[str, str],
    posted_fields: dict[str, str],
    phase3_skip_fields: dict[str, str],
    inferred_status: str,
    path: Path,
) -> str:
    permalink = posted_fields.get("permalink", "")
    if permalink:
        return permalink
    skip_evidence = phase3_skip_fields.get("evidence", "")
    if skip_evidence:
        return skip_evidence
    skip_reason = phase3_skip_fields.get("reason", "")
    if skip_reason:
        return f"phase3_skip:{skip_reason}"
    gate_decision = fields.get("gate_decision", "").lower()
    evaluated_at = fields.get("evaluated_at", "")
    if gate_decision:
        return f"gate_decision:{gate_decision}; evaluated_at:{evaluated_at}"
    return f"candidate_file:{path.name}; status:{inferred_status}"


def infer_next_action(status: str) -> str:
    return NEXT_ACTION_BY_STATUS.get(status, "evaluate_in_phase2")


def set_or_insert_scalar(frontmatter: str, key: str, value: str, after_keys: list[str]) -> str:
    lines = frontmatter.splitlines()
    for index, line in enumerate(lines):
        if line.startswith(f"{key}:"):
            lines[index] = f"{key}: {value}"
            return "\n".join(lines) + "\n"

    insert_at = len(lines)
    for index, line in enumerate(lines):
        if any(line.startswith(f"{after_key}:") for after_key in after_keys):
            if line.rstrip().endswith(":") or line.rstrip().endswith(": >-") or line.rstrip().endswith(": |-"):
                continue
            insert_at = index + 1
    lines.insert(insert_at, f"{key}: {value}")
    return "\n".join(lines) + "\n"


def repair_misplaced_scalars(frontmatter: str) -> tuple[str, bool]:
    lines = frontmatter.splitlines()
    changed = False
    index = 0
    block_headers = {"posted:", "phase3_skip:", "gate_reason: >-", "gate_reason: |-", "gate_reason: >", "gate_reason: |"}
    movable_keys = ("evidence:", "next_action:", "last_reviewed_at:", "last_decision:", "status:", "candidate_status:")

    while index < len(lines) - 1:
        if lines[index].strip() in block_headers and lines[index + 1].startswith(movable_keys):
            movable: list[str] = []
            cursor = index + 1
            while cursor < len(lines) and lines[cursor].startswith(movable_keys):
                movable.append(lines.pop(cursor))
            if cursor < len(lines) and lines[cursor].startswith(" ") and movable:
                for offset, moved in enumerate(movable):
                    lines.insert(index + offset, moved)
                index += len(movable) + 1
                changed = True
                continue
            for offset, moved in enumerate(movable):
                lines.insert(index + 1 + offset, moved)
            changed = True
            index += len(movable) + 1
            continue
        index += 1

    if not changed:
        return frontmatter, False
    return "\n".join(lines) + "\n", True


def insert_candidate_status(frontmatter: str, status: str) -> str:
    return set_or_insert_scalar(frontmatter, "candidate_status", status, ["gate_decision"])


def should_backfill(fields: dict[str, str], has_posted: bool, include_unreviewed: bool) -> bool:
    if include_unreviewed:
        return True
    return has_posted or bool(fields.get("gate_decision") or fields.get("evaluated_at"))


def audit_file(path: Path, apply: bool, fix_conflicts: bool, include_unreviewed: bool) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    parsed = parse_frontmatter(text)
    if parsed is None:
        return {"path": str(path.relative_to(ROOT)), "status": "no_frontmatter"}

    prefix, frontmatter, suffix = parsed
    frontmatter, repaired_layout = repair_misplaced_scalars(frontmatter)
    fields = scalar_fields(frontmatter)
    has_posted = has_top_level_block(frontmatter, "posted")
    has_phase3_skip = has_top_level_block(frontmatter, "phase3_skip")
    posted_fields = nested_block_fields(frontmatter, "posted")
    phase3_skip_fields = nested_block_fields(frontmatter, "phase3_skip")
    if not should_backfill(fields, has_posted or has_phase3_skip, include_unreviewed):
        return {
            "path": str(path.relative_to(ROOT)),
            "status": "skipped_unreviewed",
            "candidate_lifecycle_status": fields.get("status", ""),
            "candidate_status": fields.get("candidate_status", ""),
            "gate_decision": fields.get("gate_decision"),
            "has_posted": has_posted,
            "has_phase3_skip": has_phase3_skip,
            "anomalies": [],
        }

    current_status = fields.get("candidate_status", "")
    inferred_status = infer_candidate_status(fields, has_posted, has_phase3_skip)
    current_lifecycle_status = fields.get("status", "")
    current_last_reviewed_at = fields.get("last_reviewed_at", "")
    current_last_decision = fields.get("last_decision", "")
    current_evidence = fields.get("evidence", "")
    current_next_action = fields.get("next_action", "")
    inferred_last_reviewed_at = infer_last_reviewed_at(fields, posted_fields, phase3_skip_fields)
    inferred_last_decision = infer_last_decision(fields, has_posted, has_phase3_skip)
    inferred_evidence = infer_evidence(fields, posted_fields, phase3_skip_fields, inferred_status, path)
    inferred_next_action = infer_next_action(inferred_status)
    current_stale_after = fields.get("stale_after", "")
    inferred_stale_after = infer_stale_after(fields)
    has_supersedes = "supersedes" in fields

    anomalies: list[str] = []
    gate_decision = fields.get("gate_decision", "").lower()
    if has_posted and gate_decision != "pass":
        anomalies.append("posted_block_without_gate_decision_pass")
    if current_status and not status_matches_gate(current_status, gate_decision, has_posted, has_phase3_skip):
        anomalies.append(f"candidate_status_conflicts_with_inferred:{current_status}!={inferred_status}")
    if current_lifecycle_status and current_lifecycle_status != inferred_status:
        anomalies.append(f"status_conflicts_with_inferred:{current_lifecycle_status}!={inferred_status}")
    if current_stale_after and inferred_stale_after and current_stale_after != inferred_stale_after:
        anomalies.append(f"stale_after_differs_from_30d_default:{current_stale_after}!={inferred_stale_after}")

    changed = repaired_layout
    if not current_lifecycle_status:
        frontmatter = set_or_insert_scalar(frontmatter, "status", inferred_status, ["gate_decision", "candidate_status"])
        changed = True
    elif fix_conflicts and current_lifecycle_status != inferred_status:
        frontmatter = set_or_insert_scalar(frontmatter, "status", inferred_status, ["gate_decision", "candidate_status"])
        changed = True

    if not current_status:
        frontmatter = insert_candidate_status(frontmatter, inferred_status)
        changed = True
    elif fix_conflicts and current_status != inferred_status:
        frontmatter = insert_candidate_status(frontmatter, inferred_status)
        changed = True

    if not current_last_reviewed_at and inferred_last_reviewed_at:
        frontmatter = set_or_insert_scalar(frontmatter, "last_reviewed_at", f'"{inferred_last_reviewed_at}"', ["status", "candidate_status", "evaluated_at"])
        changed = True

    if not current_last_decision:
        frontmatter = set_or_insert_scalar(frontmatter, "last_decision", inferred_last_decision, ["last_reviewed_at", "gate_decision"])
        changed = True

    if not current_evidence:
        frontmatter = set_or_insert_scalar(frontmatter, "evidence", f'"{inferred_evidence}"', ["last_decision"])
        changed = True

    if not current_next_action:
        frontmatter = set_or_insert_scalar(frontmatter, "next_action", inferred_next_action, ["evidence"])
        changed = True

    if not current_stale_after and inferred_stale_after:
        frontmatter = set_or_insert_scalar(frontmatter, "stale_after", f'"{inferred_stale_after}"', ["evaluated_at", "candidate_status", "status"])
        changed = True

    if not has_supersedes:
        frontmatter = set_or_insert_scalar(frontmatter, "supersedes", "[]", ["stale_after"])
        changed = True

    if changed and apply:
        path.write_text(prefix + frontmatter + suffix, encoding="utf-8", newline="\n")

    return {
        "path": str(path.relative_to(ROOT)),
        "status": "changed" if changed else "unchanged",
        "candidate_lifecycle_status": current_lifecycle_status or inferred_status,
        "candidate_status": current_status or inferred_status,
        "gate_decision": fields.get("gate_decision"),
        "has_posted": has_posted,
        "has_phase3_skip": has_phase3_skip,
        "last_reviewed_at": current_last_reviewed_at or inferred_last_reviewed_at,
        "last_decision": current_last_decision or inferred_last_decision,
        "stale_after": current_stale_after or inferred_stale_after,
        "has_supersedes": has_supersedes or changed,
        "anomalies": anomalies,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write missing lifecycle metadata")
    parser.add_argument(
        "--fix-conflicts",
        action="store_true",
        help="also correct candidate_status values that conflict with gate_decision/posted",
    )
    parser.add_argument(
        "--include-unreviewed",
        action="store_true",
        help="also mark candidate files without Phase 2/3 evidence as needs_review",
    )
    parser.add_argument("--dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    args = parser.parse_args()

    candidate_dir = args.dir.resolve()
    results = [
        audit_file(path, args.apply, args.fix_conflicts, args.include_unreviewed)
        for path in sorted(candidate_dir.glob("*.md"))
        if path.name != "README.md"
    ]
    status_counts: dict[str, int] = {}
    for item in results:
        value = str(item.get("candidate_lifecycle_status") or item.get("candidate_status") or item.get("status"))
        status_counts[value] = status_counts.get(value, 0) + 1
    summary = {
        "mode": "apply" if args.apply else "dry_run",
        "fix_conflicts": args.fix_conflicts,
        "include_unreviewed": args.include_unreviewed,
        "files": len(results),
        "changed": sum(1 for item in results if item["status"] == "changed"),
        "skipped_unreviewed": sum(1 for item in results if item["status"] == "skipped_unreviewed"),
        "no_frontmatter": sum(1 for item in results if item["status"] == "no_frontmatter"),
        "status_counts": dict(sorted(status_counts.items())),
        "anomalies": [item for item in results if item.get("anomalies")],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
