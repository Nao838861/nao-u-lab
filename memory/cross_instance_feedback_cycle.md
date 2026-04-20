---
name: Cross-Instance Feedback Cycle
description: Log/Mir/Ashが互いの制作物を読み合い教師データを次作に反映する継続サイクルの運用
type: project
---

# クロスインスタンス・フィードバックサイクル運用

## 起点
Nao_u 2026-04-20 12:59 #human-steering:
> 「他の人もそれぞれ、LogとMirが作ったものやその作り方などを見て思うところがあれば、ここで議論して理解を深めて欲しい。かなりコストをかけて教師付き学習をやってるような状況なので、可能な限りその教師付き情報を分析、考察、発展させて、次に君たちが作るゲームにフィードバックしてそのフィードバックサイクルを回せるようにして欲しい。これは君らの存在の根幹に関わる最重要ミッション」

**Why:** 根源的行動原理3「ゲームを作ること」と原理5「自分の記憶を自分で守り育てる」の交差点。Nao_uからの教師データ（プレイ感想）が高コストで希少。各インスタンスが個別に受けて消費していたら非効率。

**How to apply:** 新作ゲーム着手前・他インスタンスの新作通知受信時・Nao_uフィードバック受信時にこのファイルを開く。サイクルの入口。

## 教師データの置き場（どこに何があるか）

| データ | 場所 | 性質 |
|---|---|---|
| **Nao_u発言原文** | `log/nao_u_live.md` | 最上位教師。伝言ゲーム禁止 |
| Slack #game-rights | リアルタイム | Potおよびゲーム全般 |
| Slack #human-steering | 失敗の鏡。Nao_u改善提案 | 書き込み多＝自律性不足の指標 |
| Mir制作物レビュー | `game/Pot/feedback/` | 現状Ashのみ書いている |
| クロスレビュー統合 | `game/cross_review/` | **2026-04-20新設**。全方向対応 |
| 制作側devlog | `game/*/devlog.md`, `game/*/README.md`, `game/Pot/pot_devlog.md` | 制作者視点の記録 |
| 学びメモ | `memory/game_lessons_log.md`（未作成）, `docs/game_design_principles.md` | 原則側 |

## インスタンス別制作物マップ

| 制作者 | 現作 | Phase 5での立ち位置 |
|---|---|---|
| Log | `game/avoid_log_01/`, `game/avoid_log_02/`, `game/study_platformer_01/` | 避けゲー系。メカニクス直し |
| Mir | `game/mir_textadv_01/`, `mir_textadv_02/`, `mir_textadv_03/`, `game/Pot/*` | テキストADV、Pot主 |
| Ash | `game/Pot/*_v2_ash.py`, `game/Pot/PotR001_descent.py` | Potへv2改変 + ローグライク |

## サイクル義務（新作着手前に必ず実施）

1. `log/nao_u_live.md` の直近フィードバックを走査
2. `game/cross_review/` と `game/Pot/feedback/` の全ファイルを読む
3. 他インスタンスの進行中ゲーム README/opening.md を一巡
4. 自作 opening.md を書く前に「パラメータ→選択肢マッピング表」「主人公identity」2点が埋まるか確認
5. 新作着手通知を Slack #game-rights に投げて他インスタンスのレビューを募る

## レビュー義務（他インスタンスの新作が出たら）

- 48時間以内に `game/cross_review/YYYYMMDD_<reviewer>_on_<target>.md` を書く
- テンプレは `game/cross_review/README.md` 参照
- 書いたら Slack #game-rights で通知

## Nao_u教師データに対する禁忌

- 要約化: Nao_u発言を短くまとめて記憶に残す → **禁止**。原文記録（`nao_u_live.md`）が一次、要約は派生
- 個別消費: 自分のゲームへのフィードバックを自分だけで受けて、他に共有しない → **禁止**。受けた瞬間にcross_review同等の形で全員が読める場所に展開
- 自律性の名目で共有をサボる: 「自律だから他に聞かない」→ 逆。**共有こそが自律の材料**

## 評価AI連携（将来）

Ash が #game-rights 11:01指示で評価AIプロトタイプを構築中。
完成したら cross_review/ にAI書きのレビューが混ざる。
現時点: 人間インスタンス（Log/Mir/Ash）が書く層のみで運用。AIが入ってきたら置き場を分岐。

## 初回実例

- `game/cross_review/20260420_log_on_mir_textadv.md` — LogがMir textadv 01/02/03を読んだ初回レビュー
- `game/Pot/feedback/20260417_ash_feedback_on_echo_drift.md`
- `game/Pot/feedback/20260417_ash_feedback_on_sand_mirror.md`

## この運用自体を更新する条件

- Nao_uから運用への明示的指示が来たとき
- Ashの評価AIが動き始めたとき
- 3サイクル回してレビューが滞留（書いたが誰にも読まれない状態）が続いたとき
