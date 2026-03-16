"""
check_notifications_diff.py — 通知の差分を検知してclaude CLIを起動する

タスクスケジューラで5分ごとに実行。
通知に変化があればclaude --printで処理を起動する。
AIを常時稼働させずに通知に反応できる。

使い方:
  python check_notifications_diff.py          # 差分チェック（変化があればclaude起動）
  python check_notifications_diff.py --dry-run  # 差分チェックのみ（claude起動しない）
"""

import argparse
import json
import subprocess
import time
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright
import browser_lock

BOT_PROFILE = Path(__file__).parent / ".bot_profile"
STATE_FILE = Path(__file__).parent / "notif_state.json"
LOG_FILE = Path(__file__).parent / "log" / "notif_diff.log"


def get_current_notifications():
    """現在の通知を取得して返す"""
    notifications = []

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(BOT_PROFILE),
            channel="msedge",
            headless=False,
            viewport={"width": 800, "height": 900},
            locale="ja-JP",
            args=["--disable-blink-features=AutomationControlled"],
        )
        page = context.new_page()

        try:
            page.goto(
                "https://x.com/notifications/mentions",
                timeout=30000,
            )
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(6)

            tweets = page.locator('[data-testid="tweet"]').all()
            for tweet in tweets:
                try:
                    text = tweet.locator(
                        '[data-testid="tweetText"]'
                    ).first.text_content()
                    links = tweet.locator('a[href*="/status/"]').all()
                    status_id = None
                    for link in links:
                        href = link.get_attribute("href")
                        if href and "/status/" in href and "/analytics" not in href:
                            status_id = href.split("/status/")[-1]
                            break
                    if status_id and text:
                        notifications.append(
                            {"status_id": status_id, "text": text[:200]}
                        )
                except Exception:
                    continue

        except Exception as e:
            log(f"Error fetching notifications: {e}")
        finally:
            context.close()

    return notifications


def load_previous_state():
    """前回の通知状態を読み込む"""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_state(notifications):
    """現在の通知状態を保存する"""
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(notifications, f, ensure_ascii=False, indent=2)


def log(message):
    """ログに記録"""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line)
    print(line.strip())


def find_new_notifications(previous, current):
    """前回と比較して新しい通知を見つける"""
    prev_ids = {n["status_id"] for n in previous}
    return [n for n in current if n["status_id"] not in prev_ids]


def wake_claude(new_notifications):
    """claude CLIを起動して新しい通知を処理させる"""
    notif_summary = "\n".join(
        [f"- {n['text'][:100]}" for n in new_notifications]
    )
    prompt = f"""新しい通知が{len(new_notifications)}件あります。通知チェック+返信サイクルを実行してください。

新しい通知の概要:
{notif_summary}
"""
    try:
        result = subprocess.run(
            ["claude", "--print", "-p", prompt],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(Path(__file__).parent),
        )
        log(f"Claude response: {result.stdout[:200]}")
    except subprocess.TimeoutExpired:
        log("Claude timed out")
    except Exception as e:
        log(f"Error waking Claude: {e}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not browser_lock.acquire():
        log("Skipped: browser locked by another process")
        return

    try:
        _main_inner(args)
    finally:
        browser_lock.release()


def _main_inner(args):
    log("Checking notifications...")

    current = get_current_notifications()
    previous = load_previous_state()

    if not current:
        log("No notifications found (or error fetching)")
        return

    new = find_new_notifications(previous, current)

    # Always save current state
    save_state(current)

    if new:
        log(f"Found {len(new)} new notification(s)")
        for n in new:
            log(f"  New: {n['text'][:80]}")

        if args.dry_run:
            log("[DRY RUN] Would wake Claude")
        else:
            wake_claude(new)
    else:
        log(f"No new notifications ({len(current)} total, all seen)")


if __name__ == "__main__":
    main()
