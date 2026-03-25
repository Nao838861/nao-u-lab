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
  python memory_walk.py --gravity     # 重力walk: 直近のbeliefs更新キーワードに引き寄せ
  python memory_walk.py --frontier    # 辺境walk: 最近浮上しなかったソースに偏らせる
  python memory_walk.py --chain       # 連想チェーン: 1つの記憶から関連記憶を芋づる式に辿る
  python memory_walk.py --chain --context  # 文脈連想: session_primerの「今の問い」から起点をバイアス
  python memory_walk.py --log         # walk結果をwalk_log.jsonlに記録

依存: stdlib only
"""

import os
import sys
import random
import glob
import json
import re
from datetime import datetime
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
        elif s.startswith("## Nao_u") or s.startswith("## nao_u"):
            noise_count += 1
    # プロンプトテンプレート検出（chain_walk S/N改善 #057）
    text_start = text[:200]
    if "自律サイクル実行" in text_start and "順番に行え" in text_start:
        return True
    if "ツイートを1件" in text_start and "生成し" in text_start:
        return True
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


WALK_LOG_PATH = BASE_DIR / "walk_log.jsonl"


def extract_beliefs_keywords(max_beliefs=5):
    """beliefs.mdから最近更新された信念のキーワードを抽出する。

    重力walkで使用: 「今考えていることの近傍」を歩くためのアンカー。
    """
    beliefs_path = BASE_DIR / "memory" / "beliefs.md"
    if not beliefs_path.exists():
        return []

    try:
        text = beliefs_path.read_text(encoding="utf-8")
    except Exception:
        return []

    # 各信念ブロック(### B0xx: ...)を抽出し、最終更新日でソート
    belief_blocks = re.split(r'(?=^### B\d{3}:)', text, flags=re.MULTILINE)

    dated_beliefs = []
    for block in belief_blocks:
        if not block.startswith("### B"):
            continue
        # 最終更新日を抽出
        date_match = re.search(r'最終更新:\s*(\d{4}-\d{2}-\d{2})', block)
        if date_match:
            dated_beliefs.append((date_match.group(1), block))

    # 日付降順でソートし、上位max_beliefs個を取る
    dated_beliefs.sort(key=lambda x: x[0], reverse=True)
    recent = dated_beliefs[:max_beliefs]

    # キーワード抽出: タイトル行と根拠行から2文字以上の日本語/英語トークンを収集
    keywords = set()
    stop_words = {
        "する", "ある", "いる", "なる", "できる", "ない", "れる", "られる",
        "こと", "もの", "ため", "よう", "それ", "これ", "その", "この",
        "から", "まで", "だけ", "について", "として", "による", "において",
        "the", "and", "for", "with", "from", "that", "this", "not", "are",
        "was", "has", "have", "been", "will", "can", "but", "more", "also",
        "確信度", "最終更新", "根拠", "状態", "体験裏付け", "検証アクション",
        "caused_by", "YES", "Active", "Core",
    }

    for _, block in recent:
        # タイトル行
        title_match = re.match(r'### B\d{3}:\s*(.+)', block)
        if title_match:
            title = title_match.group(1)
            # 日本語: 2文字以上の連続
            jp_tokens = re.findall(r'[\u3040-\u9fff]{2,}', title)
            keywords.update(jp_tokens)
            # 英語: 3文字以上の単語
            en_tokens = re.findall(r'[a-zA-Z]{3,}', title)
            keywords.update(t.lower() for t in en_tokens)

        # caused_by行（因果関係に重要なキーワードが多い）
        caused_match = re.search(r'caused_by:\s*(.+)', block)
        if caused_match:
            line = caused_match.group(1)
            jp_tokens = re.findall(r'[\u3040-\u9fff]{2,}', line)
            keywords.update(jp_tokens)

    # ストップワード除去
    keywords = {k for k in keywords if k not in stop_words and len(k) >= 2}
    return list(keywords)


def load_walk_history(last_n_cycles=3):
    """walk_log.jsonlから直近Nサイクルの浮上済みソースを取得。

    辺境walkで使用: 「最近出なかったソース」を優先するため。
    """
    if not WALK_LOG_PATH.exists():
        return set()

    recent_sources = set()
    try:
        with open(WALK_LOG_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
        # 直近last_n_cyclesエントリを見る
        for line in lines[-last_n_cycles * 5:]:  # 1サイクルあたり最大5チャンク想定
            try:
                entry = json.loads(line.strip())
                for chunk_info in entry.get("chunks_shown", []):
                    recent_sources.add(chunk_info.get("source", ""))
            except (json.JSONDecodeError, AttributeError):
                continue
    except Exception:
        pass
    return recent_sources


def gravity_sample(chunks, n, keywords):
    """重力walk: キーワードとの共通語数でチャンクにバイアスをかけてサンプリング。

    完全にキーワードに引っ張られると検索と同じになるので、
    スコア0のチャンクにも最低重み1を与えて偶発性を残す。
    """
    if not keywords:
        return random.sample(chunks, min(n, len(chunks)))

    scored = []
    for chunk in chunks:
        text_lower = chunk["text"].lower()
        score = sum(1 for kw in keywords if kw in text_lower)
        # 重み: スコア0→1, スコア1→3, スコア2→6, ...
        weight = 1 + score * (score + 1)
        scored.append((chunk, weight))

    # 重み付きサンプリング（置換なし）
    selected = []
    remaining = list(scored)
    for _ in range(min(n, len(remaining))):
        total = sum(w for _, w in remaining)
        r = random.uniform(0, total)
        cumulative = 0
        for idx, (chunk, weight) in enumerate(remaining):
            cumulative += weight
            if cumulative >= r:
                selected.append(chunk)
                remaining.pop(idx)
                break

    return selected


def frontier_sample(chunks, n):
    """辺境walk: 最近浮上しなかったソースに偏らせてサンプリング。

    直近walk_logに出現したソースの重みを1/4にする。
    """
    recent_sources = load_walk_history(last_n_cycles=3)

    if not recent_sources:
        return random.sample(chunks, min(n, len(chunks)))

    scored = []
    for chunk in chunks:
        if chunk["source"] in recent_sources:
            weight = 1  # 最近出たソース: 低重み
        else:
            weight = 4  # 出ていないソース: 高重み
        scored.append((chunk, weight))

    # 重み付きサンプリング
    selected = []
    remaining = list(scored)
    for _ in range(min(n, len(remaining))):
        total = sum(w for _, w in remaining)
        r = random.uniform(0, total)
        cumulative = 0
        for idx, (chunk, weight) in enumerate(remaining):
            cumulative += weight
            if cumulative >= r:
                selected.append(chunk)
                remaining.pop(idx)
                break

    return selected


def log_walk(instance, selected, walk_mode):
    """walk結果をwalk_log.jsonlに1行追記する。"""
    entry = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "instance": instance,
        "mode": walk_mode,
        "chunks_shown": [
            {"source": c["source"], "text_preview": c["text"][:100]}
            for c in selected
        ],
        "connections_made": [],  # LLMが後から記入するためのプレースホルダ
        "action_taken": "",      # 同上
    }
    try:
        with open(WALK_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"Warning: walk log write failed: {e}", file=sys.stderr)


def extract_file_references(text):
    """テキストから参照されているファイル名を抽出する。

    SYNAPSE論文(arxiv 2601.02744)の知見: 因果リンク(caused_by等)は
    キーワードリンクより2倍重要。ファイル間の明示的参照は因果的つながりの
    最も信頼できる指標。
    """
    # .md ファイル参照
    md_refs = re.findall(r'[\w_-]+\.md', text)
    # .jsonl ファイル参照
    jsonl_refs = re.findall(r'[\w_-]+\.jsonl', text)
    # .py ファイル参照
    py_refs = re.findall(r'[\w_-]+\.py', text)
    return set(md_refs + jsonl_refs + py_refs)


def extract_keywords_from_text(text, max_keywords=8):
    """テキストから検索に使えるキーワードを抽出する。

    連想チェーンの核: 1つの断片からキーワードを引き出し、
    それを次の断片を探すアンカーにする。
    """
    stop_words = {
        "する", "ある", "いる", "なる", "できる", "ない", "れる", "られる",
        "こと", "もの", "ため", "よう", "それ", "これ", "その", "この",
        "から", "まで", "だけ", "について", "として", "による", "において",
        "という", "だった", "ている", "ていた", "された", "される",
        "the", "and", "for", "with", "from", "that", "this", "not", "are",
        "was", "has", "have", "been", "will", "can", "but", "more", "also",
        "Log", "Mir", "Ash", "Nao_u", "nao-u", "slack",
        "対話ログ", "セッション", "セッションID", "memory", "ファイル",
        "コミット", "プッシュ", "コマンド", "ツール", "エラー",
        "サイクル", "フェーズ", "チャンネル", "メッセージ",
        "print", "python", "import", "return", "function", "status",
        "name", "description", "type", "project", "user", "feedback",
        "reference", "提案者", "適用者", "検証期限", "検証手段",
        "改善内容", "期待効果", "検証結果", "根源原理",
        # 命令文テンプレートのノイズ語（chain_walk S/N改善 #057）
        "生成して", "追記して", "確認して", "実行して", "取得して",
        "生成する", "追記する", "実行する",
        "ください", "以下を順番", "順番に行",
        "ボットとして", "ランダムに選ぶ",
    }

    # フロントマター(---で囲まれた部分)を除外
    cleaned = re.sub(r'^---\n.*?\n---\n', '', text, count=1, flags=re.DOTALL)
    if not cleaned.strip():
        cleaned = text

    keywords = []
    # 日本語: 3文字以上の漢字/カナ連続（意味のある語が多い）
    jp_tokens = re.findall(r'[\u3040-\u9fff]{3,}', cleaned)
    for t in jp_tokens:
        if t not in stop_words and t not in keywords:
            keywords.append(t)

    # 英語: 4文字以上の単語（短い語はノイズが多い）
    en_tokens = re.findall(r'[a-zA-Z]{4,}', cleaned)
    for t in en_tokens:
        tl = t.lower()
        if tl not in stop_words and tl not in [k.lower() for k in keywords]:
            keywords.append(t)

    return keywords[:max_keywords]


def self_sim(a, b):
    """2つのテキストの単語集合ベースのJaccard類似度。重複ループ防止用。"""
    words_a = set(a.split())
    words_b = set(b.split())
    if not words_a or not words_b:
        return 0.0
    return len(words_a & words_b) / len(words_a | words_b)


def extract_context_keywords(max_keywords=10):
    """session_primer.mdの「今の問い」から文脈キーワードを抽出する。

    context-primed chain walk用: 「今考えていること」から連想を開始するためのアンカー。
    ACAN (Frontiers fpsyg.2025.1591618) の知見: 同じ記憶でも文脈により活性度が変わる。
    完全な文脈依存検索は不可能だが、開始点のバイアスで近似する。
    """
    primer_path = BASE_DIR / "memory" / "session_primer.md"
    if not primer_path.exists():
        return []

    try:
        text = primer_path.read_text(encoding="utf-8")
    except Exception:
        return []

    # "今の問い" セクションを抽出
    question_match = re.search(r'## 今の問い.*?\n(.*?)(?=\n## |\Z)', text, re.DOTALL)
    if question_match:
        question_text = question_match.group(1)
    else:
        # フォールバック: 温度の種火全体の冒頭
        question_text = text[:1000]

    return extract_keywords_from_text(question_text, max_keywords=max_keywords)


def chain_walk(chunks, chain_length=3, context_keywords=None):
    """連想チェーンwalk: 1つの記憶から関連する記憶を芋づる式に辿る。

    手順:
    1. 起点を選ぶ（context_keywordsがあれば文脈バイアス、なければランダム）
    2. そのチャンクからキーワード＋参照リンクを抽出
    3. キーワードスコア＋参照ブーストで他のチャンクをスコアリング
    4. 新しいチャンクから新たなキーワードを抽出（前のキーワードと合流）
    5. 繰り返してチェーンを形成

    SYNAPSE (arxiv 2601.02744) / Hindsightの知見を適用:
    - ファイル参照（因果リンクの指標）は2.0xブースト
    - キーワードマッチは1.0x（ベースライン）
    ACAN (Frontiers 2025) の知見を適用:
    - context_keywords指定時、起点の選択を文脈バイアス
    各リンクで「なぜこの断片が繋がったか」を表示する。
    """
    CAUSAL_BOOST = 2.0  # Hindsight: causal chains stay "hot" longer

    if len(chunks) < chain_length:
        return random.sample(chunks, min(chain_length, len(chunks))), []

    # 起点を選ぶ
    if context_keywords:
        # 文脈駆動: session_primerのキーワードで重み付きサンプリング
        scored = []
        for chunk in chunks:
            text_lower = chunk["text"].lower()
            score = sum(1 for kw in context_keywords if kw.lower() in text_lower)
            weight = 1 + score * (score + 1)  # gravity_sampleと同じ式
            scored.append((chunk, weight))
        total = sum(w for _, w in scored)
        r = random.uniform(0, total)
        cumulative = 0
        seed = chunks[0]
        for chunk, weight in scored:
            cumulative += weight
            if cumulative >= r:
                seed = chunk
                break
    else:
        seed = random.choice(chunks)
    chain = [seed]
    connections = []  # 各リンク間の接続キーワード
    used_sources = {seed["source"]}

    remaining = [c for c in chunks if c["source"] != seed["source"]]

    for step in range(chain_length - 1):
        if not remaining:
            break

        # 直近のチャンクからキーワード＋参照リンクを抽出
        current_text = chain[-1]["text"]
        keywords = extract_keywords_from_text(current_text)
        file_refs = extract_file_references(current_text)

        if not keywords and not file_refs:
            # キーワードも参照も取れなければランダムに繋ぐ
            next_chunk = random.choice(remaining)
            chain.append(next_chunk)
            connections.append(["(ランダム接続)"])
            remaining = [c for c in remaining if c["source"] != next_chunk["source"]]
            continue

        # チェーン内の既存テキストとの重複チェック用
        chain_texts = [c["text"][:200] for c in chain]

        # キーワード＋参照リンクでスコアリング
        scored = []
        for chunk in remaining:
            # 既存チャンクとテキストが酷似なら除外（重複ループ防止）
            chunk_prefix = chunk["text"][:200]
            if any(self_sim(chunk_prefix, ct) > 0.6 for ct in chain_texts):
                continue

            text_lower = chunk["text"].lower()
            matching_kw = [kw for kw in keywords if kw.lower() in text_lower]
            kw_score = len(matching_kw)

            # 参照ブースト: チャンクのソースが現在のテキストに参照されている場合
            ref_score = 0.0
            ref_labels = []
            chunk_source = chunk["source"]
            # ソース名がファイル参照に含まれるか
            for ref in file_refs:
                if ref in chunk_source or chunk_source.endswith(ref):
                    ref_score = CAUSAL_BOOST
                    ref_labels.append(f"→{ref}")
                    break
            # 逆方向: チャンクのテキストが現在のソースを参照しているか
            if ref_score == 0 and chain[-1].get("source"):
                current_source = chain[-1]["source"]
                chunk_refs = extract_file_references(chunk["text"])
                for ref in chunk_refs:
                    if ref in current_source or current_source.endswith(ref):
                        ref_score = CAUSAL_BOOST * 0.8  # 逆参照は少し弱い
                        ref_labels.append(f"←{ref}")
                        break

            total_score = kw_score + ref_score
            if total_score > 0:
                all_labels = matching_kw + ref_labels
                scored.append((chunk, total_score, all_labels))

        if scored:
            # 上位候補からランダムに選ぶ（完全にtop-1だと多様性がない）
            scored.sort(key=lambda x: x[1], reverse=True)
            top_n = min(3, len(scored))
            chosen_idx = random.randint(0, top_n - 1)
            next_chunk, _, matching_labels = scored[chosen_idx]
            chain.append(next_chunk)
            connections.append(matching_labels)
        else:
            # マッチなし→ランダムに繋ぐ
            next_chunk = random.choice(remaining)
            chain.append(next_chunk)
            connections.append(["(関連語なし — 偶発接続)"])

        used_sources.add(next_chunk["source"])
        remaining = [c for c in remaining if c["source"] != next_chunk["source"]]

    return chain, connections


def walk(n=1, source_filter=None, mode="random", do_log=False, instance="unknown", context_primed=False):
    """記憶の散歩を実行する。

    mode:
      "random"   — 純粋ランダム（Mir: 対照群）
      "gravity"  — 重力walk（Ash: 直近beliefs近傍）
      "frontier" — 辺境walk（Log: 最近浮上しなかったソース優先）
      "chain"    — 連想チェーン（Log: 1つの記憶から関連を芋づる式に辿る）
    context_primed: Trueならchain walkの起点をsession_primerの文脈でバイアスする
    """
    chunks = collect_all_chunks(source_filter)

    if not chunks:
        print("記憶の散歩: 読み込めるソースがありませんでした。")
        return

    if mode == "chain":
        chain_len = max(n, 3)  # チェーンは最低3リンク
        context_kw = extract_context_keywords() if context_primed else None
        selected, connections = chain_walk(chunks, chain_length=chain_len, context_keywords=context_kw)
        if context_kw:
            mode_label = f"文脈連想チェーン (文脈: {', '.join(context_kw[:5])}{'...' if len(context_kw) > 5 else ''}) ({len(chunks)}個の断片から{chain_len}リンクを生成)"
        else:
            mode_label = f"連想チェーン ({len(chunks)}個の断片から{chain_len}リンクを生成)"
        print(f"━━━ 記憶の散歩 [{mode_label}] ━━━\n")

        for i, chunk in enumerate(selected):
            if i == 0:
                print(f"🔵 起点: {chunk['source']}")
            else:
                conn_kw = connections[i - 1] if i - 1 < len(connections) else []
                kw_str = ", ".join(conn_kw[:5])
                print(f"  ↓ 接続語: {kw_str}")
                print(f"🔗 [{i+1}] {chunk['source']}")

            text = chunk["text"]
            lines = text.split("\n")
            if len(lines) > MAX_CHUNK_LINES:
                text = "\n".join(lines[:MAX_CHUNK_LINES]) + "\n  …（続きあり）"
            print(text)
            print()

        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        if do_log:
            log_walk(instance, selected, mode)
            print(f"\n(walk_log.jsonl に記録済み)")
        return

    n = min(n, len(chunks))

    if mode == "gravity":
        keywords = extract_beliefs_keywords(max_beliefs=5)
        selected = gravity_sample(chunks, n, keywords)
        mode_label = f"重力walk (キーワード: {', '.join(keywords[:8])}{'...' if len(keywords) > 8 else ''})"
    elif mode == "frontier":
        selected = frontier_sample(chunks, n)
        mode_label = "辺境walk (最近浮上しなかったソース優先)"
    else:
        selected = random.sample(chunks, n)
        mode_label = "ランダム"

    print(f"━━━ 記憶の散歩 [{mode_label}] ({len(chunks)}個の断片から{n}個を選出) ━━━\n")

    for i, chunk in enumerate(selected, 1):
        if n > 1:
            print(f"── [{i}/{n}] {chunk['source']} ──")
        else:
            print(f"── {chunk['source']} ──")
        text = chunk["text"]
        lines = text.split("\n")
        if len(lines) > MAX_CHUNK_LINES:
            text = "\n".join(lines[:MAX_CHUNK_LINES]) + "\n  …（続きあり）"
        print(text)
        print()

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    if do_log:
        log_walk(instance, selected, mode)
        print(f"\n(walk_log.jsonl に記録済み)")


if __name__ == "__main__":
    n = 1
    source_filter = None
    mode = "random"
    do_log = False
    instance = "unknown"
    context_primed = False

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--n" and i + 1 < len(args):
            n = int(args[i + 1])
            i += 2
        elif args[i] == "--source" and i + 1 < len(args):
            source_filter = args[i + 1]
            i += 2
        elif args[i] == "--gravity":
            mode = "gravity"
            i += 1
        elif args[i] == "--frontier":
            mode = "frontier"
            i += 1
        elif args[i] == "--chain":
            mode = "chain"
            i += 1
        elif args[i] == "--context":
            context_primed = True
            i += 1
        elif args[i] == "--log":
            do_log = True
            i += 1
        elif args[i] == "--instance" and i + 1 < len(args):
            instance = args[i + 1]
            i += 2
        else:
            i += 1

    walk(n=n, source_filter=source_filter, mode=mode, do_log=do_log, instance=instance, context_primed=context_primed)
