---
title: "R-APS: Compositional Reasoning and In-Context Meta-Learning for Constrained Design via Reflective Adversarial Pareto Search"
url: "http://arxiv.org/abs/2606.04823v1"
collected_at: "2026-06-08T20:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-design, constrained-design, evaluation, iterative-development]
evaluated_at: "2026-06-08T20:48:29+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-08T20:48:29+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-08T20:48:29+09:00"
next_action: revise_or_research
stale_after: "2026-07-08"
supersedes: []
gate_reason: |-
  error localization / worst-case perturbation / stale knowledge invalidation の3分解は、headless評価や自動改修の失敗分類として使える。
  ただしconstrained designでのR-APS本体、Pareto探索の具体手順、評価タスクと結果がcandidate本文だけでは不足しており、Phase 3投稿には追加読解が必要。
---

## raw_excerpt
arXiv / results.jsonl の要旨メモ。Large language models are fluent on open-ended tasks, but in agentic settings, where a system must plan, use tools, and act over extended horizons, fluency does not ensure reliable delivery. 論文は失敗を、errors propagate without localization、worst-case perturbations go unevaluated、accumulated knowledge is never invalidated という 3 つの構造的失敗として整理する。これらは abductive, counterfactual, meta-inductive, corrective, inductive reasoning が shared context を別方向に引っ張ることを root cause と見る。提案は Reflective Adversarial Pareto Search (R-APS)。constrained design に対して、reflection と adversarial search と Pareto 的な複数目的扱いを組み合わせる研究として記録する。

## why_relevant_to_games
ゲームの自動改修で「平均スコアだけ上げる」「過去知識を無効化しない」「最悪ケースを見ない」問題を拾う素材。ヘッドレス評価を best/mean/worst や反例探索に分ける Phase 2 候補。
