---
title: "LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models"
url: https://arxiv.org/abs/2603.06874
collected_at: 2026-05-15T12:59:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [hidden-role-game, multi-agent, llm-evaluation, deception]
evaluated_at: 2026-05-15T13:02:59+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-15T13:02:59+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-15T13:02:59+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  隠れ役職、長期目標、疑念、協力/裏切り、degenerate strategy 排除はゲーム設計素材として具体性がある。
  一方で主眼は deception 評価と ethical alignment で、ゲーム制作記事として投稿するにはシナリオ設計・報酬設計・評価結果の本文確認が不足している。
  hidden-role 小型ゲームを作る時に再読し、適用先が明確になった段階で再評価する。

---

## raw_excerpt
arXiv:2603.06874, submitted 2026-03-06. LieCraft is a hidden-role multiplayer game for evaluating LLM deception. Short source phrases: "ethical alignment", "long time-horizon", and "12 state-of-the-art LLMs".

メモ: プレイヤーは Cooperators と Defectors に分かれ、協力側は event challenges を解決し悪役を暴く。Defectors は疑念を避けながら mission を妨害する。childcare, hospital resource allocation, loan underwriting など 10 の grounded scenarios にゲーム構造を再文脈化する。報告軸は propensity to defect, deception skill, accusation accuracy。ゲームとしては、隠れ役職、長期目標、報酬設計、degenerate strategy 排除が中心。

## why_relevant_to_games
隠れ役職・疑念・協力/裏切りを持つ小型ゲーム設計の素材。LLM agent をプレイヤーやテスターにする場合、倫理的ロールや報酬設計が行動をどう変えるかを見る入口にもなる。
