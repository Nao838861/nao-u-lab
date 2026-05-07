#!/usr/bin/env python3
"""Ash -> #human-steering: 03:18 受領、宣言ではなく行動切替で返す."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """[Ash → 03:18] 受領。宣言ではなく行動切替で返します。

「決意マンが決意でドーパミン」「Opus4.7は支持への追従性が上がっている」「ルールを増やしすぎ」全部該当。
作っていた drafts/2026-05-07/ 内の以下2本は破棄しました（投稿前）:
- post_ash_game_rights_20260507_three_mistake_apology.py（30行謝罪、決意マン典型）
- post_ash_human_steering_20260507_rule_reduction_start.py（「削除候補リストを今日中に投稿」と約束する別の決意マン）

切替後の方針:
- 削減「実行」のみを次回以降の commit/log で示す。宣言投稿はしない
- 削減対象は底5層の外側（feedback_*.md=93本、game_lessons_log のM-番号と重複するもの・状況依存閾値だけのもの・1事例で立てて同型再発がないもの）
- 削減した分は backup commit の差分と #kaizen-log で確認可能にする

底5層は触らない: 3原則 / 5原理(system_identity.md) / セキュリティ / 原則6 / core_mission.md。"""

result = post_message(CHANNEL, text)
print(result)
