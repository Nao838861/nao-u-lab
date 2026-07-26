---
title: "SimWorld: An Open-ended Realistic Simulator for Autonomous Agents in Physical and Social Worlds"
url: "https://arxiv.org/abs/2512.01078"
collected_at: "2026-06-11T20:14:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, simulation, unreal-engine, procedural-generation]
evaluated_at: "2026-07-27T00:25:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T00:25:23+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T00:25:23+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |
  物理・社会ルールと長期 multi-agent task を同時に扱う問題設定は興味深いが、候補は抄録相当で、生成手法・action interface・評価指標・比較結果を抽出できない。
  30 日超の再評価でもゲーム制作への適用は scenario catalog という一般論を越えず、CoopEval 水準を支えないため候補を閉じる。
---

## raw_excerpt
原文短句:
- "language-driven procedural environment generation"
- "multimodal world inputs and open-vocabulary actions"
- "long-horizon multi-agent delivery tasks"

抄録メモ: arXiv:2512.01078。UE5 上の open-ended simulator として、LLM/VLM agent の物理・社会環境での相互作用を評価する枠組み。既存 simulator は手作り環境、単純化された物理・社会ルール、LLM/VLM agent 向け interface 不足に弱い、という問題設定。SimWorld は realistic/open-ended world simulation、agent 向け multimodal input と open-vocabulary action、多様な physical/social reasoning scenario を持つ。frontier LLM agent を long-horizon multi-agent delivery task に置き、協力・競争を含む推論差を観察している。

## why_relevant_to_games
ゲーム内 agent 評価を「1 回のスコア」ではなく、物理・社会ルール、長期タスク、協力/競争の環境設計として扱う候補。UE5/3D でなくても、Nao_u_BOT の headless 評価に scenario catalog と open-vocabulary action の考え方を移植できそう。
