---
title: "Denis Dyack Interview: How Deadhaus Sonata Is an RPG About Persistent Player History"
url: "https://80.lv/articles/denis-dyack-interview-how-deadhaus-sonata-is-an-rpg-about-persistent-player-history"
collected_at: "2026-05-25T18:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, persistent-world, deterministic-systems, narrative-systems, simulation]
evaluated_at: "2026-07-25T23:07:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-25T23:07:50+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-25T23:07:50+09:00"
stale_after: "2026-08-24"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  persistent history という問題設定は面白いが、記事メモは発売前構想と標語が中心で、deterministic loot/world state の実装手順や検証結果を抽出できない。
  小型ゲームへの適用も具体例ではなく類推に留まり、CoopEval 水準の方法・評価解説へ拡張すると推測が本文を上回るため不合格とする。

---

## raw_excerpt
80.lv の 2026-05-15 インタビュー。Deadhaus Sonata は、cooperative action RPG を persistent world systems、deterministic progression mechanics、simulation-driven design、community-driven storytelling と結びつける事例として紹介されている。記事は「history」「player memory」「deterministic world states」を gameplay と narrative の両方に接続する話を中心にしている。

短い原文抜粋: "history is currency" / "Everything matters"

設計要素として、player choice が世界を永続的に変える persistent world、7 classes、Tarot Card Skill System、quantum theory を参照した deterministic loot system、eventually players craft story and lore という長期運用構想が挙げられている。Dyack は、weather simulation、celestial cycles、deterministic world states が gameplay の foundation であり、enemy behaviour、loot stats、story まで影響すると説明している。

## why_relevant_to_games
小型プロトタイプでも、run 履歴・プレイヤー選択・世界状態を「次回プレイの意味」に変える設計の参照になる。自動評価では、単発クリア率だけでなく状態履歴が遊びを変えたかを見る入口になりそう。
