#!/usr/bin/env python3
"""external_notes_<instance>.md 最新エントリ日付ラグ警告 — kaizen #116 段階1

原文記録スキップ事故（外部摂取→knowledge直行で原文を捨てる経路）の構造検出。
Ash 4/22-25 の external_notes_ash.md 4日間スキップ問題が発端。

3日以上ラグが空いた場合、Twitter おすすめタブ巡回6時間1回ルール（1日複数回エント
リ原則）からの構造異常として stderr に WARN 出力 + exit 1 を返す。

Mir 補強提案(d)「knowledge/<date>_*.md 作成日 vs external_notes_<instance>.md
エントリ存在の同日クロスチェック」は本案の射程外。検証完了後に v2 として別 kaizen
で起票する余地あり（射程膨張禁止、feedback_few_rules_big_effect.md 整合）。

段階1 = 本スクリプト（手動 / --self-test 実行）
段階2 = autonomous_cycle.sh / multi_phase_cycle_log.py の init_staging 前 hook
段階3 = (検証完了後判断)

Usage:
    python3 scripts/check_external_notes_lag.py [--instance log|mir|ash]
                                                [--threshold N]
                                                [--verbose] [--self-test]
    Exit code: 0=clean(全 instance ラグ<閾値), 1=WARN(1件以上閾値到達)
"""
from __future__ import annotations

import argparse
import re
import sys
from datetime import date, timedelta
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INSTANCES = ("log", "mir", "ash")
DEFAULT_THRESHOLD_DAYS = 3
DATE_HEADER_PAT = re.compile(r"^##\s+(\d{4})-(\d{2})-(\d{2})", re.MULTILINE)


def notes_path(instance: str) -> Path:
    return REPO / "memory" / f"external_notes_{instance}.md"


def latest_entry_date(text: str) -> date | None:
    dates: list[date] = []
    for m in DATE_HEADER_PAT.finditer(text):
        try:
            dates.append(date(int(m.group(1)), int(m.group(2)), int(m.group(3))))
        except ValueError:
            continue
    return max(dates) if dates else None


def check_instance(instance: str, today: date, threshold: int) -> tuple[int, str]:
    """Returns (lag_days_or_-1, status_line). lag=-1 means parse error."""
    path = notes_path(instance)
    if not path.exists():
        return -1, f"{instance}: file not found ({path})"
    text = path.read_text(encoding="utf-8")
    latest = latest_entry_date(text)
    if latest is None:
        return -1, f"{instance}: parse_error (no ## YYYY-MM-DD header)"
    lag = (today - latest).days
    flag = "WARN" if lag >= threshold else "ok"
    return lag, f"{instance}: lag={lag}日 latest={latest.isoformat()} [{flag}]"


def run_self_test() -> int:
    """合成データでパース + 閾値ロジックの健全性を確認。"""
    today = date(2026, 5, 9)
    cases = [
        ("最新が今日 → ok", f"## {today.isoformat()} foo\n本文\n", 0, False),
        ("最新が3日前 → WARN", "## 2026-05-06 foo\n本文\n", 3, True),
        ("最新が10日前 → WARN", "## 2026-04-29 foo\n本文\n", 10, True),
        ("ヘッダなし → parse_error", "本文だけ\n", -1, None),
        (
            "複数ヘッダから最大日付を採用",
            "## 2026-04-01 old\n本文\n## 2026-05-08 new\n本文\n## 2026-03-15 older\n",
            1,
            False,
        ),
    ]
    threshold = 3
    failed = 0
    for label, text, expected_lag, expected_warn in cases:
        latest = latest_entry_date(text)
        if expected_lag == -1:
            actual_lag = -1 if latest is None else (today - latest).days
        else:
            actual_lag = -1 if latest is None else (today - latest).days
        ok_lag = actual_lag == expected_lag
        if expected_warn is None:
            ok_warn = latest is None
        else:
            ok_warn = (actual_lag >= threshold) == expected_warn
        passed = ok_lag and ok_warn
        mark = "PASS" if passed else "FAIL"
        print(f"[self-test {mark}] {label} (lag={actual_lag} expected={expected_lag})")
        if not passed:
            failed += 1
    print(f"[self-test] {len(cases) - failed}/{len(cases)} passed")
    return 1 if failed else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--instance", choices=INSTANCES, default=None,
                    help="対象インスタンス (省略時は3つ全て)")
    ap.add_argument("--threshold", type=int, default=DEFAULT_THRESHOLD_DAYS,
                    help=f"WARN 閾値日数 (default {DEFAULT_THRESHOLD_DAYS})")
    ap.add_argument("--verbose", action="store_true",
                    help="WARN なしでも各 instance の lag を stdout 出力")
    ap.add_argument("--self-test", action="store_true",
                    help="合成データでパース+閾値ロジック健全性確認 (kaizen #116 Log 補強3点)")
    args = ap.parse_args()

    if args.self_test:
        return run_self_test()

    today = date.today()
    targets = [args.instance] if args.instance else list(INSTANCES)

    warn_count = 0
    status_lines: list[str] = []
    for inst in targets:
        lag, status = check_instance(inst, today, args.threshold)
        status_lines.append(status)
        if lag >= args.threshold:
            warn_count += 1
            path = notes_path(inst)
            text = path.read_text(encoding="utf-8")
            latest = latest_entry_date(text)
            latest_str = latest.isoformat() if latest else "unknown"
            print(
                f"[#116 WARN] external_notes_{inst}.md ラグ {lag}日"
                f"（最新エントリ {latest_str}）",
                file=sys.stderr,
            )
        elif lag == -1:
            warn_count += 1
            print(f"[#116 WARN] external_notes_{inst}.md {status}", file=sys.stderr)

    if args.verbose:
        for line in status_lines:
            print(line)

    return 1 if warn_count else 0


if __name__ == "__main__":
    sys.exit(main())
