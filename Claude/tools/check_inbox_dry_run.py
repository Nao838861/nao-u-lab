"""tools/check_inbox_dry_run.py

check_inbox.py の rotate + sticky pending overflow 機構の動作確認。
実機 inbox_win/mac/win2 には触らず、`memory/inbox_dryrun.md` を mock として作って
1) 45KB 超を注入 → rotate_if_oversized → overflow ファイル + _pending_overflow_dryrun.txt 生成
2) inject_pending_overflow_marker → inbox 先頭に [OVERFLOW UNREAD] marker prepend
3) 同じ pending を 2 回 inject しても重複 prepend されないことを確認
4) sticky pending file 削除 → inject_pending_overflow_marker が False を返すことを確認

成功時は終了コード 0、いずれかの assertion で失敗時は AssertionError で非ゼロ終了。
途中で例外が出てもクリーンアップは finally で必ず走る。

kaizen #130 改善内容(1)(2) の単体検証用。実機の rotate 発火を待たずに動作を担保する。
"""

import sys
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_DIR))

import check_inbox  # noqa: E402

DRYRUN_BOX = "dryrun"
INBOX_PATH = REPO_DIR / "memory" / f"inbox_{DRYRUN_BOX}.md"
PENDING_PATH = check_inbox._pending_overflow_path(DRYRUN_BOX)

HEADER_TEMPLATE = (
    "# inbox_dryrun.md\n"
    "<!-- dry-run only. safe to delete. -->\n"
    "<!-- created by tools/check_inbox_dry_run.py -->\n"
    "<!-- HEADER_LINE_COUNT=5 -->\n"
    "<!-- end-of-header -->\n"
)


def _cleanup():
    """dry-run で作った全ファイルを削除。"""
    targets = [INBOX_PATH, PENDING_PATH]
    # rotate で作られた overflow ファイルも掃除
    for p in (REPO_DIR / "memory").glob(f"inbox_{DRYRUN_BOX}_overflow_*.md"):
        targets.append(p)
    for p in targets:
        if p.exists():
            try:
                p.unlink()
            except OSError as e:
                print(f"[WARN] cleanup failed for {p}: {e}")


def _make_oversized_inbox():
    """45KB 超の dryrun inbox を作る（閾値 30KB を超える）"""
    body_chunk = "## dryrun_message\nfiller payload line for size inflation.\n"
    # 45KB ぐらいになるまで詰める
    n = (45 * 1024) // len(body_chunk) + 1
    body = body_chunk * n
    INBOX_PATH.write_text(HEADER_TEMPLATE + body, encoding="utf-8")
    size = INBOX_PATH.stat().st_size
    print(f"[setup] inbox_dryrun.md size = {size} bytes (>30KB threshold)")
    assert size > check_inbox.INBOX_ROTATE_THRESHOLD_BYTES, (
        f"setup failed: size {size} <= threshold {check_inbox.INBOX_ROTATE_THRESHOLD_BYTES}"
    )


def _list_overflow_files():
    return sorted((REPO_DIR / "memory").glob(f"inbox_{DRYRUN_BOX}_overflow_*.md"))


def run():
    # ===== セットアップ =====
    _cleanup()  # 前回の残骸を消す
    _make_oversized_inbox()

    # ===== Step 1: rotate_if_oversized =====
    rotated = check_inbox.rotate_if_oversized(DRYRUN_BOX, INBOX_PATH)
    assert rotated is True, "rotate_if_oversized should return True for oversized inbox"

    overflow_files = _list_overflow_files()
    assert len(overflow_files) == 1, f"expected exactly 1 overflow file, got {len(overflow_files)}"
    overflow_file = overflow_files[0]
    print(f"[step1] overflow file created: {overflow_file.name}")

    assert PENDING_PATH.exists(), f"sticky pending file not created at {PENDING_PATH}"
    pending_text = PENDING_PATH.read_text(encoding="utf-8")
    assert overflow_file.name in pending_text, "pending file should reference overflow file name"
    assert "rotated_at:" in pending_text, "pending file should contain rotated_at"
    assert "original_size_bytes:" in pending_text, "pending file should contain original_size_bytes"
    print(f"[step1] sticky pending file content:\n---\n{pending_text}---")

    # inbox はヘッダ + rotate notice のみ
    post_rotate_size = INBOX_PATH.stat().st_size
    assert post_rotate_size < check_inbox.INBOX_ROTATE_THRESHOLD_BYTES, (
        f"inbox should be smaller than threshold after rotate, got {post_rotate_size}"
    )
    inbox_text = INBOX_PATH.read_text(encoding="utf-8")
    assert "[SYSTEM]" in inbox_text and "自動 rotate" in inbox_text, "rotate notice missing in inbox"
    assert "[OVERFLOW UNREAD" not in inbox_text, (
        "OVERFLOW UNREAD marker should NOT be in inbox yet (only after inject)"
    )
    print(f"[step1] inbox size after rotate: {post_rotate_size} bytes (notice only)")

    # ===== Step 2: inject_pending_overflow_marker =====
    injected = check_inbox.inject_pending_overflow_marker(DRYRUN_BOX, INBOX_PATH)
    assert injected is True, "inject_pending_overflow_marker should return True on first call"
    inbox_text = INBOX_PATH.read_text(encoding="utf-8")
    assert "[OVERFLOW UNREAD" in inbox_text, "OVERFLOW UNREAD marker missing in inbox after inject"
    assert overflow_file.name in inbox_text, "overflow file name missing in marker text"
    assert f"_pending_overflow_{DRYRUN_BOX}.txt" in inbox_text, (
        "marker should reference sticky file to delete"
    )
    print("[step2] OVERFLOW UNREAD marker prepended successfully")

    # ===== Step 3: re-inject (重複 prepend されないこと) =====
    re_injected = check_inbox.inject_pending_overflow_marker(DRYRUN_BOX, INBOX_PATH)
    assert re_injected is False, (
        "inject should return False on 2nd call (same rotated_at already in inbox)"
    )
    inbox_text_2 = INBOX_PATH.read_text(encoding="utf-8")
    marker_count = inbox_text_2.count("[OVERFLOW UNREAD")
    assert marker_count == 1, f"marker should appear exactly once, got {marker_count}"
    print("[step3] re-inject correctly skipped (no duplicate marker)")

    # ===== Step 4: sticky file 削除後 → inject が False を返す =====
    PENDING_PATH.unlink()
    assert not PENDING_PATH.exists()
    after_delete = check_inbox.inject_pending_overflow_marker(DRYRUN_BOX, INBOX_PATH)
    assert after_delete is False, (
        "inject should return False when sticky pending file is absent (Claude processed)"
    )
    print("[step4] after pending file deletion: inject returns False as expected")

    print("\nALL CHECKS PASSED ✓ (kaizen #130 sticky pending file 機構 v0 動作確認完了)")


def main():
    try:
        run()
    finally:
        _cleanup()


if __name__ == "__main__":
    main()
