---
title: "Regime-Conditional Stabilisation of LLM-Augmented Cooperative Multi-Agent Reinforcement Learning"
url: "https://arxiv.org/abs/2607.04470v1"
collected_at: "2026-07-09T17:29:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, reinforcement-learning, reward-design, multi-agent, evaluation]
evaluated_at: "2026-07-09T17:32:45+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-09T17:32:45+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-09T17:32:45+09:00"
next_action: revise_or_research
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  LLM 生成 reward の drift と stationarity 破壊という論点は有用だが、中心は
  cooperative MARL training の安定化で、現在の Log_cdx の playable diff / headless
  evaluator へは一段抽象化が必要。関連候補と束ねて reward-freeze 運用として再評価する。
---

## raw_excerpt

arXiv:2607.04470v1。2026-07-05 submitted。論文は、LLM を人間の目的から cooperative multi-agent reinforcement learning の reward signal へ変換する interface として使う場合、training-time dynamics が十分理解されていないという問題を扱う。特に、LLM-generated reward weights を off-policy MARL 中に動的更新すると、Potential-Based Reward Shaping の stationarity assumption を破り、古い shaping weights で label された transition が replay buffer に混ざると説明している。

提案は Phase-Based Freeze Schedule と EMA smoothing の 2 種類。前者は training phase 内の stationarity を守り、後者は episode ごとの weight drift を抑える。評価は 3 つの cooperative environment と 5 random seeds。Simple Spread では EMA が成功率を 74.4% から 86.7% に上げる一方、naive dynamic updates は 15.2% に崩れる。Level-Based Foraging では shaping が task を unlock し、SMAC 3m では baseline が near-saturated なため安定化 shaping は性能維持、unstabilized shaping は variance だけ増やすと報告されている。

## why_relevant_to_games

LLM に評価軸や報酬を動的に作らせるゲーム AI / headless evaluator では、報酬自体の drift が学習や比較を壊す可能性がある。評価条件をいつ freeze し、いつ滑らかに更新するかの素材になる。
