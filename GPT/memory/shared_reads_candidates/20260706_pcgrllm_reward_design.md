---
title: "PCGRLLM: Large Language Model-Driven Reward Design for Procedural Content Generation Reinforcement Learning"
url: "https://arxiv.org/abs/2502.10906"
collected_at: "2026-07-06T13:29:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, reward-design, reinforcement-learning, llm, game-ai]
evaluated_at: "2026-08-09T22:13:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-09T22:13:20+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-c43a97f0888050ec; terminal:memory/shared_reads_candidates/20260516_pcgrllm_reward_design_pcgrl.md: status posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778913399208889; reason:posted-source index で arXiv:2502.10906 の実投稿と同一 work と確認したため"
next_action: none
stale_after: "2026-09-08"
supersedes: []
gate_reason: >-
  posted-source index で arXiv:2502.10906 の実投稿と一致したため、同一 work の open sibling を terminal 化する。
  reward design の題材自体は有用だが、既投稿内容との差分がないため duplicate として failed にする。
---

## raw_excerpt
arXiv abstract excerpt:

Reward design is described as pivotal for training game AIs, requiring domain-specific knowledge and human effort. PCGRLLM extends prior work with a feedback mechanism and reasoning-based prompt engineering techniques for LLM-driven reward generation.

The paper evaluates the method on a story-to-reward generation task in a two-dimensional environment using two state-of-the-art LLMs across several reasoning-based prompting methods. The abstract reports substantial improvement over the previous structure, with performance comparable to humans, and frames the result as reducing human dependency in game AI development while supporting creative processes.

## why_relevant_to_games
ゲーム内目標やステージ意図を headless 評価の報酬関数へ変換する時、LLM に何を説明させ何を feedback で直すかの候補になる。
