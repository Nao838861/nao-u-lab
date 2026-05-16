"""Backfill shared-reads candidate lifecycle frontmatter.

This keeps the per-file candidate markdown as the source of truth and only
adds a missing candidate_status derived from existing gate_decision/posted
metadata. Existing candidate_status values are not overwritten.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANDIDATES_DIR = ROOT / "memory" / "shared_reads_candidates"

FRONTMATTER_RE = re.compile(r"\A---\r?\n(?P<body>.*?)(?P<end>\r?\n---\r?\n)", re.DOTALL)
FIELD_RE = re.compile(r"^(?P<key>[A-Za-z_][A-Za-z0-9_]*):(?P<value>.*)$")


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


def insert_candidate_status(frontmatter: str, status: str) -> str:
    lines = frontmatter.splitlines()
    for index, line in enumerate(lines):
        if line.startswith("gate_decision:"):
            lines.insert(index + 1, f"candidate_status: {status}")
            return "\n".join(lines) + "\n"
    lines.append(f"candidate_status: {status}")
    return "\n".join(lines) + "\n"


def audit_file(path: Path, apply: bool) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    parsed = parse_frontmatter(text)
    if parsed is None:
        return {"path": str(path.relative_to(ROOT)), "status": "no_frontmatter"}

    prefix, frontmatter, suffix = parsed
    fields = scalar_fields(frontmatter)
    has_posted = has_top_level_block(frontmatter, "posted")
    current_status = fields.get("candidate_status", "")
    inferred_status = infer_candidate_status(fields, has_posted)

    anomalies: list[str] = []
    gate_decision = fields.get("gate_decision", "").lower()
    if has_posted and gate_decision != "pass":
        anomalies.append("posted_block_without_gate_decision_pass")
    if current_status and current_status != inferred_status:
        anomalies.append(f"candidate_status_conflicts_with_inferred:{current_status}!={inferred_status}")

    changed = False
    if not current_status:
        frontmatter = insert_candidate_status(frontmatter, inferred_status)
        changed = True
        if apply:
            path.write_text(prefix + frontmatter + suffix, encoding="utf-8", newline="\n")

    return {
        "path": str(path.relative_to(ROOT)),
        "status": "changed" if changed else "unchanged",
        "candidate_status": current_status or inferred_status,
        "gate_decision": fields.get("gate_decision"),
        "has_posted": has_posted,
        "anomalies": anomalies,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write missing candidate_status values")
    parser.add_argument("--dir", type=Path, default=DEFAULT_CANDIDATES_DIR)
    args = parser.parse_args()

    candidate_dir = args.dir.resolve()
    results = [audit_file(path, args.apply) for path in sorted(candidate_dir.glob("*.md")) if path.name != "README.md"]
    summary = {
        "mode": "apply" if args.apply else "dry_run",
        "files": len(results),
        "changed": sum(1 for item in results if item["status"] == "changed"),
        "no_frontmatter": sum(1 for item in results if item["status"] == "no_frontmatter"),
        "anomalies": [item for item in results if item.get("anomalies")],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
