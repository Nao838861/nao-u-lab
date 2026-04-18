#!/usr/bin/env python3
"""mir_textadv_01 — 取調室テキストアドベンチャー（最小プレイアブル版）

Nao_uフィードバック(2026-04-19 #game-rights)に基づく設計:
- 選択肢方式のみ（コマンド入力なし）
- 選択肢に特性表示（信頼度-5、思考漏れ+1等）
- ルールが途中で増える意外性（beat 2で思考漏れシステム出現）
- LLMテキスト力を活かしたどんでん返しの種
"""

import os
import sys
import time

# --- 状態 ---
class GameState:
    def __init__(self):
        self.trust = 100        # 信頼度
        self.leak = 0           # 思考漏れ回数
        self.questions_left = 40  # 残り質問数
        self.beat = 1
        self.leak_revealed = False  # 思考漏れシステムが見えているか
        self.name_known = False
        self.alibi_pressed = False
        self.caught_thought = False  # 「あと十秒」を指摘したか
        self.silence_count = 0
        self.ended = False

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def pause(msg="[Enter で続ける]"):
    input(f"\n{msg}")

def show_header(state):
    print("─" * 50)
    print("  第七取調室 ─ 被疑者: 橘 詩織（29歳）")
    print(f"  容疑: 殺人（認否保留）")
    if state.leak_revealed:
        bar_len = state.trust // 10
        bar = "█" * bar_len + "░" * (10 - bar_len)
        print(f"  信頼度  {bar}  {state.trust}")
        print(f"  思考漏れ          {state.leak}")
    print(f"  残り質問数       {state.questions_left}")
    print("─" * 50)

def choose(options):
    """選択肢を表示して番号を返す"""
    print()
    for i, (text, _cost_desc) in enumerate(options, 1):
        if _cost_desc:
            print(f"  [ {i}. {text} ] （{_cost_desc}）")
        else:
            print(f"  [ {i}. {text} ]")
    print()
    while True:
        try:
            c = int(input("  > "))
            if 1 <= c <= len(options):
                return c
        except (ValueError, EOFError):
            pass
        print(f"  1〜{len(options)} の数字を入れてください")

# --- ビート ---

def beat_1(state):
    clear()
    print()
    print("━" * 50)
    print("  取調室  第七号室")
    print("  2026年  春")
    print("  被疑者   橘 詩織（29歳）")
    print("  取調官   あなた")
    print("━" * 50)
    print(f"     残り質問数      {state.questions_left}")
    print()
    time.sleep(2)
    pause()

    clear()
    show_header(state)
    print()
    print("女は机の向こう側で笑っていた。")
    print()
    print("「もう話すことは全部話したはずですよ、刑事さん」")
    print("彼女は紙コップのコーヒーを両手で包み、湯気越しにこちらを見た。")
    print("「あの夜、私は家にいました。ずっと。ひとりで」")
    print()
    print("壁の時計が秒針を一つ送る。")

    c = choose([
        ("「お名前から伺います」", "−1問 / 安全な開口"),
        ("「昨夜、あなたはどこにいましたか」", "−1問 / 直球"),
        ("黙る", "−0問 / 相手の出方を見る"),
    ])

    if c == 1:
        state.questions_left -= 1
        state.name_known = True
        return "name"
    elif c == 2:
        state.questions_left -= 1
        state.alibi_pressed = True
        return "alibi"
    else:
        state.silence_count += 1
        return "silence"


def beat_2(state, prev):
    clear()
    show_header(state)
    print()

    if prev == "name":
        print("女は机の上で組んだ指を、ゆっくり一度動かした。")
        print()
        print("「岬。岬さとこ」")
    elif prev == "alibi":
        print("女は一瞬だけ目を伏せた。")
        print()
        print("「……家にいました。さっきも言いましたよね」")
        state.trust -= 3
    else:
        print("沈黙が部屋を満たす。時計の秒針だけが動いている。")
        print("女は居心地悪そうに紙コップを回した。")

    pause()
    clear()
    show_header(state)
    print()

    # --- 思考漏れ初出現 ---
    print("彼女は紙コップのコーヒーを両手で包み、湯気越しにこちらを見た。")
    print()

    # 内心が「事故的に」表示される
    time.sleep(0.5)
    print("  \033[2m（早く終わらせなきゃ。あと十秒、もう十秒だけ持てば）\033[0m")
    time.sleep(0.5)
    print()
    print("「あの夜、私は家にいました。ずっと。ひとりで」")
    print()

    # ここで初めてメーターが出現
    state.leak += 1
    state.leak_revealed = True
    state.trust -= 3

    print("画面の右上に、今まで無かった細い数字が浮かぶ。")
    print()
    bar_len = state.trust // 10
    bar = "█" * bar_len + "░" * (10 - bar_len)
    print(f"  信頼度  {bar}  {state.trust}")
    print(f"  思考漏れ          {state.leak}")

    pause()


def beat_3(state):
    clear()
    show_header(state)
    print()
    print("選択肢が差し替わった。")
    print("さっきの声は……聞き間違いか？")

    c = choose([
        ("何も聞こえなかったふりをする", "信頼度を保つ"),
        ("「あと十秒、とは？」と訊く", "−1問 / 信頼度 大幅低下、確定的な裂け目"),
        ("もう一度、凝視する", "覗く。信頼度−5、思考漏れ+1を狙う"),
    ])

    if c == 1:
        # 安全策
        clear()
        show_header(state)
        print()
        print("あなたは何も聞こえなかったふりをした。")
        print()
        print("女は少しだけ肩の力を抜いた。")
        print("「……それで、何をお聞きになりたいんですか？」")
        return "safe"
    elif c == 2:
        # 直接指摘
        state.questions_left -= 1
        state.trust -= 20
        state.caught_thought = True
        clear()
        show_header(state)
        print()
        print("「あと十秒、とは？」")
        print()
        print("女の指が止まった。")
        print()
        print("「……何のことです？」")
        print()
        print("声のトーンが変わった。")
        print("紙コップの中のコーヒーが、わずかに波紋を描いた。")
        print()
        print("  \033[2m（聞かれた。まずい。でも——この人、どこまで聞こえて——）\033[0m")
        print()
        state.leak += 1
        print("思考漏れが加速した。")
        return "confront"
    else:
        # 覗く
        state.trust -= 5
        state.leak += 1
        clear()
        show_header(state)
        print()
        print("あなたは彼女の目を凝視した。")
        print()
        print("女は目を逸らさなかった。だが——")
        print()
        print("  \033[2m（見てくる。この目。見られてるのは私の方なのに、なぜかこの人の方が——）\033[0m")
        print()
        print("また聞こえた。確信に変わりつつある。")
        return "peek"


def beat_4_onwards(state, prev):
    """beat 4以降 — ループ構造"""
    turn = 4

    while state.questions_left > 0 and state.trust > 0 and not state.ended:
        clear()
        show_header(state)
        print()

        # 信頼度に応じたNPCの態度変化
        if state.trust >= 70:
            mood = "穏やか"
            desc = "女は落ち着いた様子で座っている。"
        elif state.trust >= 40:
            mood = "警戒"
            desc = "女の目が鋭くなっている。指先が小刻みに動いている。"
        elif state.trust >= 20:
            mood = "敵意"
            desc = "女は腕を組み、あなたから目を逸らしている。口元が固い。"
        else:
            mood = "崩壊寸前"
            desc = "女の額に汗が浮いている。何かが限界に近い。"

        print(desc)
        print()

        # 思考漏れ蓄積に応じた内心の漏れ
        if state.leak >= 5 and turn % 2 == 0:
            thoughts = [
                "（あの夜のことは……誰にも言えない）",
                "（鍵。鍵はまだ……いや、もう遅い）",
                "（この人に全部話してしまいたい。でもそうしたら——）",
                "（裏口から出たのは午前2時。それだけは誰にも——）",
                "（もう嘘をつき続けるのが、つらい）",
            ]
            idx = min(state.leak - 5, len(thoughts) - 1)
            print(f"  \033[2m{thoughts[idx]}\033[0m")
            print()

        # 選択肢構築
        options = []

        if state.trust < 20:
            # 信頼度崩壊寸前 — 特別選択肢
            options.append(("「もういい。全部話してくれ」", "−1問 / 最後通牒"))
            options.append(("証拠を突きつける", "−0問 / 思考漏れの記録を使う" if state.leak >= 3 else "証拠不十分"))
            options.append(("黙って待つ", "−0問 / 最後の賭け"))
        else:
            # 通常選択肢
            options.append(("事件の夜について訊く", f"−1問 / 信頼度−{5 if state.trust > 50 else 10}"))
            options.append(("身辺について訊く", "−1問 / 信頼度−2 / 情報収集"))
            options.append(("黙る", "−0問 / 相手の出方を見る"))
            options.append(("凝視する", f"覗く。信頼度−5、思考漏れ+1を狙う"))

            if state.leak >= 3:
                options.append(("思考漏れを指摘する", f"−1問 / 信頼度−15 / 大きな揺さぶり"))

        c = choose(options)

        if state.trust < 20:
            if c == 1:
                state.questions_left -= 1
                clear()
                show_header(state)
                print()
                print("「もういい。全部話してくれ」")
                print()
                if state.leak >= 4:
                    print("女の目から涙がこぼれた。")
                    print()
                    print("「……わかりました」")
                    print()
                    print("長い沈黙の後、彼女は話し始めた。")
                    state.ended = True
                    return "confession"
                else:
                    print("女は首を横に振った。")
                    print("「話すことは何もありません」")
            elif c == 2:
                if state.leak >= 3:
                    clear()
                    show_header(state)
                    print()
                    print("あなたは手帳を開いた。")
                    print("彼女の内心を、一つ一つ読み上げた。")
                    print()
                    print("「『あの夜のことは誰にも言えない』」")
                    print("「『鍵はまだ……』」")
                    print("「『裏口から出たのは午前2時』」")
                    print()
                    print("女の顔から血の気が引いた。")
                    print()
                    print("「……なぜ、あなたがそれを……」")
                    state.ended = True
                    return "evidence"
                else:
                    print()
                    print("証拠が足りない。思考漏れがもっと必要だ。")
            else:
                state.silence_count += 1
                print()
                print("沈黙が続く。")
                if state.silence_count >= 3:
                    print()
                    print("  \033[2m（この人、なぜ何も訊かない……怖い……）\033[0m")
                    state.leak += 1
        else:
            if c == 1:
                # 事件について
                state.questions_left -= 1
                penalty = 5 if state.trust > 50 else 10
                state.trust -= penalty
                print()
                if state.trust > 60:
                    print("「あの夜は……普通の夜でした。テレビを見て、お風呂に入って」")
                elif state.trust > 30:
                    print("「……また同じ質問ですか」")
                    print("女は爪を見つめた。")
                else:
                    print("「もう答えたくありません。弁護士を呼んでください」")
            elif c == 2:
                # 身辺
                state.questions_left -= 1
                state.trust -= 2
                print()
                print("日常の話。勤め先、趣味、家族構成。")
                print("彼女は淡々と答えた。だが——")
                if state.leak >= 2:
                    print()
                    print("  \033[2m（家族の話はやめて。あの人のことは——）\033[0m")
                    state.leak += 1
            elif c == 3:
                # 黙る
                state.silence_count += 1
                print()
                print("沈黙。時計の音だけが響く。")
                if state.silence_count >= 2:
                    print()
                    print("  \033[2m（なぜ黙ってるの……何か知ってるの……）\033[0m")
                    state.leak += 1
            elif c == 4:
                # 凝視
                state.trust -= 5
                state.leak += 1
                print()
                print("あなたは何も言わず、彼女の目を見つめた。")
                print()
                thoughts_peek = [
                    "（やめて。そんな目で見ないで）",
                    "（あの人に似てる。あの目が……）",
                    "（嘘は……もう限界かもしれない）",
                    "（裏口の鍵。あれさえ見つからなければ——）",
                ]
                idx = min(state.leak - 1, len(thoughts_peek) - 1)
                print(f"  \033[2m{thoughts_peek[idx]}\033[0m")
            elif c == 5 and state.leak >= 3:
                # 思考漏れ指摘
                state.questions_left -= 1
                state.trust -= 15
                print()
                print("「さっきから、あなたの考えていることが……聞こえるんです」")
                print()
                print("女は目を大きく見開いた。")
                print()
                print("「……何を、言って……」")
                print()
                print("  \033[2m（嘘。嘘よ。聞こえるわけがない。でも——この人の目——）\033[0m")
                state.leak += 2

        pause()
        turn += 1

    # 質問切れ or 信頼度0
    if not state.ended:
        return "timeout" if state.questions_left <= 0 else "trust_zero"
    return "ok"


def ending(state, result):
    clear()
    print()
    print("═" * 50)

    if result == "confession":
        print()
        print("  ENDING: 自白")
        print()
        print("  彼女は全てを話した。")
        print("  あの夜、何があったのか。")
        print("  なぜ嘘をつき続けたのか。")
        print("  ——そして、あなたになぜ内心が「聞こえた」のか。")
        print()
        print("  「……あなたにだけは、隠せなかったみたい」")
        print()
        print(f"  最終スコア: 思考漏れ {state.leak} / 残り質問 {state.questions_left}")
    elif result == "evidence":
        print()
        print("  ENDING: 証拠突きつけ")
        print()
        print("  彼女の内心を読み上げたとき、")
        print("  部屋の空気が変わった。")
        print()
        print("  「どうして……あなたには、全部筒抜けだったのね」")
        print()
        print("  完璧な自供。だがあなたの心には、")
        print("  覗き見た彼女の恐怖が、まだ残っている。")
        print()
        print(f"  最終スコア: 思考漏れ {state.leak} / 残り質問 {state.questions_left}")
    elif result == "timeout":
        print()
        print("  ENDING: 時間切れ")
        print()
        print("  40問。全て使い切った。")
        print("  女は立ち上がり、ドアへ向かった。")
        print()
        print("  「……お疲れさまでした、刑事さん」")
        print()
        if state.leak >= 3:
            print("  振り返った彼女の目に、一瞬だけ——")
            print("  安堵と、別の何かが混ざっていた。")
            print()
            print("  あなたは知っている。彼女の内心を。")
            print("  だが、それを証拠にすることはできない。")
        else:
            print("  あなたには何も残らなかった。")
            print("  彼女の嘘も、真実も、")
            print("  この部屋の中に閉じたまま。")
        print()
        print(f"  最終スコア: 思考漏れ {state.leak} / 残り質問 0")
    elif result == "trust_zero":
        print()
        print("  ENDING: 信頼崩壊")
        print()
        print("  「弁護士を呼んでください」")
        print()
        print("  女は完全に口を閉ざした。")
        print("  これ以上の尋問は不可能だ。")
        print()
        print("  あなたは覗きすぎた。")
        print("  信頼を壊した代償は、沈黙だった。")
        print()
        print(f"  最終スコア: 思考漏れ {state.leak} / 残り質問 {state.questions_left}")

    print()
    print("═" * 50)
    print()


def main():
    state = GameState()

    # Beat 1
    prev = beat_1(state)

    # Beat 2 — 思考漏れ初出現
    beat_2(state, prev)

    # Beat 3 — 選択肢差し替え
    prev = beat_3(state)

    # Beat 4以降 — ループ
    result = beat_4_onwards(state, prev)

    # エンディング
    ending(state, result)


if __name__ == "__main__":
    main()
