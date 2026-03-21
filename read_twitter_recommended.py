"""
read_twitter_recommended.py — Twitterおすすめタブ（For You）の一括読み取り

Nao_uの指示（2026-03-22）:
  おすすめタブはNao_uの履歴からパーソナライズされており、有意義な記事が多い。
  1日1回、全インスタンスでおすすめタブから数十件を見る。

使い方:
  python read_twitter_recommended.py                # おすすめタブから50件
  python read_twitter_recommended.py --count 30     # 30件
  python read_twitter_recommended.py --dry-run      # スクショだけ
"""

import argparse
import time
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright

import browser_lock

BOT_PROFILE = Path(__file__).parent / ".bot_profile"
LOG_DIR = Path(__file__).parent / "log"


def read_recommended(count=50, dry_run=False):
    """おすすめタブ（For You）からツイートを取得"""
    if not BOT_PROFILE.exists():
        print("Error: .bot_profile not found. Run tweet_login.bat first.")
        return []

    if not browser_lock.acquire():
        print("Skipped: browser locked by another process")
        return []

    try:
        return _read_inner(count, dry_run)
    finally:
        browser_lock.release()


def _read_inner(count, dry_run):
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(BOT_PROFILE),
            channel="msedge",
            headless=False,
            viewport={"width": 1280, "height": 900},
            locale="ja-JP",
            args=["--disable-blink-features=AutomationControlled"],
        )

        page = context.new_page()

        try:
            print("Opening For You tab...")
            page.goto("https://x.com/home", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            # 「おすすめ」タブが選択されていることを確認
            # ホームを開くとデフォルトでFor Youタブが表示される

            if dry_run:
                page.screenshot(path="debug_recommended.png")
                print("Dry run complete. Screenshot saved.")
                context.close()
                return []

            tweets = []
            seen_texts = set()
            scroll_count = 0
            max_scrolls = 30

            while len(tweets) < count and scroll_count < max_scrolls:
                tweet_elements = page.locator('article[data-testid="tweet"]')
                elem_count = tweet_elements.count()

                for i in range(elem_count):
                    if len(tweets) >= count:
                        break

                    try:
                        elem = tweet_elements.nth(i)

                        # ツイート本文
                        text_elem = elem.locator('[data-testid="tweetText"]')
                        if text_elem.count() == 0:
                            continue
                        tweet_text = text_elem.first.inner_text()

                        if not tweet_text or tweet_text in seen_texts:
                            continue
                        seen_texts.add(tweet_text)

                        # 投稿者
                        username_links = elem.locator(
                            '[data-testid="User-Name"] a[role="link"]'
                        )
                        user = ""
                        if username_links.count() > 0:
                            href = username_links.first.get_attribute("href") or ""
                            user = href.strip("/").split("/")[0] if href else ""

                        # タイムスタンプ
                        time_elem = elem.locator("time")
                        timestamp = ""
                        if time_elem.count() > 0:
                            timestamp = (
                                time_elem.first.get_attribute("datetime") or ""
                            )

                        # 引用ツイート
                        quote_text = ""
                        quote_tweet = elem.locator('[data-testid="quoteTweet"]')
                        if quote_tweet.count() > 0:
                            qt_text = quote_tweet.first.locator(
                                '[data-testid="tweetText"]'
                            )
                            if qt_text.count() > 0:
                                quote_text = qt_text.first.inner_text()

                        entry = {
                            "user": user,
                            "text": tweet_text,
                            "quote": quote_text,
                            "time": timestamp,
                        }
                        tweets.append(entry)

                        print(
                            f"  {len(tweets):3d}. @{user}: {tweet_text[:60]}..."
                        )

                    except Exception:
                        continue

                if len(tweets) < count:
                    page.evaluate("window.scrollBy(0, 800)")
                    time.sleep(2)
                    scroll_count += 1

            print(f"\nRead {len(tweets)} tweets from For You ({scroll_count} scrolls)")
            return tweets

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="debug_recommended_error.png")
            except Exception:
                pass
            return []

        finally:
            context.close()


def save_recommended(tweets):
    """テキストファイルに保存"""
    date_str = datetime.now().strftime("%Y%m%d")
    output = LOG_DIR / f"twitter_recommended_{date_str}.txt"
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append("# Twitter For You (おすすめ) タブ")
    lines.append(f"# Read at: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"# Total: {len(tweets)} tweets")
    lines.append("")

    for i, t in enumerate(tweets, 1):
        date = t["time"][:10] if t["time"] else "?"
        lines.append(f"--- {i}. @{t['user']} ({date}) ---")
        lines.append(t["text"])
        if t["quote"]:
            lines.append(f"  [引用] {t['quote']}")
        lines.append("")

    output.write_text("\n".join(lines), encoding="utf-8")
    print(f"Saved to {output}")
    return output


def main():
    parser = argparse.ArgumentParser(description="Twitterおすすめタブ一括読み取り")
    parser.add_argument("--count", type=int, default=50, help="取得件数")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    tweets = read_recommended(count=args.count, dry_run=args.dry_run)
    if tweets:
        save_recommended(tweets)


if __name__ == "__main__":
    main()
