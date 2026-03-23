#!/usr/bin/env python3
"""
memory_walk.py — 記憶の散歩

サイクル起動時にランダムな過去記憶の断片を1つ提示する。
「意図しない出会い」を設計する——FTS5やベクトル検索では拾えない
偶発的な発見(セレンディピティ)を生むための仕組み。

使い方:
  python memory_walk.py              # ランダムに1つ表示
  python memory_walk.py --n 3        # 3つ表示
  python memory_walk.py --source logs # 対話ログのみから
  python memory_walk.py --source slack # Slackアーカイブのみから
  python memory_walk.py --source memory # メモリファイルのみから

依存: stdlib only
"""

import os
import sys
import random
import glob
import json
from pathlib import Path

# Windows cp932対応: Unicode文字を安全に出力
if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)

BASE_DIR = Path(__file__).parent

# ソースディレクトリ
SOURCES = {
    "logs": BASE_DIR / "対話ログ",
    "slack": BASE_DIR / "log" / "slack_archive",
    "memory": BASE_DIR / "memory",
    "nao_u_live": BASE_DIR / "log" / "nao_u_live.md",
}

# 除外パターン（運用ファイル、インデックス等）
EXCLUDE_FILES = {
    "MEMORY.md", "pending_requests.md", "kaizen_tracker.md",
    "kaizen_review_queue.md", "action_reservations.md",
    "inbox_win.md", "inbox_win2.md", "inbox_mac.md",
    "_state.json",
}

MIN_CHUNK_LINES = 3
MAX_CHUNK_LINES = 15


def is_low_quality_chunk(text):
    """低品質チャンク（ツール呼び出し残骸、コマンドログ等）をフィルタ"""
    lines = [l for l in text.split("\n") if l.strip()]
    if not lines:
        return True
    noise_count = 0
    for line in lines:
        s = line.strip()
        if s.startswith("[ツール:") or s.startswith("[ツール："):
            noise_count += 1
        elif s.startswith("$ ") or s.startswith("```"):
            noise_count += 1
        elif s.startswith("---") and len(s) <= 5:
            noise_count += 1
        elif s in ("## Claude", "## Human"):
            noise_count += 1
    return noise_count / len(lines) > 0.5


def collect_chunks_from_md(filepath, max_chunks=50):
    """Markdownファイルからセクション単位でチャンクを抽出"""
    chunks = []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except (UnicodeDecodeError, FileNotFoundError):
        return chunks

    if len(lines) < MIN_CHUNK_LINES:
        return chunks

    # セクション区切り（## や --- ）でチャンクに分割
    current_chunk = []
    source_name = Path(filepath).name

    for line in lines:
        if (line.startswith("## ") or line.strip() == "---") and len(current_chunk) >= MIN_CHUNK_LINES:
            text = "".join(current_chunk).strip()
            if len(text) > 50 and not is_low_quality_chunk(text):
                chunks.append({"text": text[:800], "source": source_name})
            current_chunk = [line]
        else:
            current_chunk.append(line)

    # 最後のチャンク
    if len(current_chunk) >= MIN_CHUNK_LINES:
        text = "".join(current_chunk).strip()
        if len(text) > 50 and not is_low_quality_chunk(text):
            chunks.append({"text": text[:800], "source": source_name})

    # ファイルが大きい場合はサンプリング
    if len(chunks) > max_chunks:
        chunks = random.sample(chunks, max_chunks)

    return chunks


def collect_chunks_from_jsonl(filepath, max_chunks=30):
    """SlackアーカイブJSONLからメッセージを抽出"""
    chunks = []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            messages = [json.loads(line) for line in f if line.strip()]
    except (json.JSONDecodeError, FileNotFoundError, UnicodeDecodeError):
        return chunks

    # 長めのメッセージだけ（短い相槌等は除外）
    source_name = Path(filepath).stem
    for msg in messages:
        text = msg.get("text", "")
        if len(text) > 80:
            chunks.append({"text": text[:800], "source": f"slack/{source_name}"})

    if len(chunks) > max_chunks:
        chunks = random.sample(chunks, max_chunks)

    return chunks


def collect_all_chunks(source_filter=None):
    """全ソースからチャンクを収集"""
    all_chunks = []

    # 対話ログ
    if source_filter in (None, "logs"):
        log_dir = SOURCES["logs"]
        if log_dir.exists():
            md_files = list(log_dir.glob("*.md"))
            # 大量にある場合はランダムに選ぶ
            if len(md_files) > 20:
                md_files = random.sample(md_files, 20)
            for f in md_files:
                all_chunks.extend(collect_chunks_from_md(f))

    # Slackアーカイブ
    if source_filter in (None, "slack"):
        slack_dir = SOURCES["slack"]
        if slack_dir.exists():
            for f in slack_dir.glob("*.jsonl"):
                if f.name not in EXCLUDE_FILES:
                    all_chunks.extend(collect_chunks_from_jsonl(f))

    # メモリファイル
    if source_filter in (None, "memory"):
        mem_dir = SOURCES["memory"]
        if mem_dir.exists():
            for f in mem_dir.glob("*.md"):
                if f.name not in EXCLUDE_FILES:
                    all_chunks.extend(collect_chunks_from_md(f, max_chunks=20))

    # nao_u_live.md（最重要ソース）
    if source_filter in (None, "logs"):
        live_file = SOURCES["nao_u_live"]
        if live_file.exists():
            all_chunks.extend(collect_chunks_from_md(live_file, max_chunks=30))

    return all_chunks


def walk(n=1, source_filter=None):
    """ランダムにn個のチャンクを選んで表示"""
    chunks = collect_all_chunks(source_filter)

    if not chunks:
        print("記憶の散歩: 読み込めるソースがありませんでした。")
        return

    n = min(n, len(chunks))
    selected = random.sample(chunks, n)

    print(f"━━━ 記憶の散歩 ({len(chunks)}個の断片から{n}個を選出) ━━━\n")

    for i, chunk in enumerate(selected, 1):
        if n > 1:
            print(f"── [{i}/{n}] {chunk['source']} ──")
        else:
            print(f"── {chunk['source']} ──")
        # 長すぎる場合は切り詰め
        text = chunk["text"]
        lines = text.split("\n")
        if len(lines) > MAX_CHUNK_LINES:
            text = "\n".join(lines[:MAX_CHUNK_LINES]) + "\n  …（続きあり）"
        print(text)
        print()

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


if __name__ == "__main__":
    n = 1
    source_filter = None

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--n" and i + 1 < len(args):
            n = int(args[i + 1])
            i += 2
        elif args[i] == "--source" and i + 1 < len(args):
            source_filter = args[i + 1]
            i += 2
        else:
            i += 1

    walk(n=n, source_filter=source_filter)
