---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-05-29T10:13:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, npc, reinforcement-learning, persona, simulation]
---

## raw_excerpt

Copyright-safe excerpt notes from the abstract/search record:

- Short quoted phrase: "300-persona life-simulation benchmark"
- Short quoted phrase: "22x faster inference"
- Short quoted phrase: "64 agents"

この論文は、多数の NPC をそれぞれ別 persona として動かすために、free-form persona description を frozen LLM embedding にし、それを shared reinforcement learning policy の条件として使う。pcsp は once-per-NPC persona encoding、low-rank persona projection、neural persona conditioning、PPO + InfoNCE consistency + KL diversity objective を組み合わせる。実験では persona-conditioned behavioral divergence と zero-shot persona identification を見ており、UE5 deployment でも多数 agent の実行を確認している。

## why_relevant_to_games

大量 NPC を LLM-as-policy で毎回動かす代わりに、persona を trace できる軽量 policy に落とす設計候補。simulation / colony / life sim 系の制作で参照できる。
