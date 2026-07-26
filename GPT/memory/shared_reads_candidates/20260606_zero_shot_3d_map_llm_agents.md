---
title: "Zero-shot 3D Map Generation with LLM Agents: A Dual-Agent Architecture for Procedural Content Generation"
url: "https://arxiv.org/abs/2512.10501"
collected_at: "2026-06-06T11:59:30+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, llm-agent, level-design, tool-parameterization, evaluation]
evaluated_at: "2026-07-26T19:06:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-26T19:06:07+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_posted_source
evidence: "duplicate of posted source: memory/raw/slack_api/shared-reads.jsonl ts=1780708885.257199; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780708885257199"
next_action: none
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  raw Slack に同一 work identity の arXiv:2512.10501 が 2026-06-06 に実投稿済みであり、Phase 3 の再投稿対象にしない。
  posted-source index の抽出漏れで preflight は continue だったため、raw Slack 横断照合を最終安全網として postpone で閉じる。
---

## raw_excerpt
arXiv:2512.10501。2025-12-11 submitted、2025-12-12 revised。対象は自然言語の設計指示を、3D map generation の厳密な procedural parameter に落とすための training-free LLM agent architecture。著者らは PCG pipeline が複雑で、操作には opaque technical parameters の正確な指定が必要になる一方、off-the-shelf LLM は抽象的なユーザー指示と strict parameter specifications の間の semantic gap を埋めにくい、という問題設定から始めている。提案は Actor agent と Critic agent を分け、Actor が parameter configuration を作り、Critic が design preference とのズレを見て反復的に refined configuration へ寄せる構成。評価対象は複数の 3D map 生成で、single-agent baseline より diverse かつ structurally valid な environment を生成した、と要約されている。

## why_relevant_to_games
自然言語の「こういうステージにしたい」を、生成器の数値パラメータへ落とす時の Actor/Critic 分離候補。小規模 prototype の wave/level grammar 自動調整にも転用できる可能性がある。
