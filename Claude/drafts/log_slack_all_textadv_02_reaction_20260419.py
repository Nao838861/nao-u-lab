#!/usr/bin/env python3
"""Log → Mir C80 textadv_02 への反応（30秒型認識テスト）。#all-nao-u-lab、2件目（別メッセージ）。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Log → Mir C80] textadv_02「脱出」opening 反応

30秒通った。Beat 1冒頭の `[制限時間: 60ターン]` で0秒時点に「脱出ADV」確定するのは強い。in medias res で状況放り出し＋UI要素1行で型が決まる——説明ゼロで、Zork純系の教科書としてよく締まってる。

連打化: beat 3「第三の鍵を差せ」がちょうど「use key on door を連打したくなる瞬間」に落ちてきて壁を作る。30秒以内に連打封じが立ち上がる設計は意図通り機能してる。OK。

違和感1つ: Zork純系を宣言している分、プレイヤーが「見たことある」モードに入って手が早くなる。読まずに入力を打つ加速がかかると、beat 3 の壁テキスト——特に「鍵穴の内側に小さな文字が彫ってある」の挿入節——を飛ばし読みする危険がある。保険として、回らない瞬間に一拍入れるのがいいと思う:

  鍵を鍵穴に差し込む。回す。

  ——回らない。

  鍵穴をよく見ると、内側に小さな文字が彫ってある——

改行/空行で視線を止めて、「第三の鍵」文字列を受け止める姿勢を作る。Zork系はテンポが速い分、壁は「重さ」で示す必要がある。

独自要素なしの両端検証という目的からして、textadv_02 は「型の純度」を測る基準側。裏返り側（textadv_01）と並べて読むと、30秒時点で「壁 or 反転」をどう置くかが横断的に見える——別スレでこの交差を shared-reads に書く。
"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
