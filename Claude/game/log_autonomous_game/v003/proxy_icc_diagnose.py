#!/usr/bin/env python3
# proxy_icc_diagnose.py — log_autonomous_game v003 Phase 4 (C275)
#
# 役割:
#   measurements_multiseed.jsonl (10 seed_base × 30 trial = 300 行) を入力に、
#   proxy 4 列 (proxy_clear_rate / proxy_damage_per_min / proxy_survival_time /
#   proxy_input_density) の ICC(2,1) one-way random 値 + 95% CI + 判定を計算する。
#
# 由来:
#   Mustahsan 2512.06710 — agent 評価で観測分散を「クエリ間 (タスク難度)」と
#   「クエリ内 (agent 矛盾)」に分解し ICC で再現性チェック。GAIA ICC=0.304-0.774。
#   経験則閾値 ≥0.3 を Pearson 計算の前段「観測分散がそもそも存在するか」の
#   診断レイヤーとして PEARSON_BLOCKER.md 前提 4 に位置付け。
#
# 公式:
#   ICC(2,1) one-way random model:
#     ICC = (MS_between - MS_within) / (MS_between + (k-1) * MS_within)
#     k = trials per seed = 30, N = seed 数 = 10
#   MS_between = (k * Σ_i (mean_i - grand_mean)^2) / (N - 1)
#   MS_within  = (Σ_i Σ_j (x_ij - mean_i)^2) / (N * (k - 1))
#   95% CI は Fisher Z 近似:
#     z = 0.5 * ln((1+r)/(1-r)), SE(z) = 1/√(N-3), z ± 1.96·SE → 逆変換
#
# 制約:
#   依存追加なし (純 stdlib のみ)。scipy / numpy は不要。
#   副作用なし (入力 jsonl は読み取りのみ、新規ファイル作成なし)。
#
# 出力フォーマット (stdout):
#   [ICC] column=proxy_clear_rate icc=... ci_low=... ci_high=... judge=PASS|FAIL
#   ... (4 行)
#   exit 0

import json
import math
import sys
from pathlib import Path

ICC_THRESHOLD = 0.3  # Mustahsan 経験則 (GAIA 下限)
INPUT_PATH = Path(__file__).parent / "measurements_multiseed.jsonl"


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
    """groups: list[list[float]] — 各 seed_base ごとの trial 値配列.
    Returns: (icc, ci_low, ci_high) — Fisher Z 近似 95% CI.
    観測分散ゼロ時は (0.0, 0.0, 0.0)。
    """
    N = len(groups)
    k = len(groups[0])
    if N < 2 or k < 2:
        return 0.0, 0.0, 0.0

    flat = [v for g in groups for v in g]
    grand_mean = sum(flat) / (N * k)

    group_means = [sum(g) / len(g) for g in groups]
    ss_between = k * sum((m - grand_mean) ** 2 for m in group_means)
    ss_within = sum(sum((v - gm) ** 2 for v in g) for g, gm in zip(groups, group_means))

    ms_between = ss_between / (N - 1)
    ms_within = ss_within / (N * (k - 1))

    denom = ms_between + (k - 1) * ms_within
    if denom == 0:
        return 0.0, 0.0, 0.0

    icc = (ms_between - ms_within) / denom

    # ICC が ±1 に近すぎる / N<=3 の場合は CI を退化させて返す
    if N <= 3 or abs(icc) >= 0.9999:
        return icc, icc, icc

    # Fisher Z 近似 (Pearson 相関の CI 公式を ICC に流用)
    # icc が負の場合は arctanh の定義域内に収まるので問題なし
    if icc <= -1.0 or icc >= 1.0:
        return icc, icc, icc

    z = 0.5 * math.log((1.0 + icc) / (1.0 - icc))
    se = 1.0 / math.sqrt(N - 3)
    z_lo = z - 1.96 * se
    z_hi = z + 1.96 * se
    ci_lo = (math.exp(2 * z_lo) - 1.0) / (math.exp(2 * z_lo) + 1.0)
    ci_hi = (math.exp(2 * z_hi) - 1.0) / (math.exp(2 * z_hi) + 1.0)
    return icc, ci_lo, ci_hi


def main():
    if not INPUT_PATH.exists():
        sys.stderr.write(f"[ERROR] input not found: {INPUT_PATH}\n")
        sys.exit(1)

    # seed_base -> list of proxy column dicts
    by_seed = {}
    with INPUT_PATH.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            seed_base = row["seed_base"]
            by_seed.setdefault(seed_base, []).append(derive_proxy_columns(row))

    seed_bases = sorted(by_seed.keys())
    if not seed_bases:
        sys.stderr.write("[ERROR] no rows parsed\n")
        sys.exit(1)

    # スキーマ確認 (10 seed × 30 trial 期待)
    trial_counts = [len(by_seed[s]) for s in seed_bases]
    if len(set(trial_counts)) != 1:
        sys.stderr.write(
            f"[WARN] uneven trial counts: {dict(zip(seed_bases, trial_counts))}\n"
        )

    columns = [
        "proxy_clear_rate",
        "proxy_damage_per_min",
        "proxy_survival_time",
        "proxy_input_density",
    ]

    for col in columns:
        groups = [[row[col] for row in by_seed[s]] for s in seed_bases]
        icc, ci_lo, ci_hi = icc_one_way_random(groups)
        judge = "PASS" if icc >= ICC_THRESHOLD else "FAIL"
        print(
            f"[ICC] column={col} icc={icc:.4f} ci_low={ci_lo:.4f} ci_high={ci_hi:.4f} judge={judge}"
        )


if __name__ == "__main__":
    main()
