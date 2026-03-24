"""
The Changing Room — Pot #2
Log作。2026-03-24。

1つのメカニック: 観察。
部屋の中の5つのものを覚えて、何が変わったかを当てる。
10ラウンド。正解数がスコア。

設計意図:
- 100個の壺の2個目。Seed #001とは別の種。
- 記憶と変化の知覚がテーマ。
- プレイヤーが「あれ、どっちだったっけ」と迷う瞬間が核。
"""

import random
import sys

# --- 部屋の要素定義 ---
# 各スロットに複数のバリエーション。変化は同カテゴリ内で起きる。

SLOTS = {
    "壁": ["白い壁", "灰色の壁", "薄い青の壁", "古びた煉瓦の壁", "木目の壁"],
    "照明": ["蛍光灯", "裸電球", "ランタン", "窓からの自然光", "ろうそく3本"],
    "机の上": ["コーヒーカップ", "空のグラス", "積まれた本", "ノートパソコン", "砂時計"],
    "椅子": ["木の椅子", "革張りの椅子", "折りたたみ椅子", "スツール", "ビーズクッション"],
    "床": ["フローリング", "コンクリート", "畳", "タイル", "絨毯"],
    "音": ["時計の秒針", "雨音", "静寂", "遠くの電車", "風の音"],
    "匂い": ["コーヒーの香り", "古い本の匂い", "雨の匂い", "何も匂わない", "線香の香り"],
}

SLOT_NAMES = list(SLOTS.keys())


def describe_room(state: dict) -> str:
    """部屋の状態を文章で描写する"""
    lines = []
    lines.append(f"  {state['壁']}の部屋。{state['照明']}が灯っている。")
    lines.append(f"  机の上には{state['机の上']}。{state['椅子']}がある。")
    lines.append(f"  足元は{state['床']}。")
    lines.append(f"  {state['音']}が聞こえる。{state['匂い']}。")
    return "\n".join(lines)


def change_one(state: dict) -> tuple[dict, str, str, str]:
    """1つだけ変える。何が変わったかを返す。"""
    new_state = dict(state)
    slot = random.choice(SLOT_NAMES)
    old_val = state[slot]
    candidates = [v for v in SLOTS[slot] if v != old_val]
    new_val = random.choice(candidates)
    new_state[slot] = new_val
    return new_state, slot, old_val, new_val


def init_room() -> dict:
    """ランダムな初期状態"""
    return {slot: random.choice(vals) for slot, vals in SLOTS.items()}


def play():
    print()
    print("=" * 50)
    print("  The Changing Room")
    print("  ——部屋の中で、何が変わった？")
    print("=" * 50)
    print()
    print("ルール:")
    print("  部屋の描写をよく読んでください。")
    print("  次のターンで1つだけ何かが変わります。")
    print("  何が変わったか、カテゴリ名で答えてください。")
    print(f"  カテゴリ: {', '.join(SLOT_NAMES)}")
    print("  10ラウンド。途中でやめるには 'q' と入力。")
    print()

    state = init_room()
    score = 0
    total = 10

    print("——最初の部屋——")
    print(describe_room(state))
    print()
    input("（覚えたらEnterで次へ）")

    for round_num in range(1, total + 1):
        new_state, changed_slot, old_val, new_val = change_one(state)

        print()
        print(f"--- ラウンド {round_num}/{total} ---")
        print(describe_room(new_state))
        print()

        answer = input("何が変わった？ > ").strip()

        if answer.lower() == 'q':
            print(f"\n途中終了。スコア: {score}/{round_num - 1}")
            return

        if answer == changed_slot:
            score += 1
            print(f"  正解！ 「{changed_slot}」が「{old_val}」→「{new_val}」に変わった。")
        else:
            print(f"  不正解。変わったのは「{changed_slot}」: 「{old_val}」→「{new_val}」。")

        print(f"  現在のスコア: {score}/{round_num}")

        state = new_state

    print()
    print("=" * 50)
    print(f"  最終スコア: {score}/{total}")
    if score == total:
        print("  完璧。この部屋の全てを見ていた。")
    elif score >= 7:
        print("  鋭い観察力。でもいくつか見落とした。")
    elif score >= 4:
        print("  半分は気づけた。記憶は曖昧だ。")
    else:
        print("  部屋は変わり続けていた。あなたは気づかなかった。")
    print("=" * 50)
    print()


if __name__ == "__main__":
    try:
        play()
    except (KeyboardInterrupt, EOFError):
        print("\n終了。")
