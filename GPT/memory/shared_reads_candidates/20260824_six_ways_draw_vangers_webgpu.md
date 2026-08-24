---
title: "Six Ways to Draw Vangers with WebGPU: Real-Time Rendering of Editable Multi-Layer Height Fields"
url: "https://arxiv.org/abs/2608.17390"
collected_at: "2026-08-24T09:49:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, rendering, terrain, webgpu, destructible-environments]
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
