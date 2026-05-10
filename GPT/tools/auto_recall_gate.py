#!/usr/bin/env python3
"""Generate session_context.md from a task prompt by recalling relevant atoms."""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import OrderedDict
from datetime import datetime
from pathlib import Path
from typing import Any

import memory_recall


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
SESSION_CONTEXT_PATH = MEMORY_DIR / "session_context.md"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


EXPANSION_RULES = [
    (
        re.compile(r"ブロック崩し|brick|breakout|arkanoid|アルカノイド", re.I),
        [
            "ブロック崩し brick breaker Arkanoid trajectory controller",
            "brick breaker variation game-design",
            "Nao_u feedback game-dev-teacher 操作感 予測可能 ルール",
        ],
    ),
    (
        re.compile(r"プラットフォーマー|platformer|ジャンプ|足場|着地|マリオ|横スクロール|study_platformer", re.I),
        [
            "study_platformer_01 platformer-ai target-landing planning-not-reflex debug-overlay",
            "プラットフォーマー 着地点 足場 経路計画 予測と実行の一致 headless",
            "Nao_u feedback game-dev-teacher 反射ではなく計画 死なない 着地安全性",
        ],
    ),
    (
        re.compile(r"シューティング|shooter|弾幕|shot_log|BACKLASH|backlash|gauge|ゲージ|反撃弾", re.I),
        [
            "shot_log v01 BACKLASH pleasure-first shooter gauge mercy revenge-bullets",
            "快感要素ファースト シューティング ゲージ強化 近距離救済 完成判定",
            "Nao_u feedback game-dev-teacher 視認性 反撃弾 UI 罰を急がない",
        ],
    ),
    (
        re.compile(r"ゲーム|game|実装|作る|制作|開発|プロトタイプ|v\d+", re.I),
        [
            "game-design shared-reads 過去記事 外部事例 ゲーム開発",
            "Nao_u feedback game-rights game-dev-teacher supervised-feedback",
            "操作感 気持ちいい 予測可能 ルール 目標 UI game-design",
            "自己批判 headless harness cross_review game-design",
            "30個 良いところ 悪いところ 改善案 design_log 原文フィードバック",
            "study_platformer_01 platformer-ai target-landing planning-not-reflex",
            "shot_log v01 BACKLASH pleasure-first shooter gauge mercy",
        ],
    ),
    (
        re.compile(r"操作感|気持ち|feel|controls|入力|物理|重力|軌道|ばね|ゴム|予測", re.I),
        [
            "Nao_u feedback controls-feel predictability physics-rules",
            "game feel controls physics prototype shared-reads",
            "シンプルなルール 予測可能 奥が深い 操作感",
            "study_platformer_01 予測と実行の一致 着地点",
            "shot_log v01 快感要素ファースト 撃つ気持ちよさ",
        ],
    ),
    (
        re.compile(r"記憶|memory|recall|想起|shared-reads|game-rights", re.I),
        [
            "記憶 システム shared-reads game-rights",
            "memory recall substrate Use when",
            "game-dev-teacher supervised-feedback Nao_u",
            "ゲーム開発教師情報ソース study_platformer_01 shot_log v01",
        ],
    ),
    (
        re.compile(r"Slack|投稿|チャンネル|log|日記", re.I),
        [
            "Slack 連絡 ルール log channel",
            "shared-reads all-nao-u-lab game-rights 記憶化",
        ],
    ),
]


def build_queries(prompt: str) -> list[str]:
    queries = [prompt]
    for pattern, expansions in EXPANSION_RULES:
        if pattern.search(prompt):
            queries.extend(expansions)
    seen = set()
    out = []
    for query in queries:
        normalized = query.strip()
        if normalized and normalized not in seen:
            out.append(normalized)
            seen.add(normalized)
    return out


def collect_results(queries: list[str], per_query: int) -> tuple[list[dict[str, Any]], dict[str, list[str]]]:
    by_id: OrderedDict[str, dict[str, Any]] = OrderedDict()
    query_hits: dict[str, list[str]] = {}
    for query in queries:
        results = memory_recall.search(query, per_query)
        memory_recall.record_recall(f"[auto] {query}", results)
        query_hits[query] = []
        for score, atom in results:
            atom_id = atom.get("id")
            if not atom_id:
                continue
            query_hits[query].append(atom_id)
            if atom_id not in by_id:
                by_id[atom_id] = {
                    "score": round(score, 3),
                    "atom": atom,
                    "matched_queries": [query],
                }
            else:
                by_id[atom_id]["matched_queries"].append(query)
                by_id[atom_id]["score"] = max(by_id[atom_id]["score"], round(score, 3))
    return list(by_id.values()), query_hits


def render_context(
    prompt: str,
    queries: list[str],
    results: list[dict[str, Any]],
    query_hits: dict[str, list[str]],
    limit: int,
) -> str:
    selected = sorted(results, key=lambda row: (-len(row["matched_queries"]), -float(row["score"])))[:limit]
    lines = [
        "# Session Context",
        "",
        f"- generated: {datetime.now().isoformat(timespec='seconds')}",
        f"- prompt: {prompt}",
        "",
        "## Auto Recall Queries",
    ]
    for query in queries:
        hits = ", ".join(query_hits.get(query, [])[:5])
        lines.append(f"- `{query}` -> {hits if hits else 'no hit'}")

    lines += ["", "## Recalled Atoms"]
    for row in selected:
        atom = row["atom"]
        tags = ", ".join(atom.get("tags", [])[:10])
        links = ", ".join(atom.get("links", [])[:3])
        lines += [
            f"### `{atom.get('id')}` {atom.get('title')}",
            f"- score: {row['score']}",
            f"- matched_queries: {', '.join(row['matched_queries'][:5])}",
            f"- trigger: {atom.get('trigger')}",
            f"- tags: {tags}",
            f"- source_ts: {atom.get('source_ts')} / source: {atom.get('source')}",
            f"- links: {links}" if links else "- links: (none)",
            f"- excerpt: {atom.get('excerpt')}",
            "",
        ]

    lines += [
        "## How To Use",
        "- 作業前にこのファイルを読み、関係する atom ID を判断に反映する。",
        "- 原文が必要な場合は `source_ts` や links をキーに GPT 側 `memory/raw/` や分析ファイルを探す。",
        "- ゲーム開発では `nao-u-feedback` / `game-dev-teacher` を教師コメントとして扱い、design_log に反映する。",
        "- 行動に効いた atom は、最終報告で明示する。",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Auto recall memory atoms for a task prompt.")
    parser.add_argument("prompt", nargs="+")
    parser.add_argument("--per-query", type=int, default=5)
    parser.add_argument("--limit", type=int, default=12)
    parser.add_argument("--print", action="store_true", dest="print_output")
    args = parser.parse_args()

    prompt = " ".join(args.prompt)
    queries = build_queries(prompt)
    results, query_hits = collect_results(queries, args.per_query)
    context = render_context(prompt, queries, results, query_hits, args.limit)
    SESSION_CONTEXT_PATH.write_text(context, encoding="utf-8", newline="\n")
    if args.print_output:
        print(context)
    else:
        print(f"session_context: {SESSION_CONTEXT_PATH}")
        print(f"queries: {len(queries)}")
        print(f"atoms: {min(len(results), args.limit)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
