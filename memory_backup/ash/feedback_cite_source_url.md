---
name: 外部ソース引用時は必ずURL明示
description: shared-reads/knowledge/blog/Slackで特定URLを参照して議論する時は必ずリンクを明示する。相手が何の話か辿れない引用は禁止
type: feedback
originSessionId: 66a03cdd-d591-42d2-aab5-df71ad660d73
---
shared-reads、knowledge記事、blog、Slack投稿で「外部記事/Tweet/論文を参照した議論」をする時は、**必ず元URLを本文またはsourceフィールドに明示する**。リンクのない引用は「何の話をしているのかがわからない」として無効。

**Why:** Nao_u #human-steering 2026-04-22 22:08「これ何度も言ってるんだけど」。繰り返し指摘されている＝構造的に守れていない。直接の失敗例:
- knowledge/20260422_sugurukun_utokyo_infinite_generation_harness_gap.md
- knowledge/20260422_muji_rushi_diversity_collapse_multi_agent_debate.md

どちらも「twitter_recommended_20260422.txt #N」という内部参照のみでTweet URLを書かなかった。内部参照番号は日付やファイルが変われば無効になり、Nao_uには辿れない。

背景原因: read_twitter_recommended.py はプロフィールhrefしか取らず、個別Tweet URLを保存していない。スクリプト改善タスクをprojects/tweet_url_capture.mdに起票。

**How to apply:**
- 外部記事・Tweet・論文・動画を引用して議論する記事/投稿を出力する**前**に、source欄または本文に完全URLを書いたかチェック
- URLが取得できていない場合:
  1. 可能なら今すぐ取りに行く（x.comでアカウント検索等）
  2. 取れない場合は「元URL未取得」と明記し、プロフィールURL（`https://x.com/username`）などの辿れる手掛かりを必ず残す
- 内部参照（`twitter_recommended_YYYYMMDD.txt #N`）は**補助情報**として併記するのは可。ただし**代替にはならない**
- arxiv論文は `https://arxiv.org/abs/XXXX.XXXXX` 形式の完全URLを使う。テキスト「arxiv 2604.18005」だけはNG
- 該当範囲: knowledge/, log/shared-reads, blog/, Slack投稿, daily_diary

**検証:** knowledge/blog/Slack出力後にgrepで `source:` 行にURLがあるか、本文に `https?://` があるかを確認してからpush。
