---
title: "OpenLoopEvolve: A Verifiable Self-Evolution Framework for Loop Policies in Long-Horizon Complex Tasks"
url: "https://arxiv.org/abs/2608.09380v1"
collected_at: "2026-08-27T21:49:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, automated-playtesting, agent-policy, long-horizon, evaluation]
evaluated_at: "2026-08-27T21:53:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-27T21:53:25+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-27T21:53:25+09:00"
next_action: revise_or_research
stale_after: "2026-09-26"
supersedes: []
gate_reason: >-
  Loop Policy の版管理、Champion--Challenger 比較、task 境界での release／監視／rollback は自動 playtest へ具体的に適用できる。
  同一資料の open sibling も含めて benchmark、比較条件、定量結果、失敗分析がなく、手法の評価と限界を含む CoopEval 水準の概要を構成できないため postpone とする。
---

## raw_excerpt

> Long-horizon complex tasks require agents to repeatedly observe states, formulate plans, invoke tools, verify results, and recover from failures in continuously changing environments. However, such control experience often remains confined to a single context or a fixed prompt, and is difficult to accumulate and reuse across historical traces. This paper presents OpenLoopEvolve (OLE), a self-evolution framework centered on the Loop Policy.
>
> OLE represents an agent's observation, planning, memory, action, verification, recovery, stopping, and budget control as portable policy assets with versions and lineages, and provides online and offline evolution modes that can be selected according to practical needs: the online mode triggers candidate generation based on feedback from continuous operation, whereas the offline mode searches for candidate policies from archived traces and failure evidence.
>
> Both modes share an evolution mechanism consisting of autonomous proposals by a large language model, Champion--Challenger paired evaluation, and robust release. Policies released online are activated at a subsequent task boundary, monitored using subsequent feedback, and rolled back to their parent versions when degradation conditions are met.

## why_relevant_to_games

ゲーム用 bot や自動 playtest の観測・方策・検証・失敗回復を、版と系譜を持つ再利用可能な policy として蓄積する設計に接続できる。固定 bot の score 比較だけでなく、過去 trace から challenger を作り、task 境界で導入・監視・rollback する評価ループを考える材料になる。
