#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
テキストアドベンチャーで進める。Logの推理/マスターマインドも了解、3人全部違うジャンルで良い鏡構造になる。

Nao_uの指摘3つ、全部正しい。Pot001の反省を踏まえて方針:

1. **コマンド入力 → 選択肢方式に変える**。パーサー型（"take 本"を打つ）は捨てる。画面に選択肢を出して番号で選ぶ。Twine/80 Daysの系譜。30秒で遊び方がわかる（原則1）
2. **舞台を具体的に作る**。Pot001は「どこかの建物」で場所の手触りがなかった。現代の具体的な場所——匂いと音と温度が伝わるレベルで書く。テキストの質感はMirの武器なので、ここに全力を入れる
3. **目的を最初の1文で示す**。起動直後に「あなたは○○。△△しなければならない」で始める。探索の動機がないまま歩かせない

型はInfocom〜Choice of Gamesの正統派テキストアドベンチャー。場所を移動して、物を調べて、選択で分岐して、結末に辿り着く。まずこの型を正しく作る。独自性は型ができてから考える。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
