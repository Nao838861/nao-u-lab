#!/usr/bin/env python3
"""Ingest Nao_u feedback from #game-rights as game-development teacher atoms."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import memory_ingest
from slack_client import api_call, resolve_channel


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
RAW_SLACK_DIR = MEMORY_DIR / "raw" / "slack_api"
STATE_PATH = MEMORY_DIR / "game_rights_feedback_state.json"
RECENT_PATH = MEMORY_DIR / "game_rights_feedback_recent.jsonl"
NAO_U_USER_ID = "U0ALSUK8P9B"
DEFAULT_CHANNEL = "game-rights"


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


def fetch_history(channel_name: str, oldest: str, limit: int, pages: int) -> list[dict[str, Any]]:
    channel_id = resolve_channel(channel_name)
    cursor = None
    rows: list[dict[str, Any]] = []
    for _ in range(max(pages, 1)):
        payload: dict[str, Any] = {
            "channel": channel_id,
            "oldest": oldest,
            "inclusive": False,
            "limit": min(limit, 200),
        }
        if cursor:
            payload["cursor"] = cursor
        result = api_call("conversations.history", payload)
        if not result.get("ok"):
            raise RuntimeError(f"conversations.history failed for #{channel_name}: {result}")
        for msg in result.get("messages", []):
            text = msg.get("text", "")
            subtype = msg.get("subtype")
            if not text or subtype in {"channel_join", "channel_leave"}:
                continue
            ts = str(msg.get("ts", "0"))
            rows.append(
                {
                    "ts": ts,
                    "datetime": datetime.fromtimestamp(float(ts)).isoformat(timespec="microseconds"),
                    "user": msg.get("user"),
                    "user_name": msg.get("user"),
                    "channel": channel_name,
                    "text": text,
                    "_slack_channel_id": channel_id,
                }
            )
        cursor = result.get("response_metadata", {}).get("next_cursor")
        if not cursor:
            break
        time.sleep(0.2)
    return rows


def stable_id(ts: str, text: str) -> str:
    digest = hashlib.sha1(f"{ts}\n{text[:500]}".encode("utf-8")).hexdigest()[:10]
    return f"gr-{ts.split('.')[0]}-{digest}"


def clean(text: str, limit: int = 900) -> str:
    return re.sub(r"\s+", " ", text).strip()[:limit]


def is_feedback_row(row: dict[str, Any]) -> bool:
    if row.get("user") != NAO_U_USER_ID:
        return False
    text = str(row.get("text", "")).strip()
    if len(text) < 20:
        return False
    # #game-rights is already scoped to game discussion; these terms raise precision for older mixed logs.
    return bool(
        re.search(
            r"ゲーム|操作|面白|つまら|わから|分から|気持ち|ルール|予測|画面|評価|改善|プロトタイプ|目標|クリア|失敗|難し|視界|情報|軌道|重力|月|フィードバック",
            text,
            re.I,
        )
    )


def classify_feedback(text: str) -> list[str]:
    labels = []
    rules = [
        ("controls-feel", r"操作|気持ち|加速|減速|入力|space|click|クリック"),
        ("predictability", r"予測|わから|分から|意味不明|読めない|直感|ルール"),
        ("ui-visibility", r"画面|右端|視界|情報|HUD|ウインドウ|矩形"),
        ("goal-clarity", r"目標|クリア|ゲームオーバー|何を|どこを面白"),
        ("physics-rules", r"物理|重力|軌道|月|衝突|速度|ばね|ゴム"),
        ("process-rule", r"ブレスト|30個|サイクル|記憶|教師|原文|design_log"),
        ("penalty-caution", r"ペナルティ|燃料|マイナス|縛り"),
    ]
    for label, pattern in rules:
        if re.search(pattern, text, re.I):
            labels.append(label)
    return labels[:6]


def feedback_trigger(text: str, labels: list[str]) -> str:
    if "controls-feel" in labels:
        context = "ゲーム開発で操作感・入力反応・触って気持ちよいかを判断する時"
    elif "predictability" in labels:
        context = "ゲームルールが直感的に予測可能かを検討する時"
    elif "goal-clarity" in labels:
        context = "プレイヤーが何を面白がるべきか・何を目標にするかを設計する時"
    elif "ui-visibility" in labels:
        context = "ゲームに必要な情報を画面内でどう見せるかを設計する時"
    elif "physics-rules" in labels:
        context = "物理っぽいゲームで、挙動のモデルと直感のズレを確認する時"
    else:
        context = "ゲーム開発で Nao_u の教師フィードバックを参照する時"
    return f"Use when {context}。Nao_u feedback: {clean(text, 120)}"


def row_to_feedback_atom(row: dict[str, Any]) -> dict[str, Any] | None:
    if not is_feedback_row(row):
        return None
    text = str(row.get("text", ""))
    labels = classify_feedback(text)
    tags = [
        "game-design",
        "game-rights",
        "nao-u-feedback",
        "game-dev-teacher",
        "supervised-feedback",
        *labels,
    ]
    return {
        "id": stable_id(str(row.get("ts", "0")), text),
        "source": "slack_api/game-rights",
        "source_ts": str(row.get("ts", "0")),
        "datetime": row.get("datetime"),
        "channel": "game-rights",
        "user": row.get("user"),
        "author": "Nao_u",
        "title": f"Nao_u game-rights feedback: {clean(text, 90)}",
        "kind": ["feedback", "prescription"],
        "tags": tags,
        "links": [],
        "score": 14,
        "trigger": feedback_trigger(text, labels),
        "excerpt": clean(text),
        "raw_text": text,
        "ingested_via": "ingest_game_rights_feedback.py",
    }


def write_atoms(added: list[dict[str, Any]]) -> None:
    if not added:
        return
    atoms = memory_ingest.read_jsonl(memory_ingest.ATOMS_PATH)
    seen_ids = {str(atom.get("id")) for atom in atoms}
    new_atoms = [atom for atom in added if atom["id"] not in seen_ids]
    if not new_atoms:
        return
    all_atoms = atoms + new_atoms
    all_atoms.sort(key=memory_ingest.source_ts_sort_key)
    memory_ingest.write_jsonl(memory_ingest.ATOMS_PATH, all_atoms)
    source_rows = len(memory_ingest.read_jsonl(memory_ingest.SHARED_READS_PATH))
    memory_ingest.INDEX_PATH.write_text(
        memory_ingest.render_index(all_atoms, source_rows),
        encoding="utf-8",
        newline="\n",
    )
    memory_ingest.sync_related_candidates(all_atoms)


def main() -> int:
    parser = argparse.ArgumentParser(description="Ingest Nao_u game-rights feedback as teacher atoms.")
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--lookback-days", type=int, default=90)
    parser.add_argument("--limit", type=int, default=200)
    parser.add_argument("--pages", type=int, default=5)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    state = load_json(STATE_PATH, {"channels": {}})
    ch_state = state.setdefault("channels", {}).get(args.channel, {})
    oldest = ch_state.get("last_ts")
    if not oldest:
        oldest = f"{int(time.time() - args.lookback_days * 86400)}.000000"

    rows = fetch_history(args.channel, oldest, args.limit, args.pages)
    rows = sorted(rows, key=lambda row: float(row["ts"]))
    RAW_SLACK_DIR.mkdir(parents=True, exist_ok=True)
    raw_path = RAW_SLACK_DIR / f"{args.channel}.jsonl"
    existing_ts = {str(row.get("ts")) for row in memory_ingest.read_jsonl(raw_path)}
    raw_new = [row for row in rows if str(row.get("ts")) not in existing_ts]
    if raw_new and not args.dry_run:
        append_jsonl(raw_path, raw_new)
        append_jsonl(RECENT_PATH, raw_new)

    atoms = [atom for row in rows if (atom := row_to_feedback_atom(row))]
    before_ids = {str(atom.get("id")) for atom in memory_ingest.read_jsonl(memory_ingest.ATOMS_PATH)}
    added = [atom for atom in atoms if atom["id"] not in before_ids]
    if not args.dry_run:
        write_atoms(added)

    max_ts = max([str(row["ts"]) for row in rows], default=oldest)
    state.setdefault("channels", {})[args.channel] = {
        "last_ts": max_ts,
        "last_checked": datetime.now().isoformat(timespec="seconds"),
    }
    state["last_seen_messages"] = len(rows)
    state["last_feedback_atoms"] = len(atoms)
    state["last_added"] = len(added)
    state["last_run"] = datetime.now().isoformat(timespec="seconds")
    if not args.dry_run:
        save_json(STATE_PATH, state)

    print(
        json.dumps(
            {
                "seen_messages": len(rows),
                "feedback_atoms": len(atoms),
                "added_atoms": len(added),
                "dry_run": args.dry_run,
                "channel": args.channel,
                "examples": [
                    {"id": atom["id"], "title": atom["title"], "tags": atom["tags"][:8]}
                    for atom in added[:5]
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
