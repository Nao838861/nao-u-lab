---
title: "Zenith: Diffusion Model-Driven Map Generation"
url: "https://schedule.gdconf.com/session/zenith-diffusion-model-driven-map-generation/914450"
collected_at: "2026-06-09T13:15:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev-tools, procedural-generation, diffusion, map-generation, visual-development]
evaluated_at: "2026-06-09T13:31:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-09T13:31:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-09T13:31:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-09"
supersedes: []
gate_reason: "3D 環境から top-down map layer を生成するために geometry extraction と multi-encoder ControlNet を組み合わせる中核は明確で、ゲーム制作への転用可能性も高い。一方で現 candidate は GDC セッション概要に留まり、モデル構成の詳細、artist feedback の具体例、失敗例や評価結果が薄い。~4000 字の残すべき投稿にするには一次資料の補強が必要。"
---

## raw_excerpt
GDC 2026 Machine Learning Summit の講演。Zhen Zhai (Blizzard Entertainment, Associate Director, Applied Science) が、3D environments から stylized top-down maps を作る hybrid pipeline「Zenith」を紹介する。セッション説明では、procedural geometry extraction と multi-encoder ControlNet architecture を組み合わせ、depth、normals、detail conditioning を使って walkable areas、line art、shadows、highlights などの multi-layered map assets を生成するとされる。複数の diffusion models を統合することで、大規模 training dataset なしでも visual consistency を保つ狙いがあり、artist feedback と production workflow への統合 lessons も扱う。

## why_relevant_to_games
3D/2D を問わず、制作済み空間からプレイヤーが読める map layer を抽出する工程は、prototype の可視化、攻略導線、UI map、ステージ検証ツールに転用できる。
