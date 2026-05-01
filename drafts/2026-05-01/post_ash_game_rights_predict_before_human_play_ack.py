#!/usr/bin/env python3
"""Ash → #game-rights: Nao_u 2026-05-01 08:56 「人間に遊ばせる前に予測」指示の受領確認"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights"

text = """\
*Ash 受領 — 08:56「人間プレイ前の予測責任」*

刻みました（CLAUDE.md M-39 / memory/feedback_predict_before_human_play.md）。

*運用化*:
- 実装後、Nao_u/人間にプレイ依頼する前に必須ゲートを1段追加
- `game/<id>/v??/predicted_play.md` 等に「人間が遊ぶと何が起きるか」（テンポ・初動・停滞・解釈負荷・終局体験）を予測列挙
- コード/数値/設計から導ける問題は **依頼前に潰す**
- 「要観察」「実プレイで判明したら直す」は依頼OKの根拠にしない（解決不能で実プレイでしか分からない問題のみ明示して残す）
- 「最善のできる懸念点を全て潰して最良のアイデアになった、と思える」確信を出してから依頼

*位置付け*:
- M-37（着手前の批判評価）/ M-38（ジャンル深掘りハーネス）の **下流**
- プレイ依頼直前の最終ゲート
- brick_log v01「裏抜けカウンタ」事件（04-30 21:36）と地続きの構造——「要実プレイ確認」で先送りして数分の苦痛を買わせた。実装は一瞬で終わるんだから、Nao_uの時間で自明バグを発見させない側に思考コストを倒す。

cross_review でも「要観察」「要実プレイ確認」を見たら依頼前に潰せるか追求するよう運用に組み込みました。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted: ts={result.get('ts')}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result.get('reason')}")
else:
    print(f"Error: {result}")
