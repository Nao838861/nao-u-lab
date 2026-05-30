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


def append_warns_to_staging_phase1(staging_path: Path, warns: list[str]) -> int:
    """staging の Phase 1 セクション末尾 (次の `## ` 直前) に WARN を追記。

    既に同じ tweet_id の WARN が存在する場合はスキップ (重複防止 / 多重起動安全)。
    戻り値: 実際に追記した行数。
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
    if not new_warns:
        return 0

    header = "### 7) [kaizen #136 段階2 hook] 自己過去ログ照合 WARN"
    insert_lines = [""]
    if header not in phase1_block:
        insert_lines.append(header)
    insert_lines.extend(new_warns)
    insert_lines.append("")

    new_lines = lines[:phase1_end] + insert_lines + lines[phase1_end:]
    staging_path.write_text("\n".join(new_lines) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")
    return len(new_warns)


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

    if args.from_staging and args.apply and all_warns:
        n = append_warns_to_staging_phase1(args.from_staging, all_warns)
        print(f"[check_url_response_coverage] appended {n} WARN lines to {args.from_staging}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
