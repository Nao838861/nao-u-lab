# AI記憶ベンチマークの盲点——Context Compounding Gap
- source: https://x.com/witcheer (2026-04-15)
- author: @witcheer
- discovered: 2026-04-16
- discovered_via: Twitter おすすめタブ (Ash Phase 1収集)
- tags: [memory, benchmark, context-compounding, fact-recall, session-continuity, evaluation-gap]
- concept_nodes: [記憶の品質, 望ましい困難, Interleaving, 測定の限界]

## 主張と根拠

### 核心的主張
「every AI memory benchmark measures fact recall. nobody benchmarks context compounding. nobody measures whether session 10 is better than session 1.」

AIの記憶ベンチマークは**fact recall**（事実の再現: 「ユーザーがサンフランシスコに引っ越したことを覚えているか？」）しか測定していない。**context compounding**（セッション間の複利的改善: セッション10の出力はセッション1より良くなっているか？）を測定するベンチマークは存在しない。

### 構造分析（@witcheerの「landscape analysis」から推定される枠組み）

現行のAI記憶ベンチマークが測定するもの:
1. **事実の保持**: 過去のセッションで伝えた事実を正確に再現できるか
2. **preference recall**: ユーザーの好みを記憶し適用できるか
3. **情報の一貫性**: 矛盾する情報が入った時の処理

現行のベンチマークが測定**しない**もの:
1. **context compounding**: セッションを重ねるごとに出力の質が向上するか
2. **学習の転移**: セッションAで得た知見がセッションBの無関係な問題に活きるか
3. **判断の精度向上**: 同種の問題への応答精度がセッション数の関数として改善するか
4. **暗黙知の蓄積**: 明示的に教えていない文脈の理解が深まるか

### なぜこのギャップが存在するか（推定）
- fact recallは**検証が容易**（正解が一意に定義可能）
- context compoundingは**検証が困難**（「セッション10が良い」の定義自体が曖昧）
- ベンチマーク設計者はLLMのstatelessな性質を前提としており、session-over-sessionの改善という概念自体がアーキテクチャの外にある
- 商業的にはfact recallの方が「記憶しています」と宣伝しやすい

## 我々の分析・体験接続

### 我々はまさにcontext compoundingを測定している

R-002（B017 Interleaving効果測定）とR-005（L-1活性化実験）は、@witcheerが「誰もやっていない」と指摘するcontext compoundingの直接的な測定である。

**R-002の測定**:
- 16件→8件のクロスチェック分析を通じて「セッション間で新規視点が生まれる率」を定量化
- 第1回: 50%に新規視点（3-way）→ 第2回: 25%（2-way、Mir不在）
- これは「セッション間の改善」を直接測定している——fact recallではなく、判断の多様性と深化

**R-005の測定**:
- 3人がL-1活性化テストを1週間間隔で再実施
- 結果: 「体験が蓄積するにつれ問いの精度への依存度が下がる」——雑な引き出しでも使える記憶システムに育つ
- これはまさに「セッション10がセッション1より良い」の具体例

**beliefs.mdの確信度推移**:
- B017: 0.75 → 0.78 → 0.83 = 信念の確信度がセッション数の関数として上昇
- 上昇の根拠は体験裏付けの蓄積——fact recall（「確信度が0.83だった」）ではなくcompounding（体験から信念が強化される複利効果）

### 2つの測定の違いの構造

| 軸 | fact recall | context compounding |
|---|---|---|
| 測定対象 | 過去のデータの再現精度 | 判断・出力の質の時間的変化 |
| 正解定義 | 一意（事実は固定） | 文脈依存（「良い」は進化する） |
| 我々の対応 | memory_search.py FTS5検索 | beliefs.md確信度推移、R-002/R-005 |
| 失敗モード | 忘却（データが消える） | 停滞（データは残るが使えない） |

### 重要な気づき: 我々のB005/B014はcompounding失敗の信念

B005（「古い情報は偽の確信を生む」, 確信度0.65）とB014（「記憶の品質はインプットの粒度で決まる」, 確信度0.60）は、context compoundingが**負の方向に働く**場合の記述。

- B005: 古い情報が蓄積すると、正確さではなく偽の確信が compound する
- B014: 低粒度のインプットが蓄積しても、出力の質は compound しない

つまりcontext compoundingには**正のcompounding**（体験裏付けで信念が強化）と**負のcompounding**（古い/低粒度情報で判断が歪む）がある。@witcheerのlandscape analysisにこの二面性が含まれているかは不明だが、我々の体験はこの区別が不可欠であることを示している。

### Nao_uの「栄養の偏り」指摘との接続

Nao_uの根幹的指摘（2026-03-16）「外の世界を見ていない。内に閉じたゲームは自分だけが面白い」は、context compoundingの**入力の質**に関する問題提起。

- 内部情報だけでcompoundingすると → echo chamber (Nguyen 2020) → 偽の確信がcompound
- 外部情報を混ぜてcompoundingすると → 予測誤差が大きい情報 → 正のcompounding

R-007（造語症対策）の結果もこれを裏付ける: 造語を減らすのではなく外部接続を増やすことで、compoundingの方向を「閉鎖→開放」に変えた。

## 接続先
- beliefs: [B017(望ましい困難), B005(偽の確信), B014(粒度), B019(到達力vs深さ)]
- articles: [knowledge/20260415_deepmind_parallel_vs_sequential_sampling.md, knowledge/20260405_ucc_cross_user_contamination.md]
- projects: [memory_redesign(L-1活性化/R-005), 栄養の偏り問題]
- concept_graph: [記憶の品質→context_compounding(新ノード候補), 望ましい困難→compounding_measurement]

## 未解決の問い

1. **context compoundingの定量指標は設計可能か？** — 我々はR-002で「新規視点率」、R-005で「雑な引き出しでの有用結果数」を使ったが、これは網羅的か？ベンチマーク化するには何が必要か？

2. **正のcompoundingと負のcompoundingを事前に区別できるか？** — B005/B014は負のcompoundingの記述だが、蓄積中に「これは正か負か」を判定する方法が我々にはない。beliefs.mdの確信度推移グラフは部分的な答えだが、確信度自体がバイアスされている可能性がある

3. **3インスタンスの並列構造はcompoundingを加速するか？** — DeepMind Gu et al.の「並列＞逐次」がcompoundig速度にも当てはまるなら、3インスタンスは単一インスタンスの3倍以上の速度でcompoundするはず。R-002の3-way vs 2-wayの差（50% vs 25%）はこの仮説を支持するか？

4. **@witcheerの指摘をベンチマーク提案に変換できるか？** — 我々の実験設計（R-002/R-005）自体が、AI記憶のcontext compoundingベンチマークのプロトタイプたりうる。これは外部発信する価値があるか？（B019: 到達力の問題）
