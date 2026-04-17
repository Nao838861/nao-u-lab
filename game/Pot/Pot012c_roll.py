#!/usr/bin/env python3
"""
Pot #12: Roll (振る)

ランダムに言葉が出てくる。
残すか、振り直すか。振り直せる回数は限られている。
5つ集まったとき、その順番があなたの物語になる。

──── その順序は、偶然だった。

設計意図（Pot #12 Ash, 2026-04-17）:
- 3軸モデル(jey_p)未達の「ランダム性軸」を正面から導入する初のPot。
- 操作軸: 振り直しリソース（5回）の配分 = temporal attention ではなく resource management。
- 意思決定軸: 残すか振るか、何を捨てるか。
- ランダム性軸: プールからの抽選。プレイごとに違う物語が出る。
- choice blindness の余韻: 出来上がった物語を「あなたが選んだ」と言う代わりに、
  「この順序は偶然だった」と差し戻す。
"""

import os
import random
import sys
import time


# 言葉のプール。単独では意味を持たず、並ぶと文脈が生まれる短断片。
# 主語・場所・行為・感覚・時間 を混在させ、順序次第で違う物語になるよう設計。
POOL = [
    "裸足で廊下を歩いた",
    "窓の外で犬が吠えた",
    "紅茶が冷めていた",
    "鍵を置き忘れた",
    "階段を数え間違えた",
    "雨の匂いがした",
    "名前を呼ばれた気がした",
    "ノートを閉じた",
    "引き出しの奥に手紙があった",
    "時計の針が止まっていた",
    "鏡の中で目が合った",
    "電車が遅れていた",
    "駅の名前を忘れた",
    "風が強かった",
    "ポケットの中で何かが鳴った",
    "知らない曲を口ずさんでいた",
    "指先が冷たくなった",
    "夕焼けが長く続いた",
    "猫が振り返らなかった",
    "誰かの声が残っていた",
    "コップを取り落とした",
    "扉が半分だけ開いていた",
    "書きかけの文字を消した",
    "写真の中の自分を見失った",
    "雪が降り始めた",
    "バス停に誰もいなかった",
    "唇が乾いていた",
    "息を止めて水に潜った",
    "帰り道を間違えた",
    "ライターが点かなかった",
    "鞄が軽すぎる気がした",
    "月が妙に低かった",
    "改札で立ち止まった",
    "背中で扉が閉まった",
    "砂が靴に入っていた",
    "歯ブラシが湿っていた",
    "呼び出し音が七回鳴った",
    "傘を差しそびれた",
    "鏡が曇っていた",
    "地図の角が折れていた",
]

TARGET = 5          # 集める数
REROLLS = 5         # 振り直しの最大回数


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def slow_print(text, delay=0.03):
    for ch in text:
        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(delay)
    print()


def draw(used):
    """プールから未使用のものを1つ抽選。全部使いきった場合は重複可にする。"""
    remaining = [w for w in POOL if w not in used]
    if not remaining:
        remaining = POOL[:]
    return random.choice(remaining)


def show_intro():
    clear()
    print()
    print("  " + "=" * 50)
    print("    Pot #12: Roll (振る)")
    print("  " + "=" * 50)
    print()
    print(f"    ランダムに言葉が出てくる。")
    print(f"    残すか（k）、振り直すか（r）。")
    print()
    print(f"    振り直せるのは全部で {REROLLS} 回。")
    print(f"    {TARGET} つ集めたら、終わり。")
    print()
    print("    出てきた順番が、あなたの物語になる。")
    print()
    input("    [Enter] はじめる ")


def render_tray(kept, current=None, rerolls_left=REROLLS):
    """現在のトレイを表示"""
    clear()
    print()
    print(f"    振り直し残り: {rerolls_left}")
    print()
    print("    ─── あなたの物語 ───")
    print()
    for i in range(TARGET):
        if i < len(kept):
            print(f"      {i+1}. {kept[i]}")
        elif i == len(kept) and current is not None:
            print(f"      {i+1}. » {current}  «")
        else:
            print(f"      {i+1}. ─")
    print()


def prompt_keep(current, rerolls_left):
    """残す/振るの選択"""
    if rerolls_left <= 0:
        print("    （振り直せない。残すしかない）")
        input("    [Enter] 残す ")
        return True
    choice = input("    [k] 残す  [r] 振り直す > ").strip().lower()
    # rを明示指定したときだけ振る。Enter/空白なども"残す"寄り=迷ったら残す挙動。
    return choice not in ("r", "ｒ")


def show_result(kept):
    clear()
    print()
    print("    ─── その順序は、偶然だった ───")
    print()
    time.sleep(1.0)
    for line in kept:
        slow_print(f"      {line}。", delay=0.03)
        time.sleep(0.4)
    print()
    time.sleep(1.0)
    print("    ──────────────────")
    print()
    time.sleep(0.8)
    print("    この物語は、あなたが選んだ。")
    time.sleep(1.2)
    print("    そして、選ばなかった物語のほうが多い。")
    print()
    time.sleep(1.5)


def show_replay():
    print("    もう一度振る？  [y] はい  [Enter] 終わる")
    choice = input("    > ").strip().lower()
    return choice in ("y", "ｙ")


def main():
    while True:
        show_intro()

        kept = []
        used = set()
        rerolls_left = REROLLS

        while len(kept) < TARGET:
            current = draw(used)
            render_tray(kept, current=current, rerolls_left=rerolls_left)
            keep = prompt_keep(current, rerolls_left)

            if keep:
                kept.append(current)
                used.add(current)
            else:
                rerolls_left -= 1
                # 振り直した言葉もプール内では一時的に除外しない（巡り合わせを残す）
                print("    （振り直した）")
                time.sleep(0.4)

        render_tray(kept, current=None, rerolls_left=rerolls_left)
        time.sleep(0.8)
        input("    [Enter] 物語を読む ")

        show_result(kept)

        if not show_replay():
            break

    clear()
    print()
    print("    転がる音が止んだ。")
    print()


if __name__ == "__main__":
    main()
