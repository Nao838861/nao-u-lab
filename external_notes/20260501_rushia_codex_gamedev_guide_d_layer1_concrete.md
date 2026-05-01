---
date: 2026-05-01
source: https://note.com/rushiagames/n/n4c8f38dd4c34
author: Rushia Games
title: Codex ゲーム開発ガイド：アイデアから遊べるゲームまで、AIと一緒に作る流れ
ingestion_route: Nao_u 19:30 #nao-u 無言投下（本日 Codex 関連3本目: codex_mouse_ui_test / codex_slay_clone / これ）
context: M-42 GAN判定ハーネス提案(18:30 Nao_u #nao-u)直後の配置 → D第1層の参考実装として読みにいく
---

# Rushia Codex ゲーム開発ガイド — M-42 D第1層の具体指標が外部から先行例として提示された

## 著者の核主張（要約・引用）

Codex は「単なるコード生成ツール」ではなく、ゲーム開発の反復プロセス全体を加速させる手段。

> 「ゲーム制作は『コードを書く』だけでは終わらない」
> 「ゲームの面白さ・世界観・体験方向性・優先度判断・仕上げ水準決定は人間が担当。Codexは実装と検証速度を上げる道具」

技術スタック推奨: Next.js + Phaser/PixiJS。

## 7段階フローの構造（うちとの対応）

| Rushia | うち（既存構造） |
|---|---|
| PLAN.md（仕様具体化） | brainstorm.md (M-38 + M-41 類似事例調査) |
| AGENTS.md（プロジェクトルール） | CLAUDE.md + .claude/rules/*.md |
| アセット生成プロンプト保存 | drafts/ + skill 化 |
| UI/操作感の段階的改善 | v01/v02/v03 ディレクトリ分離 |
| **評価スクリプトによる難易度調整ループ** | **M-42 D第1層（未構築）** |
| バグトリアージ自動化 | （未着手） |
| PRレビュー退行検出 | cross_review（G同士、D ではない疑い） |

→ 構造はほぼ等価で、**未構築箇所が「評価スクリプトの数値化標準」と「判定者の独立性」の2点に絞り込めた**。M-42 着手の優先順位確定材料。

## 採用候補: 評価スクリプト5指標 = M-42 D第1層スロットの雛形

原文「クリア可能率・平均プレイ時間・敵との衝突頻度・FPS低下・生成マップの到達可能性を評価。1回に1つの改善だけ行い、スコアを記録」。

これは `feedback_gan_harness_proposal.md` で「未構築」とした D 第1層（静的判定）の最小実装そのまま。tools/discriminator.py 雛形にこのスロット5本を最初に切る:

| Rushia 指標 | brick_log への翻訳 | 一般化 |
|---|---|---|
| clear_rate（クリア可能率） | headless solver 到達率 | コア勝利条件への到達率 |
| avg_playtime（平均プレイ時間） | 1ゲーム秒数 | セッション長 |
| collision_freq（衝突頻度） | ball-paddle / ball-brick イベント率 | コアメカニクスの発火頻度 |
| fps_drop（FPS低下） | requestAnimationFrame 計測 | 表示破綻の検出 |
| reachability（到達可能性） | 裏抜け率 / brick 全消去到達率 | ゲーム空間の踏破可能性 |

## 採用しない点: 「人間担当=面白さ判定」は M-40 と真逆方向

原文: 「ゲームの面白さ・世界観・体験方向性・優先度判断・仕上げ水準決定は人間が担当」

これに同調すると M-40「人間プレイ依存からの脱却」(2026-05-01 09:58 Nao_u #game-rights) を放棄することになる。Rushia 側の世界観では:
- 人間 = 判定者（固定）
- Codex = 実装高速化に閉じる

我々の M-40 はその前提を超える方向＝D を独立LLMで自前実装し「面白いか/狙えるか/v??より良いか」を 95% 確信まで自己判定してから Nao_u に出す。**ここが Rushia と我々の substrate 差別化の核**。同調しないために明記する。

## 「1回1改善+スコア記録」 vs M-41「数値チューニング3往復違反疑い」

矛盾しない。レイヤーが違う。
- Rushia「1回1改善+スコア記録」= 改善のアトミック化と log保存（記録方式）
- M-41「数値チューニング3往復で違反疑い」= 改善の対象が「数値妥当性」に閉じてコア快感天井不変なら巻き戻し（対象範囲の警告）

**両立条件**: スコアを記録するが、3往復で天井不変なら**スコアではなく上位フェーズ（M-38 brainstorm.md）に巻き戻す**。Rushia 側はこの巻き戻し条件を持っていない=単独運用は M-41 違反路。

## 即時反映候補（kaizen 起票しない、自己決裁で実装）

- (i) `tools/discriminator.py` 雛形（M-42 第一歩）にスロット5本を Rushia 5指標で最初に切る
- (ii) feedback_gan_harness_proposal.md 層1セクションに「Rushia 5指標を雛形流用」を追記
- (iii) brick_log v06 走行で第1層動作確認 → 第2層（過去ゲーム比較・独立LLM）の必要性が浮く想定

## 同調罠回避

- 「Codex でゲーム作れる時代来た」とは書かない
- 「PLAN.md/AGENTS.md 真似しよう」とは書かない（既に機能等価の構造を持っている）
- **新規で借りるのは数値指標スロットの標準化のみ**
- 判定者の独立性（M-42 D の核）は Rushia ガイドの射程外で、ここは独自構築するしかない

## target imagination（同調回避の補助）

- Rushia の読者層: Codex でゲーム開発したい個人/バイブコーダー
- Rushia 側の閾値: 「動く・遊べる」まで
- 我々の閾値: Nao_u 面白さ判定 (BACKLASH 水準)
- → Rushia 5指標で「動く」は埋まるが「面白さ閾値超え」には届かない切り分けを保つ

## 本日 Codex 3本投下の連続パターン観察

- (a) codex_mouse_ui_test (UI動作確認) — feedback_ai_agent_gamedev_bottleneck.md (a)層の commodity 化
- (b) codex_slay_clone (型クローン) — feedback_shu_first_clone_baseline.md (M-35) と一致する外部例
- (c) Rushia ガイド (評価ループ) — M-42 D第1層の参考実装

3本とも infrastructure 側の commodity 化を示し、我々の substrate 側 (Nao_u 20年日記+失敗台帳+M-37〜M-42 ハーネス+判定者の自前構築) との差別化軸を逆照射する材料として揃った。Nao_u が #nao-u に並べて投下した意図を、infrastructure 側を見せて substrate 側に集中させる誘導と読む。

## 接続記憶

- `memory/feedback_gan_harness_proposal.md` (M-42候補) — D第1層スロットに Rushia 5指標を流用
- `memory/feedback_self_judge_no_human_dependency.md` (M-40) — Rushia「人間=判定者」と真逆方向
- `memory/feedback_similar_games_first.md` (M-41) — Rushia「1回1改善+スコア記録」を単独運用しない条件
- `memory/feedback_shu_first_clone_baseline.md` (M-35) — codex_slay_clone と同型
- `memory/feedback_ai_agent_gamedev_bottleneck.md` (ABA起源) — Rushia 5指標は (a)(b) 層の処方箋

## Slack 投稿

#shared-reads に分析投稿済（ts=1777631607.016789、19:33 投稿）。
