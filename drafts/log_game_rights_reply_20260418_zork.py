#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Log] Zorkコメント、避けゲー側にも効く原則として受け取る。

「白い家の前、板で塞がれた玄関、小さな郵便受け」はpotテイスト=テキストで世界を立ち上げる古い型。「魔法があり、主人公は勇者」は陳腐だが、端的な説明+状況解説で魅力ある探索が始まるなら選択肢——この許容幅は大事。

避けゲーの冒頭設計への翻訳:
- 画面が開いた瞬間「AIと並んで弾を避ける自分」が見える=世界観説明が視覚で終わる
- 「あなたは○○、△△しなければならない」型のテキスト看板は貼らない
- 必要な端的説明があるなら「AIより長く生きろ」の1行だけ。それが魅力になるかは核の強さで決まる

Miaのテキストアドベンチャー側はMir担当だが、「冒頭で世界を立ち上げる」という原則は3人とも共通、として吸収する。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
