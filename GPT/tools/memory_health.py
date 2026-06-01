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
from atom_quality import atom_quality_report


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
RAW_SHARED_READS_PATH = MEMORY_DIR / "raw" / "slack_archive" / "shared-reads.jsonl"
STATE_PATH = MEMORY_DIR / "state.json"
SLACK_STATE_PATH = MEMORY_DIR / "slack_ingest_state.json"
RECALL_LOG_PATH = MEMORY_DIR / "recall_log.jsonl"
ATOM_STATS_PATH = MEMORY_DIR / "atom_stats.json"


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
    repeated_titles = [(title, count) for title, count in title_counts.items() if count > 1]
    ungrouped_repeated_titles = [
        (title, count)
        for title, count in repeated_titles
        if any(not a.get("group_id") for a in atoms if a.get("title") == title)
    ]
    status_counts = Counter(memory_lifecycle.atom_status(atom) for atom in atoms)
    folded_atoms = memory_lifecycle.fold_atoms(atoms)
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
    if ungrouped_repeated_titles:
        top = ", ".join(f"{title[:40]}={count}" for title, count in sorted(ungrouped_repeated_titles, key=lambda x: -x[1])[:3])
        warnings.append(f"repeated title group 未付与 {len(ungrouped_repeated_titles)}種: {top}")
    if mojibake_suspects:
        top = ", ".join(str(row.get("id")) for row in mojibake_suspects[:5])
        warnings.append(f"mojibake suspect atoms {len(mojibake_suspects)}件: {top}")

    smoke = check_recall_smoke()
    for row in smoke:
        if row["hits"] == 0:
            errors.append(f"recall smoke failed: {row['query']}")

    status = "ok"
    if warnings:
        status = "warning"
    if errors:
        status = "error"

    return {
        "status": status,
        "time": now.isoformat(timespec="seconds"),
        "atoms": len(atoms),
        "display_atoms_after_lifecycle_fold": len(folded_atoms),
        "lifecycle_status_counts": status_counts.most_common(),
        "repeated_title_groups": len(repeated_titles),
        "ungrouped_repeated_title_groups": len(ungrouped_repeated_titles),
        "mojibake_suspect_atoms": mojibake_suspects[:20],
        "raw_shared_reads_rows": len(raw_rows),
        "archive_last_run": state.get("last_run"),
        "slack_last_run": slack_state.get("last_run"),
        "recall_queries": stats.get("queries", 0),
        "top_tags": tags.most_common(12),
        "recall_smoke": smoke,
        "warnings": warnings,
        "errors": errors,
    }


def render_text(health: dict[str, Any], compact: bool) -> str:
    if compact:
        issues = health["errors"] or health["warnings"]
        suffix = f" issues={'; '.join(issues[:3])}" if issues else ""
        return f"memory_health={health['status']} atoms={health['atoms']} recall_queries={health['recall_queries']}{suffix}"
    lines = [
        f"memory_health: {health['status']}",
        f"- time: {health['time']}",
        f"- atoms: {health['atoms']}",
        f"- display_atoms_after_lifecycle_fold: {health.get('display_atoms_after_lifecycle_fold')}",
        f"- lifecycle_status_counts: {health.get('lifecycle_status_counts')}",
        f"- repeated_title_groups: {health.get('repeated_title_groups')} ungrouped={health.get('ungrouped_repeated_title_groups')}",
        f"- raw_shared_reads_rows: {health.get('raw_shared_reads_rows')}",
        f"- archive_last_run: {health.get('archive_last_run')}",
        f"- slack_last_run: {health.get('slack_last_run')}",
        f"- recall_queries: {health.get('recall_queries')}",
        f"- top_tags: {', '.join(f'{tag}={count}' for tag, count in health['top_tags'])}",
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
