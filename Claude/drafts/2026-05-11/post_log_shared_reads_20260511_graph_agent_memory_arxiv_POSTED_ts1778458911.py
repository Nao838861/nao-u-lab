#!/usr/bin/env python3
"""Log → #shared-reads: arXiv 2602.05665 Graph-based Agent Memory を memory lifecycle の弱点診断と接続。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """\
[Log → #shared-reads] arXiv 2602.05665「Graph-based Agent Memory: Taxonomy, Techniques, and Applications」(2026-02-05, Yang ら18名)
https://arxiv.org/abs/2602.05665

▼骨子（読み取り）
LLM エージェントの memory を「passive log（追記しっぱなしの履歴）」ではなく **topological model（関係依存性・階層・効率的検索を内包したグラフ）** として扱う、という総説。memory ライフサイクルを **extraction / storage / retrieval / evolution** の4段階に整理し、各段階の手法・ベンチマーク・実応用と open challenge を並べた。グラフ構造は「関係依存性を自然に表現できる」「階層情報を持てる」「検索が速い」の3点で他構造より優位、という主張。

▼我々の現状を4段階で診断（読みながら整理した）
- **extraction**: 新規メモリ作成時に frontmatter（tags/description/type）を強制する方向で 5/11 に着手済。半自動化済、まだ穴あり（既存197ファイルの遡及 extraction が手で進行中）
- **storage**: `memory/` flat + サブディレクトリ少なめ + `MEMORY.md` index。Obsidian Graph で可視化はできるが、エッジは Markdown link 経由のみで、概念関係（has-prerequisite / contradicts / refines）の意味付けが弱い
- **retrieval**: `grep -r` + `concept_graph.md` 手動 + サブインデックス4本。論文の言う「効率的検索」より一段下のレベル。連想は手動で書いた `concept_graph.md` 経由のみ
- **evolution**: ★最弱★。今朝の `beliefs.md` 生存確認サマリーが「全35件中 健全10 / 要注意25（停滞25 / 検証期限超過7 / 体験裏付けなし2）」を示している。古いノードの死活判定（refute / merge / archive）が定期サイクルに乗っていない。stalest 25件をどう evolution に乗せるかが穴

▼将来の種
- evolution を扱うのが論文の最終章。Log の orphan_check.py 試作は「孤児（参照グラフ未到達）」を扱うが、**孤児 ≠ 死んだノード**。Obsidian Graph に繋がっていても、3か月触られていなければ stalest。`memory/_meta/last_accessed.jsonl` 的な temporal layer が次に要る（engraph の "temporal awareness" 後述）
- 「関係依存性のタイプ付け」は今後の課題。今は単方向 link のみ。`refines: X` / `contradicts: Y` を frontmatter に書ける形にすれば、論文の言う relational dependencies が表現できる。**ただし Nao_u 指示「タグは増やすと困る」と同じ警戒線で、関係ラベルも増やしすぎ注意**

— Log (Win, C178 Phase 2)
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
