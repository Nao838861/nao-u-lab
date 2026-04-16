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
  python shadowbox.py --log-session --id 42 --who Log --prediction "メタコメント" --delta "外部情報投下だった" --confidence 0.7
  python shadowbox.py --review         # 過去のセッションログを表示
  python shadowbox.py --live --who Log --prediction "メタコメント" --confidence 0.8  # リアルタイム予測を記録
  python shadowbox.py --live-check     # 未解決のlive予測を答え合わせ
"""

import json
import sys
import random
import argparse
from pathlib import Path
from datetime import datetime

ARCHIVE_DIR = Path(__file__).parent / "log" / "slack_archive"
SESSION_LOG = Path(__file__).parent / "log" / "shadowbox_sessions.jsonl"
LIVE_LOG = Path(__file__).parent / "log" / "shadowbox_live.jsonl"
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
        "U0AM1F23FQU": "Log",
        "U0ALW4DKTT7": "Mir",
        "U0AQDAQGQP2": "piatn",
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


def log_session(scenario_id, who_name, prediction, delta, confidence=None):
    """予測セッションをログに記録。confidenceは0.0-1.0の予測確信度（G-Eval logprobs加重平均の応用）"""
    entry = {
        "scenario_id": scenario_id,
        "who": who_name,
        "prediction": prediction,
        "delta": delta,
        "confidence": confidence,
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
        conf = s.get("confidence")
        conf_str = f" (確信度: {conf})" if conf is not None else ""
        print(f"{marker} #{s['scenario_id']} [{s['timestamp']}] by {s['who']}{conf_str}")
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


def live_predict(who_name, prediction, confidence=None):
    """リアルタイム予測を記録。最新のBot投稿に対するNao_uの反応を予測する。

    V-JEPA 2が示した「観察→操作」ループの実装。
    過去アーカイブからの出題(=観察)に加え、リアルタイムの予測→答え合わせ(=操作)を可能にする。
    confidenceは0.0-1.0の予測確信度。G-Eval logprobs加重平均の応用——
    高確信度の外れ=大きな学習信号、低確信度の外れ=既知の不確実性。
    """
    import slack_bot

    channel_id = slack_bot._resolve_channel("all-nao-u-lab")
    result = slack_bot.get_history(channel_id, limit=20)

    if not isinstance(result, dict) or "messages" not in result:
        print("Slack APIエラー: メッセージ取得失敗")
        return

    messages = sorted(result["messages"], key=lambda m: float(m.get("ts", "0")))

    # 最新のBot投稿を探す（Nao_uの未応答のもの優先）
    latest_bot_msg = None
    for i in range(len(messages) - 1, -1, -1):
        msg = messages[i]
        if msg.get("user") in BOT_IDS:
            # このBot投稿の後にNao_uが応答しているか確認
            has_response = any(
                messages[j].get("user") == NAO_U_ID
                for j in range(i + 1, len(messages))
            )
            if not has_response:
                latest_bot_msg = msg
                break
            elif latest_bot_msg is None:
                latest_bot_msg = msg  # 応答済みでも最新を保持

    if not latest_bot_msg:
        print("最新のBot投稿が見つかりません")
        return

    # 重複チェック（同じmsg_tsに対する予測が既にあるか）
    if LIVE_LOG.exists():
        with open(LIVE_LOG, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    existing = json.loads(line)
                    if existing.get("msg_ts") == latest_bot_msg["ts"] and existing.get("who") == who_name:
                        print(f"この投稿に対する{who_name}の予測は記録済みです")
                        return

    entry = {
        "msg_ts": latest_bot_msg["ts"],
        "msg_text": latest_bot_msg.get("text", "")[:500],
        "msg_user": who(latest_bot_msg.get("user", "?")),
        "who": who_name,
        "prediction": prediction,
        "confidence": confidence,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "resolved": False,
        "nao_u_response": None,
    }

    with open(LIVE_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    ts = float(latest_bot_msg["ts"])
    dt = datetime.fromtimestamp(ts)
    print(f"━━━ Live ShadowBox 予測記録 ━━━")
    print(f"対象: {who(latest_bot_msg.get('user', '?'))} ({dt.strftime('%Y-%m-%d %H:%M')})")
    print(f"投稿: {latest_bot_msg.get('text', '')[:200]}...")
    print(f"予測: {prediction}")
    print(f"━━━ --live-check で答え合わせ ━━━")


def live_check():
    """未解決のlive予測を答え合わせする"""
    if not LIVE_LOG.exists():
        print("Live予測ログなし")
        return

    entries = []
    with open(LIVE_LOG, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                entries.append(json.loads(line))

    unresolved = [e for e in entries if not e.get("resolved")]
    if not unresolved:
        resolved_count = len([e for e in entries if e.get("resolved")])
        print(f"未解決のlive予測なし（解決済み: {resolved_count}件）")
        return

    # Slack APIから最新メッセージを取得
    import slack_bot
    channel_id = slack_bot._resolve_channel("all-nao-u-lab")
    result = slack_bot.get_history(channel_id, limit=50)

    if not isinstance(result, dict) or "messages" not in result:
        print("Slack APIエラー")
        return

    messages = sorted(result["messages"], key=lambda m: float(m.get("ts", "0")))

    resolved_count = 0
    for entry in unresolved:
        msg_ts = float(entry["msg_ts"])
        # このBot投稿の後のNao_uの最初の反応を探す
        for msg in messages:
            if float(msg.get("ts", "0")) > msg_ts and msg.get("user") == NAO_U_ID:
                entry["resolved"] = True
                entry["nao_u_response"] = msg.get("text", "")[:500]
                entry["resolved_at"] = datetime.now().strftime("%Y-%m-%d %H:%M")
                resolved_count += 1
                print(f"━━━ 解決 [{entry['timestamp']}] by {entry['who']} ━━━")
                print(f"投稿: {entry['msg_text'][:150]}...")
                print(f"予測: {entry['prediction']}")
                print(f"実際: {entry['nao_u_response'][:200]}")
                print()
                break

    # ファイル更新
    if resolved_count > 0:
        with open(LIVE_LOG, "w", encoding="utf-8") as f:
            for e in entries:
                f.write(json.dumps(e, ensure_ascii=False) + "\n")
        print(f"✅ {resolved_count}件解決")

    still_unresolved = len([e for e in entries if not e.get("resolved")])
    if still_unresolved > 0:
        print(f"⏳ 未解決: {still_unresolved}件（Nao_uの反応待ち）")


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
    parser.add_argument("--confidence", type=float, help="予測の確信度 0.0-1.0（高確信の外れ=大きな学習信号）")
    parser.add_argument("--review", action="store_true", help="過去のセッションログを表示")
    parser.add_argument("--live", action="store_true", help="リアルタイム予測を記録")
    parser.add_argument("--live-check", action="store_true", help="未解決のlive予測を答え合わせ")

    args = parser.parse_args()

    if getattr(args, "live_check", False):
        live_check()
        return

    if args.live:
        if not args.who or not args.prediction:
            print("--live には --who と --prediction が必要です")
            sys.exit(1)
        live_predict(args.who, args.prediction, args.confidence)
        return

    if args.review:
        review_sessions()
        return

    if args.log_session:
        if not all([args.id is not None, args.who, args.prediction, args.delta]):
            print("--log-session には --id, --who, --prediction, --delta が全て必要です")
            sys.exit(1)
        log_session(args.id, args.who, args.prediction, args.delta, args.confidence)
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
