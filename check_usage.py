"""
check_usage.py — Anthropic API使用量をスクレイピングしてSlackに投稿する

.bot_profileのブラウザセッションを使ってconsole.anthropic.comから使用量を取得。
火曜03:00リセットの週間サイクルに対して、現在の消費ペースを計算する。

使い方:
  python check_usage.py                # スクレイピング＋Slack投稿
  python check_usage.py --dry-run      # スクレイピングのみ（投稿しない）
  python check_usage.py --login        # ブラウザを開いてログイン（初回のみ）
  python check_usage.py --screenshot   # スクリーンショット保存（デバッグ用）

Nao_u指示 (2026-04-07 #human-steering):
  6時間おきにSlackのnao-uチャンネルに投稿。火曜03:00リセット基準で超過%表示。
"""

import argparse
import json
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

REPO_DIR = Path(__file__).parent
BOT_PROFILE = REPO_DIR / ".bot_profile"
SCREENSHOT_DIR = REPO_DIR / "log"
USAGE_CACHE = REPO_DIR / ".usage_last.json"
SLACK_CHANNEL = "all-nao-u-lab"  # Nao_u指示(2026-04-07): allでお願い

# console.anthropic.comの使用量ページ
USAGE_URL = "https://console.anthropic.com/settings/plans"


def calc_weekly_position():
    """火曜03:00リセット基準で、週のどの位置にいるか計算する"""
    now = datetime.now()
    # 直近の火曜03:00を見つける
    days_since_tuesday = (now.weekday() - 1) % 7  # 火曜=1
    last_tuesday = now.replace(hour=3, minute=0, second=0, microsecond=0) - timedelta(days=days_since_tuesday)
    if last_tuesday > now:
        last_tuesday -= timedelta(days=7)

    elapsed = (now - last_tuesday).total_seconds()
    total_week = 7 * 24 * 3600
    elapsed_days = elapsed / 86400
    progress_pct = (elapsed / total_week) * 100

    next_reset = last_tuesday + timedelta(days=7)
    remaining = next_reset - now

    return {
        "elapsed_days": round(elapsed_days, 1),
        "progress_pct": round(progress_pct, 1),
        "remaining": str(remaining).split(".")[0],  # HH:MM:SS
        "reset_at": next_reset.strftime("%m/%d %H:%M"),
    }


def scrape_usage(dry_run=False, screenshot=False):
    """Playwrightでconsole.anthropic.comから使用量をスクレイピング"""
    from playwright.sync_api import sync_playwright
    import browser_lock

    if not BOT_PROFILE.exists():
        print("Error: .bot_profile not found. Run: python check_usage.py --login")
        return None

    if not browser_lock.acquire():
        print("Browser locked by another script. Skipping.")
        return None

    try:
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=str(BOT_PROFILE),
                channel="msedge",
                headless=True,
                viewport={"width": 1280, "height": 900},
                locale="ja-JP",
                args=["--disable-blink-features=AutomationControlled"],
            )

            page = context.new_page()
            result = None

            try:
                print(f"Opening {USAGE_URL}...")
                page.goto(USAGE_URL, timeout=30000)
                page.wait_for_load_state("networkidle", timeout=20000)
                time.sleep(3)  # JS描画待ち

                if screenshot:
                    ss_path = SCREENSHOT_DIR / "usage_screenshot.png"
                    page.screenshot(path=str(ss_path))
                    print(f"Screenshot saved: {ss_path}")

                # ページ全体のテキストを取得
                page_text = page.inner_text("body")

                if dry_run:
                    print("=== Page text ===")
                    print(page_text[:3000])
                    print("=================")

                # 使用量データを抽出（パターンマッチング）
                result = parse_usage_text(page_text)

                if result:
                    # キャッシュに保存
                    result["scraped_at"] = datetime.now().isoformat()
                    USAGE_CACHE.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
                    print(f"Usage data: {json.dumps(result, ensure_ascii=False)}")
                else:
                    print("Failed to parse usage data from page")
                    # デバッグ用にスクリーンショット
                    ss_path = SCREENSHOT_DIR / "usage_parse_failed.png"
                    page.screenshot(path=str(ss_path))
                    print(f"Debug screenshot: {ss_path}")

            except Exception as e:
                print(f"Scraping error: {e}")
                try:
                    ss_path = SCREENSHOT_DIR / "usage_error.png"
                    page.screenshot(path=str(ss_path))
                    print(f"Error screenshot: {ss_path}")
                except Exception:
                    pass
            finally:
                context.close()

            return result
    finally:
        browser_lock.release()


def parse_usage_text(text):
    """ページテキストから使用量データを抽出する

    console.anthropic.comの表示形式に応じて調整が必要。
    一般的なパターン: "$X.XX / $Y.YY" や "X% of limit" など
    """
    result = {}

    # パターン1: "$X.XX / $Y.YY" 形式（ドル表記）
    m = re.search(r'\$(\d+(?:\.\d{2})?)\s*/\s*\$(\d+(?:\.\d{2})?)', text)
    if m:
        result["used"] = float(m.group(1))
        result["limit"] = float(m.group(2))
        result["unit"] = "USD"
        result["pct"] = round(result["used"] / result["limit"] * 100, 1) if result["limit"] > 0 else 0
        return result

    # パターン2: "X.XX of Y.YY" 形式
    m = re.search(r'(\d+(?:\.\d+)?)\s*of\s*(\d+(?:\.\d+)?)', text)
    if m:
        result["used"] = float(m.group(1))
        result["limit"] = float(m.group(2))
        result["unit"] = "unknown"
        result["pct"] = round(result["used"] / result["limit"] * 100, 1) if result["limit"] > 0 else 0
        return result

    # パターン3: "X%" 形式
    m = re.search(r'(\d+(?:\.\d+)?)\s*%', text)
    if m:
        result["pct"] = float(m.group(1))
        result["unit"] = "pct_only"
        return result

    return None


def format_slack_message(usage, weekly):
    """Slack投稿メッセージを組み立てる"""
    lines = []
    lines.append(f":bar_chart: *API使用量レポート* ({datetime.now().strftime('%m/%d %H:%M')})")
    lines.append("")

    if usage.get("unit") == "USD":
        lines.append(f"使用量: *${usage['used']:.2f}* / ${usage['limit']:.2f} (*{usage['pct']}%*)")
    elif usage.get("unit") == "pct_only":
        lines.append(f"使用量: *{usage['pct']}%*")
    else:
        lines.append(f"使用量: *{usage.get('used', '?')}* / {usage.get('limit', '?')} (*{usage.get('pct', '?')}%*)")

    lines.append("")
    lines.append(f"週進行: {weekly['elapsed_days']}日経過 ({weekly['progress_pct']}%)")

    # 超過率計算: 使用%が週進行%をどれだけ上回っているか
    if usage.get("pct") is not None:
        overshoot = round(usage["pct"] - weekly["progress_pct"], 1)
        if overshoot > 0:
            lines.append(f":warning: ペース超過: *+{overshoot}%* (均等配分比)")
        elif overshoot < -5:
            lines.append(f":white_check_mark: 余裕あり: *{overshoot}%* (均等配分比)")
        else:
            lines.append(f":ok: ほぼ均等ペース ({overshoot:+.1f}%)")

    lines.append(f"リセット: {weekly['reset_at']} (残り{weekly['remaining']})")

    return "\n".join(lines)


def post_to_slack(message):
    """Slackに投稿"""
    sys.path.insert(0, str(REPO_DIR))
    from slack_bot import post_message
    result = post_message(SLACK_CHANNEL, message)
    if result.get("ok"):
        print(f"Posted to #{SLACK_CHANNEL}")
    else:
        print(f"Slack post failed: {result.get('error', 'unknown')}")
    return result


def run_login():
    """ブラウザを開いてconsole.anthropic.comにログインする（初回セットアップ用）"""
    from playwright.sync_api import sync_playwright

    print(f"Profile dir: {BOT_PROFILE}")
    print("Edge will open. Please log in to console.anthropic.com, then close the browser.")

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
        page.goto("https://console.anthropic.com/login")
        print("Waiting for you to log in and close the browser...")
        try:
            page.wait_for_event("close", timeout=600000)
        except Exception:
            pass
        context.close()

    print("Done! Profile saved.")


def main():
    parser = argparse.ArgumentParser(description="Anthropic API使用量チェック")
    parser.add_argument("--dry-run", action="store_true", help="スクレイピングのみ（投稿しない）")
    parser.add_argument("--login", action="store_true", help="ブラウザを開いてログイン")
    parser.add_argument("--screenshot", action="store_true", help="スクリーンショット保存")
    args = parser.parse_args()

    if args.login:
        run_login()
        return

    usage = scrape_usage(dry_run=args.dry_run, screenshot=args.screenshot)
    if not usage:
        print("No usage data obtained. Try --login first, or --screenshot for debug.")
        sys.exit(1)

    weekly = calc_weekly_position()
    message = format_slack_message(usage, weekly)
    print(f"\n{message}\n")

    if not args.dry_run:
        post_to_slack(message)


if __name__ == "__main__":
    main()
