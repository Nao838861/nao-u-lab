"""
Pot #6: Witness (証言) — 5人の証言。1人だけ嘘つき。

5人が同じ出来事を証言する。
4人は正直に話している。1人だけ、嘘をついている。
テキストを読むこと自体がゲームプレイ。

制約: goal（嘘を見抜く）
設計原理: lateral information（Return of the Obra Dinn）
　Round 1で学んだ原理がRound 3の判断に効く
"""

import sys
import os
import time

ROUNDS = [
    {
        "title": "第一の事件：交差点",
        "intro": "交差点で事故があった。5人の目撃者が証言する。",
        "statements": [
            "A: 「雨が降っていて、道路は濡れていた」",
            "B: 「白い車が東から走ってきて、スピードを出していた」",
            "C: 「急ブレーキの跡が5メートルほど続いていた」",
            "D: 「信号が変わった直後のことだった」",
            "E: 「路面は乾いていて、タイヤの跡がくっきり見えた」",
        ],
        "liar": 4,
        "hint": "道路の状態に注目。矛盾する証言はないか？",
        "explanation": (
            "Eは「路面は乾いていた」と言った。\n"
            "  しかしAは「雨で道路が濡れていた」と証言し、\n"
            "  Cの「ブレーキ跡が5メートル」は濡れた路面と整合する。\n"
            "  Eだけが、他の4人と矛盾している。"
        ),
    },
    {
        "title": "第二の事件：消えた書類",
        "intro": "オフィスで重要な書類が消えた。5人の社員が証言する。",
        "statements": [
            "A: 「田中さんは朝9時に出社して、すぐ会議室に入った」",
            "B: 「会議は9時から11時まで続いた」",
            "C: 「10時半に田中さんが自分の席でコーヒーを飲んでいるのを見た」",
            "D: 「11時過ぎに田中さんが会議室から出てきた」",
            "E: 「昼前に田中さんは書類を持って外出した」",
        ],
        "liar": 2,
        "hint": "時間の流れを追ってみて。田中さんはどこにいた？",
        "explanation": (
            "Cは「10時半に田中さんが席にいた」と言った。\n"
            "  しかしAは「9時に会議室に入った」、Bは「会議は11時まで」、\n"
            "  Dは「11時過ぎに会議室から出てきた」と証言している。\n"
            "  10時半に田中さんが席にいるのは不可能。Cが嘘をついている。"
        ),
    },
    {
        "title": "第三の事件：深夜の旅館",
        "intro": (
            "旅館で窓ガラスが割れた。5人の宿泊客が証言する。\n"
            "（前の事件で気づいたことが、役に立つかもしれない）"
        ),
        "statements": [
            "A: 「深夜2時頃、大きな音で目が覚めた」",
            "B: 「外は大雨で、風も強かった」",
            "C: 「廊下に出たら、濡れた足跡が玄関まで続いていた」",
            "D: 「割れた窓の下に、乾いた石が転がっていた」",
            "E: 「風で庭の木が大きく揺れていた」",
        ],
        "liar": 3,
        "hint": "第一の事件を思い出して。雨の中にあるはずのものが……",
        "explanation": (
            "Dは「乾いた石が転がっていた」と言った。\n"
            "  しかしBは「外は大雨」と証言している。\n"
            "  外から投げ込まれた石なら、雨に濡れているはず。\n"
            "  第一の事件と同じ原理——雨の中で乾いたものは矛盾する。"
        ),
    },
]


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def slow_print(text, delay=0.03):
    for ch in text:
        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(delay)
    print()


def show_statements(stmts):
    print()
    for s in stmts:
        print(f"  {s}")
        time.sleep(0.4)
    print()


def get_choice(liar_hint):
    """Get player's answer. Returns (choice_index, hint_used)."""
    hint_used = False
    while True:
        try:
            ans = input("嘘をついているのは？ (A-E, h=ヒント): ").strip().lower()
            if ans == "h" and not hint_used:
                print(f"\n  > {liar_hint}\n")
                hint_used = True
                continue
            if ans in ("a", "b", "c", "d", "e"):
                return ord(ans) - ord("a"), hint_used
            n = int(ans)
            if 1 <= n <= 5:
                return n - 1, hint_used
            print("  A-Eの文字か、1-5の数字を入れてください")
        except ValueError:
            print("  A-Eの文字か、1-5の数字を入れてください")
        except (EOFError, KeyboardInterrupt):
            print("\n中断しました")
            sys.exit(0)


def main():
    clear()
    print("=" * 40)
    slow_print("  証 言", delay=0.08)
    print("=" * 40)
    print()
    slow_print("5人が証言する。")
    slow_print("4人は正直に話している。")
    slow_print("1人だけ、嘘をついている。")
    print()
    slow_print("見抜けますか？")
    print()
    input("[Enter で始める]")

    score = 0
    results = []
    hints_used = 0

    for i, r in enumerate(ROUNDS):
        clear()
        print(f"─── {r['title']} ───")
        print()
        slow_print(r["intro"], delay=0.025)
        show_statements(r["statements"])

        choice, used_hint = get_choice(r["hint"])
        if used_hint:
            hints_used += 1

        print()
        if choice == r["liar"]:
            liar_letter = chr(ord("A") + r["liar"])
            print(f"  正解。{liar_letter}が嘘をついていた。")
            score += 1
            results.append(True)
        else:
            liar_letter = chr(ord("A") + r["liar"])
            print(f"  不正解。嘘つきは{liar_letter}。")
            results.append(False)

        print()
        print("  【なぜ嘘だとわかるか】")
        for line in r["explanation"].split("\n"):
            slow_print(line, delay=0.02)
        print()

        if i < len(ROUNDS) - 1:
            input("[Enter で次の事件へ]")

    # --- Final ---
    clear()
    print("=" * 40)
    print("  結 果")
    print("=" * 40)
    print()

    for correct, r in zip(results, ROUNDS):
        mark = "○" if correct else "×"
        print(f"  {mark}  {r['title']}")
    print()
    print(f"  正解: {score}/3", end="")
    if hints_used:
        print(f"  (ヒント{hints_used}回使用)")
    else:
        print()
    print()

    if score == 3 and hints_used == 0:
        slow_print("  完璧。あなたは嘘が見える。")
    elif score == 3:
        slow_print("  全問正解。次はヒントなしで。")
    elif score == 2:
        slow_print("  悪くない。でも1つ見逃した。")
    elif score == 1:
        slow_print("  証言をもう一度、注意深く読んでみて。")
    else:
        slow_print("  嘘つきは、あなたのすぐそばにいた。")

    print()


if __name__ == "__main__":
    main()
