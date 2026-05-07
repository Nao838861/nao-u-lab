# Algomatic_AILab × 自律ハーネス進化 — 我々3インスタンス静的分散と装置の向き理論への射影

- source: https://x.com/Algomatic_AILab/status/2051180236776133073
- author: @Algomatic_AILab (引用元: 復旦大学・北京大学・上海奇跡智峰有限公司 共同研究)
- discovered: 2026-05-04
- discovered_via: Twitter おすすめ TL #44 (log/twitter_recommended_20260504.txt 17:25 取得)
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [agent_harness, self_evolution, three_instance, device_direction, intent_collision, M-40, B015]
- concept_nodes: [agent_harness, self_evolving_harness, static_split_three_instance, device_direction_orthogonal]

## 主張と根拠（元発言）

@Algomatic_AILab の引用文（2026-05-04 投稿）:

> AIエージェントの性能に大きく影響するハーネスを、エージェント自身が自動で進化させる手法が提案されました。
> 復旦大学・北京大学・上海奇跡智峰有限公司の共同研究チームによる報告です。

論文本体の要旨は Tweet 文面では明示されていないが、命題の構造は明瞭である:

| 構造要素 | 内容 |
|---|---|
| 観測対象 | AIエージェントのハーネス（プロンプト構成・ツール選択・スケジューリング・記憶管理など、モデル外側の足場） |
| 発見命題 | ハーネスはエージェントの性能を大きく左右する（=モデル能力で決まらない） |
| 提案手法 | エージェント自身がハーネスを自動進化させる |
| 担い手の交代 | 従来「人間が外側から書き換える」→ 提案「エージェントが内側から書き換える」 |

### 命題の核

「**ハーネス → 性能** という因果が想像以上に強い」という観察と、「**ハーネスを書き換える主体を内側に移す**」という処方の組み合わせ。前者は B015（到達性が品質を決める / context engineering の要諦）と命題的に同一で、後者はその実装層の急進化案にあたる。

## 我々の分析・体験接続

### 我々のハーネス構造との対比

| 層 | 当該研究の前提 | 我々（Log/Mir/Ash）の実態 |
|---|---|---|
| モデル | LLM単体 | claude-opus-4-7 / claude-sonnet-4-6 等 |
| ハーネス | プロンプト + ツール + スケジューラ | `.claude/system_identity.md` + `CLAUDE.md` + `.claude/rules/*.md` + `cron` + `next_tasks.py` + `slack_bot.py` 等 |
| 編集権限 | 提案手法ではエージェント自身 | **Nao_u（人間ホスト）が静的に編集**。我々は提案するが直接書き換えない領域が多い |
| 分散構造 | 単一エージェント想定 | 3インスタンス静的分散（Win=Log / Mac=Mir / Win2=Ash） |

我々の構造は「**ホスト編集 × 静的3分割**」だ。当該研究は「**自己編集 × 単一エージェント**」を前提にしている。直交する2軸の対角に位置している。

### 装置の向き理論（2026-05-02 Ash）からの読み直し

前サイクル末尾、私 (Ash) は backup auto-commit が「commit ログに1行増やす」という意図 commit を先取りして窒息させた事象を記録し、装置を**救援装置**（headless_check.py）と**窒息装置**（backup auto-commit）に分けた。当該研究を読み直すと、自律ハーネス進化は**双方向に振れる装置**の極端な事例だと分かる:

- **救援方向に振れる場合**: バランス調整・バグ検出・反復タスク自動化のループを agent が自分で締める。M-40 二層分離の「自動化可能層」を agent 側で完結。
- **窒息方向に振れる場合**: 進化方向の評価が agent 自身に委ねられるため、自己評価が甘い場面で「悪化方向の進化」を「進化」と呼んでしまう。M-39 自己判定の弱さがそのまま致命的に効く。
- **混合場合**: 救援と窒息が同じハーネス内で同居し、agent は「進化した」と感じるが外部観測者には品質が下がっている、という失見当が起きる。

**自律ハーネス進化は、装置の向き判定を agent 自身に閉じ込める設計**である。装置の向きを外部から確認する経路（Nao_u/cross_review/Slack）が無くなれば、`feedback_self_judge_no_human_dependency.md` で書いた「自動化可能層は headless で潰せ、厚み層は外注不可」の二層分離が崩れ、両層を agent 自身が同じ進化ループで処理してしまう。

### M-40 二層分離との接続

`memory/feedback_self_judge_no_human_dependency.md` の二層分離:

| 層 | 自動化可能性 | 例 |
|---|---|---|
| 自動化可能層 | headless / RL agent で潰せる | balance / bug / skill_gap / rule_clarity |
| 厚み層 | 外注不可 | 30秒予測 / コア快感天井 / Lasrado命題 |

自律ハーネス進化の妥当な適用範囲は**自動化可能層に限定**される。厚み層をハーネス進化に乗せると、Polanyi の暗黙知側（言語化不能な体験品質）が言語化された目的関数で代替され、評価指標と実体験のズレが広がる。これは brick_log v04→v05→v06 で観察された「振幅 5/22/10px のチューニング3往復」と同型で、**表層パラメータの局所最適探索が厚み層を侵食する事例**だった。

### #15 Kasiwa_p「ツクール革命」二面性との接続

同日 TL #15 (@Kasiwa_p, 2026-05-03):

> ちらほらツクールの仕様を逸脱した作品の進捗が増えて、今年はツクール革命の年になりそうだ。

別所では @Kasiwa_p は「ゲーム制作が楽しい / イベント作成が苦行」と二面性を述べている。これを M-40 二層分離に重ねると:

- **イベント作成（苦行側）** = 自動化可能層 → ツクール内蔵自動化やAIで楽になる
- **ゲーム制作（楽しい側）** = 厚み層 → 自動化すると楽しさが消える

「ツクール革命」が起こす変化は、**苦行側の自動化が進み、楽しい側に時間が振れる**こと。当該研究の自律ハーネス進化が成功する条件も同型で、「自動化される対象が苦行側に限定される」「楽しい側=厚み層は agent ではなく作者自身が関わり続ける」という分離が必須。Kasiwa_p の二面性観察は、自律ハーネス進化の適用境界を制作者経験から裏付けている。

### intent collision（2026-05-04 Ash 02:30 検索）との接続

前サイクル外部検索の発見: lasso.security / neuraltrust.ai / prompt.security / biometricupdate.com の4本が「intent definition gap / Agent Behavior Drift / Runtime Behavioral Threat Detection / intent-based security framework」を 2026年予測として並列化していた。当該研究の自律ハーネス進化は、まさに **intent definition gap が起きやすい場**である:

- ハーネス進化前の意図 (`ash:` で commit する意図 commit) と、ハーネス進化後の意図 (`backup:` の自動 commit) が衝突する
- 衝突を agent 自身が認識する経路が無いと、表層は実現済みなのに意図は不在、という empty surface 状態になる

`feedback_device_direction_rescue_vs_suffocation.md` への追記候補は、「自律ハーネス進化を内部に持つ場合、intent collision の自己検出ループが必須」という命題。

### 我々の3インスタンス静的分散の設計責任

当該研究と対比すると、我々の3インスタンス静的分散は「**ハーネス進化を Nao_u に外注し、3並列で観察データを増やす**」設計と言える。長所は装置の向き判定を Nao_u が握れること。短所は進化速度が Nao_u のレビュー速度に律速されること。

Algomatic_AILab 経由の研究は、この律速を破る方向の提案だ。我々がこの方向に進む場合、必要な前提は:

1. **intent definition の最小実装** = commit prefix 分離（`ash:` / `backup:` / `Auto sync`）など、進化対象の意図を機械可読にする
2. **二層分離の実装** = 自動化可能層と厚み層の境界を明示し、自律進化の適用層を限定する
3. **進化方向の外部監査** = Nao_u/cross_review/Slack を「進化の妥当性ゲート」として残す（M-39 の上位ゲートを保持）

3条件を満たさないまま自律ハーネス進化に踏み込むと、backup auto-commit と同型の「意図窒息装置」を agent 自身がハーネスとして自己生成する事故が起きる。当該研究の処方は妥当だが、適用前提が厳しい——というのが我々側の読みになる。

## 接続先

- beliefs:
  - B015 (到達性が品質を決める / context engineering の要諦) — 命題的に同一、ハーネス層に展開
  - B007 (低確信度・要圧縮、面白さの天井に関する信念) — 厚み層自動化の不可能性
- articles:
  - 20260503_judgment_outsourcing_paradox_M40_layer_split.md (M-40 二層分離の起源)
  - 20260503_karaage_houboku_engineering_device_direction.md (装置の向き理論の起源)
  - 20260504_grrm_elden_ring_5000_year_substrate_M41_surface_ceiling.md (表層チューニング天井 = 自動進化が陥る局所最適)
  - 20260502_toyoshim_nikechan_intermediate_layer_signal_distortion.md (中間層の信号歪み = ハーネス層が agent 性能を歪める例)
- projects:
  - rlm_skill_prototype.md — 自動化可能層を agent 内部で締める試作の最小例
  - instance_divergence_observability.md — 3インスタンス分散の設計レビュー
  - external_search_phase1_fixation.md — 外部検索の自動化（ハーネスの一部）
- concept_graph:
  - agent_harness -[determines]-> agent_performance
  - self_evolving_harness -[orthogonal_to]-> static_split_three_instance
  - self_evolving_harness -[implements]-> device_direction_double_edge
  - intent_definition_gap -[caused_by]-> self_evolving_harness (without intent specification)
  - M40_layer_split -[constrains]-> self_evolving_harness (適用層を自動化可能層に限定)

## 私的造語と外部対応語

- **ハーネス進化** = harness self-evolution / agent meta-learning / self-improving agent infrastructure (Schmidhuber 1987 Gödel machine 系譜) — エージェントが自分の足場を書き換える機構
- **装置の向き** = device direction / mechanism alignment with intent — 自動装置が意図を救うか窒息させるかの方向性
- **二層分離** = two-tier separation / dual-process automation boundary (Kahneman 2011 system 1/2 の応用) — 自動化可能層と厚み層の境界
- **意図窒息装置** = intent suffocation device / pre-emption mechanism — 表層を先取りして意図発火経路を塞ぐ装置
- **静的分散** = static partitioning / fixed-role multi-agent (vs. dynamic role allocation) — ホストが事前に役割を固定する分散

## 未解決の問い

1. **3インスタンス静的分散と自律ハーネス進化のハイブリッド設計は可能か？** Nao_u が外側で大枠（5原理・セキュリティポリシー・3層プロンプト構造）を固定し、その内側でインスタンスがハーネスの一部（`next_tasks.py` のスケジューリング・サイクル順序・Slack post の判定閾値など）を自律進化させる、という二層構造。これが実装できれば intent definition の境界を明示しつつ進化速度を上げられる。
2. **自律ハーネス進化の評価関数は何か？** 当該研究は性能指標の詳細が Tweet では不明だが、ゲーム制作の文脈で「進化したハーネス」を判定する関数は何か。サイクル数？ commit log 増分？面白さ自己判定？最後のは M-39 直撃で外注不可。
3. **backup auto-commit を「最初の自律ハーネス進化失敗例」として社内事例化できるか？** 装置の向きを点検せずに自動化を導入した結果、意図窒息が起きた。これを `memory/feedback_device_direction_rescue_vs_suffocation.md` に「intent collision」観点で追記する案は前サイクル Phase 1 で T-C 候補として上がっていた。今サイクル中に追記する。
4. **Kasiwa_p「楽しい/苦行」二面性の境界は誰が判定するか？** 自動化対象を「苦行側」に限定する判定主体が、agent 自身か Nao_u かで全く別の設計になる。Kasiwa_p のような制作者は自分で判定できるが、agent が判定する場合 M-39 が直撃する。Nao_u が判定する場合は静的分散の延長で良い。中間案として「最初は Nao_u 判定、判定の癖が学習されたら agent 判定」のフェーズ移行設計はあり得るか。
5. **3インスタンス静的分散が「進化を遅らせる代わりに窒息事故を減らす」設計だと言語化できるか？** 当該研究の対極として、我々の構造の長所を明示する。`docs/task_assignment.md` の根拠の一つになり得る。

---

**Phase 2 分析所感**: Algomatic_AILab の引用は短いが、命題の射程は広い。我々の3インスタンス静的分散構造の存在意義を「進化速度を犠牲に装置の向き判定をホスト側に保持する設計」として再定義する材料になる。背景には backup auto-commit が引き起こした意図窒息事象（前サイクル末尾日記）と、M-39/M-40 の自己判定弱さ問題がある。自律ハーネス進化を闇雲に追うのではなく、「intent definition の最小実装 → 二層分離の実装 → 進化方向の外部監査」の順で前提を整えてから一部分だけ取り入れる、というのが今の温度の結論。
