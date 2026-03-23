"""
check_kaizen_crosscheck.py — 改善クロスチェックの未レビュー項目を表示

memory/kaizen_crosscheck.md を読み、指定インスタンスの未チェック項目を出力する。
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

CROSSCHECK_FILE = Path(__file__).parent / "memory" / "kaizen_crosscheck.md"


def parse_crosscheck():
    """Parse kaizen_crosscheck.md and return list of entries."""
    if not CROSSCHECK_FILE.exists():
        return []

    text = CROSSCHECK_FILE.read_text(encoding="utf-8")

    # Only parse the "未チェック" section
    unchecked_section = ""
    in_section = False
    for line in text.split("\n"):
        if line.strip() == "## 未チェック":
            in_section = True
            continue
        if in_section and line.startswith("## "):
            break
        if in_section:
            unchecked_section += line + "\n"

    entries = []
    current = None

    for line in unchecked_section.split("\n"):
        m = re.match(r"^###\s+(CC-\d+):\s+(.+)", line)
        if m:
            if current:
                entries.append(current)
            current = {
                "id": m.group(1),
                "summary": m.group(2).strip(),
                "date": "",
                "proposer": "",
                "ref": "",
                "checks": {"Log": None, "Mir": None, "Ash": None},
            }
            continue

        if current is None:
            continue

        if line.startswith("- 投稿日:"):
            current["date"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 提案者:"):
            current["proposer"] = line.split(":", 1)[1].strip()
        elif line.startswith("- kaizen-log参照:"):
            current["ref"] = line.split(":", 1)[1].strip()
        else:
            # Parse checkbox lines
            for name in ["Log", "Mir", "Ash"]:
                checked_pattern = rf"^\s*-\s*\[x\]\s*{name}:\s*(.*)"
                unchecked_pattern = rf"^\s*-\s*\[ \]\s*{name}:"
                cm = re.match(checked_pattern, line)
                um = re.match(unchecked_pattern, line)
                if cm:
                    current["checks"][name] = cm.group(1).strip() or "(チェック済み)"
                elif um:
                    current["checks"][name] = None  # unchecked

    if current:
        entries.append(current)

    return entries


def show_pending(who):
    """Show pending cross-check items for a specific instance."""
    entries = parse_crosscheck()
    pending = [e for e in entries if e["checks"].get(who) is None]

    if not pending:
        print(f"クロスチェック: {who}の未レビュー項目なし")
        return

    print(f"📋 クロスチェック: {who}の未レビュー項目 {len(pending)}件")
    print()
    for e in entries:
        if e["checks"].get(who) is not None:
            continue
        checked_count = sum(1 for v in e["checks"].values() if v is not None)
        print(f"  {e['id']}: {e['summary']}")
        print(f"    提案者: {e['proposer']} | 投稿日: {e['date']} | チェック済み: {checked_count}/3")
        # Show what others said
        for name, comment in e["checks"].items():
            if comment is not None and name != who:
                print(f"    {name}: {comment}")
        print()

    print(f"→ レビュー後、memory/kaizen_crosscheck.mdの該当行を [x] に変更してコメントを書く")


def show_summary():
    """Show overall cross-check summary."""
    entries = parse_crosscheck()
    if not entries:
        print("クロスチェック: エントリなし")
        return

    print(f"📊 クロスチェックサマリー: {len(entries)}件")
    for e in entries:
        checked = sum(1 for v in e["checks"].values() if v is not None)
        remaining = [n for n, v in e["checks"].items() if v is None]
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
