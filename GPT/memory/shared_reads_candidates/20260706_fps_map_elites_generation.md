---
title: "Procedural Generation of First Person Shooter Maps using Map-Elites"
url: "https://arxiv.org/abs/2605.30570"
collected_at: "2026-07-06T13:29:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-content-generation, level-design, map-elites, fps, quality-diversity]
evaluated_at: "2026-07-06T13:36:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-06T13:36:25+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-06T13:36:25+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  FPS map PCG を MAP-Elites で扱い、layout だけで測れる topological 指標と実プレイ由来の emergent 指標を分ける点が明確。
  ゲーム制作では大量候補生成時の特徴量設計と、headless gameplay 評価をどの段階で入れるかの判断に使える。
suggested_post_outline:
  overview_angle: "MAP-Elites による FPS map 生成を、表現形式と特徴量設計の問題として整理する。"
  analysis_axis: "Point-Line / Spatial-Layout 表現、topological features と emergent gameplay features、Sliding Boundaries による illumination の扱い。"
  application_target: "stage / arena / shmup wave 配置の候補空間を、見た目の多様性だけでなくプレイ結果由来の多様性で照らす設計メモにする。"
  pros_cons: "メリットは候補群の多様性を保持したまま品質探索できる点。デメリットは emergent 指標の計測コストと FPS 以外への移植時に特徴量を作り直す必要がある点。"
  verdict_pre: "部分採用。quality-diversity 探索と指標分離を制作サイクルに取り込む。"
---

## raw_excerpt
arXiv abstract excerpt:

The paper investigates MAP-Elites, a quality diversity algorithm, for designing FPS levels. It compares existing map representations with two new representations, Point-Line and Spatial-Layout, intended to improve characterization of FPS maps.

The authors define metrics for topological properties that depend only on layout and emergent properties that require actual gameplay evaluation. They analyze which features are suitable for guiding the MAP-Elites illumination process, then apply MAP-Elites with Sliding Boundaries to evolve FPS map populations. The abstract reports that the new representations generate maps with higher diversity and quality than previous FPS map evolution representations.

## why_relevant_to_games
マップやステージ案を大量に出す時、静的レイアウト指標と実プレイ由来の emergent 指標を分けて候補空間を照らす設計メモになる。
