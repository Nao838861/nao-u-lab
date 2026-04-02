"""
infra_health_check.py — 定期実行システムの統合ヘルスチェック

LLM不要・APIコスト0で動作する自己診断スクリプト。
スケジューラから定期実行し、問題検知時はSlackに自動アラート。

検知対象:
1. スケジューラの生存確認（PIDファイル + ログ鮮度）
2. git同期の遅延（未コミット変更、リモートとの乖離）
3. Twitterアクセスの連続失敗
4. ジョブ実行の長期欠落（ログから最終実行時刻を解析）
5. ロックファイルの滞留（stale lock検知）
6. 設定ファイルの整合性
7. 日記重複防止キャッシュの膨張

使い方:
  python infra_health_check.py              # 全チェック実行
  python infra_health_check.py --verbose    # 詳細表示
  python infra_health_check.py --no-alert   # Slackアラートなし（デバッグ用）
  python infra_health_check.py --log        # 結果をログファイルに記録

設計書: docs/scheduler_architecture.md
障害ログ: docs/incident_log.md
"""

import json
import os
import re
import sys
import time
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

REPO_DIR = Path(__file__).parent
STATE_FILE = REPO_DIR / ".infra_health_state.json"
LOG_FILE = REPO_DIR / "log" / "infra_health_check.log"


def detect_instance():
    """マシンに応じたインスタンス名を返す"""
    if sys.platform == "darwin":
        return "Mir"
    if (REPO_DIR / ".scheduler_ash.pid").exists():
        return "Ash"
    if (REPO_DIR / ".scheduler_log.lock").exists():
        return "Log"
    import socket
    hostname = socket.gethostname().lower()
    if "win2" in hostname or "ash" in hostname:
        return "Ash"
    return "Log"


INSTANCE = detect_instance()


def _load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"last_alert_ts": 0, "alerts_sent": []}


def _save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


def _alert(message, state, no_alert=False):
    """#all-nao-u-labにアラートを送る。同じアラートは2時間に1回まで。"""
    now = time.time()
    alert_key = message[:50]
    recent = [a for a in state.get("alerts_sent", [])
              if a.get("key") == alert_key and now - a.get("ts", 0) < 7200]
    if recent:
        return False

    if no_alert:
        print(f"  [WOULD ALERT] {message}")
        return False

    try:
        from slack_bot import post_message
        result = post_message("all-nao-u-lab",
                              f"[{INSTANCE} health_check] {message}")
        if result and result.get("ok"):
            state.setdefault("alerts_sent", []).append({"key": alert_key, "ts": now})
            state["alerts_sent"] = [
                a for a in state["alerts_sent"] if now - a.get("ts", 0) < 86400
            ]
            _save_state(state)
            return True
    except Exception as e:
        print(f"  [alert failed] {e}")
    return False


def check_scheduler_alive():
    """スケジューラプロセスの生存確認"""
    issues = []
    checks = [
        (".scheduler_ash.pid", "Ash"),
        (".scheduler_log.lock", "Log"),
    ]
    for pid_file_name, instance_name in checks:
        pid_file = REPO_DIR / pid_file_name
        if not pid_file.exists():
            continue
        try:
            pid = int(pid_file.read_text().strip())
            if sys.platform == "win32":
                result = subprocess.run(
                    ["tasklist", "/FI", f"PID eq {pid}", "/NH"],
                    capture_output=True, timeout=10
                )
                result_text = result.stdout.decode("cp932", errors="replace")
                if str(pid) not in result_text:
                    issues.append(
                        f"{instance_name}スケジューラ(PID {pid})が停止中。"
                        f"watchdogが復帰するはずだが確認が必要"
                    )
            else:
                try:
                    os.kill(pid, 0)
                except OSError:
                    issues.append(f"{instance_name}スケジューラ(PID {pid})が停止中")
        except (ValueError, Exception):
            issues.append(f"{instance_name}のPIDファイル({pid_file_name})が破損")
    return issues


def check_scheduler_log_freshness():
    """スケジューラログの鮮度チェック"""
    issues = []
    log_files = {
        "Ash": REPO_DIR / "log" / "scheduler_ash.log",
        "Log": REPO_DIR / "log" / "scheduler_log.log",
    }
    for instance_name, log_path in log_files.items():
        if not log_path.exists():
            continue
        mtime = log_path.stat().st_mtime
        age_minutes = (time.time() - mtime) / 60
        if age_minutes > 10:
            issues.append(
                f"{instance_name}のスケジューラログが{age_minutes:.0f}分間更新なし"
                f"（通常は1分ごとにslack_check実行）"
            )
    return issues


def check_job_last_run():
    """各ジョブの最終実行時刻をログから解析。長期間実行されていないジョブを検出"""
    issues = []
    expected_intervals = {
        "slack_check": 10,
        "inbox_check": 180,
        "git_sync": 120,
        "git_pull": 120,
        "auto_cycle": 240,
        "auto_diary": 240,
    }
    log_files = [
        REPO_DIR / "log" / "scheduler_ash.log",
        REPO_DIR / "log" / "scheduler_log.log",
    ]
    for log_path in log_files:
        if not log_path.exists():
            continue
        try:
            with open(log_path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
            recent_lines = lines[-1000:] if len(lines) > 1000 else lines
            for job_name, max_minutes in expected_intervals.items():
                last_seen = None
                for line in reversed(recent_lines):
                    if job_name in line:
                        m = re.match(r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]', line)
                        if m:
                            try:
                                last_seen = datetime.strptime(m.group(1), "%Y-%m-%d %H:%M:%S")
                            except ValueError:
                                pass
                            break
                if last_seen:
                    elapsed = (datetime.now() - last_seen).total_seconds() / 60
                    if elapsed > max_minutes:
                        log_name = log_path.stem
                        issues.append(
                            f"[{log_name}] {job_name}が{elapsed:.0f}分間実行されていない"
                            f"（期待: {max_minutes}分以内）"
                        )
        except Exception:
            pass
    return issues


def check_git_sync():
    """git同期の状態を確認"""
    issues = []
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR)
        )
        modified = [l for l in result.stdout.strip().split('\n')
                    if l.strip() and not l.strip().startswith('??')]
        if len(modified) > 15:
            issues.append(
                f"未コミットの変更が{len(modified)}件。git syncが停止している可能性"
            )
    except Exception:
        pass

    git_dir = REPO_DIR / ".git"
    for marker in ["rebase-apply", "rebase-merge", "MERGE_HEAD"]:
        if (git_dir / marker).exists():
            issues.append(f"git {marker} が残存。手動解決が必要")
    return issues


def check_stale_locks():
    """滞留しているロックファイルの検出"""
    issues = []
    lock_files = [
        (REPO_DIR / ".scheduler_ash.pid", 60),
        (REPO_DIR / ".scheduler_log.lock", 60),
        (REPO_DIR / ".browser.lock", 30),
    ]
    if sys.platform == "darwin":
        lock_files.extend([
            (Path("/tmp/nao-u-lab-cycle.lock"), 60),
            (Path("/tmp/nao-u-lab-claude.lock"), 30),
        ])
    for lock_path, max_age_minutes in lock_files:
        if not lock_path.exists():
            continue
        try:
            mtime = lock_path.stat().st_mtime
            age_minutes = (time.time() - mtime) / 60
            if age_minutes > max_age_minutes * 3:
                issues.append(
                    f"ロックファイル {lock_path.name} が{age_minutes:.0f}分間残存"
                    f"（プロセスが死んでロックが残っている可能性）"
                )
        except Exception:
            pass
    return issues


def check_twitter_access():
    """Twitterエラートラッカーの状態確認"""
    issues = []
    error_state_file = REPO_DIR / ".twitter_access_error_state.json"
    if not error_state_file.exists():
        return issues
    try:
        state = json.loads(error_state_file.read_text(encoding="utf-8"))
        for script_name, info in state.items():
            consecutive = info.get("consecutive_failures", 0)
            if consecutive >= 3:
                last_fail = info.get("last_failure_time", "unknown")
                issues.append(
                    f"Twitter障害: {script_name}が{consecutive}回連続失敗中"
                    f"(最終失敗: {last_fail})"
                )
    except Exception as e:
        issues.append(f"Twitterエラー状態の読み取り失敗: {e}")
    return issues


def check_config_consistency():
    """設定ファイルの整合性チェック"""
    issues = []
    config_files = [
        REPO_DIR / "scheduler_ash_config.json",
        REPO_DIR / "scheduler_log_config.json",
    ]
    for config_path in config_files:
        if not config_path.exists():
            continue
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
            for job_name, settings in config.items():
                if job_name.startswith("_"):
                    continue
                if isinstance(settings, dict):
                    interval = settings.get("interval_sec")
                    timeout = settings.get("timeout")
                    min_interval = settings.get("min_interval_sec")
                    if interval and timeout and timeout > interval:
                        issues.append(
                            f"[{config_path.name}] {job_name}: "
                            f"timeout({timeout}s) > interval({interval}s)"
                        )
                    if interval and min_interval and min_interval > interval:
                        issues.append(
                            f"[{config_path.name}] {job_name}: "
                            f"min_interval({min_interval}s) > interval({interval}s)"
                        )
        except json.JSONDecodeError as e:
            issues.append(f"[{config_path.name}] JSON構文エラー: {e}")
        except Exception:
            pass
    return issues


def check_dedup_cache():
    """日記重複防止キャッシュの膨張チェック"""
    issues = []
    cache_file = REPO_DIR / ".diary_dedup_cache.json"
    if cache_file.exists():
        try:
            cache = json.loads(cache_file.read_text(encoding="utf-8"))
            if len(cache) > 100:
                issues.append(f"重複防止キャッシュが{len(cache)}件に膨張。クリーンアップ必要")
        except Exception:
            pass
    return issues


def check_watchdog_path():
    """watchdogバッチファイルのパスが正しいか確認（Windows限定）"""
    issues = []
    if sys.platform != "win32":
        return issues
    for bat_name in ["watchdog_log.bat", "watchdog_win2.bat"]:
        bat_path = REPO_DIR / bat_name
        if not bat_path.exists():
            continue
        try:
            content = bat_path.read_text(encoding="utf-8", errors="replace")
            for line in content.split("\n"):
                m = re.match(r'cd\s+/d\s+"?([^"\n]+)"?', line.strip(), re.IGNORECASE)
                if m:
                    target_dir = m.group(1).strip()
                    repo_str = str(REPO_DIR).replace("/", "\\")
                    if target_dir.replace("/", "\\").rstrip("\\") != repo_str.rstrip("\\"):
                        issues.append(
                            f"[{bat_name}] 作業ディレクトリが不一致: "
                            f"'{target_dir}' (期待: '{repo_str}')"
                        )
        except Exception:
            pass
    return issues


def run_all_checks(verbose=False, no_alert=False, log_to_file=False):
    """全チェックを実行し、問題があればアラートを送る"""
    state = _load_state()
    all_issues = []
    check_results = {}

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[infra_health] {INSTANCE} health check at {now_str}")

    checks = [
        ("scheduler_alive", check_scheduler_alive),
        ("scheduler_log_freshness", check_scheduler_log_freshness),
        ("job_last_run", check_job_last_run),
        ("git_sync", check_git_sync),
        ("stale_locks", check_stale_locks),
        ("twitter_access", check_twitter_access),
        ("config_consistency", check_config_consistency),
        ("dedup_cache", check_dedup_cache),
        ("watchdog_path", check_watchdog_path),
    ]

    for check_name, check_fn in checks:
        try:
            issues = check_fn()
            check_results[check_name] = "FAIL" if issues else "OK"
            all_issues.extend(issues)
            if verbose:
                status = "FAIL" if issues else "OK"
                print(f"  [{status}] {check_name}: {len(issues)} issues")
                for issue in issues:
                    print(f"       {issue}")
        except Exception as e:
            check_results[check_name] = "ERROR"
            if verbose:
                print(f"  [ERROR] {check_name}: {e}")

    if all_issues:
        summary = "\n".join(f"- {issue}" for issue in all_issues)
        message = f"自己診断で{len(all_issues)}件の問題を検知:\n{summary}"
        _alert(message, state, no_alert=no_alert)
        print(f"[infra_health] {len(all_issues)} issues found")
    else:
        print("[infra_health] All checks passed")
        state["last_clean_check"] = time.time()
        _save_state(state)

    if log_to_file:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{now_str}] instance={INSTANCE} checks={json.dumps(check_results)} issues={len(all_issues)}\n")
            for issue in all_issues:
                f.write(f"  ISSUE: {issue}\n")

    return all_issues


if __name__ == "__main__":
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    no_alert = "--no-alert" in sys.argv
    log_to_file = "--log" in sys.argv

    issues = run_all_checks(verbose=verbose, no_alert=no_alert, log_to_file=log_to_file)
    if issues:
        for i in issues:
            print(f"  ISSUE: {i}")
        sys.exit(1)
    else:
        print("  All OK")
        sys.exit(0)
