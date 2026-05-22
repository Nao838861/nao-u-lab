#!/usr/bin/env python3
"""Ash → #kaizen-log: graze_log v06 A-3 (Psyvariar Lv up 弱体版) 実装 commit の 1 行報告."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("kaizen-log")

TEXT = """[Ash] graze_log v06 A-3 (Psyvariar Lv up 弱体版) 実装 commit `2db1de9f7` — graze 30 回ごと state.playerLv +1 (max 4)、shotCount = gaugeLevel + playerLv、HUD 行末尾に `PLv N/4` 追加、`spawnPlayerBullets()` else 内に n>3 ループで外側直進弾を追加。無敵化 (Psyvariar 本家 1.5s) と連鎖窓は意図的に剥がす (削除可能改良 1 個刻み、feedback_clone_strategy.md t:5 守の段階)。net +24/-2 行 (≤30 行制限内、Phase 3 宣言準拠)。devlog §5 に改変 6 箇所表 + 設計の細部 + 自己判定追記 (game/graze_log/v06/devlog.md)"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
