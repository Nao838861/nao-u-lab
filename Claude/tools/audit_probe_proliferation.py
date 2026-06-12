#!/usr/bin/env python3
"""
audit_probe_proliferation.py — v003 verify.js の probe 軸群独立フラグ参照箇所を機械監査

C319 Phase 4 着地物 (Ash kogu/diegetic 洞察の Log 側装置化)。
verify.js が probe 軸を独立フラグ (state._foo / 戻り object property / 局所変数)
として分散管理しているため、軸数増加 + 軸あたり参照箇所増加で flag-pile 化が
発生する。本ツールは既知の 7 axis 名を全文走査して refs を集計、閾値超過軸を
WARN として出力する。

判定 (default):
  - probe_axis_count = N (検出した axis 数)
  - 各 axis の refs (file 内出現回数、識別子境界で正確マッチ)
  - 個別 axis refs ≥ --axis-refs-threshold (default 5) → WARN
  - 閾値超過 axis 数 ≥ --over-threshold-count (default 3) → flag-pile WARN

副作用ゼロ (read-only 走査)。純 stdlib (re + pathlib + argparse + sys) のみ。
kaizen #131/#134/#138 hook family と同型の `[<tool>] key=val ...` フォーマット。

exit code:
  0 = 完走 (WARN の有無に関わらず — 本ツールは informational audit)
  2 = 入力ファイル不在 / 読込失敗
"""
import argparse
import re
import sys
from pathlib import Path

KNOWN_AXES = [
    "instinct_trigger_count",
    "cont_grazing_max",
    "min_approach_p10",
    "temporal_inconsistency_count",
    "survived_frames",
    "bullet_frame_count",
    "outcome",
]


def count_axis_refs(text: str, axis: str) -> int:
    pattern = re.compile(r"\b" + re.escape(axis) + r"\b")
    return len(pattern.findall(text))


def main() -> int:
    ap = argparse.ArgumentParser(
        description="v003 verify.js の probe 軸群独立フラグ参照箇所を機械監査"
    )
    ap.add_argument(
        "file",
        help="走査対象 (例: game/log_autonomous_game/v003/verify.js)",
    )
    ap.add_argument(
        "--axis-refs-threshold",
        type=int,
        default=5,
        help="個別 axis refs WARN 閾値 (default: 5)",
    )
    ap.add_argument(
        "--over-threshold-count",
        type=int,
        default=3,
        help="閾値超過 axis 数の flag-pile WARN トリガ (default: 3)",
    )
    ap.add_argument(
        "--axes",
        nargs="*",
        default=None,
        help="走査する axis 名 (default: 既知 7 軸)",
    )
    args = ap.parse_args()

    path = Path(args.file)
    if not path.is_file():
        print(
            f"[audit_probe_proliferation] file not found: {path}",
            file=sys.stderr,
        )
        return 2

    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        print(
            f"[audit_probe_proliferation] read failed: {path} ({e})",
            file=sys.stderr,
        )
        return 2

    axes = args.axes if args.axes else KNOWN_AXES

    refs_by_axis = {a: count_axis_refs(text, a) for a in axes}
    detected = [a for a in axes if refs_by_axis[a] > 0]
    over = [a for a in detected if refs_by_axis[a] >= args.axis_refs_threshold]

    print(
        f"[audit_probe_proliferation] file={path} "
        f"probe_axis_count={len(detected)} "
        f"axes_over_threshold={len(over)} "
        f"refs_threshold={args.axis_refs_threshold} "
        f"over_count_threshold={args.over_threshold_count}"
    )

    for a in sorted(detected, key=lambda x: refs_by_axis[x], reverse=True):
        print(
            f"[audit_probe_proliferation] axis={a} refs={refs_by_axis[a]} file={path}"
        )

    for a in sorted(over, key=lambda x: refs_by_axis[x], reverse=True):
        print(
            f"[audit_probe_proliferation WARN] axis={a} refs={refs_by_axis[a]} "
            f"threshold={args.axis_refs_threshold} file={path}",
            file=sys.stderr,
        )

    if len(over) >= args.over_threshold_count:
        print(
            f"[audit_probe_proliferation WARN] axes_over_threshold={len(over)} "
            f">= {args.over_threshold_count} = flag-pile suspected file={path}",
            file=sys.stderr,
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
