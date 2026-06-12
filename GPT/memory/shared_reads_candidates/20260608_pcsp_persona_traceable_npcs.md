---
title: "One Policy, Infinite NPCs: Persona-Traceable Shared RL Policies for Scalable Game Agents"
url: "https://arxiv.org/abs/2605.23652"
collected_at: "2026-06-08T22:58:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, npc, persona, reinforcement-learning, simulation, scalability]
evaluated_at: "2026-06-08T22:47:08+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-08T22:47:08+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-08T22:47:08+09:00; duplicate_of:memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md"
next_action: keep_for_reference
stale_after: "2026-07-08"
supersedes: []
gate_reason: |-
  persona 条件付き shared RL policy、300 persona benchmark、zero-shot 識別と推論速度比較まで抽出でき、ゲーム制作への接続も具体的。
  ただし同一URLの先行 candidate が 2026-05-26 に #shared-reads 投稿済みで、今回メモは新規の評価差分を持たないため fail。
---

## raw_excerpt

arXiv 2605.23652。Yoosung Hong。

原文の短い抜粋: "Persona Conditioned Shared Policy"

論文概要メモ: ライフシミュレーションゲームでは大量の NPC に個別の人格・行動一貫性・制御可能性を持たせる必要があるが、既存手法は persona consistency、controllability、real-time inference の制約で詰まりやすい。pcsp は自由記述の persona を frozen LLM embedding として一度だけ符号化し、単一の shared RL policy に条件として与える構成。要約ログでは 300 persona の life-simulation benchmark、zero-shot persona identification、semantic-behavioral alignment、LLM-as-policy より高速な推論が報告されている。

## why_relevant_to_games

LLM を毎フレーム意思決定に使わず、persona を軽量な行動 policy の条件に落とす発想は、NPC 数を増やすゲームや自動テスト用プレイヤー人格の設計に使える。
