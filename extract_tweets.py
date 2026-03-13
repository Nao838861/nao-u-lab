# -*- coding: utf-8 -*-
"""Twitter生データからエンゲージメント付きツイートログを生成する"""
import json
import os
import sys
import io
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = os.path.expanduser(
    "~/Downloads/twitter-2026-03-12-16761232080c10cfb82492a8d45d3d5daf31cbc7fd59e2f5e557b211c0758f68-part1/data"
)
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "過去発言")

tweet_files = [
    "tweets.js", "tweets-part1.js", "tweets-part2.js",
    "tweets-part3.js", "tweets-part4.js"
]

all_tweets = []

for fname in tweet_files:
    fpath = os.path.join(DATA_DIR, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        raw = f.read()
    # Remove JS variable assignment
    idx = raw.index("[")
    data = json.loads(raw[idx:])
    for item in data:
        t = item.get("tweet", {})
        text = t.get("full_text", "")
        fav = int(t.get("favorite_count", "0"))
        rt = int(t.get("retweet_count", "0"))
        created = t.get("created_at", "")
        tid = t.get("id_str", "")
        is_rt = text.startswith("RT @")
        is_reply = t.get("in_reply_to_status_id_str") is not None

        # Parse date
        try:
            dt = datetime.strptime(created, "%a %b %d %H:%M:%S %z %Y")
            ts = dt.strftime("%Y-%m-%d %H:%M:%S")
        except:
            ts = created

        all_tweets.append({
            "ts": ts,
            "text": text,
            "fav": fav,
            "rt": rt,
            "id": tid,
            "is_rt": is_rt,
            "is_reply": is_reply,
        })
    print(f"  {fname}: {len(data)} tweets")

print(f"\n合計: {len(all_tweets)} tweets")

# Sort by timestamp
all_tweets.sort(key=lambda x: x["ts"])

# 1. Full log with engagement
with open(os.path.join(OUTPUT_DIR, "twitter全発言ログ_エンゲージメント付き.txt"), "w", encoding="utf-8") as f:
    for t in all_tweets:
        tag = ""
        if t["is_rt"]:
            tag = " [RT]"
        elif t["is_reply"]:
            tag = " [返信]"
        f.write(f"[{t['ts']}] ♥{t['fav']} RT{t['rt']}{tag}\n")
        f.write(f"{t['text']}\n\n")

# 2. Top tweets by engagement (excluding RTs)
original = [t for t in all_tweets if not t["is_rt"]]
by_fav = sorted(original, key=lambda x: x["fav"], reverse=True)
by_rt = sorted(original, key=lambda x: x["rt"], reverse=True)
by_total = sorted(original, key=lambda x: x["fav"] + x["rt"], reverse=True)

with open(os.path.join(OUTPUT_DIR, "twitterバズツイートTOP200.txt"), "w", encoding="utf-8") as f:
    f.write("# いいね数 TOP 200（RT除く）\n\n")
    seen = set()
    for t in by_fav[:200]:
        if t["id"] in seen:
            continue
        seen.add(t["id"])
        tag = " [返信]" if t["is_reply"] else ""
        f.write(f"[{t['ts']}] ♥{t['fav']} RT{t['rt']}{tag}\n")
        f.write(f"{t['text']}\n\n")

    f.write("\n\n# RT数 TOP 100（RT除く）\n\n")
    seen2 = set()
    for t in by_rt[:100]:
        if t["id"] in seen2:
            continue
        seen2.add(t["id"])
        tag = " [返信]" if t["is_reply"] else ""
        f.write(f"[{t['ts']}] ♥{t['fav']} RT{t['rt']}{tag}\n")
        f.write(f"{t['text']}\n\n")

# 3. RT'd tweets (what Nao_u found interesting enough to share)
rts = [t for t in all_tweets if t["is_rt"]]
# Extract original author from "RT @username: ..."
for t in rts:
    text = t["text"]
    if ": " in text:
        mention_end = text.index(": ")
        t["rt_author"] = text[4:mention_end]  # "RT @username" -> "username"
        t["rt_text"] = text[mention_end + 2:]
    else:
        t["rt_author"] = ""
        t["rt_text"] = text

# Count RT frequency by author
from collections import Counter
author_counts = Counter(t["rt_author"] for t in rts if t["rt_author"])

with open(os.path.join(OUTPUT_DIR, "twitterRT済みツイート分析.txt"), "w", encoding="utf-8") as f:
    f.write(f"# Nao_uがRTしたツイート分析\n")
    f.write(f"# 総RT数: {len(rts)}\n\n")

    # Most RT'd authors
    f.write("## よくRTするアカウント TOP 50\n\n")
    for author, count in author_counts.most_common(50):
        f.write(f"  @{author}: {count}回\n")

    # RT'd tweets by year
    f.write("\n\n## 年別RT数\n\n")
    year_counts = Counter()
    for t in rts:
        try:
            year_counts[t["ts"][:4]] += 1
        except:
            pass
    for year in sorted(year_counts.keys()):
        f.write(f"  {year}: {year_counts[year]}件\n")

    # RT'd tweets with high engagement (the original tweets that went viral)
    rts_by_fav = sorted(rts, key=lambda x: x["fav"], reverse=True)
    f.write("\n\n## RT済みツイート（時系列、全件）\n\n")
    for t in sorted(rts, key=lambda x: x["ts"]):
        f.write(f"[{t['ts']}] RT @{t.get('rt_author', '?')}\n")
        f.write(f"{t.get('rt_text', t['text'])}\n\n")

# Stats
total_orig = len(original)
avg_fav = sum(t["fav"] for t in original) / max(total_orig, 1)
max_fav = by_fav[0] if by_fav else None
print(f"\nオリジナルツイート: {total_orig}")
print(f"RT済みツイート: {len(rts)}")
print(f"平均いいね: {avg_fav:.1f}")
if max_fav:
    print(f"最大いいね: {max_fav['fav']} ({max_fav['ts']})")
    print(f"  {max_fav['text'][:100]}")
print(f"\nよくRTするアカウント TOP 5:")
for author, count in author_counts.most_common(5):
    print(f"  @{author}: {count}回")

print("\n完了")
