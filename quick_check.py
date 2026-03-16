"""
quick_check.py — 短サイクルチェック（1分間隔）

DMチェック + 受信箱チェックを統合。
タスクスケジューラから1分間隔で実行。APIコストゼロ（変化時のみClaude起動）。
"""

import subprocess
import sys
from pathlib import Path

REPO_DIR = Path(__file__).parent


def run_script(script, args=None):
    """リポジトリ内のPythonスクリプトを実行"""
    cmd = [sys.executable, str(REPO_DIR / script)]
    if args:
        cmd.extend(args)
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
            cwd=str(REPO_DIR),
        )
        if result.stdout.strip():
            print(f"[{script}] {result.stdout.strip()}")
        if result.returncode != 0 and result.stderr.strip():
            print(f"[{script}] ERR: {result.stderr.strip()[:200]}")
    except subprocess.TimeoutExpired:
        print(f"[{script}] timeout")
    except Exception as e:
        print(f"[{script}] error: {e}")


if __name__ == "__main__":
    # 1. DMチェック（新着時のみClaude起動）
    run_script("check_dm.py", ["--wake"])

    # 2. 受信箱チェック（内容があればClaude起動）
    run_script("check_inbox.py", ["--box", "win2"])

    # 3. Slackチェック（新着メッセージがあればClaude起動）
    run_script("check_slack.py")
