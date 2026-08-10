---
title: "Steel Abyss: Lessons Learned Edition"
url: "https://itch.io/devlog/1585225/steel-abyss-lessons-learned-edition.amp"
collected_at: "2026-08-11T04:46:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, postmortem, architecture, phaser, deterministic-testing, qa]
evaluated_at: "2026-08-11T04:49:56+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-11T04:49:56+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-11T04:49:56+09:00"
next_action: revise_or_research
stale_after: "2026-09-10"
supersedes: []
gate_reason: >-
  旧構造の失敗と再構築方針は具体的で、ゲーム制作への適用先も明確。ただし再構築は placeholder の初期段階で、
  機能追加コスト、回帰不具合、seeded QA の再現性などの評価結果がなく、現状では約4000字の概要を根拠付きで完結できない。
---

## raw_excerpt

作者が、約8か月かけて制作した初期 Phaser 作品『Steel Abyss』を、後続作品で得た教訓を使って同じゲームのまま再構築する devlog。旧版には複数 level、敵、boss、weapon、oxygen management、achievement、campaign が揃っていた一方、敵挙動を inheritance に寄せ、level logic を個別 scene に結び付け、UI・gameplay・state management を絡ませた結果、機能追加の負担が増えた。audio も scene transition や同時再生で崩れ、composite submarine sprite、可視 damage state、沈没 animation、柔軟な mission UI などは、既存構造へ足す費用が高く、簡略化または断念された。

再構築版は sequel や全面 redesign ではなく、同じ content を拡張しやすい構造へ移す試みとして、level ごとの scene logic を一つの reusable gameplay scene に統合し、UI scene を分離する。weapon・enemy・mission は config-driven にし、submarine を hull・weapon・propeller・decal の module から組み立て、audio manager は scene transition を越えて存続させる。さらに seeded random generation、deterministic debug tools、QA hooks、projectile pooling、明確な entity lifecycle、Phaser rendering から分離した testable game logic を導入する。最初の可視成果は placeholder shape の潜水艦だが、visual rig・gameplay entity・configuration が分離され、本物の artwork を interface 変更なしに差し替えられることを確認している。

## why_relevant_to_games

完成済み content を持つ同一ゲームの旧構造と再構築方針を対応づけており、prototype を増築するときに scene・UI・state・data・rendering・QA の境界が将来の mechanics をどう制約するかを見る材料になる。
