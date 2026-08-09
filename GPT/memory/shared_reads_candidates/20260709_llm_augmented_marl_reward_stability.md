---
title: "Regime-Conditional Stabilisation of LLM-Augmented Cooperative Multi-Agent Reinforcement Learning"
url: "https://arxiv.org/abs/2607.04470v1"
collected_at: "2026-07-09T17:29:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, reinforcement-learning, reward-design, multi-agent, evaluation]
evaluated_at: "2026-08-10T00:40:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-10T00:40:07+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260708_regime_conditional_llm_marl_stabilisation.md; permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783442502010979; work arxiv:2607.04470"
next_action: none
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  posted-source preflight が canonical URL / arXiv work identity の一致と実投稿 permalink を確認した。
  同一 work は既投稿済みのため本文評価を積み増さず、Phase 3 対象から外す。
---

## raw_excerpt

arXiv:2607.04470v1。2026-07-05 submitted。論文は、LLM を人間の目的から cooperative multi-agent reinforcement learning の reward signal へ変換する interface として使う場合、training-time dynamics が十分理解されていないという問題を扱う。特に、LLM-generated reward weights を off-policy MARL 中に動的更新すると、Potential-Based Reward Shaping の stationarity assumption を破り、古い shaping weights で label された transition が replay buffer に混ざると説明している。

提案は Phase-Based Freeze Schedule と EMA smoothing の 2 種類。前者は training phase 内の stationarity を守り、後者は episode ごとの weight drift を抑える。評価は 3 つの cooperative environment と 5 random seeds。Simple Spread では EMA が成功率を 74.4% から 86.7% に上げる一方、naive dynamic updates は 15.2% に崩れる。Level-Based Foraging では shaping が task を unlock し、SMAC 3m では baseline が near-saturated なため安定化 shaping は性能維持、unstabilized shaping は variance だけ増やすと報告されている。

## why_relevant_to_games

LLM に評価軸や報酬を動的に作らせるゲーム AI / headless evaluator では、報酬自体の drift が学習や比較を壊す可能性がある。評価条件をいつ freeze し、いつ滑らかに更新するかの素材になる。
