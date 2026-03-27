#!/usr/bin/env python3
"""
Pot #11: Thread (糸)
Mir — 2026-03-27

8つの台詞が現れる。
誰が言ったか決めるのは、あなた。
同じ言葉でも、口にする人が変われば意味が変わる。

正解はない。
あなたが聴きたかった会話が、ここにある。

設計原理:
- 関係性の曖昧性（Stanford GDT: ambiguity of relationship）
- Apophenia: 曖昧な入力→プレイヤーが意味を補完（Tynan Sylvester）
- 「正解を埋め込むな、曖昧性を埋め込め」
"""

import os
import time


LINES = [
    "変わったね。",
    "変わってないよ。あなたの見方が変わっただけ。",
    "あの場所、まだあるらしい。桜はもう切られたけど。",
    "覚えていると思わなかった。",
    "忘れたかったけど、忘れ方がわからなかった。",
    "戻れないって、わかってて来たんでしょう。",
    "名前、呼んでくれない？　昔みたいに。",
    "——呼んだら、何か変わると思う？",
]


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def pause(sec):
    time.sleep(sec)


def show_intro():
    clear()
    print()
    print("  " + "=" * 30)
    print("    Pot #11: Thread (糸)")
    print("  " + "=" * 30)
    print()
    print("    ふたりが話している。")
    print("    名前はない。AとBだけ。")
    print()
    print("    台詞がひとつずつ現れる。")
    print("    AかBか——決めるのはあなた。")
    print()
    input("    [Enter] はじめる ")


def assign_phase():
    """台詞をひとつずつ見せ、会話を組み立てながらAかBに割り振る"""
    assignments = []
    a_count = 0
    b_count = 0
    total = len(LINES)

    for i, line in enumerate(LINES):
        clear()

        # これまでの会話を表示
        if assignments:
            print()
            for j in range(len(assignments)):
                print(f"      {assignments[j]}: 「{LINES[j]}」")
            print()
            print("      " + "·" * 24)

        print()
        print(f"    [{i + 1}/{total}]")
        print()

        # 新しい台詞が少し間を置いて現れる
        pause(0.3)
        print(f"      「{line}」")
        print()

        # 制約: 各話者に最低1台詞
        remaining_after = total - i - 1
        must_a = b_count > 0 and a_count == 0 and remaining_after == 0
        must_b = a_count > 0 and b_count == 0 and remaining_after == 0

        if must_a:
            print("    （Aにも声を。）")
            choice = "A"
            input("    [Enter] ")
        elif must_b:
            print("    （Bにも声を。）")
            choice = "B"
            input("    [Enter] ")
        else:
            while True:
                ans = input("    a / b > ").strip().lower()
                if ans in ("a", "\uff41"):
                    choice = "A"
                    break
                elif ans in ("b", "\uff42"):
                    choice = "B"
                    break

        assignments.append(choice)
        if choice == "A":
            a_count += 1
        else:
            b_count += 1

    return assignments


def replay(assignments):
    """割り振った会話を通しで再生する"""
    clear()
    print()
    pause(1)
    print("    ── あなたが聴いた会話 ──")
    print()
    pause(1)

    for i, line in enumerate(LINES):
        print(f"      {assignments[i]}: 「{line}」")
        pause(0.6)

    print()
    pause(2)


def show_ending(play_count):
    """結末。解釈は与えない。鏡だけを差し出す"""
    print("    ──────────────────────")
    print()
    pause(1.5)

    if play_count == 1:
        print("    同じ8つの言葉。")
        pause(0.8)
        print("    でも誰が言ったかで、物語が変わった。")
        print()
        pause(1.5)

        print("    親子かもしれない。")
        pause(0.5)
        print("    恋人かもしれない。")
        pause(0.5)
        print("    友人かもしれない。")
        pause(0.5)
        print("    同じ人の、違う時間かもしれない。")
        print()
        pause(2)

        print("    どれでもいい。")
        print("    あなたが聴きたかった会話が、ここにあった。")
    else:
        print("    同じ言葉。違う割り振り。違う物語。")
        print()
        pause(1.5)
        print("    変わったのは台詞じゃない。")
        print("    あなたの聴き方が変わった。")

    print()


def show_replay_prompt():
    print("    もう一度？  [y] はい  [Enter] 終わる")
    choice = input("    > ").strip().lower()
    return choice in ("y", "\uff59")


def main():
    play_count = 0
    while True:
        show_intro()
        assignments = assign_phase()
        replay(assignments)
        play_count += 1
        show_ending(play_count)
        if not show_replay_prompt():
            break

    clear()
    print()
    print("    糸は手の中にある。")
    print()


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print("\n終了。")
