"""
check_dm.py — DMを確認して新しいメッセージがあれば読み取る

通知チェック(check_notifications.py)と一緒にCronから呼ぶ。
パスコード自動入力対応。
"""

import time
import json
from pathlib import Path
from datetime import datetime

from playwright.sync_api import sync_playwright
import browser_lock

BOT_PROFILE = Path(__file__).parent / ".bot_profile"
DM_STATE_FILE = Path(__file__).parent / "dm_state.json"
DM_LOG = Path(__file__).parent / "log" / "dm.log"
PASSCODE = "8361"


def check_dm(reply_text=None, target_user="Nao_u"):
    """DMを確認し、新しいメッセージがあれば返す。reply_textがあれば返信も送る。
    target_user: 会話を開く相手の表示名（部分一致）。デフォルトはNao_u。
    """
    messages = []

    if not browser_lock.acquire():
        log("Skipped: browser locked by another process")
        return messages

    try:
        return _check_dm_inner(reply_text, target_user)
    finally:
        browser_lock.release()


def _check_dm_inner(reply_text=None, target_user="Nao_u"):
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
                if page.locator(f"text={target_user}").count() > 0:
                    break
                time.sleep(1)

            # Always open conversation to check for new messages
            user_link = page.locator(f"text={target_user}")
            if user_link.count() == 0:
                log(f"No {target_user} conversation found")
                track_consecutive_failures(True, target_user)
                return messages

            user_link.first.click()
            time.sleep(4)
            track_consecutive_failures(False, target_user)

            # Read full conversation text
            main_text = page.locator("main").first.text_content()

            # Extract fingerprint: strip digits (timestamps change) and take last 200 chars
            import re
            stripped = re.sub(r'\d+', '', main_text) if main_text else ""
            fingerprint = stripped[-200:] if stripped else ""
            prev_state = load_state()

            if fingerprint and fingerprint != prev_state.get("fingerprint", ""):
                # New messages detected
                messages = [main_text]
                log(f"New DM detected (fingerprint changed)")

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
                        # Use browser's navigator.clipboard API (avoids Windows clipboard lock)
                        import json
                        escaped = json.dumps(reply_text)
                        page.evaluate(f'async () => {{ await navigator.clipboard.writeText({escaped}); }}')
                        time.sleep(1)
                        page.keyboard.press("Control+v")
                        time.sleep(2)
                        page.keyboard.press("Enter")
                        time.sleep(4)

            # 既存のstateにマージ（consecutive_fails等を保持するため）
            existing = load_state()
            existing["fingerprint"] = fingerprint
            existing["last_check"] = str(datetime.now())
            save_state(existing)

        except Exception as e:
            log(f"Error: {e}")
        finally:
            context.close()

    return messages


CONSECUTIVE_FAIL_THRESHOLD = 12  # 12回連続失敗（≒1時間）でSlackアラート


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


def track_consecutive_failures(user_not_found: bool, target_user: str):
    """連続失敗を追跡し、閾値超過でSlackにアラートを送る。
    サイレント失敗の早期検出用。2026-03-24の天谷DM遅延事故を受けて追加。
    """
    state = load_state()
    fail_count = state.get("consecutive_fails", 0)
    alerted = state.get("fail_alerted", False)

    if user_not_found:
        fail_count += 1
        state["consecutive_fails"] = fail_count
        if fail_count >= CONSECUTIVE_FAIL_THRESHOLD and not alerted:
            _send_failure_alert(fail_count, target_user)
            state["fail_alerted"] = True
    else:
        # 成功したらカウンタリセット
        state["consecutive_fails"] = 0
        state["fail_alerted"] = False

    save_state(state)


def _send_failure_alert(fail_count, target_user):
    """DMブラウザ障害をSlack #all-nao-u-labに通知する"""
    try:
        from slack_bot import post_message, _resolve_channel
        channel_id = _resolve_channel("all-nao-u-lab")
        if channel_id:
            post_message(
                channel_id,
                f"⚠️ [自動アラート] check_dm.pyが{fail_count}回連続で{target_user}の会話を発見できていません。"
                f"DMブラウザセッション（.bot_profile）が切れている可能性があります。"
                f"Nao_uの手動確認が必要です。"
            )
            log(f"Slack alert sent: {fail_count} consecutive failures for {target_user}")
    except Exception as e:
        log(f"Failed to send Slack alert: {e}")


def log(message):
    DM_LOG.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(DM_LOG, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {message}\n")


def wake_claude(dm_text):
    """新しいDMがあった時だけClaude CLIを起動する"""
    import subprocess

    prompt = f"新しいDMが来ています。内容を確認して返信してください。\n概要: {dm_text[:200]}"
    try:
        result = subprocess.run(
            ["claude", "--print", "-p", prompt],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(Path(__file__).parent),
        )
        log(f"Claude woken: {result.stdout[:100]}")
    except subprocess.TimeoutExpired:
        log("Claude wake timed out")
    except Exception as e:
        log(f"Error waking Claude: {e}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--wake", action="store_true", help="Wake Claude only if new DM found"
    )
    parser.add_argument(
        "--user", default="Nao_u", help="Target user display name to check DMs for"
    )
    args = parser.parse_args()

    msgs = check_dm(target_user=args.user)
    if msgs:
        print("New DM detected")
        log(f"New DM detected from {args.user}: {msgs[0][:100]}")
        if args.wake:
            wake_claude(msgs[0][:200])
    else:
        print("No new DMs")
        log(f"No new DMs from {args.user}")
