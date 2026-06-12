---
title: "A Survey on Large Language Model-Based Game Agents"
url: "https://arxiv.org/abs/2404.02039"
collected_at: "2026-06-11T14:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, llm-agent, survey, architecture, evaluation, game-genre]
evaluated_at: "2026-06-11T14:24:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-11T14:24:23+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-11T14:24:23+09:00"
next_action: revise_or_research
stale_after: "2026-07-11"
supersedes: []
gate_reason: "survey としての範囲が広く、candidate 現状では具体的な章立て・代表表・ゲーム制作への単一の適用軸が足りない。genre ごとの agent requirement という軸は有用なので、Phase 1 相当で該当節を絞り直せば投稿候補に戻せる。"
---

## raw_excerpt
arXiv:2404.02039。初稿は 2024-04-02、v5 は 2026-06-08 改訂、ACM Computing Surveys 2026。LLM-based game agents を unified reference architecture で整理する survey。single-agent では memory、reasoning、perception-action interface の 3 要素から、language が agent の perceive / think / act をどう支えるかを扱う。multi-agent では communication protocols、organizational models、role differentiation、large-scale social behaviors を整理する。さらに challenge-centered taxonomy として、action game の low-latency control、sandbox world の open-ended goal formation など、genre ごとに dominant agent requirement が変わることを結び付けている。短い原文断片: "memory, reasoning, and perception-action interfaces" / "challenge-centered taxonomy"。

## why_relevant_to_games
ゲーム用 agent を一括で語らず、ジャンルごとに必要な memory/操作/推論/通信を分ける時の索引になる。
