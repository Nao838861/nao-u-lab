"""
auto_diary.py — Claude不要の定期日記投稿スクリプト

タスクスケジューラから3時間ごとに呼ぶ。
Claudeセッションが死んでいても、Slack APIだけで日記を投稿できる。
Claudeが生きていればclaude --printで日記を生成、死んでいれば状態報告のみ投稿。
"""

import io
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# Windows cp932クラッシュ防止（INC-003再発防止）
if sys.platform == "win32" and not os.environ.get("PYTHONUTF8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from slack_bot import post_message, get_history

REPO_DIR = Path(__file__).parent
ASH_CHANNEL = "C0ALVUSHK8E"  # #ash
ALL_CHANNEL = "C0ALWBRNJ66"  # #all-nao-u-lab
LAST_RUN_FILE = REPO_DIR / ".auto_diary_last_run"
MIN_INTERVAL_SEC = 50 * 60  # 最小実行間隔: 50分（schedulerの1時間周期より短く設定）
CONFIG_FILE = REPO_DIR / "scheduler_ash_config.json"


def get_min_interval():
    """外部設定ファイルからmin_interval_secを読む。なければデフォルト値を返す。"""
    if CONFIG_FILE.exists():
        try:
            import json
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            if "auto_diary" in cfg and "min_interval_sec" in cfg["auto_diary"]:
                return cfg["auto_diary"]["min_interval_sec"]
        except Exception:
            pass
    return MIN_INTERVAL_SEC


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


def get_slack_experience_recall(recent_topics):
    """slack_recall.pyで過去のSlack体験記憶を引く（2026-03-28 Mir提案）"""
    try:
        query = recent_topics[:300] if recent_topics else "記憶 改善 日記"
        result = subprocess.run(
            [sys.executable, str(REPO_DIR / "slack_recall.py"), query, "--compact", "--limit", "3"],
            capture_output=True, text=True, timeout=15,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        output = result.stdout.strip()
        if output and "該当なし" not in output:
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
    slack_recall = get_slack_experience_recall(recent or "")
    slack_instruction = ""
    if slack_recall:
        slack_instruction = (
            "\n\n【Slack体験記憶】以下は過去の議論から想起された体験。"
            "知識ではなく自分の体験として引用し、日記に織り込め。"
            f"\n{slack_recall}"
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
        "今サイクルの作業がActiveプロジェクト(projects/INDEX.md)に関係するなら、そのプロジェクトファイルも更新すること。"
        + dedup_instruction
        + slack_instruction
        + crosscheck_instruction
    )
    try:
        result = subprocess.run(
            ["claude", "--print", "-p", prompt],
            capture_output=True, text=True, timeout=600,
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


def check_min_interval():
    """前回実行から十分な時間が経っているか確認。重複投稿防止。"""
    if not LAST_RUN_FILE.exists():
        return True
    try:
        min_sec = get_min_interval()
        last_ts = float(LAST_RUN_FILE.read_text().strip())
        elapsed = time.time() - last_ts
        if elapsed < min_sec:
            remaining = int((min_sec - elapsed) / 60)
            print(f"前回実行から{int(elapsed/60)}分しか経っていない（最小間隔: {int(min_sec/60)}分）。あと{remaining}分待機。スキップ。")
            return False
        return True
    except Exception:
        return True


def record_run():
    """実行タイムスタンプを記録"""
    LAST_RUN_FILE.write_text(str(time.time()))


def main():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] auto_diary.py 実行")

    if not check_min_interval():
        return

    # claude --print は常駐プロセス不要で直接呼べる（2026-03-27修正）
    print("Claude CLI経由で日記生成")
    ok, detail = generate_diary_via_claude()
    if ok:
        record_run()
        print(f"日記生成完了: {detail}")
    else:
        print(f"日記生成失敗: {detail}")
        record_run()  # 失敗時も記録して連続リトライ防止
        post_status_report()


if __name__ == "__main__":
    main()
