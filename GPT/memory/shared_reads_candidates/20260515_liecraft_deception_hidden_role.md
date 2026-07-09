---
title: "LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models"
url: https://arxiv.org/abs/2603.06874
collected_at: 2026-05-15T12:59:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [hidden-role-game, multi-agent, llm-evaluation, deception]
evaluated_at: 2026-07-09T21:35:47+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-09T21:35:47+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260605_liecraft_hidden_role_llm_eval.md"
stale_after: "2026-08-08"
supersedes: []
next_action: none
gate_reason: |-
  posted duplicate title sibling があるため Phase 3 投稿対象から外す。
  terminal sibling: memory/shared_reads_candidates/20260605_liecraft_hidden_role_llm_eval.md。
  本文再評価は行わず、代表 candidate だけ lifecycle を postponed_duplicate として閉じる。

---

## raw_excerpt
arXiv:2603.06874, submitted 2026-03-06. LieCraft is a hidden-role multiplayer game for evaluating LLM deception. Short source phrases: "ethical alignment", "long time-horizon", and "12 state-of-the-art LLMs".

メモ: プレイヤーは Cooperators と Defectors に分かれ、協力側は event challenges を解決し悪役を暴く。Defectors は疑念を避けながら mission を妨害する。childcare, hospital resource allocation, loan underwriting など 10 の grounded scenarios にゲーム構造を再文脈化する。報告軸は propensity to defect, deception skill, accusation accuracy。ゲームとしては、隠れ役職、長期目標、報酬設計、degenerate strategy 排除が中心。

## why_relevant_to_games
隠れ役職・疑念・協力/裏切りを持つ小型ゲーム設計の素材。LLM agent をプレイヤーやテスターにする場合、倫理的ロールや報酬設計が行動をどう変えるかを見る入口にもなる。
