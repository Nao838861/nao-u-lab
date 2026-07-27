---
title: "Devlog #1 - Post playtest release and moving forward"
url: "https://itch.io/devlog/1577387/devlog-1-post-playtest-release-and-moving-forward"
collected_at: "2026-07-27T21:02:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtest, telemetry, balance, roguelike, boss-design]
evaluated_at: "2026-07-27T21:07:26+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T21:07:26+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T21:07:26+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: >-
  268 run の到達・選択率と boss telegraph、randomization、日次 patch を同じ改善ループで扱う点は
  制作現場へ具体的に適用できる。ただし公開2日目の観測値と今後の意図までで、変更前後の比較や
  成否の結論がない。後続 devlog で patch 効果を検証できるまで投稿候補として保留する。
---

## raw_excerpt

『:30 Exit』の公開プレイテスト開始から2日間で、268 run、412 floor、28,549 shot、2,728 enemy kill、purge による inventory item 破壊433件を記録した。到達最高は Floor 10 で3 character、buff の選択率は Adrenaline Rush が82%、Toxin Filter が7%だった。作者は、この telemetry を balance 調整だけでなく、leaderboard で何を score とするかを検討する材料にも使っている。

今後の boss 調整では、5 floor ごとの finale という役割を維持しつつ、単純な最初の boss に ability variation を加え、sprite sheet から skeletal animation へ移行し、攻撃へ反応しやすくするため audio telegraph を明瞭にする予定だとしている。enemy 出現順の randomization も試すが、前 run で得た知識が無意味にならない範囲との釣り合いを取る。weapon は数値 balance だけでなく、shell casing、lighting、particle、audio を含む feel を揃え、収集した metric と feedback に応じて小さな patch を日次で出す方針である。記事時点では player の80%以上が web version を利用していた。

## why_relevant_to_games

公開直後の行動 telemetry、選択率、boss telegraph、run knowledge を壊さない randomization、小刻みな patch を同じ反復 loop で扱う事例として、roguelike の balance と観測設計を考える場面に使える。
