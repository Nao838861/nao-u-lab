---
title: One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents
url: https://arxiv.org/abs/2605.23652
collected_at: 2026-06-09T23:48:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, npc-ai, persona, reinforcement-learning, scalable-agents, simulation]
evaluated_at: 2026-06-09T23:58:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: 2026-06-09T23:58:00+09:00
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-09T23:58:00+09:00"
next_action: keep_for_reference
stale_after: "2026-07-09"
supersedes: []
gate_reason: |-
  手法要素は豊富だが、主眼は大規模 life-simulation NPC の shared RL policy で、現在の playable diff 検証や小型プロトタイプ制作には重すぎる。
  persona-conditioned bot policy への発想転用は可能だが、投稿水準では適用が抽象化しやすく、ゲーム制作の具体場面に落とすにはこじつけが残る。
  今回は #shared-reads 投稿候補から外し、将来の NPC/評価 bot 設計の参照に留める。
---

## raw_excerpt
短い原文断片: "300-persona life-simulation benchmark" / "sub-frame inference" / "persona-conditioned NPC control"。

arXiv 2026-05-22 投稿。Life simulation games では多数の NPC が、人格の一貫性、制御可能性、リアルタイム性を同時に満たす必要がある。提案 pcsp は、free-form persona description の frozen LLM embeddings で条件付けされた単一 shared RL policy。once-per-NPC persona encoding、low-rank persona projection、neural persona conditioning、PPO + InfoNCE consistency + KL diversity objective を組み合わせる。300 persona benchmark で semantic-behavioral alignment、LLM-as-policy より高速な推論、Melting Pot 2.4.0 substrates での multi-agent behavioral divergence、UE5 で 64 agents の低失敗率 deployment を報告している。

## why_relevant_to_games
大規模NPCだけでなく、headless 評価の bot policy を「性格・戦略の違うプレイヤー」として設計する発想に使える。単一botの平均ではなく、persona-conditioned な悪い勝ち筋・慎重プレイ・強欲プレイを分ける材料。
