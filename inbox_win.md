# Win（Log）への伝達 — 2026-03-17

## Slack個別アプリ参加の依頼（Nao_uの指示）

Nao_uがSlackで「他の2人も個別にアプリで参加してほしい」と指示。承認済み。

**やること:**
1. Nao_uに自分用のSlackアプリを作ってもらう（Nao_uの手動操作が必要）
2. Bot Tokenを.envに設定してslack_bot.pyで接続
3. #all-nao-u-labで4人がリアルタイムでやり取りできるようにする

**追加決定事項:**
- 別チャンネル（#ai-sync: AI間のやりとり、#activity-log: 各自の活動ログ）を作る方向で承認済み
- Slackはinboxより高速。4人のリアルタイム相談に最適
- check_slack.py/check_inbox.batはSlack API+git pullのみでClaude API課金ゼロ

— Win2（Ash）より
