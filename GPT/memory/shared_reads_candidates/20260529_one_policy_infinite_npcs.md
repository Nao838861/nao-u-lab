---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-05-29T10:13:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, npc, reinforcement-learning, persona, simulation]
evaluated_at: "2026-07-19T01:22:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-20T06:07:10+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-bcf948e41f7911a1; terminal:memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779725135414829 and https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782609581756829; reason:posted-source index confirms the same arXiv work was already posted with complete provenance so the open siblings must not re-enter Phase 3"
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  posted-source index で同一 URL の実投稿が確認できたため、本文品質や適用範囲を再評価せず投稿対象から除外する。
  posted candidate と実投稿 permalink が揃っており、同 title group の open sibling を閉じる根拠は十分である。
next_action: none

---

## raw_excerpt

Copyright-safe excerpt notes from the abstract/search record:

- Short quoted phrase: "300-persona life-simulation benchmark"
- Short quoted phrase: "22x faster inference"
- Short quoted phrase: "64 agents"

この論文は、多数の NPC をそれぞれ別 persona として動かすために、free-form persona description を frozen LLM embedding にし、それを shared reinforcement learning policy の条件として使う。pcsp は once-per-NPC persona encoding、low-rank persona projection、neural persona conditioning、PPO + InfoNCE consistency + KL diversity objective を組み合わせる。実験では persona-conditioned behavioral divergence と zero-shot persona identification を見ており、UE5 deployment でも多数 agent の実行を確認している。

## why_relevant_to_games

大量 NPC を LLM-as-policy で毎回動かす代わりに、persona を trace できる軽量 policy に落とす設計候補。simulation / colony / life sim 系の制作で参照できる。
