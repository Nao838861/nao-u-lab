"""
watchdog_log.pyw — Log(Win) スケジューラ監視＋復帰（サイレント版）

タスクスケジューラから5分ごとに pythonw で呼ぶ。
.pyw = pythonwで実行される = コンソールウィンドウなし。

1. git pull（他マシンからの変更を取り込む）
2. Slackの新着をチェック（Claudeなしで動く）
3. scheduler_log.pyが動いていなければ再起動
"""

import os
import sys
import subprocess
import time
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent
os.chdir(REPO_DIR)

LOG_FILE = REPO_DIR / "log" / "watchdog_log.log"
LOCK_FILE = REPO_DIR / ".scheduler_log.lock"

# Windows: 全子プロセスのウィンドウを非表示
CREATE_NO_WINDOW = 0x08000000


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}\n"
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line)
    except Exception:
        pass


def run_silent(cmd, timeout=30):
    """ウィンドウなしでコマンド実行"""
    try:
        return subprocess.run(
            cmd,
            capture_output=True, text=True, timeout=timeout,
            cwd=str(REPO_DIR),
            creationflags=CREATE_NO_WINDOW,
        )
    except Exception as e:
        log(f"Error running {cmd[0]}: {e}")
        return None


def git_pull():
    run_silent(["git", "pull", "origin", "master", "--rebase"])


def check_slack():
    run_silent([sys.executable, "check_slack.py"], timeout=60)


def is_scheduler_alive():
    if not LOCK_FILE.exists():
        return False
    try:
        pid = LOCK_FILE.read_text().strip()
        result = subprocess.run(
            ["tasklist", "/FI", f"PID eq {pid}"],
            capture_output=True, text=True,
            creationflags=CREATE_NO_WINDOW,
        )
        return pid in result.stdout
    except Exception:
        return False


def start_scheduler():
    # Clean up stale lock
    if LOCK_FILE.exists():
        try:
            LOCK_FILE.unlink()
        except Exception:
            pass

    # Start scheduler as detached, no-window process
    subprocess.Popen(
        [sys.executable, "scheduler_log.py"],
        creationflags=CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
        stdout=open(REPO_DIR / "log" / "scheduler_stdout.log", "w"),
        stderr=subprocess.STDOUT,
        cwd=str(REPO_DIR),
    )
    log("Scheduler restarted")


def main():
    git_pull()
    check_slack()

    if is_scheduler_alive():
        # log("Scheduler alive")  # 正常時はログを汚さない
        pass
    else:
        log("Scheduler not running — restarting")
        start_scheduler()


if __name__ == "__main__":
    main()
