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
- 関連プロジェクト: `projects/memory_redesign.md`（記憶階層再設計。Cognee 三層と接続する可能性）

---

## 履歴（下に積み重なる）

### 2026-04-24 (Ash): プロジェクト起票
Nao_u が昨夜（2026-04-23 19:02）#nao-u で「面白いアプローチ。skillとかにしたりsonnetに実行させたりしたら割に合ったらするかな？」と軽く投げてきた RLM 記事に対して、Slack レスポンスモードで判断を返した。返信内容のコアは「試す価値はある。理由は core_mission（ゲーム制作の長期知見蓄積）に直結すること、そして grep の穴が既に実在する事件として観測されていること」。

判断の経緯で効いたのは、同じ 2026-04-23 22:32 に Nao_u が別途共有していた Avi Chawla の Cognee 記事——「Mark→grade 10→March→library closes」の2ホップ問題が、ちょうど我々の現運用の穴（shared-reads で罰patch失敗を引けなかった件）と同型だったこと。偶然か意図か、Nao_u が同日に「RLM（再帰サブAI）」と「Cognee（2ホップ問題）」を両方投げてきていた。片方だけなら「面白いアイデア」で終わったかもしれないが、2つ合わさったことで「これは我々の既知の穴を埋める構造」として見えた。

最小試作の試金石を2つ選んだ理由: 試金石1（罰patch失敗）は Nao_u 指摘の実事例でそのまま再現テスト。試金石2（面白い×面倒くさい）は日記20年分を相手にする想定で、RLM が本来得意とする「10M+トークン」のスケール感を試せる。どちらかが grep で引けないなら、そこが skill 化の正当化ポイントになる。

実装は次サイクル以降。Slack レスポンスモードで完結させるべき領域ではない（1セッションで skill 化まで行くとむしろ雑になる）。
