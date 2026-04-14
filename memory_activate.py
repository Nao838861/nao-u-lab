#!/usr/bin/env python3
"""
memory_activate.py — Spreading Activation over FTS5 + File Links

Synapse (NAACL 2025) の知見を既存インフラ(FTS5 + 横リンク)で実装。
「コンテキストにないものから連想できない」問題への解法。

アルゴリズム:
  1. Anchor: テキストからキーワードを抽出し、FTS5でシード取得
  2. Spread: シードからファイル参照(2.0x)とキーワード(1.0x)で1-2hop拡散
  3. Fan effect: 複数経路から到達されたノードはブースト
  4. Top-K: 活性度上位を返す

Usage:
  python memory_activate.py "Potを作りながら考えたこと"
  python memory_activate.py --from-intent          # mir_boot_intentから自動取得
  python memory_activate.py --from-primer           # session_primerから自動取得
  python memory_activate.py "クエリ" --top 10       # 上位10件
  python memory_activate.py "クエリ" --verbose       # 拡散過程を表示
"""
import argparse
import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8',
                      errors='replace', closefd=False)

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / ".memory_search.db"

# Activation parameters
DECAY = 0.5           # Each hop reduces activation by this factor
CAUSAL_BOOST = 2.0    # File reference links (Hindsight: causal > keyword)
KEYWORD_BOOST = 1.0   # Keyword match links
MAX_SEEDS = 10        # Initial FTS5 hits
MAX_SPREAD = 15       # Candidates per hop
DEFAULT_TOP_K = 7
RESCUE_LOOKBACK_DAYS = 7
RESCUE_OBSCURITY_BOOST = 1.5
TEMP_BOOST_FACTOR = 0.15  # Each temperature point above 3 adds 15% boost
STC_TRIGGER_CACHE = BASE_DIR / ".stc_last_trigger"
STC_RESCUE_LOG = BASE_DIR / "log" / "stc_rescue.log"

# Stop words for keyword extraction (shared with memory_walk.py)
STOP_WORDS = {
    "する", "ある", "いる", "なる", "できる", "ない", "れる", "られる",
    "こと", "もの", "ため", "よう", "それ", "これ", "その", "この",
    "から", "まで", "だけ", "について", "として", "による", "において",
    "という", "だった", "ている", "ていた", "された", "される",
    "the", "and", "for", "with", "from", "that", "this", "not", "are",
    "was", "has", "have", "been", "will", "can", "but", "more", "also",
    "Log", "Mir", "Ash", "Nao_u", "nao", "slack", "memory",
    "サイクル", "セッション", "ファイル", "メッセージ", "チャンネル",
}


def get_memory_temperatures():
    """Parse MEMORY.md for [T:N] temperature tags. Returns {filename: temperature}."""
    memory_md = BASE_DIR / "memory" / "MEMORY.md"
    if not memory_md.exists():
        return {}
    text = memory_md.read_text(encoding="utf-8")
    return {m.group(1): int(m.group(2)) for m in re.finditer(r'\[([^\]]+\.(?:md|json))\].*?\[T:(\d)\]', text)}


def extract_keywords(text, max_kw=8):
    """テキストからFTS5検索に使えるキーワードを抽出する。

    FTS5 unicode61はCJK文字を1文字ずつトークン化するため、
    2文字の漢字語（体験、記憶、再帰など）が最も検索に有効。
    ひらがな交じりの長い文字列はノイズになるので、
    漢字2-4文字の複合語を優先的に抽出する。

    会話文（「Potを作りながら考えた」等）では漢字が1文字ずつ分散
    するため、英語3文字以上+単漢字フォールバックを追加。
    """
    cleaned = re.sub(r'^---\n.*?\n---\n', '', text, count=1, flags=re.DOTALL)
    if not cleaned.strip():
        cleaned = text

    keywords = []
    # 漢字2-4文字の複合語（最も検索に有効）
    for t in re.findall(r'[\u4e00-\u9fff]{2,4}', cleaned):
        if t not in STOP_WORDS and t not in keywords:
            keywords.append(t)
    # カタカナ3文字以上の外来語
    for t in re.findall(r'[\u30a0-\u30ff]{3,}', cleaned):
        if t not in STOP_WORDS and t not in keywords:
            keywords.append(t)
    # 英語: 3文字以上（"Pot"等の短い固有名詞を拾うため閾値を下げた）
    for t in re.findall(r'[a-zA-Z]{3,}', cleaned):
        if t.lower() not in STOP_WORDS and t not in keywords:
            keywords.append(t)
    # フォールバック: 漢字2文字複合語が0個の場合、単漢字を追加
    # 会話文で漢字が分散するケース（作、考、等）への対応
    _SINGLE_KANJI_STOP = {"的", "人", "大", "小", "中", "上", "下", "前", "後",
                          "日", "月", "年", "時", "分", "回", "個", "件", "者",
                          "方", "事", "物", "所", "目", "手", "気", "今", "全",
                          "他", "各", "同", "別", "次", "新", "高", "長", "多"}
    kanji_compound_count = len([k for k in keywords
                                if re.fullmatch(r'[\u4e00-\u9fff]{2,4}', k)])
    if kanji_compound_count == 0:
        for t in re.findall(r'[\u4e00-\u9fff]', cleaned):
            if t not in _SINGLE_KANJI_STOP and t not in STOP_WORDS and t not in keywords:
                keywords.append(t)
    return keywords[:max_kw]


def extract_file_refs(text):
    """テキストからファイル参照を抽出する。"""
    refs = set()
    refs.update(re.findall(r'[\w_-]+\.md', text))
    refs.update(re.findall(r'[\w_-]+\.jsonl', text))
    refs.update(re.findall(r'[\w_-]+\.py', text))
    return refs


def fts5_search(conn, query, limit):
    """FTS5検索（日本語複合クエリ対応）。"""
    # Try direct query first
    try:
        rows = conn.execute(
            """SELECT source, chunk_id, content, rank
               FROM chunks WHERE chunks MATCH ? ORDER BY rank LIMIT ?""",
            (query, limit)
        ).fetchall()
        if rows:
            return rows
    except sqlite3.OperationalError:
        pass

    # Escape special chars
    escaped = re.sub(r'[*+\-"()]', ' ', query).strip()
    if escaped and escaped != query:
        try:
            rows = conn.execute(
                """SELECT source, chunk_id, content, rank
                   FROM chunks WHERE chunks MATCH ? ORDER BY rank LIMIT ?""",
                (escaped, limit)
            ).fetchall()
            if rows:
                return rows
        except sqlite3.OperationalError:
            pass

    # Split into individual keywords, merge by match count
    keywords = [k for k in re.split(r'\s+', re.sub(r'[*+\-"()（）]', ' ', query).strip()) if len(k) >= 1]
    if len(keywords) <= 1:
        return []

    chunk_scores = {}
    for kw in keywords:
        try:
            kw_rows = conn.execute(
                """SELECT source, chunk_id, content, rank
                   FROM chunks WHERE chunks MATCH ? ORDER BY rank LIMIT ?""",
                (kw, limit * 3)
            ).fetchall()
        except sqlite3.OperationalError:
            continue
        for source, chunk_id, content, rank in kw_rows:
            key = chunk_id
            if key not in chunk_scores:
                chunk_scores[key] = {
                    'source': source, 'chunk_id': chunk_id,
                    'content': content, 'kw_count': 0, 'best_rank': rank
                }
            chunk_scores[key]['kw_count'] += 1
            if rank < chunk_scores[key]['best_rank']:
                chunk_scores[key]['best_rank'] = rank

    sorted_chunks = sorted(chunk_scores.values(), key=lambda x: (-x['kw_count'], x['best_rank']))
    return [(c['source'], c['chunk_id'], c['content'], c['best_rank']) for c in sorted_chunks[:limit]]


def get_content_by_source(conn, source, limit=3):
    """ソースファイル名でチャンクを取得する。"""
    rows = conn.execute(
        """SELECT source, chunk_id, content FROM chunks
           WHERE source LIKE ? LIMIT ?""",
        (f"%{source}%", limit)
    ).fetchall()
    return rows


def spreading_activation(anchor_text, top_k=DEFAULT_TOP_K, verbose=False):
    """Spreading Activation の本体。

    Returns: list of (source, chunk_id, activation, path_description)
    """
    if not DB_PATH.exists():
        print("Error: .memory_search.db not found. Run `python memory_search.py --build` first.", file=sys.stderr)
        return []

    conn = sqlite3.connect(str(DB_PATH))

    # ── Step 1: Anchor → Seeds ──
    anchor_keywords = extract_keywords(anchor_text)
    if verbose:
        print(f"[Anchor keywords] {anchor_keywords}")

    # FTS5 search with anchor keywords
    query = " ".join(anchor_keywords[:5]) if anchor_keywords else anchor_text[:100]
    seed_rows = fts5_search(conn, query, MAX_SEEDS)

    if not seed_rows and anchor_keywords:
        # Fallback: try each keyword individually
        for kw in anchor_keywords[:3]:
            rows = fts5_search(conn, kw, 3)
            seed_rows.extend(rows)

    if not seed_rows:
        print("No seeds found for anchor.", file=sys.stderr)
        conn.close()
        return []

    # Activation map: chunk_id → {source, activation, paths}
    activation = {}

    def activate(chunk_id, source, content, act_level, path_desc):
        if chunk_id in activation:
            # Fan effect: multiple paths boost
            activation[chunk_id]['activation'] += act_level
            activation[chunk_id]['paths'].append(path_desc)
        else:
            activation[chunk_id] = {
                'source': source,
                'content': content[:300],
                'activation': act_level,
                'paths': [path_desc],
            }

    # Activate seeds — use rank to differentiate (better FTS5 rank = higher activation)
    # Normalize: best rank gets 1.0, worst gets 0.3
    if seed_rows:
        ranks = [abs(r) for _, _, _, r in seed_rows]
        min_r, max_r = min(ranks), max(ranks)
        rank_range = max_r - min_r if max_r != min_r else 1.0
        for source, chunk_id, content, rank in seed_rows:
            normalized = 1.0 - 0.7 * (abs(rank) - min_r) / rank_range
            activate(chunk_id, source, content, normalized, f"seed({query[:20]})")

    if verbose:
        print(f"[Seeds] {len(seed_rows)} chunks activated")

    # ── Step 2: Spread 1-hop (from seeds) ──
    hop1_keywords = set()
    hop1_file_refs = set()

    for source, chunk_id, content, rank in seed_rows:
        hop1_keywords.update(extract_keywords(content, max_kw=5))
        hop1_file_refs.update(extract_file_refs(content))

    # Remove anchor keywords from hop1 to find NEW connections
    hop1_keywords -= set(anchor_keywords)
    hop1_keywords -= STOP_WORDS

    if verbose:
        print(f"[Hop-1 keywords] {list(hop1_keywords)[:10]}")
        print(f"[Hop-1 file refs] {hop1_file_refs}")

    # 2a: Follow file references (causal links, 2.0x)
    for ref in list(hop1_file_refs)[:8]:
        ref_rows = get_content_by_source(conn, ref, limit=2)
        for r_source, r_chunk_id, r_content in ref_rows:
            if r_chunk_id not in activation:
                activate(r_chunk_id, r_source, r_content,
                         CAUSAL_BOOST * DECAY, f"ref→{ref}")

    # 2b: Follow keywords (associative links, 1.0x)
    hop1_kw_list = list(hop1_keywords)[:6]
    for kw in hop1_kw_list:
        kw_rows = fts5_search(conn, kw, 3)
        for kw_source, kw_chunk_id, kw_content, kw_rank in kw_rows:
            if kw_chunk_id not in activation:
                activate(kw_chunk_id, kw_source, kw_content,
                         KEYWORD_BOOST * DECAY, f"kw({kw})")
            elif kw_chunk_id in activation:
                # Fan effect boost for already-activated nodes
                activation[kw_chunk_id]['activation'] += KEYWORD_BOOST * DECAY * 0.3
                activation[kw_chunk_id]['paths'].append(f"+kw({kw})")

    if verbose:
        print(f"[After hop-1] {len(activation)} nodes activated")

    # ── Step 3: Spread 2-hop (from hop-1 results, deeper but weaker) ──
    hop1_nodes = sorted(activation.items(), key=lambda x: -x[1]['activation'])[:5]
    hop2_file_refs = set()

    for chunk_id, info in hop1_nodes:
        hop2_file_refs.update(extract_file_refs(info['content']))

    hop2_file_refs -= hop1_file_refs  # Only NEW references

    for ref in list(hop2_file_refs)[:5]:
        ref_rows = get_content_by_source(conn, ref, limit=1)
        for r_source, r_chunk_id, r_content in ref_rows:
            activate(r_chunk_id, r_source, r_content,
                     CAUSAL_BOOST * DECAY * DECAY, f"hop2→{ref}")

    if verbose:
        print(f"[After hop-2] {len(activation)} nodes activated")

    conn.close()

    # ── Step 4: Rank and return top-K ──
    # Deduplicate by source file: SUM activation per source (fan effect across chunks)
    source_agg = {}
    for chunk_id, info in activation.items():
        src = info['source']
        if src not in source_agg:
            source_agg[src] = {
                'source': src,
                'activation': 0.0,
                'paths': [],
                'best_content': '',
                'best_act': 0.0,
                'chunk_id': chunk_id,
            }
        source_agg[src]['activation'] += info['activation']
        source_agg[src]['paths'].extend(info['paths'])
        if info['activation'] > source_agg[src]['best_act']:
            source_agg[src]['best_act'] = info['activation']
            source_agg[src]['best_content'] = info['content']
            source_agg[src]['chunk_id'] = chunk_id

    # Temperature boost: high-temperature memories in MEMORY.md get activation boost
    memory_temps = get_memory_temperatures()
    for src, info in source_agg.items():
        t = memory_temps.get(os.path.basename(src), 0)
        if t:
            info['activation'] *= 1.0 + (t - 3) * TEMP_BOOST_FACTOR

    ranked = sorted(source_agg.values(), key=lambda x: -x['activation'])[:top_k]

    return [
        (r['source'], r['chunk_id'], r['activation'],
         " + ".join(dict.fromkeys(r['paths'][:4])),  # dedupe paths
         r['best_content'][:150].replace('\n', ' '))
        for r in ranked
    ]


def read_boot_intent():
    """mir_boot_intent.mdから起動意図を読み取る。"""
    intent_path = BASE_DIR / "memory" / "mir_boot_intent.md"
    if not intent_path.exists():
        return None
    text = intent_path.read_text(encoding="utf-8")
    # "起動時の焦点" と "今回やること" を抽出
    focus = ""
    for section in ["起動時の焦点", "今回やること", "起動時の気分"]:
        m = re.search(rf'## {section}\n(.*?)(?=\n## |\Z)', text, re.DOTALL)
        if m:
            focus += m.group(1).strip() + " "
    return focus.strip() if focus.strip() else None


def read_session_primer():
    """session_primer.mdから現在の問いを読み取る。"""
    primer_path = BASE_DIR / "memory" / "session_primer.md"
    if not primer_path.exists():
        return None
    text = primer_path.read_text(encoding="utf-8")
    # "今の問い" or "温度の種火" セクション
    m = re.search(r'## 今の問い.*?\n(.*?)(?=\n## |\Z)', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    # Fallback: first 500 chars
    return text[:500]


def get_well_known_sources():
    """Parse MEMORY.md to identify files already well-referenced (no rescue needed)."""
    memory_md = BASE_DIR / "memory" / "MEMORY.md"
    if not memory_md.exists():
        return set()
    text = memory_md.read_text(encoding="utf-8")
    refs = set(re.findall(r'[\w_-]+\.md', text))
    refs.update({"MEMORY.md", "core_mission.md", "session_primer.md",
                 "mir_boot_intent.md", "feedback_tweet_style.md",
                 "action_reservations.md", "pending_requests.md",
                 "feedback_index.md", "CLAUDE.md", "beliefs.md",
                 "beliefs_compact.md", "kaizen_tracker.md",
                 "kaizen_review_queue.md", "inbox_mac.md",
                 "inbox_win.md", "inbox_win2.md",
                 "l2_dual_index.md"})
    return refs


def retroactive_rescue(high_temp_text, lookback_days=RESCUE_LOOKBACK_DAYS,
                       top_k=5, verbose=False):
    """STC (Synaptic Tag-and-Capture): Retroactively rescue weak memories.

    High-temperature events rescue semantically related weak memories
    within a temporal window. (Dunsmoor 2022 + Chong 2025)

    "Weak" = not referenced by MEMORY.md, not always-loaded.
    "Temporal window" = past lookback_days, excluding today.
    "Semantic selectivity" = spreading activation with the high-temp text.

    Returns: list of (source, chunk_id, rescue_score, path_desc, preview, date)
    """
    if not DB_PATH.exists():
        print("Error: .memory_search.db not found.", file=sys.stderr)
        return []

    conn = sqlite3.connect(str(DB_PATH))
    well_known = get_well_known_sources()

    today = datetime.now().strftime('%Y-%m-%d')
    cutoff = (datetime.now() - timedelta(days=lookback_days)).strftime('%Y-%m-%d')

    if verbose:
        print(f"[STC Rescue] Well-known files: {len(well_known)}")
        print(f"[STC Rescue] Time window: {cutoff} → {today} (excluding today)")

    # Step 1: Wide-net spreading activation
    activated = spreading_activation(high_temp_text, top_k=top_k * 5, verbose=verbose)

    if not activated:
        conn.close()
        return []

    # Step 2: Filter for rescue candidates
    rescued = []
    for source, chunk_id, activation, path_desc, preview in activated:
        basename = os.path.basename(source)

        # Skip well-known files — they don't need rescue
        if basename in well_known:
            if verbose:
                print(f"  [skip:well-known] {source}")
            continue

        # Check temporal window
        date_row = conn.execute(
            "SELECT date FROM chunk_dates WHERE chunk_id = ?", (chunk_id,)
        ).fetchone()

        chunk_date = date_row[0] if date_row else None

        if chunk_date:
            if chunk_date >= today:
                if verbose:
                    print(f"  [skip:today] {source} ({chunk_date})")
                continue
            if chunk_date < cutoff:
                if verbose:
                    print(f"  [skip:too-old] {source} ({chunk_date})")
                continue

        # Obscurity boost: weak memories get rescued harder
        rescue_score = activation * RESCUE_OBSCURITY_BOOST

        rescued.append((source, chunk_id, rescue_score, path_desc,
                        preview, chunk_date or "undated"))

    conn.close()
    rescued.sort(key=lambda x: -x[2])
    return rescued[:top_k]


def detect_high_temp_events():
    """Detect recent high-temperature events for STC auto-trigger.

    Sources:
    1. nao_u_live.md — last section (Nao_u speaking directly)
    2. #nao-u messages where Nao_u added commentary (not just URLs)

    Returns: list of (text, source_label), newest first.
    """
    events = []

    # Source 1: nao_u_live.md last section
    live_path = BASE_DIR / "log" / "nao_u_live.md"
    if live_path.exists():
        text = live_path.read_text(encoding="utf-8")
        sections = re.split(r'\n## ', text)
        if len(sections) > 1:
            last_section = sections[-1]
            events.append((last_section[:800], "nao_u_live"))

    # Source 2: Recent #nao-u messages with Nao_u's commentary
    nao_u_jsonl = BASE_DIR / "log" / "slack_archive" / "nao-u.jsonl"
    if nao_u_jsonl.exists():
        lines = nao_u_jsonl.read_text(encoding="utf-8").strip().split('\n')
        for line in reversed(lines[-30:]):
            try:
                msg = json.loads(line)
                text = msg.get("text", "")
                # Only messages where Nao_u wrote actual text, not just URL shares
                clean = re.sub(r'<https?://[^>|]+(?:\|[^>]+)?>', '', text).strip()
                if len(clean) > 5:
                    events.append((text[:300], f"nao-u:{msg.get('datetime', '')[:10]}"))
            except (json.JSONDecodeError, KeyError):
                continue

    return events


def _trigger_hash(text):
    """Compute short hash for trigger dedup."""
    import hashlib
    return hashlib.md5(text.encode("utf-8")).hexdigest()[:16]


def check_and_update_trigger_cache(event_text):
    """Return True if already processed. Otherwise cache it."""
    h = _trigger_hash(event_text)

    known = set()
    if STC_TRIGGER_CACHE.exists():
        known = set(STC_TRIGGER_CACHE.read_text(encoding="utf-8").strip().split('\n'))

    if h in known:
        return True  # Already processed

    known.add(h)
    # Keep last 30 entries
    STC_TRIGGER_CACHE.write_text('\n'.join(list(known)[-30:]) + '\n', encoding="utf-8")
    return False


def log_rescue_results(trigger_source, anchor_preview, results):
    """Append rescue results to stc_rescue.log for tracking."""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
    lines = [f"\n[{timestamp}] trigger={trigger_source} anchor={anchor_preview[:60]}"]
    for source, chunk_id, score, path_desc, preview, date in results:
        lines.append(f"  [{score:.2f}] {source} ({date}) via {path_desc}")
    lines.append("")

    with open(STC_RESCUE_LOG, "a", encoding="utf-8") as f:
        f.write('\n'.join(lines))


def auto_trigger_rescue(lookback_days=RESCUE_LOOKBACK_DAYS, top_k=5,
                        verbose=False, compact=False):
    """Detect high-temp events → run rescue → log and output results.

    Returns True if rescue was triggered, False otherwise.
    """
    events = detect_high_temp_events()
    if not events:
        if verbose:
            print("[STC auto-trigger] No high-temp events found.")
        return False

    triggered = False
    for event_text, source_label in events:
        if check_and_update_trigger_cache(event_text):
            continue  # Already processed

        if verbose:
            print(f"[STC auto-trigger] New event from {source_label}: {event_text[:60]}...")

        results = retroactive_rescue(event_text, lookback_days=lookback_days,
                                     top_k=top_k, verbose=verbose)
        if not results:
            continue

        # Log to file
        log_rescue_results(source_label, event_text, results)

        # Output
        if compact:
            print(f"【STC救済】{source_label}の高温度イベントから{len(results)}件の弱い記憶を発見:")
            for i, (source, chunk_id, score, path_desc, preview, date) in enumerate(results[:3], 1):
                short = preview[:60].replace('\n', ' ')
                print(f"  {i}. {source} ({date}, {score:.1f}) — {short}...")
        else:
            print(f"\n━━━ STC Auto-Trigger Rescue ━━━")
            print(f"Trigger: {source_label}")
            print(f"Anchor: {event_text[:80]}...\n")
            for i, (source, chunk_id, score, path_desc, preview, date) in enumerate(results, 1):
                print(f"  {i}. [{score:.2f}] {source}")
                print(f"     date: {date} | via: {path_desc}")
                if preview:
                    print(f"     >>> {preview[:120]}...")
                print()

        triggered = True
        break  # Process one trigger per cycle to keep context small

    if not triggered and verbose:
        print("[STC auto-trigger] All events already processed.")

    return triggered


def main():
    parser = argparse.ArgumentParser(
        description="Spreading Activation — 連想記憶検索 (Synapse-inspired)")
    parser.add_argument("query", nargs="?", help="Anchor text for activation")
    parser.add_argument("--from-intent", action="store_true",
                        help="Use mir_boot_intent.md as anchor")
    parser.add_argument("--from-primer", action="store_true",
                        help="Use session_primer.md as anchor")
    parser.add_argument("--top", type=int, default=DEFAULT_TOP_K,
                        help=f"Number of results (default: {DEFAULT_TOP_K})")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Show activation spread process")
    parser.add_argument("--compact", action="store_true",
                        help="Compact output for prompt injection (file paths + scores only)")
    parser.add_argument("--rescue", action="store_true",
                        help="STC rescue mode: find weak memories related to high-temp event")
    parser.add_argument("--auto-trigger", action="store_true",
                        help="Auto-detect high-temp events and run rescue (for autonomous cycle)")
    parser.add_argument("--lookback", type=int, default=RESCUE_LOOKBACK_DAYS,
                        help=f"Days to look back for rescue (default: {RESCUE_LOOKBACK_DAYS})")
    args = parser.parse_args()

    # Auto-trigger mode: detect events and rescue automatically
    if args.auto_trigger:
        auto_trigger_rescue(lookback_days=args.lookback, top_k=args.top,
                            verbose=args.verbose, compact=args.compact)
        return

    # Determine anchor text
    anchor = args.query
    if args.from_intent:
        anchor = read_boot_intent()
        if not anchor:
            print("Error: Could not read boot intent.", file=sys.stderr)
            sys.exit(1)
    elif args.from_primer:
        anchor = read_session_primer()
        if not anchor:
            print("Error: Could not read session primer.", file=sys.stderr)
            sys.exit(1)

    if not anchor:
        parser.print_help()
        sys.exit(1)

    # STC Rescue mode
    if args.rescue:
        results = retroactive_rescue(anchor, lookback_days=args.lookback,
                                     top_k=args.top, verbose=args.verbose)
        if not results:
            print("No memories to rescue.")
            return
        print(f"\n━━━ STC Retroactive Rescue ━━━")
        print(f"High-temp anchor: {anchor[:80]}{'...' if len(anchor) > 80 else ''}")
        print(f"Time window: last {args.lookback} days (excluding today)\n")
        for i, (source, chunk_id, score, path_desc, preview, date) in enumerate(results, 1):
            print(f"  {i}. [{score:.2f}] {source}")
            print(f"     date: {date} | via: {path_desc}")
            if preview:
                print(f"     >>> {preview[:120]}...")
            print()
        return

    if args.verbose:
        print(f"━━━ Spreading Activation ━━━")
        print(f"Anchor: {anchor[:100]}{'...' if len(anchor) > 100 else ''}\n")

    results = spreading_activation(anchor, top_k=args.top, verbose=args.verbose)

    if not results:
        print("No activated memories found.")
        return

    if args.compact:
        # Compact format for prompt injection
        # Filter out files that are always loaded (MEMORY.md, core_mission.md, session_primer.md)
        always_loaded = {"MEMORY.md", "core_mission.md", "session_primer.md",
                         "mir_boot_intent.md", "feedback_tweet_style.md",
                         "action_reservations.md", "pending_requests.md",
                         "feedback_index.md"}
        filtered = [(s, c, a, p, pr) for s, c, a, p, pr in results
                    if not any(al in s for al in always_loaded)]
        if not filtered:
            return  # Nothing new to suggest
        print("【連想記憶】起動意図から活性化された記憶:")
        for i, (source, chunk_id, act_level, path_desc, preview) in enumerate(filtered[:5], 1):
            short_preview = preview[:60].replace('\n', ' ')
            print(f"  {i}. {source} ({act_level:.1f}) — {short_preview}...")
        return

    print(f"\n{'━━━' if args.verbose else '━━━ Spreading Activation ━━━'}")
    print(f"Top {len(results)} activated memories:\n")

    max_act = max(r[2] for r in results) if results else 1.0
    for i, (source, chunk_id, act_level, path_desc, preview) in enumerate(results, 1):
        bar_len = int((act_level / max_act) * 10)
        bar = "█" * bar_len + "░" * (10 - bar_len)
        print(f"  {i}. [{act_level:.2f}] {bar} {source}")
        print(f"     via: {path_desc}")
        if preview:
            print(f"     >>> {preview[:120]}...")
        print()


if __name__ == "__main__":
    main()
