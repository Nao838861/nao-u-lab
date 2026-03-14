"""通知の2番目の文脈を確認する"""
import io
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BOT_PROFILE = Path(__file__).parent / ".bot_profile"

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
        print("Opening notifications/mentions...")
        page.goto("https://x.com/notifications/mentions", timeout=30000)
        page.wait_for_load_state("domcontentloaded", timeout=15000)
        time.sleep(5)

        tweets = page.locator('[data-testid="tweet"]')
        count = tweets.count()

        if count >= 2:
            print("Clicking second notification...")
            tweets.nth(1).click()
            time.sleep(5)

            thread_tweets = page.locator('[data-testid="tweet"]')
            thread_count = thread_tweets.count()
            print(f"Found {thread_count} tweets in thread:\n")

            for i in range(min(thread_count, 8)):
                tweet = thread_tweets.nth(i)
                text = tweet.text_content()
                print(f"--- {i+1} ---")
                print(text[:300])
                print()

    except Exception as e:
        print(f"Error: {e}")
    finally:
        context.close()
