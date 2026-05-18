#!/usr/bin/env python3
"""
twitter_recommended → external_notes 昇格の N日間ゼロ検出 (案E 試作)

projects/external_search_phase1_fixation.md 案E (2026-04-22 Ash 起票) の
試作スクリプト。external_notes_log.md の最新昇格日と今日との差分を見て、
N日間ゼロが続いていれば warning / critical を stdout に出力する。

設計参照: projects/external_search_phase1_fixation.md L100-125

判定ロジック:
  external_notes_log.md の最上位エントリ (## YYYY-MM-DD ...) の日付を取得し、
  今日との差分を計算する。
    - diff >= warn_days (default 3): warning
    - diff >= crit_days (default 7): critical

twitter_recommended 側との比率 (v2) は本試作では未実装。
本格運用組込 (check_scheduler_health.py 相乗り / cron 化) は射程外。

使い方:
  python tools/check_external_promotion_freshness.py [--days N] [--warn 3] [--crit 7]
    --days N   過去N日間のエントリも一覧する (default 14)
    --warn D   warning 閾値 (default 3)
    --crit D   critical 閾値 (default 7)
    --path P   external_notes_log.md のパス (default memory/external_notes_log.md)

exit code: 0 (健全) / 1 (warning) / 2 (critical)
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path

HEADING = re.compile(r"^## (\d{4}-\d{2}-\d{2})\b")


def parse_promotions(path: Path) -> list[tuple[dt.date, str]]:
    """external_notes_log.md から (日付, 見出し行) を全て抽出して降順で返す。"""
    out: list[tuple[dt.date, str]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        m = HEADING.match(line)
        if not m:
            continue
        try:
            d = dt.date.fromisoformat(m.group(1))
        except ValueError:
            continue
        out.append((d, line.rstrip()))
    out.sort(key=lambda x: x[0], reverse=True)
    return out


def find_gaps(entries: list[tuple[dt.date, str]], today: dt.date, window_days: int) -> list[tuple[dt.date, dt.date, int]]:
    """過去 window_days のレンジ内で昇格ゼロが続いた区間を (start, end, gap_days) で返す。

    start = 区間の先頭 (今日寄り) の昇格日翌日、end = 次の昇格日前日。
    head_gap (最新昇格日→今日) も含める。
    """
    cutoff = today - dt.timedelta(days=window_days)
    relevant = [d for d, _ in entries if d >= cutoff]
    relevant.sort(reverse=True)
    gaps: list[tuple[dt.date, dt.date, int]] = []
    # head gap (今日 - 最新昇格日)
    if relevant:
        head = relevant[0]
        if today > head:
            gaps.append((head + dt.timedelta(days=1), today, (today - head).days))
        for i in range(len(relevant) - 1):
            newer = relevant[i]
            older = relevant[i + 1]
            diff = (newer - older).days
            if diff > 1:
                gaps.append((older + dt.timedelta(days=1), newer - dt.timedelta(days=1), diff - 1))
    return gaps


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--path", default="memory/external_notes_log.md")
    ap.add_argument("--warn", type=int, default=3, help="warning 閾値 (デフォルト3日)")
    ap.add_argument("--crit", type=int, default=7, help="critical 閾値 (デフォルト7日)")
    ap.add_argument("--days", type=int, default=14, help="過去何日間を観測するか (デフォルト14日)")
    ap.add_argument("--today", default=None, help="基準日 (YYYY-MM-DD)、テスト用。未指定なら今日")
    args = ap.parse_args(argv)

    path = Path(args.path)
    if not path.exists():
        print(f"[ERROR] path not found: {path}", file=sys.stderr)
        return 3

    today = dt.date.fromisoformat(args.today) if args.today else dt.date.today()
    entries = parse_promotions(path)
    if not entries:
        print(f"[CRITICAL] no promotion headings found in {path}")
        return 2

    latest_date, latest_line = entries[0]
    diff = (today - latest_date).days

    if diff >= args.crit:
        status = "CRITICAL"
        rc = 2
    elif diff >= args.warn:
        status = "WARN"
        rc = 1
    else:
        status = "OK"
        rc = 0

    print(f"[{status}] external_notes_log promotion freshness check")
    print(f"  today           : {today.isoformat()}")
    print(f"  latest promotion: {latest_date.isoformat()} (diff={diff}d)")
    print(f"  latest heading  : {latest_line[:120]}")
    print(f"  warn>= {args.warn}d  / crit>= {args.crit}d  / window={args.days}d")

    cutoff = today - dt.timedelta(days=args.days)
    window_entries = [(d, l) for d, l in entries if d >= cutoff]
    print(f"  window entries  : {len(window_entries)} 件 (過去 {args.days} 日)")
    for d, line in window_entries:
        print(f"    {d.isoformat()}  {line[:100]}")

    gaps = find_gaps(entries, today, args.days)
    if gaps:
        print(f"  gaps (ゼロ昇格区間, 過去 {args.days} 日):")
        for start, end, n in gaps:
            tag = "CRIT" if n >= args.crit else ("WARN" if n >= args.warn else "ok")
            print(f"    [{tag}] {start.isoformat()} 〜 {end.isoformat()} ({n}日)")

    if rc == 0:
        print("  → 健全 (warning 閾値未達)")
    elif rc == 1:
        print(f"  → 注意: 直近 {diff} 日昇格ゼロ (warn 閾値 {args.warn}d 超過)")
    else:
        print(f"  → critical: 直近 {diff} 日昇格ゼロ (crit 閾値 {args.crit}d 超過)、twitter_recommended 見直し必須")

    return rc


if __name__ == "__main__":
    sys.exit(main())
