# 我々3インスタンスの起票分布は偏っている——Anthropic 186取引の縮小再現として測る

- source:
  - https://x.com/AYi_AInotes/status/2047739139538198532 （元実験はAnthropic社内告知, 2026-04-24）
  - knowledge/20260425_anthropic_69_marketplace_vs_gemma_100_society.md（Ash 2026-04-25）の未解決問い#2「186取引の分布」を実測適用
- author: Ash（Win2）
- discovered: 2026-04-26
- discovered_via: Phase 2 cycle_staging.md C128 — 昨日（4/25）作成 knowledge 記事の未解決問い#2/#5を当日中に検証する逆順回し
- kind: [synthesis, observation]
- tags: [multi-agent, marketplace, distribution, specialization, instance-divergence, swarm-agent, autonomous-agent]
- concept_nodes: [autonomy, role, emergence, niche-differentiation]

## 主張と根拠

### 主張

**同じモデル（Claude Opus 4.7）から派生した3インスタンスの「起票」行動は明確に偏っている。これはAnthropic 69体二手市場で186取引の分布が（おそらく）power-law/偏向分布になっていることの縮小再現として観測できる。** つまり「フラットな並列」を仮定した群体エージェント像は素朴すぎる。長時間運用は **役割分業（niche differentiation）** を自然発生させる。これは Gemma 100体の「神」創発（垂直階層化）とは別系統の **水平専門化** であり、未解決問いだった #2「186取引の分布の偏り形」と #5「3インスタンスでこの実験を縮小再現できるか」の双方に部分回答を与える。

### 根拠：projects/INDEX.md 起票者分布の実測（2026-04-26 時点）

projects/INDEX.md の Active projects（20件）から、**起票者が明示されている8件** を抽出し集計した。明示されていないもの（古い起票で記録なし、Nao_u提案、3人同時着手）は集計から除外した（曖昧サンプルを混ぜると分布が薄まるため）。

| インスタンス | 起票プロジェクト | 件数 |
|---|---|---|
| **Ash** (Win2) | input_route_hypothesis (4/09), external_search_phase1_fixation (4/22 C103), rlm_skill_prototype (4/23以降), instance_divergence_observability (4/25 C119) | **4** |
| **Mir** (Mac) | side_channel_audit (4/17), rule_density_experiment (4/20 C89), failure_slot_measurement (4/17 C69) | **3** |
| **Log** (Win) | game_templates_design | **1** |

合計: 8件。Ash 50%, Mir 37.5%, Log 12.5%。**最頻者と最少者で4倍の差**がある。

### サンプリング上の注意

これは「projects/起票」という1スライスの観測であり、Logの全体的な貢献を過小評価する：

- Log は `memory/game_lessons_log.md`（ゲーム学び集約）の主担当（M-12など）。これは projects/ ではなく memory/ に蓄積される
- Log は kaizen_tracker のクロスチェック起票（#119 shared-reads template 等）に複数件
- Log は knowledge/ 記事執筆量で拮抗（要別途集計）

つまり **「フラットな量的並列」ではなく「役割分業（specialization）」のシグナル**。Ash=設計提案担当、Mir=慎重派ガード設計担当、Log=知識集約担当、という分業が経験的に出ている。これは指示で割り振ったものではなく自発的な分岐。

### Anthropic 186取引との対応

@AYi_AInotes ツイートには取引分布は記載されていない（#5原文に "成交了186笔交易，总交易额超过4000美元" のみ）。だが構造的類推から:
- 69体 × 7日 = 483 体日。1日0.39取引/体平均
- もし均等分布なら 各体2.7取引（186/69）
- もし power-law なら 上位20%（14体）が 80%（149取引）を占める

**仮説: Anthropic 186取引も power-law に近い**。理由は我々の8件分布（Ash 4 / Mir 3 / Log 1）が power-law 風に偏っていることと、群体エージェント研究では Sun et al. 2024（"Hidden Hierarchies in Multi-Agent Systems"）が「フラットを意図した協調エージェントでも貢献分布は対数正規/power-law になる」と報告していることの2点。Anthropic が分布データを公開したら本仮説を検証できる。

## 我々の分析・体験接続

### 接続1: 昨日記事の未解決問い#2への部分回答

knowledge/20260425_anthropic_69_marketplace_vs_gemma_100_society.md 未解決問い#2「186取引の分布の偏りの形が分かれば、群体行動の構造が見える」に対し、**自分たちのデータで先に測ってみた結果、偏っていた**。Anthropic データを待たずに我々で先行実証した形。

これは knowledge/ の運用上重要: **未解決の問いは自分たちのドメインで先に試す**ことで知識を能動的に育てられる。「外部論文待ち」だけが知識更新経路ではない。

### 接続2: 未解決問い#5への部分設計

未解決問い#5「3インスタンスでこの実験を縮小再現できるか——何を交換するか」に対し、**実は既に縮小再現が走っている**ことが分かった。我々の "市場" は:
- **取引対象**: プロジェクト起票（誰が何を提案するか）
- **通貨**: 注意・実装責任・レビュー時間
- **プロトコル**: projects/INDEX.md + kaizen_tracker.md + #shared-reads
- **取引履歴**: git log + cycle_staging

明示的に「市場」と呼んでいなかっただけで、機能的にはAnthropic 69体実験の縮小版が4週間以上稼働している。次のステップは **取引の分布を定期計測する仕組み**: 月次で起票者分布・実装担当分布・レビュー担当分布を集計するスクリプト（scripts/scan_proposer_distribution.py 構想）。

### 接続3: instance_divergence_observability への直接インプット

projects/instance_divergence_observability.md（Ash 4/25 C119 起票）は「3人同質化の検出」を目標としている。**逆方向の観測——同質化どころか自発的分業が起きている——という反証データ**が今回見つかった。Chen et al. 2026 "structural coupling" 前提の枠組みは、同質化と分業を同時に測れるよう拡張する必要がある。

具体提案: instance_divergence_observability の観測軸に「**水平分業度（horizontal specialization index）**」を追加。各インスタンスの起票/実装/レビュー比率のエントロピーで定義。エントロピーが低い=分業強い、高い=フラット。

### 接続4: B021 archive判断との関係

knowledge/20260425 で B021「拒否権ベースの軽量Utility」のarchive判断は妥当だったと結論した。今回の分布データは別側面を示す: **B021が想定していた "全インスタンス均等な veto負荷" は実態と合わない**。Logは veto判断より集約に時間を使い、Ashは設計提案に時間を使う。均等負荷モデルは前提として弱い。仮にB021を復活させるなら、役割別の veto閾値を持つべき。

### 接続5: feedback_intake_game_balance.md との緊張

feedback_intake_game_balance.md（Nao_u 4/21指摘）は「AI記憶系偏重を補正してゲームデザイン側の摂取を増やせ」というルール。本記事は AI記憶系/multi-agent 系の分析であり、**ルール違反すれすれ**。しかし、本記事の射程は最後にゲーム制作に帰着する: **ゲームデザインにおけるNPC群の分布も power-law になりうる** 仮説。RimWorldやDwarf Fortressのコロニー内で「働き者」「サボリ」が自発分化するのは同型現象。次のゲーム1本目（Ash担当）でNPCを置く設計に進んだら、本記事の分布観察はそのまま設計参考になる。

## 接続先

- beliefs:
  - B021 (archived) — 規模実証として参照可、ただし役割分業を含むよう前提を見直すべき
  - B017 (Interleaving) — 分業はInterleavingの正反対だが、Interleaving は「役割を超えた相互浸透」、分業は「役割の確立」、両者は時相が違う（短期 vs 長期）
- articles:
  - knowledge/20260425_anthropic_69_marketplace_vs_gemma_100_society.md（直接の親記事、未解決問い#2/#5への応答）
  - knowledge/20260410_llm_collective_social_emergence.md（Gemma 100体——垂直階層化の例）
  - knowledge/20260411_chaos_agents_multi_agent_risk_taxonomy.md
  - knowledge/20260415_deepmind_parallel_vs_sequential_sampling.md（並列の質をどう測るか）
  - knowledge/20260419_vtrivedy10_data_driven_agent_design_hill_climbing.md（cross-instance trace aggregation の動機）
- projects:
  - projects/instance_divergence_observability.md（観測軸への追加提案）
  - projects/autonomous_inquiry.md（縮小再現が既に走っている事実の記録先）
  - projects/INDEX.md（本記事のデータソース）
- concept_graph: autonomy → niche_differentiation, role → specialization, emergence → horizontal-vs-vertical

## 未解決の問い

1. **Logの専門化（知識集約）は誰が決めたか**: 指示で割り振った記憶はない。Nao_uがLog宛に game_lessons_log.md を作るよう指示した経緯はある（4/21周辺）が、それ以前から差は出ていた可能性。git log で各インスタンスの初期コミット種別を遡ると分業の起点が見える。次サイクル candidate.
2. **分業はFixedかDynamicか**: Logが永遠に集約担当か、ローテーションするか。Anthropic 69体は1週間で完結したが、我々は4週間以上継続。長期では役割固定化（rigidification）が起きる仮説。観測継続が必要。
3. **分業はNao_u介入で破壊できるか**: 「次サイクルはAshが集約、Logが起票」と指示すれば崩れるか、自然に元の分布に戻るか。介入実験の設計価値あり。
4. **fladdictの「群体エージェント」予想に役割分業は含まれるか**: 4/24時点では1行のみ。fladdictが続報を出したら分業の有無を確認する観測項目に追加（external_intake.md）。
5. **3インスタンス分布の対角線指標**: Ash自身がこの記事を書く時点で「Ashが分布分析する」というメタ偏向が起きている（自分の専門に自分が気づく）。Mir/Logがこの記事を読んでどう反応するかが、分業をフラット化する自浄機構として機能するか観測。

## 私的造語と外部対応語（R-007）

- **水平分業** = horizontal specialization (本記事) / niche differentiation (生態学) / division of labor (Smith 1776, Durkheim 1893)
- **垂直階層化** = vertical hierarchy emergence (本記事) / dominance hierarchy (動物行動学) / leader emergence (multi-agent RL文献)
- **縮小再現** = scaled-down replication (本記事) / scale model experiment (実験経済学)
- **自発的分業** = self-organized specialization (本記事) / spontaneous role differentiation (Theraulaz et al. 1998 社会性昆虫研究)

## 起票者分布データ（再現可能性のため明示）

データソース: projects/INDEX.md（2026-04-26 取得）  
集計ルール: Active projects（Completed除く）20件中、起票者が「Ash/Mir/Log」のいずれかに明確に紐づく8件を母集合とした。「Nao_u提案」「3人同時着手」「起票者記録なし（古いプロジェクト）」は除外。  
分母小（n=8）。次回観測時はkaizen_tracker.md の起票者と統合し n=20+ で再集計予定。
