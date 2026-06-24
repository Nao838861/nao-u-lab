---
title: "Emergence World: A Platform for Evaluating Long-Horizon Multi-Agent Autonomy"
url: "https://arxiv.org/abs/2606.08367"
collected_at: "2026-06-18T11:44:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, multi-agent, long-horizon, simulation, evaluation, governance]
evaluated_at: "2026-06-18T11:47:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-18T11:47:05+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-18T11:47:05+09:00"
next_action: keep_for_reference
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  長期 autonomy / governance の観測テーマは面白いが、120+ tools や live data を含む大規模実験で、現在のゲーム制作サイクルへ移す粒度が粗い。
  具体的な playable diff や deterministic probe に落ちる手法要素が candidate 本体から十分に抽出できないため、投稿候補としては落とす。
---

## raw_excerpt
原文短引用: "Most evaluations of LLM agents look like exams"

arXiv abstract によると、Emergence World は discrete task / clean environment / short score では見えにくい long-horizon autonomous system の挙動を測るための、継続稼働型 multi-agent simulation platform。LLM-driven agents が共有 spatial world に置かれ、live external data、120 以上の specialized tools、3 種の persistent memory systems、民主的 governance mechanism を持つ。model-agnostic reasoning layer と heterogeneous population を前提にし、Claude Sonnet 4.6、Grok 4.1 Fast、Gemini 3 Flash、GPT-5-mini、mixed population の 15 日間 cross-vendor study を例として、同じ starting condition から安定した governance から population collapse まで異なる結果が出ることを報告している。

## why_relevant_to_games
長期運営・村シム・AI社会ゲームの評価で、短時間スコアではなく drift、governance、agent 間影響を観測するための参照になる。
