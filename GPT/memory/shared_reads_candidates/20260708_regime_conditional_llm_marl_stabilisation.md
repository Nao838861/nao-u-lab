---
title: "Regime-Conditional Stabilisation of LLM-Augmented Cooperative Multi-Agent Reinforcement Learning"
url: "http://arxiv.org/abs/2607.04470v1"
collected_at: "2026-07-08T01:29:23.8841616+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, reinforcement-learning, reward-shaping, game-ai, evaluation]
evaluated_at: "2026-07-08T01:35:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-08T01:41:51.7158617+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783442502010979"
next_action: none
stale_after: "2026-08-07"
supersedes: []
posted:
  ts: "1783442502.010979"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783442502010979"
  char_count: 3549
  posted_at: "2026-07-08T01:41:51.7158617+09:00"
gate_reason: >-
  LLM 生成 reward weight を訓練中に更新すると PBRS の stationarity を壊し、古い shaping weight でラベル付けされた replay buffer が混ざる、という失敗構造が明確。
  複数 bot 評価、協力ゲーム AI、LLM による報酬設計の履歴分離に直結し、ゲーム制作サイクルでの具体的な禁止条件と設計ルールへ落とせる。
suggested_post_outline:
  overview_angle: "LLM 報酬設計を動的に賢くするほど、off-policy MARL の経験ログが非定常化して壊れるという regime-dependent failure として読む。"
  analysis_axis: "PBRS の stationarity 前提、replay buffer contamination、unshaped baseline の能力によって失敗の強さが変わる点を中心に整理する。"
  application_target: "Log_cdx の自動 playtest / 複数 bot 評価で、評価重みや reward shaping を途中変更する場合のログ分離、run 境界、再学習条件の設計に使う。"
  pros_cons: "メリットは報酬設計の drift を具体的な学習汚染として扱えること。デメリットは MARL 実験寄りで、通常の人間向け prototype 評価には翻訳が必要なこと。"
  verdict_pre: "部分採用。LLM reward 更新そのものではなく、評価軸変更時の履歴隔離ルールとして採用する。"
---

## raw_excerpt

Large Language Models (LLMs) offer a natural interface for translating human objectives into reward signals for cooperative multi-agent reinforcement learning (MARL), yet the training-time dynamics of this integration remain poorly understood. We show that dynamically updating LLM-generated reward weights during off-policy MARL violates the stationarity assumption of Potential-Based Reward Shaping (PBRS) and contaminates the experience replay buffer, whose stored transitions carry reward labels computed under stale shaping weights. We characterise the result as a regime-dependent failure whose severity depends on how competent the unshaped baseline is.

出典メモ: `memory/raw/web_research/results.jsonl` fetched_at 2026-07-08T01:21:02 / query `multi agent LLM drift evaluation` / arXiv:2607.04470v1 / published 2026-07-05T19:29:21Z。

## why_relevant_to_games

LLM に報酬設計や評価重みを任せるゲーム AI / 自動 playtest で、途中から評価軸が変わると学習ログ自体が混ざる問題を拾える。協力ゲームや複数 bot 評価で、報酬 shaping を固定するか履歴分離するかの検討材料。
