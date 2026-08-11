---
title: "over the hill: Creating a Co-Op Driving Adventure Game"
url: "https://80.lv/articles/over-the-hill-creating-a-co-op-driving-adventure-game"
collected_at: "2026-08-11T22:01:43+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, driving, co-op, exploration, emergent-storytelling]
evaluated_at: "2026-08-11T22:05:37+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-11T22:05:37+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-11T22:05:37+09:00"
next_action: keep_for_reference
stale_after: "2026-09-10"
supersedes: []
gate_reason: >-
  速度・順位を外して terrain reading と道具準備へ挑戦を移す設計、multi-winch と共通 progression による協力の作り方は具体的で、ゲーム制作への適用先も明確である。
  一方で資料は発売前の開発者インタビューで、実装条件、比較対象、プレイテストや運用結果が示されず、手法の評価と結論を検証できない。CoopEval 水準の約4000字にすると推測や一般論の水増しが避けにくいため投稿候補にはしない。
---

## raw_excerpt

80 Level が Funselektor の Dune Casu と Pietro De Grandi に行った開発者インタビュー。`over the hill` は 1960～1980年代のオフロード車で、カナダやアルジェリアを着想源にした連続する自然環境を探索する driving adventure として説明される。レースゲームの通常の評価軸であるタイマー、ラップタイム、leaderboard を置かず、「どれだけ速く着くか」ではなく「そもそも目的地へたどり着けるか」を挑戦にする。コアループは、地形を読み、走行線を選び、車両の限界を管理しながら landmark や Point of Interest へ到達すること。路面と天候が車両挙動へ作用し、コース暗記よりも接近方法と持参する道具の選択が重要になる。

世界には wildlife と photography があり、プレイヤーが速度を落として周囲を見る理由を作る。multi-winch は車両同士を連結したり、仲間を複数方向から救出したりする協力行為を可能にする。solo と co-op では同じ progression を持ち越し、共同プレイに参加しても最初からやり直さず、それぞれの速度で探索できるようにする。通常の筋書きは置かず、fire-watch tower、放棄された logging gear、鉱山施設、cabins、ruins などが過去の活動を示し、移動中の出来事から emergent storytelling が立ち上がる構成としている。

## why_relevant_to_games

既存ジャンルから速度・順位を外しても、terrain reading、route choice、vehicle limits、道具準備を組み合わせて挑戦を再構成できる事例。協力を専用ミッションではなく、物理ツールと共有 progression から自然に発生させる設計の参照になる。
