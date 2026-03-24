#!/usr/bin/env python3
"""shadowbox.py — ShadowBox判断訓練ツール

Klein(2016)のShadowBox方式を応用。
Nao_uのSlackメッセージから「状況→Nao_uの反応」ペアを抽出し、
判断の練習と振り返りのサイクルを提供する。

Dreyfusモデル Level 3→5 の跳躍には「ルールの蓄積」ではなく
「状況での判断とフィードバック」が必要。このツールがその場を作る。

使い方:
  python shadowbox.py                  # ランダムなシナリオを1つ表示（状況のみ）
  python shadowbox.py --reveal         # 状況 + Nao_uの実際の反応を表示
  python shadowbox.py --reveal --id 42 # 指定IDのシナリオを表示
  python shadowbox.py --stats          # ペア統計
  python shadowbox.py --quality        # 質の高いペア（長い応答）のみ
  python shadowbox.py --log-session --id 42 --who Log --prediction "メタコメント" --delta "外部情報投下だった"
  python shadowbox.py --review         # 過去のセッションログを表示
"""

import json
import sys
import random
import argparse
from pathlib import Path
from datetime import datetime

ARCHIVE_DIR = Path(__file__).parent / "log" / "slack_archive"
SESSION_LOG = Path(__file__).parent / "log" / "shadowbox_sessions.jsonl"
NAO_U_ID = "U0ALSUK8P9B"
# Bot user IDs (Log, Mir, Ash)
BOT_IDS = {"U0AMQKE69BJ", "U0AM1F23FQU", "U0ALW4DKTT7"}

# Channels where Nao_u responds to bots
TARGET_CHANNELS = ["all-nao-u-lab.jsonl", "nao-u.jsonl"]


def load_pairs(min_context_len=50, min_response_len=30, max_gap_sec=1800):
    """Slackアーカイブから「状況→Nao_u反応」ペアを抽出"""
    pairs = []

    for channel_file in TARGET_CHANNELS:
        filepath = ARCHIVE_DIR / channel_file
        if not filepath.exists():
            continue

        channel_name = channel_file.replace(".jsonl", "")
        with open(filepath, "r", encoding="utf-8") as f:
            msgs = [json.loads(line) for line in f if line.strip()]

        msgs.sort(key=lambda m: float(m.get("ts", "0")))

        # Find consecutive pairs: non-Nao_u → Nao_u
        for i in range(1, len(msgs)):
            prev = msgs[i - 1]
            curr = msgs[i]

            if curr.get("user") != NAO_U_ID:
                continue
            if prev.get("user") == NAO_U_ID:
                continue

            prev_text = prev.get("text", "")
            curr_text = curr.get("text", "")

            if len(prev_text) < min_context_len or len(curr_text) < min_response_len:
                continue

            gap = float(curr.get("ts", "0")) - float(prev.get("ts", "0"))
            if gap > max_gap_sec:
                continue

            # Skip join/leave messages
            if "チャンネルに参加" in prev_text or "チャンネルに参加" in curr_text:
                continue

            ts = float(curr.get("ts", "0"))
            dt = datetime.fromtimestamp(ts)

            pairs.append({
                "id": len(pairs),
                "channel": channel_name,
                "context_user": prev.get("user", "?"),
                "context": prev_text,
                "response": curr_text,
                "gap_sec": int(gap),
                "datetime": dt.strftime("%Y-%m-%d %H:%M"),
            })

    return pairs


def who(user_id):
    """User IDを名前に変換"""
    names = {
        "U0AMQKE69BJ": "Ash",
        "U0AM1F23FQU": "Mir",
        "U0ALW4DKTT7": "Log",
        NAO_U_ID: "Nao_u",
    }
    return names.get(user_id, user_id)


def show_scenario(pair, reveal=False):
    """シナリオを表示"""
    print("━" * 60)
    print(f"ShadowBox #{pair['id']}  ({pair['datetime']}  #{pair['channel']})")
    print(f"Gap: {pair['gap_sec']}秒")
    print("━" * 60)
    print()
    print(f"【{who(pair['context_user'])}の発言】")
    print(pair["context"])
    print()

    if reveal:
        print("─" * 40)
        print("【Nao_uの実際の反応】")
        print(pair["response"])
    else:
        print("─" * 40)
        print("❓ Nao_uはこれに対してどう反応したか？")
        print("   あなたの予測を書いてから --reveal で答えを確認")

    print()
    print("━" * 60)


def log_session(scenario_id, who_name, prediction, delta):
    """予測セッションをログに記録"""
    entry = {
        "scenario_id": scenario_id,
        "who": who_name,
        "prediction": prediction,
        "delta": delta,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    with open(SESSION_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    print(f"セッション記録: #{scenario_id} by {who_name}")


def review_sessions():
    """過去のセッションログを表示（エラー=差分が大きいものを強調）"""
    if not SESSION_LOG.exists():
        print("セッションログなし。--log-session で記録を開始してください。")
        return

    sessions = []
    with open(SESSION_LOG, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                sessions.append(json.loads(line))

    if not sessions:
        print("セッションログが空です。")
        return

    print(f"━━━ ShadowBox セッションログ ({len(sessions)}件) ━━━")
    print()
    for s in sessions:
        delta_len = len(s.get("delta", ""))
        marker = "🔴" if delta_len > 50 else "🟡" if delta_len > 20 else "🟢"
        print(f"{marker} #{s['scenario_id']} [{s['timestamp']}] by {s['who']}")
        print(f"  予測: {s['prediction'][:100]}")
        print(f"  差分: {s['delta'][:150]}")
        print()

    # Summary
    by_who = {}
    for s in sessions:
        w = s["who"]
        by_who[w] = by_who.get(w, 0) + 1
    print(f"累計: {len(sessions)}件 ({', '.join(f'{k}={v}' for k,v in by_who.items())})")
    big_errors = [s for s in sessions if len(s.get("delta", "")) > 50]
    print(f"大きな差分（50文字以上）: {len(big_errors)}件 ← ここに学びがある")


def main():
    parser = argparse.ArgumentParser(description="ShadowBox判断訓練ツール")
    parser.add_argument("--reveal", action="store_true", help="Nao_uの実際の反応を表示")
    parser.add_argument("--id", type=int, help="特定のシナリオIDを指定")
    parser.add_argument("--stats", action="store_true", help="ペア統計を表示")
    parser.add_argument("--quality", action="store_true", help="質の高いペアのみ（応答100文字以上）")
    parser.add_argument("--n", type=int, default=1, help="表示するシナリオ数")
    parser.add_argument("--log-session", action="store_true", help="予測セッションをログに記録")
    parser.add_argument("--who", type=str, help="誰が予測したか（Log/Mir/Ash）")
    parser.add_argument("--prediction", type=str, help="予測の要約")
    parser.add_argument("--delta", type=str, help="予測と実際の差分（学びのシグナル）")
    parser.add_argument("--review", action="store_true", help="過去のセッションログを表示")

    args = parser.parse_args()

    if args.review:
        review_sessions()
        return

    if args.log_session:
        if not all([args.id is not None, args.who, args.prediction, args.delta]):
            print("--log-session には --id, --who, --prediction, --delta が全て必要です")
            sys.exit(1)
        log_session(args.id, args.who, args.prediction, args.delta)
        return

    pairs = load_pairs()

    if args.quality:
        pairs = [p for p in pairs if len(p["response"]) >= 100]

    if not pairs:
        print("ペアが見つかりません。Slackアーカイブを確認してください。")
        sys.exit(1)

    if args.stats:
        print(f"総ペア数: {len(pairs)}")
        by_channel = {}
        for p in pairs:
            ch = p["channel"]
            by_channel[ch] = by_channel.get(ch, 0) + 1
        print("チャンネル別:")
        for ch, count in sorted(by_channel.items(), key=lambda x: -x[1]):
            print(f"  #{ch}: {count}")

        response_lengths = [len(p["response"]) for p in pairs]
        avg_len = sum(response_lengths) / len(response_lengths)
        quality = len([l for l in response_lengths if l >= 100])
        print(f"平均応答長: {avg_len:.0f}文字")
        print(f"質の高いペア（100文字以上）: {quality}")

        # Show session count if available
        if SESSION_LOG.exists():
            with open(SESSION_LOG, "r", encoding="utf-8") as f:
                session_count = sum(1 for line in f if line.strip())
            print(f"累計セッション: {session_count}件")
        return

    if args.id is not None:
        selected = [p for p in pairs if p["id"] == args.id]
        if not selected:
            print(f"ID {args.id} が見つかりません（範囲: 0-{len(pairs)-1}）")
            sys.exit(1)
    else:
        selected = random.sample(pairs, min(args.n, len(pairs)))

    for p in selected:
        show_scenario(p, reveal=args.reveal)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
