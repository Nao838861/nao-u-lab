"""
tweet_poster.py — Playwrightを使ってX(Twitter)にツイートを投稿する

専用プロファイルを使用。初回は tweet_login.bat でログインが必要。

使い方:
  python tweet_poster.py "text"
  python tweet_poster.py --from-log log/tweets_win.log
  python tweet_poster.py --dry-run "test"
  python tweet_poster.py --list-unposted log/tweets_win.log
"""

import argparse
import json
import re
import time
from pathlib import Path

import pyperclip
from playwright.sync_api import sync_playwright

POSTED_LOG = Path(__file__).parent / "log" / "posted.log"
BOT_PROFILE = Path(__file__).parent / ".bot_profile"


def reply_to_latest(text, dry_run=False):
    """最新ツイートに返信する（スレッド作成用）。"""
    if dry_run:
        print(f"[DRY RUN reply] {text[:80]}...")
        return True

    if not BOT_PROFILE.exists():
        print("Error: .bot_profile not found. Run tweet_login.bat first.")
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
            # Go to profile and open thread
            print("Opening profile...")
            page.goto("https://x.com/eda_u838861", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            # Click first tweet to open thread view
            print("Opening thread...")
            tweet = page.locator('[data-testid="tweet"]').first
            tweet.click()
            time.sleep(4)

            # Find all tweets in thread, click reply icon on the LAST one
            print("Finding last tweet in thread...")
            all_tweets = page.locator('[data-testid="tweet"]')
            count = all_tweets.count()
            print(f"  Found {count} tweets in thread")

            # Scroll to and click reply icon on last tweet
            last_tweet = all_tweets.nth(count - 1)
            last_tweet.scroll_into_view_if_needed()
            time.sleep(1)

            # Click the reply icon (speech bubble) on the last tweet
            reply_icon = last_tweet.locator('[data-testid="reply"]')
            reply_icon.click()
            time.sleep(2)

            # A reply dialog should now be open
            print("Looking for reply textbox in dialog...")
            page.screenshot(path="debug_reply_dialog.png")

            textbox = None
            for selector in ['[data-testid="tweetTextarea_0"]', '[role="textbox"]']:
                try:
                    page.wait_for_selector(selector, timeout=10000)
                    loc = page.locator(selector).first
                    if loc.is_visible():
                        textbox = loc
                        print(f"  Found: {selector}")
                        break
                except Exception:
                    continue

            if textbox is None:
                print("Error: Reply textbox not found.")
                page.screenshot(path="debug_screenshot.png")
                return False

            # Input text
            print("Inputting text...")
            textbox.click()
            time.sleep(1)
            textbox.fill(text)
            time.sleep(1)
            # fill() may not trigger React state update, fallback to keyboard
            if not textbox.inner_text().strip():
                textbox.click()
                page.keyboard.type(text, delay=10)
            time.sleep(2)

            # Click reply button (in dialog it's tweetButton, not tweetButtonInline)
            print("Looking for reply button...")
            clicked = False
            for btn_selector in ['[data-testid="tweetButton"]', '[data-testid="tweetButtonInline"]']:
                btn = page.locator(btn_selector).first
                try:
                    if btn.is_visible() and btn.is_enabled():
                        btn.click()
                        print(f"  Clicked: {btn_selector}")
                        clicked = True
                        break
                except Exception:
                    continue

            if not clicked:
                print("Error: Reply button not found or disabled.")
                page.screenshot(path="debug_screenshot.png")
                return False

            time.sleep(8)
            page.screenshot(path="debug_after_reply.png")
            print(f"DONE reply: {text[:80]}...")
            return True

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="debug_screenshot.png")
            except Exception:
                pass
            return False

        finally:
            context.close()


def post_tweet(text, dry_run=False):
    if dry_run:
        print(f"[DRY RUN] {text[:80]}...")
        return True

    if not BOT_PROFILE.exists():
        print("Error: .bot_profile not found. Run tweet_login.bat first.")
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
            print("Opening x.com...")
            page.goto("https://x.com/home", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            if "login" in page.url:
                print("Error: Not logged in. Run tweet_login.bat first.")
                return False

            # Find tweet textbox
            print("Looking for textbox...")
            textbox = None
            for selector in ['[data-testid="tweetTextarea_0"]', '[role="textbox"]']:
                try:
                    page.wait_for_selector(selector, timeout=10000)
                    loc = page.locator(selector).first
                    if loc.is_visible():
                        textbox = loc
                        print(f"  Found: {selector}")
                        break
                except Exception:
                    continue

            if textbox is None:
                print("Error: Textbox not found.")
                page.screenshot(path="debug_screenshot.png")
                return False

            # Input text
            print("Inputting text...")
            textbox.click()
            time.sleep(1)
            textbox.fill(text)
            time.sleep(1)
            # fill() may not trigger React state update, fallback to keyboard
            if not textbox.inner_text().strip():
                textbox.click()
                page.keyboard.type(text, delay=10)
            time.sleep(2)

            # Verify text was entered
            page.screenshot(path="debug_before_post.png")
            print("  Screenshot saved: debug_before_post.png")

            # Find and click post button
            print("Looking for post button...")
            posted = False
            for btn_selector in ['[data-testid="tweetButtonInline"]', '[data-testid="tweetButton"]']:
                try:
                    btn = page.locator(btn_selector).first
                    if btn.is_visible() and btn.is_enabled():
                        print(f"  Found enabled button: {btn_selector}")
                        btn.click()
                        posted = True
                        break
                    elif btn.is_visible():
                        print(f"  Found but DISABLED: {btn_selector}")
                except Exception:
                    continue

            if not posted:
                print("Error: Post button not found or disabled.")
                print("  Text may not have been entered properly.")
                page.screenshot(path="debug_screenshot.png")
                return False

            # Wait for post to complete
            print("Waiting for post to complete...")
            time.sleep(8)

            # Verify by checking profile
            page.goto("https://x.com/eda_u838861", timeout=20000)
            time.sleep(5)
            page.screenshot(path="debug_after_post.png")
            print("  Screenshot saved: debug_after_post.png")
            print(f"DONE: {text[:80]}...")
            return True

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="debug_screenshot.png")
            except Exception:
                pass
            return False

        finally:
            context.close()


def load_posted():
    if not POSTED_LOG.exists():
        return set()
    return set(POSTED_LOG.read_text(encoding="utf-8").strip().splitlines())


def mark_posted(timestamp):
    POSTED_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(POSTED_LOG, "a", encoding="utf-8") as f:
        f.write(timestamp + "\n")


def parse_log(log_path):
    content = Path(log_path).read_text(encoding="utf-8")
    tweets = []
    pattern = r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\s+\d+/\d+)?)\]\n(.+?)(?=\n\n\[|\n*$)'
    for match in re.finditer(pattern, content, re.DOTALL):
        timestamp = match.group(1).strip()
        text = match.group(2).strip()
        if text.startswith("[") or text.startswith("# "):
            continue
        tweets.append((timestamp, text))
    return tweets


def post_from_log(log_path, dry_run=False):
    tweets = parse_log(log_path)
    posted = load_posted()
    unposted = [(ts, text) for ts, text in tweets if ts not in posted]

    if not unposted:
        print("No unposted tweets.")
        return

    print(f"Unposted: {len(unposted)}")
    for i, (ts, text) in enumerate(unposted):
        print(f"\n--- [{i+1}/{len(unposted)}] {ts} ---")
        print(text[:100] + ("..." if len(text) > 100 else ""))

        if dry_run:
            print("[DRY RUN] skip")
            continue

        success = post_tweet(text)
        if success:
            mark_posted(ts)
        else:
            print(f"Failed: {ts}")
            break

        if i < len(unposted) - 1:
            print("Waiting 5 minutes (bot detection prevention)...")
            time.sleep(300)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("text", nargs="?")
    parser.add_argument("--from-log", metavar="LOG")
    parser.add_argument("--reply", action="store_true", help="Reply to latest tweet")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--list-unposted", metavar="LOG")

    args = parser.parse_args()

    if args.reply and args.text:
        reply_to_latest(args.text, dry_run=args.dry_run)
    elif args.from_log:
        post_from_log(args.from_log, dry_run=args.dry_run)
    elif args.list_unposted:
        tweets = parse_log(args.list_unposted)
        posted = load_posted()
        unposted = [(ts, text) for ts, text in tweets if ts not in posted]
        print(f"Unposted: {len(unposted)} / {len(tweets)}")
        for ts, text in unposted:
            print(f"  [{ts}] {text[:60]}...")
    elif args.text:
        post_tweet(args.text, dry_run=args.dry_run)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
