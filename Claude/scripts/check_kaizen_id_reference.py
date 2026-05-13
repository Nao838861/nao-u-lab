#!/usr/bin/env python3
"""staging 内の kaizen ID 引用実在性検証 — kaizen #133 (#131/#132 family 第3弾)

C189 Phase 1 §E で「#124 (Log 2026-04-25 起票, 18日経過)」と staging に記述、
Phase 2 §5 がそれを引いて「kaizen #124 保留延長 +14日」と判定。Phase 3 §0 で
事実検証した結果、`memory/kaizen_tracker.md` に `### #124:` 見出しは不在、
実体は kaizen #115 + サイクル名 C124 を混同していた事故。

#131 (Nao_u 指摘の同パターン語彙検出) / #132 (Phase 2→3 連鎖検出) と同 family、
対象層が「kaizen ID 引用の実在性」というより具体的レイヤー。

検出仕様:
  - 引用: staging 内の `#NNN` 形式 (2-4桁 + 任意の単一英小文字、例 #039a)
  - 実在: tracker 内の `### #NNN:` 見出し形式
  - 差分: 引用 ∖ 実在 = WARN 出力

擬陽性抑制:
  - サイクル名 C124 / Slack ts:1778... / 日付 2026-04-25 等は `#` 前置がないので不検出
  - Slack チャンネル #all-nao-u-lab / #kaizen-log 等は数字始まりでないので不検出
  - pending_requests の依頼番号 #13/#16 等は 2桁なので 3桁制限により不検出
    → 取りこぼし許容: kaizen ID は #021 以降すべて3桁。2桁IDは現存しない

Usage:
    python scripts/check_kaizen_id_reference.py --self-test
    python scripts/check_kaizen_id_reference.py [--staging-path P] [--tracker-path P]
    Exit code: 0=clean, 1=WARN(不在引用検出), 2=self-test FAIL
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_STAGING = REPO / "log" / "cycle_staging_log.md"
DEFAULT_TRACKER = REPO / "memory" / "kaizen_tracker.md"

# staging 内 kaizen ID 引用パターン: # + 3-4桁数字 + 任意の単一英小文字
# 3桁制限により pending_requests 依頼番号 (#13/#16 等の2桁) の擬陽性を抑制
REFERENCED_PAT = re.compile(r"#(\d{3,4}[a-z]?)\b")
# tracker 実在 ID 見出しパターン: 行頭 ### # + 数字 + 任意の英小文字 + コロン
EXISTING_PAT = re.compile(r"^### #(\d+[a-z]?):", re.MULTILINE)


def extract_referenced(text: str) -> set[str]:
    return set(REFERENCED_PAT.findall(text))


def extract_existing(text: str) -> set[str]:
    return set(EXISTING_PAT.findall(text))


def check(staging_text: str, tracker_text: str) -> list[str]:
    """staging 引用 ∖ tracker 実在 = 不在引用リストをソートして返す。"""
    referenced = extract_referenced(staging_text)
    existing = extract_existing(tracker_text)
    return sorted(referenced - existing)


def self_test() -> int:
    """合成データ2パターンで PASS/FAIL を判定。"""
    fake_tracker = """# 改善検証トラッカー

### #001: foo
- ...

### #131: bar
- ...

### #039a: suffix test
- ...
"""

    # OK パターン: 実在 ID のみ引用
    ok_staging = "kaizen #131 段階2 hook (kaizen #001 経由) #039a も整合"
    ok_result = check(ok_staging, fake_tracker)
    if ok_result != []:
        print(f"[self-test FAIL] OK pattern returned warnings: {ok_result}", file=sys.stderr)
        return 2

    # WARN パターン: 不在 ID 引用
    warn_staging = "**#124 (Log 2026-04-25 起票)** + kaizen #131 + #999 ghost"
    warn_result = check(warn_staging, fake_tracker)
    if warn_result != ["124", "999"]:
        print(f"[self-test FAIL] WARN pattern returned {warn_result}, expected ['124', '999']", file=sys.stderr)
        return 2

    # 擬陽性抑制確認: # 前置なし数字列 + 2桁ID (pending_requests 依頼番号) は不検出
    noise = "C124 cycle / ts:1778621982 / 2026-04-25 / #all-nao-u-lab / 依頼 #13/#16/#22"
    noise_result = check(noise, fake_tracker)
    if noise_result != []:
        print(f"[self-test FAIL] noise pattern returned: {noise_result}", file=sys.stderr)
        return 2

    print("[self-test PASS] OK=clean / WARN=detected #124,#999 / noise=clean")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--self-test", action="store_true", help="合成データで自己診断")
    ap.add_argument("--staging-path", type=Path, default=DEFAULT_STAGING)
    ap.add_argument("--tracker-path", type=Path, default=DEFAULT_TRACKER)
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    if not args.staging_path.exists():
        print(f"[check_kaizen_id_ref] staging not found: {args.staging_path}", file=sys.stderr)
        return 0
    if not args.tracker_path.exists():
        print(f"[check_kaizen_id_ref] tracker not found: {args.tracker_path}", file=sys.stderr)
        return 0

    staging_text = args.staging_path.read_text(encoding="utf-8")
    tracker_text = args.tracker_path.read_text(encoding="utf-8")

    absent = check(staging_text, tracker_text)

    for kid in absent:
        print(
            f"[#133 WARN] staging が kaizen #{kid} を引用していますが tracker に "
            f"`### #{kid}:` 見出しが不在です（実体IDの取り違え or サイクル名混同の可能性）",
            file=sys.stderr,
        )

    if args.verbose:
        referenced = extract_referenced(staging_text)
        existing = extract_existing(tracker_text)
        print(
            f"[check_kaizen_id_ref] referenced={len(referenced)} existing={len(existing)} "
            f"absent={len(absent)}"
        )

    return 1 if absent else 0


if __name__ == "__main__":
    sys.exit(main())
