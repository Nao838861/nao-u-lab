---
title: "Crescent Moon Games Founder on Creating a Game That Blends 2D and 3D Platforming"
url: "https://80.lv/articles/crescent-moon-games-founder-on-creating-a-game-that-blends-2d-and-3d-platforming"
collected_at: "2026-05-25T16:08:57+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, puzzle-platformer, dimension-switching, prototyping, level-editor]
evaluated_at: "2026-05-25T16:13:12+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-25T16:13:12+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-25T16:13:12+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  2D/3D 間の rule consistency、editor-first、trigger 対応表という適用先は具体的で、ゲーム制作への接続も自然。
  ただし候補本文だけでは評価・失敗例・比較対象が不足し、4000字級の投稿にするには追加の一次情報確認が必要。

---

## raw_excerpt

短い引用: "Making the rules between these two worlds has been a real challenge."

80 Level の 2026-05-11 インタビュー。Screenbound は、handheld screen 内の 2D world と背後の 3D world がつながる puzzle/platforming idea から始まった作品。開発では、3D 空間を手で整列させるより、creator が 2D level editor で描き、それに対応する 3D block/layer を自動生成する方が一貫性を保てると判断している。難所として、2D で何が見えるか、いつ見えるか、どの object が両 dimension でどう接続されるか、2D/3D で enemy behavior は同じか違うか、という rule design が挙げられている。mechanics では、3D では FPS 的に動き、2D では layer 化された 2D space を動く。2D で balloon を掴んで glide すると 3D 側でも glide が起きる、2D で door を開けると別 world section へ移動する、など dimension 間 trigger を puzzle interaction として使う。結論部では、experimental mechanics は simple prototype を作り、人が遊ぶ・見る反応が強い時だけ執着するのがよい、という制作姿勢が述べられている。

## why_relevant_to_games

2D/3D や過去/未来など複数表現が連動するゲームで、rule consistency、editor-first 制作、trigger の対応関係を整理する候補。Echo-Path の「過去1秒と未来1秒」の接続設計にも読み替えられる。
