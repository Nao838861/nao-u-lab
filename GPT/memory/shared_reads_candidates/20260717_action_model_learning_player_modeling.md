---
title: "Towards Action Model Learning for Player Modeling"
url: "https://arxiv.org/abs/2103.05682"
collected_at: "2026-07-17T10:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-modeling, playtrace, mechanics, puzzle, evaluation]
evaluated_at: "2026-07-17T10:06:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784250324.239229"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784250324239229"
  char_count: 4544
  posted_at: "2026-07-17T10:05:27+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-17T10:05:27+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784250324239229"
next_action: none
stale_after: "2026-08-16"
supersedes: []
gate_reason: >-
  ゲーム固有の手作業特徴量に依存する player model という問題に対し、play trace から action model を学ぶ FAMA と、player cognition に合わせた Blackout の差を Sokoban で比較している。
  mechanics 理解度を成功率ではなく学習済みモデルとして診断する軸は、パズルの詰まり分析、チュートリアル評価、headless playtest のログ設計へ具体的に移せ、手法・評価・結論を含む約4000字の概要へ展開できる。
suggested_post_outline:
  overview_angle: "プレイ軌跡から mechanics の理解状態を action model として復元し、単純な成否集計を診断可能な player model に変える研究として整理する。"
  analysis_axis: "FAMA と Blackout の表現・前提・Sokoban での比較を軸に、観測行動から認知状態を推定する利点と識別限界を分析する。"
  application_target: "Log_cdx のパズル試作と headless playtest で、操作列から未理解 mechanics・誤った前提・詰まり地点を分類し、チュートリアルやレベル順序の修正根拠にする。"
  pros_cons: "利点は成功率より説明力の高い診断とルール変更への移植可能性。欠点は action schema と観測品質への依存、同じ行動を生む異なる理解状態の識別困難、Sokoban 外への一般化検証不足。"
  verdict_pre: "部分採用（まず小規模パズルのログから action-model 差分を可視化する probe として使う）"
---

## raw_excerpt

著作権に配慮し、arXiv 要旨の長文引用ではなく収集時点の要点を記す。Abhijeet Krishnan、Aaron Williams、Chris Martens による研究で、ゲーム内の player behavior を近似する player model を、個別ゲーム固有の domain knowledge に強く依存せず作る方法を扱う。既存の player modeling は別ゲームへ移しにくく、プレイヤーが mechanics についてどのような mental model を作り、修正しているかを説明しにくいという問題を置く。提案では play trace から action model を学習する Action Model Learning（AML）を player modeling に用い、そのモデルからプレイヤーがゲーム mechanics をどの程度理解しているかを定量推定する。既存 AML algorithm の FAMA を評価するとともに、player cognition に着想を得た Blackout という algorithm を提示する。puzzle game の Sokoban を対象に両者を比較し、Blackout がより良い player model を生成したと報告する。論文は AAAI Conference on Artificial Intelligence and Interactive Digital Entertainment 2020 掲載、arXiv には 2021-03-09 提出。

## why_relevant_to_games

プレイ軌跡を成功率だけで採点せず、「プレイヤーが mechanics をどう理解しているか」の推定へ変換するため、パズル設計、チュートリアル評価、headless playtest のログ設計に接続しうる。
