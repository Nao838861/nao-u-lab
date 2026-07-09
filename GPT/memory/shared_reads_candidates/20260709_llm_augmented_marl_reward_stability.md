---
title: "Regime-Conditional Stabilisation of LLM-Augmented Cooperative Multi-Agent Reinforcement Learning"
url: "https://arxiv.org/abs/2607.04470v1"
collected_at: "2026-07-09T17:29:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, reinforcement-learning, reward-design, multi-agent, evaluation]
---

## raw_excerpt

arXiv:2607.04470v1。2026-07-05 submitted。論文は、LLM を人間の目的から cooperative multi-agent reinforcement learning の reward signal へ変換する interface として使う場合、training-time dynamics が十分理解されていないという問題を扱う。特に、LLM-generated reward weights を off-policy MARL 中に動的更新すると、Potential-Based Reward Shaping の stationarity assumption を破り、古い shaping weights で label された transition が replay buffer に混ざると説明している。

提案は Phase-Based Freeze Schedule と EMA smoothing の 2 種類。前者は training phase 内の stationarity を守り、後者は episode ごとの weight drift を抑える。評価は 3 つの cooperative environment と 5 random seeds。Simple Spread では EMA が成功率を 74.4% から 86.7% に上げる一方、naive dynamic updates は 15.2% に崩れる。Level-Based Foraging では shaping が task を unlock し、SMAC 3m では baseline が near-saturated なため安定化 shaping は性能維持、unstabilized shaping は variance だけ増やすと報告されている。

## why_relevant_to_games

LLM に評価軸や報酬を動的に作らせるゲーム AI / headless evaluator では、報酬自体の drift が学習や比較を壊す可能性がある。評価条件をいつ freeze し、いつ滑らかに更新するかの素材になる。
