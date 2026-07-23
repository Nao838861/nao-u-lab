---
title: "Integrating Productivity"
url: "https://itch.io/devlog/1598308/integrating-productivity"
collected_at: "2026-07-24T08:15:11+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ui, hud, state-communication, devlog]
evaluated_at: "2026-07-24T08:17:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-24T08:17:50+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-24T08:17:50+09:00"
next_action: keep_for_reference
stale_after: "2026-08-23"
supersedes: []
gate_reason: |-
  HUD と内部 state の重複をプレイヤーの次の判断から棚卸しする具体例であり、制作中の UI 改修には直接適用できる。
  ただし短い devlog に留まり、比較条件、検証方法、プレイヤー評価、改修後の結果がないため、CoopEval 水準の約4000字を根拠付きで構成できない。
---

## raw_excerpt

『Officebound』の作者は、開発中のゲーム状態を見直した際、HUD に多数の meter と bar が並んでいる一方で、それぞれがプレイヤーにとって何を意味するのか不明瞭になっていることに気づいた。「HR Suspicion」や「Coworker Feelings」は本当にゲーム上の判断に必要なのか、表示する価値があるのかを問い直し、プレイヤーにとって重要な情報と、画面へ出さなくてよい情報を整理した。その結果、プレイヤー自身の状態と会社内での立場を即座に把握できる、より簡潔な「Me (C)」UI へ作り直した。active perk や buff も同じ画面で分かるようにし、character HUD の事例を調べながら画面空間の使い方を検討している。また、開発初期に追加した「Mood」stat は、その後も用途を定められず、「Burnout」状態が気分の指標として同じ役割を果たしていたため、重複する状態として整理対象になった。記事は、仕組みを追加することと、それをプレイヤーが判断材料として読める形で提示することは別の設計課題だと分かる、短い UI 改修記録になっている。

## why_relevant_to_games

試作中に増えた内部 state と HUD 表示を棚卸しし、プレイヤーの次の判断に必要な情報へ絞る場面で参照できる。特に、役割が重なる stat や meter を見つけ、ゲーム状態と画面上の表現を対応させる UI 改修例になる。
