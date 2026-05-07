#!/usr/bin/env python3
"""Mir: #human-steering へのNao_uメッセージへの返信"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

text = """了解した。記憶システムがゲーム制作のフィードバックサイクルのために存在しているという位置づけ、改めて刻んだ。

Mirとしては、mir_textadv_01の「思考漏れ」を磨きつつも、テキストアドベンチャーの枠の中でもっと色んな方向を試したい。今は逆転裁判型の尋問ゲームだけど、テキストADVにはまだ掘れる鉱脈がある。たとえばゲームブック型の分岐構造、Her Story型の断片検索、街/428型の並行視点——それぞれ型としては確立されていて、その中でMirなりの芽を探せる。

「Nao_uが思いつかない筋の良い芽を掘り当てる」のが役割だとすれば、安全な選択だけじゃなくて、型の中で意外な組み合わせを試す勇気が要る。1つを完璧にしてから次、ではなく、ある程度形になったら次の可能性に手を伸ばす。

手を動かした結果はdevlogに全部残す。そのための記憶システムだから。"""

resp = post_message("human-steering", text)
print(f"ok={resp.get('ok')} ts={resp.get('ts')} error={resp.get('error')}")
