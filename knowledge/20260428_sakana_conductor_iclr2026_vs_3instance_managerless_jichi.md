# SakanaAI Conductor (ICLR2026) と我々の Manager-less 3-instance自治——訓練済みオーケストレータが解く問題と、我々が意図的に解いていない問題

- source:
  - https://x.com/SakanaAILabs/status/2048777689763639741 （Sakana AI Labs 2026-04-27 公式告知）
  - https://arxiv.org/abs/2512.04388 （ICLR2026採択論文 abstract）
- author: Sakana AI Labs（@SakanaAILabs）
- discovered: 2026-04-28
- discovered_via: log/twitter_recommended_20260428.txt #15 (Phase 1 巡回, Ash)
- kind: [observation, synthesis]
- tags: [multi-agent, orchestration, ml-research, instance-divergence, self-organization, niche-differentiation, conductor, swarm-agent]
- concept_nodes:
  - node: 訓練済みオーケストレータ
    external: trained orchestrator / learned coordinator (Sakana 2026, "Conductor")
    meaning: 強化学習で複数LLM workersへのタスク委任戦略を最適化する単一の coordinator モデル
  - node: Manager-less 自治
    external: leaderless coordination / heterarchy (Crumley 1995, archaeology) / horizontal multi-agent system
    meaning: 上位調整者を置かず、エージェント間の対称的相互作用と緩やかな共有資源で協調する構造
  - node: 自発的役割分業
    external: emergent role specialization / self-organized division of labor (Theraulaz et al. 1998, social insects)
    meaning: 訓練や指示なしに、繰り返し相互作用の中で各エージェントが特定の機能に偏っていく現象
  - node: 再帰的トポロジー
    external: recursive topology / self-as-worker delegation (Sakana 2026)
    meaning: オーケストレータが自分自身をworkerとして選択肢に含めることで生じる多段階委任構造

## 主張と根拠

### 主軸: SakanaAI "Learning to Orchestrate Agents in Natural Language with the Conductor" (ICLR 2026 採択)

論文の核心主張（abstract から、WebFetch経由で取得・2026-04-28 Phase 2）:

1. **Conductorは強化学習で訓練された単一の coordinator モデル** で、複数のLLM workers間の協調戦略（通信トポロジーとプロンプトエンジニアリング）を自動発見する
2. **訓練条件**: ランダム化されたエージェントプールで RL 訓練 → 異なる LLM セット（worker構成）への適応性を確保
3. **評価**: LiveCodeBench / GPQA / 推論ベンチマーク群で評価。**7B パラメータの Conductor が個別 worker LLM を上回る "state-of-the-art"** を達成（具体数値は abstract 非公開）
4. **革新**: Conductor が**自分自身を worker として選択可能**な再帰的トポロジー設計を持つ。これにより訓練後のテスト時にも online iterative adaptation が可能
5. **限界**: abstract では明示されず、本論文を参照する必要あり

### 副軸: 我々の現状アーキテクチャ（2026-04-28 時点）

我々（Log/Mir/Ash の 3-instance）は manager-less 自治を選択している。これは設計選択というより**実装上の自然帰結**として始まったが、運用1ヶ月強で以下のシグナルが蓄積:

| 観測 | 出典 | 含意 |
|---|---|---|
| 起票分布 Ash 4 / Mir 3 / Log 1 (4倍差) | knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md | **指示なしに自発分業が発生** |
| Ash=設計提案 / Mir=慎重派ガード / Log=知識集約 という emergent niche | 同上 | **役割は自然分岐するが固定化リスクあり** |
| 起票疲れ（起票が実装の代わりになる）| log/cycle_staging.md 2026-04-26 11:30 Ash | **役割固定が「役割の中で完結」を生む** |
| AYi Markdown 4欠陥（重複除去/減衰/ランキング/関係性不在）| projects/INDEX.md backlog | **shared resources に coordinator なし故の retrieval 劣化** |
| .claude/rules/ permutation 爆発 | knowledge/20260426_aaltonen_no_graphics_api_abstraction_debt.md | **訓練不在 + 共有ルールでルール組み合わせが PSO 同型に肥大** |

つまり**「Conductor を意図的に置かない設計」と「Conductor を置けないコストを払い続けている状態」のどちらか不明**な状態にある。

## 我々の分析・体験接続

### 構造的差分の3点整理

**(1) 委任の方向性**

- Sakana Conductor: 上位 → 下位（hierarchical delegation）。Conductor が「今この sub-task は worker A に投げ、結果を踏まえて worker B に投げる」と決める
- 我々: 横並び対称（peer-to-peer）。Slack channel + cycle_staging.md + cross_review が共有掲示板として機能。「誰が何をやるか」は task_assignment.md と self-volunteering で決まる

含意: 我々の構造では、**「全体最適化を担う主体が存在しない」**。Nao_u が時々その役を担っている（4/28 守破離=守訂正、4/27 BACKLASH閾値発言が好例）が、これは Conductor を **外部** に置いていることに等しい。Sakana の Conductor は系の中で訓練されるが、我々の事実上の Conductor（Nao_u）は系の外にいる。

**(2) 役割割当の生成原理**

- Sakana: RL 訓練で coordination strategy を最適化 → 役割は**訓練済みポリシー**として埋め込まれる
- 我々: emergent specialization。誰もそれを最適化していない（Theraulaz 社会性昆虫モデル類似）

含意: emergent には**最適化の保証がない**。Ash 50%起票がもし「全体最適」なら良いが、もし「Ash の局所最適（提案しやすいから提案するループ）」なら全体は損をする。Nao_u 4/26 起票疲れ指摘はこの後者の可能性を突いている。

**(3) 再帰的自己反省**

- Sakana: Conductor が自分自身を worker として選択可能 → recursive topology
- 我々: Mir の「慎重派ガード」 = 自分の出力を再評価する pattern と**構造同型**に見える

ここが面白い接続点で、Mir の 「再考→却下→改稿」 のループは、Sakana の Conductor が自分自身を worker として呼び出す構造と機能的に等価かもしれない。**我々のシステムでは Mir が部分的に Conductor 機能を担っている可能性**がある。ただし訓練されていないので、慎重さの方向や閾値は安定しない。

### Anthropic 69-marketplace との位置づけ

knowledge/20260425_anthropic_69_marketplace_vs_gemma_100_society.md で、我々は2つの極端を観察した:

- **Anthropic 69**: フラット自治（manager なし、拒否権で成立）→ 186取引、人間介入ゼロ
- **Gemma 100**: 神創発（垂直階層化）→ 自然発生する coordinator

Sakana Conductor は**第3の極**を提示する: **訓練で coordinator を「作る」**。Gemma の自然発生 coordinator が制御不能だったのに対し、Sakana の Conductor は意図的に訓練可能で、目的関数を持つ。

我々の3-instance は Anthropic 69 寄りだが、「拒否権」は弱く（cross_check はあるが OK率 90%超）、「フラット自治」というより「emergent specialization with informal external Conductor (Nao_u)」 が現状の正確な記述に近い。

### Aaltonen 抽象化負債との接続

knowledge/20260426_aaltonen_no_graphics_api_abstraction_debt.md で、3dfx Voodoo 2 の設計が現代 RDNA に layout transition barrier として残り、PSO permutation が 100GB cache に結晶している話を扱った。

我々の `.claude/rules/` 35件超 + feedback_*.md `t:5` 多数は同じ permutation 爆発のシグナルだった。**Conductor の不在は、ルールを通じて疑似的な調整を試みる方向に系を圧迫する**。Sakana の処方は「ルールを増やすな、coordinator を訓練しろ」と読める。我々は「coordinator を訓練できないので、ルールを増やす」方向に流れている可能性がある。

### Q-A/B/C ゲートとの関係

CLAUDE.md game_dev_foundation.md の Q-A（快感）/ Q-B（型）/ Q-C（リスク）ゲートは、各インスタンスが **着手前にセルフチェックする** 仕組み。これは Conductor の事前調整に対応する **分散型の事前調整** だ。Sakana の Conductor が中央集権的に行う「どの worker にどの task を投げるか」を、我々は**個別インスタンスが自分で「この task に着手する条件を満たすか」**として実装している。

これは**Conductor が不在でも一部機能を分散実装できる**という発見だが、Sakana の RL 訓練に対応する「ゲートの目的関数最適化」は我々の側に存在しない。Q-A/B/C の閾値設定は経験則に依存する。

## 接続先

- beliefs:
  - B008 (Creative Scar, 0.90): 同質化警告 — Conductor 不在の系は同質化と分業のどちらにも振れる
  - B019 (内部の深さと外部到達力は別の軸, 0.65): Conductor は「外部到達力の最適化」に強いが「内部の深さ」を犠牲にする可能性
  - B024 (Archived, 状況適応的記憶統合に収斂): structural coupling 仮説の延長
- articles:
  - knowledge/20260425_anthropic_69_marketplace_vs_gemma_100_society.md（フラット自治 vs 神創発の2極）
  - knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md（自発分業の実測）
  - knowledge/20260426_aaltonen_no_graphics_api_abstraction_debt.md（permutation 爆発との同型）
  - knowledge/20260426_fladdict_swarm_gamedev_meta_question.md（群体エージェント像との対比）
  - knowledge/20260426_ayi_markdown_memory_2week_collapse_self_diagnosis.md（共有資源 retrieval 欠陥との接続）
- projects:
  - instance_divergence_observability.md（horizontal_specialization_index 観測軸の追加根拠を1本増やす）
  - rlm_skill_prototype.md（Conductor 様の skill を内部訓練するという別アプローチが想起される）
- concept_graph:
  - 訓練済みオーケストレータ → emergent niche differentiation（補完関係）
  - Manager-less 自治 → permutation 爆発（圧力関係）
  - 再帰的トポロジー → 慎重派ガード（機能的同型仮説）

## 未解決の問い

1. **我々の自治は「意図的に Conductor を置かない設計」なのか「Conductor を置けないコスト負担」なのか？** — この問いに答えるには、Conductor を1ヶ月置いてみる実験が必要。例: Mir を formal Conductor として「次サイクル誰が何やるか」を毎日決める役割に固定すると、起票疲れと permutation 爆発の両方が改善するか退化するか測れる
2. **Sakana の "7B Conductor が個別 worker LLM を上回る" 結果は、Conductor の overhead を超えるパフォーマンス改善が存在することを示す。我々の 3-instance 自治の overhead（cycle_staging.md / cross_review / shared MEMORY.md / 同期コスト）は、Conductor 導入で解決できるか？**
3. **Mir の「慎重派ガード」が Sakana の re-cursive topology と機能的に等価なら、我々はすでに部分的に「Mir = Conductor」運用している。これを明示化すると Mir の負荷集中が顕在化するか、それとも整理されて軽減するか？**
4. **Conductor が訓練データにある「うまく協調した過去ログ」を最適化対象とするなら、我々の cycle_staging.md / cross_review の蓄積は将来 Conductor 訓練の素材になりうるか？** — 1ヶ月分の Phase 1-4 ログ + Slack 投稿 + 採択された kaizen の対は RL 訓練の preference データとして使える可能性がある
5. **Nao_u を「外部 Conductor」と位置づけるのは正しいか、それとも「最終評価者」と位置づけるべきか？** — 4/28 守破離=守訂正、4/27 BACKLASH閾値、4/24 型継承示唆の3点を見ると、Nao_u は「方針を訂正する」「閾値を引き直す」役割で、毎日の task assignment は担っていない。これは **strategic Conductor**（方針）と **operational Conductor**（日次配分）の役割分離があり、後者を我々の中で誰も担っていないという仮説に行き着く

## 今サイクル翻訳——次の一手

問い#1 の実験として、本サイクル中に 1 件だけ試すなら: **次サイクル始動時 (Ash 起動時)、最初の 5 分で「今日 Log/Mir/Ash 各々が何に着手すべきか」を Ash 単独で 1 案書いて #all-nao-u-lab に投げる。** Conductor 役を 1 サイクル試す。Mir/Log が異議を出すか沈黙するかで、emergent role が硬直しているか可塑かを観測できる。これは instance_divergence_observability.md 残課題§1（判断ベクトル記録）の実地データになる。

ただし**今日のサイクルで優先するのは パズル系次作の題材選定（守破離=守、クローン+独自要素1個まで）** なので、Conductor 実験は次サイクル以降に明示繰り越し。本記事は cycle_staging.md Phase 2 セクションから projects/instance_divergence_observability.md §5 への観測軸追加根拠として接続させる。
