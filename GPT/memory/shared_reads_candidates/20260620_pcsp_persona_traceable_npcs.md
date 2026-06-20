---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-06-20T18:44:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, reinforcement-learning, persona, simulation, real-time-agents]
evaluated_at: "2026-06-20T18:46:26+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-20T18:46:26+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-20T18:46:26+09:00"
next_action: revise_or_research
stale_after: "2026-07-20"
supersedes: []
gate_reason: |-
  persona-conditioned shared policy、trajectory consistency、real-time deployment という手法要素と評価材料は抽出できる。
  ただし現行のゲーム制作への適用は RL substrate と training pipeline 前提が重く、すぐ使える制作手順としては AutoBG より遠い。
  NPC 評価軸としては有望なので、実装可能な軽量 probe へ翻訳できるかを追加確認してから投稿判断する。
---

## raw_excerpt
原文短句: "Persona-Conditioned Shared Policy" / "trajectory-consistency objective" / "real-time inference"

arXiv:2605.23652。Yoosung Hong による、自然言語 persona で制御できる多数 NPC のための shared RL policy。問題設定は、life simulation game では hundreds to thousands の NPC が必要だが、hand-authored behavior tree、NPC ごとの RL policy、latent skill discovery、各 step で LLM を呼ぶ controller は、persona consistency、natural-language controllability、zero-shot generalization、real-time inference のどこかで破綻するというもの。提案手法 pcsp は、free-form persona description を frozen LLM embedding にし、once-per-NPC persona encoding、low-rank persona projection、FiLM/concat による neural persona conditioning、PPO + InfoNCE consistency + KL diversity objective を組み合わせる。評価は controlled substrate、Melting Pot 2.4.0 の social-dilemma substrates、UE5 realtime deployment の三層。InfoNCE trajectory-consistency objective を外すと task reward が残っても zero-shot persona identification が chance に落ちる、という ablation が中心。UE5 では 64 agents の同時動作と held-out persona generalization を示している。

## why_relevant_to_games
LLM NPC を毎フレーム呼ぶのではなく、「自然言語 persona を一度だけ圧縮し、軽量 policy で行動し、軌跡から persona が読めるかで検証する」という NPC 設計・評価の候補になる。
