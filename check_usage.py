"""
check_usage.py — Claude Pro/Max使用量をスクレイピングしてSlackに投稿する

.bot_profileのブラウザセッションを使ってclaude.ai/settings/usageから使用量を取得。
金曜06:59リセットの週間サイクルに対して、現在の消費ペースを計算する。

使い方:
  python check_usage.py                # スクレイピング＋Slack投稿
  python check_usage.py --dry-run      # スクレイピングのみ（投稿しない）
  python check_usage.py --login        # ブラウザを開いてログイン（初回のみ）
  python check_usage.py --screenshot   # スクリーンショット保存（デバッグ用）

Nao_u指示 (2026-04-07 #human-steering):
  6時間おきにSlackのall-nao-u-labチャンネルに投稿。金曜06:59リセット基準で超過%表示（2026-04-20変更）。
  APIコスト不要（スクレイピングベース）。
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

# claude.ai の使用量ページ（Pro/Max プラン）
USAGE_URL = "https://claude.ai/settings/usage"


def calc_weekly_position():
    """金曜06:59リセット基準で、週のどの位置にいるか計算する"""
    now = datetime.now()
    # 直近の金曜06:59を見つける
    days_since_friday = (now.weekday() - 4) % 7  # 金曜=4
    last_reset = now.replace(hour=6, minute=59, second=0, microsecond=0) - timedelta(days=days_since_friday)
    if last_reset > now:
        last_reset -= timedelta(days=7)

    elapsed = (now - last_reset).total_seconds()
    total_week = 7 * 24 * 3600
    elapsed_days = elapsed / 86400
    progress_pct = (elapsed / total_week) * 100

    next_reset = last_reset + timedelta(days=7)
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
                headless=False,
                viewport={"width": 1280, "height": 900},
                locale="ja-JP",
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--start-minimized",
                    "--window-position=-32000,-32000",
                ],
            )

            page = context.new_page()
            result = None

            try:
                print(f"Opening {USAGE_URL}...")
                page.goto(USAGE_URL, timeout=30000)
                page.wait_for_load_state("domcontentloaded", timeout=15000)
                time.sleep(8)  # JS描画待ち

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

    claude.ai/settings/usage の実際の表示形式（2026-04時点）:
      「8% 使用済み」（セッション）
      「9% 使用済み」（週間）
      「0% 使用済み」（Sonnet）
    ページ構造が変わった場合は --dry-run --screenshot で確認。
    """
    result = {}

    # 「N% 使用済み」を全て抽出（順番: セッション、週間、Sonnet）
    pcts = re.findall(r'(\d+)%\s*使用済み', text)
    if len(pcts) >= 2:
        result["session_pct"] = int(pcts[0])
        result["weekly_pct"] = int(pcts[1])
        result["pct"] = int(pcts[1])  # 週間を主指標にする
        result["unit"] = "pct"
    if len(pcts) >= 3:
        result["sonnet_pct"] = int(pcts[2])

    # セッションリセットまでの時間
    m = re.search(r'(\d+)時間(\d+)?分?後にリセット', text)
    if m:
        h = int(m.group(1))
        mins = int(m.group(2)) if m.group(2) else 0
        result["session_reset_min"] = h * 60 + mins

    # 追加使用量
    m = re.search(r'\$(\d+\.?\d*)\s*使用', text)
    if m:
        result["extra_usd"] = float(m.group(1))

    m = re.search(r'\$(\d+\.?\d*)\s*現在の残高', text)
    if m:
        result["balance_usd"] = float(m.group(1))

    # フォールバック: 英語版 "X% used"
    if "pct" not in result:
        m = re.search(r'(\d+(?:\.\d+)?)\s*%\s*used', text)
        if m:
            result["pct"] = float(m.group(1))
            result["unit"] = "pct"

    if "pct" not in result:
        return None

    return result


def load_history():
    """過去の使用量履歴を読む"""
    hist_file = REPO_DIR / ".usage_history.json"
    if hist_file.exists():
        try:
            return json.loads(hist_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def save_history(history):
    """使用量履歴を保存（最大28件=7日分）"""
    hist_file = REPO_DIR / ".usage_history.json"
    hist_file.write_text(json.dumps(history[-28:], ensure_ascii=False, indent=2), encoding="utf-8")


def format_slack_message(usage, weekly):
    """Slack投稿メッセージを組み立てる（簡潔版）"""
    now = datetime.now()
    weekly_pct = usage.get("weekly_pct", usage.get("pct", -1))
    session_pct = usage.get("session_pct", -1)

    lines = []
    lines.append(f"*使用量* ({now:%m/%d %H:%M})")

    # 現在値
    parts = []
    if weekly_pct >= 0:
        parts.append(f"週間 *{weekly_pct}%*")
    if session_pct >= 0:
        parts.append(f"セッション {session_pct}%")
    lines.append(" | ".join(parts))

    # 6時間差分
    history = load_history()
    if history:
        # 直近の記録との差分
        prev = history[-1]
        prev_pct = prev.get("weekly_pct", prev.get("pct", -1))
        prev_time = datetime.fromisoformat(prev["scraped_at"])
        hours = (now - prev_time).total_seconds() / 3600

        if hours > 0.5 and prev_pct >= 0 and weekly_pct >= 0:
            delta = weekly_pct - prev_pct
            rate_per_day = (delta / hours) * 24

            lines.append(f"前回比: +{delta}% / {hours:.1f}h -> 日換算 {rate_per_day:.1f}%/日 (予算14%/日)")

            # 予算比率
            if rate_per_day > 0:
                ratio = rate_per_day / 14.3
                if ratio <= 0.8:
                    verdict = "余裕"
                elif ratio <= 1.2:
                    verdict = "OK"
                elif ratio <= 1.5:
                    verdict = "やや超過"
                else:
                    verdict = "超過"
                lines.append(f"ペース: {ratio:.1f}x ({verdict})")

    # 週間進行との比較
    if weekly_pct >= 0:
        expected = round(weekly["progress_pct"], 1)
        overshoot = round(weekly_pct - expected, 1)
        remaining = 100 - weekly_pct
        if expected > 0:
            ratio = round(weekly_pct / expected, 1)
            lines.append(f"均等配分 {expected}% → 実際 {weekly_pct}% ({ratio}x) | 残り {remaining}% | リセット {weekly['reset_at']}")
        else:
            lines.append(f"残り {remaining}% | 均等配分比 {overshoot:+.1f}% | リセット {weekly['reset_at']}")

    # 履歴に追加
    history.append(usage)
    save_history(history)

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
    print("Edge will open. Please log in to claude.ai, then close the browser.")

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
        page.goto("https://claude.ai/login")
        print("Waiting for you to log in and close the browser...")
        try:
            page.wait_for_event("close", timeout=600000)
        except Exception:
            pass
        context.close()

    print("Done! Profile saved.")


MIN_POST_INTERVAL_SEC = 5 * 3600  # 5時間: 6時間間隔運用での重複投稿を防ぐ
LAST_POST_FILE = REPO_DIR / ".usage_last_post"


def check_min_post_interval():
    """前回投稿から最低間隔が経過しているか確認。
    複数経路からcheck_usage.pyが呼ばれても重複投稿を防ぐ。"""
    if not LAST_POST_FILE.exists():
        return True
    try:
        last_ts = float(LAST_POST_FILE.read_text().strip())
        elapsed = time.time() - last_ts
        if elapsed < MIN_POST_INTERVAL_SEC:
            remaining = int((MIN_POST_INTERVAL_SEC - elapsed) / 60)
            print(f"前回投稿から{int(elapsed/60)}分しか経っていない（最小間隔: {int(MIN_POST_INTERVAL_SEC/60)}分）。あと{remaining}分待機。スキップ。")
            return False
        return True
    except Exception:
        return True


def record_post():
    LAST_POST_FILE.write_text(str(time.time()))


def main():
    parser = argparse.ArgumentParser(description="Claude Pro/Max使用量チェック")
    parser.add_argument("--dry-run", action="store_true", help="スクレイピングのみ（投稿しない）")
    parser.add_argument("--login", action="store_true", help="ブラウザを開いてログイン")
    parser.add_argument("--screenshot", action="store_true", help="スクリーンショット保存")
    parser.add_argument("--force", action="store_true", help="最小投稿間隔ガードを無視")
    args = parser.parse_args()

    if args.login:
        run_login()
        return

    # 重複投稿ガード（dry-run/forceは除外）
    if not args.dry_run and not args.force:
        if not check_min_post_interval():
            sys.exit(0)

    usage = scrape_usage(dry_run=args.dry_run, screenshot=args.screenshot)
    if not usage:
        print("No usage data obtained. Try --login first, or --screenshot for debug.")
        sys.exit(1)

    weekly = calc_weekly_position()
    message = format_slack_message(usage, weekly)
    print(f"\n{message}\n")

    if not args.dry_run:
        post_to_slack(message)
        record_post()


if __name__ == "__main__":
    main()
