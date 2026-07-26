#!/usr/bin/env python3
"""Health checks for the GPT memory system."""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import memory_recall
import memory_lifecycle
import topology_audit
import audit_atom_mirror_drift
from atoms_fileformat import CANONICAL_OVERLAY_FILENAME
from atom_quality import atom_quality_report


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
RAW_SHARED_READS_PATH = MEMORY_DIR / "raw" / "slack_archive" / "shared-reads.jsonl"
STATE_PATH = MEMORY_DIR / "state.json"
SLACK_STATE_PATH = MEMORY_DIR / "slack_ingest_state.json"
RECALL_LOG_PATH = MEMORY_DIR / "recall_log.jsonl"
ATOM_STATS_PATH = MEMORY_DIR / "atom_stats.json"
TITLE_QUALITY_AUDIT_PATH = MEMORY_DIR / "atoms" / "title_quality_audit.jsonl"
CANONICAL_OVERLAY_PATH = MEMORY_DIR / "atoms" / CANONICAL_OVERLAY_FILENAME


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rows.append(json.loads(line))
    return rows


def title_quality_audit_summary() -> dict[str, Any]:
    rows = load_jsonl(TITLE_QUALITY_AUDIT_PATH)
    groups = {str(row.get("title_group_id")) for row in rows if row.get("title_group_id")}

    def has_raw_title_debt(row: dict[str, Any]) -> bool:
        legacy_value = bool(row.get("generic_title") or int(row.get("raw_title_count") or 0) > 1)
        return bool(row.get("raw_title_debt", legacy_value))

    def has_unresolved_display(row: dict[str, Any]) -> bool:
        legacy_value = bool(
            row.get("recall_visible")
            and has_raw_title_debt(row)
            and not row.get("semantic_alias_covered")
            and not row.get("source_ts")
            and not row.get("sample_hint")
        )
        return bool(row.get("effective_display_unresolved", legacy_value))

    raw_title_debt_rows = [
        row
        for row in rows
        if has_raw_title_debt(row)
    ]
    effective_display_unresolved_rows = [
        row
        for row in rows
        if has_unresolved_display(row)
    ]
    raw_title_debt_groups = {
        str(row.get("title_group_id")) for row in raw_title_debt_rows if row.get("title_group_id")
    }
    unresolved_groups = {
        str(row.get("title_group_id"))
        for row in effective_display_unresolved_rows
        if row.get("title_group_id")
    }
    action_counts = Counter(str(row.get("recommended_action") or "unknown") for row in rows)
    reason_counts = Counter(str(reason) for row in rows for reason in row.get("detection_reasons", []))
    generated_at = str(rows[0].get("generated_at") or "") if rows else ""
    return {
        "path": str(TITLE_QUALITY_AUDIT_PATH.relative_to(ROOT)),
        "exists": TITLE_QUALITY_AUDIT_PATH.exists(),
        "rows": len(rows),
        "title_groups": len(groups),
        "raw_title_debt_rows": len(raw_title_debt_rows),
        "raw_title_debt_groups": len(raw_title_debt_groups),
        "effective_display_unresolved_rows": len(effective_display_unresolved_rows),
        "effective_display_unresolved_groups": len(unresolved_groups),
        "recommended_action_counts": action_counts.most_common(),
        "detection_reason_counts": reason_counts.most_common(),
        "generated_at": generated_at,
    }


def content_duplicate_summary(atoms: list[dict[str, Any]]) -> dict[str, int]:
    counts = Counter(
        memory_lifecycle.normalized_content_hash(atom)
        for atom in atoms
        if memory_lifecycle.normalized_content_hash(atom)
    )
    duplicate_counts = [count for count in counts.values() if count > 1]
    return {
        "groups": len(duplicate_counts),
        "atom_rows": sum(duplicate_counts),
        "folded_extra_rows": sum(count - 1 for count in duplicate_counts),
    }


def overlay_duplicate_summary() -> dict[str, Any]:
    rows = load_jsonl(CANONICAL_OVERLAY_PATH)
    reason_counts = Counter(str(row.get("reason") or "unknown") for row in rows)
    folded_by_reason: Counter[str] = Counter()
    for row in rows:
        reason = str(row.get("reason") or "unknown")
        folded_by_reason[reason] += len([item for item in row.get("duplicate_ids", []) if item])
    return {
        "path": str(CANONICAL_OVERLAY_PATH.relative_to(ROOT)),
        "exists": CANONICAL_OVERLAY_PATH.exists(),
        "groups": len(rows),
        "reason_counts": reason_counts.most_common(),
        "folded_extra_rows_by_reason": folded_by_reason.most_common(),
    }


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def check_recall_smoke() -> list[dict[str, Any]]:
    probes = [
        "記憶 システム shared-reads",
        "ゲーム 自己判定 ハーネス",
        "substrate surface memory",
    ]
    rows = []
    for query in probes:
        results = memory_recall.search(query, 3)
        rows.append(
            {
                "query": query,
                "hits": len(results),
                "top_id": results[0][1].get("id") if results else None,
                "top_score": round(results[0][0], 2) if results else 0,
            }
        )
    return rows


def build_health() -> dict[str, Any]:
    atoms = load_jsonl(ATOMS_PATH)
    recall_visible_atoms = [atom for atom in atoms if not memory_recall.is_default_excluded(atom)]
    raw_rows = load_jsonl(RAW_SHARED_READS_PATH)
    state = load_json(STATE_PATH, {})
    slack_state = load_json(SLACK_STATE_PATH, {})
    stats = load_json(ATOM_STATS_PATH, {"atoms": {}, "queries": 0})

    ids = [a.get("id") for a in atoms]
    source_ts = [a.get("source_ts") for a in atoms]
    duplicate_ids = [item for item, count in Counter(ids).items() if item and count > 1]
    duplicate_ts = [item for item, count in Counter(source_ts).items() if item and count > 1]
    tags = Counter(tag for atom in atoms for tag in atom.get("tags", []))
    title_counts = Counter(str(a.get("title", "")) for a in atoms if a.get("title"))
    visible_title_counts = Counter(str(a.get("title", "")) for a in recall_visible_atoms if a.get("title"))
    repeated_titles = [(title, count) for title, count in title_counts.items() if count > 1]
    visible_repeated_titles = [(title, count) for title, count in visible_title_counts.items() if count > 1]
    ungrouped_repeated_titles = [
        (title, count)
        for title, count in repeated_titles
        if any(not a.get("group_id") for a in atoms if a.get("title") == title)
    ]
    status_counts = Counter(memory_lifecycle.atom_status(atom) for atom in atoms)
    folded_atoms = memory_lifecycle.fold_atoms(atoms)
    visible_folded_atoms = memory_lifecycle.fold_atoms(recall_visible_atoms)
    raw_content_duplicates = content_duplicate_summary(atoms)
    visible_content_duplicates = content_duplicate_summary(recall_visible_atoms)
    overlay_duplicates = overlay_duplicate_summary()
    mojibake_suspects = [
        {
            "id": atom.get("id"),
            "source_ts": atom.get("source_ts"),
            "title": atom.get("title"),
            "suspect_fields": report["suspect_fields"],
        }
        for atom in atoms
        for report in [atom_quality_report(atom)]
        if report["suspect"]
    ]
    title_quality = title_quality_audit_summary()
    mirror_audit = audit_atom_mirror_drift.build_audit()

    last_run = parse_dt(state.get("last_run"))
    slack_last = parse_dt(slack_state.get("last_run"))
    now = datetime.now()
    warnings: list[str] = []
    errors: list[str] = []

    if not atoms:
        errors.append("atoms.jsonl が空")
    if not raw_rows:
        errors.append("GPT側 raw shared-reads が空")
    if duplicate_ids:
        errors.append(f"atom id 重複 {len(duplicate_ids)}件")
    if duplicate_ts:
        warnings.append(f"source_ts 重複 {len(duplicate_ts)}件")
    if last_run and now - last_run > timedelta(hours=12):
        warnings.append(f"archive ingest が古い: {state.get('last_run')}")
    if slack_last and now - slack_last > timedelta(hours=12):
        warnings.append(f"Slack ingest が古い: {slack_state.get('last_run')}")
    if int(stats.get("queries", 0)) == 0:
        warnings.append("recall 使用実績がまだない")
    if title_quality["raw_title_debt_rows"]:
        warnings.append(
            "raw title debt "
            f"{title_quality['raw_title_debt_rows']} rows / {title_quality['raw_title_debt_groups']} groups"
        )
    if title_quality["effective_display_unresolved_rows"]:
        warnings.append(
            "effective display unresolved "
            f"{title_quality['effective_display_unresolved_rows']} rows / "
            f"{title_quality['effective_display_unresolved_groups']} groups"
        )
    if mojibake_suspects:
        top = ", ".join(str(row.get("id")) for row in mojibake_suspects[:5])
        warnings.append(f"mojibake suspect atoms {len(mojibake_suspects)}件: {top}")
    mirror_failures = sum(len(mirror_audit[key]) for key in (
        "per_file_only", "index_only", "jsonl_only", "missing_file",
        "parse_errors", "index_errors", "content_conflicts",
    ))
    if mirror_failures:
        errors.append(f"atom mirror drift {mirror_failures}件（明示 reconcile が必要）")

    smoke = check_recall_smoke()
    for row in smoke:
        if row["hits"] == 0:
            errors.append(f"recall smoke failed: {row['query']}")

    topology = topology_audit.build_audit(
        atoms,
        high_inbound_threshold=12,
        permanent_score_threshold=10,
        stale_days=45,
        limit=5,
    )

    status = "ok"
    if warnings:
        status = "warning"
    if errors:
        status = "error"

    return {
        "status": status,
        "time": now.isoformat(timespec="seconds"),
        "atoms": len(atoms),
        "recall_visible_atoms": len(recall_visible_atoms),
        "default_excluded_atoms": len(atoms) - len(recall_visible_atoms),
        "display_atoms_after_lifecycle_fold": len(folded_atoms),
        "recall_visible_after_lifecycle_fold": len(visible_folded_atoms),
        "lifecycle_status_counts": status_counts.most_common(),
        "repeated_title_groups": len(repeated_titles),
        "recall_visible_repeated_title_groups": len(visible_repeated_titles),
        "ungrouped_repeated_title_groups": len(ungrouped_repeated_titles),
        "raw_title_debt_rows": title_quality["raw_title_debt_rows"],
        "raw_title_debt_groups": title_quality["raw_title_debt_groups"],
        "effective_display_unresolved_rows": title_quality["effective_display_unresolved_rows"],
        "effective_display_unresolved_groups": title_quality["effective_display_unresolved_groups"],
        "raw_normalized_content_duplicate_groups": raw_content_duplicates["groups"],
        "raw_normalized_content_duplicate_atom_rows": raw_content_duplicates["atom_rows"],
        "raw_content_fold_applied_extra_rows": raw_content_duplicates["folded_extra_rows"],
        "recall_visible_normalized_content_duplicate_groups": visible_content_duplicates["groups"],
        "recall_visible_normalized_content_duplicate_atom_rows": visible_content_duplicates["atom_rows"],
        "recall_visible_content_fold_applied_extra_rows": visible_content_duplicates["folded_extra_rows"],
        "canonical_overlay_duplicate_groups": overlay_duplicates["groups"],
        "canonical_overlay_reason_counts": overlay_duplicates["reason_counts"],
        "canonical_overlay_folded_extra_rows_by_reason": overlay_duplicates["folded_extra_rows_by_reason"],
        "mojibake_suspect_atoms": mojibake_suspects[:20],
        "title_quality_audit": title_quality,
        "atom_mirror_audit": {k: v for k, v in mirror_audit.items() if not k.startswith("_")},
        "raw_shared_reads_rows": len(raw_rows),
        "archive_last_run": state.get("last_run"),
        "slack_last_run": slack_state.get("last_run"),
        "recall_queries": stats.get("queries", 0),
        "top_tags": tags.most_common(12),
        "recall_smoke": smoke,
        "topology_audit": {
            "edges": topology["edges"],
            "edge_kinds": topology["edge_kinds"],
            "summary": topology["summary"],
            "thresholds": topology["thresholds"],
        },
        "warnings": warnings,
        "errors": errors,
    }


def render_text(health: dict[str, Any], compact: bool) -> str:
    if compact:
        issues = health["errors"] or health["warnings"]
        suffix = f" issues={'; '.join(issues[:3])}" if issues else ""
        return (
            f"memory_health={health['status']} atoms={health['atoms']}"
            f" recall_visible={health['recall_visible_atoms']}"
            f" default_excluded={health['default_excluded_atoms']}"
            f" duplicate_hash_groups={health.get('raw_normalized_content_duplicate_groups')}"
            f" duplicate_atom_rows={health.get('raw_normalized_content_duplicate_atom_rows')}"
            f" fold_extra={health.get('raw_content_fold_applied_extra_rows')}"
            f" overlay_groups={health.get('canonical_overlay_duplicate_groups')}"
            f" recall_queries={health['recall_queries']}{suffix}"
        )
    lines = [
        f"memory_health: {health['status']}",
        f"- time: {health['time']}",
        f"- atoms: {health['atoms']}",
        f"- recall_visible_atoms: {health.get('recall_visible_atoms')} default_excluded={health.get('default_excluded_atoms')}",
        f"- display_atoms_after_lifecycle_fold: {health.get('display_atoms_after_lifecycle_fold')}",
        f"- recall_visible_after_lifecycle_fold: {health.get('recall_visible_after_lifecycle_fold')}",
        f"- lifecycle_status_counts: {health.get('lifecycle_status_counts')}",
        f"- repeated_title_groups: raw={health.get('repeated_title_groups')} recall_visible={health.get('recall_visible_repeated_title_groups')} ungrouped_metadata={health.get('ungrouped_repeated_title_groups')}",
        f"- title_display_debt: raw_rows={health.get('raw_title_debt_rows')} raw_groups={health.get('raw_title_debt_groups')} effective_unresolved_rows={health.get('effective_display_unresolved_rows')} effective_unresolved_groups={health.get('effective_display_unresolved_groups')}",
        f"- normalized_content_duplicate_groups: raw={health.get('raw_normalized_content_duplicate_groups')} rows={health.get('raw_normalized_content_duplicate_atom_rows')} fold_extra={health.get('raw_content_fold_applied_extra_rows')} recall_visible={health.get('recall_visible_normalized_content_duplicate_groups')} rows={health.get('recall_visible_normalized_content_duplicate_atom_rows')} fold_extra={health.get('recall_visible_content_fold_applied_extra_rows')}",
        f"- canonical_overlay_duplicate_groups: total={health.get('canonical_overlay_duplicate_groups')} reasons={health.get('canonical_overlay_reason_counts')} fold_extra_by_reason={health.get('canonical_overlay_folded_extra_rows_by_reason')}",
        f"- raw_shared_reads_rows: {health.get('raw_shared_reads_rows')}",
        f"- archive_last_run: {health.get('archive_last_run')}",
        f"- slack_last_run: {health.get('slack_last_run')}",
        f"- recall_queries: {health.get('recall_queries')}",
        f"- top_tags: {', '.join(f'{tag}={count}' for tag, count in health['top_tags'])}",
        f"- topology_audit: edges={health['topology_audit']['edges']} summary={health['topology_audit']['summary']}",
        f"- title_quality_audit: exists={health['title_quality_audit']['exists']} rows={health['title_quality_audit']['rows']} groups={health['title_quality_audit']['title_groups']} path={health['title_quality_audit']['path']}",
        "- recall_smoke:",
    ]
    for row in health["recall_smoke"]:
        lines.append(f"  - {row['query']}: hits={row['hits']} top={row['top_id']} score={row['top_score']}")
    if health["warnings"]:
        lines.append(f"- warnings: {'; '.join(health['warnings'])}")
    if health["errors"]:
        lines.append(f"- errors: {'; '.join(health['errors'])}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Check GPT memory health.")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--compact", action="store_true")
    args = parser.parse_args()

    health = build_health()
    if args.json:
        print(json.dumps(health, ensure_ascii=False, indent=2))
    else:
        print(render_text(health, args.compact))
    return 0 if health["status"] != "error" else 1


if __name__ == "__main__":
    raise SystemExit(main())
