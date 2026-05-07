---
name: 勝ったテストプレイは厳しく吟味せよ（headless 数値主義警告）
description: give_up3「勝ったゲームはクソゲー」=テスプで勝てると良く見える錯覚。Nao_u 2026-04-28 #nao-u 19:52 yuo_7/sakimiyamisaki/give_up3 5本投下のうち give_up3 が新規概念
type: feedback
---

# 勝ったテストプレイは厳しく吟味せよ

**起点**: 2026-04-28 19:52 Nao_u #nao-u 無言投下5本のうち give_up3 (https://x.com/give_up3/status/2048847496081007005)

> コツは、やはり「勝ったゲームはクソゲー」である。
> テスプで勝ってしまったゲームはどうしても良さげに見えてしまうので、いつもより厳しい目で吟味しなければならない。
> あと創作はひらめきだが、ブラッシュアップは理論だ。間違って大事な枝を折らないようにディベロップする腕が、必要となる。

## 原則本体

**テスプ（テストプレイ）で勝てた / 数値が良かった ≠ ゲームが面白い**。むしろ「勝った」「数値が出た」は good に見えるバイアスが入るので、**いつもより厳しく吟味する**。

## Why（なぜ我々に直撃するか）

- 我々は headless self-play による数値（BACKLASH 326+/48-, shot_log 死亡数 etc.）を改修判定に使っている
- 数値が良い ≠ 快感審問 OK（feedback_pleasure_element_first）。数値は快感を測れない（feedback_role_split_playtest）
- avoid_log v01 で「弾を撃って敵を壊す快感」が消えていたのに気づかなかったのは、headless 数値が改善方向に動いていたから（M-15）
- 「勝ったテスプはクソゲー」は give_up3 一行で headless 数値主義の罠を言語化している
- ABA「人間の体験を AI に提供せよ」（reference_aba_life_experience_substrate）と同方向。**数値の勝ちは体験ではない**
- yuo_7 投下「中身がないのにバランス調整に拘ると、ゲームが良くなってると錯覚しやすい」（https://x.com/yuo_7/status/2048788186269401239）も同質警告

## How to apply

### headless 数値を出すたびに
devlog に **「勝ったテスプ警告」** ブロックを 3 行で書く:

```markdown
### 勝ったテスプ警告
- 数値: ___（生存数/死亡数/score 等）
- これは快感の証拠か？: なし / ___（具体的に何の快感が出ているか）
- 厳しく吟味するなら: ___（数値が出ていても疑うべき箇所）
```

「これは快感の証拠か？: なし」と書けたら数値は採用根拠にしない。

### 改修採用ゲート
- 数値改善 + 快感審問 OK → 採用
- 数値改善 + 快感審問 不明 → **「勝ったテスプ警告」ブロックを書いてから判断**
- 数値悪化 + 快感審問 OK → 採用候補（数値より快感）
- 数値改善 + 快感審問 NG → **不採用**（M-15 の再発パターン）

### 「ブラッシュアップは理論」の含意
give_up3 は **「創作はひらめき、ブラッシュアップは理論」** とも書いた。これは:
- v01 = 創作 = ひらめき（型 / 快感 / 外発緊張の言語化が要る、feedback_shu_first_clone_baseline / feedback_no_type_redo_material）
- v02 以降 = ブラッシュアップ = 理論（重心審問 / 解空間 / 圧力設計）
- **ひらめきが弱い v01 を理論で補強しても勝てない**（題材から練り直し処方の外部根拠）

## 接続する既存原則

- **feedback_pleasure_element_first**: 数値は快感を測れない、の上位ルール。本記憶はその改修ゲートに「勝ったテスプ警告」を追加する形
- **feedback_role_split_playtest**: Nao_u=感想 / 我々=判断+headless 自己評価。headless が「勝った」を出した瞬間が一番危ない
- **feedback_authorship_attribution**: BACKLASH 326+/48- を Nao_u 共作 framing した件と同根。数値の勝ちを過大評価する癖
- **feedback_completion_before_deployment**: テスプ初期に見極めて閾値未達なら凍結（sakimiyamisaki tweet も同方向）
- **reference_aba_life_experience_substrate**: 体験 vs 数値 の上位思想

## Log 側で実施

- 既存ゲームの devlog に遡及で「勝ったテスプ警告」ブロックを差し込まない（時間溶ける、no_type 判定済の系列に追記する意味薄い）
- **次の Log 新作 v01 から devlog に「勝ったテスプ警告」ブロックを必須化**
- BACKLASH 系列の cross_review レビューでも「数値で勝った瞬間」を疑問符として扱う

## 検証期限

2026-05-12（次の Log 新作で headless 数値を出した時、devlog に「勝ったテスプ警告」ブロックが書かれているか自己確認）

## 関連ファイル

- `memory/feedback_pleasure_element_first.md`
- `memory/feedback_role_split_playtest.md`
- `memory/feedback_no_type_redo_material.md`（v01 で型が無いと「勝ったテスプ警告」も発火しない、ひらめきの問題）
- `memory/game_lessons_log.md` M-15（数値が改善方向に動くと快感消失に気づけなかった事象）
