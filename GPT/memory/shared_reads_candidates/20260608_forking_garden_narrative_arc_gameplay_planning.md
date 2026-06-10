---
title: "The Garden of Forking Paths: Narrative Arc-Conditioned Gameplay Planning"
url: "https://arxiv.org/abs/2605.01245"
collected_at: "2026-06-08T16:44:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative-design, procedural-generation, llm, level-design]
evaluated_at: "2026-06-08T16:47:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-08T16:47:07+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-08T16:47:07+09:00"
next_action: revise_or_research
stale_after: "2026-07-08"
supersedes: []
gate_reason: "物語アークで dungeon graph を制約する着想はゲーム制作に近く、mission graph や部屋役割の設計に転用しやすい。ただし Phase 1 メモでは評価方法・比較対象・失敗条件が薄く、CoopEval 水準の概要を書くには論文本文の確認が必要。"
---

## raw_excerpt
arXiv 要旨メモ。Narrative archetypes such as Hero's Journey and three-act structure are treated as reusable story structures for game storytelling, while existing LLM-based procedural game methods are described as lacking explicit use of those archetypes. The paper proposes Forking Garden, a framework for narrative arc-conditioned gameplay planning that generates branching games from user-provided storylines. It first creates a diverse pool of independent nodes, then assembles them into a dungeon graph with arc-guided constraint algorithms. Each node is expected to align gameplay elements across modalities. The authors also describe an end-to-end interactive system that instantiates the framework.

短い原文断片: "narrative arc-conditioned gameplay planning" / "branching games from user-provided storylines"。

## why_relevant_to_games
小規模探索ゲームやローグライクで、部屋・イベント・報酬を単なるランダム配置ではなく「物語上の役割」と接続する候補。mission graph と narrative arc を同時に扱う材料になる。
