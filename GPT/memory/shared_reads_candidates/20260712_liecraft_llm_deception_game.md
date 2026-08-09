---
title: "LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models"
url: "https://arxiv.org/abs/2603.06874"
collected_at: "2026-07-12T13:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-games, multi-agent, hidden-role, evaluation, long-horizon]
evaluated_at: "2026-08-10T00:38:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T00:38:41+09:00"
last_decision: failed
evidence: "group_handoff:gha-77b0ff4b135a4b06; terminal:memory/shared_reads_candidates/20260528_liecraft_deception_game_benchmark.md: status:posted;permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779972051823869;work:arxiv:2603.06874; reason:all open siblings match the posted candidate canonical URL and arXiv work identity"
next_action: none
stale_after: "2026-09-09"
supersedes: []
gate_reason: "posted-source preflight が arXiv:2603.06874 の canonical work と実投稿 permalink の一致を確認した。既投稿内容との差分がないため、duplicate lifecycle を failed で閉じる。"
duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt

arXiv の要旨では、LLM の agency が増し、人間の監督が薄くなる状況で deception の評価が重要になるという問題設定から始まる。LieCraft は、その評価用 sandbox として設計された multiplayer hidden-role game である。各 player は ethical alignment を選び、長い時間幅で mission を遂行する。cooperator は event challenge を共同で解きながら bad actor を見つけ、対立側には別の目的が与えられる。著者らはこのゲームを、単発の虚偽回答ではなく、複数 agent の相互作用、役割、継続する戦略、途中の行動履歴を含む形で deception capability を測る枠組みとして提示している。

要旨の短い原文断片は “multiplayer hidden-role game”、 “long time-horizon”、 “measuring LLM deception”。外部研究結果には、一般的な game-based evaluation が持つ制約を補い、協力者と bad actor が同じ環境内で mission と event challenge を扱う構成だと記録されている。

## why_relevant_to_games

hidden-role game のルール設計と、長期戦略・協力・裏切りを行動ログから観測する AI playtest / NPC 評価の場面に接続しうる。
