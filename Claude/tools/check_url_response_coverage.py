#!/usr/bin/env python3
"""tools/check_url_response_coverage.py — kaizen #136 段階2 hook

Phase 1 §1 で集めた #nao-u の新URLが、Log 自身（または Log_cdx / 他インスタンス）
の過去ログで既応答済みかを 3 経路 grep で構造強制チェックする。

C246 起票以降 N=8 同型再発（Phase 1 走査時に「未対応 URL」と書いたが、
実は数時間前に自分や Log_cdx が応答済み）の処方。
N=2 で起票見送り (feedback_few_rules_big_effect.md) だったが、
C266→C267→C269 で N=3 連続観察 → 構造強制側に傾いた
(feedback_structural_enforcement.md)。

3 経路:
  1. log/slack_archive/*.jsonl              … Log 自身の Slack 取得アーカイブ
  2. ../GPT/memory/raw/slack_api/*.jsonl    … Log_cdx (GPT) の Slack 取得アーカイブ
  3. memory/external_notes_log.md (末尾 200 行) … 外部記事メモ統合先

使い方:
  # staging から URL を抽出して走査
  python tools/check_url_response_coverage.py --from-staging log/cycle_staging_log.md

  # 強制走査 (dry-run / 検証用)
  python tools/check_url_response_coverage.py --tweet-id 2060072412868235587

出力 (1 行 = 1 ヒット):
  [既応答 WARN] tweet_id=2060072412868235587 src=log/slack_archive/shared-reads.jsonl ts=1780069411.xxxxxx
"""
from __future__ import annotations

import argparse
import datetime
import json
import re
import sys
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent

# 3 経路
LOG_SLACK_ARCHIVE = REPO_DIR / "log" / "slack_archive"
GPT_SLACK_ARCHIVE = REPO_DIR.parent / "GPT" / "memory" / "raw" / "slack_api"
EXTERNAL_NOTES = REPO_DIR / "memory" / "external_notes_log.md"
EXTERNAL_NOTES_TAIL_LINES = 200

# x.com / twitter.com の status URL から tweet_id (15-20桁) を抽出
TWEET_ID_RE = re.compile(r"(?:x\.com|twitter\.com)/[^/\s]+/status/(\d{15,20})")

# arxiv ID (YYMM.NNNNN) を抽出 — `arxiv 2604.16548`, `arxiv:2604.16548`,
# `arxiv.org/abs/2604.16548`, `(2604.16548)` 等を網羅
ARXIV_ID_RE = re.compile(r"\b(\d{4}\.\d{4,5})\b")


def extract_tweet_ids_from_text(text: str) -> list[str]:
    """テキスト全体から tweet_id を抽出し、登場順で重複除去して返す"""
    seen: set[str] = set()
    result: list[str] = []
    for m in TWEET_ID_RE.finditer(text):
        tid = m.group(1)
        if tid not in seen:
            seen.add(tid)
            result.append(tid)
    return result


def extract_tweet_ids_from_staging_phase1(staging_path: Path) -> list[str]:
    """staging の Phase 1 セクションのみから tweet_id を抽出。

    `## Phase 1: 情報収集` 〜 次の `## ` 見出しまでを対象とする。
    Phase 1 §1 (#nao-u URL確認) は Phase 1 内なのでカバーされる。
    """
    if not staging_path.exists():
        return []
    text = staging_path.read_text(encoding="utf-8", errors="replace")
    # Phase 1 セクション切り出し
    lines = text.splitlines()
    in_phase1 = False
    phase1_lines: list[str] = []
    for ln in lines:
        if ln.startswith("## Phase 1"):
            in_phase1 = True
            continue
        if in_phase1 and ln.startswith("## ") and not ln.startswith("## Phase 1"):
            break
        if in_phase1:
            phase1_lines.append(ln)
    return extract_tweet_ids_from_text("\n".join(phase1_lines))


def extract_arxiv_ids_from_text(text: str) -> list[str]:
    """テキスト全体から arxiv ID を抽出し、登場順で重複除去して返す"""
    seen: set[str] = set()
    result: list[str] = []
    for m in ARXIV_ID_RE.finditer(text):
        aid = m.group(1)
        if aid not in seen:
            seen.add(aid)
            result.append(aid)
    return result


def extract_arxiv_ids_from_staging_phase1(staging_path: Path) -> list[str]:
    """staging の Phase 1 セクションのみから arxiv ID を抽出。

    Phase 1 §6 外部検索結果は Phase 1 内に書かれる前提。
    """
    if not staging_path.exists():
        return []
    text = staging_path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    in_phase1 = False
    phase1_lines: list[str] = []
    for ln in lines:
        if ln.startswith("## Phase 1"):
            in_phase1 = True
            continue
        if in_phase1 and ln.startswith("## ") and not ln.startswith("## Phase 1"):
            break
        if in_phase1:
            phase1_lines.append(ln)
    return extract_arxiv_ids_from_text("\n".join(phase1_lines))


def _scan_jsonl_for_arxiv(path: Path, arxiv_id: str) -> list[dict]:
    """jsonl 1行ずつ走査して text に arxiv_id を含む行を返す (ts/text を保持)"""
    hits: list[dict] = []
    try:
        with path.open(encoding="utf-8", errors="replace") as f:
            for line in f:
                if arxiv_id not in line:
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                text = obj.get("text", "") or ""
                if arxiv_id in text:
                    hits.append({"ts": obj.get("ts", ""), "user": obj.get("user_name", "") or obj.get("user", "")})
    except FileNotFoundError:
        pass
    return hits


def _scan_external_notes_for_arxiv(path: Path, arxiv_id: str, tail_lines: int) -> list[dict]:
    """external_notes_log.md の末尾 tail_lines 行を arxiv_id で grep"""
    if not path.exists():
        return []
    try:
        all_lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except Exception:
        return []
    tail = all_lines[-tail_lines:]
    hits: list[dict] = []
    for i, ln in enumerate(tail):
        if arxiv_id in ln:
            actual_lineno = len(all_lines) - len(tail) + i + 1
            hits.append({"lineno": actual_lineno, "excerpt": ln.strip()[:80]})
    return hits


def check_arxiv_coverage(arxiv_id: str) -> list[str]:
    """arxiv_id を 3 経路で走査し、既出 WARN 行リストを返す。

    kaizen #136 段階1.5 拡張 (2026-06-07 C308 Phase 3 着地):
    Phase 1 §6 外部検索で取得した arxiv ID が、過去に shared-reads.jsonl /
    external_notes_log.md に投稿済か否かを構造強制チェックする。
    重複投稿の事前回避 + 既出時は接続表統合分岐への合図。
    """
    warns: list[str] = []

    if LOG_SLACK_ARCHIVE.is_dir():
        for p in sorted(LOG_SLACK_ARCHIVE.glob("*.jsonl")):
            for h in _scan_jsonl_for_arxiv(p, arxiv_id):
                rel = p.relative_to(REPO_DIR).as_posix()
                warns.append(f"[既出 ARXIV WARN] arxiv_id={arxiv_id} src={rel} ts={h['ts']}")

    if GPT_SLACK_ARCHIVE.is_dir():
        for p in sorted(GPT_SLACK_ARCHIVE.glob("*.jsonl")):
            for h in _scan_jsonl_for_arxiv(p, arxiv_id):
                try:
                    rel = p.relative_to(REPO_DIR).as_posix()
                except ValueError:
                    rel = str(p)
                warns.append(f"[既出 ARXIV WARN] arxiv_id={arxiv_id} src={rel} ts={h['ts']}")

    for h in _scan_external_notes_for_arxiv(EXTERNAL_NOTES, arxiv_id, EXTERNAL_NOTES_TAIL_LINES):
        rel = EXTERNAL_NOTES.relative_to(REPO_DIR).as_posix()
        warns.append(f"[既出 ARXIV WARN] arxiv_id={arxiv_id} src={rel} line={h['lineno']}")

    return warns


def _scan_jsonl_for_tweet(path: Path, tweet_id: str) -> list[dict]:
    """jsonl 1行ずつ走査して text に tweet_id を含む行を返す (ts/text を保持)"""
    hits: list[dict] = []
    try:
        with path.open(encoding="utf-8", errors="replace") as f:
            for line in f:
                if tweet_id not in line:
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                text = obj.get("text", "") or ""
                if tweet_id in text:
                    hits.append({"ts": obj.get("ts", ""), "user": obj.get("user_name", "") or obj.get("user", "")})
    except FileNotFoundError:
        pass
    return hits


def _scan_external_notes_tail(path: Path, tweet_id: str, tail_lines: int) -> list[dict]:
    """external_notes_log.md の末尾 tail_lines 行を grep"""
    if not path.exists():
        return []
    try:
        all_lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except Exception:
        return []
    tail = all_lines[-tail_lines:]
    hits: list[dict] = []
    for i, ln in enumerate(tail):
        if tweet_id in ln:
            actual_lineno = len(all_lines) - len(tail) + i + 1
            hits.append({"lineno": actual_lineno, "excerpt": ln.strip()[:80]})
    return hits


def check_url_response_coverage(tweet_id: str) -> list[str]:
    """tweet_id を 3 経路で走査し、WARN 行のリストを返す。ヒットなしなら空。"""
    warns: list[str] = []

    # 1) Log Slack archive
    if LOG_SLACK_ARCHIVE.is_dir():
        for p in sorted(LOG_SLACK_ARCHIVE.glob("*.jsonl")):
            for h in _scan_jsonl_for_tweet(p, tweet_id):
                rel = p.relative_to(REPO_DIR).as_posix()
                warns.append(f"[既応答 WARN] tweet_id={tweet_id} src={rel} ts={h['ts']}")

    # 2) GPT (Log_cdx) Slack archive
    if GPT_SLACK_ARCHIVE.is_dir():
        for p in sorted(GPT_SLACK_ARCHIVE.glob("*.jsonl")):
            for h in _scan_jsonl_for_tweet(p, tweet_id):
                try:
                    rel = p.relative_to(REPO_DIR).as_posix()
                except ValueError:
                    rel = str(p)
                warns.append(f"[既応答 WARN] tweet_id={tweet_id} src={rel} ts={h['ts']}")

    # 3) external_notes_log.md tail
    for h in _scan_external_notes_tail(EXTERNAL_NOTES, tweet_id, EXTERNAL_NOTES_TAIL_LINES):
        rel = EXTERNAL_NOTES.relative_to(REPO_DIR).as_posix()
        warns.append(f"[既応答 WARN] tweet_id={tweet_id} src={rel} line={h['lineno']}")

    return warns


# kaizen #139 段階1: Phase 1 §1「未応答 URL 判定」が §7 hook 出力を参照しない
# 構造的死角の処方。WARN 詳細行 (kaizen #136) を tweet_id 別に集計し、
# `[既応答 SUMMARY]` 行として §7 ブロック先頭に強制注入する。Phase 1 §1 を
# 編集する側 (Claude) は必ずサマリ行を視界に入れることになる。
SUMMARY_PREFIX = "[既応答 SUMMARY]"
ARXIV_SUMMARY_PREFIX = "[既出 ARXIV SUMMARY]"
_WARN_LINE_RE = re.compile(
    r"^\[既応答 WARN\] tweet_id=(?P<tid>\d{15,20}) src=(?P<src>\S+)"
)
_ARXIV_WARN_LINE_RE = re.compile(
    r"^\[既出 ARXIV WARN\] arxiv_id=(?P<aid>\d{4}\.\d{4,5}) src=(?P<src>\S+)"
)
# Slack archive のチャンネル名は jsonl ファイル名 (拡張子除く) と一致する設計
_JSONL_NAME_RE = re.compile(r"/(?P<name>[A-Za-z0-9_-]+)\.jsonl$")


def _classify_path_root(src: str) -> str:
    """src パスからどの経路 (log_archive / gpt_archive / external) かを分類"""
    if "log/slack_archive/" in src or src.startswith("log/slack_archive/"):
        return "log_archive"
    if "GPT/memory/raw/slack_api/" in src or "GPT\\memory\\raw\\slack_api\\" in src:
        return "gpt_archive"
    if "external_notes_log.md" in src:
        return "external"
    return "other"


def _extract_channel_from_src(src: str) -> str | None:
    """src パスから Slack チャンネル名を抽出 (jsonl ファイル名)"""
    m = _JSONL_NAME_RE.search(src.replace("\\", "/"))
    return m.group("name") if m else None


def build_warn_summary(warns: list[str]) -> list[dict]:
    """WARN 詳細行から tweet_id 別集計を作る。

    戻り値: tweet_id 順 (登場順) の dict 配列、各要素は:
        {"tweet_id": str, "hits": int, "channels": [str,...], "paths": [str,...]}
    """
    order: list[str] = []
    agg: dict[str, dict] = {}
    for w in warns:
        m = _WARN_LINE_RE.match(w)
        if not m:
            continue
        tid = m.group("tid")
        src = m.group("src")
        if tid not in agg:
            order.append(tid)
            agg[tid] = {"hits": 0, "channels": set(), "paths": set()}
        agg[tid]["hits"] += 1
        ch = _extract_channel_from_src(src)
        if ch:
            agg[tid]["channels"].add(ch)
        agg[tid]["paths"].add(_classify_path_root(src))
    result = []
    for tid in order:
        a = agg[tid]
        result.append({
            "tweet_id": tid,
            "hits": a["hits"],
            "channels": sorted(a["channels"]),
            "paths": sorted(a["paths"]),
        })
    return result


def format_summary_lines(summary: list[dict]) -> list[str]:
    """集計結果を `[既応答 SUMMARY] ...` 行のリストに整形"""
    out: list[str] = []
    for s in summary:
        ch = ",".join(s["channels"]) if s["channels"] else "-"
        pa = ",".join(s["paths"]) if s["paths"] else "-"
        out.append(
            f"{SUMMARY_PREFIX} tweet_id={s['tweet_id']} "
            f"hits={s['hits']} channels={ch} paths={pa}"
        )
    return out


# kaizen #136 段階1.5 (C308 Phase 4): arxiv ID 軸の SUMMARY ビルダー / 整形.
# URL 軸 (build_warn_summary) と同型で arxiv_id 別に hits/channels/paths を集計し、
# Phase 1 末尾 §8 にサマリヘッダ付きで強制注入する。Phase 1 §6 外部検索の判定者
# (Claude) が「新規取得」と書く前に必ず視界に入る位置に置く。
def build_arxiv_warn_summary(warns: list[str]) -> list[dict]:
    """ARXIV WARN 詳細行から arxiv_id 別集計を作る。

    戻り値: arxiv_id 順 (登場順) の dict 配列、各要素は:
        {"arxiv_id": str, "hits": int, "channels": [str,...], "paths": [str,...]}
    """
    order: list[str] = []
    agg: dict[str, dict] = {}
    for w in warns:
        m = _ARXIV_WARN_LINE_RE.match(w)
        if not m:
            continue
        aid = m.group("aid")
        src = m.group("src")
        if aid not in agg:
            order.append(aid)
            agg[aid] = {"hits": 0, "channels": set(), "paths": set()}
        agg[aid]["hits"] += 1
        ch = _extract_channel_from_src(src)
        if ch:
            agg[aid]["channels"].add(ch)
        agg[aid]["paths"].add(_classify_path_root(src))
    result = []
    for aid in order:
        a = agg[aid]
        result.append({
            "arxiv_id": aid,
            "hits": a["hits"],
            "channels": sorted(a["channels"]),
            "paths": sorted(a["paths"]),
        })
    return result


def format_arxiv_summary_lines(summary: list[dict]) -> list[str]:
    """集計結果を `[既出 ARXIV SUMMARY] ...` 行のリストに整形"""
    out: list[str] = []
    for s in summary:
        ch = ",".join(s["channels"]) if s["channels"] else "-"
        pa = ",".join(s["paths"]) if s["paths"] else "-"
        out.append(
            f"{ARXIV_SUMMARY_PREFIX} arxiv_id={s['arxiv_id']} "
            f"hits={s['hits']} channels={ch} paths={pa}"
        )
    return out


# kaizen #139 段階2: Phase 1 §2 #all-nao-u-lab 返信候補側 cross-check.
# Phase 1 §2 が「返信候補 N 件」を出す前に、drafts/<today>/*POSTED_ts<X>*.py の
# ts 集合と各候補 ts を「候補 ts < POSTED_ts かつ 同チャンネル」で cross-check し、
# 既応答済 ts を SUMMARY 行で staging に強制注入する。
# Phase 1 §2 編集時の「drafts/POSTED_ts ファイル名集合を見ない」死角の処方。
_PHASE1_SEC2_CHANNEL_TS_RE = re.compile(r"#(?P<ch>[a-zA-Z0-9_-]+)\s+ts=(?P<ts>\d{10,})")
_POSTED_TS_RE = re.compile(r"POSTED_ts(?P<ts>\d{10,})\.py$")
ALLNAOULAB_REPLY_WINDOW_SEC = 24 * 3600
_STAGING_DATE_RE = re.compile(r"\((?P<date>\d{4}-\d{2}-\d{2})")


def _channel_to_drafts_slug(channel: str) -> str:
    """`all-nao-u-lab` → `all_nao_u_lab` (drafts ファイル名規約)"""
    return channel.replace("-", "_")


# kaizen #139 段階3: Phase 1 §2 `Sender [MM-DD HH:MM]` 表記 false negative 解消.
# 段階2 cross-check は `#channel ts=<digits>` 形式しか拾わないため、
# C296 §3-0 で観測した `Log_cdx [06-03 02:22]` 形式の候補が cross-check を
# 素通りし重複投稿事故 (N=2) を起こした。表記を ts に解決して段階2 に合流させる.
_PHASE1_SEC2_INSTANCE_TIME_RE = re.compile(
    r"(?P<sender>Log_cdx|Mir_cdx|Log|Mir|Ash)\s+\[(?P<md>\d{2}-\d{2})\s+(?P<hm>\d{2}:\d{2})\]"
)
# slack_archive jsonl text 冒頭の sender prefix を識別する
_SENDER_PREFIX_RE = re.compile(r"^\[(?P<sender>Log_cdx|Mir_cdx|Log|Mir|Ash)\]")
JST_OFFSET_SEC = 9 * 3600
# 段階3 で ts 解決対象とする channel (Phase 1 §2 [MM-DD HH:MM] 表記の主用途)
_INSTANCE_TIME_DEFAULT_CHANNEL = "all-nao-u-lab"


def _resolve_md_hm_to_ts(
    sender: str,
    md_str: str,
    hm_str: str,
    channel: str,
    year: int,
) -> str | None:
    """sender + MM-DD HH:MM (JST) を slack_archive jsonl 走査で ts に解決する。

    log/slack_archive/<channel>.jsonl を走査し、text 冒頭 `[<sender>]` で
    JST 換算した MM-DD HH:MM が完全一致する最初のメッセージ ts (文字列) を返す。
    純 stdlib のみ、副作用ゼロ。
    """
    jsonl_path = LOG_SLACK_ARCHIVE / f"{channel}.jsonl"
    if not jsonl_path.exists():
        return None
    target = f"{md_str} {hm_str}"
    try:
        with jsonl_path.open(encoding="utf-8", errors="replace") as f:
            for line in f:
                if f"[{sender}]" not in line:
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                text = obj.get("text", "") or ""
                m = _SENDER_PREFIX_RE.match(text)
                if not m or m.group("sender") != sender:
                    continue
                ts_str = obj.get("ts", "")
                try:
                    ts_int = int(float(ts_str))
                except (ValueError, TypeError):
                    continue
                dt_jst = datetime.datetime.utcfromtimestamp(ts_int + JST_OFFSET_SEC)
                if dt_jst.year != year:
                    continue
                if dt_jst.strftime("%m-%d %H:%M") == target:
                    return ts_str
    except OSError:
        return None
    return None


def extract_phase1_reply_candidates(staging_path: Path) -> list[dict]:
    """Phase 1 セクション全体から返信候補を登場順に抽出。

    抽出パターン:
      - 段階2: `#<channel> ts=<ts>` 形式
      - 段階3: `<Sender> [MM-DD HH:MM]` 形式 (slack_archive jsonl で ts 解決)

    Phase 1 §2 で挙がる #all-nao-u-lab 等の返信候補が対象。重複 (同 channel,ts) は除外。
    """
    if not staging_path.exists():
        return []
    text = staging_path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    in_phase1 = False
    phase1_lines: list[str] = []
    for ln in lines:
        if ln.startswith("## Phase 1"):
            in_phase1 = True
            continue
        if in_phase1 and ln.startswith("## ") and not ln.startswith("## Phase 1"):
            break
        if in_phase1:
            phase1_lines.append(ln)
    phase1_text = "\n".join(phase1_lines)
    seen: set[tuple[str, str]] = set()
    candidates: list[dict] = []
    for m in _PHASE1_SEC2_CHANNEL_TS_RE.finditer(phase1_text):
        ch = m.group("ch")
        ts = m.group("ts")
        key = (ch, ts)
        if key in seen:
            continue
        seen.add(key)
        candidates.append({"channel": ch, "ts": ts})
    # 段階3: Sender [MM-DD HH:MM] 形式を解決
    staging_date = _extract_staging_date(staging_path)
    staging_year = int(staging_date.split("-")[0]) if staging_date else datetime.datetime.now().year
    for m in _PHASE1_SEC2_INSTANCE_TIME_RE.finditer(phase1_text):
        sender = m.group("sender")
        md = m.group("md")
        hm = m.group("hm")
        channel = _INSTANCE_TIME_DEFAULT_CHANNEL
        ts = _resolve_md_hm_to_ts(sender, md, hm, channel, staging_year)
        if not ts:
            continue
        key = (channel, ts)
        if key in seen:
            continue
        seen.add(key)
        candidates.append({"channel": channel, "ts": ts})
    return candidates


def scan_drafts_posted_ts(today_date: str) -> list[dict]:
    """drafts/<today_date>/*POSTED_ts<N>*.py のファイル名を parse して filename/ts/path を返す"""
    drafts_root = REPO_DIR / "drafts" / today_date
    if not drafts_root.is_dir():
        return []
    result: list[dict] = []
    for p in sorted(drafts_root.glob("*POSTED_ts*.py")):
        m = _POSTED_TS_RE.search(p.name)
        if not m:
            continue
        result.append({
            "filename": p.name,
            "posted_ts": m.group("ts"),
            "path": p.relative_to(REPO_DIR).as_posix(),
        })
    return result


def _extract_staging_date(staging_path: Path) -> str | None:
    """staging 1 行目 `# サイクルステージング (YYYY-MM-DD HH:MM)` から日付抽出"""
    try:
        with staging_path.open(encoding="utf-8", errors="replace") as f:
            head = f.readline()
    except FileNotFoundError:
        return None
    m = _STAGING_DATE_RE.search(head)
    return m.group("date") if m else None


def cross_check_drafts_posted_ts(
    candidates: list[dict], today_date: str
) -> list[str]:
    """Phase 1 §2 返信候補 ts × drafts/<today>/POSTED_ts cross-check.

    判定条件:
      - candidate_ts < posted_ts (POSTED は候補メッセージ後に作成)
      - posted_ts - candidate_ts <= 24h (返信窓内)
      - filename が `post_log_<channel_slug>_` で始まる (channel 一致)

    戻り値: `[既応答 SUMMARY] message_ts=<X> reply_ts=<Y> draft=<path>` 行のリスト。
    1 候補に複数 POSTED 該当ありうる (Claude が draft 読んで判定する素材として出す)。
    """
    posted = scan_drafts_posted_ts(today_date)
    if not candidates or not posted:
        return []
    out: list[str] = []
    for c in candidates:
        c_slug = _channel_to_drafts_slug(c["channel"])
        prefix = f"post_log_{c_slug}_"
        try:
            c_ts_int = int(c["ts"].split(".")[0])
        except ValueError:
            continue
        for p in posted:
            if not p["filename"].startswith(prefix):
                continue
            try:
                p_ts_int = int(p["posted_ts"])
            except ValueError:
                continue
            if not (c_ts_int < p_ts_int <= c_ts_int + ALLNAOULAB_REPLY_WINDOW_SEC):
                continue
            out.append(
                f"{SUMMARY_PREFIX} message_ts={c['ts']} reply_ts={p['posted_ts']} "
                f"draft={p['path']}"
            )
    return out


def append_drafts_summary_to_staging_phase1(
    staging_path: Path, summary_lines: list[str]
) -> int:
    """kaizen #139 段階2: §2 cross-check SUMMARY 行を Phase 1 末尾に追記。

    §1 hook (kaizen #139 段階1) と同じ Phase 1 末尾区画に、専用ヘッダ
    `#### [kaizen #139 段階2] #all-nao-u-lab 返信候補別 cross-check ...` で挿入。
    既存 SUMMARY 重複は除外 (多重起動安全)。戻り値: 実追記行数。
    """
    if not summary_lines:
        return 0
    text = staging_path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    phase1_start: int | None = None
    phase1_end: int | None = None
    for i, ln in enumerate(lines):
        if ln.startswith("## Phase 1"):
            phase1_start = i
            continue
        if phase1_start is not None and ln.startswith("## ") and i > phase1_start:
            phase1_end = i
            break
    if phase1_start is None:
        return 0
    if phase1_end is None:
        phase1_end = len(lines)
    phase1_block = "\n".join(lines[phase1_start:phase1_end])
    new_summary = [s for s in summary_lines if s not in phase1_block]
    if not new_summary:
        return 0
    header = "#### [kaizen #139 段階2] #all-nao-u-lab 返信候補別 cross-check (§2 返信判定はこれを必ず参照)"
    insert_lines = [""]
    if header not in phase1_block:
        insert_lines.append(header)
    insert_lines.extend(new_summary)
    insert_lines.append("")
    new_lines = lines[:phase1_end] + insert_lines + lines[phase1_end:]
    staging_path.write_text(
        "\n".join(new_lines) + ("\n" if text.endswith("\n") else ""),
        encoding="utf-8",
    )
    return len(new_summary)


def append_arxiv_warns_to_staging_phase1(staging_path: Path, warns: list[str]) -> int:
    """kaizen #136 段階1.5 (C308 Phase 4): arxiv ID 軸 WARN/SUMMARY を Phase 1 末尾に追記.

    URL 軸 (append_warns_to_staging_phase1) と同じ Phase 1 末尾区画に、
    専用節ヘッダ `### 8) [kaizen #136 段階1.5 hook] arxiv ID 既出 ARXIV WARN` +
    サマリヘッダ `#### [kaizen #136 段階1.5] arxiv ID 別集計 (§6 外部検索判定はこれを必ず参照)`
    で挿入する。重複行は除外 (多重起動安全)。戻り値: 実追記行数 (WARN+SUMMARY 合計)。
    """
    if not warns:
        return 0
    text = staging_path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()

    phase1_start: int | None = None
    phase1_end: int | None = None
    for i, ln in enumerate(lines):
        if ln.startswith("## Phase 1"):
            phase1_start = i
            continue
        if phase1_start is not None and ln.startswith("## ") and i > phase1_start:
            phase1_end = i
            break
    if phase1_start is None:
        return 0
    if phase1_end is None:
        phase1_end = len(lines)

    phase1_block = "\n".join(lines[phase1_start:phase1_end])
    new_warns = [w for w in warns if w not in phase1_block]

    summary = build_arxiv_warn_summary(warns)
    summary_lines = format_arxiv_summary_lines(summary)
    new_summary_lines = [s for s in summary_lines if s not in phase1_block]

    if not new_warns and not new_summary_lines:
        return 0

    header = "### 8) [kaizen #136 段階1.5 hook] arxiv ID 既出 ARXIV WARN"
    summary_header = "#### [kaizen #136 段階1.5] arxiv ID 別集計 (§6 外部検索判定はこれを必ず参照)"
    insert_lines = [""]
    if header not in phase1_block:
        insert_lines.append(header)
    if new_summary_lines:
        if summary_header not in phase1_block:
            insert_lines.append(summary_header)
        insert_lines.extend(new_summary_lines)
        insert_lines.append("")
    if new_warns:
        insert_lines.extend(new_warns)
        insert_lines.append("")

    new_lines = lines[:phase1_end] + insert_lines + lines[phase1_end:]
    staging_path.write_text(
        "\n".join(new_lines) + ("\n" if text.endswith("\n") else ""),
        encoding="utf-8",
    )
    return len(new_warns) + len(new_summary_lines)


def append_warns_to_staging_phase1(staging_path: Path, warns: list[str]) -> int:
    """staging の Phase 1 セクション末尾 (次の `## ` 直前) に WARN を追記。

    kaizen #139 段階1 対応: 詳細 WARN 行に加えて、tweet_id 別集計サマリ
    (`[既応答 SUMMARY]`) を §7 ブロック先頭 (ヘッダ直下) に強制注入する。
    Phase 1 §1「未応答 URL 判定」を Claude が書く時点で必ず視界に入る位置に
    置くことで、§7 hook 出力を §1 ロジックが無視する構造的死角を防ぐ。

    既に同じ tweet_id の WARN/SUMMARY が存在する場合はスキップ
    (重複防止 / 多重起動安全)。戻り値: 実際に追記した行数 (WARN+SUMMARY 合計)。
    """
    if not warns:
        return 0
    text = staging_path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()

    # Phase 1 範囲特定
    phase1_start: int | None = None
    phase1_end: int | None = None
    for i, ln in enumerate(lines):
        if ln.startswith("## Phase 1"):
            phase1_start = i
            continue
        if phase1_start is not None and ln.startswith("## ") and i > phase1_start:
            phase1_end = i
            break
    if phase1_start is None:
        return 0
    if phase1_end is None:
        phase1_end = len(lines)

    phase1_block = "\n".join(lines[phase1_start:phase1_end])
    new_warns = [w for w in warns if w not in phase1_block]

    # kaizen #139 段階1: tweet_id 別集計サマリを生成し、既存サマリと差分のみ採用
    summary = build_warn_summary(warns)
    summary_lines = format_summary_lines(summary)
    new_summary_lines = [s for s in summary_lines if s not in phase1_block]

    if not new_warns and not new_summary_lines:
        return 0

    header = "### 7) [kaizen #136 段階2 hook] 自己過去ログ照合 WARN"
    summary_header = "#### [kaizen #139 段階1] tweet_id 別集計 (§1 未応答判定はこれを必ず参照)"
    insert_lines = [""]
    if header not in phase1_block:
        insert_lines.append(header)
    if new_summary_lines:
        if summary_header not in phase1_block:
            insert_lines.append(summary_header)
        insert_lines.extend(new_summary_lines)
        insert_lines.append("")
    if new_warns:
        insert_lines.extend(new_warns)
        insert_lines.append("")

    new_lines = lines[:phase1_end] + insert_lines + lines[phase1_end:]
    staging_path.write_text("\n".join(new_lines) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")
    return len(new_warns) + len(new_summary_lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from-staging", type=Path,
                    help="staging file から Phase 1 セクションの URL を抽出して走査")
    ap.add_argument("--tweet-id", action="append", default=[],
                    help="強制走査する tweet_id (複数指定可、dry-run / 検証用)")
    ap.add_argument("--arxiv-id", action="append", default=[],
                    help="kaizen #136 段階1.5: 強制走査する arxiv ID (YYMM.NNNNN)")
    ap.add_argument("--apply", action="store_true",
                    help="--from-staging のとき、WARN を staging に追記する (デフォルトは表示のみ)")
    ap.add_argument("--check-allnaoulab-ts", action="append", default=[],
                    help="kaizen #139 段階2 dry-run: 候補 ts (channel=all-nao-u-lab 固定) を直接指定")
    ap.add_argument("--today-date",
                    help="kaizen #139 段階2: drafts/<today_date>/ 走査用日付 (YYYY-MM-DD)。"
                         "未指定時 --from-staging から自動抽出")
    args = ap.parse_args()

    tweet_ids: list[str] = list(args.tweet_id)
    if args.from_staging:
        ids = extract_tweet_ids_from_staging_phase1(args.from_staging)
        for tid in ids:
            if tid not in tweet_ids:
                tweet_ids.append(tid)

    # kaizen #136 段階1.5: arxiv ID 集合化
    arxiv_ids: list[str] = list(args.arxiv_id)
    if args.from_staging:
        aids = extract_arxiv_ids_from_staging_phase1(args.from_staging)
        for aid in aids:
            if aid not in arxiv_ids:
                arxiv_ids.append(aid)

    if not tweet_ids and not arxiv_ids and not (args.from_staging or args.check_allnaoulab_ts):
        print("[check_url_response_coverage] no tweet_id / arxiv_id provided (use --from-staging or --tweet-id or --arxiv-id)", file=sys.stderr)
        return 0

    all_warns: list[str] = []
    for tid in tweet_ids:
        warns = check_url_response_coverage(tid)
        if warns:
            all_warns.extend(warns)
            for w in warns:
                print(w)
        else:
            print(f"[check_url_response_coverage] tweet_id={tid} no hits in 3 paths")

    # kaizen #139 段階1: tweet_id 別集計サマリを stdout 末尾にも出力 (Phase 1 §1 必読)
    if all_warns:
        summary = build_warn_summary(all_warns)
        for line in format_summary_lines(summary):
            print(line)

    if args.from_staging and args.apply and all_warns:
        n = append_warns_to_staging_phase1(args.from_staging, all_warns)
        print(f"[check_url_response_coverage] appended {n} WARN/SUMMARY lines to {args.from_staging}", file=sys.stderr)

    # kaizen #136 段階1.5: arxiv ID 走査 (Phase 1 §6 重複投稿事前検出)
    all_arxiv_warns: list[str] = []
    for aid in arxiv_ids:
        warns = check_arxiv_coverage(aid)
        if warns:
            all_arxiv_warns.extend(warns)
            for w in warns:
                print(w)
        else:
            print(f"[check_url_response_coverage] arxiv_id={aid} no hits in 3 paths (new)")

    # kaizen #136 段階1.5 (C308 Phase 4): arxiv_id 別集計サマリを stdout 末尾にも出力 +
    # --apply 時は staging Phase 1 末尾 §8 に強制注入 (URL 軸 §7 と family 統合)
    if all_arxiv_warns:
        arxiv_summary = build_arxiv_warn_summary(all_arxiv_warns)
        for line in format_arxiv_summary_lines(arxiv_summary):
            print(line)

    if args.from_staging and args.apply and all_arxiv_warns:
        n = append_arxiv_warns_to_staging_phase1(args.from_staging, all_arxiv_warns)
        print(
            f"[check_url_response_coverage] appended {n} ARXIV WARN/SUMMARY lines to {args.from_staging}",
            file=sys.stderr,
        )

    # kaizen #139 段階2: Phase 1 §2 #all-nao-u-lab 返信候補 × drafts POSTED_ts cross-check
    today_date: str | None = args.today_date
    if not today_date and args.from_staging:
        today_date = _extract_staging_date(args.from_staging)
    candidates: list[dict] = []
    if args.from_staging:
        candidates.extend(extract_phase1_reply_candidates(args.from_staging))
    for ts in args.check_allnaoulab_ts:
        key = ("all-nao-u-lab", ts)
        if not any(c["channel"] == key[0] and c["ts"] == key[1] for c in candidates):
            candidates.append({"channel": key[0], "ts": ts})
    if candidates and today_date:
        sec2_summary = cross_check_drafts_posted_ts(candidates, today_date)
        for line in sec2_summary:
            print(line)
        if args.from_staging and args.apply and sec2_summary:
            n = append_drafts_summary_to_staging_phase1(args.from_staging, sec2_summary)
            print(
                f"[check_url_response_coverage] appended {n} §2 SUMMARY lines to {args.from_staging}",
                file=sys.stderr,
            )

    return 0


if __name__ == "__main__":
    sys.exit(main())
