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

SLACK_CHANNEL_ALL = "C0ALWBRNJ66"  # #all-nao-u-lab
_auth_alert_sent = False
PID_FILE = REPO_DIR / ".scheduler_log.lock"
LOG_FILE = REPO_DIR / "log" / "scheduler_log.log"
MAX_RUNTIME = timedelta(hours=24)

# Job definitions: (name, command, interval_seconds, timeout_seconds)
JOBS = [
    ("slack_check", [sys.executable, str(REPO_DIR / "check_slack.py")], 60, 30),
    ("inbox_check", [sys.executable, str(REPO_DIR / "check_inbox.py"), "--box", "win"], 120, 300),
    ("git_sync", None, 1800, 60),  # special handling
    ("recommended_check", None, 3600, 300),  # special handling: hour%6==2
    ("slack_export", None, 28800, 120),  # special handling: hour%24==2
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
            ["git", "add", "memory/", "log/", "log/slack_archive/", "CLAUDE.md"],
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
