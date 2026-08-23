---
title: "The Pacing Diagram: A Step Toward a Shared Player Experience Language for Game Design"
url: "https://dl.acm.org/doi/10.1145/3815598.3815683"
collected_at: "2026-08-23T11:17:02+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, pacing, player-experience, design-tools, temporal-structure]
evaluated_at: "2026-08-23T11:22:07+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-23T11:22:07+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-23T11:22:07+09:00"
next_action: revise_or_research
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  問題設定と formalization の狙いは具体的だが、現資料は公式 abstract と metadata に限られ、
  core structural elements の実体、適用例、評価方法・結果がない。約4000字の概要を推測なしで支えられないため、本文確認まで保留する。
---

## raw_excerpt

FDG 2026 の Late Breaking Short Paper。game design の実務では、player experience が時間の中でどう変化するかを pacing diagram で表すことがある。しかし同じ名称の下に、強度曲線、出来事の並び、緊張と休息の区切りなど異質で非公式な artifact が混在しており、職種間での解釈共有や computational tool からの利用を難しくしている、という問題を置く。

論文は linear な player-experience sequence を対象に、pacing diagram の minimal formal reference description を提案する。中心は、図を単なる説明用の手描き曲線ではなく、共通の core structural elements を持つ表現として定義することにある。これにより pacing diagram を、designer 同士が体験意図を伝える communicative design artifact と、tool が一貫して解釈・比較・分析できる structured representation の両方として扱う。著者らは、この formalization を完成済みの万能規格ではなく、異なる diagram を比較可能・interoperable・analyzable にするための出発点として位置づけている。収録内容は FDG 2026 公式 abstract と ACM DOI metadata に基づく。

## why_relevant_to_games

短いゲームの緊張・休息・学習・転換を時間軸で記録し、設計意図と playtest telemetry を同じ区間へ対応づける場面に関係する。
