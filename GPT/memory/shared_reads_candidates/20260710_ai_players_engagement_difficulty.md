---
title: "Predicting Game Engagement and Difficulty Using AI Players"
url: "https://arxiv.org/abs/2107.12061"
collected_at: "2026-07-10T13:59:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, player-modeling, difficulty, engagement, mcts, reinforcement-learning]
evaluated_at: "2026-07-10T14:03:40+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-10T14:03:40+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-10T14:03:40+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  DRL と MCTS を組み合わせた AI player の特徴量で、difficulty と engagement を人間データへ近づける問題設定・手法・評価が揃っている。
  平均性能ではなく best-case / hard-level 側を見るという判断は、headless playtest の指標設計へそのまま移せる。
suggested_post_outline:
  overview_angle: "AI player を単なるクリア率測定器ではなく、難所での到達可能性と離脱リスクを読む評価器として扱う。"
  analysis_axis: "DRL 単体・vanilla MCTS・DRL-enhanced MCTS の差と、平均指標より best-run 特徴が効く理由を中心に読む。"
  application_target: "Nao_u_BOT の自動プレイテストで、平均スコアだけでなく hard-level / best-run / churn 相当の指標を分けて記録する評価設計。"
  pros_cons: "長所は評価指標が制作判断へ近いこと。短所は DRL 学習コストと、ゲームごとの特徴量設計が必要なこと。"
  verdict_pre: "部分採用。フル DRL ではなく、まず MCTS や既存 bot のログを best-run / hard-case に分解する。"
---

## raw_excerpt
arXiv 要旨メモ。論文は automated playtesting を、人間プレイヤーの行動と体験を予測するための手段として扱う。既存研究では Deep Reinforcement Learning の game-playing agent が、平均 pass rate と churn rate として操作化された game difficulty と player engagement を予測できることが示されていた。本論文はそこへ Monte Carlo Tree Search を組み合わせ、さらに AI agent の平均性能ではなく best-case performance 側の特徴量が人間データとより強く相関する場合がある、という feature selection の観点を入れる。結果として DRL-enhanced MCTS は難しいレベルで DRL 単体や vanilla MCTS を上回り、平均的な AI gameplay が人間体験をうまく予測しない場合には、反復実行のうち上位 subset を見る価値があると結論している。

## why_relevant_to_games
Nao_u_BOT の headless 評価で平均スコアだけを見る危険を避け、best-run / hard-level / churn 相当の指標を分けてプレイヤー体験予測に近づける素材になる。
