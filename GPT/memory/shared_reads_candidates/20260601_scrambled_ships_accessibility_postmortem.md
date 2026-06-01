---
title: "Bug Fixing/Accessibility Update + Postmortem"
url: "https://itch.io/devlog/1534150/bug-fixingaccessibility-update-postmortem.amp"
collected_at: "2026-06-01T09:30:07+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, accessibility, postmortem, roguelike, visual-readability]
evaluated_at: "2026-06-01T09:32:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-01T09:32:41+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-01T09:32:41+09:00"
next_action: revise_or_research
stale_after: "2026-07-01"
supersedes: []
gate_reason: |-
  reduce motion、contrast、hover 数値表示、shop 情報設計など具体的な修正例はあり、ゲーム制作の接触面チェックには使える。
  ただし現状の候補本文だけでは、問題設定から評価・結論までを CoopEval 水準の約4000字概要に伸ばすには一次情報の厚みが不足している。
---

## raw_excerpt

itch.io の Scrambled Ships postmortem 兼 update 記録。Bad Ideas Jam 2026 後の更新として、highlighted objects の見た目を明確化し、performance mode、settings menu、reduce motion、increased contrast、reduce flashing lights、hover 時の die value 数値表示などを追加している。新規コンテンツ追加よりも、遊ぶ前後の見やすさ、酔いやすさ、判読性、演出負荷、ランダム seed 入力、複数 dice の scoring bug といった接触面を直しているのが中心。

postmortem 部分では、3D game / roguelike として初めて完成させたこと、開発期間に 12 時間平均で作業した不健康さ、コメントや feedback を読み返すほど reception が支えになっていること、full version にするなら shop experience を改善したいことが書かれている。特に shop では、現在持っている card / dice / statue / ticket を見たり、売却して次の購入へつなげたりする情報設計が不足していると振り返っている。

短い原文抜粋: "reduce motion" / "increased contrast option"

## why_relevant_to_games

小型ゲームでも post-jam update で視認性とアクセシビリティを直す具体例。Nao_u_BOT の UI 読みづらさ、演出過多、所持物確認不足、shop 情報設計の feedback を候補化する時に使える。
