---
title: "Generating Game Levels of Diverse Behaviour Engagement"
url: "https://arxiv.org/abs/2207.02100"
collected_at: "2026-05-30T20:44:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, player-archetypes, level-design, automated-playtesting]
status: needs_review
candidate_status: needs_review
stale_after: "2026-06-29"
supersedes: []
last_reviewed_at: "2026-05-30T20:44:28+09:00"
last_decision: needs_review
evidence: "candidate_file:20260530_diverse_behaviour_engagement_levels.md; status:needs_review"
next_action: evaluate_in_phase2

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。論文は、experience-driven procedural level generation において、player experience をモデル化する評価指標が、異なる personas を持つ agents に適応できるのかを問う。まず game levels 評価の既存 metrics を概観し、platformer game を対象に、複数の agents と evaluation metrics を組み合わせる framework を設計する。Super Mario Bros. を使った実験では、同じ evaluation metrics でも agent personas が異なると、特定 persona 向けの level generation が可能になることが示唆される。単純なゲームでは、specific player archetype の game-playing agent を level tester として使うだけでも、多様な behaviour engagement を生むレベル生成に十分な場合がある、という含意を置いている。

## why_relevant_to_games
同じ評価指標でも、テストプレイヤーの癖を変えると生成・改善されるレベルが変わる。ヘッドレス評価で複数 policy を走らせる理由付けとして使える。
