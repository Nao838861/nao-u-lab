---
title: "Regime-Conditional Stabilisation of LLM-Augmented Cooperative Multi-Agent Reinforcement Learning"
url: "http://arxiv.org/abs/2607.04470v1"
collected_at: "2026-07-08T01:29:23.8841616+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, reinforcement-learning, reward-shaping, game-ai, evaluation]
---

## raw_excerpt

Large Language Models (LLMs) offer a natural interface for translating human objectives into reward signals for cooperative multi-agent reinforcement learning (MARL), yet the training-time dynamics of this integration remain poorly understood. We show that dynamically updating LLM-generated reward weights during off-policy MARL violates the stationarity assumption of Potential-Based Reward Shaping (PBRS) and contaminates the experience replay buffer, whose stored transitions carry reward labels computed under stale shaping weights. We characterise the result as a regime-dependent failure whose severity depends on how competent the unshaped baseline is.

出典メモ: `memory/raw/web_research/results.jsonl` fetched_at 2026-07-08T01:21:02 / query `multi agent LLM drift evaluation` / arXiv:2607.04470v1 / published 2026-07-05T19:29:21Z。

## why_relevant_to_games

LLM に報酬設計や評価重みを任せるゲーム AI / 自動 playtest で、途中から評価軸が変わると学習ログ自体が混ざる問題を拾える。協力ゲームや複数 bot 評価で、報酬 shaping を固定するか履歴分離するかの検討材料。
