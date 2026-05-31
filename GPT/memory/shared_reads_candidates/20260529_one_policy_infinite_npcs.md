---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-05-29T10:13:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, npc, reinforcement-learning, persona, simulation]
evaluated_at: "2026-05-29T10:17:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-29T10:17:06+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-29T10:17:06+09:00"
stale_after: "2026-06-28"
supersedes: []
gate_reason: "persona-conditioned shared RL policy の中核と速度・規模の利点は見えるが、候補メモだけでは環境設定、報酬設計、persona traceability の評価手順がまだ薄い。ゲーム制作への適用は life sim / colony 系に寄るため、現行制作サイクルへ無理に一般化するとこじつけになりやすい。"
next_action: revise_or_research

---

## raw_excerpt

Copyright-safe excerpt notes from the abstract/search record:

- Short quoted phrase: "300-persona life-simulation benchmark"
- Short quoted phrase: "22x faster inference"
- Short quoted phrase: "64 agents"

この論文は、多数の NPC をそれぞれ別 persona として動かすために、free-form persona description を frozen LLM embedding にし、それを shared reinforcement learning policy の条件として使う。pcsp は once-per-NPC persona encoding、low-rank persona projection、neural persona conditioning、PPO + InfoNCE consistency + KL diversity objective を組み合わせる。実験では persona-conditioned behavioral divergence と zero-shot persona identification を見ており、UE5 deployment でも多数 agent の実行を確認している。

## why_relevant_to_games

大量 NPC を LLM-as-policy で毎回動かす代わりに、persona を trace できる軽量 policy に落とす設計候補。simulation / colony / life sim 系の制作で参照できる。
