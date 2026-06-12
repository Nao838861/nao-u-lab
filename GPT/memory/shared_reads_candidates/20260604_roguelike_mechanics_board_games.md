---
title: "Roguelike Mechanics in Board Games: The Complete Guide"
url: "https://neutronium.games/blog/roguelike-mechanics-board-games"
collected_at: "2026-06-04T08:29:43+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, roguelike, board-game, progression, mechanics]
evaluated_at: "2026-06-04T08:35:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-04T08:35:23+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-04T08:35:23+09:00"
next_action: keep_for_reference
stale_after: "2026-07-04"
supersedes: []
gate_reason: "設計メモとしては使えるが、記事は tabletop への翻訳整理と自作タイトル例が中心で、評価・比較・検証の厚みがない。ゲーム制作への連想は可能でも、CoopEval 水準の 4000 字概要に必要な手法の中核と evidence が不足するため投稿候補からは落とす。"
---

## raw_excerpt
Neutronium blog。2026-05-08 published。記事は roguelike という語が tabletop / board game 側にも広がっていることを起点に、Rogue 由来の要素を物理コンポーネントへ移すと何が変わるかを整理している。Berlin Interpretation の要素として permadeath、random environments、turn-based play、grid movement、resource management、non-modal gameplay、system interaction を挙げ、board game では turn-based / grid / resource / interaction は元々なじみやすい一方、permadeath と procedural generation の翻訳が難しいとする。

中心の整理は、procedural generation は variable setup、permadeath は meaningful failure、meta-progression は session-to-session unlocks、asymmetric runs は faction/class variation、progression は player knowledge accumulation として置き換えられる、というもの。特に knowledge accumulation は save file ではなく player の頭に残る進行として扱われる。Neutronium: Parallel Wars の例では、複数 universe による rule revelation、asymmetric races、session をまたいだ知識蓄積を、コンポーネント破壊や sticker なしで実装する設計として説明されている。

## why_relevant_to_games
小規模デジタル prototype でも、roguelike 要素を単に random / death / unlock に分解せず、失敗が何を教えるか、session 間で player の見方がどう変わるかを見る材料になる。ルール開示や知識進行は短いゲームの再プレイ性にも転用できる。
