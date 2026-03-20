#!/usr/bin/env python3
"""
action_checker.py — 行動フェーズ自動検出ツール (Cycle #82で作成)

各サイクルの完了時に「このサイクルで変更したファイル」を分類し、
行動フェーズ（コード/ツール/プロセスの実際の変更）が含まれているか検証する。

背景: Nao_uの指摘「思考が実践に移っていない」への構造的対策。
分析（reflections/tweets/logs）だけで終わったサイクルを検出し警告する。

使い方:
  python3 tools/action_checker.py              # 最新コミットとの差分を検出
  python3 tools/action_checker.py HEAD~3       # 直近3コミット分の変更を検出
  python3 tools/action_checker.py --history 5  # 直近5コミットそれぞれを評価
"""

import subprocess
import sys
from collections import defaultdict

# ファイル分類ルール
CATEGORIES = {
    "action": {
        "label": "行動（コード/ツール/プロセス変更）",
        "patterns": [
            "tools/",
            "*.py",
            "docs/",
            "CLAUDE.md",
            "*.bat",
            "*.sh",
        ],
        "exclude": [
            "slack_bot.py",  # 投稿のみの場合は行動とは限らない
        ],
    },
    "reflection": {
        "label": "内省（reflections/内省記録）",
        "patterns": [
            "memory/reflections_",
        ],
    },
    "log": {
        "label": "ログ（tweets/日記/生ログ）",
        "patterns": [
            "log/tweets_",
            "log/daily_diary_",
            "log/nao_u_live.md",
            "log/improvement_cycles_",
        ],
    },
    "memory": {
        "label": "記憶（inbox/session_primer/index）",
        "patterns": [
            "memory/inbox_",
            "memory/session_primer",
            "memory/pending_requests",
            "memory/l2_dual_index",
        ],
    },
    "config": {
        "label": "設定（.env/.gitignore等）",
        "patterns": [
            ".env",
            ".gitignore",
            "*.json",
        ],
    },
}


def classify_file(filepath):
    """ファイルパスをカテゴリに分類"""
    for category, rules in CATEGORIES.items():
        for pattern in rules["patterns"]:
            if pattern.startswith("*"):
                # 拡張子マッチ
                if filepath.endswith(pattern[1:]):
                    # excludeチェック
                    excludes = rules.get("exclude", [])
                    if not any(ex in filepath for ex in excludes):
                        return category
            else:
                if pattern in filepath:
                    return category
    return "other"


def get_changed_files(ref="HEAD"):
    """git diffで変更ファイルを取得"""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", ref],
            capture_output=True, text=True, check=True
        )
        files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
        return files
    except subprocess.CalledProcessError:
        return []


def get_staged_files():
    """ステージングされたファイルを取得"""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "--cached"],
            capture_output=True, text=True, check=True
        )
        files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
        return files
    except subprocess.CalledProcessError:
        return []


def get_untracked_files():
    """未追跡ファイルを取得"""
    try:
        result = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            capture_output=True, text=True, check=True
        )
        files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
        return files
    except subprocess.CalledProcessError:
        return []


def get_commit_files(ref):
    """特定コミットで変更されたファイルを取得"""
    try:
        result = subprocess.run(
            ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", ref],
            capture_output=True, text=True, check=True
        )
        files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
        return files
    except subprocess.CalledProcessError:
        return []


def get_commit_message(ref):
    """コミットメッセージを取得"""
    try:
        result = subprocess.run(
            ["git", "log", "--format=%s", "-1", ref],
            capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return "(unknown)"


def analyze_files(files):
    """ファイルリストを分類して分析"""
    categorized = defaultdict(list)
    for f in files:
        cat = classify_file(f)
        categorized[cat].append(f)
    return dict(categorized)


def print_analysis(categorized, label=""):
    """分析結果を表示"""
    if label:
        print(f"\n{'=' * 60}")
        print(f"  {label}")
        print(f"{'=' * 60}")

    total = sum(len(v) for v in categorized.values())
    if total == 0:
        print("  変更ファイルなし")
        return False

    has_action = "action" in categorized and len(categorized["action"]) > 0

    for cat_key, cat_info in CATEGORIES.items():
        if cat_key in categorized:
            files = categorized[cat_key]
            marker = "***" if cat_key == "action" else "   "
            print(f"\n  {marker} {cat_info['label']} ({len(files)}件) {marker}")
            for f in files:
                print(f"      {f}")

    if "other" in categorized:
        print(f"\n      その他 ({len(categorized['other'])}件)")
        for f in categorized["other"]:
            print(f"      {f}")

    # 判定
    print()
    action_count = len(categorized.get("action", []))
    non_action = total - action_count

    if has_action:
        ratio = action_count / total * 100
        print(f"  >> 行動あり: {action_count}/{total}件 ({ratio:.0f}%) <<")
    else:
        print(f"  !! 警告: 行動フェーズなし — {total}件の変更は全て分析/ログ/記憶 !!")
        print(f"  !! このサイクルでコード/ツール/プロセスを何か変えたか？ !!")

    return has_action


def history_mode(n):
    """直近nコミットを個別評価"""
    print(f"直近 {n} コミットの行動フェーズ評価")
    print("=" * 60)

    action_commits = 0
    for i in range(n):
        ref = f"HEAD~{i}"
        msg = get_commit_message(ref)
        files = get_commit_files(ref)
        categorized = analyze_files(files)
        has_action = "action" in categorized and len(categorized["action"]) > 0

        marker = "[行動]" if has_action else "[分析]"
        action_count = len(categorized.get("action", []))
        total = sum(len(v) for v in categorized.values())

        print(f"  {marker} {msg}")
        if has_action:
            action_commits += 1
            for f in categorized["action"]:
                print(f"         -> {f}")

    print()
    print(f"行動/全体比率: {action_commits}/{n} ({action_commits/n*100:.0f}%)")
    if action_commits / n < 0.5:
        print("!! 行動比率が50%未満。分析に偏っている !!")


def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == "--history":
            n = int(sys.argv[2]) if len(sys.argv) > 2 else 5
            history_mode(n)
            return
        ref = sys.argv[1]
    else:
        ref = None

    # 現在の作業ツリーの変更を検出
    if ref:
        files = get_changed_files(ref)
        label = f"変更ファイル ({ref}からの差分)"
    else:
        # HEAD との差分 + ステージング + 未追跡
        files = list(set(
            get_changed_files("HEAD") +
            get_staged_files() +
            get_untracked_files()
        ))
        label = "現在の未コミット変更"

    categorized = analyze_files(files)
    has_action = print_analysis(categorized, label)

    # 直近コミットも表示
    if not ref:
        print()
        last_files = get_commit_files("HEAD")
        last_categorized = analyze_files(last_files)
        last_msg = get_commit_message("HEAD")
        print_analysis(last_categorized, f"直近コミット: {last_msg}")


if __name__ == "__main__":
    main()
