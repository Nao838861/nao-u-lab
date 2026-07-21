---
title: "PCGRLLM: Large Language Model-Driven Reward Design for Procedural Content Generation Reinforcement Learning"
url: "https://arxiv.org/abs/2502.10906"
collected_at: "2026-07-06T13:29:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, reward-design, reinforcement-learning, llm, game-ai]
evaluated_at: "2026-07-06T13:36:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-06T13:36:25+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260516_pcgrllm_reward_design_pcgrl.md"
next_action: none
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  title canonical index で同一 title_key が terminal posted 判定済み。
  reward design の題材は有用だが、Phase 3 の新規投稿対象にはしない。
---

## raw_excerpt
arXiv abstract excerpt:

Reward design is described as pivotal for training game AIs, requiring domain-specific knowledge and human effort. PCGRLLM extends prior work with a feedback mechanism and reasoning-based prompt engineering techniques for LLM-driven reward generation.

The paper evaluates the method on a story-to-reward generation task in a two-dimensional environment using two state-of-the-art LLMs across several reasoning-based prompting methods. The abstract reports substantial improvement over the previous structure, with performance comparable to humans, and frames the result as reducing human dependency in game AI development while supporting creative processes.

## why_relevant_to_games
ゲーム内目標やステージ意図を headless 評価の報酬関数へ変換する時、LLM に何を説明させ何を feedback で直すかの候補になる。
