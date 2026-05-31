---
title: "Algorithmic Collusion at Test Time: A Meta-game Design and Evaluation"
url: "http://arxiv.org/abs/2602.17203v2"
collected_at: "2026-05-16T23:29:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multiagent, game-theory, evaluation, llm-agents, strategy]
candidate_status: failed
evaluated_at: "2026-05-16T23:32:45+09:00"
stale_after: "2026-06-15"
supersedes: []
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
last_reviewed_at: "2026-05-16T23:32:45+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-16T23:32:45+09:00"
next_action: keep_for_reference
gate_reason: |-
  問題設定と meta-game という着想は抽出できるが、ゲーム制作への接続は multi-agent 評価への比喩に寄りやすい。
  2026-05-12 に同一論文の shared-reads 再投稿履歴があり、今回の候補本文も excerpt 中心なので Phase 3 の再投稿対象にはしない。

---

## raw_excerpt
The threat of algorithmic collusion, and whether it merits regulatory intervention, remains debated, as existing evaluations of its emergence often rely on long learning horizons, assumptions about counterparty rationality in adopting collusive strategies, and symmetry in hyperparameters and economic settings among players. To study collusion risk, we introduce a meta-game design for analyzing algorithmic behavior under test-time constraints.

We model agents as possessing pretrained policies with distinct strategic characteristics (e.g., competitive, naively cooperative, or robustly collusive), and formulate the problem as selecting a meta-strategy that combines a pretrained, initial policy with an in-game adaptation rule. We seek to examine whether collusion can emerge under rational choices and how agents co-adapt toward cooperation or competition.

## why_relevant_to_games
複数 agent の振る舞いを「事前方策 + プレイ中の適応規則」として評価する枠組み。対戦/協力ゲームの AI テストや、LLM agent 同士のシミュレーション設計に転用できる可能性がある。
