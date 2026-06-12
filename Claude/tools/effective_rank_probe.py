"""effective_rank_probe.py

Slack archive (all-nao-u-lab.jsonl) の直近 7 日から
Log / Log_cdx / Mir / Ash 4 投稿者 × 5-10 substantive 投稿を抽出し、
character-bigram TF-IDF の cosine 類似度行列の固有値分解から
spectral entropy effective rank を計測する。

純 stdlib のみ (numpy 不使用)。stdout 出力のみ、副作用ゼロ。

Patel 2604.03809 effective rank の base rate 取得装置。
GSM8K rationale 2.17 / Mir effective rank との相対比較用。

R-F: effective_rank 最大化条件 = 4 instance source (Log / Log_cdx / Mir / Ash)
全員が直近 7d で >= MIN_PER_POSTER 件 substantive 投稿し、かつ source 間で
語彙 (char bigram + ASCII word) が分離している時に max。ログ行数だけ増えて
源が偏る (例: Log だけ 50 件 / 他 0 件) と min_n=0 で計測拒否される構造。

--append-log <path>: 1 行ログ追記モード。週次ジョブ化用 (C306 Phase 4)。
"""

import argparse
import json
import math
import random
import re
import sys
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "log" / "slack_archive"
NOW = datetime.now().timestamp()
WINDOW_DAYS = 7
CUTOFF = NOW - WINDOW_DAYS * 86400

# 4 logical posters identification:
#   (label, user_id, source_channel.jsonl, required_tag_in_first_30_chars or None)
# Ash は all-nao-u-lab.jsonl では使用量レポートのみ → 専用 ash.jsonl から取得。
# Log_cdx は専用チャンネルがないため all-nao-u-lab.jsonl + [Log_cdx] タグで分離。
# Log/Mir は各 instance のメイン発話チャンネルから取得 (投稿数偏り対策)。
# (staging C276 Phase 2 §反証ライン「投稿数偏り」への Phase 4 対応 = source 拡張)
POSTERS = [
    ("Log",     "U0AM1F23FQU", "log.jsonl",           None),
    ("Log_cdx", "U0AM1F23FQU", "all-nao-u-lab.jsonl", "[Log_cdx]"),
    ("Mir",     "U0ALW4DKTT7", "mir-log.jsonl",       None),
    # Ash の ash.jsonl は auto_diary 失敗報告テンプレが反復 (cosine≒1) で表現多様性
    # を測れない → shared-reads.jsonl の Ash 分析投稿 ([Ash] タグ) から取得。
    ("Ash",     "U0AMQKE69BJ", "shared-reads.jsonl",  "[Ash]"),
]

MIN_TEXT_LEN = 80           # 短文・ack をはじく下限
MAX_PER_POSTER = 10         # 各投稿者から最大 10 件
MIN_PER_POSTER = 5          # 5 件未満なら警告
BOOTSTRAP_N = 200
RNG_SEED = 20260601


def load_substantive_posts():
    """直近 7 日の Slack archive から 4 投稿者の substantive 投稿を抽出。"""
    buckets = {label: [] for label, _, _, _ in POSTERS}
    by_channel = {}
    for label, uid, ch, tag in POSTERS:
        by_channel.setdefault(ch, []).append((label, uid, tag))
    for ch, plist in by_channel.items():
        path = ARCHIVE_DIR / ch
        if not path.exists():
            print(f"[WARN] channel archive missing: {path}", file=sys.stderr)
            continue
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    d = json.loads(line)
                except json.JSONDecodeError:
                    continue
                try:
                    ts = float(d.get("ts", 0))
                except (TypeError, ValueError):
                    continue
                if ts < CUTOFF:
                    continue
                text = d.get("text", "") or ""
                if len(text) < MIN_TEXT_LEN:
                    continue
                if text.startswith("*使用量*"):
                    continue
                if "さんがチャンネルに参加しました" in text:
                    continue
                user = d.get("user") or d.get("user_name")
                for label, uid, tag in plist:
                    if user != uid:
                        continue
                    if tag is not None and tag not in text[:30]:
                        continue
                    if tag is None:
                        head = text[:30]
                        # Log_cdx タグ投稿は Log バケットに混ぜない
                        if label == "Log" and "[Log_cdx]" in head:
                            continue
                    buckets[label].append({"ts": ts, "text": text, "channel": ch})
                    break
    out = []
    for label, _, _, _ in POSTERS:
        items = sorted(buckets[label], key=lambda x: x["ts"], reverse=True)[:MAX_PER_POSTER]
        out.append((label, items))
    return out


# --- ベクトル化 (character bigram TF-IDF, 純 Python) ---

_ws = re.compile(r"\s+")


def tokenize(text):
    """日本語/英語混在に強い char bigram + ASCII word 併用。"""
    cleaned = _ws.sub(" ", text)
    cleaned = re.sub(r"<https?://[^>]+>", " ", cleaned)
    tokens = []
    # ASCII word トークン
    for w in re.findall(r"[A-Za-z][A-Za-z0-9_\-]{2,}", cleaned):
        tokens.append("w:" + w.lower())
    # 残り (主に日本語) を char bigram に
    nonascii = "".join(c for c in cleaned if not c.isascii() or c.isspace() is False and c.isalnum() is False)
    s = re.sub(r"\s+", "", nonascii)
    for i in range(len(s) - 1):
        bg = s[i:i + 2]
        if bg.strip():
            tokens.append("b:" + bg)
    return tokens


def build_tfidf(docs_tokens):
    """list[Counter] -> list[dict[term, tfidf]]"""
    N = len(docs_tokens)
    df = Counter()
    for tc in docs_tokens:
        for term in tc:
            df[term] += 1
    vectors = []
    for tc in docs_tokens:
        total = sum(tc.values()) or 1
        v = {}
        for term, c in tc.items():
            tf = c / total
            idf = math.log((1 + N) / (1 + df[term])) + 1
            v[term] = tf * idf
        vectors.append(v)
    return vectors


def l2_normalize(v):
    n = math.sqrt(sum(x * x for x in v.values()))
    if n == 0:
        return v
    return {k: x / n for k, x in v.items()}


def cosine(a, b):
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(k, 0.0) for k, v in a.items())


# --- Jacobi eigenvalue 分解 (純 stdlib, 対称行列用) ---

def jacobi_eigenvalues(mat, max_sweeps=50, tol=1e-10):
    n = len(mat)
    a = [row[:] for row in mat]
    for _ in range(max_sweeps):
        # off-diagonal sum of squares
        off = 0.0
        for i in range(n):
            for j in range(i + 1, n):
                off += a[i][j] * a[i][j]
        if off < tol:
            break
        for p in range(n - 1):
            for q in range(p + 1, n):
                apq = a[p][q]
                if abs(apq) < 1e-14:
                    continue
                app = a[p][p]
                aqq = a[q][q]
                if abs(app - aqq) < 1e-30:
                    theta = math.pi / 4 if apq > 0 else -math.pi / 4
                else:
                    theta = 0.5 * math.atan2(2 * apq, app - aqq)
                c = math.cos(theta)
                s = math.sin(theta)
                # rotate
                for i in range(n):
                    aip = a[i][p]
                    aiq = a[i][q]
                    a[i][p] = c * aip + s * aiq
                    a[i][q] = -s * aip + c * aiq
                for j in range(n):
                    apj = a[p][j]
                    aqj = a[q][j]
                    a[p][j] = c * apj + s * aqj
                    a[q][j] = -s * apj + c * aqj
    return sorted([a[i][i] for i in range(n)], reverse=True)


def effective_rank(eigs):
    """spectral entropy effective rank = exp(H)。負/極小固有値はゼロ扱い。"""
    positives = [e for e in eigs if e > 1e-10]
    s = sum(positives)
    if s <= 0:
        return float("nan"), float("nan")
    probs = [e / s for e in positives]
    H = -sum(p * math.log(p) for p in probs if p > 0)
    return math.exp(H), H


def build_cosine_matrix(vectors):
    n = len(vectors)
    mat = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i, n):
            v = cosine(vectors[i], vectors[j])
            mat[i][j] = v
            mat[j][i] = v
    return mat


def bootstrap_effrank_ci(vectors, n_iter=BOOTSTRAP_N, seed=RNG_SEED):
    rng = random.Random(seed)
    n = len(vectors)
    ers = []
    for _ in range(n_iter):
        idx = [rng.randrange(n) for _ in range(n)]
        sub = [vectors[i] for i in idx]
        mat = build_cosine_matrix(sub)
        eigs = jacobi_eigenvalues(mat)
        er, _ = effective_rank(eigs)
        if not math.isnan(er):
            ers.append(er)
    if not ers:
        return float("nan"), float("nan")
    ers.sort()
    lo = ers[int(0.025 * len(ers))]
    hi = ers[min(len(ers) - 1, int(0.975 * len(ers)))]
    return lo, hi


def append_log_line(log_path, er, H, intra_means, inter_mean):
    """週次ジョブ化用 1 行追記。書式は固定 (check_instance_divergence_freshness と整合)。

    フォーマット: YYYY-MM-DD HH:MM | effective_rank=<F> | entropy=<F>
                  | intra_cos_log=<F> | intra_cos_logcdx=<F>
                  | intra_cos_mir=<F> | intra_cos_ash=<F> | inter_cos=<F>
    """
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")

    def fmt(label):
        v = intra_means.get(label, float("nan"))
        return "nan" if math.isnan(v) else f"{v:.4f}"

    line = (
        f"{ts} | effective_rank={er:.4f} | entropy={H:.4f}"
        f" | intra_cos_log={fmt('Log')}"
        f" | intra_cos_logcdx={fmt('Log_cdx')}"
        f" | intra_cos_mir={fmt('Mir')}"
        f" | intra_cos_ash={fmt('Ash')}"
        f" | inter_cos={inter_mean:.4f}\n"
    )
    log_path = Path(log_path)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as f:
        f.write(line)
    print(f"[APPEND_LOG] wrote: {log_path}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="effective_rank probe (Patel 2604.03809)")
    parser.add_argument("--append-log", default=None,
                        help="週次ジョブ化用: 計測結果を 1 行追記するログファイルパス")
    args = parser.parse_args()

    if not ARCHIVE_DIR.exists():
        print(f"[ERROR] archive dir not found: {ARCHIVE_DIR}", file=sys.stderr)
        return 1
    posters = load_substantive_posts()
    counts = {label: len(items) for label, items in posters}
    src_map = ",".join(f"{lbl}:{ch}" for lbl, _, ch, _ in POSTERS)
    print(f"[CORPUS] window={WINDOW_DAYS}d sources={src_map} "
          + " ".join(f"{lbl}={c}" for lbl, c in counts.items()))
    short = [lbl for lbl, c in counts.items() if c < MIN_PER_POSTER]
    if short:
        print(f"[WARN] under-min posters (need >= {MIN_PER_POSTER}): {short}")
    # 各投稿者均等化: 最小件数に切り揃え (固有値偏倚抑制、staging §反証ライン対応)
    min_n = min(counts.values()) if counts else 0
    if min_n == 0:
        print("[ERROR] one or more posters have 0 documents; cannot compute", file=sys.stderr)
        return 2
    docs = []
    labels = []
    for label, items in posters:
        for it in items[:min_n]:
            docs.append(it["text"])
            labels.append(label)
    print(f"[BALANCED] per_poster={min_n} total_N={len(docs)}")

    tokens = [Counter(tokenize(t)) for t in docs]
    raw_vectors = build_tfidf(tokens)
    vectors = [l2_normalize(v) for v in raw_vectors]

    mat = build_cosine_matrix(vectors)
    eigs = jacobi_eigenvalues(mat)
    er, H = effective_rank(eigs)
    top3 = eigs[:3]
    top3_str = ",".join(f"{e:.4f}" for e in top3)

    lo, hi = bootstrap_effrank_ci(vectors)

    print(f"[EFFECTIVE_RANK] N_documents={len(docs)} "
          f"effective_rank={er:.4f} entropy={H:.4f} "
          f"top3_eigenvalues={top3_str}")
    print(f"[BOOTSTRAP_CI95] effective_rank_lo={lo:.4f} hi={hi:.4f} n_iter={BOOTSTRAP_N}")

    # 投稿者内 vs 投稿者間 cosine 平均 (構造補助情報)
    intra_sums = {label: [] for label, _ in posters}
    inter_sums = []
    n = len(docs)
    for i in range(n):
        for j in range(i + 1, n):
            v = mat[i][j]
            if labels[i] == labels[j]:
                intra_sums[labels[i]].append(v)
            else:
                inter_sums.append(v)
    intra_means = {lbl: (sum(vs) / len(vs) if vs else float("nan"))
                   for lbl, vs in intra_sums.items()}
    inter_mean = sum(inter_sums) / len(inter_sums) if inter_sums else float("nan")
    print("[COSINE_STRUCTURE] "
          + " ".join(f"intra_{lbl}={m:.4f}" for lbl, m in intra_means.items())
          + f" inter_mean={inter_mean:.4f}")

    if args.append_log:
        append_log_line(args.append_log, er, H, intra_means, inter_mean)

    return 0


if __name__ == "__main__":
    sys.exit(main())
