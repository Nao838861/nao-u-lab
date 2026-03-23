"""
check_scheduled_actions.py — 行動予約の期限チェック

memory/scheduled_actions.mdを読み、実行日時が到来しているアクションを出力する。
auto_cycleの前に実行し、出力をプロンプトに含めることで予約アクションの実行漏れを防ぐ。

Nao_uの提案（2026-03-23）に基づいて作成。

Usage:
  python check_scheduled_actions.py                  # 期限到来アクションを表示
  python check_scheduled_actions.py --all             # 全アクティブ予約を表示
  python check_scheduled_actions.py --who Ash         # 特定担当者のみ
"""

import re
import sys
from datetime import date, datetime
from pathlib import Path

ACTIONS_FILE = Path(__file__).parent / "memory" / "scheduled_actions.md"


def parse_actions():
    """Parse scheduled_actions.md and return list of action entries."""
    if not ACTIONS_FILE.exists():
        return []

    text = ACTIONS_FILE.read_text(encoding="utf-8")
    entries = []
    current = None
    in_active = False

    for line in text.split("\n"):
        # Track section
        if line.startswith("## アクティブな予約"):
            in_active = True
            continue
        if line.startswith("## 完了した予約"):
            in_active = False
            continue

        if not in_active:
            continue

        # Entry header: ### SA-NNN: summary
        m = re.match(r"^###\s+(SA-\d+):\s+(.+)", line)
        if m:
            if current:
                entries.append(current)
            current = {
                "id": m.group(1),
                "summary": m.group(2).strip(),
                "due": None,
                "who": "全員",
                "detail": "",
                "status": "未実行",
            }
            continue

        if current is None:
            continue

        # Parse fields
        if line.startswith("- 実行日時:"):
            date_str = line.split(":", 1)[1].strip()
            # Try datetime first, then date only
            for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d"):
                try:
                    current["due"] = datetime.strptime(date_str, fmt).date()
                    break
                except ValueError:
                    continue
        elif line.startswith("- 対象:"):
            current["who"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 内容:"):
            current["detail"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 状態:"):
            current["status"] = line.split(":", 1)[1].strip()

    if current:
        entries.append(current)

    return entries


def check_due(show_all=False, who=None):
    """Check for due actions and return formatted output."""
    entries = parse_actions()
    today = date.today()
    overdue = []
    due_today = []
    upcoming = []

    for e in entries:
        if "[完了]" in e["status"]:
            continue
        if who and who not in e["who"] and "全員" not in e["who"]:
            continue
        if e["due"] is None:
            continue
        if e["due"] < today:
            overdue.append(e)
        elif e["due"] == today:
            due_today.append(e)
        elif show_all:
            upcoming.append(e)

    lines = []
    if overdue:
        lines.append(f"🚨 期限超過の行動予約が{len(overdue)}件:")
        for e in overdue:
            lines.append(f"  {e['id']}: {e['summary']} (期限: {e['due']}, 対象: {e['who']})")
            lines.append(f"    → {e['detail']}")

    if due_today:
        lines.append(f"📌 本日実行の行動予約が{len(due_today)}件:")
        for e in due_today:
            lines.append(f"  {e['id']}: {e['summary']} (対象: {e['who']})")
            lines.append(f"    → {e['detail']}")

    if upcoming and show_all:
        lines.append(f"📅 未到来の予約が{len(upcoming)}件:")
        for e in upcoming:
            lines.append(f"  {e['id']}: {e['summary']} (期限: {e['due']}, 対象: {e['who']})")

    if not lines:
        lines.append("行動予約の期限到来なし。")

    return "\n".join(lines)


if __name__ == "__main__":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    show_all = "--all" in sys.argv
    who = None
    if "--who" in sys.argv:
        idx = sys.argv.index("--who")
        if idx + 1 < len(sys.argv):
            who = sys.argv[idx + 1]
    print(check_due(show_all, who))
