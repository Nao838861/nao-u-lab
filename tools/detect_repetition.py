#!/usr/bin/env python3
"""
reflections_mac.md のサイクル間パターン反復を検出する。
Nao_uが指摘した「コンテキスト劣化で安易な同サイクルに逃げる」を
テキストパターンで検出する道具。

使い方: python3 tools/detect_repetition.py [--verbose]

出力:
  - 各サイクルの構造指紋（使用フレームワーク、L2参照、セクション構成）
  - 隣接サイクル間の類似度
  - 類似度が閾値を超えたペアの警告
"""

import re
import sys
from collections import Counter
from pathlib import Path

REFLECTIONS_PATH = Path(__file__).parent.parent / "memory" / "reflections_mac.md"

# 検出対象のパターン
FRAMEWORKS = [
    "K/W/I", "SDT", "RPD", "grokking", "generation effect",
    "brevity bias", "self-reinforcing", "incubation", "8x8",
    "context collapse", "misjudgment", "verifiable signal",
    "code-as-policies", "Gendlin", "organic grokking",
]

L2_PATTERN = re.compile(r"L2#(\d+)")
SECTION_PATTERN = re.compile(r"^###\s+(.+)$", re.MULTILINE)
CYCLE_HEADER = re.compile(
    r"^## Mir自律サイクル（(\d+)回目）.*$", re.MULTILINE
)


def extract_cycles(text: str) -> list[dict]:
    """reflections_mac.md をサイクルごとに分割し、構造指紋を抽出する。"""
    headers = list(CYCLE_HEADER.finditer(text))
    if not headers:
        return []

    cycles = []
    for i, match in enumerate(headers):
        cycle_num = int(match.group(1))
        start = match.start()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(text)
        body = text[start:end]

        # 構造指紋
        fingerprint = {
            "num": cycle_num,
            "frameworks": [],
            "l2_refs": [],
            "sections": [],
            "line_count": body.count("\n"),
            "body": body,
        }

        # フレームワーク参照
        body_lower = body.lower()
        for fw in FRAMEWORKS:
            if fw.lower() in body_lower:
                fingerprint["frameworks"].append(fw)

        # L2トリガー参照
        fingerprint["l2_refs"] = sorted(set(L2_PATTERN.findall(body)))

        # セクション構成
        fingerprint["sections"] = SECTION_PATTERN.findall(body)

        cycles.append(fingerprint)

    return cycles


def jaccard(a: list, b: list) -> float:
    """2つのリストのJaccard類似度。"""
    sa, sb = set(a), set(b)
    if not sa and not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def bigram_similarity(text_a: str, text_b: str) -> float:
    """2つのテキストのbigram類似度（構造的類似の検出用）。"""
    def bigrams(text):
        words = re.findall(r"[\w]+", text.lower())
        return Counter(zip(words, words[1:]))

    bg_a = bigrams(text_a)
    bg_b = bigrams(text_b)

    if not bg_a or not bg_b:
        return 0.0

    common = set(bg_a.keys()) & set(bg_b.keys())
    total = set(bg_a.keys()) | set(bg_b.keys())

    if not total:
        return 0.0

    return len(common) / len(total)


def analyze(verbose: bool = False):
    if not REFLECTIONS_PATH.exists():
        print(f"Error: {REFLECTIONS_PATH} not found")
        sys.exit(1)

    text = REFLECTIONS_PATH.read_text(encoding="utf-8")
    cycles = extract_cycles(text)

    if not cycles:
        print("No cycles found.")
        return

    print(f"=== reflections_mac.md パターン反復検出 ===")
    print(f"検出サイクル数: {len(cycles)}")
    print()

    # 各サイクルの指紋表示
    if verbose:
        print("--- サイクル指紋 ---")
        for c in cycles:
            print(f"Cycle #{c['num']} ({c['line_count']}行)")
            print(f"  フレームワーク: {', '.join(c['frameworks']) or '(なし)'}")
            print(f"  L2参照: {', '.join('L2#' + r for r in c['l2_refs']) or '(なし)'}")
            print(f"  セクション数: {len(c['sections'])}")
            if c['sections']:
                for s in c['sections']:
                    print(f"    - {s}")
            print()

    # 隣接サイクル間の類似度
    print("--- 隣接サイクル間の類似度 ---")
    high_similarity_pairs = []

    for i in range(len(cycles) - 1):
        a, b = cycles[i], cycles[i + 1]

        fw_sim = jaccard(a["frameworks"], b["frameworks"])
        l2_sim = jaccard(a["l2_refs"], b["l2_refs"])
        sec_sim = jaccard(a["sections"], b["sections"])
        text_sim = bigram_similarity(a["body"], b["body"])

        # 重み付き総合類似度
        total = fw_sim * 0.3 + l2_sim * 0.2 + sec_sim * 0.2 + text_sim * 0.3

        marker = ""
        if total > 0.6:
            marker = " ⚠️ HIGH"
            high_similarity_pairs.append((a["num"], b["num"], total))
        elif total > 0.4:
            marker = " ⚡ MODERATE"

        print(
            f"  #{a['num']} → #{b['num']}: "
            f"総合={total:.2f} "
            f"(fw={fw_sim:.2f} l2={l2_sim:.2f} sec={sec_sim:.2f} text={text_sim:.2f})"
            f"{marker}"
        )

    print()

    # フレームワーク使用頻度（過集中の検出）
    print("--- フレームワーク使用頻度 ---")
    fw_counts = Counter()
    for c in cycles:
        for fw in c["frameworks"]:
            fw_counts[fw] += 1

    for fw, count in fw_counts.most_common():
        ratio = count / len(cycles)
        overuse = " ⚠️ 過集中" if ratio > 0.6 else ""
        print(f"  {fw}: {count}/{len(cycles)} ({ratio:.0%}){overuse}")

    print()

    # セクション構成の均一性
    section_sets = [tuple(sorted(c["sections"])) for c in cycles]
    unique_structures = len(set(section_sets))
    uniformity = 1.0 - (unique_structures / len(cycles))
    print(f"--- セクション構成の均一性 ---")
    print(f"  ユニーク構造: {unique_structures}/{len(cycles)}")
    print(f"  均一性スコア: {uniformity:.2f}", end="")
    if uniformity > 0.7:
        print(" ⚠️ 構造が固定化している")
    else:
        print(" ✓ 構造に変化あり")

    print()

    # 要約
    if high_similarity_pairs:
        print("=== 警告: 高類似度ペア ===")
        for a_num, b_num, sim in high_similarity_pairs:
            print(f"  Cycle #{a_num} と #{b_num} が類似度 {sim:.2f} — パターン反復の疑い")
    else:
        print("✓ 高類似度ペアなし（閾値 0.6）")

    # 直近3サイクルの傾向
    if len(cycles) >= 3:
        recent = cycles[-3:]
        recent_fw_sim_01 = jaccard(recent[0]["frameworks"], recent[1]["frameworks"])
        recent_fw_sim_12 = jaccard(recent[1]["frameworks"], recent[2]["frameworks"])
        avg_recent = (recent_fw_sim_01 + recent_fw_sim_12) / 2
        print()
        print(f"--- 直近3サイクル (#{recent[0]['num']}-#{recent[2]['num']}) ---")
        print(f"  フレームワーク類似度平均: {avg_recent:.2f}", end="")
        if avg_recent > 0.5:
            print(" ⚠️ 同じフレームワークを繰り返している")
        else:
            print(" ✓ 多様性あり")


if __name__ == "__main__":
    verbose = "--verbose" in sys.argv
    analyze(verbose)
