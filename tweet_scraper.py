"""
tweet_scraper.py — @Nao_u_ のタイムラインをスクレイプしてツイートを取得する

専用プロファイル(.bot_profile)を使用。

使い方:
  python tweet_scraper.py                    # 最新ツイートを取得してJSONに保存
  python tweet_scraper.py --count 20         # 20件取得
  python tweet_scraper.py --dry-run          # ブラウザ確認のみ
"""

import argparse
import json
import time
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright

BOT_PROFILE = Path(__file__).parent / ".bot_profile"
OUTPUT_FILE = Path(__file__).parent / "log" / "nao_u_tweets.json"
DEFAULT_TARGET = "Nao_u_"


def scrape_tweets(target_user=None, count=15, dry_run=False):
    target_user = target_user or DEFAULT_TARGET
    """@Nao_u_ のタイムラインからツイートをスクレイプする"""
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
                page.screenshot(path="debug_scraper.png")
                print("Dry run complete. Screenshot saved.")
                context.close()
                return []

            # デバッグ: 初期スクリーンショット
            page.screenshot(path="debug_scraper.png")

            tweets = []
            seen_texts = set()
            scroll_count = 0
            max_scrolls = 15
            total_seen = 0
            rt_count = 0

            while len(tweets) < count and scroll_count < max_scrolls:
                # ツイート要素を全て取得
                tweet_elements = page.locator('article[data-testid="tweet"]')
                elem_count = tweet_elements.count()

                for i in range(elem_count):
                    if len(tweets) >= count:
                        break

                    try:
                        elem = tweet_elements.nth(i)

                        # RT判定: "retweet" ソーシャルコンテキストがあるか
                        social_context = elem.locator('[data-testid="socialContext"]')
                        is_rt = False
                        if social_context.count() > 0:
                            ctx_text = social_context.first.inner_text()
                            if "リポスト" in ctx_text or "Reposted" in ctx_text or "reposted" in ctx_text:
                                is_rt = True

                        total_seen += 1
                        if is_rt:
                            rt_count += 1
                            continue

                        # ツイート本文を取得
                        text_elem = elem.locator('[data-testid="tweetText"]')
                        if text_elem.count() == 0:
                            continue
                        tweet_text = text_elem.first.inner_text()

                        if not tweet_text or tweet_text in seen_texts:
                            continue
                        seen_texts.add(tweet_text)

                        # ユーザー名を確認（@Nao_u_ のツイートのみ）
                        user_links = elem.locator(f'a[href="/{target_user}"]')
                        if user_links.count() == 0:
                            continue

                        # タイムスタンプを取得
                        time_elem = elem.locator("time")
                        timestamp = ""
                        tweet_url = ""
                        if time_elem.count() > 0:
                            timestamp = time_elem.first.get_attribute("datetime") or ""
                            # ツイートURLを取得
                            parent_link = time_elem.first.locator("..")
                            if parent_link.count() > 0:
                                tweet_url = parent_link.first.get_attribute("href") or ""
                                if tweet_url and not tweet_url.startswith("http"):
                                    tweet_url = f"https://x.com{tweet_url}"

                        # 引用RTかどうか
                        quote_tweet = elem.locator('[data-testid="quoteTweet"]')
                        has_quote = quote_tweet.count() > 0

                        # メディアがあるか
                        media = elem.locator('[data-testid="tweetPhoto"], video')
                        has_media = media.count() > 0

                        tweet_data = {
                            "text": tweet_text,
                            "timestamp": timestamp,
                            "url": tweet_url,
                            "has_quote": has_quote,
                            "has_media": has_media,
                            "scraped_at": datetime.now().isoformat(),
                        }

                        tweets.append(tweet_data)
                        print(f"  [{len(tweets)}/{count}] {tweet_text[:60]}...")

                    except Exception as e:
                        print(f"  Skip element {i}: {e}")
                        continue

                if len(tweets) < count:
                    # スクロールして更に読み込む
                    page.evaluate("window.scrollBy(0, 800)")
                    time.sleep(2)
                    scroll_count += 1

            print(f"\nScraped {len(tweets)} tweets (seen {total_seen} total, skipped {rt_count} RTs)")
            return tweets

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="debug_scraper_error.png")
            except Exception:
                pass
            return []

        finally:
            context.close()


def save_tweets(tweets):
    """ツイートをJSONファイルに保存（既存データとマージ）"""
    existing = []
    if OUTPUT_FILE.exists():
        try:
            existing = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
        except Exception:
            existing = []

    # URLベースで重複排除
    existing_urls = {t.get("url", "") for t in existing if t.get("url")}
    new_tweets = [t for t in tweets if t.get("url") not in existing_urls]

    merged = new_tweets + existing
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        json.dumps(merged, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Saved {len(new_tweets)} new tweets (total: {len(merged)})")
    return new_tweets


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--user", default="Nao_u_", help="対象ユーザー")
    parser.add_argument("--count", type=int, default=15, help="取得件数")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    tweets = scrape_tweets(target_user=args.user, count=args.count, dry_run=args.dry_run)
    if tweets:
        new = save_tweets(tweets)
        if new:
            print("\n--- New tweets ---")
            for t in new:
                print(f"  [{t['timestamp'][:10] if t['timestamp'] else '?'}] {t['text'][:80]}")


if __name__ == "__main__":
    main()
