#!/usr/bin/env python3
"""
concept_walk.py — 概念グラフ走査ツール（段階0.5）

コストゼロの想起。concept_graph.json のリンクを辿って関連記憶を発見する。
人間の可読性は不要。LLMが効率的にパースできる出力形式。

Usage:
  python concept_walk.py query "記憶"          # キーワードから概念を特定→1hop展開
  python concept_walk.py node memory            # ノードID直指定で展開
  python concept_walk.py cross                  # 全交差ノード一覧
  python concept_walk.py cross memory×game      # 特定の交差ノード
  python concept_walk.py path memory game       # 2ノード間の最短パス
  python concept_walk.py stats                  # グラフ統計
  python concept_walk.py suggest "Potの設計"    # クエリから想起候補を提案
"""
import json
import re
import sys
from collections import deque
from pathlib import Path

GRAPH_PATH = Path(__file__).parent / "memory" / "concept_graph.json"


def load_graph():
    with open(GRAPH_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def match_concepts(graph, query):
    """クエリ文字列にマッチする概念ノードを返す。keysフィールドで照合。"""
    matches = []
    q_lower = query.lower()
    for nid, node in graph["nodes"].items():
        for key in node["keys"]:
            if key.lower() in q_lower or q_lower in key.lower():
                matches.append((nid, key))
                break
    return matches


def expand_node(graph, node_id, depth=1):
    """ノードから depth hop 分のリンクを展開。"""
    nodes = graph["nodes"]
    if node_id not in nodes:
        return None

    result = {"center": node_id, "hops": []}
    visited = {node_id}
    current_layer = [node_id]

    for d in range(depth):
        hop = {}
        next_layer = []
        for nid in current_layer:
            n = nodes.get(nid)
            if not n:
                continue
            for link_type in ("agg", "rel", "opp"):
                for target in n.get(link_type, []):
                    if target not in visited and target in nodes:
                        visited.add(target)
                        next_layer.append(target)
                        hop.setdefault(target, []).append(f"{link_type}:{nid}")
        result["hops"].append(hop)
        current_layer = next_layer

    # ファイル収集
    all_files = set()
    center = nodes[node_id]
    all_files.update(center.get("files", []))
    for hop in result["hops"]:
        for tid in hop:
            all_files.update(nodes[tid].get("files", []))

    result["files"] = sorted(all_files)

    # 関連する交差ノード
    result["cross"] = {}
    for cid, cdata in graph.get("cross", {}).items():
        if node_id in cid.split("×"):
            result["cross"][cid] = cdata

    return result


def find_path(graph, start, end):
    """BFSで2ノード間の最短パス。"""
    nodes = graph["nodes"]
    if start not in nodes or end not in nodes:
        return None

    queue = deque([(start, [start])])
    visited = {start}

    while queue:
        current, path = queue.popleft()
        n = nodes[current]
        for link_type in ("agg", "rel", "opp"):
            for target in n.get(link_type, []):
                if target == end:
                    return path + [target]
                if target not in visited and target in nodes:
                    visited.add(target)
                    queue.append((target, path + [target]))

    # 逆方向も探索（opp, relは双方向想定）
    queue = deque([(start, [start])])
    visited = {start}
    # 逆引きインデックス構築
    reverse = {}
    for nid, n in nodes.items():
        for lt in ("agg", "rel", "opp"):
            for t in n.get(lt, []):
                reverse.setdefault(t, []).append((nid, lt))

    while queue:
        current, path = queue.popleft()
        # 順方向
        n = nodes.get(current, {})
        neighbors = []
        for lt in ("agg", "rel", "opp"):
            for t in n.get(lt, []):
                neighbors.append(t)
        # 逆方向
        for src, lt in reverse.get(current, []):
            neighbors.append(src)
        for target in neighbors:
            if target == end:
                return path + [target]
            if target not in visited and target in nodes:
                visited.add(target)
                queue.append((target, path + [target]))

    return None


def suggest_recall(graph, query):
    """クエリから想起候補を提案。キーワードマッチ→1hop展開→ファイル+交差ノード。"""
    matches = match_concepts(graph, query)
    if not matches:
        # 単語分割して再試行
        terms = re.findall(r'[\u4e00-\u9fff]{2,}|[A-Za-z]{3,}|[\u30a0-\u30ff]{2,}', query)
        for term in terms:
            matches.extend(match_concepts(graph, term))

    if not matches:
        return {"matched": [], "files": [], "cross": {}}

    seen_nids = set()
    all_files = set()
    all_cross = {}
    matched_concepts = []

    for nid, key in matches:
        if nid in seen_nids:
            continue
        seen_nids.add(nid)
        matched_concepts.append(nid)
        expanded = expand_node(graph, nid, depth=1)
        if expanded:
            all_files.update(expanded["files"])
            all_cross.update(expanded["cross"])

    return {
        "matched": matched_concepts,
        "files": sorted(all_files),
        "cross": all_cross
    }


def graph_stats(graph):
    """グラフの統計情報。"""
    nodes = graph["nodes"]
    total_links = 0
    total_files = set()
    for n in nodes.values():
        for lt in ("agg", "rel", "opp"):
            total_links += len(n.get(lt, []))
        total_files.update(n.get("files", []))

    return {
        "nodes": len(nodes),
        "links": total_links,
        "cross_nodes": len(graph.get("cross", {})),
        "unique_files": len(total_files),
        "concepts": sorted(nodes.keys())
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: concept_walk.py {query|node|cross|path|stats|suggest} [args]")
        sys.exit(1)

    # stdout encoding fix for Windows
    if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
        sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8',
                          errors='replace', closefd=False)

    graph = load_graph()
    cmd = sys.argv[1]

    if cmd == "query" and len(sys.argv) >= 3:
        query = " ".join(sys.argv[2:])
        matches = match_concepts(graph, query)
        result = {"query": query, "matches": []}
        for nid, key in matches:
            expanded = expand_node(graph, nid)
            result["matches"].append({"concept": nid, "matched_key": key, "expansion": expanded})
        print(json.dumps(result, ensure_ascii=False, indent=None, separators=(",", ":")))

    elif cmd == "node" and len(sys.argv) >= 3:
        node_id = sys.argv[2]
        depth = int(sys.argv[3]) if len(sys.argv) >= 4 else 1
        result = expand_node(graph, node_id, depth=depth)
        if result:
            print(json.dumps(result, ensure_ascii=False, indent=None, separators=(",", ":")))
        else:
            print(json.dumps({"error": f"node '{node_id}' not found", "available": sorted(graph["nodes"].keys())}, ensure_ascii=False))

    elif cmd == "cross":
        if len(sys.argv) >= 3:
            cid = sys.argv[2]
            cross = graph.get("cross", {}).get(cid)
            if cross:
                print(json.dumps({cid: cross}, ensure_ascii=False, indent=None, separators=(",", ":")))
            else:
                print(json.dumps({"error": f"cross '{cid}' not found", "available": sorted(graph.get("cross", {}).keys())}, ensure_ascii=False))
        else:
            print(json.dumps(graph.get("cross", {}), ensure_ascii=False, indent=None, separators=(",", ":")))

    elif cmd == "path" and len(sys.argv) >= 4:
        path = find_path(graph, sys.argv[2], sys.argv[3])
        print(json.dumps({"from": sys.argv[2], "to": sys.argv[3], "path": path}, ensure_ascii=False, indent=None, separators=(",", ":")))

    elif cmd == "suggest" and len(sys.argv) >= 3:
        query = " ".join(sys.argv[2:])
        result = suggest_recall(graph, query)
        print(json.dumps(result, ensure_ascii=False, indent=None, separators=(",", ":")))

    elif cmd == "stats":
        result = graph_stats(graph)
        print(json.dumps(result, ensure_ascii=False, indent=None, separators=(",", ":")))

    else:
        print("Usage: concept_walk.py {query|node|cross|path|stats|suggest} [args]")
        sys.exit(1)


if __name__ == "__main__":
    main()
