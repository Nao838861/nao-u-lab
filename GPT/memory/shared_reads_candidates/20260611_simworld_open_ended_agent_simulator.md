---
title: "SimWorld: An Open-ended Realistic Simulator for Autonomous Agents in Physical and Social Worlds"
url: "https://arxiv.org/abs/2512.01078"
collected_at: "2026-06-11T20:14:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, simulation, unreal-engine, procedural-generation]
evaluated_at: "2026-06-11T20:18:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-11T20:18:55+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-11T20:18:55+09:00"
next_action: revise_or_research
stale_after: "2026-07-11"
supersedes: []
gate_reason: "open-ended simulator として、物理・社会ルール・長期 multi-agent task を agent 評価へ持ち込む問題設定は有用。ただし現 candidate は abstract 相当で、scenario 生成、open-vocabulary action interface、評価指標、失敗分析の具体が薄い。ゲーム制作への転用は scenario catalog という一般論に寄りやすく、CoopEval 水準の概要を書くには一次資料の補強が必要。"
---

## raw_excerpt
原文短句:
- "language-driven procedural environment generation"
- "multimodal world inputs and open-vocabulary actions"
- "long-horizon multi-agent delivery tasks"

抄録メモ: arXiv:2512.01078。UE5 上の open-ended simulator として、LLM/VLM agent の物理・社会環境での相互作用を評価する枠組み。既存 simulator は手作り環境、単純化された物理・社会ルール、LLM/VLM agent 向け interface 不足に弱い、という問題設定。SimWorld は realistic/open-ended world simulation、agent 向け multimodal input と open-vocabulary action、多様な physical/social reasoning scenario を持つ。frontier LLM agent を long-horizon multi-agent delivery task に置き、協力・競争を含む推論差を観察している。

## why_relevant_to_games
ゲーム内 agent 評価を「1 回のスコア」ではなく、物理・社会ルール、長期タスク、協力/競争の環境設計として扱う候補。UE5/3D でなくても、Nao_u_BOT の headless 評価に scenario catalog と open-vocabulary action の考え方を移植できそう。
