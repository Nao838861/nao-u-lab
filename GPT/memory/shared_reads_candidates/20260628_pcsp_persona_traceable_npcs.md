---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-06-28T09:59:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, persona, reinforcement-learning, simulation]
status: failed
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: failed
stale_after: "2026-07-28"
supersedes: []
last_reviewed_at: "2026-07-20T06:07:10+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-bcf948e41f7911a1; terminal:memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779725135414829 and https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782609581756829; reason:posted-source index confirms the same arXiv work was already posted with complete provenance so the open siblings must not re-enter Phase 3"
next_action: none

---

## raw_excerpt
arXiv abstract からの短い原文: "shared RL policies can support scalable, real-time, persona-conditioned NPC control."

メモ: life simulation games で数百から数千体の NPC を扱う前提に対し、自由記述 persona を frozen LLM embedding として一度だけ encode し、単一の RL policy を persona-conditioned に動かす PCSP を提案している。300 persona の life-simulation benchmark で compositional zero-shot persona identification、semantic-behavioral alignment、LLM-as-policy baseline より高速な推論を報告。PPO に InfoNCE consistency と KL diversity を組み合わせ、InfoNCE を外すと zero-shot persona identification が chance まで崩れる、という ablation も含む。Melting Pot 2.4.0 と UE5 での 64 agents deployment にも触れている。

## why_relevant_to_games
多数 NPC を LLM 直呼び出しで動かさず、設計者が書いた persona と実時間 policy を接続する材料。生活シム、群衆、村人 AI の「個性は見えるが運用は軽い」設計に効く可能性がある。
