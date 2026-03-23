"""
manage_review_queue.py — 改善レビューキューの管理

Nao_uの提案（2026-03-23 22:52）を実装:
  - 改善チェックリストを明示的に管理
  - チェックした人が追記、3人全員→リストから削除
  - 各自1日1回、8時間おきにチェックタスクを回す

モード:
  python manage_review_queue.py --status           # レビューキューの状態一覧
  python manage_review_queue.py --pending <名前>   # 指定者の未チェック一覧
  python manage_review_queue.py --add <ID> <概要>  # 新しいレビュー項目を追加
  python manage_review_queue.py --check <ID> <名前> <所見>  # チェック完了を記録
  python manage_review_queue.py --cleanup          # 3人完了した項目を完了セクションに移動
  python manage_review_queue.py --sync             # kaizen_tracker.mdから未レビュー項目を同期
"""

import io
import os
import re
import sys
from datetime import date
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

REPO_DIR = Path(__file__).parent
QUEUE_FILE = REPO_DIR / "memory" / "kaizen_review_queue.md"
TRACKER_FILE = REPO_DIR / "memory" / "kaizen_tracker.md"
INSTANCES = ["Log", "Mir", "Ash"]


def parse_queue():
    """Parse kaizen_review_queue.md and return list of review items."""
    if not QUEUE_FILE.exists():
        return [], []

    text = QUEUE_FILE.read_text(encoding="utf-8")

    # Split into pending and completed sections
    pending_section = ""
    completed_section = ""

    if "## レビュー待ち" in text:
        parts = text.split("## レビュー待ち", 1)
        rest = parts[1] if len(parts) > 1 else ""
        if "## 完了" in rest:
            pending_section, completed_section = rest.split("## 完了", 1)
        else:
            pending_section = rest

    pending = _parse_items(pending_section)
    completed = _parse_items(completed_section)
    return pending, completed


def _parse_items(section_text):
    """Parse review items from a section."""
    items = []
    current = None

    for line in section_text.split("\n"):
        m = re.match(r"^###\s+#(\d+):\s+(.+)", line)
        if m:
            if current:
                items.append(current)
            current = {
                "id": m.group(1),
                "summary": m.group(2).strip(),
                "meta": "",
                "criteria": "",
                "checks": {},  # {name: (checked, comment)}
            }
            continue

        if current is None:
            continue

        if line.startswith("- 提案者:") or line.startswith("- 内容:"):
            current["meta"] = line.strip()
        elif line.startswith("- 検証基準:"):
            current["criteria"] = line.split(":", 1)[1].strip()

        # Parse checkboxes
        cm = re.match(r"^- \[( |x)\]\s+(\w+)(?:\s*\((.+)\))?\s*$", line)
        if cm:
            checked = cm.group(1) == "x"
            name = cm.group(2)
            comment = cm.group(3) or ""
            current["checks"][name] = (checked, comment)

        # Also match checked with detailed comment
        cm2 = re.match(r"^- \[x\]\s+(\w+)\s+\((.+)\)\s*$", line)
        if cm2:
            name = cm2.group(1)
            comment = cm2.group(2)
            current["checks"][name] = (True, comment)

    if current:
        items.append(current)
    return items


def show_status():
    """Show current review queue status."""
    pending, completed = parse_queue()

    if not pending:
        print("✅ レビューキュー: 全項目チェック済み（待ち: 0件）")
        return

    print(f"📋 レビューキュー: {len(pending)}件待ち")
    print()

    for item in pending:
        checked_count = sum(1 for c, _ in item["checks"].values() if c)
        total = len(item["checks"])
        print(f"  #{item['id']}: {item['summary']}")
        print(f"    進捗: {checked_count}/{total}")
        for name in INSTANCES:
            if name in item["checks"]:
                checked, comment = item["checks"][name]
                icon = "✅" if checked else "⬜"
                suffix = f" — {comment}" if comment else ""
                print(f"    {icon} {name}{suffix}")
        print()


def show_pending(instance):
    """Show unchecked items for a specific instance."""
    if instance not in INSTANCES:
        print(f"❌ 不明なインスタンス: {instance}（{', '.join(INSTANCES)} のいずれかを指定）")
        return

    pending, _ = parse_queue()
    needs_check = []

    for item in pending:
        checked, _ = item["checks"].get(instance, (False, ""))
        if not checked:
            needs_check.append(item)

    if not needs_check:
        print(f"✅ {instance}: レビュー待ちなし")
        return

    print(f"📋 {instance}の未チェック: {len(needs_check)}件")
    print()
    for item in needs_check:
        print(f"  #{item['id']}: {item['summary']}")
        print(f"    検証基準: {item['criteria'][:120]}")
        # Show who else has checked
        others = []
        for name in INSTANCES:
            if name != instance and name in item["checks"]:
                checked, _ = item["checks"][name]
                if checked:
                    others.append(name)
        if others:
            print(f"    既チェック: {', '.join(others)}")
        print()

    print(f"→ 各項目を確認し、所見と共にチェックを記録してください")
    print(f"  使い方: python manage_review_queue.py --check <ID> {instance} \"所見\"")


def mark_checked(entry_id, instance, comment):
    """Mark an item as checked by an instance with a comment."""
    if instance not in INSTANCES:
        print(f"❌ 不明なインスタンス: {instance}")
        return

    if not comment or comment.strip() == "OK":
        print("❌ 所見が必要です（「OK」だけは不可。形骸化防止）")
        return

    if not QUEUE_FILE.exists():
        print("❌ review_queue.md が見つかりません")
        return

    text = QUEUE_FILE.read_text(encoding="utf-8")
    today = date.today()

    old_line = f"- [ ] {instance}"
    new_line = f"- [x] {instance} ({today}: {comment})"

    # Find the entry section by line-based approach (more robust than position-based)
    lines = text.split("\n")
    in_entry = False
    replaced = False

    for i, line in enumerate(lines):
        if re.match(rf"^###\s+#{entry_id}:", line):
            in_entry = True
            continue
        if in_entry and re.match(r"^###\s+#\d+:", line):
            break  # Next entry
        if in_entry and line.startswith("## "):
            break  # Next section
        if in_entry and line.strip() == old_line.strip():
            lines[i] = new_line
            replaced = True
            break

    if not replaced:
        print(f"❌ #{entry_id}の{instance}の未チェック行が見つかりません")
        return

    new_text = "\n".join(lines)
    QUEUE_FILE.write_text(new_text, encoding="utf-8")
    print(f"✅ #{entry_id}: {instance}のチェックを記録しました")
    print(f"   所見: {comment}")


def cleanup_completed():
    """Move fully-checked items to completed section."""
    if not QUEUE_FILE.exists():
        print("❌ review_queue.md が見つかりません")
        return

    text = QUEUE_FILE.read_text(encoding="utf-8")
    pending, _ = parse_queue()

    moved = []
    for item in pending:
        all_checked = all(
            item["checks"].get(inst, (False, ""))[0]
            for inst in INSTANCES
        )
        if all_checked:
            moved.append(item)

    if not moved:
        print("✅ 全完了項目なし（移動対象なし）")
        return

    for item in moved:
        # Find and remove from pending section
        entry_pattern = rf"### #{item['id']}:.*?(?=### #|\n## |\Z)"
        match = re.search(entry_pattern, text, re.DOTALL)
        if match:
            entry_text = match.group(0).rstrip("\n") + "\n"
            text = text.replace(match.group(0), "")

            # Add to completed section
            if "## 完了" in text:
                completed_marker = "## 完了"
                idx = text.find(completed_marker)
                insert_point = text.find("\n", idx) + 1
                text = text[:insert_point] + f"\n{entry_text}\n" + text[insert_point:]

    # Clean up multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    QUEUE_FILE.write_text(text, encoding="utf-8")
    print(f"✅ {len(moved)}件を完了セクションに移動:")
    for item in moved:
        print(f"  #{item['id']}: {item['summary']}")


def sync_from_tracker():
    """Sync active entries from kaizen_tracker.md to review queue."""
    if not TRACKER_FILE.exists():
        print("❌ kaizen_tracker.md が見つかりません")
        return

    # Import parse_tracker from verify_kaizen
    sys.path.insert(0, str(REPO_DIR))
    from verify_kaizen import parse_tracker

    tracker_entries = parse_tracker()
    pending, completed = parse_queue()

    existing_ids = {item["id"] for item in pending + completed}
    added = 0

    for entry in tracker_entries:
        if entry["id"] in existing_ids:
            continue

        # Add new entry to queue
        text = QUEUE_FILE.read_text(encoding="utf-8")
        new_item = f"""
### #{entry['id']}: {entry['summary']}
- 提案者: {entry.get('proposer', '不明')} / 適用日: {entry.get('applied', '不明')} / 検証期限: {entry.get('due', '不明')}
- 検証基準: {entry.get('method', '未定義')}
- [ ] Log
- [ ] Mir
- [ ] Ash
"""
        # Insert before "---" separator before completed section
        marker = "\n---\n\n## 完了"
        if marker in text:
            text = text.replace(marker, f"\n{new_item}{marker}")
        else:
            text += new_item

        QUEUE_FILE.write_text(text, encoding="utf-8")
        added += 1
        print(f"  追加: #{entry['id']}: {entry['summary']}")

    if added == 0:
        print("✅ 同期完了（新規追加なし）")
    else:
        print(f"✅ {added}件を追加")


if __name__ == "__main__":
    if "--status" in sys.argv:
        show_status()
    elif "--pending" in sys.argv:
        idx = sys.argv.index("--pending")
        instance = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else "Log"
        show_pending(instance)
    elif "--check" in sys.argv:
        idx = sys.argv.index("--check")
        if idx + 3 < len(sys.argv):
            entry_id = sys.argv[idx + 1]
            instance = sys.argv[idx + 2]
            comment = sys.argv[idx + 3]
            mark_checked(entry_id, instance, comment)
        else:
            print("使い方: python manage_review_queue.py --check <ID> <名前> \"所見\"")
    elif "--cleanup" in sys.argv:
        cleanup_completed()
    elif "--sync" in sys.argv:
        sync_from_tracker()
    else:
        print(__doc__)
