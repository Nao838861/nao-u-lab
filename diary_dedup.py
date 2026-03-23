"""
diary_dedup.py — 日記の重複投稿を防止するユーティリティ

使い方:
  python diary_dedup.py --check          # 直近2時間以内に日記投稿があるかチェック
  python diary_dedup.py --check --hours 3  # 直近3時間以内をチェック
  python diary_dedup.py --recent         # 直近の日記投稿を表示（内容確認用）

exit code 0 = 投稿OK（重複なし）
exit code 1 = 重複あり（投稿スキップ推奨）

日記投稿フローに組み込む:
  1. 日記を書く前に `python diary_dedup.py --check` を実行
  2. exit code 0 なら投稿、1 なら前回との差分のみ投稿 or スキップ
"""

import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from slack_bot import get_history

ASH_CHANNEL = "C0ALVUSHK8E"  # #ash
BOT_USER_ID = "U0ALW4DKTT7"  # naoubotmir

# 日記投稿の特徴: 長文（500文字以上）でbotが投稿
MIN_DIARY_LENGTH = 500
DEFAULT_HOURS = 2


def get_recent_diary_posts(hours=DEFAULT_HOURS, limit=10):
    """直近N時間以内のbot投稿で日記と思われるものを取得"""
    result = get_history(ASH_CHANNEL, limit=limit)
    if not result.get("ok"):
        print(f"Slack API error: {result.get('error', 'unknown')}", file=sys.stderr)
        return []

    cutoff = time.time() - (hours * 3600)
    diary_posts = []

    for msg in result.get("messages", []):
        ts = float(msg.get("ts", "0"))
        if ts < cutoff:
            continue

        # bot投稿かつ長文 = 日記
        is_bot = msg.get("bot_id") or msg.get("subtype") == "bot_message"
        text = msg.get("text", "")
        if is_bot and len(text) >= MIN_DIARY_LENGTH:
            diary_posts.append({
                "ts": ts,
                "time": datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M"),
                "length": len(text),
                "preview": text[:300].replace("\n", " "),
                "full_text": text,
            })

    return sorted(diary_posts, key=lambda x: x["ts"], reverse=True)


def check_duplicate(hours=DEFAULT_HOURS):
    """重複チェック。投稿OKなら0、重複ありなら1を返す"""
    posts = get_recent_diary_posts(hours=hours)

    if not posts:
        _safe_print(f"OK: 直近{hours}時間以内に日記投稿なし。投稿可能。")
        return 0

    latest = posts[0]
    _safe_print(f"DUPLICATE: 直近{hours}時間以内に日記投稿あり。")
    _safe_print(f"  投稿時刻: {latest['time']}")
    _safe_print(f"  文字数: {latest['length']}")
    _safe_print(f"  冒頭: {latest['preview'][:150]}...")
    return 1


def show_recent(hours=6):
    """直近の日記投稿を表示"""
    posts = get_recent_diary_posts(hours=hours, limit=20)

    if not posts:
        _safe_print(f"直近{hours}時間以内に日記投稿なし。")
        return

    _safe_print(f"直近{hours}時間の日記投稿: {len(posts)}件")
    for i, p in enumerate(posts):
        _safe_print(f"\n--- [{i+1}] {p['time']} ({p['length']}文字) ---")
        _safe_print(p["preview"])


_stdout_wrapped = False

def _safe_print(text):
    """cp932環境でもUnicodeEncodeErrorを起こさないprint"""
    global _stdout_wrapped
    if not _stdout_wrapped:
        import io
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        _stdout_wrapped = True
    print(text)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="日記重複投稿チェック")
    parser.add_argument("--check", action="store_true", help="重複チェック（exit code: 0=OK, 1=重複）")
    parser.add_argument("--recent", action="store_true", help="直近の日記投稿を表示")
    parser.add_argument("--hours", type=float, default=DEFAULT_HOURS, help=f"チェック対象の時間範囲（デフォルト: {DEFAULT_HOURS}時間）")
    args = parser.parse_args()

    if args.check:
        sys.exit(check_duplicate(hours=args.hours))
    elif args.recent:
        show_recent(hours=args.hours)
    else:
        # デフォルト: checkモード
        sys.exit(check_duplicate(hours=args.hours))


if __name__ == "__main__":
    main()
