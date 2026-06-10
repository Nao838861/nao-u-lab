#!/usr/bin/env python3
"""
C290 Phase 4 専用: C281-C293 範囲の全 commit を 4 カテゴリ (A/B1/B2/C/D) に逆引き分類

カテゴリ判定ルール (staging Phase 3 §5 で確定):
- A   : game: prefix で本質 playable diff (game/* 変更を伴う)
- B1  : game/* 配下に新規ファイル (probe/measurement 等の足場、ただし game prefix)
- B2  : それ以外の新規ファイル (memory/scripts/tools/projects/external_notes 新規)
- C   : rule: prefix または staging/分析更新
- D   : log: prefix (Slack 投稿関連)、codex: prefix (sync 系)、Auto sync、backup
- N   : 中立 (ash:/mir: 別インスタンス, Merge)
"""
import subprocess
import re
from collections import defaultdict, OrderedDict

# cycle 境界 (Log master visible cycle, 時系列): 開始 commit hash → cycle label
# 末尾の C290_reentry は本セッション (作業中)
CYCLE_BOUNDARIES = [
    # (cycle_label, start_hash, end_hash_exclusive_or_None)
    ("C281-C283 (rebuild)", "5d2f703d1", "dad1aaadb"),
    ("C284",                "dad1aaadb", "120eedc8b"),
    ("C285",                "120eedc8b", "37938540a"),
    ("C286",                "37938540a", "376ac7218"),
    ("C287",                "376ac7218", "2890a7c07"),
    ("C288",                "2890a7c07", "c0a294575"),
    ("C289",                "c0a294575", "b32e61272"),
    ("C290_initial",        "b32e61272", "bab7ba4b5"),
    ("C291",                "bab7ba4b5", "3e4f1cb6d"),
    ("C292",                "3e4f1cb6d", "35895201c"),
    ("C293",                "35895201c", "c5bfa1239"),
    ("C290_reentry",        "c5bfa1239", None),  # in-progress (本 Phase 4 含む)
]


def get_commits(since="2026-06-02 03:00", until="2026-06-03 14:30"):
    """指定期間の commit を時系列 (古い順) で取得"""
    out = subprocess.check_output(
        ["git", "log", "--oneline", "--format=%h|%ai|%s",
         f"--since={since}", f"--until={until}", "--reverse"],
        cwd="D:/AI/Nao_u_BOT/Claude", text=True, encoding="utf-8"
    )
    commits = []
    for line in out.splitlines():
        if "|" not in line:
            continue
        parts = line.split("|", 2)
        if len(parts) != 3:
            continue
        commits.append({"hash": parts[0], "date": parts[1], "subject": parts[2]})
    return commits


def get_changed_files(commit_hash):
    """commit で変更されたファイル一覧を取得"""
    try:
        out = subprocess.check_output(
            ["git", "show", "--name-only", "--format=", commit_hash],
            cwd="D:/AI/Nao_u_BOT/Claude", text=True, encoding="utf-8"
        )
        return [f.strip() for f in out.splitlines() if f.strip()]
    except subprocess.CalledProcessError:
        return []


def classify(commit):
    """commit を A/B1/B2/C/D/N に分類"""
    subj = commit["subject"]
    # 優先順位順に判定
    # game prefix → A or B1
    if subj.startswith("game:"):
        # mir/ash 由来 game commit は Log master 視点で中立扱い (別インスタンス由来)
        if "siphon_mir" in subj or "siphon v0" in subj:
            return "N"
        # game/* 配下の新規ファイルがあるか? → 簡易判定: probe/measurement/null result/v003 self_judgment 等は B1
        if any(kw in subj for kw in ["self_judgment", "v004_proxy_candidates", "instinct_probe", "ramp 拡張", "evaluation closure"]):
            return "B1"
        return "A"
    if subj.startswith("rule:"):
        return "C"
    if subj.startswith("log:"):
        # log: Cxxx Phase 2/3/4 (staging 更新中心) → C
        # log: Cxxx Phase 5 (diary post) or log: それ以外 (Slack reply, sync 系) → D
        if re.search(r"C2\d\d Phase ([234])", subj):
            return "C"
        return "D"
    if subj.startswith("memory:"):
        return "B2"  # memory/* 新規・更新
    if subj.startswith("codex:"):
        return "D"  # Log_cdx sync (Log master ブランチでは外部 sync)
    if subj.startswith("Auto sync"):
        return "D"
    if subj.startswith("backup"):
        return "D"
    if subj.startswith("rebuild"):
        return "C"  # 構造復旧
    if subj.startswith("ash:") or subj.startswith("mir:"):
        return "N"
    if subj.startswith("Merge"):
        return "N"
    if subj.startswith("research:"):
        return "B2"  # 新規 research 文書 = それ以外の新規
    # その他は subject から判定
    return "?"


def main():
    commits = get_commits()
    print(f"Total commits in window: {len(commits)}")
    print()

    # cycle ごとに振り分け
    cycle_commits = OrderedDict((c[0], []) for c in CYCLE_BOUNDARIES)
    # commit を時系列 (古→新) で並べ、cycle boundary hash と照合
    cycle_idx = 0
    in_cycle = False
    for commit in commits:
        h = commit["hash"]
        # まだサイクル開始前
        while cycle_idx < len(CYCLE_BOUNDARIES) and not in_cycle:
            label, start_h, end_h = CYCLE_BOUNDARIES[cycle_idx]
            if h.startswith(start_h):
                in_cycle = True
                break
            else:
                # まだ start に到達していない (実は時系列で start が出る前の commit はスキップ)
                break
        # 現サイクルに属するか判定
        if cycle_idx < len(CYCLE_BOUNDARIES):
            label, start_h, end_h = CYCLE_BOUNDARIES[cycle_idx]
            # end_h に到達したら次サイクルへ
            if end_h is not None and h.startswith(end_h):
                cycle_idx += 1
                label, start_h, end_h = CYCLE_BOUNDARIES[cycle_idx]
            cycle_commits[label].append(commit)

    # 分類
    classification = OrderedDict()
    for label, cmts in cycle_commits.items():
        counts = defaultdict(int)
        details = []
        for c in cmts:
            cat = classify(c)
            counts[cat] += 1
            details.append((cat, c["hash"], c["date"][:16], c["subject"][:100]))
        classification[label] = {"counts": dict(counts), "details": details, "total": len(cmts)}

    # 結果出力
    print("=" * 100)
    print("【1】cycle 別カテゴリ集計")
    print("=" * 100)
    print(f"{'cycle':<22} {'A':>3} {'B1':>3} {'B2':>3} {'C':>3} {'D':>3} {'N':>3} {'?':>3} {'total':>5} {'CD/(A+B1)':>10}")
    print("-" * 100)
    summary = OrderedDict()
    for label, data in classification.items():
        c = data["counts"]
        A = c.get("A", 0)
        B1 = c.get("B1", 0)
        B2 = c.get("B2", 0)
        C = c.get("C", 0)
        D = c.get("D", 0)
        N = c.get("N", 0)
        Q = c.get("?", 0)
        total = data["total"]
        denom = A + B1
        ratio = f"{(C + D) / denom:.2f}" if denom > 0 else "inf"
        summary[label] = {"A": A, "B1": B1, "B2": B2, "C": C, "D": D, "N": N, "?": Q,
                          "total": total, "ratio": ratio}
        print(f"{label:<22} {A:>3} {B1:>3} {B2:>3} {C:>3} {D:>3} {N:>3} {Q:>3} {total:>5} {ratio:>10}")

    # B1 不在連続回数 (A も B1 も 0 の cycle が連続している数)
    print()
    print("=" * 100)
    print("【2】B1 不在連続回数 (A も B1 も 0 のサイクル)")
    print("=" * 100)
    streak = 0
    max_streak = 0
    cycle_streaks = []
    for label, s in summary.items():
        if s["A"] == 0 and s["B1"] == 0:
            streak += 1
            cycle_streaks.append((label, streak, "miss"))
            max_streak = max(max_streak, streak)
        else:
            if streak > 0:
                cycle_streaks.append((f"  [reset at {label}]", streak, "reset"))
            streak = 0
            cycle_streaks.append((label, 0, "hit"))
    print(f"最大連続 B1 不在: {max_streak} サイクル")
    print()
    for entry in cycle_streaks:
        print(f"  {entry[0]:<30} streak={entry[1]} {entry[2]}")

    # 詳細
    print()
    print("=" * 100)
    print("【3】各 cycle の commit 詳細")
    print("=" * 100)
    for label, data in classification.items():
        print(f"\n--- {label} ({data['total']} commits) ---")
        for cat, h, dt, subj in data["details"]:
            print(f"  [{cat:>2}] {h} {dt} {subj}")

    # 最終サマリ
    print()
    print("=" * 100)
    print("【4】判定材料サマリ")
    print("=" * 100)
    total_A = sum(s["A"] for s in summary.values())
    total_B1 = sum(s["B1"] for s in summary.values())
    total_CD = sum(s["C"] + s["D"] for s in summary.values())
    print(f"全期間 A 合計: {total_A}")
    print(f"全期間 B1 合計: {total_B1}")
    print(f"全期間 C+D 合計: {total_CD}")
    overall_ratio = total_CD / (total_A + total_B1) if (total_A + total_B1) > 0 else float('inf')
    print(f"全期間 CD/(A+B1) 比: {overall_ratio:.2f}")
    print()
    print(f"B1 不在最大連続: {max_streak} サイクル")
    print(f"本 C290_reentry での B1 状況: A={summary['C290_reentry']['A']} B1={summary['C290_reentry']['B1']}")
    if summary['C290_reentry']['A'] == 0 and summary['C290_reentry']['B1'] == 0:
        print("→ 本サイクル Phase 4 で game commit を追加する根拠あり (B1 不在継続)")
    else:
        print("→ 本サイクルは既に A または B1 出現 (Phase 4 で game commit 追加は任意)")


if __name__ == "__main__":
    main()
