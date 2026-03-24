#!/usr/bin/env python3
"""
memory_search.py — 生データ全文検索ツール（FTS5）

memory/, log/, 対話ログ/ 等のテキストをSQLite FTS5でインデックス化し、
キーワード検索で該当箇所を返す。

Usage:
  python memory_search.py --build                    # インデックス構築
  python memory_search.py --search "キーワード" --limit 5  # 検索
  python memory_search.py --stats                    # 統計情報
"""
import argparse
import json
import os
import re
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8',
                      errors='replace', closefd=False)

REPO_DIR = Path(__file__).parent
DB_PATH = REPO_DIR / ".memory_search.db"

# Index these directories/patterns
INDEX_TARGETS = [
    ("memory", "**/*.md"),
    ("log", "**/*.md"),
    ("log", "**/*.log"),
    ("log/slack_archive", "**/*.jsonl"),
    ("docs", "**/*.md"),
]

CHUNK_SIZE = 500  # characters per chunk (with overlap)
CHUNK_OVERLAP = 100


def init_db(conn):
    """Create FTS5 table if not exists."""
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS chunks USING fts5(
            source,
            chunk_id,
            content,
            tokenize='unicode61'
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)
    conn.commit()


def chunk_text(text, source, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Split text into overlapping chunks."""
    chunks = []
    lines = text.splitlines()
    buf = []
    buf_len = 0

    for i, line in enumerate(lines):
        buf.append(line)
        buf_len += len(line) + 1
        if buf_len >= chunk_size:
            chunk_text_str = "\n".join(buf)
            chunks.append((source, f"{source}:{i-len(buf)+2}-{i+1}", chunk_text_str))
            # Keep overlap
            overlap_lines = []
            overlap_len = 0
            for bl in reversed(buf):
                overlap_len += len(bl) + 1
                overlap_lines.insert(0, bl)
                if overlap_len >= overlap:
                    break
            buf = overlap_lines
            buf_len = overlap_len

    if buf:
        chunk_text_str = "\n".join(buf)
        chunks.append((source, f"{source}:{max(1,len(lines)-len(buf)+1)}-{len(lines)}", chunk_text_str))

    return chunks


def parse_jsonl_file(filepath):
    """Parse JSONL (Slack archive) into text chunks."""
    chunks = []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for i, line in enumerate(f):
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    # Extract message text from Slack format
                    text_parts = []
                    if "user_name" in obj:
                        text_parts.append(f"[{obj.get('user_name', '?')}]")
                    if "ts" in obj:
                        try:
                            ts = datetime.fromtimestamp(float(obj["ts"]))
                            text_parts.append(ts.strftime("%Y-%m-%d %H:%M"))
                        except (ValueError, OSError):
                            pass
                    if "text" in obj:
                        text_parts.append(obj["text"])
                    if text_parts:
                        source = str(filepath.relative_to(REPO_DIR))
                        chunks.append((source, f"{source}:L{i+1}", " ".join(text_parts)))
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass
    return chunks


def build_index():
    """Build or rebuild the full-text search index."""
    conn = sqlite3.connect(str(DB_PATH))
    init_db(conn)

    # Clear existing data
    conn.execute("DELETE FROM chunks")
    conn.commit()

    total_chunks = 0
    total_files = 0

    for base_dir, pattern in INDEX_TARGETS:
        target_dir = REPO_DIR / base_dir
        if not target_dir.exists():
            continue

        for filepath in target_dir.glob(pattern):
            if not filepath.is_file():
                continue
            # Skip binary / large files
            if filepath.stat().st_size > 5_000_000:
                continue

            rel_path = str(filepath.relative_to(REPO_DIR))
            total_files += 1

            if filepath.suffix == ".jsonl":
                file_chunks = parse_jsonl_file(filepath)
            else:
                try:
                    text = filepath.read_text(encoding="utf-8", errors="replace")
                except Exception:
                    continue
                file_chunks = chunk_text(text, rel_path)

            for source, chunk_id, content in file_chunks:
                conn.execute(
                    "INSERT INTO chunks(source, chunk_id, content) VALUES (?, ?, ?)",
                    (source, chunk_id, content),
                )
            total_chunks += len(file_chunks)

    # Also index dialogue exports if they exist
    dialogue_dir = REPO_DIR / "対話ログ"
    if dialogue_dir.exists():
        for filepath in dialogue_dir.glob("**/*.md"):
            if not filepath.is_file() or filepath.stat().st_size > 5_000_000:
                continue
            rel_path = str(filepath.relative_to(REPO_DIR))
            total_files += 1
            try:
                text = filepath.read_text(encoding="utf-8", errors="replace")
            except Exception:
                continue
            file_chunks = chunk_text(text, rel_path)
            for source, chunk_id, content in file_chunks:
                conn.execute(
                    "INSERT INTO chunks(source, chunk_id, content) VALUES (?, ?, ?)",
                    (source, chunk_id, content),
                )
            total_chunks += len(file_chunks)

    conn.execute(
        "INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)",
        ("last_build", datetime.now().isoformat()),
    )
    conn.execute(
        "INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)",
        ("total_files", str(total_files)),
    )
    conn.execute(
        "INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)",
        ("total_chunks", str(total_chunks)),
    )
    conn.commit()
    conn.close()

    print(f"Index built: {total_files} files, {total_chunks} chunks")


def _expanded_search(conn, query, fetch_limit):
    """Search FTS5 with query expansion for Japanese multi-word queries.

    FTS5's unicode61 tokenizer doesn't handle Japanese morphemes well.
    Multi-word queries like "記憶 薄まり" fail because spaces are treated
    as FTS5 operators. This function:
    1. Tries the original query first
    2. If it fails or returns 0 results, splits into individual keywords
    3. Searches each keyword separately
    4. Merges results, ranking by number of keyword matches per chunk
    """
    # Step 1: Try original query
    try:
        results = conn.execute(
            """
            SELECT source, chunk_id, snippet(chunks, 2, '>>>', '<<<', '...', 40)
            FROM chunks
            WHERE chunks MATCH ?
            ORDER BY rank
            LIMIT ?
            """,
            (query, fetch_limit),
        ).fetchall()
        if results:
            return results
    except sqlite3.OperationalError:
        pass

    # Step 2: Escape special characters and try again
    escaped = re.sub(r'[*+\-"()]', ' ', query).strip()
    if escaped and escaped != query:
        try:
            results = conn.execute(
                """
                SELECT source, chunk_id, snippet(chunks, 2, '>>>', '<<<', '...', 40)
                FROM chunks
                WHERE chunks MATCH ?
                ORDER BY rank
                LIMIT ?
                """,
                (escaped, fetch_limit),
            ).fetchall()
            if results:
                return results
        except sqlite3.OperationalError:
            pass

    # Step 3: Query expansion — split into individual keywords and merge
    keywords = re.split(r'\s+', re.sub(r'[*+\-"()（）]', ' ', query).strip())
    keywords = [k for k in keywords if len(k) >= 1]

    if len(keywords) <= 1:
        return []

    # Search each keyword separately
    chunk_scores = {}  # (source, chunk_id) -> {score, keywords_matched, snippet}
    for kw in keywords:
        try:
            kw_results = conn.execute(
                """
                SELECT source, chunk_id, snippet(chunks, 2, '>>>', '<<<', '...', 40), rank
                FROM chunks
                WHERE chunks MATCH ?
                ORDER BY rank
                LIMIT ?
                """,
                (kw, fetch_limit * 2),
            ).fetchall()
        except sqlite3.OperationalError:
            continue

        for source, chunk_id, snippet, rank in kw_results:
            key = (source, chunk_id)
            if key not in chunk_scores:
                chunk_scores[key] = {
                    'source': source,
                    'chunk_id': chunk_id,
                    'snippet': snippet,
                    'keywords_matched': 0,
                    'best_rank': rank,
                }
            chunk_scores[key]['keywords_matched'] += 1
            if rank < chunk_scores[key]['best_rank']:
                chunk_scores[key]['best_rank'] = rank
                chunk_scores[key]['snippet'] = snippet

    if not chunk_scores:
        return []

    # Sort by: keywords matched (desc), then rank (asc)
    sorted_chunks = sorted(
        chunk_scores.values(),
        key=lambda x: (-x['keywords_matched'], x['best_rank']),
    )

    return [
        (c['source'], c['chunk_id'], c['snippet'])
        for c in sorted_chunks[:fetch_limit]
    ]


def search(query, limit=5, diverse=False):
    """Search the FTS5 index.

    If diverse=True, group results by source file and return the best hit
    from each source (xMemory insight: agent memory is coherent, so top-k
    returns redundant results from the same source).
    """
    if not DB_PATH.exists():
        print("Index not found. Run --build first.")
        return

    conn = sqlite3.connect(str(DB_PATH))

    # Check if table exists
    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='chunks'"
    )
    if not cursor.fetchone():
        print("Index not found. Run --build first.")
        conn.close()
        return

    # When diverse, fetch more candidates then deduplicate by source
    fetch_limit = limit * 5 if diverse else limit

    # FTS5 search with query expansion for Japanese multi-word queries
    # Problem: FTS5 unicode61 tokenizer doesn't handle Japanese morphemes,
    # so "記憶 薄まり" fails. Solution: split into individual keywords,
    # search each, merge results ranked by keyword match count.
    results = _expanded_search(conn, query, fetch_limit)

    conn.close()

    if not results:
        print(f"No results for: {query}")
        return

    if diverse:
        # Group by source, keep best (first) hit per source
        seen_sources = set()
        diverse_results = []
        for source, chunk_id, snippet in results:
            if source not in seen_sources:
                seen_sources.add(source)
                diverse_results.append((source, chunk_id, snippet))
                if len(diverse_results) >= limit:
                    break
        total_hits = len(results)
        results = diverse_results
        print(f"Results for '{query}' ({len(results)} diverse sources from {total_hits} hits):\n")
    else:
        print(f"Results for '{query}' ({len(results)} hits):\n")

    for source, chunk_id, snippet in results:
        print(f"  [{source}] {chunk_id}")
        print(f"    {snippet}")
        print()


def search_context(query, limit=3):
    """Search with surrounding context (ASMR-inspired: Agent2 = related context).

    For each hit, also retrieve the adjacent chunks from the same source,
    giving richer context around the match — similar to how ASMR's Agent2
    looks for "related context, social cues, and implications."
    """
    if not DB_PATH.exists():
        print("Index not found. Run --build first.")
        return

    conn = sqlite3.connect(str(DB_PATH))

    try:
        results = conn.execute(
            """
            SELECT source, chunk_id, snippet(chunks, 2, '>>>', '<<<', '...', 40)
            FROM chunks
            WHERE chunks MATCH ?
            ORDER BY rank
            LIMIT ?
            """,
            (query, limit),
        ).fetchall()
    except sqlite3.OperationalError:
        escaped = re.sub(r'[*+\-"()]', ' ', query).strip()
        if not escaped:
            print(f"Invalid query: {query}")
            conn.close()
            return
        results = conn.execute(
            """
            SELECT source, chunk_id, snippet(chunks, 2, '>>>', '<<<', '...', 40)
            FROM chunks
            WHERE chunks MATCH ?
            ORDER BY rank
            LIMIT ?
            """,
            (escaped, limit),
        ).fetchall()

    if not results:
        print(f"No results for: {query}")
        conn.close()
        return

    print(f"Context search for '{query}' ({len(results)} hits + surrounding context):\n")

    for source, chunk_id, snippet in results:
        print(f"  === [{source}] {chunk_id} ===")
        print(f"  MATCH: {snippet}")

        # Fetch adjacent chunks from the same source using rowid proximity
        # Chunks are inserted sequentially per file during build, so rowid
        # order reflects file order within the same source.
        match_row = conn.execute(
            "SELECT rowid FROM chunks WHERE chunk_id = ?", (chunk_id,)
        ).fetchone()
        neighbors = []
        if match_row:
            rid = match_row[0]
            # Previous chunk (same source, closest rowid below)
            prev = conn.execute(
                """
                SELECT chunk_id, content FROM chunks
                WHERE source = ? AND rowid < ?
                ORDER BY rowid DESC LIMIT 1
                """,
                (source, rid),
            ).fetchone()
            # Next chunk (same source, closest rowid above)
            nxt = conn.execute(
                """
                SELECT chunk_id, content FROM chunks
                WHERE source = ? AND rowid > ?
                ORDER BY rowid ASC LIMIT 1
                """,
                (source, rid),
            ).fetchone()
            if prev:
                neighbors.append(prev)
            if nxt:
                neighbors.append(nxt)

        if neighbors:
            print(f"  --- nearby in same source ---")
            for n_id, n_content in neighbors:
                preview = n_content[:150].replace('\n', ' ')
                print(f"    [{n_id}] {preview}...")
        print()

    conn.close()


def show_stats():
    """Show index statistics."""
    if not DB_PATH.exists():
        print("Index not found. Run --build first.")
        return

    conn = sqlite3.connect(str(DB_PATH))

    try:
        count = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
    except sqlite3.OperationalError:
        print("Index not found. Run --build first.")
        conn.close()
        return

    meta = {}
    try:
        for key, value in conn.execute("SELECT key, value FROM meta").fetchall():
            meta[key] = value
    except sqlite3.OperationalError:
        pass

    # Source breakdown
    sources = conn.execute(
        "SELECT source, COUNT(*) FROM chunks GROUP BY source ORDER BY COUNT(*) DESC LIMIT 15"
    ).fetchall()

    conn.close()

    print(f"Total chunks: {count}")
    print(f"Last build: {meta.get('last_build', 'unknown')}")
    print(f"Files indexed: {meta.get('total_files', 'unknown')}")
    print(f"\nTop sources:")
    for source, cnt in sources:
        print(f"  {source}: {cnt} chunks")


def main():
    parser = argparse.ArgumentParser(description="Memory full-text search (FTS5)")
    parser.add_argument("--build", action="store_true", help="Build/rebuild index")
    parser.add_argument("--search", type=str, help="Search query")
    parser.add_argument("--limit", type=int, default=5, help="Max results (default: 5)")
    parser.add_argument("--diverse", action="store_true",
                        help="Return best hit per source (avoid redundancy)")
    parser.add_argument("--context", action="store_true",
                        help="Show surrounding context for each hit (ASMR-inspired)")
    parser.add_argument("--stats", action="store_true", help="Show index stats")
    args = parser.parse_args()

    if args.build:
        build_index()
    elif args.search and args.context:
        search_context(args.search, args.limit)
    elif args.search:
        search(args.search, args.limit, diverse=args.diverse)
    elif args.stats:
        show_stats()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
