---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "https://arxiv.org/abs/2604.25482v1"
collected_at: "2026-06-25T07:29:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [rpg, narrative-generation, llm, procedural-content, structured-ir]
---

## raw_excerpt
arXiv abstract notes:

This paper addresses LLM use in complex RPG worlds, where coherence, controllability, and structural consistency are recurring problems. It proposes a dependency-aware, multi-stage prompt pipeline that represents narrative dependencies through structured intermediate outputs. The pipeline separates world building, NPC creation, player character creation, campaign-level quest planning, and quest expansion; each stage consumes structured JSON from earlier stages.

The claimed effect is reduced narrative drift and hallucination, plus scalable creation of interconnected narrative elements. Evaluation is qualitative and human-centered across multiple independent runs, using criteria including structural completeness, internal consistency, narrative coherence, diversity, and actionability. The authors also distinguish high-level campaign planning from detailed quest expansion.

Source lines: arXiv metadata and abstract, submitted 2026-04-28.

## why_relevant_to_games
テキスト ADV や RPG 風プロトタイプで、世界設定・NPC・クエストを一気に生成せず、依存順に分けて破綻を減らす収集材料になる。
