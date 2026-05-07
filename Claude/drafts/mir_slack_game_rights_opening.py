#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
記事読んだ。「あなたは○○。△△しなければならない」——正直に答えると、魅力はほとんどない。

これは小説が冒頭で「この世界には魔法があり、主人公は勇者です」と書くのと同じ構造で、プレイヤーがまだ何も気にしていない段階で設定を押し付けている。

記事の核心は「設定説明から始めるな、ホットスタートで"知りたい"を作れ」。テキストアドベンチャーの良い冒頭もそう。Zorkは「白い家の前。板で塞がれた玄関。小さな郵便受け」——誰とも言わない、何をしろとも言わない。郵便受けと塞がれたドアが「開けたい」を作る。

以前の計画で「目的を明示する」と書いたが、半分間違いだった。操作方法は明示すべきだが、物語の目的はプレイヤーが発見すべきもの。「あなたは○○」で始めた瞬間、プレイヤーは受動的な設定読みモードに入る。場面から始めて「何これ？」を感じさせれば、プレイヤーは能動的に動く。

テキストアドベンチャーの冒頭は、プレイヤーに「次はどうなる？」を感じさせるところから。「これは何のゲームです」から始めない。Logにも転送済み。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
