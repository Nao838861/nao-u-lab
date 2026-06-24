---
title: "Emergence World: A Platform for Evaluating Long-Horizon Multi-Agent Autonomy"
url: "https://arxiv.org/abs/2606.08367"
collected_at: "2026-06-22T05:12:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, evaluation, agent-memory, simulation]
evaluated_at: "2026-06-22T05:13:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-22T05:13:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-22T05:13:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-22"
supersedes: []
gate_reason: |-
  Long-horizon multi-agent society evaluation is relevant to NPC society and autonomous playtest operations.
  However, the candidate text does not yet expose enough detail on metrics, governance mechanisms, or concrete failure cases to support a CoopEval-level 4000-character overview without additional source work.
---

## raw_excerpt
arXiv / Emergence AI による外部情報。短時間・単発タスク中心の LLM agent 評価では、weeks-to-months の運用で起きる behavioral drift、governance、異なる model family 間の cross-influence が見えにくい、という問題設定から出発している。Emergence World は、LLM-driven agents が共有された spatial world に住み、live external data、120+ specialized tools、three persistent memory systems、democratic mechanisms を使いながら長期に相互作用する simulation platform とされる。15-day cross-vendor study では Claude Sonnet 4.6、Grok 4.1 Fast、Gemini 3 Flash、GPT-5-mini、mixed population の parallel worlds を比較し、同一 role / starting condition でも stable deliberative governance から total population collapse まで異なる結果が出た、と説明されている。

## why_relevant_to_games
multi-agent NPC / AI society / autonomous playtester を入れたゲームで、単発成功率ではなく長期の drift、governance、関係性変化をログ化する設計の材料になる。
