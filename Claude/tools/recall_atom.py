#!/usr/bin/env python3
"""
recall_atom.py — edges.jsonl 経由で関連 atom を 1+ hop 展開 (kaizen #135 段階2/3)

build_atom_edges.py で生成した edges.jsonl を読み、指定 atom の隣接 atom を
列挙する。type gate (--exclude-type) で wikilink_weak 等のノイズ edge を除外。

使い方:
  python tools/recall_atom.py --root <atoms_dir> --atom <atom_id>
  python tools/recall_atom.py --root <atoms_dir> --atom <id> --exclude-type wikilink_weak
  python tools/recall_atom.py --root <atoms_dir> --atom <id> --max-hops 2
  python tools/recall_atom.py --root <atoms_dir> --golden-bench T0   # 段階3 ベンチ
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

GOLDEN_TYPES = frozenset({"superseded_by", "supersedes", "canonical_id", "group_id"})
GOLDEN_BENCH_T0_SEEDS = (
    "sr-1778279139-447a22e3d1",
    "sr-1778303440-699f41ada0",
    "sr-1778541418-0f25c063e5",
    "sr-1779770178-5d606254b2",
    "gr-1777572083-e993020cfc",
)
GOLDEN_BENCH_T0_EXCLUDE = frozenset({"wikilink_weak"})


def load_edges(edges_path: Path) -> list[dict]:
    if not edges_path.exists():
        raise FileNotFoundError(
            f"edges.jsonl not found at {edges_path}. "
            f"Run: python tools/build_atom_edges.py --root <root> --output {edges_path}"
        )
    edges: list[dict] = []
    with edges_path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            edges.append(json.loads(line))
    return edges


def expand(
    seed: str, edges: list[dict], exclude_types: set[str], max_hops: int
) -> dict[str, list[tuple[str, str, int]]]:
    """seed から max_hops 以内で到達できる atom を {atom_id: [(via_src, type, hop)]} で返す"""
    visited: dict[str, list[tuple[str, str, int]]] = {}
    frontier = {seed}
    for hop in range(1, max_hops + 1):
        next_frontier: set[str] = set()
        for e in edges:
            if e["type"] in exclude_types:
                continue
            for from_node, to_node in ((e["src"], e["tgt"]), (e["tgt"], e["src"])):
                if from_node in frontier and to_node != seed and to_node not in visited:
                    visited.setdefault(to_node, []).append((from_node, e["type"], hop))
                    next_frontier.add(to_node)
        if not next_frontier:
            break
        frontier = next_frontier
    return visited


def run_golden_bench_t0(edges: list[dict]) -> int:
    """段階3 T0 ベンチ: 5 seed × 1-hop 展開を「4 type golden」と照合し precision/recall を出す。

    candidate = expand(seed, exclude={wikilink_weak})
    golden    = expand(seed, edges restricted to GOLDEN_TYPES)
    precision = |candidate ∩ golden| / |candidate|, 分母 0 は 0 出力
    recall    = |candidate ∩ golden| / |golden|,    分母 0 は 0 出力
    golden ⊆ candidate なので overlap = |golden|、recall は理論上 1.0 が標準 (= 候補に golden 取りこぼしが無い)、
    precision の高低が「候補の noise 量」を示す T0 基準点となる。
    """
    all_types = {e["type"] for e in edges}
    non_golden_excl = all_types - set(GOLDEN_TYPES)
    p_sum, r_sum, p_n, r_n = 0.0, 0.0, 0, 0
    for seed in GOLDEN_BENCH_T0_SEEDS:
        candidate = set(expand(seed, edges, set(GOLDEN_BENCH_T0_EXCLUDE), 1).keys())
        golden = set(expand(seed, edges, non_golden_excl, 1).keys())
        overlap = candidate & golden
        n, g, k = len(candidate), len(golden), len(overlap)
        precision = (k / n) if n > 0 else 0.0
        recall = (k / g) if g > 0 else 0.0
        print(
            f"[recall_atom golden T0] seed={seed} related_count={n} "
            f"golden_count={g} golden_overlap={k} "
            f"precision={precision:.3f} recall={recall:.3f}"
        )
        if n > 0:
            p_sum += precision
            p_n += 1
        if g > 0:
            r_sum += recall
            r_n += 1
    avg_p = (p_sum / p_n) if p_n > 0 else 0.0
    avg_r = (r_sum / r_n) if r_n > 0 else 0.0
    print(
        f"[recall_atom golden T0] avg precision={avg_p:.3f} (over {p_n}/{len(GOLDEN_BENCH_T0_SEEDS)} non-empty candidate) "
        f"recall={avg_r:.3f} (over {r_n}/{len(GOLDEN_BENCH_T0_SEEDS)} non-empty golden)"
    )
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True, help="atoms root dir (edges.jsonl is at <root>/../edges.jsonl)")
    ap.add_argument("--atom", help="seed atom id (not required when --golden-bench is set)")
    ap.add_argument("--exclude-type", action="append", default=[], help="edge types to gate out (repeatable)")
    ap.add_argument("--max-hops", type=int, default=1)
    ap.add_argument("--edges", default=None, help="explicit edges.jsonl path (default: <root>/../edges.jsonl)")
    ap.add_argument("--golden-bench", choices=["T0"], default=None,
                    help="run golden-set bench (kaizen #135 段階3); T0 = 5 hardcoded seed × 1-hop")
    args = ap.parse_args()
    root = Path(args.root)
    edges_path = Path(args.edges) if args.edges else root.parent / "edges.jsonl"
    edges = load_edges(edges_path)
    if args.golden_bench == "T0":
        sys.stderr.write(
            f"[recall_atom golden T0] edges_path={edges_path} edges={len(edges)} "
            f"seeds={len(GOLDEN_BENCH_T0_SEEDS)} golden_types={sorted(GOLDEN_TYPES)} "
            f"exclude={sorted(GOLDEN_BENCH_T0_EXCLUDE)}\n"
        )
        return run_golden_bench_t0(edges)
    if not args.atom:
        ap.error("--atom is required unless --golden-bench is set")
    excl = set(args.exclude_type)
    visited = expand(args.atom, edges, excl, args.max_hops)
    sys.stderr.write(
        f"[recall_atom] seed={args.atom} edges={len(edges)} "
        f"exclude_types={sorted(excl) or '-'} max_hops={args.max_hops} "
        f"related={len(visited)}\n"
    )
    for atom_id, vias in sorted(visited.items()):
        sample = vias[0]
        sys.stderr.write(f"  - {atom_id} (via {sample[0]} type={sample[1]} hop={sample[2]})\n")
    for atom_id in sorted(visited):
        print(atom_id)
    return 0


if __name__ == "__main__":
    sys.exit(main())
