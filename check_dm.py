"""
check_dm.py — DMを確認して新しいメッセージがあれば読み取る

通知チェック(check_notifications.py)と一緒にCronから呼ぶ。
パスコード自動入力対応。
"""

import time
import json
from pathlib import Path
from datetime import datetime

import pyperclip
from playwright.sync_api import sync_playwright

BOT_PROFILE = Path(__file__).parent / ".bot_profile"
DM_STATE_FILE = Path(__file__).parent / "dm_state.json"
DM_LOG = Path(__file__).parent / "log" / "dm.log"
PASSCODE = "8361"


def check_dm(reply_text=None):
    """DMを確認し、新しいメッセージがあれば返す。reply_textがあれば返信も送る。"""
    messages = []

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
            page.goto("https://x.com/messages", timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            # Auto passcode
            if page.locator("text=パスコードを入力").count() > 0:
                for d in PASSCODE:
                    page.keyboard.press(d)
                    time.sleep(0.3)
                time.sleep(3)

            # Wait for conversation list
            for _ in range(15):
                if page.locator("text=Nao_u").count() > 0:
                    break
                time.sleep(1)

            # Get conversation preview text (for change detection)
            preview = ""
            try:
                cell = page.locator('[data-testid="cellInnerDiv"]').first
                preview = cell.text_content()[:200]
            except Exception:
                pass

            # Check if there are new messages by comparing preview
            prev_state = load_state()
            if preview and preview != prev_state.get("preview", ""):
                # New messages detected - open conversation
                page.locator("text=Nao_u").first.click()
                time.sleep(4)

                # Read full conversation
                main_text = page.locator("main").first.text_content()
                messages = [main_text]

                # Send reply if provided
                if reply_text:
                    textbox = page.locator('[placeholder="メッセージ"]')
                    if textbox.count() == 0:
                        textbox = page.locator(
                            'div[role="textbox"][contenteditable="true"]'
                        )
                    if textbox.count() > 0:
                        textbox.first.click()
                        time.sleep(1)
                        pyperclip.copy(reply_text)
                        page.keyboard.press("Control+v")
                        time.sleep(2)
                        page.keyboard.press("Enter")
                        time.sleep(4)

                # Update state
                save_state({"preview": preview, "last_check": str(datetime.now())})
            else:
                save_state(
                    {
                        "preview": prev_state.get("preview", preview),
                        "last_check": str(datetime.now()),
                    }
                )

        except Exception as e:
            log(f"Error: {e}")
        finally:
            context.close()

    return messages


def load_state():
    if DM_STATE_FILE.exists():
        try:
            with open(DM_STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_state(state):
    with open(DM_STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False)


def log(message):
    DM_LOG.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(DM_LOG, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {message}\n")


if __name__ == "__main__":
    msgs = check_dm()
    if msgs:
        print(f"New DM detected")
        log(f"New DM detected: {msgs[0][:100]}")
    else:
        print("No new DMs")
        log("No new DMs")
