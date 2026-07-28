---
title: "How the Replaced devs fixed display bloat with a stylish gadget"
url: "https://www.gamedeveloper.com/design/replaced-wingman"
collected_at: "2026-06-09T05:15:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ui, narrative-design, scope-control, game-feel]
evaluated_at: "2026-07-28T23:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-28T23:40:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-28T23:40:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-27"
supersedes: []
gate_reason: "scope bloat を UI fiction に畳む具体例として有用だが、再評価時点でも Wingman の実装判断と評価結果の厚みが不足し、CoopEval 水準の 4000 字概要にすると推測が増えやすい。Game Developer 本文の追加確認か類似事例との比較があれば投稿候補にできる。"
---

## raw_excerpt
Game Developer の 2026-06-04 記事。Replaced は 2.5D pixel art adventure game で、開発中に多数の lore items を graphical display 付きで見せたいという narrative team の希望が scope bloat を起こした。解決策として、GameBoy Camera や Sony Walkman に着想を得た in-game device "Wingman" を作り、scanned items と music player を集約した。Wingman は通常の overlay menu ではなく、探索中に一人称寄りの close-up perspective へ切り替わり、主人公の手が gadget を操作する。最終形では、item category ごとの専用 animation を作るのではなく、lore entry を Wingman に集約することで制作負荷を下げた。記事では tactile interaction、text legibility、NPC や障害物が近い時の transition edge case、post-launch hacking add-on 予定も触れられている。

## why_relevant_to_games
scope control と UI fiction を同時に扱う実例。メニューを増やす代わりに、世界内の道具へ機能を集約し、触感・可読性・実装負荷を一つの設計問題として扱う参考になる。
