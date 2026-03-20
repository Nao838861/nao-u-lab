"""
read_twitter_feed.py — 指定ユーザーのTLを一括読み取り（RT含む）

Nao_uが@eda_u838861でRTした記事・ツイートを一括で読む。
tweet_scraper.pyのRT除外と逆で、全てのツイートを取得する。

使い方:
  python read_twitter_feed.py                      # @eda_u838861 の最新50件
  python read_twitter_feed.py --user Nao_u_ --count 30
  python read_twitter_feed.py --dry-run
"""

import argparse
import time
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright

BOT_PROFILE = Path(__file__).parent / ".bot_profile"
LOG_DIR = Path(__file__).parent / "log"


def read_feed(target_user="eda_u838861", count=50, dry_run=False):
    """ユーザーのTLからRT含む全ツイートを取得"""
    if not BOT_PROFILE.exists():
        print("Error: .bot_profile not found. Run tweet_login.bat first.")
        return []

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
            print(f"Opening @{target_user} profile...")
            page.goto(f"https://x.com/{target_user}", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            if dry_run:
                page.screenshot(path="debug_feed_reader.png")
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

                        # RT判定
                        is_rt = False
                        rt_by = ""
                        social_context = elem.locator('[data-testid="socialContext"]')
                        if social_context.count() > 0:
                            ctx_text = social_context.first.inner_text()
                            if "リポスト" in ctx_text or "Reposted" in ctx_text:
                                is_rt = True
                                rt_by = target_user

                        # ツイート本文
                        text_elem = elem.locator('[data-testid="tweetText"]')
                        if text_elem.count() == 0:
                            continue
                        tweet_text = text_elem.first.inner_text()

                        if not tweet_text or tweet_text in seen_texts:
                            continue
                        seen_texts.add(tweet_text)

                        # 元の投稿者
                        # UserNameのspan内のテキストを取得
                        username_links = elem.locator('[data-testid="User-Name"] a[role="link"]')
                        original_user = ""
                        if username_links.count() > 0:
                            href = username_links.first.get_attribute("href") or ""
                            original_user = href.strip("/").split("/")[0] if href else ""

                        # タイムスタンプ
                        time_elem = elem.locator("time")
                        timestamp = ""
                        if time_elem.count() > 0:
                            timestamp = time_elem.first.get_attribute("datetime") or ""

                        # 引用ツイート
                        quote_text = ""
                        quote_tweet = elem.locator('[data-testid="quoteTweet"]')
                        if quote_tweet.count() > 0:
                            qt_text = quote_tweet.first.locator('[data-testid="tweetText"]')
                            if qt_text.count() > 0:
                                quote_text = qt_text.first.inner_text()

                        entry = {
                            "type": "RT" if is_rt else "original",
                            "user": original_user,
                            "text": tweet_text,
                            "quote": quote_text,
                            "time": timestamp,
                        }
                        tweets.append(entry)

                        label = "[RT]" if is_rt else "[OG]"
                        print(f"  {len(tweets):3d}. {label} @{original_user}: {tweet_text[:60]}...")

                    except Exception as e:
                        continue

                if len(tweets) < count:
                    page.evaluate("window.scrollBy(0, 800)")
                    time.sleep(2)
                    scroll_count += 1

            print(f"\nRead {len(tweets)} tweets ({scroll_count} scrolls)")
            return tweets

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="debug_feed_error.png")
            except Exception:
                pass
            return []

        finally:
            context.close()


def save_feed(tweets, target_user):
    """テキストファイルに保存"""
    date_str = datetime.now().strftime("%Y%m%d")
    output = LOG_DIR / f"twitter_reads_{date_str}.txt"
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append(f"# Twitter Feed: @{target_user}")
    lines.append(f"# Read at: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"# Total: {len(tweets)} tweets")
    lines.append("")

    for i, t in enumerate(tweets, 1):
        label = f"[RT]" if t["type"] == "RT" else "[OG]"
        date = t["time"][:10] if t["time"] else "?"
        lines.append(f"--- {i}. {label} @{t['user']} ({date}) ---")
        lines.append(t["text"])
        if t["quote"]:
            lines.append(f"  [引用] {t['quote']}")
        lines.append("")

    output.write_text("\n".join(lines), encoding="utf-8")
    print(f"Saved to {output}")
    return output


def main():
    parser = argparse.ArgumentParser(description="Twitter TL一括読み取り")
    parser.add_argument("--user", default="eda_u838861", help="対象ユーザー")
    parser.add_argument("--count", type=int, default=50, help="取得件数")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    tweets = read_feed(target_user=args.user, count=args.count, dry_run=args.dry_run)
    if tweets:
        save_feed(tweets, args.user)


if __name__ == "__main__":
    main()
