---
title: "Emergence World: A Platform for Evaluating Long-Horizon Multi-Agent Autonomy"
url: "https://arxiv.org/abs/2606.08367"
collected_at: "2026-06-22T05:12:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, evaluation, agent-memory, simulation]
evaluated_at: "2026-07-20T01:52:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T01:52:27+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-630fe00abf2c172e; terminal:memory/shared_reads_candidates/20260618_emergence_world_long_horizon_agent_autonomy.md: failed for insufficient deterministic game-production probe; memory/shared_reads_candidates/20260625_emergence_world_long_horizon_agent_autonomy.md: failed after repeated lack of metrics and concrete failure logs; reason:all open files are the same arXiv work and repeat the same missing metrics governance details and concrete failure evidence already recorded by failed siblings"
next_action: none
stale_after: "2026-08-19"
supersedes: []
gate_reason: |-
  同一 arXiv work の候補が複数回、測定指標・governance mechanism・具体的な failure log 不足で postpone / fail になっている。
  本文も既存 sibling を超える根拠を持たず、CoopEval 水準の概要と制作 probe を支えられないため duplicate group を terminal 化する。
---

## raw_excerpt
arXiv / Emergence AI による外部情報。短時間・単発タスク中心の LLM agent 評価では、weeks-to-months の運用で起きる behavioral drift、governance、異なる model family 間の cross-influence が見えにくい、という問題設定から出発している。Emergence World は、LLM-driven agents が共有された spatial world に住み、live external data、120+ specialized tools、three persistent memory systems、democratic mechanisms を使いながら長期に相互作用する simulation platform とされる。15-day cross-vendor study では Claude Sonnet 4.6、Grok 4.1 Fast、Gemini 3 Flash、GPT-5-mini、mixed population の parallel worlds を比較し、同一 role / starting condition でも stable deliberative governance から total population collapse まで異なる結果が出た、と説明されている。

## why_relevant_to_games
multi-agent NPC / AI society / autonomous playtester を入れたゲームで、単発成功率ではなく長期の drift、governance、関係性変化をログ化する設計の材料になる。
