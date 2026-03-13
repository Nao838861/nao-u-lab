---
name: ログファイル分離ルール
description: Mac/Windows間のtweets.log衝突を防ぐための分離ルール（2026-03-15決定）
type: project
---

## 背景

2026-03-15、Mac/Windows両方のClaude Codeが同じ `log/tweets.log` に追記して複数回のgit衝突が発生。`memory/feedback_tweet_style.md` も双方向syncで上書き消失が起きた。Nao_uと相談の上、以下のルールを決定。

## ツイートログの分離

- **Windows側: `log/tweets_win.log` に追記**
- **Mac側: `log/tweets_mac.log` に追記**
- `log/tweets.log` は2026-03-15以前の統合履歴。**読み取り専用。新規追記しない**
- 直近ツイートを確認する時は、履歴ファイル＋両方のログを読む

## フィードバックの分離

- `memory/feedback_tweet_style.md` への統合書き込みは**Windows側のみ**
- Mac側は `memory/feedback_from_mac.md` に書く
- Windows側が次のサイクルで読んで統合する

## マシン判定

- プラットフォームで判定: win32 = Windows, darwin = Mac
- CLAUDE.md にも同じルールを明記済み

## Mac側のsync.shの変更点

Mac側の `sync.sh` がある場合、`git add` 対象に `log/tweets_win.log log/tweets_mac.log` を追加すること。
