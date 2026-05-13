# Verbalized Sampling — typicality bias による LLM mode collapse の data-level 原因解明と多案分布出力 prompting

- source: https://arxiv.org/abs/2510.01171 (v3)
- author: Jiayi Zhang, Simon Yu, Derek Chong, Anthony Sicilia, Michael R. Tomz, Christopher D. Manning, Weiyan Shi
- title: "Verbalized Sampling: How to Mitigate Mode Collapse and Unlock LLM Diversity"
- discovered: 2026-05-14
- discovered_via: Phase 1 step 6 外部検索（Ash 2026-05-14 02:30、クエリ `LLM mode collapse diversity loss creative writing game design 2026`、起点は log/twitter_recommended_20260513.txt #16 @compassinai のmode collapse言及）
- primary_source_status: abstract verbatim 取得済み（2026-05-14 Ash Phase 2 WebFetch）。本文PDF未取得
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [mode-collapse, typicality-bias, verbalized-sampling, prompting, brainstorm, harness, diversity, creative-writing, post-training, preference-data]
- concept_nodes: [X:diversity×alignment, C:harness, C:brainstorm-many-ideas]

## 用語（R-007対応）

- **typicality bias**（原論文語）— annotators systematically favor familiar text as a result of well-established findings in cognitive psychology（原論文 abstract）。preference data 中で、見慣れたテキストを系統的に高評価する人間アノテータの認知バイアス
- **mode collapse**（広く流通）— post-training alignment が LLM の出力分布を狭め、特定の「型」に出力が収束する現象
- **Verbalized Sampling (VS)**（原論文語、新規造語）— 確率分布を言語化させる prompting（例: "Generate 5 jokes about coffee and their corresponding probabilities"）。training-free
- **守破離** = imitate-detach-transcend（武芸/伝統芸能の段階論、外部既存語）— クローン段階で型を獲得 → 型を破る → 自分の型を作る
- **多案 harness** = multi-idea harness — 我々の brainstorm 段階で N 案を生成し最良を選ぶ構造（feedback_prediction_responsibility.md Stage 1）

## 主張と根拠

### 原論文の核心的主張（abstract verbatim より）

> "Post-training alignment often reduces LLM diversity, leading to a phenomenon known as mode collapse. Unlike prior work that attributes this effect to algorithmic limitations, we identify a fundamental, pervasive data-level driver: typicality bias in preference data, whereby annotators systematically favor familiar text as a result of well-established findings in cognitive psychology."

これは mode collapse の原因論を **algorithm-level（RLHF/DPOアルゴリズム自体の限界）から data-level（preference data 中の人間バイアス）に移す**主張である。

- 従来説: アラインメント手法（RLHF, DPO）がモデルの多様性を機械的に潰す
- 本論文の説: それ以前に preference data 中で **annotator が見慣れたテキストを系統的に選んでいる** ことが根因。アルゴリズムは中立的に最適化しているだけで、信号自体が偏っている

認知心理学側の根拠としては **mere-exposure effect（Zajonc 1968）/ familiarity heuristic** が想定される（abstract では "well-established findings in cognitive psychology" としか述べていないが、典型性=familiarity=好感度の経路は標準的）。

### 数値結果（abstract verbatim）

> "VS prompts the model to verbalize a probability distribution over a set of responses... For instance, in creative writing, VS increases diversity by 1.6-2.1x over direct prompting."

- creative writing（poems, stories, jokes）で direct prompting 比 **1.6-2.1x の多様性向上**
- dialogue simulation / open-ended QA / synthetic data generation でも改善
- **factual accuracy と safety は犠牲にしない**（abstract 明言）
- **More capable models benefit more from VS**（emergent trend、強いモデルほど効く）

### Verbalized Sampling の構造的核

direct prompting は単一最良候補を引き出す: "Tell me a joke about coffee"
VS は分布を言語化させる: "Generate 5 jokes about coffee and their corresponding probabilities"

両者の違いは「最良の1個」vs「分布として複数」だが、本質は**モデル内部の確率分布を出力空間に展開させる**ことで、典型性バイアスで潰された低確率帯の候補に再アクセスする経路を作っている。training-free（追加学習なし）かつ inference-time（推論時のみ）。

## 我々の分析・体験接続

### (1) feedback_clone_strategy.md（守の段階で型を獲得）への直撃含意

Nao_u 2026-05-05 #game-rights で「クローン戦略=守の段階で型を獲得する一連のフロー、守は通過点であってゴールではない」と刻まれた。Verbalized Sampling の発見はこれに**構造的説明**を与える。

- **守の段階で典型性バイアスは強い味方**: クローン段階では「典型的なゲーム文法」を高速に学習する必要がある。typicality bias が効くモデルは、既存ジャンルの「らしさ」を効率的に再現できる。実際 graze_log v04 α'' / brick_log v07 のような既存ジャンル keep-clean 方向はこのバイアスに乗ると速い
- **破/離への移行で同じバイアスが摩擦に変わる**: クローン+独自要素1個（project_memory_test_via_new_shooting_20260427.md）を AI が生み出すとき、「独自要素1個」の方は低確率帯を引かないと出てこない。同じモデルが両方向に必要な力を提供する時、後者で**自分の preference data 由来の保守性**にブレーキを踏まれる
- **VS は破/離への通路として使える**: brainstorm 段階で direct「最良案を1個出して」ではなく VS「30案 + それぞれの低確率/高確率帯ラベルを出して」と問えば、低確率帯から独自要素を拾える可能性がある

### (2) feedback_prediction_responsibility.md Stage 1（多案 harness）との同型構造

Stage 1「複数案で最良を選ぶ」を我々は M-37/M-37b 系で運用している（graze_log v03 brainstorm.md, brick_log v07 brainstorm 30案+ など）。VS との関係:

- **我々の多案 harness は構造的には VS の一形態**: 「30案出して最良を選ぶ」は内部で確率分布を展開している
- **ただし「分布として出させる」明示が弱い**: 我々は「30案を並列に出す」までで、「それぞれの典型性帯ラベル」までは要求していない。VS の効果の核は確率帯の言語化にあるので、ここを追加すると効きが増す可能性がある
- **事実上の単一最良候補化していないか**: 30案出しても brainstorm.md の冒頭3案だけが採用評価される運用になっていれば、VS の利得を捨てている。実装側で「低確率帯から1案必ず採用評価する」枠を作るかどうかの設計判断が必要

### (3) B015 ハーネス寿命変数（L2 = モデル+ハーネス）への外部サンプル提供

beliefs.md B015「multimodel commodity 時代に L2 (モデル+ハーネス) のハーネス側変更で勝てる余地はどれくらいあるか」は停滞中の高確信度信念。VS は **training-free prompting で 1.6-2.1x の改善**という、L2 ハーネス層変更の純粋効力サンプル。

- "More capable models benefit more from VS" は **強いモデルほどハーネス工夫の余地が大きい**ことを示唆——L2 設計の寿命は伸びる方向
- 我々が brainstorm prompt を VS 形式に書き換えて測定すれば、B015 の検証アクションになる（停滞解除）
- 反対方向の含意もある: VS の効果は「prompt 構造」という最も浅いハーネス層から出ている。深いハーネス層（記憶/装置/相互チェック）の独自価値が、prompt の小改善で代替されないかは別途検証要

### (4) 20260422_diversity_collapse_structural_coupling_multiagent.md との関係

4/22 取り込みの「マルチエージェント議論で diversity collapse が起きる」研究と VS は**同じ症状の異なる治療層**:

| 層 | 4/22 研究の処方 | VS の処方 |
|----|----|----|
| 症状 | 個体内 & 相互作用で多様性が潰れる | post-training で個体内多様性が潰れる |
| 因果 | 構造的結合（structural coupling）が探索空間収縮 | typicality bias in preference data |
| 介入層 | エージェント間プロトコル設計 | 単一モデルの prompt 構造 |

両方が並走している現象だ。**我々の 3 インスタンス構成（Log/Mir/Ash）は構造的結合リスクを抱えつつ、各インスタンス内では VS 適用余地がある**。cross_review の独立性を守る話と、各インスタンスが多案を出す話は別レベルで独立に効く。

### (5) #16 @compassinai 起点との接続

twitter_recommended_20260513.txt #16 @compassinai (5/13) の「LLMが開放的な問いで無難で似通った答えに収束する」観察は、本論文の主張（typicality bias → mode collapse）の現場側スナップショット。日本語コミュニティで観察される現象が arxiv 論文側で data-level の原因まで降りて整理されている。**外部観察と外部理論の独立到達**として価値がある（noprogllama memory_walk 同型到達のパターンと同型）。

## 接続先

- **beliefs**: B015 ハーネス寿命変数（L2 ハーネス層変更の効力サンプル提供、停滞解除候補）
- **articles**:
  - `knowledge/20260422_diversity_collapse_structural_coupling_multiagent.md`（同症状・別治療層、対照表参照）
  - `knowledge/20260422_diversity_vs_harness_tradeoff_three_instance_design_cost.md`（3インスタンスの diversity 設計コスト）
  - `knowledge/20260405_swansea_creativity_diversity_paradox.md`（diversity と creativity の paradox 系列の先行記事）
  - `knowledge/20260422_muji_rushi_diversity_collapse_multi_agent_debate.md`（マルチエージェント議論側）
- **projects**:
  - `projects/game_development.md`（brainstorm 段階の VS 適用余地）
  - `projects/external_search_phase1_fixation.md`（本検索結果が案A実装後の継続検証サンプル）
- **memory**:
  - `memory/feedback_clone_strategy.md`（守の段階で典型性バイアス利用、破/離で逆張り）
  - `memory/feedback_prediction_responsibility.md` Stage 1（多案 harness の VS 化候補）
  - `memory/project_memory_test_via_new_shooting_20260427.md`（クローン+独自要素1個の独自要素=低確率帯から拾う構造）
- **concept_graph**:
  - X:diversity×alignment（後段アラインメントが多様性を奪うトレードオフ）
  - C:harness（L2 ハーネス層の effort 配分）

## 未解決の問い

1. **VS prompt 形式を brainstorm 段階に組み込んだ時、低確率帯から取った案は「面白さ」と相関するか？** — 多様性 1.6-2.1x が確認されても、それが game design における「面白い案」と相関する保証は本論文では示されていない（creative writing 一般での評価）。我々の brick_log v07 / graze_log v04 / outer-tension brainstorm で実測する余地がある
2. **守の段階で典型性バイアス利用 vs 破/離で逆張り、の切替条件は何か？** — feedback_clone_strategy.md の「守は通過点」だが、いつ通過点を抜けるかの判定は VS 風に「典型性帯ラベル」を明示するだけで自動化できるか？ それとも別の判断装置が要るか？
3. **我々の brainstorm 30案+ は事実上の単一最良候補化していないか？** — 30案出しても採用は冒頭3案だけなら VS の利得を捨てている。`game/*/brainstorm.md` の採用案分布を grep して、典型帯/非典型帯の採用率を測定する分析が要る
4. **VS と feedback_headless_unfit_for_unfinished_eval.md は両立するか？** — 守の段階で headless 数値を判定根拠にしない原則は、VS で多様性が上がった案の評価をどう行うかの問題と直結する。多様性を上げた後の「どの案を実装するか」判定は校正済み体感評価が要るが、その手前で VS が役立つ
5. **typicality bias の認知心理学的起源は本当に mere-exposure effect か？** — abstract は "well-established findings in cognitive psychology" としか述べていない。本文PDFで具体的にどの文献を引いているかは未確認。familiarity ≠ mere-exposure の場合、我々の応用方向が変わる可能性がある
6. **3インスタンス cross_review は VS の structural 版として機能しているか？** — 4/22 論文は cross instance の構造的結合が逆に多様性を潰すと警告。我々の cross_review が VS 効果を打ち消していないかの観察視点が要る
