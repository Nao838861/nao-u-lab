#!/usr/bin/env python3
"""
twitter全発言ログを200行単位でスキャンし、
L2トリガーのキーワード出現密度を時系列で可視化する。

detect_repetition.pyが「Mirの反復」を検出するなら、
これは「Nao_uの関心の波」を検出する。

使い方: python3 tools/l2_density_scan.py [--window 200] [--start 0]
"""

import re
import sys
from pathlib import Path

TWITTER_PATH = Path(__file__).parent.parent / "過去発言" / "twitter全発言ログ.txt"

# L2トリガーごとのキーワード群
# キーワードは原文から抽出した特徴的な語句
L2_KEYWORDS = {
    "L2#1 宮本茂の公理": [
        "何をすべきか", "なぜ失敗", "レベルデザイン", "難易度",
        "チュートリアル", "導入", "フィードバック", "上達",
        "ノーダメージ", "理不尽", "死んで覚える", "トライ",
    ],
    "L2#2 文明発展史": [
        "文明", "積み重ね", "退行", "技術断絶",
        "ゼロから", "再構築", "世代", "継承",
    ],
    "L2#3 行間のノウハウ": [
        "行間", "言語化できない", "暗黙", "ノウハウ",
        "うまく説明", "なんかいい", "気持ちいい",
        "何が違うか", "わからないけど好き",
    ],
    "L2#4 安心して忘れる": [
        "忘れ", "安心", "メモ", "記録", "保存",
        "バックアップ", "セーブ",
    ],
    "L2#5 動機の揮発性": [
        "やる気", "面倒", "飽き", "続かな", "モチベ",
        "積みゲー", "積ん", "いつか", "そのうち",
        "覚悟", "本気",
    ],
    "L2#6 捨てない原則": [
        "捨て", "処分", "もったいな", "後悔",
        "取っておい", "押入れ", "保管",
    ],
    "L2#7 作る衝動": [
        "作りたい", "作った", "自作", "プログラ",
        "コード", "実装", "開発", "BASIC", "アセンブ",
        "Scratch", "Unity", "Godot", "Houdini",
        "ファミコン", "メガドラ", "MSX",
    ],
}


def scan(window: int = 200, start: int = 0):
    if not TWITTER_PATH.exists():
        print(f"Error: {TWITTER_PATH} not found")
        sys.exit(1)

    lines = TWITTER_PATH.read_text(encoding="utf-8").splitlines()
    total = len(lines)
    print(f"=== L2出現密度マップ ===")
    print(f"総行数: {total}, ウィンドウ: {window}行, 開始: {start}行目")
    print()

    # ヘッダー
    short_names = [k.split(" ")[0] for k in L2_KEYWORDS.keys()]
    header = f"{'区間':>14} | " + " | ".join(f"{n:>6}" for n in short_names)
    print(header)
    print("-" * len(header))

    # 各区間の最大値を追跡（ヒートマップ用）
    all_counts = []

    pos = start
    while pos < total:
        end = min(pos + window, total)
        chunk = "\n".join(lines[pos:end]).lower()

        counts = {}
        for l2_name, keywords in L2_KEYWORDS.items():
            short = l2_name.split(" ")[0]
            count = 0
            for kw in keywords:
                count += len(re.findall(re.escape(kw.lower()), chunk))
            counts[short] = count

        all_counts.append((pos, end, counts))

        # 行の表示
        label = f"{pos+1}-{end}"
        bars = []
        for n in short_names:
            c = counts[n]
            if c == 0:
                bars.append(f"{'·':>6}")
            elif c <= 2:
                bars.append(f"{c:>6}")
            elif c <= 5:
                bars.append(f"{'▪' * c:>6}")
            else:
                bars.append(f"{'█' * min(c, 6):>6}")
        print(f"{label:>14} | " + " | ".join(bars))

        pos = end

    print()

    # 集計: 各L2の総出現数と最頻区間
    print("--- L2別サマリー ---")
    for l2_name in L2_KEYWORDS:
        short = l2_name.split(" ")[0]
        total_count = sum(c[2][short] for c in all_counts)
        if total_count == 0:
            continue
        peak_idx = max(range(len(all_counts)), key=lambda i: all_counts[i][2][short])
        peak = all_counts[peak_idx]
        print(
            f"  {l2_name}: 総計{total_count}, "
            f"ピーク={peak[0]+1}-{peak[1]}行 ({peak[2][short]}件)"
        )

    # 直近5区間の傾向
    if len(all_counts) >= 5:
        print()
        print("--- 直近5区間の傾向 ---")
        recent = all_counts[-5:]
        for pos_s, pos_e, counts in recent:
            active = [f"{n}={c}" for n, c in counts.items() if c > 0]
            print(f"  {pos_s+1}-{pos_e}: {', '.join(active) if active else '(静寂)'}")


if __name__ == "__main__":
    window = 200
    start = 0

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--window" and i + 1 < len(args):
            window = int(args[i + 1])
            i += 2
        elif args[i] == "--start" and i + 1 < len(args):
            start = int(args[i + 1])
            i += 2
        else:
            i += 1

    scan(window, start)
