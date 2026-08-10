---
title: "Postmortem: NinjaBee's A Kingdom for Keflings"
url: "https://www.gamedeveloper.com/audio/postmortem-ninjabee-s-a-kingdom-for-keflings"
collected_at: "2026-07-08T23:56:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, playtesting, midgame, balance, sandbox, production]
evaluated_at: "2026-08-10T14:22:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T14:22:27+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-10T14:22:27+09:00"
next_action: keep_for_reference
stale_after: "2026-09-09"
supersedes: []
gate_reason: |-
  中盤・終盤まで通す playtest の必要性は直接適用できるが、候補本文は失敗項目の列挙に留まり、検証手順・観測値・改善後の結果がない。
  一か月の保留後も材料が増えておらず、CoopEval 水準の概要を根拠付きで構成できないため、参照用として閉じる。
---

## raw_excerpt
Game Developer 掲載の A Kingdom for Keflings ポストモーテム。creation-focused design を掲げ、戦闘や破壊ではなく、巨人として住民を助け王国を作る体験を核にした点が What Went Right として語られている。短い原文断片: "happiness, love, and creation" / "Evolving Design"。

一方で What Went Wrong の先頭は mid-game / end-game playtesting の不足。初期体験は何度もテストしたが、安定ビルドが遅く、通しプレイできる時期が遅れたため、中盤以降の詰まり、late-to-mid-game grind、達成間隔のバランス不良、後半クラッシュを十分に発見できなかったと記録している。ほかに dynamic music system へ大きな工数を使い、最終的には簡略化しても投資に見合わなかったこと、sandbox world の texture management を甘く見たことも挙げている。

## why_relevant_to_games
headless 評価が序盤の安定性だけを見て終わらないよう、中盤・終盤の到達性と達成間隔を probe に入れる材料になる。
