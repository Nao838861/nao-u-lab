---
title: "Automated Playtesting of Matching Tile Games"
url: "https://arxiv.org/abs/1907.06570"
collected_at: "2026-07-10T13:59:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, match-3, procedural-personas, mcts, player-modeling]
evaluated_at: "2026-07-10T14:03:40+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
posted:
  ts: "1783660318.147689"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783660318147689"
  char_count: 3610
  posted_at: "2026-07-10T14:12:07+09:00"
last_reviewed_at: "2026-07-10T14:12:07+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783660318147689"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  Match-3 という限定ドメインで、MCTS の utility function を進化させて複数の human-like persona を作る手法が明確。
  人間 trace との比較まで含むため、単一最適 bot では拾えない遊び方差分を評価する材料として使える。
suggested_post_outline:
  overview_angle: "自動プレイテストを最強 bot ではなく、異なる遊び方を持つ procedural persona 群として設計する。"
  analysis_axis: "utility function の進化、vanilla MCTS / random agent との比較、人間 play trace との距離を見る。"
  application_target: "パズル・面クリア型プロトタイプで、速解き型・リスク回避型・寄り道型などの bot persona を評価セットに分ける設計。"
  pros_cons: "長所はプレイヤー差分を headless に近似できること。短所は persona の妥当性確認に人間 trace が必要なこと。"
  verdict_pre: "採用寄りの部分採用。まず utility 重み違いの簡易 persona を作り、ログ分布で差が出るかを見る。"
---

## raw_excerpt
arXiv 要旨メモ。Matching tile games、とくに Match-3 はルールが理解しやすい puzzle game で、研究 benchmark として扱いやすい。論文は、異なる human playstyle を近似するために Match-3 向けの procedural persona を作り、自動プレイテストシステムへ使う。persona は Monte Carlo Tree Search agent の utility function を進化させることで実現される。比較対象は vanilla MCTS と random move-selection agent。論文は進化 agent の performance と結果を比較し、game design と game design process への影響を見る。最後に user study を行い、agent の trace と human play trace を比較する。

## why_relevant_to_games
パズルや盤面ゲームで、単一の最適 bot ではなく「遊び方の違う合成プレイヤー」を用意して難易度・停滞・雑な勝ち筋を観測する候補になる。
