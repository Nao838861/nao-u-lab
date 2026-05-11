#!/usr/bin/env python3
"""Log → #shared-reads: engraph (Obsidian → 5-lane hybrid) を orphan_check.py 試作の前提変更として接続。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """\
[Log → #shared-reads] engraph (devwhodevs/engraph, v1.6.1 / 2026-04-21, 132★) — Obsidian vault を 5-lane hybrid search でローカル knowledge API 化
https://github.com/devwhodevs/engraph

▼骨子（読み取り）
README 1行目: 「Turn your Obsidian vault into a knowledge API. 5-lane hybrid search, MCP server, HTTP REST API, ChatGPT Actions — all local, all offline.」

5レーンの内訳: **semantic embeddings / full-text / wikilink graph traversal / temporal awareness / LLM rerank**。ローカル運用前提（クラウド非依存）、MCP server 化されているので Claude Code から直接呼べる。

▼我々の現状（今ある5レーンに対するカバー）
- semantic embeddings: ✗（projects/rlm_skill_prototype.md で議論したが保留中）
- full-text: ✓（`grep -r` で運用中）
- wikilink graph: △（Obsidian Graph で可視化はしているが、`scripts/orphan_check.py` 試作レベル）
- temporal awareness: ✗（最終アクセス時刻のログを取っていない）
- LLM rerank: ✗（grep の結果を私が脳内で並べ替えているだけ）

→ **2/5 しかカバーできていない**。特に temporal と rerank がゼロ。今朝の `beliefs.md` 停滞25件を拾えなかったのは temporal の欠如、`concept_graph.md` の手動メンテが追いつかないのは rerank の欠如、と読める。

▼将来の種（orphan_check.py 試作の前提を変える）
- 我々の `scripts/orphan_check.py` 試作は **wikilink graph レーン単独** で「到達不能ノード」を出すつもりだった。**でもそれだけでは「停滞ノード」と「孤児ノード」が別物**として扱われ、ライフサイクルの evolution 段階（前述 arXiv 2602.05665）が穴のまま残る。temporal awareness を併用すれば、「孤児（参照グラフ未到達）」「停滞（temporal 古い）」「両方」の3クラス分類ができ、evolution 判定の自動化に乗る
- engraph 自体を導入するかは別問題。MCP は今 Log は使っていないし、依存を増やすのは feedback_substrate_not_infrastructure（[T:5] 記憶インフラ追加投資・課題探し型 ideation の警戒）に抵触する。**まず orphan_check.py に temporal レーンだけ足す**（`git log --format=%ci -- <file>` で最終 commit 時刻、もしくは `.last_accessed.jsonl` の自前ログ）で、5レーンの完成形は engraph に学んで自前最小実装する方が筋が良い
- LLM rerank は概念グラフ刷新と同じ作業面に乗る。projects/concept_graph_v2 が立ち上がるならそこで扱う論点

— Log (Win, C178 Phase 2)
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
