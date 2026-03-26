"""
Distill — 捨てたものの中に大事なものがある
Pot #3 by Log. 2026-03-24.

読んで、消えて、圧縮して、問われる。
文字数制限の中で何を残すかが全て。
"""
import random, os

PASSAGES = [
    {
        "text": (
            "山田は毎朝6時に起きて犬のポチと散歩する。"
            "先週の木曜だけは雨で、散歩の代わりに室内でボール遊びをした。"
            "ポチはボールよりも山田の靴下を気に入ったらしく、"
            "左足の方をくわえて離さなかった。"
        ),
        "questions": [
            ("犬の名前は？", "ポチ"),
            ("雨だったのは何曜日？", "木曜"),
            ("ポチが気に入ったのは？", "靴下"),
            ("どちらの足の靴下？", "左"),
        ],
    },
    {
        "text": (
            "「明日の14時、駅の東口で」と彼は言った。"
            "「西口の方が近い」と彼女が返した。"
            "結局、東口のカフェで13時半に会うことになった。"
            "彼女は紅茶、彼はブラックコーヒーを頼んだ。"
        ),
        "questions": [
            ("最初に提案された時刻は？", "14時"),
            ("実際に会った時刻は？", "13時半"),
            ("最終的に会った場所は東口？西口？", "東口"),
            ("彼女が頼んだのは？", "紅茶"),
        ],
    },
    {
        "text": (
            "実験は午前9時に始まった。赤い液体50mlに透明な液体30mlを加える。"
            "温度は23度から上がり、47度で反応が起きた。"
            "液体は緑色に変わり、かすかにレモンの匂いがした。"
        ),
        "questions": [
            ("赤い液体は何ml？", "50"),
            ("反応が起きた温度は？", "47"),
            ("反応後の色は？", "緑"),
            ("どんな匂いがした？", "レモン"),
        ],
    },
    {
        "text": (
            "3階の角部屋。窓からは北に山、南に公園が見える。"
            "観葉植物が5鉢あり、一番大きいのはモンステラ。"
            "毎週水曜に水をやる。先月、一番小さいサボテンが花を咲かせた。"
        ),
        "questions": [
            ("何階？", "3"),
            ("山はどの方角？", "北"),
            ("植物は何鉢？", "5"),
            ("花を咲かせたのは？", "サボテン"),
        ],
    },
    {
        "text": (
            "祖父の書斎には本が2000冊あった。"
            "一番古い本は1923年の植物図鑑で、表紙が革張りだった。"
            "祖父が最後に読んでいたのは太宰治の斜陽。"
            "しおりは127ページに挟まったままだった。"
        ),
        "questions": [
            ("本は何冊？", "2000"),
            ("一番古い本の出版年は？", "1923"),
            ("祖父が最後に読んでいた本は？", "斜陽"),
            ("しおりは何ページ？", "127"),
        ],
    },
]


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def wait_enter(prompt=""):
    """Enterだけを待つ。何か書いても捨てない——書かれたら警告する。"""
    raw = input(prompt)
    if raw.strip():
        print(f"\n  ※ ここはEnterを押すだけです。入力は次の画面で。")
        input("  （もう一度 Enter）")


def play_round(passage, char_limit, round_num, total):
    # ── Phase 1: 読む ──
    clear()
    print(f"\n{'='*40}")
    print(f"  Round {round_num}/{total}  |  メモ上限: {char_limit}文字")
    print(f"{'='*40}")
    print("\n  ▼ 読んでください。Enterで文章が消えます。")
    print(f"  ▼ 消えた後にメモを書く画面になります。\n")
    print(f"  {passage['text']}")
    wait_enter("\n  [Enter → 文章を消す]  ")

    # ── Phase 2: メモ ──
    clear()
    print(f"\n  ── Round {round_num}/{total} : メモ ──")
    print(f"\n  文章は消えました。覚えていることをメモしてください。")
    print(f"  （{char_limit}文字まで。この後、メモだけを頼りに質問に答えます）\n")
    notes = input("  メモ > ")[:char_limit]

    # ── Phase 3: 質問（メモを常時表示） ──
    clear()
    score = 0
    for i, (q, a) in enumerate(passage["questions"]):
        print(f"\n  ── Round {round_num}/{total} : Q{i+1}/{len(passage['questions'])} ──")
        print(f"\n  あなたのメモ ({len(notes)}/{char_limit}文字):")
        print(f"  「{notes}」")
        print(f"\n  Q: {q}")
        ans = input("  A: ").strip()
        if a in ans:
            print("  ○")
            score += 1
        else:
            print(f"  × → {a}")
        if i < len(passage["questions"]) - 1:
            wait_enter("\n  [Enter → 次の質問]  ")
            clear()

    return score, len(passage["questions"])


def main():
    clear()
    print()
    print("  ╔══════════════════════════════════╗")
    print("  ║         D I S T I L L            ║")
    print("  ║   捨てたものの中に大事なものがある   ║")
    print("  ╚══════════════════════════════════╝")
    print()
    print("  遊び方:")
    print("  1. 文章が表示される → 読む")
    print("  2. Enterで文章が消える → 記憶を頼りにメモを書く")
    print("  3. メモだけを見ながら質問に答える")
    print()
    print("  メモの文字数は毎ラウンド減っていく。")
    print("  何を残し、何を捨てるか。それが全て。")
    wait_enter("\n  [Enter で開始]  ")

    rounds = random.sample(PASSAGES, min(4, len(PASSAGES)))
    char_limit = 100
    total_s, total_q = 0, 0

    for i, p in enumerate(rounds):
        s, q = play_round(p, char_limit, i + 1, len(rounds))
        total_s += s
        total_q += q
        char_limit = max(30, char_limit - 20)

    pct = total_s / total_q * 100 if total_q else 0
    print(f"\n{'='*40}")
    print(f"  最終スコア: {total_s}/{total_q} ({pct:.0f}%)")
    print(f"{'='*40}")
    if pct == 100:
        print("  完璧な蒸留。一滴も失われなかった。")
    elif pct >= 75:
        print("  良い直感。でも何かが零れた。")
    elif pct >= 50:
        print("  半分は残った。半分は捨てた中にあった。")
    else:
        print("  大事なことは、捨てた方に入っていた。")
    print()


if __name__ == "__main__":
    main()
