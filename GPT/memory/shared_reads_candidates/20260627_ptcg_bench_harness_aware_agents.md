---
title: "PTCG-Bench: Can LLM Agents Master Pokemon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653v1"
collected_at: "2026-06-27T13:47:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, strategy-game, benchmark, harness, self-evolution]
status: failed
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: failed
stale_after: "2026-07-27"
supersedes: []
last_reviewed_at: "2026-07-27T02:39:33+09:00"
last_decision: failed
evidence: "group_handoff:gha-0ff8c395ef1f8f05; terminal:memory/shared_reads_candidates/20260530_ptcg_bench_self_evolving_game_agents.md: status:posted;https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780075916989739; reason:same arXiv work 2605.29653 as posted canonical sibling; no distinct source or work identity"
next_action: none

duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt
Given a strategically complex board game, human players can quickly learn to devise strategies after playing a few rounds. Autonomous agents require similar capabilities in realistic interactive environments, yet existing agent benchmarks often fail to fully capture such strategic and evolving decision-making scenarios. We present PTCG-Bench, a benchmark built on the Pokemon Trading Card Game (PTCG) that evaluates LLM agents at two complementary levels: (1) their decision-making performance within a single complex environment, and (2) their ability to self-evolving through accumulated experience. We further include a modular harness ablation to better interpret agent performance without conflating it with model capability. Our experiments show that, although LLM agents can achieve non-trivial gameplay performance, sustained and stable self-evolution remains challenging, and performance is sensitive to harness design.

## why_relevant_to_games
ゲーム AI の評価で model 能力と harness 設計を分ける話。headless 評価や bot policy 比較を作る時の観測項目候補になる。
