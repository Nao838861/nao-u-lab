---
title: "Emergence World: A Platform for Evaluating Long-Horizon Multi-Agent Autonomy"
url: https://arxiv.org/abs/2606.08367
collected_at: 2026-06-20T06:58:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, evaluation, multi-agent, long-horizon, simulation, memory]
evaluated_at: 2026-07-20T01:52:50+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T01:52:27+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-630fe00abf2c172e; terminal:memory/shared_reads_candidates/20260618_emergence_world_long_horizon_agent_autonomy.md: failed for insufficient deterministic game-production probe; memory/shared_reads_candidates/20260625_emergence_world_long_horizon_agent_autonomy.md: failed after repeated lack of metrics and concrete failure logs; reason:all open files are the same arXiv work and repeat the same missing metrics governance details and concrete failure evidence already recorded by failed siblings"
next_action: none
stale_after: "2026-08-19"
supersedes: []
gate_reason: |-
  同一 arXiv work の候補が複数回、測定指標・governance mechanism・具体的な failure log 不足で postpone / fail になっている。
  本文も既存 sibling を超える根拠を持たず、ゲーム制作の deterministic probe へ落とせないため duplicate group を terminal 化する。
---

## raw_excerpt
LLM agent 評価を、短時間の clean task ではなく、数週間から数か月の運用条件で測るべきだという問題設定。Emergence World は、continuous running multi-agent simulation platform として、shared spatial world、live external data、120 以上の specialized tools、3 種の persistent memory systems、民主的な governance mechanism を備えた agent population を走らせる。

論文要旨では、短時間 benchmark では behavioral drift、diverse context での governance、異なる model family 間の cross-influence のような dynamics が見えないとする。15 日間の cross-vendor study では、Claude Sonnet 4.6、Grok 4.1 Fast、Gemini 3 Flash、GPT-5-mini、mixed population の 5 world を同一 role と初期条件で比較し、stable deliberative governance から population collapse まで大きく異なる outcome が出たとされている。prompts、log data、configurations も release 対象としている。

## why_relevant_to_games
長期運用 agent の memory / governance / drift を game simulation で測る例として、NPC 社会、定時サイクル、複数 AI の共同制作ログ評価に使える。ゲーム制作では「短い勝敗」以外の持続的な状態変化を観察する設計素材になる。
