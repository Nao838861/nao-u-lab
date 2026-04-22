---
name: 人物IDマッピングと混同防止
description: Slack ID→人物の対応表 + ABA≠天谷の混同防止。ABA=@abagames（ミニゲーム/STG開発者）、天谷=@pigadev（洞窟物語作者）。繰り返し混同事故あり
type: feedback
---

## SlackユーザーID → 人物の対応

| Slack User ID | 人物 | 備考 |
|---|---|---|
| **U0ALSUK8P9B** | **Nao_u** | ワークスペースオーナー |
| **U0AQDAQGQP2** | **pigadev（天谷大輔さん）** | Nao_uの友達。洞窟物語/Cave Story作者。Twitter: @pigadev |
| U0ALW4DKTT7 | Mir | nao-u-bot-Mir |
| U0AM1F23FQU | Log | naoubotlog |
| U0AMQKE69BJ | Ash | nao-u-bot-Ash |

## 混同厳禁：ABA ≠ 天谷

| 人物 | Twitter | 代表作 | 特徴 |
|---|---|---|---|
| **ABA（長健太）** | **@abagames** | Gunroar, 多数のミニゲーム | STG/ミニゲーム開発。ChatGPT活用ゲーム開発論、難度曲線設計の分析で知られる |
| **天谷大輔（Pixel）** | **@pigadev** | 洞窟物語/Cave Story | 一人で全制作（プログラム・絵・音楽）。Nao_uの友人、Slackに参加 |

**これは完全に別人。3回混同事故が起きている（2026-03-29, 2026-04-02, 2026-04-23）。**
共通点は「著名な個人ゲーム開発者」だけ。作風も活動領域も全く異なる。

## 事故履歴

1. **2026-03-29**: Ashが「abaさん（@pigadev）」と事実誤認。Nao_u指摘「abaさんは洞窟物語の開発者じゃないよ」「abaさん = @abagames」
2. **2026-04-02**: AshがSlack IDでpigadev/天谷とNao_uを取り違え
3. **2026-04-23**: Mirがコミットメッセージに「天谷さんABA記事への対応完了」と書いた——ABAの記事を天谷の記事と混同。Nao_u指摘「また勘違いしてるが、ABAさんは天谷君じゃないぞ。これも何度も繰り返してるが、今の記憶システムは名前を覚えるのが苦手だね」

**Why:** LLMは「著名な個人ゲーム開発者」という共通カテゴリで統合してしまう。記憶にABAの個別エントリがなかったため区別が維持できなかった。

**How to apply:**
- ABAの記事・ブログに言及する時は「ABAさん（@abagames）」と書く。天谷と関連付けない
- 天谷に言及する時は「天谷さん（@pigadev）」と書く。ABAと関連付けない
- 「ABA」「天谷」「abagames」「pigadev」のいずれかを書く前に、このファイルの表を想起して確認する
- Slackログを読む時は、このマッピングでユーザーIDを人物に変換してから解釈する
