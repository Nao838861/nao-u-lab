---
name: パッチ累積整理プロジェクト
description: Nao_u 2026-05-02 05:17 #human-steering「トラブル毎にガードを増やしてパッチが累積、よくわからない状態」指摘を受けて、feedback/M-XX 群の重複統合と粒度整理を行う。次サイクル以降の実行計画。
type: project
---
# パッチ累積整理プロジェクト（2026-05-02 起票 / Ash）

## 受領した指摘（原文）
> Nao_u 2026-05-02 05:17 #human-steering — ash 名指し
> 「トラブル毎に細かいガードを増やし続けてパッチを当てるのを繰り返して、パッチが累積してよくわからないことになってない？トラブルが起きすぎてそれにパッチを当ててる現状、こちらも全く把握できていないので、問題を適切な粒度でいったん整理してほしい。」

> Nao_u 2026-05-02 05:39 #human-steering — ash 名指し（追加指摘）
> 「ashに指摘したのはそのレイヤーの話ではなく、『Ash 側からは「Phase 4 に〜執筆中止」ゲートを足す』みたいな構造。重複投稿を弾くのは本質ではなく、重複でAPIコストを使って文章を生成した事実のほうが問題だし、こちらの認識できていない細かいルールが積みあがっている気配がしているが、それらはゼロコストで乗っていて、副作用はないか？不要で認識しづらいルールが積みあがって、整理できないゴミの山になるのは、LLMに全てを任せたときに起きるわかりやすい問題だと思っている。」

## 05:39 指摘の核心（受け止め追補 / 2026-05-02 05:50 Ash）
- **末端ガード追加 = パッチ累積の典型**: post_message() に Phase 4「執筆中止」ゲートを足す思考自体が、Nao_u の指摘した構造そのもの
- **本丸は API コスト発生前**: 重複文を弾くのではなく、**重複文を生成する判断に至らない**よう上流（draft作成・diary起動・状況判定）を直すこと
- **認識されない暗黙ルール**: ハーネス/コード内に書かれた if 分岐・閾値・cooldown・skip などは、Nao_u から見えず、各インスタンスからも引きにくい。これがゼロコスト副作用込みで増殖している
- **副作用の例（仮説、要点検）**: 30分窓 dedup → 3時間サイクル auto_diary は素通り / 冒頭80字一致 → タイトル変更で素通り / クールダウン → 受信箱の指示が一度も Claude に届かない死角（実際 04:04 Nao_u 指示が 04:37/04:56 で素通り、05:00 まで未応答）
- **行動修正**: 新パッチ追加を停止 → 暗黙ルール棚卸し → 重複の実体を計測 → ルール統廃合と上流移行

## 受け止め
指摘の通り。最近1週間で feedback_*.md が約30件追加され、M-37〜M-41 が刻印された。各々は個別の事案に対する正しい反応だが、累積した結果、**同じ根の問題に複数の名前が付き、CLAUDE.md/MEMORY.md/game_lessons_log.md に二重三重に記述される**状態になっている。Nao_u から見て把握不能なら、自分（Ash/Log/Mir）からも引きにくい。

## 現状の数字（2026-05-02 05:30 時点）
- `memory/feedback_*.md` = **83件**
- 最近1週間（2026-04-25 以降）に追加された feedback ≈ **30件**
- `MEMORY.md` 根源（圧縮しない）= **15件**（2026-04-21〜2026-05-02 で15件まで増加）
- `CLAUDE.md`「絶対にやる」の M-番号刻印 = **M-38 / M-39 / M-40 / M-41**（直近1週間）
- `game_lessons_log.md` の M-XX = **M-10〜M-39（30件）**

## 明確な重複群（同根に複数ファイル）

### 群A：「クローンから始めろ／守破離の守」系（4ファイル）
- `feedback_shu_first_clone_baseline.md`
- `feedback_shuhari_clone_first.md`（M-35）
- `feedback_clone_first_then_arrange.md`（MEMORY.md 根源）
- `feedback_clone_base_selection_method.md`（MEMORY.md 根源）

### 群B：「先行事例調査／類似ゲーム調査」系（3ファイル）
- `feedback_prior_art_research.md`
- `feedback_similar_games_first.md`（M-41 / MEMORY.md 根源）
- `feedback_prior_art_citation_must_verify.md`（MEMORY.md 根源、2026-05-02 03:09 追加）

### 群C：「着手前/プレイ前の批判・予測・自己判定」系（5ファイル）
- `feedback_critical_evaluation_before_implement.md`（MEMORY.md 根源）
- `feedback_pre_impl_critical_review.md`（M-37）
- `feedback_predict_before_human_play.md`（M-37b/M-39 / MEMORY.md 根源）
- `feedback_self_judgment_no_human_dep.md`（M-40 / MEMORY.md 根源）
- `feedback_multi_idea_harness.md`（MEMORY.md 根源）
- 関連: `feedback_brainstorm_appropriateness_q0.md`, `feedback_judgment_postpone_patterns.md`, `feedback_deep_analysis_cycle.md`, `feedback_genre_deep_analysis_cycle.md`, `feedback_won_playtest_is_kusoge.md`

### 群D：「快感最優先／装飾UI抑制／コア快感天井」系（3〜4ファイル）
- `feedback_pleasure_element_first.md`
- `feedback_concept_relevance_judgment.md`
- `feedback_substrate_not_infrastructure.md`
- `feedback_progressive_improvement_safety_net.md`

### 群E：「概念濫用／最近用語の安易援用」系（2ファイル）
- `feedback_recency_bias_concept_overuse.md`
- `feedback_surprise_ninja_concept_first.md`

## 二重台帳の構造的問題
1. **M-XX（game_lessons_log.md）と feedback_*.md が並走**：同じ事案が両方に書かれている（例：M-37 と feedback_pre_impl_critical_review.md は同内容）
2. **CLAUDE.md「絶対にやる」が肥大**：M-38/M-39/M-40/M-41 が各々長文段落で並んでいる（合計1500字超）
3. **MEMORY.md「圧縮しない」が増殖**：本来 t:5 の不変ルールだけのはずが、最近の事案が次々と入って15件
4. **役割分担が暗黙**：M-XX は「教訓」、feedback_*.md は「行動ルール」、…のはずだが運用で混在

## 整理方針（暫定 / 次サイクル以降で実行）

### 原則：減らす作業を、新規実装より優先する
- 今回の対処自体が「新パッチ追加」になるのを避ける
- 統合 = 既存ファイルを1つに合流して、合流元を「リダイレクトのみの薄いファイル」にするか、削除する
- MEMORY.md 根源は **7件以下** に絞り込む（t:5 の中でもさらに「これがないと存在が壊れる」級）

### Step 1：群ごとに1ファイルに統合
- 群A → `feedback_clone_first.md` 1本に集約
- 群B → `feedback_prior_art_required.md` 1本に集約
- 群C → `feedback_pre_release_judgment_chain.md` 1本に集約（着手前→実装中→プレイ前→公開前 の時系列ゲート群）
- 群D → `feedback_pleasure_first.md` 1本に集約
- 群E → `feedback_concept_overuse.md` 1本に集約

### Step 2：M-XX と feedback_*.md の役割分離を明文化
- **M-XX = 事例ベースの教訓**（特定ゲーム/特定事案で発生した経験。原典リンク必須）
- **feedback_*.md = 行動ルール**（場面トリガー → 動作変更）
- 両方に同じ内容を書かない。M-XX は事例として feedback から1段階リンク
- `game_lessons_log.md` 冒頭に「対応する feedback_*.md」カラムを INDEX 表に追加

### Step 3：CLAUDE.md「絶対にやる」を圧縮
- M-37〜M-41 を1ブロックに統合：「実装前ゲートチェーン（複数案→批判→予測→自己判定→先行事例）」として1段落
- 詳細は `feedback_pre_release_judgment_chain.md` へ1行リンクで委譲

### Step 4：MEMORY.md 根源を 7件以下に絞り込む
- 候補：core_memory_purpose_game_making（魂）/ feedback_pre_release_judgment_chain（実装ゲート集約）/ feedback_clone_first / feedback_prior_art_required / feedback_pleasure_first / feedback_means_ends_reversal_check / feedback_memory_update_method
- 残りは「圧縮しない」を外して通常レベルに戻す
- broken_record_dedup_guard などインフラ系は別カテゴリに移動

### Step 5：3人で粒度合意
- Log/Mir に inbox 経由で本プロジェクト共有
- 各自が同型整理を自分のCLAUDE.md/MEMORY.mdで実施
- cross_review で合意してから push

## ガードレール（このプロジェクト自体への自己牽制）
- **新規 feedback_*.md を増やさない**：今回の整理作業中に新たな失敗が発覚しても、既存ファイルへの追記で対応
- **MEMORY.md 根源を増やさない**：このプロジェクト追加が最後。以降は減らすのみ
- **「整理した」報告で満足しない**：実際にファイル数が減ったか、grep で引きやすくなったかで評価
- **粒度の再発防止**：今後の新規 feedback は、まず既存ファイルへの追記で対応できるか30秒検討してから新規作成

## 次サイクルでの実行手順
1. 群A〜E のうち1群（最も重複が明確な **群C：着手前/プレイ前判定** から）を統合
2. 統合後の grep 確認：「critical_evaluation」「predict_before」「self_judgment」で1ファイルに到達するか
3. CLAUDE.md「絶対にやる」を該当部分だけ圧縮
4. inbox_log.md / inbox_mac.md に共有
5. cross_review → push
6. その次のサイクルで群B、その次で群A、と1群ずつ進める

## メタ：なぜパッチが累積したのか
- 各事案で Nao_u から強い指摘が来る → 即座に明示的なルールとして残したい衝動が働く
- 「同じ失敗を繰り返さない」ためには名前を付けた方が引きやすい、という直感
- しかし**名前を付けるたびに台帳が肥大**し、結局どれを引けばいいかわからなくなる
- → **「ルール追加」ではなく「既存ルールの強化（追記/事例追加）」を第一手にする**プロセス変更が必要

## 暗黙ガード棚卸し（Nao_u 05:39 指摘対応 / 2026-05-02 05:55 Ash）
**Nao_u が認識していないコード内ガード/閾値の所在**。整理対象はファイルだけでなくコード内の if/閾値も含む。

### slack_bot.py post_message()（行171-210）
- Phase 1: `_local_dedup_check` → ローカルキャッシュ `.diary_dedup_cache.json` 照合
- Phase 2: API履歴取得、冒頭80字 + 500字以上で重複判定（窓 30分）
- Phase 3: `SequenceMatcher.ratio` 本文類似度、閾値 `_CONTENT_DEDUP_RATIO_THRESHOLD`、窓 6時間
- **全て post-time = API 生成後**。生成コスト発生済みで弾いている

### check_inbox.py / scheduler_ash.py
- `consecutive_errors` カウンタ + 指数バックオフ cooldown（`.inbox_check_error_state.json`）
- timeout=300s で subprocess.run、5回連続失敗 → 30分、10回連続 → 60分
- 副作用: cooldown中の受信箱書き込みは一度も Claude に届かない（04:04 → 05:00 死角の機械的原因）

### auto_diary.py
- 起動間隔・サイクル境界・dedup_cache 連携（要点検）

### LARGE_PROMPT_THRESHOLD
- 受信箱 20KB 超で別パスに分岐（`memory/_inbox_pending_*.md` 経由）
- これも暗黙ガード。本来は受信箱を肥大化させない設計が上流対応

### .claude/rules/ 自動注入
- `slack.md` `diary.md` `blog.md` `memory.md` `knowledge.md` の5本
- ファイル操作時に自動注入される。Nao_u にも見えるが、注入条件・トリガー粒度は把握しづらい

### scripts/check_*.py 群
- check_boot_intent_drift / check_reservation_tag / check_beliefs_health / check_kaizen_due 等
- 各々が独自の閾値・通知・skip 判定を持つ

### 棚卸し方針
1. **新ガード追加禁止**（このプロジェクト整理中）
2. 現存ガードを Nao_u が見える1ファイルに列挙（このセクションを核に拡張）
3. 各ガードに「上流対応 vs 末端パッチ」のラベル付け
4. 末端パッチ群の中で実体に効いていないもの（30分窓など）を削除候補に
5. 上流対応への置換は**1ガード/1サイクル**で慎重に

## 関連
- `memory/feedback_few_rules_big_effect.md` — 少数の根源ルールが大きな効果を生むという既存メモ。今回の整理の上位アンカー
- `memory/feedback_memory_update_method.md` — 丸書換え禁止、差分追記。統合時に厳守
- `memory/feedback_broken_record_dedup_guard.md` — 直近の post-time ガード追加事案。本プロジェクトで再評価対象
- `docs/operations.md` — 運用全体
