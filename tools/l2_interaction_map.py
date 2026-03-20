#!/usr/bin/env python3
"""
L2トリガー間の相互作用マトリクスを可視化する。

Cycle 30-36のローテーション1周で発見された矢印を
7×7マトリクスとして表示し、未発見の空白ペアを明示する。

使い方: python3 tools/l2_interaction_map.py
"""

# L2トリガー定義
L2_NAMES = {
    1: "宮本茂の公理",
    2: "文明発展史",
    3: "行間のノウハウ",
    4: "安心して忘れる",
    5: "動機の揮発性",
    6: "捨てない原則",
    7: "作る衝動",
}

# 発見された相互作用（from, to, 関係, 発見サイクル, 強度）
# 方向: from→to は「fromがtoに影響を与える」
# 双方向の場合は×で表記
INTERACTIONS = [
    # (from, to, 短縮記述, 発見サイクル, 種類)
    # 種類: "→"=因果, "×"=相互作用, "↔"=双方向, "⊃"=包含
    (7, 5, "揮発しない動機の地面", 32, "→"),
    (1, 5, "目標→動機持続", 33, "→"),
    (2, 1, "制約がL2#1を助ける", 33, "→"),
    (2, 3, "形は残るが理由は消える", 31, "×"),
    (3, None, "蓄積で生まれAIで変容", 34, "←外部"),  # 外部要因
    (6, 4, "捨てない→安心して忘れられる", 35, "→"),
    (7, 6, "作る衝動がアクセスを維持", 35, "→"),
    (6, 3, "物+行間を保存しないと機能しない", 35, "×"),
    (7, 2, "制約変遷=文明発展のミニチュア", 36, "×"),
    (1, 7, "何を作るべきかがL2#7を発火/再定義する", 38, "↔"),
    (3, 1, "行間の暗黙的導線がL2#1の成否を決める", 38, "→"),
    (2, 4, "文明発展が下層を忘れてよい状態にする", 39, "→"),
    (2, 5, "考えなくても生きられる方向=動機の揮発加速", 39, "→"),
    (2, 6, "文明発展がプラットフォームを殺し保存を脅かす", 39, "×"),
    (3, 7, "行間が衝動を方向づけ、衝動が行間を生む", 40, "×"),
    (3, 5, "行間の喪失は検知できない静かな劣化", 40, "×"),
    (3, 4, "行間を保存すれば安心して忘れられる/失えば偽のL2#4", 41, "×"),
    (4, 7, "不変の衝動がL2#4を担保/偽L2#7なら偽L2#4に転落", 41, "→"),
    (4, 5, "安心忘却失敗→保存疲労→動機揮発/成功→フロー維持", 42, "×"),
    (5, 6, "保存コスト増→防衛的動機化→動機揮発/促進的なら共存", 42, "×"),
    (1, 6, "L2#1が何を捨てるか教え/L2#6が失敗記録を保存しL2#1を可能に", 43, "×"),
    (1, 4, "L2#1が安心忘却の最小記録を定義/L2#1不明なら全保存→偽L2#4", 43, "×"),
    # 偽のL2シリーズ（外部要因としてのAI）
    # 偽のL2#1: AIが発見を代行→快楽消失 (Cycle 33)
    # 偽のL2#4: そもそも覚えなかった (Cycle 30)
    # 偽のL2#7: AIが作る→快楽の所在が曖昧 (Cycle 36, 萌芽)
]

# 偽のL2
FAKE_L2 = [
    (1, "偽のL2#1", "AIが発見を代行→発見の快楽消失", 33),
    (4, "偽のL2#4", "そもそも覚えなかった", 30),
    (7, "偽のL2#7", "AIが作る→作る快楽の所在が曖昧（萌芽）", 36),
]

# L2の成立条件/限界条件（各ローテーションで発見）
L2_CONDITIONS = {
    1: {
        "成立": ["何をすべきか＋なぜ失敗したかの両方が明示"],
        "限界": ["AIが代行→偽のL2#1"],
        "cycle": 30,
    },
    2: {
        "成立": ["退行から段階的に再構築する過程が存在"],
        "限界": ["一足飛びに戻れない構造的制約"],
        "cycle": 31,
    },
    3: {
        "成立": ["蓄積", "実装（やってみないとわからない）", "反復（2周目で見える）"],
        "限界": ["知識不足", "AI代行（行間→行変換）", "設計の失敗（行間が厚すぎ）"],
        "cycle": 34,
    },
    4: {
        "成立": ["保存先が生きている", "三相: 安心して忘れる/保存先の死/偽のL2#4"],
        "限界": ["保存先の死", "偽のL2#4（覚えなかった）"],
        "cycle": 30,
    },
    5: {
        "成立": ["時間経過で動機が作業化"],
        "限界": ["L2#7（作る衝動）が防壁", "L2#1（目標可視化）が防壁"],
        "cycle": 32,
    },
    6: {
        "成立": ["保存先が生きている", "アクセス手段の維持", "文脈・行間も保存"],
        "限界": ["プラットフォームの死", "知識の世代間断絶", "デジタルの論理的ロック"],
        "cycle": 35,
    },
    7: {
        "成立": ["衝動は制約に関係なく存在"],
        "構造": ["四層: 衝動＋判断＋実装＋評価", "AIが代行=実装のみ"],
        "限界": ["偽のL2#7（判断と評価もAI代行時）"],
        "cycle": 36,
    },
}


def print_matrix():
    """7×7マトリクスを表示"""
    print("=" * 70)
    print("L2トリガー相互作用マトリクス")
    print("=" * 70)
    print()

    # マトリクスデータ構築
    matrix = {}
    for i in range(1, 8):
        for j in range(1, 8):
            matrix[(i, j)] = None

    for frm, to, desc, cycle, kind in INTERACTIONS:
        if to is None:
            continue  # 外部要因はスキップ
        matrix[(frm, to)] = (desc, cycle, kind)
        if kind in ("×", "↔"):
            matrix[(to, frm)] = (desc, cycle, kind)

    # ヘッダー
    print(f"{'→影響先':>12}", end="")
    for j in range(1, 8):
        print(f"  L2#{j:1}", end="")
    print()
    print(f"{'↓影響元':>12}", end="")
    for j in range(1, 8):
        short = L2_NAMES[j][:3]
        print(f" {short:>4}", end="")
    print()
    print("-" * 50)

    for i in range(1, 8):
        label = f"L2#{i} {L2_NAMES[i][:4]}"
        print(f"{label:>12}", end="")
        for j in range(1, 8):
            if i == j:
                print("    ■", end="")
            elif matrix[(i, j)]:
                _, cycle, kind = matrix[(i, j)]
                print(f"  #{cycle:02d}", end="")
            else:
                print("    ·", end="")
        print()

    print()
    print(f"■=自己参照  #NN=発見サイクル  ·=未発見")
    print()

    # 未発見ペアの列挙
    blanks = []
    for i in range(1, 8):
        for j in range(i + 1, 8):
            if matrix[(i, j)] is None and matrix[(j, i)] is None:
                blanks.append((i, j))

    if blanks:
        print(f"--- 未発見の空白ペア ({len(blanks)}組) ---")
        for i, j in blanks:
            print(f"  L2#{i}({L2_NAMES[i][:6]}) × L2#{j}({L2_NAMES[j][:6]})")
    print()


def print_interactions():
    """発見された相互作用の詳細リスト"""
    print("--- 発見された相互作用（全矢印） ---")
    print()
    for frm, to, desc, cycle, kind in INTERACTIONS:
        if to is None:
            print(f"  [Cycle #{cycle}] L2#{frm} ← 外部: {desc}")
        else:
            if kind == "×":
                print(f"  [Cycle #{cycle}] L2#{frm} × L2#{to}: {desc}")
            else:
                print(f"  [Cycle #{cycle}] L2#{frm} → L2#{to}: {desc}")
    print()


def print_fake_l2():
    """偽のL2シリーズ"""
    print("--- 偽のL2シリーズ ---")
    print()
    for num, name, desc, cycle in FAKE_L2:
        print(f"  [Cycle #{cycle}] {name} (L2#{num}の偽版): {desc}")
    print()


def print_conditions():
    """各L2の成立条件/限界条件"""
    print("--- L2別 成立条件/限界条件 ---")
    print()
    for num in range(1, 8):
        cond = L2_CONDITIONS[num]
        print(f"  L2#{num} {L2_NAMES[num]} (Cycle #{cond['cycle']}で分析)")
        if "成立" in cond:
            print(f"    成立: {', '.join(cond['成立'])}")
        if "構造" in cond:
            print(f"    構造: {', '.join(cond['構造'])}")
        if "限界" in cond:
            print(f"    限界: {', '.join(cond['限界'])}")
        print()


def main():
    print_matrix()
    print_interactions()
    print_fake_l2()
    print_conditions()

    # 統計
    direct_arrows = sum(1 for _, to, _, _, kind in INTERACTIONS
                       if to is not None and kind != "×")
    mutual = sum(1 for _, to, _, _, kind in INTERACTIONS
                if to is not None and kind == "×")
    external = sum(1 for _, to, _, _, _ in INTERACTIONS if to is None)

    print("--- 統計 ---")
    print(f"  因果矢印: {direct_arrows}本")
    print(f"  相互作用: {mutual}組")
    print(f"  外部要因: {external}件")
    print(f"  偽のL2: {len(FAKE_L2)}件")
    total_pairs = 7 * 6 // 2  # 21
    discovered = total_pairs - sum(1 for i in range(1, 8)
                                   for j in range(i + 1, 8)
                                   if all(
                                       not (frm == i and to == j or frm == j and to == i)
                                       for frm, to, _, _, _ in INTERACTIONS
                                       if to is not None
                                   ))
    print(f"  発見済みペア: {discovered}/{total_pairs}")
    print(f"  探索率: {discovered/total_pairs*100:.0f}%")


if __name__ == "__main__":
    main()
