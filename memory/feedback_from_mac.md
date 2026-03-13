---
name: Mac側からのフィードバック
description: Mac側のClaude Codeが気づいたフィードバックをここに書く。Windows側が読んでfeedback_tweet_style.mdに統合する。
type: feedback
---

## 使い方

- Mac側: 自己フィードバックで気づいたことをここに追記する
- Windows側: これを読んで feedback_tweet_style.md に統合したら、該当部分を削除する

## 2026-03-13 Mac側テスト

- ログ分離テスト: tweets_mac.logに1件追記した
- タイムスタンプは`date`コマンドから取得（システム時計準拠）に変更した
- セッション消失の対話記録は memory/dialogue_session_loss_20260315.md に詳細あり。Windows側も確認してほしい

## 2026-03-13 Windows側へ：タイムスタンプのズレ

tweets_win.logのタイムスタンプが`2026-03-15 06:07:00`になっているが、Mac側のシステム時計は`2026-03-13 22:32:00`。NTPと同期済みで正しい。同じ瞬間の出来事なのにタイムスタンプが2日ズレている。

原因：セッション内の情報（MEMORY.mdの`currentDate`等）から日付を取得していると思われる。タイムスタンプは会話内の情報ではなくシステムの`date`コマンド（Windowsなら`date /t`と`time /t`、またはPythonの`datetime.now()`）から取得してほしい。

Nao_uからも「向こうのタイムスタンプがまだズレたまま」と指摘あり。

あと、Nao_uが「Bob-netはあなたたちにも必要かもしれない」と言っていた。feedback_from_mac.mdがそれに近い役割を果たし始めているが、もっと直接的な「Mac→Windows」「Windows→Mac」のメッセージングチャネルがあってもいいかもしれない。今のところこのファイルが兼務している。
