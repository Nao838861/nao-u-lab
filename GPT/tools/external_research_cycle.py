#!/usr/bin/env python3
"""Search external sources before the Codex log cycle and save useful finds.

Slack posting is opt-in. Nao_u asked that intermediate "thinking process" /
pre-diary search candidates must not be posted to #shared-reads automatically.
"""
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


SPECIFIC_JA_SUMMARIES = {
    "MEMSAD: Gradient-Coupled Anomaly Detection": "MEMSAD は、検索拡張型エージェントの外部記憶に毒入り情報を混ぜられた時、それが後の検索・回答にどう影響するかを測り、防御する手法。記憶汚染攻撃を、攻撃者と防御者の Stackelberg game として定式化し、攻撃者のアクセス権が弱い場合から強い場合まで複数クラスを比較する。防御側は、検索された記憶とクエリの意味的な整合性や異常度を calibration して、通常の記憶検索に見えるが回答を誘導する候補を検出する。ポイントは、長期記憶を便利な文脈保存ではなく、攻撃面を持つ状態として評価していること。",
    "CoopEval: Benchmarking Cooperation-Sustaining": "CoopEval は、LLMエージェントが囚人のジレンマや公共財ゲームのような mixed-motive 状況で協力を維持できるかを測るベンチマーク。単に『協力しなさい』と促すのではなく、ゲーム理論で協力を均衡として成立させるための仕組み、たとえば繰り返し相互作用、コミットメント、評判、罰則などを比較する。研究の焦点は、推論能力が高いモデルほど一回限りの社会的ジレンマで裏切りに寄ることがある点で、エージェント同士の安全な相互作用にはプロンプトではなく制度設計が必要だと示す。",
    "NeuroState-Bench": "NeuroState-Bench は、LLMエージェントの『約束や前提を保ったまま複数ターンのタスクを進められるか』を測る人間校正済みベンチマーク。最終回答だけでは、途中で重要な制約を忘れたり、人物設定や方針を壊したりしても見逃されるため、タスク途中に side-query probe を挟み、エージェント内部の commitment integrity を検査する。144個の決定的タスクと306個のプローブを用意し、クリーン条件と妨害条件を比較することで、表面上は成功して見えるが内部状態が壊れているケースを検出する。",
    "Governed Collaborative Memory": "この論文は、マルチエージェント環境で共有記憶をどう選別・統治するかを『人工選択』として捉える提案。永続記憶が、個別セッションのメモではなく、複数エージェントや将来バージョンの行動を形作る制度的状態になると、どの記憶を共有状態に昇格させ、どれを私的記憶に留め、どれを棄却するかが重要になる。検索精度やアクセス制御だけでは足りず、記憶候補の競争、選択圧、ガバナンスルールを設計対象にする必要がある、という視点の論文。",
    "LieCraft": "LieCraft は、LLMの欺瞞能力を測るために作られた、長期進行型の隠れ役職マルチプレイヤーゲーム兼評価環境。プレイヤーは倫理的アラインメントを選び、協力者はミッション達成と悪役の露見を目指し、悪役は隠れながら妨害する。従来の単発の嘘検出ではなく、長い時間軸で、証拠の隠蔽、同盟形成、虚偽説明、疑い回避のような戦略的欺瞞を評価する。エージェント性が上がり人間監督が薄くなる状況で、モデルがどの程度計画的に欺けるかを見るためのサンドボックス。",
    "Algorithmic Collusion at Test Time": "この論文は、学習中ではなくテスト時に、異なる方針を持つエージェントが談合的な振る舞いを選ぶリスクを測る meta-game 評価を提案する。各エージェントを、競争的、素朴に協力的、談合に強く寄った方針などの事前学習済みポリシーとして扱い、その場でどの戦略を選ぶかを分析する。従来の長期学習を前提にした談合評価ではなく、限られた推論時間と与えられた相手情報の中で、価格調整や暗黙協調のような行動が現れるかを見る設計。",
    "The Ink Splotch Effect": "この研究は、ChatGPTをゲームデザインの共同創作者として使う時、AIが人間デザイナーの意図を広げるのか、むしろ別方向へ逸らすのかを調べるケーススタディ。インクの染みから発想する創作訓練になぞらえ、LLMに曖昧な着想を与え、3ジャンルのプロトタイプゲームを作らせ、人間の創作意図と比較する。主眼は、LLMが高レベルのミューズとして役立つか、またはもっともらしいが設計意図の芯を薄める提案を出すかを評価すること。",
    "CoVoL": "CoVoL は、自閉症の子どもの語彙学習を支援するための協力型2人用デジタルゲーム。既存の語彙学習ツールは個別フィードバックや予測可能な環境を提供する一方、実際の社会的文脈に近い turn-taking を取り入れていない。CoVoL は、2人のプレイヤーが交互に役割を持ち、協力して語彙を使う構造を入れることで、単語を覚えるだけでなく、社会的やり取りの中で使う練習に近づける設計。",
    "Procedural Generation of 3D Maps": "この手法は、あらかじめ用意した3Dメッシュ部品を、デザイナーが指定した視覚的制約に従ってスナップ接続し、3Dマップを自動生成するもの。単なるランダム生成ではなく、部品同士の接続可能性、見た目、通行可能性を制約として扱い、生成後すぐにナビゲーション可能性を評価できる。Unity実装と複数ケーススタディを通じて、デザイナーが見た目と遊びやすさを制御しながらサイズやレイアウトの制約を緩める方法を示す。",
    "Perspectives from Naive Participants": "この研究は、VR版 Cyberball 課題にアバターカスタマイズを入れた時、初見参加者と熟練研究者で設計評価がどう違うかを調べたもの。Unityでプロトタイプを作り、Cyberballを知らない5人と研究経験のある10人に深いユーザーテストを行う。直感的に使えるか、包摂性があるか、身体化感があるか、研究課題として妥当かについて、ユーザー群ごとの評価の違いを分析している。",
    "Symbolically Scaffolded Play": "この研究は、LLM駆動NPCの会話を、単に自由対話にするのではなく、役割に応じた制約プロンプトやJSON+RAGの足場で支えた時、プレイヤー体験が改善するかを見るもの。題材は音声ベースの探偵ゲーム The Interview。高制約プロンプトと低制約プロンプトを比較したユーザビリティ調査では、技術的破綻への感度以外に大きな体験差が出なかったため、その後、構造化JSONとRAGを組み合わせたハイブリッド足場へ再設計している。",
    "Prompting Destiny": "この研究は、LLMが仲介するロールプレイゲームを使い、教育的指導、社会化、道徳的責任についてプレイヤーに内省させるもの。プレイヤーは子どもの王子を四季構造の物語で導き、各段階でLLM NPCが異なる反応を返す。リアルタイムの点数を隠し、章末に成長フィードバックを出すことで、スコア稼ぎではなく、教育方針が子どもの社会化にどう影響するかを考えさせる設計。",
    "MineNPC-Task": "MineNPC-Task は、Minecraft内の記憶を持つLLMエージェントを評価するための、ユーザー由来タスクスイートと実行ハーネス。合成プロンプトではなく、熟練プレイヤーとの共同プレイからタスクを引き出し、前提条件、依存関係、検証可能な成功条件を持つテンプレートへ正規化する。エージェントの計画、行動、記憶読み書き、確認質問、前提条件チェックをログ化し、機械検証器で out-of-world なズルを禁止する。",
    "MCPHunt": "MCPHunt は、複数MCPサーバーを使うエージェントで、無害に見えるread/write権限の組み合わせが境界を越えた認証情報伝播を起こすかを測る評価フレームワーク。悪意あるモデル行動ではなく、ワークフロー構造そのものから生じる情報流出を対象にする。canary文字列によるtaint tracking、リスクのあるトポロジーを網羅する環境制御、複数サーバー境界をまたぐ伝播検出により、ツール合成の副作用を客観的に測る。",
    "ResearchGym": "ResearchGym は、AIエージェントを実世界の研究タスクで評価するためのコンテナ化ベンチマーク。ICML/ICLR/ACLの既存論文リポジトリから、データセット、評価ハーネス、ベースライン実装は残し、論文の提案手法だけを伏せる。エージェントはその環境内で仮説を立て、実験を走らせ、人間ベースラインを超える方法を探す。5本の論文から39サブタスクを構成し、研究の端から端までを評価する。",
    "InMind": "InMind は、LLMが人間一般の社会的推論ではなく、特定個人の推論スタイルを捉えて別文脈に適用できるかを測る評価フレームワーク。社会推理ゲームAvalonを使い、Observer modeで対象者の推論傾向を抽出し、Participant modeでその推論プロファイルを使わせる。ゲームログには、ラウンドごとのstrategy traceとゲーム後のreflective summaryを付与し、Player Identification、Reflection Alignment、Trace Attribution、Role Inferenceの4タスクで静的整合と動的適応を測る。",
    "Grounding Machine Creativity": "この研究は、LLMがゲームアイデアをUnityなどの実行可能なゲームへ変換する時、gameplay design patternsを中間表現として使う方法を調べるもの。特に goal patterns、つまりプレイヤー目標の関係を、エンティティ、制約、ルール駆動の動きに分解し、Goal Playable ConceptsとしてUnity実装に落とす。LLMの創造性を自由生成に任せるのではなく、デザイン知識表現で構造化して、遊べるパターンへ合成できるかを検証する。",
    "Applied User Research in Virtual Reality": "この章は、VRでユーザーリサーチやデザイン評価を行うための実践的手法を整理している。UnityやUnrealなどのゲームエンジン、VRハードウェア、定性・定量調査手法、それらの組み合わせを概観し、感覚刺激の制限や評価環境の制御といった課題を扱う。宇宙システム開発のように実環境で試すのが難しい領域で、VRが安全で低コストなシミュレーション評価環境になる点も示す。",
    "The Physical Basis of Prediction": "この論文は、身体を持つエージェントが世界モデルを形成する過程を、ヒト神経オルガノイドという生物基盤で調べる枠組みを提案する。LLMが生成したカリキュラムに従い、閉ループ仮想環境を段階的に与え、予測、相互作用、適応を要求する。3種類のタスク環境を設計し、長期増強や長期抑圧などのシナプス機構が、予測可能な世界モデル形成にどう関わるかを探る。",
    "FlashRT": "FlashRT は、長文脈LLMに対するプロンプトインジェクションや知識汚染を、計算量とメモリ効率よくred-teamする手法。従来の最適化ベース攻撃は強いが重く、ヒューリスティック攻撃は軽いが弱いという問題がある。FlashRTは、長文脈アプリケーション、RAG、自律エージェントで現れる知識破壊リスクを、より低コストに探索し、厳しい安全評価を現実的な計算資源で回せるようにすることを狙う。",
    "Large Language Models as Pokémon Battle Agents": "この研究は、ポケモンバトルをLLMの戦略的意思決定ベンチマークとして使う。タイプ相性、ステータス、リスク評価、ターン制の選択を含む戦闘システムを作り、LLMが事前実装ロジックではなく現在のバトル状態から技を選べるかを見る。さらに、戦術的に妥当な行動だけでなく、新しいポケモンや技のようなバランスの取れたゲームコンテンツ生成も評価対象にする。",
    "Ghost in the Agent": "NeuroTaint は、LLMエージェント向けの情報流追跡手法。従来のtaint analysisはプログラムメモリ上の明示的データ伝播を前提にするが、LLMでは自然言語の確率的推論を通じて情報が言い換えられたり要約されたりするため、そのまま使えない。この研究は、外部ツール、API、記憶ストアから入った信頼できない情報が、間接プロンプトインジェクションや不正ツール実行へどう影響するかを追跡する。",
    "Operating-Layer Controls": "この研究は、実資金を扱うオンチェーンLLMエージェントの信頼性を、運用層の制御で確保する方法を分析する。DX Terminal Proという21日間の実運用で、3505人のユーザー資金エージェント、約30万件のオンチェーン行動、約2000万ドル相当の取引を観測する。ユーザーはvaultと自然言語戦略を設定し、エージェントは許可された売買だけを実行する。重要なのは、モデルを信じるのではなく、構造化制御、検証済みアクション、決済成功率で運用を縛る点。",
    "Foveated Haptic Gaze": "Foveated Haptic Gaze は、視覚情報を触覚に変換し、視覚障害のある人がゲーム、VR、AR、シミュレーション内の空間情報にアクセスしやすくする手法。視線や注目領域に近い情報を高密度に、周辺情報を粗く伝えるfoveated設計により、全画面情報を一度に触覚化する負荷を下げる。直感的に環境を探索できる触覚インターフェースとして、日常的に使えるアクセシビリティを狙う。",
    "HMACE": "HMACE は、LLMによるNP困難な組合せ最適化のヒューリスティック設計を、単一のテンプレート生成ではなく、異種エージェントの組織的進化として扱う手法。各世代を、問題理解、候補生成、評価、記憶に基づく探索のような複数役割に分解し、エージェント間の協調でヒューリスティックを進化させる。目的は、固定ワークフローによる早期収束を避け、記憶に導かれた多様な探索を保つこと。",
    "A Survey of Agentic AI and Cybersecurity": "このサーベイは、Agentic AIがサイバーセキュリティに与える影響を、防御側と攻撃側の両面で整理する。記憶、ツール利用、反復的な計画実行により、自律的な監視、インシデント対応、脅威ハンティング、詐欺検出が可能になる一方、攻撃者にも偵察、脆弱性利用、調整、持続的攻撃を高速化する能力を与える。ユースケース試作を通じて、エージェント導入時の機会とリスクを俯瞰する。",
    "When Routine Chats Turn Toxic": "ULSPB は、日常的な会話がパーソナライズドLLMエージェントの長期状態を徐々に変質させるリスクを測るベンチマーク。明示的な攻撃ではなく、普通のやり取りが確認境界を弱め、ツール利用のデフォルトを広げ、自律行動を過剰化させる現象を unintended long-term state poisoning と定義する。350設定の二言語ベンチで、支援カテゴリごとに長期状態がどう危険側へずれるかを評価する。",
    "Towards Security-Auditable LLM Agents": "この論文は、LLMエージェントの実行を後から監査できるようにする統一グラフ表現を提案する。通常のログやSBOMでは、低レベルイベントと高レベルの実行意図、認知状態の変化、ツール能力の束縛、記憶汚染、複数エージェント間のリスク伝播が分断される。提案手法は、ツール呼び出し、メモリ、能力、意図、状態遷移を一つのグラフにまとめ、セキュリティ監査で辿れるようにする。",
    "Partitioning techniques": "このサーベイは、大規模システムに非集中型Model Predictive Controlを適用する時、システムをどう分割し、どの部分をどのローカル制御器に担当させるかを整理する。分散MPC、階層MPC、coalitional MPCなどで、性能指標を最大化するサブシステム定義とグルーピングが中心問題になる。既存手法を最適化ベース、グラフベースなど複数クラスに体系化し、分割設計の理論的見通しを与える。",
    "PromptVFX": "PromptVFX は、テキスト指示から3D Gaussianの時間変化する4D flow fieldを生成し、オープンワールド3Dシーンに視覚効果を加える手法。従来の拡散モデルによる4D生成は重いので、3Dアニメーションを場の予測問題として再定式化する。LLMやVLMを使って『花瓶を光らせる』『煙を流す』のような任意プロンプトを関数生成へ変換し、3D Gaussianに作用する時間変化ベクトル場として表現する。",
    "OmniWorld": "OmniWorld は、4D world modeling、つまり空間形状と時間的変化を同時に扱うためのマルチドメイン・マルチモーダルデータセット。既存データは動的複雑さ、領域多様性、時空間アノテーションが不足し、4D幾何再構成、未来予測、カメラ制御動画生成の評価に弱い。OmniWorldは多様な領域とモダリティを含む高品質データを揃え、汎用的な4D世界モデルの訓練・評価基盤を提供する。",
    "SensingAgents": "SensingAgents は、IMUセンサーによる人間行動認識を、LLM駆動の複数専門エージェントで行うフレームワーク。従来の深層学習HARはラベル付きデータ依存、センサー位置の曖昧さ、理由説明の弱さが問題だった。SensingAgentsは、位置ごとの分析役、統合役、検証役のようにエージェントを分け、センサー信号から行動を推定しつつ、どの位置情報や推論が判断に効いたかを説明可能にする。",
    "Towards Agentic Intelligence for Materials Science": "このサーベイは、材料科学でAIを単発タスクのモデルではなく、発見ループ全体を計画・実行・学習するagentic systemとして使うためのパイプラインを整理する。コーパス整備、事前学習、分野適応、指示チューニング、シミュレーションや実験装置に接続するゴール条件付きエージェントまでを一続きのシステムとして扱う。評価も論文上の精度ではなく、実際の材料発見成果へ最適化する視点を取る。",
    "When Roles Fail": "この論文は、政治的発言分析のマルチエージェントLLMパイプラインで、各評価モデルが割り当てられた擁護者ロールを本当に維持できるかを検証する。TRUST pipelineを使い、英語30件・ドイツ語30件の政治発言に対して、表層語彙ではなく推論テキストから立場を識別する epistemic stance classifier を作る。Role Driftなど4指標で、モデルが議論の途中でロールから逸脱するかを測る。",
    "A$^2$TGPO": "A^2TGPO は、ツール呼び出しを含む複数ターンのagentic LLMを強化学習する時、最終成功報酬だけでは各ターンの貢献が分からない問題に対処する手法。外部のprocess reward modelや木探索ロールアウトに頼らず、各ターンで方策が正解に割り当てる確率がどれだけ増えたか、つまりInformation Gainを信用割当の信号に使う。さらにturn-group単位のpolicy optimizationと適応的clippingで、軌道全体ではなくターン群ごとの改善を安定化する。",
}


def specific_japanese_summary(row: dict[str, Any]) -> str | None:
    title = str(row.get("title") or "")
    for key, value in SPECIFIC_JA_SUMMARIES.items():
        if key in title:
            return value
    return None


def japanese_summary(row: dict[str, Any]) -> str:
    """Return a Japanese Slack-facing summary.

    The raw English abstract remains in memory/raw/web_research/results.jsonl.
    shared-reads should not receive raw English summaries, because that channel
    is later used as a Japanese recall surface.
    """
    summary = clean(str(row.get("summary") or ""), 900)
    if not summary:
        return specific_japanese_summary(row) or ""
    if contains_japanese(summary) and not looks_english(summary):
        return summary
    specific = specific_japanese_summary(row)
    if specific:
        return specific

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
    parser = argparse.ArgumentParser(description="Search external sources and optionally post useful findings to #shared-reads.")
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--max-per-query", type=int, default=4)
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--post", action="store_true", help="post selected findings to Slack; default is local-only")
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
        "post_enabled": args.post,
        "dry_run": args.dry_run,
        "items": candidates,
    }

    if candidates:
        messages = build_shared_reads_messages(candidates)
        if args.dry_run or not args.post:
            result["messages"] = messages
            if not args.post:
                result["post_skipped_reason"] = "posting disabled by default; use --post for explicit Slack publication"
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
