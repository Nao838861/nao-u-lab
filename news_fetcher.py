"""
インディー・レトロゲームのRSSフィードからニュースを収集するモジュール
"""
import feedparser
import datetime

FEEDS = [
    # 日本語
    ("4Gamer インディー", "https://www.4gamer.net/rss/index.xml"),
    ("Famitsu", "https://www.famitsu.com/rss/feed"),
    # 英語インディー系
    ("Rock Paper Shotgun", "https://www.rockpapershotgun.com/feed"),
    ("IndieGames.com", "https://indiegames.com/feed"),
]

KEYWORDS = [
    "indie", "indiegame", "indiedev",
    "retro", "pixel", "pixelart", "ドット絵",
    "2daction", "fighting", "格闘",
    "platformer", "beat em up", "ベルトスクロール",
    "roguelike", "metroidvania",
    "steam", "itch.io",
]

def fetch_recent_news(hours=2, max_items=10):
    """指定時間以内の関連ニュースを取得"""
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours)
    results = []

    for name, url in FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:20]:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                link = entry.get("link", "")

                # 日付チェック
                published = entry.get("published_parsed")
                if published:
                    pub_dt = datetime.datetime(*published[:6], tzinfo=datetime.timezone.utc)
                    if pub_dt < cutoff:
                        continue

                # キーワードフィルタ
                combined = (title + " " + summary).lower()
                if any(kw.lower() in combined for kw in KEYWORDS):
                    results.append({
                        "source": name,
                        "title": title,
                        "summary": summary[:200],
                        "link": link,
                    })
                    if len(results) >= max_items:
                        return results
        except Exception as e:
            print(f"[warn] {name} の取得失敗: {e}")
            continue

    return results


def fetch_fallback_news(max_items=5):
    """フィルタなしで最新エントリを取得（ニュースが少ないとき用）"""
    results = []
    for name, url in FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                link = entry.get("link", "")
                results.append({
                    "source": name,
                    "title": title,
                    "summary": summary[:200],
                    "link": link,
                })
                if len(results) >= max_items:
                    return results
        except Exception:
            continue
    return results


if __name__ == "__main__":
    print("=== 最新ニュース取得テスト ===")
    news = fetch_recent_news(hours=48)
    if not news:
        print("直近48時間の関連ニュースなし。フォールバック取得中...")
        news = fetch_fallback_news()
    for item in news:
        print(f"\n[{item['source']}] {item['title']}")
        print(f"  {item['summary'][:80]}...")
