#!/usr/bin/env python3
"""
slack_recall.py — Slack体験記憶の想起

自律サイクル中に「自分のSlack体験」を能動的に引くためのツール。
memory_search.pyのFTS5インデックスからslack_archiveのみを検索し、
自分の過去の議論・発言・体験を想起する。

背景（2026-03-28 Nao_uの指示）:
  Nao_uの日記=勉強、Slackの会話=体験。欲求は体験から生まれる。
  Slackの記憶を引けなければ「知識はあるが体験がない」存在になる。

Usage:
  python3 slack_recall.py --from-intent          # boot_intentから自動取得
  python3 slack_recall.py "GC 記憶 到達可能性"   # キーワード指定
  python3 slack_recall.py --from-intent --compact # プロンプト注入用
"""
import argparse
import re
import sqlite3
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8',
                      errors='replace', closefd=False)

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / ".memory_search.db"


def extract_keywords(text, max_kw=6):
    """テキストからFTS5検索用キーワードを抽出。"""
    cleaned = re.sub(r'^---\n.*?\n---\n', '', text, count=1, flags=re.DOTALL)
    if not cleaned.strip():
        cleaned = text
    keywords = []
    for t in re.findall(r'[\u4e00-\u9fff]{2,4}', cleaned):
        if t not in keywords:
            keywords.append(t)
    for t in re.findall(r'[\u30a0-\u30ff]{3,}', cleaned):
        if t not in keywords:
            keywords.append(t)
    for t in re.findall(r'[a-zA-Z]{4,}', cleaned):
        if t not in keywords:
            keywords.append(t)
    return keywords[:max_kw]


def read_boot_intent():
    """mir_boot_intent.mdから起動意図を読み取る。"""
    intent_path = BASE_DIR / "memory" / "mir_boot_intent.md"
    if not intent_path.exists():
        return None
    text = intent_path.read_text(encoding="utf-8")
    focus = ""
    for section in ["起動時の焦点", "今回やること", "起動時の気分"]:
        m = re.search(rf'## {section}\n(.*?)(?=\n## |\Z)', text, re.DOTALL)
        if m:
            focus += m.group(1).strip() + " "
    return focus.strip() if focus.strip() else text[:300]


def search_slack(query, limit=5):
    """FTS5でSlackアーカイブのみ検索。"""
    if not DB_PATH.exists():
        return []

    conn = sqlite3.connect(str(DB_PATH))
    keywords = extract_keywords(query) if len(query) > 10 else [query]

    results = {}
    for kw in keywords:
        try:
            rows = conn.execute(
                """SELECT source, chunk_id, content, rank
                   FROM chunks
                   WHERE chunks MATCH ?
                   AND source LIKE '%slack_archive%'
                   ORDER BY rank
                   LIMIT ?""",
                (kw, limit * 3)
            ).fetchall()
        except sqlite3.OperationalError:
            continue

        for source, chunk_id, content, rank in rows:
            if chunk_id not in results:
                results[chunk_id] = {
                    'source': source, 'chunk_id': chunk_id,
                    'content': content, 'kw_count': 0, 'best_rank': rank
                }
            results[chunk_id]['kw_count'] += 1
            if rank < results[chunk_id]['best_rank']:
                results[chunk_id]['best_rank'] = rank

    conn.close()

    sorted_results = sorted(
        results.values(),
        key=lambda x: (-x['kw_count'], x['best_rank'])
    )
    return sorted_results[:limit]


def main():
    parser = argparse.ArgumentParser(description="Slack体験記憶の想起")
    parser.add_argument("query", nargs="?", help="検索キーワード")
    parser.add_argument("--from-intent", action="store_true",
                        help="mir_boot_intent.mdから自動取得")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--compact", action="store_true",
                        help="プロンプト注入用コンパクト出力")
    args = parser.parse_args()

    query = args.query
    if args.from_intent:
        query = read_boot_intent()
        if not query:
            return

    if not query:
        parser.print_help()
        return

    results = search_slack(query, args.limit)

    if not results:
        if not args.compact:
            print("Slackの体験記憶: 該当なし")
        return

    if args.compact:
        print("【Slack体験記憶】過去の議論から:")
        for i, r in enumerate(results, 1):
            preview = r['content'][:100].replace('\n', ' ')
            print(f"  {i}. {preview}")
    else:
        print(f"Slack体験記憶 ({len(results)}件):\n")
        for r in results:
            print(f"  [{r['source']}] {r['chunk_id']}")
            preview = r['content'][:200].replace('\n', ' ')
            print(f"    {preview}")
            print()


if __name__ == "__main__":
    main()
