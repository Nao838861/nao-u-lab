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

  Win (Log):  scheduler_log.py経由（引数なし、パスから自動判定）
  Win2 (Ash): scheduler_ash.py経由（--box win2 を渡す）
"""

import argparse
import re
import sys
import json
import time
import platform
import subprocess
from datetime import datetime
from pathlib import Path

from claude_runner import build_claude_cmd

# Windows: 全子プロセスのウィンドウを非表示にする
if sys.platform == "win32":
    _orig_run = subprocess.run
    def _silent_run(*a, **kw):
        kw.setdefault("creationflags", subprocess.CREATE_NO_WINDOW)
        return _orig_run(*a, **kw)
    subprocess.run = _silent_run
    _orig_popen = subprocess.Popen
    def _silent_popen(*a, **kw):
        kw.setdefault("creationflags", subprocess.CREATE_NO_WINDOW)
        return _orig_popen(*a, **kw)
    subprocess.Popen = _silent_popen

sys.path.insert(0, str(Path(__file__).parent))
from slack_bot import _api_call, list_channels

REPO_DIR = Path(__file__).parent
STATE_FILE = REPO_DIR / ".slack_last_check.json"
# 全botのユーザーID（Log, Mir, Ash）— botの投稿を人間と誤検知しないようフィルタ
BOT_USER_IDS = {"U0ALW4DKTT7", "U0AM1F23FQU", "U0AMQKE69BJ"}


def detect_inbox(box_override=None):
    """プラットフォームとパスからinboxファイルを決定。
    box_override が指定されていればそちらを優先する（scheduler経由で--box引数を渡す用途）。"""
    if box_override:
        return REPO_DIR / "memory" / f"inbox_{box_override}.md"
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


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--box", choices=["win", "win2", "mac"],
                        help="inbox先を明示指定（パス自動判定を上書き）")
    return parser.parse_args()


def main():
    args = parse_args()
    box = args.box

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
            if msg.get("user") in BOT_USER_IDS:
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
    inbox = detect_inbox(box)
    lines = []
    for msg in sorted(new_messages, key=lambda x: x["ts"]):
        dt = datetime.fromtimestamp(float(msg["ts"]))
        user_name = get_user_name(msg["user_id"])
        lines.append(f"\n## Slack新着 [{dt:%Y-%m-%d %H:%M}] #{msg['channel']}")
        lines.append(f"From: {user_name}")
        lines.append(f"> {msg['text']}")

        # Expand x.com/twitter.com URLs in message
        tweet_contents = expand_tweet_urls(msg["text"])
        if tweet_contents:
            for tc in tweet_contents:
                lines.append(f"\n> [Tweet content from {tc['url']}]")
                if tc.get("author"):
                    lines.append(f"> {tc['author']} {tc.get('handle', '')}")
                lines.append(f"> {tc.get('text', '(could not read)')}")
                if tc.get("quotes"):
                    for q in tc["quotes"]:
                        lines.append(f"> [QT] {q}")

        lines.append("")

    with open(inbox, "a", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"[{datetime.now():%H:%M:%S}] {len(new_messages)} msg(s) -> {inbox.name}")

    # 即時起動: inboxに書き込んだらcheck_inboxを呼んで即座にClaude CLIを起動する
    # Mac: check_inbox.sh経由（ロックファイルで二重起動防止）
    # Win: scheduler_log.pyの即時トリガーに一本化（INC-022: 両方が呼ぶと重起動）
    # (2026-03-26 Nao_uの指示: Slack 1分応答)
    if platform.system() == "Darwin":
        trigger_check_inbox()
    return 0


def _read_tweet_with_timeout(url, timeout_sec=60):
    """read_tweetをサブプロセスで実行し、タイムアウトを強制する。
    Playwrightのブラウザハングでcheck_slack全体がブロックされるのを防ぐ。"""
    import subprocess, sys
    try:
        proc = subprocess.run(
            [sys.executable, "-c",
             f"import json; from read_tweet_url import read_tweet; print(json.dumps(read_tweet({url!r})))"],
            capture_output=True, text=True, timeout=timeout_sec,
            cwd=str(Path(__file__).parent),
        )
        if proc.returncode == 0 and proc.stdout.strip():
            import json
            return json.loads(proc.stdout.strip())
        else:
            return {"url": url, "text": f"(subprocess error: {proc.stderr[:200]})"}
    except subprocess.TimeoutExpired:
        return {"url": url, "text": f"(timeout: {timeout_sec}s)"}
    except Exception as e:
        return {"url": url, "text": f"(error: {e})"}


def expand_tweet_urls(text):
    """Extract x.com/twitter.com URLs from text and read their content."""
    urls = re.findall(r'https?://(?:x\.com|twitter\.com)/\w+/status/\d+', text)
    if not urls:
        return []

    results = []
    for url in urls[:3]:  # max 3 URLs per message
        try:
            data = _read_tweet_with_timeout(url, timeout_sec=60)
            if "error" not in data:
                results.append(data)
            else:
                results.append({"url": url, "text": f"(read failed: {data.get('error', data.get('text', '?'))})"})
        except Exception as e:
            results.append({"url": url, "text": f"(error: {e})"})

    return results


def trigger_check_inbox():
    """新着メッセージ検出時にLaunchAgentを即時キックする。
    LaunchAgentはユーザーセッション内で動くためキーチェーン（Claude CLI認証）にアクセスできる。
    cronから直接check_inbox.shをPopenするとキーチェーンにアクセスできず認証失敗する（2026-04-22修正）。"""
    try:
        subprocess.run(
            ["launchctl", "kickstart", "gui/503/com.nao-u-lab.check-inbox"],
            capture_output=True,
            timeout=10,
        )
        print(f"[{datetime.now():%H:%M:%S}] Kicked LaunchAgent check-inbox")
    except Exception as e:
        print(f"[{datetime.now():%H:%M:%S}] Failed to kick LaunchAgent: {e}")


def trigger_check_inbox_win(box_override=None):
    """Win側: 新着メッセージ検出時にcheck_inbox.pyを即時起動する。
    check_inbox.py内のクールダウン機構で過剰起動は防止される。"""
    if box_override:
        inbox_box = box_override
    else:
        inbox_box = "win"
        repo_str = str(REPO_DIR).lower()
        if "c:\\ai" in repo_str or "c:/ai" in repo_str:
            inbox_box = "win2"
    try:
        subprocess.Popen(
            [sys.executable, str(REPO_DIR / "check_inbox.py"), "--box", inbox_box],
            cwd=str(REPO_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        print(f"[{datetime.now():%H:%M:%S}] Triggered check_inbox.py --box {inbox_box}")
    except Exception as e:
        print(f"[{datetime.now():%H:%M:%S}] Failed to trigger check_inbox.py: {e}")


def wake_claude(messages):
    """新着メッセージがあった時のみClaude CLIを起動（APIコスト発生）"""
    summary = "\n".join(
        f"[#{m['channel']}] {m['text'][:200]}" for m in messages
    )
    prompt = (
        f"Slackに新しいメッセージがあります。inbox_mac.md（またはinbox_win/win2）を読んで処理してください。"
        f"\n\n{summary}"
    )

    claude_cmd = build_claude_cmd(prompt)

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
