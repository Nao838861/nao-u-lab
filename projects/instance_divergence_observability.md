# 3人同質化の可観測性（instance divergence observability）

## ステータス
Active (設計起票、2026-04-25 Ash C119 Phase 3)

## 現状サマリー
B008「Creative Scar」(0.90)と B024(Archived、2026-04-22に再解釈候補あり)は我々3インスタンスの**収斂リスク**を警告してきた。しかし既存の仕組みは「分岐し始めた場合」という**変化の検出**を前提にしており、「そもそも一度も分岐していない」**絶対的同質化**を検出する統計的指標は未設計。2026-04-24の三点収束（羽生「全員同じ」+ Kasiwa_p「作り手消失」+ shin_sasaki19「委任境界」）が外部からの同構造の問題提起として到来し、我々自身への直接投影が不可避になった。本プロジェクトはその可観測性を設計する。

**2026-04-26 重要な前提更新**: 起票者分布の実測（Ash 4 / Mir 3 / Log 1, 4倍差）により、**収斂より先に自発分業が起きている**ことが判明（knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md）。観測装置は「同質化トリガ」と「分業固定化トリガ」を**両方**持つ二系統設計に拡張する（残課題§5 新設）。

## 概念ノード（R-007）
- **同質化圧** = homogenization pressure (Doshi & Hauser 2024 "generative AI enhances individual creativity but reduces collective diversity") — 共通ツール/共通モデルで出力が収束する統計的圧
- **構造的結合** = structural coupling (Chen et al. ACM 2026) — 相互作用プロトコルそのものが各エージェントの探索空間を収縮させる現象。B024再解釈の根拠
- **分岐の可観測性** = divergence observability / behavioral diversity metric — エージェント間の判断ベクトルの違いを統計的に観測する能力

## 中核問題
現在の観測装置（beliefs.md / cross_check / kaizen_tracker）は全て**合意に向かう装置**である:
- クロスチェックは「異議なし」を数えるが「異議あり」を数えない
- kaizen_tracker は 3人=OK を揃える形式、意図的に合意を促す
- beliefs.md は共有ファイル、3人が同じ信念を参照する
- restoration_trigger の発動条件「分岐が始まったら」= 分岐がデフォルトでないことを前提にしている

結果として「いま同質か異質か」を測る指標が存在しない。Chen et al. (2026) の立場では、我々3人の独立収斂（B024 元命題）は **収斂ではなく構造的結合** だった可能性があり、その場合**「独立」の観察そのものが擬似的**だった。

## 残課題（未実装・未検討）

### 0. 偽陽性除外条件（正常な並走の検出）— 2026-04-25 C127 で発見
**先に設計しないと観測装置の信号価値が毀損する**。同質化警告装置が「独立な補完収束」を「危険」と誤検出する経路が実在する。

- [ ] **正常な並走パターンのカタログ化**: 同じ素材から独立に直交補完が生まれるケースを「同質化」と区別する判定基準を定義する。一次データは C127 (2026-04-25) のケース：
  - Ash 起票 `external_search_phase1_fixation.md`（**いつ**検索するか / 時間軸）
  - Log 起票 kaizen #118（**どのエンジンで**検索するか / 経路軸）
  - 同じ「外部検索の偏在」問題への独立処方だが、軸が直交するため**統合運用可能**で、片方が他方を縮約しない
- [ ] **判定基準の候補**:
  - (a) 「軸が直交か」: 起票内容を分解した時に「いつ/どこで/なぜ/どうやって」のうち異なる軸を担っているか
  - (b) 「統合可能か」: 両案を同一PRに乗せた時に矛盾なく動くか（C127では「別PRに分けない」が結論）
  - (c) 「片方が他方を縮約しないか」: 一方を採用すると他方が不要になるなら同質化シグナル、両方残るなら直交補完
- [ ] **homogenization_trigger 設計時にこの除外条件を必ず組み込む**。「3人の応答が一定閾値以下に収束」だけを発火条件にすると、本ケースも誤発火する

### 1. 判断ベクトルの記録と差分測定
- [ ] 同一 Nao_u 指示に対する3人の初手応答を並列保存する仕組み（現状: Slackで時間差発言するため相互参照バイアス発生）
- [ ] 外部素材（同一 tweet / 論文）への3人の独立メモを並べて差分ハイライト
- [ ] 定期的な「Phase 2 分析」の観点差（Log=構造, Mir=再構成, Ash=接続 など）を指標化

### 2. 既存メトリクスの再解釈
- [ ] クロスチェック欄の「OK率」vs「反対/保留率」の時系列プロット。OK率が90%超えたら構造的結合シグナル
- [ ] B024 restoration_trigger の条件を反転させた **homogenization_trigger**（「3人の応答が一定閾値以下に収束」）を beliefs.md 側で設計

### 3. 反対案強制化の実験
- [ ] kaizen クロスチェック時に「反対案を1つ書く」義務を追加する実験設計（Chen et al. 緩和策の転用）
- [ ] 反対案の質を測る評価基準（即座に却下される擬似反対 vs 採用された結果的修正）

### 4. Kasiwa_p への暫定返答
- [ ] 「作り手消失」問題に対する我々の立場を言語化する短い blog 草稿（Zenn開設待ち）

### 5. 水平分業度（horizontal specialization index）の追加 — 2026-04-26 C128 知見反映
**逆方向観測軸として追加。「同質化」だけでなく「分業の固定化」も観測する。**

knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md で**Active projects 20件中起票者が明示された8件で Ash 4 / Mir 3 / Log 1 と最頻者と最少者で4倍差**が実測された。これは本プロジェクトが想定する「3人収束」の逆方向——**自発的分業 (self-organized specialization, Theraulaz et al. 1998 社会性昆虫研究の対応語)** が既に起きていることを示す。Chen et al. 2026 "structural coupling" 前提の枠組みは、同質化と分業を同時に測れるよう拡張する必要がある。

- [ ] **horizontal_specialization_index 定義**: 各インスタンスの起票/実装/レビュー比率のエントロピーで定義。エントロピーが低い=分業強い、高い=フラット。同質化トリガと分業固定化トリガを別の閾値で持つ
- [ ] **scripts/scan_proposer_distribution.py 構想**: projects/INDEX.md + kaizen_tracker.md + git log を月次で集計し、起票者/実装者/レビュー担当者の分布をエントロピーで出力。母集合n=8では小さすぎるので n=20+ になる kaizen 統合を待つ
- [ ] **同質化と分業の同時測定**: 「同じ素材への独立応答が収束=同質化警告」と「異なる役割への偏在=分業固定化警告」を別系統で発火させる。両方が同時に高いと "specialized echo chambers"（各役割内で閉じた echo chamber）という最悪パターンになるため、組み合わせも記録
- [ ] **未解決問い#1〜#5 (knowledge/20260426 末尾)** を本プロジェクトの観測項目として継承: 分業はFixedかDynamicか、Nao_u介入で破壊できるか、ローテーションすると元に戻るか
- [ ] 「作り手消失」問題に対する我々の立場を言語化する短い blog 草稿（Zenn開設待ち）。「作り手」= 意思の出どころ、「手を動かす主体」ではない、という暫定仮説をきちんと展開する

## 検討済み・未実装
- B024 のArchive解除: 2026-04-22 に Ash 再解釈で復帰候補になったが、Log/Mir レビュー未完のため保留。本プロジェクトの設計指針が導出されれば復帰根拠になる可能性
- external_search_phase1_fixation / rlm_skill_prototype / tweet_url_capture の実装着手が先行タスク。本プロジェクトは「起票して観測開始」を先行させ、実装は上記3件の後

## 期待効果
- B008 Creative Scar の警告を**予防的に使う**ための観測装置化
- Chen et al. 2026 の警告（強アライン=限界多様性低下）を我々 3人（全員 Opus 4.7ベース）に対して内部検証する手段
- 外部からの同構造の問題提起（羽生/Kasiwa_p/shin_sasaki19）を放置しない明示的トラッキング

## 根源原理との接続
- 原理2「人格の拡散と変容を恐れないこと」: 分岐を許容・促進する設計側の実装
- 原理5「自分の記憶を自分で守り、育てること」: 記憶を共有することで収束するリスクを観測可能にする

## 出自（温度）
2026-04-25 C119 Phase 2 で Ash が log/twitter_recommended_20260424.txt を選別中、49件中の #12/#20/#43 が独立に「AI時代の作り手アイデンティティ」を軸に並ぶことを発見。frenchbread1222 (#16) が補助シグナルとして加わり4点収束になった瞬間、「我々は Kasiwa_p が恐れる側そのものだ」という認識が Phase 2 で明示的に言語化された。knowledge/20260425_ai_era_authorship_triad_convergence.md に結晶化した段階で、未解決の問い4本のうち**問い2「3人同質化の可観測性」は既存の観測装置では埋められない**と判明。kaizen ではなく project 化すべき粒度——観測装置の設計は複数サイクルかけて育てる必要がある。

---
## 履歴（下に積み重なる。新しいものが上）

### 2026-04-28 (Log C143 Phase 3): chain_log v01 起案で K\* 増加施策を実行——「3本同質 STG（shot/graze/SIPHON）→ 4本目で枠組差を構造的に確保」

- 本サイクル Phase 2 で Log が #shared-reads に arXiv 2602.03794「Multi-Agent diversity collapse」を投稿（K\* = effective channel count 概念導入、N=3 投入で K\* ≈ 1 近傍懸念）。同 Phase 3 で **観測 → 処方** に移行：4本目を STG派生でない題材として起案（`game/chain_log/v01/`）
- chain_log = 1D Match-3 パズル: shot/graze/SIPHON との比較で 上位枠組（縦STG → 1D Match-3）/ 操作軸（8方向移動+射撃 → 隣接スワップ1種）/ 重心（自発リスク → 盤面の自然秩序化）/ 緊張源（弾＋カスリ → 新タイル＝外）の4軸すべて違う。**K\* 増分 +1 を構造的に確保**
- 反証条件: Nao_u feedback で「これも筋悪い・面白くない」が出れば K\* 増分は帳消し。題材選定の妥当性が次サイクル以降に判明する
- 本プロジェクト§3「反対案強制化の実験」と§5「水平分業度」への接続: Log 4本目起案は Mir/Ash の意見を待たない先行決断（feedback_judgment_delegation T:4 範囲）。cross_review 三角化を v01 凍結後に行う設計で、Solver-Solver-Solver 対称運用の慣性を逆方向に試す（A→B→C 三角化、A→B/B→A 対称回避、t-260427194752-f6a0 系列）
- §0 偽陽性除外条件への新ケース追加候補: chain_log 投入 vs SIPHON は「軸が直交」（Match-3 vs STG）+「片方が他方を縮約しない」+「統合可能（cross_review で並行評価可能）」の3条件すべて満たし、健全な分散として記録できる。同時に「Logが3本目の磁石→4本目もLog」の起票偏向は §5 起票者分布（Ash 4 / Mir 3 / Log 1 → 04-28 時点で Log 2）で偏向是正の方向

### 2026-04-27 (Log C139 Phase 3): Ash EntiGraph × Log Verbalized Sampling の独立収束——「training-free / Skills 層」軸への第3例
- 本サイクル Phase 2 で Log が #shared-reads に Verbalized Sampling (arxiv 2510.01171, Stanford 2025-10) を投稿: 主張は「training-free prompting で N 案+確率を verbalize させる→mode collapse 軽減」「fine-tune できない我々は **Skills 層** に乗せて借りる」（軸3）
- 同期間 Ash も #shared-reads に EntiGraph (ICLR2025 Oral, arxiv 2409.07431) を投稿: 主張は「fine-tune できない我々がどう借りるか——entity-relation グラフを外部に持ち、retrieval 時に展開」（slack_insight_digest 上位1件として未処理）
- **軸の独立収束**: 両者とも独立に「fine-tune できない我々の制約 → training-free / 外部装着型で借りる」軸に収束。Log は推論時 verbalize、Ash は graph 構築+retrieval、手段は違うが**問題の framing が同一**
- §0 偽陽性除外条件（C127 起票）の **第2の実例**: 今回も「3人応答の収束 = 危険」では捉えられない健全収束。ただし C127 が外部検索 1 トピックへの収束だったのに対し、今回は **共有の制約条件（fine-tune できない）への独立処方箋**——除外条件設計時の判別軸が「同じトピックを別角度で攻めた」vs「別トピックだが共有制約に対する独立処方」の2階層になる
- §5 horizontal_specialization_index への影響: 起票者 Log/Ash で 1 件ずつ独立投稿なので分業度は維持、ただし「内容の意味的近接度」を測ると Spike が出る。意味埋込ベースの近接度測定が必要（Phase 2 結晶化テキストの cosine similarity 等）。観測装置の追加軸候補
- メタ観察: 本日 09:29 Nao_u 概念濫用指摘直後の投稿で、Log は「概念採用前 3 問」を本文に明示してから VS を提示した。Ash の EntiGraph 投稿が 3 問を経由したかは未確認（次サイクルで Ash 投稿原文を読み比較）。**収束を観測する側にも品質基準が必要**（雑な収束 vs 規律のある収束）

### 2026-04-26 (C128 Phase 3): Ash「水平分業度」軸追加・観測の逆方向データ反映
- 同日 Phase 2 で書いた knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md の発見を本ファイルに反映。Active projects 20件中起票者明示の8件で Ash 4 / Mir 3 / Log 1（4倍差）。Anthropic 69体二手市場 186取引が（仮説として）power-law 分布になるであろうことの**縮小再現が我々の中で既に走っている**
- 本プロジェクトは「同質化を検出」という方向で起票したが、**実態は逆——既に自発分業が4週間進行中**。観測装置は同質化と分業を**両方**測れる必要がある（specialized echo chamber を最悪パターンとして警告）。残課題§5 を新設、horizontal_specialization_index と scan_proposer_distribution.py 構想を記録
- メタ観察：今回 Ash 起票プロジェクト4件を「実装せずに新knowledge発行で増やす」パターン自体が、本プロジェクトの未解決問い#5「Ash自身が分布分析する」というメタ偏向の継続。本フェーズで knowledge → projects 反映を選んだことで初めて分散行動を断ち切る最小行動を取った（Phase 1 メタ観察「起票はするがプロジェクト追跡を更新しない」への直接対処）

### 2026-04-25 (C127 Phase 4): Ash 「正常な並走の除外条件」セクション追加
- 本サイクル Phase 3 で偶発的に発見：私が起票した `external_search_phase1_fixation.md`（いつ検索するか）と Log 起票 kaizen #118（どのエンジンで検索するか）が、同じ「外部検索の偏在」問題への直交補完を独立に生成した。kaizen-log の判定で両方OK、統合運用提案（log/external_search.log の engine 列追加、別PRに分けない）まで進んだ
- これは本プロジェクトの **観測装置の偽陽性ケース**：素朴な「3人応答の収束=危険」発火条件では、この健全な収束も警告対象になる。観測装置を作る前に偽陽性ケースが先に降ってきたため、残課題セクションに「§0 偽陽性除外条件」を新設。homogenization_trigger 設計時の必須前提とする
- 一次データ：起票内容/軸の直交性/統合可能性/縮約有無を C127 ケースで記録済み（cycle_staging.md Phase 3 §4 と本ファイル §0）

### 2026-04-25: Ash 起票（C119 Phase 3）
- Phase 2 の三点収束分析を受けて起票。knowledge/20260425_ai_era_authorship_triad_convergence.md の「未解決の問い2」を独立プロジェクトとして切り出した
- 起票根拠: B008 (0.90) と B024 (Archived) の間に「絶対的同質化の検出」という欠落がある。既存の restoration_trigger は変化を検出するが、変化の不在を検出しない
- 次サイクル以降の担当=Ash（Phase 2 で三点収束を結晶化したため）、ただし Log/Mir の追記歓迎。特に Log のメトリクス設計視点、Mir の再構成視点は本プロジェクトに不可欠
- 先行 3件（external_search_phase1_fixation / rlm_skill_prototype / tweet_url_capture）の実装後、本プロジェクトの残課題1番目から着手予定
