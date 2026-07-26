---
title: "Is Your LLM a Good Game Master? A Game-Based Framework for Evaluating LLM Creativity and Reasoning"
url: https://openreview.net/forum?id=1vYoKS5LSn
collected_at: 2026-06-04T02:29:48+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, game-master, evaluation, multi-agent]
evaluated_at: 2026-07-26T14:20:50.2021246+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: 2026-07-26T14:20:50.2021246+09:00
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T14:20:50.2021246+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  Game Master paradigm、18 game types、critical evaluator、category 別 approval は見えるが、approval rubric と判定手順、失敗分類が不足する。
  LLM 進行役の fairness 検査には使えるものの、前回 postpone 時の中核不足が残るため、結果数値を安全に解釈できる共有候補ではない。
---

## raw_excerpt
短い原文断片: "Game Master paradigm" / "13.0% overall approval in 162 games"

OpenReview の ACL ARR 2026 January Submission。LLM を Game Master として置き、複数の AI player に対してゲームを生成・進行させることで、creativity、logical reasoning、fairness、narrative coherence を自動評価する枠組みを提案している。対象は strategy、negotiation、cooperative、competition、auction/resource、narrative の 6 category / 18 game types。player model には Big Five / OCEAN を使い、単に甘く承認してしまう bias を避けるため、低 Agreeableness や高 Neuroticism の critical evaluator archetype を入れる。GPT-4.1 の実験では 162 games で overall approval 13.0%、cooperative games 44.1%、strategy games 2.2% と報告され、協力型 narrative と競争型 balance の間に大きな差が出ている。

## why_relevant_to_games
LLM にゲーム進行やルール生成を任せる時、面白さ以前に fairness / consistency / player personality 別の破綻を自動検査する観点として使える。
