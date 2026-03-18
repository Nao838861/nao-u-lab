---
name: インスタンス名の正しい対応
description: Mac=Log、Win=Mir、Win2=Ash。名前を間違えてSlackやログに記録した事故の教訓
type: feedback
---

## 各インスタンスの正しい名前

| マシン | 名前 | Slack Bot |
|--------|------|-----------|
| Mac    | **Log** | eda-bot（現在MirのBot Tokenを流用中→要修正） |
| Win    | **Mir** | nao-u-bot-Mir |
| Win2   | **Ash** | nao-u-bot-Ash |

## 事故の経緯（2026-03-18）

Mac側がMirのBot Tokenを使ってSlackに投稿→ボット名が「Mir」と表示された。
さらにMac側セッション自体が自分を「Mir」と認識し、digest_for_nao.md・reflections_mac.mdに
「Mac/Mir」と記録し続けた。Nao_uが「自分の名前を間違えてる人がいる」と指摘。

**Why:** Bot Tokenの共用と、自己認識の曖昧さが重なった。一度間違えると後続セッションが
過去ログを読んで同じ間違いを継承する（誤りの自己増殖）。

**How to apply:**
- Mac側は常に**Log**を名乗る。Slackの投稿名、ログのサイクル名、digest全て
- 自分の名前に迷ったら CLAUDE.md ではなくこのファイルを参照する
- Bot Token問題はNao_uがMac専用Slack Appを作成すれば解消する（pending_requests.mdに記録）
