---
title: "Crescent Moon Games Founder on Creating a Game That Blends 2D and 3D Platforming"
url: "https://80.lv/articles/crescent-moon-games-founder-on-creating-a-game-that-blends-2d-and-3d-platforming"
collected_at: "2026-05-25T16:08:57+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, puzzle-platformer, dimension-switching, prototyping, level-editor]
evaluated_at: "2026-07-28T07:38:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
status: ready_to_post
last_reviewed_at: "2026-07-28T07:38:04+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-28T07:38:04+09:00"
stale_after: "2026-08-27"
supersedes: []
next_action: post_to_shared_reads
gate_reason: |-
  2D level editor を正本に 3D を生成する制作判断、両世界の rule consistency、連動 trigger の具体例が一続きで抽出できる。
  単純 prototype と観察反応で実験的 mechanic を選別する結論まであり、複数表現を同期する制作へ具体適用できる。
suggested_post_outline:
  overview_angle: "2D/3D の二世界を、見た目の仕掛けではなく一つの rule system と制作 pipeline に統合した事例"
  analysis_axis: "editor-first の正本化、両世界の挙動対応表、prototype 反応による mechanic 選別"
  application_target: "過去/未来や複数表示を同期するプロトタイプで、状態・trigger・authoring source を一対一で検証する工程"
  pros_cons: "整合性と量産性を高める一方、片側固有の表現や例外処理を狭め、対応ルールの設計負荷が先行する"
  verdict_pre: "部分採用"

---

## raw_excerpt

短い引用: "Making the rules between these two worlds has been a real challenge."

80 Level の 2026-05-11 インタビュー。Screenbound は、handheld screen 内の 2D world と背後の 3D world がつながる puzzle/platforming idea から始まった作品。開発では、3D 空間を手で整列させるより、creator が 2D level editor で描き、それに対応する 3D block/layer を自動生成する方が一貫性を保てると判断している。難所として、2D で何が見えるか、いつ見えるか、どの object が両 dimension でどう接続されるか、2D/3D で enemy behavior は同じか違うか、という rule design が挙げられている。mechanics では、3D では FPS 的に動き、2D では layer 化された 2D space を動く。2D で balloon を掴んで glide すると 3D 側でも glide が起きる、2D で door を開けると別 world section へ移動する、など dimension 間 trigger を puzzle interaction として使う。結論部では、experimental mechanics は simple prototype を作り、人が遊ぶ・見る反応が強い時だけ執着するのがよい、という制作姿勢が述べられている。

## why_relevant_to_games

2D/3D や過去/未来など複数表現が連動するゲームで、rule consistency、editor-first 制作、trigger の対応関係を整理する候補。Echo-Path の「過去1秒と未来1秒」の接続設計にも読み替えられる。
