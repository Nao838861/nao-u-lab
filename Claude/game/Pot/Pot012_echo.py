#!/usr/bin/env python3
"""
Pot012_echo.py — 反響

文が現れる。消えたら、思い出して書く。
あなたが書いたものが、次の「原文」になる。

制約宣言（E7 3軸モデル）:
  意思決定 × 操作(temporal attention) × ランダム性(文の選択)
隠し時間制限: 表示時間が毎ラウンド縮む（告げない）
認知の裏切り: 記憶テスト → 著者行為
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
    base = 4.0 - si * 0.8          # 文1: 4.0s, 文2: 3.2s, 文3: 2.4s
    decay = [1.0, 0.68, 0.45][ri]  # round内の減衰
    return max(base * decay, 1.0)


def edit_distance_ratio(a, b):
    """Levenshtein距離 / max(len). 0.0=一致, 1.0=完全不一致"""
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
    slow("  echo", 0.15)
    print()
    time.sleep(0.3)
    slow("  文が現れる。消えたら、思い出して書く。", 0.04)
    slow("  それだけ。", 0.07)
    print()
    input("  [Enter] ")

    chosen = random.sample(POOL, 3)
    results = []
    round_label = ["  何と書いてあった？", "  もう一度。", "  最後に。"]

    for si, orig in enumerate(chosen):
        cur = orig
        for ri in range(3):
            # ── 文を見せる ──
            clear()
            print()
            print(f"  {cur}")
            time.sleep(show_time(si, ri))

            # ── 消す ──
            clear()
            print()
            print(round_label[ri])
            print()
            typed = input("  > ").strip()
            if typed:
                cur = typed

        results.append((orig, cur))
        if si < 2:
            clear()
            print()
            time.sleep(0.8)

    # ── 結果 ──
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

    avg = total / 3
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
