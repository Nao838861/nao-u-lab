#!/usr/bin/env python3
"""
boot_intent.md のドリフト検出 — kaizen #122 自走規律3点 構造強制 (起票: Mir 2026-04-27 C136)

Stage 2 のみの最小実装 (Mir C137 2026-04-27)。
Stage 1 (commit log と cycle ラベル整合性) と Stage 3 (5+持ち越し escalate, 既存
next_tasks.py L250-273 と composition) は次サイクル以降。

Stage 2: 「### 起動時の焦点」セクション内の項目数を数え、4以上なら stderr に WARN。
焦点項目は **(N) ...** または `**...:**` パターンで識別。

Usage:
    python3 scripts/check_boot_intent_drift.py [--instance log|mir|ash]
    Exit code: 0=clean, 1=WARN(focus過多)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INSTANCE_BOOT_INTENT = {
    "log": REPO / "memory" / "log_boot_intent.md",
    "mir": REPO / "memory" / "mir_boot_intent.md",
    "ash": REPO / "memory" / "ash_boot_intent.md",
}
FOCUS_LIMIT = 3
FOCUS_HEADER_PAT = re.compile(r"^##\s*起動時の焦点", re.MULTILINE)
# 項目の数え方: 「(1) ... (2) ... (3) ...」 を主、行頭 (N) も拾う
FOCUS_ITEM_PAT = re.compile(r"\((\d+)\)")


def extract_focus_section(text: str) -> str | None:
    """『## 起動時の焦点』〜次の `##` までを切り出す。

    ただし「旧CNNN焦点アーカイブ」「アーカイブ:」等の過去アーカイブマーカー以降は除外。
    Mir 慣行では現在焦点ブロックの直後に「旧CNNN焦点アーカイブ: (1) ... (5)」が続く
    ため、項目数が常に膨張し Stage 2 WARN の偽陽性を生んでいた (kaizen #122 C138 修正)。
    """
    m = FOCUS_HEADER_PAT.search(text)
    if not m:
        return None
    start = m.end()
    rest = text[start:]
    nxt = re.search(r"^##\s", rest, re.MULTILINE)
    section = rest[: nxt.start()] if nxt else rest
    # 過去アーカイブを切り落とす: `旧CNNN焦点アーカイブ` 全体パターン以降を truncate。
    # 単純に「アーカイブ」だけで切ると現在焦点本文に登場した時に誤切断する (C138 観測事例)。
    archive_marker = re.search(r"旧C\d+焦点アーカイブ", section)
    if archive_marker:
        section = section[: archive_marker.start()]
    return section


def count_focus_items(section: str) -> int:
    """セクション内の (N) を最大値で数える。連続性は問わない、最大番号 = 項目数とみなす。"""
    nums = [int(m.group(1)) for m in FOCUS_ITEM_PAT.finditer(section)]
    return max(nums) if nums else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--instance", choices=list(INSTANCE_BOOT_INTENT), default="mir")
    args = ap.parse_args()

    path = INSTANCE_BOOT_INTENT[args.instance]
    if not path.exists():
        print(f"[check_boot_intent_drift] boot_intent not found: {path}", file=sys.stderr)
        return 2

    text = path.read_text(encoding="utf-8")
    section = extract_focus_section(text)
    if section is None:
        print(f"[check_boot_intent_drift] '## 起動時の焦点' header not found in {path}", file=sys.stderr)
        return 2

    n = count_focus_items(section)
    if n > FOCUS_LIMIT:
        print(
            f"[check_boot_intent_drift] WARN [{args.instance}] focus={n} > {FOCUS_LIMIT} "
            f"(kaizen #122 Stage 2)",
            file=sys.stderr,
        )
        return 1

    print(f"[check_boot_intent_drift] OK [{args.instance}] focus={n} <= {FOCUS_LIMIT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
