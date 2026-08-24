---
title: "Six Ways to Draw Vangers with WebGPU: Real-Time Rendering of Editable Multi-Layer Height Fields"
url: "https://arxiv.org/abs/2608.17390"
collected_at: "2026-08-24T09:49:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, rendering, terrain, webgpu, destructible-environments]
evaluated_at: "2026-08-24T09:55:29+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-24T09:55:29+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-24T09:55:29+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  単一値の標高モデルを前提とする既存 LOD と、洞窟・二層・局所破壊を持つゲーム地形のずれを明確に定義し、
  同一エンジン・同一データ経路・CPU 正解画像で六方式を比較している。視点条件で顕在化する欠損や帯状化まで抽出でき、具体的な実装判断へ接続できる。
suggested_post_outline:
  overview_angle: "編集可能な多層地形では、平均的な速度や俯瞰画像だけでなく、データ表現・更新経路・視点条件を揃えて描画法を比較する必要がある"
  analysis_axis: "六方式を、二つの solid interval の保存、局所破壊への追従、CPU ray cast との一致、俯瞰と地平線視点での破綻差という共通軸で比較する"
  application_target: "破壊可能な洞窟地形プロトタイプの方式選定で、単一データ経路から複数描画法を切り替える比較 harness と、俯瞰・低視点の両方を含む回帰テストを作る"
  pros_cons: "長所はゲーム固有制約を固定した実装横断比較、短所は Vangers 固有の二層表現と視点条件から他の地形表現へ移す際に再計測が必要な点"
  verdict_pre: "部分採用"
---

## raw_excerpt

> Terrain level-of-detail is measured almost exclusively on digital elevation models: single-valued, smooth at the sampling scale, sampled from real topography. Game terrain is often none of these.
>
> We compare six rendering methods - height-field ray marching, voxel-accelerated ray marching, sliced proxy geometry, per-sample bar rasterization, compute scattering, and a fitted triangle mesh - implemented in a single engine over a single data path, on the hand-authored multi-layer terrain of Vangers (1998), scored against a CPU ray cast of the same source data.
>
> Every method must preserve the two solid intervals available at a ground sample, render at interactive rates, and reflect local terrain destruction without reloading the level. These constraints rule out treating caves as decoration or amortizing a static preprocessing step over an immutable map.
>
> From the original game's top-down camera the six methods look interchangeable. At eye-level horizons they do not: point scattering loses coverage, slicing bands, and an over-simplified mesh can miss a wall.

## why_relevant_to_games

破壊可能な洞窟・多層地形を含むゲームで、同一データ経路上の六つの描画法を比較しており、カメラ条件・編集可能性・メモリ保持を含めた地形レンダリング方式の試作に使える。
