---
title: "Masquerade – Global Game Jam 2026 Postmortem"
url: "https://itch.io/devlog/1344082/global-game-jam-2026.amp"
collected_at: "2026-07-24T00:16:11.4507845+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, postmortem, game-jam, stealth, possession]
evaluated_at: "2026-07-24T00:19:16.2037780+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-24T00:19:16.2037780+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-24T00:19:16.2037780+09:00"
next_action: keep_for_reference
stale_after: "2026-08-23"
supersedes: []
gate_reason: |-
  possession の実装核、約11時間での制作順序、削った NPC role 案は具体的だが、完成版の playtest、迷路設計の検証、役割差を使う puzzle の実装結果がない。
  現 evidence から約4000字の概要を作ると将来案への推測が実績を上回るため、#shared-reads に残す水準には届かない。
---

## raw_excerpt

Midnite Run Studios が Global Game Jam 2026 に一日遅れで参加し、実作業約11時間で制作した一室構成の stealth-possession escape game『Masquerade』のポストモーテム。着想の核は『Geist』に由来する「霊体のままでは世界へ意味のある干渉ができず、他者へ憑依した時だけ行動できる」fantasy だった。Godot の signal system を用い、各 NPC が `possessed` state を持つ entity-level の仕組みとして実装した。憑依時には player character を不可視化し、操作主体を NPC へ移し、Masqe を host に接続する。作者はこの単純で読みやすく安定した実装を jam 向けの核としている。

movement と possession は早期に playable になったが、最も時間を使ったのは level transition と、ランダムに見えず実際に脱出可能な facility の迷路設計だった。時間切れで、door puzzle、機械を修理・解体する Engineer、restricted door を通れる Security Guard、複数 level、environmental storytelling を削除した。これらは NPC ごとの role を憑依対象の機能差へ変え、単なる sneaking から deliberate problem-solving へ広げる予定だった。完成版は小規模だが、作者は possession mechanic、atmosphere、escape fantasy の三点が残ったと記録し、将来像として layered NPC roles、reactive security、秘密を持つ facility を備えた immersive sim を挙げている。

## why_relevant_to_games

短時間 prototype で「操作主体の移管」という核を先に成立させ、周辺の level 規模を削る過程と、NPC role の差を puzzle / access rule に接続する拡張案を追える。
