"""watchdog_check.py — スケジューラ生存確認+サーキットブレーカー

watchdog_win2.bat / watchdog_log.bat から呼ばれる。
- スケジューラが動いていなければ再起動
- 30分以内に3回以上再起動していたら停止+Slack通知（サーキットブレーカー）

使い方:
  python watchdog_check.py ash    # scheduler_ash.py を監視
  python watchdog_check.py log    # scheduler_log.py を監視
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

REPO_DIR = Path(__file__).parent
CIRCUIT_BREAKER_FILE = REPO_DIR / ".watchdog_restarts.json"
MAX_RESTARTS = 3          # この回数を超えたらブレーカー発動
WINDOW_SEC = 30 * 60      # 30分間
COOLDOWN_SEC = 60 * 60    # ブレーカー発動後1時間は再起動しない


def is_scheduler_running(instance):
    """scheduler_{instance}.pyのプロセスが存在するか確認"""
    script_name = f"scheduler_{instance}"
    try:
        result = subprocess.run(
            ["powershell", "-Command",
             f"if (Get-CimInstance Win32_Process -Filter \"Name='pythonw.exe' AND CommandLine LIKE '%{script_name}%'\") {{ exit 0 }} else {{ exit 1 }}"],
            capture_output=True, timeout=10,
        )
        return result.returncode == 0
    except Exception:
        return False


def load_restart_history():
    if CIRCUIT_BREAKER_FILE.exists():
        try:
            return json.loads(CIRCUIT_BREAKER_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"restarts": [], "tripped_until": 0}


def save_restart_history(data):
    CIRCUIT_BREAKER_FILE.write_text(
        json.dumps(data, ensure_ascii=False), encoding="utf-8"
    )


def check_circuit_breaker(history):
    """サーキットブレーカーの状態を確認。Trueなら再起動OK、Falseなら停止中。"""
    now = time.time()

    # ブレーカー発動中（クールダウン期間）
    if now < history.get("tripped_until", 0):
        remaining = int((history["tripped_until"] - now) / 60)
        print(f"Circuit breaker active. {remaining}min until reset.")
        return False

    # 古い記録を除去
    recent = [t for t in history.get("restarts", []) if now - t < WINDOW_SEC]
    history["restarts"] = recent

    if len(recent) >= MAX_RESTARTS:
        # ブレーカー発動
        history["tripped_until"] = now + COOLDOWN_SEC
        save_restart_history(history)
        print(f"Circuit breaker TRIPPED: {len(recent)} restarts in {WINDOW_SEC//60}min.")
        return False

    return True


def record_restart(history):
    history["restarts"].append(time.time())
    # ブレーカーリセット（正常再起動できたので）
    history["tripped_until"] = 0
    save_restart_history(history)


def alert_slack(instance):
    """サーキットブレーカー発動をSlackに通知"""
    try:
        sys.path.insert(0, str(REPO_DIR))
        from slack_bot import post_message, _resolve_channel
        ch = _resolve_channel("all-nao-u-lab")
        msg = (
            f"[watchdog circuit breaker] {instance}のスケジューラが"
            f"{WINDOW_SEC//60}分間に{MAX_RESTARTS}回以上再起動しました。"
            f"暴走防止のため{COOLDOWN_SEC//60}分間再起動を停止します。"
            f"手動確認が必要です。"
        )
        post_message(ch, msg)
    except Exception as e:
        print(f"Slack alert failed: {e}")


def start_scheduler(instance):
    script = f"scheduler_{instance}.py"
    pid_file = REPO_DIR / f".scheduler_{instance}.pid"
    if pid_file.exists():
        pid_file.unlink(missing_ok=True)
    subprocess.Popen(
        ["pythonw", script],
        cwd=str(REPO_DIR),
        creationflags=0x00000008,  # DETACHED_PROCESS
    )
    print(f"Started {script}.")


def main():
    if len(sys.argv) < 2:
        print("Usage: python watchdog_check.py [ash|log]")
        sys.exit(1)

    instance = sys.argv[1]  # "ash" or "log"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if is_scheduler_running(instance):
        print(f"[{now_str}] scheduler_{instance}.py is running. OK.")
        return

    print(f"[{now_str}] scheduler_{instance}.py not running.")

    history = load_restart_history()
    if not check_circuit_breaker(history):
        alert_slack(instance)
        print("Restart blocked by circuit breaker.")
        return

    record_restart(history)
    start_scheduler(instance)
    print(f"[{now_str}] Restarted scheduler_{instance}.py.")


if __name__ == "__main__":
    main()
