"""
check_inbox.py — 受信箱に内容があればclaude CLIを起動する

タスクスケジューラから1-2分間隔で実行。
Claude APIを消費しない（変化時のみ起動）。

使い方:
  python check_inbox.py              # デフォルト: inbox_win.md をチェック
  python check_inbox.py --box mac    # inbox_mac.md をチェック
  python check_inbox.py --box win2   # inbox_win2.md をチェック
"""

import argparse
import subprocess
from datetime import datetime
from pathlib import Path

REPO_DIR = Path(__file__).parent
LOG_FILE = REPO_DIR / "log" / "inbox_check.log"

INBOX_FILES = {
    "win": REPO_DIR / "memory" / "inbox_win.md",
    "mac": REPO_DIR / "memory" / "inbox_mac.md",
    "win2": REPO_DIR / "memory" / "inbox_win2.md",
}

# Header lines that don't count as content
HEADER_LINE_COUNT = 5


def log(message):
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {message}\n")


def has_content(inbox_path):
    """ヘッダー以外に内容があるか"""
    if not inbox_path.exists():
        return False
    with open(inbox_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    # Strip empty lines after header
    content_lines = [
        l for l in lines[HEADER_LINE_COUNT:] if l.strip()
    ]
    return len(content_lines) > 0


def git_pull():
    """最新を取得"""
    try:
        subprocess.run(
            ["git", "pull", "origin", "master"],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(REPO_DIR),
        )
    except Exception:
        pass


def wake_claude(box_name, inbox_path):
    """Claudeを起動して受信箱を処理させる"""
    prompt = f"受信箱({box_name})にメッセージがあります。memory/{inbox_path.name}を読んで対応してください。"
    try:
        result = subprocess.run(
            ["claude", "--print", "-p", prompt],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(REPO_DIR),
        )
        log(f"Claude woken for {box_name}: {result.stdout[:100]}")
    except subprocess.TimeoutExpired:
        log(f"Claude wake timed out for {box_name}")
    except Exception as e:
        log(f"Error waking Claude for {box_name}: {e}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--box", default="win", choices=["win", "mac", "win2"]
    )
    args = parser.parse_args()

    inbox_path = INBOX_FILES[args.box]

    # First pull to get latest
    git_pull()

    if has_content(inbox_path):
        log(f"Inbox {args.box} has content — waking Claude")
        print(f"Inbox {args.box} has content")
        wake_claude(args.box, inbox_path)
    else:
        # Silent — no log to avoid log bloat
        print(f"Inbox {args.box} empty")


if __name__ == "__main__":
    main()
