#!/usr/bin/env python3
"""Post a UTF-8 text file to Slack and verify the stored message text.

This avoids passing Japanese text through a Windows PowerShell pipe, which can
replace non-ASCII characters with '?' before Python receives the message.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from slack_client import (
    _blocks_for_text,
    _trim_fallback_text,
    api_call,
    ensure_log_cdx_prefix,
    post_message,
    resolve_channel,
)
from shared_reads_policy import validate_shared_reads_message


MOJIBAKE_MARKERS = ("縺", "譁", "繧", "蜊", "謚", "ã", "Â")


def _block_text(message: dict) -> str:
    parts: list[str] = []
    for block in message.get("blocks", []) or []:
        text = block.get("text")
        if isinstance(text, dict):
            parts.append(str(text.get("text", "")))
        for element in block.get("elements", []) or []:
            for child in element.get("elements", []) or []:
                if child.get("type") == "text":
                    parts.append(str(child.get("text", "")))
    return "\n".join(part for part in parts if part)


def _looks_corrupt(source: str, posted: str) -> tuple[bool, str]:
    if not posted:
        return True, "posted text is empty"
    source_non_ascii = sum(1 for ch in source if ord(ch) > 127)
    posted_non_ascii = sum(1 for ch in posted if ord(ch) > 127)
    question_count = posted.count("?")
    marker_hits = [marker for marker in MOJIBAKE_MARKERS if marker in posted]

    if source_non_ascii >= 20 and posted_non_ascii < max(5, source_non_ascii // 20):
        return True, "non-ASCII text mostly disappeared"
    if source_non_ascii >= 20 and question_count >= max(20, source_non_ascii // 4):
        return True, "too many replacement question marks"
    if marker_hits:
        return True, "mojibake marker(s): " + ", ".join(marker_hits)
    return False, "ok"


def verify_message(channel: str, ts: str, source: str) -> tuple[bool, str]:
    result = api_call(
        "conversations.history",
        {"channel": channel, "latest": ts, "inclusive": True, "limit": 1},
    )
    if not result.get("ok"):
        return False, f"history failed: {result.get('error')}"
    messages = result.get("messages") or []
    if not messages:
        return False, "history returned no message"
    message = messages[0]
    posted = _block_text(message) or str(message.get("text", ""))
    corrupt, reason = _looks_corrupt(source, posted)
    return not corrupt, reason


def update_message(channel: str, ts: str, text: str) -> dict:
    channel_id = resolve_channel(channel)
    prefixed = ensure_log_cdx_prefix(text)
    payload = {
        "channel": channel_id,
        "ts": ts,
        "text": _trim_fallback_text(prefixed),
    }
    if len(prefixed) > 500:
        payload["text"] = "[Log_cdx] shared-reads post updated; full body is in message blocks."
        payload["blocks"] = _blocks_for_text(prefixed)
    return api_call("chat.update", payload)


def main() -> int:
    parser = argparse.ArgumentParser(description="Post a UTF-8 file to Slack.")
    parser.add_argument("--channel", required=True, help="Slack channel name or id")
    parser.add_argument("--file", required=True, help="UTF-8 text file to post")
    parser.add_argument("--update-ts", help="update an existing Slack message instead of posting a new one")
    parser.add_argument("--delete-on-fail", action="store_true", help="delete the posted message if verification fails")
    args = parser.parse_args()

    path = Path(args.file)
    text = path.read_text(encoding="utf-8")
    if args.channel in {"shared-reads", "#shared-reads", "C0AN2FEHEJJ"}:
        policy = validate_shared_reads_message(text)
        if not policy.ok:
            print(json.dumps({"ok": False, "error": "shared_reads_policy", "reason": policy.reason}, ensure_ascii=False))
            return 3
    result = update_message(args.channel, args.update_ts, text) if args.update_ts else post_message(args.channel, text)
    if not result.get("ok"):
        print(json.dumps(result, ensure_ascii=False))
        return 1

    channel = str(result.get("channel") or resolve_channel(args.channel))
    ts = str(result.get("ts") or args.update_ts or "")
    ok, reason = verify_message(channel, ts, text)
    if not ok and args.delete_on_fail and channel and ts:
        api_call("chat.delete", {"channel": channel, "ts": ts})

    output = {
        "ok": ok,
        "channel": channel,
        "ts": ts,
        "char_count": len(text),
        "verification": reason,
    }
    print(json.dumps(output, ensure_ascii=False))
    return 0 if ok else 2


if __name__ == "__main__":
    raise SystemExit(main())
