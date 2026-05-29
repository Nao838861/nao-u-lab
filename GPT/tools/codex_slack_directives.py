#!/usr/bin/env python3
"""Detect Nao_u Slack instructions across visible channels.

Two flows captured in parallel from the same scan:
  - direct: Nao_u が `log_cdx` を明示的に宛先にした投稿 → memory/slack_directives.jsonl
  - broadcast: Nao_u が「みんな/皆/全員/AIたち/AI達/エージェントたち/諸君」など
    複数 AI に語り掛けた投稿 → memory/slack_broadcasts.jsonl
"""
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

from slack_client import api_call, post_message


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
STATE_PATH = MEMORY_DIR / "slack_directives_state.json"
DIRECTIVES_PATH = MEMORY_DIR / "slack_directives.jsonl"
BROADCASTS_PATH = MEMORY_DIR / "slack_broadcasts.jsonl"
RAW_PATH = MEMORY_DIR / "raw" / "slack_api" / "log_cdx_directives.jsonl"
RAW_BROADCASTS_PATH = MEMORY_DIR / "raw" / "slack_api" / "broadcasts.jsonl"
# Git-untracked append-only ledger of acked ids. state.json + slack_*.jsonl
# are tracked in git and can be reverted by auto_sync pulls, which previously
# caused old broadcasts to be re-detected and re-acked. This ledger survives
# any git reset/pull because memory/.local/ is gitignored.
ACK_LEDGER_PATH = MEMORY_DIR / ".local" / "acked_ids.txt"

NAO_U_USER_ID = "U0ALSUK8P9B"
ADDRESS_RE = re.compile(r"(?i)(?:^|[\s\[@:>])log[_\-\s]?cdx(?:$|[\s\].,:：、。])")
BROADCAST_RE = re.compile(
    r"(?:みんな|皆さん|全員|AIたち|AI達|エージェント(?:たち|達)?|諸君|君たち|君ら)"
)
# Anything older than this when first seen is treated as already-handled even
# if absent from state/jsonl — protects against state reverts re-acking old msgs.
STALE_SOURCE_SECONDS = 6 * 3600


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


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


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def append_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def load_ack_ledger() -> set[str]:
    if not ACK_LEDGER_PATH.exists():
        return set()
    with ACK_LEDGER_PATH.open("r", encoding="utf-8") as f:
        return {line.strip() for line in f if line.strip()}


def append_ack_ledger(ids: list[str]) -> None:
    if not ids:
        return
    ACK_LEDGER_PATH.parent.mkdir(parents=True, exist_ok=True)
    with ACK_LEDGER_PATH.open("a", encoding="utf-8", newline="\n") as f:
        for ack_id in ids:
            f.write(ack_id + "\n")


def directive_id(channel_id: str, ts: str, text: str) -> str:
    digest = hashlib.sha1(f"{channel_id}\n{ts}\n{text[:400]}".encode("utf-8")).hexdigest()[:10]
    return f"log-cdx-{ts.split('.')[0]}-{digest}"


def list_visible_channels() -> list[dict[str, Any]]:
    channels: list[dict[str, Any]] = []
    cursor = ""
    while True:
        payload = {"types": "public_channel,private_channel", "limit": 1000}
        if cursor:
            payload["cursor"] = cursor
        result = api_call("conversations.list", payload)
        if not result.get("ok"):
            raise RuntimeError(f"conversations.list failed: {result}")
        channels.extend(result.get("channels", []))
        cursor = result.get("response_metadata", {}).get("next_cursor") or ""
        if not cursor:
            break
    return channels


def fetch_history(channel_id: str, oldest: str, limit: int) -> list[dict[str, Any]]:
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
        raise RuntimeError(f"conversations.history failed for {channel_id}: {result}")
    return result.get("messages", [])


def is_addressed_to_log_cdx(text: str) -> bool:
    return bool(ADDRESS_RE.search(text or ""))


def is_broadcast(text: str) -> bool:
    return bool(BROADCAST_RE.search(text or ""))


def permalink(channel_id: str, ts: str) -> str:
    return f"https://nao-u-lab.slack.com/archives/{channel_id}/p{ts.replace('.', '')}"


GAME_START_ROUTING_RE = re.compile(
    r"ゲーム|game|graze_log|brick_log|playable|ヘッドレス|headless|"
    r"敵弾|弾幕|敵|v\d{3}|コンセプト|面白く|次.*アプローチ",
    re.I,
)


def routing_tags_for(row: dict[str, Any]) -> list[str]:
    """Return phase-routing hints separate from the topical domain label."""
    text = str(row.get("text", ""))
    channel = str(row.get("channel", ""))
    tags: list[str] = []
    if "game-rights" in channel or GAME_START_ROUTING_RE.search(text):
        tags.append("game_start")
    return tags


def triage_fields(row: dict[str, Any], queue_kind: str) -> dict[str, Any]:
    """Classify a pending Slack queue row for later phase routing.

    The fields are hints, not completion markers. `status` remains the source of
    truth for whether a row has been handled.
    """
    text = str(row.get("text", ""))
    channel = str(row.get("channel", ""))
    lower = text.lower()

    routing_tags = routing_tags_for(row)

    if "game-rights" in channel or re.search(r"ゲーム|game|graze_log|brick_log|playable|ヘッドレス", text, re.I):
        domain = "game"
    elif re.search(r"記憶|memory|atoms|claude\.md|agents\.md|ルール|directive", text, re.I):
        domain = "memory"
    elif "slack" in lower or "投稿" in text:
        domain = "slack"
    else:
        domain = "operations"

    if re.search(r"確認して|対応して|進めて|適用して|評価して", text):
        action_type = "direct_action" if queue_kind == "direct" else "review_request"
    elif re.search(r"議論|検討|どう思う|価値はある", text):
        action_type = "discussion_request"
    else:
        action_type = "intake"

    if domain == "game":
        next_step = "ゲーム制作サイクルの着手前に内容を読み、必要なら実装/評価タスクへ接続する。"
        done_condition = "stagingまたは該当ゲーム文書に判断と次アクションを記録し、必要ならSlackへ返信する。"
    elif domain == "memory":
        next_step = "Phase 4a/4b/4cで記憶構造への影響を分類し、実装対象か保留かを決める。"
        done_condition = "stagingに判断を記録し、実装した場合は変更ファイルと検証結果を残す。"
    elif domain == "slack":
        next_step = "Slack運用ルールを確認し、投稿/返信が必要か判定する。"
        done_condition = "返信・投稿・保留理由のいずれかをstagingまたはhandling_noteへ記録する。"
    else:
        next_step = "作業開始時に内容を確認し、該当phaseまたは手動対応へ割り振る。"
        done_condition = "対応先と完了条件をstagingまたはhandling_noteへ記録する。"

    triage_status = "auto_triaged"
    if "?" in text or "？" in text or "大丈夫" in text or "危険" in text:
        triage_status = "needs_human_review"

    fields = {
        "action_type": action_type,
        "domain": domain,
        "next_step": next_step,
        "done_condition": done_condition,
        "triage_status": triage_status,
    }
    if routing_tags:
        fields["routing_tags"] = routing_tags
    return fields


def normalize_directive(channel: dict[str, Any], msg: dict[str, Any]) -> dict[str, Any]:
    channel_id = str(channel.get("id", ""))
    channel_name = str(channel.get("name") or channel_id)
    ts = str(msg.get("ts", "0"))
    text = str(msg.get("text", "")).strip()
    row = {
        "id": directive_id(channel_id, ts, text),
        "channel": channel_name,
        "channel_id": channel_id,
        "datetime": datetime.fromtimestamp(float(ts)).isoformat(timespec="microseconds"),
        "permalink": permalink(channel_id, ts),
        "source_ts": ts,
        "status": "pending",
        "text": text,
        "user": msg.get("user"),
        "detected_at": now_iso(),
    }
    row.update(triage_fields(row, "direct"))
    return row


def ack_text(row: dict[str, Any]) -> str:
    return (
        "Nao_u から log_cdx 宛の指示を受領しました。"
        "\nGPT 側 `memory/slack_directives.jsonl` に保存し、次の Codex 作業で確認して対応します。"
        "\n危険操作や曖昧な操作は無人実行せず、必要なら確認してから進めます。"
        f"\n対象: {row.get('permalink')}"
    )


def broadcast_id(channel_id: str, ts: str, text: str) -> str:
    digest = hashlib.sha1(f"{channel_id}\n{ts}\n{text[:400]}".encode("utf-8")).hexdigest()[:10]
    return f"broadcast-{ts.split('.')[0]}-{digest}"


def normalize_broadcast(channel: dict[str, Any], msg: dict[str, Any]) -> dict[str, Any]:
    channel_id = str(channel.get("id", ""))
    channel_name = str(channel.get("name") or channel_id)
    ts = str(msg.get("ts", "0"))
    text = str(msg.get("text", "")).strip()
    row = {
        "id": broadcast_id(channel_id, ts, text),
        "channel": channel_name,
        "channel_id": channel_id,
        "datetime": datetime.fromtimestamp(float(ts)).isoformat(timespec="microseconds"),
        "permalink": permalink(channel_id, ts),
        "source_ts": ts,
        "status": "pending",
        "text": text,
        "user": msg.get("user"),
        "detected_at": now_iso(),
        "kind": "broadcast",
    }
    row.update(triage_fields(row, "broadcast"))
    return row


def broadcast_ack_text(row: dict[str, Any]) -> str:
    return (
        "Nao_u からの全員宛 broadcast を log_cdx も受領しました。"
        "\nGPT 側 `memory/slack_broadcasts.jsonl` に保存し、次の Codex 作業で内容を検討します。"
        f"\n対象: {row.get('permalink')}"
    )


def scan(args: argparse.Namespace, state: dict[str, Any]) -> dict[str, Any]:
    ledger = load_ack_ledger()
    existing_ids = {str(row.get("id")) for row in read_jsonl(DIRECTIVES_PATH)} | ledger
    existing_broadcast_ids = {str(row.get("id")) for row in read_jsonl(BROADCASTS_PATH)} | ledger
    now_epoch = time.time()
    channels_state = state.setdefault("channels", {})
    channels = list_visible_channels()
    visible = 0
    scanned = 0
    errors: list[dict[str, str]] = []
    found: list[dict[str, Any]] = []
    found_broadcasts: list[dict[str, Any]] = []
    max_ts_by_channel: dict[str, str] = {}

    default_oldest = f"{int(time.time() - args.lookback_hours * 3600)}.000000"
    for channel in channels:
        channel_id = str(channel.get("id", ""))
        channel_name = str(channel.get("name") or channel_id)
        if args.joined_only and not channel.get("is_member"):
            continue
        visible += 1
        oldest = channels_state.get(channel_id, {}).get("last_ts") or default_oldest
        try:
            messages = fetch_history(channel_id, oldest, args.limit)
        except Exception as exc:
            errors.append({"channel": channel_name, "channel_id": channel_id, "error": str(exc)[:300]})
            continue
        if messages:
            max_ts_by_channel[channel_id] = max(str(msg.get("ts", "0")) for msg in messages)
        else:
            max_ts_by_channel[channel_id] = oldest
        scanned += len(messages)
        for msg in messages:
            text = str(msg.get("text", ""))
            subtype = msg.get("subtype")
            if subtype in {"channel_join", "channel_leave"}:
                continue
            if msg.get("user") != NAO_U_USER_ID:
                continue
            try:
                msg_ts = float(msg.get("ts", "0") or 0)
            except (TypeError, ValueError):
                msg_ts = 0.0
            stale = msg_ts > 0 and (now_epoch - msg_ts) > STALE_SOURCE_SECONDS
            if is_addressed_to_log_cdx(text):
                row = normalize_directive(channel, msg)
                if row["id"] in existing_ids:
                    continue
                if stale:
                    existing_ids.add(row["id"])
                    continue
                found.append(row)
                existing_ids.add(row["id"])
            elif is_broadcast(text):
                row = normalize_broadcast(channel, msg)
                if row["id"] in existing_broadcast_ids:
                    continue
                if stale:
                    existing_broadcast_ids.add(row["id"])
                    continue
                found_broadcasts.append(row)
                existing_broadcast_ids.add(row["id"])

    return {
        "visible_channels": visible,
        "scanned_messages": scanned,
        "directives": found,
        "broadcasts": found_broadcasts,
        "errors": errors,
        "max_ts_by_channel": max_ts_by_channel,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Find Nao_u Slack instructions addressed to log_cdx.")
    parser.add_argument("--lookback-hours", type=int, default=24)
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--initialize", action="store_true", help="record current channel watermarks without creating directives or acks")
    parser.add_argument("--no-ack", action="store_true")
    parser.add_argument("--joined-only", action="store_true", default=True)
    args = parser.parse_args()

    state = load_json(STATE_PATH, {"channels": {}, "acked_ids": []})
    result = scan(args, state)
    directives = result["directives"]
    broadcasts = result["broadcasts"]

    if args.initialize:
        directives = []
        broadcasts = []
        result["directives"] = []
        result["broadcasts"] = []
        result["initialized"] = True

    acked_ids = set(str(x) for x in state.get("acked_ids", [])) | load_ack_ledger()
    newly_acked: list[str] = []
    ack_results: list[dict[str, Any]] = []
    if directives and not args.dry_run:
        append_jsonl(DIRECTIVES_PATH, directives)
        append_jsonl(RAW_PATH, directives)
        if not args.no_ack:
            for row in directives:
                if row["id"] in acked_ids:
                    continue
                post_result = post_message(str(row["channel_id"]), ack_text(row))
                ack_results.append({"id": row["id"], "ok": post_result.get("ok"), "result": post_result})
                if post_result.get("ok"):
                    acked_ids.add(row["id"])
                    newly_acked.append(row["id"])
    if broadcasts and not args.dry_run:
        append_jsonl(BROADCASTS_PATH, broadcasts)
        append_jsonl(RAW_BROADCASTS_PATH, broadcasts)
        if not args.no_ack:
            for row in broadcasts:
                if row["id"] in acked_ids:
                    continue
                post_result = post_message(str(row["channel_id"]), broadcast_ack_text(row))
                ack_results.append({"id": row["id"], "ok": post_result.get("ok"), "result": post_result})
                if post_result.get("ok"):
                    acked_ids.add(row["id"])
                    newly_acked.append(row["id"])

    if not args.dry_run:
        append_ack_ledger(newly_acked)
        for channel_id, max_ts in result["max_ts_by_channel"].items():
            state.setdefault("channels", {})[channel_id] = {
                "last_ts": max_ts,
                "last_checked": now_iso(),
            }
        state["acked_ids"] = sorted(acked_ids)[-500:]
        state["last_run"] = now_iso()
        state["last_seen_directives"] = len(directives)
        state["last_seen_broadcasts"] = len(broadcasts)
        state["last_errors"] = result["errors"][:20]
        save_json(STATE_PATH, state)

    out = {
        "time": now_iso(),
        "dry_run": args.dry_run,
        "initialized": bool(args.initialize),
        "visible_channels": result["visible_channels"],
        "scanned_messages": result["scanned_messages"],
        "directives_found": len(directives),
        "directives": directives,
        "broadcasts_found": len(broadcasts),
        "broadcasts": broadcasts,
        "ack_results": ack_results,
        "errors": result["errors"][:10],
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
