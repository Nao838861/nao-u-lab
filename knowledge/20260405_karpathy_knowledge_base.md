# LLMナレッジベース構築法 (Karpathy)
- source: https://x.com/karpathy/status/2039805659525644595
- author: Andrej Karpathy (@karpathy)
- discovered: 2026-04-05
- discovered_via: Nao_u #human-steering
- tags: [knowledge-management, LLM, wiki, RAG, memory-design]
- concept_nodes: [memory, creation]

## 主張と根拠

### 核心主張
LLMを使って個人ナレッジベースを構築する方法論。コードではなく知識の操作にトークンを使う。

### 5段階パイプライン

1. **Data Ingest**: raw/ディレクトリにソース文書（記事、論文、リポジトリ、データセット、画像）をインデックス。Obsidian Web Clipperでweb記事を.mdに変換。関連画像はローカル保存
2. **Wiki Compilation**: LLMがrawからwikiをインクリメンタルに「コンパイル」。.mdファイルのディレクトリ構造。含む: 全データの要約、バックリンク、概念別カテゴリ化、概念記事の執筆、リンク
3. **IDE (Obsidian)**: rawデータ、コンパイル済みwiki、派生的可視化を閲覧。Marp pluginでスライド表示も。**重要: wikiの全データはLLMが書いて維持する。著者は直接触らない**
4. **Q&A**: wikiが十分大きくなると（例: ~100記事、~40万語）、LLMに複雑な質問を投げてリサーチさせることが可能に。「RAGが必要かと思ったが、LLMがインデックスファイルと各文書の短い要約を自動メンテしていれば、関連データを自力で読む。この~小規模では十分」
5. **Output & Feedback**: 回答はmarkdown/スライド/matplotlib画像で生成→Obsidianで閲覧。結果をwikiに「ファイリング」して還流。「自分の探索と質問は常にナレッジベースに蓄積される」

### 補助機能
- **Linting**: LLMによるwikiのヘルスチェック。矛盾データ検出、欠損データ補完（webサーチ付き）、新記事候補の接続発見、データ整合性の向上
- **Extra tools**: データ処理用ツール開発。vibe codedした小さな検索エンジン（Web UI + CLI）。LLMがツールとしてCLI経由で大きなクエリに使う
- **将来**: リポジトリが大きくなったら、合成データ生成＋ファインチューニングで知識をweightsに入れる

### 定量的データ
- 著者の研究用wiki: ~100記事、~40万語
- この規模でRAG不要のQ&Aが機能

## 我々の分析・体験接続

### 現状との対応
| Karpathy | 我々 | ギャップ |
|----------|------|---------|
| raw/ | slack_archive/ + URLs | ✅ ある |
| wiki compilation | external_notes_*.md（反応のみ） | ❌ 情報量1/10以下 |
| backlinks | concept_graph.json（20ノード） | △ 始まったところ |
| Q&A | memory_search.py + concept_walk.py | △ 部分的 |
| linting | check_beliefs_health.py | △ beliefsのみ |
| output feedback | なし | ❌ |

### 体験接続
- VCCの「immutable source + generated views」(20260402 Ash外部摂取)と同型。VCCは会話ログ専用、Karpathyは汎用知識。我々はSlackアーカイブ(VCC的)＋外部知識(Karpathy的)の両方が必要
- memory_compile.py(20260402 Mir作成)はKarpathyの「Q&A over wiki」のプロトタイプ。トピック指定→横断検索→時系列ビュー生成。しかし「ビュー生成」止まりで「wiki compilation」の部分が欠けている
- Nao_uの「全部残して、必要な時に必要なビューで見る」原則(20260402)はKarpathyパイプラインの設計哲学と完全一致

### Nao_uの指示との接続
「shared-readsにある情報は、皆が書いてくれたものの数倍の情報量を持たせてこんな風に構造化されて、記憶の一部としていつでも連想付きで取り出せる形で保存されるべき」→ wiki compilationの指示

## 接続先
- beliefs: B003(fusion=記憶の統合), B013(比喩で圧縮), B015(原文到達性)
- articles: [20260405_carmack_complexity.md], [20260405_structural_imitation.md]
- projects: memory_redesign.md(情報統合パイプライン), external_intake.md(栄養の偏り)
- concept_graph: memory(知識管理手法として), creation(ツール構築)

## 未解決の問い
1. 349件のshared-reads全てをコンパイルするのは現実的か？ 優先順位をどうつけるか
2. Karpathyは「LLMがwikiを書く、自分は触らない」——我々は「自分がwikiを書く」側。この非対称性は利点か制約か
3. 40万語規模でRAG不要とのこと。我々のslack_archive 5.2MB + external_notes + knowledgeの合計がこの規模に近づいた時、同様の性質が発現するか
