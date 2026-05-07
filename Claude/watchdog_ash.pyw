"""
watchdog_ash.pyw — Ash(Win2) スケジューラ監視＋復帰（サイレント版）

タスクスケジューラから5分ごとに pythonw で呼ぶ。
.pyw = pythonwで実行される = コンソールウィンドウなし。

1. scheduler_ash.pyが動いていなければ再起動
"""

import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent
os.chdir(REPO_DIR)

LOG_FILE = REPO_DIR / "log" / "watchdog_ash.log"
PID_FILE = REPO_DIR / ".scheduler_ash.pid"

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


def is_scheduler_alive():
    if not PID_FILE.exists():
        return False
    try:
        pid = PID_FILE.read_text().strip()
        result = subprocess.run(
            ["tasklist", "/FI", f"PID eq {pid}"],
            capture_output=True, text=True,
            creationflags=CREATE_NO_WINDOW,
        )
        return pid in result.stdout
    except Exception:
        return False


def start_scheduler():
    # Clean up stale PID file
    if PID_FILE.exists():
        try:
            PID_FILE.unlink()
        except Exception:
            pass

    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"

    # Start scheduler as detached, no-window process
    subprocess.Popen(
        [sys.executable, "-X", "utf8", "scheduler_ash.py"],
        creationflags=CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
        stdout=open(REPO_DIR / "log" / "scheduler_ash_stdout.log", "w"),
        stderr=subprocess.STDOUT,
        cwd=str(REPO_DIR),
        env=env,
    )
    log("Scheduler restarted")


def main():
    # マシンガード: AshスケジューラはWin2(C:\AI)でのみ実行可能
    repo_lower = str(REPO_DIR).replace("\\", "/").lower()
    if "/d/" in repo_lower or repo_lower.startswith("d:"):
        return  # Log マシンでは何もしない

    if is_scheduler_alive():
        pass  # 正常時はログを汚さない
    else:
        log("Scheduler not running — restarting")
        start_scheduler()


if __name__ == "__main__":
    main()
