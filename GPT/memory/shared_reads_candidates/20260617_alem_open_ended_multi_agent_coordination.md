---
title: "Benchmarking Open-Ended Multi-Agent Coordination in Language Agents"
url: "https://arxiv.org/abs/2606.08340"
collected_at: "2026-06-17T11:29:25.5921611+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, multi-agent, evaluation, coordination, survival-game]
evaluated_at: "2026-06-17T12:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T04:05:30+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-f217d2c5fbea338e; terminal:memory/shared_reads_candidates/20260620_alem_multi_agent_coordination.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781905946856299; memory/shared_reads_candidates/20260622_alem_open_ended_multi_agent_coordination.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782065326755519; reason:posted-source index で同一 arXiv work の既投稿を確認したため、open siblings は再投稿対象外として閉じる"
next_action: none
stale_after: "2026-07-17"
supersedes: []
gate_reason: |-
  Craftax 系 survival world に協調、通信、役割分担、memory を同時に入れる着想は強く、ゲーム制作への適用先もある。
  ただし候補本文と保存済み raw だけでは、13 種 LLM と MARL 参照点の比較結果や失敗様式を CoopEval 水準で説明する材料が不足している。
  Phase 3 へ回す前に paper 本文から task taxonomy、metric、主要表を補う。
---

## raw_excerpt
arXiv 2606.08340。LLM agent が長期の open-ended interactive task で他者と協調できるかを測るため、Craftax 系のサバイバル環境に近い benchmark `alem` を提示している。環境には、手続き生成される協調タスク、役割分担、通信、難易度制御、探索、クラフト、取引、戦闘が含まれる。13 種の近代的 LLM を homogeneous team の zero-shot 条件で評価し、参照点として訓練済み MARL agent も使う。結果メモとしては、単独タスクの得点が高いことと協調得点が高いことは一致せず、通信が最大の寄与を持ち、memory と reasoning は複数手順の plan 維持に使われる時に効く、という形で整理されている。

## why_relevant_to_games
NPC チーム、協力 AI、敵味方の役割分担を作る時に、個体性能とチーム協調を別軸で測る設計例として使える。
