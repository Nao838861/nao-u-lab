#!/usr/bin/env python3
"""nao_u_live.md 同パターン2回検出 — kaizen #131 段階1

M-40 §How to apply 5「同じパターンの指摘が2回連続で来たら、自分で判定する仕組みが
欠けているサイン。即座に判定機構を作る方を優先する」の発火条件レイヤー。
agent 自己申告ではなく外形装置で検出する。

検出語彙リストの出典: memory/feedback_self_judgment_no_human_dep.md §How to apply 5
語彙→判定機構 mapping: 同 §5 mapping 表（揺れ/振幅=段階値比較, 罰=閾値経験,
                       装飾/狙えない=映像レンダ, 進歩=過去ベンチ）
段階1 = 本スクリプト（log/nao_u_live.md 直近30日窓を走査）
段階2 = multi_phase_cycle_log.run_repeated_pattern_check() で staging 冒頭注入
段階3 = WARN 出力に判定機構名併記（VOCAB_TO_MECHANISM dict、2026-05-10 C176）

Usage:
    python3 scripts/check_repeated_pattern_indication.py [--since-days N] [--verbose]
    Exit code: 0=clean(0または1件), 1=WARN(同一語彙2件以上検出)
"""
from __future__ import annotations

import argparse
import re
import sys
from datetime import date, timedelta
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
LIVE_LOG = REPO / "log" / "nao_u_live.md"
# 語彙→判定機構4点 mapping (kaizen #131 段階3 / 2026-05-10 C176)
# 出典: memory/feedback_self_judgment_no_human_dep.md §How to apply 5 mapping 表
# WARN 発火時、語彙に紐づく判定機構名を出力に併記し「次の実装より判定機構優先」を構造強制する
VOCAB_TO_MECHANISM = {
    "揺れ": "段階値比較",
    "振幅": "段階値比較",
    "罰": "閾値経験",
    "装飾": "映像レンダ",
    "狙えない": "映像レンダ",
    "進歩": "過去ベンチ",
}
VOCAB = list(VOCAB_TO_MECHANISM.keys())
DATE_HEADER_PAT = re.compile(r"^##\s+(\d{4})-(\d{2})-(\d{2})")


def collect_in_window(text: str, cutoff: date) -> str:
    """## YYYY-MM-DD ヘッダで区切り、cutoff 以降の節のみ連結して返す。

    ヘッダ前のメタコメント部は無視。日付なしヘッダ（旧形式）は直前の日付に従う。
    """
    out: list[str] = []
    keep = False
    for line in text.splitlines():
        m = DATE_HEADER_PAT.match(line)
        if m:
            sec_date = date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            keep = sec_date >= cutoff
        if keep:
            out.append(line)
    return "\n".join(out)


def count_vocab(text: str) -> dict[str, int]:
    return {v: len(re.findall(re.escape(v), text)) for v in VOCAB}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--since-days", type=int, default=30,
                    help="走査窓の日数（default 30）")
    ap.add_argument("--verbose", action="store_true",
                    help="WARN なしでも語彙カウントを stdout に出す")
    args = ap.parse_args()

    if not LIVE_LOG.exists():
        print(f"[check_repeated_pattern] log not found: {LIVE_LOG}", file=sys.stderr)
        return 0

    text = LIVE_LOG.read_text(encoding="utf-8")
    cutoff = date.today() - timedelta(days=args.since_days)
    windowed = collect_in_window(text, cutoff)
    counts = count_vocab(windowed)

    fired = [(v, n) for v, n in counts.items() if n >= 2]
    for v, n in fired:
        mechanism = VOCAB_TO_MECHANISM[v]
        print(
            f"[M-40 WARN] {v} {n}回検出 → 判定機構優先（{mechanism}）",
            file=sys.stderr,
        )

    if args.verbose:
        details = " ".join(f"{v}={n}" for v, n in counts.items())
        print(f"[check_repeated_pattern] since={cutoff.isoformat()} {details}")

    return 1 if fired else 0


if __name__ == "__main__":
    sys.exit(main())
