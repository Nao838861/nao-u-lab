#!/usr/bin/env python3
"""
Pot #10: Cinders (燃え残り)

15の断片が流れてくる。
ひとつずつ現れて、灰になる。
残せるのは5つだけ。
残ったものが、あなたの物語になる。

正解はない。クイズでもない。
あなたが何を残すかが、あなたの物語。
"""

import os
import sys
import time


FRAGMENTS = [
    "朝、台所で水を出したら、冬の匂いがした。",
    "あの人は紅茶にミルクを入れる順番にこだわっていた。",
    "引き出しの奥に、読めなくなった手紙が一通ある。",
    "階段を降りるとき、二段目がいつも軋む。直さないことにした。",
    "夏の夜、窓を全部開けて、何も考えずに風を聴いた。",
    "旅行の写真は一枚も撮らなかった。その方がいいと思った。",
    "「また明日」と言って、そのまま明日が来なかった。",
    "猫が膝の上で寝ている間は、何も悪いことは起きない。",
    "好きだった曲の歌詞を、一行だけ思い出せない。",
    "本棚の並び順を変えたら、部屋が別の場所になった。",
    "駅で偶然会った。お互い、何と言えばいいかわからなかった。",
    "割れたカップを捨てられないのは、理由があるからじゃない。",
    "雨の日に走って帰った。傘は持っていたのに。",
    "あの日の夕焼けの色を、正確には言えない。ただ、きれいだった。",
    "これを書いているのは、忘れたくないからじゃない。忘れても大丈夫なようにだ。",
]

MAX_KEEP = 5


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def pause(seconds):
    time.sleep(seconds)


def show_intro():
    clear()
    print()
    print("  =" * 25)
    print("    Pot #10: Cinders (燃え残り)")
    print("  =" * 25)
    print()
    print("    15の断片が流れてくる。")
    print("    ひとつずつ現れて、灰になる。")
    print()
    print("    残せるのは5つだけ。")
    print("    残ったものが、あなたの物語になる。")
    print()
    print("    [k] 残す    [Enter] 見送る")
    print()
    input("    [Enter] はじめる ")


def burn_line(text):
    """断片が灰になるアニメーション"""
    chars = list(text)
    length = len(chars)
    steps = min(length, 6)
    for step in range(steps):
        for j in range(step * length // steps, (step + 1) * length // steps):
            if j < len(chars):
                chars[j] = "."
        sys.stdout.write(f"\r      {''.join(chars)}")
        sys.stdout.flush()
        time.sleep(0.15)
    sys.stdout.write(f"\r      {'.' * length}")
    sys.stdout.flush()
    time.sleep(0.3)
    print()


def show_fragment(index, text, kept_count):
    """断片を表示し、残すかどうか選ばせる"""
    clear()
    remaining = MAX_KEEP - kept_count
    total = len(FRAGMENTS)

    # ヘッダー
    bar = "■" * kept_count + "□" * remaining
    print(f"\n    [{bar}]  {index + 1}/{total}")
    print()

    # 既に灰になった断片を示す
    if index > 0:
        print("      " + "." * min(30, len(FRAGMENTS[index - 1])))
        print()

    # 現在の断片
    print(f"      {text}")
    print()

    if remaining <= 0:
        print("    （もう残す場所がない）")
        input("    [Enter] ")
        return False

    remaining_lines = total - index - 1
    print(f"    あと{remaining_lines}行流れてくる。")
    print()

    choice = input("    [k] 残す  [Enter] 見送る > ").strip().lower()
    return choice in ("k", "ｋ")


def show_result(kept_lines, kept_indices):
    """結果を表示する"""
    clear()
    print()
    pause(1.5)

    if not kept_lines:
        # 何も残さなかった場合
        print("    何も残さなかった。")
        print()
        pause(1.5)
        print("    すべてが灰になった。")
        print()
        pause(2)
        print("    でも——灰の中に、残り火がひとつ。")
        print()
        pause(1.5)
        print(f"      「{FRAGMENTS[-1]}」")
        print()
        pause(2)
        print("    これだけは消えなかった。")
        print()
    else:
        print("    ── あなたが残したもの ──")
        print()
        pause(0.8)

        for line in kept_lines:
            print(f"      {line}")
            print()
            pause(1.0)

        pause(1.5)
        print("    ──────────────────────")
        print()
        pause(1.5)

        last_idx = len(FRAGMENTS) - 1
        if last_idx not in kept_indices:
            # 最後の断片を残さなかった → 灰から浮かび上がる
            burned_count = len(FRAGMENTS) - len(kept_lines)
            print(f"    {burned_count}の断片が灰になった。")
            print()
            pause(1.5)
            print("    その中のひとつ——")
            print()
            pause(1)
            print(f"      「{FRAGMENTS[-1]}」")
            print()
            pause(2)
            print("    あなたはこれを残さなかった。")
            print("    でもこれが、すべてを書いた理由だった。")
        else:
            # 最後の断片を残した
            print("    あなたは最後の一行を残した。")
            pause(1)
            print("    この人が書いた理由を、あなたは知っている。")

        print()

    pause(1)
    print("    ─")
    print()
    pause(0.5)
    print("    同じ15行から、人はそれぞれ違う物語を作る。")
    print("    何を残すかは、何を見ているかで決まる。")
    print()
    input("    [Enter] ")


def show_replay_prompt(kept_lines):
    """もう一度遊ぶかどうか"""
    print()
    print("    もう一度？  [y] はい  [Enter] 終わる")
    choice = input("    > ").strip().lower()
    return choice in ("y", "ｙ")


def main():
    while True:
        show_intro()

        kept_lines = []
        kept_indices = []

        for i, fragment in enumerate(FRAGMENTS):
            keep = show_fragment(i, fragment, len(kept_lines))

            if keep and len(kept_lines) < MAX_KEEP:
                kept_lines.append(fragment)
                kept_indices.append(i)
                print()
                print("      残した。")
                pause(0.6)
            else:
                if keep:
                    print("      （もう残す場所がない）")
                print()
                burn_line(fragment)

        show_result(kept_lines, kept_indices)

        if not show_replay_prompt(kept_lines):
            break

    clear()
    print()
    print("    灰は冷めた。")
    print()


if __name__ == "__main__":
    main()
