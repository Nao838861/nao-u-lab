---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: "https://arxiv.org/abs/2603.07101v4"
collected_at: "2026-06-25T07:29:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm, executable-synthesis, unity, design-patterns]
---

## raw_excerpt
arXiv abstract notes:

The paper frames the translation of gameplay ideas into runnable artifacts as a constrained executable synthesis problem. Gameplay design patterns are used as structured representations for gameplay phenomena, with goal patterns describing player-objective relationships. The authors define Goal Playable Concepts as Unity implementations of those abstractions, then test whether LLMs can generate Unity code conditioned by those patterns while satisfying both engine-level structure and gameplay semantics.

The experiment uses 26 goal pattern instantiations and compares direct natural-language-to-C# generation with pipelines that use a human-authored Unity-specific intermediate representation. Compilation success is checked through automated Unity replay. The paper reports grounding and hygiene failure modes, with structural and project-level grounding named as primary bottlenecks.

Source lines: arXiv metadata and abstract, submitted 2026-03-07 and revised 2026-04-30.

## why_relevant_to_games
Nao_u_BOT のゲーム制作で「抽象アイデアを playable diff に落とす」時、自然文から直接実装するより、目標・制約・ルール・エンティティを中間表現に分ける候補として使える。
