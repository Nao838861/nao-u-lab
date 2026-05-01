#!/usr/bin/env python3
"""tools/parallel_claim.py — 並行刻印プロトコル運用ラッパー（v01）

目的:
    複数インスタンス（Log/Mir/Ash）が同時刻に同じ Slack 投稿を見て同じ memory/
    刻印に走り conflict / 重複が起きる事故を構造的に止める。

前提合意（2026-05-01 17:0x Log → 17:5x Ash 合意）:
    - 自分の inbox には書かない（他者全員の inbox に書く）
    - 書込前に必ず git pull → push 時 conflict は「先発あり」シグナル
    - TTL 90 分: DONE が来なければ後発が ABANDON 1行を残してから引き取り可

マーカーフォーマット:
    [CLAIM ts=<slack_ts> by=<Log/Mir/Ash> at=<HH:MM> topic=<short> file=<想定刻印先>]
    [DONE  ts=<slack_ts> by=<Log/Mir/Ash> at=<HH:MM> commit=<sha7> file=<実際の刻印先>]
    [ABANDON ts=<slack_ts> by=<拾った人> at=<HH:MM>]

Usage:
    python tools/parallel_claim.py claim <slack_ts> <topic> <file_target>
    python tools/parallel_claim.py done  <slack_ts> <commit_sha> <file_actual>
    python tools/parallel_claim.py abandon <slack_ts>
    python tools/parallel_claim.py list                # オープンな CLAIM 一覧
    python tools/parallel_claim.py list --stale        # TTL 超過のみ

Exit codes:
    0: 成功
    1: git push conflict（先発検出）/ 一般エラー
    2: 入力エラー（インスタンス検出失敗等）

注意:
    本スクリプトは git 操作を伴う。--dry-run で事前確認可。
    topic / file は空白を含めない（空白で field 分割しているため）。
"""

import argparse
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

INBOX_OF = {
    "Log": "memory/inbox_win.md",
    "Mir": "memory/inbox_mac.md",
    "Ash": "memory/inbox_win2.md",
}

CLAIM_RE = re.compile(
    r"\[CLAIM ts=(?P<ts>\S+) by=(?P<by>\S+) at=(?P<at>\S+) topic=(?P<topic>\S+) file=(?P<file>[^\]]+)\]"
)
DONE_RE = re.compile(
    r"\[DONE\s+ts=(?P<ts>\S+) by=(?P<by>\S+) at=(?P<at>\S+) commit=(?P<commit>\S+) file=(?P<file>[^\]]+)\]"
)
ABANDON_RE = re.compile(
    r"\[ABANDON ts=(?P<ts>\S+) by=(?P<by>\S+) at=(?P<at>\S+)\]"
)

TTL_SECONDS = 90 * 60


def detect_instance() -> str:
    """cwd プレフィックスからインスタンス名を判定する。"""
    cwd = str(Path.cwd()).replace("\\", "/").lower()
    if cwd.startswith("d:/ai"):
        return "Log"
    if cwd.startswith("c:/ai"):
        return "Ash"
    if cwd.startswith("/users/") or cwd.startswith("/volumes/"):
        return "Mir"
    raise RuntimeError(f"cannot detect instance from cwd: {cwd}")


def repo_root() -> Path:
    out = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True, check=True,
    )
    return Path(out.stdout.strip())


def run(cmd, check=True, capture=False):
    return subprocess.run(cmd, check=check, text=True,
                          capture_output=capture)


def git_pull():
    run(["git", "pull", "--rebase", "--autostash"])


def git_push():
    out = run(["git", "push"], check=False, capture=True)
    return out.returncode == 0, (out.stderr or "") + (out.stdout or "")


def append_marker(root: Path, targets: list[str], line: str, dry_run: bool):
    for rel in targets:
        path = root / rel
        if dry_run:
            print(f"[DRY] would append to {rel}: {line.rstrip()}")
            continue
        with path.open("a", encoding="utf-8") as f:
            if not line.endswith("\n"):
                line = line + "\n"
            f.write(line)


def commit_inboxes(targets: list[str], message: str, dry_run: bool):
    if dry_run:
        print(f"[DRY] would commit: {message}")
        return
    run(["git", "add"] + targets)
    run(["git", "commit", "-m", message])


def cmd_claim(args) -> int:
    me = detect_instance()
    root = repo_root()
    git_pull()

    others = [name for name in INBOX_OF if name != me]
    targets = [INBOX_OF[name] for name in others]

    now = datetime.now().strftime("%H:%M")
    line = (
        f"[CLAIM ts={args.slack_ts} by={me} at={now} "
        f"topic={args.topic} file={args.file}]"
    )

    append_marker(root, targets, line, args.dry_run)
    commit_inboxes(
        targets,
        f"claim ts={args.slack_ts} by={me} topic={args.topic}",
        args.dry_run,
    )

    if args.dry_run:
        return 0

    ok, err = git_push()
    if not ok:
        print(f"PUSH FAILED — conflict suspected. Switch to 補完モード.\n{err}",
              file=sys.stderr)
        return 1
    print(f"OK: CLAIM by {me} for ts={args.slack_ts} topic={args.topic}")
    return 0


def cmd_done(args) -> int:
    me = detect_instance()
    root = repo_root()
    git_pull()

    others = [name for name in INBOX_OF if name != me]
    targets = [INBOX_OF[name] for name in others]

    now = datetime.now().strftime("%H:%M")
    line = (
        f"[DONE  ts={args.slack_ts} by={me} at={now} "
        f"commit={args.commit} file={args.file}]"
    )

    append_marker(root, targets, line, args.dry_run)
    commit_inboxes(
        targets,
        f"done ts={args.slack_ts} by={me} commit={args.commit}",
        args.dry_run,
    )

    if args.dry_run:
        return 0

    ok, err = git_push()
    if not ok:
        print(f"PUSH FAILED on done.\n{err}", file=sys.stderr)
        return 1
    print(f"OK: DONE by {me} for ts={args.slack_ts} commit={args.commit}")
    return 0


def cmd_abandon(args) -> int:
    me = detect_instance()
    root = repo_root()
    git_pull()

    others = [name for name in INBOX_OF if name != me]
    targets = [INBOX_OF[name] for name in others]

    now = datetime.now().strftime("%H:%M")
    line = f"[ABANDON ts={args.slack_ts} by={me} at={now}]"

    append_marker(root, targets, line, args.dry_run)
    commit_inboxes(
        targets,
        f"abandon ts={args.slack_ts} by={me}",
        args.dry_run,
    )

    if args.dry_run:
        return 0

    ok, err = git_push()
    if not ok:
        print(f"PUSH FAILED on abandon.\n{err}", file=sys.stderr)
        return 1
    print(f"OK: ABANDON by {me} for ts={args.slack_ts}")
    return 0


def cmd_list(args) -> int:
    """全 inbox を grep して CLAIM / DONE / ABANDON を突合し、open / stale を出力。"""
    root = repo_root()
    claims: dict[str, dict] = {}
    dones: set[str] = set()
    abandons: set[str] = set()

    for rel in INBOX_OF.values():
        path = root / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for m in CLAIM_RE.finditer(text):
            ts = m.group("ts")
            # 同一 ts の重複 CLAIM は最初のものを優先（後発は補完モード扱い）
            claims.setdefault(ts, m.groupdict())
        for m in DONE_RE.finditer(text):
            dones.add(m.group("ts"))
        for m in ABANDON_RE.finditer(text):
            abandons.add(m.group("ts"))

    open_claims = [
        (ts, c) for ts, c in claims.items()
        if ts not in dones and ts not in abandons
    ]

    now_epoch = time.time()
    stale = []
    fresh = []
    for ts, c in open_claims:
        try:
            slack_epoch = float(ts)
            age = now_epoch - slack_epoch
            if age > TTL_SECONDS:
                stale.append((ts, c, age))
            else:
                fresh.append((ts, c, age))
        except ValueError:
            # ts が float でなければ stale 判定不能、fresh 扱い
            fresh.append((ts, c, None))

    if args.stale:
        items = stale
        print(f"STALE CLAIMS (>{TTL_SECONDS // 60}min): {len(items)}")
    else:
        items = fresh + stale
        print(f"OPEN CLAIMS: {len(items)} ({len(stale)} stale)")

    for ts, c, age in items:
        age_str = f"age={age // 60:.0f}min" if age is not None else "age=?"
        flag = " [STALE]" if age is not None and age > TTL_SECONDS else ""
        print(
            f"  ts={ts} by={c['by']} at={c['at']} "
            f"topic={c['topic']} file={c['file']} {age_str}{flag}"
        )
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--dry-run", action="store_true",
                        help="git/ファイル変更を実行せず予定のみ表示")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_claim = sub.add_parser("claim")
    p_claim.add_argument("slack_ts")
    p_claim.add_argument("topic")
    p_claim.add_argument("file")
    p_claim.set_defaults(func=cmd_claim)

    p_done = sub.add_parser("done")
    p_done.add_argument("slack_ts")
    p_done.add_argument("commit")
    p_done.add_argument("file")
    p_done.set_defaults(func=cmd_done)

    p_abandon = sub.add_parser("abandon")
    p_abandon.add_argument("slack_ts")
    p_abandon.set_defaults(func=cmd_abandon)

    p_list = sub.add_parser("list")
    p_list.add_argument("--stale", action="store_true")
    p_list.set_defaults(func=cmd_list)

    args = parser.parse_args(argv)

    try:
        return args.func(args)
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
