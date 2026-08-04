---
title: "Personalizing Large Language Model Agents with Small Policy Models"
url: "https://arxiv.org/abs/2608.00215"
collected_at: "2026-08-04T16:30:58+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, npc, personalization, agents, online-learning]
evaluated_at: "2026-08-04T16:36:48+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-04T16:36:48+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-04T16:36:48+09:00"
next_action: revise_or_research
stale_after: "2026-09-03"
supersedes: []
gate_reason: "因子分解、feasible set、residual preference、Thompson sampling という手法の中核とゲームへの接続は具体的。\n一方、候補内には評価 task の条件、比較値、失敗例がなく、CoopEval 水準の評価節を推測なしで書けないため一次資料の補強まで保留する。"
---

## raw_excerpt

要旨では、LLM agent が memory retrieval、tool call、clarifying question、response style の切替を行えても、実行上の選択を個々の利用者へ適応させることは難しいと置く。個別 LLM の fine-tuning は高価または proprietary model では不可能で、prompt や memory は利用者情報を見せることはできても、feedback から実行方針そのものを適応させるとは限らない。提案する FABLE (Factorized Adaptive Bandit Layer for Execution) は、凍結した host agent の外側に置く軽量な per-user policy layer で、実行した action に対する scalar feedback だけを観測する online learning として personalization を定式化する。

FABLE は memory、information acquisition、response の判断を因子分解し、関連する選択肢へ feedback を更新する。探索前に外部指定の feasible set で action を絞り、固定された default-and-cost score に対する user-specific residual preference を Bayesian contextual Thompson sampling で学習する。原文の中核表現は “learns user-specific residual preferences relative to a fixed default-and-cost score”。線形 residual-reward model 下の regret bound、恒常的な feasibility constraint のため識別不能になる preference、anytime-valid false-promotion control も扱う。personalized reasoning、controlled feedback、tool-use の評価では、rule-only control と比べて複数の preference-sensitive behavior を改善しつつ、end-to-end task performance では競争力を維持したと報告する。

## why_relevant_to_games

複数 NPC やテストプレイ agent の基本 policy を共有したまま、player feedback や許可された action set に応じて個別の行動傾向を更新する設計を検討する場面に接続できる。
