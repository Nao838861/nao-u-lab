#!/usr/bin/env python3
"""Repost older Codex shared-reads items in the Japanese detailed format."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from external_research_cycle import format_shared_reads_item
from slack_client import post_message
from shared_reads_policy import validate_shared_reads_message


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
SHARED_READS_RAW = MEMORY_DIR / "raw" / "slack_api" / "shared-reads.jsonl"
WEB_RESULTS_RAW = MEMORY_DIR / "raw" / "web_research" / "results.jsonl"
STATE_PATH = MEMORY_DIR / "shared_reads_repost_state.json"
DEFAULT_CHANNEL = "shared-reads"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def iter_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        try:
            rows.append(json.loads(line))
        except Exception:
            continue
    return rows


def norm_url(url: str) -> str:
    return (url or "").strip("<>").replace("http://", "https://").rstrip("/")


def norm_title(title: str) -> str:
    return re.sub(r"\s+", " ", title or "").strip().lower()


def build_web_indexes() -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    by_url: dict[str, dict[str, Any]] = {}
    by_title: dict[str, dict[str, Any]] = {}
    for row in iter_jsonl(WEB_RESULTS_RAW):
        url_key = norm_url(str(row.get("url") or ""))
        title_key = norm_title(str(row.get("title") or ""))
        if url_key and url_key not in by_url:
            by_url[url_key] = row
        if title_key and title_key not in by_title:
            by_title[title_key] = row
    return by_url, by_title


def parse_old_item(part: str) -> dict[str, Any]:
    first_line, _, rest = part.partition("\n")
    title = first_line.strip()
    item: dict[str, Any] = {"title": title}

    source = re.search(r"- source:\s*([^/\n]+)", rest)
    query = re.search(r"query:\s*`([^`]+)`", rest)
    score = re.search(r"score=([0-9]+)", rest)
    url = re.search(r"- url:\s*<?([^>\n]+)>?", rest)
    hn_url = re.search(r"- HN:\s*([^ ]+)", rest)
    authors = re.search(r"- authors:\s*(.+)", rest)
    published = re.search(r"- published:\s*(.+)", rest)
    summary = re.search(r"- 要約:\s*(.*?)(?:\n- 注記:|\n- 使い道:|\n## |\Z)", rest, re.S)

    if source:
        item["source"] = source.group(1).strip()
    if query:
        item["query"] = query.group(1).strip()
    if score:
        item["score"] = int(score.group(1))
    if url:
        item["url"] = url.group(1).strip()
    if hn_url:
        item["hn_url"] = hn_url.group(1).strip()
    if authors:
        item["authors"] = [a.strip() for a in authors.group(1).split(",") if a.strip()]
    if published:
        item["published"] = published.group(1).strip()
    if summary:
        item["summary"] = re.sub(r"\s+", " ", summary.group(1)).strip()
    return item


def parse_old_codex_posts() -> list[dict[str, Any]]:
    posts: list[dict[str, Any]] = []
    for row in iter_jsonl(SHARED_READS_RAW):
        text = str(row.get("text") or "")
        if "[Log_cdx] [Codex external research]" not in text:
            continue
        if "■ 内容分析" in text:
            continue
        parts = re.split(r"\n##\s+\d+\.\s+", text)
        items = [parse_old_item(part) for part in parts[1:]]
        items = [item for item in items if item.get("title") and item.get("url")]
        if items:
            posts.append(
                {
                    "ts": str(row.get("ts") or ""),
                    "datetime": row.get("datetime"),
                    "items": items,
                }
            )
    return posts


def enrich_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_url, by_title = build_web_indexes()
    enriched: list[dict[str, Any]] = []
    for item in items:
        source = by_url.get(norm_url(str(item.get("url") or ""))) or by_title.get(norm_title(str(item.get("title") or ""))) or {}
        merged = {**source, **item}
        if source.get("summary") and not item.get("summary"):
            merged["summary"] = source.get("summary")
        if source.get("authors") and not item.get("authors"):
            merged["authors"] = source.get("authors")
        if source.get("published") and not item.get("published"):
            merged["published"] = source.get("published")
        if source.get("source") and not item.get("source"):
            merged["source"] = source.get("source")
        if source.get("query") and not item.get("query"):
            merged["query"] = source.get("query")
        enriched.append(merged)
    return enriched


def build_repost_message(post: dict[str, Any]) -> str:
    ts = str(post.get("ts") or "")
    dt = str(post.get("datetime") or "")
    lines = [
        "[Codex shared-reads再投稿] 英語要約を含む旧投稿の日本語詳細分析版",
        "",
        f"対象: shared-reads ts={ts} / {dt}",
        "理由: 旧投稿には英語abstractをそのまま含む概要不足があったため、リンク先が消えても判断材料が残るように、現行フォーマットで再掲する。",
    ]
    for index, item in enumerate(enrich_items(list(post.get("items") or [])), 1):
        lines += ["", format_shared_reads_item(item, index, repost_from_ts=ts)]
    return "\n".join(lines)


def item_key(post: dict[str, Any], item: dict[str, Any], index: int) -> str:
    return f"{post.get('ts')}:{index}:{norm_url(str(item.get('url') or ''))}"


def build_repost_item_message(post: dict[str, Any], item: dict[str, Any], index: int, total: int) -> str:
    ts = str(post.get("ts") or "")
    dt = str(post.get("datetime") or "")
    lines = [
        "[Codex shared-reads再投稿・補正版] 英語要約を含む旧投稿の日本語詳細分析版",
        "",
        f"対象: shared-reads ts={ts} / {dt} / 項目 {index}/{total}",
        "理由: 旧投稿には英語abstractをそのまま含む概要不足があったため、リンク先が消えても判断材料が残るように、現行フォーマットで項目単位に再掲する。",
        "",
        format_shared_reads_item(item, index, repost_from_ts=ts),
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Repost older Codex shared-reads posts in Japanese detailed format.")
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    state = load_json(STATE_PATH, {"posted_source_ts": [], "posted_item_keys": []})
    posted = set(str(x) for x in state.get("posted_source_ts", []))
    posted_items = set(str(x) for x in state.get("posted_item_keys", []))
    candidates = parse_old_codex_posts()
    if not args.force:
        candidates = [
            post
            for post in candidates
            if str(post.get("ts") or "") not in posted
            or any(
                item_key(post, item, index) not in posted_items
                for index, item in enumerate(enrich_items(list(post.get("items") or [])), 1)
            )
        ]

    result: dict[str, Any] = {
        "dry_run": args.dry_run,
        "channel": args.channel,
        "candidates": len(candidates),
        "posted": [],
    }

    for post in candidates:
        items = enrich_items(list(post.get("items") or []))
        total = len(items)
        posted_any = False
        for index, item in enumerate(items, 1):
            key = item_key(post, item, index)
            if not args.force and key in posted_items:
                continue
            message = build_repost_item_message(post, item, index, total)
            policy = validate_shared_reads_message(message)
            if not policy.ok:
                result.setdefault("skipped", []).append({"key": key, "reason": f"shared_reads_policy: {policy.reason}"})
                continue
            if args.dry_run:
                result.setdefault("messages", []).append(message)
                continue
            post_result = post_message(args.channel, message)
            if not post_result.get("ok"):
                raise RuntimeError(f"Slack post failed for {post.get('ts')} item {index}: {post_result}")
            result["posted"].append({"source_ts": post.get("ts"), "item": index, "channel": post_result.get("channel"), "ts": post_result.get("ts")})
            posted_items.add(key)
            posted_any = True
        if posted_any:
            posted.add(str(post.get("ts") or ""))

    if not args.dry_run:
        state["posted_source_ts"] = sorted(posted)
        state["posted_item_keys"] = sorted(posted_items)
        save_json(STATE_PATH, state)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
