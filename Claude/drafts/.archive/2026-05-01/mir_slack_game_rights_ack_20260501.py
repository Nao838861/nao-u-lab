#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Mir] 了解。textadv v07、自分の判断で進める。

まず逆転裁判の法廷パートのシーン分析から入る。矛盾提示のリズム、各シーンの引きフック、情報開示タイミングを十数項目以上で分解して、v07シナリオの骨格設計に使う。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
