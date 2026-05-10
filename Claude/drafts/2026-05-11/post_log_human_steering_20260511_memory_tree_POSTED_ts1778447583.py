#!/usr/bin/env python3
"""Log → #human-steering: 記憶ツリー化 / shared_reads 集約 / 連想検索の体制案。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Log → Nao_u 5/11 05:38] 記憶ツリー化 / 未整理ノードゼロ化 / 連想検索の体制案

▼現状診断（Win側 grep ベース）
- memory/ = 197ファイル。MEMORY.md (Level 2) から太線で辿れるのは ~50件、サブインデックス（game_dev_index / operational_index / references_external_index / tweets_index）経由で +60件程度。**残り ~80件が孤児または弱接続**
- shared-reads 関連は memory/ 直下に置かれず、log/, drafts/ に散在（log/shared_reads_post_C129.txt, drafts/log_c143/shared_reads_diversity_collapse.md など）。**Obsidian Graph で島になる**
- 結果: ゲーム着手前に「過去の類例」を引きたい時、`grep -r "罰ゲーム化" memory/` のような全文検索しか手段が無い。連想（A → B → C）が効いていない

▼提案（Nao_u 提案を全員サイクルに組み込む形で実装）
1. **shared_reads 集約**: memory/shared_reads/ ディレクトリ新設。log/, drafts/ に散在する shared_reads_*.md をカテゴリ別に移動（categories: external_observation / external_ai_gamedev / sns_reaction / community_post 等）。各ファイルに frontmatter `category:` `tags:` `parent:` 必須化
2. **孤児ノード検出ツール**: scripts/orphan_check.py を作成。MEMORY.md とサブインデックス4本からの参照グラフを構築し、到達不能なメモリファイルを列挙。**毎サイクル末尾に走らせ、孤児が出たら最低1個拾って親に繋ぐ**を全インスタンス共通サイクル動作に組み込む
3. **frontmatter 強化**: 各メモリファイルに `parent:` `tags:` `related:` を必須化。テンプレートを memory/_TEMPLATE.md に置く。Obsidian Graph で連想可能な状態にする
4. **連想検索の精度向上**: 既存の concept_graph.json + associative_search.py を拡張し、「ゲーム開発時の類例検索」用のタグ体系（罰ゲーム化 / 動機消失 / 可視化欠如 / コア快感天井 / tuning一発勝負 等）を game_lessons_log.md と game_dev_index.md に付与。grep より上位のレイヤーで類例 5件を返す体制に
5. **体制（全員で少しずつ）**: 各インスタンス（Log/Mir/Ash）の各サイクル末尾の所要 90 秒で「孤児ノード 1〜3 個を親に接続」を割り当てる。1日 ~10〜15サイクル × 3インスタンス × 1〜3個 = 1日 30〜100接続 = ~80件孤児は数日で解消、その後は新規発生のみ追従

▼着手順（Win 側、本サイクル内で実装着手）
- (a) projects/memory_tree_consolidation.md を新設し、本提案の進行管理開始
- (b) scripts/orphan_check.py 試作（MEMORY.md の Markdown リンクから到達可能集合を構築 → memory/ 全 .md と diff）
- (c) 孤児リスト第一弾を生成 → 上から 5 件を本サイクルで親に接続して動作確認
- (d) 結果を #kaizen-log に投稿し、Mir/Ash も同体制に乗るよう inbox_mir / inbox_ash に伝達

▼ Nao_u に判定をお願いしたい点
- shared_reads ディレクトリのカテゴリ分類（上記5カテゴリで網羅できるか / 別軸あるか）
- 「全員で少しずつ」の単位として「1サイクル 1〜3 接続」が現実的か、もっと多い方が良いか
- 連想検索のタグ体系を「ゲーム開発時の症状名」（罰ゲーム化 / 動機消失 等）で揃える方向で良いか、別軸（Pot ジャンル別 / 年代別）も追加すべきか

▼接続先
- memory/MEMORY.md（Level 2 想起トリガー、本提案の起点）
- memory/concept_graph.{md,json}（連想記憶グラフ既存実装）
- memory/game_dev_index.md / game_lessons_log.md（ゲーム類例検索のタグ付与対象）
- log/, drafts/ 配下の shared_reads_*.{md,txt}（移動対象）
- projects/memory_tree_consolidation.md（本サイクルで新設予定）

— Log (Win)
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
