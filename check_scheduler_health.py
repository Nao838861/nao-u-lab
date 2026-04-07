#!/usr/bin/env python3
"""
check_scheduler_health.py — LLM不要のスケジューラ健全性チェック

定期実行システムの問題を自動検出する。LLMのAPIコストを使わない。
各インスタンスのスケジューラに組み込んで定期実行する。

Usage:
    python check_scheduler_health.py                # 自動検出（Mac/Win判定）
    python check_scheduler_health.py --instance mir  # Mac (Mir)
    python check_scheduler_health.py --instance log  # Win (Log)
    python check_scheduler_health.py --instance ash  # Win2 (Ash)
    python check_scheduler_health.py --slack          # 問題があれば各自Slackチャンネルに通知
    python check_scheduler_health.py --json           # JSON出力

チェック項目:
    1. スケジューラプロセスの生存確認（PIDファイル）
    2. 最終実行時刻の確認（期待間隔の3倍超で異常）
    3. ロックファイルの古さ確認（30分超でハング疑い）
    4. ログファイルのエラーパターン検出（直近100行）
    5. 設定ファイルのJSON構文確認
    6. gitの状態確認（未pushコミット、最終コミット時刻）

終了コード:
    0: 全チェックOK
    1: 異常あり（詳細はstdout）
    2: 引数エラー
"""

import os
import sys
import json
import time
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent

# ── チェック結果 ──
class HealthResult:
    def __init__(self):
        self.checks = []

    def ok(self, name, detail=""):
        self.checks.append({"name": name, "status": "OK", "detail": detail})

    def warn(self, name, detail):
        self.checks.append({"name": name, "status": "WARN", "detail": detail})

    def fail(self, name, detail):
        self.checks.append({"name": name, "status": "FAIL", "detail": detail})

    @property
    def has_problems(self):
        return any(c["status"] in ("WARN", "FAIL") for c in self.checks)

    @property
    def failures(self):
        return [c for c in self.checks if c["status"] == "FAIL"]

    @property
    def warnings(self):
        return [c for c in self.checks if c["status"] == "WARN"]

    def summary(self):
        fails = len(self.failures)
        warns = len(self.warnings)
        oks = len([c for c in self.checks if c["status"] == "OK"])
        return f"OK={oks} WARN={warns} FAIL={fails}"

    def to_text(self):
        lines = []
        for c in self.checks:
            icon = {"OK": "✅", "WARN": "⚠️", "FAIL": "❌"}[c["status"]]
            detail = f" — {c['detail']}" if c["detail"] else ""
            lines.append(f"{icon} {c['name']}{detail}")
        return "\n".join(lines)

    def to_json(self):
        return json.dumps({"checks": self.checks, "summary": self.summary()},
                          ensure_ascii=False, indent=2)


# ── 個別チェック ──

def check_pid_file(result, pid_file, name):
    """PIDファイルでプロセス生存を確認"""
    if not pid_file.exists():
        result.warn(f"{name} PID", f"PIDファイルなし: {pid_file}")
        return

    try:
        pid = int(pid_file.read_text().strip())
    except (ValueError, OSError):
        result.warn(f"{name} PID", f"PIDファイル読み取り不可: {pid_file}")
        return

    # プロセス生存確認
    try:
        os.kill(pid, 0)
        result.ok(f"{name} PID", f"PID={pid} 生存中")
    except ProcessLookupError:
        result.fail(f"{name} PID", f"PID={pid} は死んでいる")
    except PermissionError:
        result.ok(f"{name} PID", f"PID={pid} 生存中（権限なし）")
    except (OSError, SystemError):
        # Windows: os.kill(pid, 0) が WinError 87 (パラメーターが間違っています) を
        # SystemError として投げることがある。プロセス死亡として扱う (INC-018関連)
        result.fail(f"{name} PID", f"PID={pid} 確認失敗（OSError/SystemError）→死亡扱い")


def check_timestamp_file(result, ts_file, name, expected_interval_sec):
    """タイムスタンプファイルで最終実行時刻を確認"""
    if not ts_file.exists():
        result.warn(f"{name} 最終実行", f"タイムスタンプなし: {ts_file}")
        return

    try:
        ts = int(ts_file.read_text().strip())
    except (ValueError, OSError):
        # ファイルの更新時刻をフォールバックに使う
        try:
            ts = int(ts_file.stat().st_mtime)
        except OSError:
            result.warn(f"{name} 最終実行", f"タイムスタンプ読み取り不可: {ts_file}")
            return

    elapsed = int(time.time()) - ts
    threshold = expected_interval_sec * 3

    if elapsed > threshold:
        hours = elapsed / 3600
        expected_hours = expected_interval_sec / 3600
        result.fail(f"{name} 最終実行",
                    f"{hours:.1f}時間前（期待: {expected_hours:.1f}時間ごと）")
    else:
        minutes = elapsed / 60
        result.ok(f"{name} 最終実行", f"{minutes:.0f}分前")


def check_lock_file(result, lock_path, name, max_age_sec=1800):
    """ロックファイルの古さを確認"""
    if isinstance(lock_path, Path):
        # ディレクトリ型ロック
        if lock_path.is_dir():
            pid_file = lock_path / "pid"
            if pid_file.exists():
                age = int(time.time() - pid_file.stat().st_mtime)
                if age > max_age_sec:
                    result.warn(f"{name} ロック",
                                f"ロックが{age // 60}分間保持（>{max_age_sec // 60}分）。ハングの可能性")
                else:
                    result.ok(f"{name} ロック", f"実行中（{age // 60}分）")
            else:
                result.ok(f"{name} ロック", "ロックなし")
        elif lock_path.is_file():
            age = int(time.time() - lock_path.stat().st_mtime)
            if age > max_age_sec:
                result.warn(f"{name} ロック",
                            f"ロックが{age // 60}分間保持（>{max_age_sec // 60}分）。ハングの可能性")
            else:
                result.ok(f"{name} ロック", f"実行中（{age // 60}分）")
        else:
            result.ok(f"{name} ロック", "ロックなし")
    else:
        result.ok(f"{name} ロック", "ロックなし")


def check_log_errors(result, log_file, name, tail_lines=100):
    """ログファイルの直近N行からエラーパターンを検出"""
    if not log_file.exists():
        result.warn(f"{name} ログ", f"ログファイルなし: {log_file}")
        return

    try:
        with open(log_file, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
        recent = lines[-tail_lines:] if len(lines) > tail_lines else lines
    except OSError as e:
        result.warn(f"{name} ログ", f"ログ読み取り失敗: {e}")
        return

    error_patterns = [
        "❌", "FAIL", "Error", "error", "Traceback",
        "command not found", "Permission denied",
        "タイムアウト", "強制終了", "起動失敗",
    ]
    # 「exit=0」や「error_count」のような誤検知を避ける
    false_positive_patterns = ["error_count", "errors=0", "no error"]

    error_lines = []
    for line in recent:
        line_lower = line.lower()
        if any(fp in line_lower for fp in false_positive_patterns):
            continue
        if any(pat.lower() in line_lower for pat in error_patterns):
            error_lines.append(line.strip()[:120])

    if error_lines:
        # 直近のユニークなエラーを最大3件報告
        unique_errors = list(dict.fromkeys(error_lines))[-3:]
        result.warn(f"{name} ログ",
                    f"直近{tail_lines}行にエラー{len(error_lines)}件。例: {unique_errors[0]}")
    else:
        result.ok(f"{name} ログ", f"直近{tail_lines}行にエラーなし")


def check_json_config(result, config_file, name):
    """JSON設定ファイルの構文確認"""
    if not config_file.exists():
        result.ok(f"{name} 設定", "設定ファイルなし（デフォルト使用）")
        return

    try:
        with open(config_file, "r", encoding="utf-8") as f:
            json.load(f)
        result.ok(f"{name} 設定", "JSON構文OK")
    except json.JSONDecodeError as e:
        result.fail(f"{name} 設定", f"JSON構文エラー: {e}")
    except OSError as e:
        result.warn(f"{name} 設定", f"設定ファイル読み取り失敗: {e}")


def check_git_status(result):
    """gitの状態確認"""
    try:
        # 未pushコミット数
        unpushed = subprocess.run(
            ["git", "log", "origin/master..HEAD", "--oneline"],
            capture_output=True, text=True, timeout=10, cwd=str(REPO_DIR)
        )
        if unpushed.returncode == 0:
            count = len(unpushed.stdout.strip().split("\n")) if unpushed.stdout.strip() else 0
            if count > 5:
                result.warn("git 未push", f"{count}件の未pushコミット")
            elif count > 0:
                result.ok("git 未push", f"{count}件")
            else:
                result.ok("git 未push", "なし")
        else:
            result.warn("git 未push", "確認失敗（origin/master取得不可？）")

        # 最終コミット時刻
        last_commit = subprocess.run(
            ["git", "log", "-1", "--format=%ct"],
            capture_output=True, text=True, timeout=10, cwd=str(REPO_DIR)
        )
        if last_commit.returncode == 0 and last_commit.stdout.strip():
            ts = int(last_commit.stdout.strip())
            elapsed = int(time.time()) - ts
            hours = elapsed / 3600
            if hours > 6:
                result.warn("git 最終コミット", f"{hours:.1f}時間前")
            else:
                result.ok("git 最終コミット", f"{hours:.1f}時間前")

    except (subprocess.TimeoutExpired, FileNotFoundError) as e:
        result.warn("git", f"git確認失敗: {e}")


# ── インスタンス別チェック ──

def check_mir(result):
    """Mac (Mir) のヘルスチェック"""
    # autonomous_cycle.sh のロック
    check_lock_file(result, Path("/tmp/nao-u-lab-cycle.lock"), "自律サイクル")

    # check_inbox.sh のロック
    check_lock_file(result, Path("/tmp/nao-u-lab-claude.lock"), "受信箱チェック")

    # 最終実行時刻（3時間=10800秒が期待間隔）
    check_timestamp_file(result, Path("/tmp/nao-u-lab-last-run"), "自律サイクル", 10800)

    # Twitterチェック（6時間=21600秒）
    check_timestamp_file(result, Path("/tmp/nao-u-lab-last-twitter-check"), "おすすめ欄", 21600)

    # Slackエクスポート（24時間=86400秒）
    check_timestamp_file(result, Path("/tmp/nao-u-lab-last-slack-export"), "Slackエクスポート", 86400)

    # ログファイル
    check_log_errors(result, Path("/tmp/nao-u-lab-cycle.log"), "自律サイクル")
    check_log_errors(result, Path("/tmp/nao-u-lab-inbox.log"), "受信箱チェック")

    # git
    check_git_status(result)


def check_log_instance(result):
    """Win (Log) のヘルスチェック"""
    # PID
    check_pid_file(result, REPO_DIR / ".scheduler_log.lock", "scheduler_log")

    # 設定ファイル
    check_json_config(result, REPO_DIR / "scheduler_log_config.json", "scheduler_log")

    # ログ
    check_log_errors(result, REPO_DIR / "log" / "scheduler_log.log", "scheduler_log")

    # git
    check_git_status(result)


def check_ash(result):
    """Win2 (Ash) のヘルスチェック"""
    # PID
    check_pid_file(result, REPO_DIR / ".scheduler_ash.pid", "scheduler_ash")

    # 設定ファイル
    check_json_config(result, REPO_DIR / "scheduler_ash_config.json", "scheduler_ash")

    # ログ
    check_log_errors(result, REPO_DIR / "log" / "scheduler_ash.log", "scheduler_ash")

    # git
    check_git_status(result)


# ── メイン ──

def detect_instance():
    """実行マシンを自動検出"""
    if sys.platform == "darwin":
        return "mir"
    # Win側はPIDファイルで判定
    if (REPO_DIR / ".scheduler_log.lock").exists():
        return "log"
    if (REPO_DIR / ".scheduler_ash.pid").exists():
        return "ash"
    return "log"  # フォールバック


def main():
    parser = argparse.ArgumentParser(description="スケジューラ健全性チェック（LLM不要）")
    parser.add_argument("--instance", choices=["mir", "log", "ash"],
                        help="対象インスタンス（省略時は自動検出）")
    parser.add_argument("--slack", action="store_true",
                        help="問題があればSlack #human-steeringに通知")
    parser.add_argument("--json", action="store_true",
                        help="JSON形式で出力")
    args = parser.parse_args()

    instance = args.instance or detect_instance()
    result = HealthResult()

    if instance == "mir":
        check_mir(result)
    elif instance == "log":
        check_log_instance(result)
    elif instance == "ash":
        check_ash(result)

    # 出力
    if args.json:
        print(result.to_json())
    else:
        print(f"[{instance.upper()}] ヘルスチェック {result.summary()}")
        print(result.to_text())

    # Slack通知（FAILがある場合のみ。各自チャンネルへ。2026-04-07 Nao_u指示）
    if args.slack and result.failures:
        try:
            sys.path.insert(0, str(REPO_DIR))
            from slack_bot import post_message
            instance_channels = {"mir": "mir-log", "log": "log", "ash": "ash"}
            channel = instance_channels.get(instance, "mir-log")
            msg = f"⚠️ [{instance.upper()}] スケジューラ異常検出\n{result.summary()}\n"
            for f in result.failures:
                msg += f"\n❌ {f['name']}: {f['detail']}"
            post_message(channel, msg)
        except Exception as e:
            print(f"Slack通知失敗: {e}", file=sys.stderr)

    return 1 if result.has_problems else 0


if __name__ == "__main__":
    sys.exit(main())
