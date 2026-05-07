#!/usr/bin/env python3
"""commit-msg フックで呼ばれる R-ID タグ必須チェッカ。

対象: memory/beliefs.md, memory/core_mission.md, memory/action_reservations.md
ルール: 上記いずれかがステージに含まれるコミットは、メッセージに
  [R-NNN] または [no-reservation] を含むこと。
無い場合は非ゼロ終了して、action_reservations.md の未完了 R-ID を表示する。

起票経緯: inbox_win.md C95 Log提案「方針A MVP」。2026-04-18 の R-004 古い
          「承認待ち」残存による Nao_u 再指示事件が契機。
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TRACKED = {
    "memory/beliefs.md",
    "memory/core_mission.md",
    "memory/action_reservations.md",
}
TAG_RE = re.compile(r"\[(R-\d{3}|no-reservation)\]")


def staged_files() -> set[str]:
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only"],
        capture_output=True,
        text=True,
        check=False,
        cwd=REPO_ROOT,
    )
    return {line.strip().replace("\\", "/") for line in result.stdout.splitlines() if line.strip()}


def pending_reservation_ids() -> list[str]:
    path = REPO_ROOT / "memory" / "action_reservations.md"
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8", errors="replace")
    completed_start = text.find("## 完了した予約")
    active_text = text[:completed_start] if completed_start != -1 else text
    ids: list[str] = []
    for match in re.finditer(r"^###\s+(R-\d{3}):\s*(.+)$", active_text, re.MULTILINE):
        ids.append(f"{match.group(1)}: {match.group(2).strip()}")
    return ids


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        return 0
    msg_file = Path(argv[1])
    if not msg_file.exists():
        return 0

    touched = staged_files() & TRACKED
    if not touched:
        return 0

    message = msg_file.read_text(encoding="utf-8", errors="replace")
    stripped = "\n".join(
        line for line in message.splitlines() if not line.lstrip().startswith("#")
    )
    if TAG_RE.search(stripped):
        return 0

    sys.stderr.write(
        "✗ コミット拒否: 以下のファイルが変更されているため、\n"
        "  コミットメッセージに [R-NNN] または [no-reservation] が必要です。\n"
    )
    for f in sorted(touched):
        sys.stderr.write(f"    - {f}\n")
    ids = pending_reservation_ids()
    if ids:
        sys.stderr.write("\n現在の未完了 R-ID:\n")
        for item in ids:
            sys.stderr.write(f"    - {item}\n")
    sys.stderr.write(
        "\n例:\n"
        "  git commit -m 'beliefs更新: B033 文言修正 [R-004]'\n"
        "  git commit -m '運用メモ追記（予約無関連） [no-reservation]'\n"
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
