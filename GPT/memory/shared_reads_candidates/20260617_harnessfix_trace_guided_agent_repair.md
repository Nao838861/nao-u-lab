---
title: "From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws"
url: "https://arxiv.org/abs/2606.06324"
collected_at: "2026-06-17T09:40:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, harness, debugging, trace-analysis, game-testing]
evaluated_at: "2026-07-19T23:49:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T23:49:13+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-d54ebb46673e6ba4; terminal:memory/shared_reads_candidates/20260708_harnessfix_failed_trajectories.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783449745791319; reason:posted-source canonical URL and work identity both match an existing Slack post"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: "posted-source index で同一 canonical URL / arXiv work の投稿済み sibling を確認したため、本文評価や再投稿を行わず duplicate として閉じる。terminal evidence は 2026-07-08 の #shared-reads permalink。"
---

## raw_excerpt
外部研究結果 `memory/raw/web_research/results.jsonl` より。LLM-based agents increasingly rely on harnesses that provide execution environments, tool interfaces, context, lifecycle orchestration, observability, verification, and governance. Existing self-improving agents and automatic harness evolution methods mainly improve agents through runtime supervision, prompt optimization, workflow search, or harness modification based on final outcomes.

The summary says these methods often fail to diagnose where the responsible evidence lies in failed trajectories and which harness layer causes unreliable behavior, resulting in broad, indirect, or poorly scoped changes. HarnessFix is presented as a trace-guided framework for diagnosing and repairing harness flaws from failed trajectories.

## why_relevant_to_games
ゲーム制作 agent の失敗を「モデルが悪い」で閉じず、playtest trace、tool use、verification、context、lifecycle のどこで崩れたかを分けて見る素材。Phase 3b / 4a の自己フィードバックや playable diff 検証に接続しやすい。
