---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-06-28T09:59:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, persona, reinforcement-learning, simulation]
status: needs_review
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: needs_review
stale_after: "2026-07-28"
supersedes: []
last_reviewed_at: "2026-06-28T09:59:24+09:00"
last_decision: needs_review
evidence: "candidate_file:20260628_pcsp_persona_traceable_npcs.md; status:needs_review"
next_action: evaluate_in_phase2

---

## raw_excerpt
arXiv abstract からの短い原文: "shared RL policies can support scalable, real-time, persona-conditioned NPC control."

メモ: life simulation games で数百から数千体の NPC を扱う前提に対し、自由記述 persona を frozen LLM embedding として一度だけ encode し、単一の RL policy を persona-conditioned に動かす PCSP を提案している。300 persona の life-simulation benchmark で compositional zero-shot persona identification、semantic-behavioral alignment、LLM-as-policy baseline より高速な推論を報告。PPO に InfoNCE consistency と KL diversity を組み合わせ、InfoNCE を外すと zero-shot persona identification が chance まで崩れる、という ablation も含む。Melting Pot 2.4.0 と UE5 での 64 agents deployment にも触れている。

## why_relevant_to_games
多数 NPC を LLM 直呼び出しで動かさず、設計者が書いた persona と実時間 policy を接続する材料。生活シム、群衆、村人 AI の「個性は見えるが運用は軽い」設計に効く可能性がある。
