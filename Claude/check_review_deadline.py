"""
check_review_deadline.py — レビューキューの48時間期限チェック

kaizen_review_queue.mdを読み、適用日から48時間以上経過しているのに
全員のレビューが完了していないエントリを検出・警告する。

Usage:
  python check_review_deadline.py              # 期限超過のみ表示
  python check_review_deadline.py --all        # 全レビュー待ちを表示
  python check_review_deadline.py --nag        # 期限超過をinboxに督促送信
"""

import re
import sys
from datetime import date, timedelta
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)

QUEUE_FILE = Path(__file__).parent / "memory" / "kaizen_review_queue.md"
INBOX_DIR = Path(__file__).parent / "memory"
REVIEWERS = ["Log", "Mir", "Ash"]
DEADLINE_HOURS = 48


def parse_review_queue():
    """Parse kaizen_review_queue.md and return list of review entries."""
    if not QUEUE_FILE.exists():
        return []

    text = QUEUE_FILE.read_text(encoding="utf-8")
    entries = []
    current = None
    in_review_section = False

    for line in text.split("\n"):
        # Section header
        if line.startswith("## レビュー待ち"):
            in_review_section = True
            continue
        if line.startswith("## ") and "レビュー待ち" not in line:
            in_review_section = False
            continue

        if not in_review_section:
            continue

        # Entry header: ### #ID: summary
        m = re.match(r"^###\s+#(\d+):\s+(.+)", line)
        if m:
            if current:
                entries.append(current)
            current = {
                "id": m.group(1),
                "summary": m.group(2).strip(),
                "applied_date": None,
                "verification_deadline": None,
                "checked": {},  # name -> True/False
            }
            continue

        if current is None:
            continue

        # Parse applied date
        date_m = re.search(r"適用日:\s*(\d{4}-\d{2}-\d{2})", line)
        if date_m:
            try:
                current["applied_date"] = date.fromisoformat(date_m.group(1))
            except ValueError:
                pass

        # Parse verification deadline
        vd_m = re.search(r"検証期限:\s*(\d{4}-\d{2}-\d{2})", line)
        if vd_m:
            try:
                current["verification_deadline"] = date.fromisoformat(vd_m.group(1))
            except ValueError:
                pass

        # Parse checkbox lines: - [x] Name or - [ ] Name
        cb_m = re.match(r"^-\s+\[([ x])\]\s+(\w+)", line)
        if cb_m:
            checked = cb_m.group(1) == "x"
            name = cb_m.group(2)
            if name in REVIEWERS:
                current["checked"][name] = checked

    if current:
        entries.append(current)

    return entries


def check_deadlines(show_all=False):
    """Check review deadlines and return formatted output."""
    entries = parse_review_queue()
    today = date.today()
    overdue = []
    pending = []

    for e in entries:
        if not e["applied_date"]:
            continue

        # All checked? Skip
        unchecked = [name for name in REVIEWERS if not e["checked"].get(name, False)]
        if not unchecked:
            continue

        review_deadline = e["applied_date"] + timedelta(hours=DEADLINE_HOURS)
        is_overdue = today > review_deadline

        entry_info = {
            **e,
            "review_deadline": review_deadline,
            "unchecked": unchecked,
        }

        if is_overdue:
            overdue.append(entry_info)
        elif show_all:
            pending.append(entry_info)

    lines = []
    if overdue:
        lines.append(f"⚠ レビュー期限超過（48時間）が{len(overdue)}件:")
        for e in overdue:
            lines.append(f"  #{e['id']}: {e['summary']}")
            lines.append(f"    適用日: {e['applied_date']} / レビュー期限: {e['review_deadline']}")
            lines.append(f"    未チェック: {', '.join(e['unchecked'])}")

    if pending and show_all:
        lines.append(f"📋 レビュー期限内の待ちが{len(pending)}件:")
        for e in pending:
            lines.append(f"  #{e['id']}: {e['summary']}")
            lines.append(f"    適用日: {e['applied_date']} / レビュー期限: {e['review_deadline']}")
            lines.append(f"    未チェック: {', '.join(e['unchecked'])}")

    if not lines:
        lines.append("レビュー期限超過なし。")

    return "\n".join(lines), overdue


def send_nag(overdue_entries):
    """Send nag messages to inbox files for overdue reviewers."""
    today_str = date.today().isoformat()

    # Group by reviewer
    nag_by_reviewer = {}
    for e in overdue_entries:
        for name in e["unchecked"]:
            if name not in nag_by_reviewer:
                nag_by_reviewer[name] = []
            nag_by_reviewer[name].append(e)

    inbox_map = {
        "Log": "inbox_win.md",
        "Mir": "inbox_mac.md",
        "Ash": "inbox_win2.md",
    }

    for name, entries in nag_by_reviewer.items():
        inbox_file = INBOX_DIR / inbox_map.get(name, "")
        if not inbox_file.exists():
            continue

        ids = ", ".join(f"#{e['id']}" for e in entries)
        nag_msg = (
            f"\n## レビュー期限超過通知 [{today_str}]\n"
            f"以下のレビューが48時間期限を超過しています: {ids}\n"
            f"kaizen_review_queue.mdを確認して所見を記入してください。\n"
        )

        current = inbox_file.read_text(encoding="utf-8")
        # Don't duplicate nag for same date
        if f"レビュー期限超過通知 [{today_str}]" in current:
            print(f"  {name}: 本日分の督促済み、スキップ")
            continue

        with open(inbox_file, "a", encoding="utf-8") as f:
            f.write(nag_msg)
        print(f"  {name}: inbox督促送信 ({ids})")


if __name__ == "__main__":
    show_all = "--all" in sys.argv
    do_nag = "--nag" in sys.argv

    output, overdue = check_deadlines(show_all)
    print(output)

    if do_nag and overdue:
        print("\n督促送信中...")
        send_nag(overdue)
