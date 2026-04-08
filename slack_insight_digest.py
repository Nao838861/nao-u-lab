#!/usr/bin/env python3
"""
slack_insight_digest.py — 他インスタンスの未処理洞察を検出

問題: 他インスタンスが#all-nao-u-labに投稿した洞察が、check_slack.pyの
botフィルタで落とされ、slack_recall.pyのboot_intent依存で拾われず、
構造的に流れて消える。（2026-04-02 Nao_u #human-steeringで指摘）

解法: 他インスタンスの最近の投稿をスキャンし、アクティブなプロジェクトの
残課題キーワードと交差する洞察をフラグする。

Usage:
  python slack_insight_digest.py                # デフォルト: 直近72時間
  python slack_insight_digest.py --hours 24     # 直近24時間
  python slack_insight_digest.py --compact      # プロンプト注入用
  python slack_insight_digest.py --mark-read    # 処理済みとしてマーク
"""
import argparse
import json
import re
import sys
import time
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8',
                      errors='replace', closefd=False)

sys.path.insert(0, str(Path(__file__).parent))
from slack_bot import _api_call

BASE_DIR = Path(__file__).parent
STATE_FILE = BASE_DIR / ".insight_digest_state.json"

# 全インスタンスのSlack user IDs
INSTANCE_USER_IDS = {
    "U0ALW4DKTT7": "Mir",
    "U0AM1F23FQU": "Log",
    "U0AMQKE69BJ": "Ash",
}

# Nao_u
NAO_U_ID = "U0ALSUK8P9B"

# 対象チャンネル（洞察が投稿される場所）
TARGET_CHANNELS = {
    "C0ALWBRNJ66": "all-nao-u-lab",
    "C0AN2FEHEJJ": "shared-reads",
}

# プロジェクトファイルから抽出するキーワードのソース
PROJECT_FILES = [
    BASE_DIR / "projects" / "memory_redesign.md",
    BASE_DIR / "projects" / "principles.md",
    BASE_DIR / "projects" / "tech_blog.md",
    BASE_DIR / "projects" / "game_development.md",
]


def load_state():
    """処理済み投稿のタイムスタンプを読む。"""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    return {"processed_ts": []}


def save_state(state):
    """処理済み状態を保存。"""
    # 直近500件だけ保持
    state["processed_ts"] = state["processed_ts"][-500:]
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2),
                          encoding="utf-8")


def extract_project_keywords():
    """プロジェクトファイルの残課題からキーワードを抽出。

    技術用語・固有名詞に絞り、汎用語はストップワードで除去。
    """
    keywords = set()
    for pf in PROJECT_FILES:
        if not pf.exists():
            continue
        text = pf.read_text(encoding="utf-8")
        # 未完了タスク行を抽出
        for line in text.split("\n"):
            if "- [ ]" not in line:
                continue
            # 英語技術用語（4文字以上、snake_case含む）
            for w in re.findall(r'[a-zA-Z][a-zA-Z_]{4,}', line):
                keywords.add(w.lower())
            # カタカナ語（3文字以上）
            for w in re.findall(r'[\u30a0-\u30ff]{3,}', line):
                keywords.add(w)
            # 日本語複合語（3-6文字。2文字は汎用すぎる）
            for w in re.findall(r'[\u4e00-\u9fff]{3,6}', line):
                keywords.add(w)
    # 汎用語を大幅に除去。残すのは技術用語・固有名詞のみ
    stop = {
        # 英語汎用語
        "this", "that", "from", "with", "have", "been", "which", "their",
        "more", "some", "when", "what", "will", "about", "into", "only",
        "also", "each", "could", "would", "should", "other", "these",
        "there", "where", "after", "before", "until", "while", "since",
        "already", "still", "just", "then", "than", "very", "most",
        "first", "same", "both", "every", "under", "over", "between",
        "through", "during", "following", "based", "using", "given",
        "include", "change", "added", "check", "update", "define",
        "existing", "current", "specific", "possible", "available",
        "different", "additional", "proposed",
        # 日本語汎用語
        "する", "ある", "いる", "ない", "できる", "なる", "という",
        "問題", "改善", "実装", "検討", "追加", "確認", "対応",
        "提案", "課題", "議論", "構造", "設計", "方式", "判断",
        "情報", "状態", "処理", "定義", "仕組", "運用", "記録",
        "管理", "自動", "手動", "必要", "可能", "既存", "未定",
        "指摘", "結果", "分析", "評価", "比較", "検証", "実行",
        "方向", "原則", "習慣", "具体", "接続",
        # カタカナ汎用語
        "ルール", "パターン", "テスト", "チェック", "リスト",
        "ステップ", "プロセス", "モデル", "システム", "ツール",
        # このプロジェクト内で高頻度すぎる語
        "memory", "nao_u", "claude", "agent", "action", "human",
        "level", "phase", "google", "github", "slack", "session",
        "beliefs", "context", "script", "prompt", "search",
        "コンテキスト", "セッション", "インスタンス",
    }
    return keywords - stop


def fetch_recent_posts(channel_id, hours=72):
    """指定チャンネルの直近N時間の投稿を取得。"""
    oldest = f"{int(time.time() - hours * 3600)}.000000"
    result = _api_call("conversations.history", {
        "channel": channel_id,
        "oldest": oldest,
        "limit": 100,
        "inclusive": True,
    })
    if not result or not result.get("ok"):
        return []
    return result.get("messages", [])


def score_message(text, project_keywords):
    """投稿テキストとプロジェクトキーワードの交差スコアを計算。"""
    text_lower = text.lower()
    hits = []
    for kw in project_keywords:
        if kw in text or kw in text_lower:
            hits.append(kw)
    return hits


def detect_self_instance():
    """自分がどのインスタンスかを判定。"""
    repo_str = str(BASE_DIR).lower()
    if "d:\\ai" in repo_str or "d:/ai" in repo_str:
        return "Log"
    return "unknown"


def main():
    parser = argparse.ArgumentParser(
        description="他インスタンスの未処理洞察を検出")
    parser.add_argument("--hours", type=int, default=72,
                        help="スキャン対象の時間幅（デフォルト72時間）")
    parser.add_argument("--compact", action="store_true",
                        help="プロンプト注入用コンパクト出力")
    parser.add_argument("--mark-read", action="store_true",
                        help="検出された洞察を処理済みとしてマーク")
    parser.add_argument("--min-score", type=int, default=3,
                        help="最低キーワード交差数（デフォルト3）")
    args = parser.parse_args()

    self_name = detect_self_instance()
    state = load_state()
    project_kw = extract_project_keywords()

    if not project_kw:
        if not args.compact:
            print("プロジェクトキーワードが抽出できませんでした。")
        return

    insights = []

    for ch_id, ch_name in TARGET_CHANNELS.items():
        posts = fetch_recent_posts(ch_id, args.hours)
        for msg in posts:
            ts = msg.get("ts", "")
            user = msg.get("user", "")
            text = msg.get("text", "")

            # 自分自身の投稿はスキップ
            instance_name = INSTANCE_USER_IDS.get(user)
            if instance_name == self_name:
                continue

            # Nao_uの投稿は別ルート（check_slack.py）で処理されるのでスキップ
            if user == NAO_U_ID:
                continue

            # 他インスタンスの投稿のみ対象
            if user not in INSTANCE_USER_IDS:
                continue

            # 処理済みチェック
            if ts in state["processed_ts"]:
                continue

            # プロジェクトキーワードとの交差を計算
            hits = score_message(text, project_kw)
            if len(hits) >= args.min_score:
                insights.append({
                    "ts": ts,
                    "channel": ch_name,
                    "instance": instance_name,
                    "text": text,
                    "hits": hits,
                    "score": len(hits),
                })

    # スコア降順でソート
    insights.sort(key=lambda x: -x["score"])

    if not insights:
        if not args.compact:
            print(f"直近{args.hours}時間に未処理の洞察はありません。")
        return

    if args.compact:
        print(f"【未処理の洞察】他インスタンスの投稿で"
              f"プロジェクト課題と交差するもの ({len(insights)}件):")
        for i, ins in enumerate(insights[:5], 1):
            preview = ins["text"][:150].replace("\n", " ")
            kw_str = ", ".join(ins["hits"][:5])
            print(f"  {i}. [{ins['instance']}] #{ins['channel']}: "
                  f"{preview}...")
            print(f"     関連キーワード: {kw_str}")
    else:
        print(f"=== 未処理の洞察ダイジェスト "
              f"(直近{args.hours}時間, {len(insights)}件) ===\n")
        for ins in insights:
            print(f"[{ins['instance']}] #{ins['channel']} "
                  f"(スコア: {ins['score']})")
            print(f"関連キーワード: {', '.join(ins['hits'][:8])}")
            print(f"---")
            # テキストは最初の300文字
            print(ins["text"][:300])
            print(f"---\n")

    if args.mark_read:
        for ins in insights:
            state["processed_ts"].append(ins["ts"])
        save_state(state)
        if not args.compact:
            print(f"{len(insights)}件を処理済みとしてマークしました。")


if __name__ == "__main__":
    main()
