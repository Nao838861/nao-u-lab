---
title: "Texture++: Elevating 3D Asset Texture Resolution with a Region-Aware Diffusion Model"
url: "https://arxiv.org/abs/2607.21504"
collected_at: "2026-08-02T10:17:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-art, 3d-assets, texture, asset-pipeline, generative-ai]
---

## raw_excerpt

原文要旨・本文の日本語メモ（直接引用ではない）: Texture++ は、低解像度 texture のため再利用しにくくなった 3D asset を対象に、元の内容を保ちながら texture を高解像度化する framework である。通常の画像 super-resolution を UV texture map へ直接適用すると、本来は 3D 表面上で連続している模様が UV seam で分断され、境界 artifact が生じる。そこで処理を UV space だけで完結させず、mesh を複数視点から render した view space で局所的に super-resolution し、結果を texture map へ投影し直す。

処理は、UV chart 内の模様を正面から広く観察する canonical view と、複数 chart に分断された seam 周辺を一つの連続面として観察する view を適応的に選ぶ。各視点では、表面の向きと camera 距離から quality map を作り、過去の視点より高品質に更新できる領域だけを mask 化する。mask 境界は quadtree で整理し、細かく不規則な境界が diffusion model に模様として誤認されることを抑える。局所 SR model は Stable Diffusion 2.1-base を画像と mask の条件入力へ拡張し、指定領域だけに高周波 detail を加えて周囲へ接続する。生成結果は gradient optimization を介さず texture へ直接投影される。

実験では自然画像向け SR と texture generation 系手法を比較し、PSNR / SSIM / LPIPS / DISTS と処理時間を報告する。著者らは定量・定性の両面で既存手法より detail と seam coherence が改善したとしている。学習には NVIDIA A6000 GPU 3基、反復 refinement には A6000 1基を使用する。

## why_relevant_to_games

低解像度の旧 3D model、prototype 用 asset、外部 asset pack を現行表示へ再利用する asset pipeline の候補になる。UV seam・複数視点の不整合・局所更新範囲を扱うため、単純な 2D upscaler と 3D texture 専用処理を比較する材料になる。
