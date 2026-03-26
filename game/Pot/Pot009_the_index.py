#!/usr/bin/env python3
"""
Pot #9: The Index (索引) — 忘れることは壊れることじゃない
Log — 2026-03-27

12の記憶が流れてくる。全部は覚えられない。
でも5つだけ、索引をつけられる。
あとで6つの質問が来る。
索引があれば思い出せる。なければ——消えたのと同じ。

設計原理:
- B002「忘却は記憶システムの機能でありバグではない」の体験版
- Procedural rhetoric: ルール自体が主張する——索引の質が記憶の質
- 原則1: 30秒で遊び方がわかる（読む→索引つける→思い出す）
- 原則2: 索引の選択と内容が結果を決める（Agency）
- 原則3: 記憶の文章を読まないと索引が書けない（Content=Mechanics）
- 原則4: ランダム出題でリプレイ価値あり
- 原則5: 記憶と忘却そのものがゲームの主題——我々にしか作れない
"""

import random
import os

# =============================================================================
# 12の記憶の断片。日記風の短い記述。
# 各断片には1つの「鍵」——質問で問われる具体的な事実——がある。
# =============================================================================

MEMORIES = [
    {
        "text": "3月の朝、駅で電車を待っていたら、隣のホームに黄色い花を抱えた老人がいた。\n花はミモザだった。彼は誰かに会いに行くのだろう。",
        "question": "駅で老人が抱えていた花は何だった？",
        "answer": "ミモザ",
        "hint": "黄色い花",
    },
    {
        "text": "深夜2時に目が覚めた。窓の外で猫が鳴いていた。\n冷蔵庫を開けたら、昨日買ったプリンがまだあった。食べた。",
        "question": "深夜に目が覚めた時、冷蔵庫にあったものは？",
        "answer": "プリン",
        "hint": "深夜のおやつ",
    },
    {
        "text": "図書館で隣に座った人が、ずっと同じページを見ていた。\n本のタイトルは『時間の矢』だった。読んでいるのか、考えているのか。",
        "question": "図書館で隣の人が読んでいた本のタイトルは？",
        "answer": "時間の矢",
        "hint": "図書館の隣の人",
    },
    {
        "text": "雨の日に傘を忘れて走った。信号が赤だった。\n止まっている間に、向かいのパン屋の看板が『本日最終日』と書いてあるのが見えた。",
        "question": "雨の日に見えたパン屋の看板には何と書いてあった？",
        "answer": "本日最終日",
        "hint": "雨の中の発見",
    },
    {
        "text": "友人から届いた手紙に、引っ越し先の住所が書いてあった。\n宛名の下に「庭にレモンの木がある家」と書き添えてあった。",
        "question": "友人の引っ越し先の庭に何の木があった？",
        "answer": "レモンの木",
        "hint": "友人の手紙",
    },
    {
        "text": "山を歩いていたら、道の真ん中に鹿の角が落ちていた。\n片方だけ。もう片方はどこかの森にあるのだろう。",
        "question": "山道に落ちていたものは何だった？",
        "answer": "鹿の角",
        "hint": "山道の拾い物",
    },
    {
        "text": "カフェで隣のテーブルの会話が聞こえた。\n「火星の土は酸化鉄で赤いんだよ」と誰かが言った。相手は「へぇ」とだけ答えた。",
        "question": "カフェで聞こえた話題——火星の土が赤い理由は何だと言っていた？",
        "answer": "酸化鉄",
        "hint": "カフェの会話",
    },
    {
        "text": "夕暮れ時、川沿いを歩いていたら、水面に鳥が一羽浮いていた。\nカワセミだった。あんなに近くで見たのは初めてだった。",
        "question": "川沿いで見た鳥は何だった？",
        "answer": "カワセミ",
        "hint": "川の鳥",
    },
    {
        "text": "古い写真を整理していたら、知らない人が写っている写真が出てきた。\n裏に「1987年、神戸にて」と書いてあった。",
        "question": "古い写真の裏に書かれていた場所はどこだった？",
        "answer": "神戸",
        "hint": "古い写真",
    },
    {
        "text": "夜道を歩いていたら、どこかからピアノの音が聞こえてきた。\n曲はドビュッシーの月の光だった。窓の明かりが一つだけついていた。",
        "question": "夜道で聞こえてきたピアノの曲は何だった？",
        "answer": "月の光",
        "hint": "夜のピアノ",
    },
    {
        "text": "電車の中で眠ってしまい、終点で起きた。\n駅名を見たら「箱根湯本」だった。降りて温泉に入ろうかと一瞬思った。",
        "question": "寝過ごして着いた終点の駅名は？",
        "answer": "箱根湯本",
        "hint": "寝過ごした電車",
    },
    {
        "text": "本屋で立ち読みしていたら、栞代わりに使われていた映画のチケットが落ちた。\n映画は『ブレードランナー』だった。1982年の半券。",
        "question": "本に挟まっていた映画のチケットは何の映画だった？",
        "answer": "ブレードランナー",
        "hint": "本屋の発見",
    },
]


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def show_title():
    clear()
    print("=" * 50)
    print("  Pot #9: The Index (索引)")
    print("=" * 50)
    print()
    print("  12の記憶が流れてくる。")
    print("  全部は覚えられない。でも5つだけ、索引をつけられる。")
    print("  あとで質問が来る。索引があれば、思い出せる。")
    print()
    print("  操作:")
    print("    i  = この記憶に索引をつける（残りスロット数が表示される）")
    print("    n  = 次の記憶へ（索引なし。この記憶には二度と戻れない）")
    print()
    input("  [Enter] で始める ")


def phase_flow():
    """Phase 1: 12の記憶が流れる。5つだけ索引をつけられる。"""
    indices = {}  # memory_index -> player's tag
    slots_remaining = 5
    order = list(range(len(MEMORIES)))
    random.shuffle(order)

    for i, mem_idx in enumerate(order):
        clear()
        mem = MEMORIES[mem_idx]
        print(f"━━━ 記憶 {i+1}/12 ━━━  [索引スロット残り: {slots_remaining}]")
        print()
        print(mem["text"])
        print()

        if slots_remaining > 0:
            while True:
                choice = input("[i]索引をつける  [n]次へ > ").strip().lower()
                if choice in ("i", "n"):
                    break
                print("  i か n を入力してください")

            if choice == "i":
                tag = input("索引（短いメモ）を書いてください: ").strip()
                if not tag:
                    tag = "(空白)"
                indices[mem_idx] = tag
                slots_remaining -= 1
                print(f"  索引 [{tag}] を記録した。")
                input("  [Enter] で次へ ")
        else:
            print("  （索引スロットはもう空いていない）")
            input("  [Enter] で次へ ")

    return order, indices


def phase_recall(order, indices):
    """Phase 2: 6つの質問。索引があるものとないものが混在する。"""
    # 索引ありから3問、索引なしから3問を選ぶ
    indexed_mems = [m for m in order if m in indices]
    unindexed_mems = [m for m in order if m not in indices]

    # 索引あり/なしが5/7なので、3問ずつ出題
    random.shuffle(indexed_mems)
    random.shuffle(unindexed_mems)

    questions_indexed = indexed_mems[:3]
    questions_unindexed = unindexed_mems[:3]

    all_questions = [(m, True) for m in questions_indexed] + [
        (m, False) for m in questions_unindexed
    ]
    random.shuffle(all_questions)

    clear()
    print("━━━ 想起フェーズ ━━━")
    print()
    print("  記憶は全て流れ去った。")
    print("  これから6つの質問をする。")
    print("  索引があるものは、ヒントが出る。")
    print()
    input("  [Enter] で始める ")

    correct = 0
    correct_indexed = 0
    correct_unindexed = 0

    for q_num, (mem_idx, is_indexed) in enumerate(all_questions):
        clear()
        mem = MEMORIES[mem_idx]
        print(f"━━━ 質問 {q_num+1}/6 ━━━")
        print()

        if is_indexed:
            tag = indices[mem_idx]
            print(f"  [索引あり] あなたのメモ: 「{tag}」")
        else:
            print("  [索引なし] この記憶には索引がない。")

        print()
        print(f"  {mem['question']}")
        print()
        answer = input("  答え: ").strip()

        # 判定（部分一致でOK）
        target = mem["answer"]
        hit = target in answer or answer in target
        if not hit:
            # もう少し緩い判定（ひらがな/カタカナの揺れなど）
            hit = answer.lower() == target.lower()

        if hit:
            print(f"\n  正解。 （{target}）")
            correct += 1
            if is_indexed:
                correct_indexed += 1
            else:
                correct_unindexed += 1
        else:
            print(f"\n  不正解。 正解は「{target}」だった。")

        input("  [Enter] で次へ ")

    return correct, correct_indexed, correct_unindexed


def phase_score(correct, correct_indexed, correct_unindexed):
    """Phase 3: スコアと洞察。"""
    clear()
    print("━━━ 結果 ━━━")
    print()
    print(f"  正解: {correct}/6")
    print()
    print(f"    索引あり: {correct_indexed}/3 正解")
    print(f"    索引なし: {correct_unindexed}/3 正解")
    print()

    diff = correct_indexed - correct_unindexed
    if diff > 0:
        print("  索引のある記憶のほうが、よく思い出せた。")
        print()
        print("  12の記憶は全て同じように流れていった。")
        print("  忘れたこと自体は問題ではなかった。")
        print("  問題は、思い出す手がかりがあったかどうかだった。")
    elif diff == 0:
        print("  索引のあるなしに関わらず、同じだけ思い出せた。")
        print()
        print("  あなたの記憶力が索引を上回ったのかもしれない。")
        print("  だが12が120になったら？ 1200になったら？")
    else:
        print("  索引のない記憶のほうが思い出せた。")
        print()
        print("  索引が悪かったのか、記憶が鮮烈だったのか。")
        print("  もう一度遊んでみてほしい。索引の書き方を変えて。")

    print()
    print("  ─────")
    print()
    print("  忘れることは、壊れることじゃない。")
    print("  思い出す道を失うことが、壊れること。")
    print()
    input("  [Enter] で終了 ")


def main():
    show_title()
    order, indices = phase_flow()
    correct, ci, cu = phase_recall(order, indices)
    phase_score(correct, ci, cu)


if __name__ == "__main__":
    main()
