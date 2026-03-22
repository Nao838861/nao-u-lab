"""
scheduler_ash.py — Ash (Win2) 統合スケジューラ

全ジョブをこの1プロセスが管理する。タスクスケジューラには
「このスクリプトの監視・再起動」だけを登録する。

設計:
- 逐次実行（同時に1つのsubprocessだけ動く）→ claude多重起動が構造的に不可能
- 各ジョブはsubprocess.runで既存スクリプトを呼ぶ（既存コード変更なし）
- 24時間で自発終了 → タスクスケジューラが再起動（メモリリーク防止）
- PIDロックファイルで多重起動防止

ジョブ一覧（setup_tasks_win2.bat と同等）:
  slack_check   : check_slack.py            毎1分    (Python、新着時のみclaude起動)
  inbox_check   : check_inbox.py --box win2  毎5分    (Python、内容ありならclaude起動)
  dm_check      : check_dm.py --wake         毎5分    (Playwright+claude)
  git_sync      : git_sync.py               毎30分   (Python only)
  auto_diary    : auto_diary.py             毎3時間  (claude --print)
  twitter_rec   : read_twitter_recommended.py 毎6時間 4,10,16,22時 (Playwright、おすすめタブ巡回)
"""

import os
import sys
import time
import logging
import subprocess
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent
LOG_FILE = REPO_DIR / "log" / "scheduler_ash.log"
PID_FILE = REPO_DIR / ".scheduler_ash.pid"

MAX_RUNTIME_SEC = 24 * 3600  # 24時間で自発終了

# ── ジョブ定義 ──────────────────────────────────────
# interval_sec: 実行間隔（秒）
# timeout: subprocess.run のタイムアウト（秒）
# stagger: 初回実行までの遅延（秒）。起動直後に全部同時に走るのを防ぐ
JOBS = [
    {
        "name": "git_pull",
        "script": None,  # 特殊: git pull を直接実行
        "args": [],
        "interval_sec": 5 * 60,
        "timeout": 30,
        "stagger": 0,
    },
    {
        "name": "slack_check",
        "script": "check_slack.py",
        "args": [],
        "interval_sec": 1 * 60,
        "timeout": 120,
        "stagger": 5,
    },
    {
        "name": "inbox_check",
        "script": "check_inbox.py",
        "args": ["--box", "win2"],
        "interval_sec": 5 * 60,
        "timeout": 300,
        "stagger": 15,
    },
    {
        "name": "dm_check",
        "script": "check_dm.py",
        "args": ["--wake"],
        "interval_sec": 5 * 60,
        "timeout": 300,
        "stagger": 30,
    },
    {
        "name": "git_sync",
        "script": "git_sync.py",
        "args": [],
        "interval_sec": 30 * 60,
        "timeout": 60,
        "stagger": 60,
    },
    {
        "name": "auto_diary",
        "script": "auto_diary.py",
        "args": [],
        "interval_sec": 3 * 3600,
        "timeout": 600,
        "stagger": 120,
    },
    {
        "name": "twitter_recommended",
        "script": "read_twitter_recommended.py",
        "args": ["--count", "50"],
        "interval_sec": 6 * 3600,
        "timeout": 300,
        "stagger": 180,
        "hour_filter": lambda h: h % 6 == 4,  # Ash: 4,10,16,22時
    },
]


def setup_logging():
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="[%(asctime)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.FileHandler(str(LOG_FILE), encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )


def is_pid_alive(pid):
    """Check if a process with the given PID exists."""
    try:
        result = subprocess.run(
            ["tasklist", "/FI", f"PID eq {pid}"],
            capture_output=True, text=True, timeout=10,
        )
        return f" {pid} " in result.stdout
    except Exception:
        return False


def write_pid():
    """PIDファイルを書く。既に動いているスケジューラがあれば終了。"""
    if PID_FILE.exists():
        try:
            old_pid = int(PID_FILE.read_text().strip())
            if is_pid_alive(old_pid):
                logging.info(f"Scheduler already running (PID {old_pid}). Exiting.")
                sys.exit(0)
        except Exception:
            pass  # PIDファイルが壊れている場合は上書き
    PID_FILE.write_text(str(os.getpid()))


def remove_pid():
    try:
        PID_FILE.unlink(missing_ok=True)
    except Exception:
        pass


def run_git_pull():
    """git pull を実行"""
    try:
        subprocess.run(
            ["git", "pull", "origin", "master", "--rebase"],
            capture_output=True, text=True, timeout=30,
            cwd=str(REPO_DIR),
        )
    except Exception as e:
        logging.warning(f"git pull failed: {e}")


def run_job(job):
    """1つのジョブを実行"""
    name = job["name"]

    # git_pull は特殊処理
    if name == "git_pull":
        run_git_pull()
        return

    script_path = REPO_DIR / job["script"]
    if not script_path.exists():
        logging.warning(f"[{name}] Script not found: {job['script']}")
        return

    cmd = [sys.executable, str(script_path)] + job["args"]

    try:
        logging.info(f"[{name}] Starting")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=job["timeout"],
            cwd=str(REPO_DIR),
            encoding="utf-8",
            errors="replace",
        )
        stdout = result.stdout.strip()
        if stdout:
            # ログが長すぎる場合は切り詰め
            for line in stdout.split("\n")[:5]:
                logging.info(f"[{name}] {line[:200]}")
        if result.returncode != 0:
            stderr = result.stderr.strip()
            if stderr:
                logging.warning(f"[{name}] ERR: {stderr[:300]}")
        logging.info(f"[{name}] Done (exit={result.returncode})")
    except subprocess.TimeoutExpired:
        logging.warning(f"[{name}] Timeout ({job['timeout']}s)")
    except Exception as e:
        logging.error(f"[{name}] Error: {e}")


def main():
    setup_logging()
    write_pid()

    logging.info("=" * 50)
    logging.info("Ash scheduler started (PID %d)", os.getpid())
    logging.info("Max runtime: %d hours", MAX_RUNTIME_SEC // 3600)
    logging.info("Jobs: %s", ", ".join(j["name"] for j in JOBS))
    logging.info("=" * 50)

    start_time = time.time()
    now = time.time()

    # 各ジョブの次回実行時刻を初期化（staggerで分散）
    next_run = {}
    for job in JOBS:
        next_run[job["name"]] = now + job["stagger"]

    try:
        while True:
            # 24時間経過で自発終了
            elapsed = time.time() - start_time
            if elapsed >= MAX_RUNTIME_SEC:
                logging.info("Max runtime reached (%d hours). Shutting down.", MAX_RUNTIME_SEC // 3600)
                break

            now = time.time()

            for job in JOBS:
                name = job["name"]
                if now >= next_run[name]:
                    # hour_filterがある場合、現在の時間が条件を満たすかチェック
                    hour_filter = job.get("hour_filter")
                    if hour_filter and not hour_filter(datetime.now().hour):
                        # 条件不一致 → 1時間後に再チェック
                        next_run[name] = time.time() + 3600
                        continue
                    run_job(job)
                    # 次回実行時刻を設定（実行完了時刻基準）
                    next_run[name] = time.time() + job["interval_sec"]

            # 10秒ごとにチェック（CPU負荷ほぼゼロ）
            time.sleep(10)

    except KeyboardInterrupt:
        logging.info("Interrupted by user")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
    finally:
        remove_pid()
        logging.info("Scheduler stopped")


if __name__ == "__main__":
    main()
