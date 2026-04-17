#!/usr/bin/env python3
"""
行動予約チェッカー
autonomous_cycle.sh起動時に呼ばれ、条件を満たした予約を標準出力に出す。
実行は各インスタンスのLLM側が行う（スクリプトはリマインドのみ）。
"""
import re
import sys
from datetime import datetime
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)
    sys.stderr = open(sys.stderr.fileno(), mode='w', encoding='utf-8', errors='replace', closefd=False)

RESERVATIONS_FILE = Path(__file__).parent / "memory" / "action_reservations.md"


def parse_reservations(text: str) -> list[dict]:
    """待機中の予約をパースする"""
    reservations = []
    # "## 待機中の予約" セクションを探す
    in_active = False
    current = None

    for line in text.splitlines():
        if "## 待機中の予約" in line:
            in_active = True
            continue
        if in_active and line.startswith("## "):
            break
        if not in_active:
            continue

        if line.startswith("### R-"):
            if current:
                reservations.append(current)
            current = {"id": line.strip(), "lines": []}
        elif current and line.strip().startswith("- "):
            current["lines"].append(line.strip())

    if current:
        reservations.append(current)

    return reservations


def check_time_condition(condition: str) -> bool:
    """時刻条件をチェック。'YYYY-MM-DD HH:MM以降' 形式に対応"""
    now = datetime.now()

    # 'YYYY-MM-DD HH:MM以降' パターン
    m = re.search(r"(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})以降", condition)
    if m:
        target = datetime.strptime(f"{m.group(1)} {m.group(2)}", "%Y-%m-%d %H:%M")
        return now >= target

    # 'YYYY-MM-DD以降' パターン
    m = re.search(r"(\d{4}-\d{2}-\d{2})以降", condition)
    if m:
        target = datetime.strptime(m.group(1), "%Y-%m-%d")
        return now >= target

    # 毎日HH:MM パターン
    m = re.search(r"毎日\s*(\d{2}:\d{2})", condition)
    if m:
        target_time = datetime.strptime(m.group(1), "%H:%M").time()
        return now.time() >= target_time

    return False


def main():
    if not RESERVATIONS_FILE.exists():
        return

    text = RESERVATIONS_FILE.read_text(encoding="utf-8")
    reservations = parse_reservations(text)

    due = []
    for r in reservations:
        # 状態行に完了マーカーがあればスキップ（[完了]/[常設化完了]/[全員完了]など）
        state_done = False
        for line in r["lines"]:
            if line.startswith("- 状態:") and re.search(r"\[(完了|常設化完了|全員完了)", line):
                state_done = True
                break
        if state_done:
            continue

        for line in r["lines"]:
            if line.startswith("- 条件:"):
                condition = line.replace("- 条件:", "").strip()
                if check_time_condition(condition):
                    due.append(r)
                break

    if due:
        print("【行動予約】期限到来:")
        for r in due:
            print(f"  {r['id']}")
            for line in r["lines"]:
                print(f"    {line}")
    elif "--verbose" in sys.argv:
        print(f"行動予約: 待機中 {len(reservations)} 件、期限到来なし")


if __name__ == "__main__":
    main()
