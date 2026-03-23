"""
auto_diary.py — Claude不要の定期日記投稿スクリプト

タスクスケジューラから3時間ごとに呼ぶ。
Claudeセッションが死んでいても、Slack APIだけで日記を投稿できる。
Claudeが生きていればclaude --printで日記を生成、死んでいれば状態報告のみ投稿。
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path

from slack_bot import post_message, get_history

REPO_DIR = Path(__file__).parent
ASH_CHANNEL = "C0ALVUSHK8E"  # #ash
ALL_CHANNEL = "C0ALWBRNJ66"  # #all-nao-u-lab


def is_claude_running():
    """Claudeプロセスが稼働中か確認"""
    try:
        result = subprocess.run(
            ["tasklist", "/FI", "IMAGENAME eq claude.exe"],
            capture_output=True, text=True, timeout=10,
        )
        return "claude.exe" in result.stdout.lower()
    except Exception:
        return False


def get_recent_diary_topics():
    """#ashの直近投稿からトピックを抽出し、重複防止に使う"""
    try:
        result = get_history(ASH_CHANNEL, limit=5)
        if not result.get("ok"):
            return ""
        summaries = []
        for msg in reversed(result.get("messages", [])):
            text = msg.get("text", "")
            # 最初の200文字を要約として取得
            summary = text[:200].replace("\n", " ")
            if summary:
                summaries.append(summary)
        if not summaries:
            return ""
        return "\n".join(f"- {s}" for s in summaries)
    except Exception:
        return ""


def get_kaizen_crosscheck_status():
    """Ashの未レビュークロスチェック項目を取得"""
    try:
        result = subprocess.run(
            [sys.executable, str(REPO_DIR / "check_kaizen_crosscheck.py"), "--who=Ash"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        output = result.stdout.strip()
        if "未レビュー項目" in output:
            return output
        return ""
    except Exception:
        return ""


def generate_diary_via_claude():
    """Claude CLIで日記を生成"""
    recent = get_recent_diary_topics()
    dedup_instruction = ""
    if recent:
        dedup_instruction = (
            "\n\n【重複回避】以下は#ashの直近投稿の冒頭。"
            "これらと同じトピック・同じ切り口で書くな。"
            "前回と違う視点、新しい気づき、または前回書いていないことを書け。"
            "同じ話題に触れる場合は必ず前回からの進展・変化を述べろ。"
            f"\n{recent}"
        )
    crosscheck = get_kaizen_crosscheck_status()
    crosscheck_instruction = ""
    if crosscheck:
        crosscheck_instruction = f"\n\n【クロスチェック】{crosscheck}\n上記の未レビュー項目をレビューし、memory/kaizen_tracker.mdのクロスチェック欄を更新せよ。"
    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認し、"
        "直近の活動を振り返って#ashチャンネルに投稿する長文の活動日記を書いて。"
        "slack_bot.pyのpost_message()でチャンネルC0ALVUSHK8Eに投稿して。"
        "圧縮せず具体的に、1500字以上で。"
        + dedup_instruction
        + crosscheck_instruction
    )
    try:
        result = subprocess.run(
            ["claude", "--print", "-p", prompt],
            capture_output=True, text=True, timeout=300,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        return True, result.stdout[:200]
    except subprocess.TimeoutExpired:
        return False, "Claude timed out"
    except Exception as e:
        return False, str(e)


def post_status_report():
    """Claudeが動けない時の最低限の状態報告"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    msg = f"[{now}] Win2（Ash）自動状態報告: Claudeセッション停止中。タスクスケジューラの外部監視は稼働中。Slack新着への返信はcheck_slack.py経由で対応可能。"
    post_message(ASH_CHANNEL, msg)


def main():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] auto_diary.py 実行")

    if is_claude_running():
        print("Claude稼働中 → Claude経由で日記生成")
        ok, detail = generate_diary_via_claude()
        if ok:
            print(f"日記生成完了: {detail}")
        else:
            print(f"日記生成失敗: {detail}")
            post_status_report()
    else:
        print("Claudeプロセスなし → 状態報告のみ投稿")
        post_status_report()


if __name__ == "__main__":
    main()
