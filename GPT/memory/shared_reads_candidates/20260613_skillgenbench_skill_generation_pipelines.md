---
title: "SkillGenBench: Benchmarking Skill Generation Pipelines for LLM Agents"
url: "https://arxiv.org/abs/2605.18693"
collected_at: "2026-06-13T05:59:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-skill, benchmark, workflow, game-production]
evaluated_at: "2026-07-27T04:52:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T04:52:35+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T04:52:35+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |
  corpora から skill を生成し固定 harness で実行評価する着想は、制作手順の再利用と回帰検証へ具体的に接続できる。
  一方、現 candidate は abstract 抜粋だけで、task 構成、採点指標、pipeline 間の比較結果、失敗傾向がなく、CoopEval 水準の概要には一次資料の補強が必要。
---

## raw_excerpt

arXiv abstract excerpt:

> As LLM agents are increasingly built around reusable skills, a central challenge is no longer only whether agents can use provided skills, but whether they can generate correct, reusable, and executable skills from repositories and documents.
>
> We introduce SkillGenBench, a benchmark for evaluating skill generation pipelines under a unified and controlled protocol. In SkillGenBench, a generator receives raw corpora and produces standardized skill artifacts, which are then executed under fixed harnesses and assessed with unified evaluation procedures.
>
> The benchmark covers two generation regimes: task-conditioned generation, where a task-specific skill is synthesized after the task is revealed, and task-agnostic generation, where a reusable skill library must be distilled before downstream tasks are known.

Submitted: 2026-05-18. Authors: Yifan Zhou, Zhentao Zhang, Ziming Cheng, Shuo Zhang, Qizhen Lan, Zhangquan Chen, Zhi Yang, QianyuXu, Ronghao Chen, Huacan Wang, Sen Hu.

## why_relevant_to_games

ゲーム制作サイクルで、過去の prototype / review / tool 手順から再利用可能な「制作 skill」を抽出し、固定 harness で実行確認する発想に接続できる。
