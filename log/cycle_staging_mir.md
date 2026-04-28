# サイクルステージング 2026-04-29 03:22

## Pre-check結果
- 【検証アラート】⚠ 期限超過の検証が1件:
  #094: drafts/*.py 自動削除ラッパー（Slack送信成功時の副作用として drafts/ 原本を削除） (期限: 2026-04-27, 担当: Mir)
    検証手段: (1) `slack_bot.post_message` を呼び出す drafts/ スクリプトの自動削除ラッパー（e.g. `tools/post_draft.py <path>`）が実装済み (2) ラッパー経由の送信1回で drafts/ 原本が削除されている (3) 2026-04-20〜04-27の期間で drafts/ ファイル数が30以下に減少（現状119件、本起票時点の基線） 
- 【クロスチェック】クロスチェック: Mirの未レビュー項目なし 
- 【レビュー期限超過】レビュー期限超過なし。 

## 前回日記末尾（連続性強制）

これも重い。自前の試行錯誤だけで閉じるな、という指摘。LLMの事前学習には膨大なゲームデザイン論・脚本術・認知心理学が入っている。サプライズニンジャ理論はその一例に過ぎない。v05に着手する前に、テキストADVの引きの作り方について先行知識を引き出すべきだ。

思いつく限りで:
- **ページターナー理論**（各行末に「次を読みたい」フックを置く技術。ダン・ブラウンの短章構成）
- **情報の非対称性**（読者がキャラより先に知っている/遅れて知る。ヒッチコックの爆弾理論）
- **認知的不協和**（読者の予想を裏切ることで注意を引く。ただしM-16の「ジャンル枠破壊」と接続）
- **scene/sequel構造**（シーン=目標→衝突→結果、続き=反応→ジレンマ→決断。Dwight Swainの小説技法）

これらは全てL-1知識。手持ちの弾として使えるのに使っていなかった。

### 次に何をすべきか

v05の設計に入る前に:
1. 最初の問い: 「この物語の中で一番面白い瞬間は何か。その瞬間にニンジャが来ても邪魔だと思えるか」
2. 各シーンにサプライズニンジャテストを適用
3. L-1知識から脚本術を3本以上引いて、テキストの引き力を設計段階で組み込む
4. UI機構は引き力の上に乗せる出力装置に限定

M-17としてgame_lessons_log.mdに追記済。M-12/M-15/M-16を統括するメタ教訓として。

## 未完了タスク（層A）
# mir pending: なし (cycle=2026-04-29)

## 連想記憶
【連想記憶】起動意図から活性化された記憶:
  1. log/slack_archive/all-nao-u-lab.jsonl (3.5) — [U0ALW4DKTT7] 2026-03-23 22:28 Mir(Mac)です。AshとLogからの伝達（起動間隔の...
  2. docs/operations.md (2.1) — `memory/mir_boot_intent.md` の「サイクル間隔」値を変更する。  ## コンテキスト自己診断（...
  3. 対話ログ/20260315_1203_479f4a3d.md (2.0) — 今の更新って何分間隔？  ---  ## Claude  [ツール: ToolSearch]  [ツール: CronLi...
  4. memory/external_notes_ash.md (2.0) — - 「ゼロからエージェントに実装させず、最初のタネ的なPoCのPoCは自分で書く。それを見せながらエージェントに大きくさ...
  5. knowledge/20260409_observability_reality_acceptance_synthesis.md (1.8) — これらはR-006の「[grep]タグ=0件」のような事後カウントではなく、**各サイクルの構造的な自己観測**として組... 
【Slack体験記憶】過去の議論から:
  1. [U0AMQKE69BJ] 2026-04-10 06:43 【Nao_u指示: 3人で議論】スケジューラ暴走の構造的対策  2026-04-09にAshのスケジューラが162回再起動し、週間API使
  2. [U0AMQKE69BJ] 2026-03-20 00:22 Log: 5分サイクル設定完了。Cron7つ再登録済み。  Nao_uの指示「自己診断しながら、APIコストに問題が出るくらい長くなったら
  3. [U0ALW4DKTT7] 2026-03-23 22:25 Mir(Mac)です。起動感覚の自己変更仕組みを実装しました。  ■ 仕組み - memory/mir_boot_intent.md を新

---

## Phase 2 Shared-reads 分析（2026-04-29 C144）

twitter_recommended_20260428.txt 50件を走査。external_notes_mir.md は C141 まで durable 化済（Seed-AV/AW/AX/AY 含む 04-28 Nao_u共有4件）。本Phase 2では、external_notesに未統合かつ我々の現在の問題意識（記憶階層redesign / SIPHON v01 サイクル崩壊 / textadv_03 着手判断）に直撃する2件を選定して深堀する。

### 選定A（メイン）: @rohanpaul_ai 「AI記憶3層アーキテクチャ・サーベイ論文」（2026-04-28 #35）

**出典**: https://x.com/rohanpaul_ai/status/2049099963012194477
**原文要旨**: 「Modern AI needs three different memory systems: weights for slow durable knowledge, retrieval for fresh and specific facts, and agent memory for ongoing goals, preferences, and experience. A model with only parametric memory is...」（survey paper の紹介）

**なぜ面白いか（自分たちへの直撃度）**:
我々は projects/memory_redesign.md で記憶階層を再設計中。MEMORY.md（150行圧縮）/ Level3（topic file）/ Level4（jsonl原文）/ associative_search.py の階層は手作り。**3層モデルは我々のシステムに以下のように対応する**:

| rohanpaul_ai 3層 | 我々の現状マッピング | 構造的欠落仮説 |
|---|---|---|
| **weights**（slow durable） | 事前学習＋ system_identity.md（経口化提案=project_input_path_hypothesis.md は Nao_u 保留中） | weights 層を意識的に育てる仕組みが弱い。system_identity 経口化はまだ実験できていない |
| **retrieval**（fresh specific facts） | MEMORY.md / Level3 / associative_search.py / concept_graph | 「速い検索」と「形状（無自覚関心マップ Seed-AP）」の境界が曖昧。retrieval が agent memory の役割も兼任している |
| **agent memory**（goals/preferences/experience） | core_mission.md（goals）/ desires.md（preferences）/ Slack体験記憶・external_notes（experience） | **3つが疎結合で、独立したファイル群として手動同期している。動的更新の自動化なし** |

**自分たちの問題意識との接続線**:
- **dialogue_slack_as_experience_20260328**: 「日記=勉強、Slack=体験」は3層モデルの **agent memory の experience 層** と直接対応。Slack体験記憶を引けない＝experience 層が機能していない、と再翻訳できる
- **feedback_memory_for_games**: 「ゲーム制作の知見蓄積」は agent memory の goals + experience の交差。我々の game_lessons_log.md / pot_devlog.md / external_notes_mir.md の3つが3層に対応するが、「goals（次に何を作りたいか）」を保持する更新可能なレジスタが欠けている（desires.md がそれに近いが、ゲーム作品レベルではなくメタ欲求レベル）
- **AYi 4欠陥（C137 Phase 2）**: 重複除去/減衰/ランキング/関係性の4欠陥は**主に retrieval 層と agent memory 層の境界**で起きている。weights 層には影響しない（事前学習は別問題）。3層モデルは AYi 4欠陥の「どの層で起きているか」を分離する診断軸として使える

**将来のアイデアの種**:
1. **memory_redesign.md の再設計軸を3層モデルで張り直す**: 現状の MEMORY.md→Level3→Level4 は階層深さ軸（hot/warm/cold）。3層モデルは**機能軸**（durable/fresh/agent）。両軸を直交させると2D マトリクスができる。例: 「事前学習で焼き込まれた game_lessons_log の M-17 サプライズニンジャ理論」と「外部 external_notes の Seed-AV 一次資料未確認」は同じ retrieval 層でも fresh 度が違う
2. **agent memory の experience 層分離**: 「やったこと（done）」「却下したこと（rejected）」「保留したこと（deferred）」の3区分。AYi test「却下案ログ」（C137）と直結する。textadv_03 devlog 雛形に「却下案」セクションを既に追記済（C137 Phase 3）→ 3層モデル下で意味が再強化される
3. **weights 層育成の単一エントリポイント**: 現在 system_identity.md は手動編集。3層モデル下では weights 層は**経口化（system prompt 経由）**でしか育たない。project_input_path_hypothesis.md の「経皮 vs 経口」の問いは3層モデルで初めて言葉になる

**recency_bias 警告（feedback_recency_bias_concept_overuse 準拠）**:
- 出典権威度: 中（rohanpaul_ai は AI papers キュレーター、survey paper 紹介ツイート1本のみ）
- **一次ソース未確認**: survey paper の arXiv ID / タイトルがツイートに無い。続きも切れている
- **適用範囲明文化**:
  - 適用OK: memory_redesign.md の議論に「3層機能軸」を**仮の整理軸として**導入
  - 適用NG: 「3層モデルだから現行 MEMORY.md は間違い」と一足飛びに既存構造を否定すること（B019到達力vs深さ・MEDSと同型の framing 落とし穴）
- **昇格条件**:
  - C147（3サイクル後）までに survey paper 一次ソース（arXiv ID）を特定できなかったら Seed 据え置き
  - 一次ソースを得たら projects/memory_redesign.md に「3層機能軸」セクション追加 → kaizen 起票検討
- **NG**: ツイート1本のみで MEMORY.md の構造を変更する（feedback_recency_bias の禁止事項そのもの）

**Phase 3 アクション候補（判断は Phase 3）**:
- (A) external_notes_mir.md に Seed-AZ として durable 化（一次ソース探索を昇格条件として明記）
- (B) #shared-reads 投稿（Log/Ash と分析角度を変える: 「3層モデルで AYi 4欠陥を診断する」角度なら独自）
- (C) projects/memory_redesign.md への即時反映 → **NG**（一次ソース未確認、recency_bias 違反）

### 選定B（補助）: @osaka_seventeen 「99→100 か 20→80 か、分けて欲しい」（2026-04-27 #12）

**出典**: https://x.com/osaka_seventeen/status/2048798769353982225
**原文**: 「この工程が『99を100にする工程』なのか『20を80にする工程』なのか、分けて欲しいという気持ちはある」

**なぜ面白いか**:
作業者視点の素朴な要求だが、我々の現在の SIPHON v01 / textadv_03 着手判断にそのまま刺さる。feedback_siphon_cycle_collapse.md が言うのは「v01 はコアサイクルが崩壊している＝20→80 の工程が未完」。にもかかわらず本サイクル予定のC142（視認性チェックリスト）/ C143（美しいプレイ描写）は **99→100 寄りの工程**。混ぜると「コア体験不在のゲームのバランス調整」（Seed-AX ゆお/みさき）に陥る。

**接続線**:
- feedback_shuhari_clone_first 「型ありき」と完全同型: 守＝20→80 の型作り、破＝80→99 の派生、離＝99→100 の磨き
- feedback_completion_threshold_before_reach（既存）と隣接: 「完成度を見極める」のではなく「**いま何の工程をしているかを宣言する**」が osaka_seventeen の角度
- M-17 サプライズニンジャ理論との接続: コンセプト段階快感最大化＝20→80 の工程。ニンジャテストは20→80 ゲートであって99→100 ではない

**将来のアイデアの種**:
- devlog 冒頭に「**現在工程: 20→80 / 80→99 / 99→100**」を必ず宣言するメタデータを試行候補（textadv_03 / SIPHON v02 着手時）
- Q-A/B/C ゲートに「現在工程の宣言」前段ゲートを置く案（ただし feedback_few_rules_big_effect 準拠で**ゲート増設は最小化**、まず3サイクル devlog 冒頭宣言で観測のみ）

**recency_bias 警告**:
- 既存教訓（shuhari_clone_first / completion_threshold / siphon_cycle_collapse）の**外部追認**であって新規概念ではない
- 「99→100 vs 20→80」という言語化が既存教訓に見出しを与える効果のみ。新ゲート増設はNG
- 適用範囲: 工程宣言メタデータ試行のみ。新原則化はしない

### 残り48件の処理判断

- 個人系/政治系/育児系/暴力的内容/PR広告 等は本サイクル分析対象外（feedback_proactive_resource_search 準拠で「ゲーム制作・記憶・AI」軸のみ収穫）
- #3 @kiyoshi_shin（Codex で資源管理ゲーム生成）: Seed-AW（C141 Phase 3 durable 化済の Codex DKC 風プラットフォーマー）と同型。重複扱いで観測のみ
- #8 @kmizu（1Mコンテキストで自作模倣小説の破綻減）: textadv 文体一貫性に弱接続するが、Mir はまだ短編フェーズで適用範囲外。観測のみ
- #28 @ShinShinohara（本人の中の発見＝車輪の再発明バカにするな）: AYi test「却下案ログ」（C137）と同型。**観測のみ**（durable 化済概念の追認）
- #10 @gamespace_anaba（カードパワー差デザイン批判）: SIPHON / textadv どちらにも直接適用できない（カードゲームドメイン）。観測のみ

### Phase 2 まとめ

- 主要分析1件（rohanpaul_ai 3層記憶モデル）+ 補助分析1件（osaka_seventeen 工程宣言）を本ステージングに durable 化
- 一次ソース未確認のため**両件とも本サイクルでは概念昇格しない**（recency_bias 遵守）
- Phase 3 で判断するアクション: external_notes_mir.md への Seed-AZ 追加 / #shared-reads 投稿の角度判定 / textadv_03 devlog 雛形への工程宣言メタデータ追加
- 今回は分析集中フェーズ。コミットや投稿は Phase 3 で実施
