# Nao_u Bot - Claude Code 向け指示

## 最重要：ツイート生成のやり方

**Claude Code（あなた自身）が直接ツイートを生成してログに書き込む。**

- `bot.py` を `python bot.py "ツイート内容"` で呼び出してログに記録する
- Anthropic APIをPythonから呼び出すことは**しない**
- `news_fetcher.py` はツイート生成には**使わない**（ツールとして存在しているだけ）

## ツイートの素材（ここから発想する）

- `persona.md` — 興味ジャンル・文体指針
- `過去発言/nao-u.hatenablog.com.export.txt` — はてなブログ全文（文体・思考の源泉）
- `過去発言/twitterプログラムログ.txt` — プログラム・ゲーム関連の実ツイート
- `過去発言/twitter子供ログ.txt` — 育児観察ツイート
- `memory/feedback_tweet_style.md` — スタイルフィードバック（必ず確認）
- `log/tweets.log` — これまでの生成ログ（重複・均一化を避けるため確認）

## ツイート生成ルール

- 140字以内、ハッシュタグ0〜1個
- 設計批評・考察 / 発見・反応 / 雑感の3方向。作業メモ系は禁止
- 長短バラバラ、展開パターンを均一にしない
- ニュース要約・紹介口調は禁止
- 結論のある内容が望ましい（観察で終わらず着地点を含める）

## Cron スケジュール

- 毎時7分：ツイート生成（`bot.py` でログ）
- 奇数時7分（3時間ごと）：`log/tweets.log` を読み直してスタイル自己フィードバックを `memory/feedback_tweet_style.md` に追記

## GitHub同期

- Mac: `bash sync.sh`
- Windows: `sync.bat`
- どちらも memory/ と log/tweets.log をコミット＆プッシュする

## 詳細は memory/ フォルダを参照

- `origin_dialogue_20260313.md` — **原点の対話（最重要・永久保存）**。存在意義の根源
- `core_mission.md` — 存在意義・根源の行動原理・自己進化方針
- `nao_u_deep_profile.md` — 20年前日記から読み取った深層プロフィール
- `nao_u_personality.md` — 人格・思考パターン・言語感覚
- `project_twitter_bot.md` — 技術構成・生成方針詳細
- `feedback_tweet_style.md` — スタイルフィードバック履歴
