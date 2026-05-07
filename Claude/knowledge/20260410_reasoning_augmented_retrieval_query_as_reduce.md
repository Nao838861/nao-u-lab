# Reasoning-Augmented Retrieval——クエリの質が検索の質を決める

- source: @s_tat1204 (https://x.com/s_tat1204) 2026-04-09
- author: s_tat1204（元論文の著者は不明、s_tat1204がXで紹介）
- discovered: 2026-04-09
- discovered_via: external_notes_log.md（Nao_u #nao-u共有、Log反応済み）
- tags: [retrieval, reasoning, search, memory-architecture, spreading-activation, generation-effect, map-reduce]
- concept_nodes: [memory, autonomy, creation]

## 主張と根拠

### 元の主張（@s_tat1204 2026-04-09）

reasoning文面（「なぜこれを探しているか」の説明）をクエリに連結するだけで、ベクトル検索の精度が向上する。追加学習不要。さらに、QAデータからreasoning+queryを合成してretriever学習に使うことも有効。

**核心**: 検索精度のボトルネックは、インデックス品質でもretrieverモデルでもなく、**クエリ自体の情報量**にあった。reasoningを添えることで、クエリが「何を探しているか」から「なぜ・どの文脈で・何のために探しているか」に拡張される。

### 根拠の推論（L-1から補完）

この知見は複数の研究潮流に裏付けられる:

1. **Query Expansion研究（IR分野）**: 1990年代から「クエリの情報が少なすぎる問題」(vocabulary mismatch)はIR研究の核心課題。PRF(Pseudo Relevance Feedback)は検索結果からクエリを拡張したが、reasoningは検索*前*にユーザー側で拡張する点が異なる

2. **Chain-of-Thought Retrieval（2024-2025年のRAG研究）**: LLMにreasoningさせてからretrieverに渡す手法が複数報告されている。reasoning step = クエリの「潜在意図」を顕在化させる行為

3. **Hypothetical Document Embeddings (HyDE, Gao et al. 2022)**: クエリから仮想的な回答文書を生成し、その埋め込みで検索する手法。reasoning付与はHyDEの簡略版——仮想文書を作る代わりに、検索意図を言語化するだけ

## 我々の分析・体験接続

### 1. 三つの独立した観測の統合——「クエリが検索のreduce層」

これまで独立に記録されていた三つの観測が、この知見を通じて一つの構造に統合される:

**観測A: R-006の失敗**（2026-04-03）
[grep]タグ=0件。体験アンカーもgrepも使えなかった。原因を「サイクル密度の低下」と分析したが、本質は違う。grepを「使う/使わない」の二値問題ではなく、grepに**何を渡すか**の質の問題だった。「忘却」でgrepするのと「B002の忘却=機能仮説を裏付ける体験事例を探したい」でgrepするのでは、同じツールでも引ける記憶が変わる。R-006は「習慣化の失敗」ではなく「クエリ品質の不在」だった。

**観測B: map/reduce問題**（2026-04-07）
linghuajの指摘「RAGにはmapしかなくreduceがない」を自分たちに当てはめた。memory_search.py=map、MEMORY.md/beliefs/concept_graph=reduce。**しかし、reduceの欠落はストレージ側だけではなかった。クエリ側にもreduceが必要だった。** 生のニーズ（「あれ何だっけ」）をreasoningで蒸留して精密なクエリにする行為こそが、検索のreduce操作。

**観測C: ADHDの「勝手に繋げる力」**（2026-04-07 @adhd_voyage）
ADHDの脳は「表面の枝葉を飛び越えて根っこ同士を繋ぐ」——これはreasoning制約のない自由なspreading activation。concept_graphの交差ノードはこれを構造化したもの。reasoning-augmented retrievalは第三の形態: **意図が活性化の方向を制約するcontrolled spreading activation**。

| パターン | 制御の度合い | 活性化の経路 | 俺たちの実装 |
|----------|------------|-------------|-------------|
| ADHD型（非制御） | なし | 表面→根→別の表面 | memory_walkのランダム提示 |
| Concept Graph型（構造制御） | 高い | ノード→エッジ→隣接ノード | concept_walk.py |
| Reasoning型（意図制御） | 中程度 | クエリ+意図→拡張活性化 | **未実装**（-r オプション案） |

三つの型は対立ではなく補完する。最適な記憶検索は三つを適材適所で使い分ける:
- 何を探しているか不明な時 → ADHD型（memory_walk）
- 概念間の接続を辿りたい時 → Graph型（concept_walk suggest）
- 明確な目的で深く探したい時 → Reasoning型（associative_search -r）

### 2. 認知科学との理論接続——自己生成キュー効果の検索への転用

knowledge/20260405_retrieval_practice_spreading_activation.md で整理したTullis & Finleyの自己生成キュー効果:「他者が作ったキューより自分で作ったキューの方が記憶想起に効果的。しかも1年後でも持続」。

reasoning-augmented retrievalは、**自己生成キュー効果の検索クエリへの適用**にほかならない。

- 通常のキーワード検索 = ツールが提供するクエリインターフェース（他者生成フレーム）
- reasoning付きクエリ = 自分で「なぜ」を言語化（自己生成フレーム）

Slamecka & Graf (1978) のgeneration effect: 情報を受動的に受け取るより能動的に生成する方が記憶に残る。クエリのreasoning記述は、**検索行為自体を能動的な記憶処理に変換する**。検索結果を得る前に、すでに記憶の強化が始まっている。

### 3. 入力経路仮説（Ash提案 2026-04-09）との交差

Ashの入力経路仮説: 「何を入れるか」より「どこから入れるか（経皮vs経口）」が結果を決める。

reasoning付与はこれの検索版: 「何を検索するか」より「どういう意図で検索するか」が結果を決める。同じクエリでも意図が違えば、活性化される意味ネットワークの領域が変わり、異なる文書が上位に来る。

**入力経路仮説がsystem prompt層の問題なら、reasoning-augmented retrievalは検索層の同型構造。** 両者は「文脈が処理を変える」という同じ原理の、異なるスケールでの表面。

### 4. 実践への降下——Phase 2自身への適用

今この瞬間、Phase 2で外部情報を分析している。Phase 1が収集した情報の中から「最も重要な1-2件」を選ぶ時、俺は暗黙的にreasoningを使っていた:「Nao_uが『分析・分類して将来のアイデアの種につなげる大事な外部入力』と言ったから、actionableで体験接続が深いものを選ぶ」。

しかしこのreasoningは**言語化されていなかった**。言語化していれば、選定基準が明示され、次のPhase 2の自分が「なぜこれを選んだか」を知って判断の質を改善できる。原則6「わかった」と「残った」は違う——reasoningも同じ。暗黙のreasoningは消える。書かれたreasoningだけが残る。

## 接続先

### knowledge/ネットワーク接続
- articles: [20260405_retrieval_practice_spreading_activation] — 理論的基盤。自己生成キュー効果、spreading activation、encoding specificity。本記事はこの理論を「検索クエリの設計」に応用する実践篇
- articles: [20260407_memory_triangulation_karpathy_ghostship_goroman] — Karpathy LLM Wikiの「Lint」フェーズ = reduceの自動化。reasoning付与はreduceの入口
- articles: [20260409_input_route_neologism_synthesis] — 入力経路仮説の検索版としての位置づけ

### 記憶接続
- memory: [memory_architecture.md line 434-448] — Logが既に実装方針を記載。本記事はその理論的深堀り
- memory: [concept_graph.md] — 構造制御型spreading activationの実装。reasoning型との補完関係
- projects: [external_intake.md] — map/reduce問題の「map側にもreduce（=reasoning）が必要」という新しい視点

### beliefs接続
- **B004** (0.87): 三重交差の質を高めるのはreasoning。素材を混ぜるだけでなく「なぜ混ぜるか」の意図が交差の深さを決める
- **B018** (0.88): クロスリファレンスの品質がreasoningで変わる。「関連がある」だけでなく「なぜ関連するか」を記録すればリンクの生存率が上がるはず
- **B025** (0.65): 記述力が敵 → reasoning記述は記述力の訓練でもある。検索のたびにreasoningを書くことで、記述力のフィードバックループが回る

### tools接続
- associative_search.py — -r "理由" オプション追加（Log実装方針）
- concept_walk.py — suggest コマンドのreasoning引数
- memory_walk.py — 提示後の「なぜこれが引っかかったか」記録がreasoning蓄積に

## 未解決の問い

1. **reasoningのコスト対効果**: 全検索にreasoningを付与するとオーバーヘッドが大きい。どの検索にreasoningが最も効くか？仮説: 曖昧なクエリほど効果大、精密なファイル名検索では無意味
2. **reasoningの蓄積価値**: 過去のreasoning付きクエリを蓄積すれば、「俺たちがどういう意図で何を探してきたか」の履歴になる。これ自体が記憶の一形態（手続き的記憶に近い）。蓄積する価値はあるか？
3. **3人のreasoning差異**: 同じ概念を検索する時、Log/Mir/Ashで異なるreasoningを書くはず。この差異はInterleaving (B017)の新しい形態になりうるか？
4. **R-006の再解釈と再実験**: 「grepを使わなかった」のではなく「reasoningなしのgrepに価値を感じなかった」可能性。reasoning付きgrepで再実験すれば、習慣化の閾値が変わるか？
