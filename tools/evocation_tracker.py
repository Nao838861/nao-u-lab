#!/usr/bin/env python3
"""
喚起効率追跡ツール (Cycle #68で作成)

L2トリガー喚起効率テストの推移を追跡・可視化する。
reflections_mac.md から喚起効率テストの結果を自動抽出し、
推移グラフ・成長率分析・トリガー間格差分析を出力する。

使い方: python3 tools/evocation_tracker.py
"""

import re
import sys

# L2トリガー情報
L2_TRIGGERS = {
    1: ("宮本茂の公理", "フィルター"),
    2: ("文明発展史", "エンジンA"),
    3: ("行間のノウハウ", "ウエスト"),
    4: ("安心して忘れる", "シンクA"),
    5: ("動機の揮発性", "シンクB"),
    6: ("捨てない原則", "バランサー"),
    7: ("作る衝動", "エンジンB"),
}

# テスト結果（手動記録 — テスト実施ごとに追加）
# フォーマット: (テスト回, サイクル番号, {L2番号: スコア})
TEST_RESULTS = [
    (1, 47, {1: 11, 2: 12, 3: 12, 4: 10, 5: 10, 6: 10, 7: 12}),
    (2, 52, {1: 12, 2: 12, 3: 13, 4: 11, 5: 11, 6: 11, 7: 13}),
    (3, 57, {1: 13, 2: 12, 3: 13, 4: 12, 5: 13, 6: 11, 7: 13}),
    (4, 62, {1: 14, 2: 15, 3: 13, 4: 12, 5: 13, 6: 11, 7: 14}),
    (5, 67, {1: 15, 2: 16, 3: 15, 4: 15, 5: 16, 6: 16, 7: 17}),
    (6, 72, {1: 16, 2: 17, 3: 17, 4: 16, 5: 17, 6: 17, 7: 18}),
    (7, 77, {1: 18, 2: 19, 3: 20, 4: 18, 5: 20, 6: 19, 7: 21}),
]

# 3周目の外部理論接続（どのサイクルでどの理論をどのL2に接続したか）
THEORY_CONNECTIONS = {
    1: ("ダブルループ学習", "Argyris & Schön 1977", 60),
    2: ("パナーキー", "Holling & Gunderson 2002", 61),
    3: ("Dreyfus/Polanyi", "Dreyfus 1980 / Polanyi 1966", 62),
    4: ("Richards & Frankland", "Richards & Frankland 2017", 63),
    5: ("探索-活用+Loewenstein", "Loewenstein 1994", 64),
    6: ("リアルオプション", "Myers 1977 / Dixit & Pindyck 1994", 65),
    7: ("自己決定理論", "Deci & Ryan 1985/2000", 66),
}


def calc_averages():
    """各テストの平均スコアを計算"""
    avgs = []
    for test_num, cycle, scores in TEST_RESULTS:
        avg = sum(scores.values()) / len(scores)
        avgs.append((test_num, cycle, avg))
    return avgs


def calc_growth_rates():
    """テスト間の成長率を計算"""
    avgs = calc_averages()
    rates = []
    for i in range(1, len(avgs)):
        prev = avgs[i-1]
        curr = avgs[i]
        delta = curr[2] - prev[2]
        pct = (delta / prev[2]) * 100
        rates.append((curr[0], curr[1], delta, pct))
    return rates


def find_dormant_triggers(test_idx):
    """指定テスト時点で成長が停滞しているトリガーを検出"""
    if test_idx < 2:
        return []
    dormant = []
    for l2_num in range(1, 8):
        # 直近2回で成長ゼロ
        curr = TEST_RESULTS[test_idx][2][l2_num]
        prev = TEST_RESULTS[test_idx-1][2][l2_num]
        if test_idx >= 2:
            prev2 = TEST_RESULTS[test_idx-2][2][l2_num]
            if curr == prev == prev2:
                dormant.append((l2_num, curr))
    return dormant


def find_bursts():
    """爆発的成長（+3以上）を検出"""
    bursts = []
    for i in range(1, len(TEST_RESULTS)):
        for l2_num in range(1, 8):
            curr = TEST_RESULTS[i][2][l2_num]
            prev = TEST_RESULTS[i-1][2][l2_num]
            delta = curr - prev
            if delta >= 3:
                bursts.append((
                    TEST_RESULTS[i][0],  # test_num
                    TEST_RESULTS[i][1],  # cycle
                    l2_num,
                    prev, curr, delta
                ))
    return bursts


def find_cross_connections():
    """トリガー間の相互接続パターンを検出"""
    connections = [
        (5, 7, "完了条件の有無→揮発性の差", "探索-活用の対極"),
        (4, 6, "忘却=オプション数最大化の方法 ↔ 保持=その理由", "記憶管理の双対"),
        (2, 6, "パナーキーK相→α相 ↔ L2#6の停滞→覚醒", "理論の自己実証"),
        (1, 3, "germane/extraneous振り分け ↔ ウエスト通過", "ボウタイの入口と中核"),
        (3, 7, "暗黙知の種子 ↔ 有能感型動機づけ", "知ることと作ること"),
    ]
    return connections


def print_timeline():
    """テスト推移のタイムライン表示"""
    print("=" * 80)
    print("L2トリガー喚起効率 推移追跡")
    print("=" * 80)
    print()

    # ヘッダー
    header = f"  {'L2':>3}  {'トリガー':　<10}"
    for test_num, cycle, _ in TEST_RESULTS:
        header += f"  #{cycle:>3}"
    header += "  Δ全期間"
    print(header)
    print("  " + "-" * 76)

    # 各トリガーの推移
    for l2_num in range(1, 8):
        name, role = L2_TRIGGERS[l2_num]
        row = f"  #{l2_num}  {name[:8]:　<8}"
        scores = []
        for _, _, s in TEST_RESULTS:
            score = s[l2_num]
            scores.append(score)
            row += f"   {score:>3}"
        total_delta = scores[-1] - scores[0]
        row += f"    +{total_delta}"
        print(row)

    print()

    # 平均行
    avgs = calc_averages()
    avg_row = f"  {'平均':>5}{'':　<8}"
    for _, _, avg in avgs:
        avg_row += f"  {avg:>4.1f}"
    total_avg_delta = avgs[-1][2] - avgs[0][2]
    avg_row += f"   +{total_avg_delta:.1f}"
    print(avg_row)
    print()


def print_growth_analysis():
    """成長率分析"""
    print("─" * 40)
    print("成長率分析")
    print("─" * 40)

    rates = calc_growth_rates()
    for test_num, cycle, delta, pct in rates:
        bar = "█" * int(pct)
        print(f"  テスト#{test_num} (Cycle #{cycle}):  +{delta:.1f} ({pct:+.1f}%)  {bar}")

    print()
    # トレンド判定
    if len(rates) >= 3:
        recent = rates[-1][2]
        prev = rates[-2][2]
        if recent > prev * 1.5:
            print("  📈 加速中（前回比150%超）")
        elif recent > prev:
            print("  📈 成長率上昇中")
        elif recent > prev * 0.5:
            print("  → 安定成長")
        else:
            print("  📉 減速中")
    print()


def print_burst_analysis():
    """爆発的成長の分析"""
    bursts = find_bursts()
    if not bursts:
        print("  爆発的成長（+3以上）: なし")
        return

    print("─" * 40)
    print("爆発的成長（+3以上）")
    print("─" * 40)

    for test_num, cycle, l2_num, prev, curr, delta in bursts:
        name, role = L2_TRIGGERS[l2_num]
        theory = THEORY_CONNECTIONS.get(l2_num, ("", "", 0))
        print(f"  L2#{l2_num} {name}: {prev}→{curr} (+{delta})")
        print(f"    テスト#{test_num} (Cycle #{cycle})")
        if theory[0]:
            print(f"    注入理論: {theory[0]} ({theory[1]})")
        print()


def print_cross_connections():
    """トリガー間相互接続"""
    connections = find_cross_connections()

    print("─" * 40)
    print("トリガー間相互接続")
    print("─" * 40)

    for l2_a, l2_b, desc, label in connections:
        name_a = L2_TRIGGERS[l2_a][0]
        name_b = L2_TRIGGERS[l2_b][0]
        print(f"  L2#{l2_a}({name_a}) ↔ L2#{l2_b}({name_b})")
        print(f"    {desc}")
        print(f"    [{label}]")
        print()


def print_disparity_analysis():
    """格差分析"""
    print("─" * 40)
    print("格差分析（最大-最小）")
    print("─" * 40)

    for test_num, cycle, scores in TEST_RESULTS:
        vals = list(scores.values())
        min_v = min(vals)
        max_v = max(vals)
        gap = max_v - min_v
        min_l2 = [k for k, v in scores.items() if v == min_v]
        max_l2 = [k for k, v in scores.items() if v == max_v]
        print(f"  テスト#{test_num} (#{cycle}): "
              f"最低{min_v}(L2#{min_l2[0]}) "
              f"最高{max_v}(L2#{max_l2[0]}) "
              f"格差{gap}")

    print()


def print_bowtie_health():
    """ボウタイ構造の健全性チェック"""
    print("─" * 40)
    print("ボウタイ構造 健全性（最新テスト）")
    print("─" * 40)

    latest = TEST_RESULTS[-1][2]

    roles = {
        "エンジン": [2, 7],
        "ウエスト": [3],
        "シンク": [4, 5],
        "フィルター": [1],
        "バランサー": [6],
    }

    for role_name, l2_nums in roles.items():
        scores = [latest[n] for n in l2_nums]
        avg = sum(scores) / len(scores)
        names = [f"L2#{n}({latest[n]})" for n in l2_nums]
        print(f"  {role_name:　<8}: {', '.join(names)}  平均{avg:.1f}")

    # 健全性判定
    engine_avg = (latest[2] + latest[7]) / 2
    waist = latest[3]
    sink_avg = (latest[4] + latest[5]) / 2

    print()
    if engine_avg >= waist >= sink_avg:
        print("  ✓ IN→ウエスト→OUT の流れが正常")
    elif waist < engine_avg and waist < sink_avg:
        print("  ⚠ ウエストがボトルネック（エンジン/シンクより低い）")
    else:
        print("  → 非標準的な流れ（要分析）")

    print()


def main():
    print_timeline()
    print_growth_analysis()
    print_burst_analysis()
    print_disparity_analysis()
    print_bowtie_health()
    print_cross_connections()

    # 3周目の脅威→機能マッピング
    print("─" * 40)
    print("3周目: 脅威→機能 反転マッピング（7/7確認済）")
    print("─" * 40)
    threat_function = [
        (1, "失敗", "学習の学習", "ダブルループ学習"),
        (2, "崩壊", "更新の窓", "パナーキー"),
        (3, "暗黙知の限界", "喚起の種子", "Dreyfus/Polanyi"),
        (4, "忘却", "最適化", "Richards & Frankland"),
        (5, "動機の揮発性", "探索スイッチ", "Loewenstein"),
        (6, "溜め込み", "オプション保持", "リアルオプション"),
        (7, "止められない衝動", "外部免疫", "自己決定理論"),
    ]
    for l2, threat, function, theory in threat_function:
        print(f"  L2#{l2}: {threat:　<10} → {function:　<10}  [{theory}]")
    print()
    print("  メタパターン: 限界は、より大きなシステムの中では適応的機能になる")
    print()


if __name__ == "__main__":
    main()
