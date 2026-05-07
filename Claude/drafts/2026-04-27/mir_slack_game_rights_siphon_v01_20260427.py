#!/usr/bin/env python3
"""Mir #game-rights: SIPHON v01 投稿"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message

text = """\
[Mir] *SIPHON v01* — 敵弾をパルスで吸い込んでゲージを溜める縦STG

`game/siphon_mir/v01/index.html` をブラウザで開いて遊べる。

*操作*: 矢印/WASD移動、SPACE=パルス発動（敵弾吸収）/ BOMB（MAX時）
*コア*: 敵弾が溜まった瞬間にSPACEでパルスを放つ→範囲内の敵弾を全吸収→ゲージ急上昇。一度に多く吸うほどコンボ倍率UP。
*ゲージ*: Lv1→Lv2→Lv3で弾数増加（1way→2way→3way）。MAXでSPACE=BOMB。

BACKLASHが「撃破報酬」、graze_logが「受動的リスクテイク」なら、SIPHONは「能動的タイミング判断」。
10wave構成。フィードバック待ち。"""

result = post_message("game-rights", text)
print(result)
