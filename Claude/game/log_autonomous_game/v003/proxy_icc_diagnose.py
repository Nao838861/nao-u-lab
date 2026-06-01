#!/usr/bin/env python3
# proxy_icc_diagnose.py — log_autonomous_game v003 Phase 4 (C275 初版 / C277 class 軸拡張)
#
# 役割:
#   proxy 4 列 (proxy_clear_rate / proxy_damage_per_min / proxy_survival_time /
#   proxy_input_density) の ICC(2,1) one-way random 値 + 95% CI + 判定を計算する。
#
# 入力:
#   - jsonl: measurements_multiseed.jsonl (10 seed_base × 30 trial = 300 行)
#       row["seed_base"] / row["outcome"] / row["play_time_sec"] / row["cast_count"]
#       から proxy 4 列を derive する (build_proxy_csv.js と同一定義)
#   - csv : proxy_vs_judgment_labeled.csv (10 seed × 3 v_label × 30 trial = 900 行)
#       proxy 4 列は既存列としてそのまま読む
#
# CLI:
#   --input <path>          入力ファイル (.jsonl または .csv)
#   --class-col <name>      class 軸列名 (jsonl デフォルト: seed_base / csv: seed_base or v_label)
#
# 由来:
#   Mustahsan 2512.06710 — agent 評価で観測分散を「クエリ間 (タスク難度)」と
#   「クエリ内 (agent 矛盾)」に分解し ICC で再現性チェック。GAIA ICC=0.304-0.774。
#   経験則閾値 ≥0.3 を Pearson 計算の前段「観測分散がそもそも存在するか」の
#   診断レイヤーとして PEARSON_BLOCKER.md 前提 4 に位置付け。
#   C277 拡張: PEARSON_BLOCKER.md §6-3 (a) 絶対軸 gate 判定で v_label class 切替再計算
#   を可能にし、seed_base class での ICC ≈ 0 FAIL を v_label class で再判定する。
#
# 公式:
#   ICC(2,1) one-way random model:
#     ICC = (MS_between - MS_within) / (MS_between + (k-1) * MS_within)
#     k = trials per class, N = class 数
#   MS_between = (k * Σ_i (mean_i - grand_mean)^2) / (N - 1)
#   MS_within  = (Σ_i Σ_j (x_ij - mean_i)^2) / (N * (k - 1))
#   95% CI は Fisher Z 近似:
#     z = 0.5 * ln((1+r)/(1-r)), SE(z) = 1/√(N-3), z ± 1.96·SE → 逆変換
#   N ≤ 3 は CI 退化 (point=lo=hi)。
#
# 制約:
#   依存追加なし (純 stdlib のみ)。scipy / numpy / pandas は不要。
#   副作用なし (入力 jsonl / csv は読み取りのみ、新規ファイル作成なし)。
#
# 出力フォーマット (stdout):
#   [ICC] column=proxy_clear_rate icc=... ci_low=... ci_high=... judge=PASS|FAIL
#   ... (4 行)
#   exit 0

import argparse
import csv
import json
import math
import sys
from pathlib import Path

ICC_THRESHOLD = 0.3  # Mustahsan 経験則 (GAIA 下限)

PROXY_COLUMNS = [
    "proxy_clear_rate",
    "proxy_damage_per_min",
    "proxy_survival_time",
    "proxy_input_density",
]

DEFAULT_INPUT = Path(__file__).parent / "measurements_multiseed.jsonl"


def derive_proxy_columns(row):
    """jsonl 1 行から proxy 4 列を計算 (build_proxy_csv.js と同一定義)."""
    survived = 1 if row["outcome"] == "survived" else 0
    play_time = row["play_time_sec"]
    cast_count = row["cast_count"]

    damage_per_min = 0.0 if survived else (60.0 / play_time if play_time > 0 else 0.0)
    survival_time = play_time
    input_density = (cast_count / play_time * 60.0) if play_time > 0 else 0.0

    return {
        "proxy_clear_rate": float(survived),
        "proxy_damage_per_min": damage_per_min,
        "proxy_survival_time": survival_time,
        "proxy_input_density": input_density,
    }


def icc_one_way_random(groups):
    """groups: list[list[float]] — 各 class ごとの trial 値配列.
    Returns: (icc, ci_low, ci_high) — Fisher Z 近似 95% CI.
    観測分散ゼロ時は (0.0, 0.0, 0.0)。
    """
    N = len(groups)
    if N < 2:
        return 0.0, 0.0, 0.0
    sizes = [len(g) for g in groups]
    if any(s < 2 for s in sizes):
        return 0.0, 0.0, 0.0
    # 不均衡 design 時は k = 平均 group size を採用 (one-way random で許容)
    k = sizes[0] if len(set(sizes)) == 1 else sum(sizes) / N

    flat = [v for g in groups for v in g]
    total = sum(sizes)
    grand_mean = sum(flat) / total

    group_means = [sum(g) / len(g) for g in groups]
    ss_between = sum(s * (m - grand_mean) ** 2 for s, m in zip(sizes, group_means))
    ss_within = sum(sum((v - gm) ** 2 for v in g) for g, gm in zip(groups, group_means))

    ms_between = ss_between / (N - 1)
    ms_within = ss_within / (total - N)

    denom = ms_between + (k - 1) * ms_within
    if denom == 0:
        return 0.0, 0.0, 0.0

    icc = (ms_between - ms_within) / denom

    # ICC が ±1 に近すぎる / N<=3 の場合は CI を退化させて返す
    if N <= 3 or abs(icc) >= 0.9999:
        return icc, icc, icc

    if icc <= -1.0 or icc >= 1.0:
        return icc, icc, icc

    z = 0.5 * math.log((1.0 + icc) / (1.0 - icc))
    se = 1.0 / math.sqrt(N - 3)
    z_lo = z - 1.96 * se
    z_hi = z + 1.96 * se
    ci_lo = (math.exp(2 * z_lo) - 1.0) / (math.exp(2 * z_lo) + 1.0)
    ci_hi = (math.exp(2 * z_hi) - 1.0) / (math.exp(2 * z_hi) + 1.0)
    return icc, ci_lo, ci_hi


def load_by_class_jsonl(path, class_col):
    by_class = {}
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            if class_col not in row:
                sys.stderr.write(f"[ERROR] class-col '{class_col}' not in jsonl row\n")
                sys.exit(1)
            cls = row[class_col]
            by_class.setdefault(cls, []).append(derive_proxy_columns(row))
    return by_class


def load_by_class_csv(path, class_col):
    by_class = {}
    with path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if class_col not in (reader.fieldnames or []):
            sys.stderr.write(
                f"[ERROR] class-col '{class_col}' not in csv header {reader.fieldnames}\n"
            )
            sys.exit(1)
        missing = [c for c in PROXY_COLUMNS if c not in (reader.fieldnames or [])]
        if missing:
            sys.stderr.write(f"[ERROR] csv missing proxy columns: {missing}\n")
            sys.exit(1)
        for row in reader:
            cls = row[class_col]
            try:
                proxy = {col: float(row[col]) for col in PROXY_COLUMNS}
            except ValueError as e:
                sys.stderr.write(f"[ERROR] csv parse error: {e}\n")
                sys.exit(1)
            by_class.setdefault(cls, []).append(proxy)
    return by_class


def parse_args():
    p = argparse.ArgumentParser(
        description="ICC(2,1) one-way random diagnose for proxy 4 columns"
    )
    p.add_argument(
        "--input",
        default=str(DEFAULT_INPUT),
        help="入力ファイル (.jsonl または .csv)、デフォルト = measurements_multiseed.jsonl",
    )
    p.add_argument(
        "--class-col",
        default="seed_base",
        help="class 軸列名 (デフォルト seed_base、csv では v_label も指定可)",
    )
    return p.parse_args()


def main():
    args = parse_args()
    path = Path(args.input)
    if not path.exists():
        sys.stderr.write(f"[ERROR] input not found: {path}\n")
        sys.exit(1)

    suffix = path.suffix.lower()
    if suffix == ".jsonl":
        by_class = load_by_class_jsonl(path, args.class_col)
    elif suffix == ".csv":
        by_class = load_by_class_csv(path, args.class_col)
    else:
        sys.stderr.write(f"[ERROR] unsupported extension: {suffix}\n")
        sys.exit(1)

    classes = sorted(by_class.keys(), key=str)
    if not classes:
        sys.stderr.write("[ERROR] no rows parsed\n")
        sys.exit(1)

    trial_counts = [len(by_class[c]) for c in classes]
    if len(set(trial_counts)) != 1:
        sys.stderr.write(
            f"[WARN] uneven trial counts: {dict(zip(classes, trial_counts))}\n"
        )

    for col in PROXY_COLUMNS:
        groups = [[row[col] for row in by_class[c]] for c in classes]
        icc, ci_lo, ci_hi = icc_one_way_random(groups)
        judge = "PASS" if icc >= ICC_THRESHOLD else "FAIL"
        print(
            f"[ICC] column={col} icc={icc:.4f} ci_low={ci_lo:.4f} ci_high={ci_hi:.4f} judge={judge}"
        )


if __name__ == "__main__":
    main()
