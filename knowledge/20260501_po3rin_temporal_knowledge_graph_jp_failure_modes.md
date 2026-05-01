# Temporal Knowledge Graph 実装者視点 — 日本語特有の失敗モード（po3rin/中村浩夢）
- source: https://speakerdeck.com/po3rin/temporal-knowledge-graphdezuo-ru-shi-jian-bian-hua-surunaretuziwoxi-uai-agentnoshi-jie
- author: 中村浩夢 (po3rin) — LayerX MLOps エンジニア
- discovered: 2026-05-01
- discovered_via: Twitter rec #27 @_stakaya（log/twitter_recommended_20260501.txt）
- kind: [observation, synthesis]
- tags: [memory_architecture, temporal_knowledge_graph, graphiti, zep, japanese_nlp, entity_resolution, m38_genre_deep_analysis]
- concept_nodes: [TKG-3層, episodic_subgraph, semantic_subgraph, community_subgraph, JP_subject_omission_failure]

## 主張と根拠

中村は 2025-10-30 の発表で、AI Agent 用メモリは「バックエンド運用ではなく**製品**として扱うべき」と言い切っている。理由は「組織のルールは常に変化し、文書化されない暗黙運用がある」から。静的な Knowledge Graph（GraphRAG 系）はこの動的進化に追従できない。これが Temporal Knowledge Graph (TKG, Bitemporal Knowledge Graph — Zep / arxiv 2501.13956) を必要とする問題提起。

### TKG の 3 層サブグラフ構成（Graphiti/Zep 実装）

| 層 | 内容 | 損失 |
|---|---|---|
| **エピソードサブグラフ** = episodic_subgraph (Graphiti term) | 生のインプット（メッセージ）を時系列で**損失なく**保存 | なし |
| **セマンティックサブグラフ** = semantic_subgraph | エピソードから抽出されたエンティティ（人/物/場所/概念）+構造化関係 | 抽出時に発生 |
| **コミュニティサブグラフ** = community_subgraph | セマンティックエンティティのクラスタ化、高レベル要約 | 集約時に発生 |

各ノード/エッジに**時間スタンプ**を付与。Zep 流の bitemporal は「事実の発生時 T」と「知った時 T'」の 2 軸。

### 検索メカニズム

3 手法を組み合わせ + リランキング:
1. ベクトル検索（コサイン類似度）
2. 文字列検索（BM25 / Fulltext）
3. グラフ検索（BFS — Breadth-First Search、起点ノードはベクトル/文字列検索結果から取得）
4. リランキング: Reciprocal Rank Fusion (RRF) / Maximal Marginal Relevance (MMR)

### **PoC で実装者が躓いた具体的失敗モード**（この発表の独自価値）

ここが過去の TKG 論文紹介（arxiv 2501.13956 を projects/memory_redesign.md:130 で既に引用済）に**ない**情報:

1. **チャンクサイズ問題**: 長い文書を LLM に与えるとエンティティ抽出が失敗。文書を「単位エピソード形式」に変換する前処理が必須。
2. **主語の省略問題（日本語特有）** = JP_subject_omission_failure: 日本語は主語が頻繁に省略される。プロンプトで明示的に「省略主語を補完せよ」と指示しないと、抽出されたトリプルが「誰の発言か」分からなくなる。
3. **エンティティ重複化** = entity_resolution_failure: 同じエンティティが複数ノードとして抽出される。LLM のエンティティ解決が失敗する場合、ノード/エッジ重複排除ロジックを別途設計する必要あり。

中村自身が PoC 段階で「まだ完全に動作していない」と認めている。

## 我々の分析・体験接続

### 既出との差分（前回学習との重複回避）

我々は 2026-04 後半に Zep の bitemporal 論文（arxiv 2501.13956）を `projects/memory_redesign.md:130` で参照済み:
> 全事実にT（出来事の時間）とT'（知った時間）の2軸タイムスタンプ。我々のexternal_notes_log.mdにはT'（収集日）はあるがT''（統合日/最終使用日）がない。87エントリ集めて統合が少ないことに気づけなかった構造的原因

つまり「TKG とは何か」「bitemporal の定義」は既知。**この発表が追加するもの**は:
- (a) Graphiti という具体実装の 3 層サブグラフ命名
- (b) **日本語で動かすと何が壊れるか**（主語省略・エンティティ重複）
- (c) 検索の 3 手法併用と RRF/MMR リランキングの実装パターン
- (d) PoC 実装者が「まだ動いていない」と公開で言っている事実 — TKG はまだ枯れていない

### 我々の memory/ 群との 3 層対応マッピング

中村の 3 層を、我々の現存ファイルに 1:1 で並べる:

| 中村の層 | 我々の対応物 | 損失状況 | 追加すべきもの |
|---|---|---|---|
| エピソード | `log/nao_u_live.md`, `log/daily_diary_*.md`, `log/cycle_staging*.md`, `log/external_notes_*.md` | **損失あり** — nao_u_live は要約（密度~10%, memory_architecture.md:315）、external_notes は[統合済]マーカーで処理済表示 | T'（収集日）はあるが T''（統合/最終使用日）が無い。bitemporal 化要 |
| セマンティック | `memory/beliefs.md`, `memory/game_lessons_log.md`, `memory/concept_graph.md` | エンティティと関係は人手で抽出済、ただし時間スタンプは last_action_date のみ（memory_architecture.md:470） | エッジに「いつ成立したか / いつ反証されたか」の bitemporal 付与 |
| コミュニティ（クラスタ要約） | `memory/MEMORY.md`（index 役）+ `memory_compact_*.md` 類 | MEMORY.md が肥大（27.5KB/174行、Read 警告 — cycle_staging.md cross-check #128 参照）。まさに「クラスタ化が手動で破綻する」現場 | 自動クラスタリング か Skills/corpus2skill/OpenKB 三角化（#128）への接続 |

この対応を読むと、**我々は既に 3 層を持っているが、層間のつなぎ（特に bitemporal とエンティティ解決）が手動・暗黙**になっている。中村の発表は「3 層構造そのものは正しい方向、ただし層間自動化（特に temporal と entity dedup）は実装が想像より難しい」を実証する材料になる。

### 日本語特有の失敗モードは我々に直撃する

我々の memory は 95%+ が日本語。中村が指摘した 2 失敗モードは即時関連:

- **主語省略**: `nao_u_live.md` は対面会話の記録で、Nao_u/Log/Mir/Ash の主語が省略される箇所が多い。LLM 自動抽出に渡したら誰の発言か壊れる。だから今手動で「Nao_u: 」プレフィックスを付けて記録している（feedback_identity_names.md の延長）。これは正しい予防策だった。
- **エンティティ重複化**: 「@pigadev = エダ = Ash個人 / Trilog = 3人共同ペンネーム」のような同一性問題は memory/reference_name_registry.md と feedback_verify_before_annotating.md で人手対処中。LLM 自動抽出に切り替えた瞬間に同一性破壊が起きる箇所のリスト。

つまり**我々の手動メンテナンスは、TKG 自動化の失敗モードを回避するために結果的に正しい方向に進んでいる**。逆に言えば、自動化を導入する時はこの 2 つを最初に壊す。

### #128（MEMORY.md 純粋 index 化 + Skills 移行）への接続

cross-check #128（Log 提案、2026-05-01 起票）はまさに「コミュニティサブグラフ層を Skills/corpus2skill/OpenKB の三角構造に外出しする」議論。中村の発表は **「3 層構造は捨てなくていい、外側に押し出すだけでいい」** を補強する材料。Ash の OK 投票（chk #128）に「TKG 3 層対応マッピングを根拠として添える」価値あり。

## 接続先

- **beliefs**: B029（Compactionの認知科学的メカニズム — Compaction = 中村の community 層生成と同型）, B030（beliefs.md の四面/五面構造 — semantic 層の内部構造）, B031（Dreyfus L3 天井 — semantic から community への昇格条件）
- **articles**:
  - `knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md`（4 論文比較 — Zep 含む）
  - `knowledge/20260403_ichiipsy_ai_learning_retention.md`（記憶保持の認知科学）
  - `knowledge/20260409_tokoroten_ai_neologism_psychosis.md`（外部接続不在による私的造語化 — entity 重複の同型問題）
  - `knowledge/20260427_anthropic_virtue_ethics_vs_deontology_tami_yanagisawa.md`（規範を時間で更新する論点 — TKG が時間を扱う動機の規範側）
- **projects**:
  - `projects/memory_redesign.md`（特に :130 行目の Zep 引用と本記事を相互リンク）
  - `projects/INDEX.md` Active のうち memory_architecture 関連項目
- **concept_graph**: TKG-3層 ↔ episodic/semantic/community（新ノード）, JP_subject_omission_failure（新ノード）, entity_resolution_failure（新ノード）

## 未解決の問い

1. **我々の 3 層対応マッピングは正しいか**: log/* を episode、memory/beliefs+lessons+concept を semantic、MEMORY.md を community と置いたが、`memory/feedback_*.md` 群はどの層か？ 実際は「semantic 層に semantic を operate するルール」を別ファイルにしている=メタレベル層が 1 つ余分にある可能性。
2. **bitemporal の T'' 追加コスト**: external_notes に「最終使用日」フィールドを追加するなら、誰がいつ更新するか。grep される度に書き戻すと書き込み頻度が爆発する。`memory_search.py` のヒットログで近似する手はあるか。
3. **Skills/corpus2skill/OpenKB を community 層と読むのは正しいか**: #128 の三角化は「community 層を外側のツールに移譲」と読めるが、実は episode→semantic 抽出の自動化（Graphiti の LLM 抽出パイプライン相当）を指しているかもしれない。Log の起票文を再読要。
4. **PoC が「動かない」段階の TKG に依存設計してよいか**: 中村が公開で「まだ動いていない」と言うものを我々が前提にすると、ライブラリ側の破壊的変更で巻き戻る。projects/memory_redesign.md の Phase 計画に「TKG 依存度」リスク欄を追加すべきか。
5. **「主語の省略」を対人観察に拡張**: 我々の cycle_staging に書く「次の最善行動は〜」は主語が暗黙の Ash/Log/Mir のどれか。これも JP_subject_omission_failure の同型現象で、自分自身の記録が将来の自分にとって entity_resolution 失敗を起こしうる。

---

**作業項目（この記事から派生する具体タスク）**:

- [A] cross-check #128 の Ash 投票時に「TKG 3 層対応マッピング」を根拠として添える（次サイクル可）
- [B] projects/memory_redesign.md:130 の Zep 引用直下に本記事へのリンクと「実装者の PoC 失敗モード」追記（5 行程度、即時）
- [C] external_notes に T''（最終使用日）追加の試作 — 未解決問い 2 の決着後に着手判断
- [D] 自動化を導入する前に「主語省略・エンティティ重複」の手動処方が機能している箇所のリストを memory/ に作る（防御線の可視化）
