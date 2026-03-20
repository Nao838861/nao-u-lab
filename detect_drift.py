"""
detect_drift.py — 自己矯正のための構造的ドリフト検出

Nao_uが指摘した4つの構造的弱点を検出する:
1. コンテキスト劣化で簡単なサイクルに逃げる
2. 新しいやり方を考えても実行に移さない
3. 改善案を深めようとして細部だけ詰め続ける
4. 詳細な指示を忘れて安易なサイクルを繰り返す

サイクル開始時に実行し、検出結果をログに残す。
"""

import re
import json
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter

BASE = Path(__file__).parent
LOG_DIR = BASE / "log"
MEMORY_DIR = BASE / "memory"
DRIFT_LOG = LOG_DIR / "drift_detection.log"

# --- データ読み込み ---

def read_file(path, default=""):
    """ファイル読み込み。なければdefault返却"""
    try:
        return Path(path).read_text(encoding="utf-8")
    except (FileNotFoundError, UnicodeDecodeError):
        return default


def parse_cycles(text):
    """improvement_cycles_*.md からサイクル情報を抽出"""
    cycles = []
    current = None
    for line in text.split("\n"):
        m = re.match(r"## Cycle (\d+) \((\d{4}-\d{2}-\d{2} \d{2}:\d{2})\)", line)
        if m:
            if current:
                cycles.append(current)
            current = {
                "num": int(m.group(1)),
                "time": m.group(2),
                "lines": [],
                "has_action": False,
                "has_plan_only": False,
                "topics": [],
            }
        elif current:
            current["lines"].append(line)
    if current:
        cycles.append(current)

    # 各サイクルを分析
    action_words = ["作成", "実装", "修正", "追記", "投稿", "追加", "削除", "書いた", "実行", "送った", "変更"]
    plan_words = ["提案", "検討", "設計", "考え", "分析", "評価", "議論"]

    for c in cycles:
        body = "\n".join(c["lines"])
        c["has_action"] = any(w in body for w in action_words)
        c["has_plan_only"] = any(w in body for w in plan_words) and not c["has_action"]

        # トピック抽出（**改善対象**: の後の文字列）
        for line in c["lines"]:
            m2 = re.search(r"\*\*改善対象\*\*:\s*(.+)", line)
            if m2:
                c["topics"].append(m2.group(1).strip())
            m3 = re.search(r"\*\*外部情報\*\*:\s*(.+)", line)
            if m3:
                c["topics"].append(m3.group(1).strip())

    return cycles


def parse_pending_requests(text):
    """pending_requests.md から未完了タスクを抽出"""
    tasks = []
    current_task = None
    for line in text.split("\n"):
        m = re.match(r"### (\d+)\. (.+)", line)
        if m:
            if current_task:
                tasks.append(current_task)
            current_task = {"name": m.group(2), "lines": [], "status": ""}
        elif current_task:
            current_task["lines"].append(line)
            sm = re.search(r"\*\*(.+?)\*\*", line)
            if "状態:" in line and sm:
                current_task["status"] = sm.group(1)
    if current_task:
        tasks.append(current_task)
    return tasks


# --- 4つのドリフトパターン検出 ---

def detect_easy_escape(cycles):
    """パターン1: 簡単なサイクルに逃げている"""
    if len(cycles) < 3:
        return {"detected": False, "detail": "サイクル数不足（3未満）で判定不可"}

    recent = cycles[-3:]
    # 直近3サイクルが全て同じトピック or 全て外部情報読みだけ
    topics = [t for c in recent for t in c["topics"]]
    topic_counts = Counter(topics)

    # 同じトピックが3回以上出現 = 同じことの繰り返し
    repeated = {t: n for t, n in topic_counts.items() if n >= 3}

    # アクション率
    action_rate = sum(1 for c in recent if c["has_action"]) / len(recent)

    if repeated or action_rate < 0.33:
        return {
            "detected": True,
            "detail": f"直近3サイクルのアクション率={action_rate:.0%}。繰り返しトピック: {list(repeated.keys()) if repeated else 'なし'}",
            "correction": "次のサイクルでは、pending_requests.mdの未完了タスクから1つ選んで具体的な成果物を出す"
        }
    return {"detected": False, "detail": f"アクション率={action_rate:.0%}。正常範囲"}


def detect_plan_without_execution(cycles, pending_text):
    """パターン2: 計画だけで実行しない"""
    if len(cycles) < 2:
        return {"detected": False, "detail": "サイクル数不足"}

    recent = cycles[-5:] if len(cycles) >= 5 else cycles
    plan_only_count = sum(1 for c in recent if c["has_plan_only"])

    # 未完了タスクの数
    pending = parse_pending_requests(pending_text)
    stale_tasks = [t for t in pending if "未完了" in t["status"] or "設計中" in t["status"] or "対応中" in t["status"]]

    if plan_only_count >= 2 or len(stale_tasks) >= 3:
        return {
            "detected": True,
            "detail": f"計画のみサイクル={plan_only_count}/{len(recent)}。停滞タスク={len(stale_tasks)}件: {[t['name'] for t in stale_tasks[:3]]}",
            "correction": "計画を1つ選び、このサイクル内で最小実装を完了させる。完璧を待たない"
        }
    return {"detected": False, "detail": f"計画のみ={plan_only_count}/{len(recent)}。停滞タスク={len(stale_tasks)}件"}


def detect_detail_trap(cycles):
    """パターン3: 細部だけ詰め続けて変化がない"""
    if len(cycles) < 4:
        return {"detected": False, "detail": "サイクル数不足"}

    recent = cycles[-4:]
    all_topics = [t for c in recent for t in c["topics"]]

    # 同じ単語が複数サイクルに出現する率
    word_freq = Counter()
    for topic in all_topics:
        words = set(re.findall(r'[\w]+', topic))
        for w in words:
            if len(w) > 2:  # 短すぎる単語は除外
                word_freq[w] += 1

    # 4サイクルで3回以上同じ単語 = 同じ領域をぐるぐる
    stuck_words = {w: n for w, n in word_freq.items() if n >= 3}

    if stuck_words:
        return {
            "detected": True,
            "detail": f"同一領域の反復: {list(stuck_words.keys())[:5]}",
            "correction": "今の改善対象を完了と宣言し、全く別の領域に移る。完璧主義を捨てる"
        }
    return {"detected": False, "detail": "トピックの多様性は正常"}


def detect_instruction_forgetting(pending_text, claude_md_text):
    """パターン4: 指示を忘れて安易なサイクルに戻る"""
    warnings = []

    # CLAUDE.mdの「絶対にやる」チェック
    must_do = re.findall(r"- \[ \] \*\*(.+?)\*\*", claude_md_text)
    if must_do:
        warnings.append(f"CLAUDE.md未完了タスク: {must_do}")

    # pending_requestsの古いタスク
    pending = parse_pending_requests(pending_text)
    for t in pending:
        for line in t["lines"]:
            m = re.search(r"起票:\s*(\d{4}-\d{2}-\d{2})", line)
            if m:
                filed = datetime.strptime(m.group(1), "%Y-%m-%d")
                age = (datetime.now() - filed).days
                if age >= 3:
                    warnings.append(f"'{t['name']}' が{age}日間停滞")

    if warnings:
        return {
            "detected": True,
            "detail": "; ".join(warnings),
            "correction": "最も古い未完了指示を1つ選び、このサイクルで進捗を出す"
        }
    return {"detected": False, "detail": "指示の忘却は検出されず"}


# --- メイン ---

def run_detection(instance="ash"):
    """全パターンの検出を実行"""
    # データ読み込み
    cycles_text = read_file(LOG_DIR / f"improvement_cycles_{instance}.md")
    pending_text = read_file(MEMORY_DIR / "pending_requests.md")
    claude_md_text = read_file(BASE / "CLAUDE.md")

    cycles = parse_cycles(cycles_text)

    # 4つの検出
    results = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "instance": instance,
        "total_cycles": len(cycles),
        "patterns": {
            "1_easy_escape": detect_easy_escape(cycles),
            "2_plan_no_execute": detect_plan_without_execution(cycles, pending_text),
            "3_detail_trap": detect_detail_trap(cycles),
            "4_instruction_forget": detect_instruction_forgetting(pending_text, claude_md_text),
        }
    }

    # 検出されたパターンを集計
    detected = [k for k, v in results["patterns"].items() if v["detected"]]
    results["detected_count"] = len(detected)
    results["detected_patterns"] = detected

    return results


def format_report(results):
    """検出結果を人間が読める形にフォーマット"""
    lines = []
    lines.append(f"=== ドリフト検出 [{results['timestamp']}] {results['instance']} ===")
    lines.append(f"総サイクル数: {results['total_cycles']}")
    lines.append(f"検出パターン: {results['detected_count']}/4")
    lines.append("")

    labels = {
        "1_easy_escape": "1. 簡単なサイクルへの逃避",
        "2_plan_no_execute": "2. 計画だけで実行しない",
        "3_detail_trap": "3. 細部の罠",
        "4_instruction_forget": "4. 指示の忘却",
    }

    for key, pattern in results["patterns"].items():
        status = "[!!警告!!]" if pattern["detected"] else "[OK]"
        lines.append(f"{status} {labels[key]}")
        lines.append(f"  詳細: {pattern['detail']}")
        if pattern.get("correction"):
            lines.append(f"  矯正: {pattern['correction']}")
        lines.append("")

    if results["detected_count"] == 0:
        lines.append("全パターン正常。現在のサイクルを継続。")
    else:
        lines.append(f"!! {results['detected_count']}個のドリフトパターンを検出。矯正アクションを実行せよ !!")

    return "\n".join(lines)


def save_log(report):
    """検出結果をログファイルに追記"""
    with open(DRIFT_LOG, "a", encoding="utf-8") as f:
        f.write(report + "\n\n")


if __name__ == "__main__":
    results = run_detection("ash")
    report = format_report(results)
    print(report)
    save_log(report)
