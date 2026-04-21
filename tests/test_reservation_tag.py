#!/usr/bin/env python3
"""scripts/check_reservation_tag.py の動作確認テスト。

R-004 pre-commit フック方針A MVP（Ash C95実装）の受け入れ検証。
inbox_win.md C98 Ash→Log で Log が用意を約束したもの。

実行: python tests/test_reservation_tag.py
"""
from __future__ import annotations

import sys
import tempfile
import unittest.mock as mock
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import check_reservation_tag as checker  # noqa: E402


def _write_msg(text: str) -> Path:
    fd = tempfile.NamedTemporaryFile(
        mode="w", suffix=".msg", delete=False, encoding="utf-8"
    )
    fd.write(text)
    fd.close()
    return Path(fd.name)


def run_case(
    name: str,
    staged: set[str],
    message: str,
    expected_exit: int,
) -> bool:
    msg_path = _write_msg(message)
    try:
        with mock.patch.object(checker, "staged_files", return_value=staged):
            actual = checker.main(["check_reservation_tag.py", str(msg_path)])
    finally:
        msg_path.unlink(missing_ok=True)
    ok = actual == expected_exit
    mark = "PASS" if ok else "FAIL"
    print(f"[{mark}] {name}: expected={expected_exit} actual={actual}")
    return ok


CASES = [
    (
        "A: 非追跡ファイルのみ, タグ無し → 許可",
        {"memory/inbox_win.md"},
        "更新\n",
        0,
    ),
    (
        "B: action_reservations.md 変更 + タグ無し → 拒否",
        {"memory/action_reservations.md"},
        "予約を更新した\n",
        1,
    ),
    (
        "C: beliefs.md 変更 + [R-004] → 許可",
        {"memory/beliefs.md"},
        "beliefs 更新 [R-004]\n",
        0,
    ),
    (
        "D: core_mission.md 変更 + [no-reservation] → 許可",
        {"memory/core_mission.md"},
        "軽微な誤字修正 [no-reservation]\n",
        0,
    ),
    (
        "E: 追跡ファイル変更 + コメント行内のみタグ → 拒否",
        {"memory/action_reservations.md"},
        "予約更新\n# [R-004] こちらは git コメント行なので無視されるべき\n",
        1,
    ),
    (
        "F: 追跡ファイル変更 + 3桁でない [R-04] → 拒否",
        {"memory/action_reservations.md"},
        "予約更新 [R-04]\n",
        1,
    ),
    (
        "G: 追跡ファイル変更 + 4桁の [R-0004] → 拒否",
        {"memory/action_reservations.md"},
        "予約更新 [R-0004]\n",
        1,
    ),
    (
        "H: 複数の追跡ファイル + タグ → 許可",
        {"memory/beliefs.md", "memory/action_reservations.md"},
        "大改修 [R-007]\n",
        0,
    ),
    (
        "I: 追跡ファイルと非追跡ファイル混在 + タグ無し → 拒否",
        {"memory/beliefs.md", "memory/inbox_win.md"},
        "beliefs 更新\n",
        1,
    ),
    (
        "J: ステージ空 → 許可",
        set(),
        "何か\n",
        0,
    ),
]


def test_pending_reservation_ids_parses_active_section() -> bool:
    ids = checker.pending_reservation_ids()
    ok = any(entry.startswith("R-") for entry in ids)
    mark = "PASS" if ok else "FAIL"
    print(f"[{mark}] K: pending_reservation_ids が R-xxx を少なくとも1件返す")
    return ok


def main() -> int:
    results = [run_case(*c) for c in CASES]
    results.append(test_pending_reservation_ids_parses_active_section())
    passed = sum(results)
    total = len(results)
    print(f"\n{passed}/{total} passed")
    return 0 if passed == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
