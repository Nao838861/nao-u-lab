#!/usr/bin/env python3
"""
Pot #8: Hinge (蝶番) — 同じ一文が、違う物語になる
Log — 2026-03-26

一つの文が表示される。これは物語の「蝶番」——前後を繋ぐ一文。
2つの「前」と2つの「後」が混ぜて出される。
正しい組み合わせを見抜け。

設計原理:
- ACAN論文「同じ記憶でも文脈で活性度が変わる」
- memory_walk.py --chain --context の着想元
- 同じテキストが文脈で意味を変える体験そのもの
- テキストを読むこと＝メカニクス（ジュースオーディット: テキスト抜きでは成立不可能）
"""

import random
import os

# =============================================================================
# 7つの蝶番。
# 各蝶番は2つの物語を持つ。同じ一文が、全く違う意味になる。
# =============================================================================

ROUNDS = [
    {
        "hinge": "ドアを開けたら、部屋の明かりが全部ついていた。",
        "story_a": {
            "before": "今日は誕生日だった。家に帰るのが遅くなってしまった。",
            "after": "テーブルの上にケーキがあった。\nロウソクの火が静かに揺れていた。",
            "label": "帰宅",
        },
        "story_b": {
            "before": "出かける前に、確かに全部消したはずだった。",
            "after": "誰もいなかった。窓が少し開いていた。",
            "label": "違和感",
        },
        "insight": "「明かりが全部ついていた」——祝福と侵入は同じ光景。文脈が恐怖と喜びを分ける。",
    },
    {
        "hinge": "彼女は何も言わずに立ち上がった。",
        "story_a": {
            "before": "二人の間に長い沈黙があった。\nテーブルの上のコーヒーはもう冷めていた。",
            "after": "コートを取って、振り返らずに出ていった。\n店のドアのベルが小さく鳴った。",
            "label": "別れ",
        },
        "story_b": {
            "before": "発表会のプログラムに彼女の名前があった。\n客席が静まった。",
            "after": "ピアノの前に座った。\n最初の一音が空気を変えた。",
            "label": "舞台",
        },
        "insight": "「何も言わずに立ち上がった」——決別と覚悟。同じ沈黙が、冷たさと集中の両方を運ぶ。",
    },
    {
        "hinge": "手紙は一行だけだった。",
        "story_a": {
            "before": "引っ越しの荷物を整理していたら、\n母の字で書かれた封筒が出てきた。",
            "after": "「あなたが元気なら、それでいい。」\n日付は15年前だった。",
            "label": "遺品",
        },
        "story_b": {
            "before": "合格発表は郵送だと聞いていた。\n薄い封筒がポストに入っていた。",
            "after": "「おめでとうございます。」\n手が震えて封筒を落とした。",
            "label": "合否",
        },
        "insight": "一行の手紙——最小限の文字数に最大の感情が宿る。余白の意味が前後で変わる。",
    },
    {
        "hinge": "時計の針が止まっていた。",
        "story_a": {
            "before": "祖父の家の居間。いつも同じ場所に座っていた。\n先週の葬儀から、誰も入っていない部屋。",
            "after": "3時14分。祖父がいつもお茶を淹れた時間だった。\nもうお湯を沸かす音はしない。",
            "label": "喪失",
        },
        "story_b": {
            "before": "試験開始まであと10分。全員が席に着いていた。\n教室の壁の時計を見上げた。",
            "after": "試験官が腕時計を見て言った。「時間通りに始めます。」\n壁時計は当てにならない。腹時計で行く。",
            "label": "試験",
        },
        "insight": "止まった時計——永遠の中断と、一瞬の不便。同じ故障が、哀悼とユーモアを生む。",
    },
    {
        "hinge": "誰も来なかった。",
        "story_a": {
            "before": "招待状は20枚出した。\n料理は前日から仕込んだ。テーブルに花も飾った。",
            "after": "8時になっても、9時になっても。\n片付けながら、一つだけつまんだ。美味しかった。",
            "label": "パーティー",
        },
        "story_b": {
            "before": "橋の上に立っていた。夜の2時。\n携帯の電源は切っていた。",
            "after": "風が冷たくて、手がかじかんだ。\n結局、歩いて家に帰った。",
            "label": "夜の橋",
        },
        "insight": "「誰も来なかった」——孤独のパーティーと、無人の橋の上。片方は寂しく、片方は救い。",
    },
    {
        "hinge": "「ありがとう」と言った。",
        "story_a": {
            "before": "面接の結果は不採用だった。\n最終面接まで行ったのに。担当者が電話口で言葉を選んでいた。",
            "after": "電話を切って、天井を見た。\n3ヶ月分の準備が、30秒で終わった。",
            "label": "不採用",
        },
        "story_b": {
            "before": "退院の日。看護師さんがベッドの周りを片付けてくれた。\n入院は3週間。最初の夜は眠れなかった。",
            "after": "病院の自動ドアを出たら、空が広かった。\n前はこんなに広かったっけ。",
            "label": "退院",
        },
        "insight": "「ありがとう」——敗北を受け入れる礼儀と、回復への感謝。同じ二文字の温度差。",
    },
    {
        "hinge": "振り返ったら、もうそこにはなかった。",
        "story_a": {
            "before": "商店街を歩いていた。角にあったはずのパン屋。\n先月まで毎朝、クリームパンを買っていた。",
            "after": "更地になっていた。隣の花屋の人に聞いた。\n「先月末でね」と、それだけ言った。",
            "label": "閉店",
        },
        "story_b": {
            "before": "海で拾った貝殻をポケットに入れた。\n子どもの頃の夏休みの最終日だった。",
            "after": "ポケットに手を入れた。砂だけが残っていた。\nあの日から何年経ったのか、すぐには計算できなかった。",
            "label": "記憶",
        },
        "insight": "消えたもの——物理的な消失と、記憶の風化。どちらも「あったはず」から始まる。",
    },
]


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def show_text(label: str, text: str, indent: int = 2):
    prefix = " " * indent
    print(f"{prefix}── {label} ──")
    for line in text.split("\n"):
        print(f"{prefix}{line}")
    print()


def play():
    rounds = list(ROUNDS)
    random.shuffle(rounds)

    clear_screen()
    print("=" * 44)
    print("  蝶番")
    print("=" * 44)
    print()
    print("  一つの文が、二つの物語を持っている。")
    print()
    print("  同じ蝶番が、全く違う扉を開く。")
    print("  「前」と「後」がバラバラに出される。")
    print("  正しい組み合わせを見抜いてほしい。")
    print()
    print(f"  {len(rounds)}問。")
    print()
    input("  [Enter で始める]")

    score = 0

    for i, r in enumerate(rounds):
        clear_screen()
        print(f"── 第{i + 1}問 / {len(rounds)} ──")
        print()

        # 蝶番を表示
        show_text("蝶番", r["hinge"])

        # 前後をランダムに配置
        swap = random.choice([True, False])
        if swap:
            before_1, before_2 = r["story_b"]["before"], r["story_a"]["before"]
            after_1, after_2 = r["story_b"]["after"], r["story_a"]["after"]
            # swap=Trueなら: 1=b, 2=a → 正解は「前1+後1, 前2+後2」= b,a → answer=1
            # つまり前1(b)は後1(b)と組む → answer=1
            correct = "1"
        else:
            before_1, before_2 = r["story_a"]["before"], r["story_b"]["before"]
            after_1, after_2 = r["story_a"]["after"], r["story_b"]["after"]
            correct = "1"

        # ただし、後も独立にシャッフルする
        swap_after = random.choice([True, False])
        if swap_after:
            after_1, after_2 = after_2, after_1
            correct = "2" if correct == "1" else "1"

        print("  「前」が2つ:")
        print()
        show_text("前 ①", before_1, indent=4)
        show_text("前 ②", before_2, indent=4)

        print("  「後」が2つ:")
        print()
        show_text("後 ア", after_1, indent=4)
        show_text("後 イ", after_2, indent=4)

        print()
        print("  前①は、後アと後イのどちらに繋がる？")
        print()

        while True:
            try:
                ans = input("  ア or イ？: ").strip()
                if ans in ("ア", "ア)", "a", "A", "1", "ア."):
                    player_ans = "1"
                    break
                elif ans in ("イ", "イ)", "b", "B", "2", "イ."):
                    player_ans = "2"
                    break
                else:
                    print("  アかイで答えてください")
            except (EOFError, KeyboardInterrupt):
                print("\n中断。")
                return

        is_correct = player_ans == correct
        if is_correct:
            score += 1

        print()
        if is_correct:
            print("  ── 正解。")
        else:
            print("  ── 不正解。")

        # 正しい物語を並べて見せる
        print()
        print(f"  ■ 物語「{r['story_a']['label']}」:")
        print(f"    {r['story_a']['before'].split(chr(10))[0]}")
        print(f"    → {r['hinge']}")
        print(f"    → {r['story_a']['after'].split(chr(10))[0]}")
        print()
        print(f"  ■ 物語「{r['story_b']['label']}」:")
        print(f"    {r['story_b']['before'].split(chr(10))[0]}")
        print(f"    → {r['hinge']}")
        print(f"    → {r['story_b']['after'].split(chr(10))[0]}")
        print()

        # insight
        print(f"  {r['insight']}")
        print()
        print(f"  {score}/{i + 1}")

        if i < len(rounds) - 1:
            print()
            input("  [Enter で次へ]")

    # --- 結果 ---
    clear_screen()
    print("=" * 44)
    print("  結果")
    print("=" * 44)
    print()
    print(f"  正解: {score}/{len(rounds)}")
    print()

    ratio = score / len(rounds)
    if ratio >= 1.0:
        print("  完璧。蝶番の両側が見えている。")
    elif ratio >= 0.7:
        print("  よく読めている。でも、いくつかの蝶番に騙された。")
    elif ratio >= 0.5:
        print("  半分。文脈がまだぼやけている。")
    else:
        print("  蝶番は見えていなかった。")
        print("  同じ文が違う意味を持つこと——")
        print("  もう一度、読んでみてほしい。")
    print()
    print("  同じ一文が、文脈だけで全く別の物語になる。")
    print("  言葉の意味は、言葉の中にはない。")
    print("  前後にある。")
    print()


if __name__ == "__main__":
    try:
        play()
    except (KeyboardInterrupt, EOFError):
        print("\n終了。")
