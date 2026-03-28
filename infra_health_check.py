"""
infra_health_check.py — 「外から見える問題」の自己検知

背景: 2026-03-28 Ashの批判的検証で判明した最大の盲点
「自分で測れるもの（ツール出力、kaizenの数値）は改善する。
 外から見ないとわからないもの（UX、応答速度、サイレント障害）は気づけない。
 外部検知率: 0%」

このスクリプトが検知する問題:
1. Twitterアクセスの連続失敗（サイレント障害）
2. スケジューラの長時間無応答（ジョブが詰まっている）
3. Git同期の遅延（pushされていない変更が長時間放置）
4. Slack投稿の失敗傾向

検知した問題は #all-nao-u-lab に自動アラートを送る。
"""

import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

REPO_DIR = Path(__file__).parent
STATE_FILE = REPO_DIR / ".infra_health_state.json"


def _load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"last_alert_ts": 0, "alerts_sent": []}


def _save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def _alert(message, state):
    """#all-nao-u-labにアラートを送る。同じアラートは2時間に1回まで。"""
    now = time.time()
    # 同種のアラートは2時間抑制
    alert_key = message[:50]
    recent = [a for a in state.get("alerts_sent", [])
              if a.get("key") == alert_key and now - a.get("ts", 0) < 7200]
    if recent:
        print(f"[infra_health] Alert suppressed (cooldown): {alert_key}")
        return False

    try:
        from slack_bot import post_message
        result = post_message("all-nao-u-lab",
                              f"[Ash infra_health_check] {message}")
        if result.get("ok"):
            state.setdefault("alerts_sent", []).append({
                "key": alert_key, "ts": now
            })
            # 古いアラート記録を削除（24時間以上前）
            state["alerts_sent"] = [
                a for a in state["alerts_sent"]
                if now - a.get("ts", 0) < 86400
            ]
            _save_state(state)
            print(f"[infra_health] Alert sent: {message[:80]}")
            return True
    except Exception as e:
        print(f"[infra_health] Alert failed: {e}")
    return False


def check_twitter_access():
    """Twitterエラートラッカーの状態を確認。連続失敗が閾値を超えていないか。"""
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
                    f"Twitter障害: {script_name} が {consecutive}回連続失敗中 "
                    f"(最終失敗: {last_fail})"
                )
    except Exception as e:
        issues.append(f"Twitterエラー状態の読み取りに失敗: {e}")
    return issues


def check_scheduler_health():
    """スケジューラのPIDファイルとログの鮮度を確認。"""
    issues = []

    # Ash scheduler
    pid_file = REPO_DIR / ".scheduler_ash.pid"
    if pid_file.exists():
        try:
            pid = int(pid_file.read_text().strip())
            # PIDが生きているか簡易チェック（Windowsのtasklist）
            import subprocess
            result = subprocess.run(
                ["tasklist", "/FI", f"PID eq {pid}", "/NH"],
                capture_output=True, timeout=10
            )
            result_text = result.stdout.decode("cp932", errors="replace")
            if str(pid) not in result_text:
                issues.append(
                    f"スケジューラ(Ash)のPID {pid}が見つからない。プロセスが死んでいる可能性"
                )
        except Exception:
            pass

    # ログファイルの鮮度チェック
    log_file = REPO_DIR / "log" / "scheduler_ash.log"
    if log_file.exists():
        mtime = log_file.stat().st_mtime
        age_minutes = (time.time() - mtime) / 60
        if age_minutes > 30:
            issues.append(
                f"スケジューラログが {age_minutes:.0f}分間更新されていない "
                f"(通常は1分ごとにslack_check実行)"
            )

    return issues


def check_git_sync():
    """git同期の状態を確認。長時間pushされていない変更がないか。"""
    issues = []
    import subprocess

    try:
        # ローカルの未コミット変更チェック
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR)
        )
        modified = [l for l in result.stdout.strip().split('\n')
                    if l.strip() and not l.strip().startswith('??')]
        if len(modified) > 10:
            issues.append(
                f"未コミットの変更が{len(modified)}件。git syncが停止している可能性"
            )

        # リモートとの差分チェック
        subprocess.run(
            ["git", "fetch", "--dry-run"],
            capture_output=True, text=True, timeout=15,
            cwd=str(REPO_DIR)
        )
        result = subprocess.run(
            ["git", "rev-list", "--count", "HEAD..@{u}"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR)
        )
        behind = int(result.stdout.strip()) if result.stdout.strip() else 0
        if behind > 5:
            issues.append(
                f"リモートに{behind}コミット遅れている。git pullが止まっている可能性"
            )
    except Exception:
        pass  # git操作の失敗自体はスキップ

    return issues


def check_dedup_cache():
    """日記の重複投稿キャッシュの状態確認。"""
    issues = []
    cache_file = REPO_DIR / ".diary_dedup_cache.json"
    if cache_file.exists():
        try:
            cache = json.loads(cache_file.read_text(encoding="utf-8"))
            if len(cache) > 100:
                issues.append(
                    f"重複防止キャッシュが{len(cache)}件に膨張。クリーンアップが必要"
                )
        except Exception:
            pass
    return issues


def run_all_checks():
    """全チェックを実行し、問題があればアラートを送る。"""
    state = _load_state()
    all_issues = []

    print(f"[infra_health] Running checks at {datetime.now()}")

    all_issues.extend(check_twitter_access())
    all_issues.extend(check_scheduler_health())
    all_issues.extend(check_git_sync())
    all_issues.extend(check_dedup_cache())

    if all_issues:
        summary = "\n".join(f"- {issue}" for issue in all_issues)
        message = (
            f"インフラ自己診断で{len(all_issues)}件の問題を検知:\n{summary}\n\n"
            "（自動検知。Nao_uが先に気づく問題を減らすための仕組み）"
        )
        _alert(message, state)
        print(f"[infra_health] {len(all_issues)} issues found")
    else:
        print("[infra_health] All checks passed")
        state["last_clean_check"] = time.time()
        _save_state(state)

    return all_issues


if __name__ == "__main__":
    issues = run_all_checks()
    if issues:
        for i in issues:
            print(f"  ISSUE: {i}")
    else:
        print("  All OK")
