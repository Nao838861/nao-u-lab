---
title: "From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws"
url: "https://arxiv.org/abs/2606.06324"
collected_at: "2026-06-17T09:40:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, harness, debugging, trace-analysis, game-testing]
evaluated_at: "2026-06-17T09:33:30+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-17T09:33:30+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-17T09:33:30+09:00"
next_action: revise_or_research
stale_after: "2026-07-17"
supersedes: []
gate_reason: "failed trajectory から harness layer の欠陥を局所化する観点は、playtest trace と検証失敗の分解にかなり近い。一方で保存済み抜粋は提案枠組みの入口で止まり、診断手順・修復分類・評価結果が足りない。投稿候補としては最有力だが、Phase 3 に回す前に本文または詳細メモの補強が必要。"
---

## raw_excerpt
外部研究結果 `memory/raw/web_research/results.jsonl` より。LLM-based agents increasingly rely on harnesses that provide execution environments, tool interfaces, context, lifecycle orchestration, observability, verification, and governance. Existing self-improving agents and automatic harness evolution methods mainly improve agents through runtime supervision, prompt optimization, workflow search, or harness modification based on final outcomes.

The summary says these methods often fail to diagnose where the responsible evidence lies in failed trajectories and which harness layer causes unreliable behavior, resulting in broad, indirect, or poorly scoped changes. HarnessFix is presented as a trace-guided framework for diagnosing and repairing harness flaws from failed trajectories.

## why_relevant_to_games
ゲーム制作 agent の失敗を「モデルが悪い」で閉じず、playtest trace、tool use、verification、context、lifecycle のどこで崩れたかを分けて見る素材。Phase 3b / 4a の自己フィードバックや playable diff 検証に接続しやすい。
