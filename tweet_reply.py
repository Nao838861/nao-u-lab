"""
tweet_reply.py — 指定したツイートURLに返信を投稿する

使い方:
  python tweet_reply.py "https://x.com/Nao_u_/status/12345" "返信テキスト"
  python tweet_reply.py --dry-run "https://x.com/Nao_u_/status/12345" "返信テキスト"
"""

import argparse
import time
from pathlib import Path

import pyperclip
from playwright.sync_api import sync_playwright

BOT_PROFILE = Path(__file__).parent / ".bot_profile"
REPLY_LOG = Path(__file__).parent / "log" / "replies.log"


def reply_to_tweet(tweet_url, reply_text, dry_run=False):
    """指定URLのツイートに返信する"""
    if dry_run:
        print(f"[DRY RUN] Reply to: {tweet_url}")
        print(f"[DRY RUN] Text: {reply_text}")
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
            # ツイートページを開く
            print(f"Opening tweet: {tweet_url}")
            page.goto(tweet_url, timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            # 返信テキストボックスを探す
            # ツイート詳細ページでは返信欄が直接表示されている
            print("Looking for reply textbox...")
            textbox = None

            # 方法1: ページ内の返信用テキストボックスを直接探す
            for selector in [
                '[data-testid="tweetTextarea_0"]',
                '[role="textbox"]',
            ]:
                try:
                    loc = page.locator(selector)
                    if loc.count() > 0 and loc.first.is_visible():
                        textbox = loc.first
                        print(f"  Found textbox: {selector}")
                        break
                except Exception:
                    continue

            # 方法2: 返信アイコンをクリックしてダイアログを開く
            if textbox is None:
                print("  Trying reply icon click...")
                reply_icon = page.locator('[data-testid="reply"]').first
                if reply_icon.is_visible():
                    reply_icon.click()
                    time.sleep(2)

                    for selector in [
                        '[data-testid="tweetTextarea_0"]',
                        '[role="textbox"]',
                    ]:
                        try:
                            page.wait_for_selector(selector, timeout=5000)
                            loc = page.locator(selector).first
                            if loc.is_visible():
                                textbox = loc
                                print(f"  Found textbox after dialog: {selector}")
                                break
                        except Exception:
                            continue

            if textbox is None:
                print("Error: Reply textbox not found.")
                page.screenshot(path="debug_reply_error.png")
                return False

            # テキストをペースト
            print("Pasting reply text...")
            textbox.click()
            time.sleep(1)
            pyperclip.copy(reply_text)
            page.keyboard.press("Control+v")
            time.sleep(2)

            page.screenshot(path="debug_before_reply.png")

            # 返信ボタンをクリック
            print("Looking for reply button...")
            clicked = False
            for btn_selector in [
                '[data-testid="tweetButton"]',
                '[data-testid="tweetButtonInline"]',
            ]:
                try:
                    btn = page.locator(btn_selector).first
                    if btn.is_visible() and btn.is_enabled():
                        btn.click()
                        print(f"  Clicked: {btn_selector}")
                        clicked = True
                        break
                except Exception:
                    continue

            if not clicked:
                print("Error: Reply button not found or disabled.")
                page.screenshot(path="debug_reply_error.png")
                return False

            # 投稿完了を待つ
            time.sleep(8)
            page.screenshot(path="debug_after_reply.png")
            print(f"DONE: Replied to {tweet_url}")
            return True

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="debug_reply_error.png")
            except Exception:
                pass
            return False

        finally:
            context.close()


def log_reply(tweet_url, original_text, reply_text, success):
    """返信をログに記録"""
    REPLY_LOG.parent.mkdir(parents=True, exist_ok=True)
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status = "OK" if success else "FAIL"
    with open(REPLY_LOG, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {status}\n")
        f.write(f"  To: {tweet_url}\n")
        f.write(f"  Original: {original_text[:100]}\n")
        f.write(f"  Reply: {reply_text}\n\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("url", help="返信先のツイートURL")
    parser.add_argument("text", help="返信テキスト")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    success = reply_to_tweet(args.url, args.text, dry_run=args.dry_run)
    log_reply(args.url, "(from CLI)", args.text, success)


if __name__ == "__main__":
    main()
