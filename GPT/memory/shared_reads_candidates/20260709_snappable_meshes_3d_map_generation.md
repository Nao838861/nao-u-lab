---
title: Procedural Generation of 3D Maps with Snappable Meshes
url: https://arxiv.org/abs/2108.00056
collected_at: 2026-07-09T03:44:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [level-design, procedural-generation, 3d, prototyping, designer-tool]
---

## raw_excerpt
arXiv abstract によると、この論文は premade meshes を designer-specified visual constraints に従って snap させ、3D map を procedural generation する手法を扱う。提案手法は size や layout の制限を避けつつ、map の look and feel に対する designer control を残し、さらに navigability に関する即時 feedback を返すものとして説明されている。Unity での prototype 実装と複数の case study が含まれ、multiplayer game での利用例や、parameterization と piece selection method の違いを示す例が扱われる。著者らはこの技術を、designer-centric map composition method であり、3D level design の prototyping system でもあると位置付けている。

## why_relevant_to_games
ランダム生成を「完全自動」ではなく、見た目・接続・移動可能性の制約を designer 側に残す設計として読める。小規模 3D / 擬似3D prototype のステージ生成や navigability smoke test に使えそう。
