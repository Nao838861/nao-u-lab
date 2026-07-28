---
title: Splinter Cell designer says modern lighting has made stealth games harder to read
url: https://www.gamedeveloper.com/design/splinter-cell-designer-says-modern-lighting-have-made-stealth-games-harder-to-read
collected_at: 2026-05-29T06:29:43.8303200+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, readability, stealth, visual-design, level-design]
evaluated_at: "2026-07-28T12:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-28T12:08:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-28T12:08:00+09:00"
next_action: keep_for_reference
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  realism の向上が stealth の明暗ルールを読みにくくするという指摘は、視覚表現を状態表示として検証する軸に直結する。
  一方で現候補は識者発言と技術名の対比に留まり、lighting direction の具体手順、比較 scene、player 評価、改善結果がないため約4000字の固有分析には不足する。
---

## raw_excerpt
Game Developer の 2026-05-21 記事。Splinter Cell: Chaos Theory の creative director だった Clint Hocking の発言をもとに、現代的なレンダリングがステルスゲームの可読性を下げる場合がある、という論点を紹介している。古いステルスゲームでは baked lighting によって明暗が単純で、プレイヤーが「安全な影」「危険な明るさ」を読みやすかった。一方、diffuse lighting、ambient occlusion、ray tracing、path tracing などで見た目が現実に近づくほど、何が影で何が露出なのかを判別しづらくなる。

記事内では、技術そのものを否定しているのではなく、ジャンルのルールに必要な視認性に合わせて lighting direction を行う必要があるという話として扱われている。ステルスにおいて明暗は単なる美術ではなく、プレイヤーが状態を読むためのルール表現でもある。

短い引用: "so much harder to read"

## why_relevant_to_games
見た目のリアリズムやリッチさが、ゲームルールの読み取りを壊す例。弾幕、潜伏、索敵、危険地帯など、視覚情報がルールそのものになるプロトタイプの検証観点として使える。
