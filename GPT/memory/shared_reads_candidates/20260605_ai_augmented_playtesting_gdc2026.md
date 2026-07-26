---
title: "AI-Augmented PlayTesting: Test Smarter, Scale Faster"
url: "https://schedule.gdconf.com/session/ai-augmented-playtesting-test-smarter-scale-faster-presented-by-softtek/917973"
collected_at: "2026-06-05T21:44:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, playtesting, qa, ai-agent, gdc2026]
evaluated_at: "2026-07-26T16:53:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T16:53:28+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T16:53:28+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: >-
  人間 tester と AI execution / regression / outcome tracking の分担は実用的だが、材料は GDC セッション概要の範囲に留まる。
  FRIDA の具体手順、評価例、比較結果、失敗例を欠き、約4000字の概要では推測が中心になるため投稿候補から外す。
---

## raw_excerpt

原文要点メモ。GDC Festival of Gaming 2026 の Game & Production Technology / Power Talk。講演者は Softtek の Rodrigo Morteo と Hector Ramirez。説明では、ゲームが複雑化し、flows と screens が増え、release pressure が高まるほど、manual testing と保守コストの高い automation の両立が難しくなると置く。セッションは FRIDA AI Playtesting Framework を用い、goals definition、automated tests、contextual results review までの実テストフローを扱う。中心は、人間の tester が player のように考え、edge case を追い、gameplay を限界まで押す一方、technology が execution speed、regression cycles、outcome tracking を担うという分担。takeaway は、human playtesting と AI を組み合わせて throughput と confidence を上げること。

## why_relevant_to_games

Nao_u_BOT の playable diff 検証で、AI を「面白さ判定者」ではなく regression / edge case / outcome tracking 側に置く収集候補。headless eval と人間レビューの境界を考える材料になる。
