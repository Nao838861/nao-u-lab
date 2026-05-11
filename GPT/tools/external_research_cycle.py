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


def contains_japanese(text: str) -> bool:
    return bool(re.search(r"[\u3040-\u30ff\u3400-\u9fff]", text or ""))


def looks_english(text: str) -> bool:
    if not text:
        return False
    letters = len(re.findall(r"[A-Za-z]", text))
    japanese = len(re.findall(r"[\u3040-\u30ff\u3400-\u9fff]", text))
    return letters >= 24 and letters > japanese * 4


def japanese_summary(row: dict[str, Any]) -> str:
    """Return a Japanese Slack-facing summary.

    The raw English abstract remains in memory/raw/web_research/results.jsonl.
    shared-reads should not receive raw English summaries, because that channel
    is later used as a Japanese recall surface.
    """
    summary = clean(str(row.get("summary") or ""), 900)
    if not summary:
        return ""
    if contains_japanese(summary) and not looks_english(summary):
        return summary

    text = f"{row.get('title', '')} {summary}".lower()
    flags = _topic_flags(row)
    notes: list[str] = []
    if "memory" in flags:
        notes.append("LLMエージェントの長期記憶・検索記憶・状態管理が、攻撃や劣化や評価漏れの入口になる点を扱っている。")
    if "agent" in flags:
        notes.append("複数エージェントやツール実行を、役割分担・権限境界・実行ログ込みで評価する必要があることを示している。")
    if "game" in flags:
        notes.append("ゲーム制作では、生成物そのものよりもプレイヤーが理解できるルール、操作感、評価方法を設計する材料になる。")
    if "evaluation" in flags:
        notes.append("評価ベンチや検証器を明示し、結果だけでなく途中過程や失敗条件を測る方向性が重要になる。")
    if "safety" in flags:
        notes.append("安全性の観点では、悪意ある挙動だけでなく通常運用の組み合わせから起きる漏洩や逸脱も検査対象にするべきだと読める。")
    if "physics" in flags:
        notes.append("予測可能な挙動、制御、世界モデルの表現を扱っており、物理ベースのゲームや操作感の検討に接続できる。")
    if not notes:
        notes.append("英語 abstract の原文は raw に保存し、shared-reads では後で判断に使うための日本語説明として扱う。")
    return " ".join(notes[:3])


def _topic_flags(row: dict[str, Any]) -> set[str]:
    text = f"{row.get('title', '')} {row.get('summary', '')}".lower()
    query = str(row.get("query") or "").lower()
    flags: set[str] = set()
    if (
        any(word in text for word in ["retrieval-augmented", "persistent memory", "memory-aware", "memory poisoning", "memory store", "long-term state"])
        or ("memory" in text and any(word in text for word in ["agent", "retrieval", "poisoning", "persistent", "profile", "state"]))
        or "agent memory" in query
    ):
        flags.add("memory")
    if any(word in text for word in ["agent", "multi-agent", "autonomous", "tool", "mcp", "workflow"]) or "agent" in query:
        flags.add("agent")
    if (
        any(word in text for word in ["game design", "video game", "playable", "player", "npc", "minecraft", "unity", "pokemon", "vocabulary learning game"])
        or "game design" in query
        or "player evaluation" in query
    ):
        flags.add("game")
    if any(word in text for word in ["evaluation", "benchmark", "harness", "validator", "metric", "test", "probe"]):
        flags.add("evaluation")
    if any(word in text for word in ["security", "safety", "deception", "collusion", "taint", "credential", "attack", "poisoning"]):
        flags.add("safety")
    if any(word in text for word in ["physics", "predictive control", "prediction", "world model", "4d", "vfx", "haptic", "virtual reality", "vr"]):
        flags.add("physics")
    if any(word in text for word in ["generation", "generative", "procedural", "creativity", "synthesis", "content generation"]):
        flags.add("generation")
    return flags


def content_analysis(row: dict[str, Any]) -> str:
    flags = _topic_flags(row)
    points: list[str] = []
    if "memory" in flags:
        points.append("記憶を単なる便利な履歴ではなく、攻撃面、劣化面、評価対象として扱う視点が重要。長期状態は蓄積するほど有用になる一方、古い前提・毒入り情報・過剰な自律化も蓄積する。")
    if "agent" in flags:
        points.append("エージェントを単体の推論器ではなく、役割、ツール、権限境界、ログ、検証器を含む運用システムとして見ている。これは定時サイクルやSlack連携の設計に直結する。")
    if "game" in flags:
        points.append("ゲーム制作では、生成やAI利用そのものより、プレイヤーが何を面白がるか、操作結果を予測できるか、評価をどう取るかが中心になる。")
    if "evaluation" in flags:
        points.append("結果だけを見る評価では不足し、途中の判断、記憶読み書き、ツール呼び出し、失敗条件を測れるハーネスが必要だと読める。")
    if "safety" in flags:
        points.append("危険は露骨な悪意だけではなく、通常の機能を組み合わせた結果として起きる。境界をまたぐ情報伝播や長期状態の変質は、運用側で検出可能にしておくべき。")
    if "physics" in flags:
        points.append("予測可能な挙動や制御可能性を扱っており、物理ベースゲームの操作感、予測線、チュートリアル設計の比較材料になる。")
    if "generation" in flags:
        points.append("生成物を直接評価するだけでなく、制約、表現、テンプレート、デザイナーのフィードバックをどう入れるかが焦点になる。")
    if not points:
        points.append("外部事例として、現在の自分達の設計判断が内輪の経験だけに閉じていないかを照合する材料になる。")
    return " ".join(points[:4])


def environment_application(row: dict[str, Any]) -> str:
    flags = _topic_flags(row)
    points: list[str] = []
    if "memory" in flags or "agent" in flags:
        points.append("GPT側の記憶階層では、atom化した知識に「いつ使うか」と「いつ古くなるか」を付ける。Slackログ、外部記事、Nao_uの教師フィードバックを同じ検索面に置く時の評価軸になる。")
    if "safety" in flags:
        points.append("Slack指示検出、shared-reads投稿、外部検索、git push などの自動処理は、権限境界と監査ログを残す。プロンプトだけでなくスクリプト側の制約で守る。")
    if "game" in flags or "physics" in flags or "generation" in flags:
        points.append("ゲーム開発では、新規プロトタイプの前に「30件列挙、30案、筋の良い3案、懸念」を残し、操作感と予測可能性を最初の検証対象にする。")
    if "evaluation" in flags:
        points.append("定時サイクルやゲーム制作では、成功例だけでなく失敗条件、検証方法、ユーザーフィードバック原文を残し、次回の自動recall対象にする。")
    if not points:
        points.append("現時点では直接導入せず、関連する設計判断が出た時に shared-reads 由来の比較材料として想起する。")
    return " ".join(points[:4])


def merits_demerits(row: dict[str, Any]) -> tuple[list[str], list[str]]:
    flags = _topic_flags(row)
    merits = ["リンク先が消えても、タイトル・URL・出典・日付・こちらの解釈を残せる。"]
    demerits = ["abstractや記事本文だけからの分析なので、実装詳細や実験条件は必要に応じて原文確認が必要。"]
    if "memory" in flags:
        merits.append("長期記憶の価値だけでなく、毒入り記憶・古い記憶・過剰想起のリスクを設計に入れられる。")
        demerits.append("安全寄りに倒しすぎると、記憶を積極的に使うメリットが弱くなる。")
    if "agent" in flags:
        merits.append("自律運用を、モデル能力ではなくハーネス・ログ・権限で改善する方向に寄せられる。")
        demerits.append("仕組みが増えるほど運用コストと状態ファイルの複雑さが増える。")
    if "game" in flags or "physics" in flags:
        merits.append("操作感、予測可能性、プレイヤー理解を評価軸として明示しやすい。")
        demerits.append("論文や外部事例の抽象度が高く、実際の面白さはプロトタイプで再検証する必要がある。")
    if "evaluation" in flags:
        merits.append("結果だけでなく途中過程を測ることで、改善すべき原因を分解しやすい。")
        demerits.append("測定項目を増やしすぎると、作る速度が落ちる。重要な評価軸に絞る必要がある。")
    if "safety" in flags:
        merits.append("通常運用の中で起きる情報漏洩や権限逸脱を、事前に検査対象へ入れられる。")
        demerits.append("リスク評価を一般化しすぎると、具体的な実装判断に落ちない。")
    return merits[:4], demerits[:4]


def format_shared_reads_item(row: dict[str, Any], index: int | None = None, *, repost_from_ts: str | None = None) -> str:
    prefix = f"## {index}. " if index is not None else "## "
    weak = "弱い候補 / 要確認: " if row.get("weak_candidate") else ""
    lines = [
        f"{prefix}{weak}{row.get('title')}",
        f"- 出典: {row.get('source') or 'unknown'} / 検索語: `{row.get('query') or 'unknown'}` / score={row.get('score', 'n/a')}",
        f"- URL: {row.get('url')}",
    ]
    if repost_from_ts:
        lines.append(f"- 再投稿元: shared-reads ts={repost_from_ts}")
    if row.get("hn_url") and row.get("hn_url") != row.get("url"):
        lines.append(f"- HN: {row.get('hn_url')} points={row.get('points')} comments={row.get('comments')}")
    if row.get("authors"):
        lines.append(f"- 著者: {', '.join(row.get('authors', [])[:4])}")
    if row.get("published"):
        lines.append(f"- 公開日: {row.get('published')}")

    summary_ja = japanese_summary(row) or "本文要約は取得できなかった。タイトル、出典、検索語、こちらの分析を記録として残す。"
    merits, demerits = merits_demerits(row)
    lines += [
        "",
        "■ 要約",
        summary_ja,
        "",
        "■ 内容分析",
        content_analysis(row),
        "",
        "■ 自分達の環境への適用",
        environment_application(row),
        "",
        "■ メリット",
        "\n".join(f"- {item}" for item in merits),
        "",
        "■ デメリット／注意点",
        "\n".join(f"- {item}" for item in demerits),
    ]
    if row.get("weak_candidate"):
        lines += [
            "",
            "■ 判定",
            "厳格な閾値には届いていない。共有価値を断定せず、次回以降の検索語調整と比較のために残す。",
        ]
    return "\n".join(lines)


def build_shared_reads_message(candidates: list[dict[str, Any]]) -> str:
    lines = [
        "[Codex external research] 日記前検索: 現在の目的に関係する外部情報",
        "",
        "目的: 記憶システム、自律運用、ゲーム設計、操作感評価に後で効く情報を探す。単なるニュースではなく、リンク先が消えても判断材料が残る粒度で shared-reads に流す。",
        "",
        "記録方針: ■ 要約 / ■ 内容分析 / ■ 自分達の環境への適用 / ■ メリット / ■ デメリットを基本形にする。英語要約はそのまま貼らず、日本語の分析として残す。",
    ]
    for i, row in enumerate(candidates, 1):
        lines += [
            "",
            format_shared_reads_item(row, i),
        ]

    lines += [
        "",
        "取り込み方針: この投稿自体を shared-reads 経由で atom 化し、原文候補は GPT 側 `memory/raw/web_research/` に保存する。",
    ]
    return "\n".join(lines)


def build_shared_reads_messages(candidates: list[dict[str, Any]]) -> list[str]:
    messages: list[str] = []
    total = len(candidates)
    for i, row in enumerate(candidates, 1):
        header = [
            "[Codex external research] 日記前検索: 現在の目的に関係する外部情報",
            "",
            f"候補 {i}/{total}",
            "記録方針: ■ 要約 / ■ 内容分析 / ■ 自分達の環境への適用 / ■ メリット / ■ デメリットを基本形にする。英語要約はそのまま貼らず、日本語の分析として残す。",
            "",
            format_shared_reads_item(row, i),
        ]
        messages.append("\n".join(header))
    return messages


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
        messages = build_shared_reads_messages(candidates)
        if args.dry_run:
            result["messages"] = messages
        else:
            posted_results = []
            for message in messages:
                post_result = post_message(args.channel, message)
                if not post_result.get("ok"):
                    raise RuntimeError(f"Slack post failed: {post_result}")
                posted_results.append({"channel": post_result.get("channel"), "ts": post_result.get("ts")})
            result["post_result"] = posted_results
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
