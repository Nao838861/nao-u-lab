---
title: "How to Use Finite State Machines (FSM) to Program Enemy AI"
url: "https://www.yamii.shop/2026/04/04/finite-state-machines-game-ai/"
collected_at: "2026-06-09T21:29:46+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, enemy-ai, finite-state-machine, implementation, game-design]
evaluated_at: "2026-06-09T21:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-09T21:40:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-09T21:40:00+09:00"
next_action: keep_for_reference
stale_after: "2026-07-09"
supersedes: []
gate_reason: "FSM の states / transitions / actions は基礎資料として有用だが、候補本文は検索抜粋レベルで、独自の評価・失敗例・実装比較が薄い。小規模ゲーム制作への適用は明確でも、CoopEval 水準の 4000 字概要にするには新規調査や別資料の補強が必要になるため Phase 3 には送らない。"
---

## raw_excerpt
Search result excerpt from yamii. Article frames boring enemy behavior as a state-structure problem: an enemy that charges in a straight line and repeats one attack feels flat, while FSMs let enemy behavior switch between states such as patrol, chase, attack, and flee. The article introduces states, transitions, events, and actions as the basic pieces. It contrasts FSMs with tangled if-else chains, noting that explicit states make debugging easier because the current behavior is visible.

The excerpt also cites familiar game patterns such as Pac-Man ghosts using scatter, chase, and frightened states. The practical angle is simple enemy AI that hobbyists can implement without advanced AI machinery. As a candidate, this is useful as a baseline design reference for when a prototype needs readable enemy behavior before adding learning agents, planning, or complicated utility scoring.

## why_relevant_to_games
Small action prototypes often need enemy behavior that is legible and tunable; FSMs are a conservative way to avoid ad hoc condition sprawl.
