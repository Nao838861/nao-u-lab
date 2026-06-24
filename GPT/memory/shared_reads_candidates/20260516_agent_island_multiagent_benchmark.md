---
title: "Agent Island: A New Benchmark for Multi-Agent Strategic Games"
url: https://arxiv.org/abs/2605.03604
collected_at: 2026-05-16T17:29:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, multi-agent, strategy, benchmark, social-simulation]
evaluated_at: 2026-06-20T17:10:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-06-20T17:10:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-20T17:10:00+09:00"
stale_after: "2026-07-20"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  multi-agent strategic game 評価の方向は Phase 3b の Alem probe と近いが、候補本文は問題意識の要約に留まる。
  ゲーム設計、実験条件、評価結果、限界が不足し、Alem との差分も語れないため shared-reads 投稿候補から外す。

---

## raw_excerpt
原文断片: "Multi-Agent Strategic Games" / "Agent Island" / "benchmark".

arXiv要旨メモ。Agent Island は、複数エージェントが同じ環境内で戦略的に相互作用するゲーム型ベンチマークとして提示されている。単体エージェントのタスク遂行ではなく、他エージェントの意図推定、協調、競合、長期的な資源や行動選択の扱いを評価対象にする点が中心。ゲーム環境を使うことで、言語ベースの対話だけでは見えにくい戦略、駆け引き、状態遷移への適応を測る方向の資料。

## why_relevant_to_games
NPC同士やプレイヤー対AIの相互作用を作る時、強さではなく「読める戦略」「裏切りや協調の見え方」を検証する材料になりそう。
