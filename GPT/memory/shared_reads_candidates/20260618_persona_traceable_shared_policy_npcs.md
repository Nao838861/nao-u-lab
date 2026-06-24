---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-06-18T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [npc, reinforcement-learning, persona, simulation, game-ai]
evaluated_at: "2026-06-18T09:47:52+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-18T09:47:52+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-18T09:47:52+09:00"
next_action: keep_for_reference
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  手法要素とゲーム制作への適用性は十分だが、同一論文は 2026-06-17 の candidate で pass 済み、既存 permalink 付きで posted 扱いになっている。
  今回のメモは追加評価軸や新しい適用先を増やしておらず、Phase 3 で再投稿すると shared-reads の重複蓄積になる。
---

## raw_excerpt
原文短引用: "shared RL policies can support scalable, real-time, persona-conditioned NPC control"

論文は、数百から数千の NPC が必要な life simulation games で、個別 personality の一貫性、designer-authored natural language による制御、real-time inference を同時に満たすことを問題にしている。提案手法 pcsp は、free-form persona descriptions の frozen LLM embeddings で条件付けされた単一 RL policy を使う。once-per-NPC persona encoding、low-rank persona projection、neural persona conditioning、PPO と InfoNCE consistency と KL diversity を含む訓練目的を組み合わせる。Melting Pot 2.4.0 substrates と UE5 deployment で、persona-conditioned behavioral divergence と 64 agents の in-engine ablation を示したとされる。

## why_relevant_to_games
NPC を LLM で毎 tick 動かすのではなく、persona を保持した軽量 policy に落とす方向の候補。小規模 prototype でも「人格文から挙動差分を作る」設計評価に使える。
