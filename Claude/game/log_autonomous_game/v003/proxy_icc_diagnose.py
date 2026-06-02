#!/usr/bin/env python3
# proxy_icc_diagnose.py — log_autonomous_game v003 Phase 4
#   C275 初版 (ICC seed_base class on jsonl)
#   C277 拡張 (--class-col / --input、v_label class on csv)
#   C279 拡張 (--metric spearman、bootstrap 95% CI、§6-3 (b) 相対軸 gate 実装)
#   C285 拡張 (kaizen #137 真の段階2: 本能側列 proxy_instinct_response_density 追加、5 列化)
#
# 役割:
#   proxy 4 列 (proxy_clear_rate / proxy_damage_per_min / proxy_survival_time /
#   proxy_input_density) + 本能側 5 列目 (proxy_instinct_response_density、入力に probe_density
#   列があれば自動付与) について、以下 2 metric を切替計算する:
#     - icc      : ICC(2,1) one-way random + Fisher Z 95% CI (class 軸集約)
#     - spearman : Spearman ρ (proxy ↔ q_*) + bootstrap percentile 95% CI
#
# C285 5 列化の趣旨 (kaizen #137 真の段階2):
#   C281 Phase 2 §1(a) で proxy 4 列が全て「逆算側 (結果指標)」で本能側を一つも測れていない
#   と再診断 → 当初の class 軸切替 (段階2 旧案) では解消しない真因。本拡張は instinct_probe.js
#   由来の post_lock 6 frame 窓内方向変化密度 = probe_density を「本能側応答密度の代理」と
#   して取り込み、5 列で ICC 計算可能化する。入力 jsonl に probe_density 列があれば 5 列目を
#   自動付与し、無ければ従来 4 列で動作 (後方互換)。
#
# 入力:
#   - jsonl: measurements_multiseed.jsonl (10 seed_base × 30 trial = 300 行)
#       row["seed_base"] / row["outcome"] / row["play_time_sec"] / row["cast_count"]
#       から proxy 4 列を derive (build_proxy_csv.js と同一定義)。
#       jsonl は judgment 列を持たないため spearman mode は CSV 入力前提。
#   - csv : proxy_vs_judgment_labeled.csv (10 seed × 3 v_label × 30 trial = 900 行)
#       proxy 4 列 + q_a/q_intro/q_success_fb/q_d/q_c/q_e (空セルあり)
#
# CLI:
#   --input <path>          入力ファイル (.jsonl または .csv)
#   --class-col <name>      class 軸列名 (ICC mode: 必須 / spearman mode: メタデータ表示のみ)
#   --metric {icc,spearman} 計算 metric (デフォルト: icc、後方互換)
#   --vs-col <name>         spearman mode の judgment 列名 (デフォルト: q_a)
#   --bootstrap-n <N>       spearman mode の bootstrap 反復回数 (デフォルト: 1000)
#   --seed <N>              spearman mode の bootstrap 乱数 seed (デフォルト: 42)
#
# 由来:
#   - ICC: Mustahsan 2512.06710 — GAIA ICC=0.304-0.774、経験則閾値 ≥0.3 を Pearson
#     計算前段の「観測分散の存在診断」に使用。PEARSON_BLOCKER.md 前提 4。
#   - Spearman: §6-3 (b) 相対軸 gate (C277 Phase 3 §A-2 / 2410.02829 LLMs as Testers)
#     — 絶対 Pearson 軸 (a) が ICC FAIL で計算不能の時の fallback。閾値 ρ ≥ 0.5。
#     C278 Phase 5 で (a) 絶対軸が seed_base/v_label 両 class で FAIL 確定、
#     C279 Phase 4 で本実装により (b) を実測可能化。
#
# 公式:
#   ICC(2,1) one-way random:
#     ICC = (MS_between - MS_within) / (MS_between + (k-1) * MS_within)
#   Spearman ρ:
#     rank(x) / rank(y) を tie 平均で計算 → Pearson(rank(x), rank(y))
#   Bootstrap percentile 95% CI:
#     N 回 (proxy, q) ペアを len 同じで with-replacement リサンプリング、
#     各 ρ を計算 → [2.5%, 97.5%] percentile を CI とする。
#
# 制約:
#   依存追加なし (純 stdlib のみ)。scipy / numpy / pandas は不要。
#   副作用なし (入力 jsonl / csv は読み取りのみ、新規ファイル作成なし)。
#
# 出力フォーマット (stdout):
#   icc mode      : [ICC] column=X icc=... ci_low=... ci_high=... judge=PASS|FAIL
#   spearman mode : [Spearman] column=X vs=Y rho=... ci_low=... ci_high=... judge=PASS|FAIL

import argparse
import csv
import json
import math
import random
import sys
from pathlib import Path

ICC_THRESHOLD = 0.3  # Mustahsan 経験則 (GAIA 下限)
SPEARMAN_THRESHOLD = 0.5  # PEARSON_BLOCKER §6-3 (b) 相対軸 gate 閾値

PROXY_COLUMNS = [
    "proxy_clear_rate",
    "proxy_damage_per_min",
    "proxy_survival_time",
    "proxy_input_density",
]

# kaizen #137 真の段階2 (C285 Phase 4) で追加された本能側 5 列目。
# 入力に probe_density キーが含まれる時のみ derive される (後方互換維持)。
PROXY_COLUMN_INSTINCT = "proxy_instinct_response_density"

DEFAULT_INPUT = Path(__file__).parent / "measurements_multiseed.jsonl"


def derive_proxy_columns(row):
    """jsonl 1 行から proxy 4 列を計算 (build_proxy_csv.js と同一定義).
    probe_density キーがあれば本能側 5 列目 proxy_instinct_response_density を併設
    (kaizen #137 真の段階2, C285)。None / 欠損は 0.0 として扱う。
    """
    survived = 1 if row["outcome"] == "survived" else 0
    play_time = row["play_time_sec"]
    cast_count = row["cast_count"]

    damage_per_min = 0.0 if survived else (60.0 / play_time if play_time > 0 else 0.0)
    survival_time = play_time
    input_density = (cast_count / play_time * 60.0) if play_time > 0 else 0.0

    result = {
        "proxy_clear_rate": float(survived),
        "proxy_damage_per_min": damage_per_min,
        "proxy_survival_time": survival_time,
        "proxy_input_density": input_density,
    }
    if "probe_density" in row:
        pd = row.get("probe_density")
        result[PROXY_COLUMN_INSTINCT] = float(pd) if pd is not None else 0.0
    return result


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


def average_ranks(values):
    """tie を平均ランクで処理した順位列を返す (Spearman 用).
    values: list[float] → ranks: list[float] (同じ長さ)。
    """
    n = len(values)
    indexed = sorted(range(n), key=values.__getitem__)
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and values[indexed[j + 1]] == values[indexed[i]]:
            j += 1
        avg = (i + j) / 2.0 + 1.0  # 1-based 平均ランク
        for m in range(i, j + 1):
            ranks[indexed[m]] = avg
        i = j + 1
    return ranks


def pearson(xs, ys):
    """Pearson 相関係数. 分散ゼロ時は 0.0。"""
    n = len(xs)
    if n < 2:
        return 0.0
    mx = sum(xs) / n
    my = sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    syy = sum((y - my) ** 2 for y in ys)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    denom = math.sqrt(sxx * syy)
    if denom == 0:
        return 0.0
    return sxy / denom


def spearman_rho(xs, ys):
    """Spearman ρ = Pearson(rank(xs), rank(ys)). tie 平均ランク."""
    if len(xs) != len(ys):
        raise ValueError(f"length mismatch: {len(xs)} vs {len(ys)}")
    if len(xs) < 2:
        return 0.0
    return pearson(average_ranks(xs), average_ranks(ys))


def bootstrap_spearman_ci(xs, ys, n_iter, rng):
    """percentile bootstrap 95% CI for Spearman ρ.
    各 iter で (xs[i], ys[i]) ペアを len(xs) 個 with-replacement リサンプリング → ρ.
    返り値: (ci_low, ci_high) = (2.5% percentile, 97.5% percentile)。
    """
    n = len(xs)
    if n < 2:
        return 0.0, 0.0
    rhos = []
    for _ in range(n_iter):
        idx = [rng.randrange(n) for _ in range(n)]
        bx = [xs[i] for i in idx]
        by = [ys[i] for i in idx]
        # 分散ゼロ resample は pearson で 0 が返るので skip 不要
        rhos.append(spearman_rho(bx, by))
    rhos.sort()
    lo_idx = int(0.025 * n_iter)
    hi_idx = int(0.975 * n_iter)
    if hi_idx >= n_iter:
        hi_idx = n_iter - 1
    return rhos[lo_idx], rhos[hi_idx]


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
        fieldnames = reader.fieldnames or []
        if class_col not in fieldnames:
            sys.stderr.write(
                f"[ERROR] class-col '{class_col}' not in csv header {fieldnames}\n"
            )
            sys.exit(1)
        missing = [c for c in PROXY_COLUMNS if c not in fieldnames]
        if missing:
            sys.stderr.write(f"[ERROR] csv missing proxy columns: {missing}\n")
            sys.exit(1)
        # 本能側 5 列目は CSV 内に列が存在する場合のみ取り込む (kaizen #137 真の段階2, C285)
        has_instinct = PROXY_COLUMN_INSTINCT in fieldnames
        for row in reader:
            cls = row[class_col]
            try:
                proxy = {col: float(row[col]) for col in PROXY_COLUMNS}
                if has_instinct:
                    raw = row[PROXY_COLUMN_INSTINCT]
                    proxy[PROXY_COLUMN_INSTINCT] = float(raw) if raw not in ("", None) else 0.0
            except ValueError as e:
                sys.stderr.write(f"[ERROR] csv parse error: {e}\n")
                sys.exit(1)
            by_class.setdefault(cls, []).append(proxy)
    return by_class


def load_pairs_csv(path, vs_col):
    """spearman mode 用: (proxy_X, vs_col) ペアを行単位で取得.
    vs_col が空セルの行は skip。
    返り値: dict[column_name -> (xs, ys)] 4 列分。
    """
    xs_by_col = {c: [] for c in PROXY_COLUMNS}
    ys_by_col = {c: [] for c in PROXY_COLUMNS}
    skipped = 0
    with path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if vs_col not in (reader.fieldnames or []):
            sys.stderr.write(
                f"[ERROR] vs-col '{vs_col}' not in csv header {reader.fieldnames}\n"
            )
            sys.exit(1)
        missing = [c for c in PROXY_COLUMNS if c not in (reader.fieldnames or [])]
        if missing:
            sys.stderr.write(f"[ERROR] csv missing proxy columns: {missing}\n")
            sys.exit(1)
        for row in reader:
            vs_raw = row[vs_col]
            if vs_raw is None or vs_raw == "":
                skipped += 1
                continue
            try:
                vs_val = float(vs_raw)
            except ValueError:
                skipped += 1
                continue
            for col in PROXY_COLUMNS:
                try:
                    xs_by_col[col].append(float(row[col]))
                    ys_by_col[col].append(vs_val)
                except ValueError:
                    pass
    if skipped:
        sys.stderr.write(f"[INFO] spearman: {skipped} 行を vs-col 欠損で skip\n")
    return xs_by_col, ys_by_col


def parse_args():
    p = argparse.ArgumentParser(
        description="ICC / Spearman diagnose for proxy 4 columns"
    )
    p.add_argument(
        "--input",
        default=str(DEFAULT_INPUT),
        help="入力ファイル (.jsonl または .csv)、デフォルト = measurements_multiseed.jsonl",
    )
    p.add_argument(
        "--class-col",
        default="seed_base",
        help="class 軸列名 (icc mode: 必須 / spearman mode: メタデータ表示のみ)",
    )
    p.add_argument(
        "--metric",
        choices=("icc", "spearman"),
        default="icc",
        help="計算 metric (デフォルト icc、後方互換)",
    )
    p.add_argument(
        "--vs-col",
        default="q_a",
        help="spearman mode の judgment 列名 (デフォルト q_a)",
    )
    p.add_argument(
        "--bootstrap-n",
        type=int,
        default=1000,
        help="spearman mode の bootstrap 反復回数 (デフォルト 1000)",
    )
    p.add_argument(
        "--seed",
        type=int,
        default=42,
        help="spearman mode の bootstrap 乱数 seed (デフォルト 42)",
    )
    return p.parse_args()


def run_icc(path, suffix, class_col):
    if suffix == ".jsonl":
        by_class = load_by_class_jsonl(path, class_col)
    elif suffix == ".csv":
        by_class = load_by_class_csv(path, class_col)
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

    # 本能側 5 列目は first row sample が PROXY_COLUMN_INSTINCT を含むかで動的判定。
    # kaizen #137 真の段階2 (C285): probe_density を持つ入力で 5 列 ICC、無い時は 4 列 (後方互換)。
    sample_row = by_class[classes[0]][0]
    columns = list(PROXY_COLUMNS)
    if PROXY_COLUMN_INSTINCT in sample_row:
        columns.append(PROXY_COLUMN_INSTINCT)

    for col in columns:
        groups = [[row[col] for row in by_class[c]] for c in classes]
        icc, ci_lo, ci_hi = icc_one_way_random(groups)
        judge = "PASS" if icc >= ICC_THRESHOLD else "FAIL"
        print(
            f"[ICC] column={col} icc={icc:.4f} ci_low={ci_lo:.4f} ci_high={ci_hi:.4f} judge={judge}"
        )


def run_spearman(path, suffix, vs_col, bootstrap_n, seed):
    if suffix != ".csv":
        sys.stderr.write(
            "[ERROR] spearman mode は CSV 入力前提 (judgment 列が必要)\n"
        )
        sys.exit(1)
    xs_by_col, ys_by_col = load_pairs_csv(path, vs_col)
    rng = random.Random(seed)
    for col in PROXY_COLUMNS:
        xs = xs_by_col[col]
        ys = ys_by_col[col]
        if len(xs) < 2:
            print(
                f"[Spearman] column={col} vs={vs_col} rho=0.0000 ci_low=0.0000 ci_high=0.0000 judge=FAIL"
            )
            continue
        rho = spearman_rho(xs, ys)
        ci_lo, ci_hi = bootstrap_spearman_ci(xs, ys, bootstrap_n, rng)
        judge = "PASS" if rho >= SPEARMAN_THRESHOLD else "FAIL"
        print(
            f"[Spearman] column={col} vs={vs_col} rho={rho:.4f} ci_low={ci_lo:.4f} ci_high={ci_hi:.4f} judge={judge}"
        )


def main():
    args = parse_args()
    path = Path(args.input)
    if not path.exists():
        sys.stderr.write(f"[ERROR] input not found: {path}\n")
        sys.exit(1)

    suffix = path.suffix.lower()
    if args.metric == "icc":
        run_icc(path, suffix, args.class_col)
    elif args.metric == "spearman":
        run_spearman(path, suffix, args.vs_col, args.bootstrap_n, args.seed)


if __name__ == "__main__":
    main()
