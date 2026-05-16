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


def infer_candidate_status(fields: dict[str, str], has_posted: bool) -> str:
    if has_posted:
        return "posted"
    gate_decision = fields.get("gate_decision", "").lower()
    if gate_decision == "pass":
        return "ready_to_post"
    if gate_decision == "postpone":
        return "postponed"
    if gate_decision == "fail":
        return "failed"
    return "needs_review"


def status_matches_gate(status: str, gate_decision: str, has_posted: bool) -> bool:
    if has_posted:
        return status == "posted"
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


def set_or_insert_scalar(frontmatter: str, key: str, value: str, after_keys: list[str]) -> str:
    lines = frontmatter.splitlines()
    for index, line in enumerate(lines):
        if line.startswith(f"{key}:"):
            lines[index] = f"{key}: {value}"
            return "\n".join(lines) + "\n"

    insert_at = len(lines)
    for index, line in enumerate(lines):
        if any(line.startswith(f"{after_key}:") for after_key in after_keys):
            insert_at = index + 1
    lines.insert(insert_at, f"{key}: {value}")
    return "\n".join(lines) + "\n"


def insert_candidate_status(frontmatter: str, status: str) -> str:
    return set_or_insert_scalar(frontmatter, "candidate_status", status, ["gate_decision"])


def audit_file(path: Path, apply: bool, fix_conflicts: bool) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    parsed = parse_frontmatter(text)
    if parsed is None:
        return {"path": str(path.relative_to(ROOT)), "status": "no_frontmatter"}

    prefix, frontmatter, suffix = parsed
    fields = scalar_fields(frontmatter)
    has_posted = has_top_level_block(frontmatter, "posted")
    current_status = fields.get("candidate_status", "")
    inferred_status = infer_candidate_status(fields, has_posted)
    current_stale_after = fields.get("stale_after", "")
    inferred_stale_after = infer_stale_after(fields)
    has_supersedes = "supersedes" in fields

    anomalies: list[str] = []
    gate_decision = fields.get("gate_decision", "").lower()
    if has_posted and gate_decision != "pass":
        anomalies.append("posted_block_without_gate_decision_pass")
    if current_status and not status_matches_gate(current_status, gate_decision, has_posted):
        anomalies.append(f"candidate_status_conflicts_with_inferred:{current_status}!={inferred_status}")
    if current_stale_after and inferred_stale_after and current_stale_after != inferred_stale_after:
        anomalies.append(f"stale_after_differs_from_30d_default:{current_stale_after}!={inferred_stale_after}")

    changed = False
    if not current_status:
        frontmatter = insert_candidate_status(frontmatter, inferred_status)
        changed = True
    elif fix_conflicts and current_status != inferred_status:
        frontmatter = insert_candidate_status(frontmatter, inferred_status)
        changed = True

    if not current_stale_after and inferred_stale_after:
        frontmatter = set_or_insert_scalar(frontmatter, "stale_after", f'"{inferred_stale_after}"', ["evaluated_at", "candidate_status"])
        changed = True

    if not has_supersedes:
        frontmatter = set_or_insert_scalar(frontmatter, "supersedes", "[]", ["stale_after"])
        changed = True

    if changed and apply:
        path.write_text(prefix + frontmatter + suffix, encoding="utf-8", newline="\n")

    return {
        "path": str(path.relative_to(ROOT)),
        "status": "changed" if changed else "unchanged",
        "candidate_status": current_status or inferred_status,
        "gate_decision": fields.get("gate_decision"),
        "has_posted": has_posted,
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
    parser.add_argument("--dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    args = parser.parse_args()

    candidate_dir = args.dir.resolve()
    results = [
        audit_file(path, args.apply, args.fix_conflicts)
        for path in sorted(candidate_dir.glob("*.md"))
        if path.name != "README.md"
    ]
    summary = {
        "mode": "apply" if args.apply else "dry_run",
        "fix_conflicts": args.fix_conflicts,
        "files": len(results),
        "changed": sum(1 for item in results if item["status"] == "changed"),
        "no_frontmatter": sum(1 for item in results if item["status"] == "no_frontmatter"),
        "anomalies": [item for item in results if item.get("anomalies")],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
