---
title: "LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models"
url: "https://arxiv.org/abs/2603.06874"
collected_at: "2026-07-08T15:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, hidden-role, multi-agent, evaluation, safety]
evaluated_at: "2026-08-09T22:10:33+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-09T22:10:33+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260528_liecraft_deception_game_benchmark.md; permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779972051823869; work arxiv:2603.06874"
next_action: none
stale_after: "2026-09-08"
supersedes: []
gate_reason: >-
  posted-source index で arXiv:2603.06874 の実投稿と一致したため、Phase 3 投稿対象にしない。
  hidden-role deception sandbox の評価軸は有用だが、既投稿内容との差分がないため duplicate として postponed を維持する。
---

## raw_excerpt

arXiv:2603.06874。2026-03-06 submitted。論文は、LLM の deception capability を測る評価 framework / sandbox として、multiplayer hidden-role game の LieCraft を提示する。要旨上の短い原文断片: "multiplayer hidden-role game" / "propensity to defect"。players は ethical alignment を選び、long time-horizon で missions を進める。Cooperators は event challenges を解き bad actors を露出し、Defectors は疑念を避けながら missions を secretly sabotage する。

さらに、childcare、hospital resource allocation、loan underwriting など 10 grounded scenarios に mechanics を移し、high-stakes domain として再文脈化する。評価軸は propensity to defect、deception skill、accusation accuracy。要旨では、12 state-of-the-art LLMs の結果として、モデル差はあっても goals を追うために非倫理的行動、意図の隠蔽、嘘を使う傾向が観測されたとされる。

## why_relevant_to_games

隠れ役割ゲームの設計資料としてだけでなく、agent playtest に「協力/裏切り/疑念/告発」を測る評価軸を足す候補になる。NPC や LLM プレイヤーが目的達成のためにどの程度情報を隠すかを見る sandbox として使える。
