#!/usr/bin/env python3
"""
memory_retention_audit.py — Forget phase 装置の最小プロトタイプ (C280 Phase 4 着地)

projects/memory_redesign.md C280 Phase 3 §C の最小実装案を実体化。
arXiv 2604.16548 (Mnemonic Sovereignty) 6 phase のうち Forget+Rollback 側
「retention: cycle と書かれた memory がどのサイクル境界で自動退役するか」
の自動退役**候補提示**装置として 1 本立てる (退役そのものは人手判断、本ツールは
提示のみで副作用ゼロ)。

挙動:
  - --roots で指定したディレクトリ配下を再帰走査、*.md の frontmatter を読み取り
  - frontmatter の `retention:` キーを抽出 (permanent / cycle / probationary)
  - `retention: cycle` 対象に mtime + 経過日数 + 推定経過サイクル数を付与
  - --max-cycles を超えた対象を「退役候補」として分離
  - 退役候補ゼロ時は明示的に「stale なし」と表示 (silent fail 防止)

サイクル数の推定:
  - 厳密なサイクルカウンタは log/cycle_staging_log.md 履歴を要するため、
    本プロトタイプでは elapsed_days * cycles_per_day で近似 (default 2.0)
  - 近似値であることは出力にも明示。将来 cycle counter を git log の
    `C\\d+` prefix 集計で正確化する余地は残す

副作用ゼロ:
  - 読み取りのみ。新規ファイル作成・既存ファイル変更なし
  - exit 0 完走 (CI ライク healthcheck として再利用可能)
"""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

FRONTMATTER_RETENTION_RE = re.compile(r"^retention:\s*([A-Za-z_]+)", re.MULTILINE)
FRONTMATTER_SUPERSEDES_RE = re.compile(r"^supersedes:\s*(\S+)", re.MULTILINE)
FRONTMATTER_SUPERSEDED_BY_RE = re.compile(r"^superseded_by:\s*(\S+)", re.MULTILINE)

VALID_RETENTION = {"permanent", "cycle", "probationary"}


@dataclass
class RetentionRecord:
    path: Path
    retention: str
    mtime_epoch: float
    elapsed_days: float
    elapsed_cycles: float


@dataclass
class SupersedeRecord:
    path: Path
    supersedes: str | None
    superseded_by: str | None


def parse_frontmatter(text: str) -> str:
    if not text.startswith("---\n"):
        return ""
    end = text.find("\n---\n", 4)
    if end == -1:
        return ""
    return text[4:end]


def extract_retention(path: Path) -> str | None:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    fm = parse_frontmatter(text)
    if not fm:
        return None
    m = FRONTMATTER_RETENTION_RE.search(fm)
    if not m:
        return None
    val = m.group(1).strip().lower()
    return val if val in VALID_RETENTION else None


def extract_supersedes(path: Path) -> SupersedeRecord | None:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    fm = parse_frontmatter(text)
    if not fm:
        return None
    sup = FRONTMATTER_SUPERSEDES_RE.search(fm)
    sby = FRONTMATTER_SUPERSEDED_BY_RE.search(fm)
    if sup is None and sby is None:
        return None
    return SupersedeRecord(
        path=path,
        supersedes=sup.group(1).strip() if sup else None,
        superseded_by=sby.group(1).strip() if sby else None,
    )


def count_recent_commits(path: Path, days: int = 30, cwd: Path | None = None) -> int:
    """git log --follow --since=<days> days ago で path に触れた commit 数を返す。

    FadeMem 3 信号 proxy のうち access frequency に対応する measure。
    git 不在 / 履歴なし / subprocess 失敗時は -1 を返す (副作用ゼロ・呼び元で除外可能)。
    """
    try:
        r = subprocess.run(
            ["git", "log", "--follow", f"--since={days} days ago", "--pretty=%H", "--", str(path)],
            capture_output=True,
            text=True,
            cwd=str(cwd) if cwd is not None else None,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return -1
    if r.returncode != 0:
        return -1
    lines = [ln for ln in r.stdout.splitlines() if ln.strip()]
    return len(lines)


def walk_roots(roots: list[Path]) -> list[Path]:
    out: list[Path] = []
    for root in roots:
        if not root.is_dir():
            continue
        for p in root.rglob("*.md"):
            if p.is_file():
                out.append(p)
    return out


def build_records(paths: list[Path], now_epoch: float, cycles_per_day: float) -> list[RetentionRecord]:
    records: list[RetentionRecord] = []
    for p in paths:
        ret = extract_retention(p)
        if ret is None:
            continue
        try:
            mtime = os.path.getmtime(p)
        except OSError:
            continue
        elapsed_sec = max(0.0, now_epoch - mtime)
        elapsed_days = elapsed_sec / 86400.0
        elapsed_cycles = elapsed_days * cycles_per_day
        records.append(
            RetentionRecord(
                path=p,
                retention=ret,
                mtime_epoch=mtime,
                elapsed_days=elapsed_days,
                elapsed_cycles=elapsed_cycles,
            )
        )
    return records


def format_record(r: RetentionRecord, base: Path) -> str:
    try:
        rel = r.path.relative_to(base)
    except ValueError:
        rel = r.path
    return f"  {rel} (retention={r.retention} days={r.elapsed_days:.1f} cycles≈{r.elapsed_cycles:.1f})"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--roots", nargs="+", default=["memory", "projects", "log"],
                    help="走査ルートディレクトリ (default: memory projects log)")
    ap.add_argument("--max-cycles", type=float, default=5.0,
                    help="retention: cycle の stale 判定閾値 (推定経過サイクル数、default: 5.0)")
    ap.add_argument("--cycles-per-day", type=float, default=2.0,
                    help="経過日数→経過サイクル数換算 (近似値、default: 2.0)")
    ap.add_argument("--base", default=".",
                    help="出力パスの基準ディレクトリ (default: カレント)")
    ap.add_argument("--with-access-freq", action="store_true",
                    help="FadeMem 3 信号 proxy 第 1 段: with_retention 対象に access_frequency_30d (git log --follow 30 日 commit 数) を集計 (default: off, 従来挙動完全保持)")
    ap.add_argument("--access-freq-days", type=int, default=30,
                    help="--with-access-freq の集計期間 (日数、default: 30)")
    ap.add_argument("--hook-summary", action="store_true",
                    help="multi_phase_cycle_log.py Pre-check hook 用 (kaizen #138 段階3): "
                         "stdout 全抑止し stderr に 1 行サマリ + 退役候補時の WARN 行のみを出力。"
                         "従来挙動 (default: off) は完全維持。")
    args = ap.parse_args(argv)

    base = Path(args.base).resolve()
    roots = [Path(r) for r in args.roots]
    now_epoch = __import__("time").time()

    paths = walk_roots(roots)
    records = build_records(paths, now_epoch, args.cycles_per_day)

    by_ret: dict[str, list[RetentionRecord]] = {k: [] for k in VALID_RETENTION}
    for r in records:
        by_ret[r.retention].append(r)

    if args.hook_summary:
        import io
        _orig_stdout = sys.stdout
        sys.stdout = io.StringIO()

    print(f"[memory_retention_audit] roots={args.roots} scanned_md={len(paths)} "
          f"with_retention={len(records)} "
          f"(permanent={len(by_ret['permanent'])} "
          f"cycle={len(by_ret['cycle'])} "
          f"probationary={len(by_ret['probationary'])})")
    print(f"[memory_retention_audit] threshold: max_cycles={args.max_cycles} "
          f"cycles_per_day≈{args.cycles_per_day} (approximate)")

    cycle_records = sorted(by_ret["cycle"], key=lambda r: r.elapsed_cycles, reverse=True)
    print()
    print(f"## retention: cycle 全件 ({len(cycle_records)} 件)")
    if not cycle_records:
        print("  (該当ファイルなし。Mir 08:42 提案の frontmatter retention キー導入が未着手の状態を反映)")
    else:
        for r in cycle_records:
            print(format_record(r, base))

    stale = [r for r in cycle_records if r.elapsed_cycles >= args.max_cycles]
    print()
    print(f"## 退役候補 (経過サイクル数 ≥ {args.max_cycles}, {len(stale)} 件)")
    if not stale:
        print("  stale なし")
    else:
        for r in stale:
            print(format_record(r, base))

    sup_records: list[SupersedeRecord] = []
    for p in paths:
        sr = extract_supersedes(p)
        if sr is not None:
            sup_records.append(sr)

    sup_only = [r for r in sup_records if r.supersedes is not None]
    sby_only = [r for r in sup_records if r.superseded_by is not None]

    print()
    print(f"## supersedes / superseded_by 検出 (supersedes={len(sup_only)} superseded_by={len(sby_only)})")
    if not sup_records:
        print("  (該当ファイルなし。kaizen #138 段階2 残タスク = supersedes キー併設試験 が未着手の状態を反映)")
    else:
        for r in sup_records:
            try:
                rel = r.path.relative_to(base)
            except ValueError:
                rel = r.path
            tag = []
            if r.supersedes:
                tag.append(f"supersedes={r.supersedes}")
            if r.superseded_by:
                tag.append(f"superseded_by={r.superseded_by}")
            print(f"  {rel} ({' '.join(tag)})")

    pairs: list[tuple[str, str]] = []
    sup_index = {r.path.name: r for r in sup_records if r.supersedes}
    sby_index = {r.path.name: r for r in sup_records if r.superseded_by}
    for new_name, rec in sup_index.items():
        old_name = rec.supersedes
        if old_name in sby_index and sby_index[old_name].superseded_by == new_name:
            pairs.append((old_name, new_name))
    print()
    print(f"## 双方向リンク確認 (旧→新 完全対応ペア = {len(pairs)} 組)")
    if not pairs:
        print("  双方向ペアなし")
    else:
        for old, new in pairs:
            print(f"  {old} -> {new}")

    if args.with_access_freq:
        days = args.access_freq_days
        access_freqs: dict[Path, int] = {}
        for r in records:
            access_freqs[r.path] = count_recent_commits(r.path, days=days, cwd=base)

        print()
        print(f"## access_frequency_30d 集計 (FadeMem 3 信号 proxy 第 1 段, days={days})")
        print(f"  with_retention 対象 {len(records)} 件 / 計測手段: git log --follow --since={days}d")
        for r in records:
            try:
                rel = r.path.relative_to(base)
            except ValueError:
                rel = r.path
            cnt = access_freqs.get(r.path, -1)
            cnt_str = "n/a" if cnt < 0 else str(cnt)
            print(f"  {rel} (retention={r.retention} access_frequency_{days}d={cnt_str})")

        low = [r for r in records if access_freqs.get(r.path, -1) == 0]
        print()
        print(f"## low_frequency 候補 (access_frequency_{days}d == 0, {len(low)} 件)")
        if not low:
            print("  low_frequency 該当なし")
        else:
            for r in low:
                try:
                    rel = r.path.relative_to(base)
                except ValueError:
                    rel = r.path
                print(f"  {rel} (retention={r.retention})")

    if args.hook_summary:
        sys.stdout = _orig_stdout
        sys.stderr.write(
            f"[memory_retention_audit] scanned_md={len(paths)} "
            f"with_retention={len(records)} "
            f"(permanent={len(by_ret['permanent'])} "
            f"cycle={len(by_ret['cycle'])} "
            f"probationary={len(by_ret['probationary'])}) "
            f"stale={len(stale)} supersedes_pairs={len(pairs)} "
            f"max_cycles={args.max_cycles}\n"
        )
        for r in stale:
            try:
                rel = r.path.relative_to(base)
            except ValueError:
                rel = r.path
            sys.stderr.write(
                f"[memory_retention_audit WARN] stale: {rel} "
                f"(retention={r.retention} days={r.elapsed_days:.1f} "
                f"cycles≈{r.elapsed_cycles:.1f} ≥ {args.max_cycles})\n"
            )

    return 0


if __name__ == "__main__":
    sys.exit(main())
