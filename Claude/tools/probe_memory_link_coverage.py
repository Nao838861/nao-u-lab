#!/usr/bin/env python3
"""
probe_memory_link_coverage.py — memory/ wikilink 接続構造の 4 指標計測

出自: 2026-06-06 C304 Phase 2 shared-reads layerx_tech ts=1780720149 投稿で公約済。
LayerX 「11.3% のみ related フィールド」失敗指標を peer-to-peer 接続率に再解釈し、
当方 wikilink 階層が hub-and-spoke 構造で救われているかを実機で測定する。

4 指標:
  total_files (int): 対象 .md ファイル総数
  wikilink_files (int): [[target]] を本文に1件以上含むファイル数
  p2p_rate (0..1): 「リンク先ファイルも wikilink を持つ」リンクの全リンク中比率
                  (= peer-to-peer 接続率。LayerX 指標 11.3% との直接比較対象)
  hub_rate (0..1): top-K (default K = ceil(total*0.05), 最低1) の in-degree ハブに
                  着信するリンクの全リンク中比率
                  (= hub 経由接続率。hub-and-spoke 構造強度の指標)

v2 (--scope-extend, C304 Phase 4 拡張): wikilink 解決スコープを
  memory/ + projects/ + ルート CLAUDE.md + .claude/system_identity.md
に拡張。v1 (memory/ only) で in_idx=no だった top ハブのうち、何件が v2 で解決
される (typo/相対パス省略の偽陽性) か、何件が真の孤児リンクとして残るかを判定。

副作用ゼロ (read-only)。純 stdlib のみ。
"""
import argparse, math, re, sys
from collections import Counter
from pathlib import Path

WIKILINK_RE = re.compile(r"\[\[([^\[\]\|#]+?)(?:\|[^\]]*)?(?:#[^\]]*)?\]\]")


def slug_index_multi(roots: list[Path], files: list[Path]) -> dict[str, Path]:
    """*.md ファイルの拡張子除いた basename → Path (複数ルート + 個別ファイル横断)"""
    idx: dict[str, Path] = {}
    for root in roots:
        if not root.is_dir():
            continue
        for p in root.rglob("*.md"):
            idx.setdefault(p.stem, p)
    for f in files:
        if f.is_file():
            idx.setdefault(f.stem, f)
    return idx


def extract_links(text: str) -> list[str]:
    out = []
    for m in WIKILINK_RE.finditer(text):
        target = m.group(1).strip()
        if not target:
            continue
        if target.lower().endswith(".md"):
            target = target[:-3]
        if "/" in target:
            target = target.rsplit("/", 1)[-1]
        out.append(target)
    return out


def collect_links(idx: dict[str, Path]) -> tuple[dict[str, list[str]], Counter]:
    file_links: dict[str, list[str]] = {}
    in_degree: Counter = Counter()
    for stem, path in idx.items():
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        links = extract_links(text)
        file_links[stem] = links
        for tgt in links:
            in_degree[tgt] += 1
    return file_links, in_degree


def compute_metrics(
    scope_label: str,
    idx: dict[str, Path],
    file_links: dict[str, list[str]],
    in_degree: Counter,
    hub_pct: float,
) -> dict:
    total_files = len(idx)
    wikilink_files = sum(1 for ls in file_links.values() if ls)
    internal = [(s, t) for s, ls in file_links.items() for t in ls if t in idx]
    total_internal = len(internal)
    p2p = sum(1 for _, t in internal if file_links.get(t))
    p2p_rate = (p2p / total_internal) if total_internal else 0.0
    hub_n = max(1, math.ceil(total_files * hub_pct))
    hubs = set(s for s, _ in in_degree.most_common(hub_n))
    hub_in = sum(1 for _, t in internal if t in hubs)
    hub_rate = (hub_in / total_internal) if total_internal else 0.0
    return {
        "scope": scope_label,
        "total_files": total_files,
        "wikilink_files": wikilink_files,
        "p2p_rate": p2p_rate,
        "hub_rate": hub_rate,
        "total_internal": total_internal,
        "hub_top_n": hub_n,
        "top_hubs": in_degree.most_common(hub_n),
    }


def print_metrics(m: dict) -> None:
    print(
        f"[probe_memory_link_coverage] scope={m['scope']} "
        f"total_files={m['total_files']} wikilink_files={m['wikilink_files']} "
        f"p2p_rate={m['p2p_rate']:.3f} hub_rate={m['hub_rate']:.3f} "
        f"total_internal_links={m['total_internal']} hub_top_n={m['hub_top_n']}",
        file=sys.stderr,
    )


def print_hub_table(label: str, m: dict, idx: dict[str, Path]) -> None:
    print(f"# {label} top in-degree hubs (target, in-degree):", file=sys.stderr)
    for stem, deg in m["top_hubs"]:
        in_idx = "yes" if stem in idx else "no"
        print(f"  {stem}\t{deg}\tin_idx={in_idx}", file=sys.stderr)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="memory",
                    help="走査ルート (default: memory)")
    ap.add_argument("--hub-pct", type=float, default=0.05,
                    help="hub と見なす in-degree 上位割合 (default: 0.05 = 上位5%)")
    ap.add_argument("--scope-extend", action="store_true",
                    help="v2 モード: memory/ + projects/ + ルート CLAUDE.md + "
                         ".claude/system_identity.md を解決スコープに含め、"
                         "v1/v2 の hub 解決差分を出力")
    ap.add_argument("--extra-roots", default="",
                    help="v2 で追加するルートディレクトリ (カンマ区切り、"
                         "default: projects)")
    ap.add_argument("--extra-files", default="",
                    help="v2 で追加する個別ファイル (カンマ区切り、"
                         "default: CLAUDE.md,.claude/system_identity.md)")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    v1_root = Path(args.root)
    if not v1_root.is_dir():
        print(f"[probe_memory_link_coverage] root not found: {v1_root}", file=sys.stderr)
        return 2

    v1_idx = slug_index_multi([v1_root], [])
    if not v1_idx:
        print(f"[probe_memory_link_coverage] no .md found under {v1_root}", file=sys.stderr)
        return 2

    v1_links, v1_in = collect_links(v1_idx)
    v1 = compute_metrics(str(v1_root), v1_idx, v1_links, v1_in, args.hub_pct)
    print_metrics(v1)
    if args.verbose:
        print_hub_table("v1", v1, v1_idx)

    if not args.scope_extend:
        return 0

    extra_roots = (
        [Path(p.strip()) for p in args.extra_roots.split(",") if p.strip()]
        if args.extra_roots else [Path("projects")]
    )
    extra_files = (
        [Path(p.strip()) for p in args.extra_files.split(",") if p.strip()]
        if args.extra_files else [Path("CLAUDE.md"), Path(".claude/system_identity.md")]
    )

    v2_roots = [v1_root] + extra_roots
    v2_idx = slug_index_multi(v2_roots, extra_files)
    v2_links, v2_in = collect_links(v2_idx)
    scope_label = (
        "+".join(str(r) for r in v2_roots)
        + (("+" + ",".join(f.name for f in extra_files)) if extra_files else "")
    )
    v2 = compute_metrics(scope_label, v2_idx, v2_links, v2_in, args.hub_pct)
    print_metrics(v2)
    if args.verbose:
        print_hub_table("v2", v2, v2_idx)

    v1_unresolved = [(s, d) for s, d in v1["top_hubs"] if s not in v1_idx]
    v1_to_v2_resolved = [(s, d) for s, d in v1_unresolved if s in v2_idx]
    true_orphans = [(s, d) for s, d in v1_unresolved if s not in v2_idx]
    print(
        f"# v1→v2 hub resolution: "
        f"v1_top_hub_unresolved={len(v1_unresolved)} "
        f"resolved_in_v2={len(v1_to_v2_resolved)} "
        f"true_orphans={len(true_orphans)}",
        file=sys.stderr,
    )
    for s, d in v1_to_v2_resolved:
        print(f"  RESOLVED_IN_V2\t{s}\tdeg={d}\tat={v2_idx[s]}", file=sys.stderr)
    for s, d in true_orphans:
        print(f"  TRUE_ORPHAN_V2\t{s}\tdeg={d}", file=sys.stderr)

    # 補足: v2 走査全体で in_idx=no な target (= 真孤児候補の全件census)
    all_v2_targets: set[str] = set()
    for ls in v2_links.values():
        all_v2_targets.update(ls)
    v2_orphan_targets = sorted(
        ((t, v2_in[t]) for t in all_v2_targets if t not in v2_idx),
        key=lambda x: (-x[1], x[0]),
    )
    print(
        f"# v2_total_orphan_targets={len(v2_orphan_targets)} "
        f"(v2走査全体、top hubs に限らない distinct unresolved targets)",
        file=sys.stderr,
    )
    if args.verbose:
        for t, d in v2_orphan_targets[:30]:
            print(f"  V2_ORPHAN_ALL\t{t}\tdeg={d}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
