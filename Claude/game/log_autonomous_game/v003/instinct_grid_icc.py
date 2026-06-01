#!/usr/bin/env python3
# instinct_grid_icc.py — log_autonomous_game v003 C284 Phase 4
#
# 役割:
#   instinct_probe.js が出力する measurements_instinct_grid.jsonl (戦略 × seed × trial=1
#   形式の jsonl) について、probe_density 列に **戦略軸** ICC(2,1) を計算する。
#   proxy_icc_diagnose.py が seed_base 軸で 4 列とも ICC≈0 / FAIL 確定済 → 軸を変える
#   処方の第 1 段。戦略軸で probe が分離 (ICC≥0.3) すれば本能側計測経路の最小バリ
#   デーション PASS、FAIL なら probe 設計 (PROBE_WINDOW_FRAMES / dirToken 粒度) 再検討。
#
# 公式 (proxy_icc_diagnose.py と同型):
#   ICC(2,1) one-way random:
#     ICC = (MS_between - MS_within) / (MS_between + (k-1) * MS_within)
#   95% CI: Fisher Z 近似 (N>3 のとき)
#
# 入力 (jsonl, 各行):
#   {"strategy": "naive_good", "probe_density": 0.2222, ...}
#   probe_density が null の行はスキップ。
#
# CLI:
#   --input PATH   default = measurements_instinct_grid.jsonl
#   --column NAME  default = probe_density (将来 post_lock_input_count 等切替用)
#
# 出力 (stdout):
#   [ICC] column=probe_density classes=3 trials=10 icc=... ci_low=... ci_high=... judge=PASS|FAIL
#   [SUMMARY] strategy=naive_good mean=... var=... n=10
#   [SUMMARY] strategy=camper mean=... var=... n=10
#   [SUMMARY] strategy=blind-sweeper mean=... var=... n=10
#
# 制約: 純 stdlib のみ。副作用なし (入力 jsonl は読み取りのみ)。

import argparse
import json
import math
import sys
from pathlib import Path

ICC_THRESHOLD = 0.3  # Mustahsan 経験則 (GAIA 下限) — proxy_icc_diagnose.py と同値

DEFAULT_INPUT = Path(__file__).parent / "measurements_instinct_grid.jsonl"


def icc_one_way_random(groups):
    """proxy_icc_diagnose.py icc_one_way_random と同型. 観測分散ゼロは (0,0,0)."""
    N = len(groups)
    if N < 2:
        return 0.0, 0.0, 0.0
    sizes = [len(g) for g in groups]
    if any(s < 2 for s in sizes):
        return 0.0, 0.0, 0.0
    k = sizes[0] if len(set(sizes)) == 1 else sum(sizes) / N

    flat = [v for g in groups for v in g]
    total = sum(sizes)
    grand_mean = sum(flat) / total

    group_means = [sum(g) / len(g) for g in groups]
    ss_between = sum(s * (m - grand_mean) ** 2 for s, m in zip(sizes, group_means))
    ss_within = sum(sum((v - gm) ** 2 for v in g) for g, gm in zip(groups, group_means))

    ms_between = ss_between / (N - 1)
    ms_within = ss_within / (total - N) if total > N else 0.0

    denom = ms_between + (k - 1) * ms_within
    if denom == 0:
        return 0.0, 0.0, 0.0

    icc = (ms_between - ms_within) / denom

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


def load_grouped(path, column):
    by_strategy = {}
    skipped = 0
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            v = row.get(column)
            if v is None:
                skipped += 1
                continue
            key = row.get("strategy", "<unknown>")
            by_strategy.setdefault(key, []).append(float(v))
    if skipped:
        sys.stderr.write(f"[INFO] {skipped} rows skipped (column '{column}' null)\n")
    return by_strategy


def variance(values):
    n = len(values)
    if n < 2:
        return 0.0
    m = sum(values) / n
    return sum((v - m) ** 2 for v in values) / (n - 1)


def parse_args():
    p = argparse.ArgumentParser(description="instinct_probe strategy-axis ICC(2,1)")
    p.add_argument("--input", default=str(DEFAULT_INPUT), help="jsonl path")
    p.add_argument("--column", default="probe_density", help="metric column")
    return p.parse_args()


def main():
    args = parse_args()
    path = Path(args.input)
    if not path.exists():
        sys.stderr.write(f"[ERROR] input not found: {path}\n")
        sys.exit(1)

    by_strategy = load_grouped(path, args.column)
    if not by_strategy:
        sys.stderr.write("[ERROR] no rows parsed\n")
        sys.exit(1)

    strategies = sorted(by_strategy.keys())
    groups = [by_strategy[s] for s in strategies]
    trial_counts = [len(g) for g in groups]
    trials_disp = trial_counts[0] if len(set(trial_counts)) == 1 else "uneven"

    icc, ci_lo, ci_hi = icc_one_way_random(groups)
    judge = "PASS" if icc >= ICC_THRESHOLD else "FAIL"
    print(
        f"[ICC] column={args.column} classes={len(strategies)} trials={trials_disp} "
        f"icc={icc:.4f} ci_low={ci_lo:.4f} ci_high={ci_hi:.4f} judge={judge}"
    )
    for s in strategies:
        vals = by_strategy[s]
        m = sum(vals) / len(vals)
        v = variance(vals)
        print(f"[SUMMARY] strategy={s} mean={m:.4f} var={v:.6f} n={len(vals)}")


if __name__ == "__main__":
    main()
