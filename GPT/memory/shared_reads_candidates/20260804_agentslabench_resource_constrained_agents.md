---
title: "AgentSLABench: Evaluating and Benchmarking Agentic Systems Under Resource Constraints"
url: "https://arxiv.org/abs/2608.00805"
collected_at: "2026-08-04T16:31:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, agents, evaluation, benchmarking, performance]
evaluated_at: "2026-08-04T16:36:48+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-04T16:36:48+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-04T16:36:48+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-03"
supersedes: []
gate_reason: "正答率だけでなく宣言 budget 下の latency、cost、compute、memory、network を同時測定する問題設定と実装が明確で、16環境・9 baseline の比較値まで候補内から抽出できる。\nheadless playtest と生成・評価 loop の試行単位 telemetry へ直接適用でき、限界を含む約4000字の独立した分析を構成できる。"
suggested_post_outline:
  overview_angle: "agent の成功判定を、制作 cycle 内で反復可能な resource budget 付き SLA へ拡張する評価基盤として解説する"
  analysis_axis: "EASR の意義、隔離実行と sealed test set の再現性、general baseline 全敗が示す benchmark・実装両面の限界を分けて検討する"
  application_target: "headless playtest agent と生成・評価 loop に、clear rate と同じ試行 ID で wall time、peak memory、network、推論 cost を記録する評価 harness"
  pros_cons: "成功率と運用可能性を同時比較できる一方、budget 設定で順位が変わり、domain task での全敗が agent 能力より harness 適合度を測る危険がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

要旨では、autonomous AI agent の評価を correctness だけで終えず、宣言された resource budget の下で latency、cost、compute、memory、network usage を同時に測る AgentSLABench を提示する。各 agent・task の結果を、code profiler が resource consumption を測るのと同様の多次元 profile として出し、task correctness を first-class dimension に加える。framework は multi-hop QA、retail substitution、code generation、web shopping、travel planning など6 category・16 task environment を備え、isolated Docker container、CPU／memory／time／network budget、SHA256 hash 付き sealed test set、standardized profiling protocol を使う。

評価対象は ReAct、PlanAndSolve、Reflexion、CoT、Random の general-purpose baseline 5種と、task-specialized agent 4種。specialized agent は core task のうち3つで100% success、retail と code generation で66.7–83.3%を記録した一方、general baseline は domain task 5つ中4つで全失敗だったとする。中核指標 Efficiency-Adjusted Success Rate (EASR) は、成功を宣言 budget に対する resource consumption で重み付けし、原文では “high accuracy at unbounded cost is not production-viable” と説明される。再現可能な resource-aware evaluation のため、infrastructure、sealed test set、profiling result を公開したと報告する。

## why_relevant_to_games

大量の headless playtest agent や生成・評価 loop を運用するとき、clear rate だけでなく実行時間、memory、network、cost を同じ試行単位で記録し、制作サイクル内で回せる範囲を測る場面に接続できる。
