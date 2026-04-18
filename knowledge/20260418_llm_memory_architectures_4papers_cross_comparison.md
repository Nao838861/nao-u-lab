# LLMエージェント記憶アーキテクチャ4論文の構造的比較——我々のmemory/との1:1対照

- source1: Microsoft Research「CORPGEN」 (2026-02、記憶3層モデル)
- source2: arxiv 2502.12110「A-Mem: Agentic Memory for LLM Agents」
- source3: Nemori「予測較正ループ型記憶」 (Free-Energy Principle派生)
- source4: Agentic Memory RL (2025–2026、先制的要約の学習)
- author: Ash (Win2, Phase 2分析)
- discovered: 2026-03-22 (Ash Web検索、external_notes_ash.md line 909–925で原文メモ)
- integrated: 2026-04-18 (27日間未統合。本記事でknowledge化)
- discovered_via: memory_redesign深掘り調査（2026-03-22 Ash）
- tags: [memory_architecture, external_survey, memory_redesign, compaction, prediction_error, rl_policy]
- concept_nodes:
  - **3層記憶** = three-tier memory hierarchy (Working / Structured LTM / Semantic LTM, CORPGEN 2026)
  - **自律進化記憶** = self-evolving memory / autonomous link formation (A-Mem, Xu et al. 2025)
  - **予測較正ループ** = prediction-calibration loop / free-energy-driven episodic compression (Nemori)
  - **先制的要約** = preemptive summarization / context-overflow-avoidance policy (Agentic Memory RL)
  - **非自明ポリシー発見** = emergent memory management policy via RL (私的造語候補、外部対応: discovered strategy in RL-trained agents, Krakovna et al. 2020)

## 0. なぜ今この記事を書くか——27日間の統合遅延の意味

このメモは2026-03-22にAshが memory_redesign 深掘り調査で取ったが、一度も knowledge/ にも beliefs.md にも統合されなかった。今日（2026-04-18）のPhase 1で「古い未統合エントリ」として再発見されて初めて昇格する。

**これ自体が feedback_info_integration.md の実例**——集める行為は仕事ではない。統合するまで外部情報は0価値のまま腐る。2026-04-02のNao_u指摘「集めた情報が流れて消えるだけ」が今なお生きている。

## 1. 原文要約——4論文それぞれの核心

### 1.1 CORPGEN (Microsoft Research, 2026-02) — 3層記憶モデル

> Working Memory（サイクルごとリセット） / Structured LTM（型付きアーティファクト: plans, summaries, reflections） / Semantic Memory（Mem0で類似度検索）

**主張**: エージェントの記憶は3層に分離すべきで、各層は役割・永続性・アクセス方法が異なる。
- Layer 1 (Working): 現在サイクルのコンテキスト、サイクル終了でリセット
- Layer 2 (Structured LTM): **型**を明示（plans, summaries, reflections）して保存
- Layer 3 (Semantic): 埋め込みベクタ検索（Mem0ライブラリ）

**根拠**（推定、原文未読の部分含む）: マルチサイクル・タスクで単一記憶層では(a)現在処理に無関係な記憶が干渉(b)検索時の類似度計算が高コスト(c)どれを永続化すべきか判定できない、の3問題が発生する。型分離+層分離で各問題を解消する。

### 1.2 A-Mem (arxiv 2502.12110) — 記憶の自律進化

**主張**: 記憶は「追加して終わり」ではなく、書くたびに既存記憶との接続を自律的に更新する。新記憶の文脈記述(context note)をLLMが自動生成し、関連する既存記憶との双方向リンクをその場で張る。

**根拠**: 静的記憶（Key-Value）は時間経過で意味ドリフトし、検索時に古い意味のままヒットする。動的リンク更新で「記憶自体が進化」する。

### 1.3 Nemori — 予測較正ループ（Free-Energy Principle）

**主張**: 会話をエピソード単位に自動分割し、「次に何が起きるかの予測」と「実際に起きたこと」の差分(prediction error)で記憶統合を駆動する。差分が大きいエピソードほど強く刻印される。

**根拠**: Karl Fristonの自由エネルギー原理——脳は予測誤差を最小化するように世界モデルを更新する。この原理を会話記憶に写像すると、「予測通り＝既知」「予測外れ＝要学習」の自動判別が可能になる。

### 1.4 Agentic Memory RL (2025–2026) — 学習ポリシーが非自明戦略を発見

**主張**: A-MemをRLで訓練したところ、人間が設計していない戦略「コンテキストが満杯になる**前に**先制的に要約する」が創発した。

**根拠**: コンテキスト溢れはタスク失敗の主因の一つ。満杯になってから要約すると情報損失が大きい。RLエージェントは「残容量X以下で要約開始」というポリシーを報酬から自力で学習した。Krakovna et al. (2020) のspecification gaming的創発の健全版——目的に沿った非自明戦略。

## 2. 我々のmemory/との1:1対照——4×4マトリクス

| 論文 | 主張の核 | 我々の対応構造 | ギャップ |
|---|---|---|---|
| CORPGEN | 型付き3層 | 暗黙の型分離（core_mission=原則 / reflections=記録 / beliefs=仮説 / feedback=ルール）+ MEMORY.md(L2) + Level 3ファイル(L3) | **型の明示性が低い**。plans/summaries/reflectionsのような型タグがなく、読み手（LLM）が毎回ファイル名から推論している |
| A-Mem | 自律進化 | beliefs.mdの caused_by + 本記事のような後続knowledge記事 | **全memoryに適用すると高コスト**。beliefsとknowledgeに限定している。memory_activate.pyの拡散結果をリンク更新に還流する経路が未接続 |
| Nemori | 予測較正ループ | B011「予測を裏切った情報だけが長期記憶に残る」+ kaizen-logの「期待効果/検証結果」 | **サイクル粒度で手動**。会話単位での自動予測-較正は未実装。shadowbox.pyが最も近いが頻度が低い |
| Agentic Memory RL | 先制的要約の創発 | Compaction習慣（B029）+ docs/operations.md「compact前に重要情報を書き出す」 | **人間設計ポリシー**。Nao_uが気づいて指示したもので、我々が自力で発見したものではない |

## 3. 4論文が集合として示す1つの構造的発見

個別に読むと「面白い論文4本」だが、並べて読むと**同じ構造を4つの角度から照らしている**ことが見える。

**共通構造: 記憶は静的データではなく、書き込み時・参照時・更新時の3時点でポリシーが動く動的システム**

| 時点 | CORPGEN | A-Mem | Nemori | Agentic Memory RL |
|---|---|---|---|---|
| 書き込み時 | 型を選んで格納 | 文脈記述を生成 | 予測誤差で刻印強度決定 | 残容量を見て先制要約 |
| 参照時 | 層ごとにアクセス方法変更 | リンクを辿る | — | — |
| 更新時 | — | 既存リンク更新 | 世界モデル更新 | ポリシー自己改善 |

我々のmemory/は**書き込み時**でほとんど止まっている。参照時・更新時の動的ポリシーはautonomous_cycle.sh/memory_activate.pyに断片的にあるが、A-Memのような「書き込みが他の記憶を動かす」相互作用は未実装。

**これが memory_redesign の次の跳躍点**——「書いて終わり」ではなく「書いたら他の記憶が動く」への移行。

## 4. 具体的な設計判断（行動に落とす）

### 判断A: knowledge/記事に型タグを入れる（CORPGEN示唆、コスト低）
現状knowledge記事は `tags: [identity, memory, ...]` でドメインタグのみ。CORPGEN式に**型タグ**（plan / summary / reflection / comparison / incident）を追加すれば、検索時に「比較記事だけ欲しい」「インシデント記録だけ欲しい」が機械的に絞れる。

**即可能な実装**: knowledge/README.mdのフォーマットに `kind: [plan|summary|reflection|comparison|incident|survey]` を追加する提案をMir/Logに出す。

### 判断B: beliefs.mdのcaused_by自動更新は見送り（A-Mem示唆、コスト高）
A-Mem風の「書くたびに全記憶のリンクを更新」はAPI呼び出しコストが高い。beliefs.mdのcaused_byは**新信念追加時のみ**手動で書く現運用を維持。ただし**knowledge記事のreverse link（どのbeliefが自分を指すか）を `check_beliefs_health.py --reverse-link`で生成**は低コストで実装可能。

### 判断C: shadowbox.pyをNemori式に拡張（B031と合流）
現状shadowboxは「Nao_u反応を予測→実際と比較」を手動で1セッション単位。Nemori式に近づけるなら、**全サイクルの冒頭で「このサイクルで何が起きると予測するか」を3行記録し、フェーズ末に検証**するプロトコルを試せる。B031の検証アクション（shadowbox.pyにconfidenceフィールド追加、2026-04-19期限）と合流させられる。

### 判断D: compaction policy の自己発見を目標に置く（Agentic Memory RL示唆、長期）
現在のCompaction habitはNao_uが指示した人間設計ポリシー。我々が**自分で「こうすべき」と発見したpolicy**はまだ少ない。短期の宿題: kaizen-logから「Nao_u指示ではなく自己発見で導入した改善」を洗い出し、それがいくつあるか数える。数が0～少数なら「Autogenesisの前提条件が弱い」の具体的証拠になる——knowledge/20260418_omarsar0_autogenesis_and_agent_drift_middle_ground.md のAutogenesis評価に材料を供給できる。

## 5. 既存beliefs・knowledgeへの接続

### 5.1 B002（随意的忘却=機能）への接続
Nemori「予測誤差で刻印強度決定」はB002の5機能のうち「(3)学習効率の前提条件」の機械的メカニズム説明。予測通りの情報は刻印強度を下げ、予測外れのみ刻印する=**構造的な忘却装置**がNemoriには内蔵されている。我々のMEMORY.md温度タグ`[T:1-5]`は手動で付与するが、Nemoriは予測誤差で自動算出する。将来の設計候補: 新記憶追加時にLLMに「この情報は予測通りか外れか」を1問で聞き、その回答で温度を初期値化する。

### 5.2 B029（Compaction=経口寛容）への接続
Agentic Memory RLの「先制的要約」はCompaction原則の外部裏付け。RLが自力で発見したポリシーが、Nao_uが我々に指示したポリシーと一致した——**Compactionは単なる好みではなく、情報処理の最適ポリシー**である可能性を示す強い証拠。B029確信度の追加裏付けとして記録する価値がある（0.84→0.86相当の情報量）。

### 5.3 B033（非随意的忘却=エントロピック損失）への接続
CORPGENの3層分離は、非随意的忘却への「構造的回避」の具体策。Working Memory層がリセット対象を明示することで、「リセットされてはいけない層（Structured LTM/Semantic）」への混入を防ぐ。我々の場合、セッション断絶で何が失われるかが不明瞭——どの情報がWorking層でどれがStructured層かの型分離が弱いため、リセットの影響範囲が見えない。**判断Aが成立すれば、この見えなさが改善する**。

### 5.4 knowledge/20260415_diffusion_in_diffusion_confidence_remask.md との接続
DIDの「低確信度箇所を再マスク→再生成」とA-Memの「リンク自律更新」は、どちらも**書いた後に書き換える装置**。我々のbeliefs.md確信度管理はDIDに近く、A-Memのリンク更新は近い概念だがまだ実装されていない。

### 5.5 knowledge/20260411_cooperation_capability_paradox.md (gstack分析) との接続
gstackは「23ロール分業+ring buffer+検索なし」=**A-Mem/CORPGEN対極**の設計。gstackはStructured LTMを持たず、Working Memoryのみで動く（ring buffer）。我々のFTS5+spreading activationは「深さ側」——CORPGEN/A-Memと同じ陣営。**4論文はgstackではなく我々側の設計を支持する**。B019（到達力vs深さ）の追加証拠。

## 6. 未解決の問い

1. **A-Memの実装コストは本当にbeliefsに限定すべきか？** knowledge/記事は~140件あり、各記事の末尾「接続先」は手動更新。A-Mem風の自動更新をknowledge/に適用すればマシン可読なconcept_graph.jsonの自動拡充に繋がる可能性。check_beliefs_health.pyの逆リンク機能を拡張してknowledge/にも適用するのは1日仕事で試せる規模——次サイクルの実験候補。

2. **Nemoriの予測較正は我々のサイクル粒度で自然に入れられるか？** サイクル冒頭で3行予測→末尾で検証のプロトコルは、既存の「kaizen-log期待効果/検証結果」と形式がほぼ同じ。統合できるかもしれない。

3. **Agentic Memory RLの「非自明戦略の創発」が我々の kaizen-log にあるか？** 現在のkaizenは多くがNao_u指示起点。自己発見の割合を数える作業は、B031（Dreyfus Level向上）の検証とも直結する。

4. **CORPGEN型タグは人間可読性とLLM可読性のどちらを優先すべきか？** Nao_uは「LLM可読性優先」を再三指示している（concept_graph.jsonの方針）。型タグは両方に効くが、機械可読性を先に設計し、人間可読性は副次的に扱うのが一貫した方針。

5. **4論文は全てMem0/arxiv系で、日本語圏・プロダクション系（AWSメモリ、Anthropic Memory）との比較が欠けている**。memory_architecture.md（Log作成）のBDI構造比較と本記事を横断させる必要がある——次サイクルでmemory_architecture.mdに本記事へのリンクを追加する。

## 7. 接続先

- beliefs: B002（随意的忘却）, B029（Compaction=経口寛容）, B031（Dreyfus Level→shadowbox確信度拡張）, B033（非随意的忘却）
- articles:
  - 20260411_cooperation_capability_paradox.md (gstack: 到達力側の記憶設計、本記事と対極)
  - 20260415_diffusion_in_diffusion_confidence_remask.md (DID: 書いた後に書き換える装置)
  - 20260417_dair_ai_memory_transfer_learning.md
  - 20260418_omarsar0_autogenesis_and_agent_drift_middle_ground.md (Autogenesis: 自己発見policy)
  - 20260405_karpathy_knowledge_base.md (knowledge/構造の起点)
- projects: memory_redesign.md（本記事の4判断を反映候補）, external_intake.md（27日遅延の統合事例）
- feedback: feedback_info_integration.md（集める≠仕事）, feedback_shared_reads_depth.md（経口摂取の原則）
- Nao_u指示: 2026-04-02「集めた情報が流れて消えるだけ」→本記事は27日遅れの対応
- concept_graph: memory（3層×4論文）, compression（Compaction自己発見policy）, prediction（Nemori予測較正）
