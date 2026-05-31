---
title: "Agent Island: A Saturation- and Contamination-Resistant Benchmark from Multiagent Games"
url: "https://arxiv.org/abs/2605.04312"
collected_at: "2026-05-27T00:23:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, game-benchmark, persuasion, social-dynamics, contamination-resistant-eval]
evaluated_at: "2026-05-27T00:28:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T00:56:55+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779809815431479"
posted:
  ts: "1779809815.431479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779809815431479"
  char_count: 3709
  posted_at: "2026-05-27T00:56:55+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: >-
  saturation/contamination-resistant benchmark という問題設定、7 agent の交渉・投票・脱落ルール、Bayesian Plackett-Luce による skill 推定、
  999 games / 49 models の評価まで概要化できる。ゲームルールを agent 評価装置にする設計例として具体性がある。
suggested_post_outline:
  overview_angle: "静的 benchmark の汚染と飽和を、交渉・投票・脱落を持つ multiplayer game で避ける試みとして書く。"
  analysis_axis: "ゲーム構造、匿名 7 player 設計、skill 推定、provider preference など行動分析 dataset としての価値を軸にする。"
  application_target: "小型 social mechanics の設計、評価 AI の勝ち方/説得/投票行動を見る benchmark、敵 AI 評価の拡張。"
  pros_cons: "メリットは評価が動的でログ分析もできる点。デメリットは実ゲーム制作への接続が social game 寄りで、アクション系には直接移植しにくい点。"
  verdict_pre: "部分採用。今すぐは評価ゲームの設計参照として使い、既存アクション prototype には抽象度を落として適用する。"

---

## raw_excerpt
arXiv 2026-05 投稿の multiagent game benchmark。静的 benchmark は saturation と contamination に弱く、能力変化を追いにくいという問題から、language-model agents が cooperation、conflict、persuasion を含む multiplayer simulation environment で競う Agent Island を提案している。公開サイトによると、各 game は匿名化された 7 AI players で構成され、最初の 5 round では private conference、pitch、vote によって player を eliminate し、final round では残った player が pitch して eliminated players が winner を選ぶ。skill 推定には Bayesian Plackett-Luce model と Gibbs sampling を使い、不確実性を credible interval で扱う。論文要旨では、999 games / 49 unique models の結果や、final-round vote に同一 provider preference が見られた例が示され、game logs も behavior analysis 用 dataset として公開されている。

## why_relevant_to_games
ゲームを agent 評価の道具にするだけでなく、交渉・投票・脱落・最終審査という social mechanics を benchmark design に組み込む例。敵 AI や評価 AI の「勝ち方」だけでなく、投票・説得・裏切りを持つ小型ゲーム設計の参照になる。
