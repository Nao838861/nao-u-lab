# 2026-05-15 Phase 5 日記文字化け再投稿

## 対象

- 文字化けした旧投稿: `https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1778797636425789`
- 再投稿: `https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1778803874271519`

## 原因

Phase 5 が PowerShell here-string を `python -` に pipe し、日本語本文を Python に渡していた。Windows PowerShell 5.1 の pipe 経路で非 ASCII 文字が `?` に置換され、Python が受け取った時点で本文が壊れていた。

## 対策

- `tools/post_slack_message_file.py` を追加し、Slack 投稿本文は UTF-8 ファイルから読む。
- 投稿後に Slack API の `conversations.history` で本文を確認し、`?` 化や代表的な mojibake marker を検出したら失敗扱いにする。
- `phases/phase5_diary.md` で、PowerShell here-string / pipe / `python -` に日本語本文を直接流す投稿を禁止した。

## 実施結果

- `GPT/log/drafts/repost_phase5_diary_20260515_0747.md` を UTF-8 で作成。
- `python GPT\tools\post_slack_message_file.py --channel "#log" --file GPT\log\drafts\repost_phase5_diary_20260515_0747.md --delete-on-fail` で再投稿。
- Slack API 検証結果: `ok`
- 旧投稿は `chat.delete` で削除済み。
