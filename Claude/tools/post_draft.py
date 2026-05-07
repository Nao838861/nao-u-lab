#!/usr/bin/env python3
"""tools/post_draft.py — drafts/*.py 送信ラッパー + 論理削除

Implements kaizen #094 (2026-04-20 起票 Log C89 Phase 3、実装 Mir C90 Phase 0).

目的:
    drafts/ ディレクトリに溜まった送信済みスクリプトを、送信成功と同時に
    drafts/.archive/YYYY-MM-DD/ へ論理削除する構造強制ラッパー。
    手動削除の失念で drafts/ が無限増殖する問題（C87=21本 → C88=119本 → C90=140本）を
    構造で止める。

設計原則（Log pre-mortem 反映）:
    - 物理削除しない。常に drafts/.archive/<date>/ へ move（論理削除）
    - post_message の戻り値（dict）を直接受ける。stdout パースに頼らない
    - 送信失敗 / 例外 / post_message 未呼出 の場合は draft を残す（保守的 false negative）

Usage:
    python3 tools/post_draft.py drafts/<script>.py
    python3 tools/post_draft.py drafts/<script>.py --dry-run   # 実投稿せず parse のみ
    python3 tools/post_draft.py drafts/<script>.py --force     # 全件 skipped でも archive

Exit codes:
    0: 送信成功 + archive 完了（または --dry-run で archive スキップ）
    2: 入力エラー（draft 不在 / drafts/ 外パス）
    3: draft 実行中に例外が発生
    4: post_message 呼出しが1件も検出されず（raw SDK 使用等）
    5: 1件以上の post_message が ok=False を返した
    6: 全件 skipped（重複ガード発動）で --force 未指定

--dry-run の実装:
    post_message を fake 関数で置き換え、Slack API 呼出しを一切行わずに
    `{"ok": True, "ts": "DRY_RUN", "dry_run": True}` を返す。draft 側の
    print 文等は通常通り実行される。archive は行わない。
"""
import argparse
import runpy
import shutil
import sys
from datetime import datetime
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("draft", help="Path to drafts/*.py script")
    ap.add_argument("--dry-run", action="store_true",
                    help="Execute but do not archive")
    ap.add_argument("--force", action="store_true",
                    help="Archive even if all posts were skipped (dedup)")
    args = ap.parse_args()

    draft_path = Path(args.draft).resolve()
    drafts_root = (REPO / "drafts").resolve()

    if not draft_path.exists():
        print(f"[post_draft] ERROR: draft not found: {draft_path}", file=sys.stderr)
        return 2
    try:
        draft_path.relative_to(drafts_root)
    except ValueError:
        print(f"[post_draft] ERROR: draft must be under drafts/: {draft_path}",
              file=sys.stderr)
        return 2

    # Monkey-patch post_message in-process to capture all return values.
    # In --dry-run mode, replace post_message with a fake that returns success
    # WITHOUT calling the Slack API (prevents accidental duplicate posts during testing).
    import slack_bot  # noqa: E402
    orig_post = slack_bot.post_message
    results: list[dict] = []

    if args.dry_run:
        def fake_post(channel, text, thread_ts=None):
            r = {"ok": True, "ts": "DRY_RUN", "dry_run": True,
                 "channel": channel, "text_len": len(text)}
            results.append(r)
            print(f"[post_draft] DRY RUN: would post {len(text)} chars to {channel}")
            return r
        slack_bot.post_message = fake_post
    else:
        def wrapped_post(*a, **kw):
            r = orig_post(*a, **kw)
            results.append(r if isinstance(r, dict)
                           else {"ok": False, "error": f"non-dict return: {r!r}"})
            return r
        slack_bot.post_message = wrapped_post
    exc: BaseException | None = None
    try:
        runpy.run_path(str(draft_path), run_name="__main__")
    except SystemExit as e:
        if e.code not in (0, None):
            exc = e
    except BaseException as e:  # noqa: BLE001
        exc = e
    finally:
        slack_bot.post_message = orig_post

    if exc is not None:
        print(f"[post_draft] ERROR: draft raised: {exc!r}", file=sys.stderr)
        print(f"[post_draft] draft NOT archived (kept at {draft_path})")
        return 3

    if not results:
        print("[post_draft] WARN: no post_message calls captured "
              "(draft may use raw Slack SDK or did not post)")
        print(f"[post_draft] draft NOT archived (conservative): {draft_path.name}")
        return 4

    # Report per-call status
    for i, r in enumerate(results, 1):
        status = "ok" if r.get("ok") else "FAIL"
        if r.get("skipped"):
            status += " (skipped)"
        ts = r.get("ts", "")
        err = r.get("error", "")
        print(f"[post_draft] call #{i}: {status} ts={ts} error={err}")

    all_ok = all(r.get("ok") for r in results)
    any_real_post = any(r.get("ok") and not r.get("skipped") for r in results)

    if not all_ok:
        print("[post_draft] one or more posts failed. draft NOT archived.")
        return 5

    if not any_real_post and not args.force:
        print("[post_draft] all posts were skipped (dedup). "
              "draft NOT archived. Use --force to override.")
        return 6

    if args.dry_run:
        print(f"[post_draft] DRY RUN: would archive {draft_path.name}")
        return 0

    # Logical delete: move to drafts/.archive/<date>/
    date = datetime.now().strftime("%Y-%m-%d")
    archive_dir = drafts_root / ".archive" / date
    archive_dir.mkdir(parents=True, exist_ok=True)
    target = archive_dir / draft_path.name
    n = 1
    while target.exists():
        target = archive_dir / f"{draft_path.stem}_{n}{draft_path.suffix}"
        n += 1
    shutil.move(str(draft_path), str(target))
    print(f"[post_draft] archived: {draft_path.name} -> "
          f"{target.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
