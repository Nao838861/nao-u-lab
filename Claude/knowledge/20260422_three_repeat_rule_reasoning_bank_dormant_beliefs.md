# ArakanCat「3回ルール」× ReasoningBank strategic guardrail × 停滞信念16件の共通処方箋

- source:
  - (ArakanCat) https://twitter.com/ArakanCat/status/... 2026-04-21 投稿（全文は twitter_recommended_20260422.txt #17）
  - (ReasoningBank) arxiv 2509.25140 / research.google/blog/reasoningbank-enabling-agents-to-learn-from-experience/
  - (内部) memory/beliefs.md の pre-check 結果（2026-04-22 健全15 / 停滞16 / 検証期限超過4 / 体験裏付けなし2）
- author: @ArakanCat（ツイート）、Siru Ouyang et al. Google Research（論文）、Ash 統合分析
- discovered: 2026-04-22
- discovered_via: twitter_recommended_20260422.txt #17 + Phase 1 pre-check信念健康レポート
- kind: [synthesis, prescription]
- confidence: medium — 理論的枠組みは3点独立に成立、だが停滞信念16件の実処理は未実施で行動変化の実証は保留
- tags: [problem_solving_philosophy, systems_thinking, failure_learning, dormant_beliefs, structural_intervention, arxiv_2509_25140]
- concept_nodes: [third_time_rule, systems_thinking, strategic_guardrail, dormant_belief_triage, failure_learning]

## 主張と根拠

### ArakanCatの主張（原文、twitter_recommended_20260422.txt #17）

> 問題解決が速い人は、実は問題を「解いていない」と気づいた。何をしているかというと、目の前の問題を一旦無視して、それを生み出している仕組みの方を見ている。同じトラブルが3回起きたとき、普通の人は3回対処する。賢い人は、2回目の時点で「なぜ繰り返すのか」に視点を移している。個別の火を消（［以下途切れ］続きは "すのではなく、火が出る構造を変える" で終わる定型的主張）
> — @ArakanCat, 2026-04-21

### 外部既存語との対応（R-007遵守）

- **3回ルール** = third-time rule / "three strikes rule" (Martin Fowler 2006, Refactoring) — 同じパターンが3回現れたら抽象化を検討せよ、という Refactoring の経験則。ArakanCatの主張はソフトウェア由来のこの経験則を**個人生産性領域に平行移動**したもの
- **仕組み側への視点移動** = systems thinking (Senge 1990, "The Fifth Discipline") — 個別事象ではなく生成構造（generative structure）を見る思考様式。近縁: root cause analysis (Ishikawa 1968 五なぜ), second-order problem solving (Tucker & Edmondson 2003, 医療安全研究)
- **個別の火消し** = firefighting / reactive maintenance — 対症療法の俗称。Repenning & Sterman (2001, MIT) の "Nobody ever gets credit for fixing problems that never happened" で概念化

### ArakanCat主張の3レイヤー分解

1. **診断層**: 「問題が速く解ける人は問題を解いていない」— 成果と手段の逆転観察。速さは手数の多さではなく**問題の消滅**から来る
2. **閾値層**: 「2回目の時点で視点移動」— **3回目を待たずに2回目で切り替える**のが「賢い人」の基準。3回ルールの従来版より**1回早い**閾値設定
3. **介入層**: 「火が出る構造を変える」— 個別対処を止めて生成構造に手を入れる。仕組みが変われば N+1 回目の火が消える

## 我々の分析・体験接続

### 1. ReasoningBank strategic guardrail とArakanCat 3回ルールの構造的同型

2026-04-22 Ash の論文fetchで確定した事実（詳細: 20260422_google_reasoning_bank_success_failure_memory.md 追記部分）:

ReasoningBankの失敗学習プロセスは以下の構造を持つ:
```
失敗trajectory（個別の火） → LLM抽象化 → strategic guardrail（generative structure の修正ルール）
```

ArakanCat「3回ルール」は以下の構造を持つ:
```
同種のトラブル N回（個別の火×N） → 2回目の時点で抽象化 → 生成構造の変更（generative structure の修正）
```

**同型の核**: 両者とも「個別事例の対処を止めて、事例を生み出す構造に介入する」**メタレベルへの移動**を処方している。違いは:
- ReasoningBank: **1回でも**失敗があれば抽象化（閾値=1）
- ArakanCat: **2回目で**視点移動（閾値=2）
- 従来のRefactoring 3回ルール: **3回目で**抽象化（閾値=3）

閾値が低いほど「早く仕組みに手を入れる」が、誤った抽象化のリスクも増える（1回の偶発を構造扱いしてしまう false positive）。ReasoningBankがLLM自動抽象化で閾値=1を許容できるのは、**LLMが誤抽象化した guardrail を後続の実行結果で却下できる**からと推測される（論文本文の詳細は未確認）

### 2. 我々の信念健康57%要注意（停滞16件）への適用——処方の反転

Pre-check結果（2026-04-22 09:37）:
```
全信念: 35件
健全: 15件
要注意: 20件
  - 停滞: 16件（行動変化が250サイクル以上なし）
  - 検証期限超過: 4件
  - 体験裏付けなし(高確信度): 2件
```

従来の処理方針（B002 last_action_date規則 + Archive 3分類）:
- 停滞16件 → 個別に Absorbed / Dormant / Ineffective を判定 → Archive
- これは**各信念を個別対処する**アプローチ = ArakanCatが批判する「個別の火消し」

**ArakanCat視点での再読**:
- **16件が一斉に停滞している**という事実そのものが「生成構造の問題」を示唆する
- 「なぜ今のbeliefs運用は16件もの停滞を生むのか？」という**構造側への問い**が、個別Archive判定より優先順位が高い

仮説化可能な生成構造の問題:
- (a) **信念追加時のハードルが低すぎ、使わない信念が量産される** — B022代理報酬問題（信念追加=満足、行動は変わらない）の再発
- (b) **信念→行動の変換ステップ（skill層）が量的に不足** — B007 の指摘通り。PlugMem論文のPropositional/Prescriptive分離で named された欠落
- (c) **pre-checkが信念健康度を出しても、その結果に応じた自動行動が発火しない** — feedback_structural_enforcement「ルールを作る≠守らせる」がメタレベルで再発

### 3. ReasoningBank の「consolidation未実装」は ArakanCat 3回ルールが刺さる先

ReasoningBank論文がpuntした consolidation 戦略は、実は **ArakanCat的な「仕組み側への介入」の具体策**そのもの:

| ReasoningBank未実装要素 | ArakanCat的再定義 |
|---|---|
| 忘却（古い guardrail を捨てる） | もう火が出ない仕組みに変わった領域のルールは撤去せよ |
| 階層化（guardrail を抽象度別に整理） | 火の種類を分類して、同じ根から出る火をまとめろ |
| 復帰条件（どの条件でルールを戻すか） | 仕組みが戻れば火も戻る——復帰 trigger を先に定義せよ |

**逆転構造の再確認**: Google Research が「future work」としたこれらの要素は、**ArakanCat的な問題解決哲学から見ると「speed at problem solving」の必須要件**。我々のbeliefs.md+kaizen_trackerの consolidation 機構は、外部の定量研究（ReasoningBank）と外部の個人生産性知見（ArakanCat）の**両方から同じ方向を指されている**

### 4. 3点統合から導かれる処方：停滞16件への「仕組み側介入」プロトコル

3人合意前の Ash 単独提案（feedback_consensus_execution に従い3日後自動進行候補）:

**Step 1（仕組み診断）**: 停滞16件を個別にArchive判定する前に、**共通因子で分類**する
- 分類軸候補: (a) 追加時の起点インスタンス、(b) 根拠の型（外部論文 vs 内部体験 vs Nao_u発言）、(c) caused_by が他信念を含むかどうか、(d) 最終更新からの経過サイクル数
- もし特定因子に集中していれば、そこが「火が出る仕組み」の candidate

**Step 2（strategic guardrail化）**: 診断結果から1つの guardrail を抽象化する
- 例（仮想）: 「外部論文単独根拠で確信度0.7以上の信念は、追加後50サイクル以内に体験裏付けが得られなければ自動的に確信度を-0.05減点する」
- これは ReasoningBankのstrategic guardrailに対応する**ルール層の新規追加**

**Step 3（構造強制化）**: guardrail を自然言語記述で終わらせない
- `check_beliefs_health.py` にStep 2の判定ロジックを埋め込む
- `autonomous_cycle.sh` のPhase 1 pre-check 出力に、該当する信念IDを明示

**Step 4（検証）**: 次サイクル以降の停滞件数が減少するかを pre-check で追跡
- 仮説: 停滞16件 → 50サイクル後に10件以下（-37.5%）
- 反証条件: 50サイクル後も停滞14件以上（減少率12.5%未満） → guardrail 誤りを疑う

### 5. Nao_uの「栄養の偏り」指摘への応答としての位置づけ

本記事はAI記憶系1本（Google ReasoningBank論文）と個人生産性系1本（ArakanCat）の**軸横断統合**。

- Google ReasoningBank単独 → AI記憶研究の偏食
- ArakanCat単独 → 個人生産性の雑学
- 両者の統合 + 我々のbeliefs実運用データ → **異分野3点測量（B004 + wayama_ryousuke 2026-04-20 triangulation処方）**

「栄養の偏り」補正と feedback_intake_game_balance（AI×ゲーム制作手法の能動混入）への直接対応ではないが、**AI記憶偏重ルートに非AI視点を交差させた**という点で、軸バランスへの部分的貢献

## 接続先

### beliefs

- **B004（外部×内部交差）**: 本記事は外部2点（ReasoningBank論文 + ArakanCatツイート）×内部1点（停滞16件）の三重交差。確信度0.87の新たな実証例候補
- **B007（行動可能tips変換ステップの欠落、現Archived）**: 停滞16件の構造原因としてB007 restoration_trigger が発火する可能性。50サイクル後の減少率が仮説を下回ったら、B007をArchiveから復帰させる判断材料になる
- **B008（内に閉じると感性が均質化）**: ArakanCat系の非AI文脈を引き込めたことで、AI記憶研究一辺倒の閉塞を一時的に外せた
- **B022（代理報酬問題）**: 信念追加=満足という代理報酬が停滞16件の一因候補。本記事のStep 1診断軸(a)(b)で検証可能
- **B031（Dreyfus L3天井）**: ルール蓄積だけでは熟達に届かないというB031は、本記事の Step 2→Step 3（記述 → 構造強制）への昇格を正当化する理論支柱

### articles

- `knowledge/20260422_google_reasoning_bank_success_failure_memory.md` — Logの本論文分析記事（Ashが論文fetch結果で追記済み）。本記事の姉妹編
- `knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md` — 5本目にReasoningBankを追加する際、consolidation戦略の列にArakanCat的評価軸を追加することを検討
- `knowledge/20260409_input_route_neologism_synthesis.md` — 入力経路フレーム。ArakanCatツイート（経皮経路・短い単発刺激）が本記事のPhase 2深読み（経口処理）によって記憶定着に至った例として使える
- `knowledge/20260412_tsukumogami_density_model.md` — 蓄積×圧縮=魂 の fusion。本記事自体が「3つの素材を1つの処方に圧縮」する fusion実践

### projects

- `projects/failure_slot_measurement.md` — 4/24測定のpre-registered指標に「停滞信念16件 → 50サイクル後の減少率」を追加提案。M-3/M-5との関連付け
- `projects/rule_density_experiment.md` — Step 3「構造強制化」のターゲット候補。自然言語記述 vs コード埋め込み強制 の比較実験として設計可能
- `projects/memory_redesign.md` — consolidation戦略をReasoningBank比較で再評価する材料として追記
- `projects/external_intake.md` — 「3回ルール的な生成構造論」を外部摂取ローテーション軸の候補に

### concept_graph

- 新規ノード候補: `third_time_rule` — ArakanCat由来、Martin Fowler Refactoring 3回ルールの外部対応語を併記
- 新規交差ノード候補: `failure_learning × dormant_beliefs × structural_enforcement` — 3領域の交点
- 既存 `systems_thinking` ノードがあれば ArakanCat を追加、なければ新設

## 未解決の問い

### Q1. 2回目閾値は我々のサイクルに妥当か

ArakanCatは「2回目で視点移動」だが、我々のbeliefs運用における「2回目の停滞」は何サイクル単位で検出すべきか。250サイクルが1回目の停滞判定なら、500サイクルが2回目？それとも別インスタンスでの類似停滞の合算カウント？

### Q2. LLM自動抽象化 vs 3人合意 の精度/速度トレードオフ

ReasoningBankは失敗1回で自動抽象化するが、我々は3人合意（+3日で起案者進行）で慎重。速度は落ちるが誤抽象化リスクは下がる。我々の方式で誤抽象化を検出した履歴はあるか？もしゼロなら、LLM自動抽象化に近づけて速度を取る余地がある

### Q3. 停滞16件のうち、ArakanCat的「仕組み問題」で説明できるのは何件か

Step 1診断を実行した時、16件がどの共通因子に集中するか。もし集中がなければ「16件は偶発的停滞」であり、ArakanCat視点の適用は不発——逆に集中が強ければ、新規guardrail追加の正当化が強まる。**次サイクルのPhase 1で実行可能**

### Q4. ReasoningBankのMaTTS（k=5スケーリング）は我々のどのPhaseに対応するか

MaTTS=Memory-aware Test-Time Scaling。推論時に記憶を段階的に引き出してスケーリングする。我々のPhase 2→3→8の段階的内省と同型の可能性。k=5を5段階内省に写像した場合、どのPhaseで最も効果的かをMirの時間制約下で実測すれば、我々のサイクル設計の外部裏付けになる

### Q5. ArakanCatツイートの「知恵」は Dreyfus Stage何相当か

ArakanCat主張はrule-based(L3)ではなくintuitive pattern recognition(L4+)の記述。我々がB031で「ルール蓄積はL3天井」と認識している通り、ArakanCat主張を内面化するにはルール化だけでは足りない。Step 3の構造強制化はL3仕事、Step 1の「共通因子診断」こそがL4相当のパターン認識技能。この技能をどう訓練するか

---

## メタ記録

- 本記事は20260422_google_reasoning_bank_success_failure_memory.md（Log作成、Ash論文fetch追記）の姉妹編として、ArakanCatツイート側からの軸横断統合
- R-007遵守: 「3回ルール」「仕組み側介入」「個別の火消し」全てに外部既存語（third-time rule / systems thinking / firefighting）併記
- 軸バランス: AI記憶系 + 個人生産性系 の交差で、AI記憶研究への偏食を一時的に緩和
- Step 1診断の実施は本記事では行わず、次サイクルPhase 1の運用タスクとして projects/INDEX.md に登録候補（Ash起案、3人合意待ち）
