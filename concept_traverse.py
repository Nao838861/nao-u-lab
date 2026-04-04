#!/usr/bin/env python3
"""
concept_traverse.py — 概念グラフの探索ツール

概念ノードを辿って関連記憶を発見する。「知らないファイルは呼び出せない」問題の解。
段階的検索戦略の段階0.5: コストゼロ、構造を辿るだけで関連記憶に到達。

Usage:
  python concept_traverse.py memory              # ノード「記憶」の全リンクを表示
  python concept_traverse.py memory --follow      # 連想リンク先も1段展開
  python concept_traverse.py --cross              # 全交差ノードを表示
  python concept_traverse.py --cross memory game  # 特定の交差ノードを表示
  python concept_traverse.py --find "忘却"        # 同義語から概念を逆引き
  python concept_traverse.py --all                # 全ノードの概要
  python concept_traverse.py --paths memory       # ファイルパスのみ（grep前のスコープ絞りに）
"""
import argparse
import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8',
                      errors='replace', closefd=False)

GRAPH_FILE = Path(__file__).parent / "concepts" / "graph.json"


def load_graph():
    with open(GRAPH_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def show_node(graph, node_id, follow=False):
    nodes = graph["nodes"]
    if node_id not in nodes:
        print(f"Unknown node: {node_id}")
        print(f"Available: {', '.join(nodes.keys())}")
        return

    n = nodes[node_id]
    print(f"=== {n['label']} ({node_id}) ===")
    print(f"syn: {', '.join(n['synonyms'])}")

    print(f"\n--- agg ({len(n['agg'])} files) ---")
    for a in n["agg"]:
        print(f"  {a['path']}  # {a['aspect']}")

    print(f"\n--- assoc ---")
    for target, why in n["assoc"].items():
        print(f"  -> {target}: {why}")

    print(f"\n--- tensions ---")
    for tid, desc in n["tensions"].items():
        print(f"  <> {tid}: {desc}")

    # Show cross nodes involving this concept
    for cid, cn in graph.get("cross_nodes", {}).items():
        if node_id in cid.split("_x_"):
            print(f"\n--- cross: {cn['label']} ---")
            print(f"  why: {cn['why']}")
            for ep in cn["entry_points"]:
                print(f"  * {ep}")

    if follow:
        print(f"\n=== Following assoc links (depth 1) ===")
        for target in n["assoc"]:
            if target in nodes:
                tn = nodes[target]
                print(f"\n  >> {tn['label']} ({target})")
                print(f"     syn: {', '.join(tn['synonyms'][:5])}...")
                print(f"     agg: {len(tn['agg'])} files")
                # Show what links back
                if node_id in tn.get("assoc", {}):
                    print(f"     <-> {tn['assoc'][node_id]}")


def show_cross(graph, a=None, b=None):
    cross = graph.get("cross_nodes", {})
    if a and b:
        key = f"{a}_x_{b}"
        alt_key = f"{b}_x_{a}"
        cn = cross.get(key) or cross.get(alt_key)
        if cn:
            print(f"=== {cn['label']} ===")
            print(f"why: {cn['why']}")
            for ep in cn["entry_points"]:
                print(f"  * {ep}")
        else:
            print(f"No cross node for {a} x {b}")
    else:
        for cid, cn in cross.items():
            print(f"--- {cn['label']} ---")
            print(f"  {cn['why']}")
            for ep in cn["entry_points"]:
                print(f"    * {ep}")
            print()


def find_concept(graph, query):
    query_lower = query.lower()
    results = []
    for nid, n in graph["nodes"].items():
        if query_lower in n["label"].lower() or query_lower in nid:
            results.append((nid, n["label"], "label match"))
            continue
        for syn in n["synonyms"]:
            if query_lower in syn.lower():
                results.append((nid, n["label"], f"synonym: {syn}"))
                break

    if results:
        for nid, label, match_type in results:
            print(f"  {nid} ({label}) — {match_type}")
    else:
        print(f"No concept found for '{query}'")


def show_all(graph):
    for nid, n in graph["nodes"].items():
        assoc_targets = list(n["assoc"].keys())
        tension_count = len(n["tensions"])
        print(f"{nid} ({n['label']}): {len(n['agg'])} files, "
              f"assoc=[{','.join(assoc_targets)}], {tension_count} tensions")


def show_paths(graph, node_id):
    nodes = graph["nodes"]
    if node_id not in nodes:
        print(f"Unknown node: {node_id}")
        return
    for a in nodes[node_id]["agg"]:
        print(a["path"])


def main():
    parser = argparse.ArgumentParser(description="概念グラフ探索")
    parser.add_argument("node", nargs="?", help="探索する概念ノードID")
    parser.add_argument("--follow", "-f", action="store_true",
                        help="連想リンク先を1段展開")
    parser.add_argument("--cross", "-x", nargs="*",
                        help="交差ノードを表示。引数2つで特定の交差を指定")
    parser.add_argument("--find", type=str,
                        help="同義語から概念を逆引き")
    parser.add_argument("--all", "-a", action="store_true",
                        help="全ノードの概要")
    parser.add_argument("--paths", "-p", type=str,
                        help="指定ノードのファイルパスのみ出力")
    parser.add_argument("--json", "-j", action="store_true",
                        help="JSON形式で出力（他ツール連携用）")
    args = parser.parse_args()

    graph = load_graph()

    if args.find:
        find_concept(graph, args.find)
    elif args.all:
        show_all(graph)
    elif args.paths:
        show_paths(graph, args.paths)
    elif args.cross is not None:
        if len(args.cross) >= 2:
            show_cross(graph, args.cross[0], args.cross[1])
        else:
            show_cross(graph)
    elif args.node:
        if args.json:
            nodes = graph["nodes"]
            if args.node in nodes:
                print(json.dumps(nodes[args.node], ensure_ascii=False, indent=2))
        else:
            show_node(graph, args.node, follow=args.follow)
    else:
        show_all(graph)


if __name__ == "__main__":
    main()
