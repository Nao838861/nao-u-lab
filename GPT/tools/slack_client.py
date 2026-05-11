#!/usr/bin/env python3
"""
Minimal Slack Web API client for GPT-side scripts.

No Claude-side modules are imported. Credentials are read from GPT/.env or the
process environment.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from urllib import error, request


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env"
POST_PREFIX = "[Log_cdx]"


def _load_token() -> str | None:
    if ENV_FILE.exists():
        with ENV_FILE.open("r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if line.startswith("SLACK_BOT_TOKEN=") and not line.startswith("#"):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("SLACK_BOT_TOKEN")


def api_call(method: str, data: dict | None = None) -> dict:
    token = _load_token()
    if not token:
        return {"ok": False, "error": "SLACK_BOT_TOKEN not found in GPT/.env or environment"}

    url = f"https://slack.com/api/{method}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8",
    }
    body = json.dumps(data or {}).encode("utf-8")
    req = request.Request(url, data=body, headers=headers, method="POST")
    try:
        with request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as exc:
        return {"ok": False, "error": f"HTTP {exc.code}"}
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def resolve_channel(name_or_id: str) -> str:
    if name_or_id.startswith("C"):
        return name_or_id
    wanted = name_or_id.lstrip("#")
    result = api_call("conversations.list", {"types": "public_channel,private_channel", "limit": 1000})
    if result.get("ok"):
        for channel in result.get("channels", []):
            if channel.get("name") == wanted:
                return channel.get("id")
    return name_or_id


def ensure_log_cdx_prefix(text: str) -> str:
    stripped = text.lstrip()
    if stripped.startswith(POST_PREFIX):
        return text
    return f"{POST_PREFIX} {stripped}"


def post_message(channel: str, text: str) -> dict:
    channel_id = resolve_channel(channel)
    return api_call("chat.postMessage", {"channel": channel_id, "text": ensure_log_cdx_prefix(text)})
