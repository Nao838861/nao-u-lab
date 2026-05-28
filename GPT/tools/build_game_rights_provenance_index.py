#!/usr/bin/env python3
"""Build a derived provenance index for Nao_u #game-rights feedback atoms."""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

from atoms_fileformat import load_atoms_from_per_file


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
ATOMS_PATH = MEMORY_DIR / "atoms.jsonl"
ATOMS_DIR = MEMORY_DIR / "atoms"
RAW_PATH = MEMORY_DIR / "raw" / "slack_api" / "game-rights.jsonl"
DEFAULT_OUTPUT = MEMORY_DIR / "game_rights_provenance_index.jsonl"
SLACK_TEAM = "nao-u-lab"
TARGET_TAGS = {"game-rights", "nao-u-feedback"}


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def load_atoms() -> list[dict[str, Any]]:
    if ATOMS_PATH.exists():
        return read_jsonl(ATOMS_PATH)
    return load_atoms_from_per_file(ATOMS_DIR)


def is_target_atom(atom: dict[str, Any]) -> bool:
    tags = {str(tag) for tag in atom.get("tags", [])}
    return TARGET_TAGS.issubset(tags) and atom.get("source") == "slack_api/game-rights"


def slack_permalink(channel_id: str, ts: str) -> str:
    return f"https://{SLACK_TEAM}.slack.com/archives/{channel_id}/p{ts.replace('.', '')}"


def build_row(atom: dict[str, Any], raw_by_ts: dict[str, dict[str, Any]], generated_at: str) -> dict[str, Any]:
    source_ts = str(atom.get("source_ts") or "")
    raw = raw_by_ts.get(source_ts)
    channel_name = str(atom.get("channel") or "game-rights")
    row = {
        "atom_id": atom.get("id"),
        "source_ts": source_ts,
        "channel": channel_name,
        "channel_name": channel_name,
        "channel_id": None,
        "raw_path": str(RAW_PATH.relative_to(ROOT)).replace("\\", "/"),
        "permalink": None,
        "context_status": "missing_raw",
        "generated_at": generated_at,
    }
    if raw is None:
        return row

    channel_id = str(raw.get("_slack_channel_id") or "")
    row["channel"] = str(raw.get("channel") or channel_name)
    row["channel_name"] = str(raw.get("channel") or channel_name)
    row["channel_id"] = channel_id or None
    if not channel_id:
        row["context_status"] = "missing_channel_id"
        return row

    row["permalink"] = slack_permalink(channel_id, source_ts)
    row["context_status"] = "permalink_generated"
    return row


def summarize(rows: list[dict[str, Any]], target_atoms: list[dict[str, Any]]) -> dict[str, Any]:
    statuses = Counter(str(row.get("context_status")) for row in rows)
    matched = len(rows) - statuses.get("missing_raw", 0)
    return {
        "target_atoms": len(target_atoms),
        "index_rows": len(rows),
        "matched": matched,
        "permalink_generated": statuses.get("permalink_generated", 0),
        "missing_raw": statuses.get("missing_raw", 0),
        "missing_channel_id": statuses.get("missing_channel_id", 0),
        "statuses": dict(sorted(statuses.items())),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build memory/game_rights_provenance_index.jsonl from game-rights feedback atoms and raw Slack rows."
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--check", action="store_true", help="build and validate in memory without writing output")
    args = parser.parse_args()

    atoms = sorted(
        [atom for atom in load_atoms() if is_target_atom(atom)],
        key=lambda atom: (str(atom.get("source_ts") or ""), str(atom.get("id") or "")),
    )
    raw_by_ts = {str(row.get("ts") or ""): row for row in read_jsonl(RAW_PATH)}
    generated_at = datetime.now().isoformat(timespec="seconds")
    rows = [build_row(atom, raw_by_ts, generated_at) for atom in atoms]
    summary = summarize(rows, atoms)

    if len({str(row.get("atom_id")) for row in rows}) != len(rows):
        summary["error"] = "duplicate atom_id in provenance index"
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 1

    if not args.check:
        write_jsonl(args.output, rows)
        summary["output"] = str(args.output.relative_to(ROOT)).replace("\\", "/")
    else:
        summary["output"] = None
        summary["check"] = True

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
