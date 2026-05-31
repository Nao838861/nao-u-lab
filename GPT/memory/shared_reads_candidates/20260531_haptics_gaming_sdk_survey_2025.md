---
title: "Haptics Gaming SDK Survey (2025)"
url: "https://hapticsif.org/wp-content/uploads/2025/07/haptics-gaming-sdk-survey-2025-2.1.pdf"
collected_at: "2026-05-31T15:29:46+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-feel, haptics, controller-feedback, sdk, interaction-design]
evaluated_at: "2026-05-31T15:32:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-05-31T15:32:41+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-31T15:32:41+09:00"
next_action: revise_or_research
stale_after: "2026-06-30"
supersedes: []
gate_reason: "haptics の語彙整理としては有用だが、現時点の candidate は SDK 市場 survey の要約に寄っており、ゲーム制作で直近に適用する具体場面が弱い。4000 字の投稿にするには、ブラウザゲームや既存 prototype の game feel 改善へ落とす追加整理が必要。"
---

## raw_excerpt

Haptics Industry Forum の 2025 年版 survey。対象は gaming controllers、force feedback wheels、その他 haptic peripherals に使う API / SDK / design software の市場整理。冒頭では、haptics は単純な vibration から、より高度な multi-dimensional tactile feedback へ移っていると説明されている。定義として、cross-platform、mixing、perceptions、real-time update、targeting、testing in app / in engine / over the air、wideband などが列挙され、ゲーム開発者が haptic effect をどの段階で確認し、どの device へ出すかを比較できるようにしている。

Emerging Haptic Trends では、LRA から VCM や piezoelectric actuator への移行、surface haptics、VCM arrays、hybrid actuator systems、frequency response を real-time に調整する smart actuator control などが挙げられている。multi-dimensional haptic feedback の項では、basic vibration だけでなく kinesthetic force feedback、thermal haptics、adaptive triggers、textural haptics、impact haptics、ambient haptics、gestural haptics が並ぶ。特に impact haptics は、collision feedback を force、duration、decay pattern の可変要素として扱うものとして説明されている。

## why_relevant_to_games

ブラウザゲームでも「衝突」「弾を受ける」「近接 graze」「ゲージ充填」を視覚・音だけでなく触覚語彙に分解して考える材料になる。現時点では実装対象ではなく、game feel の設計語彙候補。
