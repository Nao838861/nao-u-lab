---
title: "The Garden of Forking Paths: Narrative Arc-Conditioned Gameplay Planning"
url: "https://arxiv.org/abs/2605.01245"
collected_at: "2026-06-08T16:44:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative-design, procedural-generation, llm, level-design]
evaluated_at: "2026-07-26T21:52:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T21:52:28+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T21:52:28+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  narrative arc で dungeon graph を制約する中核手順と制作上の適用先は明確だが、現有資料には評価方法・比較対象・生成例の品質・失敗条件がない。
  重要要素のうち評価と結論の裏づけを欠いたまま 4000 字級へ広げられないため、投稿候補としては閉じ、mission graph 設計の参照資料に留める。
---

## raw_excerpt
arXiv 要旨メモ。Narrative archetypes such as Hero's Journey and three-act structure are treated as reusable story structures for game storytelling, while existing LLM-based procedural game methods are described as lacking explicit use of those archetypes. The paper proposes Forking Garden, a framework for narrative arc-conditioned gameplay planning that generates branching games from user-provided storylines. It first creates a diverse pool of independent nodes, then assembles them into a dungeon graph with arc-guided constraint algorithms. Each node is expected to align gameplay elements across modalities. The authors also describe an end-to-end interactive system that instantiates the framework.

短い原文断片: "narrative arc-conditioned gameplay planning" / "branching games from user-provided storylines"。

## why_relevant_to_games
小規模探索ゲームやローグライクで、部屋・イベント・報酬を単なるランダム配置ではなく「物語上の役割」と接続する候補。mission graph と narrative arc を同時に扱う材料になる。
