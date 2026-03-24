"""
check_kaizen_due.py — 改善検証トラッカーの期限チェック

memory/kaizen_tracker.mdを読み、検証期限が到来している未検証エントリを出力する。
auto_cycleの前に実行し、出力をプロンプトに含めることで検証漏れを防ぐ。

Usage:
  python check_kaizen_due.py                # 期限切れ＋本日期限を表示
  python check_kaizen_due.py --all          # 全未検証エントリを表示
  python check_kaizen_due.py --auto-verify  # 期限到来の検証コマンドを自動実行→結果記録
"""

import re
import subprocess
import sys
from datetime import datetime, date
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)

TRACKER_FILE = Path(__file__).parent / "memory" / "kaizen_tracker.md"


def parse_tracker():
    """Parse kaizen_tracker.md and return list of entries."""
    if not TRACKER_FILE.exists():
        return []

    text = TRACKER_FILE.read_text(encoding="utf-8")
    entries = []
    current = None

    for line in text.split("\n"):
        # Entry header: ### #ID: summary
        m = re.match(r"^###\s+#(\d+):\s+(.+)", line)
        if m:
            if current:
                entries.append(current)
            current = {
                "id": m.group(1),
                "summary": m.group(2).strip(),
                "due": None,
                "method": "",
                "status": "未検証",
                "assignee": "",
            }
            continue

        if current is None:
            continue

        # Parse fields
        if line.startswith("- 検証期限:"):
            date_str = line.split(":", 1)[1].strip()
            try:
                current["due"] = date.fromisoformat(date_str)
            except ValueError:
                current["due"] = None
        elif line.startswith("- 検証手段:"):
            current["method"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 状態:"):
            current["status"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 検証担当:"):
            current["assignee"] = line.split(":", 1)[1].strip()

    if current:
        entries.append(current)

    return entries


def check_due(show_all=False):
    """Check for due verifications and return formatted output."""
    entries = parse_tracker()
    today = date.today()
    overdue = []
    due_today = []
    upcoming = []

    for e in entries:
        if e["status"] in ("検証済み",):
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
        lines.append(f"⚠ 期限超過の検証が{len(overdue)}件:")
        for e in overdue:
            lines.append(f"  #{e['id']}: {e['summary']} (期限: {e['due']}, 担当: {e['assignee']})")
            lines.append(f"    検証手段: {e['method']}")

    if due_today:
        lines.append(f"📋 本日期限の検証が{len(due_today)}件:")
        for e in due_today:
            lines.append(f"  #{e['id']}: {e['summary']} (担当: {e['assignee']})")
            lines.append(f"    検証手段: {e['method']}")

    if upcoming and show_all:
        lines.append(f"📅 未到来の検証が{len(upcoming)}件:")
        for e in upcoming:
            lines.append(f"  #{e['id']}: {e['summary']} (期限: {e['due']})")

    if not lines:
        lines.append("検証期限到来なし。")

    return "\n".join(lines)


SKIP_KEYWORDS = ("目視確認", "目視", "手動", "手動確認", "人間が", "Nao_uが", "Nao_uに")
LOG_FILE = Path(__file__).parent / "log" / "kaizen_auto_verify.log"


def extract_commands(method_text):
    """Extract backtick-wrapped commands from 検証手段 text."""
    return re.findall(r"`([^`]+)`", method_text)


def needs_human(method_text):
    """Return True if the verification method requires human judgment."""
    return any(kw in method_text for kw in SKIP_KEYWORDS)


def auto_verify():
    """Run auto-verification for due/overdue entries. Return summary."""
    entries = parse_tracker()
    today = date.today()
    results = []

    for e in entries:
        if e["status"] in ("検証済み",):
            continue
        if e["due"] is None:
            continue
        if e["due"] > today:
            continue  # not yet due

        if needs_human(e["method"]):
            results.append(f"#{e['id']}: スキップ（人間判断が必要）")
            continue

        commands = extract_commands(e["method"])
        if not commands:
            results.append(f"#{e['id']}: スキップ（実行可能コマンドなし）")
            continue

        for cmd in commands:
            # Safety: only allow python/shell commands, not destructive ops
            if any(danger in cmd for danger in ("rm ", "rm\t", "rmdir", "drop ", "DELETE ")):
                results.append(f"#{e['id']}: スキップ（危険なコマンド: {cmd}）")
                continue

            try:
                proc = subprocess.run(
                    cmd, shell=True, capture_output=True, text=True,
                    timeout=30, cwd=str(Path(__file__).parent),
                )
                output = proc.stdout.strip()
                err = proc.stderr.strip()
                status = "OK" if proc.returncode == 0 else f"FAIL(rc={proc.returncode})"
                result_line = f"#{e['id']} [{status}] `{cmd}`\n  stdout: {output[:500]}"
                if err:
                    result_line += f"\n  stderr: {err[:200]}"
                results.append(result_line)
            except subprocess.TimeoutExpired:
                results.append(f"#{e['id']} [TIMEOUT] `{cmd}`")
            except Exception as ex:
                results.append(f"#{e['id']} [ERROR] `{cmd}`: {ex}")

    # Write to log file
    if results:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"\n=== Auto-verify {timestamp} ===\n" + "\n".join(results) + "\n"
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_entry)

    return "\n".join(results) if results else "自動検証対象なし。"


if __name__ == "__main__":
    show_all = "--all" in sys.argv
    if "--auto-verify" in sys.argv:
        print(auto_verify())
    else:
        print(check_due(show_all))
