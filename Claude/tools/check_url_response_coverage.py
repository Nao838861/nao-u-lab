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
_WARN_LINE_RE = re.compile(
    r"^\[既応答 WARN\] tweet_id=(?P<tid>\d{15,20}) src=(?P<src>\S+)"
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
    ap.add_argument("--apply", action="store_true",
                    help="--from-staging のとき、WARN を staging に追記する (デフォルトは表示のみ)")
    args = ap.parse_args()

    tweet_ids: list[str] = list(args.tweet_id)
    if args.from_staging:
        ids = extract_tweet_ids_from_staging_phase1(args.from_staging)
        for tid in ids:
            if tid not in tweet_ids:
                tweet_ids.append(tid)

    if not tweet_ids:
        print("[check_url_response_coverage] no tweet_id provided (use --from-staging or --tweet-id)", file=sys.stderr)
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

    return 0


if __name__ == "__main__":
    sys.exit(main())
