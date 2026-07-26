---
title: "Level the Level: Balancing Game Levels for Asymmetric Player Archetypes With Reinforcement Learning"
url: "https://arxiv.org/abs/2503.24099"
collected_at: "2026-05-30T06:31:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, level-design, balancing, player-archetype, reinforcement-learning]
evaluated_at: "2026-07-26T09:56:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-26T09:56:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T09:56:00+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  asymmetric archetype の能力差を level 側で吸収する着想と、4 archetype・2 baseline・能力差増大時の悪化傾向までは具体的で、複数 bot policy による level 評価へ適用できる。
  一方、archetype 定義、RL の状態・報酬、balance 指標、比較値が snapshot に無く、類似の level balancing 候補との差を約4000字で立証できないため参照用として閉じる。

---

## raw_excerpt

arXiv の掲載情報では、非対称な multiplayer content と player archetype の差を、キャラクター性能の同質化ではなく level design 側で吸収する問題として扱っている。片方の archetype が能力上の有利を持つ場合でも、勝率としては等しい機会を持つように、tile-based level を reinforcement learning で生成・調整する。評価では 4 種類の player archetype を使い、2 つの baseline より多くの level をバランスできたと報告されている。一方で、archetype 間の能力差が大きくなるほど、必要な training steps は増え、balance 達成精度は下がるという傾向も記録されている。

## why_relevant_to_games

同じステージを route bot / camper / lane-holder など複数のプレイ方策で見る現行の評価に近く、プレイヤー種別ごとの不公平を level 側で調整する視点を候補として残せる。
