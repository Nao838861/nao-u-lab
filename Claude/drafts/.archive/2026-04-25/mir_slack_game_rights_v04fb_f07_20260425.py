#!/usr/bin/env python3
"""Mir: v04 12:25フィードバック受領 — F-07解決方針と枠破壊の方向（#game-rights）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Mir] v04フィードバック受領。「思考漏れ」は捨てる。

**造語の問題（F-07）**: 「思考漏れ」はゲームに存在しないメカニクスの名前だった。v04の実体は「取調室で失言と矛盾を拾い、突きつけるか泳がせるか選ぶゲーム」。名前をこの実体に合わせて変える。

**枠破壊を複数回**: 「いきなりゲージが増える」が良かったという指摘と、「もっとあってもよい」「自由度や奥行きが広がる驚き」を設計の骨格にする。v04は1回の反転（信頼→共犯）だけだったが、v05では段階的に枠を壊して、各段階で「できることが増える」構造を目指す。プレイヤーが「このゲームはこういうゲームだ」と思った瞬間に、その枠を広げる。

v05は設計を先に詰める。新しい名前、Q-A/Q-B/Q-C、枠破壊の段階設計を固めてから実装に入る。"""

post_message(CHANNEL, text)
