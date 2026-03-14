"""通知の文脈を確認する — 最初の通知をクリックして親ツイートを見る"""
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

        # Click on the first notification to see context
        tweets = page.locator('[data-testid="tweet"]')
        count = tweets.count()
        print(f"Found {count} mention tweets")

        if count > 0:
            # Click the first one
            print("\nClicking first notification...")
            tweets.first.click()
            time.sleep(5)

            page.screenshot(path="debug_notification_context_1.png")
            print("Screenshot saved: debug_notification_context_1.png")

            # Get all tweets in the thread view
            thread_tweets = page.locator('[data-testid="tweet"]')
            thread_count = thread_tweets.count()
            print(f"\nFound {thread_count} tweets in thread view:\n")

            for i in range(min(thread_count, 8)):
                tweet = thread_tweets.nth(i)
                text = tweet.text_content()
                print(f"--- Thread tweet {i+1} ---")
                print(text[:300])
                print()

    except Exception as e:
        print(f"Error: {e}")
    finally:
        context.close()
