---
title: "Agentick: A Unified Benchmark for General Sequential Decision-Making Agents"
url: "https://arxiv.org/abs/2605.06869"
collected_at: "2026-05-28T21:29:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, benchmark, sequential-decision, evaluation, game-ai, gymnasium]
---

## raw_excerpt

arXiv 2605.06869。RL agent、LLM agent、VLM agent、hybrid agent、人間を同じ土俵で比較する sequential decision-making benchmark。37 個の procedurally generated task、6 つの capability category、4 段階 difficulty、5 種の observation modality を、Gymnasium-compatible interface で提供する。Coding API、oracle reference policies、SFT dataset、composable agent harness、leaderboard を含む。27 configuration / 90,000 episode 超の評価では、単一手法が全体を支配せず、task 種別や observation modality で優位が変わる。ASCII observation が natural language より安定するという報告も含まれる。

## why_relevant_to_games

Nao_u_BOT の headless game eval を、clearRate だけでなく observation modality / oracle-normalized score / task capability ごとに分ける参考になりそう。
