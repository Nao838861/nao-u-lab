---
title: "An Exploration of Collision-based Enemy Morphology Generation"
url: "https://arxiv.org/abs/2606.02832"
collected_at: "2026-07-06T13:29:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, enemies, collision, morphology, game-mechanics]
evaluated_at: "2026-07-06T13:36:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-06T13:36:25+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-06T13:36:25+09:00"
next_action: revise_or_research
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  プレイヤー衝突情報から敵 morphology を生成する着想は 2D action / shmup の敵設計に直結する。
  ただし現候補の抽出は abstract レベルで、3 手法の差分、評価指標、ベースライン比較の中身が薄く、CoopEval 水準の概要に届かない。
---

## raw_excerpt
arXiv abstract excerpt:

Despite extensive procedural content generation research, the authors note that relatively little prior work has explored generating enemies for video games. They focus on enemy morphologies: the body plan or collision information used by in-game enemies. The paper explores three approaches for generating enemy morphologies based on player collision information.

The abstract reports that the three approaches have different strengths and weaknesses, and that all achieved equivalent or better performance than an evolutionary baseline adapted from prior robotics morphology work.

## why_relevant_to_games
2D アクションやシューティングで、見た目ではなく「プレイヤーとどう接触したか」から敵形状・当たり判定・危険領域を生成する候補として使える。
