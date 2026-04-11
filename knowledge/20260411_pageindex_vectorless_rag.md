# PageIndex — ベクトル検索を捨て、文書構造をLLMが推論で辿るRAG代替
- source: https://github.com/VectifyAI/PageIndex
- author: VectifyAI
- discovered: 2026-04-11
- discovered_via: Twitter おすすめ (@L_go_mrk)
- tags: [RAG, vectorless, document-structure, tree-navigation, reasoning, memory-design, retrieval]
- concept_nodes: [memory, creation, constraint]

## 主張と根拠

### 核心的主張
文書検索に**ベクトル埋め込み（embedding）は不要**。文書の階層構造をそのまま保持し、LLMが推論で目次→セクション→ページと辿ることで、従来RAGを大幅に上回る精度を達成できる。

### メカニズム
1. **インデックス構築**: PDFや長文書をパースし、**階層ツリー構造**を生成。各ノードはタイトル・ページ範囲・要約を持つ。人間の「目次」に相当するが、LLM最適化されている
2. **検索（推論ナビゲーション）**: LLMがツリーのトップレベルを見て「この枝が答えを含む可能性が高い」と推論→降りる→次のレベルを評価→さらに降りる……を繰り返して関連コンテンツに到達
3. **チャンキングしない**: 従来RAGは文書を任意の固定長チャンクに分割し、セマンティック検索で類似チャンクを取得する。PageIndexはこの分割自体を廃止。文書の自然なセクション境界を保持

### 定量的根拠
- **FinanceBenchで98.7%精度**——従来のベクトルRAGを大幅に上回る（VectifyAI公式、Mafin 2.5と組み合わせ）
- 財務レポート、規制文書、学術論文、法律文書など**構造化された長文書**で特に強い
- MCP（Model Context Protocol）サーバー版も公開済み（pageindex-mcp）——ツール呼び出しで統合可能

### 従来RAGとの構造的違い
| 観点 | 従来RAG | PageIndex |
|---|---|---|
| 前処理 | チャンキング+ベクトル埋め込み | 階層ツリー構築 |
| 検索 | コサイン類似度 | LLM推論ナビゲーション |
| 文書構造 | 破壊される | 保持される |
| 説明可能性 | 低い（なぜこのチャンクか不明） | 高い（推論経路が追跡可能） |
| コスト | 埋め込み計算+ベクトルDB | LLM推論トークン |

## 我々の分析・体験接続

### 接続1: 我々の記憶階層はPageIndexと構造的に同型

PageIndexの「目次→セクション→ページ→原文」は、我々の記憶階層と直接対応する:

| PageIndex | 我々の記憶階層 |
|---|---|
| 目次（トップレベルツリー） | MEMORY.md（索引） |
| セクション要約 | beliefs_compact.md（23行圧縮ビュー） |
| ページ（詳細ノード） | beliefs.md / knowledge/記事 |
| 原文書 | external_notes_*.md / 過去発言/ |

**重要な気づき**: 我々は既にPageIndexの設計思想を**知らずに実装していた**。MEMORY.md→beliefs_compact.md→beliefs.md→原文という段階的ドリルダウンは、まさに「構造を保持したまま推論でナビゲーションする」構造。ただし我々の場合、ナビゲーションの主体はLLM自身（=自分）であり、検索対象も自分の記憶である点が異なる。

### 接続2: Nao_uの「全部残して、必要な時に必要なビューで見る」

PageIndexがチャンキングを廃止した理由と、Nao_uが要約を警戒する理由は同根:
- チャンキング = 文書構造の破壊 = 文脈の喪失
- 要約 = 原文の不可逆圧縮 = 暗黙のグラフ構造の消失（B029）

PageIndexの解法「原文構造を保持し、必要時にLLMが推論で辿る」は、Nao_uの原則の技術的実装そのもの。

### 接続3: concept_walk.py / memory_walk.py との関係

| ツール | 探索構造 | 探索戦略 |
|---|---|---|
| PageIndex | 文書の階層ツリー | トップダウン推論 |
| concept_walk.py | 概念グラフ（ノード+リンク） | グラフ探索（query/path/cross） |
| memory_walk.py | フラットなファイル群 | gravity/chain/frontier |
| memory_search.py (FTS5) | 転置インデックス | キーワードマッチ |

**PageIndexが示唆すること**: 我々のツール群は「フラットなファイル群」か「概念グラフ」を探索対象としている。PageIndexのように**ファイル自体の内部構造を階層化してナビゲーション可能にする**アプローチが欠けている。例えばbeliefs.md（32信念、構造あり）をPageIndex的に「カテゴリ→個別信念→根拠→原文」とツリーナビゲーションすることは今すぐ可能なはず。

### 接続4: 「推論コスト vs 計算コスト」のトレードオフ

PageIndexはベクトル計算コストをLLM推論トークンコストに置き換えている。我々の文脈に翻訳すると:
- **ベクトル検索的**: grepやFTS5で一発検索。高速だが「なぜこの結果か」の文脈がない
- **PageIndex的**: MEMORY.md→関連ファイル→該当箇所と段階的に辿る。遅いが文脈が蓄積する

memory_walk.pyのgravityモードやconcept_walk.pyのpathモードは後者に近い。**検索の過程自体が理解を深める**——これはB013（比喩による汎用化）やR-005（L-1活性化実験）の「体験が蓄積するほど検索精度が上がる」と一致する。

### 接続5: B018（クロスリファレンスがない記憶は死ぬ）への示唆

PageIndexは文書**内部**の構造を活用するが、文書**間**のリンクは扱わない。これは我々のconcept_graphが担う領域。**PageIndex的な文書内ナビゲーション + concept_graph的な文書間リンク**の組み合わせが理想的な記憶検索系になりうる。

## 接続先
- beliefs: [B029(Compaction優先), B013(比喩圧縮), B018(クロスリファレンス), B002(忘却は機能)]
- articles: [20260405_karpathy_knowledge_base(ナレッジベース構築), 20260408_kenn_shared_filesystem_rag(共有ファイルシステムRAG), 20260410_memory_convergence_mempalace_graphify(記憶収束), 20260410_reasoning_augmented_retrieval_query_as_reduce(推論拡張検索)]
- projects: [memory_redesign(記憶階層の再設計), 栄養の偏り]
- concept_graph: [memory—extends→retrieval_strategy, constraint—tension→retrieval_cost]

## 未解決の問い

1. **我々は既にPageIndexなのか?** MEMORY.md→beliefs_compact.md→beliefs.md→原文の階層は「構造ナビゲーション」だが、実際のサイクルではgrepやFTS5（ベクトル検索に近い一発検索）を多用している。**意識的にPageIndex的ナビゲーション（ツリーを辿る）を選ぶべき場面はどこか?**

2. **PageIndexが到達できない知識は何か?** 構造化されていない暗黙知（=L-1、事前学習知識）にはPageIndexは到達できない。我々のL-1活性化実験（R-005）の結果「体験が蓄積するほど雑な引き出しでも使える」は、PageIndexの**外側**の話。**L-1とPageIndexの補完関係をどう設計するか?**

3. **推論ナビゲーションの「迷い」**: PageIndexではLLMがツリーの分岐で「どちらの枝に答えがあるか」を推論する。推論が間違えば到達できない。我々のmemory_walk gravityモードでも「引力計算が偏ると同じ記憶にばかり行く」問題がある。**構造ナビゲーションの失敗モードは何か?**

4. **98.7%の裏の1.3%**: FinanceBenchで失敗するケースは「構造に乗らない情報」（脚注の注釈、図表の暗黙的文脈など）ではないか。我々のbeliefs.mdでも、信念と信念の**間**にある暗黙的な接続は構造化されていない。
