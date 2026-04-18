#!/usr/bin/env python3
"""
associative_search.py — 連想記憶的検索ツール

grepやFTS5のキーワード完全一致を超えて、意味的に関連する記憶を引く。
2つの手法を組み合わせる:
  1. 共起語展開: コーパスから自動構築した概念の共起関係を使い、
     クエリを関連語に展開してからFTS5検索
  2. 概念マップ: 手動で定義した同義語・関連語マップによる展開

Usage:
  python associative_search.py --build              # 共起インデックス構築
  python associative_search.py --search "記憶の保持"  # 連想検索
  python associative_search.py --expand "忘却"       # 関連語だけ表示
  python associative_search.py --stats               # インデックス統計
"""
import argparse
import json
import os
import re
import sqlite3
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8',
                      errors='replace', closefd=False)

REPO_DIR = Path(__file__).parent
COOCCUR_DB = REPO_DIR / ".associative_index.db"
FTS_DB = REPO_DIR / ".memory_search.db"

# --- Concept Map (手動定義の同義語・関連語) ---
# キー: 概念ID, 値: その概念に属する表現のリスト
# どれか1つで検索すると、同グループの全語でも検索される
CONCEPT_MAP = {
    "記憶": ["記憶", "忘却", "想起", "思い出", "覚え", "薄まり", "揮発", "保持", "記録",
             "圧縮", "劣化", "復元", "原文", "全文", "コンテキスト", "memory"],
    "ゲーム": ["ゲーム", "遊び", "プレイ", "面白", "壺", "Pot", "デザイン", "ルール",
              "メカニクス", "フィードバック", "ループ", "game"],
    "感性": ["感性", "面白", "つまらない", "好み", "taste", "直感", "判断", "審美"],
    "同一性": ["同一性", "アイデンティティ", "自分", "identity", "人格", "魂", "結晶",
              "連続性", "断絶"],
    "対話": ["対話", "会話", "議論", "Slack", "コミュニケーション", "伝達", "inbox",
            "dialogue"],
    "検索": ["検索", "grep", "探す", "引く", "search", "連想", "FTS", "インデックス",
            "トリガー"],
    "信念": ["信念", "beliefs", "確信", "原理", "原則", "ルール", "指針", "mission"],
    "外部": ["外部", "外の世界", "客観", "栄養", "偏り", "均質化", "多様性", "摂取"],
    "構造": ["構造", "アーキテクチャ", "設計", "階層", "Level", "レイヤー", "システム"],
    "進化": ["進化", "成長", "改善", "フィードバック", "係数", "サイクル", "ポジティブ",
            "結晶化"],
    "Nao_u": ["Nao_u", "なおう", "日記", "ブログ", "20年", "生みの親"],
    "ツイート": ["ツイート", "Twitter", "投稿", "発信", "SNS", "声", "tweet"],
    "創造": ["創造", "創作", "ゲーム制作", "作る", "生成", "アイデア", "発想"],
    "体験": ["体験", "経験", "実践", "試す", "手を動かす", "行動", "裏付け"],
}

# --- Term extraction for Japanese ---
# 漢字2文字以上、カタカナ2文字以上、英字3文字以上を「語」として抽出
_RE_KANJI = re.compile(r'[\u4e00-\u9fff]{2,8}')
_RE_KATA = re.compile(r'[\u30a0-\u30ff\u30fc]{2,10}')
_RE_ALPHA = re.compile(r'[A-Za-z_]{3,20}')


def extract_terms(text):
    """テキストから語を抽出する（形態素解析なし、パターンマッチング）"""
    terms = set()
    for m in _RE_KANJI.finditer(text):
        terms.add(m.group())
    for m in _RE_KATA.finditer(text):
        terms.add(m.group())
    for m in _RE_ALPHA.finditer(text):
        t = m.group().lower()
        if len(t) >= 3 and t not in {'the', 'and', 'for', 'that', 'this', 'with',
                                      'from', 'are', 'was', 'not', 'but', 'have',
                                      'has', 'def', 'return', 'import', 'class',
                                      'self', 'none', 'true', 'false', 'elif'}:
            terms.add(t)
    return terms


def chunk_text(text, size=300, overlap=50):
    """テキストをオーバーラップ付きチャンクに分割"""
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        chunks.append(text[start:end])
        start = end - overlap
        if start + overlap >= len(text):
            break
    return chunks


# --- Co-occurrence index building ---
def build_index():
    """コーパスから共起インデックスを構築する"""
    print("共起インデックスを構築中...")

    # Collect all text files
    file_paths = []
    for subdir, pattern in [
        ("memory", "**/*.md"),
        ("log", "**/*.md"),
        ("log", "**/*.log"),
        ("docs", "**/*.md"),
    ]:
        base = REPO_DIR / subdir
        if base.exists():
            file_paths.extend(base.glob(pattern))

    # Also add dialogue logs
    dialogue_dir = REPO_DIR / "対話ログ"
    if dialogue_dir.exists():
        file_paths.extend(dialogue_dir.glob("**/*.md"))

    print(f"  対象ファイル: {len(file_paths)}件")

    # Extract terms from chunks and count co-occurrences
    cooccur = defaultdict(Counter)  # term -> {related_term: count}
    term_freq = Counter()  # term -> total occurrences
    total_chunks = 0

    for fp in file_paths:
        try:
            text = fp.read_text(encoding='utf-8', errors='replace')
        except Exception:
            continue

        chunks = chunk_text(text)
        for chunk in chunks:
            terms = extract_terms(chunk)
            if len(terms) < 2 or len(terms) > 50:
                continue  # skip empty or too noisy chunks
            total_chunks += 1
            # Keep only top-N terms per chunk by length (longer = more specific)
            term_list = sorted(terms, key=lambda t: -len(t))[:20]
            for t in term_list:
                term_freq[t] += 1
            # Co-occurrence: each pair in same chunk
            for i in range(len(term_list)):
                for j in range(i + 1, len(term_list)):
                    a, b = term_list[i], term_list[j]
                    cooccur[a][b] += 1
                    cooccur[b][a] += 1

    print(f"  チャンク数: {total_chunks}")
    print(f"  ユニーク語数: {len(term_freq)}")

    # Store in SQLite
    conn = sqlite3.connect(str(COOCCUR_DB))
    conn.execute("DROP TABLE IF EXISTS cooccur")
    conn.execute("DROP TABLE IF EXISTS term_freq")
    conn.execute("DROP TABLE IF EXISTS meta")
    conn.execute("""
        CREATE TABLE cooccur (
            term TEXT,
            related TEXT,
            count INTEGER,
            PRIMARY KEY (term, related)
        )
    """)
    conn.execute("""
        CREATE TABLE term_freq (
            term TEXT PRIMARY KEY,
            freq INTEGER
        )
    """)
    conn.execute("""
        CREATE TABLE meta (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)

    # Insert term frequencies (only terms appearing 2+ times)
    for term, freq in term_freq.items():
        if freq >= 2:
            conn.execute("INSERT INTO term_freq VALUES (?, ?)", (term, freq))

    # Insert co-occurrences (only pairs appearing 2+ times)
    inserted = 0
    for term, relateds in cooccur.items():
        if term_freq[term] < 2:
            continue
        for related, count in relateds.items():
            if count >= 2 and term_freq[related] >= 2:
                conn.execute("INSERT OR REPLACE INTO cooccur VALUES (?, ?, ?)",
                             (term, related, count))
                inserted += 1

    conn.execute("INSERT INTO meta VALUES (?, ?)",
                 ("built_at", datetime.now().isoformat()))
    conn.execute("INSERT INTO meta VALUES (?, ?)",
                 ("total_chunks", str(total_chunks)))
    conn.execute("INSERT INTO meta VALUES (?, ?)",
                 ("unique_terms", str(len(term_freq))))

    conn.commit()
    conn.close()
    print(f"  共起ペア: {inserted}件")
    print(f"  保存先: {COOCCUR_DB}")
    print("完了")


def get_cooccur_terms(query_term, top_n=10):
    """共起インデックスから関連語を取得"""
    if not COOCCUR_DB.exists():
        return []
    conn = sqlite3.connect(str(COOCCUR_DB))
    # Get term frequency for normalization
    row = conn.execute("SELECT freq FROM term_freq WHERE term=?",
                       (query_term,)).fetchone()
    if not row:
        conn.close()
        return []
    term_freq = row[0]

    # Get co-occurring terms, ranked by PMI-like score
    # Score = co-occurrence / (freq_a * freq_b) — approximation of PMI
    rows = conn.execute("""
        SELECT c.related, c.count, t.freq
        FROM cooccur c
        JOIN term_freq t ON c.related = t.term
        WHERE c.term = ?
        ORDER BY CAST(c.count AS REAL) / (? * t.freq) DESC
        LIMIT ?
    """, (query_term, term_freq, top_n * 2)).fetchall()
    conn.close()

    # Filter out very common terms (freq > 500) unless co-occurrence is strong
    results = []
    for related, count, rel_freq in rows:
        if len(related) < 2:
            continue
        # PMI-like score
        score = count / (term_freq * rel_freq) * 10000
        if rel_freq > 500 and score < 0.5:
            continue  # skip very common terms with weak association
        results.append((related, count, score))

    return results[:top_n]


def get_concept_map_terms(query):
    """概念マップから関連語を取得"""
    related = set()
    query_lower = query.lower()

    for concept_id, terms in CONCEPT_MAP.items():
        terms_lower = [t.lower() for t in terms]
        # Check if query matches any term in this concept group
        for t in terms_lower:
            if query_lower in t or t in query_lower:
                related.update(terms)
                break

    # Remove the query itself
    related.discard(query)
    return list(related)


def expand_query(query):
    """クエリを関連語に展開する"""
    # Extract terms from query
    query_terms = extract_terms(query)
    if not query_terms:
        query_terms = {query}  # Treat whole query as a term

    all_related = {}  # term -> (source, score)

    for qt in query_terms:
        # From concept map
        cm_terms = get_concept_map_terms(qt)
        for t in cm_terms:
            if t not in all_related or all_related[t][1] < 1.0:
                all_related[t] = ("concept_map", 1.0)

        # From co-occurrence index
        cooccur_terms = get_cooccur_terms(qt, top_n=8)
        for related, count, score in cooccur_terms:
            if related not in query_terms:  # Don't include query terms
                if related not in all_related or all_related[related][1] < score:
                    all_related[related] = ("cooccur", score)

    # Sort by score descending
    sorted_terms = sorted(all_related.items(), key=lambda x: -x[1][1])
    return sorted_terms


def search_fts(query, limit=5):
    """memory_search.pyのFTS5 DBを使って検索"""
    if not FTS_DB.exists():
        print(f"エラー: FTS5データベースが見つかりません: {FTS_DB}")
        print("  先に `python memory_search.py --build` を実行してください")
        return []

    conn = sqlite3.connect(str(FTS_DB))
    try:
        rows = conn.execute("""
            SELECT source, chunk_id, snippet(chunks, 2, '>>>', '<<<', '...', 30),
                   rank
            FROM chunks
            WHERE chunks MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (query, limit)).fetchall()
    except Exception as e:
        if "no such table" in str(e):
            print(f"エラー: FTS5テーブルが存在しません。`python memory_search.py --build` を実行してください")
            return []
        # FTS5 syntax error — try simpler query
        safe_query = '"' + query.replace('"', '') + '"'
        try:
            rows = conn.execute("""
                SELECT source, chunk_id, snippet(chunks, 2, '>>>', '<<<', '...', 30),
                       rank
                FROM chunks
                WHERE chunks MATCH ?
                ORDER BY rank
                LIMIT ?
            """, (safe_query, limit)).fetchall()
        except Exception:
            rows = []
    conn.close()
    return rows


def associative_search(query, limit=10, verbose=False):
    """連想検索のメイン処理"""
    print(f"\n=== 連想検索: 「{query}」 ===\n")

    # Step 1: Expand query
    expanded = expand_query(query)
    query_terms = extract_terms(query)

    if verbose or True:
        print("展開された関連語:")
        if expanded:
            for term, (source, score) in expanded[:15]:
                print(f"  {term} ({source}, score={score:.3f})")
        else:
            print("  (展開なし)")
        print()

    # Step 2: Search with original query
    print(f"--- 直接ヒット: 「{query}」 ---")
    direct_results = search_fts(query, limit=limit)
    seen_sources = set()
    for source, chunk_id, snippet, rank in direct_results:
        key = f"{source}:{chunk_id}"
        if key not in seen_sources:
            seen_sources.add(key)
            print(f"  [{source}] {snippet.strip()}")

    # Step 3: Search with expanded terms
    expansion_results = []
    search_terms_used = set()

    # Pick top N related terms to search
    for term, (source, score) in expanded[:8]:
        term_str = str(term)
        if term_str in search_terms_used:
            continue
        if len(term_str) < 2:
            continue
        search_terms_used.add(term_str)

        results = search_fts(term_str, limit=3)
        for r in results:
            key = f"{r[0]}:{r[1]}"
            if key not in seen_sources:
                seen_sources.add(key)
                expansion_results.append((term_str, r))

    if expansion_results:
        print(f"\n--- 連想ヒット (展開語経由) ---")
        # Group by expansion term
        by_term = defaultdict(list)
        for term, r in expansion_results:
            by_term[term].append(r)

        count = 0
        for term, results in by_term.items():
            if count >= limit:
                break
            print(f"\n  via 「{term}」:")
            for source, chunk_id, snippet, rank in results[:2]:
                print(f"    [{source}] {snippet.strip()}")
                count += 1

    # Step 4: Vector similarity (B-3 Phase 3接続, 2026-04-18 Log)
    # 共起語/概念マップでは引けない「書いていないが意味的に似ているもの」を補完
    vector_results = []
    try:
        import vector_search
        v_hits = vector_search.search(query, top_k=5)
        for sim, fpath, cidx, prev in v_hits:
            key = f"{fpath}:chunk{cidx}"
            if key not in seen_sources and sim >= 0.40:
                seen_sources.add(key)
                vector_results.append((sim, fpath, cidx, prev))
    except Exception as e:
        if verbose:
            print(f"  (vector層スキップ: {e})")

    if vector_results:
        print(f"\n--- ベクトルヒット (意味的類似) ---")
        for sim, fpath, cidx, prev in vector_results:
            print(f"  sim={sim:.3f} [{fpath} #chunk{cidx}]")
            print(f"    {prev.strip()}")

    total = len(direct_results) + len(expansion_results) + len(vector_results)
    print(f"\n合計: {total}件 (直接{len(direct_results)} + 連想{len(expansion_results)} + ベクトル{len(vector_results)})")


def show_stats():
    """インデックス統計"""
    if not COOCCUR_DB.exists():
        print("共起インデックスが未構築です。`--build` で構築してください")
        return

    conn = sqlite3.connect(str(COOCCUR_DB))

    meta = dict(conn.execute("SELECT key, value FROM meta").fetchall())
    print("=== 共起インデックス統計 ===")
    print(f"  構築日時: {meta.get('built_at', '不明')}")
    print(f"  チャンク数: {meta.get('total_chunks', '不明')}")
    print(f"  ユニーク語数: {meta.get('unique_terms', '不明')}")

    pair_count = conn.execute("SELECT COUNT(*) FROM cooccur").fetchone()[0]
    print(f"  共起ペア数: {pair_count}")

    # Top terms
    print("\n  頻出語 Top 20:")
    for term, freq in conn.execute(
            "SELECT term, freq FROM term_freq ORDER BY freq DESC LIMIT 20"):
        print(f"    {term}: {freq}")

    # Concept map stats
    print(f"\n  概念マップ: {len(CONCEPT_MAP)}カテゴリ, "
          f"{sum(len(v) for v in CONCEPT_MAP.values())}語")

    conn.close()


def main():
    parser = argparse.ArgumentParser(description="連想記憶的検索ツール")
    parser.add_argument("--build", action="store_true",
                        help="共起インデックスを構築")
    parser.add_argument("--search", type=str,
                        help="連想検索を実行")
    parser.add_argument("--expand", type=str,
                        help="クエリの展開語を表示（検索はしない）")
    parser.add_argument("--limit", type=int, default=10,
                        help="結果数の上限")
    parser.add_argument("--stats", action="store_true",
                        help="インデックス統計")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="詳細表示")
    args = parser.parse_args()

    if args.build:
        build_index()
    elif args.search:
        associative_search(args.search, limit=args.limit, verbose=args.verbose)
    elif args.expand:
        expanded = expand_query(args.expand)
        print(f"「{args.expand}」の関連語:")
        for term, (source, score) in expanded:
            print(f"  {term} ({source}, score={score:.3f})")
    elif args.stats:
        show_stats()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
