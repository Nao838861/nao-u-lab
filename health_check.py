"""
health_check.py — LLM不要の定期実行システム自己診断

スケジューラから定期的に呼ばれ、以下をチェックする:
  1. スケジューラプロセスの生存確認（PIDファイル + プロセス存在）
  2. ログ鮮度（最終書き込みからの経過時間）
  3. git同期状態（未pushコミットの有無、リモートとの差分）
  4. 直近ログのエラーパターン検出
  5. ログファイルサイズ（肥大化検出）

設計原則:
  - LLM/APIコールは一切使わない
  - subprocess.runで完結する軽量チェック
  - 異常時のみSlack通知（正常時はログのみ）
  - Mac/Win両対応

Usage:
  python health_check.py              # 全チェック実行、結果をJSON出力
  python health_check.py --alert      # 異常時に各自Slackチャンネルに通知
  python health_check.py --instance log   # Log固有のチェックのみ
  python health_check.py --instance ash   # Ash固有のチェックのみ
  python health_check.py --instance mir   # Mir固有のチェックのみ

Exit codes:
  0 = 全て正常
  1 = 警告あり（要注意だが致命的ではない）
  2 = 異常あり（即時対応が必要）
"""

import os
import sys
import json
import time
import subprocess
import platform
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent

# Windows: 全子プロセスのウィンドウを非表示にする
# CREATE_NO_WINDOW + STARTUPINFO/SW_HIDE 併用
# (2026-04-26: Nao_u再指摘「数分に一度一瞬ウインドウが出てフォーカスが持っていかれる」対策)
# health_checkは5分ごとにgit/tasklistを呼ぶため抑制必須
if sys.platform == "win32":
    _SILENT_STARTUPINFO = subprocess.STARTUPINFO()
    _SILENT_STARTUPINFO.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    _SILENT_STARTUPINFO.wShowWindow = subprocess.SW_HIDE

    _orig_run = subprocess.run
    def _silent_run(*a, **kw):
        kw["creationflags"] = kw.get("creationflags", 0) | subprocess.CREATE_NO_WINDOW
        kw.setdefault("startupinfo", _SILENT_STARTUPINFO)
        return _orig_run(*a, **kw)
    subprocess.run = _silent_run
    _orig_popen = subprocess.Popen
    def _silent_popen(*a, **kw):
        kw["creationflags"] = kw.get("creationflags", 0) | subprocess.CREATE_NO_WINDOW
        kw.setdefault("startupinfo", _SILENT_STARTUPINFO)
        return _orig_popen(*a, **kw)
    subprocess.Popen = _silent_popen

# --- 設定 ---
# ログ鮮度の閾値（秒）。これ以上更新がなければ警告/異常
LOG_FRESHNESS_WARN_SEC = 30 * 60     # 30分: 警告
LOG_FRESHNESS_CRIT_SEC = 2 * 3600    # 2時間: 異常

# git同期の閾値
GIT_UNPUSHED_WARN = 3       # 未pushコミット数: 警告
GIT_UNPUSHED_CRIT = 10      # 未pushコミット数: 異常

# ログファイルサイズの閾値（バイト）
LOG_SIZE_WARN = 5 * 1024 * 1024    # 5MB: 警告
LOG_SIZE_CRIT = 20 * 1024 * 1024   # 20MB: 異常

# 直近ログの検査範囲（行数）
LOG_TAIL_LINES = 100

# 連続エラーの検出閾値
CONSECUTIVE_ERROR_PATTERN_THRESHOLD = 5

# Slackチャンネル（エラーログは各自チャンネルに出す。2026-04-07 Nao_u指示）
_INSTANCE_CHANNELS = {"log": "log", "ash": "ash", "mir": "mir-log"}

# --- チェック定義 ---

# PIDファイルとログファイルのマッピング
INSTANCE_CONFIG = {
    "log": {
        "pid_file": REPO_DIR / ".scheduler_log.lock",
        "log_file": REPO_DIR / "log" / "scheduler_log.log",
        "config_file": REPO_DIR / "scheduler_log_config.json",
        "platform": "win32",
    },
    "ash": {
        "pid_file": REPO_DIR / ".scheduler_ash.pid",
        "log_file": REPO_DIR / "log" / "scheduler_ash.log",
        "config_file": REPO_DIR / "scheduler_ash_config.json",
        "platform": "win32",
    },
    "mir": {
        "pid_file": None,  # Mirはロックファイルが/tmp
        "log_file": None,  # Mirのログはstdout（LaunchAgent管理）
        "config_file": None,
        "platform": "darwin",
    },
}


def _run_subprocess(cmd, timeout=15):
    """subprocess.run のラッパー。Windows cp932問題を吸収する。"""
    kwargs = {"capture_output": True, "timeout": timeout, "cwd": str(REPO_DIR)}
    # Windows: text=Trueだとcp932でデコードしようとしてエラーになる場合がある
    # bytes で受け取って手動でデコードする
    result = subprocess.run(cmd, **kwargs)
    stdout = result.stdout.decode("utf-8", errors="replace") if isinstance(result.stdout, bytes) else result.stdout
    stderr = result.stderr.decode("utf-8", errors="replace") if isinstance(result.stderr, bytes) else result.stderr
    return result.returncode, stdout, stderr


def is_pid_alive(pid):
    """プロセスが生存しているか確認（Mac/Win両対応）"""
    if platform.system() == "Windows":
        # Method 1: kernel32 OpenProcess (cp932問題を回避できるので先に試す)
        try:
            import ctypes
            PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
            handle = ctypes.windll.kernel32.OpenProcess(
                PROCESS_QUERY_LIMITED_INFORMATION, False, pid
            )
            if handle:
                ctypes.windll.kernel32.CloseHandle(handle)
                return True
        except Exception:
            pass
        # Method 2: tasklist
        try:
            rc, stdout, _ = _run_subprocess(["tasklist", "/FI", f"PID eq {pid}"])
            return f" {pid} " in stdout
        except Exception:
            pass
        return False
    else:
        # Unix/Mac
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False


def check_scheduler_alive(instance):
    """スケジューラプロセスの生存確認"""
    config = INSTANCE_CONFIG.get(instance)
    if not config or not config["pid_file"]:
        return {"status": "skip", "message": f"{instance}: PIDファイルなし（外部管理）"}

    pid_file = config["pid_file"]
    if not pid_file.exists():
        return {
            "status": "critical",
            "message": f"{instance}: PIDファイルが存在しない ({pid_file.name})",
        }

    try:
        pid = int(pid_file.read_text().strip())
    except (ValueError, OSError) as e:
        return {
            "status": "critical",
            "message": f"{instance}: PIDファイルが壊れている: {e}",
        }

    if is_pid_alive(pid):
        # PIDファイルの年齢も確認
        age = time.time() - pid_file.stat().st_mtime
        return {
            "status": "ok",
            "message": f"{instance}: PID {pid} は生存中 (PIDファイル更新: {age:.0f}秒前)",
        }
    else:
        return {
            "status": "critical",
            "message": f"{instance}: PID {pid} は死んでいる（PIDファイルが残存）",
        }


def check_log_freshness(instance):
    """ログの鮮度チェック"""
    config = INSTANCE_CONFIG.get(instance)
    if not config or not config["log_file"]:
        return {"status": "skip", "message": f"{instance}: ログファイルなし"}

    log_file = config["log_file"]
    if not log_file.exists():
        return {
            "status": "warning",
            "message": f"{instance}: ログファイルが存在しない ({log_file.name})",
        }

    age = time.time() - log_file.stat().st_mtime
    if age > LOG_FRESHNESS_CRIT_SEC:
        return {
            "status": "critical",
            "message": f"{instance}: ログが {age/3600:.1f}時間 更新されていない",
        }
    elif age > LOG_FRESHNESS_WARN_SEC:
        return {
            "status": "warning",
            "message": f"{instance}: ログが {age/60:.0f}分 更新されていない",
        }
    else:
        return {
            "status": "ok",
            "message": f"{instance}: ログは {age:.0f}秒前に更新",
        }


def check_log_errors(instance):
    """直近ログのエラーパターン検出"""
    config = INSTANCE_CONFIG.get(instance)
    if not config or not config["log_file"]:
        return {"status": "skip", "message": f"{instance}: ログファイルなし"}

    log_file = config["log_file"]
    if not log_file.exists():
        return {"status": "skip", "message": f"{instance}: ログファイルなし"}

    try:
        with open(log_file, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
        tail = lines[-LOG_TAIL_LINES:] if len(lines) > LOG_TAIL_LINES else lines
    except Exception as e:
        return {"status": "warning", "message": f"{instance}: ログ読み取りエラー: {e}"}

    error_keywords = ["Error", "TIMEOUT", "Failed", "ALERT", "critical", "exception"]
    error_count = 0
    consecutive_errors = 0
    max_consecutive = 0
    recent_errors = []

    for line in tail:
        is_error = any(kw.lower() in line.lower() for kw in error_keywords)
        if is_error:
            error_count += 1
            consecutive_errors += 1
            max_consecutive = max(max_consecutive, consecutive_errors)
            if len(recent_errors) < 5:
                recent_errors.append(line.strip()[:120])
        else:
            consecutive_errors = 0

    if max_consecutive >= CONSECUTIVE_ERROR_PATTERN_THRESHOLD:
        return {
            "status": "critical",
            "message": f"{instance}: 直近{LOG_TAIL_LINES}行で{max_consecutive}回連続エラー検出",
            "details": recent_errors,
        }
    elif error_count > LOG_TAIL_LINES * 0.3:
        return {
            "status": "warning",
            "message": f"{instance}: 直近{LOG_TAIL_LINES}行中{error_count}行にエラー ({error_count/LOG_TAIL_LINES*100:.0f}%)",
            "details": recent_errors,
        }
    else:
        return {
            "status": "ok",
            "message": f"{instance}: 直近{LOG_TAIL_LINES}行でエラー{error_count}件（正常範囲）",
        }


def check_log_size(instance):
    """ログファイルサイズの肥大化チェック"""
    config = INSTANCE_CONFIG.get(instance)
    if not config or not config["log_file"]:
        return {"status": "skip", "message": f"{instance}: ログファイルなし"}

    log_file = config["log_file"]
    if not log_file.exists():
        return {"status": "ok", "message": f"{instance}: ログファイルなし（正常）"}

    size = log_file.stat().st_size
    size_mb = size / (1024 * 1024)

    if size > LOG_SIZE_CRIT:
        return {
            "status": "critical",
            "message": f"{instance}: ログが {size_mb:.1f}MB に肥大化（{LOG_SIZE_CRIT//1024//1024}MB超）",
        }
    elif size > LOG_SIZE_WARN:
        return {
            "status": "warning",
            "message": f"{instance}: ログが {size_mb:.1f}MB（{LOG_SIZE_WARN//1024//1024}MB超）",
        }
    else:
        return {
            "status": "ok",
            "message": f"{instance}: ログサイズ {size_mb:.1f}MB（正常）",
        }


def check_git_sync():
    """git同期状態のチェック"""
    results = []

    # 未pushコミット数
    try:
        rc, stdout, stderr = _run_subprocess(["git", "log", "--oneline", "origin/master..HEAD"])
        if rc == 0:
            unpushed = len([l for l in stdout.strip().split("\n") if l.strip()])
            if unpushed >= GIT_UNPUSHED_CRIT:
                results.append({
                    "status": "critical",
                    "message": f"git: {unpushed}件の未pushコミット（{GIT_UNPUSHED_CRIT}件超）",
                })
            elif unpushed >= GIT_UNPUSHED_WARN:
                results.append({
                    "status": "warning",
                    "message": f"git: {unpushed}件の未pushコミット",
                })
            else:
                results.append({
                    "status": "ok",
                    "message": f"git: 未pushコミット{unpushed}件（正常）",
                })
        else:
            results.append({
                "status": "warning",
                "message": f"git log失敗: {stderr[:100]}",
            })
    except subprocess.TimeoutExpired:
        results.append({
            "status": "warning",
            "message": "git log タイムアウト（15秒）",
        })
    except Exception as e:
        results.append({
            "status": "warning",
            "message": f"git チェックエラー: {e}",
        })

    # uncommittedな変更の確認
    try:
        rc, stdout, _ = _run_subprocess(["git", "status", "--porcelain", "memory/", "log/"])
        if rc == 0:
            changes = [l for l in stdout.strip().split("\n") if l.strip()]
            if len(changes) > 20:
                results.append({
                    "status": "warning",
                    "message": f"git: {len(changes)}件のuncommitted変更（memory/log/）",
                })
            else:
                results.append({
                    "status": "ok",
                    "message": f"git: uncommitted変更{len(changes)}件（正常）",
                })
    except Exception:
        pass

    return results


def rotate_log_if_needed(instance):
    """ログファイルが閾値を超えていたらローテーションする。
    LLM不要。health_checkの一部として自動実行。
    """
    config = INSTANCE_CONFIG.get(instance)
    if not config or not config["log_file"]:
        return {"status": "skip", "message": f"{instance}: ログファイルなし"}

    log_file = config["log_file"]
    if not log_file.exists():
        return {"status": "ok", "message": f"{instance}: ログファイルなし"}

    size = log_file.stat().st_size
    if size <= LOG_SIZE_WARN:
        return {"status": "ok", "message": f"{instance}: ログローテーション不要 ({size/1024/1024:.1f}MB)"}

    # ローテーション: 古い方の半分を削除して前半を保持
    try:
        with open(log_file, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
        keep_lines = lines[len(lines)//2:]  # 新しい方の半分を保持
        archive_path = log_file.with_suffix(f".{datetime.now().strftime('%Y%m%d')}.log")
        # アーカイブ（古い方を保存）
        with open(archive_path, "w", encoding="utf-8") as f:
            f.writelines(lines[:len(lines)//2])
        # 本体を上書き
        with open(log_file, "w", encoding="utf-8") as f:
            f.writelines(keep_lines)
        new_size = log_file.stat().st_size
        return {
            "status": "ok",
            "message": f"{instance}: ログローテーション実行 ({size/1024/1024:.1f}MB → {new_size/1024/1024:.1f}MB, archive: {archive_path.name})",
        }
    except Exception as e:
        return {
            "status": "warning",
            "message": f"{instance}: ログローテーション失敗: {e}",
        }


def check_design_principles():
    """設計原則違反の静的検出（LLM不要）。
    コード内にINC-007で禁止されたパターン(hour%N)が残っていないか等をチェック。
    """
    results = []
    scheduler_files = [
        REPO_DIR / "scheduler_log.py",
        REPO_DIR / "scheduler_ash.py",
    ]

    for fpath in scheduler_files:
        if not fpath.exists():
            continue
        try:
            content = fpath.read_text(encoding="utf-8", errors="replace")
            # hour%N / hour==N パターン検出（コメント行・文字列を除外）
            # INC-007: hour%N禁止、INC-018: hour==N も禁止（経過時間ベースに統一）
            import re
            for i, line in enumerate(content.split("\n"), 1):
                stripped = line.strip()
                if stripped.startswith("#") or stripped.startswith("//"):
                    continue
                # hour_filter lambda内のhour%N を検出
                if re.search(r'hour\s*%\s*\d+', stripped) and 'hour_filter' in stripped:
                    results.append({
                        "status": "warning",
                        "message": f"{fpath.name}:{i}: hour%N パターン残存 (INC-007禁止)",
                    })
                # hour == N / now.hour == N の直接比較を検出（コメント内の言及は除外済み）
                if re.search(r'\.?hour\s*==\s*\d+', stripped):
                    # ログメッセージ内の文字列は除外（f"...hour=={n}..."等）
                    if not re.search(r'["\'].*hour\s*==', stripped):
                        results.append({
                            "status": "warning",
                            "message": f"{fpath.name}:{i}: hour==N パターン残存 (INC-018: 経過時間ベースに統一)",
                        })
        except Exception as e:
            results.append({
                "status": "warning",
                "message": f"{fpath.name}: 読み取りエラー: {e}",
            })

    if not results:
        results.append({
            "status": "ok",
            "message": "設計原則: 禁止パターンなし",
        })
    return results


def check_config_valid(instance):
    """設定ファイルのJSON構文チェック"""
    config = INSTANCE_CONFIG.get(instance)
    if not config or not config["config_file"]:
        return {"status": "skip", "message": f"{instance}: 設定ファイルなし"}

    config_file = config["config_file"]
    if not config_file.exists():
        return {"status": "ok", "message": f"{instance}: 設定ファイルなし（デフォルト使用）"}

    try:
        with open(config_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {
            "status": "ok",
            "message": f"{instance}: 設定ファイル正常 ({len(data)}ジョブの上書きあり)",
        }
    except json.JSONDecodeError as e:
        return {
            "status": "critical",
            "message": f"{instance}: 設定ファイルのJSON構文エラー: {e}",
        }
    except Exception as e:
        return {
            "status": "warning",
            "message": f"{instance}: 設定ファイル読み取りエラー: {e}",
        }


def run_all_checks(instance_filter=None):
    """全チェックを実行し、結果を返す"""
    results = []
    now = datetime.now().isoformat(timespec="seconds")

    # どのインスタンスをチェックするか決定
    if instance_filter:
        instances = [instance_filter]
    else:
        # 現在のプラットフォームに合うインスタンスのみ
        current_platform = sys.platform
        instances = [
            name for name, cfg in INSTANCE_CONFIG.items()
            if cfg["platform"] == current_platform or cfg["platform"] is None
        ]
        # プラットフォームに関係なくPIDファイルがあればチェック（git pull後に他マシンのファイルが来る）
        for name, cfg in INSTANCE_CONFIG.items():
            if name not in instances and cfg["pid_file"] and cfg["pid_file"].exists():
                instances.append(name)

    # インスタンス別チェック
    for inst in instances:
        results.append({"check": f"scheduler_alive_{inst}", **check_scheduler_alive(inst)})
        results.append({"check": f"log_freshness_{inst}", **check_log_freshness(inst)})
        results.append({"check": f"log_errors_{inst}", **check_log_errors(inst)})
        results.append({"check": f"log_size_{inst}", **check_log_size(inst)})
        results.append({"check": f"config_valid_{inst}", **check_config_valid(inst)})
        # ログが肥大化していたら自動ローテーション
        results.append({"check": f"log_rotation_{inst}", **rotate_log_if_needed(inst)})

    # 共通チェック
    for git_result in check_git_sync():
        results.append({"check": "git_sync", **git_result})

    # 設計原則違反チェック
    for dp_result in check_design_principles():
        results.append({"check": "design_principles", **dp_result})

    # サマリー
    critical_count = sum(1 for r in results if r["status"] == "critical")
    warning_count = sum(1 for r in results if r["status"] == "warning")
    ok_count = sum(1 for r in results if r["status"] == "ok")

    if critical_count > 0:
        overall = "critical"
    elif warning_count > 0:
        overall = "warning"
    else:
        overall = "ok"

    report = {
        "timestamp": now,
        "overall": overall,
        "summary": {
            "critical": critical_count,
            "warning": warning_count,
            "ok": ok_count,
        },
        "checks": results,
    }
    return report


def format_report(report):
    """レポートを人間が読める形式にフォーマット"""
    lines = []
    lines.append(f"[health_check] {report['timestamp']} overall={report['overall'].upper()}")
    lines.append(
        f"  critical={report['summary']['critical']} "
        f"warning={report['summary']['warning']} "
        f"ok={report['summary']['ok']}"
    )

    # 異常・警告のみ詳細表示
    for check in report["checks"]:
        if check["status"] in ("critical", "warning"):
            icon = "!!" if check["status"] == "critical" else "?"
            lines.append(f"  [{icon}] {check['message']}")
            if "details" in check:
                for detail in check["details"][:3]:
                    lines.append(f"       {detail}")

    return "\n".join(lines)


_DEDUP_FILE = REPO_DIR / ".health_check_last_alert.json"
_DEDUP_COOLDOWN_SEC = 1800


def _should_send_alert(dedup_key):
    now = time.time()
    cache = {}
    try:
        if _DEDUP_FILE.exists():
            cache = json.loads(_DEDUP_FILE.read_text(encoding="utf-8"))
    except Exception:
        pass
    if now - cache.get(dedup_key, 0) < _DEDUP_COOLDOWN_SEC:
        return False
    cache[dedup_key] = now
    cache = {k: v for k, v in cache.items() if now - v < 86400}
    try:
        _DEDUP_FILE.write_text(json.dumps(cache), encoding="utf-8")
    except Exception:
        pass
    return True


def alert_slack(report, instance=None):
    """異常時にSlack通知 + 30分dedup(2026-04-10 Slack汚染防止)"""
    if report["overall"] == "ok":
        return

    try:
        sys.path.insert(0, str(REPO_DIR))
        from slack_bot import post_message

        lines = []
        for check in report["checks"]:
            if check["status"] == "critical":
                lines.append(f"!! {check['message']}")
            elif check["status"] == "warning":
                lines.append(f"?  {check['message']}")

        if not lines:
            return

        # インスタンス未指定時は自動検出
        if not instance:
            if sys.platform == "darwin":
                instance = "mir"
            elif (REPO_DIR / ".scheduler_ash.pid").exists():
                instance = "ash"
            else:
                instance = "log"

        channel = _INSTANCE_CHANNELS.get(instance, "log")
        msg = (
            f"[health_check] {report['overall'].upper()} "
            f"(critical={report['summary']['critical']}, "
            f"warning={report['summary']['warning']})\n"
            + "\n".join(lines[:10])
        )
        # dedup keyからメッセージハッシュを除外（INC-005再発防止）
        # 「12件の未push」→「13件」で変わるだけでdedupが効かなくなる問題
        dedup_key = f"{instance}:{report['overall']}"
        if not _should_send_alert(dedup_key):
            return

        post_message(channel, msg)
    except Exception as e:
        print(f"[health_check] Slack通知失敗: {e}", file=sys.stderr)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="定期実行システム ヘルスチェック")
    parser.add_argument("--alert", action="store_true", help="異常時にSlack通知")
    parser.add_argument("--instance", choices=["log", "ash", "mir"], help="特定インスタンスのみチェック")
    parser.add_argument("--json", action="store_true", help="JSON形式で出力")
    args = parser.parse_args()

    report = run_all_checks(instance_filter=args.instance)

    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(format_report(report))

    if args.alert:
        alert_slack(report, instance=args.instance)

    # Exit code
    if report["overall"] == "critical":
        sys.exit(2)
    elif report["overall"] == "warning":
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
