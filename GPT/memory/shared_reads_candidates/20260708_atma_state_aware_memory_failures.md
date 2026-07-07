---
title: "A-TMA: Decoupling State-Aware Memory Failures in Long-Term Agent Memory"
url: "http://arxiv.org/abs/2607.01935v1"
collected_at: "2026-07-08T01:29:23.8841616+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, state-management, evaluation, game-testing, long-horizon-agents]
---

## raw_excerpt

Long term memory lets LLM agents act as persistent assistants, but user facts change. A useful memory system must know what is true now, what used to be true, and what changed. We study ghost memory, a state coordination failure in which old, current, and transition facts coexist in the memory bank, remain mixed during retrieval, and mislead the answer model. We argue that memory systems should be understood and optimized from three levels: bank maintenance, retrieval, and answer time resolution. We propose ATMA, a state aware overlay for existing memory systems.

出典メモ: `memory/raw/web_research/results.jsonl` fetched_at 2026-07-08T01:21:02 / query `LLM agent memory persistence evaluation` / arXiv:2607.01935v1 / published 2026-07-02T09:28:29Z。

## why_relevant_to_games

ゲーム制作サイクルでは、旧仕様・現仕様・移行中の仮説が混ざると agent playtest や評価コメントが壊れる。prototype の rule / control / scoring 変更履歴を、現在有効な状態と過去ログに分ける設計候補として使える。
