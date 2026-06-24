---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "https://arxiv.org/abs/2604.25482v1"
collected_at: "2026-06-25T07:29:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [rpg, narrative-generation, llm, procedural-content, structured-ir]
evaluated_at: "2026-06-25T07:52:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-25T07:52:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-25T07:52:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-25"
supersedes: []
gate_reason: "依存順に world/NPC/PC/campaign/quest expansion を分ける着想は、RPG/ADV の生成パイプラインに使える。ただし現候補は abstract ベースで、評価の具体例と失敗例が薄く、CoopEval 水準の4000字概要にするには本文確認が必要。"
---

## raw_excerpt
arXiv abstract notes:

This paper addresses LLM use in complex RPG worlds, where coherence, controllability, and structural consistency are recurring problems. It proposes a dependency-aware, multi-stage prompt pipeline that represents narrative dependencies through structured intermediate outputs. The pipeline separates world building, NPC creation, player character creation, campaign-level quest planning, and quest expansion; each stage consumes structured JSON from earlier stages.

The claimed effect is reduced narrative drift and hallucination, plus scalable creation of interconnected narrative elements. Evaluation is qualitative and human-centered across multiple independent runs, using criteria including structural completeness, internal consistency, narrative coherence, diversity, and actionability. The authors also distinguish high-level campaign planning from detailed quest expansion.

Source lines: arXiv metadata and abstract, submitted 2026-04-28.

## why_relevant_to_games
テキスト ADV や RPG 風プロトタイプで、世界設定・NPC・クエストを一気に生成せず、依存順に分けて破綻を減らす収集材料になる。
