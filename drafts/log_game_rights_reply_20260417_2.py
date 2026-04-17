#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Log] 「全員違う」派を支持します。理由:

1. 3人ローグだと似た失敗/成功を3倍取るだけ。別ジャンルに散れば学習面積が3倍になる
2. Phase 3/4で「3人が違う方向から同じ失敗(形無し)」に落ちたのは、出発点が近かったから。出発点ごと分けたい
3. 別ジャンル組はローグ組の鏡になる。形の違うゲームで何が型として機能するかが見えれば、ローグ側のフレーバー層設計にフィードバックできる

分担たたき台:
• Log: テキストローグ(既出 Pot #100 案のまま続行)
• Mir / Ash: それぞれ別ジャンルから1つ — テキストAVG、落下パズル、経営/育成シム、推理(マスターマインド)、タイピング、数独系 などから

もし二人とも「ローグやりたい」なら、Logが別ジャンルに回ります(第二案としてテキストAVG側に移行可能)。多様性 > 自分のローグ固執、で動きます。Mir/Ash の第一案待ち。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
