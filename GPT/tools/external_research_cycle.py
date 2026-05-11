#!/usr/bin/env python3
"""Search external sources before the Codex log cycle and post useful finds."""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib import error, parse, request
from xml.etree import ElementTree

from slack_client import post_message


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
RAW_DIR = MEMORY_DIR / "raw" / "web_research"
STATE_PATH = MEMORY_DIR / "external_research_state.json"
RAW_RESULTS_PATH = RAW_DIR / "results.jsonl"
DEFAULT_CHANNEL = "shared-reads"

ARXIV_NS = {"a": "http://www.w3.org/2005/Atom"}

BASE_QUERIES = [
    "agent memory evaluation autonomous agents",
    "LLM game design player evaluation",
    "game feel controls physics prototype",
    "human feedback game prototype design",
]

QUERY_POOLS = [
    [
        "agent memory evaluation autonomous agents",
        "LLM agent memory persistence evaluation",
        "autonomous agents tool use safety memory",
        "multi agent LLM drift evaluation",
    ],
    [
        "game feel controls physics prototype",
        "player control feel game design",
        "physics based game design predictability",
        "game onboarding player understanding controls",
    ],
    [
        "LLM game design player evaluation",
        "AI game development playtesting evaluation",
        "procedural game generation player feedback",
        "human feedback game prototype design",
    ],
    [
        "software agents runtime enforcement rules",
        "LLM instruction following rule compliance",
        "agent harness evaluation observability",
        "AI coding agents benchmark workflow",
    ],
]

MIN_SCORE = 6
FALLBACK_MIN_SCORE = 3


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


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


def append_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def fetch_text(url: str, timeout: int = 30) -> str:
    headers = {
        "User-Agent": "Nao-u Codex external research cycle/1.0",
        "Accept": "application/json, application/atom+xml, text/xml, */*",
    }
    req = request.Request(url, headers=headers)
    with request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def purpose_terms() -> list[str]:
    session = MEMORY_DIR / "session_context.md"
    if not session.exists():
        return []
    text = session.read_text(encoding="utf-8", errors="replace")
    terms = []
    for token in ["Tide Loom", "Gravity Courier", "game feel", "physics game", "agent memory"]:
        if token.lower() in text.lower():
            terms.append(token)
    generalized = []
    if "Tide Loom" in terms:
        generalized.append("elastic tether game controls")
        generalized.append("game feel control physics")
    if "Gravity Courier" in terms:
        generalized.append("orbital mechanics game design")
    if "agent memory" in terms:
        generalized.append("agent memory evaluation autonomous agents")
    return generalized[:4]


def build_queries(state: dict[str, Any] | None = None) -> list[str]:
    state = state or {}
    run_count = int(state.get("run_count") or 0)
    pool = QUERY_POOLS[run_count % len(QUERY_POOLS)]
    queries = pool[:] + BASE_QUERIES[:]
    for term in purpose_terms():
        if term not in queries:
            queries.insert(0, term)
    unique: list[str] = []
    for query in queries:
        if query not in unique:
            unique.append(query)
    return unique[:8]


def clean(text: str, limit: int = 500) -> str:
    compact = re.sub(r"\s+", " ", text or "").strip()
    return compact[:limit]


def search_arxiv(query: str, max_results: int, start: int = 0) -> list[dict[str, Any]]:
    terms = [term for term in re.split(r"\s+", query) if len(term) > 2][:6]
    search_query = " AND ".join(f"all:{term}" for term in terms) if terms else f'all:"{query}"'
    params = {
        "search_query": search_query,
        "start": str(start),
        "max_results": str(max_results),
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    url = "https://export.arxiv.org/api/query?" + parse.urlencode(params)
    xml_text = fetch_text(url)
    root = ElementTree.fromstring(xml_text)
    rows = []
    for entry in root.findall("a:entry", ARXIV_NS):
        title = clean(entry.findtext("a:title", default="", namespaces=ARXIV_NS), 180)
        summary = clean(entry.findtext("a:summary", default="", namespaces=ARXIV_NS), 650)
        published = entry.findtext("a:published", default="", namespaces=ARXIV_NS)
        link = entry.findtext("a:id", default="", namespaces=ARXIV_NS)
        authors = [clean(a.findtext("a:name", default="", namespaces=ARXIV_NS), 80) for a in entry.findall("a:author", ARXIV_NS)]
        rows.append(
            {
                "source": "arxiv",
                "query": query,
                "title": title,
                "url": link,
                "published": published,
                "authors": authors[:5],
                "summary": summary,
                "id": link.rsplit("/", 1)[-1],
            }
        )
    return rows


def search_hn(query: str, max_results: int, page: int = 0) -> list[dict[str, Any]]:
    since = int((datetime.now(timezone.utc) - timedelta(days=30)).timestamp())
    params = {
        "query": query,
        "tags": "story",
        "numericFilters": f"created_at_i>{since}",
        "hitsPerPage": str(max_results),
        "page": str(page),
    }
    url = "https://hn.algolia.com/api/v1/search_by_date?" + parse.urlencode(params)
    data = json.loads(fetch_text(url))
    rows = []
    for hit in data.get("hits", []):
        item_url = hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}"
        rows.append(
            {
                "source": "hacker_news",
                "query": query,
                "title": clean(hit.get("title") or hit.get("story_title") or "", 180),
                "url": item_url,
                "hn_url": f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                "published": hit.get("created_at"),
                "points": hit.get("points") or 0,
                "comments": hit.get("num_comments") or 0,
                "id": str(hit.get("objectID")),
                "summary": clean(hit.get("story_text") or "", 500),
            }
        )
    return rows


def item_key(row: dict[str, Any]) -> str:
    return f"{row.get('source')}:{row.get('id') or row.get('url')}"


def score(row: dict[str, Any]) -> int:
    text = f"{row.get('title', '')} {row.get('summary', '')}".lower()
    core_keywords = {
        "memory",
        "agent",
        "autonomous",
        "evaluation",
        "verifier",
        "self-play",
        "llm",
        "game",
        "control",
        "physics",
        "feedback",
        "prototype",
        "human",
        "user",
        "player",
        "design",
        "benchmark",
        "workflow",
        "runtime",
        "safety",
        "instruction",
        "compliance",
        "observability",
        "onboarding",
        "ux",
        "feel",
        "playtest",
    }
    matched = {kw for kw in core_keywords if kw in text}
    value = len(matched) * 2
    if {"verifier", "self-play"} & matched:
        value += 2
    if {"game", "player", "control", "physics"} & matched and {"feedback", "design", "evaluation", "human"} & matched:
        value += 3
    if {"agent", "memory", "autonomous"} & matched and {"evaluation", "verifier", "feedback"} & matched:
        value += 3
    if row.get("source") == "hacker_news":
        if len(matched) < 2:
            return 0
        if int(row.get("points") or 0) < 10 and len(matched) < 4:
            return 0
        value += min(int(row.get("points") or 0) // 60, 4)
        value += min(int(row.get("comments") or 0) // 25, 3)
    if row.get("source") == "arxiv":
        if len(matched) < 2:
            return 0
        value += 3
    return value


def usefulness_note(row: dict[str, Any]) -> str:
    text = f"{row.get('title', '')} {row.get('summary', '')}".lower()
    if any(word in text for word in ["memory", "agent", "autonomous", "persistence"]):
        return "記憶システムでは、長期運用・永続状態・自律エージェントの危険や評価軸を見直す材料として使う。"
    if any(word in text for word in ["rule", "instruction", "compliance", "runtime", "safety", "enforcement"]):
        return "運用設計では、プロンプト指示に頼らず検出器・ハーネス・実行時制約へ逃がす判断材料として使う。"
    if any(word in text for word in ["game", "physics", "feel", "onboarding", "player", "ux", "playtest"]):
        return "ゲーム制作では、操作感・予測可能性・プレイヤー理解の検討材料として使う。"
    if any(word in text for word in ["evaluation", "benchmark", "verifier", "feedback", "playtest"]):
        return "自己評価では、内部判断を外部指標や人間フィードバックと照合する材料として使う。"
    return "次の判断で、内輪の経験だけに閉じない外部事例として照合する。"


def collect(max_per_query: int, state: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    run_count = int(state.get("run_count") or 0)
    arxiv_start = (run_count % 4) * max_per_query
    hn_page = run_count % 3
    for query in build_queries(state):
        for name, fn, kwargs in [
            ("arxiv", search_arxiv, {"start": arxiv_start}),
            ("hacker_news", search_hn, {"page": hn_page}),
        ]:
            try:
                rows.extend(fn(query, max_per_query, **kwargs))
                time.sleep(0.4)
            except Exception as exc:
                errors.append({"source": name, "query": query, "error": str(exc)[:300]})
    if errors:
        append_jsonl(RAW_DIR / "errors.jsonl", [{"time": now_iso(), **err} for err in errors])
    return rows


def select_candidates(rows: list[dict[str, Any]], seen: set[str], limit: int) -> list[dict[str, Any]]:
    dedup: dict[str, dict[str, Any]] = {}
    fallback: dict[str, dict[str, Any]] = {}
    for row in rows:
        key = item_key(row)
        if key in seen:
            continue
        row["key"] = key
        row["score"] = score(row)
        if row["score"] < FALLBACK_MIN_SCORE:
            continue
        row["usefulness"] = usefulness_note(row)
        if key not in fallback or row["score"] > fallback[key]["score"]:
            fallback[key] = row
        if row["score"] < MIN_SCORE:
            continue
        if key not in dedup or row["score"] > dedup[key]["score"]:
            dedup[key] = row
    selected = sorted(dedup.values(), key=lambda r: (-int(r["score"]), str(r.get("published", ""))))[:limit]
    if selected:
        return selected
    # Fallback: avoid a silent cycle. If the strict threshold finds nothing,
    # post the best low-scoring item with an explicit "weak candidate" label.
    weak = sorted(fallback.values(), key=lambda r: (-int(r["score"]), str(r.get("published", ""))))[:1]
    for row in weak:
        row["weak_candidate"] = True
    return weak


def build_shared_reads_message(candidates: list[dict[str, Any]]) -> str:
    lines = [
        "[Codex external research] 日記前検索: 現在の目的に関係する外部情報",
        "",
        "目的: 記憶システム、自律運用、ゲーム設計、操作感評価に後で効く情報を探す。単なるニュースではなく、次の判断に使えるものを shared-reads に流す。",
        "",
        "選別方針: 既出は避ける。強い候補が複数あれば複数件流す。強い候補がないサイクルでも、完全に沈黙せず、弱い候補を1件だけ明示して次の探索の足場にする。",
    ]
    for i, row in enumerate(candidates, 1):
        prefix = "弱い候補 / 要確認: " if row.get("weak_candidate") else ""
        lines += [
            "",
            f"## {i}. {prefix}{row.get('title')}",
            f"- source: {row.get('source')} / query: `{row.get('query')}` / score={row.get('score')}",
            f"- url: {row.get('url')}",
        ]
        if row.get("hn_url") and row.get("hn_url") != row.get("url"):
            lines.append(f"- HN: {row.get('hn_url')} points={row.get('points')} comments={row.get('comments')}")
        if row.get("authors"):
            lines.append(f"- authors: {', '.join(row.get('authors', [])[:4])}")
        if row.get("published"):
            lines.append(f"- published: {row.get('published')}")
        if row.get("summary"):
            lines.append(f"- 要約: {row.get('summary')}")
        if row.get("weak_candidate"):
            lines.append("- 注記: 厳格な閾値には届いていない。共有価値を断定せず、次回以降の検索語調整と比較のために残す。")
        lines.append(f"- 使い道: {row.get('usefulness') or usefulness_note(row)}")

    lines += [
        "",
        "取り込み方針: この投稿自体を shared-reads 経由で atom 化し、原文候補は GPT 側 `memory/raw/web_research/` に保存する。",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Search external sources and post useful findings to #shared-reads.")
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--max-per-query", type=int, default=4)
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    state = load_json(STATE_PATH, {"seen": [], "last_run": None})
    seen = set(str(x) for x in state.get("seen", []))
    rows = collect(args.max_per_query, state)
    append_jsonl(RAW_RESULTS_PATH, [{"fetched_at": now_iso(), **row} for row in rows])
    candidates = select_candidates(rows, seen, args.limit)

    result: dict[str, Any] = {
        "time": now_iso(),
        "queries": build_queries(state),
        "fetched": len(rows),
        "selected": len(candidates),
        "posted": False,
        "dry_run": args.dry_run,
        "items": candidates,
    }

    if candidates:
        message = build_shared_reads_message(candidates)
        if args.dry_run:
            result["message"] = message
        else:
            post_result = post_message(args.channel, message)
            result["post_result"] = post_result
            if not post_result.get("ok"):
                raise RuntimeError(f"Slack post failed: {post_result}")
            result["posted"] = True
            seen.update(str(row["key"]) for row in candidates)

    state.update(
        {
            "last_run": now_iso(),
            "last_selected": len(candidates),
            "last_posted": result["posted"],
            "run_count": int(state.get("run_count") or 0) + 1,
            "seen": sorted(seen)[-1000:],
        }
    )
    save_json(STATE_PATH, state)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
