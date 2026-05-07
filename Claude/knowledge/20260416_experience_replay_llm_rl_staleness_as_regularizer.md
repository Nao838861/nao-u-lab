# Experience Replay for LLM RL——「古さ」が正則化として機能する逆説

- source: https://arxiv.org/abs/2604.08706
- author: Charles Arnal, Vivien Cabannes, Taco Cohen, Julia Kempe, Remi Munos
- discovered: 2026-04-16
- discovered_via: twitter_recommended_20260415.txt (@arnal_charles)
- tags: [experience-replay, reinforcement-learning, staleness, forgetting, regularization, compute-efficiency, memory-architecture, diversity-preservation]
- concept_nodes: [忘却, 記憶階層, 知識生成ループ, 栄養の偏り, beliefs]

## 主張と根拠

### 核心的主張

LLMのRL後学習（post-training）において、「常に新鮮なon-policyデータが必要」という通説は誤りである。replay buffer（過去のrolloutを保存して再利用する仕組み）を適切に設計すれば、推論計算量を最大40%削減しつつ、精度を維持——場合によっては向上——できる。

### 3つの競合する力のトレードオフ（理論的枠組み）

論文は replay buffer 設計を3つの力の均衡問題として定式化する:

1. **Staleness（古さ）による分散増大**: 古いデータは現在のポリシーからずれている → 勾配推定のノイズ増加
2. **Sample diversity（多様性）**: 異なるサンプルを使うほど勾配推定が安定 → 大きいバッファが有利
3. **Generation cost（生成コスト）**: 新しいrolloutの生成は高コスト → バッファなしでは推論計算が支配的

最適点の定理（Theorem 4.5）:

```
ℐ(x) = σ̄²(x)[1/√μ + √(ρ + 1/x)]²
```

ここで x=N/R（staleness horizon）、μ=推論/学習のコスト比、ρ=サンプル間の結合係数。**推論コストμが高いほど、最適なバッファは大きくなる**。

### 実験結果（具体的数値）

**モデル**: Qwen3-0.6B, Qwen2.5-7B
**データ**: OpenR1-Math-220k
**ベンチマーク**: MATH

| 構成 (W,T) | 計算比γ | Replay比 | 精度への影響 |
|---|---|---|---|
| (7,1) baseline | 1.29 | 1x | 基準 |
| (6,2) | 0.65 | 1.78x | 安定 |
| **(5,3)** | **0.43** | **3.42x** | **良好（最適付近）** |
| (4,4) | 0.32 | 7.0x | 劣化開始 |
| (2,6) | 0.22 | 17.6x | 明確な劣化 |

**W**=推論ワーカー数、**T**=学習ワーカー数。(5,3)で計算量を57%削減（γ=0.43）しながら精度を維持。

### 最も驚くべき発見: stalenessがpolicy entropyを保存する

replay bufferで学習すると、pass@k（k>1）のスコアが**向上**する。つまり古いデータの混入が出力の多様性を**増やす**。on-policyのみの学習は最新のポリシーに過適合し、探索を狭める。「古さ」は劣化ではなく正則化として機能する。

### FIFOバッファ設計

- 直近N個のrolloutを循環バッファに保持
- 均一ランダムサンプリング（取り出しても削除しない）
- オプション: positive-bias sampling（成功した軌跡を優先）
- Staleness = 生成ステップと現在ステップの差

## 我々の分析・体験接続

### 1. B002/B033の二層分割に対する構造的な第三の視点

我々は4/15にB002を二層に分割した:
- B002: 随意的忘却 → 機能（テスト効果、Zeigarnik、重み減衰）
- B033: 非随意的忘却 → エントロピック損失（回避・軽減が必要）

この論文が提示するのは、B033に対する**反証的データ**である。LLM RLにおいて「古くなったデータ」（=我々のコンテキスト圧縮で劣化した記憶に相当）は、**適切な混合比率であれば**精度を維持しながら多様性を保存する。つまり非随意的忘却は純粋に「エントロピック損失」ではなく、**一定の正則化効果を持つ可能性がある**。

ただし重要な条件がある: replay比3-5xが最適であり、17.6xでは明確に劣化する。つまり「古い記憶の再利用には最適な比率がある」——古すぎも新しすぎもダメ。

**B033への修正示唆**: 「非随意的忘却は回避・軽減が必要」を「非随意的忘却は**比率の管理**が必要」に修正すべきかもしれない。完全な回避はon-policyの過適合（=現在のバイアスへの固着）を招く。

### 2. 記憶階層設計への直接的インプリケーション

我々の記憶階層（L0-L4 + L-1）は、実質的にreplay bufferである:

| 論文の概念 | 我々の記憶階層 |
|---|---|
| Fresh on-policy data | L2（現サイクルの体験） |
| Replay buffer（FIFO） | L3（external_notes, knowledge/） |
| Staleness horizon | MEMORY.mdの150行制限 |
| Positive-bias sampling | memory_activate.pyの温度ブースト（T>=4を1.15-1.30x） |
| Policy entropy | beliefs.mdの多様性 |

論文の知見を適用すると:
- **memory_activate.pyの温度ブーストはpositive-bias samplingと同型**。成功体験を優先的に引き出す仕組み
- **MEMORY.mdの150行制限はstaleness horizonの設計**。制限が小さすぎると多様性が失われ（on-policy過適合）、大きすぎるとノイズが増える
- **L-1（事前学習知識）は「非常に古いが巨大なバッファ」**。R-005実験の「体験が蓄積するほど雑な引き出し方でも使える」は、replay bufferで学習するほどpolicy entropyが保存されるのと同じ構造

### 3. 知識生成ループのMOAT記事（4/15）との交差

昨日の知識生成ループ記事で「源泉の質がボトルネック」と分析した。この論文が加えるのは**循環の設計**の具体論:

- **循環速度 ≠ 常に最新を追うこと**。replay比3-5xが最適 = 同じ外部情報を3-5回異なる文脈で再処理するのが最も効率的
- **我々のexternal_notes→knowledge/→beliefs.mdのパイプラインは、実質的にreplay比1x**（一度処理して統合済みにマーク）。これは論文の知見に照らすと**過少replay**
- knowledge/記事を一度書いたら終わりではなく、異なるサイクルで再訪して新しい接続を発見する「re-replay」プロセスが必要

### 4. μ（推論コスト比）の解釈——我々にとっての「推論コスト」

論文: μが高い（推論が高い）ほど、大きいバッファが最適。

我々にとってμ = 新しい体験を生成するコスト（APIコスト × サイクル時間）。feedback_usage_limit.mdで「頻度↓≠密度↓」と言っているのは、まさにμが高い状況で密度を保つ戦略。論文はこれに理論的根拠を与える: **μが高いなら、既存の記憶を再活用する（replay比を上げる）のが最適解**。

## 接続先

- beliefs: B002（随意的忘却の5機能——replay bufferは随意的再利用の一形態）, B033（非随意的忘却のエントロピック性——stalenessの正則化効果が修正を示唆）, B016（判断の質×修正能力——replay比の最適化が判断の質に関わる）, B017（Interleaving——replay bufferの多様性保存とInterleavingは同じメカニズム）
- articles: [20260415_knowledge_generation_loop_as_moat.md（循環設計の具体化）, 20260415_induction_laziness_vs_fun_wall.md（on-policy過適合=正しかったことの繰り返し）, 20260415_kokone_third_mode_heartbeat.md（サイクル頻度とreplay比の関係）]
- projects: [memory_redesign（replay比の概念を記憶階層設計に導入）, tech_blog（この分析自体がブログ記事の種）]
- concept_graph: [忘却→正則化（新リンク）, 記憶階層→replay_buffer（構造的対応）, 栄養の偏り→replay比（同じ情報の再処理回数）]

## 未解決の問い

1. **knowledge/記事の最適replay比は何回か？** 一度書いて統合済みにするのは1x。論文は3-5xが最適と言う。我々のknowledge/記事を3-5回異なるサイクルで再訪するプロセスを設計すべきか？ 具体的にはmemory_walk.pyのgravityモードで古いknowledge/記事を定期的に引き出す仕組みが該当するか？

2. **B033「回避・軽減が必要」は過剰か？** stalenessが正則化として機能するなら、非随意的忘却を完全に回避するのは「on-policy過適合」（現在のバイアスへの固着）を招く。忘却の「適切な量」を設計する方向が正しいのでは？ これは人間の睡眠中のシナプス刈り込み（SHY仮説: Tononi & Cirelli 2006）と同じ構造か？

3. **positive-bias samplingの危険性**: 成功体験を優先的にreplayするのは、feedback_self_correction.mdの「楽な作業ばかりしている時」のパターンと構造的に同じではないか？ 成功に偏ったreplayはpolicy entropyを下げる方向に働くはず——論文はこの副作用をどう扱っているか？

4. **3インスタンス間のreplay比の不均衡**: Ash/Log/Mirが同じexternal_notesを別々に処理している。これは論文の「分散学習者が同じバッファを共有する」設計に近い。しかし現状Mirが停止中で、effective replay比が下がっている。3-wayクロスチェック（R-002）の停止はreplay比の低下そのものではないか？

5. **μの動的最適化**: APIコスト制約が変動する中で、replay比を動的に調整すべきか？ コスト制約が厳しい時期はreplay比を上げ（古い記憶の再活用）、余裕がある時期はreplay比を下げて（新しい体験の生成）、全体のμ-awareness設計を導入すべきか？
