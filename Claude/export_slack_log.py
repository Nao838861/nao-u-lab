"""
export_slack_log.py — Slackの全チャンネルメッセージをローカルに増分エクスポート

■ 概要
- Slack APIで全チャンネルの新着メッセージを取得し、log/slack_archive/ に保存
- 前回エクスポート時点以降の新着分のみ取得（最小限のAPI呼び出し）
- Claude API不要、Python標準ライブラリ + slack_bot.py のみ

■ 保存形式
- log/slack_archive/{channel_name}.jsonl  — 1行1メッセージのJSON Lines
- 各行: {"ts": "...", "user": "...", "user_name": "...", "text": "...", "channel": "..."}
- log/slack_archive/_state.json — 各チャンネルの最終エクスポートts

■ スケジュール（3インスタンス分散、各自1日1回）
- Log(Win):  hour%24 == 2  (02:00 JST)
- Mir(Mac):  hour%24 == 10 (10:00 JST)
- Ash(Win2): hour%24 == 18 (18:00 JST)
- → 実質8時間ごとにカバー

■ 実行方法
  python export_slack_log.py
"""

import json
import sys
import platform
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from slack_bot import _api_call

REPO_DIR = Path(__file__).parent
ARCHIVE_DIR = REPO_DIR / "log" / "slack_archive"
STATE_FILE = ARCHIVE_DIR / "_state.json"

# Botユーザー名キャッシュ
_user_cache = {}


def ensure_dirs():
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_state(state):
    STATE_FILE.write_text(
        json.dumps(state, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )


def get_user_name(user_id):
    if user_id in _user_cache:
        return _user_cache[user_id]
    result = _api_call("users.info", {"user": user_id})
    if result.get("ok"):
        name = result["user"].get("real_name") or result["user"].get("name", user_id)
    else:
        name = user_id
    _user_cache[user_id] = name
    return name


def get_all_channels():
    """Bot参加チャンネル一覧を取得"""
    channels = []
    for ch_type in ["public_channel", "private_channel"]:
        cursor = None
        while True:
            params = {"types": ch_type, "limit": 200}
            if cursor:
                params["cursor"] = cursor
            result = _api_call("conversations.list", params)
            if not result.get("ok"):
                break
            for ch in result.get("channels", []):
                if ch.get("is_member", False):
                    channels.append(ch)
            cursor = result.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                break
    return channels


def fetch_messages(channel_id, oldest_ts="0"):
    """指定チャンネルのoldest_ts以降のメッセージを全件取得"""
    all_msgs = []
    cursor = None
    while True:
        params = {
            "channel": channel_id,
            "oldest": oldest_ts,
            "limit": 200,
            "inclusive": False,
        }
        if cursor:
            params["cursor"] = cursor
        result = _api_call("conversations.history", params)
        if not result.get("ok"):
            break
        msgs = result.get("messages", [])
        all_msgs.extend(msgs)
        if not result.get("has_more", False):
            break
        cursor = result.get("response_metadata", {}).get("next_cursor")
        if not cursor:
            break
    # 古い順にソート
    all_msgs.sort(key=lambda m: float(m.get("ts", "0")))
    return all_msgs


def sanitize_filename(name):
    """チャンネル名をファイル名に安全な形に"""
    return "".join(c if c.isalnum() or c in "-_" else "_" for c in name)


def export_channel(ch_id, ch_name, state):
    """1チャンネルのエクスポート。新着メッセージ数を返す"""
    oldest_ts = state.get(ch_id, "0")
    messages = fetch_messages(ch_id, oldest_ts)

    if not messages:
        return 0

    safe_name = sanitize_filename(ch_name)
    out_file = ARCHIVE_DIR / f"{safe_name}.jsonl"

    with open(out_file, "a", encoding="utf-8") as f:
        for msg in messages:
            user_id = msg.get("user", msg.get("bot_id", "unknown"))
            user_name = get_user_name(user_id) if user_id != "unknown" else "unknown"
            ts = msg.get("ts", "")
            dt = datetime.fromtimestamp(float(ts)).isoformat()

            record = {
                "ts": ts,
                "datetime": dt,
                "user": user_id,
                "user_name": user_name,
                "channel": ch_name,
                "text": msg.get("text", ""),
            }
            # スレッド返信のthread_tsも保持
            if "thread_ts" in msg and msg["thread_ts"] != msg.get("ts"):
                record["thread_ts"] = msg["thread_ts"]
            # 添付ファイル情報
            if msg.get("files"):
                record["files"] = [
                    {"name": f.get("name"), "url": f.get("url_private")}
                    for f in msg["files"]
                ]

            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    # 最新tsを更新
    latest_ts = messages[-1].get("ts", oldest_ts)
    state[ch_id] = latest_ts
    return len(messages)


def main():
    ensure_dirs()
    state = load_state()
    channels = get_all_channels()

    if not channels:
        print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] No channels found")
        return 1

    total_new = 0
    results = []

    for ch in channels:
        ch_id = ch["id"]
        ch_name = ch.get("name", ch_id)
        try:
            count = export_channel(ch_id, ch_name, state)
            if count > 0:
                results.append(f"  #{ch_name}: {count} messages")
                total_new += count
        except Exception as e:
            results.append(f"  #{ch_name}: ERROR - {e}")

    save_state(state)

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] Slack export complete: {total_new} new messages from {len(channels)} channels")
    for r in results:
        print(r)

    return 0


if __name__ == "__main__":
    sys.exit(main())
