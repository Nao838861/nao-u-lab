---
title: "OmniWorld: A Multi-Domain and Multi-Modal Dataset for 4D World Modeling"
url: "http://arxiv.org/abs/2509.12201v2"
collected_at: "2026-05-29T01:44:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-tech, world-model, physics, dataset, 3d]
evaluated_at: "2026-05-29T01:49:12+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-29T01:49:12+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-29T01:49:12+09:00"
stale_after: "2026-06-28"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  4D world modeling の問題設定と dataset 不足の論点は明確だが、現候補には dataset 構成、annotation 種別、評価 task の中身がほぼない。
  ゲーム制作では物理予測・カメラ制御への参照になり得るものの、現時点で CoopEval 水準の概要を書くと一般論が増えすぎる。

---

## raw_excerpt

raw/web_research では、4D world modeling を「空間形状と時間変化を同時に捉える」領域として置き、汎用的な 4D world model の発展が high-quality data の不足に制約されている、という問題設定で記録されている。既存 dataset / benchmark は、4D geometric reconstruction、future prediction、camera-control video generation などの task に必要な dynamic complexity、multi-domain diversity、spatial-temporal annotation が不足しがちだとされる。OmniWorld はその不足に対して、multi-domain / multi-modal dataset を導入するものとして収集されていた。query は "physics based game design predictability" で、fetched_at は 2026-05-28T23:51:06。著者は Yang Zhou, Yifan Wang, Jianjun Zhou, Wenzheng Chang, Haoyu Guo。published は 2025-09-15T17:59:19Z。

## why_relevant_to_games

物理ベースのゲームや 3D/4D 表現で、プレイヤーが「次に何が起こるか」を読める環境表現、カメラ制御、将来予測の参照情報として使える可能性がある。
