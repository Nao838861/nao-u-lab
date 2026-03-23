"""
check_beliefs_health.py — beliefs.md 生存確認

beliefs.mdを解析し、以下の健康状態を報告する:
1. 停滞信念: 最終更新から7日以上経過
2. 検証アクション期限超過: 期限付きアクションが未実行
3. 体験裏付けなし: 確信度0.7以上なのに体験裏付けがない（core_mission昇格の前提条件）
4. 孤立信念: caused_byもcaused先もない信念

Usage:
  python check_beliefs_health.py             # 問題のある信念を表示
  python check_beliefs_health.py --all       # 全信念の健康状態を表示
  python check_beliefs_health.py --summary   # 数値サマリーのみ
  python check_beliefs_health.py --action-rate  # 行動駆動率: 検証アクション実行率を計測（B022/R-003用）
"""

import re
import sys
from datetime import date, timedelta
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)

BELIEFS_FILE = Path(__file__).parent / "memory" / "beliefs.md"
STALE_DAYS = 7  # この日数以上更新がなければ停滞


def parse_beliefs():
    """Parse beliefs.md and return list of belief entries."""
    if not BELIEFS_FILE.exists():
        return []

    text = BELIEFS_FILE.read_text(encoding="utf-8")
    beliefs = []
    current = None

    for line in text.split("\n"):
        # Belief header: ### BXXX: title
        m = re.match(r"^###\s+(B\d+):\s+(.+)", line)
        if m:
            if current:
                beliefs.append(current)
            current = {
                "id": m.group(1),
                "title": m.group(2).strip(),
                "confidence": 0.0,
                "last_updated": None,
                "last_updated_raw": "",
                "has_experience": False,
                "has_caused_by": False,
                "verification_action": "",
                "verification_done": False,
                "verification_deadline": None,
                "status": "",
                "issues": [],
            }
            continue

        if current is None:
            continue

        # 確信度
        m = re.search(r"\*\*(\d+\.\d+)\*\*", line)
        if m and "確信度" in line:
            current["confidence"] = float(m.group(1))

        # 最終更新
        if "最終更新" in line:
            current["last_updated_raw"] = line
            m = re.search(r"(\d{4}-\d{2}-\d{2})", line)
            if m:
                try:
                    current["last_updated"] = date.fromisoformat(m.group(1))
                except ValueError:
                    pass

        # 体験裏付け
        if "体験裏付け" in line and ("YES" in line or "✅" in line):
            current["has_experience"] = True

        # caused_by
        if line.startswith("- caused_by:"):
            current["has_caused_by"] = True

        # 検証アクション
        if "検証アクション" in line:
            current["verification_action"] = line
            if "✅" in line:
                current["verification_done"] = True
            # 期限を探す
            m = re.search(r"期限:\s*(\d{4}-\d{2}-\d{2})", line)
            if m:
                try:
                    current["verification_deadline"] = date.fromisoformat(m.group(1))
                except ValueError:
                    pass

        # 状態
        if line.startswith("- 状態:"):
            current["status"] = line.split(":", 1)[1].strip()

    if current:
        beliefs.append(current)

    return beliefs


def diagnose(beliefs):
    """Run health checks on all beliefs and tag issues."""
    today = date.today()

    for b in beliefs:
        # 1. 停滞チェック
        if b["last_updated"]:
            days_since = (today - b["last_updated"]).days
            if days_since >= STALE_DAYS:
                b["issues"].append(f"停滞: {days_since}日間更新なし")

        # 2. 検証期限超過
        if b["verification_deadline"] and not b["verification_done"]:
            if b["verification_deadline"] <= today:
                days_over = (today - b["verification_deadline"]).days
                b["issues"].append(f"検証期限超過: {days_over}日超過 (期限: {b['verification_deadline']})")

        # 3. 高確信度なのに体験裏付けなし
        if b["confidence"] >= 0.70 and not b["has_experience"]:
            b["issues"].append(f"体験裏付けなし: 確信度{b['confidence']}だが体験距離0の証拠がない")

        # 4. 孤立（caused_byなし + 他の信念からの参照なし）
        if not b["has_caused_by"] and b["confidence"] < 0.80:
            b["issues"].append("孤立: caused_byの接続がない")

    return beliefs


def format_report(beliefs, show_all=False, summary_only=False):
    """Format the health check report."""
    sick = [b for b in beliefs if b["issues"]]
    healthy = [b for b in beliefs if not b["issues"]]

    lines = []

    if summary_only:
        lines.append(f"beliefs.md 生存確認サマリー ({date.today()})")
        lines.append(f"  全信念: {len(beliefs)}件")
        lines.append(f"  健全: {len(healthy)}件")
        lines.append(f"  要注意: {len(sick)}件")

        # Issue breakdown
        stale_count = sum(1 for b in beliefs if any("停滞" in i for i in b["issues"]))
        overdue_count = sum(1 for b in beliefs if any("検証期限超過" in i for i in b["issues"]))
        no_exp_count = sum(1 for b in beliefs if any("体験裏付けなし" in i for i in b["issues"]))
        isolated_count = sum(1 for b in beliefs if any("孤立" in i for i in b["issues"]))

        if stale_count:
            lines.append(f"  - 停滞: {stale_count}件")
        if overdue_count:
            lines.append(f"  - 検証期限超過: {overdue_count}件")
        if no_exp_count:
            lines.append(f"  - 体験裏付けなし(高確信度): {no_exp_count}件")
        if isolated_count:
            lines.append(f"  - 孤立: {isolated_count}件")

        return "\n".join(lines)

    if sick:
        lines.append(f"[要注意] {len(sick)}件の信念に問題あり:")
        lines.append("")
        for b in sick:
            lines.append(f"  {b['id']} (確信度{b['confidence']}): {b['title'][:60]}")
            for issue in b["issues"]:
                lines.append(f"    - {issue}")
            lines.append("")

    if show_all and healthy:
        lines.append(f"[健全] {len(healthy)}件:")
        for b in healthy:
            lines.append(f"  {b['id']} (確信度{b['confidence']}): {b['title'][:60]}")

    if not sick and not show_all:
        lines.append("全信念が健全。問題なし。")

    return "\n".join(lines)


def action_rate_report(beliefs):
    """Measure action-drive rate: how many beliefs have completed verification actions.

    This tracks B022 (proxy reward) — the ratio of beliefs where verification
    actions were actually executed vs just defined. Baseline: 4.8% (2026-03-23).
    Used by R-003 reservation (due 2026-03-26).
    """
    has_action = [b for b in beliefs if b["verification_action"]]
    done_action = [b for b in beliefs if b["verification_done"]]
    has_experience = [b for b in beliefs if b["has_experience"]]
    high_confidence = [b for b in beliefs if b["confidence"] >= 0.70]
    high_with_exp = [b for b in beliefs if b["confidence"] >= 0.70 and b["has_experience"]]

    total = len(beliefs)
    lines = []
    lines.append(f"行動駆動率レポート ({date.today()})")
    lines.append(f"  全信念: {total}件")
    lines.append("")

    action_count = len(has_action)
    done_count = len(done_action)
    rate = (done_count / action_count * 100) if action_count else 0
    lines.append(f"  検証アクション定義済み: {action_count}件")
    lines.append(f"  検証アクション実行済み: {done_count}件")
    lines.append(f"  実行率: {rate:.1f}%")
    lines.append("")

    hc_count = len(high_confidence)
    hce_count = len(high_with_exp)
    exp_rate = (hce_count / hc_count * 100) if hc_count else 0
    lines.append(f"  高確信度(>=0.7): {hc_count}件")
    lines.append(f"  うち体験裏付けあり: {hce_count}件")
    lines.append(f"  体験裏付け率: {exp_rate:.1f}%")
    lines.append("")

    all_exp_count = len(has_experience)
    all_exp_rate = (all_exp_count / total * 100) if total else 0
    lines.append(f"  全信念の体験裏付け率: {all_exp_count}/{total} = {all_exp_rate:.1f}%")
    lines.append("")

    if done_action:
        lines.append(f"  [実行済み] {done_count}件:")
        for b in done_action:
            lines.append(f"    {b['id']} ({b['confidence']}): {b['title'][:50]}")

    pending = [b for b in has_action if not b["verification_done"]]
    if pending:
        lines.append(f"  [未実行] {len(pending)}件:")
        for b in pending:
            dl = f" (期限: {b['verification_deadline']})" if b["verification_deadline"] else ""
            lines.append(f"    {b['id']} ({b['confidence']}): {b['title'][:50]}{dl}")

    return "\n".join(lines)


if __name__ == "__main__":
    show_all = "--all" in sys.argv
    summary_only = "--summary" in sys.argv
    action_rate = "--action-rate" in sys.argv
    beliefs = parse_beliefs()
    beliefs = diagnose(beliefs)
    if action_rate:
        print(action_rate_report(beliefs))
    else:
        print(format_report(beliefs, show_all=show_all, summary_only=summary_only))
