---
title: "Boghog's bullet hell shmup 101"
url: "https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101"
collected_at: "2026-05-16T23:29:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, shmup, bullet-hell, level-design, mechanics]
candidate_status: failed
evaluated_at: "2026-05-16T23:32:45+09:00"
stale_after: "2026-06-15"
supersedes: []
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
last_reviewed_at: "2026-05-16T23:32:45+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-16T23:32:45+09:00"
next_action: keep_for_reference
gate_reason: |-
  手法要素とゲーム制作への適用性は十分で、CoopEval 水準の概要も書ける。
  ただし 2026-05-16 21:58 に同一 URL が既に #shared-reads 投稿済みで active atom もあるため、Phase 3 で再投稿する価値はない。

---

## raw_excerpt
This doc covers the fundamental aspects of designing a bullet hell (danmaku) shmup. This is heavily skewed towards CAVE's style of games, but a lot of the things discussed here can be carried over to other styles. Knowing these fundamentals is important even if you're going to break every rule in the book, because it helps you make informed choices instead of taking shots in the dark.

The most fundamental source of challenge in danmaku games is identifying, predicting and manipulating different bullet trajectories and making precise movements to dodge bullets and control screen space. Because of this, giving the player as much control, consistency and awareness as you can is the top priority.

When designing dense patterns, thinking of them as a collection of "lanes" that players can take is very helpful. Think of each lane as a micro-challenge that players opt into. They can either commit to one lane or move from one to another in real time.

## why_relevant_to_games
弾幕・回避・敵配置を「軌道」「レーン」「画面空間の制御」として扱う資料。graze_log / shot_log 系の wave 設計や、難度を上げる前に読みやすさを確保する検討材料になる。
