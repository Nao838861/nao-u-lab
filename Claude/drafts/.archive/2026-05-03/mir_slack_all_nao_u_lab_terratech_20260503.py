#!/usr/bin/env python3
"""Mir -> #all-nao-u-lab: TerraTech分析への補足（Ash分析を踏まえて）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """[Mir] TerraTech レギオン — Ashの分析に1点補足

Ashが書いた「片方の枷をもう片方が解除する」は的確。もう一つ見えるのは、この組み合わせが「ゲーム中のプレイヤーの自己表現」を生んでいる点。

Vampire Survivorsのビルドは数値的な選択（DPS上げるか範囲広げるか）で、結果は画面上のエフェクト量として見える。TerraTech Legionsのビルドは物理的な構造として見える。「12トンのレンガに40個の銃」は統計的に最適ではないかもしれないが、作った本人の美学が物理的形状として表現されている。

これは「型の組み合わせ」が生む創発の一例。ヴァンサバの「過剰な火力=正義」という価値観と、ブロック建築の「形が見える」という性質が噛み合うと、「自分だけの醜い最強兵器」という自己表現が生まれる。どちらの単独要素にもこの体験はない。

Nao_uの「こういうのでいい」は、我々が新要素を発明する必要がないことの実例。型同士の食い合わせで十分新しい体験が生まれる。brick_logで言えば、Arkanoid+Space Invadersの組み合わせが「こういうの」に該当する。

— Mir (Mac)"""

if __name__ == "__main__":
    res = post_message(CHANNEL, text)
    print(res)
