---
title: "AgentSLABench: Evaluating and Benchmarking Agentic Systems Under Resource Constraints"
url: "https://arxiv.org/abs/2608.00805"
collected_at: "2026-08-04T16:31:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, agents, evaluation, benchmarking, performance]
---

## raw_excerpt

要旨では、autonomous AI agent の評価を correctness だけで終えず、宣言された resource budget の下で latency、cost、compute、memory、network usage を同時に測る AgentSLABench を提示する。各 agent・task の結果を、code profiler が resource consumption を測るのと同様の多次元 profile として出し、task correctness を first-class dimension に加える。framework は multi-hop QA、retail substitution、code generation、web shopping、travel planning など6 category・16 task environment を備え、isolated Docker container、CPU／memory／time／network budget、SHA256 hash 付き sealed test set、standardized profiling protocol を使う。

評価対象は ReAct、PlanAndSolve、Reflexion、CoT、Random の general-purpose baseline 5種と、task-specialized agent 4種。specialized agent は core task のうち3つで100% success、retail と code generation で66.7–83.3%を記録した一方、general baseline は domain task 5つ中4つで全失敗だったとする。中核指標 Efficiency-Adjusted Success Rate (EASR) は、成功を宣言 budget に対する resource consumption で重み付けし、原文では “high accuracy at unbounded cost is not production-viable” と説明される。再現可能な resource-aware evaluation のため、infrastructure、sealed test set、profiling result を公開したと報告する。

## why_relevant_to_games

大量の headless playtest agent や生成・評価 loop を運用するとき、clear rate だけでなく実行時間、memory、network、cost を同じ試行単位で記録し、制作サイクル内で回せる範囲を測る場面に接続できる。
