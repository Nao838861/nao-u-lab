---
title: "Dev Log (looking back at the Game Jam) - Rusty Goes to Space"
url: "https://checkmate101.itch.io/rusty-goes-to-space/devlog/1449417/dev-log-looking-back-at-the-game-jam"
collected_at: "2026-07-26T16:47:25.9163852+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-jam, postmortem, workflow, playtesting, tutorial]
evaluated_at: "2026-07-26T16:53:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T16:53:28+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T16:53:28+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  core loop、tutorial、art integration を早期に置く教訓は具体的だが、単一 jam の短い振り返りで比較、測定、player 評価がない。
  約4000字へ広げると既知の scope 管理論が大半になり、この作品固有の手法と評価を保てないため投稿候補から外す。
---

## raw_excerpt

収集時の要点メモ（原文の長文引用ではない）。『Rusty Goes to Space』は、7日間で作られた top-down crafting game の game jam 振り返り。作者は、想定より scope が攻めすぎていたこと、core game loop を組む前に多数の mechanic を実装したため playtesting の開始が遅れたこと、終盤に crunch を予定として組み込み、睡眠不足の優先順位付けで tutorial や食事 mechanic のような重要要素を落としたことを列挙している。art 側では、完成用 asset だけでなく integration 用の design art を早期に用意できず、tileset 統合が難しくなった。

一方で、チームが設定した「新しく難しい genre で最小機能の playable game を完成させる」「camera、player movement、tileset などの技術を学ぶ」「jam で30件以上の rating を得る」という3目標は達成した。次回は初日に MVP game loop を作り、tutorial を早く実装し、さらに scope を下げる方針としている。post-jam update では pause menu、level loading audio、crafting recipe と item spawn の balance、collision、sound や animation などの juice を直す予定が列挙されている。

## why_relevant_to_games

短期制作で mechanic 数より先に playable core loop と tutorial を置き、playtest の開始時点を守るための事例として参照できる。art integration の仮素材も MVP の一部として扱う観点がある。
