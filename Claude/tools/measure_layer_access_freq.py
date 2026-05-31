#!/usr/bin/env python3
"""R層 vs R層外 読み込み頻度測定 (memory_redesign C271 Phase 4 大作業)

R層 = 全セッションで常時注入される指示ファイル群
  - MEMORY.md / system_identity.md / CLAUDE.md
R層外候補 = memory/*.md と projects/*.md (該当ファイル時のみ注入 or 手動参照)

入力経路 (1 hop grep):
  (a) log/scheduler_log.log 末尾 7000 行
  (b) log/slack_archive/*.jsonl 末尾 2000 件 (各チャンネル)
  (c) log/diary_drafts/*.md 全件 + log/daily_diary_*.md
      (staging 仕様の log/dialogue/2026-05*/*.md は実在しないため代替)

出力 (stdout): 上位 N ファイルの (rank, file, layer, freq, ratio_to_total,
              sched, slack, diary) tab 区切り + R 層 / R 層外 合計と ratio

副作用ゼロ: 出力ファイル生成しない (stdout のみ)
"""
from __future__ import annotations

import argparse
import collections
import json
import pathlib
import sys
from typing import Iterable

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent

R_LAYER_NAMES = {"MEMORY.md", "system_identity.md", "CLAUDE.md"}

SCHEDULER_LOG = REPO_ROOT / "log" / "scheduler_log.log"
SCHEDULER_TAIL_LINES = 7000

SLACK_ARCHIVE_DIR = REPO_ROOT / "log" / "slack_archive"
SLACK_TAIL_RECORDS = 2000

DIARY_DRAFTS_DIR = REPO_ROOT / "log" / "diary_drafts"
DAILY_DIARY_GLOB = "daily_diary_*.md"
LOG_DIR = REPO_ROOT / "log"


def collect_targets() -> list[str]:
    names: set[str] = set(R_LAYER_NAMES)
    for sub in ("memory", "projects"):
        d = REPO_ROOT / sub
        if d.is_dir():
            for p in d.glob("*.md"):
                names.add(p.name)
    return sorted(names)


def tail_lines(path: pathlib.Path, n: int) -> list[str]:
    if not path.is_file():
        return []
    try:
        with path.open("r", encoding="utf-8", errors="replace") as f:
            buf = collections.deque(f, maxlen=n)
        return list(buf)
    except OSError:
        return []


def slack_tail_text(path: pathlib.Path, n: int) -> str:
    lines = tail_lines(path, n)
    parts: list[str] = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            parts.append(line)
            continue
        text = obj.get("text") or ""
        msg = obj.get("message")
        if isinstance(msg, dict):
            text = (text + "\n" + (msg.get("text") or "")).strip()
        parts.append(text)
    return "\n".join(parts)


def diary_text() -> str:
    parts: list[str] = []
    if DIARY_DRAFTS_DIR.is_dir():
        for p in sorted(DIARY_DRAFTS_DIR.glob("*.md")):
            try:
                parts.append(p.read_text(encoding="utf-8", errors="replace"))
            except OSError:
                continue
    if LOG_DIR.is_dir():
        for p in sorted(LOG_DIR.glob(DAILY_DIARY_GLOB)):
            try:
                parts.append(p.read_text(encoding="utf-8", errors="replace"))
            except OSError:
                continue
    return "\n".join(parts)


def count_mentions(corpus: str, names: Iterable[str]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for name in names:
        counts[name] = corpus.count(name)
    return counts


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true",
                        help="副作用ゼロ確認用 (このスクリプトは常に stdout のみ)")
    parser.add_argument("--top", type=int, default=20,
                        help="出力する上位件数 (default: 20)")
    args = parser.parse_args(argv)

    targets = collect_targets()

    sched_lines = tail_lines(SCHEDULER_LOG, SCHEDULER_TAIL_LINES)
    corpus_scheduler = "\n".join(sched_lines)

    slack_parts: list[str] = []
    slack_file_count = 0
    if SLACK_ARCHIVE_DIR.is_dir():
        for p in sorted(SLACK_ARCHIVE_DIR.glob("*.jsonl")):
            slack_parts.append(slack_tail_text(p, SLACK_TAIL_RECORDS))
            slack_file_count += 1
    corpus_slack = "\n".join(slack_parts)

    corpus_diary = diary_text()

    counts_scheduler = count_mentions(corpus_scheduler, targets)
    counts_slack = count_mentions(corpus_slack, targets)
    counts_diary = count_mentions(corpus_diary, targets)

    totals: dict[str, int] = {
        n: counts_scheduler[n] + counts_slack[n] + counts_diary[n]
        for n in targets
    }
    grand_total = sum(totals.values()) or 1

    ranked = sorted(targets, key=lambda n: totals[n], reverse=True)[: args.top]

    print(f"# inputs: scheduler_log_tail={len(sched_lines)}lines "
          f"slack_files={slack_file_count}x{SLACK_TAIL_RECORDS}records "
          f"diary_files={len(list(DIARY_DRAFTS_DIR.glob('*.md')) if DIARY_DRAFTS_DIR.is_dir() else [])}"
          f"+{len(list(LOG_DIR.glob(DAILY_DIARY_GLOB)) if LOG_DIR.is_dir() else [])}")
    print(f"# targets={len(targets)} R_layer={len(R_LAYER_NAMES)} grand_total={grand_total}")
    print("# rank\tfile\tlayer\tfreq\tratio_to_total\tsched\tslack\tdiary")
    for i, name in enumerate(ranked, 1):
        layer = "R" if name in R_LAYER_NAMES else "Router"
        freq = totals[name]
        ratio = freq / grand_total
        print(f"{i}\t{name}\t{layer}\t{freq}\t{ratio:.4f}\t"
              f"{counts_scheduler[name]}\t{counts_slack[name]}\t{counts_diary[name]}")

    r_total = sum(totals[n] for n in targets if n in R_LAYER_NAMES)
    rx_total = sum(totals[n] for n in targets if n not in R_LAYER_NAMES)
    print()
    print(f"# R_layer_total={r_total}")
    print(f"# R_outer_total={rx_total}")
    if rx_total:
        print(f"# ratio_R_over_Router={r_total/rx_total:.4f}")
    else:
        print("# ratio_R_over_Router=inf (R_outer=0)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
