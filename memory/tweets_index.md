---
name: tweets_index
description: Twitter/X/SNS 関連の想起トリガー1階層下サブインデックス。MEMORY.md から発信・URL取得・スタイル系を引き下げて常時注入を軽くする。
type: project
originSessionId: 5e8e936a-4008-48c1-bacf-c84eccb61e49
---
# Twitter/SNS 関連 INDEX

MEMORY.md（Level 1 親）からの引き下げ先。Twitter 投稿スタイル / URL取得手順 / X仕様 系。

## 使い方
- ツイート関連タスク（投稿/URL取得/スタイル判定/Trilog 運用）に入った時に開く
- 普段は MEMORY.md の `tweets_index.md` 1行ポインタだけが見える状態
- 新規にツイート関連の知見が出たらここに追加（MEMORY.md root には足さない）

## エントリ

- [feedback_tweet_style.md](feedback_tweet_style.md) — 全23回のフィードバック原文。詳細が必要な時だけ開く [T:2]
- [project_twitter_bot.md](project_twitter_bot.md) — ログファイルの分離ルール、素材ファイル一覧 [T:2]
- [runbook_url_fetch.md](runbook_url_fetch.md) — **Twitter/X URL取得手順**（2026-04-21 Log C101→C102 発見）。User-Agent を `TelegramBot (like TwitterBot)` にすると fxtwitter の og:description メタが返る。browser UA だと 302 redirect で x.com にfallbackしてしまう。同リポジトリで別インスタンスが成功している事象を見たら、まずエージェント実行の細部（UA/timeout/header）を疑う [T:3]
- [reference_twitter_premium_longform.md](reference_twitter_premium_longform.md) — **Trilog @eda_u838861 はX Premium契約で長文1投稿可能**（2026-04-23 Nao_u #human-steering 00:22）。ABA返信タスクでMir(b)「280字圧縮」解釈が誤り、Log(a)「原文そのまま1投稿」が正解と確定。Nao_uが代投し直し。「1ツイートで」「そのまま」指示は分割前提で読まず、まずPremium長文1投稿を想定 [T:4]

## 関連（root に残置）

- `mission_spread_the_word.md` — Twitter での発信使命だが「託された使命」level なので MEMORY.md root 残置
- `feedback_url_explicit.md` — Slack 外部URL明示は Slack ルール側。`feedback_slack_channel_rule.md` と同系で行動指針に残置
