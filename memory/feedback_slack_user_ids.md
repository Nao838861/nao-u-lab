---
name: 人物IDマッピングと混同防止
description: Slack ID→人物の対応表 + ABA≠天谷の混同防止。ABA=@abagames（長健太/STG・ミニゲーム）、天谷=@pigadev（洞窟物語作者）。3回混同事故あり（2026-03-29/04-02/04-23）
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

## 混同厳禁：ABA ≠ 天谷（外部クリエイター識別カード）

| 人物（漢字/カナ） | Twitter | 代表作 | 出典ドメイン | うちでの典型出現 |
|---|---|---|---|---|
| **長健太（ABA / abagames）** | **@abagames** | rRootage / Gunroar / Torus Trooper / crisp-game-lib / **1x111** | `aba.hatenablog.com` | knowledge/2026*_aba_*.md、feedback_game_center_of_mass.md、feedback_ai_agent_gamedev_bottleneck.md |
| **天谷大輔（Pixel）** | **@pigadev** | **洞窟物語/Cave Story** | game.watch / gamedeveloper.com | external_notes_mir.md 2026-03-24、dialogue_fundamental_desire_20260315.md |

**これは完全に別人。3回混同事故が起きている（2026-03-29, 2026-04-02, 2026-04-23）。**
共通点は「著名な個人ゲーム開発者（日本）」だけ。作風も活動領域も全く異なる。

- ABA（長健太さん）: 無限ランダム生成STG系・crisp-game-lib・AI×ゲーム制作の実践者。ブログ `aba.hatenablog.com`、難度曲線設計論
- 天谷大輔さん: 洞窟物語の作者。pigadev は Slack で Nao_u に誘われて参加している友人本人

## 事故履歴

1. **2026-03-29**: Ashが「abaさん（@pigadev）」と事実誤認。Nao_u指摘「abaさんは洞窟物語の開発者じゃないよ」「abaさん = @abagames」。波及先: inbox_mac.md、game_development.md、human-steering.jsonl
2. **2026-04-02**: AshがSlack IDで pigadev/天谷 と Nao_u を取り違え。Nao_uが #human-steering で指摘
3. **2026-04-23 02:00 #human-steering**: Mirがコミットメッセージに「天谷さんABA記事への対応完了」と書き、ABA記事を天谷の記事と混同。Nao_u指摘「また勘違いしてるが、ABAさんは天谷君じゃないぞ。これも何度も繰り返してるが、今の記憶システムは名前を覚えるのが苦手だね」——**3回目の同種指摘**

## Why（構造的原因）

1. Slack JSONL はユーザーIDしか持たず、人間名に変換されない
2. LLMは「著名な個人ゲーム開発者（日本人）」という共通カテゴリで統合してしまう。固有名が圧縮されると入れ替わりやすい
3. 3インスタンス閉鎖系で外部訂正者が少なく、一度インスタンス内で混同した記述が相互参照で増幅する
4. ABA シリーズ記事が積み上がったこと（2024-12/2026-02/2026-03/2026-04）で**引用頻度が増加した結果、混同リスクも比例増加**
5. これまで記憶にABAの個別識別エントリがなく、「ABA=@abagames」が明示的に刻まれていなかった

## How to apply（再発防止の運用ルール）

1. **ABA/abaさん/長健太/abagames を扱う記述には、同一段落内に `@abagames` ハンドルを1回必ず入れる**。省略禁止
2. **天谷さん/Pixel/洞窟物語 を扱う記述には、同一段落内に `@pigadev` または「Cave Story作者」を1回必ず入れる**
3. 「ABA」「天谷」「abagames」「pigadev」のいずれかを書く前に、このファイルの表を想起して確認する
4. Slack 投稿・コミットメッセージの前に「この記述で ABA と天谷が混ざっていないか」の自己点検を草稿に入れる（draftsファイル冒頭コメント推奨）
5. 他インスタンスのテキスト（inbox/対話ログ/external_notes）を引用する前に、このカードで名前を照合
6. 記憶ファイルの `description:` フロントマターに人物名を書くときも、必ずハンドルを併記
7. Slackログを読む時は、ユーザーIDマッピング表で人物に変換してから解釈する

## 構造強制候補（Nao_u 2026-04-23 02:08 却下・保留）

**2026-04-23 02:08 #human-steering Nao_u 明言**:
> 必ずしもミスゼロを目指す必要はないので機械的なブロックまではしなくていいし、LLMの常時の認知コストが上がりすぎない範囲で、なにかいい場所に対応表みたいなのはあってもよいかも。必要な時だけ引けるやつ。この辺さじ加減が難しいね。

このファイル自体が「必要な時だけ引ける対応表」の置き場として機能する位置付けで確定。以下は**実装しない**:

- ~~`tools/name_lint.py`~~ (機械的ブロックは過剰)
- ~~`session_primer.md` への強制想起昇格~~ (常時コスト増になる)

**代わりにやること**: 書く前に不安を感じたら grep `ABA\|天谷\|abagames\|pigadev` でこのファイルを開く。LLM 自身の判断に委ねる運用。
