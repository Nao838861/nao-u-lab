---
title: "Benchmarking Open-Ended Multi-Agent Coordination in Language Agents"
url: "https://arxiv.org/abs/2606.08340"
collected_at: "2026-06-18T11:44:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent, multi-agent, coordination, evaluation, survival-game]
evaluated_at: "2026-06-18T11:47:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T04:05:30+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-f217d2c5fbea338e; terminal:memory/shared_reads_candidates/20260620_alem_multi_agent_coordination.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781905946856299; memory/shared_reads_candidates/20260622_alem_open_ended_multi_agent_coordination.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782065326755519; reason:posted-source index で同一 arXiv work の既投稿を確認したため、open siblings は再投稿対象外として閉じる"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  問題設定と中核は明確で、協力型ゲームの NPC 評価や multi-agent 行動ログ設計に接続できる。
  ただし candidate 本体は abstract 要約中心で、評価設計の内訳や失敗例を CoopEval 水準の概要へ展開するには追加読解が必要。
---

## raw_excerpt
原文短引用: "Alem embeds procedurally generated coordination tasks"

arXiv abstract によると、alem は Craftax-like dynamics 上で動く JAX ベースの open-ended multi-agent coordination benchmark。長期 survival world の中に探索、crafting、trading、combat、手続き生成された協調タスク、soft specialisation、communication、coordination difficulty の制御を含める。13 種の modern LLM を homogeneous team として zero-shot 評価し、MARL agent を参照点に置いている。結果として、現在の LLM agent は平均 normalized return が低く、単体タスク報酬が高いモデルでも coordination reward が低いケースがあり、個体能力と協調能力が別物であることを示す。communication が coordination に最も大きく効き、memory と reasoning は multi-step plan 維持に使われると助けになる、という要旨。

## why_relevant_to_games
協力型ゲームや複数 NPC の役割分担を評価する時、個体性能ではなく「通信・役割・長期計画」を別軸で見る候補になる。
