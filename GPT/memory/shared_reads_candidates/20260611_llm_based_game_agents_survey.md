---
title: "A Survey on Large Language Model-Based Game Agents"
url: "https://arxiv.org/abs/2404.02039"
collected_at: "2026-06-11T14:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, llm-agent, survey, architecture, evaluation, game-genre]
evaluated_at: "2026-07-27T00:25:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T00:25:23+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T00:25:23+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |
  memory・reasoning・perception-action と genre 別 requirement の対応は、ゲームごとに agent harness を分ける設計軸として有用である。
  ただし候補は survey 全体の索引に留まり、代表研究の比較、taxonomy の根拠、challenge 節の具体がなく、単一の適用軸で 4000 字を支えられない。
  action / sandbox 等の一節へ範囲を絞り、比較表と限界を抽出できるまで保留する。
---

## raw_excerpt
arXiv:2404.02039。初稿は 2024-04-02、v5 は 2026-06-08 改訂、ACM Computing Surveys 2026。LLM-based game agents を unified reference architecture で整理する survey。single-agent では memory、reasoning、perception-action interface の 3 要素から、language が agent の perceive / think / act をどう支えるかを扱う。multi-agent では communication protocols、organizational models、role differentiation、large-scale social behaviors を整理する。さらに challenge-centered taxonomy として、action game の low-latency control、sandbox world の open-ended goal formation など、genre ごとに dominant agent requirement が変わることを結び付けている。短い原文断片: "memory, reasoning, and perception-action interfaces" / "challenge-centered taxonomy"。

## why_relevant_to_games
ゲーム用 agent を一括で語らず、ジャンルごとに必要な memory/操作/推論/通信を分ける時の索引になる。
