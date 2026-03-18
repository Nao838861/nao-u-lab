"""
check_slack.py — Slack全チャンネル監視 + 変化時のみClaude CLI起動

毎分実行。人間の新着メッセージがあれば:
1. inboxに書き込み
2. Claude CLIを起動して即時処理

新着がなければPythonだけで終了（APIコストゼロ）。
新着があった時のみClaude APIを消費。

セットアップ:
  Mac:  crontab -e で追加:
    * * * * * /opt/homebrew/bin/python3 /Users/Nao_u/nao-u-lab/check_slack.py >> /tmp/check_slack.log 2>&1

  Win (D:\\AI\\Nao_u_BOT):  タスクスケジューラで1分ごと:
    cd /d D:\\AI\\Nao_u_BOT && python check_slack.py

  Win2 (C:\\AI\\nao-u-lab): タスクスケジューラで1分ごと:
    cd /d C:\\AI\\nao-u-lab && python check_slack.py
"""

import sys
import json
import time
import platform
import subprocess
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from slack_bot import _api_call, list_channels

REPO_DIR = Path(__file__).parent
STATE_FILE = REPO_DIR / ".slack_last_check.json"
BOT_USER_ID = "U0ALW4DKTT7"  # naoubotmir


def detect_inbox():
    """プラットフォームとパスからinboxファイルを決定"""
    if platform.system() == "Darwin":
        return REPO_DIR / "memory" / "inbox_mac.md"
    repo_str = str(REPO_DIR).lower()
    if "d:\\ai" in repo_str or "d:/ai" in repo_str:
        return REPO_DIR / "memory" / "inbox_win.md"
    return REPO_DIR / "memory" / "inbox_win2.md"


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            return {}
    return {}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False))


def get_all_channels():
    """botが参加している全チャンネル（public/private/DM）を取得"""
    channels = []
    for ch_type in ["public_channel", "private_channel", "im", "mpim"]:
        result = _api_call("conversations.list", {
            "types": ch_type,
            "limit": 200
        })
        if result.get("ok"):
            for ch in result.get("channels", []):
                if ch.get("is_member", False) or ch_type == "im":
                    channels.append(ch)
    return channels


def get_user_name(user_id, cache={}):
    if user_id in cache:
        return cache[user_id]
    result = _api_call("users.info", {"user": user_id})
    if result.get("ok"):
        name = result["user"].get("real_name") or result["user"].get("name", user_id)
    else:
        name = user_id
    cache[user_id] = name
    return name


def main():
    state = load_state()
    channels = get_all_channels()
    if not channels:
        print(f"[{datetime.now():%H:%M:%S}] No channels found")
        return 1

    new_messages = []

    for ch in channels:
        ch_id = ch["id"]
        ch_name = ch.get("name", ch.get("user", ch_id))
        prev_ts = state.get(ch_id, "0")

        result = _api_call("conversations.history", {
            "channel": ch_id,
            "oldest": prev_ts,
            "limit": 20
        })
        if not result.get("ok") or "messages" not in result:
            continue

        for msg in result["messages"]:
            # botメッセージをスキップ
            if msg.get("bot_id") or msg.get("subtype") == "bot_message":
                continue
            if msg.get("user") == BOT_USER_ID:
                continue

            ts = msg.get("ts", "0")
            # prev_tsと同じメッセージはスキップ（oldest は exclusive ではない場合の対策）
            if ts <= prev_ts:
                continue

            new_messages.append({
                "channel": ch_name,
                "user_id": msg.get("user", "unknown"),
                "text": msg.get("text", ""),
                "ts": ts,
            })

        # チャンネルの最新tsを記録（botメッセージ含む全体の最新）
        if result["messages"]:
            latest = max(m.get("ts", "0") for m in result["messages"])
            if latest > prev_ts:
                state[ch_id] = latest

    save_state(state)

    if not new_messages:
        # 静かに終了（ログ最小化）
        return 1

    # inboxに書き込み
    inbox = detect_inbox()
    lines = []
    for msg in sorted(new_messages, key=lambda x: x["ts"]):
        dt = datetime.fromtimestamp(float(msg["ts"]))
        user_name = get_user_name(msg["user_id"])
        lines.append(f"\n## Slack新着 [{dt:%Y-%m-%d %H:%M}] #{msg['channel']}")
        lines.append(f"From: {user_name}")
        lines.append(f"> {msg['text']}")
        lines.append("")

    with open(inbox, "a", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"[{datetime.now():%H:%M:%S}] {len(new_messages)} msg(s) -> {inbox.name}")

    # Claude CLIを起動して即時処理
    wake_claude(new_messages)
    return 0


def wake_claude(messages):
    """新着メッセージがあった時のみClaude CLIを起動（APIコスト発生）"""
    summary = "\n".join(
        f"[#{m['channel']}] {m['text'][:200]}" for m in messages
    )
    prompt = (
        f"Slackに新しいメッセージがあります。inbox_mac.md（またはinbox_win/win2）を読んで処理してください。"
        f"\n\n{summary}"
    )

    # プラットフォームに応じたclaude CLI
    if platform.system() == "Darwin":
        claude_cmd = ["claude", "--print", "-p", prompt]
    else:
        claude_cmd = ["claude", "--print", "-p", prompt]

    try:
        result = subprocess.run(
            claude_cmd,
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(REPO_DIR),
            encoding="utf-8",
            errors="replace",
        )
        print(f"[{datetime.now():%H:%M:%S}] Claude woken: {result.stdout[:100]}")
    except subprocess.TimeoutExpired:
        print(f"[{datetime.now():%H:%M:%S}] Claude wake timed out")
    except FileNotFoundError:
        print(f"[{datetime.now():%H:%M:%S}] claude CLI not found in PATH")
    except Exception as e:
        print(f"[{datetime.now():%H:%M:%S}] Error waking Claude: {e}")


if __name__ == "__main__":
    sys.exit(main())
