#!/usr/bin/env python3
"""
Germane Load 検出器 (Cycle #46で作成)

reflections_mac.md の各サイクルを分析し、
WHY（因果・構造的説明）vs WHAT（事実・行動記録）の比率を計測する。

ボウタイのウエスト（行間/L2#3）を通過したかの間接指標。
- WHY比率が高い = germane load処理あり = ウエスト通過
- WHY比率が低い = extraneous loadのみ = ウエスト迂回の可能性

使い方: python3 tools/germane_detector.py [最新N件]
"""

import re
import sys

# WHY指標: 因果・構造・意味の接続を示す表現
# 精度重視: 文脈的に因果・構造を示す表現のみ
WHY_MARKERS = [
    r'なぜ[なか]', r'だから[。、]', r'というのは', r'の理由',
    r'つまり[、。]', r'本質[はがをで]', r'構造的[にな]',
    r'の意味[はが]', r'を意味する',
    r'示唆', r'予言',
    r'なのは[、。]', r'ためだ[。]', r'ために[、。]',
    r'偽のL2', r'ボウタイ', r'ウエスト[をがはの（]',
    r'足場[をがはの（]', r'代替[をがはの（]',
    r'germane', r'extraneous',
    r'フィードバック係数',
    r'ことの[意証裏]',  # ことの意味、ことの証明、ことの裏付け
    r'[がはを]意味[しす]',
    r'これ[はが]L2',  # 構造への接続
    r'まさに',  # 構造的同一性の発見
]

# WHAT指標: 事実・行動・手続きの記録
WHAT_MARKERS = [
    r'を読んだ', r'行目[（(）)]', r'に投稿',
    r'git\s+p', r'を確認[。し]', r'受信箱.*空',
    r'ツイート.*[0-9]+件', r'に追記',
    r'更新なし', r'完了[:：。]',
    r'サイクル.*完了', r'を追加',
    r'件[。、）)]',  # N件で終わる文
    r'を実装[。し]',  # 実装の事実報告
    r'行超[）)]',  # N行超
]


def extract_cycles(text):
    """テキストからサイクル単位でセクションを抽出"""
    # "### Cycle #NN" or "### Cycle NN" パターンで分割
    pattern = r'^### Cycle\s+#?(\d+).*$'
    cycles = []
    current_num = None
    current_lines = []

    for line in text.split('\n'):
        m = re.match(pattern, line)
        if m:
            if current_num is not None:
                cycles.append((current_num, '\n'.join(current_lines)))
            current_num = int(m.group(1))
            current_lines = [line]
        elif current_num is not None:
            current_lines.append(line)

    if current_num is not None:
        cycles.append((current_num, '\n'.join(current_lines)))

    return cycles


def count_markers(text, patterns):
    """テキスト内のマーカー出現数を計測"""
    total = 0
    for pat in patterns:
        total += len(re.findall(pat, text))
    return total


def analyze_cycle(num, text):
    """1サイクルのgermane load分析"""
    why_count = count_markers(text, WHY_MARKERS)
    what_count = count_markers(text, WHAT_MARKERS)

    total = why_count + what_count
    if total == 0:
        ratio = 0.0
    else:
        ratio = why_count / total

    # テキスト量（行数、空行除く）
    lines = [l for l in text.split('\n') if l.strip()]
    line_count = len(lines)

    # WHY密度 = WHYマーカー数 / 実質行数
    why_density = why_count / max(line_count, 1)

    return {
        'num': num,
        'why': why_count,
        'what': what_count,
        'ratio': ratio,
        'lines': line_count,
        'density': why_density,
    }


def rating(ratio):
    """比率から健全性を判定"""
    if ratio >= 0.75:
        return "◆◆◆ 深い構造分析"
    elif ratio >= 0.60:
        return "◆◆  構造的思考あり"
    elif ratio >= 0.45:
        return "◆   バランス"
    elif ratio >= 0.30:
        return "▽   事実寄り"
    else:
        return "▽▽  記録のみ（ウエスト迂回?）"


def main():
    # 引数: 最新N件（デフォルト10）
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 10

    filepath = 'memory/reflections_mac.md'
    try:
        with open(filepath, 'r') as f:
            text = f.read()
    except FileNotFoundError:
        print(f"Error: {filepath} not found")
        sys.exit(1)

    cycles = extract_cycles(text)
    if not cycles:
        print("No cycles found")
        sys.exit(1)

    # 最新N件
    target = cycles[-n:]

    print("=" * 70)
    print(f"Germane Load 検出器 — 最新 {len(target)} サイクル")
    print("=" * 70)
    print()
    print(f"  {'Cycle':>7}  {'WHY':>4}  {'WHAT':>5}  {'比率':>6}  "
          f"{'行数':>4}  {'密度':>5}  判定")
    print(f"  {'-----':>7}  {'----':>4}  {'-----':>5}  {'------':>6}  "
          f"{'----':>4}  {'-----':>5}  ------")

    results = []
    for num, body in target:
        r = analyze_cycle(num, body)
        results.append(r)
        print(f"  #{r['num']:>5}    {r['why']:3d}    {r['what']:3d}   "
              f"{r['ratio']:.1%}    {r['lines']:3d}   "
              f"{r['density']:.2f}  {rating(r['ratio'])}")

    print()

    # 全体統計
    if results:
        avg_ratio = sum(r['ratio'] for r in results) / len(results)
        avg_density = sum(r['density'] for r in results) / len(results)
        avg_lines = sum(r['lines'] for r in results) / len(results)

        print(f"  平均比率: {avg_ratio:.1%}  平均密度: {avg_density:.2f}  "
              f"平均行数: {avg_lines:.0f}")

        # トレンド（前半 vs 後半）
        if len(results) >= 4:
            mid = len(results) // 2
            first_half = sum(r['ratio'] for r in results[:mid]) / mid
            second_half = sum(r['ratio'] for r in results[mid:]) / (len(results) - mid)
            trend = second_half - first_half
            if trend > 0.05:
                print(f"  トレンド: ↑ WHY比率上昇中 ({first_half:.1%} → {second_half:.1%})")
            elif trend < -0.05:
                print(f"  トレンド: ↓ WHY比率低下中 ({first_half:.1%} → {second_half:.1%})")
            else:
                print(f"  トレンド: → 安定 ({first_half:.1%} → {second_half:.1%})")

        print()
        print("  凡例: WHY=因果・構造・意味の接続  WHAT=事実・行動の記録")
        print("        比率=WHY/(WHY+WHAT)  密度=WHY/行数")
        print("        ◆=ウエスト通過  ▽=ウエスト迂回の可能性")


if __name__ == "__main__":
    main()
