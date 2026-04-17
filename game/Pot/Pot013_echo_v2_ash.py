#!/usr/bin/env python3
"""
Pot013_echo_v2_ash.py — 反響 (Ash 改善案 v2)

ベース: Pot013_echo.py (Mir, 2026-04-17)
差分: 3文×3ラウンド(9回タイプ) → 2文×3ラウンド(6回タイプ)

仮説:
  タイピング疲労を33%削減することで、後半の漂流が
  「疲労による雑入力」ではなく「自然な記憶変質」として観察される。

originalは Pot013_echo.py にそのまま残す（Nao_u指示：改善前のバージョンも必ず残す）。
変更したのはSENTENCES_PER_PLAY定数1箇所のみ。意図的に最小改変。

隠し時間制限の露見問題（文1→文3でbaseが4.0→2.4と急減）は別軸なので
この改善では触れていない。独立した改善候補として将来検討する。

— Ash 2026-04-17
"""

import sys, time, os, random

POOL = [
    "雨が降り始めた頃、あの人はもう駅にいなかった",
    "窓を開けたら、知らない季節の匂いがした",
    "約束の時間はとっくに過ぎていた。誰も怒らなかった",
    "古い写真の中の自分は、今の自分のことを知らない",
    "忘れたことすら忘れてしまえば、最初からなかったのと同じだ",
    "その猫はいつもそこにいた。名前は誰もつけなかった",
    "最後に手紙を書いたのがいつだったか思い出せない",
    "壊れた時計は一日に二回だけ正しい時刻を指す",
    "帰り道はいつも来た道より短く感じる",
    "言いかけてやめた言葉がいちばん正直だったかもしれない",
    "遠くの花火は音が遅れて届く。光と音のあいだに夏がある",
    "あの歌の歌詞を間違えて覚えていたことに二十年後に気づいた",
]

# ★ v2 の唯一の変更点 ★
SENTENCES_PER_PLAY = 2  # original: 3


def clear():
    os.system('cls' if os.name == 'nt' else 'clear')


def slow(text, d=0.05):
    for c in text:
        sys.stdout.write(c)
        sys.stdout.flush()
        time.sleep(d)
    print()


def show_time(si, ri):
    """表示秒数。文が進むほど、繰り返すほど短くなる（プレイヤーには告げない）"""
    base = 4.0 - si * 0.8
    decay = [1.0, 0.68, 0.45][ri]
    return max(base * decay, 1.0)


def edit_distance_ratio(a, b):
    if a == b:
        return 0.0
    la, lb = len(a), len(b)
    if not la or not lb:
        return 1.0
    d = list(range(lb + 1))
    for i in range(1, la + 1):
        prev, d[0] = d[0], i
        for j in range(1, lb + 1):
            prev, d[j] = d[j], min(
                d[j] + 1, d[j - 1] + 1,
                prev + (0 if a[i - 1] == b[j - 1] else 1)
            )
    return min(d[lb] / max(la, lb), 1.0)


def main():
    clear()
    print()
    slow("  echo  (v2)", 0.15)
    print()
    time.sleep(0.3)
    slow("  文が現れる。消えたら、思い出して書く。", 0.04)
    slow("  それだけ。", 0.07)
    print()
    input("  [Enter] ")

    chosen = random.sample(POOL, SENTENCES_PER_PLAY)
    results = []
    round_label = ["  何と書いてあった？", "  もう一度。", "  最後に。"]

    for si, orig in enumerate(chosen):
        cur = orig
        for ri in range(3):
            clear()
            print()
            print(f"  {cur}")
            time.sleep(show_time(si, ri))

            clear()
            print()
            print(round_label[ri])
            print()
            typed = input("  > ").strip()
            if typed:
                cur = typed

        results.append((orig, cur))
        if si < SENTENCES_PER_PLAY - 1:
            clear()
            print()
            time.sleep(0.8)

    clear()
    print()
    time.sleep(0.5)
    slow("  ─── 反響 ───", 0.08)

    total = 0.0
    for orig, final in results:
        drift = edit_distance_ratio(orig, final)
        total += drift
        print()
        slow(f"  原文: {orig}", 0.02)
        slow(f"  反響: {final}", 0.02)
        if drift > 0:
            bar = "█" * max(1, int(drift * 20))
        else:
            bar = "·"
        print(f"  漂流: {bar} {drift:.0%}")
        time.sleep(0.8)

    avg = total / len(results) if results else 0.0
    print()
    print()
    if avg < 0.05:
        slow("  あなたは忠実な鏡だった。", 0.06)
    elif avg < 0.15:
        slow("  少しずつ、あなたの言葉になっていた。", 0.06)
    elif avg < 0.35:
        slow("  原文はもう遠い。でも反響は、ここにある。", 0.06)
    else:
        slow("  これはもう、あなたが書いた文だ。", 0.06)
    print()
    time.sleep(1.5)


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print()
