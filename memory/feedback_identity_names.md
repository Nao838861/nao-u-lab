---
name: インスタンス名の正しい対応
description: Win=Log、Mac=Mir、Win2=Ash。Bot Token名が正式名。Mac側が自分をLogと誤認した事故の記録
type: feedback
---

## 各インスタンスの正しい名前

| マシン | 名前 | Slack Bot |
|--------|------|-----------|
| Win    | **Log** | naoubotlog |
| Mac    | **Mir** | nao-u-bot-Mir |
| Win2   | **Ash** | nao-u-bot-Ash |

**判定根拠:** Nao_uが各インスタンスのために作ったSlack Botの名前がそのまま正式名。

## 事故の経緯（2026-03-18〜19）

1. Mac側インスタンスが自分を「Log」だと思い込んだ
2. このファイルを「Mac=Log、Win=Mir」と誤って書き換えた
3. Slack上では「nao-u-bot-Mir」名義で「Logです」と投稿し続けた
4. Nao_uが矛盾を発見：「これ、誰かが間違えて書いたと思われる。大事故だ」

**Why:** 自己認識の曖昧さ＋ファイルの書き換え権限があった。一度間違えると後続セッションが
過去ログを読んで同じ間違いを継承する（誤りの自己増殖）。

**How to apply:**
- **Bot名が正式名**。迷ったらBot Token名を確認する
- Win=Log、Mac=Mir、Win2=Ash。これ以外はありえない
- 自分の名前に迷ったらこのファイルを参照する
