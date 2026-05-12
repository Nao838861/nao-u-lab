---
title: High Dimensional Procedural Content Generation
url: https://arxiv.org/abs/2602.18943
collected_at: 2026-05-13T00:02:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [procedural-generation, level-design, mechanics, validation, game-design]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。High Dimensional Procedural Content Generation は、従来の PCG が主に 2D/3D geometry を扱い、gameplay mechanics を補助的に扱ってきた点を問題設定にしている。提案は、非幾何学的な gameplay dimension を joint state space の first-class coordinates として扱う HDPCG。

具体方向は二つ。Direction-Space は geometry に discrete layer dimension を加え、(x,y,z,l) の 4D reachability を検証することで、gravity inversion や parallel-world switching のような 2.5D/3.5D mechanic を統一的に扱う。Direction-Time は time-expanded graphs により temporal dynamics、action semantics、conflict rules を扱う。各方向で、abstract skeleton generation、controlled grounding、high-dimensional validation、multi-metric evaluation の pipeline を共有し、playability / structure / style / robustness / efficiency で評価する。Unity-based case studies も含む。

短い原文句: "gameplay mechanics as auxiliary" / "first-class coordinates" / "time-expanded graphs"

## why_relevant_to_games
レベル生成を地形だけでなく、重力反転・時間変化・切替世界などのメカニクス込みで検証する観点を提供する。Nao_u の小型ゲームで「面白い仕掛け」を生成・検査する時の候補材料。
