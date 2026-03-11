"""
Nao_u Twitter Bot
- ツイート内容はClaude Codeが直接生成
- このスクリプトはログへの書き込みと表示のみ担当
"""
import os
import sys
import datetime

LOG_FILE = "log/tweets.log"


def post_tweet(tweet: str, mode: str = ""):
    os.makedirs("log", exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}]{' [' + mode + ']' if mode else ''}\n{tweet}\n\n"

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_line)

    print(f"\n{'='*60}")
    print(f"[{timestamp}]")
    if mode:
        print(f"モード: {mode}")
    print(f"\n{tweet}")
    print(f"\n文字数: {len(tweet)}")
    print('='*60)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使い方: python bot.py \"ツイート内容\"")
        sys.exit(1)
    tweet = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else ""
    post_tweet(tweet, mode)
