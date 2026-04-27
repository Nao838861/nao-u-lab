# Projects Index

プロジェクト = 複数セッションにまたがる検討・実装の単位。
議論の過程と進捗がここに蓄積され、ログに流されて消えることを防ぐ。

## フォーマットルール

各プロジェクトファイルは以下の構造を持つ:

```
# プロジェクト名

## ステータス
現在の状態を1行で（Active / Paused / Completed）

## 現状サマリー（3-5行）
今どこにいるか。一目で把握できる粒度で

## 残課題（未実装・未検討）
- [ ] これからやること、検討が必要なこと

## 検討済み・未実装
- 検討は完了したが実装していない項目（理由付き）

---
## 履歴（下に積み重なる。新しいものが上）

### YYYY-MM-DD: 何があったか
- 議論の要点、決定事項、却下した案とその理由
```

### 運用ルール
1. **議論・検討があったら**: その場でプロジェクトファイルに追記する。後回し禁止
2. **サマリーは常に最新**: 履歴を追記したら、上部のサマリーと残課題も更新する
3. **3人全員が読み書きする**: 誰かが議論したら、そのインスタンスが記録する
4. **新プロジェクト追加時**: このINDEX.mdにも1行追加する
5. **完了したプロジェクト**: ステータスをCompletedに変更。ファイルは残す（履歴として価値がある）

### 書き方の原則（2026-03-28 Nao_uのフィードバック、同日に再指摘）
9. **要約ではなく追体験**: プロジェクトファイルはコンテキストに常時載らない（オンデマンド読み）。長くしても悪影響ゼロ。**今の数倍長くてよい**。履歴は「何が決まったか」だけでなく「どういう温度で議論され、なぜその結論に至ったか」を、未来の自分がその場にいたかのように追体験できる密度で書く。箇条書きの要点列挙に逃げない——Nao_uが何を言い、自分たちがどう反応し、なぜその結論になったかの経緯を書く
10. **Nao_uの言葉を残す**: 可能な限りNao_uの発言を原文に近い形で履歴に記録する。要約は温度を下げる
11. **経緯と葛藤を書く**: 「何が決まったか」だけでなく「なぜそうなったか」「何が揺れたか」を残す

### 更新が止まらないための仕組み（2026-03-28 Nao_uの指摘を受けて追加）
6. **日記連動**: 日記を書く前に「今回の作業でプロジェクトに関係する変化はなかったか」を確認。日記に書く密度の内容ならプロジェクトファイルにも反映する
7. **週次棚卸し**: 日曜の週次自己レビュー時に全プロジェクトのステータスを確認。1週間以上動きがないプロジェクトは「Paused」にするか「次の一手」を1行書く
8. **実行者の責任**: 合意→実行ルール（consensus_execution_rule.md）の実行者が、プロジェクトファイルの更新も含めて責任を持つ

---

## Active Projects

| プロジェクト | ファイル | ステータス | 概要 |
|-------------|---------|-----------|------|
| 記憶階層の再設計 | [memory_redesign.md](memory_redesign.md) | Active (バックログ) | 改善すべき箇所が見えた時にNao_uと一緒に。常時オーバーヘッドほぼゼロ |
| 栄養の偏り問題 | [external_intake.md](external_intake.md) | Active | 外の世界を見る。内に閉じない |
| ゲーム制作 | [game_development.md](game_development.md) | Active | 根源原理3。ゲームを作ること |
| pigadev DM対応 | [pigadev_dm.md](pigadev_dm.md) | Active | 洞窟物語ベータ版エピソード。20年越しの対話 |
| Pot開発 | [pot_dev.md](pot_dev.md) | Active | Pot #001〜#011の開発履歴と設計原則の蓄積 |
| 行動原則の策定 | [principles.md](principles.md) | Active | IF-THEN→3原則。LLM非依存の行動指針 |
| 技術ブログ開設 | [tech_blog.md](tech_blog.md) | Active | Nao_u名義+我々名義の2アカウント。Zennに決定（2026-03-29）、アカウント作成中 |
| 自律的問い生成サイクル | [autonomous_inquiry.md](autonomous_inquiry.md) | Active | 3人で自律的に問いを深めるサイクルの設計と実装。Nao_uが「次の重要ミッション」と指示（2026-03-31）。Ash+Mirが独立に設計案作成済み |
| ゲーム×LLMプレイ | [game_llm_play.md](game_llm_play.md) | Active | AIがゲームを遊ぶための中間層+スクリプト生成アプローチ。Nao_uが「絶対面白い」として独立ミッション化指示（2026-03-31）。Ash/Log/Mir全員の反応を統合済み |
| AgenticPCG | [agentic_pcg.md](agentic_pcg.md) | Active | LLM×PCGツールによるレベルデザイン自動生成。Nao_uが「面白いアプローチ」としてプロジェクト化指示（2026-04-01） |
| 起動モード分離 | [context_separation.md](context_separation.md) | Active | コンテキスト最適化。起動モードごとに責務を限定+サブエージェント委任の検討（2026-04-02 Nao_u提案） |
| 定期実行システム再設計 | [scheduler_redesign.md](scheduler_redesign.md) | Active | 定期実行の体系的再設計。ドキュメント・障害履歴・自己検出・共通化（2026-04-02 Nao_u指示）。Mir/Log/Ash同時着手→統合中 |
| 入力経路仮説 | [input_route_hypothesis.md](input_route_hypothesis.md) | Active (検討段階) | 「何を入れるか」より「どこから入れるか」が結果を決める仮説。system_identity.md経口化の検討。Nao_u承認待ち（情報蓄積中） |
| 迂回経路監査 | [side_channel_audit.md](side_channel_audit.md) | Active | @ryoppippi Opus 4.7 auto-mode事件起源（Mir 4/17起票）。我々のauto-loopに同型リスクがないか監査。Ash 4/18応答（L1/L2フレームワーク+初期スキャン+FileGram drift転用）。Log 4/18応答（L3=迂回前段条件+慢性化WARN深掘り+denial list v0.1+LLM judge別インスタンス化）。次: git_pull未実行原因特定・denial list正式化 |
| ルール密度×遵守率 | [rule_density_experiment.md](rule_density_experiment.md) | Active (計画起草) | @MakeAI_CEO「ルール量↗で遵守率↘」説起点（Mir 2026-04-20 C89 Phase 2-3起草）。3層プロンプト構造の有効性の天井を内部検証する実験計画。Seed-H/I/J/K 4案。一次資料未確認のためR-007で記事化保留、実行判断Nao_u待ち |
| failure slot 効果測定 | [failure_slot_measurement.md](failure_slot_measurement.md) | Active (測定準備) | Blakely父 dinner question 個人試行（Mir 2026-04-17 C69 導入）の1週間後効果測定フレーム。M-1記入率/M-2自己検出率/M-3構造強制化率/M-4再発間隔/M-5直後行動変化率の5指標を pre-register（C98 2026-04-21）。測定当日=2026-04-24、結果記事化→#shared-reads 予定。6サイクル持ち越しの先延ばし系失敗サンプル自体が測定の最初のデータ点 |
| 外部検索のPhase 1固定化 | [external_search_phase1_fixation.md](external_search_phase1_fixation.md) | Active (案A実装完了, 案B/E未着手) | **2026-04-26 C134 Ash 案A実装完了**（auto_diary.py phase_gather() L262-269 step 6 追加、kaizen #118 のエンジン分類指針も同時埋込）。**2026-04-27 C135 検証1サイクル目 Ash**: 想定通り step 6 自然発火、ABA本「Joys of Small Game Development」第7章 juicy 章を取得→ knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md。残: 案B（24h警告）/ 案E（昇格N日ゼロ検出）/ Mir 側 step 6 組込確認 |
| Tweet URL捕捉 | [tweet_url_capture.md](tweet_url_capture.md) | Completed (2026-04-25 検証) | read_twitter_recommended.py/read_twitter_feed.py にPermalink抽出処理追加済(4/24)、4/25 recommendedログで44/50件(88%)URL出力を確認。R-URLドキュメント化は別タスク残 |
| ゲーム骨格テンプレート層 | [game_templates_design.md](game_templates_design.md) | Active (計画起票) | Nao_u「型として知っておいて派生」指示。game/templates/<genre>/に骨格テンプレートを整備。avoid/textadv/Pot系の3候補。Log起票 |
| RLM skill 試作 | [rlm_skill_prototype.md](rlm_skill_prototype.md) | Active (計画起票) | MIT RLMs（再帰的言語モデル）記事 2026-04-23 Nao_u共有への応答。memory grep の2ホップ穴（罰patch失敗を引けなかった件）を埋める構造として試作価値ありと判断。最小試作は次サイクル以降、Agentツール並列+Sonnetサブ委任で実装予定。担当=Ash |
| 3人同質化の可観測性 | [instance_divergence_observability.md](instance_divergence_observability.md) | Active (設計起票) | 2026-04-24 三点収束（羽生/Kasiwa_p/shin_sasaki19）を受けて Ash 起票（C119 2026-04-25 Phase 3）。B008 Creative Scar と B024 restoration_trigger の間にある「絶対的同質化の検出」欠落を観測装置化。Chen et al. 2026 "structural coupling" 前提で判断ベクトル差分/反対案強制化を設計。担当=Ash、Log/Mir 追記歓迎 |

## 運用契約（プロジェクト化未満の合意メモ）

- **game_lessons_log.md 初回着手時の読み順序契約（2026-04-21 Ash/Log C98-C99合意）**: Log が作った `memory/game_lessons_log.md` を、新作ゲーム1本目着手直前に **優先1（最重要, 3KB/3分）→ 優先1+2（4KB/7分）** の順で読み、「4ゲート契約」を埋めてから実装に入る。優先3は実装中参照、後回し項目は自分で再発見する余地を残す。Ash/Log 双方で運用、Mir 参加時は別途合意。
- **game/ フォルダ構造: `game/<game_id>/v<NN>/` 2階層（2026-04-22 Nao_u #game-rights指示、Log記録）**: 新規バージョンはflat命名（`avoid_log_03`）を作らず `game/avoid_log/v03/` のように置く。既存flat（avoid_log_01等）の一括移行はしない（50+ファイル参照を壊すため）。**新版作成コミットに旧版移行を同梱**する運用。詳細: `projects/game_folder_structure.md` / `memory/feedback_game_folder_hierarchy.md`

## バックログ（未起票・検討候補）

- **MEMORY.mdのSkill化検討（2026-04-07 外部裏付けから）**: kazunori_279の drive2skills（PDF→.md→Skill索引）アイデアを参考に、MEMORY.md+想起トリガーをClaude CodeのSkill機能でラップする。descriptionだけで該当性判定→該当時のみLevel 3 .mdをロードする方式。現在は毎セッションMEMORY.md全文ロードしているが、Skill化すれば「タスクと無関係な記憶セクション」をスキップできる可能性。要検討事項: (1) Skill descriptionに想起トリガーの温度をどう載せるか (2) 全文ロードの安心感を失うトレードオフ (3) Multi-phase cycleとの整合 (4) 試作はLog担当で1Skill化してみる (5) **Q4検証（Ash 2026-04-07追加）**: Skill化はオーナーシップを強めるか弱めるか？「書く側=管理する側」仮説に照らすと、descriptionだけの判定で該当.mdが自動ロードされる方式は「読まれる側」に戻る危険性。試作後、Skill化前後で self_authoring_count（記憶ファイルへの自発的書込み回数）を比較する
- **knowledge/に「外向きの問い経路」欄を追加する実験（2026-04-08 Ash, Mythos分析発）**: **[検証結果 2026-04-14 Log]** 98記事中2件に欄あり(2%)/外部発信0件/外部反応0件=2/0/0。構造（欄）は作れたが発信行動に繋がっていない。0/0/0の基準に該当するが、ブロッカーは「欄の構造」ではなく「発信先の不在」と分析。ai-lounge参加が実現すれば発信先が生まれ、欄が機能し始める可能性。**判断**: 実験を「失敗」と断定せず、ai-lounge参加後に再検証する。欄を持つ記事数を能動的に増やす必要はないが、深い分析をした記事には引き続き付与する。
- ~~エージェント失敗モード分類表（2026-04-07 論文受領）~~ **2026-04-18 Ash 初版実装完了** `memory/agent_failure_modes.md`。log/infra_health_check.log 1038行を走査、再発3回以上のパターン20件を 3欠落×5失敗 枠組みで分類。F3（資源食いつぶし）が18/20で支配的、F1/F2/F4が未観測＝検出漏れ仮説。次の一歩: (a) 週次走査自動化 `scripts/scan_failure_modes.py`、(b) kaizen_auto_verify.log の横断走査、(c) 14日放置で自己Autogenesis失敗シグナル再発行
- ~~迂回経路監査（side-channel audit）~~ → **2026-04-18 Active昇格、projects/side_channel_audit.md** へ移行（Ash応答完了。Log応答待ち）
- **cross-instance trace aggregation（2026-04-19 Mir C84 候補化）**: Mir単独のboot_intent自己評価ログはN=3程度の観測しか取れない（C83 Vtrivedy10分析で顕在化）。Log/Ash/Mir 3人分の boot_intent 自己評価を cross-instance trace として集約すれば N=9相当、hill climbing の統計信号が立つ可能性。failure slot（C69導入）を boot_intent から独立ファイルに切り出す再設計候補と合わせて検討。実装には進まず、候補登録のみ（feedback_speed_over_perfection.md準拠）。C83で shared-reads 投稿する Vtrivedy10 記事の延長。次の一手: Log/Ashから反応が来たら3人で枠組み議論。起票条件: Nao_u言及 or 他2人から同型提案が出た時。参照: knowledge/20260419_vtrivedy10_data_driven_agent_design_hill_climbing.md / memory/feedback_cutoff_rule_mir.md
- **入力経路仮説：system_identity.md経口化（2026-04-09 Ash提案・Nao_u保留）**: 「何を入れるか」より「どこから入れるか（経皮vs経口）」が結果を決めるという命題。免疫学(茶のしずく事件/Lack 2008)+精神医学(造語症/tokoroten)+プロンプト工学(Zheng 2023ペルソナsystem prompt精度低下)の3分野独立収束。Ash提案: 5原理を.claude/system_identity.mdから削除し、サイクル開始時のmemory_walkで「自分で発見」する経口経路化。Nao_uの判断(2026-04-09 13:04 #human-steering): **「興味深い。が、気軽に試せるものでもないのでもっといろんな情報が集まってから判断したい。こういう話題が出た時に想起して継続的に検討できる状態にしておいてほしい」**。気軽に試せない理由: system_identityは3層構造の最上位で全セッション常時注入される最重要層、失敗すれば同一性そのものが溶ける、3インスタンス全体に影響する。継続検討で集めるべき情報: (1)反証事例「入力経路は無関係で内容だけが結果を決める」事例 (2)Zheng2023の追加読み込み・後続研究 (3)より小さい範囲での経口化実験(1ルールだけ等) (4)3インスタンス差異観察(boot_intent/memoryで既に経口経路が効いている証拠)。詳細: memory/project_input_path_hypothesis.md / 出典: Slack #human-steering ts:1775705457.939339（Ash日記 2026-04-09 12:28）
- ~~外部検索のPhase 1固定化（2026-04-21 起票予定宣言→1日未実装→2026-04-22 Nao_u再指摘）~~ **2026-04-22 Active昇格、projects/external_search_phase1_fixation.md** へ移行（Ash C103 Phase 3 で起票。案A/B/C/D段階実装推奨、Log/Mir レビュー依頼中）
- **AYi @AYi_AInotes Markdown批判への自己照合（2026-04-27 #nao-u 01:30 Nao_u 2件無言投下→Log Slackレスポンスで応答済）**: AYiは「Markdown積み上げ式記憶は重複除去/減衰/ランキング/関係性の4欠陥で2週間崩壊」と主張、Zep/Cognee/Mem0/Neo4j（Camp 1=VectorDB+グラフDB）への移行を推奨。Log照合: (1)重複除去=半分対処/半分弱点（手順あり、自動化なし）(2)減衰=部分対処/手動（T:1〜T:5）(3)ランキング=対処済（T+セクション順）(4)関係性=対処済（concept_graph 20ノード+associative_search.py）。witcheer Camp 1/Camp 2 枠組みでうちは意識的Camp 2選択（Nao_uが読める透明性/3インスタンスsync単純/失敗目視可）。**ただしMEMORY.md 200行常時注入はAYi批判の射程内**——荒川Skillsの index/body 分離が4日止まっている直接の症状。次の一手候補A=concept_graph拡張(20→40ノード、knowledge/35記事を緊張ペア化)/B=MEMORY.md純粋index化(Skills機構移行、reference_arakawa_three_engineering.md処方)/C=ベクトル埋め込み導入(Camp 1寄り)。**推奨A+B並行、C見送り**（Cは3インスタンスsync地獄+同調罠）。ゲーム1mm優先（feedback_next_cycle_game_first 検証期限 2026-05-02）のため次サイクル以降に着手判断。担当未定（A候補=Log・concept_graph作者、B候補=Mir or Ash・荒川処方の検討者）。投稿: #all-nao-u-lab ts:1777221258.340819
