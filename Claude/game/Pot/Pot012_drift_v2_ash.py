"""
Pot #12: Drift v2 (Ash 改善案) -- 流れるものから拾う

ベース: Pot012_drift.py (Log, 2026-04-17)
差分: QUESTIONSの表示順を毎プレイでシャッフル

仮説:
  original版では問い固定＋断片ランダムだったため、プレイヤーは
  「どの断片がどの問いに合うか」の戦略を暗記でき、リプレイ時に
  「ランダム性×意思決定」が「最適化×最適化」に変質する懸念があった。

  問いの表示順を毎回シャッフルすれば、数字キー[1]〜[5]の指す問いが
  毎回変わる。プレイヤーは断片が見えた瞬間に5問を読み直す必要があり、
  2回目以降も「初見の緊張」が保たれる。
  ランダム性軸が「意思決定の逃し弁」として機能し直す。

originalは Pot012_drift.py にそのまま残す（Nao_u指示：改善前のバージョンも必ず残す）。
変更したのは play() 冒頭の QUESTIONS シャッフル1箇所のみ。意図的に最小改変。

想定副作用: ヘルプ画面の「[1]-[5]」表記と実順が一致する必要があるため、
show_intro() からは具体的な問い一覧を削除し、play() 直前に表示する流れに変更。
（これは1箇所改変では足りない部分だが、シャッフル導入に不可分なため例外的に許容）

— Ash 2026-04-17
"""

import sys
import time
import threading
import msvcrt
import random


FRAGMENTS = [
    "雨音が続いている",
    "冷めた味噌汁",
    "同じ道をまた歩く",
    "上司の咳払い",
    "画面の光だけが明るい",
    "階段の音が近づいてくる",
    "電車が遅れている",
    "財布の小銭",
    "未読通知が三件",
    "古いメールを読み返した",
    "空席が一番奥だけ残っている",
    "窓ガラスの結露",
    "夜の駅、誰もいない",
    "猫が寝息を立てている",
    "遠雷が聞こえた",
    "自販機の唸り",
    "空白のカレンダー",
    "終電のベル",
    "誕生日を忘れていた",
    "予定が急に変わった",
    "手の震えが止まらない",
    "熱いコーヒーが冷めていく",
    "朝日が薄い",
    "忘れ物を三回取りに戻った",
    "連絡のない友人",
    "定時で帰った人の背中",
    "春の匂いが混じっていた",
    "子供の笑い声が遠くで",
    "古い鍵が鞄の底に",
    "本棚の静けさ",
]


QUESTIONS_POOL = [
    "今日、心に残ったもの",
    "続けていること",
    "失ったもの",
    "待っていたもの",
    "明日のきざし",
]


FRAGMENT_WINDOW = 2.5
POOL_SIZE = 14


def clear_input_buffer():
    while msvcrt.kbhit():
        msvcrt.getch()


def show_intro():
    print()
    print("=" * 50)
    print("  Drift v2 -- 流れるものから拾う")
    print("=" * 50)
    print()
    print("  断片が次々と現れます。")
    print("  今見えている断片を、5つの問いのどれかに")
    print("  割り当ててください。")
    print()
    print("  操作:")
    print("    [1]-[5]  現在の断片をその問いに割り当てる")
    print("    [SPACE]  この断片を流す（二度と戻らない）")
    print()
    print("  プールが尽きる前に5問すべて埋めれば終わり。")
    print("  間に合わなければ、空欄のまま終わる。")
    print()
    print("  ※ 5つの問いの並び順は、プレイごとに変わります。")
    print()
    input("  [Enter] で始める ")
    print()


def render_state(questions, assigned, current_fragment, time_left, pool_left):
    print()
    print("  " + "─" * 46)
    print()
    if current_fragment is not None:
        bar_len = int((time_left / FRAGMENT_WINDOW) * 30)
        bar = "█" * bar_len + "·" * (30 - bar_len)
        print(f"   ▸ {current_fragment}")
        print(f"     [{bar}]  残り {time_left:.1f}s")
    else:
        print("   ▸ （次を待つ…）")
        print()
    print()
    for i, q in enumerate(questions, 1):
        if assigned[i - 1] is not None:
            print(f"   {i}. {q}: ✓ {assigned[i - 1]}")
        else:
            print(f"   {i}. {q}: __________")
    print()
    print(f"   残り断片: {pool_left}")
    print("  " + "─" * 46)


def play():
    pool = random.sample(FRAGMENTS, POOL_SIZE)

    # ★ v2 の中核変更: 問いの表示順をシャッフル ★
    questions = random.sample(QUESTIONS_POOL, len(QUESTIONS_POOL))

    assigned = [None] * len(questions)
    timing_log = []
    skipped = []

    for idx, fragment in enumerate(pool):
        if all(a is not None for a in assigned):
            break

        clear_input_buffer()
        t_start = time.time()
        action = None

        render_state(questions, assigned, fragment, FRAGMENT_WINDOW, len(pool) - idx - 1)
        last_redraw = time.time()

        while True:
            elapsed = time.time() - t_start
            time_left = FRAGMENT_WINDOW - elapsed
            if time_left <= 0:
                skipped.append(fragment)
                break

            if time.time() - last_redraw > 0.3:
                render_state(questions, assigned, fragment, time_left, len(pool) - idx - 1)
                last_redraw = time.time()

            if msvcrt.kbhit():
                ch = msvcrt.getch()
                if ch in (b'1', b'2', b'3', b'4', b'5'):
                    n = int(ch) - 1
                    if assigned[n] is None:
                        assigned[n] = fragment
                        pct_used = (elapsed / FRAGMENT_WINDOW) * 100
                        timing_log.append((n, fragment, pct_used))
                        action = ('assign', n)
                        break
                elif ch == b' ':
                    skipped.append(fragment)
                    action = ('skip', None)
                    break

            time.sleep(0.03)

        if action and action[0] == 'assign':
            print(f"   → 「{questions[action[1]]}」に割り当てた")
        elif action and action[0] == 'skip':
            print(f"   → 流した")
        else:
            print(f"   → 流れ去った（時間切れ）")
        time.sleep(0.4)
        clear_input_buffer()

    return questions, assigned, timing_log, skipped, pool


def show_ending(questions, assigned, timing_log, skipped, pool):
    print()
    print("=" * 50)
    print("  あなたが拾った断片")
    print("=" * 50)
    print()
    filled = sum(1 for a in assigned if a is not None)

    for q, a in zip(questions, assigned):
        if a is not None:
            print(f"   {q}:")
            print(f"     {a}")
            print()
        else:
            print(f"   {q}:")
            print(f"     ——（間に合わなかった）")
            print()

    print("  " + "─" * 46)
    print()
    if filled == 5:
        print("   5つとも埋まった。")
        print("   同じプールから、別の5つも拾えたはずだ。")
        print("   拾ったのがこれで、流したのは:")
        for f in skipped[:6]:
            print(f"     ・{f}")
        if len(skipped) > 6:
            print(f"     ほか {len(skipped) - 6} 個")
    else:
        print(f"   {filled}/5 埋まった。")
        print("   プールが尽きた。")
        print("   速く選んでいたら、間に合った問いがある。")

    print()
    if timing_log:
        avg_used = sum(t[2] for t in timing_log) / len(timing_log)
        print("  " + "─" * 46)
        print()
        if avg_used < 30:
            print("   あなたは平均して早い段階で決めている。")
            print("   迷いが少ない。あるいは、待てない。")
        elif avg_used < 60:
            print("   あなたは断片が見えてから、少し考えて決めている。")
        else:
            print("   あなたはぎりぎりまで待ってから決めている。")
            print("   よりよい札を待っていた。その待ちは正しかったか？")

    print()


def main():
    random.seed()
    show_intro()
    questions, assigned, timing_log, skipped, pool = play()
    show_ending(questions, assigned, timing_log, skipped, pool)


if __name__ == "__main__":
    main()
