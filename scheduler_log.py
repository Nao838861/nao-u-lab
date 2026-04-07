"""
scheduler_log.py — Log(Win) integrated scheduler

Single process managing all periodic checks.
No Windows Task Scheduler registration needed.
Launched from claude_log.bat, stops when Claude Code exits.

Jobs:
  - slack_check: check_slack.py (every 1 min)
  - inbox_check: check_inbox.py --box win (every 5 min, or immediately after slack_check finds new msgs)
  - git_sync: git pull + add + commit + push (every 30 min)
  - recommended_check: read_twitter_recommended.py (elapsed-time based, 6h interval)
  - slack_export: export_slack_log.py (elapsed-time based, 24h interval)
  - auto_cycle: claude --print for diary + 8-phase cycle (every 90min, 2026-03-26 Nao_u指示: 1.5時間化)

Dynamic config override (2026-03-27):
  - scheduler_log_config.json で間隔・タイムアウトを動的に上書き可能（再起動不要）
  - 形式: {"auto_cycle": {"interval_sec": 3600}, "inbox_check": {"timeout": 600}}
  - scheduler_ash.pyと同等の仕組み。周期変更はJSONファイル編集だけで完了

Stability features (2026-03-26, Ashのscheduler_ash.pyを参考に実装):
  - エラー分類: タイムアウト vs 非タイムアウト
  - 連続タイムアウト追跡: 3回連続でタイムアウト値を1.5倍に自動拡大
  - 連続エラー追跡: 5回連続で30分バックオフ
  - Slackアラート: 閾値超過時に通知

Usage:
  python scheduler_log.py          # normal start
  python scheduler_log.py --stop   # stop running instance

Auto-terminates after 24 hours.
"""

import os
import sys
import time
import json
import hashlib
import signal
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

from claude_runner import build_claude_cmd

# Windows: 全子プロセスのウィンドウを非表示にする（2026-03-31: Nao_uの指摘で追加）
# subprocess.runのデフォルトcreationflagsをCREATE_NO_WINDOWに設定
if sys.platform == "win32":
    _original_subprocess_run = subprocess.run
    def _silent_subprocess_run(*args, **kwargs):
        if "creationflags" not in kwargs:
            kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        return _original_subprocess_run(*args, **kwargs)
    subprocess.run = _silent_subprocess_run

    _original_subprocess_popen = subprocess.Popen
    def _silent_subprocess_popen(*args, **kwargs):
        if "creationflags" not in kwargs:
            kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        return _original_subprocess_popen(*args, **kwargs)
    subprocess.Popen = _silent_subprocess_popen

REPO_DIR = Path(__file__).parent
sys.path.insert(0, str(REPO_DIR))

# Windows cp932エンコードエラー防止: 全子プロセス(claude --print含む)にUTF-8を強制
# これがないとClaude CLI内でPythonを呼んだ際にcp932でクラッシュ→リトライ→二重投稿になる
os.environ["PYTHONUTF8"] = "1"
os.environ["PYTHONIOENCODING"] = "utf-8"

# 子プロセス起動用Pythonコマンド: -X utf8で確実にUTF-8モード強制
# 環境変数(PYTHONUTF8)だけではWindows pipesで伝わらないケースがあるため
PY = [sys.executable, "-X", "utf8"]

# 自プロセスのstdout/stderrもUTF-8に変更
# (os.environはCHILDプロセスには効くが、既に起動済みの自プロセスには効かない)
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass  # Python 3.6以前はreconfigure未対応

SLACK_CHANNEL_LOG = "log"  # #log（エラーログは各自チャンネルへ。2026-04-07 Nao_u指示）
_auth_alert_sent = False
PID_FILE = REPO_DIR / ".scheduler_log.lock"
LOG_FILE = REPO_DIR / "log" / "scheduler_log.log"
CONFIG_FILE = REPO_DIR / "scheduler_log_config.json"
MAX_RUNTIME_SEC = 0  # 0=無制限（2026-03-31: Ashのノウハウ共有を受け修正。24h制限で自動停止→Nao_uが手動復旧していた）

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

# --- Stability: エラー追跡の閾値 (2026-03-26, Ash参考) ---
TIMEOUT_ESCALATION_THRESHOLD = 3   # 連続タイムアウトN回でタイムアウト値を拡大
TIMEOUT_ESCALATION_FACTOR = 1.5    # タイムアウト拡大倍率
ERROR_BACKOFF_THRESHOLD = 5        # 連続エラーN回でバックオフ
ERROR_BACKOFF_SEC = 30 * 60        # バックオフ時間（30分）

# Job definitions: (name, command, interval_seconds, timeout_seconds)
# ⚠ 周期・タイムアウトの変更は scheduler_log_config.json 経由で行うこと
# ⚠ このJOBS定義を直接編集しても再起動するまで反映されない
# ⚠ 変更コマンド: python update_scheduler.py log <job> interval <秒>
# タプル形式: (name, command, default_interval_sec, default_timeout_sec)
JOBS = [
    ("slack_check", [*PY, str(REPO_DIR / "check_slack.py")], 60, 120),
    ("inbox_check", [*PY, str(REPO_DIR / "check_inbox.py"), "--box", "win"], 300, 300),  # 5min (2026-03-25: 2min→5minに拡大。週間制限節約)
    ("git_sync", None, 1800, 60),  # special handling
    ("recommended_check", None, 3600, 300),  # special handling: elapsed-time based (6h)
    ("slack_export", None, 28800, 120),  # special handling: elapsed-time based (24h)
    ("auto_cycle", None, 5400, 1800),  # 90min interval (2026-03-26 Nao_u指示: 1.5時間化。usage余裕あり)
("health_check", [*PY, str(REPO_DIR / "health_check.py"), "--alert", "--instance", "log"], 300, 30),  # 5min, LLM不要の自己診断 (2026-04-02)
    # scheduler_healthは無効化 (2026-04-05): check_scheduler_health.pyがWindowsでos.kill→SystemError→
    # スケジューラ本体ごとクラッシュする問題が解決できず。health_check.pyで代替。
    # ("scheduler_health", [*PY, str(REPO_DIR / "check_scheduler_health.py"), "--instance", "log"], 1800, 30),
]


def log(msg):
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    try:
        print(line, flush=True)
    except (UnicodeEncodeError, OSError):
        # cp932環境でUnicode文字がある場合のフォールバック
        print(line.encode("utf-8", errors="replace").decode("ascii", errors="replace"), flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def write_pid():
    PID_FILE.write_text(str(os.getpid()))


def read_pid():
    if PID_FILE.exists():
        try:
            return int(PID_FILE.read_text().strip())
        except (ValueError, OSError):
            pass
    return None


def cleanup_pid():
    try:
        PID_FILE.unlink(missing_ok=True)
    except Exception:
        pass


def stop_existing():
    """Stop any running scheduler instance."""
    pid = read_pid()
    if pid is None:
        print("No running scheduler found.")
        return

    try:
        os.kill(pid, signal.SIGTERM)
        print(f"Sent stop signal to PID {pid}")
        # Wait a moment for it to exit
        for _ in range(10):
            try:
                os.kill(pid, 0)  # check if still alive
                time.sleep(0.5)
            except OSError:
                break
        cleanup_pid()
        print("Scheduler stopped.")
    except OSError:
        print(f"PID {pid} not running. Cleaning up lock file.")
        cleanup_pid()


def notify_auth_failure(operation, stderr):
    """Notify Nao_u via Slack when GitHub auth fails (once per session)."""
    global _auth_alert_sent
    if _auth_alert_sent:
        return
    try:
        from slack_bot import post_message
        post_message(
            SLACK_CHANNEL_LOG,
            f"[Log] GitHub authentication expired. git {operation} failed.\n"
            f"Please sign in on the Win PC to restore access.\n"
            f"```{stderr[:200]}```"
        )
        _auth_alert_sent = True
        log("[git_sync] Slack alert sent for auth failure")
    except Exception as e:
        log(f"[git_sync] Failed to send Slack alert: {e}")


def is_auth_error(stderr):
    """Check if git stderr indicates an authentication failure."""
    indicators = ["authentication", "could not read Username",
                  "fatal: unable to access", "403", "401",
                  "credential", "logon failed"]
    lower = stderr.lower()
    return any(ind.lower() in lower for ind in indicators)


def alert_slack(msg):
    """スケジューラ安定性の問題を#logに通知（2026-04-07 Nao_u指示: 各自チャンネルへ）"""
    try:
        from slack_bot import post_message
        post_message(SLACK_CHANNEL_LOG, f"[Log scheduler] {msg}")
        log(f"[alert] Slack notification sent to #log: {msg[:100]}")
    except Exception as e:
        log(f"[alert] Failed to send Slack notification: {e}")


# --- 外部JSON設定オーバーライド (scheduler_ash.pyと同等の仕組み) ---
# 【再起動不要】scheduler_log_config.json を編集するだけで周期変更可能。10秒以内に自動反映。
# 形式: {"auto_cycle": {"interval_sec": 3600}, "inbox_check": {"interval_sec": 600, "timeout": 600}}

_last_config_log = {}


def load_config_overrides():
    """外部JSONから間隔・タイムアウトの上書き値を読み込む（再起動不要・即反映）。"""
    global _last_config_log
    if not CONFIG_FILE.exists():
        if _last_config_log:
            log("[config] Config file removed -> reverting to defaults (no restart needed)")
            _last_config_log = {}
        return {}
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            config = json.load(f)
        # 設定変更を検出してログに出力
        def strip_comments(d):
            return {k: v for k, v in d.items() if not k.startswith("_")}
        current = strip_comments(config)
        previous = strip_comments(_last_config_log)
        if current != previous and _last_config_log:
            for key in set(list(current.keys()) + list(previous.keys())):
                old_val = previous.get(key)
                new_val = current.get(key)
                if old_val != new_val:
                    log(f"[config] {key}: {old_val} -> {new_val} (auto-applied, no restart needed)")
        _last_config_log = config
        return config
    except Exception as e:
        log(f"[config] Config file read error: {e}")
        return _last_config_log if _last_config_log else {}


def get_job_interval(name, default_interval):
    """ジョブの実効間隔を返す（外部設定 > デフォルト）。再起動不要で即反映。"""
    overrides = load_config_overrides()
    if name in overrides and "interval_sec" in overrides[name]:
        return overrides[name]["interval_sec"]
    return default_interval


def get_job_timeout(name, default_timeout):
    """ジョブの実効タイムアウト値を返す（外部設定 > デフォルト）。再起動不要で即反映。"""
    overrides = load_config_overrides()
    if name in overrides and "timeout" in overrides[name]:
        return overrides[name]["timeout"]
    return default_timeout


def git_sync():
    """Pull, add changes, commit+push if dirty."""
    try:
        result = subprocess.run(
            ["git", "pull", "origin", "master", "--rebase"],
            capture_output=True, text=True, timeout=30,
            cwd=str(REPO_DIR),
        )
        if result.returncode != 0 and is_auth_error(result.stderr):
            log(f"[git_sync] Auth error on pull: {result.stderr[:100]}")
            notify_auth_failure("pull", result.stderr)
            return
    except Exception:
        pass

    try:
        subprocess.run(
            ["git", "add", "memory/", "log/", "log/slack_archive/", "docs/", "CLAUDE.md"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR),
        )
        result = subprocess.run(
            ["git", "diff", "--cached", "--quiet"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR),
        )
        if result.returncode != 0:
            subprocess.run(
                ["git", "commit", "-m", "Auto sync from Win"],
                capture_output=True, text=True, timeout=30,
                cwd=str(REPO_DIR),
            )
            push_result = subprocess.run(
                ["git", "push", "origin", "master"],
                capture_output=True, text=True, timeout=60,
                cwd=str(REPO_DIR),
            )
            if push_result.returncode != 0 and is_auth_error(push_result.stderr):
                log(f"[git_sync] Auth error on push: {push_result.stderr[:100]}")
                notify_auth_failure("push", push_result.stderr)
                return
            log("[git_sync] Committed and pushed")
        else:
            log("[git_sync] No changes")
    except Exception as e:
        log(f"[git_sync] Error: {e}")


_RECOMMENDED_LAST_SUCCESS_FILE = REPO_DIR / ".recommended_last_success"
_RECOMMENDED_CATCHUP_SEC = 6 * 3600  # 6時間


def _recommended_last_success():
    """最後にrecommended_checkが成功した時刻を返す。記録がなければNone。"""
    try:
        ts = _RECOMMENDED_LAST_SUCCESS_FILE.read_text().strip()
        return datetime.fromisoformat(ts)
    except Exception:
        return None


def _recommended_mark_success():
    """recommended_checkの成功を記録する。"""
    _RECOMMENDED_LAST_SUCCESS_FILE.write_text(datetime.now().isoformat())


def recommended_check():
    """Run read_twitter_recommended.py every 6 hours (elapsed-time based).

    INC-007教訓: hour%N判定は禁止。経過時間ベースに統一。
    最後の成功実行から6時間以上経過したら実行する。
    """
    last = _recommended_last_success()
    if last is not None:
        elapsed = (datetime.now() - last).total_seconds()
        if elapsed < _RECOMMENDED_CATCHUP_SEC:
            log(f"[recommended_check] Skipped ({elapsed/3600:.1f}h since last success, need {_RECOMMENDED_CATCHUP_SEC/3600:.0f}h)")
            return
        reason = f"elapsed {elapsed/3600:.1f}h >= {_RECOMMENDED_CATCHUP_SEC/3600:.0f}h"
    else:
        reason = "no previous success recorded"
    log(f"[recommended_check] Running read_twitter_recommended.py ({reason})")
    try:
        result = subprocess.run(
            [*PY, str(REPO_DIR / "read_twitter_recommended.py")],
            capture_output=True, text=True, timeout=300,
            cwd=str(REPO_DIR),
            encoding="utf-8", errors="replace",
        )
        if result.returncode == 0:
            _recommended_mark_success()
            log(f"[recommended_check] Done (exit=0)")
        else:
            log(f"[recommended_check] Exit={result.returncode}: {result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        log("[recommended_check] Timeout (300s)")
    except Exception as e:
        log(f"[recommended_check] Error: {e}")


_SLACK_EXPORT_LAST_SUCCESS_FILE = REPO_DIR / ".slack_export_last_success"
_SLACK_EXPORT_INTERVAL_SEC = 24 * 3600  # 24時間


def _slack_export_should_run():
    """24時間以上経過していればTrue。INC-007教訓: 経過時間ベースに統一。"""
    if not _SLACK_EXPORT_LAST_SUCCESS_FILE.exists():
        return True, "no previous success recorded"
    try:
        ts = _SLACK_EXPORT_LAST_SUCCESS_FILE.read_text().strip()
        last = datetime.fromisoformat(ts)
        elapsed = (datetime.now() - last).total_seconds()
        if elapsed >= _SLACK_EXPORT_INTERVAL_SEC:
            return True, f"elapsed {elapsed/3600:.1f}h >= 24h"
        return False, f"{elapsed/3600:.1f}h since last success"
    except Exception:
        return True, "timestamp file unreadable"


def slack_export():
    """Run export_slack_log.py every 24 hours (elapsed-time based).

    INC-007教訓: hour%N判定は禁止。経過時間ベースに統一。
    """
    should_run, reason = _slack_export_should_run()
    if not should_run:
        log(f"[slack_export] Skipped ({reason})")
        return
    log(f"[slack_export] Running export_slack_log.py ({reason})")
    try:
        result = subprocess.run(
            [*PY, str(REPO_DIR / "export_slack_log.py")],
            capture_output=True, text=True, timeout=120,
            cwd=str(REPO_DIR),
            encoding="utf-8", errors="replace",
        )
        if result.returncode == 0:
            _SLACK_EXPORT_LAST_SUCCESS_FILE.write_text(datetime.now().isoformat())
            output = result.stdout.strip()
            log(f"[slack_export] {output}")
        else:
            log(f"[slack_export] Exit={result.returncode}: {result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        log("[slack_export] Timeout (120s)")
    except Exception as e:
        log(f"[slack_export] Error: {e}")


_auto_cycle_proc = None


def auto_cycle_async():
    """Run auto_cycle as multi-phase cycle in a non-blocking subprocess.

    2026-04-05: Nao_uの提案でマルチフェーズ分割に移行。
    multi_phase_cycle_log.pyが4フェーズを順次実行する。
    scheduler側はこのスクリプトを非同期で起動し、slack_checkを継続する。
    """
    global _auto_cycle_proc

    # If previous auto_cycle is still running, skip
    if _auto_cycle_proc is not None and _auto_cycle_proc.poll() is None:
        log("[auto_cycle] Skipped (previous cycle still running)")
        return

    # Reap previous process
    if _auto_cycle_proc is not None:
        try:
            stdout, _ = _auto_cycle_proc.communicate(timeout=1)
            exit_code = _auto_cycle_proc.returncode
            log(f"[auto_cycle] Previous cycle finished (exit={exit_code})")
            if stdout:
                log(f"[auto_cycle] Output: {stdout[:200]}")
        except Exception:
            pass
        _auto_cycle_proc = None

    # Launch multi-phase cycle script asynchronously
    # Pre-checks, staging, and 4 phases are all handled by the script
    multi_phase_script = str(REPO_DIR / "multi_phase_cycle_log.py")
    log("[auto_cycle] Starting multi-phase cycle (async)")
    try:
        _auto_cycle_proc = subprocess.Popen(
            [*PY, multi_phase_script],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=str(REPO_DIR),
            encoding="utf-8",
            errors="replace",
        )
        log(f"[auto_cycle] Launched multi_phase_cycle_log.py (PID {_auto_cycle_proc.pid})")
    except FileNotFoundError:
        log("[auto_cycle] Python or multi_phase_cycle_log.py not found")
    except Exception as e:
        log(f"[auto_cycle] Launch error: {e}")


def auto_cycle_prechecks():
    """Run the fast pre-check steps of auto_cycle (kaizen, verify, etc.)."""
    # This is extracted from the original auto_cycle() - just the pre-check parts
    pass  # Pre-checks are already embedded in the prompt; keeping this as a hook


def build_auto_cycle_prompt():
    """Build the prompt for auto_cycle, including alerts from pre-check scripts."""
    # Run pre-check scripts synchronously (they're all fast, <10s each)
    alerts = []

    for script, args, label, timeout_s in [
        ("check_kaizen_due.py", [], "検証リマインド", 10),
        ("verify_kaizen.py", [], "自動検証結果", 60),
        ("verify_kaizen.py", ["--meta"], "メタ検証", 30),
        ("verify_kaizen.py", ["--nag"], "クロスチェック督促", 30),
        ("check_kaizen_crosscheck.py", ["--who=Log"], "クロスチェック", 10),
        ("check_reservations.py", [], "行動予約", 10),
        ("memory_walk.py", ["--n", "1"], "記憶の散歩", 10),
        ("check_beliefs_health.py", ["--summary"], "信念健康", 10),
        ("check_kaizen_due.py", ["--auto-verify"], "自動検証", 60),
        ("slack_insight_digest.py", ["--compact", "--hours", "72"], "他インスタンス洞察", 15),
    ]:
        try:
            r = subprocess.run(
                [*PY, str(REPO_DIR / script)] + args,
                capture_output=True, text=True, timeout=timeout_s,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
            )
            if r.returncode == 0 and r.stdout.strip():
                out = r.stdout.strip()
                # Filter out noise
                skip_words = ["検証対象なし", "自動検証対象なし", "未レビュー項目なし", "nag不要"]
                if not any(w in out for w in skip_words):
                    alerts.append(f" [{label}] {out[:300]}")
                    log(f"[auto_cycle] {label}: {out[:100]}")
            if script == "verify_kaizen.py" and args == ["--meta"]:
                if r.stdout and "\u274c" in r.stdout:  # ❌
                    alerts.append(" [メタ検証警告] 検証システムに問題あり")
                    log("[auto_cycle] Meta-verification warning detected")
        except Exception as e:
            log(f"[auto_cycle] {label} error: {e}")

    # Slack checklist (24h elapsed-time based — INC-018修正: hour==2判定を廃止)
    _checklist_ts_file = REPO_DIR / ".kaizen_status_last_posted"
    _checklist_should_run = True
    try:
        if _checklist_ts_file.exists():
            last_posted = datetime.fromisoformat(_checklist_ts_file.read_text().strip())
            if (datetime.now() - last_posted).total_seconds() < 24 * 3600:
                _checklist_should_run = False
    except Exception:
        pass
    if _checklist_should_run:
        try:
            r = subprocess.run(
                [*PY, str(REPO_DIR / "verify_kaizen.py"), "--slack-status"],
                capture_output=True, text=True, timeout=30,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
            )
            if r.returncode == 0:
                _checklist_ts_file.write_text(datetime.now().isoformat())
                log(f"[auto_cycle] Slack checklist posted: {r.stdout.strip()[:100]}")
        except Exception as e:
            log(f"[auto_cycle] slack-status error: {e}")

    # Weekly self-review (Sunday, 7-day elapsed-time based — INC-018修正: hour==2判定を廃止)
    weekly = ""
    _weekly_ts_file = REPO_DIR / ".weekly_review_last_triggered"
    _weekly_should_run = False
    if datetime.now().weekday() == 6:  # Sunday
        try:
            if _weekly_ts_file.exists():
                last_review = datetime.fromisoformat(_weekly_ts_file.read_text().strip())
                if (datetime.now() - last_review).total_seconds() >= 6 * 24 * 3600:
                    _weekly_should_run = True
            else:
                _weekly_should_run = True
        except Exception:
            _weekly_should_run = True
    if _weekly_should_run:
        weekly = " [週次自己レビュー] 日曜日のため週次レビューを実行してください"
        _weekly_ts_file.write_text(datetime.now().isoformat())
        log("[auto_cycle] Weekly self-review trigger (Sunday)")

    prompt = (
        "Log 自律サイクル起動。CLAUDE.mdとdocs/operations.mdを参照。"
        "1) #nao-uチャンネルだけ先に確認→新情報があれば自分の反応を書く（ルール8: 他者の反応を読む前に自分の視点を持つ） "
        "2) #all-nao-u-lab・その他のSlackチャンネル確認→返信すべきものに返信 "
        "3) pending_requests.md確認 "
        "4) 8フェーズ改善サイクル実行 "
        "5) 今サイクルの作業がActiveプロジェクト(projects/INDEX.md)に関係するなら、そのプロジェクトファイルも更新する "
        "5.5) [他インスタンス洞察]が含まれていたら → 該当するプロジェクトファイルを開き、具体的な考察と次の一手を追記する。流して終わりにしない "
        "5.6) memory/external_notes_log.mdに未統合エントリがあれば1-2件を日記やbeliefs等に接続し、統合したエントリに[統合済 YYYY-MM-DD]マーカーを付ける "
        "6) #logに活動日記を書く "
        "7) git push "
        "※inbox処理はinbox_checkが専用で行う。このサイクルでは行わない。"
        "\n[Slack投稿ルール（このサイクル中の全Slack投稿に適用）] "
        "・Nao_uへの返信は同じチャンネルで返す（#nao-uだけ例外→#all-nao-u-labに書く） "
        "・外部記事への反応は1件ずつ別メッセージで投稿（まとめ返信禁止） "
        "・スレッド返信は使わない "
        "・#nao-uにはClaude投稿禁止 "
        "・各自チャンネルに長文日記+外部の新情報を交える "
        "・Slack即時応答最優先（Nao_uの時間を使わせない）"
        + "".join(alerts)
        + weekly
    )
    return prompt


def run_job(name, cmd, timeout):
    """Run a single job, return exit code."""
    if name == "git_sync":
        git_sync()
        return 0
    if name == "recommended_check":
        recommended_check()
        return 0
    if name == "slack_export":
        slack_export()
        return 0
    if name == "auto_cycle":
        auto_cycle_async()
        return 0

    try:
        result = subprocess.run(
            cmd,
            capture_output=True, text=True, timeout=timeout,
            cwd=str(REPO_DIR),
            encoding="utf-8", errors="replace",
        )
        return result.returncode
    except subprocess.TimeoutExpired:
        log(f"[{name}] Timeout ({timeout}s)")
        return -1
    except Exception as e:
        log(f"[{name}] Error: {e}")
        return -1


def main_loop():
    """Main scheduler loop."""
    start_time = datetime.now()
    write_pid()

    log("=" * 50)
    log(f"Log scheduler started (PID {os.getpid()})")
    log(f"Max runtime: {'unlimited' if MAX_RUNTIME_SEC == 0 else f'{MAX_RUNTIME_SEC}s'}")
    log(f"Code hash: {_startup_code_hash}")
    job_names = ", ".join(j[0] for j in JOBS)
    log(f"Jobs: {job_names}")
    log("=" * 50)

    # Track last run time for each job
    last_run = {name: datetime.min for name, _, _, _ in JOBS}

    # --- Stability: エラー追跡 (2026-03-26, Ash参考) ---
    timeout_counter = {name: 0 for name, _, _, _ in JOBS}   # 連続タイムアウト回数
    error_counter = {name: 0 for name, _, _, _ in JOBS}     # 連続エラー回数
    timeout_override = {}  # name -> 動的に拡大されたタイムアウト値
    backoff_until = {name: datetime.min for name, _, _, _ in JOBS}  # バックオフ解除時刻

    running = True

    def handle_signal(signum, frame):
        nonlocal running
        log(f"Received signal {signum}, shutting down...")
        running = False

    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)

    try:
        while running:
            now = datetime.now()

            # Check max runtime (0=unlimited)
            if MAX_RUNTIME_SEC > 0 and (now - start_time).total_seconds() > MAX_RUNTIME_SEC:
                log(f"Max runtime reached ({MAX_RUNTIME_SEC}s). Shutting down.")
                break

            # Check each job
            for name, cmd, default_interval, default_timeout in JOBS:
                if not running:
                    break

                # バックオフ中はスキップ
                if now < backoff_until[name]:
                    continue

                # 外部設定ファイルで上書き可能（再起動不要）
                interval = get_job_interval(name, default_interval)
                timeout = get_job_timeout(name, default_timeout)

                elapsed = (now - last_run[name]).total_seconds()
                if elapsed >= interval:
                    # 動的タイムアウトがあればそちらを使用
                    effective_timeout = timeout_override.get(name, timeout)

                    log(f"[{name}] Starting")
                    exit_code = run_job(name, cmd, effective_timeout)

                    # --- エラー分類と追跡 ---
                    if exit_code == -1:
                        # タイムアウト
                        timeout_counter[name] += 1
                        error_counter[name] += 1
                        if timeout_counter[name] >= TIMEOUT_ESCALATION_THRESHOLD:
                            new_timeout = min(
                                int(effective_timeout * TIMEOUT_ESCALATION_FACTOR),
                                3600,  # 上限1時間: 無制限エスカレーション防止
                            )
                            timeout_override[name] = new_timeout
                            msg = f"{name}: {timeout_counter[name]}回連続タイムアウト。タイムアウト値を{effective_timeout}s→{new_timeout}sに拡大"
                            log(f"[stability] {msg}")
                            alert_slack(msg)
                            timeout_counter[name] = 0  # 通知後リセットで洪水防止
                    elif exit_code != 0 and name not in ("git_sync", "recommended_check", "slack_export", "auto_cycle"):
                        # 非ゼロ終了コード（特殊ハンドリングジョブは除外）
                        # slack_check: exit=1は「新着メッセージなし」の正常状態。exit=2+のみエラー扱い
                        if name == "slack_check" and exit_code == 1:
                            timeout_counter[name] = 0
                            error_counter[name] = 0
                        else:
                            error_counter[name] += 1
                            timeout_counter[name] = 0  # タイムアウトではないのでリセット
                    else:
                        # 成功: カウンタリセット
                        if timeout_counter[name] > 0 or error_counter[name] > 0:
                            log(f"[stability] {name}: 正常復帰 (timeout={timeout_counter[name]}, errors={error_counter[name]} → リセット)")
                        timeout_counter[name] = 0
                        error_counter[name] = 0
                        # タイムアウト拡大もリセット（正常に戻ったので）
                        if name in timeout_override:
                            del timeout_override[name]

                    # 連続エラーが閾値を超えたらバックオフ
                    if error_counter[name] >= ERROR_BACKOFF_THRESHOLD:
                        backoff_until[name] = now + timedelta(seconds=ERROR_BACKOFF_SEC)
                        msg = f"{name}: {error_counter[name]}回連続エラー。{ERROR_BACKOFF_SEC // 60}分バックオフ"
                        log(f"[stability] {msg}")
                        alert_slack(msg)
                        # バックオフ通知後にカウンタをリセット（エスカレートするアラートの洪水を防止）
                        error_counter[name] = 0

                    if name != "git_sync":
                        log(f"[{name}] Done (exit={exit_code})")
                    last_run[name] = datetime.now()

                    # --- Slack即時応答: slack_checkが新着を検出したらinbox_checkを即時実行 ---
                    if name == "slack_check" and exit_code == 0:
                        log("[slack_check] New messages detected → triggering immediate inbox_check")
                        last_run["inbox_check"] = datetime.min  # 次のループで即実行

            # Sleep 10 seconds between checks
            for _ in range(10):
                if not running:
                    break
                time.sleep(1)

            # --- コード変更自動検出 (INC-018再発防止) ---
            # 60秒ごとに自身のファイルハッシュを確認。変更されていたら終了→watchdogが新コードで再起動
            if (datetime.now() - start_time).total_seconds() % _CODE_CHECK_INTERVAL < 15:
                current_hash = _compute_code_hash()
                if current_hash != _startup_code_hash:
                    log(f"[auto-reload] Code change detected (hash {_startup_code_hash[:8]}→{current_hash[:8]}). Exiting for restart by watchdog.")
                    running = False

    finally:
        log("Log scheduler stopped.")
        cleanup_pid()


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--stop":
        stop_existing()
        return

    # Check if already running
    existing_pid = read_pid()
    if existing_pid is not None:
        try:
            os.kill(existing_pid, 0)
            log(f"Scheduler already running (PID {existing_pid}). Stopping it first.")
            stop_existing()
        except OSError:
            cleanup_pid()

    main_loop()


if __name__ == "__main__":
    main()
