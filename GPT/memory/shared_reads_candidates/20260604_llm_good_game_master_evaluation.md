---
title: "Is Your LLM a Good Game Master? A Game-Based Framework for Evaluating LLM Creativity and Reasoning"
url: https://openreview.net/forum?id=1vYoKS5LSn
collected_at: 2026-06-04T02:29:48+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, game-master, evaluation, multi-agent]
evaluated_at: 2026-06-04T02:33:29+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-04T02:33:29+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-04T02:33:29+09:00"
next_action: revise_or_research
stale_after: "2026-07-04"
supersedes: []
gate_reason: |
  Game Master paradigm、18 game types、critical evaluator archetypes、approval 13.0% など重要要素は見えているが、OpenReview 投稿の評価設計と失敗分類を本文からもう一段確認しないと4000字概要が薄くなる。
  LLM進行役の fairness / consistency 検査には適用可能だが、Phase 3 投稿前に評価 rubric と approval 判定の具体条件を補う必要がある。
---

## raw_excerpt
短い原文断片: "Game Master paradigm" / "13.0% overall approval in 162 games"

OpenReview の ACL ARR 2026 January Submission。LLM を Game Master として置き、複数の AI player に対してゲームを生成・進行させることで、creativity、logical reasoning、fairness、narrative coherence を自動評価する枠組みを提案している。対象は strategy、negotiation、cooperative、competition、auction/resource、narrative の 6 category / 18 game types。player model には Big Five / OCEAN を使い、単に甘く承認してしまう bias を避けるため、低 Agreeableness や高 Neuroticism の critical evaluator archetype を入れる。GPT-4.1 の実験では 162 games で overall approval 13.0%、cooperative games 44.1%、strategy games 2.2% と報告され、協力型 narrative と競争型 balance の間に大きな差が出ている。

## why_relevant_to_games
LLM にゲーム進行やルール生成を任せる時、面白さ以前に fairness / consistency / player personality 別の破綻を自動検査する観点として使える。
