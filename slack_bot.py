"""
slack_bot.py — Slack投稿・読み取りの共通モジュール

.envからトークンを読み、Slack APIを呼ぶ。
"""

import os
import json
from pathlib import Path
from urllib import request, error, parse

ENV_FILE = Path(__file__).parent / ".env"


def _load_token():
    """Load SLACK_BOT_TOKEN from .env"""
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("SLACK_BOT_TOKEN=") and not line.startswith("#"):
                    return line.split("=", 1)[1].strip()
    return os.environ.get("SLACK_BOT_TOKEN")


def _api_call(method, data=None):
    """Call Slack API"""
    token = _load_token()
    if not token:
        raise RuntimeError("SLACK_BOT_TOKEN not found in .env")

    url = f"https://slack.com/api/{method}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8",
    }

    if data:
        body = json.dumps(data).encode("utf-8")
    else:
        body = None

    req = request.Request(url, data=body, headers=headers, method="POST")
    try:
        with request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result
    except error.HTTPError as e:
        return {"ok": False, "error": f"HTTP {e.code}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def post_message(channel, text, thread_ts=None):
    """チャンネルにメッセージを投稿（thread_ts指定でスレッド返信）"""
    data = {"channel": channel, "text": text}
    if thread_ts:
        data["thread_ts"] = thread_ts
    return _api_call("chat.postMessage", data)


def list_channels():
    """チャンネル一覧を取得"""
    return _api_call("conversations.list", {"types": "public_channel"})


def get_history(channel, limit=10):
    """チャンネルの直近メッセージを取得"""
    return _api_call("conversations.history", {"channel": channel, "limit": limit})


def create_channel(name):
    """チャンネルを作成"""
    return _api_call("conversations.create", {"name": name})


def auth_test():
    """認証テスト"""
    return _api_call("auth.test")


def _resolve_channel(name):
    """チャンネル名からIDを解決"""
    channels = list_channels()
    if isinstance(channels, dict) and 'channels' in channels:
        for ch in channels['channels']:
            if ch['name'] == name:
                return ch['id']
    return name  # IDがそのまま渡された場合


if __name__ == "__main__":
    import sys, io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    # 認証テスト
    result = auth_test()
    if result.get("ok"):
        print(f"Auth OK: {result.get('user')} @ {result.get('team')}")
    else:
        print(f"Auth FAILED: {result.get('error')}")
        sys.exit(1)

    args = sys.argv[1:]
    if len(args) >= 3 and args[0] == "post":
        channel_name = args[1]
        text = " ".join(args[2:])
        channel_id = _resolve_channel(channel_name)
        result = post_message(channel_id, text)
        if result.get("ok"):
            print(f"Posted to #{channel_name}")
        else:
            print(f"Post FAILED: {result.get('error')}")
    elif len(args) >= 2 and args[0] == "history":
        channel_name = args[1]
        limit = int(args[2]) if len(args) > 2 else 10
        channel_id = _resolve_channel(channel_name)
        result = get_history(channel_id, limit)
        if isinstance(result, dict) and 'messages' in result:
            for m in reversed(result['messages']):
                print(m.get('text', '')[:200])
                print('---')
    elif len(args) >= 1 and args[0] == "list":
        channels = list_channels()
        if isinstance(channels, dict) and 'channels' in channels:
            for ch in channels['channels']:
                print(f"{ch['id']} {ch['name']}")
