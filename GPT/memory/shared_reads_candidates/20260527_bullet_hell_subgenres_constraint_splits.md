---
title: "The Complete Guide to Bullet Hell Subgenres (Yes, There Are This Many)"
url: "https://choostgames.com/blog/bullet-hell-subgenres-guide/"
collected_at: "2026-05-27T02:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, bullet-hell, genre-analysis, constraints, mechanics]
evaluated_at: "2026-05-27T03:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-27T03:05:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-27T03:05:00+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  「どの制約を壊したか」で subgenre を見る観点は使えるが、candidate 内の材料は分類紹介が中心で、手法の評価や結論を CoopEval 水準の概要に展開するには薄い。
  Relay Lane の言語化には補助材料として有用でも、単独で #shared-reads に残す品質には届かない。

---

## raw_excerpt
Choost Games の bullet hell subgenre 整理。古典的 danmaku は、敵種類よりも bullet pattern を読むことが主役で、弾そのものが level design になると説明される。bullet heaven は Vampire Survivors 系で、避ける側ではなく画面を埋める側になり、auto-attack / build optimization / swarm waves / meta-progression が中心。roguelike bullet hell は短い procedural rooms と item synergy を足し、twin-stick bullet hell は移動方向と照準方向を分離する。boss-rush は traversal と雑魚敵を捨てて pattern puzzle と healthbar に集中し、platformer/metroidvania hybrid は重力・足場・位置取りを弾幕側が考慮する必要がある。

特に使えるのは、genre split を「制約をどこで壊したか」として見る部分。turn-based bullet hell は time pressure を外して spatial reasoning に変え、bullet heaven は bullet direction を反転し、open-world bullet hell は linear stage constraint を壊す。制約を一つ外すと同時に、別の設計問題が生まれるという整理は、既存 prototype を作り直す時に「何を足すか」ではなく「どの制約を入れ替えるか」を考える入口になる。

## why_relevant_to_games
v007/v008 の「特殊レーン」「Relay Lane」系が伝わらなかった時、単なる新ギミック追加ではなく、弾幕ジャンルのどの制約を壊しているのかを言語化する材料になる。
