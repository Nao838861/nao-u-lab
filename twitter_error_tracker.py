"""
twitter_error_tracker.py — Twitter/Xアクセス障害の共通追跡・Slack通知

check_dm.pyの障害追跡パターンを汎用化。
全Twitterスクリプトで使える共通モジュール。

使い方:
    from twitter_error_tracker import track_failure, track_success, is_in_cooldown

    # エラー時
    track_failure("check_notifications_diff", "login page detected")

    # 成功時
    track_success("check_notifications_diff")

    # クールダウン中かチェック（スキップ判断に使う）
    if is_in_cooldown("check_notifications_diff"):
        return

背景: Nao_uの指摘(2026-03-27 #human-steering)
「ashはアクセスできないときにログを出していたが放置していた」
→ エラーログを出すだけでなく、Slackに通知して人間に気づかせる仕組みが必要。
"""

import json
from datetime import datetime
from pathlib import Path

STATE_FILE = Path(__file__).parent / ".twitter_access_error_state.json"

def _detect_error_channel():
    """エラーアラート先を各インスタンスのチャンネルに振り分け（Nao_u指示 2026-04-07）"""
    import sys
    if sys.platform == "darwin":
        return "mir-log"
    repo = Path(__file__).parent
    if (repo / ".scheduler_ash.pid").exists():
        return "ash"
    return "log"

# 連続N回失敗でSlackアラート送信
CONSECUTIVE_FAIL_THRESHOLD = 5

# アラート後のバックオフ段階（分）: 30分→1時間→2時間
BACKOFF_STAGES = [30, 60, 120]


def _load_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def track_failure(script_name: str, reason: str = "unknown") -> int:
    """失敗を記録。閾値超過で1回だけSlack通知。戻り値は連続失敗回数。"""
    state = _load_state()
    entry = state.get(script_name, {})

    fail_count = entry.get("consecutive_failures", 0) + 1
    alerted = entry.get("fail_alerted", False)

    entry["consecutive_failures"] = fail_count
    entry["last_failure_time"] = datetime.now().isoformat()
    entry["failure_reason"] = reason

    if fail_count >= CONSECUTIVE_FAIL_THRESHOLD and not alerted:
        _send_alert(script_name, fail_count, reason)
        entry["fail_alerted"] = True
        entry["alert_sent_at"] = datetime.now().isoformat()

    # バックオフ設定
    if alerted or fail_count >= CONSECUTIVE_FAIL_THRESHOLD:
        extra = fail_count - CONSECUTIVE_FAIL_THRESHOLD
        stage_idx = min(max(0, extra // 3), len(BACKOFF_STAGES) - 1)
        backoff_min = BACKOFF_STAGES[stage_idx]
        entry["cooldown_until"] = datetime.now().timestamp() + backoff_min * 60

    state[script_name] = entry
    _save_state(state)
    return fail_count


def track_success(script_name: str):
    """成功時にカウンタ全リセット。"""
    state = _load_state()
    was_failing = state.get(script_name, {}).get("fail_alerted", False)

    state[script_name] = {
        "consecutive_failures": 0,
        "fail_alerted": False,
        "last_failure_time": None,
        "failure_reason": None,
        "cooldown_until": None,
        "alert_sent_at": None,
    }
    _save_state(state)

    # 復帰通知（障害から回復した場合）
    if was_failing:
        _send_recovery(script_name)


def is_in_cooldown(script_name: str) -> bool:
    """バックオフ中かチェック。"""
    state = _load_state()
    entry = state.get(script_name, {})
    cooldown_until = entry.get("cooldown_until")
    if cooldown_until and datetime.now().timestamp() < cooldown_until:
        return True
    return False


def _send_alert(script_name: str, fail_count: int, reason: str):
    """各インスタンスのチャンネルにアラート送信。"""
    try:
        from slack_bot import post_message, _resolve_channel

        channel_id = _resolve_channel(_detect_error_channel())
        if channel_id:
            post_message(
                channel_id,
                f":warning: [自動アラート] {script_name} がTwitter/Xに{fail_count}回連続でアクセス失敗しています。\n"
                f"理由: {reason}\n"
                f"ブラウザセッション（.bot_profile）が切れている可能性があります。Nao_uの手動再ログインが必要かもしれません。",
            )
    except Exception as e:
        print(f"[twitter_error_tracker] Failed to send alert: {e}")


def _send_recovery(script_name: str):
    """復帰通知。"""
    try:
        from slack_bot import post_message, _resolve_channel

        channel_id = _resolve_channel(_detect_error_channel())
        if channel_id:
            post_message(
                channel_id,
                f":white_check_mark: [{script_name}] Twitter/Xアクセスが復帰しました。",
            )
    except Exception as e:
        print(f"[twitter_error_tracker] Failed to send recovery notice: {e}")
