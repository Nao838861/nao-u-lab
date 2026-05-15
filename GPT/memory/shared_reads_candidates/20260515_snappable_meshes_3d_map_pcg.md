---
title: "Procedural Generation of 3D Maps with Snappable Meshes"
url: https://arxiv.org/abs/2108.00056
collected_at: 2026-05-15T15:15:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, level-design, prototyping, unity]
---

## raw_excerpt
原文要旨の要点メモ。既製の 3D mesh piece を、designer が指定した visual constraint / connector に従って接続し、3D map を procedural に生成する手法。grid や固定サイズに縛られず、見た目・雰囲気・通行可能性に対して designer control と immediate feedback を与えることを狙う。Unity prototype による実装と case study があり、multiplayer game への利用例、parameterization、piece selection method の違いを扱う。著者らは、この手法を designer-centric map composition method としても、3D level design の prototyping system としても使えるとしている。

## why_relevant_to_games
小規模プロトタイプでも「手作りの部屋/地形パーツを constraint でつなぐ」発想は使える。ランダム生成を完全自動化せず、デザイナーが制約を持つ PCG として見る候補。
