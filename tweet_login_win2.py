"""
Win2用: Xにログインするためのスクリプト。
Edgeが開くので、手動でXにログインしてください。
ログイン後、ブラウザを閉じればプロファイルが保存されます。
"""
from playwright.sync_api import sync_playwright
from pathlib import Path

BOT_PROFILE = Path(__file__).parent / ".bot_profile"

print(f"Profile dir: {BOT_PROFILE}")
print("Edge will open. Please log in to X (twitter.com), then close the browser.")

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
    page.goto("https://x.com/login")
    print("Waiting for you to log in and close the browser...")
    # Wait until browser is closed by user
    try:
        page.wait_for_event("close", timeout=600000)
    except Exception:
        pass
    context.close()

print("Done! Profile saved. tweet_poster.py should now work.")
