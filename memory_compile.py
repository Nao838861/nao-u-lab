#!/usr/bin/env python3
"""
memory_compile.py — 話題別コンパイルビュー生成ツール

Slack archive + memory/ + 対話ログを横断検索し、
指定トピックに関連するメッセージ・セクションを時系列で「コンパイル」する。

VCC (View-oriented Conversation Compiler) の思想を自分たちの記憶システムに応用:
「全部残して、必要な時に必要なビューで見る」

Usage:
  python memory_compile.py "VCC コンパイル ビュー"
  python memory_compile.py "L-1活性化 実験" --compact
  python memory_compile.py "記憶階層 設計" --limit 20
  python memory_compile.py "VCC" --since 2026-04-01
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

REPO_DIR = Path(__file__).parent
SLACK_ARCHIVE_DIR = REPO_DIR / "log" / "slack_archive"
MEMORY_DIR = REPO_DIR / "memory"
DOCS_DIR = REPO_DIR / "docs"
PROJECTS_DIR = REPO_DIR / "projects"
DIALOGUE_DIR = REPO_DIR / "対話ログ"

# User ID mapping
USER_NAMES = {
    "U0ALSUK8P9B": "Nao_u",
    "U0AQDAQGQP2": "pigadev",
    "U0ALW4DKTT7": "Mir",
    "U0AM1F23FQU": "Log",
    "U0AMQKE69BJ": "Ash",
}


def parse_keywords(query):
    """Split query into keywords for matching."""
    # Keep compound terms together if quoted, otherwise split on whitespace
    keywords = []
    for part in query.split():
        if len(part) >= 2:  # Skip single chars
            keywords.append(part.lower())
    return keywords


def matches_keywords(text, keywords, threshold=0.5):
    """Check if text matches enough keywords. Returns (match, score).

    Scoring: base = fraction of keywords matched.
    Bonus for keywords appearing in same sentence/paragraph (proximity).
    Penalty for very short matches in very long text (dilution).
    """
    if not keywords:
        return False, 0
    text_lower = text.lower()
    matched = sum(1 for kw in keywords if kw in text_lower)
    if matched == 0:
        return False, 0

    base_score = matched / len(keywords)

    # Proximity bonus: check if multiple keywords appear within 200 chars
    proximity_bonus = 0
    if matched >= 2:
        for i, kw1 in enumerate(keywords):
            pos1 = text_lower.find(kw1)
            if pos1 < 0:
                continue
            for kw2 in keywords[i+1:]:
                pos2 = text_lower.find(kw2)
                if pos2 >= 0 and abs(pos1 - pos2) < 200:
                    proximity_bonus += 0.1

    # Dilution penalty: if text is very long but matches are sparse
    dilution = 0
    if len(text) > 2000 and matched <= 1:
        dilution = 0.2

    score = min(1.0, base_score + proximity_bonus - dilution)
    return score >= threshold, score


def search_slack_archive(keywords, since_date=None, limit=50):
    """Search Slack archive JSONL files for matching messages."""
    results = []
    if not SLACK_ARCHIVE_DIR.exists():
        return results

    for jsonl_file in SLACK_ARCHIVE_DIR.glob("*.jsonl"):
        channel_name = jsonl_file.stem
        if channel_name == "_state":
            continue
        try:
            with open(jsonl_file, "r", encoding="utf-8") as f:
                for line_num, line in enumerate(f, 1):
                    try:
                        msg = json.loads(line.strip())
                        text = msg.get("text", "")
                        ts = float(msg.get("ts", 0))
                        user_id = msg.get("user", "")

                        if since_date:
                            msg_date = datetime.fromtimestamp(ts)
                            if msg_date < since_date:
                                continue

                        match, score = matches_keywords(text, keywords)
                        if match:
                            user_name = USER_NAMES.get(user_id, user_id)
                            dt = datetime.fromtimestamp(ts)
                            results.append({
                                "source": f"slack/{channel_name}",
                                "source_path": f"{jsonl_file}:L{line_num}",
                                "timestamp": ts,
                                "datetime": dt.strftime("%Y-%m-%d %H:%M"),
                                "user": user_name,
                                "text": text,
                                "score": score,
                                "type": "slack",
                            })
                    except (json.JSONDecodeError, ValueError):
                        continue
        except Exception:
            continue

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:limit]


def search_memory_files(keywords, since_date=None, limit=20):
    """Search memory/*.md and related files for matching sections."""
    results = []
    search_dirs = [MEMORY_DIR, DOCS_DIR, PROJECTS_DIR]

    for search_dir in search_dirs:
        if not search_dir.exists():
            continue
        for md_file in search_dir.rglob("*.md"):
            # Skip very large files that produce too much noise
            try:
                file_size = md_file.stat().st_size
                if file_size > 200_000:  # Skip files > 200KB
                    continue
            except OSError:
                continue
            file_hits = 0
            MAX_HITS_PER_FILE = 3
            try:
                content = md_file.read_text(encoding="utf-8")
                # Split into sections by headers
                sections = re.split(r'^(#{1,4}\s+.+)$', content, flags=re.MULTILINE)

                current_header = ""
                for i, section in enumerate(sections):
                    if re.match(r'^#{1,4}\s+', section):
                        current_header = section.strip()
                        continue

                    if len(section.strip()) < 20:
                        continue

                    match, score = matches_keywords(
                        current_header + " " + section, keywords
                    )
                    if match and file_hits < MAX_HITS_PER_FILE:
                        file_hits += 1
                        # Try to extract date from content
                        date_match = re.search(
                            r'(\d{4}-\d{2}-\d{2})', current_header + section[:200]
                        )
                        ts = 0
                        dt_str = ""
                        if date_match:
                            try:
                                dt = datetime.strptime(date_match.group(1), "%Y-%m-%d")
                                ts = dt.timestamp()
                                dt_str = date_match.group(1)
                            except ValueError:
                                pass

                        if since_date and ts > 0:
                            if datetime.fromtimestamp(ts) < since_date:
                                continue

                        rel_path = md_file.relative_to(REPO_DIR)
                        results.append({
                            "source": str(rel_path),
                            "source_path": str(rel_path),
                            "timestamp": ts,
                            "datetime": dt_str or "unknown",
                            "user": "",
                            "text": (current_header + "\n" + section).strip(),
                            "score": score,
                            "type": "file",
                        })
            except Exception:
                continue

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:limit]


def format_compact(entry):
    """Format entry in compact mode (1-2 lines)."""
    text = entry["text"]
    # Take first meaningful line
    lines = [l.strip() for l in text.split("\n") if l.strip() and not l.strip().startswith("#")]
    first_line = lines[0][:200] if lines else text[:200]

    user_prefix = f"[{entry['user']}] " if entry["user"] else ""
    return f"  [{entry['datetime']}] {user_prefix}({entry['source']}) {first_line}"


def format_full(entry):
    """Format entry in full mode."""
    user_prefix = f"[{entry['user']}] " if entry["user"] else ""
    header = f"  [{entry['datetime']}] {user_prefix}({entry['source']})"
    text = entry["text"]
    # Truncate very long entries
    if len(text) > 800:
        text = text[:800] + "..."
    # Indent text
    indented = "\n".join("    " + l for l in text.split("\n"))
    return f"{header}\n{indented}"


def compile_view(query, compact=False, limit=30, since_date=None):
    """Main compilation function."""
    keywords = parse_keywords(query)
    if not keywords:
        print("Error: No valid keywords in query")
        return

    print(f"Compiling view for: {query}")
    print(f"Keywords: {keywords}")
    if since_date:
        print(f"Since: {since_date.strftime('%Y-%m-%d')}")
    print()

    # Search both sources
    slack_results = search_slack_archive(keywords, since_date, limit * 2)
    file_results = search_memory_files(keywords, since_date, limit)

    # Merge and sort by timestamp (entries with timestamps first, then by score)
    all_results = slack_results + file_results

    # Separate timestamped and non-timestamped
    with_ts = [r for r in all_results if r["timestamp"] > 0]
    without_ts = [r for r in all_results if r["timestamp"] == 0]

    with_ts.sort(key=lambda x: x["timestamp"])
    without_ts.sort(key=lambda x: x["score"], reverse=True)

    # Deduplicate: if same source+similar text, keep higher score
    seen_texts = set()
    deduped = []
    for entry in with_ts + without_ts:
        text_key = entry["text"][:100].lower()
        if text_key not in seen_texts:
            seen_texts.add(text_key)
            deduped.append(entry)

    final = deduped[:limit]

    if not final:
        print("No results found.")
        return

    print(f"=== Compiled View ({len(final)} entries) ===\n")

    # Group timestamped entries
    ts_entries = [e for e in final if e["timestamp"] > 0]
    no_ts_entries = [e for e in final if e["timestamp"] == 0]

    if ts_entries:
        print("--- Timeline ---")
        for entry in ts_entries:
            if compact:
                print(format_compact(entry))
            else:
                print(format_full(entry))
                print()

    if no_ts_entries:
        print("\n--- Related Files (no date) ---")
        for entry in no_ts_entries:
            if compact:
                print(format_compact(entry))
            else:
                print(format_full(entry))
                print()


def main():
    parser = argparse.ArgumentParser(
        description="話題別コンパイルビュー生成ツール"
    )
    parser.add_argument("query", help="検索トピック（キーワードまたはフレーズ）")
    parser.add_argument(
        "--compact", action="store_true",
        help="コンパクト出力（1-2行/エントリ）"
    )
    parser.add_argument(
        "--limit", type=int, default=30,
        help="最大エントリ数（default: 30）"
    )
    parser.add_argument(
        "--since", type=str, default=None,
        help="この日付以降のみ（YYYY-MM-DD）"
    )

    args = parser.parse_args()

    since_date = None
    if args.since:
        try:
            since_date = datetime.strptime(args.since, "%Y-%m-%d")
        except ValueError:
            print(f"Invalid date format: {args.since}")
            sys.exit(1)

    compile_view(args.query, compact=args.compact, limit=args.limit,
                 since_date=since_date)


if __name__ == "__main__":
    main()
