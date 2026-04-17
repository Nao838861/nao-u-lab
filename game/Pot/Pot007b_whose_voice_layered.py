#!/usr/bin/env python3
"""
Pot #7b: Whose Voice? — Layered (Log revision of Mir's #7)
Original: Mir 2026-03-25 (Pot007_whose_voice.py, 変更しない)
Revision: Log 2026-04-17

Nao_u指示「他の2人のpotも相互に遊んでフィードバック」への応答。
相互プレイで得た気づきを改訂として試す実験。

Mir版を実際に遊んで気づいたこと:
  1. 「違う」は即決、「同じ」は迷う——非対称性は既に体験として機能している
  2. だが7問フラットで難易度曲線がない。スキルが育つ前に終わる
  3. 正解開示が「同じ人（C）」だけ。次の問いで同じ声が来ても学習が効かない
  4. 結果画面が正解率のみ。「どの声の識別が弱いか」が見えない

変更点（Mirの意図は壊さない）:
  [A] 難易度段階化: 対照ペア → 中距離 → 類似ペア の順
  [B] 回答後に声の癖を1行再提示 → プレイ中にスキルが育つ
  [C] 結果に混同パターン: 「AとEを取り違えた」等、鏡としての機能を強化

変えないもの:
  - 5つの声（Mirの書き分けが核心。触らない）
  - 2択（y/n）の非対称性（これが面白さの源）
  - 「読むこと=メカニクス」の原則
"""

import random
import os
import sys

# Mir版からVOICESをそのまま引き継ぐ（声は触らない）
sys.path.insert(0, os.path.dirname(__file__))
from Pot007_whose_voice import VOICES, VOICE_IDS, clear_screen, show_fragment

# 声の「近さ」マップ (人手で定義)
# 近い = 取り違えやすい。遠い = 対照的で判別容易
# A(短文余韻) / B(饒舌脱線) / C(数字精密) / D(問いかけ) / E(感覚過去)
VOICE_DISTANCE = {
    ("A", "B"): 3,  # 文体の重さが真逆（短文 vs 饒舌）
    ("A", "C"): 2,  # どちらも抑制的、だがCは数字で緩衝
    ("A", "D"): 2,  # どちらも静か、だがDは問いを投げる
    ("A", "E"): 1,  # どちらも短め・感覚寄り——近い
    ("B", "C"): 3,  # 感情/事実の極
    ("B", "D"): 3,  # 饒舌/思索
    ("B", "E"): 2,  # Bは今の日常、Eは過去の感覚
    ("C", "D"): 2,  # 事実/問い——見かけは抽象で違うが冷静さは似る
    ("C", "E"): 2,  # 観察/記憶
    ("D", "E"): 1,  # どちらも詩的・抽象寄り——近い
}


def pair_distance(v1, v2):
    if v1 == v2:
        return 0
    key = tuple(sorted([v1, v2]))
    return VOICE_DISTANCE.get(key, 2)


def make_layered_pairs(num_rounds: int) -> list[dict]:
    """
    難易度層にペアを配置する。
    - 序盤: 同じ声同士 or 遠い声（distance=3）のペア—区別容易
    - 中盤: distance=2 のペア
    - 終盤: distance=1 のペア（似た声の判別）
    同じ/違うの比率は概ね半々を維持。
    """
    assert num_rounds >= 4

    def same_pair():
        vid = random.choice(VOICE_IDS)
        lines = random.sample(VOICES[vid]["lines"], 2)
        return {"line1": lines[0], "line2": lines[1],
                "same": True, "v1": vid, "v2": vid, "dist": 0}

    def diff_pair_at(target_dist):
        candidates = [(v1, v2) for v1 in VOICE_IDS for v2 in VOICE_IDS
                      if v1 < v2 and pair_distance(v1, v2) == target_dist]
        v1, v2 = random.choice(candidates)
        if random.random() < 0.5:
            v1, v2 = v2, v1
        line1 = random.choice(VOICES[v1]["lines"])
        line2 = random.choice(VOICES[v2]["lines"])
        return {"line1": line1, "line2": line2,
                "same": False, "v1": v1, "v2": v2, "dist": target_dist}

    # 3層に分割
    n1 = num_rounds // 3
    n3 = num_rounds // 3
    n2 = num_rounds - n1 - n3

    pairs = []
    # Layer 1: easy — 遠いペア or 同じ声
    for i in range(n1):
        if i % 2 == 0:
            pairs.append(diff_pair_at(3))
        else:
            pairs.append(same_pair())

    # Layer 2: medium — distance=2
    for i in range(n2):
        if i % 2 == 0:
            pairs.append(diff_pair_at(2))
        else:
            pairs.append(same_pair())

    # Layer 3: hard — distance=1 + 同じ声
    for i in range(n3):
        if i % 2 == 0:
            pairs.append(diff_pair_at(1))
        else:
            pairs.append(same_pair())

    return pairs


def play():
    num_rounds = 7
    pairs = make_layered_pairs(num_rounds)

    clear_screen()
    print("=" * 44)
    print("  声の持ち主 — 段階版")
    print("=" * 44)
    print()
    print("  5人の人間がいる。")
    print("  それぞれに書き方のクセがある。")
    print()
    print("  2つの文章を見せる。")
    print("  同じ人が書いたか、違う人が書いたか。")
    print()
    print("  後半ほど、声が似てくる。")
    print()
    print(f"  {num_rounds}問。")
    print()
    input("  [Enter で始める]")

    score = 0
    # 誤答の記録: (v1, v2, player_said_same, actually_same)
    mistakes = []

    for i, pair in enumerate(pairs):
        clear_screen()
        # 層を軽く示す（ネタバレにならない程度）
        layer_label = {0: "ウォームアップ", 1: "", 2: "近い声"}.get(
            min(2, i // (num_rounds // 3)), "")
        header = f"── 第{i + 1}問 / {num_rounds} ──"
        if layer_label:
            header += f"  （{layer_label}）"
        print(header)
        print()

        show_fragment("ひとつめ", pair["line1"])
        show_fragment("ふたつめ", pair["line2"])

        while True:
            try:
                ans = input("同じ人？ (y/n): ").strip().lower()
                if ans in ("y", "yes", "はい", "同じ"):
                    player_says_same = True
                    break
                elif ans in ("n", "no", "いいえ", "違う"):
                    player_says_same = False
                    break
                else:
                    print("  y（同じ）か n（違う）で答えてください")
            except (EOFError, KeyboardInterrupt):
                print("\n中断。")
                return

        correct = player_says_same == pair["same"]
        if correct:
            score += 1
        else:
            mistakes.append((pair["v1"], pair["v2"],
                             player_says_same, pair["same"]))

        print()
        if pair["same"]:
            v = pair["v1"]
            print(f"  → 同じ人（{v}: {VOICES[v]['trait']}）。", end="")
        else:
            v1, v2 = pair["v1"], pair["v2"]
            print(f"  → 違う人。")
            print(f"    {v1}: {VOICES[v1]['trait']}")
            print(f"    {v2}: {VOICES[v2]['trait']}", end="")

        if correct:
            print("  ◯")
        else:
            print("  ×")

        print(f"  {score}/{i + 1}")
        print()

        if i < num_rounds - 1:
            input("  [Enter で次へ]")

    # --- 結果 ---
    clear_screen()
    print("=" * 44)
    print("  結果")
    print("=" * 44)
    print()
    print(f"  正解: {score}/{num_rounds}")
    print()

    ratio = score / num_rounds
    if ratio >= 1.0:
        print("  完璧。あなたには声が聞こえている。")
    elif ratio >= 0.7:
        print("  いい耳をしている。でも何人か聞き分けられなかった。")
    elif ratio >= 0.5:
        print("  半分。声はまだぼやけて聞こえている。")
    else:
        print("  声は聞こえていなかった。")
        print("  もう一度、読んでみてほしい。今度はゆっくり。")
    print()

    # 混同パターン分析
    if mistakes:
        print("── あなたが迷った場所 ──")
        print()
        false_same = [m for m in mistakes if m[2] and not m[3]]   # 違うのに同じと答えた
        false_diff = [m for m in mistakes if not m[2] and m[3]]   # 同じなのに違うと答えた

        if false_same:
            print("  違う人を「同じ」と読み違えた:")
            for v1, v2, _, _ in false_same:
                print(f"    {v1} と {v2} を混同")
            print()
        if false_diff:
            print("  同じ人を「違う」と読み取った:")
            for v1, _, _, _ in false_diff:
                print(f"    {v1} の二面を別人と感じた")
            print()
    else:
        print("  迷いなく聞き分けた。")
        print()

    # 正体を明かす
    print("── 5つの声 ──")
    print()
    for vid in VOICE_IDS:
        v = VOICES[vid]
        print(f"  {vid}: {v['trait']}")
    print()
    print("  同じ言葉を使わなくても、声は滲み出る。")
    print("  そして、同じ人でも気分で声は揺れる。")
    print()


if __name__ == "__main__":
    try:
        play()
    except (KeyboardInterrupt, EOFError):
        print("\n終了。")
