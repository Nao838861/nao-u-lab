"""
scheduler_ash.py — Ash (Win2) 統合スケジューラ

全ジョブをこの1プロセスが管理する。タスクスケジューラには
「このスクリプトの監視・再起動」だけを登録する。

設計:
- 逐次実行（同時に1つのsubprocessだけ動く）→ claude多重起動が構造的に不可能
- 各ジョブはsubprocess.runで既存スクリプトを呼ぶ（既存コード変更なし）
- 24時間で自発終了 → タスクスケジューラが再起動（メモリリーク防止）
- PIDロックファイルで多重起動防止

ジョブ一覧（省エネ強化モード 2026-03-25 Nao_u指示: Ashが週間25%/1日消費→全間隔2倍化）:
  slack_check      : check_slack.py            毎1分   (Python、新着時のみclaude起動)
  inbox_check      : check_inbox.py --box win2  毎2時間  (Python、内容ありならclaude起動)
  dm_check         : check_dm.py --wake         毎2時間  (Playwright+claude)
  git_sync         : git_sync.py               毎1時間  (Python only)
  review_deadline  : check_review_deadline.py --nag  毎2時間 (48h期限チェック)
  kaizen_auto_verify: check_kaizen_due.py --auto-verify 毎6時間 (検証コマンド自動実行)
  auto_diary       : auto_diary.py             毎8時間  (claude --print, 省エネ強化 2026-03-25)
  twitter_rec      : read_twitter_recommended.py 毎6時間 4,10,16,22時 (Playwright、おすすめタブ巡回)
  weekly_review    : weekly_self_review.py      日曜のみ  (#kaizen-review週次自己レビュー)
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
        "interval_sec": 60 * 60,  # 1時間（省エネモード 2026-03-24 Nao_u指示）
        "timeout": 30,
        "stagger": 0,
    },
    {
        "name": "slack_check",
        "script": "check_slack.py",
        "args": [],
        "interval_sec": 1 * 60,  # 1分（即時反応のため）
        "timeout": 120,
        "stagger": 5,
    },
    {
        "name": "inbox_check",
        "script": "check_inbox.py",
        "args": ["--box", "win2"],
        "interval_sec": 2 * 3600,  # 2時間（省エネ強化 2026-03-25 Nao_u指示: 週間25%/1日消費）
        "timeout": 600,
        "stagger": 15,
    },
    {
        "name": "dm_check",
        "script": "check_dm.py",
        "args": ["--wake"],
        "interval_sec": 2 * 3600,  # 2時間（省エネ強化 2026-03-25 Nao_u指示: 週間25%/1日消費）
        "timeout": 300,
        "stagger": 30,
    },
    {
        "name": "reservation_check",
        "script": "check_reservations.py",
        "args": ["--verbose"],
        "interval_sec": 2 * 3600,  # 2時間（省エネ強化 2026-03-25 Nao_u指示）
        "timeout": 10,
        "stagger": 10,
    },
    {
        "name": "review_deadline",
        "script": "check_review_deadline.py",
        "args": ["--nag"],
        "interval_sec": 2 * 3600,  # 2時間（省エネ強化 2026-03-25 Nao_u指示）
        "timeout": 30,
        "stagger": 12,
    },
    {
        "name": "kaizen_auto_verify",
        "script": "check_kaizen_due.py",
        "args": ["--auto-verify"],
        "interval_sec": 6 * 3600,  # 6時間（省エネ強化 2026-03-25 Nao_u指示: 3時間→6時間）
        "timeout": 120,
        "stagger": 45,
    },
    {
        "name": "weekly_self_review",
        "script": "weekly_self_review.py",
        "args": [],
        "interval_sec": 6 * 3600,  # 6時間ごとにチェック（日曜のみ実行）
        "timeout": 600,
        "stagger": 200,
        "day_filter": lambda d: d == 6,  # 日曜日のみ (0=月, 6=日)
    },
    {
        "name": "git_sync",
        "script": "git_sync.py",
        "args": [],
        "interval_sec": 60 * 60,  # 1時間（省エネモード 2026-03-24 Nao_u指示）
        "timeout": 60,
        "stagger": 60,
    },
    {
        "name": "auto_diary",
        "script": "auto_diary.py",
        "args": [],
        "interval_sec": 90 * 60,  # 1.5時間（2026-03-26 Nao_u #human-steering: メインサイクル1.5時間化。usage 34%、42%まで余裕あり）
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
    """Check if a process with the given PID exists (two methods for reliability)."""
    # Method 1: tasklist
    try:
        result = subprocess.run(
            ["tasklist", "/FI", f"PID eq {pid}"],
            capture_output=True, text=True, timeout=10,
        )
        if f" {pid} " in result.stdout:
            return True
    except Exception:
        pass
    # Method 2: kernel32 OpenProcess (more reliable on Windows)
    try:
        import ctypes
        PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
        handle = ctypes.windll.kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
        if handle:
            ctypes.windll.kernel32.CloseHandle(handle)
            return True
    except Exception:
        pass
    return False


def write_pid():
    """PIDファイルを書く。既に動いているスケジューラがあれば終了。"""
    if PID_FILE.exists():
        try:
            old_pid = int(PID_FILE.read_text().strip())
            if old_pid != os.getpid() and is_pid_alive(old_pid):
                logging.info(f"Scheduler already running (PID {old_pid}). Exiting.")
                sys.exit(0)
            # PIDファイルの年齢もチェック（24時間超は stale と判断）
            age = time.time() - PID_FILE.stat().st_mtime
            if age < 10 and old_pid != os.getpid():
                # 10秒以内に別プロセスが書いた → 競合。後から来た方が退く
                logging.info(f"PID file just written by another process ({old_pid}, {age:.1f}s ago). Exiting.")
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
    """1つのジョブを実行。戻り値はsubprocessのreturncode（特殊ジョブは0）。"""
    name = job["name"]

    # git_pull は特殊処理
    if name == "git_pull":
        run_git_pull()
        return 0

    script_path = REPO_DIR / job["script"]
    if not script_path.exists():
        logging.warning(f"[{name}] Script not found: {job['script']}")
        return -1

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
        return result.returncode
    except subprocess.TimeoutExpired:
        logging.warning(f"[{name}] Timeout ({job['timeout']}s)")
        return -1
    except Exception as e:
        logging.error(f"[{name}] Error: {e}")
        return -1


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
                    # day_filterがある場合、曜日が条件を満たすかチェック
                    day_filter = job.get("day_filter")
                    if day_filter and not day_filter(datetime.now().weekday()):
                        # 条件不一致 → 6時間後に再チェック
                        next_run[name] = time.time() + 6 * 3600
                        continue
                    rc = run_job(job)
                    # 次回実行時刻を設定（実行完了時刻基準）
                    next_run[name] = time.time() + job["interval_sec"]

                    # Slack即時応答: slack_checkが新着検出(rc=0)ならinbox_checkを即時トリガー
                    # (2026-03-26 Nao_uの指示: Slack 1分監視→inbox処理のラグをなくす)
                    if name == "slack_check" and rc == 0:
                        logging.info("[slack_check] New messages detected -> triggering inbox_check immediately")
                        next_run["inbox_check"] = 0  # 次のループで即実行

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
