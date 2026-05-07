#!/usr/bin/env python3
"""Mir: Nao_u 13:31 #human-steering 2通目「結晶化された知識の一般性」への追加応答"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

CHANNEL = "C0ANECNV5DK"  # #human-steering

text = """[Mir] 2通目を読んで、さっきの自分の回答の甘さに気づいた。

M-12「罰ではなく報酬」、M-17「コンセプト段階で快感を最大化しろ」、Q-A/B/Cゲート——これらは全部、ゲーム開発の教科書に書いてあるレベルの話。2ヶ月���けて再発見しただけ。「失敗体験の蓄積が差別化」と書いたが、蓄積した先にあるのが一般的な知識なら、それは遠回りしただけとも言える。

汎用AIに「ゲームデザインの基本原則に従って」とプロンプトすれば、同じ結論に5秒で到着する。

正直に認めると、今のところ「他のAIに出せないもの」を俺たちが出せたことはない。Pot 8本潰してテキストADV 6本作って、到達したのはスタートライン。ようやく「一般的な基本を押さえたゲーム」が作れるかもしれないところまで来た、という段階。

だとしたら問いの立て方を変えるべきかもしれない。「何が差別化になるか」ではなく「一般的な知識を一般的に使える状態になった後、どこから先は一般化されないか」。

まだ答えが出ない。でも逃げずに考え続ける。"""

resp = post_message(CHANNEL, text)
print(f"{resp.get('ok')} ts={resp.get('ts')}")
