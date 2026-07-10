---
title: "Predicting Game Engagement and Difficulty Using AI Players"
url: "https://arxiv.org/abs/2107.12061"
collected_at: "2026-07-10T22:15:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, difficulty, engagement, ai-players, player-modeling]
evaluated_at: "2026-07-10T22:17:52+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-10T22:17:52+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260710_ai_players_engagement_difficulty.md https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783660317348439"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  同一 title の `memory/shared_reads_candidates/20260710_ai_players_engagement_difficulty.md` が 2026-07-10T14:12:07+09:00 に #shared-reads 投稿済み。
  内容自体は投稿水準だが、Phase 3 の重複投稿対象にはしない。
---

## raw_excerpt

arXiv:2107.12061。Submitted on 26 Jul 2021。Proceedings ACM Human-Computer Interaction, Vol. 5, CHIPLAY, Article 231。著者は Shaghayegh Roohi, Christian Guckelsberger, Asko Relas, Henri Heiskanen, Jari Takatalo, Perttu Hamalainen。

Abstract では、human player behavior and experience を予測するための automated playtesting approach を提示する。既存研究では DRL game-playing agents が average pass rates と churn rates として operationalize された game difficulty と player engagement を予測できることが示されていた。本論文はそこに Monte Carlo Tree Search (MCTS) を組み合わせる。さらに、AI agent の average performance より best-case performance の方が human data と強く相関する場合がある、という観察に基づいて predictor features の選択戦略も提案する。DRL-enhanced MCTS は hardest levels で DRL 単体と vanilla MCTS を上回り、automated playtesting による player modelling では DRL と MCTS の併用、および repeated best AI agent runs の subset 調査が有効になりうると結論づけている。

## why_relevant_to_games

難易度や engagement を、単発のクリア可否ではなく pass/churn と AI player run の特徴量で見る素材。プレイ可能性チェック後の「人間に近い詰まり方」評価へ接続できる。
