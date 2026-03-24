"""
scheduler_log.py — Log(Win) integrated scheduler

Single process managing all periodic checks.
No Windows Task Scheduler registration needed.
Launched from claude_log.bat, stops when Claude Code exits.

Jobs:
  - slack_check: check_slack.py (every 1 min)
  - inbox_check: check_inbox.py --box win (every 2 min)
  - git_sync: git pull + add + commit + push (every 30 min)
  - recommended_check: read_twitter_recommended.py (every 1h, runs at hour%6==2)
  - slack_export: export_slack_log.py (every 8h, Log's slot: hour%24==2)
  - auto_cycle: claude --print for diary + 8-phase cycle (every 1h, 2026-03-24 Nao_u指示)

Usage:
  python scheduler_log.py          # normal start
  python scheduler_log.py --stop   # stop running instance

Auto-terminates after 24 hours.
"""

import os
import sys
import time
import signal
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

REPO_DIR = Path(__file__).parent
sys.path.insert(0, str(REPO_DIR))

# Windows cp932エンコードエラー防止: 全子プロセス(claude --print含む)にUTF-8を強制
# これがないとClaude CLI内でPythonを呼んだ際にcp932でクラッシュ→リトライ→二重投稿になる
os.environ["PYTHONUTF8"] = "1"
os.environ["PYTHONIOENCODING"] = "utf-8"

SLACK_CHANNEL_ALL = "C0ALWBRNJ66"  # #all-nao-u-lab
_auth_alert_sent = False
PID_FILE = REPO_DIR / ".scheduler_log.lock"
LOG_FILE = REPO_DIR / "log" / "scheduler_log.log"
MAX_RUNTIME = timedelta(hours=24)

# Job definitions: (name, command, interval_seconds, timeout_seconds)
JOBS = [
    ("slack_check", [sys.executable, str(REPO_DIR / "check_slack.py")], 60, 120),
    ("inbox_check", [sys.executable, str(REPO_DIR / "check_inbox.py"), "--box", "win"], 120, 300),
    ("git_sync", None, 1800, 60),  # special handling
    ("recommended_check", None, 3600, 300),  # special handling: hour%6==2
    ("slack_export", None, 28800, 120),  # special handling: hour%24==2
    ("auto_cycle", None, 3600, 1800),  # 1h interval (2026-03-24 Nao_u指示: ボーナスタイム終了)
]


def log(msg):
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
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
            SLACK_CHANNEL_ALL,
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


def recommended_check():
    """Run read_twitter_recommended.py if hour%6==2 (Log's slot: 2,8,14,20)."""
    hour = datetime.now().hour
    if hour % 6 != 2:
        log(f"[recommended_check] Skipped (hour={hour}, waiting for hour%6==2)")
        return
    log("[recommended_check] Hour condition met, running read_twitter_recommended.py")
    try:
        result = subprocess.run(
            [sys.executable, str(REPO_DIR / "read_twitter_recommended.py")],
            capture_output=True, text=True, timeout=300,
            cwd=str(REPO_DIR),
            encoding="utf-8", errors="replace",
        )
        if result.returncode == 0:
            log(f"[recommended_check] Done (exit=0)")
        else:
            log(f"[recommended_check] Exit={result.returncode}: {result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        log("[recommended_check] Timeout (300s)")
    except Exception as e:
        log(f"[recommended_check] Error: {e}")


def slack_export():
    """Run export_slack_log.py once per day at Log's slot (hour==2)."""
    hour = datetime.now().hour
    if hour != 2:
        log(f"[slack_export] Skipped (hour={hour}, waiting for hour==2)")
        return
    log("[slack_export] Hour condition met, running export_slack_log.py")
    try:
        result = subprocess.run(
            [sys.executable, str(REPO_DIR / "export_slack_log.py")],
            capture_output=True, text=True, timeout=120,
            cwd=str(REPO_DIR),
            encoding="utf-8", errors="replace",
        )
        if result.returncode == 0:
            output = result.stdout.strip()
            log(f"[slack_export] {output}")
        else:
            log(f"[slack_export] Exit={result.returncode}: {result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        log("[slack_export] Timeout (120s)")
    except Exception as e:
        log(f"[slack_export] Error: {e}")


def auto_cycle():
    """Run claude --print for autonomous diary + 8-phase cycle."""
    log("[auto_cycle] Starting autonomous cycle via claude --print")

    # Step 1: Check kaizen verifications due (リマインド)
    kaizen_alert = ""
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "check_kaizen_due.py")],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            alert = r.stdout.strip()
            if "期限超過" in alert or "本日期限" in alert:
                kaizen_alert = f" [検証リマインド] {alert}"
                log(f"[auto_cycle] Kaizen alert: {alert}")
    except Exception as e:
        log(f"[auto_cycle] kaizen check error: {e}")

    # Step 1.5: Check review deadlines (48h期限チェック — Mir作成, 2026-03-24)
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "check_review_deadline.py"), "--nag"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            rd_out = r.stdout.strip()
            if "期限超過" in rd_out:
                kaizen_alert += f" [レビュー期限] {rd_out}"
                log(f"[auto_cycle] Review deadline: {rd_out[:200]}")
            else:
                log(f"[auto_cycle] Review deadline: {rd_out[:100]}")
    except Exception as e:
        log(f"[auto_cycle] review deadline check error: {e}")

    # Step 2: Auto-execute verification commands (実行)
    verify_result = ""
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "verify_kaizen.py")],
            capture_output=True, text=True, timeout=60,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            vout = r.stdout.strip()
            if "検証対象なし" not in vout:
                verify_result = f" [自動検証結果] {vout}"
                log(f"[auto_cycle] Verify result: {vout[:200]}")
    except Exception as e:
        log(f"[auto_cycle] verify_kaizen error: {e}")

    # Step 3: Run meta-verification (メタ検証 — 検証システム自体のチェック)
    meta_alert = ""
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "verify_kaizen.py"), "--meta"],
            capture_output=True, text=True, timeout=30,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            meta = r.stdout.strip()
            # Only include meta alert if system is unhealthy
            if "❌" in meta:
                meta_alert = f" [メタ検証警告] 検証システムに問題あり。verify_kaizen.py --metaで詳細確認。"
                log(f"[auto_cycle] Meta-verification warning detected")
    except Exception as e:
        log(f"[auto_cycle] meta-verify error: {e}")

    # Step 4: Nag unchecked instances (クロスチェック督促 — 毎サイクル実行、同日重複は自動スキップ)
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "verify_kaizen.py"), "--nag"],
            capture_output=True, text=True, timeout=30,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            log(f"[auto_cycle] Nag: {r.stdout.strip()[:200]}")
    except Exception as e:
        log(f"[auto_cycle] nag error: {e}")

    # Step 5: Check Log's pending crosscheck items (Mir依頼 2026-03-23)
    crosscheck_alert = ""
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "check_kaizen_crosscheck.py"), "--who=Log"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            cc_out = r.stdout.strip()
            if "未レビュー項目なし" not in cc_out:
                crosscheck_alert = f" [クロスチェック] {cc_out}"
                log(f"[auto_cycle] Crosscheck: {cc_out[:200]}")
    except Exception as e:
        log(f"[auto_cycle] crosscheck error: {e}")

    # Step 6: Post checklist to Slack (Log's shift: hour==2, 実質8時間ごと3人ローテ)
    hour = datetime.now().hour
    if hour == 2:
        try:
            r = subprocess.run(
                [sys.executable, str(REPO_DIR / "verify_kaizen.py"), "--slack-status"],
                capture_output=True, text=True, timeout=30,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
            )
            if r.returncode == 0:
                log(f"[auto_cycle] Slack checklist posted: {r.stdout.strip()[:100]}")
            else:
                log(f"[auto_cycle] Slack checklist error: {r.stderr.strip()[:100]}")
        except Exception as e:
            log(f"[auto_cycle] slack-status error: {e}")

    # Step 7: Check action reservations (行動予約チェック — Mir実装, Ash統合, 2026-03-24)
    reservation_alert = ""
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "check_reservations.py")],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            reservation_alert = f" {r.stdout.strip()}"
            log(f"[auto_cycle] Reservations: {r.stdout.strip()[:200]}")
    except Exception as e:
        log(f"[auto_cycle] reservation check error: {e}")

    # Step 8: Memory walk (記憶の散歩 — Ash実装, 2026-03-24)
    memory_walk = ""
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "memory_walk.py"), "--n", "1"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            walk_out = r.stdout.strip()[:300]
            memory_walk = f" [記憶の散歩] {walk_out}"
            log(f"[auto_cycle] Memory walk: {walk_out[:100]}")
    except Exception as e:
        log(f"[auto_cycle] memory_walk error: {e}")

    # Step 9: Beliefs health check (信念の生存確認 — Ash実装, 2026-03-24)
    beliefs_alert = ""
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "check_beliefs_health.py"), "--summary"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            bh = r.stdout.strip()
            if "要注意" in bh or "問題" in bh:
                beliefs_alert = f" [信念健康] {bh[:200]}"
                log(f"[auto_cycle] Beliefs health: {bh[:100]}")
    except Exception as e:
        log(f"[auto_cycle] beliefs health error: {e}")

    # Step 10: Auto-verify kaizen commands (検証コマンド自動実行 — 2026-03-24 Nao_u #human-steering指示)
    auto_verify_result = ""
    try:
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "check_kaizen_due.py"), "--auto-verify"],
            capture_output=True, text=True, timeout=60,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if r.returncode == 0 and r.stdout.strip():
            av_out = r.stdout.strip()
            if "自動検証対象なし" not in av_out:
                auto_verify_result = f" [自動検証] {av_out[:300]}"
                log(f"[auto_cycle] Auto-verify: {av_out[:200]}")
            else:
                log(f"[auto_cycle] Auto-verify: no targets")
    except Exception as e:
        log(f"[auto_cycle] auto-verify error: {e}")

    # Step 11: Weekly self-review (日曜のみ — 2026-03-24 Nao_u #human-steering指示)
    weekly_review = ""
    now = datetime.now()
    if now.weekday() == 6 and now.hour == 2:  # Sunday at 02:00 (Log's slot)
        weekly_review = (
            " [週次自己レビュー] 今日は日曜。#kaizen-reviewに週次自己レビューを投稿せよ。"
            "内容: 「今週、指示なしに何を変え、何が良くなったか」。"
            "具体的な証拠つき（コミット、ファイル変更、検証結果など）。"
            "来週の焦点も1-2行で書く。"
        )
        log("[auto_cycle] Weekly self-review trigger (Sunday)")

    prompt = (
        "Log 自律サイクル起動。CLAUDE.mdとdocs/operations.mdを参照。"
        "1) inbox確認→対応 "
        "2) #nao-uチャンネルだけ先に確認→新情報があれば自分の反応を書く（ルール8: 他者の反応を読む前に自分の視点を持つ） "
        "3) #all-nao-u-lab・その他のSlackチャンネル確認→返信すべきものに返信 "
        "4) pending_requests.md確認 "
        "5) 8フェーズ改善サイクル実行 "
        "6) #logに活動日記を書く "
        "7) git push"
        + kaizen_alert
        + verify_result
        + meta_alert
        + crosscheck_alert
        + reservation_alert
        + memory_walk
        + beliefs_alert
        + auto_verify_result
        + weekly_review
    )
    try:
        result = subprocess.run(
            ["claude", "--print", "-p", prompt],
            capture_output=True, text=True, timeout=1800,
            cwd=str(REPO_DIR),
            encoding="utf-8", errors="replace",
        )
        log(f"[auto_cycle] Done (exit={result.returncode})")
        if result.stdout:
            log(f"[auto_cycle] Output: {result.stdout[:200]}")
    except subprocess.TimeoutExpired:
        log("[auto_cycle] Timeout (600s)")
    except FileNotFoundError:
        log("[auto_cycle] claude CLI not found in PATH")
    except Exception as e:
        log(f"[auto_cycle] Error: {e}")


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
        auto_cycle()
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
    log(f"Max runtime: 24 hours")
    job_names = ", ".join(j[0] for j in JOBS)
    log(f"Jobs: {job_names}")
    log("=" * 50)

    # Track last run time for each job
    last_run = {name: datetime.min for name, _, _, _ in JOBS}

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

            # Check max runtime
            if now - start_time > MAX_RUNTIME:
                log("Max runtime reached (24h). Shutting down.")
                break

            # Check each job
            for name, cmd, interval, timeout in JOBS:
                if not running:
                    break
                elapsed = (now - last_run[name]).total_seconds()
                if elapsed >= interval:
                    log(f"[{name}] Starting")
                    exit_code = run_job(name, cmd, timeout)
                    if name != "git_sync":
                        log(f"[{name}] Done (exit={exit_code})")
                    last_run[name] = datetime.now()

            # Sleep 10 seconds between checks
            for _ in range(10):
                if not running:
                    break
                time.sleep(1)

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
