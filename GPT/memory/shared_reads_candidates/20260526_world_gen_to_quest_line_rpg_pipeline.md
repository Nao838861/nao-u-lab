---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "https://arxiv.org/abs/2604.25482"
collected_at: "2026-05-26T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, narrative-generation, llm, procedural-content-generation]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv metadata / abstract の要点メモとして保存する。短い原文句: "dependency-aware" / "structured JSON outputs"。

この論文は、RPG の world / NPC / player character / campaign / quest を LLM で生成する際、単発生成では coherence、controllability、structural consistency が崩れる、という問題を扱う。提案は dependency-aware な multi-stage prompt pipeline。段階は world building、NPC creation、player character creation、campaign-level quest planning、quest expansion に分けられ、各段階が前段階の structured JSON output に条件づけられる。狙いは、明示 schema と data flow で narrative drift と hallucination を抑え、相互依存する物語要素をスケールさせること。評価は複数独立 run に対する human-centered qualitative analysis で、structural completeness、internal consistency、narrative coherence、diversity、actionability などを観点にしている。高レベル campaign planning と detailed quest expansion を分けることが、global structure と local storytelling の両方に効く、という主張。

## why_relevant_to_games
RPG/ADV 生成で「世界観を作ったあと、クエストだけ別に膨らませて破綻する」問題を避けるための資料。JSON schema と段階的依存をゲーム制作の内部ツール設計に転用できる。
