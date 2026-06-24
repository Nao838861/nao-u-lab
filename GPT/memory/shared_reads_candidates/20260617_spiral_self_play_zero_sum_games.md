---
title: "SPIRAL: Self-Play on Zero-Sum Games Incentivizes Reasoning via Multi-Agent Multi-Turn Reinforcement Learning"
url: "https://arxiv.org/abs/2506.24119"
collected_at: "2026-06-17T07:14:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-agent, self-play, reinforcement-learning, reasoning, evaluation, multi-agent]
evaluated_at: "2026-06-17T07:29:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-17T07:29:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-17T07:29:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-17"
supersedes: []
gate_reason: |-
  zero-sum self-play を自動 curriculum として使う着想、TicTacToe / Kuhn Poker / Simple Negotiation、role-conditioned advantage estimation という入口は強い。
  ただし現候補だけでは、学習対象モデル、報酬設計、推論 benchmark への transfer の具体結果、ゲーム別に獲得される認知パターンの差が薄い。Phase 3 の約4000字概要を書くには追加確認が必要。
---

## raw_excerpt
Recent advances in reinforcement learning have shown that language models can develop sophisticated reasoning through training on tasks with verifiable rewards, but these approaches depend on human-curated problem-answer pairs and domain-specific reward engineering. SPIRAL uses multi-turn zero-sum games against continuously improving versions of the same model, generating an automatic curriculum of stronger opponents.

The arXiv listing describes multi-game training on TicTacToe, Kuhn Poker, and Simple Negotiation, with role-conditioned advantage estimation for multi-agent training. It reports transfer to a suite of reasoning benchmarks and notes that different games develop complementary cognitive patterns.

## why_relevant_to_games
ゲームを単なる評価環境ではなく、自己対戦で推論パターンを鍛える curriculum として使う資料。対戦プロトタイプや bot policy 評価の設計観点に接続できる。
