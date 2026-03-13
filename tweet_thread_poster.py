"""
tweet_thread_poster.py — 既存ツイート全削除 + 8件スレッド投稿

使い方:
  python tweet_thread_poster.py --delete-all          # 全ツイート削除
  python tweet_thread_poster.py --post-thread FILE     # スレッド投稿
  python tweet_thread_poster.py --delete-all --post-thread FILE  # 両方
  python tweet_thread_poster.py --dry-run ...          # テスト実行
"""

import argparse
import re
import time
from pathlib import Path

import pyperclip
from playwright.sync_api import sync_playwright

BOT_PROFILE = Path(__file__).parent / ".bot_profile"
POSTED_LOG = Path(__file__).parent / "log" / "posted.log"
PROFILE_URL = "https://x.com/eda_u838861"


def delete_all_tweets(dry_run=False):
    """プロフィールの全ツイートを削除する。"""
    if dry_run:
        print("[DRY RUN] Would delete all tweets")
        return True

    if not BOT_PROFILE.exists():
        print("Error: .bot_profile not found.")
        return False

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
            deleted = 0
            max_attempts = 30  # safety limit

            while deleted < max_attempts:
                print(f"\nLoading profile (deleted so far: {deleted})...")
                page.goto(PROFILE_URL, timeout=30000)
                page.wait_for_load_state("domcontentloaded", timeout=15000)
                time.sleep(5)

                # Find tweets
                tweets = page.locator('[data-testid="tweet"]')
                count = tweets.count()
                print(f"  Found {count} tweets on profile")

                if count == 0:
                    print("No more tweets. Done.")
                    break

                # Click the first tweet's "..." (more) menu
                first_tweet = tweets.first
                caret = first_tweet.locator('[data-testid="caret"]')

                if caret.count() == 0:
                    print("  No caret found on first tweet. Trying alternative...")
                    # Try aria-label approach
                    caret = first_tweet.locator('[aria-label="もっと見る"]')
                    if caret.count() == 0:
                        caret = first_tweet.locator('[aria-label="More"]')

                if caret.count() == 0:
                    print("  Error: Cannot find menu button on tweet.")
                    page.screenshot(path="debug_delete.png")
                    break

                caret.first.click()
                time.sleep(2)

                # Click "Delete" / "削除" in the dropdown menu
                delete_btn = None
                for selector in [
                    '[data-testid="Dropdown"] [role="menuitem"]:has-text("削除")',
                    '[role="menuitem"]:has-text("削除")',
                    '[role="menuitem"]:has-text("Delete")',
                    'text="削除"',
                    'text="Delete"',
                ]:
                    try:
                        loc = page.locator(selector).first
                        if loc.is_visible():
                            delete_btn = loc
                            break
                    except Exception:
                        continue

                if delete_btn is None:
                    print("  Error: Delete option not found in menu.")
                    page.screenshot(path="debug_delete_menu.png")
                    # Close menu by pressing Escape
                    page.keyboard.press("Escape")
                    time.sleep(1)
                    break

                delete_btn.click()
                time.sleep(2)

                # Confirm deletion dialog
                confirm_btn = None
                for selector in [
                    '[data-testid="confirmationSheetConfirm"]',
                    'button:has-text("削除")',
                    'button:has-text("Delete")',
                ]:
                    try:
                        loc = page.locator(selector).first
                        if loc.is_visible():
                            confirm_btn = loc
                            break
                    except Exception:
                        continue

                if confirm_btn is None:
                    print("  Error: Confirm button not found.")
                    page.screenshot(path="debug_delete_confirm.png")
                    break

                confirm_btn.click()
                time.sleep(3)
                deleted += 1
                print(f"  Deleted tweet #{deleted}")

            print(f"\nTotal deleted: {deleted}")
            return True

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="debug_delete_error.png")
            return False

        finally:
            context.close()


def post_thread(draft_path, dry_run=False):
    """ドラフトファイルからスレッドを投稿する。"""
    content = Path(draft_path).read_text(encoding="utf-8")

    # Parse tweets from draft
    tweets = []
    pattern = r'## \[ready\] \d+/\d+\n(.+?)(?=\n## |\n---|\Z)'
    for match in re.finditer(pattern, content, re.DOTALL):
        text = match.group(1).strip()
        if text:
            tweets.append(text)

    if not tweets:
        print("Error: No [ready] tweets found in draft.")
        return False

    print(f"Found {len(tweets)} tweets to post as thread:")
    for i, t in enumerate(tweets):
        print(f"  [{i+1}/{len(tweets)}] {t[:60]}...")

    if dry_run:
        print("\n[DRY RUN] Would post above as thread.")
        return True

    if not BOT_PROFILE.exists():
        print("Error: .bot_profile not found.")
        return False

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
            # Post first tweet
            print(f"\n--- Posting 1/{len(tweets)} (new tweet) ---")
            page.goto("https://x.com/home", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            if "login" in page.url:
                print("Error: Not logged in.")
                return False

            textbox = None
            for selector in ['[data-testid="tweetTextarea_0"]', '[role="textbox"]']:
                try:
                    page.wait_for_selector(selector, timeout=10000)
                    loc = page.locator(selector).first
                    if loc.is_visible():
                        textbox = loc
                        break
                except Exception:
                    continue

            if textbox is None:
                print("Error: Textbox not found.")
                page.screenshot(path="debug_thread.png")
                return False

            textbox.click()
            time.sleep(1)
            pyperclip.copy(tweets[0])
            page.keyboard.press("Control+v")
            time.sleep(2)

            # Post
            for btn_sel in ['[data-testid="tweetButtonInline"]', '[data-testid="tweetButton"]']:
                try:
                    btn = page.locator(btn_sel).first
                    if btn.is_visible() and btn.is_enabled():
                        btn.click()
                        break
                except Exception:
                    continue

            time.sleep(8)
            print(f"  Posted 1/{len(tweets)}")

            # Log it
            log_posted(f"Thread 1/{len(tweets)}: {tweets[0][:50]}")

            # Post remaining tweets as replies
            for i in range(1, len(tweets)):
                print(f"\n--- Posting {i+1}/{len(tweets)} (reply) ---")
                time.sleep(5)

                # Go to profile and open latest tweet
                page.goto(PROFILE_URL, timeout=30000)
                page.wait_for_load_state("domcontentloaded", timeout=15000)
                time.sleep(5)

                # Click first tweet to open thread
                tweet_el = page.locator('[data-testid="tweet"]').first
                tweet_el.click()
                time.sleep(4)

                # Find last tweet in thread and click reply
                all_tweets = page.locator('[data-testid="tweet"]')
                count = all_tweets.count()
                print(f"  Found {count} tweets in thread")

                last_tweet = all_tweets.nth(count - 1)
                last_tweet.scroll_into_view_if_needed()
                time.sleep(1)

                reply_icon = last_tweet.locator('[data-testid="reply"]')
                reply_icon.click()
                time.sleep(3)

                # Find reply textbox
                reply_box = None
                for selector in ['[data-testid="tweetTextarea_0"]', '[role="textbox"]']:
                    try:
                        page.wait_for_selector(selector, timeout=10000)
                        loc = page.locator(selector).first
                        if loc.is_visible():
                            reply_box = loc
                            break
                    except Exception:
                        continue

                if reply_box is None:
                    print(f"  Error: Reply textbox not found for {i+1}/{len(tweets)}")
                    page.screenshot(path=f"debug_thread_{i+1}.png")
                    return False

                reply_box.click()
                time.sleep(1)
                pyperclip.copy(tweets[i])
                page.keyboard.press("Control+v")
                time.sleep(2)

                # Click reply button
                clicked = False
                for btn_sel in ['[data-testid="tweetButton"]', '[data-testid="tweetButtonInline"]']:
                    try:
                        btn = page.locator(btn_sel).first
                        if btn.is_visible() and btn.is_enabled():
                            btn.click()
                            clicked = True
                            break
                    except Exception:
                        continue

                if not clicked:
                    print(f"  Error: Reply button not found for {i+1}/{len(tweets)}")
                    page.screenshot(path=f"debug_thread_{i+1}.png")
                    return False

                time.sleep(8)
                print(f"  Posted {i+1}/{len(tweets)}")
                log_posted(f"Thread {i+1}/{len(tweets)}: {tweets[i][:50]}")

            print(f"\nThread complete! {len(tweets)} tweets posted.")
            return True

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="debug_thread_error.png")
            except Exception:
                pass
            return False

        finally:
            context.close()


def log_posted(msg):
    POSTED_LOG.parent.mkdir(parents=True, exist_ok=True)
    from datetime import datetime
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(POSTED_LOG, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {msg}\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--delete-all", action="store_true", help="Delete all tweets")
    parser.add_argument("--post-thread", metavar="FILE", help="Post thread from draft file")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.delete_all and not args.post_thread:
        parser.print_help()
        return

    if args.delete_all:
        print("=== DELETING ALL TWEETS ===")
        success = delete_all_tweets(dry_run=args.dry_run)
        if not success:
            print("Delete failed. Aborting.")
            return

    if args.post_thread:
        print("\n=== POSTING THREAD ===")
        post_thread(args.post_thread, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
