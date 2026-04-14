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
  dm_check         : check_dm.py --wake         毎2時間  (Playwright+claude, Nao_u宛)
  dm_check_pigadev : check_dm.py --wake --user ぴ 毎2時間  (天谷さんDM検出 2026-03-27追加)
  git_sync         : git_sync.py               毎1時間  (Python only)
  review_deadline  : check_review_deadline.py --nag  毎2時間 (48h期限チェック)
  kaizen_auto_verify: check_kaizen_due.py --auto-verify 毎6時間 (検証コマンド自動実行)
  auto_diary       : auto_diary.py             毎1時間  (claude --print, 2026-03-27 Nao_u指示: 1時間化)
  twitter_rec      : read_twitter_recommended.py 毎6時間 4,10,16,22時 (Playwright、おすすめタブ巡回)
  weekly_review    : weekly_self_review.py      日曜のみ  (#kaizen-review週次自己レビュー)
  health_check     : infra_health_check.py      毎30分  (LLM不使用、インフラ監視)
  scheduler_health : check_scheduler_health.py   毎1時間  (LLM不使用、スケジューラ健全性 2026-04-02追加)
"""

import os
import sys
import time
import json
import hashlib
import logging
import subprocess
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent
LOG_FILE = REPO_DIR / "log" / "scheduler_ash.log"
PID_FILE = REPO_DIR / ".scheduler_ash.pid"
CONFIG_FILE = REPO_DIR / "scheduler_ash_config.json"

MAX_RUNTIME_SEC = 0  # 無制限（watchdog_win2.batが5分間隔で生存監視。2026-03-31 Nao_u指示で24h制限撤廃）

# --- コード変更自動検出 (INC-018再発防止) ---
# 起動時の自身のハッシュを記録。変更を検出したら自動で終了→watchdogが新コードで再起動。
# これにより「コード修正後に再起動し忘れて旧コードで動き続ける」問題を構造的に防ぐ。
_SELF_PATH = Path(__file__)
_CODE_CHECK_INTERVAL = 60  # 60秒ごとにチェック
_WATCHED_FILES = [_SELF_PATH, REPO_DIR / "claude_runner.py"]  # 自身＋依存ファイル


def _compute_code_hash():
    """監視対象ファイルの結合ハッシュを返す。"""
    h = hashlib.md5()
    for fpath in _WATCHED_FILES:
        try:
            h.update(fpath.read_bytes())
        except Exception:
            pass
    return h.hexdigest()


_startup_code_hash = _compute_code_hash()
CONSECUTIVE_TIMEOUT_THRESHOLD = 3  # 連続タイムアウトこの回数でアラート+自動復旧
TIMEOUT_ESCALATION_FACTOR = 1.5  # タイムアウト自動引き上げ倍率

# ── ジョブ定義 ──────────────────────────────────────
# ⚠ 周期・タイムアウトの変更は scheduler_ash_config.json 経由で行うこと
# ⚠ このJOBS定義を直接編集しても再起動するまで反映されない
# ⚠ 変更コマンド: python update_scheduler.py ash <job> interval <秒>
# interval_sec: 実行間隔（秒）— フォールバックデフォルト値
# timeout: subprocess.run のタイムアウト（秒）— フォールバックデフォルト値
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
        "args": ["--box", "win2"],
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
        "name": "dm_check_pigadev",
        "script": "check_dm.py",
        "args": ["--wake", "--user", "ぴ"],
        "interval_sec": 2 * 3600,  # 2時間（天谷さんDM検出漏れ対応 2026-03-27）
        "timeout": 300,
        "stagger": 330,  # dm_checkと5分ずらす（ブラウザ競合回避）
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
        "interval_sec": 60 * 60,  # 1時間（2026-03-27 Nao_u #human-steering: メインサイクル1時間化）
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
        # hour_filter廃止 (INC-007教訓: 時刻ベース判定は禁止。interval_secで6時間間隔を保証)
    },
    {
        "name": "check_usage",
        "script": "check_usage.py",
        "args": [],
        "interval_sec": 6 * 3600,  # 6時間ごと (Nao_u指示 2026-04-07)
        "timeout": 180,
        "stagger": 240,
    },
    {
        "name": "health_check",
        "script": "health_check.py",
        "args": ["--alert", "--instance", "ash"],
        "interval_sec": 5 * 60,  # 5分間隔、LLM不要の自己診断 (2026-04-02 定期実行再設計)
        "timeout": 30,
        "stagger": 20,
    },
    {
        "name": "infra_health_check",
        "script": "infra_health_check.py",
        "args": ["--log"],
        "interval_sec": 30 * 60,  # 30分ごと（LLM不使用・APIコスト0）
        "timeout": 30,
        "stagger": 90,
    },
    {
        "name": "scheduler_health",
        "script": "check_scheduler_health.py",
        "args": ["--instance", "ash", "--slack"],
        "interval_sec": 1 * 3600,  # 1時間ごと（LLM不使用・APIコスト0。Mir依頼 2026-04-02）
        "timeout": 30,
        "stagger": 150,
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


# INC-022: 多重起動時のexitでremove_pid()がPIDファイルを誤削除する問題を回避
# write_pid()でsys.exitした場合は、自分はPIDファイルを書いていないので削除してはいけない
_pid_file_owned = False


def write_pid():
    """PIDファイルを書く。既に動いているスケジューラがあれば終了。"""
    global _pid_file_owned
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
        except ValueError:
            pass  # PIDファイルが壊れている(数値以外)場合は上書き
        except SystemExit:
            raise
        except Exception as e:
            # PID読み取り以外の例外 → 安全側に倒して退く
            logging.warning(f"PID check failed ({e}). Exiting to avoid duplicate.")
            sys.exit(0)
    PID_FILE.write_text(str(os.getpid()))
    _pid_file_owned = True


def remove_pid():
    """自分が所有するPIDファイルだけを削除する。
    多重起動でwrite_pid()がsys.exitした場合、_pid_file_ownedはFalseのままなので
    別プロセスのPIDファイルを誤って削除しない (INC-022)。"""
    global _pid_file_owned
    if not _pid_file_owned:
        return
    try:
        PID_FILE.unlink(missing_ok=True)
    except Exception:
        pass


# ── 連続タイムアウト/エラー追跡 ──────────────────────────────────
# job_name -> 連続タイムアウト回数
timeout_counter = {}
# job_name -> 動的に引き上げられたタイムアウト値（Noneなら元の値を使用）
timeout_override = {}
# job_name -> 連続エラー（非タイムアウト）回数
error_counter = {}
CONSECUTIVE_ERROR_THRESHOLD = 5  # 連続エラーこの回数で間隔を一時的に延長
ERROR_BACKOFF_SEC = 30 * 60  # エラー連続時の延長間隔（30分）


ALERT_COOLDOWN_SEC = 2 * 3600  # 同じジョブのアラートは2時間に1回まで
_alert_last_sent = {}  # job_name -> timestamp of last alert


def _alert_on_cooldown(job_name):
    """同じジョブのアラートが2時間以内に送信済みならTrue"""
    import time
    last = _alert_last_sent.get(job_name, 0)
    if time.time() - last < ALERT_COOLDOWN_SEC:
        logging.info(f"[ALERT] Cooldown active for {job_name}, skipping alert")
        return True
    return False


def _mark_alert_sent(job_name):
    import time
    _alert_last_sent[job_name] = time.time()


def alert_consecutive_timeout(job_name, count, new_timeout):
    """連続タイムアウト時にSlackアラートを投稿（2時間クールダウン付き）"""
    if _alert_on_cooldown(job_name):
        return
    try:
        import slack_bot
        msg = (
            f"⚠️ [{job_name}] が{count}回連続タイムアウト。"
            f"タイムアウトを自動で{new_timeout}sに引き上げました。"
            f"スケジューラは稼働継続中です。"
        )
        slack_bot.post_message("ash", msg)
        _mark_alert_sent(job_name)
        logging.info(f"[ALERT] Sent timeout alert for {job_name}")
    except Exception as e:
        logging.warning(f"[ALERT] Failed to send timeout alert: {e}")


def alert_consecutive_errors(job_name, count):
    """連続エラー時にSlackアラートを投稿（2026-04-07 Nao_u指示: 各自チャンネルへ。2時間クールダウン付き）"""
    if _alert_on_cooldown(job_name):
        return
    try:
        import slack_bot
        msg = (
            f"⚠️ [{job_name}] が{count}回連続エラー（非タイムアウト）。"
            f"次回実行を{ERROR_BACKOFF_SEC // 60}分延長しました。"
            f"スケジューラは稼働継続中です。"
        )
        slack_bot.post_message("ash", msg)
        _mark_alert_sent(job_name)
        logging.info(f"[ALERT] Sent error alert for {job_name}")
    except Exception as e:
        logging.warning(f"[ALERT] Failed to send error alert: {e}")


# 設定変更検出用: 前回読み込んだ設定のスナップショット
_last_config = {}


def load_config_overrides():
    """外部JSONから間隔・タイムアウトの上書き値を読み込む（再起動不要・即反映）。
    ファイルが存在しない場合は空dictを返す。
    形式: {"auto_diary": {"interval_sec": 5400, "timeout": 600}, ...}

    【重要】このファイルの変更は次のループ（最大10秒）で自動反映される。
    スケジューラの再起動は不要。
    """
    global _last_config
    if not CONFIG_FILE.exists():
        if _last_config:
            logging.info("[CONFIG] Config file removed -> reverting to defaults (no restart needed)")
            _last_config = {}
        return {}
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            config = json.load(f)
        # 設定変更を検出してログに出力
        # _commentキーは比較から除外
        def strip_comments(d):
            return {k: v for k, v in d.items() if not k.startswith("_")}
        current = strip_comments(config)
        previous = strip_comments(_last_config)
        if current != previous and _last_config:
            for key in set(list(current.keys()) + list(previous.keys())):
                old_val = previous.get(key)
                new_val = current.get(key)
                if old_val != new_val:
                    logging.info(f"[CONFIG] {key}: {old_val} -> {new_val} (auto-applied, no restart needed)")
        _last_config = config
        return config
    except Exception as e:
        logging.warning(f"Config file read error: {e}")
        return _last_config if _last_config else {}


def get_job_timeout(job):
    """ジョブの実効タイムアウト値を返す（外部設定 > 動的引き上げ > デフォルト）。
    JSON設定ファイルの値が最優先。明示的にファイルで指定された値は動的引き上げより強い。
    """
    name = job["name"]
    # 外部設定ファイルが最優先（人間/LLMが意図的に設定した値）
    overrides = load_config_overrides()
    if name in overrides and "timeout" in overrides[name]:
        return overrides[name]["timeout"]
    # 動的引き上げ（連続タイムアウト時の自動拡大）
    if name in timeout_override:
        return timeout_override[name]
    return job["timeout"]


def get_job_interval(job):
    """ジョブの実効間隔を返す（外部設定 > デフォルト）。再起動不要で即反映。"""
    name = job["name"]
    overrides = load_config_overrides()
    if name in overrides and "interval_sec" in overrides[name]:
        return overrides[name]["interval_sec"]
    return job["interval_sec"]


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
    effective_timeout = get_job_timeout(job)

    try:
        logging.info(f"[{name}] Starting")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=effective_timeout,
            cwd=str(REPO_DIR),
            encoding="utf-8",
            errors="replace",
        )
        stdout = result.stdout.strip()
        # slack_check exit=1 は「新着なし」の正常状態。ログを抑制して洪水防止
        quiet = (name == "slack_check" and result.returncode == 1)
        if stdout and not quiet:
            # ログが長すぎる場合は切り詰め
            for line in stdout.split("\n")[:5]:
                logging.info(f"[{name}] {line[:200]}")
        if result.returncode != 0 and not quiet:
            stderr = result.stderr.strip()
            if stderr:
                logging.warning(f"[{name}] ERR: {stderr[:300]}")
        if not quiet:
            logging.info(f"[{name}] Done (exit={result.returncode})")
        # 成功時は連続カウンタをリセット
        timeout_counter[name] = 0
        if result.returncode == 0:
            error_counter[name] = 0
        elif name == "slack_check" and result.returncode == 1:
            # slack_check: exit=1は「新着メッセージなし」の正常状態。エラー扱いしない (#064修正の横展開)
            error_counter[name] = 0
        else:
            # 非ゼロ終了コード: 連続エラー追跡
            error_counter[name] = error_counter.get(name, 0) + 1
            ecount = error_counter[name]
            if ecount >= CONSECUTIVE_ERROR_THRESHOLD:
                logging.warning(
                    f"[{name}] {ecount} consecutive non-zero exits! "
                    f"Backing off {ERROR_BACKOFF_SEC // 60}min"
                )
                alert_consecutive_errors(name, ecount)
                error_counter[name] = 0  # INC-005: 通知後リセットで洪水防止
        return result.returncode
    except subprocess.TimeoutExpired:
        logging.warning(f"[{name}] Timeout ({effective_timeout}s)")
        # 連続タイムアウト追跡
        timeout_counter[name] = timeout_counter.get(name, 0) + 1
        count = timeout_counter[name]
        if count >= CONSECUTIVE_TIMEOUT_THRESHOLD:
            new_timeout = min(
                int(effective_timeout * TIMEOUT_ESCALATION_FACTOR),
                3600,  # 上限1時間: 無制限エスカレーション防止
            )
            timeout_override[name] = new_timeout
            logging.warning(
                f"[{name}] {count} consecutive timeouts! "
                f"Auto-escalating timeout: {effective_timeout}s -> {new_timeout}s"
            )
            alert_consecutive_timeout(name, count, new_timeout)
            timeout_counter[name] = 0  # 通知後リセットで洪水防止
        return -1
    except Exception as e:
        logging.error(f"[{name}] Error: {e}")
        # 連続エラー追跡
        error_counter[name] = error_counter.get(name, 0) + 1
        ecount = error_counter[name]
        if ecount >= CONSECUTIVE_ERROR_THRESHOLD:
            logging.warning(f"[{name}] {ecount} consecutive exceptions! Backing off {ERROR_BACKOFF_SEC // 60}min")
            alert_consecutive_errors(name, ecount)
            error_counter[name] = 0  # INC-005: 通知後リセットで洪水防止
        return -1


def main():
    # マシンガード: AshスケジューラはWin2(C:\AI)でのみ実行可能
    # 2026-04-10: LogマシンでAshスケジューラが起動→#ashに誤投稿の再発防止
    repo_lower = str(REPO_DIR).replace("\\", "/").lower()
    if "/d/" in repo_lower or repo_lower.startswith("d:"):
        print(
            "ERROR: scheduler_ash.py はWin2(C:\AI)専用。"
            f"このマシン({REPO_DIR})では起動不可。",
            file=sys.stderr,
        )
        sys.exit(1)

    setup_logging()
    write_pid()

    logging.info("=" * 50)
    logging.info("Ash scheduler started (PID %d)", os.getpid())
    logging.info("Max runtime: %d hours", MAX_RUNTIME_SEC // 3600)
    logging.info(f"Code hash: {_startup_code_hash}")
    logging.info("Config: %s (hot-reload enabled, changes auto-applied without restart)", CONFIG_FILE.name)
    logging.info("Jobs: %s", ", ".join(j["name"] for j in JOBS))
    logging.info("=" * 50)
    # 起動時に設定を読み込んでスナップショットを初期化
    load_config_overrides()

    start_time = time.time()
    now = time.time()

    # 各ジョブの次回実行時刻を初期化（staggerで分散）
    next_run = {}
    for job in JOBS:
        next_run[job["name"]] = now + job["stagger"]

    try:
        while True:
            # MAX_RUNTIME_SEC > 0 の場合のみ自発終了（0=無制限）
            if MAX_RUNTIME_SEC > 0:
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
                    # 次回実行時刻を設定（実行完了時刻基準、外部設定があればそちらを優先）
                    interval = get_job_interval(job)
                    # 連続エラー時はバックオフで間隔を延長
                    ecount = error_counter.get(name, 0)
                    if ecount >= CONSECUTIVE_ERROR_THRESHOLD:
                        interval = max(interval, ERROR_BACKOFF_SEC)
                    next_run[name] = time.time() + interval

                    # Slack即時応答: slack_checkが新着検出(rc=0)ならinbox_checkを即時トリガー
                    # (2026-03-26 Nao_uの指示: Slack 1分監視→inbox処理のラグをなくす)
                    if name == "slack_check" and rc == 0:
                        logging.info("[slack_check] New messages detected -> triggering inbox_check immediately")
                        next_run["inbox_check"] = 0  # 次のループで即実行

            # 10秒ごとにチェック（CPU負荷ほぼゼロ）
            time.sleep(10)

            # --- コード変更自動検出 (INC-018再発防止) ---
            # 60秒ごとに自身のファイルハッシュを確認。変更されていたら終了→watchdogが新コードで再起動
            if (time.time() - start_time) % _CODE_CHECK_INTERVAL < 15:
                current_hash = _compute_code_hash()
                if current_hash != _startup_code_hash:
                    logging.info(f"[auto-reload] Code change detected (hash {_startup_code_hash[:8]}→{current_hash[:8]}). Exiting for restart by watchdog.")
                    break

    except KeyboardInterrupt:
        logging.info("Interrupted by user")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
    finally:
        remove_pid()
        logging.info("Scheduler stopped")


if __name__ == "__main__":
    main()
