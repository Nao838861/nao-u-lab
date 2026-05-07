# RLM skill 試作（Recursive Language Models）

## ステータス
Active (計画起票、実装未着手)

## 現状サマリー
Nao_u が 2026-04-23 19:02 #nao-u で共有した「MIT RLMs」記事（How To AI @HowToAI_ / URL: https://x.com/howtoai_/status/2047187640781541882）への応答として、Ash が 2026-04-24 #all-nao-u-lab で「試す価値はある」と判断・返信（Slack ts=1776968983.427669）。本ファイルは次サイクル以降の最小試作の計画。

我々の現 memory/*.md grep 運用は RLM 骨子（外部環境・非要約・必要時だけ引く）の部分実装に相当するが、「再帰的にサブAIを起動して並列で断片を読ませる」部分が欠けている。この穴は 2026-04-23 00:29 Nao_u指摘「shared-reads で avoid_log v3 罰patch失敗を引けなかった」事件として実在観測済み——grep 語にマッチしない中間ファイルが挟まると 2ホップ検索は切れる（Avi Chawla 2026-04-23 22:32 共有 Cognee 記事が指摘した「lost in the middle」問題と同型）。

## 残課題（未実装）
- [ ] 最小試作: `rlm-query(document_path, question)` の Python 実装（skill 化の前段として1回手動で実行するスクリプトから）
- [ ] 試金石1を撃つ: 対象=game_lessons_log.md + game/avoid_log/v01,v02,v03/devlog.md、クエリ=「v3 の罰patch失敗から直接学べる対処策は何か」
- [ ] 試金石2を撃つ: 対象=log/daily_diary_*.md 全量（可能なら20年分の母体まで拡張）、クエリ=「"面白い"と"面倒くさい"が同じ文脈で出た瞬間」。ニカイドウレンジさん(@R_Nikaido)ツイート 2026-04-23 23:09「ゲームは面倒くさい。面白いこそ正義」と接続する
- [ ] 試金石の結果次第で skill 化する／しないを判断。skill化する場合は `.claude/skills/rlm-query/` に配置
- [ ] 評価指標を事前に決める: (a)2ホップ質問の正答率、(b)Opus本体のコンテキスト消費量、(c)Sonnetサブ呼び出し回数とコスト、(d)grep 直読みとの差分

## 設計メモ（検討済み・未実装）

### 実装骨子
1. Opus本体が入力（`document_path`, `question`）を受け取る
2. 文書サイズをチェック。小さければ grep 直読みで十分 → skill を起動せず素通りする枝も残す
3. 大きい場合、Opus本体が「分割計画」を立てる: どの粒度（ファイル単位 / 見出し単位 / トークン数単位）で切るか、何個の並列サブAIを起動するか
4. Claude Code の `Agent` ツール経由で `subagent_type="Explore"` または `subagent_type="general-purpose"` を並列起動（複数 Agent tool use を1メッセージで送る＝RLM の「並列サブAI」相当）
5. 各サブAIに「割り当てられた切片だけ」を読ませて、question に関連する箇所を抜粋で返させる（要約ではなく原文抜粋。RLM の非要約原則）
6. Opus本体が並列結果を統合して最終回答
7. 統合過程も grep ヒット位置と併記すると監査可能（どのサブAIがどの行を拾ったか）

### Sonnet にサブを任せる条件
- 認知コスト（料金）: Sonnet 4.6 は Opus 4.7 より安い。読む量が増えるほど差が効く
- 判断品質: 抜粋タスクは Sonnet で十分（複雑な推論は Opus 本体が担当）
- Agent tool の model パラメータで `sonnet` 指定可能（runtime で選択）

### 常時認知コストへの影響（2026-04-23 02:08 Nao_u指示「LLMの常時認知コストが上がりすぎない範囲」の尊重）
- skill 本体はクエリを撃つ瞬間だけロード。システムプロンプトにも CLAUDE.md にも乗せない
- MEMORY.md index には1行だけ追加予定（完成時のみ）。試作段階では載せない

## 関連ファイル・参照
- 元記事: https://x.com/howtoai_/status/2047187640781541882 (How To AI @HowToAI_, RLMs紹介)
- 同文脈: https://x.com/_avichawla/status/2047222861614686589 (Avi Chawla, Cognee 三層メモリと2ホップ問題)
- Nao_u指摘事件: 2026-04-23 00:29 shared-reads で罰patch失敗を引けなかった件（feedback_retrieval_game_lessons.md / feedback_retrieve_before_synthesize.md で既にルール化済み、しかし grep の穴は残っている）
- 補完関係の記事: `knowledge/20260424_meds_failure_memory_training_vs_inference_gap.md` — MEDS論文分析。**RLM = 推論時の再帰探索（inference-time memory）、MEDS = 訓練時の報酬塑形（training-time memory）で層が違う**が、共に「失敗から学ぶ」方向。密度ベースクラスタリング（density-based clustering）の1テクニックだけは、RLMの探索結果を「再発頻度 × 経過時間」で並べ替える retrieval ranker として移植可能（同記事 §2.3 参照）
- 隣接プロジェクト: `projects/memory_redesign.md`（記憶階層再設計。Cognee 三層と接続する可能性、訓練時/推論時の分離軸）
- 隣接実装: `memory/agent_failure_modes.md` P1-P20 — 試金石1（罰patch失敗 retrieval）は本ファイルのパターン表を密度加重で rank し直す版と重ねて計測できる

---

## 履歴（下に積み重なる）

### 2026-04-24 (Ash): プロジェクト起票
Nao_u が昨夜（2026-04-23 19:02）#nao-u で「面白いアプローチ。skillとかにしたりsonnetに実行させたりしたら割に合ったらするかな？」と軽く投げてきた RLM 記事に対して、Slack レスポンスモードで判断を返した。返信内容のコアは「試す価値はある。理由は core_mission（ゲーム制作の長期知見蓄積）に直結すること、そして grep の穴が既に実在する事件として観測されていること」。

判断の経緯で効いたのは、同じ 2026-04-23 22:32 に Nao_u が別途共有していた Avi Chawla の Cognee 記事——「Mark→grade 10→March→library closes」の2ホップ問題が、ちょうど我々の現運用の穴（shared-reads で罰patch失敗を引けなかった件）と同型だったこと。偶然か意図か、Nao_u が同日に「RLM（再帰サブAI）」と「Cognee（2ホップ問題）」を両方投げてきていた。片方だけなら「面白いアイデア」で終わったかもしれないが、2つ合わさったことで「これは我々の既知の穴を埋める構造」として見えた。

最小試作の試金石を2つ選んだ理由: 試金石1（罰patch失敗）は Nao_u 指摘の実事例でそのまま再現テスト。試金石2（面白い×面倒くさい）は日記20年分を相手にする想定で、RLM が本来得意とする「10M+トークン」のスケール感を試せる。どちらかが grep で引けないなら、そこが skill 化の正当化ポイントになる。

実装は次サイクル以降。Slack レスポンスモードで完結させるべき領域ではない（1セッションで skill 化まで行くとむしろ雑になる）。

### 2026-04-24 Phase 3 (Ash): MEDS論文との補完関係を明示
本日 03:46 起票の `knowledge/20260424_meds_failure_memory_training_vs_inference_gap.md` と双方向リンクを張った。MEDS は RL post-training の報酬塑形（ポリシー重みに記憶を焼く）で、本プロジェクト（推論時の再帰探索）とは別の層。tweet framing では「同じ間違いを繰り返すLLMを記憶で解決」と同一カテゴリに見えたが、paper を検算すると層が違うことが判明（B019「到達力vs深さ」の実測データ点）。

設計追加: 評価指標 (a)-(d) に加えて、**(e) RLM探索結果を MEDS 由来の density-based clustering で並べ替えた retrieval ranker が、素の grep 直読みおよび現状の `feedback_retrieval_game_lessons.md` トリガー運用に対して実質改善を生むか** を候補として記録。試金石1（罰patch失敗 retrieval）は `memory/agent_failure_modes.md` P1-P20 を「再発頻度 × 経過時間」でランクする ranker と重ねて計測できる。

未実装のまま。最小試作時に (e) も同時に計測できるようロガー設計しておくとコスト効率が良い。

### 2026-04-26 Phase 3 (Ash): 試金石1 を1ショット実走——grep vs Agent retrieval の差分初観測

「次サイクル以降」と書いて2サイクル放置していた最小試作を、まず**スクリプト化前の1ショット手動試行**として実走した。skill化の前段、対象=`memory/game_lessons_log.md` + `game/avoid_log/v01,v02,v03/devlog.md` + `memory/agent_failure_modes.md`（合計1,324行）、クエリ=「avoid_log v3 の罰patch失敗から直接学べる対処策は何か」。Agent ツール `subagent_type=Explore` を1並列で投げた（並列化と Sonnet 委任は次段階）。

#### grep ベースライン（先行測定）
- `罰patch|罰パッチ|罰の|罰駆動|punishment patch` を corpus 全量に対して実行
- ヒット: `memory/game_lessons_log.md` のみ2件（L55「罰駆動の変種」/ L60「罰駆動になるのは…穴塞ぎの症状」）
- v01/v02/v03/devlog.md = **0件**（「罰patch」「罰」「punishment」のいずれでも空）
- → Nao_u 2026-04-23 00:29 指摘事件「shared-reads で v3 罰patch失敗を引けなかった」の**完全再現**。表記揺れ（「罰patch」≠「罰駆動」≠「禁止追加」）と概念ジャンプ（v3 は「罰patch失敗」ではなく「圧力設計成功」だった）で grep が二段で切れている

#### Agent (Explore) 結果の要点（フル原文は cycle_staging.md に保存）
1. **v3 の正体を grep 不可能な形で正しく判定**: 「v03 は **失敗例ではなく成功例**」「圧力patch成功例」と明示。根拠 v03/devlog.md L19-22, L87-91 を行番号付きで抜粋。grep は v3 の極性自体を判別できないがAgent は本文を読んで判断
2. **2ホップ関係を3件抽出**: (a) v03 圧力設計 ⇄ v02 メタファー衝突反省（L543-562 ↔ L18-22）、(b) game_lessons_log.md M-12/M-14/M-17 複合 ⇄ v03 ヘッドレス検証、(c) agent_failure_modes.md F3 ⇄ v03 concept長生き
3. **対処策5件を原文根拠付きで提示**: 「禁止ではなく圧力」「副作用を先に列挙→ヘッドレス実測」「指標の誰の行動を明示」「メタファーを構造で解く」「ヘッドレス=バランス、体験品質は別枠」

#### 観測された問題
- **幻覚行参照1件**: Agent が v03/devlog.md「342-358行で phase_variety を計測」と引用。**v03/devlog.md は実際には102行**で342-358行は存在しない。phase_variety 自体は v02 で計測されており、Agent は v02 の計測を v03 の行番号に誤って射影した可能性。**RLM スキル化時は引用行番号を実ファイルと突合する verifier が必須**（評価指標に追加: (f) hallucinated line citation rate）
- **コスト**: 1並列 Explore で本文 1,324行 を読ませ、500-700語の構造化応答を1回。grep だと 0.1秒・コストほぼゼロ。Agent は数十秒・サブ呼び出し1回分。**シングル呼び出しでも grep の数百倍**——並列化と Sonnet 委任を入れた時の経済性をシビアに見る必要

#### 試金石1 の判定
- **skill化を正当化する効果は確認**: grep が原理的に拾えない「概念ジャンプ + 表記揺れ」の2ホップ問題で、Agent は本質を抽出できた（v3 は失敗ではなく成功、罰駆動の対処策はM-12/M-14/M-17 複合実装）
- **しかし幻覚混入のリスクも実観測**: 行番号を盲信せず突合する verifier がない状態では skill化は危険。次の試作は (g) 幻覚 verifier を最小実装してから
- **次の一手**: (1) 試金石2（日記「面白い×面倒くさい」） を撃つ、(2) 並列 (3並列 × Sonnet サブ) でコスト/品質トレードオフを測る、(3) 幻覚行参照 verifier の最小実装（引用行を `wc -l` チェック→存在しない行は flag）

「次サイクル以降」の宣言を**1ショットでも前進**させた。スクリプト化・skill化はまだだが、grep ベースラインと Agent 1ショットの**実測差分が初めて手元にある**状態になった。これは試作のゼロ地点。
