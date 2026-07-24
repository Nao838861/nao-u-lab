---
title: "Calendar Time 2.0.2: Safer Clocks, Dynamic Lighting, and New 3D Demos"
url: "https://itch.io/devlog/1596970/calendar-time-202-safer-clocks-dynamic-lighting-and-new-3d-demos.amp"
collected_at: "2026-07-25T01:32:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, simulation, godot, time-system, lighting]
evaluated_at: "2026-07-25T01:37:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-25T01:37:09+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-25T01:37:09+09:00"
next_action: keep_for_reference
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  明示的 GameClock signal へ時刻依存 subsystem を接続する変更点は実装参考になる。
  ただし更新記録は不具合の再現、旧方式との比較、テスト結果を示さず、約 4000 字の概要に必要な
  評価の中身と記事固有の結論が不足するため、shared-reads 投稿ではなく局所的な参照に留める。
---

## raw_excerpt

Godot 4 向けの game calendar / day-night plugin「Calendar Time」2.0.2 の更新記録。中心は、時計との binding lifecycle を安全にし、時刻表示・進行 UI・照明を同じ明示的な clock source に接続する変更である。旧 `ActionProgress` は `TimeProgressBar` へ改名され、engine の `_process(delta)` で独自に進む方式から、指定した `GameClock` の signal によって更新する方式へ切り替わった。既存 project は node または script reference の置換が必要になる。

照明側では `TimeOfDayLightingRig2D` / `TimeOfDayLightingRig3D` と専用 settings resource を追加し、従来の directional-light component は低水準の interpolator として残す。2D には Simple / Stylized / High Contrast Night preset が用意される。3D demo には calendar を開く shortcut と Dawn / Noon / Dusk / Night preset が追加され、時間帯ごとの見た目を短い操作で確認できる。更新は、game time の正本、そこから進行する UI、照明表現、検証用 demo を別々に持ちながら signal で接続する構成を示している。

## why_relevant_to_games

複数の subsystem が別々の delta time でずれる問題を避けたい simulation、day-night cycle、時間制 UI の実装資料になる。時刻源を差し替え可能にして pause・倍速・再現テストへ接続する設計時に参照できる。
