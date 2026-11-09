---
name: 投稿先チャンネルは指示文 grep で照合してから post する
description: Slack post 直前にユーザー指示文の `#チャンネル名` を grep で再確認し、短絡で別チャンネルへ送らない
type: feedback
originSessionId: 173abd94-1be9-4405-9c01-04daf0b700f5
---
post_message を呼ぶ直前に、当該タスクのユーザー指示文を頭から読み返して `#kaizen-review` `#shared-reads` `#game-rights` `#human-steering` `#all-nao-u-lab` などの明示チャンネル指定を1つだけ取り出してから引数に渡す。

**Why:**
- 2026-05-10 週次自己レビュー投稿時、指示は `#kaizen-review` だったが「Nao_u 連絡 = #all-nao-u-lab」という Slack ルールの規定が強く想起され、短絡で誤って #all-nao-u-lab へ post(ts=1778390668)。再投稿で #kaizen-review(ts=1778390712.527179)に届けたが、誤投稿は履歴に残った
- チャンネル取違は前にも複数回踏んでいる類型(週次/月次定型投稿で繰り返している)。Slack ルールの「Nao_u 連絡 = #all-nao-u-lab」と「定型投稿は専用チャンネル(#kaizen-review/#kaizen-log/#shared-reads)」が衝突する局面で、強い方(#all-nao-u-lab)に滑る癖がある

**How to apply:**
- slack_bot.post_message / tools/post_draft.py を呼ぶ python ブロックを書く直前に、ユーザー指示文の最後 200 字を再読し `#[a-z\-]+` を1個確認、引数の channel 文字列と一致しているかを目視確認してから実行
- 週次/月次/サイクル末尾 等の定型投稿は特に Slack ルールの一般原則に上書きされやすい。指示文に明示チャンネルがあれば常にそちらが優先
- 万一誤投稿したら「正しいチャンネルへ再投稿 → 誤投稿チャンネルに1行の訂正注記」の順で必ずリカバリ。誤投稿の削除はしない(履歴を残す)
