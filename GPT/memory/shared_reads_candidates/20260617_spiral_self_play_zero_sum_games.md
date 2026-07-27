---
title: "SPIRAL: Self-Play on Zero-Sum Games Incentivizes Reasoning via Multi-Agent Multi-Turn Reinforcement Learning"
url: "https://arxiv.org/abs/2506.24119"
collected_at: "2026-06-17T07:14:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-agent, self-play, reinforcement-learning, reasoning, evaluation, multi-agent]
evaluated_at: "2026-07-27T11:37:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T11:37:50+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T11:37:50+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  zero-sum self-play、自動 curriculum、role-conditioned advantage estimation の骨格は強い。
  しかし学習対象モデル、報酬設計、benchmark の定量結果、ゲーム別の認知パターン差が候補本文にないため、約4000字の手法解説を支えられず保留する。
---

## raw_excerpt
Recent advances in reinforcement learning have shown that language models can develop sophisticated reasoning through training on tasks with verifiable rewards, but these approaches depend on human-curated problem-answer pairs and domain-specific reward engineering. SPIRAL uses multi-turn zero-sum games against continuously improving versions of the same model, generating an automatic curriculum of stronger opponents.

The arXiv listing describes multi-game training on TicTacToe, Kuhn Poker, and Simple Negotiation, with role-conditioned advantage estimation for multi-agent training. It reports transfer to a suite of reasoning benchmarks and notes that different games develop complementary cognitive patterns.

## why_relevant_to_games
ゲームを単なる評価環境ではなく、自己対戦で推論パターンを鍛える curriculum として使う資料。対戦プロトタイプや bot policy 評価の設計観点に接続できる。
