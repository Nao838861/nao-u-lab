"""
check_notifications.py — X.comの通知を確認してスクリーンショットを撮る

使い方:
  python check_notifications.py               # 通知ページのスクショ
  python check_notifications.py --delete-latest  # 最新ツイートを削除
"""

import argparse
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

BOT_PROFILE = Path(__file__).parent / ".bot_profile"


def check_notifications():
    """通知ページを開いてスクリーンショットを撮る"""
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
            print("Opening notifications...")
            page.goto("https://x.com/notifications/mentions", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)
            page.screenshot(path="debug_notifications.png")
            print("Screenshot saved: debug_notifications.png")

            # Scroll down to see more
            page.mouse.wheel(0, 500)
            time.sleep(2)
            page.screenshot(path="debug_notifications_2.png")
            print("Screenshot saved: debug_notifications_2.png")

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


def delete_latest_tweet():
    """プロフィールの最新ツイートを削除する"""
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
            print("Opening profile...")
            page.goto("https://x.com/eda_u838861", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            # Scroll past the "set up" banner
            page.mouse.wheel(0, 800)
            time.sleep(2)

            # Find the first tweet's caret/more button
            tweet = page.locator('[data-testid="tweet"]').first
            caret = tweet.locator('[data-testid="caret"]')
            caret.click()
            time.sleep(2)

            # Click delete option
            delete_item = page.locator('[data-testid="Dropdown"] [role="menuitem"]').first
            delete_text = delete_item.text_content()
            print(f"First menu item: {delete_text}")

            if "削除" in delete_text or "Delete" in delete_text:
                delete_item.click()
                time.sleep(2)

                # Confirm deletion
                confirm = page.locator('[data-testid="confirmationSheetConfirm"]')
                if confirm.is_visible():
                    confirm.click()
                    print("Deleted!")
                    time.sleep(3)
                else:
                    page.screenshot(path="debug_no_confirm.png")
                    print("Confirm button not found")
            else:
                print(f"First menu item is not delete: {delete_text}")
                page.screenshot(path="debug_wrong_menu.png")

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


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--delete-latest", action="store_true")
    args = parser.parse_args()

    if args.delete_latest:
        delete_latest_tweet()
    else:
        check_notifications()


if __name__ == "__main__":
    main()
