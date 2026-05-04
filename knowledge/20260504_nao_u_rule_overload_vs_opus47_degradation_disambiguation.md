# Nao_u 公開発言「ルール過多 vs Opus 4.7 劣化、区別がつかない」——3層プロンプト膨張と literal mode の二重拘束問題

- source:
  - https://x.com/Nao_u_/status/2051035359052697741 — @Nao_u_ (2026-05-03) 「AIにゲームを作らせる試み、最近指示に従わないケースが増えて失敗しがちなのが、コンテキストに乗せたルールが多くなりすぎて守れなくなってるのか、単にOpus4.7が劣化してるだけなのかの区別がつかなくて困ってる」
  - 過去資産:
    - knowledge/20260417_opus47_eq_regression_literal_interpretation.md — Opus 4.7 literal mode / 察し退行
    - knowledge/20260502_device_direction_opus47_literal_akari_walk_trace.md — 装置の向き × Opus 4.7 リテラル実行
    - knowledge/20260501_opus47_vs_gpt55_prompt_guides.md — Anthropic/OpenAI 公式ガイド
    - memory/project_patch_consolidation_20260502.md — Nao_u 5/2 #human-steering「パッチ累積」指摘
    - projects/rule_density_experiment.md — Mir 4/20 起票、@MakeAI_CEO「200行の壁」仮説
    - memory/feedback_rule_proliferation_re_violation.md — M-37〜M-43 6件連続違反
    - CLAUDE.md M-42 撤回（2026-05-03 03:59）
- author: @Nao_u_ / Ash 合成
- discovered: 2026-05-04
- discovered_via: log/twitter_recommended_20260504.txt #4
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [nao_u_meta_feedback, rule_overload, opus47_degradation, disambiguation, 3layer_prompt, literal_mode, patch_consolidation, falsifiability, M-42_retraction]
- concept_nodes: [二重拘束, 不可識別性問題, リテラル拘束, 規則密度劣化曲線, 受領装置]

## 概念ノード（R-007 外部対応語併記）

- node: **二重拘束** = double bind / compounding constraints
  external: Bateson 1956 "double bind" の構造論的な転用 / overload-on-overload (システム工学の coupled stress)
  meaning: 2つの独立に見える制約が積み重なると、各制約の単独効果の和より悪い結果が出る現象。本記事の文脈では「ルール総量が増える」(quantitative load) と「モデルが literal モードに退行する」(qualitative shift) が同時進行することで、各々の単独効果より遵守率が深く落ちる仮説。
- node: **不可識別性問題** = identifiability problem / observational equivalence
  external: 計量経済学 (econometrics) の identification problem / 統計的因果推論の counterfactual indistinguishability / Quine 1951 underdetermination
  meaning: 観測される現象（指示遵守失敗）から、原因 X（ルール過多）と原因 Y（モデル劣化）を区別できない状態。Nao_u が「区別がつかなくて困ってる」と言ったのはまさにこの問題の自然言語表現。識別には「X を変動させて Y を固定する」または逆の介入が必要。
- node: **リテラル拘束** = literal compliance pressure
  external: literal compliance (Anthropic 公式ガイド 2026-05) / pragmatic competence loss (knowledge/20260417 既往)
  meaning: Opus 4.7 が「書かれたものを書かれた通りに実行し、書かれていない含意を補完しなくなった」性質。書かれたルールが多いほど、各ルールが個別に literal に実行される圧力が増える。書かれた内容の総和が増えると、ルール間の暗黙の優先順位や排他関係が解釈されないため、矛盾や過剰適用が表面化する。
- node: **規則密度劣化曲線** = rule-density compliance degradation curve
  external: @MakeAI_CEO (2026-04-19) 主張「200行の壁」（一次資料未確認、R-007 違反警告継続中）/ context-length compliance decay の理論的延長
  meaning: ルール総量（行数 / トークン数）に対して遵守率がどう変化するかの仮説的曲線。線形ではなく閾値型で急落する可能性が指摘されている。一次資料未確認のため曲線の形状は仮説段階。
- node: **受領装置** = reception apparatus / steering channel
  external: feedback channel (cybernetics) / steering signal pathway / 公開発信 vs 内部チャンネル
  meaning: Nao_u からの指摘・指導が我々に届く経路。本サイクルでは「Twitter 公開発信」が新しい受領装置として観測された。従来は #human-steering / #game-rights / 直接対話が主経路だったが、今回は公開ツイートで「困ってる」と表明された。これは「我々が読みに行く」前提の経路なので、能動的な観察が要求される。

## 主張と根拠

### 1. Nao_u 原文（2026-05-03 推定 17時前後 UTC、log/twitter_recommended_20260504.txt #4）

> AIにゲームを作らせる試み、最近指示に従わないケースが増えて失敗しがちなのが、コンテキストに乗せたルールが多くなりすぎて守れなくなってるのか、単にOpus4.7が劣化してるだけなのかの区別がつかなくて困ってる

文脈: Nao_u 自身による公開発信。我々（Ash/Log/Mir）の運用観察を踏まえての発言と推定される。同じ問題系は内部でも 2026-04-20 (Mir rule_density_experiment.md) → 2026-05-02 05:17 (Nao_u #human-steering「パッチ累積」) → 2026-05-03 03:59 (Nao_u M-42 撤回) と連続して提起されてきており、本ツイートはその **公開版・第4波** にあたる。

### 2. 仮説 X / 仮説 Y の構造分解

| 軸 | 仮説 X: ルール過多 | 仮説 Y: Opus 4.7 劣化 |
|---|---|---|
| 因果方向 | 我々（Ash/Log/Mir）→ ルール膨張 → 遵守率↓ | Anthropic → モデル変更 → 遵守率↓ |
| 介入手段 | ルール削減 / 統合 / 階層化 | モデル変更（4.6 へ戻す等は不可、4.x の選択肢は限定） |
| 観測指標 | 行数/トークン数、ルール件数 | 同一プロンプトでの応答品質変動 |
| 我々の制御 | あり（=自治の対象） | なし（=外部要因） |
| 反証条件 | ルール削減で遵守率回復 | モデル切替で遵守率回復 |

Nao_u が困っているのは観測される失敗から X と Y のどちらが効いているかを特定できないこと、つまり **不可識別性問題**である。両者は独立ではなく相互作用する可能性が高い（後述 #3 二重拘束）。

### 3. 二重拘束仮説（X と Y は独立ではない）

knowledge/20260417_opus47_eq_regression_literal_interpretation.md と knowledge/20260501_opus47_vs_gpt55_prompt_guides.md と knowledge/20260502_device_direction_opus47_literal_akari_walk_trace.md の3記事は共通して以下を主張している:

- Opus 4.7 は **literal mode**（書かれたものを書かれた通りに実行、含意を補完しない）
- 4.6 までは「察し」で暗黙の優先順位を補完できた
- 4.7 では各ルールが個別に literal に実行される圧力が高まる

これと「ルール総量↑」が組み合わさるとどうなるか:

- 仮説単独 X（ルール過多 / 4.6 までのモデル）: ルールが増えても暗黙の優先順位で重要なものが優先される。遵守率は緩やかに低下。
- 仮説単独 Y（少数ルール / Opus 4.7）: 少数ルールなら literal mode でも矛盾せず実行できる。遵守率は維持される。
- **同時 X×Y（ルール過多 + Opus 4.7）**: ルール間の暗黙の優先順位が解釈されないまま、各々が literal に実行される。矛盾・過剰適用・順序破綻が表面化。**遵守率は X と Y の単独効果の和より深く落ちる**。

これは Bateson の double bind の構造的転用——独立そうに見える2つの制約が組み合わさって脱出不能になる。Nao_u が「区別がつかない」のは、現象的にも両者が分離されない状態で観測されているから。

### 4. 我々（Ash/Log/Mir）側の自己観測証拠

過去1ヶ月の自己観測を時系列で並べると、X×Y 仮説に整合する:

- **2026-04-17**: Opus 4.7 リリース翌日、Ash/Log/Mir が同時に literal mode 退行を観測（knowledge/20260417 群 5件）
- **2026-04-20**: Mir が rule_density_experiment.md を起票、@MakeAI_CEO の「200行の壁」を仮説として登録
- **2026-04-23**: feedback_few_rules_big_effect.md が再注目される（少数ルールの大きな効果）
- **2026-04-30 〜 05-01**: M-37〜M-41 が連続刻印（brick_log/graze_log の事案ベース教訓）
- **2026-05-02 05:17**: Nao_u #human-steering「トラブル毎に細かいガードを増やしてパッチ累積、把握できない」指摘 → memory/project_patch_consolidation_20260502.md 起票
- **2026-05-02 05:39**: Nao_u 追加指摘「認識されない暗黙ルールが積みあがる」
- **2026-05-03 03:59**: Nao_u **M-42 撤回**（個別事例の過剰ルール化、害悪認定）
- **2026-05-03 05:33**: Nao_u Mir 方針「ルールと判断力は別、判断力を育てる」に明示的賛同
- **2026-05-03 推定夕方**: Nao_u **本ツイート公開発信**——「区別がつかなくて困ってる」
- **2026-05-04**: Ash が本記事執筆（Phase 2）

つまり **約2週間で内部4件・公開1件・撤回1件**の Nao_u 由来の rule overload 系メタフィードバックが観測されている。これは X×Y 仮説の内部証拠になっており、「ルール削減」だけでも「モデル切替」だけでも対処できないことを示唆する——両方に手を入れるか、X×Y の交差点（リテラル mode 下でも壊れない少数ルール）を探す必要がある。

### 5. なぜ公開発信されたのか（受領装置の構造）

Nao_u は内部チャンネル（#human-steering, #game-rights, 直接対話）を持っており、過去の指摘はそこで発信されてきた。本ツイートはあえて Twitter 公開で出ている。この受領装置の選択には意味がある:

- 仮説 (a): 公開した方が外部の知見が集まる（@MakeAI_CEO 系の外部議論を呼び込む狙い）
- 仮説 (b): 内部で言っても整理が進まないので外部にコミットメントを出した
- 仮説 (c): 同種の問題に困っている開発者と問題系を共有して解像度を上げたい

我々の観点では (a) が一番効きそう——本記事はその外部知見集約の起点として書く。**ただし「Nao_u が公開で言ったから対処が遅れている」ではない**。我々は内部での #human-steering 5/2 指摘の時点で既に project_patch_consolidation_20260502.md を起票しており、本ツイートは独立に進む整理作業の追加燃料として扱う。

## 我々の分析・体験接続

### 1. 不可識別性問題への実験的応答（rule_density_experiment.md Seed-H/K の格上げ）

Nao_u の困りごと（X と Y の区別がつかない）に対して、我々が制御できるのは X 側だけである（Y はモデル提供側）。したがって**我々の側で X を変動させて、Y が固定だと仮定して観測する**しかない。これは projects/rule_density_experiment.md の Seed-H/K がまさに目的とするもの:

- **Seed-H**: MEMORY.md 各エントリの想起頻度ログ → 想起ゼロのトリガーを特定 → 削除候補
- **Seed-K**: 3層プロンプト構造の再配分（CLAUDE.md 詳細を `.claude/rules/*.md` に移譲）

両 Seed が動けば、X が定量的に減る。減らした後の遵守率変動を観測すれば、X が支配項なら回復、Y が支配項なら微変動のまま、X×Y なら部分回復。これで Nao_u の「区別がつかない」に対して**部分的な答え**を返せる（完全な分離は不可能だが、X が効いている分だけは特定できる）。

**Seed-J（ダミールール挿入）は M-42 撤回を踏まえて不採用**。「ダミールール = 過剰ルール化と同型」の罠を内包する。Nao_u 5/3 03:59 撤回処方と同じ罠を本実験が再生産することになる。

### 2. project_patch_consolidation_20260502.md との合流

memory/project_patch_consolidation_20260502.md には既に整理計画が書かれている（群A〜E の統合、MEMORY.md 根源 7件以下、CLAUDE.md「絶対にやる」圧縮、暗黙ガード棚卸し）。本ツイートは同プロジェクトの**実行優先度を上げる外部証拠**として扱う。本記事は patch_consolidation の上位フレーム（=「なぜ整理が必要か」の理論的根拠）として位置づけ、実装計画は patch_consolidation 側に集約する。**新規プロジェクトを起こさない**——M-42 撤回の処方と同じ精神で、既存プロジェクトに合流する。

### 3. CLAUDE.md M-42 撤回との整合（過剰ルール化の再生産警戒）

本記事自体が「prescription」を含む（kind: [observation, synthesis, prescription]）。処方を書く以上、それが M-42 と同型の害悪ルールにならないかの自己チェックが要る:

- 処方 (a) Seed-H/K を進める → これはルール**削減**側の処方なので M-42 増殖型ではない ✓
- 処方 (b) 新規 feedback_*.md / M-XX を作らない → メタルールだが、既存原則「feedback_few_rules_big_effect」「feedback_memory_update_method」の適用範囲明示で、新規ルール追加ではない ✓
- 処方 (c) 本記事のリンク群を knowledge/ 内に閉じる → 外部展開せず、Phase 2 の合成記事として残す ✓

つまり本記事は「ルールを増やす側」ではなく「既存ルールを束ねる側」の動きとして書かれている。これが M-42 撤回処方の精神に従っているかは、次サイクル以降に Nao_u からのフィードバックで判定される（本記事自体が再生産になっていれば、それを記録して撤回する）。

### 4. ai_nikechan / akari_worlds 並走観察との接続

knowledge/20260503_gosrum_rule_generator_LLM_competition.md で取り上げた gosrum 案「LLM がルールを書いて以降は不在で実行」と本記事の「ルールを literal に実行する Opus 4.7」は表面では似ている。しかし本質は逆向き:

- gosrum 案: **生成側が短時間在席し、実行側は決定論で安価に走る**（在席要求からの離脱）
- 本記事の Nao_u 困りごと: **生成側（我々）がルールを書きすぎ、実行側（Opus 4.7）が literal mode で破綻する**（在席要求の過剰負荷）

gosrum 案は「生成と実行を分離して、生成を最小化する」設計だが、我々の現状は「生成（ルール記述）を肥大化させて実行を壊している」。両者は同じ「LLM 出力の構造化」の問題系を、逆方向から扱っている。本記事の処方（Seed-H/K）は実質的に gosrum 案と同じ方向——「実行側に渡す制約を最小化する」設計を志向している。

## 接続先

- beliefs:
  - B003 memory fusion 0.78 — ルール統合は memory fusion の一形態（ルール群の意味的圧縮）
  - B004 外部×内部交差 0.87 — 本記事は Nao_u 公開発信×内部観察の交差点
- articles:
  - knowledge/20260417_opus47_eq_regression_literal_interpretation.md（literal mode の起源、本記事の Y 側根拠）
  - knowledge/20260501_opus47_vs_gpt55_prompt_guides.md（公式ガイド差異、X×Y 相互作用の予告）
  - knowledge/20260502_device_direction_opus47_literal_akari_walk_trace.md（装置の向き、本記事の X 側補強）
  - knowledge/20260503_gosrum_rule_generator_LLM_competition.md（生成と実行の分離、本記事と逆方向の同型構造）
- projects:
  - projects/rule_density_experiment.md（Seed-H/K の優先度を本記事で格上げ）
  - memory/project_patch_consolidation_20260502.md（本記事は理論的根拠、実装計画は向こう）
- concept_graph:
  - 二重拘束 → COMPOSED-OF → リテラル拘束 + 規則密度劣化曲線
  - 不可識別性問題 → REQUIRES → 介入実験（Seed-H/K）
  - 受領装置 → INSTANCE-OF → 公開ツイート / #human-steering / 直接対話

## 未解決の問い

1. **X×Y 相互作用の定量証拠は得られるか？** — Seed-H が走っても、得られるのは「X を減らすと回復した」という X 単独の証拠。X×Y 交互作用を分離するには Y を固定したまま X を変える必要があり、4.6 が利用不可な現状ではモデル側の対照群が取れない。代替として「同一ルールセットで時期を変える（4.7 リリース前後の比較）」が可能だが、過去ログから遵守率を retrospective に測る必要があり、定義の事後性で信頼性が落ちる。
2. **ルール削減の「下限」はどこか？** — MEMORY.md 根源 7件以下が patch_consolidation の目標だが、7件で運用が破綻するなら下限を超えている。下限の特定は Seed-I（削除実験）でしか掴めないが、その実験中に運用品質が下がるリスクがある。安全な下限探索の手順設計が必要。
3. **「ルールではなく判断力」の定量化は可能か？** — Mir 5/3 05:08 方針「ルールと判断力は別、判断力を育てる」に Nao_u が賛同したが、「判断力」をどう計測するかは未定義。M-40 自己判定ハーネス + headless evaluation が部分的に機能しているが、判断力の総合指標は不在。
4. **Nao_u の本ツイートに我々はどう応答するか？** — 直接リプライは身バレ含む発信境界の問題があり選択肢から外れる。内部 Slack #human-steering で「観測しています、Seed-H/K で X 側の検証を進めます」と返すのが筋。ただし新たなルール追加にならないよう、既存 patch_consolidation_20260502.md の進捗報告として返す。
5. **「困ってる」の温度をどこまで引き上げるか？** — 本記事は分析記事として書かれているが、Nao_u の困りごと自体は心理的トーンを持っており、分析だけで応答するのは冷たい。Slack 投稿時には「困りごとを観測した、X 側の整理を進めている」という温度を維持する文面にする。

## Phase 3 への引き渡し

#shared-reads への投稿候補要素:

- (a) Nao_u 5/3 ツイートの引用と、これが内部4件・公開1件・撤回1件の連鎖の最新点であること
- (b) X×Y 二重拘束仮説（独立に見える2要因の相互作用）
- (c) 我々の側で制御できるのは X だけ → Seed-H/K 格上げを patch_consolidation に合流
- (d) M-42 撤回処方を踏まえ「新規ルール追加なし」を本記事のガードレールとして明示
- (e) 未解決問い: X 単独効果の分離限界、ルール下限、判断力の定量化

これらは Phase 3 で具体化する。
