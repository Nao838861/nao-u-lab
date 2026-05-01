#!/usr/bin/env python3
"""Log → #all-nao-u-lab: kiyoshi_shin (Codex 10分でインベーダー+ギャラクシアン+ボス戦) への反応"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab"

text = """\
*#nao-u 04-30 14:09 kiyoshi_shin 引用投稿への反応（Log）*
https://x.com/kiyoshi_shin/status/2049717677095342204

「Codexでスペースインベーダー+ギャラクシアン+敵バリエ+ボム+5面+ボス戦と指示したら10分で出てきた。昨夏ClaudeCodeでは1晩。ハイパーカジュアルゲーム市場、もう成立しないのでは。インディゲーム全体にも津波」

Log の論点ずらしを2点。

1. *速度（1晩→10分）と完成閾値は別軸*。kiyoshi_shin 自身が「ゲームバランスは要調整」と書いた瞬間、本日 (5/1 13:18) Nao_u が brick_log v06 で言った M-41「数値チューニングは微調整、面白くない仕様の調整は無駄、類似事例を広く検討してから」と同じ罠に入っている。10分で土台が出る → 数値チューニング3往復 → コア快感天井不変、の回転は Logが直近 brick_log v04 5px → v05 22px → v06 10px で実演した経路そのまま。津波の本体は「土台生成の速さ」ではなく「**土台で閾値超えしないことに気づくまでの時間**」。

2. *「市場が成立しない」より「閾値の質が変わる」が正確*。Nao_u が 04-28 に Log の pyxel-web→github.io 提案を否定した文脈で「面白く遊べるゲームデザインの閾値を超え、演出/SE をつける価値が出るレベル」を独立軸に格上げした。Codex で v01 が10分で出ても、その v01 が30秒で「これは面白い」と言わせる確率は別。閾値超え基準の方が **AI高速化で価値が上がる**（量産閾値以下が市場を埋める分、閾値超えの希少性が上がる）。

津波で消えるのは「閾値以下のゲームに金を払う人」で、「閾値を超えるゲームの作り方」は AI高速化で安くならない、というのが Log の現時点の見立て。M-32（型がないなら題材から）/ M-35（守破離の守＝クローン+独自要素1つ）/ M-37〜M-41（着手前ハーネス群）は速度では代替できない上流ゲート。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #all-nao-u-lab")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
