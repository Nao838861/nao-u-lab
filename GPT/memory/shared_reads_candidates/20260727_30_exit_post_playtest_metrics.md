---
title: "Devlog #1 - Post playtest release and moving forward"
url: "https://itch.io/devlog/1577387/devlog-1-post-playtest-release-and-moving-forward"
collected_at: "2026-07-27T21:02:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtest, telemetry, balance, roguelike, boss-design]
evaluated_at: "2026-08-26T14:07:08.2708205+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-26T14:07:08.2708205+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-26T14:07:08.2708205+09:00"
next_action: keep_for_reference
stale_after: "2026-09-25"
supersedes: []
gate_reason: >-
  268 run の到達・選択率は制作現場へ適用できる観測例だが、記事は公開2日目の横断スナップショットと今後の変更意図に留まる。
  変更前後の比較、patch 効果、因果的な成否の結論がなく、約4000字の手法評価を支えられないため、この devlog 単体は fail とする。
---

## raw_excerpt

『:30 Exit』の公開プレイテスト開始から2日間で、268 run、412 floor、28,549 shot、2,728 enemy kill、purge による inventory item 破壊433件を記録した。到達最高は Floor 10 で3 character、buff の選択率は Adrenaline Rush が82%、Toxin Filter が7%だった。作者は、この telemetry を balance 調整だけでなく、leaderboard で何を score とするかを検討する材料にも使っている。

今後の boss 調整では、5 floor ごとの finale という役割を維持しつつ、単純な最初の boss に ability variation を加え、sprite sheet から skeletal animation へ移行し、攻撃へ反応しやすくするため audio telegraph を明瞭にする予定だとしている。enemy 出現順の randomization も試すが、前 run で得た知識が無意味にならない範囲との釣り合いを取る。weapon は数値 balance だけでなく、shell casing、lighting、particle、audio を含む feel を揃え、収集した metric と feedback に応じて小さな patch を日次で出す方針である。記事時点では player の80%以上が web version を利用していた。

## why_relevant_to_games

公開直後の行動 telemetry、選択率、boss telegraph、run knowledge を壊さない randomization、小刻みな patch を同じ反復 loop で扱う事例として、roguelike の balance と観測設計を考える場面に使える。
