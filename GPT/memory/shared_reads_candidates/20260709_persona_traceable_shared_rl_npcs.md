---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-07-09T13:44:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, reinforcement-learning, persona, simulation, ue5]
evaluated_at: "2026-07-09T13:47:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-09T13:47:38+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md; memory/shared_reads_candidates/20260609_persona_traceable_shared_rl_npcs.md; memory/shared_reads_candidates/20260617_persona_traceable_shared_rl_npcs.md; memory/shared_reads_candidates/20260618_persona_traceable_shared_policy_npcs.md"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  mixed duplicate queue に同一 title_key の posted sibling が複数あり、Phase 3 投稿対象にしない。
  persona-conditioned shared policy の適用性は高いが、現行運用ではこの候補だけ duplicate postpone とする。
---

## raw_excerpt

arXiv abstract では、life simulation games には数百から数千の NPC が必要で、それぞれが一貫した人格を持ちつつ、designer-authored natural language で制御可能でなければならない、と問題設定している。提案手法 pcsp は Persona Conditioned Shared Policy。自由形式の persona description を frozen LLM embedding として一度だけ encode し、low-rank persona projection、neural persona conditioning、PPO + InfoNCE consistency + KL diversity objective を組み合わせる。300 persona の life-simulation benchmark で、persona identification、semantic-behavioral alignment、LLM-as-policy baseline より高速な inference を報告している。Melting Pot 2.4.0 substrates と UE5 deployment でも persona-conditioned behavioral divergence を検証している。

source notes:
- submitted: 2026-05-22
- arXiv id: 2605.23652
- web_research query: LLM game design player evaluation

## why_relevant_to_games

会話だけでなく行動パターンとして人格差を出すNPC設計の候補。多数NPC、生活シム、群衆、協力/対立シミュレーションで「説明文から振る舞いへ」落とす時の参考になる。
