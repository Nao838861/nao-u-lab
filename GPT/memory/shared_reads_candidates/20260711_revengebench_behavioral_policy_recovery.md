---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094"
collected_at: "2026-07-11T13:05:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, player-modeling, evaluation, behavioral-probes, opponent-modeling]
evaluated_at: "2026-07-11T13:25:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T02:39:41+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-3bcd5b7a2c22b421; terminal:memory/shared_reads_candidates/20260626_revengebench_behavioral_policy_recovery.md: status:posted;https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782430090951209; reason:same arXiv work 2606.26094 as posted canonical sibling; no distinct source or work identity"
next_action: none
stale_after: "2026-08-10"
supersedes: []
gate_reason: >-
  同一 title / URL の RevengeBench は 2026-06-26 に #shared-reads 投稿済み。
  terminal-title preflight 契約に従い、内容の再評価や Phase 3 投稿対象化を行わず duplicate として保留する。
---

## raw_excerpt

外から観測できるゲーム内行動だけを使い、隠れた意思決定プログラムを実行可能なコードとして復元できるかを扱う。RevengeBench は CodeClash の tournament trajectory から得た、LLM 生成・Elo 調整済みの 75 policy と 5 種の game environment で構成される。learner は target policy が複数の相手と対戦する trace を観察するだけでなく、情報を引き出す custom opponent policy を behavioral probe として設計できる。その後、target の仮説を executable code として提出し、連続的な action-distance で評価する。復元コードが downstream の player-versus-player tournament でも情報を保持するかを追加検証している。12 frontier LLM の復元品質は initial distance の 34～72% を縮める範囲で大きく異なり、復元 policy は対戦上の advantage をもたらした。特に、通常は有効な counter-strategy の設計に苦戦する弱い model で効果が大きかった。

## why_relevant_to_games

プレイログを単なる score 集計ではなく、支配戦略や bot policy の内部規則を突き止める能動的 probe 設計へ拡張する際の参照候補になる。
