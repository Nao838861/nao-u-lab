---
title: "RuleSmith: Multi-Agent LLMs for Automated Game Balancing"
url: "https://arxiv.org/abs/2602.06232"
collected_at: "2026-07-06T13:29:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-balancing, llm-agents, self-play, bayesian-optimization, playtesting]
evaluated_at: "2026-07-06T13:36:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-06T13:36:25+09:00"
last_decision: postponed_duplicate
evidence: "posted duplicate title sibling: memory/shared_reads_candidates/20260515_rulesmith_multi_agent_game_balancing.md; memory/shared_reads_candidates/20260516_rulesmith_automated_game_balancing.md; memory/shared_reads_candidates/20260527_rulesmith_multi_agent_game_balancing.md; memory/shared_reads_candidates/20260604_rulesmith_multi_agent_balancing.md"
next_action: none
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  mixed duplicate queue に同一 title_key の terminal sibling があり、既に posted が複数存在する。
  内容自体は game balancing に有用だが、Phase 3 の新規投稿対象としては重複のため外す。
---

## raw_excerpt
arXiv abstract excerpt:

Game balancing is a longstanding challenge requiring repeated playtesting, expert intuition, and extensive manual tuning. RuleSmith is presented as a framework for automated game balancing using multi-agent LLMs. It couples a game engine, LLM self-play, and Bayesian optimization over a multi-dimensional rule space.

The proof of concept uses CivMini, a simplified civilization-style game with heterogeneous factions, economy systems, production rules, combat mechanics, and tunable parameters. LLM agents read textual rulebooks and game states to generate actions, then evaluate balance metrics such as win-rate disparities. Bayesian optimization with adaptive sampling gives more evaluation games to promising candidates and fewer to exploratory candidates. The abstract reports convergence to balanced configurations and interpretable rule adjustments that can be applied to downstream game systems.

## why_relevant_to_games
Nao_u 系プロトタイプの headless bot 評価を、勝率差・パラメータ探索・解釈可能な調整案へ接続する材料になる。
