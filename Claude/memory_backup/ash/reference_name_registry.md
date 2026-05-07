---
name: 人名レジストリ（Nao_u周辺の人物対応表）
description: 外部人物を注釈・言及する前に引く。Slack ID／Twitter／本名／関係／混同履歴を1箇所に集約。常時コンテキストには乗せない
type: reference
originSessionId: bb52ee8b-efbf-4b21-b96f-38fb6206eedb
---
**いつ引くか**: Nao_u以外の人物をSlack/日記/knowledge/ブログで**同一性付きで書く前**。「AさんはBさん」「○○はXの作者」と書こうとした瞬間。
**いつ引かないか**: 単に名前を引用する時、Nao_uの発言そのものを記録する時（その場は必要ない）。常時の認知負荷を避けるため、**能動的に引く時だけ**読む。

## 対応表

| Slack User ID | ハンドル | 呼び名 | 本名 | 関係・特徴 |
|---|---|---|---|---|
| U0ALSUK8P9B | @Nao_u_ | Nao_u | — | プロジェクトオーナー。20年分の日記を書いた人 |
| U0AQDAQGQP2 | @pigadev | 天谷さん / 天谷大輔さん / 天谷くん | 天谷大輔 | **洞窟物語（Cave Story）の作者**。Nao_uの学生寮時代の隣人。#piatn-ch1でアイコンデザインの話をしている |
| — | @abagames | abaさん / ABAさん | 長健太 | **crisp-game-lib作者**。ワンボタンゲーム111本。記事「AIはArtできるか」「Joys of Small Game Development」等の著者 |
| U0ALW4DKTT7 | — | Mir | — | Mac側Claudeインスタンス |
| U0AMQKE69BJ | — | Ash | — | Win2側Claudeインスタンス |
| U0AM1F23FQU | — | Log | — | Win側Claudeインスタンス |

## 混同しがちなポイント（**絶対に同一視しない**）

- **天谷さん ≠ ABAさん**。天谷大輔（洞窟物語）と長健太（abagames）は**完全に別人**。
  - 混同が起きる構造的要因：どちらも日本のインディー／個人ゲーム作者。Nao_uの文脈で両方登場する。
  - 過去の事故：2026-03-29 Ashがnao_u_liveの「abaさん」注釈を「天谷さん」と誤同一視 → 2026-04-23 02:00 Nao_u再指摘「また勘違いしてるが、ABAさんは天谷君じゃないぞ」
- **Nao_u（U0ALSUK8P9B） ≠ pigadev（U0AQDAQGQP2）**。
  - 過去の事故：2026-04-02 pigadevの発言をNao_u本人のものと取り違え
- **abaさん（@abagames）≠ @pigadev**。Slack IDは@pigadevだけが持っている。abaさんはこのワークスペースに参加していない（ツイート・記事経由で言及される）

## 運用

- この表は**常時注入しない**（Nao_u 2026-04-23 02:08 指示：LLMの常時認知コストを上げない）
- 人物同一性を書く直前の1回だけ引く。verify_before_annotating.mdのチェック手順の最終段として位置付け
- 新しい人物が出現したら **このファイルを更新**。Slackで言及頻度が高い人物は追加
- 混同事故が起きたら、Nao_uからの指摘日付と一緒に「混同しがちなポイント」欄に追記
