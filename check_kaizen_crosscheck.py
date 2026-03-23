"""
check_kaizen_crosscheck.py — 改善クロスチェックの未レビュー項目を表示

memory/kaizen_tracker.md のクロスチェック欄を読み、指定インスタンスの未チェック項目を出力する。
auto_cycleの起動時に実行し、レビューすべき改善があればプロンプトに含める。

Usage:
  python check_kaizen_crosscheck.py --who=Mir    # Mirの未チェック項目
  python check_kaizen_crosscheck.py --who=Log    # Logの未チェック項目
  python check_kaizen_crosscheck.py --who=Ash    # Ashの未チェック項目
  python check_kaizen_crosscheck.py --summary    # 全体サマリー
"""

import re
import sys
from pathlib import Path

TRACKER_FILE = Path(__file__).parent / "memory" / "kaizen_tracker.md"


def parse_tracker_crosscheck():
    """Parse kaizen_tracker.md and return list of active entries with crosscheck status."""
    if not TRACKER_FILE.exists():
        return []

    text = TRACKER_FILE.read_text(encoding="utf-8")

    # Only parse the "アクティブな改善" section
    active_section = ""
    in_section = False
    for line in text.split("\n"):
        if "## アクティブな改善" in line:
            in_section = True
            continue
        if in_section and line.startswith("## ") and "アクティブ" not in line:
            break
        if in_section:
            active_section += line + "\n"

    entries = []
    current = None

    for line in active_section.split("\n"):
        m = re.match(r"^###\s+#(\d+):\s+(.+)", line)
        if m:
            if current:
                entries.append(current)
            current = {
                "id": f"#{m.group(1)}",
                "summary": m.group(2).strip(),
                "proposer": "",
                "date": "",
                "checks": {"Log": "未", "Mir": "未", "Ash": "未"},
            }
            continue

        if current is None:
            continue

        if line.startswith("- 提案者:"):
            current["proposer"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 適用日:"):
            current["date"] = line.split(":", 1)[1].strip()
        elif line.startswith("- クロスチェック:"):
            cc_text = line.split(":", 1)[1].strip()
            # Parse "Log=未 / Mir=OK(2026-03-24) / Ash=未"
            for name in ["Log", "Mir", "Ash"]:
                m2 = re.search(rf"{name}=(\S+(?:\([^)]*\))?)", cc_text)
                if m2:
                    current["checks"][name] = m2.group(1)

    if current:
        entries.append(current)

    return entries


def show_pending(who):
    """Show pending cross-check items for a specific instance."""
    entries = parse_tracker_crosscheck()
    pending = [e for e in entries if e["checks"].get(who, "未") == "未"]

    if not pending:
        print(f"クロスチェック: {who}の未レビュー項目なし")
        return

    print(f"📋 クロスチェック: {who}の未レビュー項目 {len(pending)}件")
    print()
    for e in pending:
        checked_count = sum(1 for v in e["checks"].values() if v != "未")
        print(f"  {e['id']}: {e['summary']}")
        print(f"    提案者: {e['proposer']} | 適用日: {e['date']} | チェック済み: {checked_count}/3")
        # Show what others said
        for name, status in e["checks"].items():
            if status != "未" and name != who:
                print(f"    {name}: {status}")
        print()

    print(f"→ レビュー後、memory/kaizen_tracker.mdのクロスチェック欄を {who}=OK(日付) に更新")


def show_summary():
    """Show overall cross-check summary."""
    entries = parse_tracker_crosscheck()
    if not entries:
        print("クロスチェック: エントリなし")
        return

    print(f"📊 クロスチェックサマリー: {len(entries)}件")
    for e in entries:
        checked = sum(1 for v in e["checks"].values() if v != "未")
        remaining = [n for n, v in e["checks"].items() if v == "未"]
        status = "✅" if checked == 3 else f"⏳ {checked}/3"
        print(f"  {e['id']}: {e['summary']} [{status}]")
        if remaining:
            print(f"    未チェック: {', '.join(remaining)}")


if __name__ == "__main__":
    who = None
    for arg in sys.argv[1:]:
        if arg.startswith("--who="):
            who = arg.split("=", 1)[1]
        elif arg == "--summary":
            show_summary()
            sys.exit(0)

    if who:
        show_pending(who)
    else:
        print(__doc__)
