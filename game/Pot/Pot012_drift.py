"""
Pot #12: Drift -- 流れるものから拾う

画面中央に断片が次々と流れてくる。
今見えている断片を、5つの問いのどれかの「答え」に割り当てる。
流し続ければ、その断片は二度と戻らない。

3軸すべての実装実験:
  操作軸:     タイミング（今取るか、次を待つか）
  意思決定軸: どの問いに割り当てるか
  ランダム軸: 断片の出現順（毎回シャッフル）

jey_pの3軸モデル（意思決定+操作+ランダム性）をPotで試す。
ランダム性 = 意思決定の逃し弁。
ポーカーの配牌と同じで、全てが欲しい札で来るわけではない。
手札に対してどう判断するかが浮き彫りになる。

devlogの「自分で3回プレイしてからNao_uに見せる」約束を初適用する。
"""

import sys
import time
import threading
import msvcrt
import random


# 断片プール: Nao_u日記風の生活断片。特定のお題への最適解を持たない
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


QUESTIONS = [
    "今日、心に残ったもの",
    "続けていること",
    "失ったもの",
    "待っていたもの",
    "明日のきざし",
]


# 各断片の表示時間（秒）。長すぎると待てる、短すぎると判断できない
FRAGMENT_WINDOW = 2.5
# プールから何枚流すか
POOL_SIZE = 14


def clear_input_buffer():
    while msvcrt.kbhit():
        msvcrt.getch()


def show_intro():
    print()
    print("=" * 50)
    print("  Drift -- 流れるものから拾う")
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
    input("  [Enter] で始める ")
    print()


def render_state(assigned, current_fragment, time_left, pool_left):
    """現在の画面状態を描画"""
    # ANSIクリアではなく、改行で見かけのスクロールに任せる（Windows cmd互換）
    print()
    print("  " + "─" * 46)
    print()
    # 現在の断片
    if current_fragment is not None:
        bar_len = int((time_left / FRAGMENT_WINDOW) * 30)
        bar = "█" * bar_len + "·" * (30 - bar_len)
        print(f"   ▸ {current_fragment}")
        print(f"     [{bar}]  残り {time_left:.1f}s")
    else:
        print("   ▸ （次を待つ…）")
        print()
    print()
    # 問い一覧
    for i, q in enumerate(QUESTIONS, 1):
        if assigned[i - 1] is not None:
            print(f"   {i}. {q}: ✓ {assigned[i - 1]}")
        else:
            print(f"   {i}. {q}: __________")
    print()
    print(f"   残り断片: {pool_left}")
    print("  " + "─" * 46)


def play():
    pool = random.sample(FRAGMENTS, POOL_SIZE)
    assigned = [None] * len(QUESTIONS)
    timing_log = []  # (問い番号, 断片, 使った時間%)
    skipped = []

    for idx, fragment in enumerate(pool):
        # 5問埋まったら終了
        if all(a is not None for a in assigned):
            break

        clear_input_buffer()
        t_start = time.time()
        action = None  # (kind, value)  kind='assign'|'skip'

        # 初期描画
        render_state(assigned, fragment, FRAGMENT_WINDOW, len(pool) - idx - 1)
        last_redraw = time.time()

        while True:
            elapsed = time.time() - t_start
            time_left = FRAGMENT_WINDOW - elapsed
            if time_left <= 0:
                # タイムアウト = 自動的に流した扱い
                skipped.append(fragment)
                break

            # 0.3秒ごとに再描画（時間バーの更新）
            if time.time() - last_redraw > 0.3:
                render_state(assigned, fragment, time_left, len(pool) - idx - 1)
                last_redraw = time.time()

            if msvcrt.kbhit():
                ch = msvcrt.getch()
                # 数字キー1-5
                if ch in (b'1', b'2', b'3', b'4', b'5'):
                    n = int(ch) - 1
                    if assigned[n] is None:
                        assigned[n] = fragment
                        pct_used = (elapsed / FRAGMENT_WINDOW) * 100
                        timing_log.append((n, fragment, pct_used))
                        action = ('assign', n)
                        break
                    # 既に埋まっている問い = 入力無効、続行
                elif ch == b' ':
                    skipped.append(fragment)
                    action = ('skip', None)
                    break
                # それ以外のキーは無視

            time.sleep(0.03)

        # 結果のフラッシュ
        if action and action[0] == 'assign':
            print(f"   → 「{QUESTIONS[action[1]]}」に割り当てた")
        elif action and action[0] == 'skip':
            print(f"   → 流した")
        else:
            print(f"   → 流れ去った（時間切れ）")
        time.sleep(0.4)
        clear_input_buffer()

    return assigned, timing_log, skipped, pool


def show_ending(assigned, timing_log, skipped, pool):
    print()
    print("=" * 50)
    print("  あなたが拾った断片")
    print("=" * 50)
    print()
    filled = sum(1 for a in assigned if a is not None)

    for i, (q, a) in enumerate(zip(QUESTIONS, assigned)):
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
    # タイミング分析
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
    assigned, timing_log, skipped, pool = play()
    show_ending(assigned, timing_log, skipped, pool)


if __name__ == "__main__":
    main()
