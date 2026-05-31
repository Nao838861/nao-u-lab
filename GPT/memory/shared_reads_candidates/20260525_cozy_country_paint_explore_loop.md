---
title: "This Cozy Painting Game Let's You Explore the Landscapes You Create"
url: "https://80.lv/articles/this-cozy-painting-game-let-s-you-explore-the-landscapes-you-create"
collected_at: "2026-05-25T22:52:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, cozy-game, creation-loop, exploration, no-fail-state]
evaluated_at: "2026-05-25T23:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-25T23:10:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-25T23:10:00+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  creation と exploration を直結する着想は明確だが、記事は製品紹介中心で評価・設計判断・実装上の中核が薄い。
  ゲーム制作への適用は可能でも、CoopEval 水準の 4000 字概要に耐える一次情報密度が足りない。

---

## raw_excerpt
80 Level の Cozy Country 紹介記事。Protopop Games が制作中の本作は、プレイヤーが landscape を描き、その中に入って探索するという制作と探索の循環を中心にしている。forest、river、garden、building などを形作り、完成した風景を歩き回る。記事では relaxation、discovery、creativity を主眼に置き、timers、enemies、competition はないと説明されている。

短い原文メモ: "get inside the paintings" / "no timers, enemies, or competition" / "world you create"。

Steam 説明の引用として、建物は inn、church、townhouses、farmhouse などの style から選び、floor、width、length を調整でき、できた建物の内部に入れる。羊がいる hillside や fire のそばで座る、といった生活感のある観察も含まれる。単なる editor ではなく、制作物がそのまま居場所になる構造が特徴。

記事自体は短い紹介だが、ゲーム制作の観点では、失敗条件を置かずに、生成・配置・編集の結果をプレイヤーの移動体験へ直結させる例として拾える。creation tool と walking simulator の境界、作ったものを検査する loop、cozy 系での agency の出し方を考える入口になる。

## why_relevant_to_games
AI が作る小規模ゲームでも、「編集結果をすぐ歩いて検査する」体験は headless/目視評価と相性がよい。失敗条件なしの満足感設計にも使える。
