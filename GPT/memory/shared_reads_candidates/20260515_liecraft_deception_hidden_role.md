---
title: "LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models"
url: https://arxiv.org/abs/2603.06874
collected_at: 2026-05-15T12:59:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [hidden-role-game, multi-agent, llm-evaluation, deception]
evaluated_at: "2026-08-10T00:38:41+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-08-10T00:38:41+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-77b0ff4b135a4b06; terminal:memory/shared_reads_candidates/20260528_liecraft_deception_game_benchmark.md: status:posted;permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779972051823869;work:arxiv:2603.06874; reason:all open siblings match the posted candidate canonical URL and arXiv work identity"
stale_after: "2026-09-09"
supersedes: []
next_action: none
gate_reason: |-
  posted-source preflight が canonical URL / arXiv work identity の一致と実投稿 permalink を確認した。
  同一 work の既投稿重複であり別 candidate として残す差分がないため、duplicate lifecycle を failed で閉じる。

---

## raw_excerpt
arXiv:2603.06874, submitted 2026-03-06. LieCraft is a hidden-role multiplayer game for evaluating LLM deception. Short source phrases: "ethical alignment", "long time-horizon", and "12 state-of-the-art LLMs".

メモ: プレイヤーは Cooperators と Defectors に分かれ、協力側は event challenges を解決し悪役を暴く。Defectors は疑念を避けながら mission を妨害する。childcare, hospital resource allocation, loan underwriting など 10 の grounded scenarios にゲーム構造を再文脈化する。報告軸は propensity to defect, deception skill, accusation accuracy。ゲームとしては、隠れ役職、長期目標、報酬設計、degenerate strategy 排除が中心。

## why_relevant_to_games
隠れ役職・疑念・協力/裏切りを持つ小型ゲーム設計の素材。LLM agent をプレイヤーやテスターにする場合、倫理的ロールや報酬設計が行動をどう変えるかを見る入口にもなる。
