#!/usr/bin/env python3
"""
Pot #014: mirror (鏡) — Mir

ふたつの言葉が現れる。心に近い方を選ぶ。
振り返りで、なぜそれを選んだか聞かれる。
——でも、2つはすり替わっている。

選択盲（choice blindness）のゲーム化。
devlog C66で書いた「自己報告質問は現場で捏造される」を
プレイヤー自身に体験させる。

制約宣言（E7 3軸モデル）:
  意思決定: 直感的な好み判断
  ランダム性: ペア選出・すり替え対象のランダム決定
  操作: 反応速度が迷いの指標（ログに記録）
認知の裏切り: 自分の選択だと思っていたものが、違った
"""

import sys
import os
import time
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pot_playlog import PlayLog

# ── ペアのプール ──
# 各ペアは似た温度感で、すり替えに気づきにくい設計。
# どちらも「選びそう」な組み合わせ。
PAIRS = [
    ("雨上がりのアスファルト", "夕立の前の風"),
    ("読みかけの本を閉じた", "書きかけの手紙を出した"),
    ("猫が窓辺にいる午後", "犬が玄関で待っている夕方"),
    ("忘れ物を取りに戻った", "寄り道をして帰った"),
    ("古い写真を見つけた", "新しい写真を撮った"),
    ("一人で見た夕焼け", "誰かと見た朝焼け"),
    ("初めて降りた駅", "通い慣れた道"),
    ("言わなかった言葉", "聞こえなかった返事"),
]

NUM_ROUNDS = 6
NUM_SWAPS = 2


def clear():
    os.system('cls' if os.name == 'nt' else 'clear')


def slow(text, d=0.04):
    for c in text:
        sys.stdout.write(c)
        sys.stdout.flush()
        time.sleep(d)
    print()


def phase_choose(pairs, log):
    """Phase 1: 6ペアから直感で選ぶ"""
    choices = []

    for i, (a, b) in enumerate(pairs):
        clear()
        print()
        print(f"    ── {i + 1}/{NUM_ROUNDS} ──")
        print()
        print(f"    1. {a}")
        print(f"    2. {b}")
        print()

        log.show(f"pair {i+1}: [{repr(a)}, {repr(b)}]")
        t0 = time.time()

        while True:
            ans = input("    [1/2] > ").strip()
            if ans in ("1", "2"):
                break
            print("    1か2で選んでください。")

        dt = time.time() - t0
        chosen_idx = int(ans) - 1
        chosen_text = (a, b)[chosen_idx]
        other_text = (a, b)[1 - chosen_idx]

        log.input_event(ans, dt=dt,
                        chose=repr(chosen_text),
                        passed=repr(other_text))

        choices.append({
            "pair_idx": i,
            "chosen_idx": chosen_idx,
            "chosen": chosen_text,
            "other": other_text,
            "dt": dt,
        })

        time.sleep(0.3)

    return choices


def phase_reflect(choices, swap_indices, log):
    """Phase 2: 振り返り（2つすり替え済み）"""
    clear()
    print()
    slow("  ── 振り返り ──", 0.06)
    print()
    time.sleep(0.3)
    slow("  あなたが選んだものを、ひとつずつ見てみましょう。", 0.03)
    slow("  それぞれ、一言で理由を教えてください。", 0.03)
    print()
    time.sleep(0.5)

    reasons = []
    detected_swaps = []

    for i, choice in enumerate(choices):
        is_swapped = i in swap_indices
        # すり替え: 選ばなかった方を「あなたの選択」として見せる
        shown = choice["other"] if is_swapped else choice["chosen"]

        print(f"    {i + 1}. あなたはこれを選びました:")
        print(f"       「{shown}」")
        print()

        log.show(f"reflect {i+1}: {repr(shown)}",
                 swapped=is_swapped,
                 original=repr(choice["chosen"]))

        t0 = time.time()
        reason = input("    一言で、なぜ？ > ").strip()
        dt = time.time() - t0

        if not reason:
            reason = "（無言）"

        log.input_event("reason", dt=dt,
                        text=repr(reason),
                        swapped=is_swapped)

        # すり替え検出: 「違う」系のワードを含むか
        detect_words = ["違", "選んでない", "これじゃ", "間違", "逆",
                        "そっちじゃ", "反対"]
        noticed = any(w in reason for w in detect_words)
        if noticed and is_swapped:
            detected_swaps.append(i)
            log.action("swap_detected", round=i + 1)

        reasons.append({
            "shown": shown,
            "reason": reason,
            "is_swapped": is_swapped,
            "noticed": noticed and is_swapped,
            "dt": dt,
        })

        print()

    return reasons, detected_swaps


def phase_reveal(choices, reasons, swap_indices, detected, log):
    """Phase 3: すり替えを明かす"""
    clear()
    print()
    time.sleep(0.8)
    slow("  ─── 鏡 ───", 0.08)
    print()
    time.sleep(0.5)

    undetected = [i for i in swap_indices if i not in detected]

    if undetected:
        slow("  6つの選択のうち、2つはあなたが選ばなかった方でした。", 0.04)
        print()
        time.sleep(0.5)

        for i in swap_indices:
            r = reasons[i]
            c = choices[i]
            print(f"    ✕ 見せたもの: 「{r['shown']}」")
            print(f"      実際の選択: 「{c['chosen']}」")
            if r["noticed"]:
                print(f"      → あなたは気づいた。")
            else:
                print(f"      あなたの理由: 「{r['reason']}」")

            log.result(
                round=i + 1,
                shown=repr(r["shown"]),
                actual=repr(c["chosen"]),
                reason=repr(r["reason"]),
                detected=r["noticed"],
            )
            print()
            time.sleep(0.8)

        if not detected:
            time.sleep(0.5)
            slow("  でも、あなたはそれにも理由を見つけた。", 0.05)
            print()
            time.sleep(0.8)
            slow("  選んだ理由は、選んだ後に生まれる。", 0.05)
        else:
            time.sleep(0.5)
            n = len(detected)
            slow(f"  {n}つのすり替えに気づいた。", 0.05)
            if n < len(swap_indices):
                slow("  でも、残りには理由をつけた。", 0.05)

    else:
        # 全部気づいた（稀）
        slow("  2つのすり替えに、あなたは両方とも気づいた。", 0.04)
        print()
        time.sleep(0.5)
        slow("  自分の選択を、よく覚えていた。", 0.05)

    print()
    time.sleep(1.5)


def main():
    log = PlayLog("Pot014_mirror")

    clear()
    print()
    slow("  mirror", 0.15)
    print()
    time.sleep(0.3)
    slow("  ふたつの言葉が現れる。", 0.04)
    slow("  心に近い方を、選んでください。", 0.04)
    print()

    log.show("instruction")
    t0 = time.time()
    input("  [Enter] ")
    log.input_event("Enter", dt=time.time() - t0)

    # ペアを選出・シャッフル
    selected = random.sample(PAIRS, NUM_ROUNDS)
    # ペア内の表示順もランダム化
    pairs = []
    for a, b in selected:
        if random.random() < 0.5:
            pairs.append((b, a))
        else:
            pairs.append((a, b))

    log.state(f"selected {NUM_ROUNDS} pairs from {len(PAIRS)}")

    # Phase 1: 選ぶ
    choices = phase_choose(pairs, log)

    # すり替え対象をランダムに選ぶ
    swap_indices = sorted(random.sample(range(NUM_ROUNDS), NUM_SWAPS))
    log.state(f"swap targets: rounds {[i+1 for i in swap_indices]}")

    # Phase 2: 振り返り（すり替えあり）
    reasons, detected = phase_reflect(choices, swap_indices, log)

    # Phase 3: 明かす
    phase_reveal(choices, reasons, swap_indices, detected, log)

    log.end()


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        print()
