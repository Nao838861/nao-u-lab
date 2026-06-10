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
import re
import sys
import json
import time
import argparse
import subprocess
from pathlib import Path
from datetime import datetime, date

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
    # Windowsではos.kill(pid, 0)がセッション分離やパーミッション差で
    # OSError/SystemError(WinError 87)を投げることがあり、誤検知の原因になる。
    # WindowsではOpenProcessを優先し、tasklistでフォールバック。
    if sys.platform == "win32":
        alive = False
        try:
            import ctypes
            PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
            handle = ctypes.windll.kernel32.OpenProcess(
                PROCESS_QUERY_LIMITED_INFORMATION, False, pid
            )
            if handle:
                ctypes.windll.kernel32.CloseHandle(handle)
                alive = True
        except Exception:
            pass
        if not alive:
            try:
                r = subprocess.run(
                    ["tasklist", "/FI", f"PID eq {pid}"],
                    capture_output=True, text=True, timeout=10,
                    encoding="utf-8", errors="replace",
                )
                if f" {pid} " in (r.stdout or ""):
                    alive = True
            except Exception:
                pass
        if alive:
            result.ok(f"{name} PID", f"PID={pid} 生存中")
        else:
            result.fail(f"{name} PID", f"PID={pid} は死んでいる")
        return

    try:
        os.kill(pid, 0)
        result.ok(f"{name} PID", f"PID={pid} 生存中")
    except ProcessLookupError:
        result.fail(f"{name} PID", f"PID={pid} は死んでいる")
    except PermissionError:
        result.ok(f"{name} PID", f"PID={pid} 生存中（権限なし）")
    except (OSError, SystemError):
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


def check_external_search_freshness(instance: str) -> tuple[str, str]:
    """log/external_search.log の <instance> 最新行 ts を 24h/48h で評価。

    戻り値: (status, message), status ∈ {"OK", "WARN", "CRITICAL"}
    判定:
      - ファイル/エントリ皆無 → CRITICAL「外部検索の log 痕跡なし」
      - <24h → OK
      - 24h ≤ 差 < 48h → WARN
      - 48h ≤ 差 → CRITICAL
    """
    log_path = REPO_DIR / "log" / "external_search.log"
    if not log_path.exists():
        return ("CRITICAL", f"{instance} 外部検索の log 痕跡なし（ファイル不在: {log_path}）")

    try:
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
    except OSError as e:
        return ("CRITICAL", f"{instance} 外部検索 log 読取失敗: {e}")

    target = f"| {instance} |"
    latest_ts = None
    for line in reversed(lines):
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if target not in s:
            continue
        head = s.split("|", 1)[0].strip()
        try:
            latest_ts = datetime.strptime(head, "%Y-%m-%d %H:%M")
            break
        except ValueError:
            continue

    if latest_ts is None:
        return ("CRITICAL", f"{instance} 外部検索の log 痕跡なし（該当 instance のエントリ皆無）")

    elapsed_sec = time.time() - latest_ts.timestamp()
    hours = elapsed_sec / 3600
    if elapsed_sec < 24 * 3600:
        return ("OK", f"{instance} 外部検索 {hours:.1f}h 前")
    if elapsed_sec < 48 * 3600:
        return ("WARN", f"{instance} 外部検索 24h 未実行（最終 = {hours:.1f}h 前）")
    return ("CRITICAL", f"{instance} 外部検索 48h 未実行（最終 = {hours:.1f}h 前）")


def check_external_search_all(result):
    """Log/Mir/Ash 3 instance 分の external_search 鮮度を集約レポートに追加。"""
    for inst in ("Log", "Mir", "Ash"):
        status, message = check_external_search_freshness(inst)
        name = f"external_search ({inst})"
        if status == "OK":
            result.ok(name, message)
        elif status == "WARN":
            result.warn(name, message)
        else:
            result.fail(name, message)


_PROMOTION_HEADING = re.compile(r"^## (\d{4}-\d{2}-\d{2})\b")


def check_external_promotion_freshness(instance: str) -> tuple[str, str]:
    """memory/external_notes_<instance>.md の最新昇格日と今日との差分を 3d/7d で評価。

    案E 本格運用組込（projects/external_search_phase1_fixation.md 案E）。
    tools/check_external_promotion_freshness.py の試作ロジックを移植。

    戻り値: (status, message), status ∈ {"OK", "WARN", "CRITICAL", "SKIP"}
    判定:
      - ファイル不在 → SKIP（リモートインスタンスのファイル未sync を想定）
      - 日付見出し皆無 → CRITICAL「昇格痕跡なし」
      - diff < 3d  → OK
      - 3d ≤ diff < 7d → WARN
      - 7d ≤ diff → CRITICAL
    """
    path = REPO_DIR / "memory" / f"external_notes_{instance.lower()}.md"
    if not path.exists():
        return ("SKIP", f"{instance} external_notes ファイル不在（{path.name}）")

    latest_date = None
    try:
        for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            m = _PROMOTION_HEADING.match(line)
            if not m:
                continue
            try:
                d = date.fromisoformat(m.group(1))
            except ValueError:
                continue
            if latest_date is None or d > latest_date:
                latest_date = d
    except OSError as e:
        return ("CRITICAL", f"{instance} external_notes 読取失敗: {e}")

    if latest_date is None:
        return ("CRITICAL", f"{instance} external_notes 昇格痕跡なし（{path.name} に日付見出しなし）")

    today = date.today()
    diff = (today - latest_date).days
    if diff >= 7:
        return ("CRITICAL",
                f"{instance} external_notes 昇格 7日ゼロ（最終 = {latest_date.isoformat()}, {diff}日前）twitter_recommended 見直し必須")
    if diff >= 3:
        return ("WARN", f"{instance} external_notes 昇格 3日ゼロ（最終 = {latest_date.isoformat()}, {diff}日前）")
    return ("OK", f"{instance} external_notes 昇格 {diff}日前（最終 = {latest_date.isoformat()}）")


def check_external_promotion_all(result):
    """Log/Mir/Ash 3 instance 分の external_notes 昇格鮮度を集約レポートに追加。

    SKIP（ファイル不在）は OK 扱いで詳細だけ残す（リモートインスタンスファイル未sync を想定）。
    """
    for inst in ("Log", "Mir", "Ash"):
        status, message = check_external_promotion_freshness(inst)
        name = f"external_promotion ({inst})"
        if status == "OK":
            result.ok(name, message)
        elif status == "WARN":
            result.warn(name, message)
        elif status == "SKIP":
            result.ok(name, message)
        else:
            result.fail(name, message)


def check_instance_divergence_freshness() -> tuple[str, str]:
    """log/instance_divergence_observability.log の最終追記時刻を週次基準で評価。

    C306 Phase 4 大作業 — effective_rank_probe.py 週次定点観測ジョブ化。
    Patel 2604.03809 effective rank の 4 instance source 多様性測定を
    継続的に取り続け、Mnemonic Sovereignty Forget phase の介入効果検証材料化。

    R-F 順守: effective_rank 最大化は「4 instance source 全員が直近 7d で
    substantive 投稿を続け、source 間で語彙が分離している時」。本判定関数の
    出力 (status) を最大化することは目的ではなく、effective_rank の base rate
    変動を見逃さないことが目的 (Goodhart 直行防止)。

    戻り値: (status, message), status ∈ {"OK", "WARN", "CRITICAL"}
    判定:
      - ファイル不在 → CRITICAL「base rate 未記録」
      - 最終追記から diff < 168h (1週間以内) → OK
      - 168h ≤ diff < 336h (1-2週間) → OK (週次ジョブ猶予内)
      - 336h ≤ diff < 504h (2-3週間) → WARN
      - 504h ≤ diff (3週間以上) → CRITICAL
    """
    log_path = REPO_DIR / "log" / "instance_divergence_observability.log"
    if not log_path.exists():
        return ("CRITICAL", f"instance_divergence base rate 未記録（ファイル不在: {log_path.name}）")

    latest_ts = None
    try:
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                s = line.strip()
                if not s or s.startswith("#"):
                    continue
                head = s.split("|", 1)[0].strip()
                try:
                    latest_ts = datetime.strptime(head, "%Y-%m-%d %H:%M")
                except ValueError:
                    continue
    except OSError as e:
        return ("CRITICAL", f"instance_divergence log 読取失敗: {e}")

    if latest_ts is None:
        return ("CRITICAL", f"instance_divergence base rate 未記録（{log_path.name} に有効行なし）")

    elapsed_sec = time.time() - latest_ts.timestamp()
    hours = elapsed_sec / 3600
    if elapsed_sec < 336 * 3600:
        return ("OK", f"instance_divergence {hours:.1f}h 前（週次猶予内）")
    if elapsed_sec < 504 * 3600:
        return ("WARN", f"instance_divergence 2週間ゼロ（最終 = {hours:.1f}h 前）")
    return ("CRITICAL", f"instance_divergence 3週間ゼロ（最終 = {hours:.1f}h 前）週次ジョブ停止疑い")


def check_instance_divergence_all(result):
    """instance_divergence_observability.log の鮮度を集約レポートに追加。

    instance 別ではなくグローバル 1 件 (4 source 統合測定の単一ログのため)。
    """
    status, message = check_instance_divergence_freshness()
    name = "instance_divergence"
    if status == "OK":
        result.ok(name, message)
    elif status == "WARN":
        result.warn(name, message)
    else:
        result.fail(name, message)


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

    # 外部検索鮮度（Log/Mir/Ash 3件、案B 段階1）
    check_external_search_all(result)

    # external_notes 昇格鮮度（案E 本格運用組込）
    check_external_promotion_all(result)

    # instance_divergence base rate 鮮度（C306 Phase 4 週次ジョブ）
    check_instance_divergence_all(result)

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

    # 外部検索鮮度（Log/Mir/Ash 3件、案B 段階1）
    check_external_search_all(result)

    # external_notes 昇格鮮度（案E 本格運用組込）
    check_external_promotion_all(result)

    # instance_divergence base rate 鮮度（C306 Phase 4 週次ジョブ）
    check_instance_divergence_all(result)

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

    # 外部検索鮮度（Log/Mir/Ash 3件、案B 段階1）
    check_external_search_all(result)

    # external_notes 昇格鮮度（案E 本格運用組込）
    check_external_promotion_all(result)

    # instance_divergence base rate 鮮度（C306 Phase 4 週次ジョブ）
    check_instance_divergence_all(result)

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
                        help="問題があればSlack（各インスタンスのチャンネル）に通知")
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

    # Slack通知（FAILがある場合のみ。#errorに集約。2026-05-04 Nao_u指示: 各自chでは無視される）
    # 30分dedup: スケジューラ不安定時の連投防止（2026-04-10）
    if args.slack and result.failures:
        try:
            dedup_file = REPO_DIR / ".scheduler_health_last_alert.json"
            dedup_key = f"{instance}:fail"
            now = time.time()
            dedup_cache = {}
            try:
                if dedup_file.exists():
                    dedup_cache = json.loads(dedup_file.read_text(encoding="utf-8"))
            except Exception:
                pass
            if now - dedup_cache.get(dedup_key, 0) < 1800:
                print(f"Slack通知: 30分dedup中（スキップ）")
            else:
                sys.path.insert(0, str(REPO_DIR))
                from slack_bot import post_message
                channel = "error"
                msg = f"⚠️ [{instance.upper()}] スケジューラ異常検出\n{result.summary()}\n"
                for f in result.failures:
                    msg += f"\n❌ {f['name']}: {f['detail']}"
                post_message(channel, msg)
                dedup_cache[dedup_key] = now
                dedup_cache = {k: v for k, v in dedup_cache.items() if now - v < 86400}
                dedup_file.write_text(json.dumps(dedup_cache), encoding="utf-8")
        except Exception as e:
            print(f"Slack通知失敗: {e}", file=sys.stderr)

    return 1 if result.has_problems else 0


if __name__ == "__main__":
    sys.exit(main())
