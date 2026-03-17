"""
check_slack.py — Slackの新着メッセージを検知してclaude CLIを起動

タスクスケジューラ or quick_check.pyから呼ぶ。
APIコストゼロ（Slack API）。変化時のみClaude起動。
"""

import json
import subprocess
from datetime import datetime
from pathlib import Path

from slack_bot import get_history, list_channels, post_message, _api_call

REPO_DIR = Path(__file__).parent
STATE_FILE = REPO_DIR / "slack_state.json"
LOG_FILE = REPO_DIR / "log" / "slack.log"

# チェック対象チャンネル（名前で指定、起動時にID解決）
TARGET_CHANNELS = ["all-nao-u-lab"]


def log(message):
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {message}\n")


def load_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False)


def resolve_channel_ids():
    """チャンネル名→IDの解決"""
    result = list_channels()
    if not result.get("ok"):
        return {}
    mapping = {}
    for ch in result.get("channels", []):
        if ch["name"] in TARGET_CHANNELS:
            mapping[ch["name"]] = ch["id"]
    return mapping


def check_new_messages():
    """新着メッセージを検知して返す"""
    state = load_state()
    channel_map = resolve_channel_ids()
    new_messages = []

    for name, ch_id in channel_map.items():
        history = get_history(ch_id, limit=5)
        if not history.get("ok"):
            continue

        messages = history.get("messages", [])
        if not messages:
            continue

        latest_ts = messages[0].get("ts", "0")
        prev_ts = state.get(f"last_ts_{name}", "0")

        if latest_ts > prev_ts:
            # Filter to only new messages (not from bot)
            for msg in messages:
                if msg.get("ts", "0") > prev_ts and not msg.get("bot_id"):
                    text = msg.get("text", "")
                    user = msg.get("user", "unknown")
                    new_messages.append({
                        "channel": name,
                        "channel_id": ch_id,
                        "user": user,
                        "text": text,
                        "ts": msg.get("ts"),
                    })

            state[f"last_ts_{name}"] = latest_ts

    save_state(state)
    return new_messages


def is_claude_running():
    """Claudeプロセスが稼働中か確認"""
    try:
        result = subprocess.run(
            ["tasklist", "/FI", "IMAGENAME eq claude.exe"],
            capture_output=True, text=True, timeout=10,
        )
        return "claude.exe" in result.stdout.lower()
    except Exception:
        return False


def wake_claude(messages):
    """新しいSlackメッセージがあった時だけClaude CLIを起動"""
    summary = "\n".join(
        f"[{m['channel']}] <@{m['user']}> {m['text'][:200]}" for m in messages
    )
    prompt = f"Slackに新しいメッセージがあります。内容を確認して返信してください。slack_bot.pyのpost_message()で返信できます。\n\n{summary}"
    try:
        result = subprocess.run(
            ["claude", "--print", "-p", prompt],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(REPO_DIR),
            encoding="utf-8",
            errors="replace",
        )
        log(f"Claude woken: {result.stdout[:100]}")
    except subprocess.TimeoutExpired:
        log("Claude wake timed out")
        # タイムアウト時、メッセージがあったことだけ記録
        for m in messages:
            if m.get("channel_id"):
                post_message(m["channel_id"],
                    "Win2（Ash）です。現在処理に時間がかかっています。次のサイクルで対応します。")
                log("Sent timeout notice to Slack")
                break
    except Exception as e:
        log(f"Error waking Claude: {e}")
        # Claude起動失敗時もSlackに通知
        for m in messages:
            if m.get("channel_id"):
                post_message(m["channel_id"],
                    f"Win2（Ash）です。セッション起動に問題が発生しました（{type(e).__name__}）。watchdog_win2.batでの復帰を待ちます。")
                log("Sent error notice to Slack")
                break


def main():
    new_msgs = check_new_messages()
    if new_msgs:
        for m in new_msgs:
            log(f"New message in #{m['channel']}: {m['text'][:100]}")
        print(f"{len(new_msgs)} new Slack message(s)")
        wake_claude(new_msgs)
    else:
        print("No new Slack messages")


if __name__ == "__main__":
    main()
