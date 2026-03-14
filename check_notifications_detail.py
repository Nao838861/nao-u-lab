"""通知の詳細テキストを取得する"""
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

        # Get all tweet texts
        tweets = page.locator('[data-testid="tweet"]')
        count = tweets.count()
        print(f"Found {count} mention tweets\n")

        for i in range(min(count, 10)):
            tweet = tweets.nth(i)
            text = tweet.text_content()
            print(f"--- Tweet {i+1} ---")
            print(text[:500])
            print()

    except Exception as e:
        print(f"Error: {e}")
    finally:
        context.close()
