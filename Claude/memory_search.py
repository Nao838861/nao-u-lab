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
    ("knowledge", "**/*.md"),
]

CHUNK_SIZE = 500  # characters per chunk (with overlap)
CHUNK_OVERLAP = 100

# Date extraction patterns
_DATE_YYYYMMDD = re.compile(r'(\d{4})(\d{2})(\d{2})')  # 20260314
_DATE_YYYY_MM_DD = re.compile(r'(\d{4})-(\d{2})-(\d{2})')  # 2026-03-14
_DATE_HEADER = re.compile(r'^#+\s*(\d{4})-(\d{2})-(\d{2})')  # ## 2026-03-14


def extract_date_from_filename(filepath_str):
    """Extract date from filename like dialogue_identity_20260314.md."""
    basename = os.path.basename(filepath_str)
    m = _DATE_YYYYMMDD.search(basename)
    if m:
        y, mo, d = m.group(1), m.group(2), m.group(3)
        if 2020 <= int(y) <= 2030 and 1 <= int(mo) <= 12 and 1 <= int(d) <= 31:
            return f"{y}-{mo}-{d}"
    return None


def extract_date_from_chunk(text):
    """Extract the most recent date found in chunk content (header or inline)."""
    for line in text.splitlines()[:10]:  # Check first 10 lines only
        m = _DATE_HEADER.match(line.strip())
        if m:
            return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    # Fallback: any YYYY-MM-DD in first 5 lines
    for line in text.splitlines()[:5]:
        m = _DATE_YYYY_MM_DD.search(line)
        if m:
            return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    return None


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
    conn.execute("""
        CREATE TABLE IF NOT EXISTS chunk_dates (
            chunk_id TEXT PRIMARY KEY,
            date TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS search_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            result_count INTEGER,
            hit_sources TEXT
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_chunk_dates_date
        ON chunk_dates(date)
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
    """Parse JSONL (Slack archive) into text chunks with date extraction.

    Returns list of (source, chunk_id, content, date_str_or_None).
    """
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
                    date_str = None
                    if "user_name" in obj:
                        text_parts.append(f"[{obj.get('user_name', '?')}]")
                    if "ts" in obj:
                        try:
                            ts = datetime.fromtimestamp(float(obj["ts"]))
                            text_parts.append(ts.strftime("%Y-%m-%d %H:%M"))
                            date_str = ts.strftime("%Y-%m-%d")
                        except (ValueError, OSError):
                            pass
                    if "text" in obj:
                        text_parts.append(obj["text"])
                    if text_parts:
                        source = str(filepath.relative_to(REPO_DIR))
                        chunks.append((source, f"{source}:L{i+1}", " ".join(text_parts), date_str))
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
    conn.execute("DELETE FROM chunk_dates")
    conn.commit()

    total_chunks = 0
    total_files = 0
    dated_chunks = 0

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
                # JSONL returns 4-tuples with date
                file_chunks_with_dates = parse_jsonl_file(filepath)
                for source, chunk_id, content, date_str in file_chunks_with_dates:
                    conn.execute(
                        "INSERT INTO chunks(source, chunk_id, content) VALUES (?, ?, ?)",
                        (source, chunk_id, content),
                    )
                    if date_str:
                        conn.execute(
                            "INSERT OR IGNORE INTO chunk_dates(chunk_id, date) VALUES (?, ?)",
                            (chunk_id, date_str),
                        )
                        dated_chunks += 1
                total_chunks += len(file_chunks_with_dates)
            else:
                try:
                    text = filepath.read_text(encoding="utf-8", errors="replace")
                except Exception:
                    continue
                file_chunks = chunk_text(text, rel_path)
                file_date = extract_date_from_filename(rel_path)
                for source, chunk_id, content in file_chunks:
                    conn.execute(
                        "INSERT INTO chunks(source, chunk_id, content) VALUES (?, ?, ?)",
                        (source, chunk_id, content),
                    )
                    # Try chunk content date first, then filename date
                    chunk_date = extract_date_from_chunk(content) or file_date
                    if chunk_date:
                        conn.execute(
                            "INSERT OR IGNORE INTO chunk_dates(chunk_id, date) VALUES (?, ?)",
                            (chunk_id, chunk_date),
                        )
                        dated_chunks += 1
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
            file_date = extract_date_from_filename(rel_path)
            for source, chunk_id, content in file_chunks:
                conn.execute(
                    "INSERT INTO chunks(source, chunk_id, content) VALUES (?, ?, ?)",
                    (source, chunk_id, content),
                )
                chunk_date = extract_date_from_chunk(content) or file_date
                if chunk_date:
                    conn.execute(
                        "INSERT OR IGNORE INTO chunk_dates(chunk_id, date) VALUES (?, ?)",
                        (chunk_id, chunk_date),
                    )
                    dated_chunks += 1
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
    conn.execute(
        "INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)",
        ("dated_chunks", str(dated_chunks)),
    )
    conn.commit()
    conn.close()

    print(f"Index built: {total_files} files, {total_chunks} chunks ({dated_chunks} with dates)")


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

    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS search_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                result_count INTEGER,
                hit_sources TEXT
            )
        """)
        hit_sources = ",".join(set(r[0] for r in results)) if results else ""
        conn.execute(
            "INSERT INTO search_log (query, timestamp, result_count, hit_sources) VALUES (?, ?, ?, ?)",
            (query, datetime.now().isoformat(), len(results) if results else 0, hit_sources)
        )
        conn.commit()
    except sqlite3.OperationalError:
        pass

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

    Uses _expanded_search for Japanese multi-word query support.
    """
    if not DB_PATH.exists():
        print("Index not found. Run --build first.")
        return

    conn = sqlite3.connect(str(DB_PATH))

    # Use expanded search (handles Japanese multi-word queries)
    results = _expanded_search(conn, query, limit)

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


def search_temporal(when=None, period=None, query=None, limit=10):
    """Search by time axis. Shows what was happening on/around a date.

    Args:
        when: Single date string "YYYY-MM-DD" — show chunks from that day
        period: Tuple of (start, end) date strings — show chunks in range
        query: Optional keyword to filter within the time range
        limit: Max results
    """
    if not DB_PATH.exists():
        print("Index not found. Run --build first.")
        return

    conn = sqlite3.connect(str(DB_PATH))

    if when:
        date_start = when
        date_end = when
        label = f"on {when}"
    elif period:
        date_start, date_end = period
        label = f"from {date_start} to {date_end}"
    else:
        print("Specify --when or --period")
        conn.close()
        return

    if query:
        # Time-filtered keyword search: two-pass approach
        # Pass 1: FTS5 relevance-ranked results filtered by date (fast but may miss)
        # Pass 2: Date-scoped chunks filtered by keyword (catches what Pass 1 misses)
        keyword_results = _expanded_search(conn, query, limit * 100)
        filtered = []
        if keyword_results:
            for source, chunk_id, snippet in keyword_results:
                row = conn.execute(
                    "SELECT date FROM chunk_dates WHERE chunk_id = ? AND date BETWEEN ? AND ?",
                    (chunk_id, date_start, date_end),
                ).fetchone()
                if row:
                    filtered.append((source, chunk_id, snippet, row[0]))
                    if len(filtered) >= limit:
                        break

        # Pass 2: If Pass 1 didn't find enough, search date-scoped chunks by LIKE
        if len(filtered) < limit:
            keywords = re.split(r'\s+', re.sub(r'[*+\-"()（）]', ' ', query).strip())
            keywords = [k for k in keywords if len(k) >= 1]
            seen_ids = {f[1] for f in filtered}
            like_clauses = " AND ".join(
                f"c.content LIKE '%' || ? || '%'" for _ in keywords
            )
            pass2_results = conn.execute(
                f"""
                SELECT cd.date, c.source, c.chunk_id, substr(c.content, 1, 200)
                FROM chunk_dates cd
                JOIN chunks c ON c.chunk_id = cd.chunk_id
                WHERE cd.date BETWEEN ? AND ?
                AND {like_clauses}
                ORDER BY cd.date DESC
                LIMIT ?
                """,
                (date_start, date_end, *keywords, limit - len(filtered)),
            ).fetchall()
            for date, source, chunk_id, content in pass2_results:
                if chunk_id not in seen_ids:
                    filtered.append((source, chunk_id, content[:200], date))

        if not filtered:
            print(f"No results for '{query}' {label}")
            conn.close()
            return

        print(f"Results for '{query}' {label} ({len(filtered)} hits):\n")
        for source, chunk_id, snippet, date in filtered:
            print(f"  [{date}] [{source}] {chunk_id}")
            print(f"    {snippet}")
            print()
    else:
        # Pure temporal browse: show all chunks from that date/range
        results = conn.execute(
            """
            SELECT cd.date, chunks.source, chunks.chunk_id,
                   substr(chunks.content, 1, 200)
            FROM chunk_dates cd
            JOIN chunks ON chunks.chunk_id = cd.chunk_id
            WHERE cd.date BETWEEN ? AND ?
            ORDER BY cd.date, chunks.source
            LIMIT ?
            """,
            (date_start, date_end, limit),
        ).fetchall()

        if not results:
            print(f"No dated chunks found {label}")
            conn.close()
            return

        # Count total
        total = conn.execute(
            "SELECT COUNT(*) FROM chunk_dates WHERE date BETWEEN ? AND ?",
            (date_start, date_end),
        ).fetchone()[0]

        print(f"Temporal browse {label} (showing {len(results)}/{total} chunks):\n")
        current_date = None
        for date, source, chunk_id, preview in results:
            if date != current_date:
                print(f"  --- {date} ---")
                current_date = date
            preview_clean = preview.replace('\n', ' ')[:150]
            print(f"  [{source}] {chunk_id}")
            print(f"    {preview_clean}")
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

    # Date coverage
    dated_count = 0
    date_range = ("?", "?")
    try:
        dated_count = conn.execute("SELECT COUNT(*) FROM chunk_dates").fetchone()[0]
        dr = conn.execute("SELECT MIN(date), MAX(date) FROM chunk_dates").fetchone()
        if dr and dr[0]:
            date_range = (dr[0], dr[1])
    except sqlite3.OperationalError:
        pass

    conn.close()

    print(f"Total chunks: {count}")
    print(f"Dated chunks: {dated_count} ({date_range[0]} ~ {date_range[1]})")
    print(f"Last build: {meta.get('last_build', 'unknown')}")
    print(f"Files indexed: {meta.get('total_files', 'unknown')}")
    print(f"\nTop sources:")
    for source, cnt in sources:
        print(f"  {source}: {cnt} chunks")


def show_ref_stats():
    """Show reference frequency statistics (B033 verification)."""
    if not DB_PATH.exists():
        print("Index not found. Run --build first.")
        return

    conn = sqlite3.connect(str(DB_PATH))

    try:
        total = conn.execute("SELECT COUNT(*) FROM search_log").fetchone()[0]
    except sqlite3.OperationalError:
        print("No search log found. search_log table will be created on next search.")
        conn.close()
        return

    if total == 0:
        print("No searches logged yet. Use --search to start accumulating data.")
        conn.close()
        return

    date_range = conn.execute(
        "SELECT MIN(timestamp), MAX(timestamp) FROM search_log"
    ).fetchone()

    print(f"=== Reference Frequency Stats (B033 verification) ===")
    print(f"Total searches: {total}")
    print(f"Period: {date_range[0][:10]} ~ {date_range[1][:10]}")

    print(f"\nTop queries:")
    for query, cnt in conn.execute(
        "SELECT query, COUNT(*) as cnt FROM search_log GROUP BY query ORDER BY cnt DESC LIMIT 10"
    ).fetchall():
        print(f"  {cnt}x  {query}")

    print(f"\nTop referenced sources:")
    source_counts = {}
    for (hit_sources,) in conn.execute("SELECT hit_sources FROM search_log WHERE hit_sources != ''").fetchall():
        for src in hit_sources.split(","):
            src = src.strip()
            if src:
                source_counts[src] = source_counts.get(src, 0) + 1
    for src, cnt in sorted(source_counts.items(), key=lambda x: -x[1])[:15]:
        print(f"  {cnt}x  {src}")

    if len(source_counts) > 1:
        vals = sorted(source_counts.values(), reverse=True)
        top20_total = sum(vals[:max(1, len(vals)//5)])
        all_total = sum(vals)
        print(f"\nPareto check: top 20% sources account for {top20_total}/{all_total} ({100*top20_total//all_total}%) of references")

    conn.close()


def main():
    parser = argparse.ArgumentParser(description="Memory full-text search (FTS5)")
    parser.add_argument("--build", action="store_true", help="Build/rebuild index")
    parser.add_argument("--search", type=str, help="Search query")
    parser.add_argument("--limit", type=int, default=5, help="Max results (default: 5)")
    parser.add_argument("--diverse", action="store_true",
                        help="Return best hit per source (avoid redundancy)")
    parser.add_argument("--context", action="store_true",
                        help="Show surrounding context for each hit (ASMR-inspired)")
    parser.add_argument("--when", type=str,
                        help="Show chunks from a specific date (YYYY-MM-DD)")
    parser.add_argument("--period", nargs=2, metavar=("START", "END"),
                        help="Show chunks in date range (YYYY-MM-DD YYYY-MM-DD)")
    parser.add_argument("--stats", action="store_true", help="Show index stats")
    parser.add_argument("--ref-stats", action="store_true",
                        help="Show reference frequency stats (B033 verification)")
    args = parser.parse_args()

    if args.build:
        build_index()
    elif args.when or args.period:
        search_temporal(when=args.when, period=args.period,
                        query=args.search, limit=args.limit)
    elif args.search and args.context:
        search_context(args.search, args.limit)
    elif args.search:
        search(args.search, args.limit, diverse=args.diverse)
    elif args.stats:
        show_stats()
    elif getattr(args, 'ref_stats', False):
        show_ref_stats()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
