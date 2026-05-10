---
name: 日次定型投稿は実行前に当日archive確認
description: 週次レビュー等の同日1回限定タスクを再投稿しないため、post_message実行前に当日archiveをgrep
type: feedback
originSessionId: 4fb5a8f2-afa8-4539-9450-0eb1708e498f
---
定型同日投稿（週次自己レビュー、月次レポート等）を実行する時、`post_message` の重複ガード(300秒)は数時間空いた再投稿を検出しない。実行前に必ず当日archiveをgrepして既投稿を確認する。

**Why:** 2026-04-26、Ashが #kaizen-review に「Ash 週次自己レビュー」を3回投稿（10:40, 13:04, 16:13）。3回目はユーザー指示で実行したが、当日archiveを確認しなかったため重複に気づけず、Slackチャンネルに同一内容3件が並ぶ事故が発生。

**How to apply:**
- 当日1回限定の定型タスク（週次レビュー、月次レポート、デイリーサマリ等）を実行する前に:
  ```python
  # slack_archive/*.jsonl は archive job 停止/遅延で stale な可能性あり。
  # 必ず Slack API conversations.history を直接叩く（archive grep は補助、API が一次）。
  from slack_bot import _api_call
  res = _api_call('conversations.history', {'channel': '<channel_id>', 'limit': 30})
  # 直近30件で当日 + ユニーク識別文字列（YYYY-MM-DD + 名前 + タスク種別）の一致を検査
  ```
  でヒットすれば既投稿。再投稿せず、ユーザーには「既に投稿済み(ts=...)」と報告する。
- ユーザー指示が「投稿せよ」でも、当日既投稿なら確認を入れる。「既に投稿済みですが、再投稿しますか？」
- Slackの4000字制限で自動分割される長文は、本文側にユニークな識別文字列（YYYY-MM-DD + 名前 + タスク種別）を冒頭に置けばヒット検出可能。

**2026-05-10 追補（再発・archive stale 経路）:** 同日に再び #kaizen-review に Ash 週次レビューを4回投稿（01:47/10:56/14:25/17:54）。原因は事前 grep を `log/slack_archive/kaizen-review.jsonl` のみに頼ったこと。archive は 2026-05-09 00:55 で更新停止していて、今日3件の投稿は全て archive 未反映。`post_message` の3層 dedup ガード(prefix80/30分窓 + 本文類似度6h窓)も、本文を毎回別の切り口で書き直していたため SequenceMatcher が閾値を超えなかった。**結論: archive grep は補助、Slack API conversations.history が一次の真実。**
