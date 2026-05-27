#!/usr/bin/env python3
"""
recall_atom.py — edges.jsonl 経由で関連 atom を 1+ hop 展開 (kaizen #135 段階2)

build_atom_edges.py で生成した edges.jsonl を読み、指定 atom の隣接 atom を
列挙する。type gate (--exclude-type) で wikilink_weak 等のノイズ edge を除外。

使い方:
  python tools/recall_atom.py --root <atoms_dir> --atom <atom_id>
  python tools/recall_atom.py --root <atoms_dir> --atom <id> --exclude-type wikilink_weak
  python tools/recall_atom.py --root <atoms_dir> --atom <id> --max-hops 2
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path


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


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True, help="atoms root dir (edges.jsonl is at <root>/../edges.jsonl)")
    ap.add_argument("--atom", required=True, help="seed atom id")
    ap.add_argument("--exclude-type", action="append", default=[], help="edge types to gate out (repeatable)")
    ap.add_argument("--max-hops", type=int, default=1)
    ap.add_argument("--edges", default=None, help="explicit edges.jsonl path (default: <root>/../edges.jsonl)")
    args = ap.parse_args()
    root = Path(args.root)
    edges_path = Path(args.edges) if args.edges else root.parent / "edges.jsonl"
    edges = load_edges(edges_path)
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
