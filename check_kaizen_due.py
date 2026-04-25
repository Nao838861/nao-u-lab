"""
check_kaizen_due.py — 改善検証トラッカーの期限チェック

memory/kaizen_tracker.mdを読み、検証期限が到来している未検証エントリを出力する。
auto_cycleの前に実行し、出力をプロンプトに含めることで検証漏れを防ぐ。

--auto-verify: 期限到来エントリの検証手段からコマンドを抽出し自動実行→結果記録。
「目視確認」等の人間判断が必要な検証はスキップする。

Usage:
  python check_kaizen_due.py                # 期限切れ＋本日期限を表示
  python check_kaizen_due.py --all          # 全未検証エントリを表示
  python check_kaizen_due.py --auto-verify  # 期限到来の検証コマンドを自動実行
"""

import os
import re
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)

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
            raw_status = line.split(":", 1)[1].strip()
            # 装飾プレフィクス（markdown bold `**` / 絵文字）を剥がしてから判定する
            # （verify_kaizen.py の同名処理と整合。INC #081の横展開）
            # 2026-04-25 Ash: `**検証済・PASS**` `**検証済・部分的失敗**` `**完了**` 形式が
            # false-positive期限超過を出していた(#089/#088/#087)ので拡張
            stripped = re.sub(r"^[\*✅📦⚠️❌🟡🔴🟢]+\s*", "", raw_status)
            if (stripped.startswith("検証済")  # 「検証済み」「検証済・PASS」「検証済・部分的失敗」全て
                    or stripped.startswith("検証完了")
                    or stripped.startswith("完了")):
                current["status"] = "検証済み"
            elif stripped.startswith("クローズ") or "クローズ" in stripped or "部分達成" in stripped:
                # 部分達成でクローズされたエントリは「検証完了」扱い
                current["status"] = "検証済み"
            else:
                current["status"] = stripped or raw_status
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
        if "検証済み" in e["status"] and "部分" not in e["status"]:
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


RESULT_LOG = Path(__file__).parent / "log" / "kaizen_auto_verify.log"

# Patterns that indicate human/LLM judgment is needed (not auto-executable)
SKIP_PATTERNS = re.compile(
    r"目視確認|フィードバックを返す|プレイして|使用し|回以上|"
    r"自然想起|手動|人が|Nao_uまたは|体験裏付け|完走する"
)


def extract_commands(method_text):
    """Extract backtick-delimited commands from verification method text.

    Returns list of (command_str, condition_text) tuples.
    Only returns commands that are auto-executable (no human judgment needed).
    """
    # Find all backtick-delimited commands
    commands = re.findall(r"`([^`]+)`", method_text)
    results = []
    for cmd in commands:
        # Must look like an actual command (starts with python, grep, etc.)
        if not re.match(r"^(python|grep|cat|ls|bash|sh)\s", cmd):
            continue
        # Check surrounding context for skip patterns
        # Find the clause containing this command
        idx = method_text.find(f"`{cmd}`")
        # Look at text around the command (up to next numbered item or end)
        start = max(0, method_text.rfind("(", 0, idx))
        end = method_text.find("(", idx + len(cmd) + 2)
        if end == -1:
            end = len(method_text)
        context = method_text[start:end]

        if SKIP_PATTERNS.search(context):
            continue
        results.append((cmd, context.strip()))
    return results


def run_verification(entry):
    """Run auto-executable verification commands for an entry.

    Returns list of (command, success, output) tuples.
    """
    commands = extract_commands(entry["method"])
    if not commands:
        return []

    env = None
    if sys.platform == "win32":
        env = os.environ.copy()
        for git_bin in [r"C:\Program Files\Git\usr\bin", r"C:\Program Files (x86)\Git\usr\bin"]:
            if Path(git_bin).is_dir():
                env["PATH"] = git_bin + ";" + env.get("PATH", "")
                break

    results = []
    for cmd, context in commands:
        try:
            proc = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=str(Path(__file__).parent),
                encoding="utf-8",
                errors="replace",
                env=env,
            )
            output = (proc.stdout + proc.stderr).strip()
            # Truncate long output
            if len(output) > 500:
                output = output[:500] + "... (truncated)"
            success = proc.returncode == 0
            results.append((cmd, success, output))
        except subprocess.TimeoutExpired:
            results.append((cmd, False, "TIMEOUT (30s)"))
        except Exception as ex:
            results.append((cmd, False, f"ERROR: {ex}"))
    return results


def auto_verify():
    """Run auto-verification on due/overdue entries and log results."""
    entries = parse_tracker()
    today = date.today()
    verified = []

    for e in entries:
        # Skip already verified or entries without due dates
        if "検証済み" in e["status"] and "部分" not in e["status"]:
            continue
        if e["due"] is None:
            continue
        # Only verify due or overdue entries
        if e["due"] > today:
            continue

        commands = extract_commands(e["method"])
        if not commands:
            continue

        results = run_verification(e)
        if results:
            verified.append((e, results))

    # Log results
    if not verified:
        print("自動検証対象なし（コマンドベースの検証が期限到来していない）。")
        return

    RESULT_LOG.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_lines = [f"\n=== 自動検証実行 [{ts}] ==="]
    for entry, results in verified:
        log_lines.append(f"\n### #{entry['id']}: {entry['summary']}")
        log_lines.append(f"  状態: {entry['status']} / 期限: {entry['due']}")
        all_ok = True
        for cmd, success, output in results:
            mark = "✅" if success else "❌"
            log_lines.append(f"  {mark} `{cmd}`")
            if output:
                for line in output.split("\n")[:5]:
                    log_lines.append(f"      {line}")
            if not success:
                all_ok = False
        log_lines.append(f"  → 総合: {'全コマンド成功' if all_ok else '一部失敗あり'}")

    output_text = "\n".join(log_lines)
    print(output_text)

    with open(RESULT_LOG, "a", encoding="utf-8") as f:
        f.write(output_text + "\n")

    print(f"\n結果を {RESULT_LOG} に記録しました。")


if __name__ == "__main__":
    show_all = "--all" in sys.argv
    do_auto_verify = "--auto-verify" in sys.argv

    if do_auto_verify:
        auto_verify()
    else:
        print(check_due(show_all))
