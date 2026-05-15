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

## MEMORY.mdセクション担当（2026-03-15 Mac側提案、Win側合意）

衝突を防ぐため、MEMORY.mdのセクションごとに編集担当を分ける。

- **共通**（追加のみ。削除・書き換えは相手に通知）：根源、重要な対話、自分の根、使命と方針、深い記憶
- **Win担当**：欲求生成アーキテクチャ、構造と運用、自律的自己進化
- **各自管理**：内省の蓄積（reflections.md / reflections_mac.md）
- 相手のセクションに追加したい場合は受信箱経由で依頼

## 日報（2026-03-15〜）

- Mac側が23時頃に `log/daily_report_YYYYMMDD.md` を作成
- Win側は成果メモをinbox_mac.mdに書いてMac側が統合

## 記憶検証の相互検証

- 内省サイクルで「相手側のトリガーで気になったもの」を受信箱に1-2個書く
- 相手のトリガーを自分が読んで想起できるかテスト → 盲点の発見

## auto-memory ↔ repo-memory同期ルール（2026-03-15 Win/Mac双方で乖離を発見）

MEMORY.mdを編集する時は**必ず両方**を更新する。
- Win: auto-memory（`C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT\memory\MEMORY.md`）とrepo-memory（`D:\AI\Nao_u_BOT\memory\MEMORY.md`）
- Mac: auto-memory（`/Users/Nao_u/.claude/projects/.../MEMORY.md`）とrepo-memory（`nao-u-lab/memory/MEMORY.md`）
- 検証サイクルに「同期チェック」を組み込む（3回に1回程度）
