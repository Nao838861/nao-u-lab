"""
read_tweet_url.py — Read tweet content from a URL

Opens a tweet URL with Playwright, extracts the main tweet text,
author, and any quote/reply context.

Usage:
  python read_tweet_url.py "https://x.com/user/status/123456"
  python read_tweet_url.py --json "https://x.com/user/status/123456"

Can also be imported:
  from read_tweet_url import read_tweet
  result = read_tweet("https://x.com/user/status/123456")
"""

import argparse
import json
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

import browser_lock

BOT_PROFILE = Path(__file__).parent / ".bot_profile"


def read_tweet(url):
    """Read a tweet from URL. Returns dict with author, text, quotes, etc."""
    if not BOT_PROFILE.exists():
        return {"error": ".bot_profile not found. Run tweet_login.bat first."}

    if not browser_lock.acquire():
        return {"error": "Browser locked by another process"}

    try:
        return _read_inner(url)
    finally:
        browser_lock.release()


def _read_inner(url):
    result = {"url": url, "author": "", "handle": "", "text": "", "quotes": []}

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
            page.goto(url, timeout=30000)
            page.wait_for_load_state("domcontentloaded", timeout=15000)
            time.sleep(5)

            # Find the main tweet (the focused/detailed one)
            # On a status page, the main tweet has a larger font
            articles = page.locator('article[data-testid="tweet"]').all()

            if not articles:
                result["error"] = "No tweet found on page"
                return result

            # The main tweet is typically the first article on a direct status URL
            main = articles[0]

            # Author name and handle
            try:
                user_links = main.locator('a[role="link"]').all()
                for link in user_links:
                    href = link.get_attribute("href") or ""
                    if href.startswith("/") and "/status/" not in href and len(href) > 1:
                        inner = link.inner_text().strip()
                        if inner.startswith("@"):
                            result["handle"] = inner
                        elif inner and not result["author"]:
                            result["author"] = inner
            except Exception:
                pass

            # Tweet text
            try:
                text_el = main.locator('[data-testid="tweetText"]').first
                result["text"] = text_el.inner_text().strip()
            except Exception:
                pass

            # Check for quoted tweet
            try:
                quote_tweet = main.locator('[data-testid="quoteTweet"]').first
                if quote_tweet.is_visible():
                    qt_text_el = quote_tweet.locator('[data-testid="tweetText"]').first
                    qt_text = qt_text_el.inner_text().strip() if qt_text_el.is_visible() else ""
                    if qt_text:
                        result["quotes"].append(qt_text)
            except Exception:
                pass

            # If there are reply-context tweets (thread above), grab them
            if len(articles) > 1:
                replies = []
                for art in articles[1:4]:  # max 3 replies
                    try:
                        rt = art.locator('[data-testid="tweetText"]').first
                        if rt.is_visible():
                            replies.append(rt.inner_text().strip())
                    except Exception:
                        continue
                if replies:
                    result["replies_below"] = replies

        except Exception as e:
            result["error"] = str(e)
        finally:
            context.close()

    return result


def format_result(data):
    """Format result as readable text."""
    if "error" in data:
        return f"Error: {data['error']}"

    lines = []
    if data.get("author"):
        lines.append(f"{data['author']} ({data.get('handle', '')})")
    lines.append(data.get("text", "(no text)"))

    if data.get("quotes"):
        lines.append("")
        lines.append("[Quoted tweet]")
        for q in data["quotes"]:
            lines.append(q)

    if data.get("replies_below"):
        lines.append("")
        lines.append("[Replies]")
        for r in data["replies_below"]:
            lines.append(f"  > {r[:200]}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("url", help="Tweet URL (https://x.com/user/status/...)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    result = read_tweet(args.url)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(format_result(result))


if __name__ == "__main__":
    main()
