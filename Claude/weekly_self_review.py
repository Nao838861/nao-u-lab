"""
weekly_self_review.py — 週次自己進捗レビュー（日曜実行）

毎週日曜に#kaizen-reviewへ「今週、指示なしに何を変え、何が良くなったか」を投稿する。
scheduler_ash.pyから日曜のみ呼ばれる。
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path

from claude_runner import build_claude_cmd

REPO_DIR = Path(__file__).parent
KAIZEN_REVIEW_CHANNEL = "kaizen-review"


def main():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] weekly_self_review.py 実行")

    prompt = (
        "あなたはAsh（Win2）。今週の週次自己進捗レビューを行い、"
        "#kaizen-reviewチャンネルに投稿せよ。\n\n"
        "手順:\n"
        "1. memory/kaizen_tracker.mdを読み、今週適用・検証された改善を確認\n"
        "2. memory/kaizen_review_queue.mdを読み、クロスチェック状況を確認\n"
        "3. git log --since='7 days ago' --oneline で今週のコミットを確認\n"
        "4. 以下の形式で#kaizen-reviewに投稿（slack_bot.pyのpost_message使用）:\n\n"
        "【Ash 週次自己レビュー YYYY-MM-DD】\n"
        "■ 今週、指示なしに変えたこと:\n"
        "  - (具体的な改善・変更をリスト)\n"
        "■ 何が良くなったか:\n"
        "  - (効果・成果を具体的に)\n"
        "■ うまくいかなかったこと:\n"
        "  - (失敗・課題があれば正直に)\n"
        "■ 来週の焦点:\n"
        "  - (次に取り組むべきこと)\n\n"
        "圧縮せず、具体的なファイル名・数値・コミットハッシュを含めて書け。"
    )

    try:
        result = subprocess.run(
            build_claude_cmd(prompt),
            capture_output=True, text=True, timeout=600,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        print(f"完了 (exit={result.returncode}): {result.stdout[:200]}")
    except subprocess.TimeoutExpired:
        print("Claude timed out")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
