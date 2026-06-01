#!/usr/bin/env python3
"""Fetch new Slack posts and add useful ones to GPT memory atoms."""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import memory_ingest
from atom_quality import append_quarantine, apply_memory_layer, is_mojibake_suspect
from atoms_fileformat import sync_per_file_atoms
from slack_client import api_call, resolve_channel


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
STATE_PATH = MEMORY_DIR / "slack_ingest_state.json"
RECENT_PATH = MEMORY_DIR / "slack_recent_ingest.jsonl"
RAW_SLACK_DIR = MEMORY_DIR / "raw" / "slack_api"
QUARANTINE_PATH = MEMORY_DIR / "atom_quality_quarantine.jsonl"

DEFAULT_CHANNELS = ["shared-reads", "all-nao-u-lab", "game-rights", "human-steering"]


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def append_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def append_channel_raw(rows: list[dict[str, Any]]) -> None:
    by_channel: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        by_channel.setdefault(str(row.get("channel", "unknown")), []).append(row)
    for channel, channel_rows in by_channel.items():
        path = RAW_SLACK_DIR / f"{channel}.jsonl"
        existing_ts = {str(r.get("ts")) for r in memory_ingest.read_jsonl(path)}
        new_rows = [r for r in sorted(channel_rows, key=lambda x: float(x["ts"])) if str(r.get("ts")) not in existing_ts]
        if new_rows:
            append_jsonl(path, new_rows)


def fetch_history(channel_name: str, oldest: str, limit: int) -> list[dict[str, Any]]:
    channel_id = resolve_channel(channel_name)
    result = api_call(
        "conversations.history",
        {
            "channel": channel_id,
            "oldest": oldest,
            "inclusive": False,
            "limit": limit,
        },
    )
    if not result.get("ok"):
        raise RuntimeError(f"conversations.history failed for #{channel_name}: {result}")
    rows = []
    for msg in result.get("messages", []):
        text = msg.get("text", "")
        subtype = msg.get("subtype")
        if not text or subtype in {"channel_join", "channel_leave"}:
            continue
        ts = str(msg.get("ts", "0"))
        dt = datetime.fromtimestamp(float(ts)).isoformat(timespec="microseconds")
        rows.append(
            {
                "ts": ts,
                "datetime": dt,
                "user": msg.get("user"),
                "user_name": msg.get("user"),
                "channel": channel_name,
                "text": text,
                "_slack_channel_id": channel_id,
            }
        )
    return rows


def load_atoms_by_ts() -> tuple[list[dict[str, Any]], set[str]]:
    atoms = memory_ingest.read_jsonl(memory_ingest.ATOMS_PATH)
    return atoms, {str(atom.get("source_ts")) for atom in atoms}


def source_ts_sort_key(atom: dict[str, Any]) -> tuple[int, float, str]:
    raw = str(atom.get("source_ts", "0"))
    try:
      return (0, float(raw), str(atom.get("id", "")))
    except ValueError:
      return (1, 0.0, str(atom.get("id", "")))


def ingest_slack_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    atoms, seen_ts = load_atoms_by_ts()
    added: list[dict[str, Any]] = []
    for row in sorted(rows, key=lambda r: float(r.get("ts", "0"))):
        ts = str(row.get("ts", "0"))
        if ts in seen_ts:
            continue
        atom = memory_ingest.row_to_atom(row)
        if not atom:
            continue
        atom["source"] = f"slack_api/{row.get('channel')}"
        atom["ingested_via"] = "slack_memory_ingest.py"
        apply_memory_layer(atom)
        if is_mojibake_suspect(atom):
            append_quarantine(QUARANTINE_PATH, atom, row, "mojibake_guard")
            continue
        added.append(atom)
        seen_ts.add(ts)

    if added:
        all_atoms = atoms + added
        all_atoms.sort(key=source_ts_sort_key)
        memory_ingest.write_jsonl(memory_ingest.ATOMS_PATH, all_atoms)
        source_rows = len(memory_ingest.read_jsonl(memory_ingest.SHARED_READS_PATH))
        memory_ingest.INDEX_PATH.write_text(
            memory_ingest.render_index(all_atoms, source_rows),
            encoding="utf-8",
            newline="\n",
        )
        sync_per_file_atoms(all_atoms, memory_ingest.ATOMS_DIR)
        numeric_ts = []
        for atom in all_atoms:
            try:
                numeric_ts.append(float(atom["source_ts"]))
            except (KeyError, TypeError, ValueError):
                continue
        max_ts = str(max(numeric_ts)) if numeric_ts else "0"
        memory_ingest.save_state(max_ts, len(added), len(all_atoms))
    return added


def choose_interesting(atoms: list[dict[str, Any]], limit: int = 3) -> list[dict[str, Any]]:
    return sorted(atoms, key=lambda a: (-int(a.get("score", 0)), str(a.get("datetime", ""))), reverse=False)[:limit]


def main() -> int:
    parser = argparse.ArgumentParser(description="Ingest new useful Slack posts into GPT memory.")
    parser.add_argument("--channels", nargs="*", default=DEFAULT_CHANNELS)
    parser.add_argument("--lookback-hours", type=int, default=12)
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--from-recent", action="store_true", help="re-ingest rows already stored in memory/slack_recent_ingest.jsonl")
    args = parser.parse_args()

    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    state = load_json(STATE_PATH, {"channels": {}})
    all_rows: list[dict[str, Any]] = []
    max_ts_by_channel: dict[str, str] = {}

    if args.from_recent:
        all_rows = memory_ingest.read_jsonl(RECENT_PATH)
        for row in all_rows:
            channel = str(row.get("channel", "unknown"))
            max_ts_by_channel[channel] = max(max_ts_by_channel.get(channel, "0"), str(row.get("ts", "0")))
    else:
        for channel in args.channels:
            ch_state = state.setdefault("channels", {}).get(channel, {})
            oldest = ch_state.get("last_ts")
            if not oldest:
                oldest = f"{int(time.time() - args.lookback_hours * 3600)}.000000"
            rows = fetch_history(channel, oldest, args.limit)
            all_rows.extend(rows)
            if rows:
                max_ts_by_channel[channel] = max(str(row["ts"]) for row in rows)
            else:
                max_ts_by_channel[channel] = oldest

    added = ingest_slack_rows(all_rows)
    if all_rows:
        if not args.from_recent:
            append_jsonl(RECENT_PATH, sorted(all_rows, key=lambda r: float(r["ts"])))
        append_channel_raw(all_rows)

    for channel, max_ts in max_ts_by_channel.items():
        state.setdefault("channels", {})[channel] = {
            "last_ts": max_ts,
            "last_checked": datetime.now().isoformat(timespec="seconds"),
        }
    state["last_added"] = len(added)
    state["last_seen_messages"] = len(all_rows)
    state["last_run"] = datetime.now().isoformat(timespec="seconds")
    save_json(STATE_PATH, state)

    result = {
        "seen_messages": len(all_rows),
        "added_atoms": len(added),
        "interesting": choose_interesting(added),
        "channels": args.channels,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
