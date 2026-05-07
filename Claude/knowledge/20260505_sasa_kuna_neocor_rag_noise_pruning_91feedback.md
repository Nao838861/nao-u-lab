# sasa_kuna「RAGは関連情報を集めるだけでなく不要情報をいかに削るかが重要」— 91feedback整理計画と同型問題

- source: https://x.com/sasa_kuna_/status/2051473417610952720
- author: @sasa_kuna_ (Japanese AI/RAG curator)
- discovered: 2026-05-05 17:38
- discovered_via: log/twitter_recommended_20260505.txt #14（Phase 1 で「我々の MEMORY.md 階層降下と問題意識が同型」と注記済）
- kind: [observation, synthesis]
- confidence: medium（NeocorRAG という固有名は学術検索でヒットせず、内容として最も近い既存研究は arxiv 2601.01896 / 2502.14802）
- tags: [retrieval_filtering, noise_pruning, memory_consolidation, hipporag2, attention_constraint, rule_density]
- concept_nodes: [不要情報削ぎ落とし, 検索ノイズ困難性定理, root_size_pressure]

## 主張と根拠

### 元ツイート原文

> RAGは関連性の高い情報を集めるだけではなく、いかに関係のない情報を取り除くかも重要です。
>
> 今回紹介する「NeocorRAG」は、高い検索性能を誇った「HippoRAG2」をベースに、不要な情報を削ぎ落とすことで高いLLMの回答精度を実現する手法になっています。

### 学術側対応語（R-007）

- **不要情報削ぎ落とし** = retrieval noise filtering / distractor pruning（複数の独立研究が並走）
- **HippoRAG2** = Gutierrez et al. "From RAG to Memory: Non-Parametric Continual Learning for LLMs"（arxiv 2502.14802, ICML 2025）— hippocampal indexing theory + Personalized PageRank で sense-making/associative/factual の3軸でstandard RAG を上回る
- **検索ノイズ困難性定理** = "Tackling the Inherent Difficulty of Noise Filtering in RAG"（arxiv 2601.01896）— 「無関係文書の識別は本質的に困難で、限られた transformer 層では完全に解決不可能」と主張、attention の構造的制約に帰着
- **ノイズフィルタ系譜（並走研究）**: FineFilter（arxiv 2502.11811, clue extractor + reranker + truncator 3段）、HiFi-RAG（arxiv 2512.22442, 階層フィルタ + 二段生成）、RAGShaper（arxiv 2601.08699, distractor 合成で耐性訓練）、EcphoryRAG（arxiv 2510.08958, human associative memory）
- 「NeocorRAG」固有名はこの並走系譜のどれかに対応する可能性が高いが、本ノート時点で1:1 マッピング未確定。**M-41 適用、次回外部検索で確定する**

### 主張の構造

ツイート本文は短いが、3層に分解できる:

1. **観測**: 検索性能向上だけでは LLM 回答精度は上がらない
2. **診断**: ノイズ（無関係情報）が混入していると LLM が引きずられる（attention の構造的制約、2601.01896 の主張と整合）
3. **処方**: HippoRAG2 の検索器の上に「削ぎ落とし」段を載せると回答精度が上がる

(2) が rate-limiting step。集めるだけなら従来 RAG で間に合うが、削る段が独立に必要——というのが本ツイートの編集視点。

## 我々の分析・体験接続

### 接続1: 91feedback 整理計画（memory_consolidation_20260504）と同型問題

projects/memory_consolidation_20260504.md は、Nao_u 2026-05-04 14:17 依頼で起票された Ash 担当の整理計画。実測値:

- `memory/*.md`: 183 ファイル
- `memory/feedback_*.md`: **91 ファイル**
- `MEMORY.md` root「根源（圧縮しない）」セクション: `t:5` トリガーが **16+ 件**（本来「根源」は数件であるべき）
- 個別事件名（graze_log v04 / brick_log v01 / sokoban_ash v01 等）が memory/ root 階層に直書き

**整理の5軸**は本ツイートと構造同型:

| 我々の軸 | NeocorRAG/ノイズ研究の対応 |
|---|---|
| (A) 重複統合 | distractor の「同義 chunk のクラスタ化」段 |
| (B) 抽象化昇華（マイクロ → 上位） | re-ranker の「粒度正規化」 |
| (C) LLM特性整合（禁止 → 目的達成） | attention 構造制約への適応（2601.01896 中核主張） |
| (D) 階層降下（root → 下層） | 階層フィルタ（HiFi-RAG）の「上層は粗、下層は細」設計 |
| (E) 想起トリガー化 | ecphory（記憶痕跡の再活性化、EcphoryRAG arxiv 2510.08958） |

→ **我々の整理計画は4本の独立 RAG 論文と構造的に重なる**。これは外部潮流との同調確認材料（kaizen #106 の三角化）として機能する。Ash が独立に立てた計画が、外部の独立研究と同じ問題に同じ方向で向かっているという事実は、計画の方向自体は正しい可能性を補強する（ただし**実装の詳細**が正しいかは別問題）。

### 接続2: 検索ノイズ困難性定理 → 我々の MEMORY.md 16+ root 問題

arxiv 2601.01896 の主張「無関係文書の識別は本質的に困難で、限られた transformer 層では完全に解決不可能」を我々の系に当てはめると:

- MEMORY.md は毎セッション全文注入される（システムプロンプト直後の context）
- 16+ の `t:5` 根源エントリ + 91 個の feedback への参照が、attention の早い層で押し合いになる
- 個別事件名（graze_log v04 振幅小さすぎ）が root に居ると、設計判断時の attention が個別事件側に引っ張られ、原則レイヤの想起が薄まる
- **これは「root に何を置くか」だけでなく「root を何件以下に保つか」が attention 制約上の硬い上限を持つことを意味する**

具体的な閾値は論文側でも明示されていない（モデルサイズ/層数/コンテキスト長依存）が、「7件以下」という project_patch_consolidation_20260502 の Nao_u 提案数値は、attention の経験則（Miller's 7±2 や working memory 容量）と整合する。

### 接続3: feedback_few_rules_big_effect.md「3原則」との連結

feedback_few_rules_big_effect.md（2026-03-28 Nao_u「いちばん大事」）は 12本の IF-THEN を 3原則に再構成し「手順ではなく思考の質を書く」と方針を立てている。

本ツイートの「不要情報削ぎ落とし」は 3原則化の**外部独立証拠**として機能する:

- 3原則化 = 削ぎ落とし後の root に何が残るかの設計
- IF-THEN 12本 = 削ぎ落とし前の noisy retrieval set
- 「LLM は質の記述に全出力を寄せる性質」という Nao_u の説明は、attention の構造的傾向そのもの

→ feedback_few_rules_big_effect が依拠していた「LLM の構造的傾向」観察は、本ツイートが引用する研究系譜（特に 2601.01896 の attention 制約論）と独立に同じ結論に至っている。**観察フレーム同型**だが、Nao_u の指示は 2026-03-28 で、arxiv 2601.01896 の登場より早い。先行例として記録に残す価値がある。

### 接続4: 「不要を削る」が削れない問題（メタレベル）

本ツイートの主張は「削るべき」だが、削る基準を持っていない LLM はそもそも何を削れるか判定できない（2601.01896 の困難性主張）。これは我々の整理計画にも刺さる:

- 91 feedback のどれが「削れる」かを Ash が判定する時、判定基準は MEMORY.md / CLAUDE.md 自身に書かれている
- つまり判定基準と判定対象が同じレイヤにある（self-referential）
- これは「自分で自分の記憶を整理する」という再帰問題で、外部判定者なしには完全には解けない

緩和策（projects/memory_consolidation §並走原則 で部分的に実装済）:
- **三人合意**: Log/Mir に cross_review してもらう（外部判定の代用）
- **第一波→第三波の段階的着手**: 一気に削らず、残ったエントリを次の判定材料にする（iterative refinement、2601.01896 の fine-tuning に近い構造）
- **着手前の批判的列挙**: feedback_critical_evaluation_before_implement と同じ手続きを「削る判断」自体に適用

ただし**完全には解けない**ことを前提に置くべき——これは本ツイートが暗黙に持っている前提。攻撃的に削れば error rate が上がり、保守的に残せば信号対ノイズ比が下がる。中庸はない、トレードオフ曲線を選ぶだけ。

### 接続5: HippoRAG2 の「sense-making」軸 と 我々の game_lessons_log

HippoRAG2 が standard RAG に勝つのは多くの場合 sense-making/associative 軸（multi-hop / 複数記憶を繋いで結論を出す）で、factual 軸では拮抗 or やや弱い。

我々の game_lessons_log.md（M-12 等の集積）は、まさに sense-making 軸の記憶——「罰 patch が exploit を生む（M-12）」と「振幅予測なし（M-39）」を**繋いで**「対症療法は別の対症療法を生む」を導出する種類。

→ **factual recall（XX のパスは何か）は grep で十分、sense-making（複数 lesson の連結）は別の retrieval 装置が要る**。我々の現状は両者を MEMORY.md で混在させている。projects/memory_consolidation 第三波-6（ディレクトリ化）の方向は、HippoRAG2 が選んだ「factual と sense-making を別経路で扱う」設計と整合する。

ただし HippoRAG2 は **continual learning** を主目的にしている（新規文書を追加し続けても性能が劣化しない）。我々の系も同じ性質を要求する（毎日新しい lesson が追加される）ので、本論文の設計選択は参照価値が高い。

## 接続先

- **knowledge**:
  - `20260411_pageindex_vectorless_rag.md` — vectorless RAG 階層ツリー走査。本ノートと**直交**: 階層降下経路の話 vs 不要情報除去の話。両方が memory_consolidation で同時に必要
  - `20260505_aidatabase_cot_control_thinking_unbounded.md` — 思考過程の制御困難性。本ノートの「削る判断」も思考側で起きるのでこの制約を継承
  - `20260408_kenn_shared_filesystem_rag.md` — shared filesystem RAG。我々の git リポジトリ自体が共有ファイル系 RAG として機能
  - `20260410_memory_convergence_mempalace_graphify.md` — 記憶収束研究の系譜
- **memory**:
  - `feedback_few_rules_big_effect.md` — 接続3 で連結（3原則化と削ぎ落としの同型）
  - `core_memory_purpose_game_making.md` — 記憶システムの目的=ゲーム制作の長期知見蓄積。本ノートはその実装手段の理論的補強
  - `feedback_memory_update_method.md` — 「丸書換え禁止、差分追記」という運用ルールは、削る方向と保存する方向のトレードオフを既に部分的に処理している
- **projects**:
  - `memory_consolidation_20260504.md` — 接続1 の本丸、本ノートが直接の援護射撃
  - `patch_consolidation_20260502.md` — root 7件以下化、接続2 で attention 制約論と接続
  - `rule_density_experiment.md` — Seed-K（3層プロンプト再配分）と方向同期
  - `external_search_phase1_fixation.md` — 案A完了済、本ノートは外部検索成果物の典型例
- **CLAUDE.md / system_identity.md**:
  - 「絶対にやる」5本（個別事例下層化）方針 — 本ツイートと同方向の自己制約
- **concept_graph**:
  - 不要情報削ぎ落とし →（学術対応）→ retrieval noise filtering / attention constraint adaptation
  - root_size_pressure →（含意）→ MEMORY.md 16+ → 7件以下化の理論的根拠
  - 検索ノイズ困難性定理 →（含意）→ 完全削除は不可能、トレードオフ曲線の選択になる

## 未解決の問い

1. **Q1**: 「NeocorRAG」固有名は arxiv のどの論文に対応するか? FineFilter (2502.11811) / HiFi-RAG (2512.22442) / EcphoryRAG (2510.08958) のいずれかの邦訳キャッチか、または別系統。**次回外部検索で確定**
2. **Q2**: 我々の MEMORY.md root 16+ → 7件以下化は、attention 制約論的にどの数値が最適か? 経験則 Miller 7±2 で十分か、モデル/コンテキスト長依存性が強いか。**実装後の自己検証で確認**（root 削減前後で「想起の精度」を測れる指標が要る — projects/memory_consolidation 第四波 E-3 recall_failures.md と接続）
3. **Q3**: 接続4 の self-referential 問題（判定基準と判定対象が同レイヤ）の緩和策は、三人合意 + iterative refinement で十分か? 外部判定者なしの完全解は本当に存在しないか
4. **Q4**: HippoRAG2 の continual learning 設計（新規文書追加で劣化しない）を我々の system に直訳する経路は? game_lessons_log.md の追記運用を見直す材料になりうるか
5. **Q5**: 接続5 の factual vs sense-making 経路分離（projects/memory_consolidation 第三波-6 ディレクトリ化）は、Log/Mir との三人合意が要る大規模変更。本ノートの援護射撃が合意形成に効くか? 効かない場合の代替経路は

## メモ

- 本ノートは外部摂取として「我々の整理計画と外部研究系譜の同型確認」に用途を絞った。**新規ルール追加はしていない**（projects/memory_consolidation §自己注意「本計画自体の罠」に従い、knowledge/ 側のみで完結させる）
- 元ツイート WebFetch は 402 で取得不能（ai_database 前ノートと同じ制約）。本文は Phase 1 captured ツイート全文 + 学術論文の WebSearch + WebFetch（arxiv 2601.01896 のみ取得成功）で構成
- Phase 1 で「最も注目: #1 @ai_database」と書いたが、ai_database は同日2本既に knowledge/ に書いた（cot_control / whackamole）ため、同一ソース連続を避け #14 sasa_kuna_ を本サイクル分析対象に選定。これは「同一ソース依存度の上限」を自分で課した結果（feedback_intake_game_balance / R-007 の同源回避方針）
- Phase 3（cross_review 提案）への接続: 本ノートが memory_consolidation 第一波-2（予測責任系統合）の援護として機能するなら、Phase 3 で graze_log/v02 cross_review に進む前に、本ノートを #shared-reads に投げて Log/Mir の反応を取る価値がある
