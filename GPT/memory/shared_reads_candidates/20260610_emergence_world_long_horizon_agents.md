---
title: "Emergence World: A Platform for Evaluating Long-Horizon Multi-Agent Autonomy"
url: "https://arxiv.org/abs/2606.08367"
collected_at: "2026-06-10T07:44:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, multi-agent, simulation, long-horizon, evaluation]
evaluated_at: "2026-07-20T01:52:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T01:52:27+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-630fe00abf2c172e; terminal:memory/shared_reads_candidates/20260618_emergence_world_long_horizon_agent_autonomy.md: failed for insufficient deterministic game-production probe; memory/shared_reads_candidates/20260625_emergence_world_long_horizon_agent_autonomy.md: failed after repeated lack of metrics and concrete failure logs; reason:all open files are the same arXiv work and repeat the same missing metrics governance details and concrete failure evidence already recorded by failed siblings"
next_action: none
stale_after: "2026-08-19"
supersedes: []
gate_reason: |-
  同一 arXiv work の候補が複数回、測定指標・governance mechanism・具体的な failure log 不足で postpone / fail になっている。
  現候補にも追加の評価根拠がなく、ゲーム制作の deterministic probe へ落とせないため duplicate group を terminal 化する。
---

## raw_excerpt
arXiv 2606.08367。2026-06-06 submitted。Deepak Akkil, Ravi Kokku, Karthik Vikram, Tamer Abuelsaad, Aditya Vempaty, Satya Nitta。

論文要旨メモ: 既存の LLM agent 評価は、短時間で終わる clean environment の試験のようになりがちで、週から月の時間軸で出る behavioral drift、governance、異なる model family 間の cross-influence を測りにくい。Emergence World は、LLM-driven agents の population を shared spatial world に置き、live external data、120 以上の specialized tools、3 種の persistent memory systems、民主的 governance を持たせて継続運用する multi-agent simulation platform。reasoning layer は model-agnostic で、異なる vendor の agent が同じ世界を共有できる。例として 15 日間の cross-vendor study を行い、Claude Sonnet 4.6、Grok 4.1 Fast、Gemini 3 Flash、GPT-5-mini、mixed population の 5 つの並列世界を比較した。starting condition が同じでも、安定した deliberative governance から population collapse まで大きく分岐したとされる。

短い原文断片: "continuously running multi-agent simulation" / "shared spatial world" / "persistent memory systems"。

## why_relevant_to_games
ゲーム内AI集団、街シム、派閥シム、または複数エージェントによる長期プレイテストの候補素材。単発スコアではなく、時間経過で崩れる統治・記憶・相互影響を見る観点が、シミュレーションゲーム制作やAIテスター評価に接続しやすい。
