---
title: "Procedural Game Level Design with Deep Reinforcement Learning"
url: "https://arxiv.org/abs/2510.15120"
collected_at: "2026-07-31T19:46:51.6815241+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-generation, level-design, reinforcement-learning, unity]
evaluated_at: "2026-07-31T19:51:06+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-31T19:51:06+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-31T19:51:06+09:00"
next_action: revise_or_research
stale_after: "2026-08-30"
supersedes: []
gate_reason: |-
  solver の成績を generator へ返す二 agent loop は procedural level の自動 playtest と難度調整へ具体的に接続できる。
  ただし候補メモには reward・観測／行動設計、比較 baseline、定量結果、生成 level の品質証拠がなく、CoopEval 水準の約4000字概要を支える評価部分が不足する。
---

## raw_excerpt

abstract の重要部分を日本語で記録する。研究は Unity ベースの 3D 環境で、Deep Reinforcement Learning を procedural level design に用いる。system は二つの agent から成る。hummingbird agent は solver として terrain を移動し、花を探して回収する。floating island agent は generator として、障害物の位置、hummingbird の初期状態、過去 episode の performance feedback を観測し、収集対象となる花を terrain 上へ配置する。両 agent は Unity ML-Agents toolkit の Proximal Policy Optimization で学習する。

solver は変化し続ける procedural layout に適応しながら効率よく移動・探索・収集することを学び、generator は solver の成績を受けて配置を更新する。原文要旨は、この interaction が “emergent behavior and robust generalization” を複数の環境構成で生むと報告し、content を生成する側と解く側を別 agent にした自律的 level-design の可能性を述べる。arXiv v1 は 2025-10-16 提出、11 pages・10 figures の IEEE conference format と記載されている。

## why_relevant_to_games

生成器だけでなく solver の行動結果を feedback にして配置を変えるため、procedural level の生成・自動 playtest・難易度調整を同じ反復 loop に置く事例として参照できる。
