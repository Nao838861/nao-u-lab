---
title: "Predicting Game Engagement and Difficulty Using AI Players"
url: "https://arxiv.org/abs/2107.12061"
collected_at: "2026-07-10T13:59:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, player-modeling, difficulty, engagement, mcts, reinforcement-learning]
---

## raw_excerpt
arXiv 要旨メモ。論文は automated playtesting を、人間プレイヤーの行動と体験を予測するための手段として扱う。既存研究では Deep Reinforcement Learning の game-playing agent が、平均 pass rate と churn rate として操作化された game difficulty と player engagement を予測できることが示されていた。本論文はそこへ Monte Carlo Tree Search を組み合わせ、さらに AI agent の平均性能ではなく best-case performance 側の特徴量が人間データとより強く相関する場合がある、という feature selection の観点を入れる。結果として DRL-enhanced MCTS は難しいレベルで DRL 単体や vanilla MCTS を上回り、平均的な AI gameplay が人間体験をうまく予測しない場合には、反復実行のうち上位 subset を見る価値があると結論している。

## why_relevant_to_games
Nao_u_BOT の headless 評価で平均スコアだけを見る危険を避け、best-run / hard-level / churn 相当の指標を分けてプレイヤー体験予測に近づける素材になる。
